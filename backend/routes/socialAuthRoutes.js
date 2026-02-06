const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to split full name into first/middle/last
const splitName = (fullName) => {
    if (!fullName) return { firstName: '', middleName: '', lastName: '' };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], middleName: '', lastName: '' };

    // Look for a middle initial (single character or single character followed by a dot)
    let initialIndex = parts.findIndex((p, idx) =>
        idx > 0 && idx < parts.length - 1 && (p.length === 1 || (p.length === 2 && p.endsWith('.')))
    );

    if (initialIndex !== -1) {
        return {
            firstName: parts.slice(0, initialIndex).join(' '),
            middleName: parts[initialIndex],
            lastName: parts.slice(initialIndex + 1).join(' ')
        };
    }

    // Heuristic for multi-word first names (e.g., Peter John Carrillo)
    if (parts.length >= 3) {
        return {
            firstName: parts.slice(0, parts.length - 1).join(' '),
            middleName: '',
            lastName: parts[parts.length - 1]
        };
    }

    // Default: First part is firstName, second is lastName
    return {
        firstName: parts[0],
        middleName: '',
        lastName: parts[1] || ''
    };
};

// Google OAuth Login/Register
router.post('/google', async (req, res) => {
    try {
        const { email, name, picture, googleId, firstName: fName, lastName: lName } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const fallback = splitName(name);
        const firstName = fName || fallback.firstName;
        const lastName = lName || fallback.lastName;
        const middleName = fallback.middleName;

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists - update Google ID and profile data if not set
            if (!user.googleId) user.googleId = googleId;
            if (!user.profilePicture && picture) user.profilePicture = picture;
            if (!user.firstName) user.firstName = firstName;
            if (!user.lastName) user.lastName = lastName;
            if (!user.middleName) user.middleName = middleName;
            await user.save();
        } else {
            // Create new user
            user = new User({
                name,
                firstName,
                middleName,
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
            middleName: user.middleName,
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

// Facebook OAuth Login/Register
router.post('/facebook', async (req, res) => {
    try {
        const { email, name, picture, facebookId, firstName: fName, middleName: mName, lastName: lName } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const fallback = splitName(name);
        const firstName = fName || fallback.firstName;
        const middleName = mName || fallback.middleName;
        const lastName = lName || fallback.lastName;

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists - update Facebook ID and profile data if not set
            if (!user.facebookId) user.facebookId = facebookId;
            if (!user.profilePicture && picture) user.profilePicture = picture;
            if (!user.firstName) user.firstName = firstName;
            if (!user.middleName) user.middleName = middleName;
            if (!user.lastName) user.lastName = lastName;
            await user.save();
        } else {
            // Create new user
            user = new User({
                name,
                firstName,
                middleName,
                lastName,
                email,
                facebookId,
                profilePicture: picture,
                authProvider: 'facebook',
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
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profilePicture: user.profilePicture,
            authProvider: user.authProvider || 'facebook',
            address: user.address,
            token,
        });
    } catch (error) {
        console.error('Facebook auth error:', error);
        res.status(500).json({ message: 'Facebook authentication failed' });
    }
});

module.exports = router;
