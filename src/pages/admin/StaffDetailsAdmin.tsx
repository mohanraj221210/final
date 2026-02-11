
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Staff } from '../../types/admin';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StaffDetailsAdmin: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [staff, setStaff] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Staff>>({});

    useEffect(() => {
        if (id) fetchStaffDetails(id);
    }, [id]);

    const fetchStaffDetails = async (staffId: string) => {
        try {
            const data = await adminService.getStaffById(staffId);
            setStaff(data);
            setFormData(data);
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
        if (!staff || !window.confirm("Are you sure you want to delete this staff member?")) return;
        try {
            await adminService.deleteStaff(staff._id);
            toast.success("Staff deleted successfully");
            navigate('/admin/manage-staff');
        } catch (error) {
            toast.error("Failed to delete staff");
        }
    };

    const handleChangePassword = () => {
        // Implement change password logic or modal
        toast.info("Change Password feature to be implemented");
    };

    const handleViewStudents = () => {
        navigate(`/admin/staff/${id}/students`);
    };

    if (loading) return <AdminLayout title="Staff Details"><div>Loading...</div></AdminLayout>;
    if (!staff) return <AdminLayout title="Staff Details"><div>Staff not found</div></AdminLayout>;

    return (
        <AdminLayout title="Staff Details">
            <ToastContainer position="bottom-right" />

            <div className="details-header-actions">
                <button className="back-btn" onClick={() => navigate('/admin/manage-staff')}>← Back to List</button>
                <div className="right-actions">
                    <button className="btn-secondary" onClick={handleViewStudents}>👨‍🎓 Student List</button>
                    {!isEditing ? (
                        <div className="action-group">
                            <button className="btn-warning" onClick={handleChangePassword}>Change Password</button>
                            <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            <button className="btn-danger" onClick={handleDelete}>Delete</button>
                        </div>
                    ) : (
                        <div className="action-group">
                            <button className="btn-secondary" onClick={() => { setIsEditing(false); setFormData(staff); }}>Cancel</button>
                            <button className="btn-success" onClick={handleUpdate}>Save Changes</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="details-container">
                <div className="profile-card">
                    <div className="avatar-section">
                        {staff.photo ? (
                            <img
                                src={staff.photo.startsWith('http') || staff.photo.startsWith('data:')
                                    ? staff.photo
                                    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`.replace('/api', '') + (staff.photo.startsWith('/') ? '' : '/') + staff.photo}
                                alt={staff.name}
                                className="profile-img"
                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                            />
                        ) : (
                            <div className="profile-placeholder">{staff.name.charAt(0)}</div>
                        )}
                        <h3>{staff.name}</h3>
                        <p className="role">{staff.designation}</p>
                        <p className="dept">{staff.department}</p>
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-section">
                        <h4>Personal Information</h4>
                        <div className="fields-grid">
                            <Field label="Name" name="name" value={formData.name} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Email" name="email" value={formData.email} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Phone" name="contactNumber" value={formData.contactNumber} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Qualification" name="qualification" value={formData.qualification} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Experience" name="experience" value={formData.experience} isEditing={isEditing} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>Academic Information</h4>
                        <div className="fields-grid">
                            <Field label="Department" name="department" value={formData.department} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Designation" name="designation" value={formData.designation} isEditing={isEditing} onChange={handleInputChange} />
                        </div>
                        {/* Subjects and Skills could be list inputs, simplfied here as text or read-only for now */}
                        <div className="mt-4">
                            <label className="field-label">Subjects</label>
                            <p className="field-value">{staff.subjects?.join(', ') || '-'}</p>
                        </div>
                        <div className="mt-4">
                            <label className="field-label">Skills</label>
                            <p className="field-value">{staff.skills?.join(', ') || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .details-header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .right-actions {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .action-group {
                    display: flex;
                    gap: 8px;
                }

                .back-btn {
                    background: none;
                    border: none;
                    color: #6366f1;
                    cursor: pointer;
                    font-weight: 500;
                }

                .btn-primary, .btn-secondary, .btn-danger, .btn-warning, .btn-success {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 0.9rem;
                    color: white;
                }

                .btn-primary { background: #3b82f6; }
                .btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; }
                .btn-danger { background: #ef4444; }
                .btn-warning { background: #f59e0b; }
                .btn-success { background: #10b981; }

                .details-container {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 24px;
                }

                .profile-card {
                    background: white;
                    padding: 32px;
                    border-radius: 16px;
                    border: 1px solid #e5e7eb;
                    text-align: center;
                    height: fit-content;
                }

                .profile-img {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-bottom: 16px;
                }

                .profile-placeholder {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: #e0e7ff;
                    color: #6366f1;
                    font-size: 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                }

                .role { color: #6b7280; margin: 4px 0; }
                .dept { color: #3b82f6; font-weight: 500; margin: 0; }

                .info-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .info-section {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    border: 1px solid #e5e7eb;
                }

                .info-section h4 {
                    margin: 0 0 20px;
                    font-size: 1.1rem;
                    border-bottom: 1px solid #f3f4f6;
                    padding-bottom: 12px;
                }

                .fields-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                }

                .field-group { margin-bottom: 0; }
                .field-label { display: block; font-size: 0.85rem; color: #6b7280; margin-bottom: 4px; }
                .field-value { font-weight: 500; color: #111827; }
                .field-input { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; }

                @media (max-width: 900px) {
                    .details-container { grid-template-columns: 1fr; }
                }
            `}</style>
        </AdminLayout>
    );
};

const Field = ({ label, name, value, isEditing, onChange }: any) => (
    <div className="field-group">
        <label className="field-label">{label}</label>
        {isEditing ? (
            <input name={name} value={value || ''} onChange={onChange} className="field-input" />
        ) : (
            <p className="field-value">{value || '-'}</p>
        )}
    </div>
);

export default StaffDetailsAdmin;
