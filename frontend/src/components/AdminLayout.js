import AdminSidebar from './AdminSidebar';
import '../styles/Admin.css';

const AdminLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
