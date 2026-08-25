import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus, FiEdit, FiTrash2, FiPackage, FiSearch, FiX,
  FiUpload, FiStar, FiTrendingUp, FiZap, FiEye, FiEyeOff,
  FiCheck, FiAlertTriangle, FiRefreshCw, FiFilter, FiCheckCircle
} from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import { optimizeImage } from '../../utils/imageOptimizer';
import '../../styles/Admin.css';
import '../../styles/AdminForms.css';

// Currency formatter
const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    published: 0,
    unpublished: 0,
    lowStockAlerts: []
  });

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState(''); // in_stock, low_stock, out_of_stock
  const [visibilityFilter, setVisibilityFilter] = useState(''); // true, false
  const [merchandisingFilter, setMerchandisingFilter] = useState(''); // featured, bestSeller, newArrival
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Lip Tint',
    brand: 'AmaraCé',
    stock: '0',
    lowStockThreshold: '10',
    sku: '',
    featured: false,
    bestSeller: false,
    newArrival: false,
    published: true,
    ingredients: '',
    howToUse: ''
  });

  const [productImages, setProductImages] = useState([]);
  const [images, setImages] = useState([]);

  // Fetch Inventory Summary
  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await api.get('/products/inventory/summary');
      setSummary(data);
    } catch (err) {
      console.error('Error fetching inventory summary:', err);
    }
  }, []);

  // Fetch Products with Filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit,
        adminView: 'true'
      });

      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory) params.append('category', selectedCategory);
      if (inventoryStatusFilter) params.append('inventoryStatus', inventoryStatusFilter);
      if (visibilityFilter) params.append('published', visibilityFilter);
      if (merchandisingFilter) params.append('merchandising', merchandisingFilter);

      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?${params.toString()}`),
        api.get('/products/categories/all')
      ]);

      setProducts(prodRes.data.products || []);
      setTotalPages(prodRes.data.totalPages || 1);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, inventoryStatusFilter, visibilityFilter, merchandisingFilter]);

  useEffect(() => {
    fetchProducts();
    fetchSummary();
  }, [fetchProducts, fetchSummary]);

  // Handle Image Upload & Previews
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...images, ...files];
    setImages(newFiles);

    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      file: file,
      isNew: true
    }));
    setProductImages([...productImages, ...newPreviews]);
  };

  const removeImage = (index) => {
    const imageToRemove = productImages[index];
    const newProductImages = productImages.filter((_, i) => i !== index);
    setProductImages(newProductImages);

    if (imageToRemove.isNew) {
      const newImages = images.filter(file => file !== imageToRemove.file);
      setImages(newImages);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Open Modal for Add
  const openAdd = () => {
    setEditProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: categories[0] || 'Lip Tint',
      brand: 'AmaraCé',
      stock: '15',
      lowStockThreshold: '10',
      sku: '',
      featured: false,
      bestSeller: false,
      newArrival: false,
      published: true,
      ingredients: '',
      howToUse: ''
    });
    setProductImages([]);
    setImages([]);
    setShowModal(true);
  };

  // Open Modal for Edit
  const openEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      category: product.category || 'Lip Tint',
      brand: product.brand || 'AmaraCé',
      stock: String(product.stock !== undefined ? product.stock : 0),
      lowStockThreshold: String(product.lowStockThreshold !== undefined ? product.lowStockThreshold : 10),
      sku: product.sku || '',
      featured: Boolean(product.featured),
      bestSeller: Boolean(product.bestSeller),
      newArrival: Boolean(product.newArrival),
      published: product.published !== false,
      ingredients: product.ingredients || '',
      howToUse: product.howToUse || ''
    });

    const existingImages = (product.images || []).map(url => ({
      url,
      isNew: false
    }));
    setProductImages(existingImages);
    setImages([]);
    setShowModal(true);
  };

  // Save Product (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Product name is required');
    if (!formData.price) return toast.error('Product price is required');

    setSaving(true);
    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('description', formData.description);
    data.append('price', formData.price);
    if (formData.originalPrice) data.append('originalPrice', formData.originalPrice);
    data.append('category', formData.category);
    data.append('brand', formData.brand || 'AmaraCé');
    data.append('stock', formData.stock || '0');
    data.append('lowStockThreshold', formData.lowStockThreshold || '10');
    data.append('sku', formData.sku ? formData.sku.trim().toUpperCase() : '');
    data.append('featured', formData.featured ? 'true' : 'false');
    data.append('bestSeller', formData.bestSeller ? 'true' : 'false');
    data.append('newArrival', formData.newArrival ? 'true' : 'false');
    data.append('published', formData.published ? 'true' : 'false');
    data.append('ingredients', formData.ingredients || '');
    data.append('howToUse', formData.howToUse || '');

    const existingImageUrls = productImages.filter(img => !img.isNew).map(img => img.url);
    data.append('existingImages', JSON.stringify(existingImageUrls));

    images.forEach(image => {
      data.append('images', image);
    });

    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product added successfully!');
      }

      setShowModal(false);
      setEditProduct(null);
      fetchProducts();
      fetchSummary();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // Delete Product
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product removed successfully');
        fetchProducts();
        fetchSummary();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  // Helper for Inventory Status calculation
  const getInventoryStatus = (stock, threshold = 10) => {
    const s = Number(stock) || 0;
    const t = Number(threshold) || 10;
    if (s === 0) return { label: 'Out of Stock', class: 'out-of-stock', dot: '🔴' };
    if (s <= t) return { label: `Low Stock (${s} left)`, class: 'low-stock', dot: '🟡' };
    return { label: 'In Stock', class: 'in-stock', dot: '🟢' };
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedCategory || inventoryStatusFilter || visibilityFilter || merchandisingFilter
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setInventoryStatusFilter('');
    setVisibilityFilter('');
    setMerchandisingFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Page Header */}
        <div className="admin-header-row">
          <div>
            <h1>Product Inventory & Catalog</h1>
            <p className="admin-subtitle">
              Manage stock levels, SKUs, visibility, merchandising tags, and formula details
            </p>
          </div>

          <button type="button" className="btn-add-primary" onClick={openAdd}>
            <FiPlus /> Add New Product
          </button>
        </div>

        {/* ── Inventory Summary Dashboard Cards ──────────── */}
        <div className="inventory-summary-grid">
          <div
            className={`inventory-metric-card ${!inventoryStatusFilter && !visibilityFilter ? 'active' : ''}`}
            onClick={clearAllFilters}
          >
            <div className="metric-icon total"><FiPackage /></div>
            <div className="metric-content">
              <span className="metric-label">Total Catalog</span>
              <h3 className="metric-val">{summary.totalProducts}</h3>
              <span className="metric-sub">{summary.published} Published • {summary.unpublished} Drafts</span>
            </div>
          </div>

          <div
            className={`inventory-metric-card ${inventoryStatusFilter === 'in_stock' ? 'active' : ''}`}
            onClick={() => { setInventoryStatusFilter('in_stock'); setCurrentPage(1); }}
          >
            <div className="metric-icon in-stock"><FiCheckCircle /></div>
            <div className="metric-content">
              <span className="metric-label">In Stock</span>
              <h3 className="metric-val in-stock">{summary.inStock}</h3>
              <span className="metric-sub">Healthy inventory levels</span>
            </div>
          </div>

          <div
            className={`inventory-metric-card alert ${inventoryStatusFilter === 'low_stock' ? 'active' : ''}`}
            onClick={() => { setInventoryStatusFilter('low_stock'); setCurrentPage(1); }}
          >
            <div className="metric-icon low-stock"><FiAlertTriangle /></div>
            <div className="metric-content">
              <div className="metric-label-row">
                <span className="metric-label">Low Stock Alert</span>
                {summary.lowStock > 0 && <span className="alert-badge">{summary.lowStock} Needs Attention</span>}
              </div>
              <h3 className="metric-val low-stock">{summary.lowStock}</h3>
              <span className="metric-sub">At or below alert threshold</span>
            </div>
          </div>

          <div
            className={`inventory-metric-card danger ${inventoryStatusFilter === 'out_of_stock' ? 'active' : ''}`}
            onClick={() => { setInventoryStatusFilter('out_of_stock'); setCurrentPage(1); }}
          >
            <div className="metric-icon out-of-stock"><FiX /></div>
            <div className="metric-content">
              <span className="metric-label">Out of Stock</span>
              <h3 className="metric-val out-of-stock">{summary.outOfStock}</h3>
              <span className="metric-sub">Marked as Sold Out in store</span>
            </div>
          </div>
        </div>

        {/* ── Inventory Filters Toolbar ──────────────────── */}
        <div className="admin-filter-toolbar">
          <div className="filter-search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by Product Name, SKU, or Keyword..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-icon-btn"
                onClick={() => setSearchQuery('')}
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          <div className="filter-dropdowns-row">
            {/* Inventory Status */}
            <select
              value={inventoryStatusFilter}
              onChange={(e) => { setInventoryStatusFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by inventory status"
            >
              <option value="">Inventory: All Levels</option>
              <option value="in_stock">🟢 In Stock (Above Threshold)</option>
              <option value="low_stock">🟡 Low Stock (Needs Attention)</option>
              <option value="out_of_stock">🔴 Out of Stock (0 items)</option>
            </select>

            {/* Visibility Filter */}
            <select
              value={visibilityFilter}
              onChange={(e) => { setVisibilityFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by visibility"
            >
              <option value="">Visibility: All</option>
              <option value="true">Published (Live in Store)</option>
              <option value="false">Draft / Unpublished (Hidden)</option>
            </select>

            {/* Merchandising Filter */}
            <select
              value={merchandisingFilter}
              onChange={(e) => { setMerchandisingFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by merchandising"
            >
              <option value="">Merchandising: All</option>
              <option value="featured">★ Featured</option>
              <option value="bestSeller">🏆 Best Seller</option>
              <option value="newArrival">✨ New Arrival</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by category"
            >
              <option value="">Category: All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={clearAllFilters}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Products Table ─────────────────────────────── */}
        <div className="admin-table-container">
          <table className="admin-table products-admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Merchandising</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                    <FiRefreshCw className="spin" size={24} />
                    <p style={{ marginTop: '8px', color: '#666' }}>Loading catalog...</p>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map(product => {
                  const invStatus = getInventoryStatus(product.stock, product.lowStockThreshold);
                  const isPublished = product.published !== false;

                  return (
                    <tr key={product._id}>
                      {/* Product Thumbnail & Name */}
                      <td className="product-info-cell">
                        <img
                          src={optimizeImage(product.images?.[0] || '/placeholder.jpg', 80)}
                          alt=""
                          className="product-thumb-small"
                        />
                        <div className="product-meta">
                          <strong className="product-name">{product.name}</strong>
                          <span className="product-brand-sub">{product.brand || 'AmaraCé'}</span>
                        </div>
                      </td>

                      {/* SKU */}
                      <td>
                        <code className="sku-badge">{product.sku || '—'}</code>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="category-pill">{product.category}</span>
                      </td>

                      {/* Price */}
                      <td className="price-cell">
                        <strong>₱{product.price?.toFixed(2)}</strong>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="original-price-sub">₱{product.originalPrice?.toFixed(2)}</span>
                        )}
                      </td>

                      {/* Inventory Count */}
                      <td className="inventory-qty-cell">
                        <span className={`inventory-dot ${invStatus.class}`} />
                        <strong>{product.stock}</strong>
                        <small className="threshold-sub">Alert: ≤{product.lowStockThreshold || 10}</small>
                      </td>

                      {/* Inventory Status Pill */}
                      <td>
                        <span className={`status-pill ${invStatus.class}`}>
                          {invStatus.label}
                        </span>
                      </td>

                      {/* Visibility Pill */}
                      <td>
                        <span className={`visibility-pill ${isPublished ? 'published' : 'draft'}`}>
                          {isPublished ? <><FiEye size={12} /> Published</> : <><FiEyeOff size={12} /> Draft</>}
                        </span>
                      </td>

                      {/* Merchandising Badges */}
                      <td>
                        <div className="merchandising-tags-row">
                          {product.featured && <span className="merch-tag featured">Featured</span>}
                          {product.bestSeller && <span className="merch-tag bestseller">Best Seller</span>}
                          {product.newArrival && <span className="merch-tag new">New</span>}
                          {!product.featured && !product.bestSeller && !product.newArrival && (
                            <span className="merch-tag none">Standard</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btns-heavy">
                          <button
                            type="button"
                            className="edit-btn-v2"
                            onClick={() => openEdit(product)}
                            title="Edit Product"
                          >
                            <FiEdit /> <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="delete-btn-v2"
                            onClick={() => handleDelete(product._id, product.name)}
                            title="Delete Product"
                          >
                            <FiTrash2 /> <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                    <FiPackage size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <h4>No products found</h4>
                    <p>Try adjusting your search query, inventory level, or category filter.</p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        className="btn-reset-filters"
                        onClick={clearAllFilters}
                        style={{ marginTop: '12px' }}
                      >
                        Clear All Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className="page-nav-btn"
            >
              Previous
            </button>

            <div className="page-numbers" style={{ display: 'flex', gap: '0.5rem' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="page-nav-btn"
            >
              Next
            </button>
          </div>
        )}

        {/* ── Product Modal (Add / Edit) ─────────────── */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal redesigned-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{editProduct ? `Edit: ${editProduct.name}` : 'Create New Product'}</h2>
                  <p className="modal-subtitle">Configure pricing, stock threshold, merchandising, and formula</p>
                </div>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => { setShowModal(false); setEditProduct(null); }}
                  aria-label="Close modal"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="redesigned-form">
                {/* ── SECTION 1: IMAGES ── */}
                <div className="form-section">
                  <h3 className="section-title">1. Product Media</h3>
                  <p className="section-description">High-resolution imagery (Cloudinary auto-optimized). First image is primary.</p>

                  <div className="image-upload-container">
                    <div className="image-preview-grid">
                      {productImages.map((image, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={optimizeImage(image.url, 200)} alt={`Product ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeImage(index)}
                            title="Remove image"
                          >
                            <FiX size={14} />
                          </button>
                          {index === 0 && <span className="primary-badge">Primary Cover</span>}
                        </div>
                      ))}

                      <label className="image-upload-card">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                        <div className="upload-placeholder">
                          <FiUpload size={28} />
                          <span>Add Media</span>
                          <small>JPG, PNG, WebP up to 50MB</small>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* ── SECTION 2: BASIC INFORMATION ── */}
                <div className="form-section">
                  <h3 className="section-title">2. Basic Information</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Allure Velvet Lip Tint"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Category *</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="e.g. Lip Tint, Perfume, Bath and Body"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="AmaraCé"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Short Description *</label>
                      <textarea
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide a compelling description of this beauty product..."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ── SECTION 3: PRICING & INVENTORY ── */}
                <div className="form-section">
                  <h3 className="section-title">3. Pricing & Inventory Management</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Selling Price (PHP) *</label>
                      <div className="input-prefix-box">
                        <span>₱</span>
                        <input
                          type="number"
                          name="price"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="399.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Original Price / Compare At (PHP)</label>
                      <div className="input-prefix-box">
                        <span>₱</span>
                        <input
                          type="number"
                          name="originalPrice"
                          step="0.01"
                          min="0"
                          value={formData.originalPrice}
                          onChange={handleInputChange}
                          placeholder="499.00 (Optional strike-through)"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>SKU (Stock Keeping Unit)</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="e.g. LT-ALLURE-01"
                      />
                    </div>

                    <div className="form-group">
                      <label>Current Stock Quantity *</label>
                      <input
                        type="number"
                        name="stock"
                        min="0"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="25"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Low Stock Alert Threshold</label>
                      <input
                        type="number"
                        name="lowStockThreshold"
                        min="0"
                        value={formData.lowStockThreshold}
                        onChange={handleInputChange}
                        placeholder="10"
                      />
                      <small className="field-hint">Triggers Low Stock warning when stock is ≤ this number</small>
                    </div>

                    <div className="form-group">
                      <label>Calculated Status</label>
                      <div className="live-status-preview-box">
                        {(() => {
                          const s = getInventoryStatus(formData.stock, formData.lowStockThreshold);
                          return (
                            <span className={`status-pill ${s.class}`}>
                              {s.dot} {s.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── SECTION 4: VISIBILITY & MERCHANDISING ── */}
                <div className="form-section">
                  <h3 className="section-title">4. Visibility & Merchandising</h3>
                  
                  {/* Publication Toggle */}
                  <div className="form-group visibility-toggle-group">
                    <label className="toggle-switch-label">
                      <input
                        type="checkbox"
                        name="published"
                        checked={formData.published}
                        onChange={handleCheckboxChange}
                      />
                      <span className="toggle-slider" />
                      <div>
                        <strong>Published Status: {formData.published ? 'Published (Live)' : 'Draft (Hidden)'}</strong>
                        <p>{formData.published ? 'Visible to customers in the store catalogue' : 'Hidden from storefront searches and categories'}</p>
                      </div>
                    </label>
                  </div>

                  {/* Merchandising Checkboxes */}
                  <div className="merchandising-checkbox-grid">
                    <label className="checkbox-card">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleCheckboxChange}
                      />
                      <div className="cb-content">
                        <strong>★ Featured Product</strong>
                        <p>Displayed in Homepage Featured showcase</p>
                      </div>
                    </label>

                    <label className="checkbox-card">
                      <input
                        type="checkbox"
                        name="bestSeller"
                        checked={formData.bestSeller}
                        onChange={handleCheckboxChange}
                      />
                      <div className="cb-content">
                        <strong>🏆 Best Seller</strong>
                        <p>Highlights with gold Best Seller badge</p>
                      </div>
                    </label>

                    <label className="checkbox-card">
                      <input
                        type="checkbox"
                        name="newArrival"
                        checked={formData.newArrival}
                        onChange={handleCheckboxChange}
                      />
                      <div className="cb-content">
                        <strong>✨ New Arrival</strong>
                        <p>Highlights with New Arrival badge</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* ── SECTION 5: FORMULA & APPLICATION DETAILS ── */}
                <div className="form-section">
                  <h3 className="section-title">5. Formula & Application Ritual</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Ingredients (Bullet list or paragraph)</label>
                      <textarea
                        name="ingredients"
                        rows="3"
                        value={formData.ingredients}
                        onChange={handleInputChange}
                        placeholder="• Hyaluronic Acid • Vitamin E • Rosehip Seed Oil..."
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>How to Use / Ritual Instructions</label>
                      <textarea
                        name="howToUse"
                        rows="3"
                        value={formData.howToUse}
                        onChange={handleInputChange}
                        placeholder="• Glide gently across lips starting from center outwards..."
                      />
                    </div>
                  </div>
                </div>

                {/* ── MODAL ACTIONS ── */}
                <div className="modal-actions-sticky">
                  <button
                    type="button"
                    className="btn-cancel-modal"
                    onClick={() => { setShowModal(false); setEditProduct(null); }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit-modal"
                    disabled={saving}
                  >
                    {saving ? 'Saving Changes...' : editProduct ? 'Update Product' : 'Save & Publish Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;