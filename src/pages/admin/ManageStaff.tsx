
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Staff } from '../../types/admin';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageStaff: React.FC = () => {
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const getImageUrl = (photo: string) => {
        if (!photo) return '';
        if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
        const baseUrl = import.meta.env.VITE_CDN_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPhoto = photo.startsWith('/') ? photo : `/${photo}`;
        return `${cleanBase}${cleanPhoto}`;
    };
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Staff State
    const [newStaff, setNewStaff] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const data = await adminService.getStaffList();
            setStaffList(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch staff list");
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = staffList.filter(staff => {
        const search = searchTerm.toLowerCase();
        return (
            staff.name.toLowerCase().includes(search) ||
            staff.email.toLowerCase().includes(search) ||
            (staff.department && staff.department.toLowerCase().includes(search)) ||
            (staff.designation && staff.designation.toLowerCase().includes(search))
        );
    });

    const handleView = (id: string) => {
        navigate(`/admin/staff-details/${id}`);
    };

    const handleAddNew = () => {
        setNewStaff({ name: '', email: '', password: '' });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.addStaff(newStaff);
            toast.success("Staff added successfully");
            setIsModalOpen(false);
            fetchStaff();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add staff");
        }
    };

    return (
        <AdminLayout title="Manage Staff" activeMenu="staff">
            <ToastContainer position="bottom-right" theme="colored" />

            <div className="admin-page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Staff Management</h1>
                        <p className="page-subtitle">View, search, and manage staff members</p>
                    </div>
                    <div className="header-actions">
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by name, email, dept..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" onClick={handleAddNew}>
                            <span className="icon">+</span> Add New Staff
                        </button>
                    </div>
                </div>

                <div className="content-card">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <span>Loading staff data...</span>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Staff Member</th>
                                        <th>Email</th>
                                        <th>Department</th>
                                        <th>Designation</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map(staff => (
                                        <tr key={staff._id}>
                                            <td>
                                                <div className="user-info">
                                                    {staff.photo ? (
                                                        <img
                                                            src={getImageUrl(staff.photo)}
                                                            alt={staff.name}
                                                            className="user-avatar"
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.removeAttribute('style'); }}
                                                        />
                                                    ) : (
                                                        <div className="user-avatar-placeholder">
                                                            {staff.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="user-avatar-placeholder fallback" style={{ display: 'none' }}>
                                                        {staff.name.charAt(0)}
                                                    </div>
                                                    <div className="user-details">
                                                        <span className="user-name">{staff.name}</span>
                                                        {/* <span className="user-id">#{staff._id.slice(-6).toUpperCase()}</span> */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{staff.email}</td>
                                            <td>
                                                <span className="badge badge-blue">{staff.department || 'N/A'}</span>
                                            </td>
                                            <td>{staff.designation || '-'}</td>
                                            <td>
                                                <button className="btn-view" onClick={() => handleView(staff._id)}>
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {staffList.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="empty-state">
                                                {searchTerm ? "No staff found matching your search." : "No staff members found. Click \"Add New Staff\" to get started."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Staff</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. John Doe"
                                        value={newStaff.name}
                                        onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="john@example.com"
                                        value={newStaff.email}
                                        onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={newStaff.password}
                                        onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .admin-page-content {
                    font-family: 'Inter', system-ui, sans-serif;
                    padding: 2px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }

                .page-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 4px;
                    letter-spacing: -0.025em;
                }

                .page-subtitle {
                    color: #111827;
                    font-size: 0.95rem;
                    margin-top: 20px;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .search-bar {
                    display: flex;
                    align-items: center;
                    background: white;
                    border: 1px solid #d1d5db;
                    padding: 10px 16px;
                    border-radius: 12px;
                    width: 300px;
                    gap: 10px;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .search-bar:focus-within {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .search-icon {
                    color: #9ca3af;
                    font-size: 1rem;
                }

                .search-bar input {
                    border: none;
                    background: transparent;
                    outline: none;
                    width: 100%;
                    font-size: 0.95rem;
                    color: #111827;
                }

                .content-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                }

                .table-responsive {
                    overflow-x: auto;
                }

                .modern-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .modern-table th {
                    background: #f9fafb;
                    padding: 16px 24px;
                    text-align: left;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: #6b7280;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid #e5e7eb;
                }

                .modern-table td {
                    padding: 16px 24px;
                    border-bottom: 1px solid #f3f4f6;
                    color: #374151;
                    font-size: 0.95rem;
                }

                .modern-table tr:last-child td {
                    border-bottom: none;
                }

                .modern-table tr:hover {
                    background-color: #f9fafb;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #e5e7eb;
                }

                .user-avatar-placeholder {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #e0e7ff;
                    color: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 1rem;
                    border: 2px solid #c7d2fe;
                }

                .user-details {
                    display: flex;
                    flex-direction: column;
                }

                .user-name {
                    font-weight: 600;
                    color: #111827;
                }

                .user-id {
                    font-size: 0.75rem;
                    color: #9ca3af;
                }

                .badge {
                    padding: 4px 10px;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-block;
                }

                .badge-blue {
                    background: #eff6ff;
                    color: #2563eb;
                    border: 1px solid #dbeafe;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
                    transition: all 0.2s;
                }

                .btn-primary:hover {
                    box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3);
                    transform: translateY(-1px);
                }

                .btn-icon {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 8px;
                    border-radius: 8px;
                    transition: background 0.2s;
                }

                .btn-icon:hover {
                    background: #f3f4f6;
                }

                .loading-state {
                    padding: 48px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    color: #6b7280;
                }

                .spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #e5e7eb;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .empty-state {
                    text-align: center;
                    padding: 48px;
                    color: #6b7280;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                }

                .modal-content {
                    background: white;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                    animation: modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .modal-header {
                    padding: 24px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f9fafb;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #111827;
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    font-size: 1.5rem;
                    color: #9ca3af;
                    cursor: pointer;
                    line-height: 1;
                }

                .modal-body {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 8px;
                }

                .form-input {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #d1d5db;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    transition: border-color 0.15s, box-shadow 0.15s;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .modal-footer {
                    padding: 20px 24px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .btn-secondary {
                    background: white;
                    border: 1px solid #d1d5db;
                    color: #374151;
                    padding: 10px 18px;
                    border-radius: 10px;
                    font-weight: 500;
                    cursor: pointer;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @keyframes modalSlide {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </AdminLayout>
    );
};

export default ManageStaff;
