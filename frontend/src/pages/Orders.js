import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiStar, FiShoppingBag } from 'react-icons/fi';
import api from '../utils/api';
import '../styles/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState(new Set());
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        const ordersList = Array.isArray(data) ? data : [];
        setOrders(ordersList);
        if (ordersList.length > 0) {
          await fetchUserReviews(ordersList);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const fetchUserReviews = async (ordersList) => {
    try {
      const deliveredProducts = (ordersList || [])
        .filter(order => order?.status === 'delivered')
        .flatMap(order => (order?.items || []).map(item => item?.product?._id))
        .filter(Boolean);

      if (deliveredProducts.length === 0) return;

      const reviewPromises = deliveredProducts.map(productId =>
        api.get(`/reviews/product/${productId}`).catch(() => ({ data: [] }))
      );

      const reviewsResponses = await Promise.all(reviewPromises);
      const reviewedProductIds = new Set();

      reviewsResponses.forEach((response, index) => {
        const reviews = response?.data || [];
        const hasUserReview = reviews.some(review => review?.user?._id);
        if (hasUserReview) {
          reviewedProductIds.add(deliveredProducts[index]);
        }
      });

      setUserReviews(reviewedProductIds);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  };

  const handleWriteReview = (productId) => {
    if (!productId) return;
    navigate(`/products/${productId}`, { state: { scrollToReview: true } });
  };

  if (loading) return <div className="loading">Loading your orders...</div>;

  // Safe Pagination Logic
  const safeOrders = orders || [];
  const totalPages = Math.ceil(safeOrders.length / itemsPerPage);
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = safeOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const toggleOrderDetails = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const statusMap = {
    'awaiting_payment_verification': { label: 'Verification', step: 1 },
    'processing': { label: 'Processing', step: 2 },
    'shipped': { label: 'Shipped', step: 3 },
    'delivered': { label: 'Delivered', step: 4 },
    'cancelled': { label: 'Cancelled', step: 0 }
  };

  return (
    <div className="orders-page">
      <div className="orders-container">
        <header className="page-header">
          <h1>My Orders</h1>
          <p>Track and manage your recent purchases</p>
        </header>

        {(safeOrders.length === 0) ? (
          <div className="no-orders text-center" style={{ padding: '4rem 0' }}>
            <FiShoppingBag size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>You haven't placed any orders yet</p>
            <Link to="/products" className="shop-link" style={{ background: '#4f46e5', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {currentOrders.map(order => {
                if (!order) return null;
                const currentStatus = statusMap[order.status] || { label: order.status || 'Pending', step: 0 };
                const isExpanded = expandedOrders.has(order._id);

                return (
                  <div key={order._id} className={`order-card ${isExpanded ? 'expanded' : ''}`}>
                    <div className="order-main-info" onClick={() => toggleOrderDetails(order._id)}>
                      <div className="order-meta">
                        <span className="order-number">
                          Order #{(() => {
                            const d = new Date(order.createdAt);
                            if (isNaN(d.getTime())) return 'N/A';
                            const year = d.getFullYear();
                            const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
                            const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
                            return `${year}-${mmdd}-${hhmm}`;
                          })()}
                        </span>
                        <span className="order-date">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown Date'}
                        </span>
                      </div>

                      <div className="order-summary-content">
                        <div className="mini-product-images">
                          {(order.items || []).slice(0, 3).map((item, idx) => (
                            <img key={idx} src={item?.product?.images?.[0] || '/placeholder.jpg'} alt="" title={item?.product?.name || 'Product'} />
                          ))}
                          {(order.items?.length || 0) > 3 && <span className="more-count">+{(order.items?.length || 0) - 3}</span>}
                        </div>
                        <div className="order-price-status">
                          <span className="price">₱{(order.total || 0).toFixed(2)}</span>
                          <span className={`status-badge ${order.status || 'pending'}`}>{currentStatus.label}</span>
                        </div>
                      </div>
                      <button type="button" className="expand-trigger">{isExpanded ? 'Hide Details' : 'View Details'}</button>
                    </div>

                    {isExpanded && (
                      <div className="order-details-expanded">
                        {/* Progress Tracker */}
                        {(order.status !== 'cancelled') ? (
                          <div className="status-tracker">
                            {[
                              { id: 1, label: 'Payment' },
                              { id: 2, label: 'Processing' },
                              { id: 3, label: 'Shipped' },
                              { id: 4, label: 'Delivered' }
                            ].map((step) => (
                              <div key={step.id} className={`tracker-step ${currentStatus.step >= step.id ? 'active' : ''}`}>
                                <div className="step-circle">{currentStatus.step >= step.id ? '✓' : step.id}</div>
                                <span>{step.label}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="cancelled-notice" style={{ color: '#ef4444', textAlign: 'center', padding: '1rem', background: '#fef2f2', borderRadius: '8px' }}>This order has been cancelled.</div>
                        )}

                        <div className="details-grid">
                          <div className="details-section">
                            <h4>Shipping Address</h4>
                            <p><strong>{order.shippingAddress?.fullName || order.contactDetails?.fullName || 'N/A'}</strong></p>
                            <p>{order.shippingAddress?.street || 'No street provided'}</p>
                            <p>{order.shippingAddress?.barangay || ''}, {order.shippingAddress?.city || ''}</p>
                            <p>{order.shippingAddress?.region || ''} {order.shippingAddress?.zipCode || ''}</p>
                            <p>Phone: {order.contactDetails?.phone || 'N/A'}</p>
                          </div>

                          <div className="details-section">
                            <h4>Order Items</h4>
                            <div className="expanded-items-list">
                              {(order.items || []).map(item => (
                                <div key={item?._id || Math.random()} className="expanded-item">
                                  <img src={item?.product?.images?.[0] || '/placeholder.jpg'} alt="" />
                                  <div className="item-txt">
                                    <p className="name">{item?.product?.name || 'Product Details Unavailable'}</p>
                                    <p className="qty">Qty: {item?.quantity || 0} × ₱{(item?.price || 0).toFixed(2)}</p>
                                  </div>
                                  <span className="total">₱{((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}</span>
                                  {(order.status === 'delivered' && item?.product?._id) && (
                                    <button
                                      type="button"
                                      className={`rev-btn ${userReviews.has(item.product._id) ? 'done' : ''}`}
                                      disabled={userReviews.has(item.product._id)}
                                      onClick={() => handleWriteReview(item.product._id)}
                                    >
                                      {userReviews.has(item.product._id) ? 'Reviewed' : 'Review'}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="order-footer-details">
                          <div className="cost-breakdown">
                            <div className="row"><span>Subtotal</span><span>₱{(order.subtotal || 0).toFixed(2)}</span></div>
                            <div className="row"><span>Shipping</span><span>₱{(order.shippingCost || 0).toFixed(2)}</span></div>
                            <div className="row grand-total"><span>Total</span><span>₱{(order.total || 0).toFixed(2)}</span></div>
                          </div>
                          <button type="button" className="buy-again-btn" onClick={() => navigate('/products')}>Buy More Products</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="page-nav-btn"
                >
                  Previous
                </button>
                <div className="page-numbers">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => paginate(i + 1)}
                      className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="page-nav-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
