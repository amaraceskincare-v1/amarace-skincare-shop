import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../styles/ProductCard.css';
import { flyToCart } from '../utils/animations';
import { optimizeImage } from '../utils/imageOptimizer';
import { trackAddToCart } from '../utils/analytics';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product, isBestSeller = false, isNewArrival = false, onQuickView }) => {
  const { addToCart } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const [wishlisted, setWishlisted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('amarace_wishlist') || '[]');
      return saved.includes(product?._id);
    } catch { return false; }
  });

  const primaryImg = product?.images?.[0] || '/placeholder.jpg';
  const secondaryImg = product?.images?.[1] || null;

  const [primaryLoaded, setPrimaryLoaded] = useState(false);
  const [primarySrc, setPrimarySrc] = useState(() => optimizeImage(primaryImg, 600));
  const [secondarySrc, setSecondarySrc] = useState(() => secondaryImg ? optimizeImage(secondaryImg, 600) : null);

  // Sync state when product images change
  useEffect(() => {
    setPrimarySrc(optimizeImage(primaryImg, 600));
    setSecondarySrc(secondaryImg ? optimizeImage(secondaryImg, 600) : null);
  }, [primaryImg, secondaryImg]);

  if (!product) return null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0 || addingToCart) return;

    const btn = e.currentTarget;
    flyToCart(btn);
    setAddingToCart(true);

    try {
      await addToCart(product._id, 1, product);
      trackAddToCart(product, 1);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1800);

      // Open cart drawer if available
      if (window.openCartDrawer) {
        setTimeout(() => window.openCartDrawer(), 600);
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(prev => {
      const next = !prev;
      try {
        const saved = JSON.parse(localStorage.getItem('amarace_wishlist') || '[]');
        const updated = next
          ? [...saved, product._id]
          : saved.filter(id => id !== product._id);
        localStorage.setItem('amarace_wishlist', JSON.stringify(updated));
      } catch { /* ignore */ }
      return next;
    });
  };

  const handleOpenQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      setQuickViewOpen(true);
    }
  };

  const isSoldOut = product.stock === 0;
  const isBest = isBestSeller || product.bestSeller;
  const isNew = isNewArrival || product.isNewProduct || product.newArrival;

  return (
    <>
      <div className={`product-card-v2 ${isSoldOut ? 'is-sold-out' : ''}`}>
        <Link to={`/products/${product._id}`} className="product-link-v2">
          <div className="product-image-v2">
            <div className={`product-stage-canvas ${primaryLoaded ? 'loaded' : 'loading'}`}>
              <img
                src={primarySrc}
                alt={product.name}
                className="primary-img"
                loading="lazy"
                decoding="async"
                onLoad={() => setPrimaryLoaded(true)}
                onError={() => {
                  setPrimarySrc('/placeholder.jpg');
                  setPrimaryLoaded(true);
                }}
              />
              {secondarySrc && (
                <img
                  src={secondarySrc}
                  alt={`${product.name} alternate view`}
                  className="secondary-img"
                  loading="lazy"
                  decoding="async"
                  onError={() => setSecondarySrc(null)}
                />
              )}
            </div>

            {/* Badge Layer */}
            <div className="product-badges-v2">
              {isSoldOut ? (
                <span className="badge-v2 out-of-stock">Sold Out</span>
              ) : isBest ? (
                <span className="badge-v2 best-seller">★ Best Seller</span>
              ) : isNew ? (
                <span className="badge-v2 new">New Arrival</span>
              ) : null}
            </div>

            {/* Top Action Buttons (Wishlist & Quick View) */}
            <div className="card-top-actions">
              <button
                type="button"
                className={`wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
                onClick={handleWishlist}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                title={wishlisted ? 'Wishlisted' : 'Save to Wishlist'}
              >
                <FiHeart />
              </button>

              <button
                type="button"
                className="quick-view-trigger"
                onClick={handleOpenQuickView}
                aria-label={`Quick view ${product.name}`}
                title="Quick View"
              >
                <FiEye />
              </button>
            </div>

            {/* Floating Quick Add Button */}
            <div className="product-actions-v2">
              <button
                type="button"
                className={`quick-add-btn ${addedSuccess ? 'success' : ''}`}
                onClick={handleAddToCart}
                disabled={isSoldOut || addingToCart}
                aria-label={isSoldOut ? 'Out of Stock' : `Quick add ${product.name} to cart`}
              >
                {addedSuccess ? (
                  <>
                    <FiCheck /> Added to Bag
                  </>
                ) : (
                  <>
                    <FiShoppingCart />
                    {isSoldOut ? 'Sold Out' : 'Quick Add'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card Info */}
          <div className="product-info-v2">
            <span className="product-category-v2">{product.category || 'Collection'}</span>
            <h3 className="product-name-v2">{product.name}</h3>
            
            <div className="product-price-v2">
              <span className="currency">₱</span>
              <span className="price-val">{product.price?.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="price-old">₱{product.originalPrice.toFixed(2)}</span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Internal Quick View Modal if not handled by parent */}
      {!onQuickView && (
        <QuickViewModal
          product={product}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
