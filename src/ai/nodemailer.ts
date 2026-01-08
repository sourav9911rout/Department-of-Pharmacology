'use server';
import nodemailer from 'nodemailer';

const email = process.env.GMAIL_EMAIL;
const pass = process.env.GMAIL_APP_PASSWORD;

if (!email || !pass) {
  console.warn(
    'Gmail credentials are not set. Email functionality will be disabled. Please set GMAIL_EMAIL and GMAIL_APP_PASSWORD in your .env file.'
  );
}

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: pass,
  },
});
