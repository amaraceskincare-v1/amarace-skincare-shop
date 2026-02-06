import { useState, useEffect, useRef } from 'react';
import { FiInfo, FiX, FiExternalLink, FiSave, FiTrash2, FiEye, FiCheck, FiZoomIn, FiZoomOut, FiRotateCw, FiDownload } from 'react-icons/fi';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [trackingInputs, setTrackingInputs] = useState({});
  const [loading, setLoading] = useState(true);

  // Merged Payment Verification States
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [checklist, setChecklist] = useState({
    amountMatch: false,
    refVisible: false,
    screenshotClear: false,
    noTampering: false
  });

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

  const canEditTracking = (status) => ['shipped', 'delivered'].includes(status);

  // Payment Verification Logic
  const handleOpenPaymentModal = (order) => {
    setSelectedOrderForPayment(order);
    setVerificationNotes('');
    setChecklist({
      amountMatch: false,
      refVisible: false,
      screenshotClear: false,
      noTampering: false
    });
    setZoom(1);
    setRotation(0);
    setShowPaymentModal(true);
  };

  const handleApprovePayment = async () => {
    if (!window.confirm("Approve Payment? This will mark the order as 'processing'.")) return;
    try {
      await api.put(`/orders/${selectedOrderForPayment._id}/status`, {
        status: 'processing',
        verificationNotes
      });
      toast.success('Payment approved!');
      setShowPaymentModal(false);
      fetchOrders();
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-header-v2">
          <h1>Master Order Management</h1>
          <p>Processing & Verified GCash transactions in one view</p>
        </div>

        <div className="orders-table-container-premium">
          <table className="admin-table-premium">
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
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td className="id-cell">#{formatOrderId(order.createdAt)}</td>

                  <td className="customer-cell-premium">
                    <div className="cust-wrap">
                      <span className="cust-name">{order.user?.name || 'Guest'}</span>
                      <button
                        className="cust-info-btn"
                        onClick={() => setExpandedCustomer(expandedCustomer === order._id ? null : order._id)}
                      >
                        {expandedCustomer === order._id ? <FiX /> : <FiInfo />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedCustomer === order._id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="customer-details-popover"
                        >
                          <div className="popover-header">Customer Profile</div>
                          <div className="popover-row"><span>Email:</span> {order.user?.email || 'N/A'}</div>
                          <div className="popover-row"><span>Phone:</span> {order.shippingAddress?.phone || 'N/A'}</div>
                          <div className="popover-row address">
                            <span>Address:</span>
                            <p>{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
                          </div>
                          <div className="popover-footer">Joined: {new Date(order.user?.createdAt).toLocaleDateString()}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>

                  <td className="items-list-cell">
                    {order.items?.slice(0, 2).map((item, i) => (
                      <div key={i} className="mini-item">
                        {item.product?.name} (x{item.quantity})
                      </div>
                    ))}
                    {order.items?.length > 2 && <small>+{order.items.length - 2} more...</small>}
                  </td>

                  <td className="total-cell-premium">₱{order.total.toFixed(2)}</td>

                  <td className="payment-cell-v2">
                    <div className="pay-method">{order.paymentMethod?.toUpperCase()}</div>
                    {order.paymentProof ? (
                      <button onClick={() => handleOpenPaymentModal(order)} className="verify-pay-btn">
                        <FiEye /> Verify Proof
                      </button>
                    ) : (
                      <span className="no-proof">No Proof Attached</span>
                    )}
                  </td>

                  <td>
                    <span className={`status-pill-premium ${order.status}`}>
                      {order.status}
                    </span>
                  </td>

                  <td className="tracking-cell-premium">
                    {canEditTracking(order.status) ? (
                      order.trackingNumber ? (
                        <div className="track-saved">
                          <span>{order.trackingNumber}</span>
                          <FiExternalLink />
                        </div>
                      ) : (
                        <div className="track-input-wrap">
                          <input
                            placeholder="J&T #"
                            onChange={(e) => setTrackingInputs({ ...trackingInputs, [order._id]: e.target.value.toUpperCase() })}
                            value={trackingInputs[order._id] || ''}
                          />
                          <button onClick={() => saveTracking(order._id)}><FiSave /></button>
                        </div>
                      )
                    ) : <span className="na">—</span>}
                  </td>

                  <td className="actions-cell-premium">
                    <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button onClick={() => deleteOrder(order._id)} className="del-btn-v2"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Integrated Payment Modal */}
        {showPaymentModal && selectedOrderForPayment && (
          <div className="payment-verify-modal-overlay">
            <div className="payment-verify-modal">
              <div className="modal-header-v2">
                <h3>Payment Verification</h3>
                <button onClick={() => setShowPaymentModal(false)}><FiX /></button>
              </div>
              <div className="modal-content-v2">
                <div className="proof-viewer-v2">
                  <div className="img-container" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}>
                    <img src={selectedOrderForPayment.paymentProof} alt="GCash Proof" />
                  </div>
                  <div className="controls-v2">
                    <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))}><FiZoomIn /></button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}><FiZoomOut /></button>
                    <button onClick={() => setRotation(r => r + 90)}><FiRotateCw /></button>
                    <a href={selectedOrderForPayment.paymentProof} download><FiDownload /></a>
                  </div>
                </div>
                <div className="verification-sidebar-v2">
                  <div className="info-block-v2">
                    <label>Amount Due</label>
                    <div className="amount-label">₱{selectedOrderForPayment.total.toFixed(2)}</div>
                  </div>
                  <div className="info-block-v2">
                    <label>GCash Reference</label>
                    <div className="ref-label">{selectedOrderForPayment.gcashRef || 'NOT PROVIDED'}</div>
                  </div>
                  <div className="checklist-v2">
                    {Object.keys(checklist).map(key => (
                      <label key={key} className="check-item">
                        <input type="checkbox" checked={checklist[key]} onChange={() => setChecklist({ ...checklist, [key]: !checklist[key] })} />
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                    ))}
                  </div>
                  <textarea
                    placeholder="Add verification notes..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                  />
                  <div className="modal-actions-v2">
                    <button className="approve-btn-v2" onClick={handleApprovePayment}>Approve Payment</button>
                    <button className="reject-btn-v2" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;