import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiGrid, FiChevronDown, FiX, FiFilter, FiSliders, FiSearch, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { useSettings } from '../context/SettingsContext';
import { optimizeImage } from '../utils/imageOptimizer';
import { getActiveShoppers } from '../utils/analytics';
import '../styles/Products.css';

const PRODUCTS_PER_PAGE = 8;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [activeShoppers, setActiveShoppers] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const { settings } = useSettings();

  // Helper to check if media is a video
  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.m4v'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const currentPage = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Set document SEO title
  useEffect(() => {
    if (category) {
      document.title = `${category} Collection | AmaraCé Skincare`;
    } else if (search) {
      document.title = `Search: "${search}" | AmaraCé Skincare`;
    } else {
      document.title = 'Shop All Collections | AmaraCé Skincare';
    }
  }, [category, search]);

  // Fetch real-time active visitors count
  useEffect(() => {
    getActiveShoppers().then(count => setActiveShoppers(count));
    const interval = setInterval(() => {
      getActiveShoppers().then(count => setActiveShoppers(count));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products and categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: currentPage,
          limit: PRODUCTS_PER_PAGE
        });

        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);
        if (search) params.append('search', search);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);

        const { data } = await api.get(`/products?${params.toString()}`);

        let fetchedProducts = data.products || [];
        if (inStockOnly) {
          fetchedProducts = fetchedProducts.filter(p => p.stock > 0);
        }

        setProducts(fetchedProducts);
        setTotalProducts(data.total || fetchedProducts.length || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Unable to load products. Please check your connection and retry.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategoryData = async () => {
      try {
        const [catRes, allProductsRes] = await Promise.all([
          api.get('/products/categories/all'),
          api.get('/products?limit=1000')
        ]);

        setCategories(catRes.data || []);

        const counts = { All: allProductsRes.data?.total || 0 };
        (allProductsRes.data?.products || []).forEach(p => {
          if (p.category) {
            counts[p.category] = (counts[p.category] || 0) + 1;
          }
        });
        setCategoryCounts(counts);
      } catch (err) {
        console.error('Error fetching category counts:', err);
      }
    };

    fetchProducts();
    fetchCategoryData();
  }, [currentPage, category, sort, search, minPrice, maxPrice, inStockOnly]);

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
    setInStockOnly(false);
  };

  const hasActiveFilters = Boolean(category || sort || search || minPrice || maxPrice || inStockOnly);

  // Price presets
  const applyPricePreset = (min, max) => {
    const params = new URLSearchParams(searchParams);
    if (min !== undefined) params.set('minPrice', String(min));
    else params.delete('minPrice');

    if (max !== undefined) params.set('maxPrice', String(max));
    else params.delete('maxPrice');

    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="products-page-v2">
      {/* ── Editorial Hero ─────────────────────────────── */}
      <section className="shop-hero-v2">
        {isVideo(settings?.productHeroMedia) ? (
          <video
            className="hero-video-bg"
            autoPlay
            muted
            loop
            playsInline
            src={settings.productHeroMedia}
          />
        ) : settings?.productHeroMedia ? (
          <div
            className="hero-image-bg"
            style={{
              backgroundImage: `url(${optimizeImage(settings.productHeroMedia, 1920)})`
            }}
          />
        ) : (
          <div className="hero-gradient-bg" />
        )}

        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-live-pill">
            <span className="live-pulse-dot" />
            <span>{activeShoppers} {activeShoppers === 1 ? 'shopper' : 'shoppers'} browsing now</span>
          </div>

          <span className="hero-tagline">Artisan & Dermatologist Tested</span>
          <h1>{category ? `${category} Collection` : 'Our Beauty Essentials'}</h1>

          <div className="breadcrumbs-v2">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/products" className={!category ? 'active-breadcrumb' : ''}>Shop</Link>
            {category && (
              <>
                <span className="breadcrumb-sep">/</span>
                <span className="active-breadcrumb">{category}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Horizontal Category Collection Bar ──────────── */}
      <nav className="collection-nav-bar" aria-label="Collections filter">
        <div className="collection-nav-inner">
          <button
            type="button"
            className={`collection-pill ${!category ? 'active' : ''}`}
            onClick={() => updateFilter('category', '')}
          >
            All Collections
            <span className="pill-count">{categoryCounts['All'] || 0}</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`collection-pill ${category === cat ? 'active' : ''}`}
              onClick={() => updateFilter('category', cat)}
            >
              {cat}
              <span className="pill-count">{categoryCounts[cat] || 0}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main Shop Layout ───────────────────────────── */}
      <div className="shop-container-v2">
        {/* Mobile Filter Drawer Overlay */}
        {sidebarOpen && (
          <div className="filter-drawer-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar Filters */}
        <aside className={`shop-sidebar-v2 ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header-v2">
            <h3>Filters & Sorting</h3>
            <button
              type="button"
              className="close-sidebar-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close filters"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="sidebar-content-v2">
            {/* Category Filter */}
            <div className="sidebar-section-v2">
              <h4>Categories</h4>
              <ul className="category-list-v2">
                <li
                  className={!category ? 'active' : ''}
                  onClick={() => updateFilter('category', '')}
                >
                  <span>All Collections</span>
                  <span className="cat-count">({categoryCounts['All'] || 0})</span>
                </li>
                {categories.map((cat) => (
                  <li
                    key={cat}
                    className={category === cat ? 'active' : ''}
                    onClick={() => updateFilter('category', cat)}
                  >
                    <span>{cat}</span>
                    <span className="cat-count">({categoryCounts[cat] || 0})</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range Filter */}
            <div className="sidebar-section-v2">
              <h4>Price (PHP)</h4>
              <div className="price-inputs-v2">
                <div className="input-with-currency">
                  <span>₱</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    aria-label="Minimum price"
                  />
                </div>
                <span className="price-dash">—</span>
                <div className="input-with-currency">
                  <span>₱</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    aria-label="Maximum price"
                  />
                </div>
              </div>

              {/* Price Preset Chips */}
              <div className="price-presets">
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => applyPricePreset(0, 300)}
                >
                  Under ₱300
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => applyPricePreset(300, 600)}
                >
                  ₱300 - ₱600
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => applyPricePreset(600, undefined)}
                >
                  ₱600+
                </button>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="sidebar-section-v2">
              <h4>Sort By</h4>
              <div className="sort-buttons-v2">
                {[
                  { id: '', label: 'Featured' },
                  { id: 'newest', label: 'Newest' },
                  { id: 'price_asc', label: 'Price: Low → High' },
                  { id: 'price_desc', label: 'Price: High → Low' },
                  { id: 'rating', label: 'Highest Rated' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={sort === opt.id ? 'active' : ''}
                    onClick={() => updateFilter('sort', opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="sidebar-section-v2">
              <h4>Availability</h4>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span className="toggle-custom" />
                <span>In Stock Only</span>
              </label>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="clear-all-btn-v2"
                onClick={clearFilters}
              >
                Reset All Filters
              </button>
            )}

            {/* Side Ad Promo */}
            {settings?.sideAd && (
              <div className="sidebar-ad-banner">
                <img src={optimizeImage(settings.sideAd, 400)} alt="Promotion" loading="lazy" />
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Products Area ─────────────────────────── */}
        <main className="shop-main-v2">
          {/* Top Toolbar */}
          <div className="shop-toolbar-v2">
            <div className="toolbar-left">
              <button
                type="button"
                className="mobile-filter-trigger"
                onClick={() => setSidebarOpen(true)}
              >
                <FiSliders /> Filters {hasActiveFilters && <span className="active-dot" />}
              </button>

              <div className="product-count-badge">
                Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products
              </div>
            </div>

            <div className="toolbar-right">
              {/* Search Bar */}
              <div className="shop-search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products, scents, shades..."
                  value={search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  aria-label="Search products"
                />
                {search && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => updateFilter('search', '')}
                    aria-label="Clear search"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="active-filter-chips-row">
              <span className="active-label">Active:</span>

              {category && (
                <span className="filter-chip">
                  {category}
                  <button type="button" onClick={() => updateFilter('category', '')}>
                    <FiX size={12} />
                  </button>
                </span>
              )}

              {search && (
                <span className="filter-chip">
                  "{search}"
                  <button type="button" onClick={() => updateFilter('search', '')}>
                    <FiX size={12} />
                  </button>
                </span>
              )}

              {minPrice && (
                <span className="filter-chip">
                  Min: ₱{minPrice}
                  <button type="button" onClick={() => updateFilter('minPrice', '')}>
                    <FiX size={12} />
                  </button>
                </span>
              )}

              {maxPrice && (
                <span className="filter-chip">
                  Max: ₱{maxPrice}
                  <button type="button" onClick={() => updateFilter('maxPrice', '')}>
                    <FiX size={12} />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="filter-chip">
                  In Stock Only
                  <button type="button" onClick={() => setInStockOnly(false)}>
                    <FiX size={12} />
                  </button>
                </span>
              )}

              <button type="button" className="clear-all-inline" onClick={clearFilters}>
                Clear All
              </button>
            </div>
          )}

          {/* Grid Content */}
          {loading ? (
            <div className="products-grid-v2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-card-skeleton-v2">
                  <div className="skeleton-image-v2" />
                  <div className="skeleton-info-v2">
                    <div className="skeleton-line-v2 tag" />
                    <div className="skeleton-line-v2" />
                    <div className="skeleton-line-v2 short" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="shop-empty-state error-state">
              <div className="empty-icon">⚠️</div>
              <h3>Unable to Load Products</h3>
              <p>{error}</p>
              <button
                type="button"
                className="btn-editorial-primary"
                onClick={() => window.location.reload()}
              >
                <FiRefreshCw /> Retry Connection
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid-v2">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="shop-empty-state">
              <div className="empty-icon">✨</div>
              <h3>No Matches Found</h3>
              <p>We couldn't find any products matching your current filters or search terms.</p>
              
              <div className="empty-state-actions">
                <button
                  type="button"
                  className="btn-editorial-primary"
                  onClick={clearFilters}
                >
                  Reset All Filters
                </button>
              </div>

              {categories.length > 0 && (
                <div className="suggested-categories">
                  <span>Or explore popular categories:</span>
                  <div className="suggested-pills">
                    {categories.slice(0, 3).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className="suggested-pill"
                        onClick={() => {
                          clearFilters();
                          updateFilter('category', cat);
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Pagination ─────────────────────────────── */}
          {!loading && totalPages > 1 && (
            <div className="pagination-v2">
              <button
                type="button"
                className="page-nav-btn prev"
                disabled={currentPage <= 1}
                onClick={() => updateFilter('page', currentPage - 1)}
                aria-label="Previous page"
              >
                ← Previous
              </button>

              <div className="page-numbers-v2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`page-btn-v2 ${currentPage === page ? 'active' : ''}`}
                    onClick={() => updateFilter('page', page)}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="page-nav-btn next"
                disabled={currentPage >= totalPages}
                onClick={() => updateFilter('page', currentPage + 1)}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Global Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default Products;