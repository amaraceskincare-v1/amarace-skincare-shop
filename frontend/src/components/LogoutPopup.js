import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck } from 'react-icons/fi';
import '../styles/LogoutPopup.css';

const LogoutPopup = ({ isOpen, onClose }) => {
    const [countdown, setCountdown] = useState(3);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        // Reset state when popup opens
        setCountdown(3);
        setIsClosing(false);

        // Countdown timer
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    // Start closing animation
                    setIsClosing(true);
                    // Call onClose after animation completes
                    setTimeout(() => {
                        onClose();
                    }, 300);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <>
            <div className={`logout-popup-overlay ${isClosing ? 'closing' : ''}`} />
            <div className={`logout-popup ${isClosing ? 'closing' : ''}`}>
                <div className="logout-popup-icon">
                    <FiCheck />
                </div>
                <h3>See You Soon!</h3>
                <p>You have been successfully logged out.</p>
                <div className="logout-popup-countdown">
                    <div className="spinner" />
                    <span>Redirecting in {countdown}s...</span>
                </div>
            </div>
        </>,
        document.body
    );
};

export default LogoutPopup;
