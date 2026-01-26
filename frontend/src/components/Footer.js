import { Link } from "react-router-dom";
import { useState } from "react";
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiFacebook, FiArrowRight } from "react-icons/fi";
import '../styles/Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
    <footer className="footer">
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="newsletter-content">
          <h3>Let's get in touch</h3>
          <p>Subscribe to our newsletter and get 10% off your first purchase</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? '...' : 'Subscribe'} <FiArrowRight />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Quick Links */}
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/products">Shop All</Link></li>
              <li><Link to="/products?category=Lip%20Tint">Lip Tints</Link></li>
              <li><Link to="/products?category=Perfume">Perfumes</Link></li>
              <li><Link to="/products?category=Beauty%20Soap">Beauty Soaps</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div className="footer-column">
            <h4>Information</h4>
            <ul>
              <li><Link to="/info/shipping">Shipping & Delivery</Link></li>
              <li><Link to="/info/returns">Returns & Exchanges</Link></li>
              <li><Link to="/info/terms">Terms & Conditions</Link></li>
              <li><Link to="/info/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Our Store */}
          <div className="footer-column footer-store">
            <h4>Our Store</h4>
            <p>Salvacion, Panabo City, Davao del Norte, 8105, Philippines</p>
            <p>amarace.skincare@gmail.com</p>
            <p>+63 915 266 2648</p>
            <div className="footer-social">
              <a href="https://www.facebook.com/AmaraCeSkinCare/" target="_blank" rel="noopener noreferrer">
                <FiFacebook />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} AmaraCé. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;