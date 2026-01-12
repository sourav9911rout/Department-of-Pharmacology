
'use server';
/**
 * @fileOverview A flow for verifying a one-time login code.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeServerFirebase } from '@/firebase/server-init';
import { collection, query, where, getDocs, orderBy, limit, deleteDoc } from 'firebase/firestore';

const VerifyLoginCodeSchema = z.object({
  email: z.string().email().describe('The user\'s email address.'),
  code: z.string().length(6).describe('The 6-digit code to verify.'),
});

const VerifyLoginCodeOutputSchema = z.object({
    success: z.boolean().describe('Whether the login was successful.'),
    isAdmin: z.boolean().describe('Whether the logged-in user is an administrator.'),
    message: z.string().describe('A message indicating the result.'),
});

export type VerifyLoginCodeInput = z.infer<typeof VerifyLoginCodeSchema>;
export type VerifyLoginCodeOutput = z.infer<typeof VerifyLoginCodeOutputSchema>;

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const verifyLoginCodeFlow = ai.defineFlow(
  {
    name: 'verifyLoginCodeFlow',
    inputSchema: VerifyLoginCodeSchema,
    outputSchema: VerifyLoginCodeOutputSchema,
  },
  async ({ email, code }) => {
    const { firestore } = initializeServerFirebase();
    const otpsRef = collection(firestore, 'otps');
    
    const q = query(
        otpsRef, 
        where('email', '==', email), 
        where('code', '==', code),
        orderBy('expiresAt', 'desc'),
        limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { success: false, isAdmin: false, message: 'Invalid code. Please try again.' };
    }

    const otpDoc = querySnapshot.docs[0];
    const otpData = otpDoc.data();

    // Clean up the used OTP immediately
    await deleteDoc(otpDoc.ref);

    if (otpData.expiresAt.toMillis() < Date.now()) {
        return { success: false, isAdmin: false, message: 'Your code has expired. Please request a new one.' };
    }
    
    if (!email) {
        return { success: false, isAdmin: false, message: 'Email not provided.'}
    }
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL?.toLowerCase();

    return { success: true, isAdmin, message: 'Login successful!' };
  }
);

export async function verifyLoginCode(input: VerifyLoginCodeInput): Promise<VerifyLoginCodeOutput> {
  return await verifyLoginCodeFlow(input);
}
