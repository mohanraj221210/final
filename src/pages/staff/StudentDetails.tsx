import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define Student Interface matching the API response
interface Student {
    _id: string;
    name: string;
    email: string;
    registerNumber: string;
    department: string;
    semester: number;
    year: string;
    phone: string;
    batch: string;
    gender: 'male' | 'female';
    parentnumber: string;
    residencetype: 'hostel' | 'day scholar';
    hostelname?: string;
    hostelroomno?: string;
    busno?: string;
    boardingpoint?: string;
    cgpa?: number;
    arrears?: number;
    isblocked?: boolean;
    photo?: string;
}

const StudentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Student>>({});

    // Fetch Student Details
    useEffect(() => {
        fetchStudentDetails();
    }, [id]);

    const fetchStudentDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            // Using POST with body { id } as per requirements
            const response = await axios.post(`${API_URL}/staff/student`,
                { id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.status === 200 && response.data.student) {
                setStudent(response.data.student);
                setFormData(response.data.student);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch student details");
        } finally {
            setLoading(false);
        }
    };

    // Handle Input Change for Edit Mode
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Update Student
    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/staff/student/update/${id}`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success("Student updated successfully");
            setIsEditing(false);
            fetchStudentDetails(); // Refresh
        } catch (error) {
            toast.error("Failed to update student");
        }
    };

    // Block/Unblock Student
    const handleBlockToggle = async () => {
        if (!student) return;
        try {
            const token = localStorage.getItem('token');
            // Endpoint: PUT /staff/student/block/:id
            // Note: API might expect { isBlocked: boolean } body or just toggle
            // Assuming standard toggle pattern or body base on previous code
            // Actually user request didn't specify Block API body, but previous code used { isBlocked: !val }
            // Stick to previous pattern
            const newStatus = !student.isblocked;
            await axios.post(`${API_URL}/staff/student/update/${id}`,
                { isblocked: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            toast.success(newStatus ? "Student blocked" : "Student unblocked");
            setStudent({ ...student, isblocked: newStatus });
        } catch (error) {
            toast.error("Failed to change block status");
        }
    };

    // Delete Student
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this student? Cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            // DELETE /staff/student/delete with body { id }
            await axios.delete(`${API_URL}/staff/student/delete`, {
                headers: { 'Authorization': `Bearer ${token}` },
                data: { id } // Axios way to send body with DELETE
            });
            toast.success("Student deleted successfully");
            navigate('/staff-registration'); // Back to list
        } catch (error) {
            toast.error("Failed to delete student");
        }
    };

    if (loading) return <div className="loading-screen">Loading...</div>;
    if (!student) return <div className="error-screen">Student not found</div>;

    return (
        <div className="details-page">
            <ToastContainer position="bottom-right" />

            {/* Header */}
            <header className="details-header">
                <button className="back-btn" onClick={() => navigate('/staff-registration')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                    Back to List
                </button>
                <h1>Student Profile</h1>
                <div className="header-actions">
                    {!isEditing ? (
                        <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit Profile</button>
                    ) : (
                        <div className="edit-actions">
                            <button className="btn-cancel" onClick={() => { setIsEditing(false); setFormData(student); }}>Cancel</button>
                            <button className="btn-save" onClick={handleUpdate}>Save Changes</button>
                        </div>
                    )}
                </div>
            </header>

            <div className="details-container">
                {/* Profile Card */}
                <div className="profile-card">
                    <div className="profile-top">
                        <div className="avatar-large">
                            {student.photo ? (
                                <img src={student.photo} alt={student.name} />
                            ) : (
                                <span>{student.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="profile-identity">
                            <h2>{student.name}</h2>
                            <p className="reg-no">{student.registerNumber}</p>
                            <span className={`status-badge ${student.isblocked ? 'blocked' : 'active'}`}>
                                {student.isblocked ? 'Blocked' : 'Active'}
                            </span>
                        </div>
                    </div>

                    <div className="card-actions">
                        <button
                            className={`btn-block ${student.isblocked ? 'unblock' : 'block'}`}
                            onClick={handleBlockToggle}
                        >
                            {student.isblocked ? 'Unblock Account' : 'Block Account'}
                        </button>
                        <button className="btn-delete" onClick={handleDelete}>
                            Delete Student
                        </button>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="info-grid">
                    {/* Academic Info */}
                    <div className="info-section">
                        <h3>Academic Information</h3>
                        <div className="fields-row">
                            <Field label="Department" name="department" value={formData.department} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Batch" name="batch" value={formData.batch} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Year" name="year" value={formData.year} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Semester" name="semester" value={formData.semester} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="CGPA" name="cgpa" value={formData.cgpa} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Arrears" name="arrears" value={formData.arrears} isEditing={isEditing} onChange={handleInputChange} />
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="info-section">
                        <h3>Personal Information</h3>
                        <div className="fields-row">
                            <Field label="Email" name="email" value={formData.email} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Phone" name="phone" value={formData.phone} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Parent Phone" name="parentnumber" value={formData.parentnumber} isEditing={isEditing} onChange={handleInputChange} />
                            <Field label="Gender" name="gender" value={formData.gender} isEditing={isEditing} onChange={handleInputChange} />
                        </div>
                    </div>

                    {/* Residence Info */}
                    <div className="info-section">
                        <h3>Residence ({formData.residencetype})</h3>
                        <div className="fields-row">
                            <Field
                                label="Residence Type"
                                name="residencetype"
                                value={formData.residencetype}
                                isEditing={isEditing}
                                onChange={handleInputChange}
                                options={['hostel', 'day scholar']}
                            />

                            {formData.residencetype === 'hostel' ? (
                                <>
                                    <Field label="Hostel Name" name="hostelname" value={formData.hostelname} isEditing={isEditing} onChange={handleInputChange} />
                                    <Field label="Room No" name="hostelroomno" value={formData.hostelroomno} isEditing={isEditing} onChange={handleInputChange} />
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
                .details-page {
                    min-height: 100vh;
                    background: #f1f5f9;
                    font-family: 'Inter', sans-serif;
                }

                .details-header {
                    background: white;
                    padding: 16px 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .details-header h1 {
                    font-size: 1.25rem;
                    color: #0f172a;
                    margin: 0;
                    font-weight: 600;
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    color: #64748b;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 8px 12px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .back-btn:hover { background: #f8fafc; color: #0f172a; }

                .btn-edit {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: bg 0.2s;
                }
                .btn-edit:hover { background: #1d4ed8; }

                .edit-actions { display: flex; gap: 10px; }
                .btn-cancel {
                    background: white;
                    border: 1px solid #cbd5e1;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                }
                .btn-save {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .details-container {
                    max-width: 1000px;
                    margin: 32px auto;
                    padding: 0 24px;
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 24px;
                }

                /* Profile Card */
                .profile-card {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    text-align: center;
                    height: fit-content;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }

                .avatar-large {
                    width: 120px;
                    height: 120px;
                    background: #e0f2fe;
                    color: #0284c7;
                    border-radius: 50%;
                    font-size: 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    overflow: hidden;
                }
                .avatar-large img { width: 100%; height: 100%; object-fit: cover; }

                .profile-identity h2 { margin: 0 0 4px; color: #0f172a; }
                .reg-no { color: #64748b; margin: 0 0 16px; }

                .status-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .status-badge.active { background: #dcfce7; color: #166534; }
                .status-badge.blocked { background: #fee2e2; color: #991b1b; }

                .card-actions {
                    margin-top: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .btn-block, .btn-delete {
                    width: 100%;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-block.block { background: #fee2e2; color: #991b1b; }
                .btn-block.unblock { background: #dcfce7; color: #166534; }
                
                .btn-delete { background: white; border: 1px solid #fee2e2; color: #ef4444; }
                .btn-delete:hover { background: #fee2e2; }

                /* Info Grid */
                .info-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .info-section {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }

                .info-section h3 {
                    margin: 0 0 20px;
                    font-size: 1.1rem;
                    color: #334155;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 12px;
                }

                .fields-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                }

                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .field-label {
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .field-value {
                    color: #0f172a;
                    font-weight: 500;
                    min-height: 24px;
                }

                .field-input {
                    padding: 8px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 0.95rem;
                    width: 100%;
                }
                .field-input:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
                }

                @media (max-width: 900px) {
                    .details-container { grid-template-columns: 1fr; }
                    .profile-card { display: flex; align-items: center; justify-content: space-between; text-align: left; }
                    .avatar-large { margin: 0 24px 0 0; width: 80px; height: 80px; font-size: 2rem; }
                    .card-actions { margin: 0; }
                }

                @media (max-width: 600px) {
                    .profile-card {
                        flex-direction: column;
                        text-align: center;
                        align-items: center;
                    }
                    .avatar-large {
                        margin: 0 0 16px 0;
                    }
                    .card-actions {
                        margin-top: 24px;
                        width: 100%;
                    }
                    .details-header {
                        flex-direction: column;
                        gap: 16px;
                        padding: 16px;
                    }
                    .header-actions {
                        width: 100%;
                        display: flex;
                        justify-content: center;
                    }
                    .fields-row {
                        grid-template-columns: 1fr;
                    }
                }

                .loading-screen, .error-screen {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    color: #64748b;
                }
            `}</style>
        </div>
    );
};

// Helper Component for Fields
const Field = ({ label, name, value, isEditing, onChange, options }: any) => (
    <div className="field-group">
        <span className="field-label">{label}</span>
        {isEditing ? (
            options ? (
                <select name={name} value={value || ''} onChange={onChange} className="field-input">
                    {options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                </select>
            ) : (
                <input
                    type="text"
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className="field-input"
                />
            )
        ) : (
            <span className="field-value">{value || '-'}</span>
        )}
    </div>
);

export default StudentDetails;
