const mongoose = require('mongoose');

const visitorSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  visitorId: { type: String, required: true, index: true },
  deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'], default: 'desktop' },
  browser: { type: String, default: 'unknown' },
  os: { type: String, default: 'unknown' },
  referrer: { type: String, default: '' },
  trafficSource: { type: String, default: 'Direct' }, // Direct, Organic Search, Social (Facebook, Instagram, TikTok), Referral, Campaign
  utmSource: { type: String, default: '' },
  utmMedium: { type: String, default: '' },
  utmCampaign: { type: String, default: '' },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now, index: true },
  pageViewsCount: { type: Number, default: 1 },
  eventsCount: { type: Number, default: 0 },
  hasPurchased: { type: Boolean, default: false },
  totalSpent: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false, index: true }
}, { timestamps: true });

// Compound index for active sessions query
visitorSessionSchema.index({ lastSeen: -1 });
visitorSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VisitorSession', visitorSessionSchema);
