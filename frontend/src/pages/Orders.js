import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading orders...</div>;

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
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-id">Order #{order.orderId || order._id?.substring(0, 8)}</div>
                  <div className={`order-status status-${order.status?.toLowerCase()}`}>
                    {order.status}
                  </div>
                </div>

                <div className="order-items">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span className="item-name">{item.product?.name || 'Product'}</span>
                      <span className="item-qty">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  {order.trackingNumber && (
                    <div className="tracking-info">
                      <span className="label">J&T Tracking:</span>
                      <a
                        href={`https://www.jtexpress.ph/index/query/gzquery.html?bills=${order.trackingNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="tracking-link-user"
                        style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline', marginLeft: '5px' }}
                      >
                        {order.trackingNumber}
                      </a>
                    </div>
                  )}
                  {order.deliveryProof && (
                    <div className="proof-info">
                      <a href={order.deliveryProof} target="_blank" rel="noreferrer" className="proof-link">View Delivery Proof</a>
                    </div>
                  )}
                  <div className="order-total">
                    ₱{order.total?.toFixed(2)}
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
