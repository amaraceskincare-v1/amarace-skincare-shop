import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../styles/ProductCard.css';
import { flyToCart } from '../utils/animations';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Find the button element for animation starting point
    const btn = e.currentTarget;
    flyToCart(btn);

    try {
      await addToCart(product._id, 1, product);
      // Removed toast as per user request
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="product-card-v2">
      <Link to={`/products/${product._id}`} className="product-link-v2">
        <div className="product-image-v2">
          <img
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            className="primary-img"
          />
          {product.images?.length > 1 && (
            <img
              src={product.images[1]}
              alt={`${product.name} alternate`}
              className="secondary-img"
            />
          )}

          <div className="product-badges-v2">
            {product.stock === 0 ? (
              <span className="badge-v2 out-of-stock">Sold Out</span>
            ) : product.isNewProduct ? (
              <span className="badge-v2 new">New</span>
            ) : null}
          </div>

          <div className="product-actions-v2">
            <button
              className="quick-add-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <FiShoppingCart /> {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
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
