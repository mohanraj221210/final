
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Watchman } from '../../types/admin';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageSecurity: React.FC = () => {
    const [watchmen, setWatchmen] = useState<Watchman[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newWatchman, setNewWatchman] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        fetchWatchmen();
    }, []);

    const fetchWatchmen = async () => {
        try {
            const data = await adminService.getWatchmen();
            setWatchmen(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch watchmen");
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setNewWatchman({ name: '', email: '', password: '' });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.addWatchman(newWatchman);
            toast.success("Watchman registered successfully");
            setIsModalOpen(false);
            fetchWatchmen();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add watchman");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to remove ${name}?`)) {
            try {
                await adminService.deleteWatchman(id);
                toast.success("Watchman deleted successfully");
                fetchWatchmen();
            } catch (error) {
                toast.error("Failed to delete watchman");
            }
        }
    };

    return (
        <AdminLayout title="Manage Security">
            <ToastContainer position="bottom-right" />
            <div className="page-header-actions">
                <p className="description">Manage security personnel.</p>
                <button className="btn-primary" onClick={handleAddNew}>+ Add Watchman</button>
            </div>

            <div className="table-container">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {watchmen.map(item => (
                                <tr key={item._id}>
                                    <td className="font-medium">{item.name}</td>
                                    <td>{item.email}</td>
                                    <td>{item.phone || '-'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon delete" onClick={() => handleDelete(item._id, item.name)} title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {watchmen.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">No watchmen found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Register Watchman</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newWatchman.name}
                                        onChange={e => setNewWatchman({ ...newWatchman, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newWatchman.email}
                                        onChange={e => setNewWatchman({ ...newWatchman, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newWatchman.password}
                                        onChange={e => setNewWatchman({ ...newWatchman, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Register</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                /* Reuse styles */
                .page-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .description { color: #6b7280; margin: 0; }
                .btn-primary { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
                .btn-primary:hover { background: #4f46e5; }
                .table-container { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th, .admin-table td { padding: 16px 24px; text-align: left; border-bottom: 1px solid #f3f4f6; }
                .admin-table th { background: #f9fafb; color: #6b7280; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
                .action-buttons { display: flex; gap: 8px; }
                .btn-icon { background: transparent; border: none; cursor: pointer; font-size: 16px; padding: 6px; border-radius: 6px; }
                .btn-icon:hover { background: #f3f4f6; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; backdrop-filter: blur(4px); }
                .modal-content { background: white; border-radius: 16px; width: 100%; max-width: 500px; padding: 0; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
                .modal-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
                .modal-header h3 { margin: 0; font-size: 1.1rem; }
                .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }
                .form-grid { padding: 24px; display: grid; grid-template-columns: 1fr; gap: 16px; }
                .form-group label { display: block; font-size: 14px; margin-bottom: 6px; color: #374151; font-weight: 500; }
                .form-group input, .form-group select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #d1d5db; outline: none; }
                .modal-footer { padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; display: flex; justify-content: flex-end; gap: 12px; }
                .btn-secondary { background: white; border: 1px solid #d1d5db; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
            `}</style>
        </AdminLayout>
    );
};

export default ManageSecurity;
