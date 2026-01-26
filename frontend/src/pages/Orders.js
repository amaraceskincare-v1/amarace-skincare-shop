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
    <div className="orders-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>My Orders</h1>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No orders found.</p>
          <Link to="/products" style={{ color: '#4f46e5', textDecoration: 'underline' }}>Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>Order #{order._id?.substring(0, 8)}</strong>
                <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>{order.status}</span>
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx}>{item.product?.name} x{item.quantity}</div>
                ))}
              </div>
              <div style={{ marginTop: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                Total: ₱{order.total?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
