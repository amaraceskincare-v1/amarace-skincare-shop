import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { optimizeImage } from '../utils/imageOptimizer';
import { FiClock, FiCheckCircle, FiTruck, FiPackage, FiAlertCircle, FiXCircle, FiExternalLink } from 'react-icons/fi';
import '../styles/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatOrderId = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const year = d.getFullYear();
    const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
    return `${year}-${mmdd}-${hhmm}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (order) => {
    switch (order.status) {
      case 'awaiting_payment_verification':
        return (
          <span className="order-status status-awaiting">
            <FiClock /> Awaiting GCash Verification
          </span>
        );
      case 'processing':
        return (
          <span className="order-status status-processing">
            <FiPackage /> {order.paymentMethod === 'gcash' ? 'Verified • Processing' : 'Processing'}
          </span>
        );
      case 'shipped':
        return (
          <span className="order-status status-shipped">
            <FiTruck /> Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="order-status status-delivered">
            <FiCheckCircle /> Delivered
          </span>
        );
      case 'rejected':
        return (
          <span className="order-status status-rejected">
            <FiAlertCircle /> Payment Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="order-status status-cancelled">
            <FiXCircle /> Cancelled
          </span>
        );
      default:
        return (
          <span className="order-status status-pending">
            {order.status?.toUpperCase()?.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  if (loading) return <div style={{ padding: '80px 20px', textAlign: 'center', color: '#666', fontSize: '1.1rem' }}>Loading your orders...</div>;

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>My Orders</h1>
        {orders.length === 0 ? (
          <div className="no-orders-box">
            <p>You haven't placed any orders yet.</p>
            <Link to="/products" className="start-shopping-link">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className={`order-card card-status-${order.status}`}>
                <div className="order-header">
                  <div>
                    <div className="order-id">Order #{formatOrderId(order.createdAt)}</div>
                    <div className="order-payment-tag">
                      {order.paymentMethod === 'gcash' ? 'GCash QR' : 'Cash On Delivery'}
                    </div>
                  </div>
                  <div className="order-status-wrapper">
                    {getStatusBadge(order)}
                  </div>
                </div>

                {/* Status Notice Banner if Awaiting or Rejected */}
                {order.status === 'awaiting_payment_verification' && (
                  <div className="order-status-notice awaiting">
                    <FiClock /> We have received your payment screenshot and our team is verifying it.
                  </div>
                )}
                {order.status === 'rejected' && (
                  <div className="order-status-notice rejected">
                    <FiAlertCircle /> Payment could not be verified{order.rejectionReason ? `: "${order.rejectionReason}"` : '.'} Please contact support for assistance.
                  </div>
                )}

                <div className="order-items">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item-with-img">
                      <img
                        src={optimizeImage(item.product?.images?.[0] || '/placeholder.jpg', 100)}
                        alt={item.product?.name || 'Product'}
                        className="order-item-img"
                      />
                      <div className="order-item-details">
                        <span className="item-name">{item.product?.name || 'Product'}</span>
                        <span className="item-qty">Qty: {item.quantity} • ₱{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-meta-info">
                    <div className="order-date">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>

                    {order.paymentProof && (
                      <div className="proof-info">
                        <a href={order.paymentProof} target="_blank" rel="noreferrer" className="proof-link">
                          View Uploaded Receipt <FiExternalLink size={12} />
                        </a>
                      </div>
                    )}

                    {order.trackingNumber && (
                      <div className="tracking-info">
                        <span className="label">J&amp;T Tracking:</span>
                        <span className="value">{order.trackingNumber}</span>
                      </div>
                    )}

                    {order.deliveryProof && (
                      <div className="proof-info">
                        <a href={order.deliveryProof} target="_blank" rel="noreferrer" className="proof-link">
                          View Delivery Photo <FiExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="order-total-block">
                    <span className="order-total-label">Total Amount</span>
                    <span className="order-total">
                      ₱{(order.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
