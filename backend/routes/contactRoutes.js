const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');

// POST /api/contact  – Send a contact message to the store owner
router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Email to store owner
        await sendEmail({
            to: process.env.EMAIL_USER,
            subject: `📩 Contact Form: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #e91e63; margin-bottom: 4px;">New Contact Message</h2>
                    <p style="color: #888; font-size: 13px; margin-top: 0;">From your AmaraCé website contact form</p>
                    <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 16px 0;" />
                    <table style="width: 100%; font-size: 15px; color: #333;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; width: 100px;">Name:</td>
                            <td>${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                            <td><a href="mailto:${email}" style="color: #e91e63;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
                            <td>${subject}</td>
                        </tr>
                    </table>
                    <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 16px 0;" />
                    <p style="font-weight: bold; margin-bottom: 8px;">Message:</p>
                    <p style="background: #f9f9f9; padding: 16px; border-radius: 6px; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</p>
                    <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 16px 0;" />
                    <p style="font-size: 12px; color: #aaa;">Reply directly to <a href="mailto:${email}" style="color: #e91e63;">${email}</a> to respond to this inquiry.</p>
                </div>
            `,
        });

        // Auto-reply to customer
        await sendEmail({
            to: email,
            subject: `✨ We received your message! | AmaraCé Skin Care`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #e91e63;">Hi ${name},</h2>
                    <p>Thank you for reaching out to us! We've received your message and will get back to you within 24–48 hours.</p>
                    <div style="background: #fdf2f8; border-left: 4px solid #e91e63; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
                        <strong>Your message:</strong><br/>
                        <em>${message.replace(/\n/g, '<br/>')}</em>
                    </div>
                    <p>For urgent concerns, feel free to reach us at <a href="tel:+639152662648" style="color: #e91e63;">+63 915 266 2648</a>.</p>
                    <p>— The AmaraCé Team 💄</p>
                </div>
            `,
        });

        res.json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Contact email error:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again.' });
    }
});

module.exports = router;
