import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import api from '../utils/api';
import '../styles/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(data);

        // Fetch user's reviews to check which products they've already reviewed
        await fetchUserReviews(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const fetchUserReviews = async (orders) => {
    try {
      // Get all product IDs from delivered orders
      const deliveredProducts = orders
        .filter(order => order.status === 'delivered')
        .flatMap(order => order.items.map(item => item.product?._id))
        .filter(Boolean);

      if (deliveredProducts.length === 0) return;

      // Fetch reviews for each product and check if user reviewed
      const reviewPromises = deliveredProducts.map(productId =>
        api.get(`/reviews/product/${productId}`).catch(() => ({ data: [] }))
      );

      const reviewsResponses = await Promise.all(reviewPromises);

      // Create a set of product IDs that user has already reviewed
      const reviewedProductIds = new Set();
      reviewsResponses.forEach((response, index) => {
        const reviews = response.data;
        const productId = deliveredProducts[index];
        // Check if any review in this product's reviews belongs to current user
        const hasUserReview = reviews.some(review => review.user?._id);
        if (hasUserReview) {
          reviewedProductIds.add(productId);
        }
      });

      setUserReviews(reviewedProductIds);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  };

  const handleWriteReview = (productId) => {
    // Navigate to product page and scroll to review section
    navigate(`/products/${productId}`, { state: { scrollToReview: true } });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b', processing: '#3b82f6',
      shipped: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) return <div className="loading">Loading...</div>;

  // Pagination Logic
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <Link to="/products" className="shop-link">Start Shopping</Link>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {currentOrders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">
                      Order #{(() => {
                        const d = new Date(order.createdAt);
                        const year = d.getFullYear();
                        const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
                        const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
                        return `${year}-${mmdd}-${hhmm}`;
                      })()}
                    </span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="order-status" style={{ background: getStatusColor(order.status) }}>
                    {order.status}
                  </span>
                </div>
                <div className="order-items">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item._id} className="order-item-wrapper">
                      <div className="order-item">
                        <img src={item.product?.images?.[0] || '/placeholder.jpg'} alt="" />
                        <span>{item.product?.name}</span>
                        <span>x{item.quantity}</span>
                      </div>

                      {/* Show Review Button only for Delivered orders */}
                      {order.status === 'delivered' && item.product?._id && (
                        <div className="review-action">
                          {userReviews.has(item.product._id) ? (
                            <button
                              className="review-btn reviewed"
                              onClick={() => navigate(`/products/${item.product._id}`)}
                              disabled
                            >
                              <FiStar fill="#10b981" color="#10b981" />
                              Reviewed
                            </button>
                          ) : (
                            <button
                              className="review-btn"
                              onClick={() => handleWriteReview(item.product._id)}
                            >
                              <FiStar />
                              Write Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && <span>+{order.items.length - 3} more items</span>}
                </div>
                <div className="order-footer">
                  <span className="order-total">Total: ₱{order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center' }}>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;