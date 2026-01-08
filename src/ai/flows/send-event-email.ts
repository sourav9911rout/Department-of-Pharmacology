'use server';
/**
 * @fileOverview A flow for sending event notification emails.
 *
 * - sendEventEmail - A function that handles sending an email for a class/meeting event.
 * - SendEventEmailSchema - The input type for the sendEventEmail function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Resend } from 'resend';
import EventNotificationEmail from '@/components/emails/event-notification-email';

const SendEventEmailSchema = z.object({
  topic: z.string().describe('The topic of the class/meeting.'),
  date: z.string().describe('The date of the class/meeting.'),
  time: z.string().describe('The time of the class/meeting.'),
  conductedBy: z.string().describe('The person conducting the event.'),
  meetLink: z.string().describe('The Google Meet link for the event.'),
  invitees: z.array(z.string().email()).describe('A list of email addresses to invite.'),
});

export type SendEventEmailInput = z.infer<typeof SendEventEmailSchema>;

const sendEventEmailFlow = ai.defineFlow(
  {
    name: 'sendEventEmailFlow',
    inputSchema: SendEventEmailSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    if (!input.invitees || input.invitees.length === 0) {
      console.log('No invitees to send email to.');
      return;
    }
    
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === '') {
        throw new Error("RESEND_API_KEY is not set in the environment variables. Please add it to your .env file to send emails.");
    }
    if (!process.env.EMAIL_FROM || process.env.EMAIL_FROM === '') {
        throw new Error("EMAIL_FROM is not set in the environment variables. Please add it to your .env file to specify the sender's email address.");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: input.invitees,
        subject: `Invitation: ${input.topic}`,
        react: EventNotificationEmail({
          topic: input.topic,
          date: input.date,
          time: input.time,
          conductedBy: input.conductedBy,
          meetLink: input.meetLink,
        }),
      });
    } catch (error) {
        console.error("Error sending email with Resend:", error);
        // Re-throw the error to be caught by the calling UI component
        if (error instanceof Error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
        throw new Error("Failed to send email due to an unknown error. Please check your Resend configuration and API key.");
    }
  }
);

export async function sendEventEmail(input: SendEventEmailInput): Promise<void> {
  await sendEventEmailFlow(input);
}
