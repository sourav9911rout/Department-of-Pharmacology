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
    if (!input.invitees || input.invitees.length === 0) {
      console.log('No invitees to send email to.');
      return;
    }
    
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error("Gmail credentials are not set in the environment variables. Please add GMAIL_EMAIL and GMAIL_APP_PASSWORD to your .env file.");
    }

    const emailHtml = render(EventNotificationEmail({
        topic: input.topic,
        date: input.date,
        time: input.time,
        conductedBy: input.conductedBy,
        meetLink: input.meetLink,
    }));

    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: input.invitees.join(','),
      subject: `Invitation: ${input.topic}`,
      html: emailHtml,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Event notification emails sent successfully.');
    } catch (error) {
        console.error("Error sending email with Nodemailer:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
        throw new Error("Failed to send email due to an unknown error. Please check your Nodemailer configuration and credentials.");
    }
  }
);

export async function sendEventEmail(input: SendEventEmailInput): Promise<void> {
  await sendEventEmailFlow(input);
}
