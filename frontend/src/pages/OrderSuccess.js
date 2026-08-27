import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiCheckCircle, FiClock, FiDownload, FiShoppingBag, FiFileText, FiArrowRight, FiShield } from 'react-icons/fi';
import '../styles/Checkout.css';

const OrderSuccess = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatOrderId = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        const year = d.getFullYear();
        const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
        const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
        return `${year}-${mmdd}-${hhmm}`;
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const generatePDF = () => {
        if (!order) return;

        const renderPDF = (doc) => {
            doc.setFontSize(12);
            doc.text(`Order ID: ${formatOrderId(order.createdAt)}`, 14, 32);
            doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-PH')}`, 14, 38);
            doc.text(`Payment: ${order.paymentMethod?.toUpperCase()}`, 14, 44);
            doc.text(`Status: ${order.status?.toUpperCase()?.replace(/_/g, ' ')}`, 14, 50);

            const tableColumn = ["Item", "Quantity", "Price", "Total"];
            const tableRows = [];

            order.items.forEach(item => {
                const itemData = [
                    item.product?.name || 'Product',
                    item.quantity,
                    `P${item.product?.price?.toFixed(2)}`,
                    `P${(item.quantity * item.product?.price).toFixed(2)}`
                ];
                tableRows.push(itemData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 56,
            });

            const finalY = doc.lastAutoTable.finalY || 60;

            doc.text(`Subtotal: P${order.subtotal?.toFixed(2)}`, 14, finalY + 10);

            let currentY = finalY + 16;
            if (order.discount && order.discount > 0) {
                doc.setTextColor(255, 107, 107);
                doc.text(`Discount (10%): -P${order.discount.toFixed(2)}`, 14, currentY);
                doc.setTextColor(0, 0, 0);
                currentY += 6;
            }

            doc.text(`Shipping: P${order.shippingCost?.toFixed(2)}`, 14, currentY);
            doc.setFontSize(14);
            doc.text(`Order Total: P${order.total?.toFixed(2)}`, 14, currentY + 8);

            doc.save(`amarace-receipt-${order._id}.pdf`);
        };

        const doc = new jsPDF();

        const logoImg = new Image();
        logoImg.src = '/logo.png';
        logoImg.onload = () => {
            const pageWidth = doc.internal.pageSize.getWidth();
            const groupWidth = 110;
            const startX = (pageWidth - groupWidth) / 2;
            doc.addImage(logoImg, 'PNG', startX, 12, 12, 12);
            doc.setFontSize(18);
            doc.text('AmaraCé Skin Care - Order Receipt', startX + 16, 21);
            renderPDF(doc);
        };
        logoImg.onerror = () => {
            const pageWidth = doc.internal.pageSize.getWidth();
            doc.setFontSize(18);
            doc.text('AmaraCé Skin Care - Order Receipt', pageWidth / 2, 21, { align: 'center' });
            renderPDF(doc);
        };
    };

    if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '100px 20px', fontSize: '1.2rem', color: '#666' }}>Loading order details...</div>;

    if (!order) return <div className="error" style={{ textAlign: 'center', padding: '100px 20px', fontSize: '1.2rem', color: '#C41E3A' }}>Order not found.</div>;

    const isGCash = order.paymentMethod === 'gcash';

    return (
        <div className="order-success-page-v2">
            <div className="order-success-card">
                {/* Header Icon & Title */}
                <div className="success-icon-badge">
                    {isGCash ? (
                        <div className="gcash-success-icon-ring">
                            <FiClock className="success-main-icon clock" />
                        </div>
                    ) : (
                        <div className="cod-success-icon-ring">
                            <FiCheckCircle className="success-main-icon check" />
                        </div>
                    )}
                </div>

                <h1 className="success-headline">
                    {isGCash ? 'GCash Payment Submitted!' : 'Thank You for Your Order!'}
                </h1>

                <p className="success-subheading">
                    {isGCash
                        ? 'We have received your GCash receipt. Our team will verify your payment shortly.'
                        : 'Your order has been placed and is now being processed.'}
                </p>

                {/* Order Summary Pill Box */}
                <div className="order-meta-pillbox">
                    <div className="meta-pill-item">
                        <span className="pill-label">ORDER NUMBER</span>
                        <strong className="pill-value">#{formatOrderId(order.createdAt)}</strong>
                    </div>
                    <div className="meta-pill-divider" />
                    <div className="meta-pill-item">
                        <span className="pill-label">TOTAL AMOUNT</span>
                        <strong className="pill-value total-highlight">₱{(order.total || 0).toFixed(2)}</strong>
                    </div>
                    <div className="meta-pill-divider" />
                    <div className="meta-pill-item">
                        <span className="pill-label">PAYMENT METHOD</span>
                        <strong className="pill-value">{isGCash ? 'GCash QR' : 'Cash On Delivery'}</strong>
                    </div>
                </div>

                {/* GCash Verification Specific Card */}
                {isGCash && (
                    <div className="gcash-verification-status-card">
                        <div className="status-card-header">
                            <div className="verification-pill">
                                <span className="pulsing-dot" /> Awaiting Payment Verification
                            </div>
                            <span className="secure-badge"><FiShield /> AmaraCé Verified Merchant</span>
                        </div>

                        {order.paymentProof && (
                            <div className="receipt-proof-attached-row">
                                <div className="proof-mini-thumb">
                                    <img src={order.paymentProof} alt="Payment Proof" />
                                </div>
                                <div className="proof-mini-text">
                                    <strong>Payment Proof Attached ✓</strong>
                                    <small>Receipt screenshot securely uploaded for merchant verification.</small>
                                </div>
                            </div>
                        )}

                        <div className="timeline-steps">
                            <div className="timeline-step completed">
                                <div className="step-dot">✓</div>
                                <div className="step-info">
                                    <strong>Order &amp; Receipt Received</strong>
                                    <small>Payment proof submitted</small>
                                </div>
                            </div>
                            <div className="timeline-connector" />
                            <div className="timeline-step current">
                                <div className="step-dot">2</div>
                                <div className="step-info">
                                    <strong>Merchant Verification</strong>
                                    <small>Usually within 1–2 hours</small>
                                </div>
                            </div>
                            <div className="timeline-connector" />
                            <div className="timeline-step pending">
                                <div className="step-dot">3</div>
                                <div className="step-info">
                                    <strong>Order Dispatch</strong>
                                    <small>Shipped to your address</small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* COD Specific Card */}
                {!isGCash && (
                    <div className="cod-confirmation-card">
                        <h3>Delivery &amp; Payment Reminders</h3>
                        <ul>
                            <li>Please prepare exact cash of <strong>₱{(order.total || 0).toFixed(2)}</strong> upon delivery.</li>
                            <li>Our rider will hand over your packaged items and collect payment.</li>
                            <li>You will receive an SMS/Email update once the rider is on the way.</li>
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="order-success-actions">
                    <button
                        onClick={generatePDF}
                        className="btn-download-receipt"
                    >
                        <FiDownload /> Download Receipt (PDF)
                    </button>

                    <Link to="/orders" className="btn-view-orders">
                        View My Orders <FiArrowRight />
                    </Link>

                    <Link to="/products" className="btn-continue-shopping">
                        <FiShoppingBag /> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
