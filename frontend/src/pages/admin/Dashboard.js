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

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <motion.div
          className="stat-card"
          variants={statAnimation}
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <FiPackage className="stat-icon" />
          <div>
            <h3>{stats.products}</h3>
            <p>Products</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card"
          variants={statAnimation}
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ duration: 0.35 }}
        >
          <FiShoppingCart className="stat-icon" />
          <div>
            <h3>{stats.orders}</h3>
            <p>Orders</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card"
          variants={statAnimation}
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ duration: 0.4 }}
        >
          <FiCreditCard className="stat-icon" />
          <div>
            <h3>{pesoFormatter.format(stats.revenue)}</h3>
            <p>Revenue</p>
          </div>
        </motion.div>
      </div>

      {/* Admin Navigation */}
      <div className="admin-nav" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <Link to="/admin/products" className="admin-nav-link">
          Manage Products
        </Link>
        <Link to="/admin/orders" className="admin-nav-link">
          Manage Orders
        </Link>
        <Link to="/admin/reviews" className="admin-nav-link">
          Manage Reviews (Star Ratings)
        </Link>
        <Link to="/admin/payments" className="admin-nav-link">
          GCash Payment Management
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders">
        <h2>Recent Orders</h2>
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
                <td>
                  # {(() => {
                    const d = new Date(order.createdAt);
                    const year = d.getFullYear();
                    const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
                    const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
                    return `${year}-${mmdd}-${hhmm}`;
                  })()}
                </td>
                <td>{order.user?.name || 'N/A'}</td>
                <td>{pesoFormatter.format(order.total)}</td>
                <td>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
