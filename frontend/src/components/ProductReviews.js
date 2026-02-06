import React, { useState, useEffect } from 'react';
import {
    FiStar, FiEdit3, FiCamera, FiCheckCircle,
    FiThumbsUp, FiThumbsDown, FiFlag, FiX, FiPlus,
    FiChevronDown, FiChevronUp, FiLoader
} from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../utils/api';
import '../styles/ProductReviews.css';

const ProductReviews = ({ productId, user }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        rating: 0,
        count: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

    // Form State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [reviewPhotos, setReviewPhotos] = useState([]);
    const [recommend, setRecommend] = useState('yes');
    const [verifiedPurchase, setVerifiedPurchase] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/reviews/product/${productId}`);
            setReviews(data.reviews || []);
            setStats(data.stats || {
                rating: 0,
                count: 0,
                breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            });
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        if (reviewPhotos.length + files.length > 5) {
            toast.warning('Maximum 5 photos allowed');
            return;
        }

        const newPhotos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setReviewPhotos([...reviewPhotos, ...newPhotos]);
    };

    const removePhoto = (index) => {
        const updatedPhotos = [...reviewPhotos];
        URL.revokeObjectURL(updatedPhotos[index].preview);
        updatedPhotos.splice(index, 1);
        setReviewPhotos(updatedPhotos);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!rating) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            // Note: In a real app we'd upload images to Cloudinary here
            // For now, we'll send the data as is or simulate the upload
            const reviewData = {
                productId,
                rating,
                title: reviewTitle,
                comment: reviewText,
                recommend,
                verified: verifiedPurchase,
                // photos: await uploadImages(reviewPhotos) 
            };

            await api.post('/reviews', reviewData);
            toast.success('Thank you for your review!');
            setShowReviewForm(false);
            resetForm();
            fetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setRating(0);
        setReviewTitle('');
        setReviewText('');
        setReviewPhotos([]);
        setRecommend('yes');
    };

    const toggleHelpful = async (reviewId) => {
        if (!user) {
            toast.info('Please log in to vote');
            return;
        }
        try {
            const { data } = await api.patch(`/reviews/${reviewId}/helpful`);
            setReviews(prev => prev.map(r =>
                r._id === reviewId ? { ...r, helpfulCount: data.helpfulCount, userHelpful: data.hasVoted } : r
            ));
        } catch (error) {
            console.error('Error toggling helpful:', error);
        }
    };

    const getRatingDescription = (r) => {
        const desc = {
            1: 'Poor - Needs improvement',
            2: 'Fair - Below expectations',
            3: 'Good - Meets expectations',
            4: 'Very Good - Exceeds expectations',
            5: 'Excellent - Outstanding!'
        };
        return desc[r] || 'Select your rating';
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    const renderStars = (val, size = 18) => {
        return [...Array(5)].map((_, i) => {
            const starValue = i + 1;
            if (val >= starValue) return <FaStar key={i} size={size} />;
            if (val >= starValue - 0.5) return <FaStarHalfAlt key={i} size={size} />;
            return <FaRegStar key={i} size={size} />;
        });
    };

    // Filter and Sort logic
    const filteredReviews = reviews
        .filter(r => {
            if (filter === 'verified') return r.verified;
            if (filter === 'with-photos') return r.photos && r.photos.length > 0;
            if (filter === '5-star') return r.rating === 5;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'highest') return b.rating - a.rating;
            if (sortBy === 'lowest') return a.rating - b.rating;
            if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    if (loading && reviews.length === 0) return <div className="loading-reviews"><FiLoader className="spin" /> Loading reviews...</div>;

    return (
        <section className="customer-reviews-section">
            <div className="reviews-container">

                {/* SECTION 1: HEADER & STATS */}
                <div className="reviews-header">
                    <div className="reviews-title-section">
                        <h2 className="reviews-title">Customer Reviews</h2>
                        <p className="reviews-subtitle">What our community thinks about this product</p>
                    </div>

                    <div className="overall-rating-badge">
                        <div className="rating-number">{stats.rating || '0.0'}</div>
                        <div className="rating-stars">
                            {renderStars(parseFloat(stats.rating), 22)}
                        </div>
                        <div className="rating-count">Based on {stats.count} reviews</div>
                    </div>
                </div>

                <div className="rating-breakdown">
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = stats.breakdown[star] || 0;
                        const percentage = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0;
                        return (
                            <div key={star} className="rating-bar-item">
                                <span className="rating-label">{star} stars</span>
                                <div className="rating-bar-container">
                                    <motion.div
                                        className="rating-bar"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    ></motion.div>
                                </div>
                                <span className="rating-percentage">{percentage}%</span>
                                <span className="rating-count-num">({count})</span>
                            </div>
                        );
                    })}
                </div>

                {/* SECTION 2: CONTROLS */}
                <div className="reviews-controls">
                    <div className="filter-chips">
                        <button
                            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Reviews
                        </button>
                        <button
                            className={`filter-chip ${filter === 'verified' ? 'active' : ''}`}
                            onClick={() => setFilter('verified')}
                        >
                            <FiCheckCircle /> Verified
                        </button>
                        <button
                            className={`filter-chip ${filter === 'with-photos' ? 'active' : ''}`}
                            onClick={() => setFilter('with-photos')}
                        >
                            <FiCamera /> With Photos
                        </button>
                    </div>

                    <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>

                {/* SECTION 3: WRITE A REVIEW */}
                <div className="write-review-section">
                    <button
                        className="write-review-toggle"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                    >
                        {showReviewForm ? <FiX size={20} /> : <FiEdit3 size={20} />}
                        {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                    </button>

                    <AnimatePresence>
                        {showReviewForm && (
                            <motion.div
                                className="review-form-card"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                            >
                                <h3>Share Your Experience</h3>
                                <p className="form-subtitle">Your feedback helps others make informed decisions</p>

                                <form onSubmit={handleSubmitReview}>
                                    <div className="form-group">
                                        <label className="form-label">Overall Rating <span className="required">*</span></label>
                                        <div className="star-rating-input">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    className={`star-btn ${(hoverRating || rating) >= s ? 'active' : ''}`}
                                                    onClick={() => setRating(s)}
                                                    onMouseEnter={() => setHoverRating(s)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                >
                                                    <FaStar size={32} />
                                                </button>
                                            ))}
                                        </div>
                                        <small className="rating-description">{getRatingDescription(rating)}</small>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Review Title <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Sum up your experience..."
                                            value={reviewTitle}
                                            onChange={(e) => setReviewTitle(e.target.value)}
                                            maxLength={100}
                                            required
                                        />
                                        <small className="char-count">{reviewTitle.length}/100</small>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Your Review <span className="required">*</span></label>
                                        <textarea
                                            className="form-textarea"
                                            rows="5"
                                            placeholder="What did you like or dislike? How was the quality?"
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            maxLength={1000}
                                            required
                                        />
                                        <small className="char-count">{reviewText.length}/1000</small>
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={verifiedPurchase}
                                                onChange={(e) => setVerifiedPurchase(e.target.checked)}
                                            />
                                            <span style={{ marginLeft: '10px', fontSize: '14px', cursor: 'pointer' }}>
                                                I purchased this product from AmaraCé Skin Care
                                            </span>
                                        </label>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Would you recommend this product?</label>
                                        <div className="recommend-options">
                                            <label className={`recommend-radio ${recommend === 'yes' ? 'active' : ''}`} onClick={() => setRecommend('yes')}>
                                                <span className="recommend-text">
                                                    <FiThumbsUp /> Yes, I recommend
                                                </span>
                                            </label>
                                            <label className={`recommend-radio ${recommend === 'no' ? 'active' : ''}`} onClick={() => setRecommend('no')}>
                                                <span className="recommend-text">
                                                    <FiThumbsDown /> No, I don't
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Add Photos <span className="optional-badge">(Optional)</span></label>
                                        <div className="photo-upload-container">
                                            {reviewPhotos.map((photo, idx) => (
                                                <div key={idx} className="photo-preview">
                                                    <img src={photo.preview} alt="preview" />
                                                    <button type="button" className="remove-photo" onClick={() => removePhoto(idx)}><FiX /></button>
                                                </div>
                                            ))}
                                            {reviewPhotos.length < 5 && (
                                                <label className="photo-upload-btn">
                                                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} hidden />
                                                    <FiCamera size={24} />
                                                    <span>Add Photo</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn-cancel" onClick={() => setShowReviewForm(false)}>Cancel</button>
                                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                            {isSubmitting ? <FiLoader className="spin" /> : 'Submit Review'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* SECTION 4: REVIEW LIST */}
                <div className="reviews-list">
                    {filteredReviews.length > 0 ? (
                        filteredReviews.map((review) => (
                            <div key={review._id} className="review-card">
                                <div className="review-header-v2">
                                    <div className="reviewer-info">
                                        <div className="reviewer-avatar">
                                            {review.user?.name?.charAt(0) || 'A'}
                                        </div>
                                        <div className="reviewer-details">
                                            <h4 className="reviewer-name">
                                                {review.user?.name || 'Verified Customer'}
                                                {review.verified && (
                                                    <span className="verified-badge"><FiCheckCircle size={16} /></span>
                                                )}
                                            </h4>
                                            <div className="review-meta">
                                                <div className="review-stars-v2">
                                                    {renderStars(review.rating, 14)}
                                                </div>
                                                <span className="review-date">{formatDate(review.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {review.recommend === 'yes' && (
                                        <div className="recommended-badge"><FiThumbsUp /> Recommends</div>
                                    )}
                                </div>

                                <div className="review-body">
                                    {review.title && <h5 className="review-title-v2">{review.title}</h5>}
                                    <p className="review-text-v2">{review.comment}</p>

                                    {review.photos && review.photos.length > 0 && (
                                        <div className="review-photos-grid">
                                            {review.photos.map((photo, i) => (
                                                <div key={i} className="review-photo-item">
                                                    <img src={photo} alt="review" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="review-footer-v2">
                                    <div className="review-actions">
                                        <button
                                            className={`action-btn ${review.userHelpful ? 'active' : ''}`}
                                            onClick={() => toggleHelpful(review._id)}
                                        >
                                            <FiThumbsUp /> Helpful ({review.helpfulCount || 0})
                                        </button>
                                        <button className="action-btn"><FiFlag /> Report</button>
                                    </div>

                                    {review.store_response?.text && (
                                        <div className="store-response">
                                            <div className="response-header">
                                                <strong>Response from AmaraCé Skin Care</strong>
                                                <span className="response-date">{formatDate(review.store_response.date)}</span>
                                            </div>
                                            <p className="response-text">{review.store_response.text}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-reviews-v2">
                            <p>No reviews matching your filters. Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductReviews;
