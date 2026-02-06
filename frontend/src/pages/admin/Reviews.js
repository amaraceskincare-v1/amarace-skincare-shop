import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiStar, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import '../../styles/Admin.css';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get('/reviews');
            setReviews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch reviews failed:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/reviews/${id}/status`, { status });
            toast.success(`Review marked as ${status}`);
            fetchReviews();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const deleteReview = async (id) => {
        if (window.confirm('Delete this review forever?')) {
            try {
                await api.delete(`/reviews/${id}`);
                toast.success('Review deleted');
                fetchReviews();
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const handleReply = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/reviews/${replyingTo}/response`, { text: replyText });
            toast.success('Response added');
            setReplyingTo(null);
            setReplyText('');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to add response');
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>Review Management</h1>
                    <div className="review-stats-mini">
                        <span>Total: {reviews.length}</span>
                        <span style={{ marginLeft: '1rem', color: '#ffc107' }}>
                            Avg: {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)} ⭐
                        </span>
                    </div>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Rating</th>
                                <th>Review details</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
                            ) : reviews.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No reviews found.</td></tr>
                            ) : (
                                reviews.map(review => (
                                    <tr key={review._id}>
                                        <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{review.user?.name || 'Anonymous'}</div>
                                            {review.verified && <span style={{ fontSize: '10px', color: '#10B981', display: 'block' }}>✅ Verified</span>}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <img
                                                    src={review.product?.image || 'https://via.placeholder.com/40'}
                                                    alt=""
                                                    style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                                <span style={{ fontSize: '13px' }}>{review.product?.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', color: '#ffc107', alignItems: 'center', gap: '4px' }}>
                                                {review.rating} <FiStar fill="#ffc107" size={12} />
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '350px' }}>
                                            {review.title && <div style={{ fontWeight: '700', marginBottom: '4px' }}>{review.title}</div>}
                                            <div style={{ fontSize: '14px', color: '#444' }}>{review.comment}</div>
                                            {review.recommend === 'no' && <span style={{ color: '#EF4444', fontSize: '11px' }}>✖ Not Recommended</span>}
                                            {review.store_response?.text && (
                                                <div style={{ marginTop: '8px', padding: '8px', background: '#f8f9fa', borderLeft: '2px solid #1a1a1a', fontSize: '12px' }}>
                                                    <strong>AmaraCé:</strong> {review.store_response.text}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <select
                                                value={review.status}
                                                onChange={(e) => updateStatus(review._id, e.target.value)}
                                                className={`status-select ${review.status.toLowerCase()}`}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.7rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(review._id);
                                                        setReplyText(review.store_response?.text || '');
                                                    }}
                                                    title="Add Store Response"
                                                    style={{ background: '#1a1a1a', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    <FiMessageSquare />
                                                </button>
                                                <button onClick={() => deleteReview(review._id)} title="Delete" style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Reply Modal */}
                {replyingTo && (
                    <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div className="admin-modal" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
                            <h3>Store Response</h3>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                style={{ width: '100%', height: '120px', padding: '12px', margin: '15px 0', borderRadius: '4px', border: '1px solid #ccc' }}
                                placeholder="Write your response to the customer..."
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => setReplyingTo(null)} style={{ padding: '8px 16px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleReply} style={{ padding: '8px 16px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Response</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminReviews;
