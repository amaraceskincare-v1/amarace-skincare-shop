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

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      {
        quality: 'auto:best',
        fetch_format: 'auto'
      }
    ],
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

// GET /api/products/inventory/summary (Admin Only)
router.get('/inventory/summary', protect, admin, async (req, res) => {
  try {
    const allProducts = await Product.find({});
    const totalProducts = allProducts.length;

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let published = 0;
    let unpublished = 0;
    const lowStockAlerts = [];

    allProducts.forEach(p => {
      const threshold = typeof p.lowStockThreshold === 'number' ? p.lowStockThreshold : 10;
      const isPub = p.published !== false;

      if (isPub) published++;
      else unpublished++;

      if (p.stock === 0) {
        outOfStock++;
      } else if (p.stock <= threshold) {
        lowStock++;
        lowStockAlerts.push({
          _id: p._id,
          name: p.name,
          sku: p.sku || 'N/A',
          stock: p.stock,
          threshold
        });
      } else {
        inStock++;
      }
    });

    res.json({
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      published,
      unpublished,
      lowStockAlerts
    });
  } catch (error) {
    console.error('Error calculating inventory summary:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all products with filtering, sorting, pagination
router.get('/', async (req, res) => {
  try {
    const {
      category, search, sort, page = 1, limit = 12,
      featured, bestSeller, newArrival, minPrice, maxPrice,
      adminView, inventoryStatus, published, sku, merchandising
    } = req.query;

    let query = {};

    // For public customer view: only show published products
    if (adminView !== 'true') {
      query.published = { $ne: false };
    } else if (published !== undefined && published !== '') {
      query.published = published === 'true';
    }

    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (bestSeller === 'true') query.bestSeller = true;
    if (newArrival === 'true') query.newArrival = true;

    if (merchandising === 'featured') query.featured = true;
    if (merchandising === 'bestSeller') query.bestSeller = true;
    if (merchandising === 'newArrival') query.newArrival = true;

    // Search by name, description, SKU, or category
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ];
    }

    if (sku) {
      query.sku = new RegExp(sku.trim(), 'i');
    }

    // Inventory status filter (Admin)
    if (inventoryStatus === 'out_of_stock') {
      query.stock = 0;
    } else if (inventoryStatus === 'low_stock') {
      query.$expr = {
        $and: [
          { $gt: ['$stock', 0] },
          { $lte: ['$stock', { $ifNull: ['$lowStockThreshold', 10] }] }
        ]
      };
    } else if (inventoryStatus === 'in_stock') {
      query.$expr = {
        $gt: ['$stock', { $ifNull: ['$lowStockThreshold', 10] }]
      };
    }

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
    else sortOption.createdAt = -1;

    const skipCount = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skipCount)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / Number(limit)) || 1,
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
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
router.post('/', protect, admin, upload.array('images', 10), async (req, res) => {
  try {
    const newFiles = req.files?.map(file => file.path) || [];
    let images = newFiles;

    if (req.body.imageMap) {
      try {
        const map = JSON.parse(req.body.imageMap);
        let newFileCursor = 0;
        const ordered = map.map(item => {
          if (item.type === 'new') {
            return (typeof item.index === 'number' && newFiles[item.index]) ? newFiles[item.index] : newFiles[newFileCursor++];
          }
          return null;
        }).filter(Boolean);
        if (ordered.length > 0) images = ordered;
      } catch (err) {
        console.error('Error parsing imageMap in POST:', err);
      }
    }

    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      category: req.body.category,
      brand: req.body.brand || 'AmaraCé',
      stock: Number(req.body.stock) || 0,
      lowStockThreshold: Number(req.body.lowStockThreshold) || 10,
      sku: req.body.sku || '',
      images,
      featured: req.body.featured === 'true' || req.body.featured === true,
      bestSeller: req.body.bestSeller === 'true' || req.body.bestSeller === true,
      newArrival: req.body.newArrival === 'true' || req.body.newArrival === true,
      published: req.body.published === 'true' || req.body.published === true || req.body.published === undefined,
      ingredients: req.body.ingredients || '',
      howToUse: req.body.howToUse || ''
    };

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update product (Admin)
router.put('/:id', protect, admin, upload.array('images', 10), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.body.name !== undefined) product.name = req.body.name;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.category !== undefined) product.category = req.body.category;
    if (req.body.brand !== undefined) product.brand = req.body.brand;
    if (req.body.ingredients !== undefined) product.ingredients = req.body.ingredients;
    if (req.body.howToUse !== undefined) product.howToUse = req.body.howToUse;
    if (req.body.sku !== undefined) product.sku = req.body.sku;

    if (req.body.price !== undefined && req.body.price !== '') {
      product.price = Number(req.body.price);
    }
    if (req.body.originalPrice !== undefined) {
      product.originalPrice = req.body.originalPrice ? Number(req.body.originalPrice) : undefined;
    }
    if (req.body.stock !== undefined && req.body.stock !== '') {
      product.stock = Math.max(0, Number(req.body.stock));
    }
    if (req.body.lowStockThreshold !== undefined && req.body.lowStockThreshold !== '') {
      product.lowStockThreshold = Math.max(0, Number(req.body.lowStockThreshold));
    }

    if (req.body.featured !== undefined) {
      product.featured = req.body.featured === 'true' || req.body.featured === true;
    }
    if (req.body.bestSeller !== undefined) {
      product.bestSeller = req.body.bestSeller === 'true' || req.body.bestSeller === true;
    }
    if (req.body.newArrival !== undefined) {
      product.newArrival = req.body.newArrival === 'true' || req.body.newArrival === true;
    }
    if (req.body.published !== undefined) {
      product.published = req.body.published === 'true' || req.body.published === true;
    }

    // Handle ordered images blending existing Cloudinary URLs & new uploads
    let updatedImages = [];
    const newFiles = (req.files && req.files.length > 0) ? req.files.map(file => file.path) : [];

    if (req.body.imageMap) {
      try {
        const map = JSON.parse(req.body.imageMap);
        let newFileCursor = 0;
        updatedImages = map.map(item => {
          if (item.type === 'existing' && item.url) {
            return item.url;
          } else if (item.type === 'new') {
            const fileUrl = (typeof item.index === 'number' && newFiles[item.index])
              ? newFiles[item.index]
              : newFiles[newFileCursor++];
            return fileUrl;
          }
          return null;
        }).filter(Boolean);
      } catch (err) {
        console.error('Error parsing imageMap in PUT:', err);
      }
    }

    // Fallback if imageMap was not sent or produced empty
    if (updatedImages.length === 0 && (req.body.existingImages !== undefined || newFiles.length > 0)) {
      let existing = [];
      if (req.body.existingImages) {
        try {
          existing = JSON.parse(req.body.existingImages);
        } catch {
          existing = [];
        }
      }
      updatedImages = [...existing, ...newFiles];
    }

    if (updatedImages.length > 0 || req.body.existingImages !== undefined || req.body.imageMap !== undefined) {
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
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          try {
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
    const categories = await Product.distinct('category', { published: { $ne: false } });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;