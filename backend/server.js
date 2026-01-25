const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const Newsletter = require('./models/Newsletter');
const Product = require('./models/Product');
const sendEmail = require('./utils/sendEmail');
const { weeklyNewsletter } = require('./utils/newsletterEmailTemplate');
require('dotenv').config(); // ✅ must be first

const app = express();

// 🔎 TEMP DEBUG — ADD THIS LINE
console.log('ENV CHECK MONGO_URI:', process.env.MONGO_URI);
console.log('ENV CHECK CLOUDINARY:', !!process.env.CLOUDINARY_CLOUD_NAME);

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: err.message || 'Server Error' });
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Schedule: Every Monday at 9:00 AM
cron.schedule('0 9 * * 1', async () => {
  console.log('Running Weekly Newsletter Job...');
  try {
    const subscribers = await Newsletter.find({ isSubscribed: true });
    if (subscribers.length === 0) return;

    // Fetch latest 3 products
    const products = await Product.find().sort({ createdAt: -1 }).limit(3);

    const emailPromises = subscribers.map(sub =>
      sendEmail({
        to: sub.email,
        subject: 'Weekly Highlights from AmaraCé Skin Care 🌟',
        html: weeklyNewsletter(products)
      })
    );

    await Promise.all(emailPromises);
    console.log(`Weekly Newsletter sent to ${subscribers.length} subscribers.`);
  } catch (error) {
    console.error('Newsletter Job Failed:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
