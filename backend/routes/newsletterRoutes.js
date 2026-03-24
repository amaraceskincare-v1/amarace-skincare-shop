const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const sendEmail = require('../utils/sendEmail');
const { welcomeNewsletter } = require('../utils/newsletterEmailTemplate');

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Check if already subscribed
        let subscriber = await Newsletter.findOne({ email });

        if (subscriber) {
            if (!subscriber.isSubscribed) {
                subscriber.isSubscribed = true;
                await subscriber.save();
                return res.json({ message: 'Welcome back! You have been resubscribed.' });
            }
            return res.status(400).json({ message: 'You are already subscribed!' });
        }

        // Create new subscriber
        console.log('Creating subscriber for:', email);
        subscriber = await Newsletter.create({ email });

        // Send instant response to frontend so UI doesn't hang
        res.status(201).json({ message: 'Successfully subscribed!' });

        // Send Welcome Email (Non-Blocking mode)
        console.log('Sending welcome email in background to:', email);
        sendEmail({
            to: subscriber.email,
            subject: 'Welcome to AmaraCé Newsletter! (10% OFF Inside)',
            html: welcomeNewsletter()
        }).then(() => {
            console.log('Welcome email sent successfully to:', email);
        }).catch(err => {
            console.error('Background welcome email failed:', err);
        });

    } catch (error) {
        console.error('Newsletter Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
