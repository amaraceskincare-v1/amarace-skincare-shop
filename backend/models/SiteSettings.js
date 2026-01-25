const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    logo: { type: String, default: '' },
    sideAd: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
