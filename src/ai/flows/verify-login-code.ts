
'use server';
/**
 * @fileOverview A flow for verifying a one-time login code.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestoreServer } from '@/firebase/server-init';
import { collection, query, where, getDocs, Timestamp, deleteDoc, doc } from 'firebase/firestore';

const VerifyLoginCodeSchema = z.object({
  email: z.string().email().describe('The user\'s email.'),
  code: z.string().length(6).describe('The 6-digit code to verify.'),
});

export type VerifyLoginCodeInput = z.infer<typeof VerifyLoginCodeSchema>;

const verifyLoginCodeFlow = ai.defineFlow(
  {
    name: 'verifyLoginCodeFlow',
    inputSchema: VerifyLoginCodeSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({ email, code }) => {
    const firestore = getFirestoreServer();
    const otpsRef = collection(firestore, 'otps');

    const q = query(
      otpsRef,
      where('email', '==', email.toLowerCase()),
      where('code', '==', code)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: 'Invalid code. Please try again.' };
    }

    const otpDoc = querySnapshot.docs[0];
    const otpData = otpDoc.data();

    if (Timestamp.now() > otpData.expiresAt) {
      // Clean up expired code
      await deleteDoc(doc(firestore, 'otps', otpDoc.id));
      return { success: false, message: 'Your code has expired. Please request a new one.' };
    }
    
    // Code is valid, delete it so it can't be reused
    await deleteDoc(doc(firestore, 'otps', otpDoc.id));
    
    return { success: true, message: 'Login successful!' };
  }
);

export async function verifyLoginCode(input: VerifyLoginCodeInput) {
  return await verifyLoginCodeFlow(input);
}
