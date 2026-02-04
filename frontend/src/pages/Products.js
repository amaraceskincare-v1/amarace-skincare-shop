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
  const [gridCols, setGridCols] = useState(3);

  const currentPage = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    document.title = 'Shop All | AmaraCé Skincare collection';
  }, []);

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
    <div className="products-page-v2">
      {/* Premium Shop Hero */}
      <div className="shop-hero-v2">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-tagline">Premium Collection</span>
          <h1>Our Essentials</h1>
          <div className="breadcrumbs-v2">
            <Link to="/">Home</Link> <span>/</span> <Link to="/products">Shop</Link>
            {category && (
              <>
                <span>/</span> <span className="active-breadcrumb">{category}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="shop-container-v2">
        {/* Modern Sidebar Filters */}
        <aside className={`shop-sidebar-v2 ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header-v2">
            <h3>Filters</h3>
            <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
              <FiX />
            </button>
          </div>

          <div className="sidebar-content-v2">
            <div className="sidebar-section-v2">
              <h4>Categories</h4>
              <ul className="category-list-v2">
                <li
                  className={!category ? 'active' : ''}
                  onClick={() => updateFilter('category', '')}
                >
                  All Collections
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

            <div className="sidebar-section-v2">
              <h4>Price Range</h4>
              <div className="price-inputs-v2">
                <div className="input-with-currency">
                  <span>₱</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                  />
                </div>
                <div className="price-divider"></div>
                <div className="input-with-currency">
                  <span>₱</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="sidebar-section-v2">
              <h4>Sort By</h4>
              <div className="sort-buttons-v2">
                {[
                  { id: '', label: 'Default' },
                  { id: 'price_asc', label: 'Price: Low' },
                  { id: 'price_desc', label: 'Price: High' },
                  { id: 'newest', label: 'Newest' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    className={sort === opt.id ? 'active' : ''}
                    onClick={() => updateFilter('sort', opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button className="clear-all-btn-v2" onClick={clearFilters}>
                Reset All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Products Grid Area */}
        <main className="shop-main-v2">
          <div className="shop-toolbar-v2">
            <div className="toolbar-left">
              <button className="mobile-filter-btn" onClick={() => setSidebarOpen(true)}>
                Filters {hasActiveFilters && <span className="filter-count"></span>}
              </button>
              <div className="product-count-v2">
                <span>{totalProducts}</span> Products Found
              </div>
            </div>

            <div className="toolbar-right">
              <div className="search-bar-v2">
                <input
                  type="text"
                  placeholder="Search our essentials..."
                  value={search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="active-filters-row">
              {category && (
                <span className="filter-tag">
                  {category} <FiX onClick={() => updateFilter('category', '')} />
                </span>
              )}
              {minPrice && (
                <span className="filter-tag">
                  Min: ₱{minPrice} <FiX onClick={() => updateFilter('minPrice', '')} />
                </span>
              )}
              {maxPrice && (
                <span className="filter-tag">
                  Max: ₱{maxPrice} <FiX onClick={() => updateFilter('maxPrice', '')} />
                </span>
              )}
              <button className="clear-inline" onClick={clearFilters}>Clear All</button>
            </div>
          )}

          {loading ? (
            <div className="products-grid-v2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="product-card-skeleton-v2">
                  <div className="skeleton-image-v2"></div>
                  <div className="skeleton-info-v2">
                    <div className="skeleton-line-v2"></div>
                    <div className="skeleton-line-v2 short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid-v2">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products-v2">
              <div className="no-products-icon">✨</div>
              <h3>No match found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button className="btn-modern-outline" onClick={clearFilters}>Reset Everything</button>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="pagination-v2">
              <button
                className="page-nav-btn"
                disabled={currentPage === 1}
                onClick={() => updateFilter('page', currentPage - 1)}
              >
                Previous
              </button>
              <div className="page-numbers-v2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`page-btn-v2 ${currentPage === page ? 'active' : ''}`}
                    onClick={() => updateFilter('page', page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="page-nav-btn"
                disabled={currentPage === totalPages}
                onClick={() => updateFilter('page', currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;