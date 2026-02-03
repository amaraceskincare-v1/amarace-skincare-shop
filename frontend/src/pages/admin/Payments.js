import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEye, FiCheck, FiX, FiDownload, FiRotateCw, FiZoomIn, FiZoomOut, FiAlertTriangle } from 'react-icons/fi';
import '../../styles/Admin.css';

const AdminPayments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [checklist, setChecklist] = useState({
        amountMatch: false,
        refVisible: false,
        screenshotClear: false,
        noTampering: false,
        timestampRecent: false
    });

    useEffect(() => {
        fetchGCashOrders();
    }, []);

    const fetchGCashOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            const ordersArray = Array.isArray(data) ? data : [];
            const gcashOrders = ordersArray.filter(order => order.paymentMethod === 'gcash');
            setOrders(gcashOrders);
        } catch (error) {
            console.error('Fetch payments failed:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setVerificationNotes('');
        setChecklist({
            amountMatch: false,
            refVisible: false,
            screenshotClear: false,
            noTampering: false,
            timestampRecent: false
        });
        setZoom(1);
        setRotation(0);
        setShowModal(true);
    };

    const handleApprove = async () => {
        if (!window.confirm("Approve Payment? This will mark the payment as verified and process the order. This action cannot be undone.")) return;

        try {
            await api.put(`/orders/${selectedOrder._id}/status`, {
                status: 'processing',
                verificationNotes: verificationNotes
            });
            toast.success('Payment approved successfully! Order is now being processed.');
            setShowModal(false);
            fetchGCashOrders();
        } catch (error) {
            toast.error('Failed to approve payment');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) {
            toast.warning('Please select a reason for rejection');
            return;
        }

        try {
            await api.put(`/orders/${selectedOrder._id}/status`, {
                status: 'rejected',
                rejectionReason: rejectionReason,
                verificationNotes: verificationNotes
            });
            toast.success('Payment rejected. Customer has been notified.');
            setShowRejectDialog(false);
            setShowModal(false);
            fetchGCashOrders();
        } catch (error) {
            toast.error('Failed to reject payment');
        }
    };

    const copyToExcel = () => {
        const header = "Order ID\tName\tNumber\tAmount Sent\tReference No.\tDate Sent\tStatus\n";
        const rows = orders.map(order => {
            const d = order.paymentData || {};
            const orderId = (() => {
                const date = new Date(order.createdAt);
                const year = date.getFullYear();
                const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
                const hhmm = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
                return `${year}-${mmdd}-${hhmm}`;
            })();

            return `${orderId}\t${d.name || 'N/A'}\t${d.number || 'N/A'}\t${d.amountSent || 'N/A'}\t${d.referenceNo || 'N/A'}\t${d.dateSent || 'N/A'}\t${order.status}`;
        }).join('\n');

        navigator.clipboard.writeText(header + rows);
        toast.success('Table data copied to clipboard! You can paste it into Excel.');
    };

    const getFormattedID = (order) => {
        const date = new Date(order.createdAt);
        const year = date.getFullYear();
        const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const hhmm = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
        return `${year}-${mmdd}-${hhmm}`;
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>GCash Payment Management</h1>
                    <button
                        onClick={copyToExcel}
                        style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Export to CSV
                    </button>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>GCash Info</th>
                            <th>Proof</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id}>
                                <td># {getFormattedID(order)}</td>
                                <td>{order.user?.name}<br /><small>{order.user?.email}</small></td>
                                <td>₱{order.total.toFixed(2)}</td>
                                <td>
                                    {order.gcashName || 'N/A'}<br />
                                    <small>{order.gcashNumber || 'N/A'}</small><br />
                                    <small>Ref: {order.gcashRef || 'N/A'}</small>
                                </td>
                                <td>
                                    {order.paymentProof ? (
                                        <div className="proof-thumbnail-wrapper" onClick={() => handleOpenModal(order)}>
                                            <img
                                                src={order.paymentProof}
                                                alt="Proof"
                                                className="proof-thumbnail"
                                            />
                                            <div className="proof-overlay"><FiEye /></div>
                                        </div>
                                    ) : 'No Proof'}
                                </td>
                                <td>
                                    <span className={`status-badge-v2 ${order.status}`}>{order.status.replace(/_/g, ' ')}</span>
                                </td>
                                <td>
                                    {order.status === 'awaiting_payment_verification' ? (
                                        <button
                                            onClick={() => handleOpenModal(order)}
                                            className="action-btn-verify"
                                        >
                                            <FiEye /> View & Verify
                                        </button>
                                    ) : (
                                        <div className="processed-badge">
                                            <FiCheck /> {order.status === 'processing' ? 'Verified' : 'Processed'}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No GCash orders found</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Verification Modal */}
                {showModal && selectedOrder && (
                    <div className="v2-modal-overlay">
                        <div className="v2-modal-container">
                            <div className="v2-modal-header">
                                <h3>Payment Verification - # {getFormattedID(selectedOrder)}</h3>
                                <button className="v2-modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>

                            <div className="v2-modal-body">
                                {/* Left Column: Proof Preview */}
                                <div className="v2-modal-left">
                                    <div className="proof-preview-container">
                                        <div
                                            className="proof-preview-image-wrapper"
                                            style={{
                                                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                                transition: 'transform 0.2s ease'
                                            }}
                                        >
                                            <img src={selectedOrder.paymentProof} alt="GCash Proof" />
                                        </div>
                                    </div>
                                    <div className="proof-controls">
                                        <button onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}><FiZoomIn /> Zoom In</button>
                                        <button onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}><FiZoomOut /> Zoom Out</button>
                                        <button onClick={() => setRotation(prev => prev + 90)}><FiRotateCw /> Rotate</button>
                                        <a href={selectedOrder.paymentProof} download={`Proof_${selectedOrder._id}.png`} className="v2-download-link">
                                            <FiDownload /> Download
                                        </a>
                                    </div>
                                    <div className="proof-meta">
                                        <small>Upload Date: {new Date(selectedOrder.updatedAt).toLocaleString()}</small>
                                    </div>
                                </div>

                                {/* Right Column: Verification Details */}
                                <div className="v2-modal-right">
                                    <div className="v2-info-card highlighted">
                                        <h4>Payment Details</h4>
                                        <div className="v2-info-row main-total">
                                            <span>Amount Paid:</span>
                                            <span className="amount-highlight">₱{selectedOrder.total.toFixed(2)}</span>
                                        </div>
                                        <div className="v2-info-row">
                                            <span>Reference Number:</span>
                                            <strong>{selectedOrder.gcashRef || 'N/A'}</strong>
                                        </div>
                                        <div className="v2-info-row">
                                            <span>Payment Date/Time:</span>
                                            <strong>{new Date(selectedOrder.updatedAt).toLocaleString()}</strong>
                                        </div>
                                        <div className={`v2-status-badge-inline ${selectedOrder.status}`}>
                                            {selectedOrder.status.replace(/_/g, ' ')}
                                        </div>
                                    </div>

                                    <div className="v2-info-card">
                                        <h4>Order Details</h4>
                                        <div className="v2-info-row">
                                            <span>Order ID:</span>
                                            <strong># {getFormattedID(selectedOrder)}</strong>
                                        </div>
                                        <div className="v2-info-row">
                                            <span>Order Amount:</span>
                                            <strong>₱{selectedOrder.total.toFixed(2)}</strong>
                                        </div>
                                        <div className="v2-info-row">
                                            <span>Customer Name:</span>
                                            <strong>{selectedOrder.user?.name}</strong>
                                        </div>
                                        <div className="v2-amount-checker">
                                            <span>Amount Match Indicator:</span>
                                            <div className="match-status">
                                                <FiCheck className="match-icon success" />
                                                <span className="match-text">✓ Matches</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="v2-checklist-card">
                                        <h4>Verification Checklist</h4>
                                        <div className="v2-checklist-item">
                                            <input type="checkbox" id="check1" checked={checklist.amountMatch} onChange={() => setChecklist({ ...checklist, amountMatch: !checklist.amountMatch })} />
                                            <label htmlFor="check1">Amount matches order total</label>
                                        </div>
                                        <div className="v2-checklist-item">
                                            <input type="checkbox" id="check2" checked={checklist.refVisible} onChange={() => setChecklist({ ...checklist, refVisible: !checklist.refVisible })} />
                                            <label htmlFor="check2">Reference number is visible and valid</label>
                                        </div>
                                        <div className="v2-checklist-item">
                                            <input type="checkbox" id="check3" checked={checklist.screenshotClear} onChange={() => setChecklist({ ...checklist, screenshotClear: !checklist.screenshotClear })} />
                                            <label htmlFor="check3">Screenshot is clear and readable</label>
                                        </div>
                                        <div className="v2-checklist-item">
                                            <input type="checkbox" id="check4" checked={checklist.noTampering} onChange={() => setChecklist({ ...checklist, noTampering: !checklist.noTampering })} />
                                            <label htmlFor="check4">No signs of tampering</label>
                                        </div>
                                    </div>

                                    <div className="v2-notes-section">
                                        <h4>Verification Notes (Optional)</h4>
                                        <textarea
                                            placeholder="Add any notes about this verification..."
                                            value={verificationNotes}
                                            onChange={(e) => setVerificationNotes(e.target.value)}
                                            maxLength={500}
                                        />
                                        <div className="notes-limit">{verificationNotes.length}/500</div>
                                    </div>

                                    <div className="v2-modal-actions">
                                        <button className="v2-btn-approve-large" onClick={handleApprove}>
                                            <FiCheck /> Approve & Process Order
                                        </button>
                                        <button className="v2-btn-reject-outline" onClick={() => setShowRejectDialog(true)}>
                                            <FiX /> Reject Payment
                                        </button>
                                        <button className="v2-btn-cancel-flat" onClick={() => setShowModal(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rejection Reasons Dialog */}
                {showRejectDialog && (
                    <div className="v2-dialog-overlay">
                        <div className="v2-dialog-box">
                            <h3>Reject Payment</h3>
                            <p>Please select a reason for rejection:</p>
                            <div className="v2-rejection-options">
                                {['Amount doesn\'t match', 'Screenshot is unclear', 'Suspected fraud', 'Invalid reference number', 'Other'].map(reason => (
                                    <label key={reason} className="v2-radio-label">
                                        <input
                                            type="radio"
                                            name="rejection"
                                            value={reason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        {reason}
                                    </label>
                                ))}
                            </div>
                            <div className="v2-dialog-actions">
                                <button className="v2-btn-confirm-reject" onClick={handleReject}>Reject & Notify Customer</button>
                                <button className="v2-btn-cancel-dialog" onClick={() => setShowRejectDialog(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
};

export default AdminPayments;
