import api from './api';

const VISITOR_KEY = 'amarace_visitor_id';
const SESSION_KEY = 'amarace_session_id';

// Generate UUID v4 format ID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Get or create persistent Visitor ID
export const getVisitorId = () => {
  try {
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = generateId();
      localStorage.setItem(VISITOR_KEY, visitorId);
    }
    return visitorId;
  } catch {
    return generateId();
  }
};

// Get or create tab/browser Session ID
export const getSessionId = () => {
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return generateId();
  }
};

// Detect device type
const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Parse UTM params from current URL
const getUtmParams = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || ''
    };
  } catch {
    return { utmSource: '', utmMedium: '', utmCampaign: '' };
  }
};

// Check if current session belongs to an admin account
export const isAdminUser = () => {
  try {
    const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user && (user.role === 'admin' || user.isAdmin)) {
        return true;
      }
    }
  } catch {
    // Ignore JSON parse errors
  }
  return false;
};

/**
 * Dispatch tracking event to backend API (fails silently without disrupting UX)
 * Strictly excludes any admin accounts and sessions from customer analytics
 */
export const trackEvent = async (eventType, payload = {}) => {
  // Never track admin browsing activity in customer analytics
  if (isAdminUser()) {
    return;
  }

  try {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const utms = getUtmParams();

    const data = {
      sessionId,
      visitorId,
      eventType,
      pageUrl: window.location.pathname + window.location.search,
      pageTitle: document.title,
      referrer: document.referrer || '',
      deviceType: getDeviceType(),
      ...utms,
      ...payload
    };

    await api.post('/analytics/track', data);
  } catch (err) {
    // Silently suppress tracking errors in production
    if (process.env.NODE_ENV === 'development') {
      console.debug('Analytics track suppressed:', err.message);
    }
  }
};

// Convenience helpers
export const trackPageView = (url, title) => {
  trackEvent('pageview', { pageUrl: url, pageTitle: title });
};

export const trackProductView = (product) => {
  if (!product) return;
  trackEvent('product_view', {
    productId: product._id,
    productName: product.name,
    category: product.category,
    price: product.price
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  if (!product) return;
  trackEvent('add_to_cart', {
    productId: product._id,
    productName: product.name,
    category: product.category,
    price: product.price,
    quantity
  });
};

export const trackCheckoutStart = (items = [], total = 0) => {
  trackEvent('checkout_start', {
    revenue: total,
    quantity: items.length,
    metadata: { itemsCount: items.length }
  });
};

export const trackPurchase = (orderId, total) => {
  trackEvent('purchase', {
    orderId,
    revenue: total
  });
};

/**
 * Real-time Active Shoppers Fetcher
 */
export const getActiveShoppers = async () => {
  try {
    const { data } = await api.get('/analytics/active');
    return data.activeVisitors || 1;
  } catch {
    return 1;
  }
};

/**
 * Product-specific Active Viewers Fetcher
 */
export const getProductActiveViewers = async (productId) => {
  try {
    if (!productId) return 1;
    const { data } = await api.get(`/analytics/product-active/${productId}`);
    return data.activeProductViewers || 1;
  } catch {
    return 1;
  }
};
