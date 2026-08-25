import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiMinus, FiPlus, FiStar, FiTruck, FiRefreshCw,
  FiHeart, FiCheck, FiChevronRight, FiShield,
  FiAward, FiDroplet, FiShare2
} from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { optimizeImage } from '../utils/imageOptimizer';
import { flyToCart } from '../utils/animations';
import { trackProductView, trackAddToCart, trackCheckoutStart, getProductActiveViewers } from '../utils/analytics';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeViewers, setActiveViewers] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const mainCtaRef = useRef(null);
  const reviewsRef = useRef(null);

  // Wishlist state
  const [wishlisted, setWishlisted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('amarace_wishlist') || '[]');
      return saved.includes(id);
    } catch { return false; }
  });

  const handleWishlist = () => {
    setWishlisted(prev => {
      const next = !prev;
      try {
        const saved = JSON.parse(localStorage.getItem('amarace_wishlist') || '[]');
        const updated = next ? [...saved, id] : saved.filter(itemId => itemId !== id);
        localStorage.setItem('amarace_wishlist', JSON.stringify(updated));
      } catch { /* ignore */ }
      return next;
    });
  };

  // Helper to render bullet points cleanly
  const renderTextWithBullets = (text) => {
    if (!text) return null;
    const hasBullets = text.includes('•') || text.includes('- ') || text.includes('\n');
    if (!hasBullets) return <p className="tab-paragraph">{text}</p>;

    let lines = [];
    if (text.includes('\n')) {
      lines = text.split('\n');
    } else if (text.includes('•')) {
      lines = text.split('•').filter(Boolean);
    } else {
      lines = [text];
    }

    return (
      <ul className="product-info-list">
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^[•\-\s]+/, '').trim();
          if (!cleanLine) return null;
          return <li key={idx}>{cleanLine}</li>;
        })}
      </ul>
    );
  };

  // Fetch product data
  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        setSelectedImage(0);
        setQuantity(1);

        // Document SEO Title
        if (data?.name) {
          document.title = `${data.name} | AmaraCé Skincare`;
        }

        // Track Product View event
        trackProductView(data);

        // Fetch active viewers for this item
        getProductActiveViewers(id).then(count => setActiveViewers(count));

        // Fetch related products in the same category
        if (data?.category) {
          const relRes = await api.get(`/products?category=${encodeURIComponent(data.category)}&limit=5`);
          const filtered = (relRes.data?.products || []).filter(p => p._id !== id).slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (error) {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, navigate]);

  // Observer for sticky purchase bar
  useEffect(() => {
    const handleScroll = () => {
      if (!mainCtaRef.current) return;
      const rect = mainCtaRef.current.getBoundingClientRect();
      // Show sticky bar when main CTA is scrolled above viewport
      setShowStickyBar(rect.bottom < 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = async (e) => {
    const btn = e.currentTarget;
    flyToCart(btn);

    try {
      await addToCart(product._id, quantity, product);
      trackAddToCart(product, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);

      // Open cart drawer
      if (window.openCartDrawer) {
        setTimeout(() => window.openCartDrawer(), 600);
      }
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product._id, quantity, product);
      trackAddToCart(product, quantity);
      trackCheckoutStart([{ product: product._id, quantity, price: product.price }], product.price * quantity);
      navigate('/checkout');
    } catch {
      toast.error('Failed to process Buy Now');
    }
  };

  const scrollToReviews = (e) => {
    e.preventDefault();
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="product-detail-page-v2">
        <div className="product-detail-skeleton-container">
          <div className="skeleton-gallery-v2" />
          <div className="skeleton-info-pane-v2">
            <div className="skeleton-line-v2 tag" />
            <div className="skeleton-line-v2 title" />
            <div className="skeleton-line-v2 price" />
            <div className="skeleton-line-v2 block" />
            <div className="skeleton-line-v2 cta" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : ['/placeholder.jpg'];
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock === 0;

  return (
    <div className="product-detail-page-v2">
      {/* ── Breadcrumbs ─────────────────────────────────── */}
      <nav className="detail-breadcrumb-bar" aria-label="Breadcrumb">
        <div className="breadcrumb-inner">
          <Link to="/">Home</Link>
          <span className="b-sep">/</span>
          <Link to="/products">Shop</Link>
          {product.category && (
            <>
              <span className="b-sep">/</span>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`}>
                {product.category}
              </Link>
            </>
          )}
          <span className="b-sep">/</span>
          <span className="b-current">{product.name}</span>
        </div>
      </nav>

      {/* ── Main Product Section ───────────────────────── */}
      <div className="product-layout-v2">
        {/* Left: Sticky Image Gallery */}
        <div className="product-gallery-v2">
          <div className="main-image-container-v2">
            <img
              src={optimizeImage(images[selectedImage], 900)}
              alt={product.name}
              className="main-view-v2"
              loading="eager"
            />

            {/* Badges */}
            <div className="gallery-badge-layer">
              {isOutOfStock ? (
                <span className="detail-badge sold-out">Sold Out</span>
              ) : product.bestSeller ? (
                <span className="detail-badge best-seller">★ Best Seller</span>
              ) : product.newArrival || product.isNewProduct ? (
                <span className="detail-badge new">New Arrival</span>
              ) : null}
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              className={`detail-wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="thumbnails-grid-v2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumb-item-v2 ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`View product image ${idx + 1}`}
                >
                  <img src={optimizeImage(img, 180)} alt={`${product.name} thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Main Info */}
        <div className="product-main-info-v2">
          <div className="info-header-v2">
            <span className="info-category-v2">{product.category || 'Collection'}</span>
            <h1 className="info-title-v2">{product.name}</h1>

            <div className="info-meta-v2">
              <a href="#reviews" className="info-rating-link" onClick={scrollToReviews}>
                <div className="info-rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      fill={i < Math.round(product.ratings || 5) ? 'var(--brand-primary)' : 'none'}
                      stroke={i < Math.round(product.ratings || 5) ? 'var(--brand-primary)' : '#ccc'}
                      size={15}
                    />
                  ))}
                </div>
                <span className="review-count-text">
                  {product.numReviews || 0} {product.numReviews === 1 ? 'Review' : 'Reviews'}
                </span>
              </a>

              <div className="sku-tag">SKU: AM-{product._id?.slice(-6).toUpperCase()}</div>
            </div>

            {/* Real-time Viewers Count */}
            <div className="detail-live-viewers">
              <span className="live-pulse-dot" />
              <span>{activeViewers} {activeViewers === 1 ? 'person is' : 'people are'} looking at this item right now</span>
            </div>
          </div>

          {/* Price Block */}
          <div className="info-price-v2">
            <span className="price-current-v2">₱{product.price?.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="price-old-v2">₱{product.originalPrice.toFixed(2)}</span>
                <span className="price-save-v2">SAVE {discountPercent}%</span>
              </>
            )}
          </div>

          {/* Stock Availability */}
          <div className="stock-indicator-row">
            {isOutOfStock ? (
              <span className="stock-pill out">✕ Currently Sold Out</span>
            ) : product.stock <= 5 ? (
              <span className="stock-pill low">⚠ Only {product.stock} left in stock — order soon</span>
            ) : (
              <span className="stock-pill in">✓ In Stock — Ready to Ship</span>
            )}
          </div>

          {/* Short Excerpt */}
          <div className="info-description-v2">
            <p>{product.description}</p>
          </div>

          {/* Purchase Controls */}
          <div className="purchase-controls-v2" ref={mainCtaRef}>
            <div className="control-group-v2">
              <label>Quantity</label>
              <div className="quantity-box-v2">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Decrease quantity"
                >
                  <FiMinus />
                </button>
                <input type="number" value={quantity} readOnly aria-label="Selected quantity" />
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  aria-label="Increase quantity"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            <div className="actions-stack-v2">
              <button
                type="button"
                className={`btn-add-to-cart-v2 ${addedSuccess ? 'success' : ''}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {addedSuccess ? (
                  <>
                    <FiCheck /> Added to Bag
                  </>
                ) : (
                  isOutOfStock ? 'Sold Out' : 'Add to Bag'
                )}
              </button>

              <button
                type="button"
                className="btn-buy-now-v2"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                Buy with 1-Click
              </button>
            </div>
          </div>

          {/* Trust Perks Strip */}
          <div className="product-perks-v2">
            <div className="perk-item-v2">
              <FiTruck className="perk-icon" />
              <div className="perk-text-v2">
                <strong>Express & Safe Delivery</strong>
                <span>Metro Manila (2-3 days), Nationwide (4-7 days)</span>
              </div>
            </div>
            <div className="perk-item-v2">
              <FiRefreshCw className="perk-icon" />
              <div className="perk-text-v2">
                <strong>7-Day Returns</strong>
                <span>Hassle-free exchange guarantee</span>
              </div>
            </div>
            <div className="perk-item-v2">
              <FiAward className="perk-icon" />
              <div className="perk-text-v2">
                <strong>100% Authentic & Dermatologist Tested</strong>
                <span>Gentle, skin-safe beauty formulations</span>
              </div>
            </div>
          </div>

          {/* Luxury Accordion / Tabs */}
          <div className="info-tabs-v2">
            <div className="tab-nav-bar">
              <button
                type="button"
                className={`tab-nav-item ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                The Story
              </button>
              {product.ingredients && (
                <button
                  type="button"
                  className={`tab-nav-item ${activeTab === 'ingredients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ingredients')}
                >
                  Ingredients
                </button>
              )}
              {product.howToUse && (
                <button
                  type="button"
                  className={`tab-nav-item ${activeTab === 'howToUse' ? 'active' : ''}`}
                  onClick={() => setActiveTab('howToUse')}
                >
                  How to Use
                </button>
              )}
              <button
                type="button"
                className={`tab-nav-item ${activeTab === 'shipping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="tab-content-panel">
              {activeTab === 'description' && (
                <div className="tab-pane-content">
                  <p>{product.description}</p>
                </div>
              )}

              {activeTab === 'ingredients' && product.ingredients && (
                <div className="tab-pane-content">
                  <div className="ingredients-intro">
                    <FiDroplet className="pane-icon" />
                    <span>Formulated with nourishing botanicals and dermatologist-approved safe pigments.</span>
                  </div>
                  {renderTextWithBullets(product.ingredients)}
                </div>
              )}

              {activeTab === 'howToUse' && product.howToUse && (
                <div className="tab-pane-content">
                  <div className="ritual-header">The AmaraCé Application Ritual:</div>
                  {renderTextWithBullets(product.howToUse)}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="tab-pane-content">
                  <ul className="shipping-details-list">
                    <li><strong>Dispatch:</strong> Orders placed before 1:00 PM are packed and dispatched the same day.</li>
                    <li><strong>Metro Manila:</strong> 2–3 business days via trusted local couriers.</li>
                    <li><strong>Provincial:</strong> 4–7 business days nationwide.</li>
                    <li><strong>Cash on Delivery (COD) & GCash:</strong> Both payment methods are fully supported at checkout.</li>
                    <li><strong>Returns:</strong> 7-day hassle-free replacement for sealed, untampered items.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Products Grid ──────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="related-inner">
            <div className="related-header">
              <span className="related-eyebrow">Complementary Essentials</span>
              <h2 className="related-title">You May Also <em>Love</em></h2>
            </div>

            <div className="products-grid-v2">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct._id} product={relProduct} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Product Reviews Section ────────────────────── */}
      <div id="reviews" ref={reviewsRef} className="reviews-wrapper-v2">
        <ProductReviews productId={id} user={user} />
      </div>

      {/* ── Sticky Bottom Purchase Bar ─────────────────── */}
      <div className={`sticky-purchase-bar ${showStickyBar ? 'visible' : ''}`}>
        <div className="sticky-bar-inner">
          <div className="sticky-product-info">
            <img
              src={optimizeImage(images[0], 80)}
              alt={product.name}
              className="sticky-thumb"
            />
            <div className="sticky-text">
              <h4 className="sticky-title">{product.name}</h4>
              <span className="sticky-price">₱{product.price?.toFixed(2)}</span>
            </div>
          </div>

          <div className="sticky-actions">
            <div className="sticky-qty-stepper">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
              >
                <FiMinus size={13} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock || isOutOfStock}
              >
                <FiPlus size={13} />
              </button>
            </div>

            <button
              type="button"
              className={`sticky-add-btn ${addedSuccess ? 'success' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {addedSuccess ? <FiCheck /> : isOutOfStock ? 'Sold Out' : 'Add to Bag'}
            </button>
          </div>
        </div>
      </div>

      {/* ── JSON-LD Structured Product Data for SEO ────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": images,
            "description": product.description,
            "sku": `AM-${product._id?.slice(-6).toUpperCase()}`,
            "brand": {
              "@type": "Brand",
              "name": "AmaraCé"
            },
            "offers": {
              "@type": "Offer",
              "url": window.location.href,
              "priceCurrency": "PHP",
              "price": product.price,
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            },
            "aggregateRating": product.numReviews > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": product.ratings || 5,
              "reviewCount": product.numReviews
            } : undefined
          })
        }}
      />
    </div>
  );
};

export default ProductDetail;