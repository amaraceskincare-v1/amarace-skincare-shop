const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to split full name into first/last
const splitName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
};

// Google OAuth Login/Register
router.post('/google', async (req, res) => {
    try {
        const { email, name, picture, googleId } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const { firstName, lastName } = splitName(name);

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists - update Google ID and profile data if not set
            if (!user.googleId) {
                user.googleId = googleId;
            }
            if (!user.profilePicture && picture) {
                user.profilePicture = picture;
            }
            if (!user.firstName && firstName) {
                user.firstName = firstName;
            }
            if (!user.lastName && lastName) {
                user.lastName = lastName;
            }
            await user.save();
        } else {
            // Create new user
            user = new User({
                name,
                firstName,
                lastName,
                email,
                googleId,
                profilePicture: picture,
                authProvider: 'google',
                isVerified: true,
                password: require('crypto').randomBytes(32).toString('hex'),
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
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profilePicture: user.profilePicture,
            authProvider: user.authProvider || 'google',
            address: user.address,
            token,
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ message: 'Google authentication failed' });
    }
});

module.exports = router;
