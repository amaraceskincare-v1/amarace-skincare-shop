import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const VerifyEmail = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const { verifyEmail, resendOtp } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            await verifyEmail(email, otp);
            toast.success('Email verified successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            const data = await resendOtp(email);
            toast.success(data.message || 'OTP resent successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Verify Your Email</h1>
                <p>We've sent a 6-digit code to <strong>{email}</strong></p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            className="otp-input"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <p className="auth-link">
                    Didn't receive the code?{' '}
                    <button
                        onClick={handleResend}
                        className="resend-link"
                        disabled={resending}
                    >
                        {resending ? 'Resending...' : 'Resend OTP'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
