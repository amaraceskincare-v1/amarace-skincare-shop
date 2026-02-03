import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiStar, FiTruck, FiRefreshCw, FiHeart } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/ProductDetail.css';

import { flyToCart } from '../utils/animations';

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

  const handleAddToCart = async (e) => {
    const btn = e.currentTarget;
    flyToCart(btn);

    try {
      await addToCart(product._id, quantity, product);
      // Removed toast as per user request
      // Open cart drawer
      if (window.openCartDrawer) {
        setTimeout(() => window.openCartDrawer(), 800); // Small delay to allow fly animation
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
    <div className="product-detail-page-v2">
      <div className="shop-hero-small-v2">
        <div className="breadcrumbs-v3">
          <Link to="/">Home</Link> <span>/</span> <Link to="/products">Shop</Link> <span>/</span> <span className="active">{product.name}</span>
        </div>
      </div>

      <div className="product-layout-v2">
        {/* Left: Sticky Image Gallery */}
        <div className="product-gallery-v2">
          <div className="main-image-container-v2">
            <img
              src={product.images?.[selectedImage] || '/placeholder.jpg'}
              alt={product.name}
              className="main-view-v2"
            />
            <div className="zoom-indicator">Hover to zoom</div>
          </div>
          {product.images?.length > 1 && (
            <div className="thumbnails-grid-v2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumb-item-v2 ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`${product.name} shadow ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Sophisticated Info Section */}
        <div className="product-main-info-v2">
          <div className="info-header-v2">
            <span className="info-category-v2">{product.category}</span>
            <h1 className="info-title-v2">{product.name}</h1>
            <div className="info-meta-v2">
              <div className="info-rating-v2">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} fill={i < Math.round(product.ratings || 0) ? 'var(--brand-primary)' : 'none'} stroke={i < Math.round(product.ratings || 0) ? 'var(--brand-primary)' : '#ccc'} />
                ))}
                <span>({product.numReviews} Reviews)</span>
              </div>
              <div className="info-sku-v2">SKU: AM-{product._id?.slice(-6).toUpperCase()}</div>
            </div>
          </div>

          <div className="info-price-v2">
            <span className="price-current-v2">₱{product.price?.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="price-old-v2">₱{product.originalPrice?.toFixed(2)}</span>
            )}
            {product.originalPrice > product.price && (
              <span className="price-save-v2">SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>
            )}
          </div>

          <div className="info-description-v2">
            <p>{product.description}</p>
          </div>

          <div className="purchase-controls-v2">
            <div className="control-group-v2">
              <label>Quantity</label>
              <div className="quantity-box-v2">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <FiMinus />
                </button>
                <input type="number" value={quantity} readOnly />
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            <div className="actions-stack-v2">
              <button
                className="btn-add-to-cart-v2"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
              <button
                className="btn-buy-now-v2"
                onClick={async () => {
                  try {
                    await addToCart(product._id, quantity, product);
                    navigate('/checkout');
                  } catch (error) {
                    toast.error('Failed to process Buy Now');
                  }
                }}
                disabled={product.stock === 0}
              >
                Buy it Now
              </button>
            </div>
          </div>

          <div className="product-perks-v2">
            <div className="perk-item-v2">
              <FiTruck />
              <div className="perk-text-v2">
                <strong>Fast & Safe Shipping</strong>
                <span>3-5 working days within Metro Manila</span>
              </div>
            </div>
            <div className="perk-item-v2">
              <FiRefreshCw />
              <div className="perk-text-v2">
                <strong>Easy Returns</strong>
                <span>Hassle-free 7-day return policy</span>
              </div>
            </div>
            <div className="perk-item-v2">
              <FiHeart />
              <div className="perk-text-v2">
                <strong>AmaraCé Promise</strong>
                <span>100% Authentic & Dermatologist Tested</span>
              </div>
            </div>
          </div>

          {/* Collapsible Tabs Placeholder */}
          <div className="info-tabs-v2">
            <div className="tab-v2">
              <div className="tab-header-v2">Ingredients</div>
              <div className="tab-body-v2">Aloe Vera, Vitamin E, Hyaluronic Acid, Rosehip Oil.</div>
            </div>
            <div className="tab-v2">
              <div className="tab-header-v2">How to Use</div>
              <div className="tab-body-v2">Apply twice daily on clean, dry skin. Massage gently until absorbed.</div>
            </div>
          </div>
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