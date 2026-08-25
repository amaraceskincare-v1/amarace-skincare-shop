import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../styles/ProductCard.css';
import { flyToCart } from '../utils/animations';
import { optimizeImage } from '../utils/imageOptimizer';

const ProductCard = ({ product, isBestSeller = false, isNewArrival = false }) => {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('amarace_wishlist') || '[]');
      return saved.includes(product._id);
    } catch { return false; }
  });

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const btn = e.currentTarget;
    flyToCart(btn);

    try {
      await addToCart(product._id, 1, product);
    } catch (error) {
      toast.error('Failed to add to cart');
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

  return (
    <div className="product-card-v2">
      <Link to={`/products/${product._id}`} className="product-link-v2">
        <div className="product-image-v2">
          <img
            src={optimizeImage(product.images?.[0] || '/placeholder.jpg', 500)}
            alt={product.name}
            className="primary-img"
            loading="lazy"
          />
          {product.images?.length > 1 && (
            <img
              src={optimizeImage(product.images[1], 500)}
              alt={`${product.name} alternate`}
              className="secondary-img"
              loading="lazy"
            />
          )}

          {/* Badge Layer */}
          <div className="product-badges-v2">
            {product.stock === 0 ? (
              <span className="badge-v2 out-of-stock">Sold Out</span>
            ) : isBestSeller ? (
              <span className="badge-v2 best-seller">★ Best Seller</span>
            ) : isNewArrival || product.isNewProduct ? (
              <span className="badge-v2 new">New</span>
            ) : null}
          </div>

          {/* Wishlist Button */}
          <button
            className={`wishlist-btn${wishlisted ? ' wishlisted' : ''}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart />
          </button>

          {/* Quick Add */}
          <div className="product-actions-v2">
            <button
              className="quick-add-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <FiShoppingCart />
              {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
            </button>
          </div>
        </div>

        <div className="product-info-v2">
          <span className="product-category-v2">{product.category}</span>
          <h3 className="product-name-v2">{product.name}</h3>
          <div className="product-price-v2">
            <span className="currency">₱</span>
            <span className="price-val">{product.price?.toFixed(2)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
