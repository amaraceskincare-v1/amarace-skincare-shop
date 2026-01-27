import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiStar, FiTruck, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const reviewsSectionRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/product/${id}`);
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    if (id) fetchReviews();
  }, [id]);

  useEffect(() => {
    if (location.state?.scrollToReview && reviewsSectionRef.current && !loading) {
      setTimeout(() => {
        reviewsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [location.state, loading]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, quantity, product);
      toast.success('Added to cart!');
      // Open cart drawer
      if (window.openCartDrawer) {
        window.openCartDrawer();
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.rating || !newReview.comment.trim()) {
      toast.error('Please provide rating and comment');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/reviews', { productId: id, ...newReview });
      toast.success('Review submitted!');
      const { data: updatedReviews } = await api.get(`/reviews/product/${id}`);
      setReviews(updatedReviews);
      setNewReview({ rating: 0, comment: '' });
      const { data: updatedProduct } = await api.get(`/products/${id}`);
      setProduct(updatedProduct);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (!product) return null;

  const hasReviewed = user && reviews.some(r => r.user?._id === user._id);

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="product-detail">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={product.images?.[selectedImage] || '/placeholder.jpg'} alt={product.name} />
          </div>
          {product.images?.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumb-btn ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <span className="product-category">{product.category}</span>
          <h1 className="product-title">{product.name}</h1>

          <div className="product-rating">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} fill={i < Math.round(product.ratings || 0) ? '#1a1a1a' : 'none'} />
            ))}
            <span>({product.numReviews} reviews)</span>
          </div>

          <div className="product-price">
            <span className="current-price">₱{product.price?.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="original-price">₱{product.originalPrice?.toFixed(2)}</span>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          {/* Quantity & Add to Cart */}
          <div className="purchase-section">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><FiMinus /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}><FiPlus /></button>
            </div>
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to cart'}
            </button>
          </div>



          {/* Shipping Info */}
          <div className="shipping-info">
            <div className="info-item">
              <FiTruck />
              <div>
                <strong>Estimated Delivery:</strong>
                <span>3-7 Business Days</span>
              </div>
            </div>
            <div className="info-item">
              <FiRefreshCw />
              <div>
                <strong>Free Shipping & Returns:</strong>
                <span>On all orders over ₱500</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="trust-badges">
            <span>💳</span>
            <span>🏦</span>
            <span>📱</span>
            <span>✓ Secure Checkout</span>
          </div>

          {product.brand && (
            <p className="product-brand"><strong>Brand:</strong> {product.brand}</p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section" ref={reviewsSectionRef}>
        <h2>Customer Reviews</h2>

        {user && !hasReviewed && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3>Write a Review</h3>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview(p => ({ ...p, rating: star }))}
                >
                  <FiStar fill={star <= newReview.rating ? '#1a1a1a' : 'none'} />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Share your experience..."
              value={newReview.comment}
              onChange={(e) => setNewReview(p => ({ ...p, comment: e.target.value }))}
              required
            />
            <button type="submit" className="submit-review-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {hasReviewed && (
          <div className="already-reviewed">You have already reviewed this product.</div>
        )}

        {!user && (
          <div className="login-prompt">
            <Link to="/login">Log in</Link> to write a review.
          </div>
        )}

        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <strong>{review.user?.name || 'Anonymous'}</strong>
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={12} fill={i < review.rating ? '#1a1a1a' : 'none'} />
                    ))}
                  </div>
                </div>
                <p>{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;