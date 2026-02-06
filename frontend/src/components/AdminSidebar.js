import { Link, useLocation } from 'react-router-dom';
import { FiLayout, FiPackage, FiShoppingCart, FiStar, FiArrowLeft, FiSettings, FiUsers } from 'react-icons/fi';

const AdminSidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/admin', name: 'Dashboard', icon: <FiLayout /> },
        { path: '/admin/products', name: 'Products', icon: <FiPackage /> },
        { path: '/admin/orders', name: 'Orders', icon: <FiShoppingCart /> },
        { path: '/admin/reviews', name: 'Reviews', icon: <FiStar /> },
        { path: '/admin/users', name: 'Users', icon: <FiUsers /> },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo">
                AMARACÉ <span>ADMIN</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        {item.icon} {item.name}
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <Link to="/" className="nav-item return-site">
                    <FiArrowLeft /> Return to Site
                </Link>
            </div>
        </aside>
    );
};

export default AdminSidebar;
