import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiShoppingCart, FiCreditCard } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/Admin.css';

const AdminProducts = () => {
  // ... (rest of state logic)
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Lip Tint', brand: '', stock: '', featured: false, bestSeller: false
  });
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

  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('brand', formData.brand || '');
    data.append('stock', formData.stock);
    // Send boolean values as explicit strings
    data.append('featured', formData.featured ? 'true' : 'false');
    data.append('bestSeller', formData.bestSeller ? 'true' : 'false');

    // Append images only if there are new ones
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    try {
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
      setFormData({ name: '', description: '', price: '', category: 'Lip Tint', brand: '', stock: '', featured: false, bestSeller: false });
      setImages([]);
      fetchProducts();
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Operation failed');
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
    setFormData({ ...product, bestSeller: product.bestSeller || false });
    setImages([]); // Clear images on edit open, or strictly keep existing if no new upload.
    setShowModal(true);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-header">
          <h1>Manage Products</h1>
          <button className="add-btn" onClick={() => setShowModal(true)}><FiPlus /> Add Product</button>
        </div>

        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td><img src={product.images?.[0] || '/placeholder.jpg'} alt="" className="product-thumb" /></td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>₱{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <button className="edit-btn" onClick={() => openEdit(product)}><FiEdit /></button>
                  <button className="delete-btn" onClick={() => handleDelete(product._id)}><FiTrash2 /></button>
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
            <div className="modal">
              <h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Product Images</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setImages(e.target.files)}
                    className="file-input"
                  />
                </div>
                <input placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                <input type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '1rem' }}
                  >
                    <option value="Lip Tint">Lip Tint</option>
                    <option value="Perfume">Perfume</option>
                    <option value="Beauty Soap">Beauty Soap</option>
                  </select>
                </div>
                <input placeholder="Brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                <input type="number" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      style={{ width: '20px', height: '20px' }}
                    />
                    Featured
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.bestSeller}
                      onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
                      style={{ width: '20px', height: '20px' }}
                    />
                    Best Seller
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => { setShowModal(false); setEditProduct(null); }}>Cancel</button>
                  <button type="submit">{editProduct ? 'Update' : 'Create'}</button>
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