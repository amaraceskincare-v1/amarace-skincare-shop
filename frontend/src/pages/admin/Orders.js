import { useState, useEffect } from 'react';
import { FiX, FiSave, FiTrash2, FiExternalLink } from 'react-icons/fi';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [proofImage, setProofImage] = useState(null);
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
    const trackingNumber = trackingInputs[orderId];
    if (!trackingNumber) {
      toast.warning('Please enter a tracking number');
      return;
    }
    try {
      await api.put(`/orders/${orderId}/tracking`, { trackingNumber });
      toast.success('Tracking number saved!');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to save tracking');
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

  const formatOrderId = (createdAt) => {
    const d = new Date(createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main orders-page">
        {/* Centered Page Header */}
        <div className="page-header-centered">
          <h1 className="page-title-premium">Master Order Management</h1>
          <p className="page-subtitle-premium">Processing & Verified GCash transactions in one view</p>
        </div>

        {/* Orders Table */}
        <div className="table-card-premium">
          <div className="table-wrapper">
            <table className="data-table-premium">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Details</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment & Proof</th>
                  <th>Status</th>
                  <th>Tracking</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="order-id-premium">#{formatOrderId(order.createdAt)}</div>
                    </td>
                    <td>
                      <div className="customer-name-premium">
                        {order.user?.name || 'Guest'}
                        <span
                          className="info-icon-premium"
                          onClick={() => setSelectedCustomer(order)}
                        >
                          i
                        </span>
                      </div>
                    </td>
                    <td>
                      {order.items?.map((item, i) => (
                        <div key={i} className="product-item-premium">
                          <img
                            src={item.product?.images?.[0] || 'https://via.placeholder.com/48'}
                            alt={item.product?.name}
                            className="product-image-premium"
                          />
                          <div className="product-info-premium">
                            <div className="product-name-premium">{item.product?.name}</div>
                            <div className="product-quantity-premium">(x{item.quantity})</div>
                          </div>
                        </div>
                      ))}
                    </td>
                    <td>
                      <div className="total-amount-premium">₱{order.total.toFixed(2)}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="payment-method-premium">{order.paymentMethod?.toUpperCase()}</div>
                      {order.paymentProof && (
                        <button
                          className="verify-proof-btn-premium"
                          onClick={() => setProofImage(order.paymentProof)}
                        >
                          Verify Proof
                        </button>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge-premium ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      {order.trackingNumber ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="order-id-premium">{order.trackingNumber}</div>
                          <a
                            href={`https://www.jtexpress.ph/index/query/gzquery.html?bills=${order.trackingNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--secondary)' }}
                          >
                            <FiExternalLink />
                          </a>
                        </div>
                      ) : (
                        <div className="tracking-input-wrapper-premium">
                          <input
                            type="text"
                            className="tracking-input-premium"
                            placeholder="Enter J&T #"
                            value={trackingInputs[order._id] || ''}
                            onChange={(e) => setTrackingInputs({ ...trackingInputs, [order._id]: e.target.value.toUpperCase() })}
                          />
                          <button
                            className="save-tracking-btn-premium"
                            onClick={() => saveTracking(order._id)}
                          >
                            <FiSave />
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                          className="action-select-premium"
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          className="delete-btn-premium"
                          onClick={() => deleteOrder(order._id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Customer Details Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay-premium"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="modal-content-premium"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header-premium">
                <h2 className="modal-title-premium">Customer Details</h2>
                <button className="modal-close-premium" onClick={() => setSelectedCustomer(null)}><FiX /></button>
              </div>
              <div className="modal-body-premium">
                <div className="detail-row-premium">
                  <div className="detail-label-premium">Full Name</div>
                  <div className="detail-value-premium">{selectedCustomer.user?.name || 'Guest'}</div>
                </div>
                <div className="detail-divider-premium"></div>
                <div className="detail-row-premium">
                  <div className="detail-label-premium">Email Address</div>
                  <div className="detail-value-premium">{selectedCustomer.user?.email || selectedCustomer.contactDetails?.email || 'N/A'}</div>
                </div>
                <div className="detail-divider-premium"></div>
                <div className="detail-row-premium">
                  <div className="detail-label-premium">Phone Number</div>
                  <div className="detail-value-premium">{selectedCustomer.shippingAddress?.phone || selectedCustomer.contactDetails?.phone || 'N/A'}</div>
                </div>
                <div className="detail-divider-premium"></div>
                <div className="detail-row-premium">
                  <div className="detail-label-premium">Shipping Address</div>
                  <div className="detail-value-premium">
                    {selectedCustomer.shippingAddress?.street}, {selectedCustomer.shippingAddress?.city}, {selectedCustomer.shippingAddress?.state} {selectedCustomer.shippingAddress?.zipCode}
                  </div>
                </div>
                <div className="detail-divider-premium"></div>
                <div className="detail-row-premium">
                  <div className="detail-label-premium">Order Date</div>
                  <div className="detail-value-premium">{new Date(selectedCustomer.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proof Image Modal */}
      <AnimatePresence>
        {proofImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="proof-modal-premium"
            onClick={() => setProofImage(null)}
          >
            <div className="proof-image-container" onClick={e => e.stopPropagation()}>
              <button className="proof-close" onClick={() => setProofImage(null)}><FiX /></button>
              <img src={proofImage} alt="Payment Proof" className="proof-image-large-premium" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;