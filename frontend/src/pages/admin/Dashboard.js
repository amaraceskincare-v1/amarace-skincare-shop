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
    navbarLogo: '',
    heroImages: [],
    gcashQRCode: '',
    paymentLogos: [],
    footerSmallIcon: '',
    lipTintImage: '',
    perfumeImage: '',
    beautySoapImage: '',
    allBestSellersImage: '',
    ourStoryImage: '',
    teamImages: []
  });
  const [uploading, setUploading] = useState(false);
  const [statusOverlay, setStatusOverlay] = useState({ show: false, message: '' });

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
    if (field === 'heroImages' || field === 'paymentLogos') {
      for (let i = 0; i < file.length; i++) {
        formData.append(field, file[i]);
      }
    } else {
      formData.append(field, file);
    }

    try {
      const { data } = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings(data);
      setUploading(false);
      setStatusOverlay({ show: true, message: 'UPLOADED SUCCESSFUL' });
      setTimeout(() => setStatusOverlay({ show: false, message: '' }), 3000);
    } catch (error) {
      setUploading(false);
      toast.error('Failed to upload');
    }
  };

  const handleRemoveImage = async (field) => {
    if (!window.confirm(`Are you sure you want to remove this ${field}?`)) return;
    setUploading(true);
    try {
      const { data } = await api.put('/settings', { [field]: 'remove' });
      setSettings(data);
      setUploading(false);
      setStatusOverlay({ show: true, message: 'REMOVED SUCCESSFUL' });
      setTimeout(() => setStatusOverlay({ show: false, message: '' }), 3000);
    } catch (error) {
      setUploading(false);
      toast.error('Failed to remove');
    }
  };

  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const getPreview = (url) => {
    if (!url) return 'https://via.placeholder.com/150?text=No+Media';
    if (isVideo(url)) return 'https://via.placeholder.com/150?text=VIDEO+CONTENT';
    return url;
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      {/* Main Content */}
      <main className="admin-main">
        {/* Loading/Success Overlays */}
        {uploading && (
          <div className="admin-status-overlay">
            <div className="loading-spinner-v2"></div>
            <p>Processing...</p>
          </div>
        )}

        {statusOverlay.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="admin-success-overlay"
          >
            <div className="success-box-transparent">
              {statusOverlay.message}
            </div>
          </motion.div>
        )}

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
            {/* Navbar Logo */}
            <div className="settings-card" style={{ minHeight: '380px' }}>
              <h4>Logo (Header)</h4>
              <div className="media-preview-mini" style={{ height: '140px' }}>
                <img src={getPreview(settings.navbarLogo)} alt="Navbar Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
              </div>
              <input
                type="file"
                id="navbar-logo-upload"
                onChange={(e) => handleUpdateImage('navbarLogo', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                <button onClick={() => document.getElementById('navbar-logo-upload').click()} className="upload-label-mini">
                  Change Logo
                </button>
                <button onClick={() => handleRemoveImage('navbarLogo')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Remove
                </button>
              </div>

              {/* Brand Name Input */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Brand Name</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    id="brand-name-input"
                    placeholder="Enter Brand Name"
                    defaultValue={settings.brandName || ''}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button
                    onClick={async () => {
                      const val = document.getElementById('brand-name-input').value;
                      setUploading(true);
                      try {
                        const { data } = await api.put('/settings', { brandName: val });
                        setSettings(data);
                        setUploading(false);
                        setStatusOverlay({ show: true, message: 'BRAND UPDATED' });
                        setTimeout(() => setStatusOverlay({ show: false, message: '' }), 3000);
                      } catch (err) {
                        setUploading(false);
                        toast.error('Failed to update brand');
                      }
                    }}
                    style={{
                      padding: '8px 15px',
                      background: '#7c4dff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}
                  >
                    Update
                  </button>
                </div>
                <p style={{ fontSize: '0.65rem', color: '#888', marginTop: '5px' }}>This text appears next to your header logo.</p>
              </div>
            </div>

            {/* Hero Photos/Videos Card */}
            <div className="settings-card" style={{ minHeight: '280px' }}>
              <h4>Hero Slider (Max 5)</h4>
              <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>{settings.heroImages?.length || 0} / 5 loaded</p>
              <div className="media-preview-mini" style={{ height: '140px' }}>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px', height: '100%' }}>
                  {settings.heroImages && settings.heroImages.length > 0 ? (
                    settings.heroImages.map((img, i) => (
                      <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                        {isVideo(img) ? (
                          <div style={{ height: '100px', width: '100px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', borderRadius: '4px' }}>VIDEO</div>
                        ) : (
                          <img src={img} alt="" style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                        )}
                        <button
                          onClick={async () => {
                            if (!window.confirm('Remove this media?')) return;
                            const newHero = settings.heroImages.filter((_, idx) => idx !== i);
                            setUploading(true);
                            try {
                              const { data } = await api.put('/settings', { heroImages: newHero });
                              setSettings(data);
                              setUploading(false);
                            } catch (error) {
                              setUploading(false);
                              toast.error('Failed to remove');
                            }
                          }}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <img src="https://via.placeholder.com/100?text=None" alt="No Media" />
                  )}
                </div>
              </div>
              <input
                type="file"
                id="hero-upload"
                multiple
                accept="image/*,video/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const currentCount = settings.heroImages?.length || 0;
                  if (currentCount + files.length > 5) {
                    toast.warning('Max 5 hero items allowed. Truncating.');
                    handleUpdateImage('heroImages', files.slice(0, 5 - currentCount));
                  } else {
                    handleUpdateImage('heroImages', files);
                  }
                }}
                style={{ display: 'none' }}
                disabled={settings.heroImages?.length >= 5}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => document.getElementById('hero-upload').click()}
                  className="upload-label-mini"
                  disabled={settings.heroImages?.length >= 5}
                  style={settings.heroImages?.length >= 5 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  Add Media
                </button>
                <button onClick={() => handleRemoveImage('heroImages')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Clear All
                </button>
              </div>
            </div>

            {/* Category: Lip Tints */}
            <div className="settings-card" style={{ minHeight: '280px' }}>
              <h4>Lip Tints Image</h4>
              <div className="media-preview-mini" style={{ height: '140px' }}>
                <img src={getPreview(settings.lipTintImage)} alt="Lip Tints" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div>
              <input type="file" id="lip-tint-upload" onChange={(e) => handleUpdateImage('lipTintImage', e.target.files[0])} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button onClick={() => document.getElementById('lip-tint-upload').click()} className="upload-label-mini">Change</button>
                <button onClick={() => handleRemoveImage('lipTintImage')} className="upload-label-mini" style={{ background: '#ef4444' }}>Remove</button>
              </div>
            </div>

            {/* Category: Perfumes */}
            <div className="settings-card" style={{ minHeight: '280px' }}>
              <h4>Perfumes Image</h4>
              <div className="media-preview-mini" style={{ height: '140px' }}>
                <img src={getPreview(settings.perfumeImage)} alt="Perfumes" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div>
              <input type="file" id="perfume-upload" onChange={(e) => handleUpdateImage('perfumeImage', e.target.files[0])} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button onClick={() => document.getElementById('perfume-upload').click()} className="upload-label-mini">Change</button>
                <button onClick={() => handleRemoveImage('perfumeImage')} className="upload-label-mini" style={{ background: '#ef4444' }}>Remove</button>
              </div>
            </div>

            {/* Category: Beauty Soaps */}
            <div className="settings-card" style={{ minHeight: '280px' }}>
              <h4>Beauty Soaps Image</h4>
              <div className="media-preview-mini" style={{ height: '140px' }}>
                <img src={getPreview(settings.beautySoapImage)} alt="Beauty Soaps" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div>
              <input type="file" id="soap-upload" onChange={(e) => handleUpdateImage('beautySoapImage', e.target.files[0])} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button onClick={() => document.getElementById('soap-upload').click()} className="upload-label-mini">Change</button>
                <button onClick={() => handleRemoveImage('beautySoapImage')} className="upload-label-mini" style={{ background: '#ef4444' }}>Remove</button>
              </div>
            </div>

            {/* Category: All Best Sellers */}
            <div className="settings-card" style={{ minHeight: '280px' }}>
              <h4>Best Sellers Image</h4>
              <div className="media-preview-mini" style={{ height: '140px' }}>
                <img src={getPreview(settings.allBestSellersImage)} alt="Best Sellers" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div>
              <input type="file" id="all-bestsellers-upload" onChange={(e) => handleUpdateImage('allBestSellersImage', e.target.files[0])} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button onClick={() => document.getElementById('all-bestsellers-upload').click()} className="upload-label-mini">Change</button>
                <button onClick={() => handleRemoveImage('allBestSellersImage')} className="upload-label-mini" style={{ background: '#ef4444' }}>Remove</button>
              </div>
            </div>

            {/* Facebook Link Icon */}
            <div className="settings-card" style={{ minHeight: '280px' }}>
              <h4>Facebook Link Icon (Footer)</h4>
              <div className="media-preview-mini" style={{ height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={getPreview(settings.footerSmallIcon)} alt="Facebook Icon" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              </div>
              <input
                type="file"
                id="footer-icon-upload"
                onChange={(e) => handleUpdateImage('footerSmallIcon', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button onClick={() => document.getElementById('footer-icon-upload').click()} className="upload-label-mini">
                  Change Icon
                </button>
                <button onClick={() => handleRemoveImage('footerSmallIcon')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Remove
                </button>
              </div>
            </div>

            {/* Payment Methods Logo */}
            <div className="settings-card" style={{ minHeight: '280px' }}>
              <h4>Payment Methods (Max 3)</h4>
              <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>{settings.paymentLogos?.length || 0} / 3 loaded</p>
              <div className="media-preview-mini" style={{ height: '140px' }}>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px', height: '100%' }}>
                  {settings.paymentLogos && settings.paymentLogos.length > 0 ? (
                    settings.paymentLogos.map((img, i) => (
                      <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={img} alt="" style={{ height: '100px', width: '100px', objectFit: 'contain', background: '#f9f9f9', borderRadius: '4px' }} />
                        <button
                          onClick={async () => {
                            if (!window.confirm('Remove this payment logo?')) return;
                            const newLogos = settings.paymentLogos.filter((_, idx) => idx !== i);
                            setUploading(true);
                            try {
                              const { data } = await api.put('/settings', { paymentLogos: newLogos });
                              setSettings(data);
                              setUploading(false);
                            } catch (error) {
                              setUploading(false);
                              toast.error('Failed to remove');
                            }
                          }}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <img src="https://via.placeholder.com/100?text=None" alt="No Media" />
                  )}
                </div>
              </div>
              <input
                type="file"
                id="payment-logo-upload"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const currentCount = settings.paymentLogos?.length || 0;
                  if (currentCount + files.length > 3) {
                    toast.warning('Max 3 payment logos allowed. Truncating.');
                    handleUpdateImage('paymentLogos', files.slice(0, 3 - currentCount));
                  } else {
                    handleUpdateImage('paymentLogos', files);
                  }
                }}
                style={{ display: 'none' }}
                disabled={settings.paymentLogos?.length >= 3}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => document.getElementById('payment-logo-upload').click()}
                  className="upload-label-mini"
                  disabled={settings.paymentLogos?.length >= 3}
                  style={settings.paymentLogos?.length >= 3 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  Add Logos
                </button>
                <button onClick={() => handleRemoveImage('paymentLogos')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Clear All
                </button>
              </div>
            </div>

            {/* Our Story Image */}
            <div className="settings-card" style={{ minHeight: '280px' }}>
              <h4>Our Story Image</h4>
              <div className="media-preview-mini" style={{ height: '140px' }}>
                <img src={getPreview(settings.ourStoryImage)} alt="Our Story" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div>
              <input
                type="file"
                id="our-story-upload"
                onChange={(e) => handleUpdateImage('ourStoryImage', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button onClick={() => document.getElementById('our-story-upload').click()} className="upload-label-mini">
                  Change
                </button>
                <button onClick={() => handleRemoveImage('ourStoryImage')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Remove
                </button>
              </div>
            </div>

            {/* Meet Our Team (Max 3) */}
            <div className="settings-card" style={{ minHeight: '280px' }}>
              <h4>Meet Our Team (Max 3)</h4>
              <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>{settings.teamImages?.length || 0} / 3 loaded</p>
              <div className="media-preview-mini" style={{ height: '140px' }}>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px', height: '100%' }}>
                  {settings.teamImages && settings.teamImages.length > 0 ? (
                    settings.teamImages.map((img, i) => (
                      <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={img} alt="" style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                        <button
                          onClick={async () => {
                            if (!window.confirm('Remove this team member image?')) return;
                            const newTeam = settings.teamImages.filter((_, idx) => idx !== i);
                            setUploading(true);
                            try {
                              const { data } = await api.put('/settings', { teamImages: newTeam });
                              setSettings(data);
                              setUploading(false);
                            } catch (error) {
                              setUploading(false);
                              toast.error('Failed to remove');
                            }
                          }}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <img src="https://via.placeholder.com/100?text=None" alt="No Team" />
                  )}
                </div>
              </div>
              <input
                type="file"
                id="team-upload"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const currentCount = settings.teamImages?.length || 0;
                  if (currentCount + files.length > 3) {
                    toast.warning('Max 3 team images allowed. Truncating.');
                    handleUpdateImage('teamImages', files.slice(0, 3 - currentCount));
                  } else {
                    handleUpdateImage('teamImages', files);
                  }
                }}
                style={{ display: 'none' }}
                disabled={settings.teamImages?.length >= 3}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => document.getElementById('team-upload').click()}
                  className="upload-label-mini"
                  disabled={settings.teamImages?.length >= 3}
                  style={settings.teamImages?.length >= 3 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  Add Team Images
                </button>
                <button onClick={() => handleRemoveImage('teamImages')} className="upload-label-mini" style={{ background: '#ef4444' }}>
                  Clear All
                </button>
              </div>
            </div>

            {/* GCash QR Code */}
            <div className="settings-card" style={{ minHeight: '280px' }}>
              <h4>GCash QR Code</h4>
              <div className="media-preview-mini" style={{ height: '140px' }}>
                <img src={getPreview(settings.gcashQRCode)} alt="GCash QR" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
              </div>
              <input
                type="file"
                id="gcash-upload"
                onChange={(e) => handleUpdateImage('gcashQRCode', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
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
