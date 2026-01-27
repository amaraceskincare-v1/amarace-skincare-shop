import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminReviews from './pages/admin/Reviews';
import AdminPayments from './pages/admin/Payments';
import AdminLayout from './components/AdminLayout';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQs from './pages/FAQs';
import PolicyPage from './pages/PolicyPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Show loading screen on route change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Make cart drawer controls available globally
  useEffect(() => {
    window.openCartDrawer = () => setCartDrawerOpen(true);
    window.closeCartDrawer = () => setCartDrawerOpen(false);
  }, []);

  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      <LoadingScreen isLoading={isLoading} />
      {!isAdminPath && <Navbar />}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />

      <main className="main-content">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/info/refund-policy" element={<PolicyPage type="refund" />} />
          <Route path="/info/privacy-policy" element={<PolicyPage type="privacy" />} />
          <Route path="/info/terms" element={<PolicyPage type="terms" />} />
          <Route path="/info/shipping" element={<PolicyPage type="shipping" />} />
          <Route path="/info/returns" element={<PolicyPage type="returns" />} />

          {/* Protected Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <AdminReviews />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout>
                  <AdminPayments />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
        </Routes>
      </main>

      {!isAdminPath && <Footer />}
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
