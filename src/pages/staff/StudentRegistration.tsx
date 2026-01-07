import React, { useState, useEffect } from 'react';
import StaffHeader from '../../components/StaffHeader';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

interface Student {
    _id: string;
    name: string;
    email: string;
    registerNo?: string;
    department?: string;
    year?: string;
    residentType?: string;
    isBlocked?: boolean;
    // Add other fields as necessary from backend response
    boardingPoint?: string;
    busNo?: string;
    floor?: string;
    roomNo?: string;
    // API returns 'staffid' which can be a string or an object (populated)
    staffid?: string | { _id: string; name: string; email: string };
    createdByStaffID?: string; // Keeping for compatibility if needed
}

const StudentRegistration: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'bulk' | 'single' | 'added-students'>('bulk');
    const [loading, setLoading] = useState(false);
    const [currentStaffID, setCurrentStaffID] = useState<string | null>(null);

    // Bulk Registration State
    const [file, setFile] = useState<File | null>(null);

    // Single Registration State
    const [singleForm, setSingleForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    // Added Students State
    const [studentsList, setStudentsList] = useState<Student[]>([]);
    const [loadingAction, setLoadingAction] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;

    // Fetch Current Staff ID
    useEffect(() => {
        const fetchCurrentStaff = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/staff/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 200 && response.data.staff) {
                    setCurrentStaffID(response.data.staff._id);
                    console.log('Current Staff ID:', response.data.staff._id);
                }
            } catch (error) {
                console.error("Failed to fetch staff profile:", error);
            }
        };
        fetchCurrentStaff();
    }, []);

    // Fetch Students List
    useEffect(() => {
        if (activeTab === 'added-students') {
            fetchStudents();
        }
    }, [activeTab, currentStaffID]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Assuming API filters by staff ID from token
            const response = await axios.get(`${API_URL}/staff/students/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 200) {
                // Handle the nested { students: [] } structure
                const allStudents = response.data.students || [];
                console.log('Fetched All Students:', allStudents);

                // Strict Client-Side Filter
                const filteredList = allStudents.filter((student: Student) => {
                    // Handle both populated object and string ID for staffid
                    const studentStaffID = typeof student.staffid === 'object' && student.staffid !== null
                        ? student.staffid._id
                        : student.staffid;

                    // Also check obsolete createdByStaffID just in case
                    const finalStaffID = studentStaffID || student.createdByStaffID;

                    return finalStaffID === currentStaffID;
                });
                console.log('Filtered Students:', filteredList);
                setStudentsList(filteredList);

                if (allStudents.length > 0 && filteredList.length === 0) {
                    console.warn("All students were filtered out!");
                    console.warn(`Current Staff ID: ${currentStaffID}`);
                    console.warn("First Student Staff ID:", allStudents[0]?.staffid);
                }
            }
        } catch (error) {
            console.error("Failed to fetch students", error);
            // toast.error("Failed to fetch student list"); 
            // Suppress error on initial load or if list is empty/404
        } finally {
            setLoading(false);
        }
    };

    // Handle File Change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const fileType = selectedFile.name.split('.').pop()?.toLowerCase();

            if (fileType === 'xls' || fileType === 'xlsx') {
                setFile(selectedFile);
            } else {
                toast.error("Please upload only .xls or .xlsx files");
                e.target.value = ''; // Reset input
            }
        }
    };

    // Handle Bulk Submit
    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (currentStaffID) {
            formData.append('createdByStaffID', currentStaffID);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/staff/student/signup/bulk`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                toast.success("Users registered successfully");
                setFile(null);
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
        } catch (error: any) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error("Missing required fields in Excel");
                        break;
                    case 401:
                        toast.error("Unauthorized access");
                        break;
                    case 402:
                        toast.error("All users already exist");
                        break;
                    default:
                        toast.error("Failed to upload file");
                }
            } else {
                toast.error("Network error");
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle Single Submit
    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!singleForm.name || !singleForm.email || !singleForm.password) {
            toast.error("All fields are required");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...singleForm,
                createdByStaffID: currentStaffID
            };
            const response = await axios.post(`${API_URL}/staff/student/signup`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                toast.success("User registered successfully");
                setSingleForm({ name: '', email: '', password: '' });
            }
        } catch (error: any) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error("All fields are required");
                        break;
                    case 401:
                        toast.error("Unauthorized access");
                        break;
                    case 409:
                        toast.error("User already exists");
                        break;
                    default:
                        toast.error("Failed to register student");
                }
            } else {
                toast.error("Network error");
            }
        } finally {
            setLoading(false);
        }
    };

    // Student Management Actions
    // Student Management Actions (Moved to StudentDetails page)


    return (
        <div className="registration-page">
            <StaffHeader activeMenu="registration" />
            <ToastContainer position="bottom-right" />

            <main className="main-content">
                <div className="page-header">
                    <h1>Student Registration</h1>
                    <p>Onboard new students individually or in bulk</p>
                </div>

                <div className="registration-card">
                    <div className="tabs">
                        <button
                            className={`tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bulk')}
                        >
                            <span className="icon">📂</span> Bulk Registration
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
                            onClick={() => setActiveTab('single')}
                        >
                            <span className="icon">👤</span> Individual Registration
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'added-students' ? 'active' : ''}`}
                            onClick={() => setActiveTab('added-students')}
                        >
                            <span className="icon">🎓</span> Added Students
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'bulk' && (
                            <form onSubmit={handleBulkSubmit} className="bulk-form animate-fade">
                                <div className="upload-zone">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        accept=".xls,.xlsx"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                    />
                                    <label htmlFor="file-upload" className={`upload-label ${file ? 'has-file' : ''}`}>
                                        <div className="upload-icon">
                                            {file ? '📄' : '☁️'}
                                        </div>
                                        <h3>{file ? file.name : 'Click to Upload Excel File'}</h3>
                                        <p>{file ? 'Ready to upload' : 'Supports .xls and .xlsx'}</p>
                                    </label>
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading || !file}>
                                    {loading ? 'Uploading...' : 'Upload & Register'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'single' && (
                            <form onSubmit={handleSingleSubmit} className="single-form animate-fade">
                                <div className="form-group">
                                    <label>Student Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter full name"
                                        value={singleForm.name}
                                        onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="Enter email address"
                                        value={singleForm.email}
                                        onChange={(e) => setSingleForm({ ...singleForm, email: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Create password"
                                        value={singleForm.password}
                                        onChange={(e) => setSingleForm({ ...singleForm, password: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Registering...' : 'Register Student'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'added-students' && (
                            <div className="added-students-view animate-fade">
                                {loading && studentsList.length === 0 ? (
                                    <div className="loading-state">Loading students...</div>
                                ) : studentsList.length === 0 ? (
                                    <div className="empty-state">No students added yet.</div>
                                ) : (
                                    <div className="students-list">
                                        {studentsList.map(student => (
                                            <div
                                                key={student._id}
                                                className="student-item"
                                                onClick={() => navigate(`/staff/student-details/${student._id}`)}
                                            >
                                                <div className="student-avatar">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="student-info">
                                                    <h4>{student.name} {student.isBlocked && <span className="tag-blocked">Blocked</span>}</h4>
                                                    <p>{student.email}</p>
                                                    <div className="student-meta">
                                                        {student.registerNo && <span>{student.registerNo} • </span>}
                                                        {student.department && <span>{student.department} • </span>}
                                                        {student.residentType && <span className="tag-resident">{student.residentType}</span>}
                                                    </div>
                                                </div>
                                                <button className="btn-view" onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/staff/student-details/${student._id}`);
                                                }}>
                                                    View Details
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>



            <style>{`
                .registration-page {
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .main-content {
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 0 24px;
                }

                .page-header {
                    margin-bottom: 32px;
                    text-align: center;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    color: #1e293b;
                    margin-bottom: 8px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #0f172a, #334155);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .page-header p {
                    color: #64748b;
                    font-size: 1.1rem;
                }

                .registration-card {
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.8);
                }

                .tabs {
                    display: flex;
                    border-bottom: 1px solid #e2e8f0;
                    background: #f8fafc;
                }

                .tab-btn {
                    flex: 1;
                    padding: 20px;
                    border: none;
                    background: transparent;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    white-space: nowrap;
                }

                .tab-btn:hover {
                    color: #0047AB;
                    background: rgba(0, 71, 171, 0.05);
                }

                .tab-btn.active {
                    color: #0047AB;
                    background: white;
                    box-shadow: 0 -4px 0 #0047AB inset;
                }

                .tab-content {
                    padding: 40px;
                }

                /* Bulk Upload Styles */
                .upload-zone {
                    margin-bottom: 32px;
                }

                .upload-zone input[type="file"] {
                    display: none;
                }

                .upload-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 48px;
                    border: 2px dashed #cbd5e1;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: #f8fafc;
                }

                .upload-label:hover {
                    border-color: #0047AB;
                    background: #eff6ff;
                }

                .upload-label.has-file {
                    border-color: #10b981;
                    background: #f0fdf4;
                }

                .upload-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .upload-label h3 {
                    font-size: 1.2rem;
                    color: #1e293b;
                    margin-bottom: 8px;
                    font-weight: 600;
                }

                .upload-label p {
                    color: #94a3b8;
                    font-size: 0.95rem;
                }

                /* Single Form Styles */
                .form-group {
                    margin-bottom: 24px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #475569;
                    font-weight: 500;
                    font-size: 0.95rem;
                }

                .form-group input {
                    width: 100%;
                    padding: 14px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: all 0.3s;
                    background: #f8fafc;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #0047AB;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(0, 71, 171, 0.1);
                }

                .btn-primary {
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 20px -5px rgba(0, 71, 171, 0.3);
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 25px -5px rgba(0, 71, 171, 0.4);
                }

                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .animate-fade {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Added Students List Styles */
                .students-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .student-item {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .student-item:hover {
                    border-color: #0047AB;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transform: translateX(4px);
                }

                .student-avatar {
                    width: 48px;
                    height: 48px;
                    background: #e0f2fe;
                    color: #0369a1;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin-right: 16px;
                }

                .student-info {
                    flex: 1;
                }

                .student-info h4 {
                    font-size: 1.05rem;
                    color: #0f172a;
                    margin: 0 0 4px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .student-info p {
                    color: #64748b;
                    font-size: 0.9rem;
                    margin: 0 0 4px;
                }
                
                .student-meta {
                    font-size: 0.85rem;
                    color: #94a3b8;
                }

                .tag-resident {
                    background: #f1f5f9;
                    color: #475569;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                .tag-blocked {
                    background: #fef2f2;
                    color: #ef4444;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .btn-view {
                    padding: 8px 16px;
                    background: #f1f5f9;
                    color: #475569;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-view:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                }
                    color: #cbd5e1;
                    font-size: 1.5rem;
                    font-weight: 300;
                }

                .empty-state, .loading-state {
                    text-align: center;
                    padding: 40px;
                    color: #94a3b8;
                    font-style: italic;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }

                .modal-content {
                    background: white;
                    width: 90%;
                    max-width: 600px;
                    border-radius: 20px;
                    padding: 32px;
                    position: relative;
                    animation: slideUp 0.3s ease-out;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: #0f172a;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 2rem;
                    color: #94a3b8;
                    cursor: pointer;
                    line-height: 1;
                    padding: 0;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                
                .info-section {
                    background: #f8fafc;
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                }
                
                .info-section h3 {
                    font-size: 1rem;
                    color: #475569;
                    margin: 0 0 12px;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                
                .info-item label {
                    display: block;
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin-bottom: 2px;
                }
                
                .info-item span {
                    font-weight: 500;
                    color: #334155;
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 32px;
                }

                .btn-update {
                    flex: 2;
                    padding: 12px;
                    background: #0047AB;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-block-toggle {
                    flex: 1;
                    padding: 12px;
                    background: #e2e8f0;
                    color: #475569;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                .btn-block-toggle.blocked {
                    background: #fef2f2;
                    color: #ef4444;
                    border: 1px solid #fee2e2;
                }

                .btn-delete {
                    flex: 1;
                    padding: 12px;
                    background: white;
                    color: #ef4444;
                    border: 1px solid #fee2e2;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-update:disabled, .btn-delete:disabled, .btn-block-toggle:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 640px) {
                    .tab-content {
                        padding: 24px;
                    }

                    .page-header h1 {
                        font-size: 2rem;
                    }
                    
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .modal-actions {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default StudentRegistration;
