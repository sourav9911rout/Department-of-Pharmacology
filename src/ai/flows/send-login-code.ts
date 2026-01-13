'use server';
/**
 * @fileOverview A flow for generating and sending a one-time login code, and managing user access requests.
 */
import { z } from 'zod';
import { getTransporter } from '@/ai/nodemailer';
import LoginCodeEmail from '@/components/emails/login-code-email';
import { render } from '@react-email/components';
import { getFirestoreServer } from '@/firebase/server-init';
import { Timestamp } from 'firebase-admin/firestore';
import type { AppUser } from '@/lib/types';
import dotenv from 'dotenv';
dotenv.config();

const SendLoginCodeSchema = z.object({
  email: z.string().email().describe('The email to send the login code to.'),
});

export type SendLoginCodeInput = z.infer<typeof SendLoginCodeSchema>;

export async function sendLoginCode(input: SendLoginCodeInput) {
  const { email: userEmail } = input;
  const lowerCaseEmail = userEmail.toLowerCase();
  
  try {
    const firestore = getFirestoreServer();
    const usersRef = firestore.collection('users');
    const q = usersRef.where('email', '==', lowerCaseEmail);
    const querySnapshot = await q.get();
    
    let userDoc;
    if (!querySnapshot.empty) {
      userDoc = querySnapshot.docs[0];
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'deptofpharmacologyaiimscapfims@gmail.com';

    // Case 1: New user
    if (!userDoc) {
      const isFirstUserAdmin = lowerCaseEmail === adminEmail.toLowerCase();
      const newUser: Omit<AppUser, 'id'> = {
        email: lowerCaseEmail,
        role: isFirstUserAdmin ? 'admin' : 'user',
        status: isFirstUserAdmin ? 'approved' : 'pending',
      };
      await usersRef.add(newUser);

      if (!isFirstUserAdmin) {
         return { 
           success: true, 
           codeSent: false,
           message: 'Your request for access has been submitted. An admin will review it shortly.'
         };
      }
    } else {
      // Case 2: Existing user
      const userData = userDoc.data() as AppUser;
      if (userData.status === 'pending') {
        return { success: true, codeSent: false, message: 'Your access request is still pending approval.' };
      }
      if (userData.status === 'revoked') {
        return { success: false, codeSent: false, message: 'Your access has been revoked. Please contact an administrator.' };
      }
    }

    // Logic to generate and send code
    const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const otpsRef = firestore.collection('otps');
    await otpsRef.add({
      email: lowerCaseEmail,
      code: validationCode,
      expiresAt,
    });
    
    const transporter = getTransporter();
    const emailHtml = render(LoginCodeEmail({ validationCode }));

    const mailOptions = {
      from: `"Department of Pharmacology" <${process.env.GMAIL_EMAIL}>`,
      to: userEmail,
      subject: `Your Login Code: ${validationCode}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      codeSent: true,
      message: 'A login code has been sent to your email.',
    };

  } catch (error: any) {
    console.error("Fatal: Error in sendLoginCode flow. The most likely cause is incorrect GMAIL_EMAIL or GMAIL_APP_PASSWORD environment variables, or Firestore permissions. Full error:", error);
    if (error.code === 'EAUTH') {
        throw new Error("Failed to send email: Authentication error. Please double-check your credentials in the environment variables.");
    }
    throw new Error("The email service is not configured correctly on the server. Please contact an administrator.");
  }
}
