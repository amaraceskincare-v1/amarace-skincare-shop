const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    logo: { type: String, default: '' },
    navbarLogo: { type: String, default: '' },
    sideAd: { type: String, default: '' },
    headerBackground: { type: String, default: '' },
    heroImages: { type: [String], default: [] }, // Array of images/videos
    gcashQRCode: { type: String, default: '' },
    paymentLogos: { type: [String], default: [] }, // Array of payment logos
    footerSmallIcon: { type: String, default: '' },
    lipTintImage: { type: String, default: '' },
    perfumeImage: { type: String, default: '' },
    beautySoapImage: { type: String, default: '' },
    allBestSellersImage: { type: String, default: '' },
    ourStoryImage: { type: String, default: '' },
    productHeroMedia: { type: String, default: '' },
    premiumBannerMedia: { type: String, default: '' },
    brandName: { type: String, default: '' },
    showBrandName: { type: Boolean, default: true },
    brandNamePosition: { type: String, default: 'right' },
    brandNameColor: { type: String, default: '#2D2D2D' },
    brandNameFontSize: { type: String, default: 'medium' },
    brandNameFontWeight: { type: String, default: 'bold' },
    headerLogoSize: { type: Number, default: 60 },
    teamImages: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
