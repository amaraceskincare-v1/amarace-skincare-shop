import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product._id, 1, product);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-link">
        <div className="product-image">
          <img
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
          />

          {/* Quick Actions */}
          <div className="product-actions">
            <button
              className="action-btn cart-action"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label="Add to cart"
            >
              <FiShoppingCart />
            </button>
            <button className="action-btn wishlist-action" aria-label="Add to wishlist">
              <FiHeart />
            </button>
          </div>

          {/* Badges */}
          {product.stock === 0 && (
            <span className="badge badge-out">Out of Stock</span>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-price">
            <span className="current-price">
              ₱{product.price?.toFixed(2)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
