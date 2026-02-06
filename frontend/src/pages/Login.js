import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

      // Sanitize redirect path
      const targetPath = redirect.startsWith('/') ? redirect : `/${redirect}`;
      navigate(targetPath);
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.unverified) {
        toast.info('Please verify your email first');
        navigate('/verify-email', { state: { email: error.response.data.email } });
        return;
      }
      toast.error(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome,</h1>
        <p>Glad to see you!</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
            />
          </div>

          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <Link to="/forgot-password" title="Feature coming soon" className="forgot-password">
            Forgot Password?
          </Link>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="social-divider">
          <span>Or Login with</span>
        </div>

        <div className="social-btns">
          <button className="social-btn google" onClick={() => toast.info('Google Login coming soon!')}>
            <FcGoogle />
          </button>
          <button className="social-btn facebook" onClick={() => toast.info('Facebook Login coming soon!')}>
            <FaFacebook />
          </button>
        </div>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Sign Up Now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;