import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingBag, FiMenu, FiX, FiInstagram, FiFacebook } from 'react-icons/fi';
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

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="announcement-bar">
        <div className="announcement-social">
          <a href="https://instagram.com/amarace" target="_blank" rel="noopener noreferrer"><FiInstagram /></a>
          <a href="https://facebook.com/amarace" target="_blank" rel="noopener noreferrer"><FiFacebook /></a>
        </div>
        <div className="announcement-text">
          <span>Free shipping for all orders over ₱500+ • Premium beauty essentials</span>
        </div>
        <div className="announcement-right"><span>🇵🇭 PHP</span></div>
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
            </ul>
          </div>

          <Link to="/" className="navbar-logo">AmaraCé</Link>

          <div className="nav-right">
            <button className="nav-icon" onClick={() => setSearchOpen(!searchOpen)}><FiSearch /></button>
            <Link to={user ? '/profile' : '/login'} className="nav-icon desktop-only"><FiUser /></Link>
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
