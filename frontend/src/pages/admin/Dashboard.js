import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { FiPackage, FiShoppingCart, FiCreditCard, FiUsers, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import api from '../../utils/api';
import '../../styles/Admin.css';

// Currency formatter (Philippine Peso)
const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [analytics, setAnalytics] = useState({ activeNow: 0, visitors: 0, conversionRate: '0.00' });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes, analyticsRes] = await Promise.allSettled([
          api.get('/products?limit=1'),
          api.get('/orders'),
          api.get('/analytics/dashboard?range=today')
        ]);

        const productsData = productsRes.status === 'fulfilled' ? productsRes.value.data : {};
        const ordersData = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];
        const analyticsData = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : {};

        const revenue = Array.isArray(ordersData)
          ? ordersData.reduce((sum, order) => (order.status !== 'cancelled' ? sum + order.total : sum), 0)
          : 0;

        setStats({
          products: productsData.total || 0,
          orders: Array.isArray(ordersData) ? ordersData.length : 0,
          revenue,
        });

        if (analyticsData.summary) {
          setAnalytics({
            activeNow: analyticsData.summary.activeNow || 0,
            visitors: analyticsData.summary.totalVisitors || 0,
            conversionRate: analyticsData.summary.conversionRate || '0.00'
          });
        }

        if (Array.isArray(ordersData)) {
          setRecentOrders(ordersData.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-header-row">
          <div>
            <h1>Dashboard Overview</h1>
            <p className="admin-subtitle">Store statistics, live visitor metrics, and recent orders</p>
          </div>

          <div className="admin-live-pulse-badge">
            <span className="pulse-indicator" />
            <strong>{analytics.activeNow}</strong> live active shoppers
          </div>
        </div>

        {/* ── Top Metric Cards ───────────────────────────── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper products">
              <FiPackage />
            </div>
            <div className="stat-info">
              <p>Total Products</p>
              <h3>{stats.products}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper orders">
              <FiShoppingCart />
            </div>
            <div className="stat-info">
              <p>Total Orders</p>
              <h3>{stats.orders}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper revenue">
              <FiCreditCard />
            </div>
            <div className="stat-info">
              <p>Total Revenue</p>
              <h3>{pesoFormatter.format(stats.revenue)}</h3>
            </div>
          </div>

          <div className="stat-card analytics-promo-card">
            <div className="stat-icon-wrapper visitors">
              <FiTrendingUp />
            </div>
            <div className="stat-info">
              <p>Today's Conversion</p>
              <h3>{analytics.conversionRate}%</h3>
            </div>
          </div>
        </div>

        {/* ── Analytics Quick Banner ─────────────────────── */}
        <div className="admin-analytics-banner">
          <div className="banner-left">
            <div className="banner-icon-circle"><FiUsers /></div>
            <div>
              <h4>Store Analytics & Traffic Insights</h4>
              <p>Today: <strong>{analytics.visitors}</strong> unique visitors • <strong>{analytics.activeNow}</strong> shoppers browsing right now</p>
            </div>
          </div>
          <Link to="/admin/analytics" className="btn-view-analytics">
            View Analytics Dashboard <FiArrowRight />
          </Link>
        </div>

        {/* ── Recent Orders ──────────────────────────────── */}
        <div className="admin-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="view-all-link">View All</Link>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="order-id-cell">
                      # {(() => {
                        const d = new Date(order.createdAt);
                        const year = d.getFullYear();
                        const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
                        const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
                        return `${year}-${mmdd}-${hhmm}`;
                      })()}
                    </td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td className="total-cell">{pesoFormatter.format(order.total)}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
