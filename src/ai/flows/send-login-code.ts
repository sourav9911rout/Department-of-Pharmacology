
'use server';
/**
 * @fileOverview A flow for generating and sending a one-time login code.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { transporter } from '@/ai/nodemailer';
import LoginCodeEmail from '@/components/emails/login-code-email';
import { render } from '@react-email/components';
import { getFirestoreServer } from '@/firebase/server-init';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

const SendLoginCodeSchema = z.object({
  email: z.string().email().describe('The email to send the login code to.'),
});

export type SendLoginCodeInput = z.infer<typeof SendLoginCodeSchema>;

const sendLoginCodeFlow = ai.defineFlow(
  {
    name: 'sendLoginCodeFlow',
    inputSchema: SendLoginCodeSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({ email }) => {
    const firestore = getFirestoreServer();
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    let userStatus: 'approved' | 'pending' | 'revoked' | 'admin' = 'pending';
    let userExists = false;

    if (email.toLowerCase() === adminEmail?.toLowerCase()) {
        userStatus = 'admin';
        userExists = true;
    } else {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            userStatus = userData.status;
            userExists = true;
        } else {
            // User does not exist, add them as pending
            await addDoc(usersRef, { email: email.toLowerCase(), status: 'pending' });
        }
    }
    
    if (userStatus === 'approved' || userStatus === 'admin') {
      // Generate code and send email
      const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      const otpsRef = collection(firestore, 'otps');
      await addDoc(otpsRef, {
        email: email.toLowerCase(),
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
             throw new Error('Failed to send email: Authentication error. Please double-check GMAIL_EMAIL and GMAIL_APP_PASSWORD in your Vercel environment variables.');
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
);

export async function sendLoginCode(input: SendLoginCodeInput) {
  return await sendLoginCodeFlow(input);
}
