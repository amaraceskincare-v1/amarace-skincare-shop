import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
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
        <div className="auth-page">
            <div className="auth-card">
                <h1>Forgot Password</h1>
                {!submitted ? (
                    <>
                        <p>Enter your email to reset password</p>
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
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="success-message">
                        <p>A password reset link has been sent to <strong>{email}</strong>.</p>
                        <p>Please check your inbox and follow the instructions.</p>
                    </div>
                )}
                <p className="auth-link" style={{ marginTop: '2rem' }}>
                    Back to <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
