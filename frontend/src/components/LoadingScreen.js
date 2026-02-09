import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { optimizeImage } from '../utils/imageOptimizer';
import '../styles/LoadingScreen.css';

const LoadingScreen = ({ isLoading }) => {
    const { settings } = useSettings();

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
                <div className="loading-logo-wrapper">
                    <img
                        src={optimizeImage(settings?.navbarLogo || '/logo.png', 200)}
                        alt="AmaraCé Logo"
                        className="loading-logo-img"
                        onError={(e) => { e.target.src = '/logo.png'; }}
                    />
                </div>
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
