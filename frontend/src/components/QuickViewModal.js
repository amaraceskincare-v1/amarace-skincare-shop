import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiStar, FiShoppingCart, FiCheck, FiEye } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { optimizeImage } from '../utils/imageOptimizer';
import { flyToCart } from '../utils/animations';
import { trackAddToCart } from '../utils/analytics';
import { toast } from 'react-toastify';
import '../styles/QuickViewModal.css';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && product) {
      setSelectedImg(0);
      setQuantity(1);
      setAddedSuccess(false);

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Focus trap / ESC key listener
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, product, onClose]);

  if (!isOpen || !product) return null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const btn = e.currentTarget;
    flyToCart(btn);

    try {
      await addToCart(product._id, quantity, product);
      trackAddToCart(product, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);

      // Open global cart drawer
      if (window.openCartDrawer) {
        setTimeout(() => window.openCartDrawer(), 600);
      }
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const images = product.images?.length > 0 ? product.images : ['/placeholder.jpg'];
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="quickview-overlay" onClick={onClose}>
      <div
        className="quickview-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        <button className="quickview-close-btn" onClick={onClose} aria-label="Close modal">
          <FiX size={20} />
        </button>

        <div className="quickview-content">
          {/* Left: Gallery */}
          <div className="quickview-gallery">
            <div className="quickview-main-image">
              <img
                src={optimizeImage(images[selectedImg], 700)}
                alt={product.name}
                loading="eager"
              />
              {product.stock === 0 ? (
                <span className="qv-badge sold-out">Sold Out</span>
              ) : product.bestSeller ? (
                <span className="qv-badge best-seller">★ Best Seller</span>
              ) : product.newArrival || product.isNewProduct ? (
                <span className="qv-badge new">New</span>
              ) : null}
            </div>

            {images.length > 1 && (
              <div className="quickview-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`qv-thumb ${selectedImg === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImg(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={optimizeImage(img, 120)} alt={`${product.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="quickview-info">
            <div className="qv-header">
              <span className="qv-category">{product.category || 'Collection'}</span>
              <h2 className="qv-title">{product.name}</h2>

              <div className="qv-rating-row">
                <div className="qv-stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      fill={i < Math.round(product.ratings || 5) ? 'var(--brand-primary)' : 'none'}
                      stroke={i < Math.round(product.ratings || 5) ? 'var(--brand-primary)' : '#ccc'}
                      size={14}
                    />
                  ))}
                  <span className="qv-review-count">({product.numReviews || 0} reviews)</span>
                </div>
              </div>
            </div>

            <div className="qv-price-row">
              <span className="qv-current-price">₱{product.price?.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="qv-old-price">₱{product.originalPrice.toFixed(2)}</span>
                  <span className="qv-save-badge">SAVE {discountPercent}%</span>
                </>
              )}
            </div>

            <p className="qv-description">
              {product.description?.length > 180
                ? `${product.description.slice(0, 180)}...`
                : product.description}
            </p>

            <div className="qv-stock-status">
              {product.stock === 0 ? (
                <span className="stock-out">✕ Currently Out of Stock</span>
              ) : product.stock <= (product.lowStockThreshold || 10) ? (
                <span className="stock-low">⚠ Only {product.stock} items remaining</span>
              ) : (
                <span className="stock-in">✓ In Stock — Ready for Dispatch</span>
              )}
            </div>

            {/* Purchase Controls */}
            <div className="qv-purchase-section">
              <div className="qv-qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || product.stock === 0}
                  aria-label="Decrease quantity"
                >
                  <FiMinus size={14} />
                </button>
                <span className="qv-qty-val">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || product.stock === 0}
                  aria-label="Increase quantity"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              <button
                type="button"
                className={`qv-add-btn ${addedSuccess ? 'success' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {addedSuccess ? (
                  <>
                    <FiCheck /> Added to Bag
                  </>
                ) : (
                  <>
                    <FiShoppingCart /> {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                  </>
                )}
              </button>
            </div>

            <div className="qv-footer-links">
              <Link
                to={`/products/${product._id}`}
                className="qv-full-details-link"
                onClick={onClose}
              >
                View Full Product Story & Ingredients →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
