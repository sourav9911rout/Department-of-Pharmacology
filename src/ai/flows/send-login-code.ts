
'use server';
/**
 * @fileOverview A flow for generating and sending a one-time login code.
 */
import { z } from 'zod';
import { transporter } from '@/ai/nodemailer';
import LoginCodeEmail from '@/components/emails/login-code-email';
import { render } from '@react-email/components';
import { getFirestoreServer } from '@/firebase/server-init';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc } from 'firebase-admin/firestore';
import type { AppUser } from '@/lib/types';

const SendLoginCodeSchema = z.object({
  email: z.string().email().describe('The email to send the login code to.'),
});

export type SendLoginCodeInput = z.infer<typeof SendLoginCodeSchema>;

export async function sendLoginCode(input: SendLoginCodeInput) {
    const { email } = input;
    const lowerCaseEmail = email.toLowerCase();
    const firestore = getFirestoreServer();
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();

    let userStatus: AppUser['status'] = 'pending';
    let userRole: AppUser['role'] = 'user';
    
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', lowerCaseEmail));
    const querySnapshot = await getDocs(q);
    
    let userDoc;
    if (!querySnapshot.empty) {
        userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as AppUser;
        userStatus = userData.status;
        userRole = userData.role;

        // Ensure admin email from env always has admin role in DB
        if (lowerCaseEmail === adminEmail && userData.role !== 'admin') {
            await updateDoc(doc(firestore, 'users', userDoc.id), { role: 'admin', status: 'approved' });
            userRole = 'admin';
            userStatus = 'approved';
        }
    } else {
        // User does not exist, add them
        const isNewAdmin = lowerCaseEmail === adminEmail;
        const newUser: Omit<AppUser, 'id'> = { 
            email: lowerCaseEmail, 
            status: isNewAdmin ? 'approved' : 'pending',
            role: isNewAdmin ? 'admin' : 'user'
        };
        await addDoc(usersRef, newUser);
        userStatus = newUser.status;
        userRole = newUser.role;
    }
    
    // Only send code if user is approved or is the admin
    if (userStatus === 'approved' || userRole === 'admin') {
      const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      const otpsRef = collection(firestore, 'otps');
      await addDoc(otpsRef, {
        email: lowerCaseEmail,
        code: validationCode,
        expiresAt,
      });
      
      if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
        console.error("Email service is not configured. Missing GMAIL_EMAIL or GMAIL_APP_PASSWORD in environment variables.");
        throw new Error("The email service is not configured on the server.");
      }

      const emailHtml = render(LoginCodeEmail({ validationCode }));

      const mailOptions = {
        from: `"Department of Pharmacology" <${process.env.GMAIL_EMAIL}>`,
        to: email,
        subject: `Your Login Code: ${validationCode}`,
        html: emailHtml,
      };

      try {
        await transporter.sendMail(mailOptions);
        return {
          success: true,
          message: 'A login code has been sent to your email.',
        };
      } catch (error) {
        console.error("Error sending login code email:", error);
         if (error instanceof Error && 'code' in error && (error as any).code === 'EAUTH') {
             throw new Error('Failed to send email: Authentication error. Please double-check your credentials.');
        }
        throw new Error("Failed to send login code. Please try again later.");
      }

    } else if (userStatus === 'pending') {
        return {
            success: false,
            message: 'Your access request is pending approval from the administrator.'
        }
    } else { // revoked or other status
        return {
            success: false,
            message: 'Your access has been revoked. Please contact the administrator.'
        }
    }
}
