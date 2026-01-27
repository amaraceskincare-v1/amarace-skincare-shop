import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiList, FiChevronDown, FiX } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import '../styles/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gridCols, setGridCols] = useState(4);

  const currentPage = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Changed limit from 12 to 6 products per page
        const params = new URLSearchParams({ page: currentPage, limit: 6 });
        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);
        if (search) params.append('search', search);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);

        const { data } = await api.get(`/products?${params}`);
        setProducts(data.products);
        setTotalProducts(data.total || data.products?.length || 0);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/products/categories/all');
        setCategories(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [currentPage, category, sort, search, minPrice, maxPrice]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') {
      params.set('page', '1');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = category || sort || minPrice || maxPrice;

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  return (
    <div className="products-page cashier-theme">
      {/* Top Navigation Bar */}
      <div className="cashier-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiX /> <span>Back</span>
        </button>
        <h1 className="cashier-title">Products</h1>
        <div className="header-hint">Add products to cart</div>
      </div>

      <div className="products-layout-new">
        {/* Simplified Filter Row */}
        <div className="filter-row">
          <div className="category-select-wrapper">
            <select
              value={category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="cashier-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <FiChevronDown />
          </div>

          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="cashier-search"
            />
          </div>

          <div className="view-toggle">
            <FiList />
            <FiGrid className="active" />
          </div>
        </div>

        {/* Main Products Area */}
        <div className="products-main-new">
          {loading ? (
            <div className="products-grid-new">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedProducts).length > 0 ? (
            Object.entries(groupedProducts).map(([catName, catProducts]) => (
              <div key={catName} className="category-group">
                <h2 className="category-heading">{catName}</h2>
                <div className="products-grid-new">
                  {catProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="btn-primary" onClick={clearFilters}>Clear All</button>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => updateFilter('page', page)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;