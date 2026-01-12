
'use server';
/**
 * @fileOverview A flow for sending event notification emails using Nodemailer.
 *
 * - sendEventEmail - A function that handles sending an email for a class/meeting event.
 * - SendEventEmailSchema - The input type for the sendEventEmail function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { transporter } from '@/ai/nodemailer';
import EventNotificationEmail from '@/components/emails/event-notification-email';
import { render } from '@react-email/components';


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
    // 1. Pre-flight check for credentials
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
        console.error("GMAIL_EMAIL or GMAIL_APP_PASSWORD environment variables are not set.");
        throw new Error("Email service is not configured. Missing credentials in environment variables.");
    }

    if (!input.invitees || input.invitees.length === 0) {
      console.log('No invitees to send email to. Skipping email flow.');
      return;
    }

    const emailHtml = render(EventNotificationEmail({
        topic: input.topic,
        date: input.date,
        time: input.time,
        conductedBy: input.conductedBy,
        meetLink: input.meetLink,
    }));

    const mailOptions = {
      from: `"Department of Pharmacology" <${process.env.GMAIL_EMAIL}>`,
      to: input.invitees.join(','),
      subject: `Invitation: ${input.topic}`,
      html: emailHtml,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Event notification email sent successfully. Message ID:', info.messageId);
    } catch (error) {
        // 2. Specific error catching
        console.error("Error sending email with Nodemailer:", error);
        
        if (error instanceof Error) {
            // Check for common authentication errors
            if ('code' in error && (error as any).code === 'EAUTH') {
                 throw new Error('Failed to send email: Authentication error. Please double-check GMAIL_EMAIL and GMAIL_APP_PASSWORD in your Vercel environment variables.');
            }
            // For other errors, re-throw a more detailed message
            throw new Error(`Failed to send email: ${error.message}`);
        }
        // Fallback for unknown errors
        throw new Error("Failed to send email due to an unknown error. Check the Vercel function logs for more details.");
    }
  }
);

export async function sendEventEmail(input: SendEventEmailInput): Promise<void> {
  await sendEventEmailFlow(input);
}
