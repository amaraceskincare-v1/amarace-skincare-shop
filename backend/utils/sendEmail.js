const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendEmail = async ({ to, subject, html }) => {
    if (!resend) {
        console.warn('⚠️ Resend API key is missing. Email not sent.');
        // Optional: Add Nodemailer fallback here if needed
        return;
    }
    try {
        await resend.emails.send({
            from: 'AmaraCé <onboarding@resend.dev>',
            to,
            subject,
            html
        });
        console.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
    }
};

module.exports = sendEmail;
