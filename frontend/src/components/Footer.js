import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('Subscribed successfully! Check your email.');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer-v2">
      {/* Help Center Banner */}
      <div className="wix-help-banner">
        <div className="help-banner-content">
          <div className="help-text-side">
            <h2>{t('need_help')} {t('check_help')}</h2>
            <p>{t('footer_text')}</p>
            <Link to="/products" className="go-help-btn">{t('go_shop')}</Link>
          </div>
          <div className="help-image-side">
            <img src={settings?.footerHelpImage || "https://i.ibb.co/p6Vp9XJ/composite-skincare.jpg"} alt="AmaraCé Products" />
          </div>
        </div>
      </div>

      {/* Main Footer Sections */}
      <div className="footer-main-skincare">
        <div className="footer-grid-container">
          {/* Store Location */}
          <div className="footer-v2-column">
            <h4>Store Location</h4>
            <div className="store-info">
              <p>Salvacion, Panabo City, Davao del Norte, 8105, Philippines</p>
              <p>amarace.skincare@gmail.com</p>
              <p>+63 915 266 2648</p>
              <div className="social-links-v2">
                <a href="https://www.facebook.com/AmaraCeSkinCare/" target="_blank" rel="noreferrer">
                  <img src={settings?.facebookLogo || "https://i.ibb.co/hK8bQfP/fb-logo.png"} alt="Facebook" style={{ width: '24px', height: '24px', marginTop: '10px' }} />
                </a>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="footer-v2-column">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/products">{t('shop_all')}</Link></li>
              <li><Link to="/products?category=Lip%20Tint">{t('lip_tints')}</Link></li>
              <li><Link to="/products?category=Perfume">{t('perfumes')}</Link></li>
              <li><Link to="/products?category=Beauty%20Soap">{t('beauty_soaps')}</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="footer-v2-column">
            <h4>Customer Support</h4>
            <ul>
              <li><Link to="/contact">{t('contact')}</Link></li>
              <li><Link to="/about">{t('about')}</Link></li>
            </ul>
          </div>

          {/* Policy */}
          <div className="footer-v2-column">
            <h4>Policy</h4>
            <ul>
              <li><Link to="/policies/shipping">{t('shipping_returns')}</Link></li>
              <li><Link to="/policies/terms">{t('terms_conditions')}</Link></li>
              <li><Link to="/policies/payment">{t('payment_methods')}</Link></li>
              <li><Link to="/faq">{t('faq')}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Payment & Copyright */}
      <div className="footer-bottom-skincare">
        <div className="payment-methods-row">
          <span>{t('we_accept')}</span>
          <div className="gcash-logo-v2">
            <img src={settings?.paymentLogo || "https://i.ibb.co/L5fX0gD/gcash-logo.png"} alt="GCash" />
          </div>
        </div>
        <div className="copyright-v2">
          <p>© 2025-2026 AmaraCé. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
