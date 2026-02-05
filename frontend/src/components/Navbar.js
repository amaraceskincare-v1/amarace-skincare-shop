import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingBag, FiMenu, FiX, FiChevronDown, FiHeart } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { optimizeImage } from '../utils/imageOptimizer';
import '../styles/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [userDropdown, setUserDropdown] = useState(false);
  const userRef = useRef(null);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    setUserDropdown(false);
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

  return (
    <header
      className={`header ${scrolled ? 'scrolled' : ''}`}
      style={settings?.headerBackground ? { backgroundImage: `url(${optimizeImage(settings.headerBackground, 1200)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {/* Level 1: Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-left">
          <FiShoppingBag /> <span>{t('free_shipping')}</span>
        </div>
        <div className="announcement-right">
          <Link to="/about">{t('about')}</Link>
          <Link to="/contact">{t('contact')}</Link>
          <a href="tel:+639152662648">Call Us: +639152662648</a>
        </div>
      </div>

      {/* Level 2: Logo & Actions Bar */}
      <div className="logo-bar" style={settings?.headerBackground ? { background: 'transparent', borderBottom: 'none' } : {}}>
        <div className="logo-bar-container">
          <Link to="/" className="navbar-brand-link">
            {!settings ? (
              <div className="logo-placeholder-v2"></div>
            ) : (
              <div
                className={`navbar-brand-flex position-${settings.brandNamePosition || 'right'}`}
                style={{ gap: `${settings.brandNamePosition === 'below' ? '5px' : '16px'}` }}
              >
                <div className="navbar-logo-container" style={{
                  height: `${settings.headerLogoSize || 60}px`,
                  width: `${settings.headerLogoSize || 60}px`
                }}>
                  {settings.navbarLogo ? (
                    <img
                      src={optimizeImage(settings.navbarLogo, 120)}
                      alt={`${settings.brandName || 'AmaraCé'} Logo`}
                      className="navbar-logo-img"
                      loading="eager"
                      fetchpriority="high"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="logo-emblem-v2" style={{
                      fontSize: `${(settings.headerLogoSize || 60) * 0.4}px`
                    }}>
                      AC
                    </div>
                  )}
                </div>

                {settings.showBrandName !== false && settings.brandName && (
                  <div className="navbar-brand-info">
                    <h1 className="brand-name-main" style={{
                      color: settings.brandNameColor || 'var(--dark)',
                      fontSize: settings.brandNameFontSize === 'small' ? '1.2rem' :
                        settings.brandNameFontSize === 'large' ? '2.2rem' : '1.75rem',
                      fontWeight: settings.brandNameFontWeight === 'regular' ? '500' : '700'
                    }}>
                      {settings.brandName}
                    </h1>
                  </div>
                )}
              </div>
            )}
          </Link>

          <div className="logo-spacer"></div>

          <div className="nav-actions">
            <div className="philippines-clock">
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {(() => {
                  try {
                    return time.toLocaleString('en-PH', {
                      timeZone: 'Asia/Manila',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    });
                  } catch (e) {
                    return time.toLocaleString(); // Safe fallback
                  }
                })()}
              </span>
            </div>
            <button className="nav-action-btn search-btn" onClick={() => setSearchOpen(!searchOpen)}>
              <FiSearch />
            </button>
            <div className="user-nav-wrapper" ref={userRef}>
              <button className="nav-action-btn" onClick={() => setUserDropdown(!userDropdown)}>
                <FiUser />
                <FiChevronDown className={`user-arrow ${userDropdown ? 'open' : ''}`} />
              </button>
              <div className={`user-dropdown-menu-v2 ${userDropdown ? 'active' : ''}`}>
                {user ? (
                  <>
                    <div className="user-greeting-v2" style={{ '--item-index': 1 }}>
                      Hi, {user.name}
                    </div>
                    <Link to="/profile" className="dropdown-item-v2" style={{ '--item-index': 2 }} onClick={() => setUserDropdown(false)}>
                      MY PROFILE
                    </Link>
                    <Link to="/orders" className="dropdown-item-v2" style={{ '--item-index': 3 }} onClick={() => setUserDropdown(false)}>
                      MY ORDERS
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item-v2 admin-link-v2" style={{ '--item-index': 4 }} onClick={() => setUserDropdown(false)}>
                        ADMIN DASHBOARD
                      </Link>
                    )}
                    <button className="dropdown-item-v2 logout-btn-v2" style={{ '--item-index': 5 }} onClick={handleLogout}>
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item-v2" style={{ '--item-index': 1 }} onClick={() => setUserDropdown(false)}>
                      LOGIN
                    </Link>
                    <Link to="/register" className="dropdown-item-v2" style={{ '--item-index': 2 }} onClick={() => setUserDropdown(false)}>
                      REGISTER
                    </Link>
                  </>
                )}
              </div>
            </div>
            <Link to="/cart" className="nav-action-btn cart-icon">
              <FiShoppingBag />
              <span className="cart-count">{cartCount}</span>
            </Link>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Level 3: Main Navigation Bar */}
      <nav className="main-nav-bar">
        <ul className="nav-links-centered">
          <li><Link to="/" className={isActive('/') ? 'active' : ''}>{t('home')}</Link></li>
          <li><Link to="/products" className={location.pathname === '/products' && !location.search ? 'active' : ''}>{t('shop_all')}</Link></li>
          <li><Link to="/products?category=Lip%20Tint" className={location.search.includes('Lip%20Tint') ? 'active' : ''}>{t('lip rituals')}</Link></li>
          <li><Link to="/products?category=Perfume" className={location.search.includes('Perfume') ? 'active' : ''}>{t('fragrance')}</Link></li>
          <li><Link to="/products?category=Beauty%20Soap" className={location.search.includes('Beauty%20Soap') ? 'active' : ''}>{t('artisan soaps')}</Link></li>
        </ul>
      </nav>

      {/* Inline Search below Nav */}
      {searchOpen && (
        <div className="inline-search-container">
          <form onSubmit={handleSearch} className="inline-search-form">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search our store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="button" className="search-close-mini" onClick={() => setSearchOpen(false)}>
              <FiX />
            </button>
          </form>
        </div>
      )}
      {/* Mobile Menu Overlay */}
      <div className={`mobile-nav ${menuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-header">
          <Link to="/" className="mobile-logo" onClick={() => setMenuOpen(false)}>AmaraCé</Link>
          <button className="close-menu" onClick={() => setMenuOpen(false)}><FiX /></button>
        </div>
        <ul className="mobile-links">
          <li><Link to="/" onClick={() => setMenuOpen(false)}>HOME</Link></li>
          <li><Link to="/products" onClick={() => setMenuOpen(false)}>SHOP ALL</Link></li>
          <li><Link to="/products?category=Lip%20Tint" onClick={() => setMenuOpen(false)}>LIP RITUALS</Link></li>
          <li><Link to="/products?category=Perfume" onClick={() => setMenuOpen(false)}>FRAGRANCE</Link></li>
          <li><Link to="/products?category=Beauty%20Soap" onClick={() => setMenuOpen(false)}>ARTISAN SOAPS</Link></li>
          <hr />
          <li><Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link></li>
          <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
          <li><Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link></li>
          {user?.role === 'admin' && (
            <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link></li>
          )}
          {user ? (
            <li><button onClick={handleLogout} className="logout-link">Logout</button></li>
          ) : (
            <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login / Register</Link></li>
          )}
        </ul>
      </div>

      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </header>
  );
};

export default Navbar;
