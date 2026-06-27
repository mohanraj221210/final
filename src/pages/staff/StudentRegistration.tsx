import React, { useState, useEffect, useRef } from 'react';
import PremiumStaffLoader from '../../components/PremiumStaffLoader';
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
    const [appReady, setAppReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentStaffID, setCurrentStaffID] = useState<string | null>(null);

    // Bulk Registration State
    const [file, setFile] = useState<File | null>(null);

    // Single Registration State
    const [singleForm, setSingleForm] = useState({
        name: '',
        email: '',
        password: '',
        department: '',
        semester: ''
    });
    const nameInputRef = useRef<HTMLInputElement>(null);

    const [studentsList, setStudentsList] = useState<Student[]>([]);
    const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLastPage, setIsLastPage] = useState(true);
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
            const handler = setTimeout(() => {
                fetchStudents();
            }, 500);
            return () => clearTimeout(handler);
        }
    }, [activeTab, currentStaffID, currentPage, searchQuery]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const searchParam = searchQuery ? `&search=${searchQuery}` : '';
            // Assuming API filters by staff ID from token

            const statsPromise = axios.get(`${API_URL}/staff/student/stats`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null);
            const response = await axios.get(`${API_URL}/staff/students/list?page=${currentPage}&limit=20${searchParam}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const statsRes = await statsPromise;
            if (statsRes && statsRes.status === 200) {
                let statsData = statsRes.data;
                if (statsData.stats && statsData.stats.length > 0) {
                    statsData = statsData.stats[0];
                }
                const total = statsData?.total || statsData?.totalStudents || statsData?.students || 0;
                setTotalStudentsCount(total);
            }

            if (response.status === 200) {
                // Handle the nested { students: [] } structure
                const allStudents = response.data.students || response.data.data || [];
                if (response.data.hasOwnProperty('isLast')) {
                    setIsLastPage(response.data.isLast);
                } else {
                    setIsLastPage(allStudents.length < 20);
                }
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

        if (!singleForm.name || !singleForm.email || !singleForm.password || !singleForm.department || !singleForm.semester) {
            toast.error("All fields are required");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...singleForm,
                semester: parseInt(singleForm.semester as string, 10),
                createdByStaffID: currentStaffID
            };
            const response = await axios.post(`${API_URL}/staff/student/signup`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200 || response.status === 201) {
                toast.success("Student registered successfully");
                setSingleForm({ name: '', email: '', password: '', department: '', semester: '' });
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
            const response = await axios.put(`${API_URL}/staff/student/forgot/password`,
                {
                    newPassword: newPassword,
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


    if (!appReady) return <PremiumStaffLoader isDataReady={true} onComplete={() => setAppReady(true)} />;

    return (
        <div className="registration-page mobile-page-content">
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
                                        <h3>{file ? file.name : 'Drag & Drop or Click to Upload'}</h3>
                                        <p>{file ? 'File ready for registration' : 'Excel files only (.xls, .xlsx)'}</p>
                                    </label>
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading || !file}>
                                    {loading ? 'Uploading & Registering...' : 'Upload & Register'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'single' && (
                            <form onSubmit={handleSingleSubmit} className="single-form animate-fade">
                                <div className="form-group grid-full">
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
                                        placeholder="Enter student email"
                                        value={singleForm.email}
                                        onChange={(e) => setSingleForm({ ...singleForm, email: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Create student password"
                                        value={singleForm.password}
                                        onChange={(e) => setSingleForm({ ...singleForm, password: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select
                                        value={singleForm.department}
                                        onChange={(e) => setSingleForm({ ...singleForm, department: e.target.value })}
                                        disabled={loading}
                                        className="input-select"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                                        <option value="Information Technology">Information Technology</option>
                                        <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                                        <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                                        <option value="Master of Business Administration">Master of Business Administration</option>
                                        <option value="Computer Science and Business System">Computer Science and Business System</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Semester</label>
                                    <select
                                        value={singleForm.semester}
                                        onChange={(e) => setSingleForm({ ...singleForm, semester: e.target.value })}
                                        disabled={loading}
                                        className="input-select"
                                    >
                                        <option value="">Select Semester</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-submit-wrapper grid-full">
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Registering...' : 'Register Student'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'added-students' && (
                            <div className="added-students-view animate-fade">
                                <div className="students-count-header">
                                    <div className="count-info">
                                        <h3>All Registered Students</h3>
                                        <span className="count-badge">
                                            {filteredStudents.length} shown {totalStudentsCount > 0 && `of ${totalStudentsCount} total`}
                                        </span>
                                    </div>
                                    <div className="search-bar">
                                        <span className="search-icon">🔍</span>
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or register number..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                </div>

                                {loading && studentsList.length === 0 ? (
                                    <div className="loading-state">
                                        <span className="spinner"></span>
                                        Loading students list...
                                    </div>
                                ) : studentsList.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">🎓</div>
                                        <h3>No Students Registered Yet</h3>
                                        <p>Onboard your students using Bulk or Individual tabs above.</p>
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">🔍</div>
                                        <h3>No Matches Found</h3>
                                        <p>Try refining your search keyword.</p>
                                    </div>
                                ) : (
                                    <div className="students-table-wrapper">
                                        <table className="students-table">
                                            <thead>
                                                <tr>
                                                    <th>Student Details</th>
                                                    <th>Register No</th>
                                                    <th>Department</th>
                                                    <th>Resident Type</th>
                                                    <th className="text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredStudents.map(student => (
                                                    <tr
                                                        key={student._id}
                                                        onClick={() => navigate(`/staff/student-details/${student._id}`)}
                                                        className={student.isBlocked ? 'row-blocked' : ''}
                                                    >
                                                        <td data-label="Student Details">
                                                            <div className="table-student-cell">
                                                                <div className="student-avatar-small">
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
                                                                <div className="student-name-email">
                                                                    <div className="student-name-row">
                                                                        <span className="student-name-text">{student.name}</span>
                                                                        {student.isBlocked && <span className="badge-blocked">Blocked</span>}
                                                                    </div>
                                                                    <span className="student-email-text">{student.email}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td data-label="Register No">
                                                            <span className="student-reg-text">{student.registerNo || '—'}</span>
                                                        </td>
                                                        <td data-label="Department">
                                                            <span className="student-dept-text">{student.department || '—'}</span>
                                                        </td>
                                                        <td data-label="Resident Type">
                                                            {student.residentType ? (
                                                                <span className={`resident-badge ${student.residentType.toLowerCase()}`}>
                                                                    {student.residentType}
                                                                </span>
                                                            ) : (
                                                                <span className="resident-badge unassigned">Unassigned</span>
                                                            )}
                                                        </td>
                                                        <td data-label="Actions" className="text-right" onClick={(e) => e.stopPropagation()}>
                                                            <div className="actions-cell">
                                                                <button
                                                                    className="btn-table-action btn-view-action"
                                                                    onClick={() => navigate(`/staff/student-details/${student._id}`)}
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    className="btn-table-action btn-pwd-action"
                                                                    onClick={(e) => openPasswordModal(student._id, student.email, e)}
                                                                >
                                                                    Reset Pwd
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {studentsList.length > 0 && (
                                    <div className="pagination-controls">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="btn-pag"
                                        >
                                            &lt; Previous
                                        </button>
                                        <span className="pag-label">Page {currentPage}</span>
                                        <button
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            disabled={isLastPage}
                                            className="btn-pag"
                                        >
                                            Next &gt;
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isPasswordModalOpen && (
                <div className="modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
                    <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Reset Student Password</h2>
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
                                    placeholder="Enter new password (min 6 chars)"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password to verify"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary-action" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary-action" disabled={passwordLoading}>
                                    {passwordLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .registration-page {
                    min-height: 100vh;
                    background: var(--bg);
                }

                .main-content {
                    max-width: 1200px;
                    margin: 32px auto;
                    padding: 0 24px;
                }

                .page-header {
                    margin-bottom: 24px;
                    text-align: left;
                }

                .page-header h1 {
                    font-size: 2rem;
                    color: var(--text);
                    font-weight: 800;
                    margin-bottom: 4px;
                    letter-spacing: -0.025em;
                }

                .page-header p {
                    color: var(--text-muted);
                    font-size: 1rem;
                }

                .registration-card {
                    background: var(--surface);
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025);
                    padding: 24px;
                }

                /* Microsoft Fluent Segmented Tabs */
                .tabs {
                    display: flex;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 12px;
                    gap: 4px;
                    margin-bottom: 24px;
                }

                .tab-btn {
                    flex: 1;
                    padding: 10px 16px;
                    border: none;
                    background: transparent;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border-radius: 8px;
                    white-space: nowrap;
                }

                .tab-btn:hover {
                    color: var(--text);
                    background: rgba(15, 23, 42, 0.04);
                }

                .tab-btn.active {
                    color: var(--primary);
                    background: #ffffff;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
                }

                .tab-content {
                    min-height: 250px;
                }

                /* Bulk Upload Drag & Drop Zone */
                .upload-zone {
                    margin-bottom: 24px;
                }

                .upload-zone input[type="file"] {
                    display: none;
                }

                .upload-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 24px;
                    border: 2px dashed #cbd5e1;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: #f8fafc;
                    text-align: center;
                }

                .upload-label:hover {
                    border-color: var(--primary);
                    background: #eff6ff;
                }

                .upload-label.has-file {
                    border-color: var(--success);
                    background: #f0fdf4;
                }

                .upload-icon {
                    font-size: 44px;
                    margin-bottom: 12px;
                    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));
                }

                .upload-label h3 {
                    font-size: 1.1rem;
                    color: var(--text);
                    margin-bottom: 4px;
                    font-weight: 600;
                }

                .upload-label p {
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }

                /* Single Form Grid */
                .single-form {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .grid-full {
                    grid-column: span 2;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group label {
                    color: var(--text);
                    font-weight: 600;
                    font-size: 0.85rem;
                    letter-spacing: -0.01em;
                }

                .form-group input, 
                .form-group select {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    color: var(--text);
                    background: #ffffff;
                    transition: all 0.15s ease;
                }

                .form-group input::placeholder {
                    color: #94a3b8;
                }

                .form-group input:focus, 
                .form-group select:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
                }

                .btn-primary {
                    background: var(--primary);
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.15);
                }

                .btn-primary:hover:not(:disabled) {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
                }

                .btn-primary:active:not(:disabled) {
                    transform: translateY(0);
                }

                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Added Students Directory Table */
                .students-count-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .count-info h3 {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: var(--text);
                    margin: 0 0 4px;
                }

                .count-badge {
                    display: inline-block;
                    font-size: 0.775rem;
                    font-weight: 600;
                    color: var(--primary);
                    background: #eff6ff;
                    padding: 2px 8px;
                    border-radius: 9999px;
                    border: 1px solid #dbeafe;
                }

                .search-bar {
                    position: relative;
                    width: 320px;
                }

                .search-bar input {
                    width: 100%;
                    padding: 10px 14px 10px 40px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    background: #ffffff;
                    transition: all 0.2s;
                }

                .search-bar input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
                }

                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    font-size: 1rem;
                }

                .students-table-wrapper {
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #ffffff;
                }

                .students-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    font-size: 0.875rem;
                }

                .students-table th {
                    background: #f8fafc;
                    padding: 12px 16px;
                    font-weight: 600;
                    color: var(--text-muted);
                    border-bottom: 1px solid #e2e8f0;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                }

                .students-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    color: var(--text);
                    vertical-align: middle;
                }

                .students-table tr {
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }

                .students-table tr:hover {
                    background-color: #f8fafc;
                }

                .students-table tr.row-blocked {
                    background-color: #fffefb;
                }

                .table-student-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .student-avatar-small {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: #eff6ff;
                    color: var(--primary);
                    font-weight: 700;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border: 1px solid #dbeafe;
                    flex-shrink: 0;
                }

                .student-avatar-small img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .student-name-email {
                    display: flex;
                    flex-direction: column;
                }

                .student-name-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .student-name-text {
                    font-weight: 600;
                    color: var(--text);
                }

                .student-email-text {
                    font-size: 0.775rem;
                    color: var(--text-muted);
                }

                .student-reg-text {
                    font-family: monospace;
                    font-weight: 600;
                    color: #475569;
                }

                .student-dept-text {
                    color: #334155;
                    font-weight: 500;
                }

                .badge-blocked {
                    background: #fef2f2;
                    color: var(--danger);
                    border: 1px solid #fee2e2;
                    padding: 1px 6px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }

                .resident-badge {
                    display: inline-block;
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 9999px;
                    text-transform: capitalize;
                }

                .resident-badge.hosteler {
                    background: #ecfdf5;
                    color: var(--success);
                    border: 1px solid #a7f3d0;
                }

                .resident-badge.dayscholar {
                    background: #f0f9ff;
                    color: #0284c7;
                    border: 1px solid #bae6fd;
                }

                .resident-badge.unassigned {
                    background: #f1f5f9;
                    color: var(--text-muted);
                    border: 1px solid #e2e8f0;
                }

                .actions-cell {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                }

                .btn-table-action {
                    padding: 6px 12px;
                    font-size: 0.775rem;
                    font-weight: 600;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .btn-view-action {
                    background: #f1f5f9;
                    color: #334155;
                    border: 1px solid #cbd5e1;
                }

                .btn-view-action:hover {
                    background: #e2e8f0;
                    color: var(--text);
                }

                .btn-pwd-action {
                    background: #ffffff;
                    color: var(--primary);
                    border: 1px solid rgba(37, 99, 235, 0.3);
                }

                .btn-pwd-action:hover {
                    background: var(--primary);
                    color: #ffffff;
                    border-color: var(--primary);
                }

                .text-right {
                    text-align: right;
                }

                /* Pagination */
                .pagination-controls {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                    margin-top: 24px;
                }

                .btn-pag {
                    padding: 8px 16px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    background: #ffffff;
                    color: #334155;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .btn-pag:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: #94a3b8;
                }

                .btn-pag:disabled {
                    background: #f1f5f9;
                    color: #94a3b8;
                    cursor: not-allowed;
                    border-color: #e2e8f0;
                }

                .pag-label {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                /* States */
                .loading-state, 
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 24px;
                    text-align: center;
                    color: var(--text-muted);
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px dashed #cbd5e1;
                }

                .empty-state-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                    opacity: 0.7;
                }

                .empty-state h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0 0 4px;
                }

                .empty-state p {
                    font-size: 0.875rem;
                    margin: 0;
                    max-width: 320px;
                }

                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid #e2e8f0;
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 12px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Modals */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(8px);
                }

                .modal-content {
                    background: #ffffff;
                    width: 95%;
                    max-width: 450px;
                    border-radius: 16px;
                    padding: 24px;
                    position: relative;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .animate-slide-up {
                    animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideUp {
                    from { transform: translateY(12px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .modal-header h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text);
                    margin: 0;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    line-height: 1;
                    padding: 4px;
                    border-radius: 6px;
                    transition: background 0.15s;
                }

                .close-btn:hover {
                    background: #f1f5f9;
                    color: var(--text);
                }

                .input-disabled {
                    background: #f8fafc !important;
                    color: var(--text-muted) !important;
                    cursor: not-allowed;
                    border-color: #e2e8f0 !important;
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                }

                .btn-secondary-action {
                    flex: 1;
                    padding: 10px;
                    background: #ffffff;
                    color: #475569;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .btn-secondary-action:hover {
                    background: #f8fafc;
                    color: var(--text);
                }

                .btn-primary-action {
                    flex: 2;
                    padding: 10px;
                    background: var(--primary);
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .btn-primary-action:hover:not(:disabled) {
                    background: #1d4ed8;
                }

                .btn-primary-action:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Mobile Responsiveness override */
                @media (max-width: 768px) {
                    .main-content {
                        margin: 16px auto;
                        padding: 0 16px;
                    }

                    .page-header h1 {
                        font-size: 1.75rem;
                    }

                    .registration-card {
                        padding: 16px;
                    }

                    .tabs {
                        flex-direction: row;
                        overflow-x: auto;
                        padding: 2px;
                        gap: 2px;
                    }

                    .tab-btn {
                        padding: 8px 12px;
                        font-size: 0.8rem;
                    }

                    .single-form {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .grid-full {
                        grid-column: span 1;
                    }

                    .students-count-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }

                    .search-bar {
                        width: 100%;
                    }

                    /* Table to card stack for mobile devices */
                    .students-table-wrapper {
                        border: none;
                    }

                    .students-table thead {
                        display: none;
                    }

                    .students-table, 
                    .students-table tbody, 
                    .students-table tr, 
                    .students-table td {
                        display: block;
                        width: 100%;
                    }

                    .students-table tr {
                        background: #ffffff;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        margin-bottom: 16px;
                        padding: 14px;
                        position: relative;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
                    }

                    .students-table tr:hover {
                        background-color: #ffffff;
                    }

                    .students-table td {
                        padding: 8px 0;
                        border-bottom: 1px dashed #f1f5f9;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .students-table td:first-child {
                        border-bottom: 1px solid #f1f5f9;
                        padding-bottom: 12px;
                        margin-bottom: 8px;
                        display: block;
                    }

                    .students-table td:first-child::before {
                        display: none;
                    }

                    .students-table td:last-child {
                        border-bottom: none;
                        padding-top: 12px;
                        margin-top: 4px;
                    }

                    .students-table td::before {
                        content: attr(data-label);
                        font-weight: 600;
                        color: var(--text-muted);
                        font-size: 0.8rem;
                    }

                    .actions-cell {
                        width: 100%;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 8px;
                    }

                    .btn-table-action {
                        text-align: center;
                        padding: 8px;
                        font-size: 0.8rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default StudentRegistration;
