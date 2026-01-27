import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiCreditCard } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import '../../styles/Admin.css';

// Currency formatter (Philippine Peso)
const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const statAnimation = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.04 },
};

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products?limit=1'),
          api.get('/orders'),
        ]);

        const revenue = ordersRes.data.reduce(
          (sum, order) => (order.status !== 'cancelled' ? sum + order.total : sum),
          0
        );

        setStats({
          products: productsRes.data.total,
          orders: ordersRes.data.length,
          revenue,
        });

        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="admin-loading">Loading Dashboard...</div>;

  return (
    <div className="admin-content-inner">
      <div className="admin-header">
        <h1>Dashboard Overview</h1>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon={<FiPackage />}
          label="Total Products"
          value={stats.products}
          type="products"
        />
        <StatCard
          icon={<FiShoppingCart />}
          label="Total Orders"
          value={stats.orders}
          type="orders"
        />
        <StatCard
          icon={<FiCreditCard />}
          label="Total Revenue"
          value={pesoFormatter.format(stats.revenue)}
          type="revenue"
        />
      </div>

      {/* Recent Orders */}
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
                  <td>
                    <div className="customer-cell">
                      <span>{order.user?.name || 'Guest User'}</span>
                      <small>{order.user?.email}</small>
                    </div>
                  </td>
                  <td className="total-cell">{pesoFormatter.format(order.total)}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Stat Cards
const StatCard = ({ icon, label, value, type }) => (
  <div className={`stat-card ${type}`}>
    <div className={`stat-icon-wrapper ${type}`}>
      {icon}
    </div>
    <div className="stat-info">
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  </div>
);

export default Dashboard;
