import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiRefreshCw, FiMessageCircle, FiCreditCard, FiStar } from 'react-icons/fi';
import api from '../utils/api';
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
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: 'New Arrivals',
      subtitle: 'Premium Beauty Collection',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920&q=80',
      cta: 'Shop Now'
    },
    {
      title: 'Best Sellers',
      subtitle: 'Discover Our Top Picks',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=80',
      cta: 'Explore'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch best sellers
        const bestSellersRes = await api.get('/products?bestSeller=true&limit=5');
        setBestSellers(bestSellersRes.data.products || []);

        // Fetch featured products
        const featuredRes = await api.get('/products?featured=true&limit=5');
        setFeaturedProducts(featuredRes.data.products || []);

        // Fetch all products to count by category
        const allProductsRes = await api.get('/products?limit=1000');
        const allProducts = allProductsRes.data.products || [];

        // Count products by category
        const counts = {
          'Lip Tint': allProducts.filter(p => p.category === 'Lip Tint').length,
          'Perfume': allProducts.filter(p => p.category === 'Perfume').length,
          'Beauty Soap': allProducts.filter(p => p.category === 'Beauty Soap').length,
          'All': allProducts.length
        };
        setCategoryCounts(counts);

      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-slide hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    {
      name: 'Lip Tints',
      count: `${categoryCounts['Lip Tint']} items`,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
      path: '/products?category=Lip%20Tint'
    },
    {
      name: 'Perfumes',
      count: `${categoryCounts['Perfume']} items`,
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80',
      path: '/products?category=Perfume'
    },
    {
      name: 'Beauty Soaps',
      count: `${categoryCounts['Beauty Soap']} items`,
      image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&q=80',
      path: '/products?category=Beauty%20Soap'
    },
    {
      name: 'All Products',
      count: `${categoryCounts['All']} items`,
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
      path: '/products'
    }
  ];

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

  return (
    <div className="home-page">
      {/* Hero Slider */}
      <section className="hero-section">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <span className="hero-label">{slide.subtitle}</span>
              <h1 className="hero-title">{slide.title}</h1>
              <Link to="/products" className="hero-btn">{slide.cta}</Link>
            </div>
          </div>
        ))}
        <div className="hero-dots">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Intro Section */}
      <section className="intro-section">
        <p className="intro-text">
          Living out every single day with confidence and beauty
        </p>
        <p className="intro-subtext">
          Discover our curated collection of premium beauty products designed to enhance your natural glow.
        </p>
        <Link to="/products" className="intro-link">
          Shop Collection
        </Link>
      </section>

      {/* Category Slider */}
      <section className="category-section">
        <div className="category-slider">
          {categories.map((cat, index) => (
            <Link to={cat.path} key={index} className="category-item">
              <div className="category-image">
                <img src={cat.image} alt={cat.name} />
              </div>
              <h3>{cat.name}</h3>
              <span>{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <h2>Featured <span>Products</span></h2>
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
          <h2>You are in <span>best sellers</span></h2>
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

      {/* Instagram Feed */}
      <section className="instagram-section">
        <h2 className="section-title">
          Follow us <span>Instagram</span>
        </h2>
        <div className="instagram-grid">
          {[
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
            'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
            'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80',
            'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80',
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80'
          ].map((img, index) => (
            <a
              key={index}
              href="https://instagram.com/amarace"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-item"
            >
              <img src={img} alt="Instagram" />
            </a>
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