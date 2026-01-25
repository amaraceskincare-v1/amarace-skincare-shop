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
router.put('/', protect, admin, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'sideAd', maxCount: 1 }]), async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) settings = await SiteSettings.create({});

        if (req.files['logo']) {
            settings.logo = req.files['logo'][0].path;
        }
        if (req.files['sideAd']) {
            settings.sideAd = req.files['sideAd'][0].path;
        }

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
