const express = require('express'); // ✅ REQUIRED (THIS WAS MISSING)

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const Tesseract = require('tesseract.js');
const sendEmail = require('../utils/sendEmail');
const sendTelegram = require('../utils/sendTelegram');
const orderEmailTemplate = require('../utils/orderEmailTemplate');

// Helper to extract GCash data from image
const extractGCashData = async (imagePath) => {
  try {
    // Tesseract can handle URLs directly
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    console.log('OCR Raw Text:', text);

    const data = {
      name: 'N/A',
      number: 'N/A',
      amountSent: '0.00',
      referenceNo: 'N/A',
      dateSent: new Date().toLocaleString()
    };

    // Regex for Amount
    const amountMatch = text.match(/(?:Amount|₱|Total|PHP)\s*[:=]?\s*([\d,]+\.?\d*)/i);
    if (amountMatch) data.amountSent = amountMatch[1].replace(/,/g, '');

    // Regex for Reference Number (GCash usually has 12 or 13 digits)
    const refMatch = text.match(/(?:Ref(?:\.?)\s*No(?:\.?)|Reference(?:\.?)\s*No(?:\.?))\s*[:=]?\s*(\d{4}\s*\d{3}\s*\d{6}|\d{12,13})/i);
    if (refMatch) data.referenceNo = refMatch[1].replace(/\s/g, '');

    // Regex for Date/Time
    const dateMatch = text.match(/(?:Date|Time|Sent\s*at)\s*[:=]?\s*([A-Za-z]{3}\s\d{1,2},?\s\d{4},?\s\d{1,2}:\d{2}\s?[AP]M)/i);
    if (dateMatch) data.dateSent = dateMatch[1];

    // Regex for Phone
    const phoneMatch = text.match(/(?:09|\+639)\d{9}/);
    if (phoneMatch) data.number = phoneMatch[0];

    return data;
  } catch (error) {
    console.error('OCR Error:', error);
    return null;
  }
};

const router = express.Router();

const formatOrderId = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  return `${year}-${mmdd}-${hhmm}`;
};

