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
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'webm'],
        resource_type: 'auto', // Support video
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
    { name: 'navbarLogo', maxCount: 1 },
    { name: 'sideAd', maxCount: 1 },
    { name: 'headerBackground', maxCount: 1 },
    { name: 'heroImages', maxCount: 5 },
    { name: 'gcashQRCode', maxCount: 1 },
    { name: 'paymentLogos', maxCount: 3 },
    { name: 'footerSmallIcon', maxCount: 1 },
    { name: 'lipTintImage', maxCount: 1 },
    { name: 'perfumeImage', maxCount: 1 },
    { name: 'beautySoapImage', maxCount: 1 },
    { name: 'allBestSellersImage', maxCount: 1 },
    { name: 'ourStoryImage', maxCount: 1 },
    { name: 'productHeroMedia', maxCount: 1 },
    { name: 'premiumBannerMedia', maxCount: 1 },
    { name: 'teamImages', maxCount: 3 }
]), async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) settings = await SiteSettings.create({});

        const singleFields = [
            'logo', 'navbarLogo', 'sideAd', 'headerBackground',
            'gcashQRCode',
            'footerSmallIcon', 'lipTintImage', 'perfumeImage',
            'beautySoapImage', 'allBestSellersImage', 'ourStoryImage',
            'brandName', 'showBrandName', 'brandNamePosition',
            'brandNameColor', 'brandNameFontSize', 'brandNameFontWeight',
            'headerLogoSize', 'productHeroMedia', 'premiumBannerMedia'
        ];

        singleFields.forEach(field => {
            if (req.files && req.files[field]) {
                settings[field] = req.files[field][0].path;
            } else if (req.body[field] !== undefined) {
                // Handle text fields or 'remove' command
                settings[field] = req.body[field] === 'remove' ? '' : req.body[field];
            }
        });

        // Special handling for multiple hero images (Append)
        if (req.files && req.files['heroImages']) {
            const newImages = req.files['heroImages'].map(f => f.path);
            settings.heroImages = [...settings.heroImages, ...newImages].slice(0, 5);
        } else if (req.body['heroImages'] === 'remove') {
            settings.heroImages = [];
        } else if (Array.isArray(req.body['heroImages'])) {
            settings.heroImages = req.body['heroImages'];
        }

        // Special handling for multiple payment logos (Append)
        if (req.files && req.files['paymentLogos']) {
            const newLogos = req.files['paymentLogos'].map(f => f.path);
            settings.paymentLogos = [...settings.paymentLogos, ...newLogos].slice(0, 3);
        } else if (req.body['paymentLogos'] === 'remove') {
            settings.paymentLogos = [];
        } else if (Array.isArray(req.body['paymentLogos'])) {
            settings.paymentLogos = req.body['paymentLogos'];
        }

        // Special handling for Team images (Append)
        if (req.files && req.files['teamImages']) {
            const newTeam = req.files['teamImages'].map(f => f.path);
            settings.teamImages = [...settings.teamImages, ...newTeam].slice(0, 3);
        } else if (req.body['teamImages'] === 'remove') {
            settings.teamImages = [];
        } else if (Array.isArray(req.body['teamImages'])) {
            settings.teamImages = req.body['teamImages'];
        }

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
