
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Student } from '../../types/admin';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentDetailsAdmin: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Student>>({});

    useEffect(() => {
        if (id) fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        try {
            if (!id) return;
            const data = await adminService.getStudentById(id);
            setStudent(data);
            setFormData(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch student details");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!student) return;
        try {
            await adminService.updateStudent(student._id, formData);
            toast.success("Student updated successfully");
            setIsEditing(false);
            fetchStudent();
        } catch (error) {
            toast.error("Failed to update student");
        }
    };

    const handleDelete = async () => {
        if (!student || !window.confirm("Are you sure you want to delete this student?")) return;
        try {
            await adminService.deleteStudent(student._id);
            toast.success("Student deleted successfully");
            navigate(-1); // Go back
        } catch (error) {
            toast.error("Failed to delete student");
        }
    };

    if (loading) return <AdminLayout title="Student Details"><div>Loading...</div></AdminLayout>;
    if (!student) return <AdminLayout title="Student Details"><div>Student not found</div></AdminLayout>;

    return (
        <AdminLayout title="Student Details">
            <ToastContainer position="bottom-right" />

            <div className="details-header-actions">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                <div className="right-actions">
                    {!isEditing ? (
                        <div className="action-group">
                            <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            <button className="btn-danger" onClick={handleDelete}>Delete Student</button>
                        </div>
                    ) : (
                        <div className="action-group">
                            <button className="btn-secondary" onClick={() => { setIsEditing(false); setFormData(student); }}>Cancel</button>
                            <button className="btn-success" onClick={handleUpdate}>Save Changes</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="details-container">
                <div className="profile-card">
                    <div className="avatar-section">
                        {student.photo ? (
                            <img src={student.photo} alt={student.name} className="profile-img" />
                        ) : (
                            <div className="profile-placeholder">{student.name.charAt(0)}</div>
                        )}
                        <h3>{student.name}</h3>
                        <p className="role">{student.registerNumber}</p>
                        <p className="dept">{student.department} - Year {student.year}</p>
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-section">
                        <h4>Personal Information</h4>
                        <div className="fields-grid">
                            <Field label="Name" name="name" value={formData.name} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Email" name="email" value={formData.email} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Phone" name="phone" value={formData.phone} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Gender" name="gender" value={formData.gender} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Parent Phone" name="parentnumber" value={formData.parentnumber} isEditing={isEditing} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>Academic Information</h4>
                        <div className="fields-grid">
                            <Field label="Register No" name="registerNumber" value={formData.registerNumber} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Department" name="department" value={formData.department} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Batch" name="batch" value={formData.batch} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Year" name="year" value={formData.year} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Semester" name="semester" value={formData.semester} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="CGPA" name="cgpa" value={formData.cgpa} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Arrears" name="arrears" value={formData.arrears} isEditing={isEditing} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>Residence ({formData.residencetype})</h4>
                        <div className="fields-grid">
                            <Field label="Type" name="residencetype" value={formData.residencetype} isEditing={isEditing} onChange={handleInputChange} />
                            {formData.residencetype === 'hostel' ? (
                                <>
                                    <Field label="Hostel" name="hostelname" value={formData.hostelname} isEditing={isEditing} onChange={handleInputChange} />
                                    <Field label="Room" name="hostelroomno" value={formData.hostelroomno} isEditing={isEditing} onChange={handleInputChange} />
                                </>
                            ) : (
                                <>
                                    <Field label="Boarding Point" name="boardingpoint" value={formData.boardingpoint} isEditing={isEditing} onChange={handleInputChange} />
                                    <Field label="Bus No" name="busno" value={formData.busno} isEditing={isEditing} onChange={handleInputChange} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                 /* Reusing/Standardizing styles */
                .details-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .right-actions { display: flex; gap: 12px; align-items: center; }
                .action-group { display: flex; gap: 8px; }
                .back-btn { background: none; border: none; color: #6366f1; cursor: pointer; font-weight: 500; }
                .btn-primary, .btn-secondary, .btn-danger, .btn-success { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; color: white; }
                .btn-primary { background: #3b82f6; }
                .btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; }
                .btn-danger { background: #ef4444; }
                .btn-success { background: #10b981; }
                .details-container { display: grid; grid-template-columns: 300px 1fr; gap: 24px; }
                .profile-card { background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb; text-align: center; height: fit-content; }
                .profile-img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 16px; }
                .profile-placeholder { width: 120px; height: 120px; border-radius: 50%; background: #e0e7ff; color: #6366f1; font-size: 3rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
                .info-section { background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 24px; }
                .info-section h4 { margin: 0 0 20px; font-size: 1.1rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 12px; }
                .fields-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
                .field-group { margin-bottom: 0; }
                .field-label { display: block; font-size: 0.85rem; color: #6b7280; margin-bottom: 4px; }
                .field-value { font-weight: 500; color: #111827; }
                .field-input { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; }

                @media (max-width: 900px) { .details-container { grid-template-columns: 1fr; } }
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

export default StudentDetailsAdmin;
