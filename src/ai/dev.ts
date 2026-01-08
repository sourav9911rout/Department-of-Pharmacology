'use server';
import dotenv from 'dotenv';
dotenv.config();

// Flows will be imported for their side effects in this file.
import './flows/send-event-email';
import { sendEventEmail } from './flows/send-event-email';

// Temporary code to send a test email on server start.
// This will be removed after verification.
(async () => {
    console.log('Sending test email...');
    try {
        await sendEventEmail({
            topic: 'Test Event for Email Functionality',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            conductedBy: 'Automated System Test',
            meetLink: 'https://meet.google.com/test-link',
            invitees: ['sourav.9911rout@gmail.com']
        });
        console.log('Test email call completed.');
    } catch (error) {
        console.error('Failed to send test email:', error);
    }
})();
