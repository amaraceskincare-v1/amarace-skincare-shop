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
    <div className="products-page">
      <div className="shop-header">
        <div className="shop-header-content">
          <h1>Shop All</h1>
          <div className="breadcrumbs">
            <Link to="/">Home</Link> / <span>Shop</span>
          </div>
        </div>
      </div>

      <div className="shop-container">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <div className="sidebar-section">
            <h3>Categories</h3>
            <ul className="category-list">
              <li className={!category ? 'active' : ''} onClick={() => updateFilter('category', '')}>
                All Products
              </li>
              {categories.map((cat) => (
                <li
                  key={cat}
                  className={category === cat ? 'active' : ''}
                  onClick={() => updateFilter('category', cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>Filter by Price</h3>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Sort By</h3>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="sort-select"
            >
              <option value="">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button className="clear-all-btn" onClick={clearFilters}>
              Clear All Filters <FiX />
            </button>
          )}
        </aside>

        {/* Products Grid Area */}
        <main className="shop-main">
          <div className="shop-toolbar">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>
            <div className="product-count">
              Showing {products.length} of {totalProducts} items
            </div>
          </div>

          {loading ? (
            <div className="shop-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="shop-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
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
        </main>
      </div>
    </div>
  );
};

export default Products;