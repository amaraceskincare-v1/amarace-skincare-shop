const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  visitorId: { type: String, required: true, index: true },
  eventType: {
    type: String,
    enum: ['pageview', 'product_view', 'category_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'purchase', 'heartbeat'],
    required: true,
    index: true
  },
  pageUrl: { type: String, default: '' },
  pageTitle: { type: String, default: '' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null, index: true },
  productName: { type: String, default: '' },
  category: { type: String, default: '' },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  revenue: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  isAdmin: { type: Boolean, default: false, index: true },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Compound indexes for analytical queries
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ productId: 1, eventType: 1 });
analyticsEventSchema.index({ timestamp: -1 });
analyticsEventSchema.index({ isAdmin: 1, timestamp: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
