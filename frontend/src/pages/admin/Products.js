import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiShoppingCart, FiCreditCard, FiX, FiUpload, FiStar, FiTrendingUp, FiZap, FiEye, FiCheck, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/Admin.css';
import '../../styles/AdminForms.css';

const AdminProducts = () => {
  // ... (rest of state logic)
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Lip Tint', brand: 'AmaraCé', stock: '', sku: '', featured: false, bestSeller: false, newArrival: false, published: true
  });
  const [productImages, setProductImages] = useState([]); // For previews and tracking current images
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  useEffect(() => { fetchProducts(); }, [currentPage]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get(`/products?page=${currentPage}&limit=${limit}`);
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const [images, setImages] = useState([]); // For newly uploaded files

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...images, ...files];
    setImages(newFiles);

    // Create previews
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
      // Also remove from the 'images' FileList array
      const newImages = images.filter(file => file !== imageToRemove.file);
      setImages(newImages);
    } else {
      // If it's an existing image, we might need to track it for deletion on server
      // For now, the backend logic expects the full list of images to keep or similar.
      // But based on common patterns, we'll just send the current state's non-new urls.
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('brand', formData.brand || 'AmaraCé');
    data.append('stock', formData.stock);
    data.append('sku', formData.sku || '');
    data.append('featured', formData.featured ? 'true' : 'false');
    data.append('bestSeller', formData.bestSeller ? 'true' : 'false');
    data.append('newArrival', formData.newArrival ? 'true' : 'false');
    data.append('published', formData.published ? 'true' : 'false');

    // Handle existing images (to keep) vs new ones
    const existingImageUrls = productImages.filter(img => !img.isNew).map(img => img.url);
    data.append('existingImages', JSON.stringify(existingImageUrls));

    // Append images only if there are new ones
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    try {
      setIsLoading(true);
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated!');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created!');
      }
      setShowModal(false);
      setEditProduct(null);
      setFormData({
        name: '', description: '', price: '', category: 'Lip Tint', brand: 'AmaraCé', stock: '', sku: '', featured: false, bestSeller: false, newArrival: false, published: true
      });
      setProductImages([]);
      setImages([]);
      fetchProducts();
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setFormData({
      ...product,
      brand: product.brand || 'AmaraCé',
      sku: product.sku || '',
      featured: product.featured || false,
      bestSeller: product.bestSeller || false,
      newArrival: product.newArrival || false,
      published: product.published !== false // Default to true if not set
    });
    // Set existing images as previews
    const existingImages = (product.images || []).map(url => ({
      url,
      isNew: false
    }));
    setProductImages(existingImages);
    setImages([]); // Clear new uploads buffer
    setShowModal(true);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-header">
          <h1>Manage Products <small style={{ fontSize: '0.8rem', opacity: 0.6 }}>(v2.0 - Standardized List)</small></h1>
          <button className="add-btn" onClick={() => setShowModal(true)}><FiPlus /> Add Product</button>
        </div>

        <table className="admin-table compact-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td className="product-info-cell">
                  <img
                    src={product.images?.[0] || '/placeholder.jpg'}
                    alt=""
                    className="product-thumb-small"
                    style={{ width: '50px', height: '50px', objectFit: 'cover', minWidth: '50px' }}
                  />
                  <div className="product-meta">
                    <span className="product-name">{product.name}</span>
                    <span className="product-brand-sub">{product.brand || 'No Brand'}</span>
                  </div>
                </td>
                <td><span className="category-pill">{product.category}</span></td>
                <td className="price-cell">₱{product.price.toLocaleString()}</td>
                <td className={`stock-cell ${product.stock < 10 ? 'low-stock' : ''}`}>
                  {product.stock}
                </td>
                <td>
                  <div className="status-badges-row">
                    {product.featured && <span className="admin-badge featured">Featured</span>}
                    {product.bestSeller && <span className="admin-badge bestseller">Best Seller</span>}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="action-btns-heavy">
                    <button className="edit-btn-v2" onClick={() => openEdit(product)}>
                      <FiEdit /> <span>Edit</span>
                    </button>
                    <button className="delete-btn-v2" onClick={() => handleDelete(product._id)}>
                      <FiTrash2 /> <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="page-nav-btn"
            >
              Previous
            </button>

            <div className="page-numbers" style={{ display: 'flex', gap: '0.5rem' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  disabled={Math.abs(currentPage - page) > 1}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="page-nav-btn"
            >
              Next
            </button>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal redesigned-modal">
              <div className="modal-header">
                <h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2>
                <button className="close-modal-btn" onClick={() => { setShowModal(false); setEditProduct(null); }}>
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="redesigned-form">
                {/* SECTION 1: PRODUCT IMAGES */}
                <div className="form-section">
                  <h3 className="section-title">Product Images</h3>
                  <p className="section-description">Upload product images (recommended: 800x800px)</p>

                  <div className="image-upload-container">
                    <div className="image-preview-grid">
                      {productImages.map((image, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={image.url} alt={`Product ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeImage(index)}
                            title="Remove image"
                          >
                            <FiX size={16} />
                          </button>
                          {index === 0 && <span className="primary-badge">Primary</span>}
                        </div>
                      ))}

                      {/* Upload New Image Card */}
                      <label className="image-upload-card">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                        <div className="upload-placeholder">
                          <FiUpload size={32} />
                          <span>Add Images</span>
                          <small>PNG, JPG up to 5MB</small>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: PRODUCT INFORMATION */}
                <div className="form-section">
                  <h3 className="section-title">Product Information</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">Product Name <span className="required">*</span></label>
                      <input
                        type="text"
                        name="name"
                        className="form-input"
                        placeholder="e.g., Allure Lip Tint"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Brand</label>
                      <input
                        type="text"
                        name="brand"
                        className="form-input"
                        placeholder="AmaraCé"
                        value={formData.brand}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SKU</label>
                      <input
                        type="text"
                        name="sku"
                        className="form-input"
                        placeholder="e.g., LT-ALLURE-001"
                        value={formData.sku}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label className="form-label">Product Description <span className="required">*</span></label>
                      <textarea
                        name="description"
                        className="form-textarea"
                        rows="5"
                        placeholder="Describe your product features, benefits, and ingredients..."
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      />
                      <small className="form-hint">{formData.description?.length || 0} / 500 characters</small>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: PRICING & INVENTORY */}
                <div className="form-section">
                  <h3 className="section-title">Pricing & Inventory</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Price (₱) <span className="required">*</span></label>
                      <div className="input-with-prefix">
                        <span className="input-prefix">₱</span>
                        <input
                          type="number"
                          name="price"
                          className="form-input with-prefix"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Stock Quantity <span className="required">*</span></label>
                      <input
                        type="number"
                        name="stock"
                        className="form-input"
                        placeholder="0"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                      {formData.stock < 10 && formData.stock > 0 && <small className="form-hint warning">⚠️ Low stock warning</small>}
                      {formData.stock === 0 && <small className="form-hint error">❌ Out of stock</small>}
                    </div>
                  </div>
                </div>

                {/* SECTION 4: CATEGORY & ORGANIZATION */}
                <div className="form-section">
                  <h3 className="section-title">Category & Organization</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Category <span className="required">*</span></label>
                      <select
                        name="category"
                        className="form-select"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Lip Tint">Lip Tint</option>
                        <option value="Perfume">Perfume</option>
                        <option value="Beauty Soap">Beauty Soap</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: PRODUCT VISIBILITY & FEATURES */}
                <div className="form-section">
                  <h3 className="section-title">Product Visibility & Features</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-card">
                      <input type="checkbox" name="featured" checked={formData.featured} onChange={handleCheckboxChange} />
                      <div className="checkbox-content">
                        <div className="checkbox-icon"><FiStar size={20} /></div>
                        <div className="checkbox-text">
                          <h4>Featured Product</h4>
                          <p>Display this product in the "Featured Products" section on homepage</p>
                        </div>
                      </div>
                    </label>

                    <label className="checkbox-card">
                      <input type="checkbox" name="bestSeller" checked={formData.bestSeller} onChange={handleCheckboxChange} />
                      <div className="checkbox-content">
                        <div className="checkbox-icon bestseller"><FiTrendingUp size={20} /></div>
                        <div className="checkbox-text">
                          <h4>Best Seller</h4>
                          <p>Mark as best selling product with a special badge</p>
                        </div>
                      </div>
                    </label>

                    <label className="checkbox-card">
                      <input type="checkbox" name="newArrival" checked={formData.newArrival} onChange={handleCheckboxChange} />
                      <div className="checkbox-content">
                        <div className="checkbox-icon new"><FiZap size={20} /></div>
                        <div className="checkbox-text">
                          <h4>New Arrival</h4>
                          <p>Show "NEW" badge on product card</p>
                        </div>
                      </div>
                    </label>

                    <label className="checkbox-card">
                      <input type="checkbox" name="published" checked={formData.published} onChange={handleCheckboxChange} />
                      <div className="checkbox-content">
                        <div className="checkbox-icon publish"><FiEye size={20} /></div>
                        <div className="checkbox-text">
                          <h4>Published</h4>
                          <p>Make this product visible to customers on your store</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* SECTION 6: FORM ACTIONS */}
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditProduct(null); }}>
                    <FiX size={18} /> Cancel
                  </button>
                  <div className="primary-actions">
                    <button type="submit" className="btn-primary" disabled={isLoading}>
                      {isLoading ? <><FiLoader className="spin" size={18} /> Updating...</> : <><FiCheck size={18} /> {editProduct ? 'Update Product' : 'Create Product'}</>}
                    </button>
                  </div>
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