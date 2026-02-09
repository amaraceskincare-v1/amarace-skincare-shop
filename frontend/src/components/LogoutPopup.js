import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck } from 'react-icons/fi';
import '../styles/LogoutPopup.css';

const LogoutPopup = ({ isOpen, onClose }) => {
    const [countdown, setCountdown] = useState(3);
    const [isClosing, setIsClosing] = useState(false);

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        // Reset state when popup opens
        setCountdown(3);
        setIsClosing(false);

        // Countdown timer - starts from 3
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                const newCount = prev - 1;

                if (newCount <= 0) {
                    clearInterval(countdownInterval);
                    setIsClosing(true);

                    // Call onClose after animation completes
                    setTimeout(() => {
                        onCloseRef.current();
                    }, 300);
                    return 0;
                }
                return newCount;
            });
        }, 1000);

        return () => {
            clearInterval(countdownInterval);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <>
            <div className={`logout-popup-overlay ${isClosing ? 'closing' : ''}`} />
            <div className={`logout-popup ${isClosing ? 'closing' : ''}`}>
                <div className="logout-popup-content">
                    <div className="logout-popup-icon">
                        <FiCheck />
                    </div>
                    <h3 className="logout-popup-title">See You Soon!</h3>
                    <p className="logout-popup-message">
                        You have been successfully logged out.
                    </p>
                    <div className="logout-popup-countdown">
                        <div className="countdown-circle">
                            <svg className="countdown-ring" viewBox="0 0 36 36">
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="15.915"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray={`${((3 - countdown) / 3) * 100}, 100`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                />
                            </svg>
                            <span className="countdown-number">{countdown}</span>
                        </div>
                        <p className="countdown-text">Redirecting...</p>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export default LogoutPopup;