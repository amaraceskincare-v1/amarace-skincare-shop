const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Updated Cloudinary Storage - Preserve original image quality
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        quality: 'auto:best', // Best quality
        fetch_format: 'auto' // Auto format selection
      }
    ],
    // Don't resize - keep original dimensions
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `product-${uniqueSuffix}`;
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Get all products with filtering, sorting, pagination
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12, featured, bestSeller, minPrice, maxPrice } = req.query;

    let query = {};
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (bestSeller) query.bestSeller = bestSeller === 'true';
    if (search) query.$text = { $search: search };

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else if (sort === 'rating') sortOption.ratings = -1;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (Admin)
router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    // Get full-size image URLs from Cloudinary
    const images = req.files?.map(file => file.path) || [];

    const productData = {
      ...req.body,
      images,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      sku: req.body.sku || '',
      featured: req.body.featured === 'true' || req.body.featured === true,
      bestSeller: req.body.bestSeller === 'true' || req.body.bestSeller === true,
      newArrival: req.body.newArrival === 'true' || req.body.newArrival === true,
      published: req.body.published === 'true' || req.body.published === true || req.body.published === undefined
    };

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update product (Admin)
router.put('/:id', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update basic fields
    if (req.body.name) product.name = req.body.name;
    if (req.body.description) product.description = req.body.description;
    if (req.body.category) product.category = req.body.category;
    if (req.body.brand) product.brand = req.body.brand;

    // Handle numeric fields (allow 0 values)
    if (req.body.price !== undefined && req.body.price !== '') {
      product.price = Number(req.body.price);
    }
    if (req.body.stock !== undefined && req.body.stock !== '') {
      product.stock = Number(req.body.stock);
    }

    if (req.body.sku !== undefined) product.sku = req.body.sku;
    product.featured = req.body.featured === 'true' || req.body.featured === true;
    product.bestSeller = req.body.bestSeller === 'true' || req.body.bestSeller === true;
    product.newArrival = req.body.newArrival === 'true' || req.body.newArrival === true;
    product.published = req.body.published === 'true' || req.body.published === true;

    // Handle images
    let updatedImages = [];
    if (req.body.existingImages) {
      updatedImages = JSON.parse(req.body.existingImages);
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      updatedImages = [...updatedImages, ...newImages];
    }

    if (updatedImages.length > 0 || req.body.existingImages) {
      product.images = updatedImages;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Optional: Delete images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          try {
            // Extract public_id from Cloudinary URL
            const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('Error deleting image from Cloudinary:', err);
          }
        }
      }

      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;