
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminProfile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Form state for editing
    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        phone: '',
        designation: '', // If applicable
        department: '', // If applicable
        photo: ''
    });



    const fetchAdminProfile = async () => {
        try {
            const data = await adminService.getProfile();
            setAdmin(data);
            setFormData(data); // Populate form
        } catch (error) {
            console.error("Error fetching admin profile:", error);
            toast.error("Failed to fetch profile data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsEditing(false);
        const loadingToast = toast.loading("Updating profile...");

        try {
            // If API supports FormData for file upload, use FormData. 
            // Assuming simplified update for now as Admin update usually doesn't involve photo in basic setups unless specified.
            // But we will try to support it structure-wise.

            // For now, let's assume JSON update first as getting FormData right without specific API doc for Admin update can be tricky.
            // adminService.updateProfile likely takes a partial object.

            await adminService.updateProfile(formData);

            toast.update(loadingToast, { render: "Profile updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
            await fetchAdminProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.update(loadingToast, { render: "Failed to update profile", type: "error", isLoading: false, autoClose: 3000 });
            setIsEditing(true);
        }
    };

    if (loading) {
        return <AdminLayout title="My Profile"><div>Loading...</div></AdminLayout>;
    }

    if (!admin) {
        return (
            <AdminLayout title="My Profile">
                <div className="error-message">
                    <h2>Profile not found</h2>
                    <button className="btn-primary" onClick={() => navigate('/admin/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('data:') || path.startsWith('http')) return path;
        return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    return (
        <AdminLayout title="My Profile">
            <ToastContainer position="bottom-right" />
            <div className="profile-page-container">
                <div className="header-actions">
                    <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
                        ← Back to Dashboard
                    </button>

                    {!isEditing ? (
                        <button className="btn-primary" onClick={() => setIsEditing(true)}>
                            ✏️ Edit Profile
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button className="btn-secondary" onClick={() => {
                                setIsEditing(false);
                                setFormData(admin);
                            }}>
                                Cancel
                            </button>
                            <button className="btn-success" onClick={handleSave}>
                                💾 Save Changes
                            </button>
                        </div>
                    )}
                </div>

                <div className="profile-card-main">
                    <div className="profile-header-section">
                        <div className="avatar-wrapper">
                            {/* Initials Avatar or Image */}
                            {formData.photo || admin.photo ? (
                                <img
                                    src={getImageUrl(formData.photo || admin.photo)}
                                    alt={admin.name}
                                    className="profile-avatar-img"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : (
                                <div className="profile-avatar-placeholder">
                                    {admin.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {/* Fallback */}
                            <div className="profile-avatar-placeholder hidden">
                                {admin.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className="profile-info-header">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="edit-input-large"
                                    placeholder="Full Name"
                                />
                            ) : (
                                <h1>{admin.name}</h1>
                            )}
                            <span className="role-badge">Administrator</span>
                        </div>
                    </div>

                    <div className="profile-details-grid">
                        <div className="detail-section">
                            <h3>Contact Information</h3>
                            <div className="detail-row">
                                <label>Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    <p>{admin.email}</p>
                                )}
                            </div>
                            <div className="detail-row">
                                <label>Phone</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    <p>{admin.phone || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-page-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .edit-actions {
                    display: flex;
                    gap: 12px;
                }
                .back-btn {
                    background: none;
                    border: none;
                    color: #6366f1;
                    cursor: pointer;
                    font-weight: 500;
                }
                .btn-primary, .btn-secondary, .btn-success {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    color: white;
                }
                .btn-primary { background: #3b82f6; }
                .btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; }
                .btn-success { background: #10b981; }

                .profile-card-main {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .profile-header-section {
                    padding: 32px;
                    background: linear-gradient(to right, #f8fafc, #fff);
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    gap: 24px;
                    align-items: center;
                }
                .avatar-wrapper {
                    width: 100px;
                    height: 100px;
                    flex-shrink: 0;
                }
                .profile-avatar-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .profile-avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: #e0e7ff;
                    color: #6366f1;
                    font-size: 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 4px solid white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .profile-info-header h1 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: #111827;
                }
                .role-badge {
                    display: inline-block;
                    margin-top: 8px;
                    background: #eff6ff;
                    color: #3b82f6;
                    padding: 4px 12px;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .edit-input-large {
                    font-size: 1.5rem;
                    font-weight: 600;
                    padding: 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    width: 100%;
                }

                .profile-details-grid {
                    padding: 32px;
                }
                .detail-section h3 {
                    margin: 0 0 24px 0;
                    font-size: 1.1rem;
                    color: #374151;
                    border-bottom: 1px solid #f3f4f6;
                    padding-bottom: 12px;
                }
                .detail-row {
                    margin-bottom: 20px;
                }
                .detail-row label {
                    display: block;
                    font-size: 0.85rem;
                    color: #6b7280;
                    margin-bottom: 6px;
                }
                .detail-row p {
                    font-weight: 500;
                    color: #111827;
                    margin: 0;
                    font-size: 1rem;
                }
                .edit-input {
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    width: 100%;
                    font-size: 1rem;
                }
                .hidden { display: none; }
            `}</style>
        </AdminLayout>
    );
};

export default AdminProfile;
