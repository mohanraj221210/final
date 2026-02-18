import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StaffHeader from '../../components/StaffHeader';
import { DEPARTMENTS, YEARS, BATCHES, GENDERS } from '../../constants/dropdownOptions';

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
            <StaffHeader activeMenu="registration" />

            <div className="page-wrapper">
                {/* Header Actions */}
                <div className="header-actions">
                    <button className="back-btn" onClick={() => navigate('/staff-registration', { state: { activeTab: 'added-students' } })}>
                        ← Back to List
                    </button>

                    <div className="action-buttons-group">
                        {!isEditing ? (
                            <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                ✏️ Edit Profile
                            </button>
                        ) : (
                            <div className="edit-controls">
                                <button className="btn-cancel" onClick={() => { setIsEditing(false); setFormData(student); }}>Cancel</button>
                                <button className="btn-save" onClick={handleUpdate}>Save Changes</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="details-grid">
                    {/* Student Profile Card - Modern Design */}
                    <div className="student-card-modern">
                        <div className="card-header-gradient">
                            <div className="avatar-large">
                                {student.photo ? (
                                    <img
                                        src={student.photo.startsWith('http') || student.photo.startsWith('data:') || student.photo.startsWith('blob:')
                                            ? student.photo
                                            : `${import.meta.env.VITE_CDN_URL}${student.photo}`}
                                        alt={student.name}
                                    />
                                ) : (
                                    student.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleInputChange}
                                        style={{
                                            fontSize: '1.4rem',
                                            fontWeight: 700,
                                            marginBottom: '8px',
                                            color: 'white',
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid rgba(255,255,255,0.3)',
                                            textAlign: 'center',
                                            width: '80%',
                                            outline: 'none'
                                        }}
                                        placeholder="Student Name"
                                    />
                                    <br />
                                    <input
                                        type="text"
                                        name="registerNumber"
                                        value={formData.registerNumber || ''}
                                        onChange={handleInputChange}
                                        style={{
                                            background: 'rgba(255,255,255,0.15)',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.5px',
                                            color: 'white',
                                            border: 'none',
                                            textAlign: 'center',
                                            width: '140px',
                                            marginTop: '4px',
                                            outline: 'none'
                                        }}
                                        placeholder="Reg No"
                                    />
                                </>
                            ) : (
                                <>
                                    <h3>{student.name}</h3>
                                    <span className="badge-reg">{student.registerNumber}</span>
                                </>
                            )}
                            {student.isblocked && <div className="blocked-status">BLOCKED</div>}
                        </div>
                        <div className="card-body-modern">
                            <div className="info-row-modern">
                                <span className="icon">🎓</span>
                                <div>
                                    <label>Department</label>
                                    <p>{student.department} - Year {student.year}</p>
                                </div>
                            </div>
                            <div className="info-row-modern">
                                <span className="icon">🏠</span>
                                <div>
                                    <label>Residence Type</label>
                                    <p style={{ textTransform: 'capitalize' }}>{student.residencetype}</p>
                                </div>
                            </div>

                            {student.residencetype === 'hostel' && (
                                <div className="info-row-modern">
                                    <span className="icon">🏢</span>
                                    <div>
                                        <label>Accommodation</label>
                                        <p>{student.hostelname || 'Hostel'} - {student.hostelroomno || 'No Room'}</p>
                                    </div>
                                </div>
                            )}

                            {student.residencetype !== 'hostel' && (
                                <div className="info-row-modern">
                                    <span className="icon">🚌</span>
                                    <div>
                                        <label>Transport</label>
                                        <p>{student.busno ? `Bus: ${student.busno}` : 'No Bus Info'}</p>
                                        {(student.boardingpoint) && <p style={{ fontSize: '0.9em', color: '#64748b' }}>{student.boardingpoint}</p>}
                                    </div>
                                </div>
                            )}

                            <div className="info-row-modern">
                                <span className="icon">📞</span>
                                <div>
                                    <label>Contact Number</label>
                                    <p>{student.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="card-actions-modern">
                                <button
                                    className={`btn-block-modern ${student.isblocked ? 'unblock' : 'block'}`}
                                    onClick={handleBlockToggle}
                                >
                                    {student.isblocked ? 'Unblock Account' : 'Block Account'}
                                </button>
                                <button className="btn-delete-modern" onClick={handleDelete}>
                                    Delete Record
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="info-grid">
                        {/* Academic Info */}
                        <div className="info-section">
                            <h3>Academic Information</h3>
                            <div className="fields-row">
                                <Field
                                    label="Department"
                                    name="department"
                                    value={formData.department}
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                    options={DEPARTMENTS}
                                />
                                <Field
                                    label="Batch"
                                    name="batch"
                                    value={formData.batch}
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                    options={BATCHES}
                                />
                                <Field
                                    label="Year"
                                    name="year"
                                    value={formData.year}
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                    options={YEARS}
                                />
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
            </div>

            <style>{`
                .details-page {
                    min-height: 100vh;
                    background: #f8fafc;
                    font-family: 'Inter', sans-serif;
                }

                .page-wrapper {
                    max-width: 1100px;
                    margin: 32px auto;
                    padding: 0 24px;
                }

                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 32px;
                }

                /* Back Button */
                .back-btn {
                    background: white;
                    border: 1px solid rgba(0,0,0,0.1);
                    color: #2563eb;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 6px 16px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .back-btn:hover { 
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                    transform: translateY(-1px);
                    color: #1e3a8a;
                }

                /* Action Buttons */
                .btn-edit {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: bg 0.2s;
                    box-shadow: 0 2px 4px rgba(37,99,235,0.2);
                }
                .btn-edit:hover { background: #1d4ed8; }

                .edit-controls { display: flex; gap: 10px; }
                .btn-cancel {
                    background: white;
                    border: 1px solid #cbd5e1;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    color: #64748b;
                }
                .btn-cancel:hover { background: #f1f5f9; }

                .btn-save {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
                }
                .btn-save:hover { background: #059669; }

                /* Modern Card Styles */
                .student-card-modern {
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                    height: fit-content;
                    position: sticky;
                    top: 100px; /* Sticky scroll for card */
                }

                .card-header-gradient {
                    background: linear-gradient(135deg, #1e3a8a, #2563eb);
                    padding: 32px 24px;
                    text-align: center;
                    color: white;
                }

                .card-header-gradient h3 {
                    font-size: 1.4rem;
                    margin-bottom: 8px;
                    font-weight: 700;
                    color: white;
                }

                .badge-reg {
                    background: rgba(255,255,255,0.15);
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                }

                .blocked-status {
                    background: #ef4444;
                    color: white;
                    display: inline-block;
                    margin-top: 12px;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .avatar-large {
                    width: 90px;
                    height: 90px;
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(10px);
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0 auto 16px;
                    color: white;
                    overflow: hidden;
                }
                
                .avatar-large img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .card-body-modern {
                    padding: 24px;
                }

                .info-row-modern {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                    align-items: flex-start;
                }

                .info-row-modern:last-child {
                    margin-bottom: 0;
                }

                .info-row-modern .icon {
                    font-size: 1.2rem;
                    background: #f1f5f9;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                }

                .info-row-modern label {
                    display: block;
                    font-size: 0.8rem;
                    color: #64748b;
                    margin-bottom: 2px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-row-modern p {
                    font-size: 1rem;
                    color: #1e293b;
                    font-weight: 600;
                    margin: 0;
                }

                .card-actions-modern {
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .btn-block-modern {
                    width: 100%;
                    padding: 12px;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-block-modern.block { background: #fee2e2; color: #991b1b; }
                .btn-block-modern.unblock { background: #dcfce7; color: #166534; }
                
                .btn-delete-modern {
                    width: 100%;
                    padding: 12px;
                    background: white;
                    border: 2px solid #fee2e2;
                    color: #ef4444;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-delete-modern:hover {
                    background: #fee2e2;
                }

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
                    .details-grid { grid-template-columns: 1fr; }
                    .student-card-modern { position: relative; top: 0; margin-bottom: 20px; width: 100%; max-width: 450px; margin-left: auto; margin-right: auto; }
                    .page-wrapper { padding: 0 16px; }
                }

                @media (max-width: 768px) {
                    .header-actions {
                        flex-direction: column;
                        gap: 16px;
                        padding: 0; /* Already inside page-wrapper with padding */
                    }
                    .action-buttons-group {
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
