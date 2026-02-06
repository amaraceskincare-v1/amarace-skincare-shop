import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiAlertCircle, FiX } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      const targetPath = redirect.startsWith('/') ? redirect : `/${redirect}`;
      navigate(targetPath);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid email or password. Please try again.';

      if (error.response?.data?.unverified) {
        toast.info('Please verify your email first');
        navigate('/verify-email', { state: { email: error.response.data.email } });
        return;
      }

      // SHOW CUSTOM MODAL INSTEAD OF JUST REFRESHING OR MINI TOAST
      setErrorModal({ show: true, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-v2">
      {/* Ambience Background Overlay */}
      <div className="ecommerce-vibes-bg"></div>

      <AnimatePresence>
        {errorModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="error-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="error-modal-card"
            >
              <div className="error-icon-wrapper">
                <FiAlertCircle />
              </div>
              <h3>Login Failed</h3>
              <p>{errorModal.message}</p>
              <button onClick={() => setErrorModal({ show: false, message: '' })} className="close-error-btn">
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-container-v2"
      >
        <div className="auth-card-v2">
          <div className="auth-header-v2">
            <h1>Welcome Back</h1>
            <p>Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-v2">
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
              <div className="label-row">
                <label>Password</label>
                <Link to="/forgot-password" title="Feature coming soon" className="forgot-link">
                  Forgot?
                </Link>
              </div>
              <div className="input-field">
                <FiLock />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <div className="auth-options-v2">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or continue with</span>
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
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;