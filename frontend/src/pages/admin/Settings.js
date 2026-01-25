import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import '../../styles/Admin.css';

const AdminSettings = () => {
    const [logo, setLogo] = useState(null);
    const [sideAd, setSideAd] = useState(null);
    const [currentLogo, setCurrentLogo] = useState('');
    const [currentSideAd, setCurrentSideAd] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            setCurrentLogo(data.logo);
            setCurrentSideAd(data.sideAd);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (logo) formData.append('logo', logo);
        if (sideAd) formData.append('sideAd', sideAd);

        try {
            const { data } = await api.put('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCurrentLogo(data.logo);
            setCurrentSideAd(data.sideAd);
            toast.success('Settings updated!');
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Site Settings</h1>
            </div>
            <div className="admin-content" style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><strong>Website Logo</strong></label>
                        {currentLogo && <img src={currentLogo} alt="Logo" style={{ height: '50px', display: 'block', marginBottom: '10px' }} />}
                        <input type="file" onChange={(e) => setLogo(e.target.files[0])} />
                    </div>

                    <div className="form-group" style={{ marginTop: '2rem' }}>
                        <label><strong>Side Advertisement Name/Banner</strong></label>
                        <p className="text-muted">This image will appear in the "Ads" section.</p>
                        {currentSideAd && <img src={currentSideAd} alt="Ad" style={{ width: '200px', display: 'block', marginBottom: '10px' }} />}
                        <input type="file" onChange={(e) => setSideAd(e.target.files[0])} />
                    </div>

                    <button type="submit" className="hero-btn" style={{ marginTop: '2rem', background: 'var(--primary)', color: 'white' }}>Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;
