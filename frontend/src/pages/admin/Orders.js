import { useState, useEffect, useRef } from 'react';
import { FiInfo, FiX, FiExternalLink, FiSave, FiTrash2, FiEye, FiCheck, FiZoomIn, FiZoomOut, FiRotateCw, FiDownload } from 'react-icons/fi';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState(null);

  const [trackingInputs, setTrackingInputs] = useState({});

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch orders failed:', error);
      setOrders([]);
    } finally {
      setLoading(false);
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
    if (!trackingNumber) {
      toast.error('Please enter a tracking number.');
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

  const formatOrderId = (createdAt) => {
    const d = new Date(createdAt);
    const year = d.getFullYear();
    const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
    return `${year}-${mmdd}-${hhmm}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenCustomerDetails = (order) => {
    setSelectedCustomer({
      name: order.contactDetails?.fullName || order.user?.name || 'N/A',
      email: order.contactDetails?.email || order.user?.email || 'N/A',
      phone: order.contactDetails?.phone || order.shippingAddress?.phone || 'N/A',
      address: `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.province || ''}, ${order.shippingAddress?.country || ''}`.replace(/^, |, $/, ''),
      date: formatDate(order.createdAt)
    });
    setShowCustomerModal(true);
  };

  const handleOpenProof = (imageUrl, order) => {
    setSelectedProof(imageUrl);
    setSelectedOrderForAction(order);
    setShowProofModal(true);
  };

  const handleApprovePaymentFromProof = async () => {
    if (!selectedOrderForAction) return;
    try {
      await api.put(`/orders/${selectedOrderForAction._id}/status`, { status: 'processing' });
      toast.success('Payment approved and order move to Processing');
      setShowProofModal(false);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />

      <main className="main-content">
        {/* Centered Page Header */}
        <div className="page-header">
          <h1 className="page-title">Master Order Management</h1>
          <p className="page-subtitle">Processing & Verified GCash transactions in one view</p>
        </div>

        {/* Table Card */}
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
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
                      <div className="order-id">#{formatOrderId(order.createdAt)}</div>
                    </td>
                    <td className="customer-cell">
                      <div className="customer-name">
                        {order.contactDetails?.fullName || order.user?.name || 'Guest'}
                        <span className="info-icon" onClick={() => handleOpenCustomerDetails(order)}>i</span>
                      </div>
                    </td>
                    <td>
                      <div className="items-column">
                        {order.items?.map((item, i) => (
                          <div key={i} className="product-item">
                            <img
                              src={item.product?.images?.[0] || 'https://via.placeholder.com/48?text=No+Img'}
                              alt={item.product?.name}
                              className="product-image"
                            />
                            <div className="product-info">
                              <div className="product-name">{item.product?.name || 'Deleted Product'}</div>
                              <div className="product-quantity">(x{item.quantity})</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="total-amount">₱{order.total.toFixed(2)}</div>
                    </td>
                    <td className="payment-cell">
                      <div className="payment-method">{order.paymentMethod?.toUpperCase()}</div>
                      {order.paymentProof ? (
                        <button className="verify-proof-btn" onClick={() => handleOpenProof(order.paymentProof, order)}>Verify Proof</button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#999' }}>No Proof</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      {order.trackingNumber ? (
                        <div className="tracking-display">{order.trackingNumber}</div>
                      ) : (
                        <div className="tracking-input-wrapper">
                          <input
                            type="text"
                            className="tracking-input"
                            placeholder="Enter J&T #"
                            value={trackingInputs[order._id] || ''}
                            onChange={(e) => setTrackingInputs({ ...trackingInputs, [order._id]: e.target.value.toUpperCase() })}
                          />
                          <button className="save-tracking-btn" onClick={() => saveTracking(order._id)}>💾</button>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="action-cell">
                        <select
                          className="action-select"
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="delete-btn" onClick={() => deleteOrder(order._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Details Modal */}
        {showCustomerModal && selectedCustomer && (
          <div className="modal-overlay show" onClick={() => setShowCustomerModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Customer Details</h2>
                <button className="modal-close" onClick={() => setShowCustomerModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <div className="detail-label">Full Name</div>
                  <div className="detail-value">{selectedCustomer.name}</div>
                </div>
                <div className="detail-divider"></div>
                <div className="detail-row">
                  <div className="detail-label">Email Address</div>
                  <div className="detail-value">{selectedCustomer.email}</div>
                </div>
                <div className="detail-divider"></div>
                <div className="detail-row">
                  <div className="detail-label">Phone Number</div>
                  <div className="detail-value">{selectedCustomer.phone}</div>
                </div>
                <div className="detail-divider"></div>
                <div className="detail-row">
                  <div className="detail-label">Shipping Address</div>
                  <div className="detail-value">{selectedCustomer.address}</div>
                </div>
                <div className="detail-divider"></div>
                <div className="detail-row">
                  <div className="detail-label">Order Date</div>
                  <div className="detail-value">{selectedCustomer.date}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proof Image Modal */}
        {showProofModal && selectedProof && (
          <div className="proof-modal show" onClick={() => setShowProofModal(false)}>
            <div className="proof-image-container" onClick={(e) => e.stopPropagation()}>
              <button className="proof-close" onClick={() => setShowProofModal(false)}>×</button>
              <img src={selectedProof} alt="Payment Proof" className="proof-image-large" />
              <div className="proof-actions-v2">
                <button className="proof-approve-btn" onClick={handleApprovePaymentFromProof}>Approve & Process</button>
                <button className="proof-reject-btn" onClick={() => setShowProofModal(false)}>Close View</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;