const express = require('express');
const SiteSettings = require('../models/SiteSettings');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecommerce-settings',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
});

const upload = multer({ storage });

// Get Settings
router.get('/', async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Settings (Admin)
router.put('/', protect, admin, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'sideAd', maxCount: 1 },
    { name: 'headerBackground', maxCount: 1 },
    { name: 'heroImages', maxCount: 10 }, // Allow multiple
    { name: 'fbSectionImage', maxCount: 1 },
    { name: 'footerHelpImage', maxCount: 1 },
    { name: 'gcashQRCode', maxCount: 1 },
    { name: 'facebookLogo', maxCount: 1 },
    { name: 'paymentLogo', maxCount: 1 }
]), async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) settings = await SiteSettings.create({});

        const singleFields = ['logo', 'sideAd', 'headerBackground', 'fbSectionImage', 'footerHelpImage', 'gcashQRCode', 'facebookLogo', 'paymentLogo'];

        singleFields.forEach(field => {
            if (req.files[field]) {
                settings[field] = req.files[field][0].path;
            } else if (req.body[field] === 'remove') {
                settings[field] = '';
            }
        });

        // Special handling for multiple hero images
        if (req.files['heroImages']) {
            settings.heroImages = req.files['heroImages'].map(f => f.path);
        } else if (req.body['heroImages'] === 'remove') {
            settings.heroImages = [];
        }

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
