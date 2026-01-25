const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // MUST be false for 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"AmaraCé" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
        console.error('❌ Email sending failed:', error.code, error.response);
    }
};

module.exports = sendEmail;
