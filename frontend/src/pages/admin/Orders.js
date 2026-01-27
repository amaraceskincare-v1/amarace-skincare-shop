import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import '../../styles/Admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    const { data } = await api.get('/orders');
    setOrders(data);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const verifyPayment = async (id) => {
    try {
      await api.put(`/orders/${id}/verify-payment`);
      toast.success('Payment Verified & Email Sent');
      fetchOrders();
    } catch (error) {
      toast.error('Verification failed');
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/orders/${id}`);
        toast.success('Order deleted');
        fetchOrders();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="admin-content-inner">
      <div className="admin-header">
        <h1>Manage Orders</h1>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td className="order-id-cell">
                # {(() => {
                  const d = new Date(order.createdAt);
                  const year = d.getFullYear();
                  const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
                  const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
                  return `${year}-${mmdd}-${hhmm}`;
                })()}
              </td>
              <td>
                <div className="customer-cell">
                  <span>{order.user?.name || 'Guest User'}</span>
                  <small>{order.user?.email || 'No Email'}</small>
                </div>
              </td>
              <td>
                <div className="order-items-summary">
                  {order.items.map((item, index) => (
                    <div key={index} className="item-token">
                      <img src={item.product?.images?.[0] || '/placeholder.jpg'} alt="" />
                      <span>{item.quantity}x {item.product?.name || 'Deleted Product'}</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="total-cell">₱{(order.total || 0).toFixed(2)}</td>
              <td>
                <div className="payment-info">
                  <span className="method">{order.paymentMethod}</span>
                  {order.paymentProof && (
                    <a href={order.paymentProof} target="_blank" rel="noopener noreferrer" className="proof-link">
                      View Proof
                    </a>
                  )}
                </div>
              </td>
              <td>
                <span className={`status-badge ${(order.status || 'pending').toLowerCase()}`}>
                  {order.status?.replace(/_/g, ' ') || 'pending'}
                </span>
              </td>
              <td className="actions-cell">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="awaiting_payment_verification">Verify Payment</option>
                </select>

                <button
                  className="delete-item-btn"
                  onClick={() => deleteOrder(order._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No orders found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;