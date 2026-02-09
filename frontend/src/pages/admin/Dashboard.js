import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { FiPackage, FiShoppingCart, FiCreditCard } from 'react-icons/fi';
import api from '../../utils/api';
import '../../styles/Admin.css';

// Currency formatter (Philippine Peso)
const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products?limit=1'),
          api.get('/orders')
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
    <div className=\"admin-layout\">
      < AdminSidebar />

      {/* Main Content */ }
      < main className =\"admin-main\">
        < div className =\"admin-header\">
          < h1 > Dashboard Overview</h1 >
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>View your store statistics and recent activity</p>
        </div >

  {/* Stats */ }
  < div className =\"stats-grid\">
{/* ... existing stats ... */ }
<div className=\"stat-card\">
  < div className =\"stat-icon-wrapper products\">
    < FiPackage />
            </div >
  <div className=\"stat-info\">
    < p > Total Products</p >
      <h3>{stats.products}</h3>
            </div >
          </div >

  <div className=\"stat-card\">
    < div className =\"stat-icon-wrapper orders\">
      < FiShoppingCart />
            </div >
  <div className=\"stat-info\">
    < p > Total Orders</p >
      <h3>{stats.orders}</h3>
            </div >
          </div >

  <div className=\"stat-card\">
    < div className =\"stat-icon-wrapper revenue\">
      < FiCreditCard />
            </div >
  <div className=\"stat-info\">
    < p > Total Revenue</p >
      <h3>{pesoFormatter.format(stats.revenue)}</h3>
            </div >
          </div >
        </div >

  {/* Recent Orders */ }
  < div className =\"admin-section\">
    < div className =\"section-header\">
      < h2 > Recent Orders</h2 >
        <Link to=\"/admin/orders\" className=\"view-all-link\">View All</Link>
          </div >
  <div className=\"admin-table-container\">
    < table className =\"admin-table\">
      < thead >
      <tr>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Total</th>
        <th>Status</th>
      </tr>
              </thead >
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className=\"order-id-cell\">
                      # {(() => {
                        const d = new Date(order.createdAt);
                        const year = d.getFullYear();
                        const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
                        const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
                        return `${year}-${mmdd}-${hhmm}`;
                      })()}
                    </td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td className=\"total-cell\">{pesoFormatter.format(order.total)}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr >
                ))}
              </tbody >
            </table >
          </div >
        </div >
      </main >
    </div >
  );
};

export default Dashboard;
