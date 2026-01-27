const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    logo: { type: String, default: '' },
    sideAd: { type: String, default: '' },
    headerBackground: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    fbSectionImage: { type: String, default: '' },
    footerHelpImage: { type: String, default: '' },
    gcashQRCode: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
