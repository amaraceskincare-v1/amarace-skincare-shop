import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
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

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h2>Account Info</h2>
          <div className="form-group">
            <label>Name</label>
            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>New Password (leave blank to keep current)</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;