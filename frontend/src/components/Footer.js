import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useLanguage } from '../context/LanguageContext';
import { FaFacebook } from 'react-icons/fa';
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
    <footer className="footer-premium-v2">
      {/* 1. Newsletter Section */}
      <div className="footer-newsletter-v2">
        <div className="newsletter-content-v2">
          <span className="newsletter-tag-v2">Newsletter</span>
          <h2>Join the AmaraCé Inner Circle</h2>
          <p>Subscribe for exclusive access to new launches, skincare secrets, and 10% off your first order.</p>
          <form className="newsletter-form-v2" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Subscribing...' : 'Join Now'}
            </button>
          </form>
        </div>
      </div>

      {/* footer-social-grid-v2 removed to prevent duplication with Home page gallery */}

      {/* 3. Main Navigation */}
      <div className="footer-nav-container-v2">
        <div className="footer-nav-grid-v2">
          <div className="nav-col-v2 branding">
            <h4 className="footer-logo-v2">AmaraCé</h4>
            <p className="footer-motto-v2">Celebrating your natural radiance with dermatologist-tested, luxury skincare solutions.</p>
          </div>

          <div className="nav-col-v2">
            <h4>Boutique</h4>
            <ul>
              <li><Link to="/products">Shop All</Link></li>
              <li><Link to="/products?category=Lip%20Tint">Lip Rituals</Link></li>
              <li><Link to="/products?category=Perfume">Fragrance</Link></li>
              <li><Link to="/products?category=Beauty%20Soap">Artisan Soaps</Link></li>
            </ul>
          </div>

          <div className="nav-col-v2">
            <h4>Experience</h4>
            <ul>
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/contact">Talk to Our Concierge</Link></li>
              <li><Link to="/faqs">FAQ</Link></li>
              <li><Link to="/blog">Beauty Blog</Link></li>
            </ul>
          </div>

          <div className="nav-col-v2">
            <h4>STORE LOCATION</h4>
            <ul>
              <li>Salvacion, Panabo City</li>
              <li>Davao del Norte, 8105</li>
              <li>+63 915 266 2648</li>
              <li>amarace.skincare@gmail.com</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Bottom Bar */}
      <div className="footer-bottom-v2">
        <div className="bottom-content-v2">
          {/* removed payment stack to cleanup footer per user request */}
          <p className="copyright-text-v2">© 2025 AmaraCé Skin Care. Crafted for Radiance. All Rights Reserved.</p>
          <div className="legal-links-v2">
            <Link to="/policies/terms">Terms</Link>
            <Link to="/policies/privacy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
