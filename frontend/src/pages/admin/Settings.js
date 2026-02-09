import { useState, useEffect } from 'react';
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

const AdminSettings = () => {
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
    const { settings, updateSettings } = useSettings();
    const [uploading, setUploading] = useState(false);
    const [statusOverlay, setStatusOverlay] = useState({ show: false, message: '' });

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
        return videoExtensions.some(ext => url.toLowerCase().includes(ext));
    };

    const getPreview = (url) => {
        if (!url) return 'https://via.placeholder.com/150?text=No+Media';
        if (isVideo(url)) return 'https://via.placeholder.com/150?text=VIDEO+CONTENT';
        return url;
    };

    return (
        <div className=\"admin-layout\">
            < AdminSidebar />

            {/* Main Content */ }
            < main className =\"admin-main\">
    {/* Loading/Success Overlays */ }
    {
        uploading && (
            <div className=\"admin-status-overlay\">
                < div className =\"loading-spinner-v2\"></div>
                    < p > Processing...</p >
          </div >
        )}

{
    statusOverlay.show && (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className=\"admin-success-overlay\"
                >
                <div className=\"success-box-transparent\">
    { statusOverlay.message }
            </div >
          </motion.div >
        )
}

<div className=\"admin-header\">
    < h1 > Dashboard, Overview & Settings</h1 >
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>Manage your store statistics, media, and configurations</p>
        </div >

    {/* Stats Overview */ }
    < div className =\"stats-grid\">
        < div className =\"stat-card\">
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

    {/* Quick Media Management Section */ }
    < div className =\"admin-section media-quick-settings\">
        < div className =\"section-header\">
            < h2 > Quick Media Management</h2 >
                <p>Update your site's main visuals instantly</p>
          </div >
    <div className=\"settings-grid-v2\">
{/* Navbar Logo */ }
<div className=\"settings-card\" style={{ minHeight: '380px' }}>
    < h4 > Logo(Header)</h4 >
        <div className=\"media-preview-mini\" style={{ height: '140px' }}>
            < img src = { getPreview(settings.navbarLogo) } alt =\"Navbar Logo\" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
              </div >
    <input
        type=\"file\"
id =\"navbar-logo-upload\"
onChange = {(e) => handleUpdateImage('navbarLogo', e.target.files[0])}
style = {{ display: 'none' }}
              />
    < div style = {{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        <button onClick={() => document.getElementById('navbar-logo-upload').click()} className=\"btn-primary-solid\">
                  Change Logo
                </button >
    <button onClick={() => handleRemoveImage('navbarLogo')} className=\"btn-danger\">
Remove
                </button >
              </div >
            </div >

    {/* Hero Photos/Videos Card */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Hero Slider(Max 5)</h4 >
              <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>{settings.heroImages?.length || 0} / 5 loaded</p>
              <div className=\"media-preview-mini\" style={{ height: '140px' }}>
    < div style = {{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px', height: '100%' }}>
    {
        settings.heroImages && settings.heroImages.length > 0 ? (
            settings.heroImages.map((img, i) => (
                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                    {isVideo(img) ? (
                        <div style={{ height: '100px', width: '100px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', borderRadius: '4px' }}>VIDEO</div>
                    ) : (
                        <img src={img} alt=\"\" style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                        )}
                    <button
                        onClick={async () => {
                            if (!window.confirm('Remove this media?')) return;
                            const newHero = settings.heroImages.filter((_, idx) => idx !== i);
                            setUploading(true);
                            try {
                                const { data } = await api.put('/settings', { heroImages: newHero });
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
            <img src=\"https://via.placeholder.com/100?text=None\" alt=\"No Media\" />
                  )
    }
                </div >
              </div >
    <input
        type=\"file\"
id =\"hero-upload\"
multiple
accept =\"image/*,video/*\"
onChange = {(e) => {
    const files = Array.from(e.target.files);
    const currentCount = settings.heroImages?.length || 0;
    if (currentCount + files.length > 5) {
        toast.warning('Max 5 hero items allowed. Truncating.');
        handleUpdateImage('heroImages', files.slice(0, 5 - currentCount));
    } else {
        handleUpdateImage('heroImages', files);
    }
}}
style = {{ display: 'none' }}
disabled = { settings.heroImages?.length >= 5 }
    />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => document.getElementById('hero-upload').click()}
                  className=\"btn-primary-solid\"
                  disabled={settings.heroImages?.length >= 5}
                >
                  Add Media
                </button>
                <button onClick={() => handleRemoveImage('heroImages')} className=\"btn-danger\">
                  Clear All
                </button >
              </div >
            </div >

    {/* Category: Lip Tints */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Lip Tints Image</h4 >
            <div className=\"media-preview-mini\" style={{ height: '140px' }}>
                < img src = { getPreview(settings.lipTintImage) } alt =\"Lip Tints\" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div >
    <input type=\"file\" id=\"lip-tint-upload\" onChange={(e) => handleUpdateImage('lipTintImage', e.target.files[0])} style={{ display: 'none' }} />
        < div style = {{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button onClick={() => document.getElementById('lip-tint-upload').click()} className=\"upload-label-mini\">Change</button>
                < button onClick = {() => handleRemoveImage('lipTintImage')} className =\"upload-label-mini\" style={{ background: '#ef4444' }}>Remove</button>
              </div >
            </div >

    {/* Category: Perfumes */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Fragrances Image</h4 >
            <div className=\"media-preview-mini\" style={{ height: '140px' }}>
                < img src = { getPreview(settings.perfumeImage) } alt =\"Fragrances\" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div >
    <input type=\"file\" id=\"fragrances-upload\" onChange={(e) => handleUpdateImage('perfumeImage', e.target.files[0])} style={{ display: 'none' }} />
        < div style = {{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button onClick={() => document.getElementById('fragrances-upload').click()} className=\"btn-primary-solid\">Change</button>
                < button onClick = {() => handleRemoveImage('perfumeImage')} className =\"btn-danger\">Remove</button>
              </div >
            </div >

    {/* Category: Beauty Soaps */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Artisan Soaps Image</h4 >
            <div className=\"media-preview-mini\" style={{ height: '140px' }}>
                < img src = { getPreview(settings.beautySoapImage) } alt =\"Artisan Soaps\" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div >
    <input type=\"file\" id=\"artisan-soap-upload\" onChange={(e) => handleUpdateImage('beautySoapImage', e.target.files[0])} style={{ display: 'none' }} />
        < div style = {{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button onClick={() => document.getElementById('artisan-soap-upload').click()} className=\"btn-primary-solid\">Change</button>
                < button onClick = {() => handleRemoveImage('beautySoapImage')} className =\"btn-danger\">Remove</button>
              </div >
            </div >

    {/* Category: All Best Sellers */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Best Sellers Image</h4 >
            <div className=\"media-preview-mini\" style={{ height: '140px' }}>
                < img src = { getPreview(settings.allBestSellersImage) } alt =\"Best Sellers\" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div >
    <input type=\"file\" id=\"all-bestsellers-upload\" onChange={(e) => handleUpdateImage('allBestSellersImage', e.target.files[0])} style={{ display: 'none' }} />
        < div style = {{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button onClick={() => document.getElementById('all-bestsellers-upload').click()} className=\"btn-primary-solid\">Change</button>
                < button onClick = {() => handleRemoveImage('allBestSellersImage')} className =\"btn-danger\">Remove</button>
              </div >
            </div >

    {/* Facebook Link Icon */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Facebook Link Icon(Footer)</h4 >
            <div className=\"media-preview-mini\" style={{ height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                < img src = { getPreview(settings.footerSmallIcon) } alt =\"Facebook Icon\" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              </div >
    <input
        type=\"file\"
id =\"footer-icon-upload\"
onChange = {(e) => handleUpdateImage('footerSmallIcon', e.target.files[0])}
style = {{ display: 'none' }}
              />
    < div style = {{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <button onClick={() => document.getElementById('footer-icon-upload').click()} className=\"btn-primary-solid\">
                  Change Icon
                </button >
    <button onClick={() => handleRemoveImage('footerSmallIcon')} className=\"btn-danger\">
Remove
                </button >
              </div >
            </div >

    {/* Payment Methods Logo */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Payment Methods(Max 3)</h4 >
              <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>{settings.paymentLogos?.length || 0} / 3 loaded</p>
              <div className=\"media-preview-mini\" style={{ height: '140px' }}>
    < div style = {{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px', height: '100%' }}>
    {
        settings.paymentLogos && settings.paymentLogos.length > 0 ? (
            settings.paymentLogos.map((img, i) => (
                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={img} alt=\"\" style={{ height: '100px', width: '100px', objectFit: 'contain', background: '#f9f9f9', borderRadius: '4px' }} />
                    <button
                        onClick={async () => {
                            if (!window.confirm('Remove this payment logo?')) return;
                            const newLogos = settings.paymentLogos.filter((_, idx) => idx !== i);
                            setUploading(true);
                            try {
                                const { data } = await api.put('/settings', { paymentLogos: newLogos });
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
            <img src=\"https://via.placeholder.com/100?text=None\" alt=\"No Media\" />
                  )
    }
                </div >
              </div >
    <input
        type=\"file\"
id =\"payment-logo-upload\"
multiple
onChange = {(e) => {
    const files = Array.from(e.target.files);
    const currentCount = settings.paymentLogos?.length || 0;
    if (currentCount + files.length > 3) {
        toast.warning('Max 3 payment logos allowed. Truncating.');
        handleUpdateImage('paymentLogos', files.slice(0, 3 - currentCount));
    } else {
        handleUpdateImage('paymentLogos', files);
    }
}}
style = {{ display: 'none' }}
disabled = { settings.paymentLogos?.length >= 3 }
    />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => document.getElementById('payment-logo-upload').click()}
                  className=\"upload-label-mini\"
                  disabled={settings.paymentLogos?.length >= 3}
                  style={settings.paymentLogos?.length >= 3 ? { opacity: 0.5, cursor: 'not-allowed' } : { background: '#2563eb', opacity: 1 }}
                >
                  Add Logos
                </button>
                <button onClick={() => handleRemoveImage('paymentLogos')} className=\"upload-label-mini\" style={{ background: '#ef4444', opacity: 1 }}>
                  Clear All
                </button >
              </div >
            </div >

    {/* Our Story Image */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Our Story Image</h4 >
            <div className=\"media-preview-mini\" style={{ height: '140px' }}>
                < img src = { getPreview(settings.ourStoryImage) } alt =\"Our Story\" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div >
    <input
        type=\"file\"
id =\"our-story-upload\"
onChange = {(e) => handleUpdateImage('ourStoryImage', e.target.files[0])}
style = {{ display: 'none' }}
              />
    < div style = {{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <button onClick={() => document.getElementById('our-story-upload').click()} className=\"upload-label-mini\" style={{ background: '#2563eb', opacity: 1 }}>
Change
                </button >
    <button onClick={() => handleRemoveImage('ourStoryImage')} className=\"upload-label-mini\" style={{ background: '#ef4444', opacity: 1 }}>
Remove
                </button >
              </div >
            </div >

    {/* Meet Our Team (Max 3) */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Meet Our Team(Max 3)</h4 >
              <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>{settings.teamImages?.length || 0} / 3 loaded</p>
              <div className=\"media-preview-mini\" style={{ height: '140px' }}>
    < div style = {{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px', height: '100%' }}>
    {
        settings.teamImages && settings.teamImages.length > 0 ? (
            settings.teamImages.map((img, i) => (
                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={img} alt=\"\" style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                    <button
                        onClick={async () => {
                            if (!window.confirm('Remove this team member image?')) return;
                            const newTeam = settings.teamImages.filter((_, idx) => idx !== i);
                            setUploading(true);
                            try {
                                const { data } = await api.put('/settings', { teamImages: newTeam });
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
            <img src=\"https://via.placeholder.com/100?text=None\" alt=\"No Team\" />
                  )
    }
                </div >
              </div >
    <input
        type=\"file\"
id =\"team-upload\"
multiple
onChange = {(e) => {
    const files = Array.from(e.target.files);
    const currentCount = settings.teamImages?.length || 0;
    if (currentCount + files.length > 3) {
        toast.warning('Max 3 team images allowed. Truncating.');
        handleUpdateImage('teamImages', files.slice(0, 3 - currentCount));
    } else {
        handleUpdateImage('teamImages', files);
    }
}}
style = {{ display: 'none' }}
disabled = { settings.teamImages?.length >= 3 }
    />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => document.getElementById('team-upload').click()}
                  className=\"upload-label-mini\"
                  disabled={settings.teamImages?.length >= 3}
                  style={settings.teamImages?.length >= 3 ? { opacity: 0.5, cursor: 'not-allowed' } : { background: '#2563eb', opacity: 1 }}
                >
                  Add Team Images
                </button>
                <button onClick={() => handleRemoveImage('teamImages')} className=\"upload-label-mini\" style={{ background: '#ef4444', opacity: 1 }}>
                  Clear All
                </button >
              </div >
            </div >

    {/* Follow Our Journey Gallery (Max 6) */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Follow Our Journey Gallery(Max 6)</h4 >
              <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>{settings.galleryImages?.length || 0} / 6 loaded</p>
              <div className=\"media-preview-mini\" style={{ height: '140px' }}>
    < div style = {{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px', height: '100%' }}>
    {
        settings.galleryImages && settings.galleryImages.length > 0 ? (
            settings.galleryImages.map((img, i) => (
                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={img} alt=\"\" style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                    <button
                        onClick={async () => {
                            if (!window.confirm('Remove this gallery image?')) return;
                            const newGallery = settings.galleryImages.filter((_, idx) => idx !== i);
                            setUploading(true);
                            try {
                                const { data } = await api.put('/settings', { galleryImages: newGallery });
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
            <img src=\"https://via.placeholder.com/100?text=None\" alt=\"No Gallery\" />
                  )
    }
                </div >
              </div >
    <input
        type=\"file\"
id =\"gallery-upload\"
multiple
accept =\"image/*\"
onChange = {(e) => {
    const files = Array.from(e.target.files);
    const currentCount = settings.galleryImages?.length || 0;
    if (currentCount + files.length > 6) {
        toast.warning('Max 6 gallery images allowed. Truncating.');
        handleUpdateImage('galleryImages', files.slice(0, 6 - currentCount));
    } else {
        handleUpdateImage('galleryImages', files);
    }
}}
style = {{ display: 'none' }}
disabled = { settings.galleryImages?.length >= 6 }
    />
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => document.getElementById('gallery-upload').click()}
                  className=\"upload-label-mini\"
                  disabled={settings.galleryImages?.length >= 6}
                  style={settings.galleryImages?.length >= 6 ? { opacity: 0.5, cursor: 'not-allowed' } : { background: '#2563eb', opacity: 1 }}
                >
                  Add Images
                </button>
                <button onClick={() => handleRemoveImage('galleryImages')} className=\"upload-label-mini\" style={{ background: '#ef4444', opacity: 1 }}>
                  Clear All
                </button >
              </div >
            </div >

    {/* GCash QR Code */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > GCash QR Code</h4 >
            <div className=\"media-preview-mini\" style={{ height: '140px' }}>
                < img src = { getPreview(settings.gcashQRCode) } alt =\"GCash QR\" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
              </div >
    <input
        type=\"file\"
id =\"gcash-upload\"
onChange = {(e) => handleUpdateImage('gcashQRCode', e.target.files[0])}
style = {{ display: 'none' }}
              />
    < div style = {{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <button onClick={() => document.getElementById('gcash-upload').click()} className=\"upload-label-mini\">
                  Change QR
                </button >
    <button onClick={() => handleRemoveImage('gcashQRCode')} className=\"upload-label-mini\" style={{ background: '#ef4444' }}>
Remove
                </button >
              </div >
            </div >

    {/* Product Page Hero Media */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Shop Page Hero Banner</h4 >
            <div className=\"media-preview-mini\" style={{ height: '140px' }}>
{
    isVideo(settings.productHeroMedia) ? (
        <div className=\"video-placeholder-mini\">VIDEO</div>
                ) : (
        <img src={getPreview(settings.productHeroMedia)} alt=\"Product Hero\" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                )
}
              </div >
    <input
        type=\"file\"
id =\"product-hero-upload\"
accept =\"image/*,video/*\"
onChange = {(e) => handleUpdateImage('productHeroMedia', e.target.files[0])}
style = {{ display: 'none' }}
              />
    < div style = {{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <button onClick={() => document.getElementById('product-hero-upload').click()} className=\"upload-label-mini\" style={{ background: '#2563eb', opacity: 1 }}>
                  Change Media
                </button >
    <button onClick={() => handleRemoveImage('productHeroMedia')} className=\"upload-label-mini\" style={{ background: '#ef4444', opacity: 1 }}>
Remove
                </button >
              </div >
            </div >

    {/* Premium Banner Media */ }
    < div className =\"settings-card\" style={{ minHeight: '280px' }}>
        < h4 > Home Page Hero Banner</h4 >
            <div className=\"media-preview-mini\" style={{ height: '140px' }}>
{
    isVideo(settings.premiumBannerMedia) ? (
        <div className=\"video-placeholder-mini\">VIDEO</div>
                ) : (
        <img src={getPreview(settings.premiumBannerMedia)} alt=\"Premium Banner\" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                )
}
              </div >
    <input
        type=\"file\"
id =\"premium-banner-upload\"
accept =\"image/*,video/*\"
onChange = {(e) => handleUpdateImage('premiumBannerMedia', e.target.files[0])}
style = {{ display: 'none' }}
              />
    < div style = {{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <button onClick={() => document.getElementById('premium-banner-upload').click()} className=\"upload-label-mini\" style={{ background: '#2563eb', opacity: 1 }}>
                  Change Media
                </button >
    <button onClick={() => handleRemoveImage('premiumBannerMedia')} className=\"upload-label-mini\" style={{ background: '#ef4444', opacity: 1 }}>
Remove
                </button >
              </div >
            </div >
          </div >
        </div >
      </main >
    </div >
  );
};

export default AdminSettings;
