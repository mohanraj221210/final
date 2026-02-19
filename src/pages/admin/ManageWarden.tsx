
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Warden } from '../../types/admin';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageWarden: React.FC = () => {
    const navigate = useNavigate();
    const [wardens, setWardens] = useState<Warden[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newWarden, setNewWarden] = useState({
        name: '',
        email: '',
        password: '',
        hostelname: ''
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedWarden, setSelectedWarden] = useState<{ id: string; name: string } | null>(null);

    const getImageUrl = (photo: string) => {
        if (!photo) return '';
        if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
        const baseUrl = import.meta.env.VITE_CDN_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPhoto = photo.startsWith('/') ? photo : `/${photo}`;
        return `${cleanBase}${cleanPhoto}`;
    };

    useEffect(() => {
        fetchWardens();
    }, []);

    const fetchWardens = async () => {
        try {
            const data = await adminService.getWardens();
            setWardens(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch wardens");
        } finally {
            setLoading(false);
        }
    };

    const filteredWardens = wardens.filter(warden => {
        const search = searchTerm.toLowerCase();
        return (
            warden.name.toLowerCase().includes(search) ||
            warden.email.toLowerCase().includes(search) ||
            (warden.hostelname && warden.hostelname.toLowerCase().includes(search))
        );
    });

    const handleAddNew = () => {
        setNewWarden({ name: '', email: '', password: '', hostelname: '' });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.addWarden(newWarden);
            toast.success("Warden created successfully");
            setIsModalOpen(false);
            fetchWardens();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add warden");
        }
    };

    const handleDeleteClick = (id: string, name: string) => {
        setSelectedWarden({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedWarden) return;
        try {
            await adminService.deleteWarden(selectedWarden.id);
            toast.success("Warden deleted successfully");
            fetchWardens();
        } catch (error) {
            toast.error("Failed to delete warden");
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedWarden(null);
        }
    };

    return (
        <AdminLayout title="Manage Wardens" activeMenu="warden">
            <ToastContainer position="bottom-right" theme="colored" />

            <div className="admin-page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Warden Management</h1>
                        <p className="page-subtitle">Manage hostel wardens and assignments</p>
                    </div>
                    <div className="header-actions">
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by name, email, hostel..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" onClick={handleAddNew}>
                            <span className="icon">+</span> Add New Warden
                        </button>
                    </div>
                </div>

                <div className="content-card">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <span>Loading data...</span>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Warden Name</th>
                                        <th>Email Address</th>
                                        <th>Hostel Name</th>
                                        <th>Phone Number</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWardens.map(item => (
                                        <tr key={item._id}>
                                            <td>
                                                <div className="user-info">
                                                    <div className="user-avatar-placeholder">
                                                        {item.photo ? (
                                                            <img
                                                                src={getImageUrl(item.photo)}
                                                                alt={item.name}
                                                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                                            />
                                                        ) : (
                                                            <span>{item.name.charAt(0)}</span>
                                                        )}
                                                        <span className="hidden">{item.name.charAt(0)}</span>
                                                    </div>
                                                    <div className="user-details">
                                                        <span className="user-name">{item.name}</span>
                                                        <span className="user-id">ID: {item._id.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{item.email}</td>
                                            <td>
                                                <span className="badge badge-orange">{item.hostelname || 'Unassigned'}</span>
                                            </td>
                                            <td>{item.phone || '-'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-view" onClick={() => navigate(`/admin/warden-details/${item._id}`)}>
                                                        View Details
                                                    </button>
                                                    <button className="btn-icon delete" onClick={() => handleDeleteClick(item._id, item.name)} title="Remove Warden">
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredWardens.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="empty-state">
                                                {searchTerm ? "No wardens found matching your search." : "No wardens found. Click \"Add New Warden\" to create one."}
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
                            <h3>Add New Warden</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Robert Brown"
                                        value={newWarden.name}
                                        onChange={e => setNewWarden({ ...newWarden, name: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="robert@hostel.edu"
                                        value={newWarden.email}
                                        onChange={e => setNewWarden({ ...newWarden, email: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={newWarden.password}
                                        onChange={e => setNewWarden({ ...newWarden, password: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hostel Name</label>
                                    <select
                                        value={newWarden.hostelname}
                                        onChange={e => setNewWarden({ ...newWarden, hostelname: e.target.value })}
                                        className="form-input"
                                    >
                                        <option value="">Select Hostel</option>
                                        <option value="Boys Hostel 1">Boys Hostel 1</option>
                                        <option value="Boys Hostel 2">Boys Hostel 2</option>
                                        <option value="Boys Hostel 3">Boys Hostel 3</option>
                                        <option value="Girls Hostel 1">Girls Hostel 1</option>
                                        <option value="Girls Hostel 2">Girls Hostel 2</option>
                                        <option value="Girls Hostel 3">Girls Hostel 3</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create Warden</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={selectedWarden?.name || 'Warden'}
                itemType="Warden"
            />

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

                .search-icon { color: #9ca3af; }
                .search-bar input {
                    border: none; background: transparent; outline: none; width: 100%;
                    font-size: 0.9rem; color: #111827;
                }

                .content-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                }

                .table-responsive { overflow-x: auto; }
                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th { background: #f9fafb; padding: 16px 24px; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
                .modern-table td { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 0.95rem; }
                .modern-table tr:hover { background-color: #f9fafb; }

                .user-info { display: flex; align-items: center; gap: 16px; }
                .user-avatar-placeholder { width: 40px; height: 40px; border-radius: 50%; background: #ffedd5; color: #ea580c; display: flex; align-items: center; justify-content: center; font-weight: 600; border: 2px solid #fed7aa; overflow: hidden; position: relative; }
                .user-avatar-placeholder img { width: 100%; height: 100%; object-fit: cover; }
                .hidden { display: none !important; }
                .user-details { display: flex; flex-direction: column; }
                .user-name { font-weight: 600; color: #111827; }
                .user-id { font-size: 0.75rem; color: #9ca3af; }

                .badge { padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
                .badge-orange { background: #ffedd5; color: #c2410c; border: 1px solid #fed7aa; }

                .btn-primary { background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); transition: all 0.2s; }
                .btn-primary:hover { box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3); transform: translateY(-1px); }

                .action-buttons { display: flex; gap: 8px; }
                .btn-icon { background: transparent; border: none; cursor: pointer; font-size: 1.1rem; padding: 8px; border-radius: 8px; transition: background 0.2s; }
                .btn-icon:hover { background: #f3f4f6; }
                .btn-icon.delete:hover { background: #fee2e2; color: #ef4444; }

                .loading-state, .empty-state { padding: 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #6b7280; text-align: center; }
                .spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }

                /* Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
                .modal-content { background: white; border-radius: 20px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; animation: modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .modal-header { padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: #f9fafb; }
                .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #111827; }
                .close-btn { background: transparent; border: none; font-size: 1.5rem; color: #9ca3af; cursor: pointer; line-height: 1; }
                .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
                .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 8px; }
                .form-input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 0.95rem; transition: border-color 0.15s, box-shadow 0.15s; }
                .form-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
                .modal-footer { padding: 20px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; }
                .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; padding: 10px 18px; border-radius: 10px; font-weight: 500; cursor: pointer; }

                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes modalSlide { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </AdminLayout>
    );
};

export default ManageWarden;
