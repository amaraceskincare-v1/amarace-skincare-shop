import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/Admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    const { data } = await api.get('/orders');
    setOrders(data);
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

  const verifyPayment = async (id) => {
    try {
      await api.put(`/orders/${id}/verify-payment`);
      toast.success('Payment Verified & Email Sent');
      fetchOrders();
    } catch (error) {
      toast.error('Verification failed');
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

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <h1>Manage Orders</h1>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
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
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {order.items.map((item, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <img
                          src={item.product?.images?.[0] || '/placeholder.jpg'}
                          alt=""
                          style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <span style={{ fontSize: '0.9rem' }}>{item.product?.name} (x{item.quantity})</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td>₱{order.total.toFixed(2)}</td>
                <td>
                  <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{order.paymentMethod}</span>
                  {order.paymentProof && (
                    <div style={{ marginTop: '5px' }}>
                      <a
                        href={order.paymentProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#007bff', fontSize: '0.85rem', textDecoration: 'underline' }}
                      >
                        View Proof
                      </a>
                    </div>
                  )}
                </td>
                <td><span className={`status ${order.status}`}>{order.status}</span></td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      style={{ padding: '5px', borderRadius: '4px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => deleteOrder(order._id)}
                      style={{
                        background: '#ff4d4d',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default AdminOrders;