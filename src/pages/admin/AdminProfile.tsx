
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChangePasswordModal from '../../components/ChangePasswordModal';

const AdminProfile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 200 * 1024) { // 200KB check
                toast.error("Image size must be less than 200KB");
                return;
            }
            setSelectedFile(file);
            // Create a temporary preview URL
            setFormData((prev: any) => ({
                ...prev,
                photo: URL.createObjectURL(file)
            }));
        }
    };

    const handleSave = async () => {
        setIsEditing(false);
        const loadingToast = toast.loading("Updating profile...");

        try {
            // Create FormData to handle file upload
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);

            if (selectedFile) {
                data.append('photo', selectedFile);
            }

            await adminService.updateProfile(data);

            toast.update(loadingToast, { render: "Profile updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
            await fetchAdminProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.update(loadingToast, { render: "Failed to update profile", type: "error", isLoading: false, autoClose: 3000 });
            setIsEditing(true);
        }
    };

    const handlePasswordUpdate = async (password: string) => {
        try {
            // Sending JSON for password update
            await adminService.updateProfile({ password });
            toast.success("Password updated successfully");
        } catch (error) {
            toast.error("Failed to update password");
            throw error;
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
        if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('blob:')) return path;
        return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    return (
        <AdminLayout title="My Profile">
            <ToastContainer position="bottom-right" />
            <div className="profile-page-container">
                <div className="profile-page-header-actions">
                    <button className="back-dashboard-btn" onClick={() => navigate('/admin/dashboard')}>
                        ← Back to Dashboard
                    </button>

                    {!isEditing ? (
                        <>
                            <button className="btn-secondary" onClick={() => setIsPasswordModalOpen(true)} style={{ marginRight: '10px' }}>
                                🔒 Change Password
                            </button>
                            <button className="btn-primary" onClick={() => setIsEditing(true)}>
                                ✏️ Edit Profile
                            </button>
                        </>
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
                        <div
                            className="profile-header-bg"
                            style={formData.photo || admin.photo ? {
                                backgroundImage: `url(${getImageUrl(formData.photo || admin.photo)})`,
                                filter: 'blur(5px)',
                                transform: 'scale(1.2)',
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 0
                            } : {}}
                        ></div>
                        <div className="avatar-wrapper" style={{ position: 'relative' }}>
                            {isEditing && (
                                <div className="avatar-edit-overlay">
                                    <label htmlFor="photo-upload" className="upload-label">
                                        📷
                                    </label>
                                    <input
                                        id="photo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            )}
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

                        <div className="profile-info-header" style={{ position: 'relative', zIndex: 1 }}>
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
                .profile-page-header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .edit-actions {
                    display: flex;
                    gap: 12px;
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
                .btn-primary, .btn-secondary, .btn-success {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    color: white;
                }
                .btn-primary { background: #3b82f6; }
                .btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; margin-left: 270px; }
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
                    position: relative;
                    overflow: hidden;
                }
                .avatar-wrapper {
                    width: 100px;
                    height: 100px;
                    flex-shrink: 0;
                    margin-bottom: 0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    border-radius: 50%;
                    position: relative;
                    zIndex: 1;
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
                    background: #E6F0FF;
                    color: #00214D;
                    padding: 4px 12px;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    font-weight: 600;
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
                
                .avatar-edit-overlay {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: #3b82f6;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    border: 2px solid white;
                }
                
                .upload-label {
                    cursor: pointer;
                    font-size: 1.2rem;
                    line-height: 1;
                    display: flex; /* Ensure the emoji is centered */
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                }
            `}</style>
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSubmit={handlePasswordUpdate}
                userEmail={admin.email}
            />
        </AdminLayout>
    );
};

export default AdminProfile;
