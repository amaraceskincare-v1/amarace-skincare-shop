const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  contactDetails: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  shippingAddress: {
    street: String,
    barangay: String,
    city: String,
    landmark: String,
    zipCode: String
  },
  paymentMethod: { type: String, required: true, enum: ['gcash', 'cod'] },
  paymentResult: {
    id: String,
    status: String,
    email: String
  },
  paymentProof: { type: String }, // For GCash payment screenshots
  paymentData: {
    name: String,
    number: String,
    amountSent: Number,
    referenceNo: String,
    dateSent: String
  },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shippingCost: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'awaiting_payment_verification', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveredAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);