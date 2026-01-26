import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiMenu, FiX, FiInstagram, FiFacebook } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Shop' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-social">
          <a href="https://instagram.com/amarace" target="_blank" rel="noopener noreferrer">
            <FiInstagram />
          </a>
          <a href="https://facebook.com/amarace" target="_blank" rel="noopener noreferrer">
            <FiFacebook />
          </a>
        </div>
        <div className="announcement-text">
          <span>Free shipping for all orders over ₱500+ &nbsp;&nbsp;•&nbsp;&nbsp; Premium beauty essentials</span>
        </div>
        <div className="announcement-right">
          <span>🇵🇭 PHP</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Left - Navigation Links */}
          <div className={`nav-left ${menuOpen ? 'active' : ''}`}>
            <ul className="nav-links">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user && (
                <li>
                  <Link
                    to="/orders"
                    className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                </li>
              )}
              {user?.role === 'admin' && (
                <li>
                  <Link
                    to="/admin"
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                </li>
              )}
            </ul>

            {/* Mobile-only actions */}
            <div className="mobile-nav-actions">
              {user ? (
                <>
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                    My Account
                  </Link>
                  <Link to="/orders" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                    My Orders
                  </Link>
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  Login / Register
                </Link>
              )}
            </div>
          </div>

          {/* Center - Logo */}
          <Link to="/" className="navbar-logo">
            AmaraCé
          </Link>

          {/* Right - Action Icons */}
          <div className="nav-right">
            <button
              className="nav-icon"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <FiSearch />
            </button>

            <Link
              to={user ? '/profile' : '/login'}
              className="nav-icon desktop-only"
              aria-label="Account"
            >
              <FiUser />
            </Link>

            <Link to="/cart" className="nav-icon cart-icon" aria-label="Cart">
              <FiShoppingBag />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <button
              className="nav-icon menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-overlay">
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search our store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>
                <FiX />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
};

export default Navbar;
