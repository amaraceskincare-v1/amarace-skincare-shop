const express = require('express'); // ✅ REQUIRED (THIS WAS MISSING)

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const sendEmail = require('../utils/sendEmail');
const sendTelegram = require('../utils/sendTelegram');
const orderEmailTemplate = require('../utils/orderEmailTemplate');

const router = express.Router();

// Helper to format Order ID (YEAR-MMDD-HHMM)
const formatOrderId = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  return `${year}-${mmdd}-${hhmm}`;
};


// Cloudinary storage for payment proofs
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'payment-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

// Create order (Card payment - STRIPE REMOVED)
// router.post('/', protect, async (req, res) => {
//     // DEPRECATED - Stripe Removed
//     res.status(400).json({ message: 'Card payments are no longer supported' });
// });

// Create order with GCash payment
router.post('/gcash', protect, upload.single('paymentProof'), async (req, res) => {
  try {
    const { shippingAddress, contactDetails } = req.body;
    const parsedAddress = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;
    const parsedContact = typeof contactDetails === 'string' ? JSON.parse(contactDetails) : contactDetails;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Payment proof is required' });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    // Shipping cost is now passed from frontend based on location
    // Logic: Free shipping if subtotal >= 500
    let shippingCost = Number(req.body.shippingCost) || 0;
    if (subtotal >= 500) {
      shippingCost = 0;
    }
    const total = subtotal + shippingCost;

    const order = await Order.create({
      user: req.user._id,
      items,
      contactDetails: parsedContact,
      shippingAddress: parsedAddress,
      paymentMethod: 'gcash',
      paymentProof: req.file.path,
      subtotal,
      shippingCost,
      total,
      tax: 0, // No tax
      status: 'awaiting_payment_verification'
    });

    // ✅ SEND EMAIL — GCash order received
    // Background Process: Do not await to speed up checkout response
    // Fetch populated order to ensure product details are available for email
    Order.findById(order._id).populate('items.product').then(populatedOrder => {
      sendEmail({
        to: parsedContact.email,
        subject: 'AmaraCé Order Received (GCash)',
        html: orderEmailTemplate(populatedOrder, 'GCash Order Received'),
      }).catch(err => console.error('Email sending failed:', err));
    });

    // List items for Telegram
    const itemList = cart.items.map(item => `• ${item.product.name} (x${item.quantity})`).join('\n');

    // ✅ SEND TELEGRAM
    const telegramMsg = `<b>New GCash Order!</b> 🛍️\n\nOrder ID: <code>${formatOrderId(order.createdAt)}</code>\nTotal: <b>₱${total.toFixed(2)}</b>\nCustomer: ${parsedContact.fullName}\n\n<b>Items:</b>\n${itemList}\n\nPlease verify payment proof.`;
    sendTelegram(telegramMsg);

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product user');
    if (order && (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin')) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (Admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete order (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (Admin)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (order) {
      order.status = req.body.status;
      if (req.body.status === 'delivered') {
        order.deliveredAt = Date.now();
      }
      const updatedOrder = await order.save();

      // Construct item list for Telegram
      const itemList = order.items.map(item => `• ${item.product?.name || 'Product'} (x${item.quantity})`).join('\n');

      // ✅ SEND TELEGRAM notification for status change
      const statusEmoji = {
        'processing': '⏳',
        'shipped': '🚚',
        'delivered': '✅',
        'cancelled': '❌'
      };
      const emoji = statusEmoji[req.body.status] || '📦';

      const telegramMsg = `<b>Order Status Update</b> ${emoji}\n\n` +
        `Order ID: ${formatOrderId(order.createdAt)}\n` +
        `Total: ₱${order.total.toFixed(2)}\n` +
        `Customer: ${order.contactDetails?.fullName || 'Admin User'}\n\n` +
        `<b>Items:</b>\n${itemList}\n\n` +
        `New Status: <b>${req.body.status.toUpperCase()}</b>`;

      sendTelegram(telegramMsg);

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify GCash payment (Admin)
router.put('/:id/verify-payment', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (order && order.paymentMethod === 'gcash') {
      order.status = 'processing';
      order.paymentResult = {
        id: 'gcash_verified',
        status: 'verified',
        email: order.contactDetails.email
      };
      const updatedOrder = await order.save();
      // ✅ SEND EMAIL — GCash verified
      await sendEmail({
        to: order.contactDetails.email,
        subject: 'AmaraCé Payment Verified',
        html: orderEmailTemplate(order, 'GCash Payment Verified'),
      });

      // Construct item list for Telegram
      const itemList = order.items.map(item => `• ${item.product?.name || 'Product'} (x${item.quantity})`).join('\n');

      // ✅ SEND TELEGRAM notification that verification is done
      const telegramMsg = `<b>Order Status Update</b> ⏳\n\n` +
        `Order ID: ${formatOrderId(order.createdAt)}\n` +
        `Total: ₱${order.total.toFixed(2)}\n` +
        `Customer: ${order.contactDetails?.fullName || 'Admin User'}\n\n` +
        `<b>Items:</b>\n${itemList}\n\n` +
        `New Status: <b>PROCESSING</b>`;

      sendTelegram(telegramMsg);

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found or not a GCash order' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;