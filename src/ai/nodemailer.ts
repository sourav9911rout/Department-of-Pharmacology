
import nodemailer from 'nodemailer';

const email = process.env.GMAIL_EMAIL;
const pass = process.env.GMAIL_APP_PASSWORD;

// Throw a clear error during initialization if credentials are not set.
// This prevents the application from starting in a broken state.
if (!email || !pass) {
  throw new Error(
    'FATAL ERROR: Gmail credentials are not set. Email functionality will be disabled. Please set GMAIL_EMAIL and GMAIL_APP_PASSWORD in your environment variables.'
  );
}

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: pass,
  },
});
