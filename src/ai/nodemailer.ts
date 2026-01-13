import nodemailer from 'nodemailer';

const email = process.env.GMAIL_EMAIL;
const pass = process.env.GMAIL_APP_PASSWORD;

// We check for credentials inside the flows that use the transporter
// to avoid build-time errors when process.env is not yet populated.

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: pass,
  },
});
