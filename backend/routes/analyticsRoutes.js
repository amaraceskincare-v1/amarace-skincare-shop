const express = require('express');
const router = express.Router();
const VisitorSession = require('../models/VisitorSession');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Helper to check if incoming request belongs to an admin
 */
const checkIfAdminRequest = async (req) => {
  try {
    if (req.body && req.body.isAdmin === true) return true;
    if (req.headers['x-is-admin'] === 'true') return true;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      if (token && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.id) {
          const user = await User.findById(decoded.id).select('role');
          if (user && user.role === 'admin') return true;
        }
      }
    }
  } catch {
    // If token verification fails, proceed as normal visitor
  }
  return false;
};

/**
 * Helper to classify traffic source based on referrer & UTM
 */
const getTrafficSource = (referrer, utmSource) => {
  if (utmSource) {
    const src = utmSource.toLowerCase();
    if (src.includes('facebook') || src.includes('fb')) return 'Facebook';
    if (src.includes('instagram') || src.includes('ig')) return 'Instagram';
    if (src.includes('tiktok')) return 'TikTok';
    if (src.includes('google')) return 'Google Search';
    return utmSource;
  }
  if (!referrer) return 'Direct';
  const ref = referrer.toLowerCase();
  if (ref.includes('facebook.com') || ref.includes('fb.com')) return 'Facebook';
  if (ref.includes('instagram.com')) return 'Instagram';
  if (ref.includes('tiktok.com')) return 'TikTok';
  if (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.')) return 'Organic Search';
  if (ref.includes('youtube.com')) return 'YouTube';
  return 'Referral';
};

/**
 * POST /api/analytics/track
 * Ingests tracking events (strictly excludes admin accounts & sessions)
 */
router.post('/track', async (req, res) => {
  try {
    const {
      sessionId,
      visitorId,
      eventType = 'pageview',
      pageUrl = '',
      pageTitle = '',
      referrer = '',
      deviceType = 'desktop',
      browser = 'unknown',
      os = 'unknown',
      utmSource = '',
      utmMedium = '',
      utmCampaign = '',
      productId = null,
      productName = '',
      category = '',
      price = 0,
      quantity = 1,
      orderId = null,
      revenue = 0,
      metadata = {},
      isAdmin = false
    } = req.body;

    // Check if session/caller is an admin — never record admin activity in customer analytics
    const isRequestAdmin = isAdmin || (await checkIfAdminRequest(req));
    if (isRequestAdmin) {
      return res.status(200).json({ success: true, ignored: true });
    }

    if (!sessionId || !visitorId) {
      return res.status(400).json({ success: false, message: 'Missing session or visitor ID' });
    }

    const now = new Date();
    const trafficSource = getTrafficSource(referrer, utmSource);

    // Upsert or update VisitorSession (real customers only)
    await VisitorSession.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: {
          sessionId,
          visitorId,
          deviceType,
          browser,
          os,
          referrer,
          trafficSource,
          utmSource,
          utmMedium,
          utmCampaign,
          isAdmin: false,
          firstSeen: now
        },
        $set: {
          lastSeen: now,
          ...(revenue > 0 ? { hasPurchased: true } : {})
        },
        $inc: {
          pageViewsCount: eventType === 'pageview' ? 1 : 0,
          eventsCount: eventType !== 'heartbeat' ? 1 : 0,
          totalSpent: revenue > 0 ? Number(revenue) : 0
        }
      },
      { upsert: true, new: true }
    );

    // If it's not a pure heartbeat, log detailed AnalyticsEvent
    if (eventType !== 'heartbeat') {
      await AnalyticsEvent.create({
        sessionId,
        visitorId,
        eventType,
        pageUrl,
        pageTitle,
        productId: productId || undefined,
        productName,
        category,
        price: Number(price) || 0,
        quantity: Number(quantity) || 1,
        orderId: orderId || undefined,
        revenue: Number(revenue) || 0,
        isAdmin: false,
        metadata,
        timestamp: now
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Analytics track error:', err.message);
    // Return 200 to prevent client disruptions for analytics failures
    res.status(200).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/analytics/active
 * Real-time active shoppers browsing now (customers active in last 5 min, excluding admins)
 */
router.get('/active', async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeCount = await VisitorSession.countDocuments({
      lastSeen: { $gte: fiveMinutesAgo },
      isAdmin: { $ne: true }
    });

    res.json({
      activeVisitors: activeCount,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error fetching active visitors:', err.message);
    res.status(500).json({ message: 'Error retrieving active visitors' });
  }
});

/**
 * GET /api/analytics/product-active/:id
 * Active shoppers looking at a specific product in the last 5 minutes
 */
router.get('/product-active/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeEvents = await AnalyticsEvent.distinct('sessionId', {
      productId: id,
      eventType: 'product_view',
      timestamp: { $gte: fiveMinutesAgo },
      isAdmin: { $ne: true }
    });

    res.json({
      activeProductViewers: activeEvents.length,
      productId: id
    });
  } catch (err) {
    console.error('Error fetching product active viewers:', err.message);
    res.status(500).json({ message: 'Error retrieving product viewers' });
  }
});

/**
 * GET /api/analytics/dashboard
 * Full Admin Analytics Dashboard (Requires Admin Auth)
 */
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const { range = 'today' } = req.query;
    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'all') {
      startDate = new Date(0); // Beginning of time
    }

    const dateFilter = { createdAt: { $gte: startDate }, isAdmin: { $ne: true } };
    const eventDateFilter = { timestamp: { $gte: startDate }, isAdmin: { $ne: true } };

    // 1. Core Summary Metrics (Real Customer Traffic Only)
    const [
      totalSessions,
      uniqueVisitorsArr,
      pageViews,
      productViews,
      addToCartEvents,
      checkoutEvents,
      activeNow
    ] = await Promise.all([
      VisitorSession.countDocuments(dateFilter),
      VisitorSession.distinct('visitorId', dateFilter),
      AnalyticsEvent.countDocuments({ ...eventDateFilter, eventType: 'pageview' }),
      AnalyticsEvent.countDocuments({ ...eventDateFilter, eventType: 'product_view' }),
      AnalyticsEvent.countDocuments({ ...eventDateFilter, eventType: 'add_to_cart' }),
      AnalyticsEvent.countDocuments({ ...eventDateFilter, eventType: 'checkout_start' }),
      VisitorSession.countDocuments({ lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, isAdmin: { $ne: true } })
    ]);

    const uniqueVisitors = uniqueVisitorsArr.length;

    // 2. Orders & Revenue from Order collection for accuracy
    const ordersInRange = await Order.find({
      createdAt: { $gte: startDate },
      status: { $ne: 'cancelled' }
    });

    const ordersCount = ordersInRange.length;
    const totalRevenue = ordersInRange.reduce((sum, o) => sum + (o.total || 0), 0);

    // 3. Conversion Rate Calculation
    const conversionRate = uniqueVisitors > 0
      ? ((ordersCount / uniqueVisitors) * 100).toFixed(2)
      : '0.00';

    const cartConversionRate = productViews > 0
      ? ((addToCartEvents / productViews) * 100).toFixed(2)
      : '0.00';

    // 4. Conversion Funnel
    const funnel = {
      visitors: uniqueVisitors,
      productViews,
      addToCart: addToCartEvents,
      checkouts: checkoutEvents,
      orders: ordersCount
    };

    // 5. Top Viewed Products
    const topViewedProducts = await AnalyticsEvent.aggregate([
      { $match: { ...eventDateFilter, eventType: 'product_view', productId: { $ne: null } } },
      { $group: { _id: '$productId', name: { $first: '$productName' }, views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 6 }
    ]);

    // 6. Top Added-to-Cart Products
    const topCartProducts = await AnalyticsEvent.aggregate([
      { $match: { ...eventDateFilter, eventType: 'add_to_cart', productId: { $ne: null } } },
      { $group: { _id: '$productId', name: { $first: '$productName' }, adds: { $sum: 1 } } },
      { $sort: { adds: -1 } },
      { $limit: 6 }
    ]);

    // 7. Traffic Sources Breakdown
    const trafficSources = await VisitorSession.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$trafficSource', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 8. Device Types Breakdown
    const deviceTypes = await VisitorSession.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 9. Trend Data (Daily/Hourly)
    let trendGroupFormat = range === 'today' ? '%Y-%m-%d %H:00' : '%Y-%m-%d';
    const pageViewsTrend = await AnalyticsEvent.aggregate([
      { $match: { ...eventDateFilter, eventType: 'pageview' } },
      {
        $group: {
          _id: { $dateToString: { format: trendGroupFormat, date: '$timestamp' } },
          views: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      summary: {
        activeNow,
        totalVisitors: uniqueVisitors,
        totalSessions,
        pageViews,
        productViews,
        addToCartEvents,
        checkoutEvents,
        ordersCount,
        totalRevenue,
        conversionRate,
        cartConversionRate
      },
      funnel,
      topViewedProducts,
      topCartProducts,
      trafficSources,
      deviceTypes,
      trends: pageViewsTrend,
      range
    });
  } catch (err) {
    console.error('Analytics dashboard error:', err);
    res.status(500).json({ message: 'Failed to generate analytics dashboard data' });
  }
});

module.exports = router;
