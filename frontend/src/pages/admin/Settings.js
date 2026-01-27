import { useState, useEffect } from 'react';
import { FiSave, FiImage, FiUpload } from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/Admin.css';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        logo: '',
        headerBackground: '',
        heroImage: '',
        fbSectionImage: '',
        footerHelpImage: '',
        gcashQRCode: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [files, setFiles] = useState({});

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings(data);
                setLoading(false);
            } catch (error) {
                toast.error('Failed to load settings');
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFiles({ ...files, [field]: file });
            // Show preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({ ...settings, [field]: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const formData = new FormData();
        Object.keys(files).forEach((key) => {
            formData.append(key, files[key]);
        });

        try {
            const { data } = await api.put('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSettings(data);
            setFiles({});
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading...</div>;

    const SettingField = ({ label, field, hint }) => (
        <div className="settings-field">
            <div className="field-info">
                <label>{label}</label>
                {hint && <p className="field-hint">{hint}</p>}
            </div>
            <div className="image-manager">
                {settings[field] && (
                    <div className="current-image-preview">
                        <img src={settings[field]} alt={label} />
                    </div>
                )}
                <div className="upload-controls">
                    <label className="upload-btn">
                        <FiUpload /> Choose Image
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, field)}
                            hidden
                        />
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                <div className="admin-header">
                    <h1>Site Settings & Media</h1>
                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <FiSave /> {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>

                <div className="admin-section">
                    <div className="settings-grid-v2">
                        {/* Branding */}
                        <div className="settings-card">
                            <h3>Branding</h3>
                            <SettingField
                                label="Store Logo"
                                field="logo"
                                hint="Transparent PNG recommended for the navbar."
                            />
                        </div>

                        {/* Layout Images */}
                        <div className="settings-card">
                            <h3>Layout & Hero</h3>
                            <SettingField
                                label="Header Background"
                                field="headerBackground"
                                hint="Background image for the top navigation area."
                            />
                            <SettingField
                                label="Hero Image"
                                field="heroImage"
                                hint="The main wide image shown at the top of the Home page."
                            />
                        </div>

                        {/* Marketing Sections */}
                        <div className="settings-card">
                            <h3>Marketing Sections</h3>
                            <SettingField
                                label="Facebook Feed Image"
                                field="fbSectionImage"
                                hint="The single wide image shown in the 'Follow Us' section."
                            />
                            <SettingField
                                label="Footer Promo Image"
                                field="footerHelpImage"
                                hint="The product composite image shown in the Footer help banner."
                            />
                        </div>

                        {/* Payments */}
                        <div className="settings-card">
                            <h3>Payment Methods</h3>
                            <SettingField
                                label="GCash QR Code"
                                field="gcashQRCode"
                                hint="QR code image shown during checkout for GCash payments."
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;
