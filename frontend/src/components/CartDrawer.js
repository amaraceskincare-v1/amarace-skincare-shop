import { Link } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { optimizeImage } from '../utils/imageOptimizer';
import '../styles/CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

    // Get items array safely
    const items = cart?.items || [];

    const freeShippingThreshold = 500;
    const progressPercent = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
    const amountNeeded = Math.max(freeShippingThreshold - cartTotal, 0);

    if (!isOpen) return null;

    return (
        <>
            <div className="cart-drawer-overlay" onClick={onClose} />
            <div className="cart-drawer">
                {/* Header */}
                <div className="drawer-header">
                    <h2>Shopping Cart</h2>
                    <button className="drawer-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                {/* Free Shipping Progress */}
                <div className="shipping-progress">
                    {amountNeeded > 0 ? (
                        <p>Buy <strong>₱{amountNeeded.toFixed(2)}</strong> more to enjoy <strong>FREE Shipping</strong></p>
                    ) : (
                        <p>🎉 You've unlocked <strong>FREE Shipping!</strong></p>
                    )}
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="drawer-items">
                    {items.length === 0 ? (
                        <div className="empty-cart">
                            <p>Your cart is empty</p>
                            <Link to="/products" className="shop-link" onClick={onClose}>
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.product?._id || item.productId} className="drawer-item">
                                <div className="item-image">
                                    <img src={optimizeImage(item.product?.images?.[0] || '/placeholder.jpg', 120)} alt={item.product?.name} />
                                </div>
                                <div className="item-details">
                                    <h4 className="item-name">{item.product?.name}</h4>
                                    <p className="item-price">₱{item.product?.price?.toFixed(2)}</p>
                                    <div className="item-bottom">
                                        <div className="item-quantity">
                                            <button onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}>
                                                <FiMinus />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}>
                                                <FiPlus />
                                            </button>
                                        </div>
                                        <button className="item-remove" onClick={() => removeFromCart(item.product?._id)}>
                                            <FiX /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="drawer-footer">
                        <div className="drawer-actions">
                            <button className="action-btn">📝 Note</button>
                            <button className="action-btn">🚚 Shipping</button>
                            <button className="action-btn">🏷️ Coupon</button>
                        </div>
                        <div className="drawer-subtotal">
                            <span>Subtotal</span>
                            <span>₱{cartTotal.toFixed(2)}</span>
                        </div>
                        <Link to="/checkout" className="checkout-btn" onClick={onClose}>
                            Check out
                        </Link>
                        <Link to="/cart" className="view-cart-link" onClick={onClose}>
                            View Cart
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;