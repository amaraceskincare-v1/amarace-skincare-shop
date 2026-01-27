import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { FiPackage, FiShoppingCart, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
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
  const [settings, setSettings] = useState({
    headerBackground: '',
    heroImage: '',
    fbSectionImage: '',
    footerHelpImage: '',
    gcashQRCode: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes, settingsRes] = await Promise.all([
          api.get('/products?limit=1'),
          api.get('/orders'),
          api.get('/settings')
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
        if (settingsRes.data) setSettings(settingsRes.data);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const handleUpdateImage = async (field, file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    if (field === 'heroImages') {
      for (let i = 0; i < file.length; i++) {
        formData.append('heroImages', file[i]);
      }
    } else {
      formData.append(field, file);
    }

    try {
      const { data } = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings(data);
      toast.success('Image updated successfully!');
    } catch (error) {
      toast.error('Failed to update image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (field) => {
    if (!window.confirm(`Are you sure you want to remove this ${field}?`)) return;
    setUploading(true);
    try {
      const { data } = await api.put('/settings', { [field]: 'remove' });
      setSettings(data);
      toast.success('Image removed successfully!');
    } catch (error) {
      toast.error('Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <h1>Dashboard Overview</h1>
        </div>

        {/* Quick Settings Section */}
        <div className="admin-section media-quick-settings">
          <div className="section-header">
            <h2>Quick Media Management</h2>
            <p>Update your site's main visuals instantly</p>
          </div>
          <div className="settings-grid-v2">
            {/* Hero Photos Card */}
            <div className="settings-card">
              <h4>Hero Photos Slider</h4>
              <div className="media-preview-mini">
                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', padding: '5px' }}>
                  {settings.heroImages && settings.heroImages.length > 0 ? (
                    settings.heroImages.map((img, i) => (
                      <img key={i} src={img} alt="" style={{ height: '60px', width: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                    ))
                  ) : (
                    <img src="/placeholder.jpg" alt="No Hero Images" />
                  )}
                </div>
              </div>
              <input
                type="file"
                id="hero-upload"
                multiple
                onChange={(e) => handleUpdateImage('heroImages', e.target.files)}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => document.getElementById('hero-upload').click()} className="upload-label-mini">
                  Upload Photos
                </button>
                <button onClick={() => handleRemoveImage('heroImages')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Clear All
                </button>
              </div>
            </div>

            {/* Facebook Section Image */}
            <div className="settings-card">
              <h4>Facebook Section Image</h4>
              <div className="media-preview-mini">
                <img src={settings.fbSectionImage || '/placeholder.jpg'} alt="Facebook" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div>
              <input
                type="file"
                id="fb-upload"
                onChange={(e) => handleUpdateImage('fbSectionImage', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => document.getElementById('fb-upload').click()} className="upload-label-mini">
                  Change Image
                </button>
                <button onClick={() => handleRemoveImage('fbSectionImage')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Remove
                </button>
              </div>
            </div>

            {/* Footer Help Image */}
            <div className="settings-card">
              <h4>Footer Help Image</h4>
              <div className="media-preview-mini">
                <img src={settings.footerHelpImage || '/placeholder.jpg'} alt="Footer Help" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div>
              <input
                type="file"
                id="footer-upload"
                onChange={(e) => handleUpdateImage('footerHelpImage', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => document.getElementById('footer-upload').click()} className="upload-label-mini">
                  Change Image
                </button>
                <button onClick={() => handleRemoveImage('footerHelpImage')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Remove
                </button>
              </div>
            </div>

            {/* Facebook Logo (Icon) */}
            <div className="settings-card">
              <h4>Facebook Icon (Footer)</h4>
              <div className="media-preview-mini" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={settings.facebookLogo || '/placeholder.jpg'} alt="FB Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              </div>
              <input
                type="file"
                id="fb-logo-upload"
                onChange={(e) => handleUpdateImage('facebookLogo', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => document.getElementById('fb-logo-upload').click()} className="upload-label-mini">
                  Change Icon
                </button>
                <button onClick={() => handleRemoveImage('facebookLogo')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Remove
                </button>
              </div>
            </div>

            {/* Payment Methods Logo */}
            <div className="settings-card">
              <h4>Payment Methods Logo</h4>
              <div className="media-preview-mini">
                <img src={settings.paymentLogo || '/placeholder.jpg'} alt="Payment Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
              </div>
              <input
                type="file"
                id="payment-logo-upload"
                onChange={(e) => handleUpdateImage('paymentLogo', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => document.getElementById('payment-logo-upload').click()} className="upload-label-mini">
                  Change Logo
                </button>
                <button onClick={() => handleRemoveImage('paymentLogo')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Remove
                </button>
              </div>
            </div>

            {/* GCash QR Code */}
            <div className="settings-card">
              <h4>GCash QR Code</h4>
              <div className="media-preview-mini">
                <img src={settings.gcashQRCode || '/placeholder.jpg'} alt="GCash QR" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
              </div>
              <input
                type="file"
                id="gcash-upload"
                onChange={(e) => handleUpdateImage('gcashQRCode', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => document.getElementById('gcash-upload').click()} className="upload-label-mini">
                  Change QR
                </button>
                <button onClick={() => handleRemoveImage('gcashQRCode')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {/* ... existing stats ... */}
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
      </main >
    </div >
  );
};

export default Dashboard;
