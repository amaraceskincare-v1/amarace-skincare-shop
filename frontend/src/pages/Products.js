import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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

  return (
    <div className="products-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Products</span>
      </div>

      {/* Page Title */}
      <div className="page-title">
        <h1>Products</h1>
      </div>

      <div className="products-layout">
        {/* Sidebar Filters */}
        <aside className={`filters-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header-mobile">
            <h3>Filters</h3>
            <button onClick={() => setSidebarOpen(false)}><FiX /></button>
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <h4>Category</h4>
            <ul className="filter-list">
              <li>
                <label className={!category ? 'active' : ''}>
                  <input
                    type="radio"
                    name="category"
                    checked={!category}
                    onChange={() => updateFilter('category', '')}
                  />
                  All Products
                </label>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <label className={category === cat ? 'active' : ''}>
                    <input
                      type="radio"
                      name="category"
                      checked={category === cat}
                      onChange={() => updateFilter('category', cat)}
                    />
                    {cat}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Filter */}
          <div className="filter-section">
            <h4>Price</h4>
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

          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          )}
        </aside>

        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="products-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <button className="filter-toggle-btn" onClick={() => setSidebarOpen(true)}>
              Filters
            </button>

            <span className="results-count">{totalProducts} products</span>

            <div className="toolbar-right">
              {/* Grid Layout Switcher */}
              <div className="grid-switcher">
                {[2, 3, 4, 5].map((cols) => (
                  <button
                    key={cols}
                    className={gridCols === cols ? 'active' : ''}
                    onClick={() => setGridCols(cols)}
                  >
                    <FiGrid />
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="sort-dropdown">
                <select
                  value={sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                >
                  <option value="">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Best Rated</option>
                </select>
                <FiChevronDown />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className={`products-grid cols-${gridCols}`}>
              {/* Changed from 12 to 6 skeleton loaders */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={`products-grid cols-${gridCols}`}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your filters</p>
              <button onClick={clearFilters}>Clear Filters</button>
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