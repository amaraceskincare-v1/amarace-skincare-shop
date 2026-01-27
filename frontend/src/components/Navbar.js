import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingBag, FiMenu, FiX, FiChevronDown, FiHeart } from 'react-icons/fi';
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
  const [userDropdown, setUserDropdown] = useState(false);
  const langRef = useRef(null);
  const userRef = useRef(null);
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
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

  const handleLangSelect = (lang) => {
    setSelectedLang(lang);
    setLangOpen(false);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      {/* Level 1: Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-left">
          <FiShoppingBag /> <span>Free Shipping for orders over ₱500</span>
        </div>
        <div className="announcement-right">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/help">Help Center</Link>
          <a href="tel:+639152662648">Call Us: +639152662648</a>
        </div>
      </div>

      {/* Level 2: Logo & Actions Bar */}
      <div className="logo-bar">
        <div className="logo-bar-container">
          <div className="logo-spacer"></div> {/* For centering logo */}

          <Link to="/" className="navbar-logo">
            <div className="logo-emblem">AC</div>
            <span>AmaraCé Skin Care</span>
          </Link>

          <div className="nav-actions">
            <button className="nav-action-btn search-btn" onClick={() => setSearchOpen(true)}>
              <FiSearch />
            </button>
            <div className="user-nav-wrapper" ref={userRef}>
              <button className="nav-action-btn" onClick={() => setUserDropdown(!userDropdown)}>
                <FiUser />
                <FiChevronDown className={`user-arrow ${userDropdown ? 'open' : ''}`} />
              </button>
              {userDropdown && (
                <div className="user-dropdown-menu">
                  {user ? (
                    <>
                      <div className="user-info-header">Hi, {user.name}</div>
                      <Link to="/profile" onClick={() => setUserDropdown(false)}>My Profile</Link>
                      <Link to="/orders" onClick={() => setUserDropdown(false)}>My Orders</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="admin-special-link" onClick={() => setUserDropdown(false)}>Admin Dashboard</Link>
                      )}
                      <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setUserDropdown(false)}>Login</Link>
                      <Link to="/register" onClick={() => setUserDropdown(false)}>Register</Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link to="/wishlist" className="nav-action-btn">
              <FiHeart />
            </Link>
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
          <li><Link to="/products" className={isActive('/products') ? 'active' : ''}>SHOP ALL</Link></li>
          <li><Link to="/products?category=Lip+Tint" className={location.search.includes('Lip+Tint') ? 'active' : ''}>LIP TINTS</Link></li>
          <li><Link to="/products?category=Perfume" className={location.search.includes('Perfume') ? 'active' : ''}>PERFUMES</Link></li>
          <li><Link to="/products?category=Beauty+Soap" className={location.search.includes('Beauty+Soap') ? 'active' : ''}>BEAUTY SOAPS</Link></li>
        </ul>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-nav ${menuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-header">
          <Link to="/" className="mobile-logo" onClick={() => setMenuOpen(false)}>AmaraCé</Link>
          <button className="close-menu" onClick={() => setMenuOpen(false)}><FiX /></button>
        </div>
        <ul className="mobile-links">
          <li><Link to="/products" onClick={() => setMenuOpen(false)}>SHOP ALL</Link></li>
          <li><Link to="/products?category=Lip+Tint" onClick={() => setMenuOpen(false)}>LIP TINTS</Link></li>
          <li><Link to="/products?category=Perfume" onClick={() => setMenuOpen(false)}>PERFUMES</Link></li>
          <li><Link to="/products?category=Beauty+Soap" onClick={() => setMenuOpen(false)}>BEAUTY SOAPS</Link></li>
          <li><Link to="/products?sale=true" onClick={() => setMenuOpen(false)}>SALE</Link></li>
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
