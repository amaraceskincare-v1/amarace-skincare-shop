import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiCheckCircle, FiDownload, FiShoppingBag } from 'react-icons/fi';
import '../styles/Checkout.css'; // Reusing checkout styles or create new

const OrderSuccess = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatOrderId = (date) => {
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

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('AmaraCé Skin Care - Order Receipt', 14, 22);

        doc.setFontSize(12);
        doc.text(`Order ID: ${formatOrderId(order.createdAt)}`, 14, 32);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 38);
        doc.text(`Status: ${order.status}`, 14, 44);

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
            startY: 50,
        });

        const finalY = doc.lastAutoTable.finalY || 60;

        doc.text(`Subtotal: P${order.subtotal?.toFixed(2)}`, 14, finalY + 10);
        doc.text(`Shipping: P${order.shippingCost?.toFixed(2)}`, 14, finalY + 16);
        doc.setFontSize(14);
        doc.text(`Order Total: P${order.total?.toFixed(2)}`, 14, finalY + 24);

        doc.save(`amarace-receipt-${order._id}.pdf`);
    };

    if (loading) return <div className="loading">Loading order details...</div>;

    if (!order) return <div className="error">Order not found.</div>;

    return (
        <div className="order-success-page" style={{ textAlign: 'center', padding: '50px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <FiCheckCircle size={80} color="#4f46e5" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Thank You for Your Order!</h1>
            <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '30px' }}>
                Your order <strong>#{formatOrderId(order.createdAt)}</strong> has been placed successfully.
            </p>

            <div className="success-actions" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <button
                    onClick={generatePDF}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '1rem' }}
                >
                    <FiDownload /> Download Receipt
                </button>

                <Link
                    to="/products"
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', borderRadius: '8px', background: '#4f46e5', color: 'white', textDecoration: 'none', fontSize: '1rem' }}
                >
                    <FiShoppingBag /> Continue Shopping
                </Link>
            </div>

            <div style={{ marginTop: '40px', padding: '20px', background: '#f9fafb', borderRadius: '12px', textAlign: 'left' }}>
                <h3>What's Next?</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: '#555' }}>
                    <li>We will verify your payment within 24 hours.</li>
                    <li>You will receive an email confirmation shortly.</li>
                    <li>You can track your order status in your <Link to="/orders" style={{ color: '#4f46e5' }}>My Orders</Link> page.</li>
                </ul>
            </div>
        </div>
    );
};

export default OrderSuccess;
