import AdminSidebar from '../../components/AdminSidebar';
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
                                <td>
                                    # {(() => {
                                        const d = new Date(order.createdAt);
                                        const year = d.getFullYear();
                                        const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
                                        const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
                                        return `${year}-${mmdd}-${hhmm}`;
                                    })()}
                                </td>
                                <td>{order.user?.name}<br /><small>{order.user?.email}</small></td>
                                <td>₱{order.total.toFixed(2)}</td>
                                <td>
                                    {order.gcashName || 'N/A'}<br />
                                    <small>{order.gcashNumber || 'N/A'}</small><br />
                                    <small>Ref: {order.gcashRef || 'N/A'}</small>
                                </td>
                                <td>
                                    {order.paymentProof ? (
                                        <a href={order.paymentProof} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={order.paymentProof}
                                                alt="Proof"
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        </a>
                                    ) : 'No Proof'}
                                </td>
                                <td>
                                    <span className={`status ${order.status}`}>{order.status}</span>
                                </td>
                                <td>
                                    {order.status === 'awaiting_payment_verification' && (
                                        <button
                                            onClick={() => verifyPayment(order._id)}
                                            style={{ background: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Verify
                                        </button>
                                    )}
                                    {order.status === 'pending' && <small>Awaiting GCash Info</small>}
                                    {order.status !== 'pending' && order.status !== 'awaiting_payment_verification' && <small>Processed</small>}
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No GCash orders found</td></tr>
                        )}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default AdminPayments;
