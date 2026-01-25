import { useEffect } from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = ({ isLoading }) => {
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-logo">AmaraCé</div>
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
