import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiStar, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
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

    const approveReview = async (id) => {
        try {
            await api.patch(`/reviews/${id}/approve`);
            toast.success('Review approved');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to approve');
        }
    };

    const rejectReview = async (id) => {
        try {
            await api.patch(`/reviews/${id}/reject`);
            toast.success('Review rejected');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to reject');
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

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <h1>Review Management</h1>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Rating</th>
                                <th>Comment</th>
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
                                        <td>{review.user?.name || 'Anonymous'}</td>
                                        <td>{review.product?.name || 'Deleted Product'}</td>
                                        <td>
                                            <div style={{ display: 'flex', color: '#ffc107' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <FiStar key={i} fill={i < review.rating ? '#ffc107' : 'none'} size={14} />
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '300px' }}>{review.comment}</td>
                                        <td>
                                            <span className={`status-badge ${review.status.toLowerCase()}`}>{review.status}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {review.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => approveReview(review._id)} title="Approve" style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px', borderRadius: '4px' }}>
                                                            <FiCheck />
                                                        </button>
                                                        <button onClick={() => rejectReview(review._id)} title="Reject" style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px', borderRadius: '4px' }}>
                                                            <FiX />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => deleteReview(review._id)} title="Delete" style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px', borderRadius: '4px' }}>
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
            </main>
        </div>
    );
};

export default AdminReviews;
