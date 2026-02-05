import { useState, useEffect } from 'react';
import { FiInfo, FiX, FiExternalLink, FiSave, FiTrash2 } from 'react-icons/fi';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import '../../styles/Admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [trackingInputs, setTrackingInputs] = useState({});

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch orders failed:', error);
      setOrders([]);
    }
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

  const saveTracking = async (orderId) => {
    const trackingNumber = trackingInputs[orderId] || '';

    // Validation: alphanumeric, 10-20 characters for JNT format flexibility
    const isValid = /^[A-Za-z0-9]{10,20}$/.test(trackingNumber);
    if (!isValid) {
      toast.error('Invalid tracking number. Must be 10-20 alphanumeric characters.');
      return;
    }

    try {
      await api.put(`/orders/${orderId}/tracking`, { trackingNumber });
      toast.success('Tracking number saved!');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to save tracking number');
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

  // Format order ID from date
  const formatOrderId = (createdAt) => {
    const d = new Date(createdAt);
    const year = d.getFullYear();
    const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
    return `${year}-${mmdd}-${hhmm}`;
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if tracking should be editable (shipped or higher)
  const canEditTracking = (status) => {
    return ['shipped', 'delivered'].includes(status);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <h1>Manage Orders</h1>

        <div className="orders-table-container">
          <table className="admin-table orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer's Details</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Tracking Number</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  {/* Order ID - No Wrap */}
                  <td className="order-id-cell">
                    #{formatOrderId(order.createdAt)}
                  </td>

                  {/* Customer Details - Expandable */}
                  <td className="customer-cell">
                    <div className="customer-summary">
                      <strong>{order.user?.name || order.shippingAddress?.fullName || 'Guest'}</strong>
                      <small>{order.user?.email || 'N/A'}</small>
                      <button
                        className="info-toggle-btn"
                        onClick={() => setExpandedCustomer(expandedCustomer === order._id ? null : order._id)}
                        aria-label="Toggle customer details"
                      >
                        {expandedCustomer === order._id ? <FiX /> : <FiInfo />}
                      </button>
                    </div>

                    {/* Expandable Customer Details Card */}
                    {expandedCustomer === order._id && (
                      <div className="customer-details-card">
                        <div className="details-grid">
                          <div className="detail-row">
                            <span className="detail-label">Full Name:</span>
                            <span>{order.shippingAddress?.fullName || order.user?.name || 'N/A'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Email:</span>
                            <span>{order.user?.email || 'N/A'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Phone:</span>
                            <span>{order.shippingAddress?.phone || 'N/A'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Shipping Address:</span>
                            <span>
                              {order.shippingAddress ? (
                                <>
                                  {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                                  {order.shippingAddress.province}, {order.shippingAddress.postalCode}<br />
                                  {order.shippingAddress.country || 'Philippines'}
                                </>
                              ) : 'N/A'}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Order Date:</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Items */}
                  <td className="items-cell">
                    <div className="items-list">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="item-row">
                          <img
                            src={item.product?.images?.[0] || '/placeholder.jpg'}
                            alt=""
                            className="item-thumb"
                          />
                          <span>{item.product?.name} (x{item.quantity})</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Total */}
                  <td className="total-cell">
                    ₱{(order.total || 0).toFixed(2)}
                  </td>

                  {/* Payment */}
                  <td className="payment-cell">
                    <span className="payment-method">{order.paymentMethod?.toUpperCase()}</span>
                    {order.paymentProof && (
                      <a
                        href={order.paymentProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-proof-link"
                      >
                        View Proof
                      </a>
                    )}
                  </td>

                  {/* Status */}
                  <td className="status-cell">
                    <span className={`status-badge-orders ${order.status}`}>
                      {order.status}
                    </span>
                  </td>

                  {/* Tracking Number - Dedicated Column */}
                  <td className="tracking-cell">
                    {canEditTracking(order.status) ? (
                      order.trackingNumber ? (
                        <a
                          href={`https://www.jntexpress.ph/tracking?tracking_number=${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tracking-link"
                        >
                          {order.trackingNumber}
                          <FiExternalLink />
                        </a>
                      ) : (
                        <div className="tracking-input-group">
                          <input
                            type="text"
                            className="tracking-input"
                            placeholder="Enter J&T tracking #"
                            value={trackingInputs[order._id] || ''}
                            onChange={(e) => setTrackingInputs(prev => ({
                              ...prev,
                              [order._id]: e.target.value.toUpperCase()
                            }))}
                            maxLength={20}
                          />
                          <button
                            className="save-tracking-btn"
                            onClick={() => saveTracking(order._id)}
                            title="Save Tracking"
                          >
                            <FiSave />
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="tracking-na">—</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="action-cell">
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
                    </select>

                    <button
                      onClick={() => deleteOrder(order._id)}
                      className="delete-order-btn"
                      title="Delete Order"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="no-orders-message">
            <p>No orders found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;