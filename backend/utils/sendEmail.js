const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL/TLS
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
