import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingBag, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState({ code: 'PH', flag: '🇵🇭', name: 'Philippines' });
  const langRef = useRef(null);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const languages = [
    { code: 'PH', flag: '🇵🇭', name: 'Philippines' },
    { code: 'US', flag: '🇺🇸', name: 'United States' },
    { code: 'JP', flag: '🇯🇵', name: 'Japan' },
    { code: 'KR', flag: '🇰🇷', name: 'South Korea' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleLangSelect = (lang) => {
    setSelectedLang(lang);
    setLangOpen(false);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="announcement-bar">
        <div className="announcement-text">
          <span>Free shipping for all orders over ₱500+ • Premium beauty essentials</span>
        </div>
        <div className="language-dropdown" ref={langRef}>
          <button className="language-btn" onClick={() => setLangOpen(!langOpen)}>
            <span className="lang-flag">{selectedLang.flag}</span>
            <span className="lang-code">{selectedLang.code}</span>
            <FiChevronDown className={`lang-arrow ${langOpen ? 'open' : ''}`} />
          </button>
          {langOpen && (
            <div className="language-menu">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`language-option ${selectedLang.code === lang.code ? 'active' : ''}`}
                  onClick={() => handleLangSelect(lang)}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-name">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="navbar">
        <div className="navbar-container">
          <div className={`nav-left ${menuOpen ? 'active' : ''}`}>
            <ul className="nav-links">
              <li><Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</Link></li>
              <li><Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Shop</Link></li>
              <li><Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>About</Link></li>
              <li><Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Contact</Link></li>
              {user && (
                <li>
                  <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>My Orders</Link>
                </li>
              )}
              {user?.role === 'admin' && (
                <li>
                  <Link to="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Admin</Link>
                </li>
              )}
            </ul>
            <div className="mobile-nav-actions">
              {user ? (
                <>
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                    <FiUser className="mobile-nav-icon" /> My Account
                  </Link>
                  <button className="mobile-logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  <FiUser className="mobile-nav-icon" /> Member Login
                </Link>
              )}
            </div>
          </div>

          <Link to="/" className="navbar-logo">AmaraCé</Link>

          <div className="nav-right">
            <div className="header-search desktop-only">
              <form onSubmit={handleSearch}>
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
            <Link to={user ? '/profile' : '/login'} className="nav-icon"><FiUser /></Link>
            <Link to="/cart" className="nav-icon cart-icon">
              <FiShoppingBag />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <button className="nav-icon menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div className="search-overlay">
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search our store..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
              <button type="button" className="search-close" onClick={() => setSearchOpen(false)}><FiX /></button>
            </form>
          </div>
        </div>
      )}
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </header>
  );
};

export default Navbar;
