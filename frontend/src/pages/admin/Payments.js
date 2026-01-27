import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import '../../styles/Admin.css';

const AdminPayments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGCashOrders();
    }, []);

    const fetchGCashOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            const gcashOrders = data.filter(order => order.paymentMethod === 'gcash');
            setOrders(gcashOrders);
        } catch (error) {
            toast.error('Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (id, isChecked) => {
        try {
            if (isChecked) {
                await api.put(`/orders/${id}/status`, { status: 'processing' });
                toast.success('Payment verified! Order status updated to Processing.');
            } else {
                await api.put(`/orders/${id}/status`, { status: 'awaiting_payment_verification' });
                toast.info('Order set back to awaiting verification.');
            }
            fetchGCashOrders();
        } catch (error) {
            toast.error('Failed to update status');
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

    return (
        <div className="admin-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>GCash Payment Management</h1>
                <button
                    onClick={copyToExcel}
                    style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Copy for Excel
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Paid?</th>
                            <th>Order ID</th>
                            <th>Name</th>
                            <th>Number</th>
                            <th>Amount Sent</th>
                            <th>Reference No.</th>
                            <th>Date Sent</th>
                            <th>Proof</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center' }}>No GCash orders found.</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order._id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={order.status !== 'awaiting_payment_verification' && order.status !== 'cancelled'}
                                            onChange={(e) => verifyPayment(order._id, e.target.checked)}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td># {(() => {
                                        const date = new Date(order.createdAt);
                                        const year = date.getFullYear();
                                        const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
                                        const hhmm = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
                                        return `${year}-${mmdd}-${hhmm}`;
                                    })()}</td>
                                    <td>{order.paymentData?.name || '-'}</td>
                                    <td>{order.paymentData?.number || '-'}</td>
                                    <td>₱{order.paymentData?.amountSent || '0.00'}</td>
                                    <td
                                        onClick={() => alert(`Full Extracted Data:\nName: ${order.paymentData?.name}\nNumber: ${order.paymentData?.number}\nAmount: ${order.paymentData?.amountSent}\nRef: ${order.paymentData?.referenceNo}`)}
                                        style={{ cursor: 'pointer', color: '#1a1a1a', textDecoration: 'underline' }}
                                        title="Click to view full details"
                                    >
                                        {order.paymentData?.referenceNo || '-'}
                                    </td>
                                    <td>{order.paymentData?.dateSent || '-'}</td>
                                    <td>
                                        {order.paymentProof && (
                                            <a href={order.paymentProof} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                                                View
                                            </a>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status ${order.status}`}>{order.status}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPayments;
