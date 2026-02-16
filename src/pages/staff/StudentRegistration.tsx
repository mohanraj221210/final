import React, { useState, useEffect, useRef } from 'react';
import StaffHeader from '../../components/StaffHeader';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
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
    photo?: string;
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
    const nameInputRef = useRef<HTMLInputElement>(null);

    const [studentsList, setStudentsList] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Check for navigation state to set active tab
    useEffect(() => {
        if (location.state && location.state.activeTab) {
            setActiveTab(location.state.activeTab);
            // Clear state to prevent stuck navigation if needed, though usually harmless in this context
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Password Modal State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedStudentForPassword, setSelectedStudentForPassword] = useState<string | null>(null);
    const [studentEmail, setStudentEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

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

    // Filtered Students
    const filteredStudents = studentsList.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.registerNo && student.registerNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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

            if (response.status === 200 || response.status === 201) {
                toast.success("Student registered successfully");
                setSingleForm({ name: '', email: '', password: '' });
                // Focus back on name input for next entry
                setTimeout(() => {
                    nameInputRef.current?.focus();
                }, 100);
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

    // Handle Password Update
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentForPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setPasswordLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/staff/student/update/${selectedStudentForPassword}`,
                {
                    password: newPassword,
                    email: studentEmail
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.status === 200) {
                toast.success("Password updated successfully");
                setIsPasswordModalOpen(false);
                setNewPassword('');
                setConfirmPassword('');
                setStudentEmail('');
                setSelectedStudentForPassword(null);
            }
        } catch (error) {
            console.error("Failed to update password:", error);
            toast.error("Failed to update password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const openPasswordModal = (studentId: string, email: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedStudentForPassword(studentId);
        setStudentEmail(email);
        setNewPassword('');
        setConfirmPassword('');
        setIsPasswordModalOpen(true);
    };


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
                                        ref={nameInputRef}
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
                                {/* Total Count Header */}
                                {studentsList.length > 0 && (
                                    <div className="students-count-header">
                                        <h3>Total Students Added: <span className="count-badge">{filteredStudents.length} / {studentsList.length}</span></h3>
                                        <div className="search-bar">
                                            <span className="search-icon">🔍</span>
                                            <input
                                                type="text"
                                                placeholder="Search by name..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {loading && studentsList.length === 0 ? (
                                    <div className="loading-state">Loading students...</div>
                                ) : studentsList.length === 0 ? (
                                    <div className="empty-state">
                                        Total Students Added: 0
                                        <br />
                                        No students added yet.
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="empty-state">
                                        No students found matching "{searchQuery}"
                                    </div>
                                ) : (
                                    <div className="students-list">
                                        {filteredStudents.map(student => (
                                            <div
                                                key={student._id}
                                                className="student-item"
                                                onClick={() => navigate(`/staff/student-details/${student._id}`)}
                                            >
                                                <div className="student-avatar">
                                                    {student.photo ? (
                                                        <img
                                                            src={student.photo.startsWith('http') || student.photo.startsWith('data:') || student.photo.startsWith('blob:')
                                                                ? student.photo
                                                                : `${import.meta.env.VITE_CDN_URL}${student.photo}`}
                                                            alt={student.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                                        />
                                                    ) : (
                                                        student.name.charAt(0).toUpperCase()
                                                    )}
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
                                                <button className="btn-password-change" onClick={(e) => openPasswordModal(student._id, student.email, e)}>
                                                    Change Password
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

            {isPasswordModalOpen && (
                <div className="modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Change Password</h2>
                            <button className="close-btn" onClick={() => setIsPasswordModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handlePasswordUpdate}>
                            <div className="form-group">
                                <label>Student Email</label>
                                <input
                                    type="email"
                                    value={studentEmail}
                                    disabled
                                    className="input-disabled"
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel-modal" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-confirm-password" disabled={passwordLoading}>
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}



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
                    overflow-x: auto;
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
                .students-count-header {
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .students-count-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: #334155;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .count-badge {
                    background: #e0f2fe;
                    color: #0284c7;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 700;
                }

                .students-count-header {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .search-bar {
                    position: relative;
                    width: 100%;
                }

                .search-bar input {
                    width: 100%;
                    padding: 12px 16px 12px 48px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    background: white;
                    transition: all 0.2s;
                }

                .search-bar input:focus {
                    outline: none;
                    border-color: #0047AB;
                    box-shadow: 0 0 0 4px rgba(0, 71, 171, 0.1);
                }

                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    font-size: 1.2rem;
                }

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

                .btn-password-change {
                    padding: 8px 16px;
                    background: #fff;
                    color: #0047AB;
                    border: 1px solid #0047AB;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-left: 8px;
                }

                .btn-password-change:hover {
                    background: #0047AB;
                    color: white;
                }
                
                .input-disabled {
                    background-color: #f1f5f9;
                    cursor: not-allowed;
                    color: #64748b;
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

                @media (max-width: 768px) {
                    .main-content {
                        margin: 20px auto;
                        padding: 0 16px;
                    }

                    .page-header h1 {
                        font-size: 1.8rem;
                    }

                    .registration-card {
                        border-radius: 16px;
                    }

                    .tabs {
                        flex-direction: column;
                    }

                    .tab-btn {
                        padding: 16px;
                        border-bottom: 1px solid #e2e8f0;
                        border-right: none;
                        justify-content: flex-start;
                    }
                    
                    .tab-btn:last-child {
                        border-bottom: none;
                    }

                    .tab-content {
                        padding: 24px;
                    }

                    .upload-label {
                        padding: 32px 16px;
                    }
                    
                    .upload-icon {
                        font-size: 32px;
                    }

                    .students-list {
                        gap: 12px;
                    }

                    .student-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }

                    .student-avatar {
                        margin-right: 0;
                        margin-bottom: 8px;
                    }

                    .student-info {
                        width: 100%;
                    }

                    .btn-view {
                        width: 100%;
                        margin-top: 8px;
                    }
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

                .btn-cancel-modal {
                    flex: 1;
                    padding: 12px;
                    background: white;
                    color: #64748b;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-confirm-password {
                    flex: 2;
                    padding: 12px;
                    background: #0047AB;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                .btn-confirm-password:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-update:disabled, .btn-delete:disabled, .btn-block-toggle:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .tab-content {
                        padding: 24px;
                    }

                    .tab {
                        
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
