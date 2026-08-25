import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiRefreshCw, FiMessageCircle, FiCreditCard, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaFacebookF } from 'react-icons/fa';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import '../styles/Home.css';
import { optimizeImage } from '../utils/imageOptimizer';

const SLIDE_DURATION = 5500; // ms

const Home = () => {
  const [bestSellers, setBestSellers]           = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals]           = useState([]);
  const [categoryCounts, setCategoryCounts]     = useState({ 'Lip Tint': 0, 'Perfume': 0, 'Bath and Body': 0, 'All': 0 });
  const [loading, setLoading]                   = useState(true);
  const [currentSlide, setCurrentSlide]         = useState(0);
  const [slideKey, setSlideKey]                 = useState(0); // for progress bar reset
  const [settings, setSettings]                 = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [newsletterEmail, setNewsletterEmail]   = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterDone, setNewsletterDone]     = useState(false);
  const { t } = useLanguage();
  const revealRef = useRef(null);

  /* ── Helpers ──────────────────────────────────────── */
  const isVideo = (url) => {
    if (!url) return false;
    return ['.mp4', '.mov', '.webm', '.m4v'].some(ext => url.toLowerCase().includes(ext));
  };

  /* ── Scroll Reveal ────────────────────────────────── */
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  /* ── Data Fetching ────────────────────────────────── */
  useEffect(() => {
    document.title = 'AmaraCé | Premium Skincare & Beauty Essentials';

    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data) setSettings({ ...data, heroImages: data.heroImages || [] });
      } catch (e) { console.error('Settings fetch failed:', e); }
    };

    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products?featured=true');
        setFeaturedProducts(data?.products || []);
      } catch (e) { console.error('Featured fetch failed:', e); }
    };

    const fetchBestSellers = async () => {
      try {
        const { data } = await api.get('/products?bestSeller=true');
        setBestSellers(data?.products || []);
      } catch (e) { console.error('Best sellers fetch failed:', e); }
    };

    const fetchNewArrivals = async () => {
      try {
        const { data } = await api.get('/products?isNewProduct=true&limit=8');
        setNewArrivals(data?.products || []);
      } catch (e) { console.error('New arrivals fetch failed:', e); }
    };

    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/products?limit=1000');
        const products = data?.products || [];
        const counts = { 'Lip Tint': 0, 'Perfume': 0, 'Bath and Body': 0, 'All': products.length };
        products.forEach(p => {
          if (p?.category && counts[p.category] !== undefined) counts[p.category]++;
        });
        setCategoryCounts(counts);
      } catch (e) {
        console.error('Category fetch failed:', e);
      } finally {
        setLoading(false);
      }
    };

    const fetchAll = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchSettings(), fetchFeatured(), fetchBestSellers(), fetchNewArrivals(), fetchCategories()]);
      } catch (e) {
        console.error('Homepage data fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  /* ── Compute Slides ───────────────────────────────── */
  const displaySlides = (() => {
    if (settings?.heroImages?.length > 0) {
      const luxuryCopy = [
        {
          eyebrow: 'New Collection · 2026',
          title: 'Reveal Your\nRadiant Self.',
          subtitle: 'Luxury skincare rituals, crafted for the modern woman.',
          cta: 'Shop the Collection',
          ctaSecondary: 'Our Story'
        },
        {
          eyebrow: 'Best Sellers',
          title: 'The Rituals\nThey Love.',
          subtitle: "Discover the formulas our customers can't live without.",
          cta: 'Shop Best Sellers',
          ctaSecondary: 'All Products'
        },
        {
          eyebrow: 'Premium Beauty',
          title: 'Effortless\nLuxury.',
          subtitle: 'From lip tints to signature fragrances — beauty redefined.',
          cta: 'Explore Now',
          ctaSecondary: 'Learn More'
        }
      ];
      return settings.heroImages.map((img, i) => ({
        image: img,
        ...luxuryCopy[i % luxuryCopy.length]
      }));
    }
    if (loading) {
      return [{ eyebrow: '', title: 'AmaraCé', subtitle: 'Preparing your premium experience…', cta: '', image: '' }];
    }
    return [{ eyebrow: 'Premium Skincare', title: 'Reveal Your\nRadiant Self.', subtitle: 'Luxury skincare rituals crafted for the modern woman.', cta: 'Shop Now', ctaSecondary: 'Our Story', image: '' }];
  })();

  /* ── Slide Auto-advance ───────────────────────────── */
  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % displaySlides.length;
        setSlideKey(k => k + 1);
        return next;
      });
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [displaySlides.length]);

  const goToSlide = useCallback((idx) => {
    setCurrentSlide(idx);
    setSlideKey(k => k + 1);
  }, []);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + displaySlides.length) % displaySlides.length);
  }, [currentSlide, displaySlides.length, goToSlide]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % displaySlides.length);
  }, [currentSlide, displaySlides.length, goToSlide]);

  /* ── Testimonials ─────────────────────────────────── */
  const testimonials = [
    {
      name: 'Maria Santos',
      product: 'Allure Lip Tint',
      rating: 5,
      text: "Absolutely love this lip tint! The color is so vibrant and it lasts all day. My go-to for every occasion — I will definitely buy again!"
    },
    {
      name: 'Ana Cruz',
      product: 'Clinique Happy Perfume',
      rating: 5,
      text: "The scent is amazing and lasts for hours. I get compliments everywhere I go. It's become my signature fragrance!"
    },
    {
      name: 'Jessica Reyes',
      product: 'Barbie Whitening Soap',
      rating: 5,
      text: "My skin has never felt so soft and smooth. This soap is now a staple in my skincare routine. Highly recommend to everyone."
    }
  ];

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  /* ── Features / Trust Strip ───────────────────────── */
  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On all orders over ₱500' },
    { icon: FiRefreshCw, title: '7-Day Returns', desc: 'Hassle-free guarantee' },
    { icon: FiMessageCircle, title: '24/7 Support', desc: 'Always here for you' },
    { icon: FiCreditCard, title: 'Secure Payment', desc: 'Multiple safe options' }
  ];

  /* ── Categories ───────────────────────────────────── */
  const categories = [
    {
      name: 'Lip Tints',
      count: `${categoryCounts['Lip Tint']} items`,
      image: settings?.lipTintImage ? optimizeImage(settings.lipTintImage, 800) : null,
      path: '/products?category=Lip%20Tint',
      tagline: 'Find your perfect shade'
    },
    {
      name: 'Fragrances',
      count: `${categoryCounts['Perfume'] || 0} items`,
      image: settings?.perfumeImage ? optimizeImage(settings.perfumeImage, 800) : null,
      path: '/products?category=Perfume',
      tagline: 'Your signature scent'
    },
    {
      name: 'Bath & Body',
      count: `${categoryCounts['Bath and Body'] || 0} items`,
      image: settings?.beautySoapImage ? optimizeImage(settings.beautySoapImage, 800) : null,
      path: '/products?category=Bath%20and%20Body',
      tagline: 'Indulge in self-care'
    },
    {
      name: 'Shop All',
      count: `${categoryCounts['All']} items`,
      image: settings?.allBestSellersImage ? optimizeImage(settings.allBestSellersImage, 800) : null,
      path: '/products',
      tagline: 'Explore everything'
    }
  ];

  /* ── Newsletter (homepage CTA) ────────────────────── */
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email: newsletterEmail });
      setNewsletterDone(true);
      setNewsletterEmail('');
    } catch (err) {
      console.error('Newsletter error:', err);
    } finally {
      setNewsletterLoading(false);
    }
  };

  /* ── Skeleton ─────────────────────────────────────── */
  const Skeleton = () => (
    <div className="products-grid-v2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="product-skeleton-v2">
          <div className="skeleton-image" />
          <div className="skeleton-info">
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
            <div className="skeleton-line xshort" />
          </div>
        </div>
      ))}
    </div>
  );

  const slide = displaySlides[currentSlide] || displaySlides[0];

  return (
    <div className="home-page">

      {/* ════════════════════════════════════════════
          1. CINEMATIC HERO
          ════════════════════════════════════════════ */}
      <section className="hero-section premium-hero" aria-label="Featured Campaign">

        {/* Slide Backgrounds */}
        {displaySlides.map((s, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          >
            {isVideo(s.image) ? (
              <div className="hero-video-wrapper">
                <video src={s.image} autoPlay loop muted playsInline />
                <div className="hero-video-overlay" />
              </div>
            ) : s.image ? (
              <div
                className="hero-image-bg"
                style={{ backgroundImage: `url(${optimizeImage(s.image, 1920)})` }}
              />
            ) : (
              <div className="hero-gradient-bg" />
            )}
          </div>
        ))}

        {/* Dark overlay for text readability */}
        <div className="hero-overlay" />

        {/* Hero Content */}
        <div className="hero-content-v2">
          {slide.eyebrow && (
            <div className="hero-eyebrow animate-fadeInUp delay-1">
              <span className="eyebrow-line" />
              {slide.eyebrow}
            </div>
          )}
          <h1 className="hero-title-v2 animate-fadeInUp delay-2">
            {slide.title?.split('\n').map((line, i) => (
              <span key={i} className="title-line">{line}</span>
            ))}
          </h1>
          {slide.subtitle && (
            <p className="hero-subtitle-v2 animate-fadeInUp delay-3">{slide.subtitle}</p>
          )}
          <div className="hero-actions-v2 animate-fadeInUp delay-4">
            {slide.cta && (
              <Link to="/products" className="hero-btn-v2 primary">
                {slide.cta}
                <span className="btn-arrow">→</span>
              </Link>
            )}
            {slide.ctaSecondary && (
              <Link to="/about" className="hero-btn-v2 secondary">
                {slide.ctaSecondary}
              </Link>
            )}
          </div>

          {/* Social Proof */}
          <div className="hero-social-proof animate-fadeInUp delay-5">
            <div className="customer-avatars">
              <div className="avatar">JS</div>
              <div className="avatar">MC</div>
              <div className="avatar">AR</div>
            </div>
            <span>Join 10,000+ happy customers</span>
          </div>
        </div>

        {/* Slide Controls */}
        {displaySlides.length > 1 && (
          <>
            <button className="hero-arrow prev" onClick={prevSlide} aria-label="Previous slide">
              <FiChevronLeft />
            </button>
            <button className="hero-arrow next" onClick={nextSlide} aria-label="Next slide">
              <FiChevronRight />
            </button>

            {/* Dot Navigation */}
            <div className="hero-dots">
              {displaySlides.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Progress Bar */}
        <div className="hero-progress-bar">
          <div key={slideKey} className="hero-progress-fill" style={{ animationDuration: `${SLIDE_DURATION}ms` }} />
        </div>

        {/* Scroll Hint */}
        <div className="hero-scroll-hint">
          <span className="scroll-text">Scroll</span>
          <div className="mouse">
            <div className="wheel" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. TRUST / BENEFITS STRIP
          ════════════════════════════════════════════ */}
      <section className="trust-strip" data-reveal="fade-up">
        <div className="trust-strip-inner">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="trust-item" data-reveal="fade-up" data-reveal-delay={String(index + 1)}>
                <div className="trust-icon">
                  <Icon />
                </div>
                <div className="trust-text">
                  <strong>{feature.title}</strong>
                  <span>{feature.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. SHOP BY CATEGORY
          ════════════════════════════════════════════ */}
      <section className="shop-by-category">
        <div className="section-container">
          <div className="section-header-modern" data-reveal="fade-up">
            <span className="section-tagline">Browse Collections</span>
            <h2 className="section-title-v2">Shop by <em>Category</em></h2>
            <div className="section-divider-v2" />
          </div>

          <div className="categories-grid-v2">
            {categories.map((cat, index) => (
              <Link to={cat.path} key={index} className={`category-card-v2 cat-${index}`} data-reveal="scale" data-reveal-delay={String((index % 4) + 1)}>
                <div className="category-visual">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="category-img-v2"
                      loading="lazy"
                    />
                  ) : (
                    <div className="category-placeholder" />
                  )}
                  <div className="category-gradient-overlay" />
                  <div className="category-info-v2">
                    <span className="category-tagline-v2">{cat.tagline}</span>
                    <h3 className="category-name-v2">{cat.name}</h3>
                    <span className="category-count-v2">{cat.count}</span>
                    <span className="category-explore-btn">Discover →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. FEATURED PRODUCTS
          ════════════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="section-container">
            <div className="section-header-modern centered-section" data-reveal="fade-up">
              <span className="section-tagline">Handpicked Favorites</span>
              <h2 className="section-title-v2">{t('featured')} <em>Products</em></h2>
              <div className="section-divider-v2" />
            </div>
            <div data-reveal="fade-up">
              <div className="products-grid-v2">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
            <div className="section-cta-v2" data-reveal="fade-up">
              <Link to="/products?featured=true" className="btn-modern-outline">
                Shop All Featured <span className="btn-arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          5. BEST SELLERS
          ════════════════════════════════════════════ */}
      <section className="bestsellers-section-v2">
        <div className="section-container">
          <div className="section-header-modern centered-section" data-reveal="fade-up">
            <span className="section-tagline">Trending Now</span>
            <h2 className="section-title-v2">Our <em>Best Sellers</em></h2>
            <div className="section-divider-v2" />
          </div>
          <div data-reveal="fade-up">
            {loading ? (
              <Skeleton />
            ) : bestSellers.length > 0 ? (
              <div className="products-grid-v2">
                {bestSellers.map((product) => (
                  <ProductCard key={product._id} product={product} isBestSeller />
                ))}
              </div>
            ) : (
              <p className="no-data-msg">No trending products found.</p>
            )}
          </div>
          <div className="section-cta-v2" data-reveal="fade-up">
            <Link to="/products?bestSeller=true" className="btn-modern-outline">
              View All Best Sellers <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          6. PREMIUM CAMPAIGN BANNER
          ════════════════════════════════════════════ */}
      <section className="premium-banner-v2">
        <div className="banner-panel dark-panel">
          <div className="panel-content" data-reveal="fade-right">
            <span className="panel-tagline">Premium Collection</span>
            <h2 className="panel-title">Beauty<br />Essentials</h2>
            <p className="panel-desc">Discover our bestselling formulas that customers can't get enough of. Beauty that works.</p>
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
              autoPlay loop muted playsInline
              className="full-panel-img"
            />
          ) : settings?.premiumBannerMedia ? (
            <img
              src={settings.premiumBannerMedia}
              alt="AmaraCé Product Showcase"
              className="full-panel-img"
              loading="lazy"
            />
          ) : (
            <div className="banner-fallback-gradient" />
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          7. NEW ARRIVALS
          ════════════════════════════════════════════ */}
      {newArrivals.length > 0 && (
        <section className="new-arrivals-section">
          <div className="section-container">
            <div className="section-header-modern" data-reveal="fade-up">
              <span className="section-tagline">Just Dropped</span>
              <h2 className="section-title-v2">New <em>Arrivals</em></h2>
              <div className="section-divider-v2" />
            </div>
          </div>
          <div className="new-arrivals-track-wrapper" data-reveal="fade-up">
            <div className="new-arrivals-track">
              {newArrivals.map((product) => (
                <div key={product._id} className="new-arrival-card-wrapper">
                  <ProductCard product={product} isNewArrival />
                </div>
              ))}
            </div>
          </div>
          <div className="section-container">
            <div className="section-cta-v2" data-reveal="fade-up">
              <Link to="/products?isNewProduct=true" className="btn-modern-outline">
                View All New Arrivals <span className="btn-arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          8. TESTIMONIALS
          ════════════════════════════════════════════ */}
      <section className="testimonials-section-v2">
        <div className="section-container">
          <div className="section-header-modern centered-section" data-reveal="fade-up">
            <span className="section-tagline">Loved by Our Customers</span>
            <h2 className="section-title-v2">What They <em>Say</em></h2>
            <div className="section-divider-v2" />
            <p className="testimonial-summary">★★★★★ · 4.9/5 average rating</p>
          </div>

          <div className="testimonials-layout" data-reveal="fade-up">
            {/* Featured large testimonial */}
            <div className="testimonial-featured">
              <div className="t-quote-mark">"</div>
              <p className="t-quote-text">{testimonials[currentTestimonial].text}</p>
              <div className="t-featured-footer">
                <div className="t-avatar">{testimonials[currentTestimonial].name.charAt(0)}</div>
                <div className="t-info">
                  <span className="t-name">{testimonials[currentTestimonial].name}</span>
                  <span className="t-product">Purchased: {testimonials[currentTestimonial].product}</span>
                </div>
                <div className="t-stars">
                  {'★'.repeat(testimonials[currentTestimonial].rating)}
                </div>
              </div>
            </div>

            {/* Side testimonials */}
            <div className="testimonials-side">
              {testimonials.map((t, index) => (
                <div
                  key={index}
                  className={`testimonial-card-v2 ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                >
                  <div className="t-card-header">
                    <div className="t-stars-sm">{'★'.repeat(t.rating)}</div>
                    <span className="t-verified">✓ Verified</span>
                  </div>
                  <p className="t-text">"{t.text}"</p>
                  <div className="t-footer">
                    <div className="t-avatar t-avatar-sm">{t.name.charAt(0)}</div>
                    <div className="t-info">
                      <span className="t-name">{t.name}</span>
                      <span className="t-product">{t.product}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Dots */}
          <div className="testimonial-dots" data-reveal="fade-up">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`testimonial-dot${i === currentTestimonial ? ' active' : ''}`}
                onClick={() => setCurrentTestimonial(i)}
                aria-label={`View testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          9. BRAND STATEMENT + NEWSLETTER CTA
          ════════════════════════════════════════════ */}
      <section className="brand-statement">
        <div className="brand-statement-inner" data-reveal="fade">
          <span className="brand-statement-eyebrow">The AmaraCé Philosophy</span>
          <h2 className="brand-statement-headline">
            Beauty is a ritual,<br />
            <em>not a routine.</em>
          </h2>
          <p className="brand-statement-body">
            We believe every woman deserves skincare that doesn't just work — it transforms. Crafted with intention, elevated for the modern Filipina.
          </p>
          <div className="brand-statement-cta-row">
            <Link to="/about" className="brand-btn-ghost">Our Story →</Link>
          </div>

          {/* Inline Newsletter */}
          <div className="brand-newsletter">
            <p className="brand-newsletter-label">Join the Inner Circle · Get 10% off your first order</p>
            {newsletterDone ? (
              <div className="newsletter-success">
                ✓ Welcome to AmaraCé. Check your inbox.
              </div>
            ) : (
              <form className="brand-newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  required
                  aria-label="Email address for newsletter"
                />
                <button type="submit" disabled={newsletterLoading}>
                  {newsletterLoading ? 'Joining…' : 'Join Now'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          10. GALLERY (if available)
          ════════════════════════════════════════════ */}
      {settings?.galleryImages?.length > 0 && (
        <section className="gallery-section">
          <div className="section-container">
            <div className="section-header-modern centered-section" data-reveal="fade-up">
              <span className="section-tagline">
                <a href="https://facebook.com/amarace.skincare" target="_blank" rel="noopener noreferrer" className="social-handle-link">
                  <FaFacebookF /> @amarace.skincare
                </a>
              </span>
              <h2 className="section-title-v2">Follow Our <em>Journey</em></h2>
              <div className="section-divider-v2" />
            </div>
          </div>

          <div className="gallery-grid" data-reveal="fade-up">
            {settings.galleryImages.map((img, index) => (
              <div key={index} className="gallery-item">
                <img src={img} alt={`AmaraCé Gallery ${index + 1}`} loading="lazy" />
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