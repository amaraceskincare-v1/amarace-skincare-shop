import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiRefreshCw, FiMessageCircle, FiCreditCard, FiStar } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import '../styles/Home.css';
import { optimizeImage } from '../utils/imageOptimizer';

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({
    'Lip Tint': 0,
    'Fragrance': 0,
    'Artisan Soap': 0,
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
    document.title = 'AmaraCé | Premium Skincare & Beauty Essentials';
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

    const fetchAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchSettings(),
          fetchFeaturedProducts(),
          fetchBestSellers(),
          fetchAllProductsAndCountCategories()
        ]);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Determine slides to show
  const displaySlides = (() => {
    // If we have settings and hero images, use them
    if (settings?.heroImages?.length > 0) {
      return settings.heroImages.map((img, i) => ({
        title: i === 0 ? 'THE FUTURE OF SKINCARE' : 'BEST SELLERS 2026',
        subtitle: i === 0 ? 'Experience the Ultimate Glow' : 'Discover Your New Routine',
        image: img,
        cta: i === 0 ? 'Shop Now' : 'Explore All'
      }));
    }

    // If still loading, show a neutral loading slide
    if (loading) {
      return [{
        title: 'LOADING YOUR EXPERIENCE...',
        subtitle: 'Preparing the ultimate skincare ritual',
        image: '',
        cta: 'Please Wait'
      }];
    }

    // Fallback if no images found in settings after loading
    return [
      {
        title: 'WELCOME TO AMARACÉ',
        subtitle: 'Experience Premium Beauty and Self-Care Essentials',
        image: '/logo.png',
        cta: 'Shop Now'
      }
    ];
  })();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over ₱500' },
    { icon: FiRefreshCw, title: 'Money Guarantee', desc: '7-day return policy' },
    { icon: FiMessageCircle, title: 'Online Support', desc: '24/7 customer care' },
    { icon: FiCreditCard, title: 'Flexible Payment', desc: 'Multiple options' }
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      product: 'Allure Lip Tint',
      rating: 5,
      text: 'Absolutely love this lip tint! The color is so vibrant and it lasts all day. Will definitely buy again!'
    },
    {
      name: 'Ana Cruz',
      product: 'Clinique Happy Perfume',
      rating: 5,
      text: 'The scent is amazing and lasts for hours. I get compliments everywhere I go!'
    },
    {
      name: 'Jessica Reyes',
      product: 'Barbie Whitening Soap',
      rating: 5,
      text: 'My skin has never felt so soft and smooth. This soap is now a staple in my skincare routine.'
    }
  ];

  const marqueeTexts = ['Premium Quality', 'Fast Delivery', 'Best Sellers', 'New Arrivals'];

  const categories = [
    {
      name: 'Lip Tints',
      count: `${categoryCounts['Lip Tint']} items`,
      image: optimizeImage(settings?.lipTintImage || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80', 600),
      path: '/products?category=Lip%20Tint'
    },
    {
      name: 'Fragrances',
      count: `${categoryCounts['Perfume'] || 0} items`,
      image: optimizeImage(settings?.perfumeImage || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80', 600),
      path: '/products?category=Perfume'
    },
    {
      name: 'Artisan Soaps',
      count: `${categoryCounts['Beauty Soap'] || 0} items`,
      image: optimizeImage(settings?.beautySoapImage || 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&q=80', 600),
      path: '/products?category=Beauty%20Soap'
    },
    {
      name: 'All Best Sellers',
      count: `${categoryCounts['All']} items`,
      image: optimizeImage(settings?.allBestSellersImage || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80', 600),
      path: '/products'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Slider */}
      <section className="hero-section premium-hero">
        {displaySlides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: !isVideo(slide.image) && slide.image ? `linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url(${optimizeImage(slide.image, 1600)})` : 'none',
              backgroundColor: slide.image ? (isVideo(slide.image) ? 'transparent' : '#f8f9fa') : 'linear-gradient(135deg, #e8b4bc 0%, #f5e6e8 100%)',
              backgroundSize: slide.image === '/logo.png' ? 'contain' : 'cover', // special case for logo
              backgroundRepeat: 'no-repeat'
            }}
          >
            {isVideo(slide.image) && (
              <div className="hero-video-wrapper">
                <video
                  src={slide.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <div className="hero-video-overlay"></div>
              </div>
            )}

            <div className="hero-content-v2">
              <div className="hero-badge animate-fadeInUp delay-1">Free Shipping on Orders ₱500+</div>
              <h1 className="hero-title-v2 animate-fadeInUp delay-2">
                {slide.title.includes('|') ? (
                  <>
                    {slide.title.split('|')[0]}
                    <span className="hero-title-accent">{slide.title.split('|')[1]}</span>
                  </>
                ) : slide.title}
              </h1>
              <p className="hero-subtitle-v2 animate-fadeInUp delay-3">{slide.subtitle}</p>

              <div className="hero-actions-v2 animate-fadeInUp delay-4">
                <Link to="/products" className="hero-btn-v2 primary">
                  {slide.cta} <span className="btn-arrow">→</span>
                </Link>
                <Link to="/about" className="hero-btn-v2 secondary">
                  {t('about')}
                </Link>
              </div>

              <div className="hero-social-proof animate-fadeInUp delay-5">
                <div className="customer-avatars">
                  <div className="avatar">JS</div>
                  <div className="avatar">MC</div>
                  <div className="avatar">AR</div>
                </div>
                <span>Join 10,000+ Happy Customers</span>
              </div>
            </div>

            <div className="hero-scroll-indicator">
              <div className="mouse">
                <div className="wheel"></div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Category Grid Redesign */}
      <section className="shop-by-category">
        <div className="section-header-modern">
          <span className="section-tagline">Browse Collections</span>
          <h2 className="section-title-v2">Shop by Category</h2>
          <div className="section-divider-v2"></div>
        </div>

        <div className="categories-grid-v2">
          {categories.map((cat, index) => (
            <Link to={cat.path} key={index} className={`category-card-v2 cat-${index}`}>
              <div className="category-visual">
                <div className="category-bg-gradient"></div>
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="category-img-v2"
                  loading="lazy"
                  width="200"
                  height="200"
                />
                <div className="category-overlay-v2">
                  <span className="view-btn">Discover →</span>
                </div>
              </div>
              <div className="category-info-v2">
                <h3 className="category-name-v2">{cat.name}</h3>
                <span className="category-count-v2">{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="featured-section centered-section">
          <div className="section-header-modern">
            <span className="section-tagline">Handpicked favorites for you</span>
            <h2 className="section-title-v2">{t('featured')} <span className="title-accent">Products</span></h2>
            <div className="section-divider-v2"></div>
          </div>
          <div className="products-grid-v2">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="section-cta-v2">
            <Link to="/products?featured=true" className="btn-modern-outline">
              Shop All Featured <span className="btn-arrow">→</span>
            </Link>
          </div>
        </section>
      )}

      {/* Best Sellers Section */}
      <section className="bestsellers-section-v2 centered-section">
        <div className="section-header-modern">
          <span className="section-tagline">Trending Now</span>
          <h2 className="section-title-v2">Our <span className="title-accent">{t('Best Selling')}</span></h2>
          <div className="section-divider-v2"></div>
        </div>

        <div className="products-grid-v2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="product-skeleton-v2">
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
            <p className="no-data-msg">No trending products found.</p>
          )}
        </div>
      </section>

      {/* Two-Panel Premium Banner */}
      <section className="premium-banner-v2">
        <div className="banner-panel dark-panel">
          <div className="panel-content">
            <span className="panel-tagline">Premium Collection</span>
            <h2 className="panel-title">Beauty<br />Essentials</h2>
            <p className="panel-desc">Discover our bestselling formulas that customers can't get enough of.</p>
            <Link to="/products" className="panel-btn">Shop Collection</Link>
          </div>
          <div className="panel-decoration">
            <div className="sparkle s1">✦</div>
            <div className="sparkle s2">✦</div>
          </div>
        </div>
        <div className="banner-panel light-panel">
          {isVideo(settings?.premiumBannerMedia) ? (
            <video
              src={settings.premiumBannerMedia}
              autoPlay
              loop
              muted
              playsInline
              className="full-panel-img"
            />
          ) : (
            <img
              src={settings?.premiumBannerMedia || "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1000&q=80"}
              alt="Product Showcase"
              className="full-panel-img"
              loading="lazy"
            />
          )}
        </div>
      </section>

      {/* Testimonials Redesign */}
      <section className="testimonials-section-v2">
        <div className="section-header-modern">
          <span className="section-tagline">LOVED BY OUR LOCAL CUSTOMERS</span>
          <h2 className="section-title-v2">What Our <span className="title-accent">Customers Say</span></h2>
          <div className="section-divider-v2"></div>
          <p className="testimonial-summary">4.9/5 average customer rating</p>
        </div>

        <div className="testimonials-grid-v2">
          {testimonials.map((t, index) => (
            <div key={index} className="testimonial-card-v2">
              <div className="t-card-header">
                <div className="t-stars">
                  {[...Array(t.rating)].map((_, i) => (
                    <FiStar key={i} fill="var(--brand-primary)" color="var(--brand-primary)" />
                  ))}
                  <span className="t-rating-val">5.0</span>
                </div>
                <div className="t-badge"><FiStar /> Verified Buyer</div>
              </div>
              <p className="t-text">"{t.text}"</p>
              <div className="t-footer">
                <div className="t-avatar">{t.name.charAt(0)}</div>
                <div className="t-info">
                  <span className="t-name">{t.name}</span>
                  <span className="t-product">Purchased: {t.product}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Features Redesign */}
      <section className="trust-features-v2">
        <div className="features-grid-v2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="feature-card-v2">
                <div className="feature-icon-v2">
                  <Icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Follow Our Journey Gallery */}
      {settings?.galleryImages && settings.galleryImages.length > 0 && (
        <section className="gallery-section">
          <div className="section-header-modern">
            <span className="section-tagline">Instagram</span>
            <h2 className="section-title-v2">Follow Our Journey</h2>
            <div className="section-divider-v2"></div>
          </div>

          {/* Facebook Icon */}
          <div className="instagram-social-link">
            <a
              href="https://facebook.com/AmaraCeSkinCare"
              target="_blank"
              rel="noopener noreferrer"
              className="facebook-link-circle"
            >
              <div className="facebook-icon-wrapper">
                <FaFacebookF size={24} />
              </div>
            </a>
          </div>

          <div className="gallery-grid">
            {settings.galleryImages.map((img, index) => (
              <div key={index} className="gallery-item">
                <img src={img} alt={`Gallery ${index + 1}`} loading="lazy" />
                <div className="gallery-overlay">
                  <span className="gallery-icon">📷</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;