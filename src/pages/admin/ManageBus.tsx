
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Bus } from '../../types/admin';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageBus: React.FC = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBus, setNewBus] = useState({
        routenumber: '',
        busnumber: '',
        drivername: '',
        driverphone: '',
        route: '',
        boardingpoints: '' // Comma separated for input, array for API? Service handles it? 
    });

    // Handle boarding points as string in form, convert to array on submit
    // API Expects array of strings? Type definition says string[].

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

    const handleAddNew = () => {
        setNewBus({
            routenumber: '',
            busnumber: '',
            drivername: '',
            driverphone: '',
            route: '',
            boardingpoints: ''
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

    const handleDelete = async (id: string, number: string) => {
        if (confirm(`Are you sure you want to delete Bus ${number}?`)) {
            try {
                await adminService.deleteBus(id);
                toast.success("Bus deleted successfully");
                fetchBuses();
            } catch (error) {
                toast.error("Failed to delete bus");
            }
        }
    };

    return (
        <AdminLayout title="Manage Buses">
            <ToastContainer position="bottom-right" />
            <div className="page-header-actions">
                <p className="description">Manage transport fleet and routes.</p>
                <button className="btn-primary" onClick={handleAddNew}>+ Add New Bus</button>
            </div>

            <div className="table-container">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Route No</th>
                                <th>Bus No</th>
                                <th>Driver</th>
                                <th>Route</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {buses.map(bus => (
                                <tr key={bus._id}>
                                    <td><span className="badge-route">{bus.routenumber}</span></td>
                                    <td className="font-medium">{bus.busnumber}</td>
                                    <td>
                                        <div>{bus.drivername}</div>
                                        <div className="text-sm text-gray">{bus.driverphone}</div>
                                    </td>
                                    <td>{bus.route}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon delete" onClick={() => handleDelete(bus._id, bus.busnumber)} title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {buses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No buses found</td>
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
                            <h3>Add New Bus</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Route Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBus.routenumber}
                                        onChange={e => setNewBus({ ...newBus, routenumber: e.target.value })}
                                        placeholder="e.g. 42"
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
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Driver Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBus.drivername}
                                        onChange={e => setNewBus({ ...newBus, drivername: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Driver Phone</label>
                                    <input
                                        type="text"
                                        required
                                        value={newBus.driverphone}
                                        onChange={e => setNewBus({ ...newBus, driverphone: e.target.value })}
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
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Boarding Points (comma separated)</label>
                                    <input
                                        type="text"
                                        value={newBus.boardingpoints}
                                        onChange={e => setNewBus({ ...newBus, boardingpoints: e.target.value })}
                                        placeholder="Point A, Point B, Point C"
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
                .badge-route { background: #fff7ed; color: #c2410c; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 13px; }
                .text-gray { color: #6b7280; }
                .text-sm { font-size: 0.85rem; }
                .action-buttons { display: flex; gap: 8px; }
                .btn-icon { background: transparent; border: none; cursor: pointer; font-size: 16px; padding: 6px; border-radius: 6px; }
                .btn-icon:hover { background: #f3f4f6; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; backdrop-filter: blur(4px); }
                .modal-content { background: white; border-radius: 16px; width: 100%; max-width: 500px; padding: 0; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
                .modal-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
                .modal-header h3 { margin: 0; font-size: 1.1rem; }
                .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }
                .form-grid { padding: 24px; display: grid; grid-template-columns: 1fr; gap: 16px; }
                 .full-width { grid-column: span 1; }
                .form-group label { display: block; font-size: 14px; margin-bottom: 6px; color: #374151; font-weight: 500; }
                .form-group input, .form-group select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #d1d5db; outline: none; }
                .modal-footer { padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; display: flex; justify-content: flex-end; gap: 12px; }
                .btn-secondary { background: white; border: 1px solid #d1d5db; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
            `}</style>
        </AdminLayout>
    );
};

export default ManageBus;
