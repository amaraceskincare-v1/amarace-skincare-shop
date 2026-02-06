import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiUsers, FiTrash2, FiUserCheck, FiUserX, FiSearch } from 'react-icons/fi';
import '../../styles/Admin.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/auth');
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch users failed:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (id) => {
        try {
            const { data } = await api.put(`/auth/${id}/role`);
            toast.success(`User role updated to ${data.role}`);
            setUsers(users.map(u => u._id === id ? { ...u, role: data.role } : u));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user role');
        }
    };

    const deleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user forever? This action cannot be undone.')) {
            try {
                await api.delete(`/auth/${id}`);
                toast.success('User deleted successfully');
                setUsers(users.filter(u => u._id !== id));
            } catch (error) {
                toast.error(error.response?.data?.message || 'Delete failed');
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1>User Management</h1>
                        <p style={{ color: '#666', marginTop: '4px' }}>Manage all registered accounts and roles</p>
                    </div>
                    <div className="review-stats-mini">
                        <span>Total Users: {users.length}</span>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="admin-toolbar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="admin-search-wrapper" style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Regular Users</option>
                        <option value="admin">Administrators</option>
                    </select>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="loading-spinner-v2"></div>
                                    <p style={{ marginTop: '1rem' }}>Loading users...</p>
                                </td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                    No users found matching your search criteria.
                                </td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: user.role === 'admin' ? '#1a1a1a' : '#ddd',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: '700'
                                                }}>
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: '600' }}>{user.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#444' }}>{user.email}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                background: user.role === 'admin' ? '#f0f0f0' : '#e3f2fd',
                                                color: user.role === 'admin' ? '#1a1a1a' : '#2196f3'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            {user.isVerified ? (
                                                <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '600' }}>● Verified</span>
                                            ) : (
                                                <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: '600' }}>● Unverified</span>
                                            )}
                                        </td>
                                        <td style={{ color: '#666', fontSize: '13px' }}>
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => toggleRole(user._id)}
                                                    title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                                                    style={{
                                                        background: '#1a1a1a',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '7px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    {user.role === 'admin' ? <FiUserX /> : <FiUserCheck />}
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user._id)}
                                                    title="Delete User"
                                                    style={{
                                                        background: '#EF4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '7px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AdminUsers;
