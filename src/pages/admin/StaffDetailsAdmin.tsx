
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Staff } from '../../types/admin';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

import { DEPARTMENTS, DESIGNATIONS } from '../../constants/dropdownOptions';

const StaffDetailsAdmin: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [staff, setStaff] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Staff>>({});

    const [newSubject, setNewSubject] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [newAchievement, setNewAchievement] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const getImageUrl = (photo: string) => {
        if (!photo) return '';
        if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
        const baseUrl = import.meta.env.VITE_CDN_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPhoto = photo.startsWith('/') ? photo : `/${photo}`;
        return `${cleanBase}${cleanPhoto}`;
    };

    useEffect(() => {
        if (id) fetchStaffDetails(id);
    }, [id]);

    const fetchStaffDetails = async (staffId: string) => {
        try {
            const data = await adminService.getStaffById(staffId);
            setStaff(data);
            setFormData({
                ...data,
                subjects: data.subjects || [],
                skills: data.skills || [],
                achievements: data.achievements || []
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch staff details");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayAdd = (field: keyof Staff, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
        if (!value.trim()) return;
        setFormData((prev: any) => ({
            ...prev,
            [field]: [...(prev[field] || []), value]
        }));
        setter('');
    };

    const handleArrayRemove = (field: keyof Staff, index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: prev[field].filter((_: any, i: number) => i !== index)
        }));
    };

    const handleUpdate = async () => {
        if (!staff) return;
        try {
            await adminService.updateStaff(staff._id, formData);
            toast.success("Staff updated successfully");
            setIsEditing(false);
            fetchStaffDetails(staff._id);
        } catch (error) {
            toast.error("Failed to update staff");
        }
    };



    const handleDelete = async () => {
        if (!staff) return;
        try {
            await adminService.deleteStaff(staff._id);
            toast.success("Staff deleted successfully");
            navigate('/admin/manage-staff');
        } catch (error) {
            toast.error("Failed to delete staff");
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleChangePassword = () => {
        setIsPasswordModalOpen(true);
    };

    const handlePasswordUpdate = async (password: string) => {
        if (!staff) return;
        try {
            await adminService.resetStaffPassword(staff._id, password);
            toast.success("Password updated successfully");
        } catch (error) {
            toast.error("Failed to update password");
            throw error;
        }
    };

    const handleViewStudents = () => {
        navigate(`/admin/staff/${id}/students`);
    };

    if (loading) return (
        <AdminLayout title="Staff Details">
            <div className="loading-state">
                <div className="spinner"></div>
                <span>Loading staff profile...</span>
            </div>
            <style>{`.loading-state { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #6b7280; } .spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </AdminLayout>
    );

    if (!staff) return <AdminLayout title="Staff Details"><div className="error-state">Staff not found</div></AdminLayout>;

    return (
        <AdminLayout title="Staff Details" activeMenu="staff">
            <ToastContainer position="bottom-right" theme="colored" />

            <div className="admin-page-content">
                <div className="page-header">
                    <button className="back-dashboard-btn" onClick={() => navigate('/admin/manage-staff')}>
                        ← Back
                    </button>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={handleViewStudents}>
                            <span className="icon">👨‍🎓</span> View Students
                        </button>
                        {!isEditing ? (
                            <>
                                <button className="btn-secondary" onClick={handleChangePassword}>Change Password</button>
                                <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                                <button className="btn-danger" onClick={() => setIsDeleteModalOpen(true)}>Delete Staff</button>
                            </>
                        ) : (
                            <>
                                <button className="btn-secondary" onClick={() => { setIsEditing(false); setFormData(staff); }}>Cancel</button>
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
                                style={staff.photo ? {
                                    backgroundImage: `url(${getImageUrl(staff.photo)})`,
                                    filter: 'blur(5px)',
                                    transform: 'scale(1.2)',
                                    width: '100%'
                                } : {}}
                            ></div>
                            <div className="profile-content">
                                <div className="avatar-wrapper">
                                    {staff.photo ? (
                                        <img
                                            src={getImageUrl(staff.photo)}
                                            alt={staff.name}
                                            className="profile-avatar"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                        />
                                    ) : (
                                        <div className="profile-avatar-placeholder">{staff.name.charAt(0)}</div>
                                    )}
                                    {/* Fallback hidden avatar */}
                                    <div className="profile-avatar-placeholder hidden">{staff.name.charAt(0)}</div>
                                </div>
                                <h2 className="profile-name">{staff.name}</h2>
                                <p className="profile-role">{staff.designation}</p>
                                {/* <p className="profile-department" style={{ margin: '-12px 0 16px', fontSize: '0.9rem', color: '#6b7280', textAlign: 'center', fontWeight: 500 }}>
                                    {staff.department}
                                </p> */}
                                {/* <div className="profile-badges">
                                    <span className="badge badge-id">ID: {staff._id.slice(-6).toUpperCase()}</span>
                                </div> */}
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
                                <Field label="Phone Number" name="contactNumber" value={formData.contactNumber} isEditing={isEditing} onChange={handleInputChange} />
                                <Field label="Qualification" name="qualification" value={formData.qualification} isEditing={isEditing} onChange={handleInputChange} />
                                <Field label="Experience (Years)" name="experience" value={formData.experience} isEditing={isEditing} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3 className="section-title">Academic Details</h3>
                            <div className="fields-grid">
                                <Field
                                    label="Department"
                                    name="department"
                                    value={formData.department}
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                    options={DEPARTMENTS}
                                />
                                <Field
                                    label="Designation"
                                    name="designation"
                                    value={formData.designation}
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                    options={DESIGNATIONS}
                                />
                            </div>



                            <div className="full-width-field">
                                <label className="field-label">Subjects Handled</label>
                                <div className="tags-container">
                                    {(isEditing ? formData.subjects : staff.subjects)?.map((sub, idx) => (
                                        <span key={idx} className="tag tag-blue">
                                            {sub}
                                            {isEditing && (
                                                <button onClick={() => handleArrayRemove('subjects', idx)} className="tag-remove-btn">×</button>
                                            )}
                                        </span>
                                    ))}
                                    {(!staff.subjects?.length && !isEditing) && <span className="text-gray-400">No subjects assigned</span>}
                                </div>
                                {isEditing && (
                                    <div className="add-item-row">
                                        <input
                                            type="text"
                                            value={newSubject}
                                            onChange={(e) => setNewSubject(e.target.value)}
                                            placeholder="Add new subject"
                                            className="field-input"
                                            style={{ width: 'auto', flex: 1 }}
                                        />
                                        <button onClick={() => handleArrayAdd('subjects', newSubject, setNewSubject)} className="btn-secondary small-btn">Add</button>
                                    </div>
                                )}
                            </div>

                            <div className="full-width-field">
                                <label className="field-label">Skills & Expertise</label>
                                <div className="tags-container">
                                    {(isEditing ? formData.skills : staff.skills)?.map((skill, idx) => (
                                        <span key={idx} className="tag tag-green">
                                            {skill}
                                            {isEditing && (
                                                <button onClick={() => handleArrayRemove('skills', idx)} className="tag-remove-btn">×</button>
                                            )}
                                        </span>
                                    ))}
                                    {(!staff.skills?.length && !isEditing) && <span className="text-gray-400">No skills listed</span>}
                                </div>
                                {isEditing && (
                                    <div className="add-item-row">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="Add skill"
                                            className="field-input"
                                            style={{ width: 'auto', flex: 1 }}
                                        />
                                        <button onClick={() => handleArrayAdd('skills', newSkill, setNewSkill)} className="btn-secondary small-btn">Add</button>
                                    </div>
                                )}
                            </div>

                            <div className="full-width-field">
                                <label className="field-label">Achievements</label>
                                <div className="list-container">
                                    {(isEditing ? formData.achievements : staff.achievements)?.map((achievement, idx) => (
                                        <div key={idx} className="list-item">
                                            <span className="bullet">•</span>
                                            <span className="list-text">{achievement}</span>
                                            {isEditing && (
                                                <button onClick={() => handleArrayRemove('achievements', idx)} className="list-remove-btn">Remove</button>
                                            )}
                                        </div>
                                    ))}
                                    {(!staff.achievements?.length && !isEditing) && <span className="text-gray-400">No achievements listed</span>}
                                </div>
                                {isEditing && (
                                    <div className="add-item-row">
                                        <input
                                            type="text"
                                            value={newAchievement}
                                            onChange={(e) => setNewAchievement(e.target.value)}
                                            placeholder="Add achievement"
                                            className="field-input"
                                            style={{ width: 'auto', flex: 1 }}
                                        />
                                        <button onClick={() => handleArrayAdd('achievements', newAchievement, setNewAchievement)} className="btn-secondary small-btn">Add</button>
                                    </div>
                                )}
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
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
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

                .avatar-wrapper {
                    padding: 4px;
                    background: white;
                    border-radius: 50%;
                    margin-bottom: 16px;
                }

                .profile-avatar, .profile-avatar-placeholder {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .profile-avatar-placeholder {
                    background: #e0e7ff;
                    color: #6366f1;
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
                .badge-department { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }
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
                .tag-green { background: #dcfce7; color: #166534; }
                
                .tag-remove-btn {
                    margin-left: 6px;
                    background: none;
                    border: none;
                    color: currentColor;
                    cursor: pointer;
                    font-weight: bold;
                    opacity: 0.6;
                    padding: 0 2px;
                }
                .tag-remove-btn:hover { opacity: 1; }

                .add-item-row { display: flex; gap: 8px; margin-top: 8px; }
                .small-btn { padding: 8px 16px; font-size: 0.9rem; white-space: nowrap; }

                .list-container { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
                .list-item { display: flex; align-items: flex-start; gap: 8px; }
                .bullet { color: #6b7280; }
                .list-text { flex: 1; color: #111827; }
                .list-remove-btn { 
                    font-size: 0.8rem; color: #ef4444; background: none; border: none; cursor: pointer; text-decoration: underline; 
                }

                .hidden { display: none; }

                @media (max-width: 1024px) {
                    .profile-layout { grid-template-columns: 1fr; }
                    .profile-card { max-width: 400px; margin: 0 auto; width: 100%; }
                }
            `}</style>
            <style>{`
                .admin-page-content {
                    font-family: 'Inter', system-ui, sans-serif;
                    padding: 2px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
// ... (rest of styles) ...
            `}</style>
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSubmit={handlePasswordUpdate}
                userEmail={staff.email}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName={staff.name}
                itemType="Staff Member"
            />

            <style>{`
                /* Add any additional styles if needed, but DeleteConfirmationModal has its own styles */
            `}</style>
        </AdminLayout >
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

export default StaffDetailsAdmin;
