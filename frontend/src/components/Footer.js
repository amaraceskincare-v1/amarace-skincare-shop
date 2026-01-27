import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiFacebook, FiArrowRight } from "react-icons/fi";
import '../styles/Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Footer year range
  const startYear = 2025;
  const currentYear = new Date().getFullYear();

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
            <h2>Need Help? Check Out Our Help Center</h2>
            <p>I'm a paragraph. Click here to add your own text and edit me. Let your users get to know you.</p>
            <Link to="/help" className="go-help-btn">Go to Help Center</Link>
          </div>
          <div className="help-image-side">
            <img src="https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=2070&auto=format&fit=crop" alt="Help Center" />
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
                <a href="https://facebook.com" target="_blank" rel="noreferrer"><FiFacebook /></a>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="footer-v2-column">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/products">SHOP ALL</Link></li>
              <li><Link to="/products?category=Lip%20Tint">LIP TINTS</Link></li>
              <li><Link to="/products?category=Perfume">PERFUMES</Link></li>
              <li><Link to="/products?category=Beauty%20Soap">BEAUTY SOAPS</Link></li>
              <li><Link to="/products?sale=true">SALE</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="footer-v2-column">
            <h4>Customer Support</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
            </ul>
          </div>

          {/* Policy */}
          <div className="footer-v2-column">
            <h4>Policy</h4>
            <ul>
              <li><Link to="/policies/shipping">Shipping & Returns</Link></li>
              <li><Link to="/policies/terms">Terms & Conditions</Link></li>
              <li><Link to="/policies/payment">Payment Methods</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Payment & Copyright */}
      <div className="footer-bottom-skincare">
        <div className="payment-methods-row">
          <span>We accept the following paying methods</span>
          <div className="gcash-logo-v2">
            <img src="https://i.ibb.co/L5fX0gD/gcash-logo.png" alt="GCash" />
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
