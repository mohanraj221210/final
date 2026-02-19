
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Watchman } from '../../types/admin';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

const SecurityDetailsAdmin: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [watchman, setWatchman] = useState<Watchman | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Watchman>>({});

    const getImageUrl = (photo: string) => {
        if (!photo) return '';
        if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
        const baseUrl = import.meta.env.VITE_CDN_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPhoto = photo.startsWith('/') ? photo : `/${photo}`;
        return `${cleanBase}${cleanPhoto}`;
    };

    useEffect(() => {
        if (id) fetchWatchmanDetails(id);
    }, [id]);

    const fetchWatchmanDetails = async (watchmanId: string) => {
        try {
            const data = await adminService.getWatchmanById(watchmanId);
            setWatchman(data);
            setFormData(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch watchman details");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!watchman) return;
        try {
            await adminService.updateWatchman(watchman._id, formData);
            toast.success("Watchman updated successfully");
            setIsEditing(false);
            fetchWatchmanDetails(watchman._id);
        } catch (error) {
            toast.error("Failed to update watchman");
        }
    };

    const handleDelete = async () => {
        if (!watchman) return;
        try {
            await adminService.deleteWatchman(watchman._id);
            toast.success("Watchman deleted successfully");
            navigate('/admin/manage-security');
        } catch (error) {
            toast.error("Failed to delete watchman");
        }
    };

    const handlePasswordUpdate = async (password: string) => {
        if (!watchman) return;
        try {
            await adminService.updateWatchman(watchman._id, { ...watchman, password });
            toast.success("Password updated successfully");
        } catch (error) {
            toast.error("Failed to update password");
            throw error;
        }
    };

    if (loading) return (
        <AdminLayout title="Security Details">
            <div className="loading-state">
                <div className="spinner"></div>
                <span>Loading profile...</span>
            </div>
            <style>{`.loading-state { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #6b7280; } .spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </AdminLayout>
    );

    if (!watchman) return <AdminLayout title="Security Details"><div className="error-state">Watchman not found</div></AdminLayout>;

    return (
        <AdminLayout title="Security Details" activeMenu="security">
            <ToastContainer position="bottom-right" theme="colored" />

            <div className="admin-page-content">
                <div className="page-header">
                    <button className="back-dashboard-btn" onClick={() => navigate('/admin/manage-security')}>
                        ← Back
                    </button>
                    <div className="header-actions">
                        {!isEditing ? (
                            <>
                                <button className="btn-secondary" onClick={() => setIsPasswordModalOpen(true)}>Change Password</button>
                                <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                                <button className="btn-danger" onClick={() => setIsDeleteModalOpen(true)}>Delete User</button>
                            </>
                        ) : (
                            <>
                                <button className="btn-secondary" onClick={() => { setIsEditing(false); setFormData(watchman); }}>Cancel</button>
                                <button className="btn-success" onClick={handleUpdate}>Save Changes</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="profile-layout">
                    {/* Left Column: ID Card Style Profile */}
                    <div className="profile-sidebar">
                        <div className="profile-card">
                            <div
                                className="profile-header-bg"
                                style={watchman.photo ? {
                                    backgroundImage: `url(${getImageUrl(watchman.photo)})`,
                                    filter: 'blur(5px)',
                                    transform: 'scale(1.2)',
                                    width: '100%'
                                } : {}}
                            ></div>
                            <div className="profile-content">
                                <div className="avatar-wrapper">
                                    {watchman.photo ? (
                                        <img
                                            src={getImageUrl(watchman.photo)}
                                            alt={watchman.name}
                                            className="profile-avatar"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                        />
                                    ) : (
                                        <div className="profile-avatar-placeholder">{watchman.name.charAt(0)}</div>
                                    )}
                                    <div className="profile-avatar-placeholder hidden">{watchman.name.charAt(0)}</div>
                                </div>
                                <h2 className="profile-name">{watchman.name}</h2>
                                <p className="profile-role">Security Personnel</p>
                                <div className="profile-badges">
                                    <span className="badge badge-role">Watchman</span>
                                    <span className="badge badge-id">ID: {watchman._id.slice(-6).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info */}
                    <div className="profile-details">
                        <div className="detail-section">
                            <h3 className="section-title">Personal Information</h3>
                            <div className="fields-grid">
                                <Field label="Full Name" name="name" value={formData.name} isEditing={isEditing} onChange={handleInputChange} />
                                <Field label="Email Address" name="email" value={formData.email} isEditing={isEditing} onChange={handleInputChange} />
                                <Field label="Phone Number" name="phone" value={formData.phone} isEditing={isEditing} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="section-title">Account Status</h3>
                            <div className="fields-grid">
                                <div className="field-group">
                                    <label className="field-label">Linked Hostel</label>
                                    <div className="field-value">All Hostels (General Security)</div>
                                </div>
                                <div className="field-group">
                                    <label className="field-label">Role Access</label>
                                    <div className="field-value">Watchman / Security</div>
                                </div>
                            </div>
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
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
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

                .profile-avatar, .profile-avatar-placeholder {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .profile-avatar-placeholder {
                    background: #dcfce7;
                    color: #15803d;
                    font-size: 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .profile-name { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0 0 4px; text-align: center; }
                .profile-role { color: #6b7280; font-size: 1rem; margin: 0 0 16px; text-align: center; }

                .profile-badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
                .badge { padding: 4px 12px; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; }
                .badge-role { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
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
                
                .hidden { display: none; }

                @media (max-width: 1024px) {
                    .profile-layout { grid-template-columns: 1fr; }
                    .profile-sidebar { max-width: 400px; margin: 0 auto; width: 100%; }
                }
            `}</style>
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSubmit={handlePasswordUpdate}
                userEmail={watchman.email}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName={watchman.name}
                itemType="Security Guard"
            />
        </AdminLayout>
    );
};

const Field = ({ label, name, value, isEditing, onChange }: any) => (
    <div className="field-group">
        <label className="field-label">{label}</label>
        {isEditing ? (
            <input name={name} value={value || ''} onChange={onChange} className="field-input" />
        ) : (
            <div className="field-value">{value || '-'}</div>
        )}
    </div>
);

export default SecurityDetailsAdmin;
