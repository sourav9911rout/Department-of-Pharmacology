'use server';
/**
 * @fileOverview A flow for sending event notification emails using Nodemailer.
 *
 * - sendEventEmail - A function that handles sending an email for a class/meeting event.
 * - SendEventEmailSchema - The input type for the sendEventEmail function.
 */
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

export async function sendEventEmail(input: SendEventEmailInput): Promise<void> {
    const email = process.env.GMAIL_EMAIL;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!email || !pass) {
        throw new Error('FATAL ERROR: Gmail credentials are not set. Email functionality will be disabled. Please set GMAIL_EMAIL and GMAIL_APP_PASSWORD in your environment variables.');
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
    } catch (error: any) {
        console.error("Fatal: Error sending event email with Nodemailer. The most likely cause is incorrect GMAIL_EMAIL or GMAIL_APP_PASSWORD environment variables. Full error:", error);
        // Provide a user-friendly message without exposing server details.
        throw new Error("The email service is not configured correctly on the server. Please contact an administrator.");
    }
}
