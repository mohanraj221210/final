
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Bus } from '../../types/admin';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageBus: React.FC = () => {
    const navigate = useNavigate();
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBus, setNewBus] = useState({
        routenumber: '',
        busnumber: '',
        drivername: '',
        driverphone: '',
        route: '',
        boardingpoints: '',
        trackerlink: ''
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBus, setSelectedBus] = useState<{ id: string; number: string } | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            const data = await adminService.getBuses();
            setBuses(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch buses");
        } finally {
            setLoading(false);
        }
    };

    const filteredBuses = buses.filter(bus => {
        const search = searchTerm.toLowerCase();
        return (
            (bus.busnumber?.toLowerCase() || '').includes(search) ||
            (bus.routenumber?.toLowerCase() || '').includes(search) ||
            (bus.drivername?.toLowerCase() || '').includes(search) ||
            (bus.route?.toLowerCase() || '').includes(search)
        );
    });

    const handleAddNew = () => {
        setNewBus({
            routenumber: '',
            busnumber: '',
            drivername: '',
            driverphone: '',
            route: '',
            boardingpoints: '',
            trackerlink: ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const busData = {
                ...newBus,
                boardingpoints: newBus.boardingpoints.split(',').map(s => s.trim())
            };
            await adminService.addBus(busData);
            toast.success("Bus added successfully");
            setIsModalOpen(false);
            fetchBuses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add bus");
        }
    };

    const handleDeleteClick = (id: string, number: string) => {
        setSelectedBus({ id, number });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedBus) return;
        try {
            await adminService.deleteBus(selectedBus.id);
            toast.success("Bus deleted successfully");
            fetchBuses();
        } catch (error) {
            toast.error("Failed to delete bus");
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedBus(null);
        }
    };

    return (
        <AdminLayout title="Manage Buses">
            <ToastContainer position="bottom-right" theme="colored" />

            <div className="admin-page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Transport Management</h1>
                        <p className="page-subtitle">Manage fleet, routes and drivers</p>
                    </div>
                    <div className="header-actions">
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search buses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" onClick={handleAddNew}>
                            <span className="icon">+</span> Add New Bus
                        </button>
                    </div>
                </div>

                <div className="content-card">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <span>Loading transport data...</span>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Route Info</th>
                                        <th>Bus Number</th>
                                        <th>Driver Details</th>
                                        <th>Route Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBuses.length > 0 ? (
                                        filteredBuses.map(bus => (
                                            <tr key={bus._id}>
                                                <td>
                                                    <div className="user-info">
                                                        <div className="user-avatar-placeholder route-badge">
                                                            {bus.routenumber}
                                                        </div>
                                                        <div className="user-details">
                                                            <span className="user-name">Route {bus.routenumber}</span>
                                                            <span className="user-id">Bus ID: {bus._id.slice(-6).toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-bus">{bus.busnumber}</span>
                                                </td>
                                                <td>
                                                    <div className="driver-info">
                                                        <span className="font-medium">{bus.drivername}</span>
                                                        <span className="text-sm text-muted">{bus.driverphone}</span>
                                                    </div>
                                                </td>
                                                <td className="route-cell" title={bus.route}>
                                                    {bus.route}
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-view" onClick={() => navigate(`/admin/bus-details/${bus._id}`)}>
                                                            View Details
                                                        </button>
                                                        <button className="btn-icon delete" onClick={() => handleDeleteClick(bus._id, bus.busnumber)} title="Delete Bus">
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="empty-state">
                                                {searchTerm ? `No results found for "${searchTerm}"` : "No buses found. Click \"Add New Bus\" to create one."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Bus</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Route Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBus.routenumber}
                                        onChange={e => setNewBus({ ...newBus, routenumber: e.target.value })}
                                        placeholder="e.g. 42"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bus Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBus.busnumber}
                                        onChange={e => setNewBus({ ...newBus, busnumber: e.target.value })}
                                        placeholder="e.g. TN-01-AB-1234"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Driver Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBus.drivername}
                                        onChange={e => setNewBus({ ...newBus, drivername: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Driver Phone</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBus.driverphone}
                                        onChange={e => setNewBus({ ...newBus, driverphone: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Route Description</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBus.route}
                                        onChange={e => setNewBus({ ...newBus, route: e.target.value })}
                                        placeholder="Start - End"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Tracker Link (Optional)</label>
                                    <input
                                        type="url"
                                        value={newBus.trackerlink}
                                        onChange={e => setNewBus({ ...newBus, trackerlink: e.target.value })}
                                        placeholder="https://..."
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Boarding Points (comma separated)</label>
                                    <input
                                        type="text"
                                        value={newBus.boardingpoints}
                                        onChange={e => setNewBus({ ...newBus, boardingpoints: e.target.value })}
                                        placeholder="Point A, Point B, Point C"
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Add Bus</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={selectedBus ? `Bus ${selectedBus.number}` : 'Bus'}
                itemType="Bus"
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
                .header-actions {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }
                .search-bar {
                    display: flex;
                    align-items: center;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 10px;
                    padding: 8px 12px;
                    gap: 8px;
                    width: 250px;
                }
                .search-bar:focus-within {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }
                .search-icon { font-size: 1rem; color: #9ca3af; }
                .search-bar input {
                    border: none;
                    outline: none;
                    background: transparent;
                    width: 100%;
                    font-size: 0.9rem;
                    color: #374151;
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
                .modern-table td { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 0.95rem; vertical-align: middle; }
                .modern-table tr:hover { background-color: #f9fafb; }

                .user-info { display: flex; align-items: center; gap: 16px; }
                .user-avatar-placeholder { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 2px solid transparent; }
                .route-badge { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
                
                .user-details { display: flex; flex-direction: column; }
                .user-name { font-weight: 600; color: #111827; }
                .user-id { font-size: 0.75rem; color: #9ca3af; }

                .badge { padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
                .badge-bus { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }

                .driver-info { display: flex; flex-direction: column; }
                .text-sm { font-size: 0.85rem; }
                .text-muted { color: #6b7280; }
                
                .route-cell { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .btn-primary { background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); transition: all 0.2s; }
                .btn-primary:hover { box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3); transform: translateY(-1px); }

                .action-buttons { display: flex; gap: 8px; align-items: center; }
                .btn-icon { background: transparent; border: none; cursor: pointer; font-size: 1.1rem; padding: 8px; border-radius: 8px; transition: background 0.2s; }
                .btn-icon:hover { background: #f3f4f6; }
                .btn-icon.delete:hover { background: #fee2e2; color: #ef4444; }

                .loading-state, .empty-state { padding: 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #6b7280; text-align: center; }
                .spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }

                /* Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
                .modal-content { 
                    background: white; 
                    border-radius: 20px; 
                    width: 90%; 
                    max-width: 800px; 
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
                    overflow: hidden; 
                    animation: modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex;
                    flex-direction: column;
                    max-height: 90vh;
                }
                .modal-header { padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: #f9fafb; }
                .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #111827; }
                .close-btn { background: transparent; border: none; font-size: 1.5rem; color: #9ca3af; cursor: pointer; line-height: 1; }
                .modal-body { 
                    padding: 24px; 
                    display: grid; 
                    grid-template-columns: repeat(2, 1fr); 
                    gap: 20px; 
                    overflow-y: auto;
                }
                .form-group.full-width { grid-column: 1 / -1; }
                .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 8px; }
                .form-input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 0.95rem; transition: border-color 0.15s, box-shadow 0.15s; }
                .form-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
                .modal-footer { padding: 20px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; }
                .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; padding: 10px 18px; border-radius: 10px; font-weight: 500; cursor: pointer; }

                @media (max-width: 640px) {
                    .modal-body { grid-template-columns: 1fr; }
                }

                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes modalSlide { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </AdminLayout>
    );
};

export default ManageBus;
