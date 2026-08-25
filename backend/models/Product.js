const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  category: { type: String, required: true },
  brand: { type: String, default: 'AmaraCé' },
  stock: { type: Number, required: true, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10, min: 0 },
  images: [{ type: String }],
  sku: { type: String, trim: true, default: '' },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  ingredients: { type: String, default: '' },
  howToUse: { type: String, default: '' }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text', sku: 'text' });
productSchema.index({ category: 1, published: 1 });
productSchema.index({ stock: 1, published: 1 });
productSchema.index({ sku: 1 });

module.exports = mongoose.model('Product', productSchema);