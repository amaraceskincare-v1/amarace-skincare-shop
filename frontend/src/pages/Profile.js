import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        address: {
          street: formData.street, city: formData.city,
          state: formData.state, zipCode: formData.zipCode, country: formData.country
        }
      });
      toast.success('Profile updated!');
      setFormData({ ...formData, password: '' });
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.info('Logged out successfully');
  };

  return (
    <div className="profile-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Profile</h1>
        <button
          onClick={() => navigate('/orders')}
          style={{ padding: '10px 20px', background: 'white', border: '1px solid #4f46e5', color: '#4f46e5', borderRadius: '8px', cursor: 'pointer' }}
        >
          View My Orders
        </button>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h2>Account Information</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>New Password (Optional)</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button type="submit" className="save-btn" disabled={loading} style={{ flex: 2 }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleLogout} className="logout-btn" style={{ flex: 1 }}>
            Logout
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