// --- TEMP DEBUG ROUTE ---
router.get('/test-telegram', async (req, res) => {
  try {
    const telegramMsg = `<b>AmaraCé Test Debug</b> 🛠️\n\nTesting live server Telegram connection.`;
    const imageUrl = "https://res.cloudinary.com/amarace/image/upload/v1727833096/products/amara_fierce.png"; // Live product image

    // Call the same logic
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.json({ success: false, error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID on this server environments' });
    }

    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: telegramMsg,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    res.json({ success: response.ok, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// Cloudinary storage for payment proofs
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'payment-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Create order (Card payment - STRIPE REMOVED)
// router.post('/', protect, async (req, res) => {
//     // DEPRECATED - Stripe Removed
//     res.status(400).json({ message: 'Card payments are no longer supported' });
// });

// Create order with COD payment
router.post('/cod', protect, async (req, res) => {
  try {
    const { shippingAddress, contactDetails, shippingCost, shippingMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    let finalShippingCost = Number(shippingCost) || 0;
    if (subtotal >= 500) {
      finalShippingCost = 0;
    }
    const total = subtotal + finalShippingCost;

    const order = await Order.create({
      user: req.user._id,
      items,
      contactDetails,
      shippingAddress,
      paymentMethod: 'cod',
      shippingMethod,
      subtotal,
      shippingCost: finalShippingCost,
      total,
      tax: 0,
      status: 'processing' // COD starts at processing since no verification needed
    });

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

    // --- BACKGROUND PROCESSES ---

    Order.findById(order._id).populate('items.product').then(populatedOrder => {
      // 1. Email Notification
      sendEmail({
        to: contactDetails.email,
        subject: 'AmaraCé Order Received (COD)',
        html: orderEmailTemplate(populatedOrder, 'COD Order Received'),
      }).catch(err => console.error('Email sending failed:', err));

      // 2. Telegram Notification
      const fullItemList = populatedOrder.items.map(i => `• ${i.product.name} (x${i.quantity})`).join('\n');
      const firstItemImage = populatedOrder.items.length > 0 && populatedOrder.items[0].product.images ? populatedOrder.items[0].product.images[0] : null;

      const telegramMsg = `<b>New COD Order!</b> 🚚\n\nOrder ID: <code>${formatOrderId(order.createdAt)}</code>\nTotal: <b>₱${total.toFixed(2)}</b>\nCustomer: ${contactDetails.fullName}\n\n<b>Items:</b>\n${fullItemList}\n\nPayment will be collected on delivery.`;
      sendTelegram(telegramMsg, firstItemImage);
    }).catch(err => console.error('Background fetch failed:', err));

  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Create order with GCash payment
router.post('/gcash', protect, upload.single('paymentProof'), async (req, res) => {
  try {
    const { shippingAddress, contactDetails, shippingMethod } = req.body;
    const parsedAddress = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;
    const parsedContact = typeof contactDetails === 'string' ? JSON.parse(contactDetails) : contactDetails;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Payment proof is required' });
    }

    // Setup items
    const items = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
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
      shippingMethod,
      paymentProof: req.file.path,
      paymentData: null, // Will extract in background to speed up checkout
      subtotal,
      shippingCost,
      total,
      tax: 0,
      status: 'awaiting_payment_verification'
    });

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

    // --- BACKGROUND PROCESSES ---

    // 1. OCR Extraction (Takes a long time, done in the background)
    (async () => {
      try {
        console.log('Background: Extracting GCash data from:', req.file.path);
        const extractedData = await extractGCashData(req.file.path);
        console.log('Background: Extracted Data:', extractedData);
        await Order.findByIdAndUpdate(order._id, { paymentData: extractedData });
      } catch (err) {
        console.error('OCR Error in background:', err.message);
      }
    })();

    // 2. Email Notification
    Order.findById(order._id).populate('items.product').then(populatedOrder => {
      sendEmail({
        to: parsedContact.email,
        subject: 'AmaraCé Order Received (GCash)',
        html: orderEmailTemplate(populatedOrder, 'GCash Order Received'),
      }).catch(err => console.error('Email sending failed:', err));
    });

    // 3. Telegram Notification
    const itemList = items.map(item => `• Product (x${item.quantity})`).join('\n'); // Quick formatting
    Order.findById(order._id).populate('items.product').then(populatedOrder => {
      const fullItemList = populatedOrder.items.map(i => `• ${i.product.name} (x${i.quantity})`).join('\n');
      const firstItemImage = populatedOrder.items.length > 0 && populatedOrder.items[0].product.images ? populatedOrder.items[0].product.images[0] : null;

      const telegramMsg = `<b>New GCash Order!</b> 🛍️\n\nOrder ID: <code>${formatOrderId(order.createdAt)}</code>\nTotal: <b>₱${total.toFixed(2)}</b>\nCustomer: ${parsedContact.fullName}\n\n<b>Items:</b>\n${fullItemList}\n\nPlease verify payment proof.`;
      sendTelegram(telegramMsg, firstItemImage);
    });

  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
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

      const firstItemImage = order.items.length > 0 && order.items[0].product?.images ? order.items[0].product.images[0] : null;
      sendTelegram(telegramMsg, firstItemImage);

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

      const firstItemImage = order.items.length > 0 && order.items[0].product?.images ? order.items[0].product.images[0] : null;
      sendTelegram(telegramMsg, firstItemImage);

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found or not a GCash order' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update tracking number (Admin)
router.put('/:id/tracking', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.trackingNumber = req.body.trackingNumber;
      if (req.body.status) order.status = req.body.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload delivery proof (Admin)
router.put('/:id/delivery-proof', protect, admin, upload.single('deliveryProof'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      if (req.file) {
        order.deliveryProof = req.file.path;
      }
      if (req.body.status) order.status = req.body.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove delivery proof (Admin)
router.put('/:id/remove-delivery-proof', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.deliveryProof = undefined;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// --- RIDER SPECIFIC UNPROTECTED ROUTES ---

// Get basic order details for Rider (Unauthenticated, via QR)
router.get('/rider/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Only return non-sensitive info needed for delivery
    res.json({
      _id: order._id,
      contactDetails: order.contactDetails,
      shippingAddress: order.shippingAddress,
      items: order.items.map(item => ({
        name: item.product?.name,
        image: item.product?.images?.[0], // include image for rider
        quantity: item.quantity,
        price: item.price
      })),
      total: order.total,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      status: order.status,
      deliveryProof: order.deliveryProof
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload delivery proof by Rider (Unauthenticated, via QR)
router.put('/rider/:id/delivery-proof', upload.single('deliveryProof'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    order.deliveryProof = req.file.path;
    order.status = 'delivered';
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();

    // Construct item list for Telegram
    const itemList = order.items.map(item => `• ${item.product?.name || 'Product'} (x${item.quantity})`).join('\n');

    // SEND TELEGRAM notification that rider delivered it
    const emoji = '✅';
    const telegramMsg = `<b>Order Delivered (In-House Rider)</b> ${emoji}\n\n` +
      `Order ID: ${formatOrderId(order.createdAt)}\n` +
      `Total: ₱${order.total.toFixed(2)}\n` +
      `Customer: ${order.contactDetails?.fullName || 'Customer'}\n\n` +
      `<b>Items:</b>\n${itemList}\n\n` +
      `Delivery Proof uploaded successfully.`;

    const firstItemImage = order.items.length > 0 && order.items[0].product?.images ? order.items[0].product.images[0] : null;
    sendTelegram(telegramMsg, firstItemImage);

    res.json({ message: 'Delivery Proof Uploaded', deliveryProof: updatedOrder.deliveryProof });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;