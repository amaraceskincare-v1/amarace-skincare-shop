import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import '../styles/Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success('Password reset link sent to your email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
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
                        <h1>{submitted ? 'Check Your Email' : 'Forgot Password'}</h1>
                        <p>
                            {submitted
                                ? 'We have sent password recovery instructions to your email'
                                : 'Enter your email address and we will send you a reset link'}
                        </p>
                    </div>

                    {!submitted ? (
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

                            <button type="submit" className="login-submit-btn" disabled={loading}>
                                {loading ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="success-message-v2"
                            style={{ textAlign: 'center', padding: '20px 0' }}
                        >
                            <div className="success-icon-wrapper" style={{
                                width: '80px',
                                height: '80px',
                                background: '#f0fdf4',
                                color: '#22c55e',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                margin: '0 auto 24px'
                            }}>
                                <FiCheckCircle />
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                A password reset link has been sent to <br />
                                <strong style={{ color: '#1e293b' }}>{email}</strong>
                            </p>
                        </motion.div>
                    )}

                    <p className="signup-prompt" style={{ marginTop: '40px' }}>
                        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <FiArrowLeft /> Back to Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
