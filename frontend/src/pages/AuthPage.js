import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import '../styles/Auth.css';

const AuthPage = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [clouds, setClouds] = useState([]);

    const { login, register } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        if (location.pathname === '/register') {
            setIsSignIn(false);
        } else {
            setIsSignIn(true);
        }
    }, [location.pathname]);

    // Cloud Generation logic
    useEffect(() => {
        const cloudCount = 12;
        const newClouds = Array.from({ length: cloudCount }).map((_, i) => ({
            id: i,
            width: Math.random() * 150 + 100,
            height: Math.random() * 60 + 40,
            top: Math.random() * 80,
            left: Math.random() * 100,
            duration: Math.random() * 20 + 20,
            delay: Math.random() * -40, // Negative delay to start mid-animation
            opacity: Math.random() * 0.4 + 0.3
        }));
        setClouds(newClouds);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password, rememberMe);
            toast.success('Login successful!');
            navigate(redirect);
        } catch (error) {
            if (error.response?.data?.unverified) {
                toast.info('Please verify your email first');
                navigate('/verify-email', { state: { email: error.response.data.email } });
                return;
            }
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
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

    const toggle = () => {
        setIsSignIn(!isSignIn);
        window.history.pushState({}, '', isSignIn ? '/register' : '/login');
    };

    return (
        <div
            className="auth-page-wrapper"
            style={settings?.loginBackground ? {
                background: `linear-gradient(135deg, rgba(253,252,251,0.85) 0%, rgba(226,209,195,0.85) 100%), url(${settings.loginBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            } : {}}
        >
            {/* BACKGROUND SCENE */}
            <div className="scene-container">
                <div className="clouds-container">
                    {clouds.map(cloud => (
                        <div
                            key={cloud.id}
                            className="cloud"
                            style={{
                                width: cloud.width,
                                height: cloud.height,
                                top: `${cloud.top}%`,
                                left: `${cloud.left}%`,
                                animationDuration: `${cloud.duration}s`,
                                animationDelay: `${cloud.delay}s`,
                                opacity: cloud.opacity
                            }}
                        />
                    ))}
                </div>

                <div className="ground-path"></div>
            </div>

            {/* FORM CARD */}
            <div className="auth-form-card">
                <h2>{isSignIn ? 'Welcome Back' : 'Create Account'}</h2>

                <form onSubmit={isSignIn ? handleLogin : handleRegister}>
                    {!isSignIn && (
                        <div className="auth-input-group">
                            <FiUser />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="auth-input-group">
                        <FiMail />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <FiLock />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </div>
                    </div>

                    {!isSignIn && (
                        <div className="auth-input-group">
                            <FiLock />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {isSignIn && (
                        <div className="auth-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>
                    )}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Processing...' : (isSignIn ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isSignIn ? "Don't have an account? " : "Already have an account? "}
                        <b onClick={toggle}>{isSignIn ? 'Sign up here' : 'Sign in here'}</b>
                    </p>
                </div>

                <div className="social-divider"><span>Or continue with</span></div>
                <div className="social-list">
                    <div className="social-btn-labeled" onClick={() => toast.info('Google Sign In coming soon!')}>
                        <FcGoogle />
                        <span>Google</span>
                    </div>
                    <div className="social-btn-labeled" onClick={() => toast.info('Facebook Sign In coming soon!')}>
                        <FaFacebook />
                        <span>Facebook</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
