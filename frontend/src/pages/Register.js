import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import '../styles/Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await register(name, email, password);
      toast.success(data.message || 'Registration successful!');
      navigate('/verify-email', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-v2">
      {/* Ambience Background Overlay */}
      <div className="ecommerce-vibes-bg"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-container-v2"
      >
        <div className="auth-card-v2">
          <div className="auth-header-v2">
            <h1>Create Account</h1>
            <p>Join Amaraé Beauty and start your glow journey</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-v2">
            <div className="input-group-v2">
              <label>Full Name</label>
              <div className="input-field">
                <FiUser />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="input-group-v2">
              <label>Email Address</label>
              <div className="input-field">
                <FiMail />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="input-group-v2">
              <label>Password</label>
              <div className="input-field">
                <FiLock />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="input-group-v2">
              <label>Confirm Password</label>
              <div className="input-field">
                <FiLock />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or Sign Up with</span>
          </div>

          <div className="social-login-grid">
            <button className="social-btn-v2" onClick={() => toast.info('Google login coming soon!')}>
              <FcGoogle />
              <span>Google</span>
            </button>
            <button className="social-btn-v2" onClick={() => toast.info('Facebook login coming soon!')}>
              <FaFacebook color="#1877F2" />
              <span>Facebook</span>
            </button>
          </div>

          <p className="signup-prompt">
            Already have an account? <Link to="/login">Login Now</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;