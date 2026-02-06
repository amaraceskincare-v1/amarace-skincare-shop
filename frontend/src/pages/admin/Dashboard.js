import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { FiPackage, FiShoppingCart, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
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
  const { settings, updateSettings } = useSettings();
  const [uploading, setUploading] = useState(false);
  const [statusOverlay, setStatusOverlay] = useState({ show: false, message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;

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

  const handleUpdateImage = async (field, file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    // Handle array uploads for multiple image fields
    if (field === 'heroImages' || field === 'paymentLogos' || field === 'teamImages' || field === 'galleryImages') {
      if (file.length) {
        for (let i = 0; i < file.length; i++) {
          formData.append(field, file[i]);
        }
      } else {
        formData.append(field, file);
      }
    } else {
      formData.append(field, file);
    }

    try {
      const { data } = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateSettings(data);
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
      updateSettings(data);
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
    return videoExtensions.some(ext => typeof url === 'string' && url.toLowerCase().includes(ext));
  };

  const getPreview = (url) => {
    if (!url) return 'https://via.placeholder.com/150?text=No+Media';
    if (isVideo(url)) return 'https://via.placeholder.com/150?text=VIDEO+CONTENT';
    return url;
  };

  const mediaConfigs = [
    {
      id: 'navbarLogo',
      title: 'Logo (Header)',
      subtitle: 'Primary branding',
      preview: settings.navbarLogo,
      uploadId: 'navbar-logo-upload',
      actions: [
        { label: 'Change Logo', type: 'primary', onClick: () => document.getElementById('navbar-logo-upload').click() },
        { label: 'Remove', type: 'danger', onClick: () => handleRemoveImage('navbarLogo') }
      ]
    },
    {
      id: 'heroImages',
      title: 'Hero Slider (Max 5)',
      subtitle: `${settings.heroImages?.length || 0} / 5 items loaded`,
      preview: settings.heroImages?.[0],
      isMultiple: true,
      items: settings.heroImages || [],
      uploadId: 'hero-upload',
      multiple: true,
      accept: 'image/*,video/*',
      max: 5,
      actions: [
        { label: 'Add Media', type: 'primary', onClick: () => document.getElementById('hero-upload').click(), disabled: settings.heroImages?.length >= 5 },
        { label: 'Clear All', type: 'danger', onClick: () => handleRemoveImage('heroImages') }
      ]
    },
    {
      id: 'lipTintImage',
      title: 'Lip Tints Image',
      subtitle: 'Category banner',
      preview: settings.lipTintImage,
      uploadId: 'lip-tint-upload',
      actions: [
        { label: 'Change', type: 'primary', onClick: () => document.getElementById('lip-tint-upload').click() },
        { label: 'Remove', type: 'danger', onClick: () => handleRemoveImage('lipTintImage') }
      ]
    },
    {
      id: 'perfumeImage',
      title: 'Fragrances Image',
      subtitle: 'Category banner',
      preview: settings.perfumeImage,
      uploadId: 'fragrances-upload',
      actions: [
        { label: 'Change', type: 'primary', onClick: () => document.getElementById('fragrances-upload').click() },
        { label: 'Remove', type: 'danger', onClick: () => handleRemoveImage('perfumeImage') }
      ]
    },
    {
      id: 'beautySoapImage',
      title: 'Artisan Soaps Image',
      subtitle: 'Collection highlight',
      preview: settings.beautySoapImage,
      uploadId: 'artisan-soap-upload',
      actions: [
        { label: 'Change', type: 'primary', onClick: () => document.getElementById('artisan-soap-upload').click() },
        { label: 'Remove', type: 'danger', onClick: () => handleRemoveImage('beautySoapImage') }
      ]
    },
    {
      id: 'allBestSellersImage',
      title: 'Best Sellers Image',
      subtitle: 'Featured products',
      preview: settings.allBestSellersImage,
      uploadId: 'all-bestsellers-upload',
      actions: [
        { label: 'Change', type: 'primary', onClick: () => document.getElementById('all-bestsellers-upload').click() },
        { label: 'Remove', type: 'danger', onClick: () => handleRemoveImage('allBestSellersImage') }
      ]
    },
    {
      id: 'footerSmallIcon',
      title: 'Facebook Link Icon (Footer)',
      subtitle: 'Social promotion',
      preview: settings.footerSmallIcon,
      uploadId: 'footer-icon-upload',
      actions: [
        { label: 'Change Icon', type: 'primary', onClick: () => document.getElementById('footer-icon-upload').click() },
        { label: 'Remove', type: 'danger', onClick: () => handleRemoveImage('footerSmallIcon') }
      ]
    },
    {
      id: 'paymentLogos',
      title: 'Payment Methods (Max 3)',
      subtitle: `${settings.paymentLogos?.length || 0} / 3 loaded`,
      preview: settings.paymentLogos?.[0],
      isMultiple: true,
      items: settings.paymentLogos || [],
      uploadId: 'payment-logo-upload',
      multiple: true,
      max: 3,
      actions: [
        { label: 'Add Logos', type: 'primary', onClick: () => document.getElementById('payment-logo-upload').click(), disabled: settings.paymentLogos?.length >= 3 },
        { label: 'Clear All', type: 'danger', onClick: () => handleRemoveImage('paymentLogos') }
      ]
    },
    {
      id: 'ourStoryImage',
      title: 'Our Story Image',
      subtitle: 'About section',
      preview: settings.ourStoryImage,
      uploadId: 'our-story-upload',
      actions: [
        { label: 'Change', type: 'primary', onClick: () => document.getElementById('our-story-upload').click() },
        { label: 'Remove', type: 'danger', onClick: () => handleRemoveImage('ourStoryImage') }
      ]
    },
    {
      id: 'teamImages',
      title: 'Meet Our Team (Max 3)',
      subtitle: `${settings.teamImages?.length || 0} / 3 loaded`,
      preview: settings.teamImages?.[0],
      isMultiple: true,
      items: settings.teamImages || [],
      uploadId: 'team-upload',
      multiple: true,
      max: 3,
      actions: [
        { label: 'Add Team Images', type: 'primary', onClick: () => document.getElementById('team-upload').click(), disabled: settings.teamImages?.length >= 3 },
        { label: 'Clear All', type: 'danger', onClick: () => handleRemoveImage('teamImages') }
      ]
    },
    {
      id: 'galleryImages',
      title: 'Gallery Images (Max 6)',
      subtitle: `${settings.galleryImages?.length || 0} / 6 loaded`,
      preview: settings.galleryImages?.[0],
      isMultiple: true,
      items: settings.galleryImages || [],
      uploadId: 'gallery-upload',
      multiple: true,
      max: 6,
      accept: 'image/*',
      actions: [
        { label: 'Add Images', type: 'primary', onClick: () => document.getElementById('gallery-upload').click(), disabled: settings.galleryImages?.length >= 6 },
        { label: 'Clear All', type: 'danger', onClick: () => handleRemoveImage('galleryImages') }
      ]
    },
    {
      id: 'gcashQRCode',
      title: 'GCash QR Code',
      subtitle: 'Payment gateway',
      preview: settings.gcashQRCode,
      uploadId: 'gcash-upload',
      actions: [
        { label: 'Change QR', type: 'primary', onClick: () => document.getElementById('gcash-upload').click() },
        { label: 'Remove', type: 'danger', onClick: () => handleRemoveImage('gcashQRCode') }
      ]
    },
    {
      id: 'productHeroMedia',
      title: 'Shop Page Hero Banner',
      subtitle: 'Additional promotion',
      preview: settings.productHeroMedia,
      uploadId: 'product-hero-upload',
      accept: 'image/*,video/*',
      actions: [
        { label: 'Change Media', type: 'primary', onClick: () => document.getElementById('product-hero-upload').click() },
        { label: 'Remove', type: 'danger', onClick: () => handleRemoveImage('productHeroMedia') }
      ]
    },
    {
      id: 'premiumBannerMedia',
      title: 'Home Page Hero Banner',
      subtitle: 'Main landing banner',
      preview: settings.premiumBannerMedia,
      uploadId: 'premium-banner-upload',
      accept: 'image/*,video/*',
      actions: [
        { label: 'Change Hero', type: 'primary', onClick: () => document.getElementById('premium-banner-upload').click() },
        { label: 'Remove', type: 'danger', onClick: () => handleRemoveImage('premiumBannerMedia') }
      ]
    }
  ];

  const totalPages = Math.ceil(mediaConfigs.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = mediaConfigs.slice(indexOfFirstCard, indexOfLastCard);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.querySelector('.media-quick-settings')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
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
          <h1>Admin Command Center</h1>
          <p className="subtitle-premium">
            Configure your brand identity and monitor shop performance
          </p>
        </div>

        <div className="admin-section media-quick-settings" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
          <h2 className="section-title-premium">Quick Media Management</h2>

          <div className="settings-grid-v2">
            {currentCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="settings-card"
              >
                <div className="settings-card-header">
                  <div className="settings-card-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
                    {card.title}
                  </div>
                  <div className="settings-card-subtitle">{card.subtitle}</div>
                </div>

                <div className="media-preview-mini">
                  {card.isMultiple ? (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px', width: '100%', height: '100%', alignItems: 'center' }}>
                      {card.items.length > 0 ? (
                        card.items.map((img, i) => (
                          <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                            {isVideo(img) ? (
                              <div style={{ height: '100px', width: '100px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', borderRadius: '4px' }}>VIDEO</div>
                            ) : (
                              <img src={img} alt="" style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                            )}
                            <button
                              onClick={async () => {
                                if (!window.confirm('Remove this media?')) return;
                                const newItems = card.items.filter((_, idx) => idx !== i);
                                setUploading(true);
                                try {
                                  const { data } = await api.put('/settings', { [card.id]: newItems });
                                  updateSettings(data);
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
                        <div style={{ width: '100%', textAlign: 'center', color: '#ccc', fontStyle: 'italic' }}>No items</div>
                      )}
                    </div>
                  ) : (
                    isVideo(card.preview) ? (
                      <div className="video-placeholder-mini" style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>VIDEO</div>
                    ) : (
                      <img src={getPreview(card.preview)} alt={card.title} style={{ width: '100%', height: '100%', objectFit: card.id === 'navbarLogo' || card.id === 'gcashQRCode' ? 'contain' : 'cover' }} />
                    )
                  )}
                </div>

                <input
                  type="file"
                  id={card.uploadId}
                  multiple={card.multiple}
                  accept={card.accept || 'image/*'}
                  onChange={(e) => {
                    const files = card.multiple ? Array.from(e.target.files) : e.target.files[0];
                    if (card.multiple) {
                      const currentCount = card.items?.length || 0;
                      if (currentCount + files.length > card.max) {
                        toast.warning(`Max ${card.max} items allowed. Truncating.`);
                        handleUpdateImage(card.id, files.slice(0, card.max - currentCount));
                      } else {
                        handleUpdateImage(card.id, files);
                      }
                    } else {
                      handleUpdateImage(card.id, files);
                    }
                  }}
                  style={{ display: 'none' }}
                />

                <div className="media-actions-premium">
                  {card.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className={`btn-premium btn-premium-${action.type}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pagination-container-premium">
            <button
              className="pagination-btn-premium"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>

            <div className="page-numbers-premium">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  className={`page-number-premium ${currentPage === number ? 'active' : ''}`}
                  onClick={() => changePage(number)}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              className="pagination-btn-premium"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>

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
        </div>

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
