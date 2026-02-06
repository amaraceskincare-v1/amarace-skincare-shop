import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiLock, FiShoppingBag } from 'react-icons/fi';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Parse name into first/last if not already split
  const getInitialName = () => {
    if (user?.firstName || user?.lastName) {
      return { firstName: user.firstName || '', lastName: user.lastName || '' };
    }
    // Fallback: split name field
    const parts = (user?.name || '').split(' ');
    return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' };
  };

  const initialName = getInitialName();

  const [formData, setFormData] = useState({
    firstName: initialName.firstName,
    lastName: initialName.lastName,
    email: user?.email || '',
    phone: user?.phone || '',
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
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
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

  // Get initials for avatar fallback
  const getInitials = () => {
    const first = formData.firstName?.[0] || '';
    const last = formData.lastName?.[0] || '';
    return (first + last).toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="profile-page">
      {/* Profile Header with Avatar */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar profile-avatar-initials">
              {getInitials()}
            </div>
          )}
          <div className="profile-info">
            <h1>{formData.firstName} {formData.lastName}</h1>
            <p className="profile-email">{user?.email}</p>
            {user?.authProvider && user.authProvider !== 'local' && (
              <span className="auth-provider-badge">
                Signed in with {user.authProvider.charAt(0).toUpperCase() + user.authProvider.slice(1)}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => navigate('/orders')} className="view-orders-btn">
          <FiShoppingBag /> View My Orders
        </button>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Personal Information */}
        <div className="form-section">
          <h2><FiUser /> Personal Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label><FiMail /> Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={user?.authProvider !== 'local'}
              />
              {user?.authProvider !== 'local' && (
                <span className="field-hint">Email managed by {user?.authProvider}</span>
              )}
            </div>
            <div className="form-group">
              <label><FiPhone /> Contact Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+63 000 000 0000"
              />
            </div>
          </div>
        </div>

        {/* Security Section - only for local accounts */}
        {(!user?.authProvider || user.authProvider === 'local') && (
          <div className="form-section">
            <h2><FiLock /> Security</h2>
            <div className="form-group">
              <label>New Password (Optional)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>
        )}

        <div className="profile-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
