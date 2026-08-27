import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  FiUsers, FiEye, FiShoppingCart, FiCreditCard,
  FiTrendingUp, FiSmartphone, FiMonitor, FiTablet,
  FiGlobe, FiRefreshCw, FiArrowRight, FiCheckCircle
} from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import '../../styles/Admin.css';

// Currency formatter (Philippine Peso)
const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const AdminAnalytics = () => {
  const [range, setRange] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (selectedRange) => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/dashboard?range=${selectedRange}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(range);
  }, [range, fetchAnalytics]);

  const summary = data?.summary || {};
  const funnel = data?.funnel || {};
  const topViewed = data?.topViewedProducts || [];
  const topCart = data?.topCartProducts || [];
  const traffic = data?.trafficSources || [];
  const devices = data?.deviceTypes || [];

  const maxTraffic = traffic.reduce((max, t) => Math.max(max, t.count), 1);
  const totalDevices = devices.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Header with Timeframe Range Switcher */}
        <div className="admin-header-row">
          <div>
            <h1>Visitor & Sales Analytics</h1>
            <p className="admin-subtitle">
              Comprehensive real-time tracking, customer journey funnel, and traffic attribution
            </p>
          </div>

          <div className="analytics-header-controls">
            {/* Live Indicator */}
            <div className="admin-live-pulse-badge">
              <span className="pulse-indicator" />
              <strong>{summary.activeNow || 0}</strong> active shoppers now
            </div>

            {/* Time Filter */}
            <div className="time-range-filter">
              {[
                { id: 'today', label: 'Today' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: 'all', label: 'All Time' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`range-btn ${range === opt.id ? 'active' : ''}`}
                  onClick={() => setRange(opt.id)}
                >
                  {opt.label}
                </button>
              ))}

              <button
                type="button"
                className="refresh-analytics-btn"
                onClick={() => fetchAnalytics(range)}
                title="Refresh Data"
              >
                <FiRefreshCw className={loading ? 'spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {loading && !data ? (
          <div className="analytics-loading-state">
            <FiRefreshCw className="spin" size={32} />
            <p>Gathering analytics data...</p>
          </div>
        ) : (
          <>
            {/* ── Metric Cards Grid ─────────────────────────── */}
            <div className="analytics-stats-grid">
              <div className="analytics-stat-card">
                <div className="stat-card-top">
                  <span className="stat-label">Unique Visitors</span>
                  <div className="stat-icon-wrap visitors"><FiUsers /></div>
                </div>
                <h3 className="stat-number">{summary.totalVisitors || 0}</h3>
                <span className="stat-sub">{summary.totalSessions || 0} Total Sessions</span>
              </div>

              <div className="analytics-stat-card">
                <div className="stat-card-top">
                  <span className="stat-label">Page Views</span>
                  <div className="stat-icon-wrap pageviews"><FiEye /></div>
                </div>
                <h3 className="stat-number">{summary.pageViews || 0}</h3>
                <span className="stat-sub">{summary.productViews || 0} Product Views</span>
              </div>

              <div className="analytics-stat-card">
                <div className="stat-card-top">
                  <span className="stat-label">Add to Bags</span>
                  <div className="stat-icon-wrap cart"><FiShoppingCart /></div>
                </div>
                <h3 className="stat-number">{summary.addToCartEvents || 0}</h3>
                <span className="stat-sub">{summary.cartConversionRate || 0}% View-to-Cart</span>
              </div>

              <div className="analytics-stat-card">
                <div className="stat-card-top">
                  <span className="stat-label">Orders Placed</span>
                  <div className="stat-icon-wrap orders"><FiCheckCircle /></div>
                </div>
                <h3 className="stat-number">{summary.ordersCount || 0}</h3>
                <span className="stat-sub">{summary.conversionRate || 0}% Conversion Rate</span>
              </div>

              <div className="analytics-stat-card highlight">
                <div className="stat-card-top">
                  <span className="stat-label">Revenue Generated</span>
                  <div className="stat-icon-wrap revenue"><FiCreditCard /></div>
                </div>
                <h3 className="stat-number">{pesoFormatter.format(summary.totalRevenue || 0)}</h3>
                <span className="stat-sub">Across {summary.ordersCount || 0} Orders</span>
              </div>
            </div>

            {/* ── Conversion Funnel ─────────────────────────── */}
            <div className="analytics-section-card">
              <div className="section-card-header">
                <div>
                  <h3>Customer Journey & Conversion Funnel</h3>
                  <p>Step-by-step visitor progression from discovery to completed checkout</p>
                </div>
              </div>

              <div className="funnel-container">
                <div className="funnel-step">
                  <span className="funnel-step-label">1. Site Visitors</span>
                  <div className="funnel-bar-wrapper">
                    <div className="funnel-bar v-100" style={{ width: '100%' }}>
                      <strong className="funnel-bar-val">{funnel.visitors || 0}</strong>
                    </div>
                  </div>
                  <span className="funnel-pct">100%</span>
                </div>

                <div className="funnel-step">
                  <span className="funnel-step-label">2. Product Views</span>
                  <div className="funnel-bar-wrapper">
                    <div
                      className="funnel-bar v-75"
                      style={{
                        width: `${Math.max(8, funnel.visitors > 0 ? (funnel.productViews / funnel.visitors) * 100 : 0)}%`
                      }}
                    >
                      <strong className="funnel-bar-val">{funnel.productViews || 0}</strong>
                    </div>
                  </div>
                  <span className="funnel-pct">
                    {funnel.visitors > 0 ? Math.round((funnel.productViews / funnel.visitors) * 100) : 0}%
                  </span>
                </div>

                <div className="funnel-step">
                  <span className="funnel-step-label">3. Add to Bag</span>
                  <div className="funnel-bar-wrapper">
                    <div
                      className="funnel-bar v-50"
                      style={{
                        width: `${Math.max(6, funnel.visitors > 0 ? (funnel.addToCart / funnel.visitors) * 100 : 0)}%`
                      }}
                    >
                      <strong className="funnel-bar-val">{funnel.addToCart || 0}</strong>
                    </div>
                  </div>
                  <span className="funnel-pct">
                    {funnel.visitors > 0 ? Math.round((funnel.addToCart / funnel.visitors) * 100) : 0}%
                  </span>
                </div>

                <div className="funnel-step">
                  <span className="funnel-step-label">4. Checkout Started</span>
                  <div className="funnel-bar-wrapper">
                    <div
                      className="funnel-bar v-25"
                      style={{
                        width: `${Math.max(4, funnel.visitors > 0 ? (funnel.checkouts / funnel.visitors) * 100 : 0)}%`
                      }}
                    >
                      <strong className="funnel-bar-val">{funnel.checkouts || 0}</strong>
                    </div>
                  </div>
                  <span className="funnel-pct">
                    {funnel.visitors > 0 ? Math.round((funnel.checkouts / funnel.visitors) * 100) : 0}%
                  </span>
                </div>

                <div className="funnel-step final">
                  <span className="funnel-step-label">5. Orders Completed</span>
                  <div className="funnel-bar-wrapper">
                    <div
                      className="funnel-bar v-final"
                      style={{
                        width: `${Math.max(3, funnel.visitors > 0 ? (funnel.orders / funnel.visitors) * 100 : 0)}%`
                      }}
                    >
                      <strong className="funnel-bar-val">{funnel.orders || 0}</strong>
                    </div>
                  </div>
                  <span className="funnel-pct final">
                    {funnel.visitors > 0 ? ((funnel.orders / funnel.visitors) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* ── Two-Column Breakdown ─────────────────────── */}
            <div className="analytics-two-col">
              {/* Top Viewed Products */}
              <div className="analytics-section-card">
                <div className="section-card-header">
                  <h3>Top Viewed Products</h3>
                  <Link to="/admin/products" className="view-all-link">Manage Products</Link>
                </div>

                {topViewed.length > 0 ? (
                  <div className="top-items-list">
                    {topViewed.map((item, idx) => (
                      <div key={item._id || idx} className="top-item-row">
                        <span className="item-rank">{idx + 1}</span>
                        <div className="item-info">
                          <span className="item-name">{item.name || 'Unnamed Product'}</span>
                        </div>
                        <span className="item-stat-badge">{item.views} Views</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-analytics-data">No product view activity recorded in this period.</p>
                )}
              </div>

              {/* Top Added to Bag */}
              <div className="analytics-section-card">
                <div className="section-card-header">
                  <h3>Most Added to Bag</h3>
                  <span className="header-sub-badge">High Purchase Intent</span>
                </div>

                {topCart.length > 0 ? (
                  <div className="top-items-list">
                    {topCart.map((item, idx) => (
                      <div key={item._id || idx} className="top-item-row">
                        <span className="item-rank gold">{idx + 1}</span>
                        <div className="item-info">
                          <span className="item-name">{item.name || 'Unnamed Product'}</span>
                        </div>
                        <span className="item-stat-badge cart">{item.adds} Adds</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-analytics-data">No add-to-bag activity recorded in this period.</p>
                )}
              </div>
            </div>

            {/* ── Traffic & Devices ────────────────────────── */}
            <div className="analytics-two-col">
              {/* Traffic Sources */}
              <div className="analytics-section-card">
                <div className="section-card-header">
                  <h3>Traffic Channels</h3>
                  <FiGlobe />
                </div>

                {traffic.length > 0 ? (
                  <div className="breakdown-list">
                    {traffic.map((src) => (
                      <div key={src._id} className="breakdown-row">
                        <div className="breakdown-info">
                          <span className="source-title">{src._id || 'Direct'}</span>
                          <span className="source-count">{src.count} sessions</span>
                        </div>
                        <div className="breakdown-bar-bg">
                          <div
                            className="breakdown-bar-fill"
                            style={{ width: `${(src.count / maxTraffic) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-analytics-data">No traffic sources logged for this period.</p>
                )}
              </div>

              {/* Device Types */}
              <div className="analytics-section-card">
                <div className="section-card-header">
                  <h3>Device Breakdown</h3>
                  <FiSmartphone />
                </div>

                {devices.length > 0 ? (
                  <div className="device-distribution">
                    {devices.map((dev) => {
                      const pct = Math.round((dev.count / totalDevices) * 100);
                      const icon = dev._id === 'mobile' ? <FiSmartphone /> : dev._id === 'tablet' ? <FiTablet /> : <FiMonitor />;
                      return (
                        <div key={dev._id} className="device-stat-box">
                          <div className="device-icon">{icon}</div>
                          <span className="device-name">{dev._id || 'Desktop'}</span>
                          <strong className="device-pct">{pct}%</strong>
                          <span className="device-count">{dev.count} visits</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-analytics-data">No device breakdown recorded.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminAnalytics;
