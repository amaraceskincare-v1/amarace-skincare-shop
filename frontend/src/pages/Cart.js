import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  // Get items array safely
  const items = cart?.items || [];

  const freeShippingThreshold = 500;
  const progressPercent = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
  const amountNeeded = Math.max(freeShippingThreshold - cartTotal, 0);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet</p>
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <Link to="/products" className="continue-link">
          <FiArrowLeft /> Continue Shopping
        </Link>
      </div>

      {/* Free Shipping Progress */}
      <div className="shipping-progress-bar">
        {amountNeeded > 0 ? (
          <p>Buy <strong>₱{amountNeeded.toFixed(2)}</strong> more to enjoy <strong>FREE Shipping</strong></p>
        ) : (
          <p>🎉 You've unlocked <strong>FREE Shipping!</strong></p>
        )}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="cart-content">
        {/* Cart Items List */}
        <div className="cart-items-list">
          {items.map((item) => (
            <div key={item.product?._id || item.productId} className="cart-item-modern">
              <div className="item-image-container">
                <img src={item.product?.images?.[0] || '/placeholder.jpg'} alt={item.product?.name} />
              </div>

              <div className="item-details-container">
                <div className="item-main-info">
                  <h4 className="item-name">{item.product?.name}</h4>
                  <p className="item-price-modern">₱{item.product?.price?.toFixed(2)}</p>
                </div>

                <div className="item-controls-modern">
                  <div className="quantity-selector-modern">
                    <span className="control-label">Quantity:</span>
                    <div className="quantity-buttons">
                      <button
                        onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}>
                        <FiPlus />
                      </button>
                    </div>
                  </div>

                  <button
                    className="item-remove-link"
                    onClick={() => removeFromCart(item.product?._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₱{cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{amountNeeded > 0 ? 'Calculated at checkout' : 'FREE'}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₱{cartTotal.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="checkout-btn">
            CHECK OUT
          </Link>

          <p className="shipping-note">Shipping cost calculated at checkout</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;