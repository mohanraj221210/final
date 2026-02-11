
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
        <AdminLayout title="Manage Staff">
            <ToastContainer position="bottom-right" />
            <div className="page-header-actions">
                <p className="description">View staff details or add new staff members.</p>
                <button className="btn-primary" onClick={handleAddNew}>+ Add New Staff</button>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="p-4 text-center">Loading...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Designation</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map(staff => (
                                <tr key={staff._id}>
                                    <td className="font-medium">
                                        <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {staff.photo ? (
                                                <img
                                                    src={staff.photo.startsWith('http') || staff.photo.startsWith('data:')
                                                        ? staff.photo
                                                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`.replace('/api', '') + (staff.photo.startsWith('/') ? '' : '/') + staff.photo}
                                                    alt={staff.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.removeAttribute('style'); }}
                                                />
                                            ) : (
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold"
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}
                                                >
                                                    {staff.name.charAt(0)}
                                                </div>
                                            )}
                                            {/* Fallback avatar if image fails */}
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold"
                                                style={{ display: 'none', width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#6366f1', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}
                                            >
                                                {staff.name.charAt(0)}
                                            </div>

                                            <span>{staff.name}</span>
                                        </div>
                                    </td>
                                    <td>{staff.email}</td>
                                    <td>{staff.department || '-'}</td>
                                    <td>{staff.designation || '-'}</td>
                                    <td>
                                        <button className="btn-view" onClick={() => handleView(staff._id)}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {staffList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No staff found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
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
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newStaff.name}
                                        onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newStaff.email}
                                        onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newStaff.password}
                                        onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Register Staff</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .page-header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .description {
                    color: #6b7280;
                    margin: 0;
                }

                .btn-primary {
                    background: #6366f1;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.2s;
                }

                .btn-primary:hover {
                    background: #4f46e5;
                }

                .table-container {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e5e7eb;
                    overflow-x: auto;
                }

                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .admin-table th, .admin-table td {
                    padding: 16px 24px;
                    text-align: left;
                    border-bottom: 1px solid #f3f4f6;
                }

                .admin-table th {
                    background: #f9fafb;
                    color: #6b7280;
                    font-weight: 600;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .admin-table tr:hover {
                    background: #f9fafb;
                }

                .font-medium {
                    font-weight: 500;
                    color: #111827;
                }

                .btn-view {
                    background: #eff6ff;
                    color: #3b82f6;
                    border: 1px solid #dbeafe;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn-view:hover {
                    background: #2563eb;
                    color: white;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 50;
                    backdrop-filter: blur(4px);
                }

                .modal-content {
                    background: white;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 500px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    animation: zoomIn 0.2s ease-out;
                }

                @keyframes zoomIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .modal-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: #111827;
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    font-size: 24px;
                    color: #9ca3af;
                    cursor: pointer;
                }

                .form-grid {
                    padding: 24px;
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                }

                .full-width {
                    grid-column: span 1;
                }

                .form-group label {
                    display: block;
                    font-size: 14px;
                    color: #374151;
                    margin-bottom: 6px;
                    font-weight: 500;
                }

                .form-group input, .form-group select {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    outline: none;
                    transition: border 0.2s;
                }

                .form-group input:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .modal-footer {
                    padding: 16px 24px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    border-radius: 0 0 16px 16px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .btn-secondary {
                    background: white;
                    border: 1px solid #d1d5db;
                    color: #374151;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                }
            `}</style>
        </AdminLayout>
    );
};

export default ManageStaff;
