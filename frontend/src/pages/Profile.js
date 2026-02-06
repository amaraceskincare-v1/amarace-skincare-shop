import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiChevronRight, FiLogOut, FiPackage } from 'react-icons/fi';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Helper to split name
  const getNames = (fullName) => {
    const parts = (fullName || '').split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  const { firstName: initialFirst, lastName: initialLast } = getNames(user?.name);

  const [formData, setFormData] = useState({
    firstName: initialFirst,
    lastName: initialLast,
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
        email: formData.email,
        phone: formData.phone,
        password: formData.password || undefined,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone // Also sync to address phone
        }
      });
      toast.success('Profile updated successfully!');
      setFormData({ ...formData, password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
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
    <div className="profile-page-v2">
      <div className="profile-container-v2">
        <header className="profile-header-v2">
          <div className="header-left">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="premium-title"
            >
              Account Settings
            </motion.h1>
            <p className="subtitle">Manage your personal information and security</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/orders')}
            className="orders-nav-btn"
          >
            <FiPackage />
            View My Orders
            <FiChevronRight />
          </motion.button>
        </header>

        <div className="profile-content-v2">
          <form onSubmit={handleSubmit} className="premium-form-v2">
            <section className="form-section-v2">
              <h2 className="section-title"><FiUser /> Personal Information</h2>

              <div className="form-grid-v2">
                <div className="form-group-v2">
                  <label>First Name</label>
                  <div className="input-with-icon">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-v2">
                  <label>Last Name</label>
                  <div className="input-with-icon">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-v2">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-v2">
                  <label>Contact Number</label>
                  <div className="input-with-icon">
                    <FiPhone className="input-icon" />
                    <input
                      type="tel"
                      placeholder="+63 000 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="form-section-v2">
              <h2 className="section-title"><FiLock /> Security</h2>
              <div className="form-group-v2 full-width">
                <label>New Password (Optional)</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </section>

            <div className="profile-actions-v2">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="save-btn-v2"
                disabled={loading}
              >
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </motion.button>
              <button type="button" onClick={handleLogout} className="logout-btn-v2">
                <FiLogOut /> Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
