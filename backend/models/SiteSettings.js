const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    logo: { type: String, default: '' },
    sideAd: { type: String, default: '' },
    headerBackground: { type: String, default: '' },
    heroImages: { type: [String], default: [] }, // Array of images
    fbSectionImage: { type: String, default: '' },
    footerHelpImage: { type: String, default: '' },
    gcashQRCode: { type: String, default: '' },
    facebookLogo: { type: String, default: '' },
    paymentLogo: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
