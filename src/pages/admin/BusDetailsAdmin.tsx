
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Bus } from '../../types/admin';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BusDetailsAdmin: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [bus, setBus] = useState<Bus | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Bus & { boardingPointsString?: string }>>({});

    useEffect(() => {
        if (id) fetchBusDetails(id);
    }, [id]);

    const fetchBusDetails = async (busId: string) => {
        try {
            const data = await adminService.getBusById(busId);
            setBus(data);
            setFormData({
                ...data,
                boardingPointsString: data.boardingpoints ? data.boardingpoints.join(', ') : ''
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch bus details");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!bus) return;
        try {
            const updateData = {
                ...formData,
                boardingpoints: formData.boardingPointsString ? formData.boardingPointsString.split(',').map(s => s.trim()) : []
            };
            delete (updateData as any).boardingPointsString;

            await adminService.updateBus(bus._id, updateData);
            toast.success("Bus updated successfully");
            setIsEditing(false);
            fetchBusDetails(bus._id);
        } catch (error) {
            toast.error("Failed to update bus");
        }
    };

    const handleDelete = async () => {
        if (!bus) return;
        try {
            await adminService.deleteBus(bus._id);
            toast.success("Bus deleted successfully");
            navigate('/admin/manage-bus');
        } catch (error) {
            toast.error("Failed to delete bus");
        }
    };

    if (loading) return (
        <AdminLayout title="Transport Details">
            <div className="loading-state">
                <div className="spinner"></div>
                <span>Loading transport details...</span>
            </div>
            <style>{`.loading-state { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #6b7280; } .spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </AdminLayout>
    );

    if (!bus) return <AdminLayout title="Transport Details"><div className="error-state">Bus not found</div></AdminLayout>;

    return (
        <AdminLayout title="Bus Details" activeMenu="bus">
            <ToastContainer position="bottom-right" theme="colored" />

            <div className="admin-page-content">
                <div className="page-header">
                    <button className="back-dashboard-btn" onClick={() => navigate('/admin/manage-bus')}>
                        ← Back
                    </button>
                    <div className="header-actions">
                        {!isEditing ? (
                            <>
                                <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                                <button className="btn-danger" onClick={() => setIsDeleteModalOpen(true)}>Delete Bus</button>
                            </>
                        ) : (
                            <>
                                <button className="btn-secondary" onClick={() => { setIsEditing(false); setFormData({ ...bus, boardingPointsString: bus.boardingpoints?.join(', ') || '' }); }}>Cancel</button>
                                <button className="btn-success" onClick={handleUpdate}>Save Changes</button>
                            </>
                        )}
                    </div>
                </div>

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    itemName={`Route ${bus.routenumber}`}
                    itemType="Bus"
                />

                <div className="profile-layout">
                    {/* Left Column: ID Card Style Profile */}
                    <div className="profile-sidebar">
                        <div className="profile-card">
                            <div className="profile-header-bg"></div>
                            <div className="profile-content">
                                <div className="avatar-wrapper">
                                    <div className="profile-avatar-placeholder">🚌</div>
                                </div>
                                <h2 className="profile-name">Route {bus.routenumber}</h2>
                                <p className="profile-role">Bus: {bus.busnumber}</p>
                                <div className="profile-badges">
                                    <span className="badge badge-status">Active</span>
                                    <span className="badge badge-id">ID: {bus._id.slice(-6).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info */}
                    <div className="profile-details">
                        <div className="detail-section">
                            <h3 className="section-title">Transport Information</h3>
                            <div className="fields-grid">
                                <Field label="Route Number" name="routenumber" value={formData.routenumber} isEditing={isEditing} onChange={handleInputChange} />
                                <Field label="Bus Number" name="busnumber" value={formData.busnumber} isEditing={isEditing} onChange={handleInputChange} />
                                <Field label="Driver Name" name="drivername" value={formData.drivername} isEditing={isEditing} onChange={handleInputChange} />
                                <Field label="Driver Phone" name="driverphone" value={formData.driverphone} isEditing={isEditing} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="section-title">Route & Boarding</h3>
                            <div className="fields-grid">
                                <div className="full-width-field">
                                    <Field label="Route Description" name="route" value={formData.route} isEditing={isEditing} onChange={handleInputChange} />
                                </div>
                                <div className="full-width-field">
                                    <Field label="Tracker Link" name="trackerlink" value={formData.trackerlink} isEditing={isEditing} onChange={handleInputChange} isLink={true} />
                                </div>
                                <div className="full-width-field">
                                    <Field label="Boarding Points (Comma Separated)" name="boardingPointsString" value={formData.boardingPointsString} isEditing={isEditing} onChange={handleInputChange} />
                                </div>
                            </div>

                            {!isEditing && (
                                <div className="full-width-field mt-4">
                                    <label className="field-label">Boarding Points List</label>
                                    <div className="tags-container">
                                        {bus.boardingpoints?.map((pt, i) => <span key={i} className="tag tag-blue">{pt}</span>)}
                                        {(!bus.boardingpoints || bus.boardingpoints.length === 0) && <span className="text-gray-400">No boarding points listed</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .admin-page-content {
                    font-family: 'Inter', system-ui, sans-serif;
                    padding: 2px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }

                .back-dashboard-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 24px;
                    padding: 10px 20px;
                    border-radius: 10px;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .back-dashboard-btn:hover {
                    color: #0047AB;
                    border-color: #0047AB;
                    transform: translateX(-4px);
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.1);
                }

                .header-actions {
                    display: flex;
                    gap: 12px;
                }

                .btn-primary, .btn-secondary, .btn-danger, .btn-success {
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 500;
                    font-size: 0.95rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-primary { background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: white; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
                .btn-primary:hover { box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3); transform: translateY(-1px); }

                .btn-secondary { background: white; color: #374151; border: 1px solid #e5e7eb; }
                .btn-secondary:hover { background: #f9fafb; border-color: #d1d5db; }

                .btn-success { background: #10b981; color: white; }
                .btn-success:hover { background: #059669; }

                .btn-danger { background: #fee2e2; color: #ef4444; }
                .btn-danger:hover { background: #fecaca; }

                .profile-layout {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 32px;
                    align-items: start;
                }

                .profile-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .profile-card {
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
                    border: 1px solid #e5e7eb;
                    position: relative;
                }

                .profile-header-bg {
                    height: 120px;
                    background: linear-gradient(135deg, #ef4444 0%, #f43f5e 100%);
                    background-size: cover;
                    background-position: center;
                    position: relative;
                }

                .profile-content {
                    padding: 0 32px 32px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: -60px;
                    position: relative;
                    z-index: 2;
                }

                .avatar-wrapper {
                    padding: 4px;
                    background: white;
                    border-radius: 50%;
                    margin-bottom: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .profile-avatar-placeholder {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: #fee2e2;
                    color: #ef4444;
                    font-size: 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    border: 4px solid white;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }

                .profile-name { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0 0 4px; text-align: center; }
                .profile-role { color: #6b7280; font-size: 1rem; margin: 0 0 16px; text-align: center; }

                .profile-badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
                .badge { padding: 4px 12px; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; }
                .badge-status { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
                .badge-id { background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; }

                .profile-details { display: flex; flex-direction: column; gap: 24px; }

                .detail-section {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .section-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 20px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #f3f4f6;
                }

                .fields-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }

                .field-group { display: flex; flex-direction: column; gap: 6px; }
                .field-label { font-size: 0.85rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.025em; }
                .field-value { font-size: 1rem; color: #111827; font-weight: 500; }
                .field-input {
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 1rem;
                    color: #111827;
                    transition: all 0.2s;
                }
                .field-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
                
                .full-width-field { grid-column: 1 / -1; margin-top: 10px; }
                .mt-4 { margin-top: 24px; }
                
                .tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
                .tag { padding: 6px 12px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; }
                .tag-blue { background: #e0e7ff; color: #4338ca; }

                @media (max-width: 1024px) {
                    .profile-layout { grid-template-columns: 1fr; }
                    .profile-sidebar { max-width: 400px; margin: 0 auto; width: 100%; }
                }
            `}</style>
        </AdminLayout>
    );
};

const Field = ({ label, name, value, isEditing, onChange, isLink }: any) => (
    <div className="field-group">
        <label className="field-label">{label}</label>
        {isEditing ? (
            <input name={name} value={value || ''} onChange={onChange} className="field-input" />
        ) : (
            <div className="field-value">
                {isLink && value ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                        {value}
                    </a>
                ) : (
                    value || '-'
                )}
            </div>
        )}
    </div>
);

export default BusDetailsAdmin;
