import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiX, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import '../styles/Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Get items array safely
  const items = cart?.items || [];

  const freeShippingThreshold = 500;
  const progressPercent = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
  const amountNeeded = Math.max(freeShippingThreshold - cartTotal, 0);

  if (items.length === 0) {
    return (
      <div className="cart-page-v2">
        <div className="empty-cart-v2">
          <div className="empty-cart-icon-v2">🛍️</div>
          <h2>Your bag is empty</h2>
          <p>Looks like you haven't added any radiance to your bag yet.</p>
          <Link to="/products" className="continue-shopping-btn-v2">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-v2">
      {/* Redesigned Header */}
      <div className="cart-hero-v2">
        <h1>Your Shopping Bag</h1>
        <p>Review your essentials before checkout</p>
      </div>

      <div className="cart-container-v2">
        <div className="cart-main-v2">
          {/* Elegant Free Shipping Progress */}
          <div className="shipping-banner-v2">
            <div className="shipping-status-v2">
              {amountNeeded > 0 ? (
                <>
                  <span className="icon">🚚</span>
                  <p>You're only <strong>₱{amountNeeded.toFixed(2)}</strong> away from <strong>FREE SHIPPING</strong></p>
                </>
              ) : (
                <>
                  <span className="icon">🎉</span>
                  <p>Congratulations! You've unlocked <strong>FREE SHIPPING</strong></p>
                </>
              )}
            </div>
            <div className="progress-track-v2">
              <div className="progress-fill-v2" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="cart-items-v2">
            {items.map((item) => (
              <div key={item.product?._id || item.productId} className="cart-item-v2">
                <div className="item-img-v2">
                  <img src={item.product?.images?.[0] || '/placeholder.jpg'} alt={item.product?.name} />
                </div>

                <div className="item-info-v2">
                  <div className="item-header-v2">
                    <span className="item-cat-v2">{item.product?.category}</span>
                    <h4 className="item-title-v2">{item.product?.name}</h4>
                  </div>

                  <div className="item-price-v2">
                    ₱{item.product?.price?.toFixed(2)}
                  </div>

                  <div className="item-actions-v2">
                    <div className="qty-selector-v2">
                      <button
                        onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <input type="number" value={item.quantity} readOnly />
                      <button onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}>
                        <FiPlus />
                      </button>
                    </div>

                    <button
                      className="remove-btn-v2"
                      onClick={() => removeFromCart(item.product?._id)}
                    >
                      <FiX /> <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div className="item-total-v2">
                  ₱{(item.product?.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer-v2">
            <Link to="/products" className="back-to-shop-v2">
              <FiArrowLeft /> Back to Collections
            </Link>
          </div>
        </div>

        {/* Premium Sidebar Summary */}
        <aside className="cart-summary-v2">
          <div className="order-summary-card">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-details">
              {/* Subtotal Row */}
              <div className="summary-row">
                <span className="summary-label">Subtotal ({items.length} items)</span>
                <span className="summary-value">₱{cartTotal.toFixed(2)}</span>
              </div>

              {/* Shipping Row - with left-aligned calculated text */}
              <div className="summary-row">
                <span className="summary-label">Estimated Shipping</span>
                <span className={`shipping-calculated ${amountNeeded <= 0 ? 'free' : ''}`}>
                  {amountNeeded <= 0 ? 'FREE' : 'Calculated at next step'}
                </span>
              </div>
            </div>

            {/* Total Row */}
            <div className="summary-total-row">
              <span className="total-label">Estimated Total</span>
              <span className="total-amount">₱{cartTotal.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <Link to="/checkout" className="proceed-checkout-btn">
              PROCEED TO CHECKOUT
            </Link>

            {/* Payment Methods - Centered */}
            <div className="payment-methods-container">
              <div className="payment-icons">
                {/* GCash Icon - Dynamic with Fallback */}
                <div className="payment-icon-item">
                  <img
                    src={settings?.gcashQR || "/images/gcash-logo.png"}
                    alt="GCash"
                    className="payment-icon"
                  />
                </div>

                {/* Payment Logos (COD/Cards) - Dynamic with Fallback */}
                {settings?.paymentLogos && settings.paymentLogos.length > 0 ? (
                  settings.paymentLogos.map((logo, idx) => (
                    <div key={idx} className="payment-icon-item">
                      <img src={logo} alt="Payment Method" className="payment-icon" />
                    </div>
                  ))
                ) : (
                  <div className="payment-icon-item">
                    <img src="/images/cod-icon.png" alt="Cash on Delivery" className="payment-icon" />
                  </div>
                )}
              </div>
              <p className="payment-methods-text">Secure payment methods available</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;