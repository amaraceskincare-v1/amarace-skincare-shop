import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiRefreshCw, FiMessageCircle, FiCreditCard, FiStar } from 'react-icons/fi';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import '../styles/Home.css';

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({
    'Lip Tint': 0,
    'Perfume': 0,
    'Beauty Soap': 0,
    'All': 0
  });

  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.m4v'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [settings, setSettings] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data) {
          setSettings({
            ...data,
            heroImages: data.heroImages || []
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await api.get('/products?featured=true');
        setFeaturedProducts(data?.products || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };

    const fetchBestSellers = async () => {
      try {
        const { data } = await api.get('/products?bestSeller=true');
        setBestSellers(data?.products || []);
      } catch (error) {
        console.error('Error fetching best sellers:', error);
      }
    };

    const fetchAllProductsAndCountCategories = async () => {
      try {
        const { data } = await api.get('/products?limit=1000');
        const products = data?.products || [];
        const counts = {
          'Lip Tint': 0,
          'Perfume': 0,
          'Beauty Soap': 0,
          'All': products.length
        };
        products.forEach(p => {
          if (p && p.category && counts[p.category] !== undefined) {
            counts[p.category]++;
          }
        });
        setCategoryCounts(counts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };

    fetchSettings();
    fetchFeaturedProducts();
    fetchBestSellers();
    fetchAllProductsAndCountCategories();
  }, []);

  // Use dynamic hero images if available, otherwise fallback to defaults
  const displaySlides = (settings?.heroImages && Array.isArray(settings.heroImages) && settings.heroImages.length > 0)
    ? settings.heroImages.map((img, i) => ({
      title: i === 0 ? 'THE FUTURE OF SKINCARE' : 'BEST SELLERS 2026',
      subtitle: i === 0 ? 'Experience the Ultimate Glow' : 'Discover Your New Routine',
      image: img,
      cta: i === 0 ? 'Shop Now' : 'Explore All'
    }))
    : [
      {
        title: 'THE FUTURE OF SKINCARE',
        subtitle: 'Experience the Ultimate Glow',
        image: 'https://images.unsplash.com/photo-1598440447192-383794a08832?w=1920&q=80',
        cta: 'Shop Now'
      },
      {
        title: 'BEST SELLERS 2026',
        subtitle: 'Discover Your New Routine',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1920&q=80',
        cta: 'Explore All'
      }
    ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over ₱500' },
    { icon: FiRefreshCw, title: 'Money Guarantee', desc: '30-day return policy' },
    { icon: FiMessageCircle, title: 'Online Support', desc: '24/7 customer care' },
    { icon: FiCreditCard, title: 'Flexible Payment', desc: 'Multiple options' }
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      product: 'Cherry Lip Tint',
      rating: 5,
      text: 'Absolutely love this lip tint! The color is so vibrant and it lasts all day. Will definitely buy again!'
    },
    {
      name: 'Ana Cruz',
      product: 'Vanilla Perfume',
      rating: 5,
      text: 'The scent is amazing and lasts for hours. I get compliments everywhere I go!'
    },
    {
      name: 'Jessica Reyes',
      product: 'Lavender Beauty Soap',
      rating: 5,
      text: 'My skin has never felt so soft and smooth. This soap is now a staple in my skincare routine.'
    }
  ];

  const marqueeTexts = ['Premium Quality', 'Fast Delivery', 'Best Sellers', 'New Arrivals'];

  const categories = [
    {
      name: 'Lip Tints',
      count: `${categoryCounts['Lip Tint']} items`,
      image: settings?.lipTintImage || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
      path: '/products?category=Lip%20Tint'
    },
    {
      name: 'Perfumes',
      count: `${categoryCounts['Perfume']} items`,
      image: settings?.perfumeImage || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80',
      path: '/products?category=Perfume'
    },
    {
      name: 'Beauty Soaps',
      count: `${categoryCounts['Beauty Soap']} items`,
      image: settings?.beautySoapImage || 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&q=80',
      path: '/products?category=Beauty%20Soap'
    },
    {
      name: 'All Best Sellers',
      count: `${categoryCounts['All']} items`,
      image: settings?.allBestSellersImage || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
      path: '/products'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Slider */}
      <section className="hero-section">
        {displaySlides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: !isVideo(slide.image) ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slide.image})` : 'none',
              backgroundColor: isVideo(slide.image) ? 'transparent' : '#000'
            }}
          >
            {isVideo(slide.image) && (
              <video
                src={slide.image}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            )}
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <span className="hero-label">{slide.subtitle}</span>
              <h1 className="hero-title">{slide.title}</h1>
              <div className="hero-actions">
                <Link to="/products" className="hero-btn primary">{slide.cta}</Link>
                <Link to="/about" className="hero-btn secondary">{t('about')}</Link>
              </div>
            </div>
          </div>
        ))}
        <div className="hero-dots">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Category Circles (Wix Signature) */}
      <section className="category-circles-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
        </div>
        <div className="category-circles-grid">
          {categories.map((cat, index) => (
            <Link to={cat.path} key={index} className="category-circle-item">
              <div className="circle-image">
                <img src={cat.image} alt={cat.name} />
              </div>
              <h3>{cat.name}</h3>
              <p>{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <h2>{t('featured')} <span>Products</span></h2>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="section-cta">
            <Link to="/products?featured=true" className="view-all-btn">View All Featured</Link>
          </div>
        </section>
      )}

      {/* Best Sellers Section */}
      <section className="bestsellers-section">
        <div className="section-header">
          <h2>You are in <span>{t('best_sellers')}</span></h2>
        </div>
        <div className="products-grid">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="product-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            ))
          ) : bestSellers.length > 0 ? (
            bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>
              No best sellers yet. Mark products as "Best Seller" in admin.
            </p>
          )}
        </div>
        <div className="section-cta">
          <Link to="/products?bestSeller=true" className="view-all-btn">View All</Link>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="promo-banner">
        <div className="promo-content">
          <span className="promo-label">Featured Collection</span>
          <h2>Premium Beauty<br />Essentials</h2>
          <p>Discover our bestselling products that customers love</p>
          <Link to="/products" className="promo-btn">Shop Now</Link>
        </div>
        <div className="promo-image">
          <img
            src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80"
            alt="Featured Collection"
          />
        </div>
      </section>

      {/* Text Marquee */}
      <section className="marquee-section">
        <div className="marquee-track">
          {[...marqueeTexts, ...marqueeTexts].map((text, index) => (
            <span key={index} className="marquee-item">
              {text} <span className="marquee-dot">★</span>
            </span>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <h2 className="section-title">Happy Customers</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar key={i} fill="#1a1a1a" />
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <strong>{testimonial.name}</strong>
                <span>Purchased: {testimonial.product}</span>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <Icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;