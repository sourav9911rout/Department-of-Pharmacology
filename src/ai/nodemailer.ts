
import nodemailer from 'nodemailer';

// This function will be called only on the server, when an email needs to be sent.
export function getTransporter() {
    const email = process.env.GMAIL_EMAIL;
    const pass = process.env.GMAIL_APP_PASSWORD;

    // We check for credentials here, just-in-time.
    if (!email || !pass) {
        // This error will be logged on the server and will not crash the build.
        console.error('FATAL: Gmail credentials are not set in environment variables.');
        throw new Error('The email service is not configured correctly on the server.');
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: pass,
      },
    });
}
