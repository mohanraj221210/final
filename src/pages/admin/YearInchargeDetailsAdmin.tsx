
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { YearIncharge } from '../../types/admin';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

import { GENDERS } from '../../constants/dropdownOptions';

const YearInchargeDetailsAdmin: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [incharge, setIncharge] = useState<YearIncharge | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<YearIncharge & { departmentsString?: string; yearsString?: string; batchesString?: string }>>({});

    const getImageUrl = (photo: string) => {
        if (!photo) return '';
        if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
        const baseUrl = import.meta.env.VITE_CDN_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPhoto = photo.startsWith('/') ? photo : `/${photo}`;
        return `${cleanBase}${cleanPhoto}`;
    };

    useEffect(() => {
        if (id) fetchInchargeDetails(id);
    }, [id]);

    const fetchInchargeDetails = async (inchargeId: string) => {
        try {
            const data = await adminService.getInchargeById(inchargeId);
            setIncharge(data);
            setFormData({
                ...data,
                departmentsString: data.handlingdepartments?.join(', ') || '',
                yearsString: data.handlingyears?.join(', ') || '',
                batchesString: data.handlingbatches?.join(', ') || ''
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch year incharge details");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!incharge) return;
        try {
            const updateData = {
                ...formData,
                handlingdepartments: formData.departmentsString ? formData.departmentsString.split(',').map(s => s.trim()) : [],
                handlingyears: formData.yearsString ? formData.yearsString.split(',').map(s => s.trim()) : [],
                handlingbatches: formData.batchesString ? formData.batchesString.split(',').map(s => s.trim()) : []
            };
            delete (updateData as any).departmentsString;
            delete (updateData as any).yearsString;
            delete (updateData as any).batchesString;

            await adminService.updateIncharge(incharge._id, updateData);
            toast.success("Year Incharge updated successfully");
            setIsEditing(false);
            fetchInchargeDetails(incharge._id);
        } catch (error) {
            toast.error("Failed to update year incharge");
        }
    };

    const handleDelete = async () => {
        if (!incharge) return;
        try {
            await adminService.deleteIncharge(incharge._id);
            toast.success("Year Incharge deleted successfully");
            navigate('/admin/manage-year-incharge');
        } catch (error) {
            toast.error("Failed to delete year incharge");
        }
    };

    const handlePasswordUpdate = async (password: string) => {
        if (!incharge) return;
        try {
            await adminService.updateIncharge(incharge._id, { ...incharge, password });
            toast.success("Password updated successfully");
        } catch (error) {
            toast.error("Failed to update password");
            throw error;
        }
    };

    if (loading) return (
        <AdminLayout title="Year Incharge Details">
            <div className="loading-state">
                <div className="spinner"></div>
                <span>Loading profile...</span>
            </div>
            <style>{`.loading-state { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #6b7280; } .spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </AdminLayout>
    );

    if (!incharge) return <AdminLayout title="Year Incharge Details"><div className="error-state">Year Incharge not found</div></AdminLayout>;

    return (
        <AdminLayout title="Year Incharge Details" activeMenu="year-incharge">
            <ToastContainer position="bottom-right" theme="colored" />

            <div className="admin-page-content">
                <div className="page-header">
                    <button className="back-dashboard-btn" onClick={() => navigate('/admin/manage-year-incharge')}>
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
                                <button className="btn-secondary" onClick={() => { setIsEditing(false); setFormData(incharge as any); }}>Cancel</button>
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
                                style={incharge.photo ? {
                                    backgroundImage: `url(${getImageUrl(incharge.photo)})`,
                                    filter: 'blur(5px)',
                                    transform: 'scale(1.2)',
                                    width: '100%'
                                } : {}}
                            ></div>
                            <div className="profile-content">
                                <div className="avatar-wrapper">
                                    {incharge.photo ? (
                                        <img
                                            src={getImageUrl(incharge.photo)}
                                            alt={incharge.name}
                                            className="profile-avatar"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                        />
                                    ) : (
                                        <div className="profile-avatar-placeholder">{incharge.name.charAt(0)}</div>
                                    )}
                                    <div className="profile-avatar-placeholder hidden">{incharge.name.charAt(0)}</div>
                                </div>
                                <h2 className="profile-name">{incharge.name}</h2>
                                <p className="profile-role">Year Incharge</p>
                                <div className="profile-badges">
                                    <span className="badge badge-role">Role: {incharge.role}</span>
                                    <span className="badge badge-id">ID: {incharge._id.slice(-6).toUpperCase()}</span>
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
                                <Field label="Role" name="role" value={formData.role} isEditing={isEditing} onChange={handleInputChange} />
                                <Field label="Phone Number" name="phone" value={formData.phone} isEditing={isEditing} onChange={handleInputChange} />
                                <Field
                                    label="Gender"
                                    name="gender"
                                    value={formData.gender}
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                    options={GENDERS}
                                />
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="section-title">Responsibilities</h3>
                            {isEditing ? (
                                <div className="fields-grid">
                                    <Field
                                        label="Handling Departments (Comma separated)"
                                        name="departmentsString"
                                        value={formData.departmentsString}
                                        isEditing={isEditing}
                                        onChange={handleInputChange}
                                    />
                                    <Field
                                        label="Handling Years (Comma separated)"
                                        name="yearsString"
                                        value={formData.yearsString}
                                        isEditing={isEditing}
                                        onChange={handleInputChange}
                                    />
                                    <Field
                                        label="Handling Batches (Comma separated)"
                                        name="batchesString"
                                        value={formData.batchesString}
                                        isEditing={isEditing}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            ) : (
                                <div className="tags-container">
                                    {incharge.handlingdepartments?.map((dept, i) => <span key={`d-${i}`} className="tag tag-blue">{dept}</span>)}
                                    {incharge.handlingyears?.map((yr, i) => <span key={`y-${i}`} className="tag tag-purple">Year {yr}</span>)}
                                    {incharge.handlingbatches?.map((bat, i) => <span key={`b-${i}`} className="tag tag-green">{bat}</span>)}
                                    {(!incharge.handlingdepartments?.length && !incharge.handlingyears?.length && !incharge.handlingbatches?.length) && <span className="text-gray-400">No specific responsibilities listed</span>}
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
                    background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
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
                    background: #f3e8ff;
                    color: #9333ea;
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
                .badge-role { background: #f3e8ff; color: #9333ea; border: 1px solid #e9d5ff; }
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
                
                .full-width-field { margin-top: 24px; }
                .tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
                .tag { padding: 6px 12px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; }
                .tag-blue { background: #e0e7ff; color: #4338ca; }
                .tag-purple { background: #f3e8ff; color: #9333ea; }
                .tag-green { background: #dcfce7; color: #166534; }
                
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
                userEmail={incharge.email}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName={incharge.name}
                itemType="Year Incharge"
            />
        </AdminLayout>
    );
};

const Field = ({ label, name, value, isEditing, onChange, options }: any) => (
    <div className="field-group">
        <label className="field-label">{label}</label>
        {isEditing ? (
            options ? (
                <select name={name} value={value || ''} onChange={onChange} className="field-input">
                    <option value="">Select {label}</option>
                    {options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            ) : (
                <input name={name} value={value || ''} onChange={onChange} className="field-input" />
            )
        ) : (
            <div className="field-value">{value || '-'}</div>
        )}
    </div>
);

export default YearInchargeDetailsAdmin;
