const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Create a review (customers only after delivery)
router.post('/', protect, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            user: req.user._id,
            product: productId
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // IMPORTANT: Check if user has ordered and received this product
        const deliveredOrder = await Order.findOne({
            user: req.user._id,
            'items.product': productId,
            status: 'delivered'
        });

        if (!deliveredOrder) {
            return res.status(403).json({
                message: 'You can only review products that have been delivered to you'
            });
        }

        // Determine review status based on rating
        // Reviews with 3 stars or below need admin approval
        const status = rating <= 3 ? 'pending' : 'approved';

        // Create the review
        const review = await Review.create({
            user: req.user._id,
            product: productId,
            rating,
            comment,
            status
        });

        // Only update product ratings if the review is auto-approved
        if (status === 'approved') {
            await updateProductRatings(productId);
        }

        const populatedReview = await Review.findById(review._id).populate('user', 'name');

        const responseMessage = status === 'pending'
            ? 'Review submitted and pending admin approval'
            : 'Review posted successfully';

        res.status(201).json({
            message: responseMessage,
            review: populatedReview
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'You have already reviewed this product' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
});

// Get reviews for a product (only approved reviews for public)
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({
            product: req.params.productId,
            status: 'approved' // Only show approved reviews
        })
            .populate('user', 'name')
            .sort('-createdAt');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all reviews (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name email')
            .populate('product', 'name image')
            .sort('-createdAt');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get pending reviews (Admin only)
router.get('/pending', protect, admin, async (req, res) => {
    try {
        const pendingReviews = await Review.find({ status: 'pending' })
            .populate('user', 'name email')
            .populate('product', 'name image')
            .sort('-createdAt');
        res.json(pendingReviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Approve a review (Admin only)
router.patch('/:id/approve', protect, admin, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.status !== 'pending') {
            return res.status(400).json({ message: 'Review is not pending approval' });
        }

        review.status = 'approved';
        await review.save();

        // Update product ratings now that review is approved
        await updateProductRatings(review.product);

        const updatedReview = await Review.findById(review._id)
            .populate('user', 'name')
            .populate('product', 'name');

        res.json({
            message: 'Review approved successfully',
            review: updatedReview
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reject a review (Admin only)
router.patch('/:id/reject', protect, admin, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.status !== 'pending') {
            return res.status(400).json({ message: 'Review is not pending approval' });
        }

        review.status = 'rejected';
        await review.save();

        res.json({
            message: 'Review rejected',
            review
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update review status generic (Admin only)
router.patch('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        review.status = status;
        await review.save();

        if (status === 'approved') {
            await updateProductRatings(review.product);
        }

        const updatedReview = await Review.findById(review._id)
            .populate('user', 'name')
            .populate('product', 'name image');

        res.json({ message: `Review marked as ${status}`, review: updatedReview });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a review (only if approved or pending)
router.put('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        const oldRating = review.rating;
        const newRating = req.body.rating || review.rating;

        review.rating = newRating;
        review.comment = req.body.comment || review.comment;

        // If rating changes and new rating is 3 or below, set to pending
        if (oldRating !== newRating && newRating <= 3) {
            review.status = 'pending';
        }

        await review.save();

        // Update product ratings only if review is approved
        if (review.status === 'approved') {
            await updateProductRatings(review.product);
        }

        const updatedReview = await Review.findById(review._id).populate('user', 'name');

        const message = review.status === 'pending'
            ? 'Review updated and pending admin approval'
            : 'Review updated successfully';

        res.json({
            message,
            review: updatedReview
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a review
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const productId = review.product;
        const wasApproved = review.status === 'approved';

        await review.deleteOne();

        // Only update product ratings if the deleted review was approved
        if (wasApproved) {
            await updateProductRatings(productId);
        }

        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper function to update product ratings (only counts approved reviews)
async function updateProductRatings(productId) {
    const approvedReviews = await Review.find({
        product: productId,
        status: 'approved'
    });

    const numReviews = approvedReviews.length;
    const avgRating = numReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
        : 0;

    await Product.findByIdAndUpdate(productId, {
        ratings: avgRating,
        numReviews
    });
}

module.exports = router;