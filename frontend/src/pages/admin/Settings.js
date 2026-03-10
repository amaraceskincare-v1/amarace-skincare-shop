import { useState, useEffect } from 'react';
import { FiSave, FiUpload, FiTrash2, FiImage, FiLayout, FiShoppingBag, FiCreditCard, FiGrid, FiUsers, FiCamera } from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useSettings } from '../../context/SettingsContext';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/Admin.css';
import '../../styles/AdminSettings.css';

const AdminSettings = () => {
    const { refreshSettings } = useSettings();
    const [settings, setSettings] = useState({
        logo: '', navbarLogo: '', sideAd: '', headerBackground: '',
        heroImages: [], gcashQRCode: '', footerSmallIcon: '',
        lipTintImage: '', perfumeImage: '', beautySoapImage: '',
        allBestSellersImage: '', ourStoryImage: '', productHeroMedia: '',
        premiumBannerMedia: '', teamImages: [], galleryImages: [],
        brandName: '', showBrandName: true, brandNamePosition: 'right',
        brandNameColor: '#2D2D2D', brandNameFontSize: 'medium',
        brandNameFontWeight: 'bold', headerLogoSize: 60
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [files, setFiles] = useState({});
    const [activeTab, setActiveTab] = useState('branding');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings({ ...settings, ...data, heroImages: data.heroImages || [], teamImages: data.teamImages || [], galleryImages: data.galleryImages || [] });
            } catch (error) {
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleFileChange = (e, field, multiple = false) => {
        if (multiple) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prev => ({ ...prev, [field]: selectedFiles }));
            toast.info(`${selectedFiles.length} file(s) selected for ${field}`);
        } else {
            const file = e.target.files[0];
            if (file) {
                setFiles(prev => ({ ...prev, [field]: file }));
                const reader = new FileReader();
                reader.onloadend = () => setSettings(prev => ({ ...prev, [field]: reader.result }));
                reader.readAsDataURL(file);
            }
        }
    };

    const handleRemoveField = (field) => {
        setSettings(prev => ({ ...prev, [field]: '' }));
        setFiles(prev => { const next = { ...prev }; delete next[field]; return next; });
    };

    const handleRemoveArrayItem = (field, index) => {
        setSettings(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };

    const handleSave = async () => {
        setSaving(true);
        const formData = new FormData();

        // Append files
        Object.entries(files).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(file => formData.append(key, file));
            } else {
                formData.append(key, value);
            }
        });

        // Append text fields
        const textFields = ['brandName', 'showBrandName', 'brandNamePosition', 'brandNameColor', 'brandNameFontSize', 'brandNameFontWeight', 'headerLogoSize'];
        textFields.forEach(field => {
            if (settings[field] !== undefined) formData.append(field, settings[field]);
        });

        // Send removed array fields
        ['heroImages', 'teamImages', 'galleryImages'].forEach(field => {
            if (settings[field].length === 0) formData.append(field, 'remove');
        });

        try {
            const { data } = await api.put('/settings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSettings({ ...data, heroImages: data.heroImages || [], teamImages: data.teamImages || [], galleryImages: data.galleryImages || [] });
            setFiles({});
            await refreshSettings();
            toast.success('Settings saved successfully! ✨');
        } catch (error) {
            console.error('Save error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    // ─── Sub-components ──────────────────────────────────────────────────────────

    const ImageCard = ({ label, field, hint, icon: Icon = FiImage }) => (
        <div className="settings-image-card">
            <div className="sic-header">
                <div className="sic-icon"><Icon size={16} /></div>
                <div>
                    <div className="sic-label">{label}</div>
                    {hint && <div className="sic-hint">{hint}</div>}
                </div>
            </div>
            <div className="sic-preview">
                {settings[field] ? (
                    <div className="sic-img-wrapper">
                        <img src={settings[field]} alt={label} />
                        <button className="sic-remove-btn" onClick={() => handleRemoveField(field)} title="Remove"><FiTrash2 size={14} /></button>
                    </div>
                ) : (
                    <div className="sic-empty">No image</div>
                )}
            </div>
            <label className="sic-upload-btn">
                <input type="file" accept="image/*,video/mp4,video/mov,video/webm" onChange={(e) => handleFileChange(e, field)} style={{ display: 'none' }} />
                <FiUpload size={14} /> {files[field] ? 'Changed ✓' : 'Upload'}
            </label>
        </div>
    );

    const ArrayImageSection = ({ label, field, maxCount, hint, icon: Icon = FiCamera }) => (
        <div className="settings-array-section">
            <div className="sas-header">
                <div className="sas-title"><Icon size={16} /> {label}</div>
                {hint && <p className="sas-hint">{hint}</p>}
            </div>
            <div className="sas-grid">
                {(settings[field] || []).map((url, i) => (
                    <div key={i} className="sas-item">
                        <img src={url} alt={`${label} ${i + 1}`} />
                        <button className="sas-remove" onClick={() => handleRemoveArrayItem(field, i)}><FiTrash2 size={12} /></button>
                        {i === 0 && <span className="sas-primary-badge">Primary</span>}
                    </div>
                ))}
                {(settings[field] || []).length < maxCount && (
                    <label className="sas-add-card">
                        <input type="file" accept="image/*,video/mp4,video/mov,video/webm" multiple onChange={(e) => handleFileChange(e, field, true)} style={{ display: 'none' }} />
                        <FiUpload size={24} />
                        <span>Add {label}</span>
                        {files[field] && <span className="sas-selected">{files[field].length} selected</span>}
                    </label>
                )}
            </div>
        </div>
    );

    // ─── Tab Content ─────────────────────────────────────────────────────────────

    const tabs = [
        { id: 'branding', label: 'Branding', icon: FiShoppingBag },
        { id: 'hero', label: 'Hero & Layout', icon: FiLayout },
        { id: 'categories', label: 'Categories', icon: FiGrid },
        { id: 'marketing', label: 'Marketing', icon: FiCamera },
        { id: 'payments', label: 'Payments', icon: FiCreditCard },
        { id: 'team', label: 'Team & Gallery', icon: FiUsers },
    ];

    if (loading) return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main"><div className="settings-loading">Loading settings...</div></main>
        </div>
    );

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main settings-main">

                {/* Header */}
                <div className="settings-page-header">
                    <div>
                        <h1>Site Settings</h1>
                        <p>Customize your store's appearance and media</p>
                    </div>
                    <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                        <FiSave size={16} />
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="settings-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="settings-content">

                    {/* ── BRANDING ─────────────────────────────── */}
                    {activeTab === 'branding' && (
                        <div className="settings-section">
                            <div className="settings-section-title">Branding</div>
                            <p className="settings-section-desc">Your store's logos and visual identity.</p>
                            <div className="settings-image-grid">
                                <ImageCard label="Store Logo" field="logo" hint="Transparent PNG, min 200×200px" icon={FiImage} />
                                <ImageCard label="Navbar Logo" field="navbarLogo" hint="Logo shown in the navigation bar" icon={FiImage} />
                                <ImageCard label="Footer Icon" field="footerSmallIcon" hint="Small icon in the footer" icon={FiImage} />
                            </div>

                            <div className="settings-section-title" style={{ marginTop: '2rem' }}>Brand Name</div>
                            <div className="settings-form-row">
                                <div className="settings-form-group">
                                    <label>Brand Name</label>
                                    <input className="settings-input" value={settings.brandName || ''} onChange={e => setSettings(p => ({ ...p, brandName: e.target.value }))} placeholder="AmaraCé" />
                                </div>
                                <div className="settings-form-group">
                                    <label>Logo Size (px)</label>
                                    <input className="settings-input" type="number" value={settings.headerLogoSize || 60} onChange={e => setSettings(p => ({ ...p, headerLogoSize: Number(e.target.value) }))} min={30} max={150} />
                                </div>
                                <div className="settings-form-group">
                                    <label>Name Color</label>
                                    <div className="settings-color-row">
                                        <input className="settings-input" value={settings.brandNameColor || '#2D2D2D'} onChange={e => setSettings(p => ({ ...p, brandNameColor: e.target.value }))} />
                                        <input type="color" value={settings.brandNameColor || '#2D2D2D'} onChange={e => setSettings(p => ({ ...p, brandNameColor: e.target.value }))} className="settings-color-picker" />
                                    </div>
                                </div>
                                <div className="settings-form-group">
                                    <label>Show Brand Name</label>
                                    <label className="settings-toggle">
                                        <input type="checkbox" checked={settings.showBrandName !== false} onChange={e => setSettings(p => ({ ...p, showBrandName: e.target.checked }))} />
                                        <span className="settings-toggle-slider" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── HERO & LAYOUT ────────────────────────── */}
                    {activeTab === 'hero' && (
                        <div className="settings-section">
                            <div className="settings-section-title">Hero Slider</div>
                            <p className="settings-section-desc">Images/videos that appear in the homepage hero carousel (max 5).</p>
                            <ArrayImageSection label="Hero Slides" field="heroImages" maxCount={5} hint="Supports images and videos (MP4, MOV). Recommended: 1600×900px." icon={FiLayout} />

                            <div className="settings-section-title" style={{ marginTop: '2rem' }}>Layout Images</div>
                            <div className="settings-image-grid">
                                <ImageCard label="Header Background" field="headerBackground" hint="Background behind the top nav bar" icon={FiLayout} />
                                <ImageCard label="Product Hero Media" field="productHeroMedia" hint="Banner shown on the Products page" icon={FiImage} />
                                <ImageCard label="Premium Banner" field="premiumBannerMedia" hint="Right panel of the Beauty Essentials banner" icon={FiImage} />
                            </div>
                        </div>
                    )}

                    {/* ── CATEGORIES ───────────────────────────── */}
                    {activeTab === 'categories' && (
                        <div className="settings-section">
                            <div className="settings-section-title">Category Images</div>
                            <p className="settings-section-desc">Images shown in the "Shop by Category" section on the home page.</p>
                            <div className="settings-image-grid">
                                <ImageCard label="Lip Tint" field="lipTintImage" hint="Category thumbnail for Lip Tints" icon={FiGrid} />
                                <ImageCard label="Fragrances" field="perfumeImage" hint="Category thumbnail for Perfumes" icon={FiGrid} />
                                <ImageCard label="Artisan Soaps" field="beautySoapImage" hint="Category thumbnail for Beauty Soaps" icon={FiGrid} />
                                <ImageCard label="All / Best Sellers" field="allBestSellersImage" hint="Category thumbnail for the All category" icon={FiGrid} />
                            </div>
                        </div>
                    )}

                    {/* ── MARKETING ────────────────────────────── */}
                    {activeTab === 'marketing' && (
                        <div className="settings-section">
                            <div className="settings-section-title">Marketing Media</div>
                            <p className="settings-section-desc">Images used in the About page and promotional sections.</p>
                            <div className="settings-image-grid">
                                <ImageCard label="Our Story Image" field="ourStoryImage" hint="Photo shown in the About / Our Story section" icon={FiCamera} />
                                <ImageCard label="Side Ad" field="sideAd" hint="Sidebar promotional banner" icon={FiCamera} />
                            </div>
                        </div>
                    )}

                    {/* ── PAYMENTS ─────────────────────────────── */}
                    {activeTab === 'payments' && (
                        <div className="settings-section">
                            <div className="settings-section-title">Payment Settings</div>
                            <p className="settings-section-desc">QR codes and payment method logos shown during checkout.</p>
                            <div className="settings-image-grid">
                                <ImageCard label="GCash QR Code" field="gcashQRCode" hint="QR code image for GCash payments" icon={FiCreditCard} />
                            </div>
                        </div>
                    )}

                    {/* ── TEAM & GALLERY ───────────────────────── */}
                    {activeTab === 'team' && (
                        <div className="settings-section">
                            <div className="settings-section-title">Team Photos</div>
                            <p className="settings-section-desc">Photos of your team shown on the About page (max 3).</p>
                            <ArrayImageSection label="Team Photos" field="teamImages" maxCount={3} hint="Recommended: square photos, 800×800px." icon={FiUsers} />

                            <div className="settings-section-title" style={{ marginTop: '2rem' }}>Instagram / Gallery</div>
                            <p className="settings-section-desc">Up to 6 images shown in the "Follow Our Journey" gallery section.</p>
                            <ArrayImageSection label="Gallery Images" field="galleryImages" maxCount={6} hint="Square images recommended, 600×600px." icon={FiCamera} />
                        </div>
                    )}

                </div>

                {/* Floating Save */}
                <div className="settings-float-save">
                    <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                        <FiSave size={16} />
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>

            </main>
        </div>
    );
};

export default AdminSettings;
