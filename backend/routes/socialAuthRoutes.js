const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Google OAuth Login/Register
router.post('/google', async (req, res) => {
    try {
        const { email, name, picture, googleId } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists - update Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.profilePicture = user.profilePicture || picture;
                await user.save();
            }
        } else {
            // Create new user
            user = new User({
                name,
                email,
                googleId,
                profilePicture: picture,
                isVerified: true, // Google accounts are pre-verified
                password: require('crypto').randomBytes(32).toString('hex'), // Random password for social users
            });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            token,
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ message: 'Google authentication failed' });
    }
});

module.exports = router;
