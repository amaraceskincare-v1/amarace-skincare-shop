import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLayout, FiPackage, FiShoppingCart, FiCreditCard, FiStar, FiArrowLeft, FiSettings, FiUsers, FiMenu, FiX } from 'react-icons/fi';

const AdminSidebar = () => {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { path: '/admin', name: 'Dashboard', icon: <FiLayout /> },
        { path: '/admin/products', name: 'Products', icon: <FiPackage /> },
        { path: '/admin/orders', name: 'Orders', icon: <FiShoppingCart /> },
        { path: '/admin/payments', name: 'GCash Payments', icon: <FiCreditCard /> },
        { path: '/admin/reviews', name: 'Reviews', icon: <FiStar /> },
        { path: '/admin/users', name: 'Users', icon: <FiUsers /> },
        { path: '/admin/settings', name: 'Settings', icon: <FiSettings /> },
    ];

    const closeSidebar = () => setMobileOpen(false);

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="admin-mobile-topbar">
                <button className="admin-hamburger" onClick={() => setMobileOpen(true)}>
                    <FiMenu size={22} />
                </button>
                <div className="admin-mobile-logo">AMARACÉ <span>ADMIN</span></div>
            </div>

            {/* Overlay */}
            {mobileOpen && (
                <div className="admin-sidebar-overlay" onClick={closeSidebar} />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-logo">
                    AMARACÉ <span>ADMIN</span>
                    <button className="sidebar-close-btn" onClick={closeSidebar}>
                        <FiX size={18} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={closeSidebar}
                        >
                            {item.icon} {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" className="nav-item return-site" onClick={closeSidebar}>
                        <FiArrowLeft /> Return Home
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
