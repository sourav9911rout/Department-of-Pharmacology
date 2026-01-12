
'use server';
/**
 * @fileOverview A flow for sending a one-time login code to a user.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { transporter } from '@/ai/nodemailer';
import { initializeServerFirebase } from '@/firebase/server-init';
import { collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { render } from '@react-email/components';
import LoginCodeEmail from '@/components/emails/login-code-email';

const SendLoginCodeSchema = z.object({
  email: z.string().email().describe('The email address to send the login code to.'),
});

const SendLoginCodeOutputSchema = z.object({
    canLogin: z.boolean().describe('Whether the user is permitted to receive a login code.'),
    message: z.string().describe('A message to display to the user.'),
});

export type SendLoginCodeInput = z.infer<typeof SendLoginCodeSchema>;
export type SendLoginCodeOutput = z.infer<typeof SendLoginCodeOutputSchema>;

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const sendLoginCodeFlow = ai.defineFlow(
  {
    name: 'sendLoginCodeFlow',
    inputSchema: SendLoginCodeSchema,
    outputSchema: SendLoginCodeOutputSchema,
  },
  async ({ email }) => {
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Gmail credentials are not set in environment variables.");
      throw new Error("Email service is not configured. Missing GMAIL_EMAIL or GMAIL_APP_PASSWORD in environment variables.");
    }
    
    const { firestore } = initializeServerFirebase();
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    let userStatus: 'approved' | 'pending' | 'revoked' | 'new' = 'new';
    let canLogin = false;

    if (!email) {
      throw new Error("Email is required.");
    }

    if (email.toLowerCase() === ADMIN_EMAIL?.toLowerCase()) {
        canLogin = true;
    } else if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        userStatus = userDoc.status;
        if (userStatus === 'approved') {
            canLogin = true;
        }
    }

    if (canLogin) {
        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Store OTP in Firestore
        const otpsRef = collection(firestore, 'otps');
        await addDoc(otpsRef, { email, code, expiresAt, createdAt: serverTimestamp() });

        // Send email
        const emailHtml = render(LoginCodeEmail({ validationCode: code }));
        const mailOptions = {
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: 'Your Login Code for Department Portal',
            html: emailHtml,
        };

        try {
            await transporter.sendMail(mailOptions);
            return { canLogin: true, message: 'Login code sent to your email.' };
        } catch (error) {
            console.error("Error sending login code email:", error);
            if (error instanceof Error) {
                if ('code' in error && (error as any).code === 'EAUTH') {
                     throw new Error('Failed to send email: Authentication error. Please double-check GMAIL_EMAIL and GMAIL_APP_PASSWORD in your Vercel environment variables.');
                }
                throw new Error(`Failed to send email: ${error.message}`);
            }
            throw new Error("Failed to send login code due to an unknown error.");
        }

    } else {
        // Handle new or pending users
        if (userStatus === 'new') {
            await addDoc(usersRef, { email, status: 'pending' });
            return { canLogin: false, message: 'Your email has been submitted for approval.' };
        } else {
             return { canLogin: false, message: `Your access request is currently in '${userStatus}' state.` };
        }
    }
  }
);

export async function sendLoginCode(input: SendLoginCodeInput): Promise<SendLoginCodeOutput> {
  return await sendLoginCodeFlow(input);
}
