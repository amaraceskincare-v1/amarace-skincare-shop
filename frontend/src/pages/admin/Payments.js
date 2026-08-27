import React, { useState, useEffect, useMemo } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import {
    FiEye, FiCheck, FiX, FiDownload, FiRotateCw, FiZoomIn,
    FiZoomOut, FiAlertTriangle, FiCheckCircle, FiFileText,
    FiSearch, FiFilter, FiUser, FiCalendar, FiClock
} from 'react-icons/fi';
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
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const [checklist, setChecklist] = useState({
        amountMatch: false,
        refVisible: false,
        screenshotClear: false,
        noTampering: false
    });

    useEffect(() => {
        fetchGCashOrders();
    }, []);

    const fetchGCashOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders');
            const ordersArray = Array.isArray(data) ? data : [];
            const gcashOrders = ordersArray.filter(order => order.paymentMethod === 'gcash');
            setOrders(gcashOrders);
        } catch (error) {
            console.error('Fetch payments failed:', error);
            toast.error('Failed to load GCash orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setVerificationNotes(order.verificationNotes || '');
        setRejectionReason('');

        const detectedAmt = parseFloat(order.paymentData?.amountSent || '0');
        const isMatch = Math.abs(detectedAmt - (order.total || 0)) < 0.05;

        setChecklist({
            amountMatch: isMatch,
            refVisible: Boolean(order.paymentData?.referenceNo && order.paymentData?.referenceNo !== 'N/A'),
            screenshotClear: Boolean(order.paymentProof),
            noTampering: true
        });
        setZoom(1);
        setRotation(0);
        setShowModal(true);
    };

    const handleApprove = async () => {
        if (!selectedOrder) return;
        if (!window.confirm("Approve GCash Payment? This will verify the payment, process the order, and notify the customer.")) return;

        try {
            setActionLoading(true);
            await api.put(`/orders/${selectedOrder._id}/verify-payment`, {
                verificationNotes: verificationNotes
            });
            toast.success('Payment approved & order moved to processing! ✨');
            setShowModal(false);
            fetchGCashOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve payment');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedOrder) return;
        if (!rejectionReason) {
            toast.warning('Please select or enter a reason for rejection');
            return;
        }

        try {
            setActionLoading(true);
            await api.put(`/orders/${selectedOrder._id}/reject-payment`, {
                rejectionReason: rejectionReason,
                verificationNotes: verificationNotes
            });
            toast.success('Payment rejected. Inventory has been restored and customer notified.');
            setShowRejectDialog(false);
            setShowModal(false);
            fetchGCashOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject payment');
        } finally {
            setActionLoading(false);
        }
    };

    const getFormattedID = (order) => {
        if (!order || !order.createdAt) return 'N/A';
        const date = new Date(order.createdAt);
        const year = date.getFullYear();
        const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const hhmm = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
        return `${year}-${mmdd}-${hhmm}`;
    };

    const counts = useMemo(() => {
        return {
            all: orders.length,
            awaiting: orders.filter(o => o.status === 'awaiting_payment_verification').length,
            processing: orders.filter(o => ['processing', 'shipped', 'delivered'].includes(o.status)).length,
            rejected: orders.filter(o => ['rejected', 'cancelled'].includes(o.status)).length,
        };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Status filter
            if (statusFilter === 'awaiting' && order.status !== 'awaiting_payment_verification') return false;
            if (statusFilter === 'processing' && !['processing', 'shipped', 'delivered'].includes(order.status)) return false;
            if (statusFilter === 'rejected' && !['rejected', 'cancelled'].includes(order.status)) return false;

            // Search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const orderId = getFormattedID(order).toLowerCase();
                const name = (order.contactDetails?.fullName || order.user?.name || '').toLowerCase();
                const email = (order.contactDetails?.email || order.user?.email || '').toLowerCase();
                const ref = (order.paymentData?.referenceNo || '').toLowerCase();
                return orderId.includes(query) || name.includes(query) || email.includes(query) || ref.includes(query);
            }
            return true;
        });
    }, [orders, statusFilter, searchQuery]);

    const copyToExcel = () => {
        const header = "Order ID\tCustomer Name\tCustomer Email\tOrder Total\tOCR Detected Amount\tReference No.\tDate Sent\tStatus\n";
        const rows = filteredOrders.map(order => {
            const d = order.paymentData || {};
            const orderId = getFormattedID(order);
            const customerName = order.contactDetails?.fullName || order.user?.name || 'N/A';
            const customerEmail = order.contactDetails?.email || order.user?.email || 'N/A';
            return `${orderId}\t${customerName}\t${customerEmail}\t${(order.total || 0).toFixed(2)}\t${d.amountSent || 'N/A'}\t${d.referenceNo || 'N/A'}\t${d.dateSent || 'N/A'}\t${order.status}`;
        }).join('\n');

        navigator.clipboard.writeText(header + rows);
        toast.success('Table data copied to clipboard! Ready to paste into Excel.');
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                {/* Header */}
                <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ margin: 0 }}>GCash Payment Management</h1>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>
                            Verify receipts, review OCR detected data, and authorize customer orders.
                        </p>
                    </div>
                    <button
                        onClick={copyToExcel}
                        className="btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', background: '#1C1C1E', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                    >
                        <FiDownload /> Export to CSV
                    </button>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="admin-controls-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="status-filter-pills" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('all')}
                        >
                            All ({counts.all})
                        </button>
                        <button
                            className={`filter-pill ${statusFilter === 'awaiting' ? 'active alert' : ''}`}
                            onClick={() => setStatusFilter('awaiting')}
                            style={{ position: 'relative' }}
                        >
                            Awaiting Verification ({counts.awaiting})
                            {counts.awaiting > 0 && <span className="pill-dot" />}
                        </button>
                        <button
                            className={`filter-pill ${statusFilter === 'processing' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('processing')}
                        >
                            Verified / Processing ({counts.processing})
                        </button>
                        <button
                            className={`filter-pill ${statusFilter === 'rejected' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('rejected')}
                        >
                            Rejected / Cancelled ({counts.rejected})
                        </button>
                    </div>

                    <div className="admin-search-box" style={{ position: 'relative', minWidth: '260px' }}>
                        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            placeholder="Search Order ID, name, ref #..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                        />
                    </div>
                </div>

                {/* Orders Table */}
                <div className="orders-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Order Total</th>
                                <th>OCR Detected Info</th>
                                <th>Receipt Proof</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => {
                                const d = order.paymentData || {};
                                const detectedAmt = parseFloat(d.amountSent || '0');
                                const hasMatch = detectedAmt > 0 && Math.abs(detectedAmt - (order.total || 0)) < 0.05;

                                return (
                                    <tr key={order._id}>
                                        <td style={{ fontWeight: '700', whiteSpace: 'nowrap' }}>
                                            #{getFormattedID(order)}
                                        </td>
                                        <td>
                                            <strong>{order.contactDetails?.fullName || order.user?.name || 'Customer'}</strong>
                                            <br />
                                            <small style={{ color: '#666' }}>{order.contactDetails?.email || order.user?.email || 'N/A'}</small>
                                            {order.contactDetails?.phone && (
                                                <>
                                                    <br />
                                                    <small style={{ color: '#888' }}>{order.contactDetails.phone}</small>
                                                </>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: '800', color: '#1C1C1E', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
                                            ₱{(order.total || 0).toFixed(2)}
                                        </td>
                                        <td>
                                            {d.amountSent && d.amountSent !== '0.00' ? (
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontWeight: '700',
                                                        background: hasMatch ? '#E6F4EA' : '#FEF3C7',
                                                        color: hasMatch ? '#137333' : '#92400E',
                                                        marginBottom: '4px'
                                                    }}>
                                                        ₱{parseFloat(d.amountSent).toFixed(2)} {hasMatch ? '✓ Match' : '⚠️ Check'}
                                                    </span>
                                                    {d.referenceNo && d.referenceNo !== 'N/A' && (
                                                        <div style={{ color: '#555', fontSize: '0.8rem' }}>
                                                            Ref: <strong style={{ color: '#111' }}>{d.referenceNo}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#999', fontSize: '0.85rem' }}>Manual check required</span>
                                            )}
                                        </td>
                                        <td>
                                            {order.paymentProof ? (
                                                <div
                                                    className="proof-thumbnail-wrapper"
                                                    onClick={() => handleOpenModal(order)}
                                                    title="Click to view full receipt"
                                                    style={{ cursor: 'pointer', display: 'inline-block' }}
                                                >
                                                    <img
                                                        src={order.paymentProof}
                                                        alt="Receipt Proof"
                                                        className="proof-thumbnail"
                                                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                                                    />
                                                </div>
                                            ) : (
                                                <span style={{ color: '#999', fontSize: '0.85rem' }}>No Proof</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge-v2 ${order.status}`}>
                                                {order.status === 'awaiting_payment_verification'
                                                    ? 'Awaiting Verification'
                                                    : order.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            {order.status === 'awaiting_payment_verification' ? (
                                                <button
                                                    onClick={() => handleOpenModal(order)}
                                                    className="action-btn-verify"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        background: '#C41E3A',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '7px 14px',
                                                        borderRadius: '6px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FiEye /> View &amp; Verify
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenModal(order)}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        background: '#f3f4f6',
                                                        color: '#374151',
                                                        border: '1px solid #d1d5db',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FiEye /> View Details
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredOrders.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                                        No GCash orders found matching this filter.
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                                        Loading GCash orders...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Verification Modal */}
                {showModal && selectedOrder && (
                    <div className="v2-modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="v2-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1050px', width: '95%' }}>
                            <div className="v2-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>GCash Payment Verification — #{getFormattedID(selectedOrder)}</h3>
                                    <small style={{ color: '#666' }}>Order Placed: {new Date(selectedOrder.createdAt).toLocaleString('en-PH')}</small>
                                </div>
                                <button className="v2-modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>
                                    <FiX />
                                </button>
                            </div>

                            <div className="v2-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '1.25rem' }}>
                                {/* Left Column: Receipt Viewer */}
                                <div className="v2-modal-left" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div
                                        className="proof-preview-container"
                                        style={{
                                            background: '#1a1a1a',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            minHeight: '400px',
                                            maxHeight: '520px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}
                                    >
                                        {selectedOrder.paymentProof ? (
                                            <div
                                                className="proof-preview-image-wrapper"
                                                style={{
                                                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                                    transition: 'transform 0.2s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <img
                                                    src={selectedOrder.paymentProof}
                                                    alt="GCash Receipt Screenshot"
                                                    style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain' }}
                                                />
                                            </div>
                                        ) : (
                                            <p style={{ color: '#aaa' }}>No receipt proof attached</p>
                                        )}
                                    </div>

                                    {/* Viewer Controls */}
                                    <div className="proof-controls" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <button onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))} className="btn-icon-text">
                                            <FiZoomIn /> Zoom In
                                        </button>
                                        <button onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))} className="btn-icon-text">
                                            <FiZoomOut /> Zoom Out
                                        </button>
                                        <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="btn-icon-text">
                                            <FiRotateCw /> Rotate
                                        </button>
                                        {selectedOrder.paymentProof && (
                                            <a
                                                href={selectedOrder.paymentProof}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={`GCash_Receipt_${getFormattedID(selectedOrder)}.png`}
                                                className="btn-icon-text download"
                                            >
                                                <FiDownload /> Open Full
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Verification Data & Actions */}
                                <div className="v2-modal-right" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                    {/* Amount Comparison Card */}
                                    {(() => {
                                        const detectedAmt = parseFloat(selectedOrder.paymentData?.amountSent || '0');
                                        const orderTotal = selectedOrder.total || 0;
                                        const diff = Math.abs(detectedAmt - orderTotal);
                                        const isMatch = detectedAmt > 0 && diff < 0.05;

                                        return (
                                            <div className="v2-comparison-card" style={{
                                                padding: '16px',
                                                borderRadius: '12px',
                                                background: isMatch ? '#F0FDF4' : '#FFFBEB',
                                                border: `1.5px solid ${isMatch ? '#86EFAC' : '#FDE68A'}`
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', color: isMatch ? '#166534' : '#92400E' }}>
                                                        Payment Comparison
                                                    </span>
                                                    <span style={{
                                                        padding: '3px 10px',
                                                        borderRadius: '50px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '800',
                                                        background: isMatch ? '#22C55E' : '#F59E0B',
                                                        color: '#fff'
                                                    }}>
                                                        {isMatch ? '✓ EXACT MATCH' : (detectedAmt > 0 ? '⚠️ AMOUNT MISMATCH' : '🔍 MANUAL REVIEW')}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                    <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>ORDER TOTAL</span>
                                                        <strong style={{ fontSize: '1.35rem', color: '#1C1C1E' }}>₱{orderTotal.toFixed(2)}</strong>
                                                    </div>
                                                    <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#666', display: 'block' }}>OCR DETECTED AMOUNT</span>
                                                        <strong style={{ fontSize: '1.35rem', color: isMatch ? '#166534' : '#DC2626' }}>
                                                            {detectedAmt > 0 ? `₱${detectedAmt.toFixed(2)}` : 'Not Detected'}
                                                        </strong>
                                                    </div>
                                                </div>

                                                {!isMatch && detectedAmt > 0 && (
                                                    <p style={{ color: '#B45309', fontSize: '0.85rem', margin: '8px 0 0', fontWeight: '600' }}>
                                                        Discrepancy: Difference of ₱{diff.toFixed(2)}. Please visually verify against receipt screenshot.
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* OCR Extracted Metadata */}
                                    <div className="v2-info-card" style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                                        <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>Receipt Information</h4>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.875rem' }}>
                                            <div>
                                                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>CUSTOMER</span>
                                                <strong>{selectedOrder.contactDetails?.fullName || selectedOrder.user?.name || 'N/A'}</strong>
                                                <div style={{ color: '#888', fontSize: '0.8rem' }}>{selectedOrder.contactDetails?.phone}</div>
                                            </div>
                                            <div>
                                                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>REFERENCE NUMBER</span>
                                                <strong style={{ color: '#C41E3A', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                                    {selectedOrder.paymentData?.referenceNo || 'N/A (Check Screenshot)'}
                                                </strong>
                                            </div>
                                            <div>
                                                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>DATE ON RECEIPT</span>
                                                <span>{selectedOrder.paymentData?.dateSent || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>SENDER NUMBER</span>
                                                <span>{selectedOrder.paymentData?.number || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Checklist */}
                                    <div className="v2-checklist-card" style={{ background: '#fff', padding: '14px', borderRadius: '10px', border: '1px solid #eee' }}>
                                        <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#666', textTransform: 'uppercase' }}>Admin Verification Checklist</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={checklist.amountMatch}
                                                    onChange={() => setChecklist(p => ({ ...p, amountMatch: !p.amountMatch }))}
                                                />
                                                Amount Matches
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={checklist.refVisible}
                                                    onChange={() => setChecklist(p => ({ ...p, refVisible: !p.refVisible }))}
                                                />
                                                Ref # is Visible
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={checklist.screenshotClear}
                                                    onChange={() => setChecklist(p => ({ ...p, screenshotClear: !p.screenshotClear }))}
                                                />
                                                Receipt Clear
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={checklist.noTampering}
                                                    onChange={() => setChecklist(p => ({ ...p, noTampering: !p.noTampering }))}
                                                />
                                                No Tampering
                                            </label>
                                        </div>
                                    </div>

                                    {/* Verification Notes */}
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>
                                            Internal Verification Notes (Optional):
                                        </label>
                                        <textarea
                                            placeholder="Add any verification note or transaction reference details..."
                                            value={verificationNotes}
                                            onChange={(e) => setVerificationNotes(e.target.value)}
                                            maxLength={500}
                                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.85rem', resize: 'vertical', minHeight: '50px' }}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="v2-modal-actions" style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px' }}>
                                        {selectedOrder.status === 'awaiting_payment_verification' && (
                                            <>
                                                <button
                                                    className="btn-approve"
                                                    onClick={handleApprove}
                                                    disabled={actionLoading}
                                                    style={{
                                                        flex: 2,
                                                        background: '#16A34A',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '12px 18px',
                                                        borderRadius: '8px',
                                                        fontWeight: '700',
                                                        fontSize: '0.95rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <FiCheckCircle size={18} /> Approve &amp; Process Order
                                                </button>
                                                <button
                                                    className="btn-reject"
                                                    onClick={() => setShowRejectDialog(true)}
                                                    disabled={actionLoading}
                                                    style={{
                                                        flex: 1,
                                                        background: '#fff',
                                                        color: '#DC2626',
                                                        border: '1.5px solid #DC2626',
                                                        padding: '12px 16px',
                                                        borderRadius: '8px',
                                                        fontWeight: '700',
                                                        fontSize: '0.95rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    <FiX size={18} /> Reject
                                                </button>
                                            </>
                                        )}
                                        {selectedOrder.status !== 'awaiting_payment_verification' && (
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span className={`status-badge-v2 ${selectedOrder.status}`}>
                                                    Current Status: {selectedOrder.status.replace(/_/g, ' ')}
                                                </span>
                                                {selectedOrder.rejectionReason && (
                                                    <span style={{ color: '#DC2626', fontSize: '0.85rem' }}>
                                                        Reason: {selectedOrder.rejectionReason}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => setShowModal(false)}
                                                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rejection Reasons Dialog */}
                {showRejectDialog && (
                    <div className="v2-dialog-overlay" onClick={() => setShowRejectDialog(false)}>
                        <div className="v2-dialog-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%', padding: '24px', borderRadius: '12px', background: '#fff' }}>
                            <h3 style={{ margin: '0 0 8px', color: '#C41E3A' }}>Reject GCash Payment</h3>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '16px' }}>
                                This will mark the order as rejected, safely restore product inventory, and notify the customer.
                            </p>

                            <div className="v2-rejection-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                                {[
                                    'Amount does not match order total',
                                    'Receipt screenshot is unclear or truncated',
                                    'Invalid or unverifiable reference number',
                                    'Duplicate / previously submitted receipt',
                                    'Suspected fraudulent or edited screenshot',
                                    'Other (specified in notes)'
                                ].map(reason => (
                                    <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input
                                            type="radio"
                                            name="rejection"
                                            value={reason}
                                            checked={rejectionReason === reason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        {reason}
                                    </label>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowRejectDialog(false)}
                                    style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#DC2626', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPayments;
