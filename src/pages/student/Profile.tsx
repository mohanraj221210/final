import React, { useState, useEffect } from 'react';
import Toast from '../../components/Toast';
import { type User, RECENT_DOWNLOADS } from '../../data/sampleData';
import jitProfile from '../../assets/jit.webp';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const [user, setUser] = useState<User>({
        name: '',
        registerNumber: '',
        department: '',
        semester: 0,
        year: '',
        email: '',
        phone: '',
        photo: '',
        batch: '',
        cgpa: 0,
        arrears: 0,
        gender: 'male',
        parentnumber: '',
        residencetype: '',
        hostelname: '',
        hostelroomno: '',
        busno: '',
        boardingpoint: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const calculateCompletion = (userData: User) => {
        const commonFields = [
            'name', 'email', 'phone', 'parentnumber', 'registerNumber',
            'department', 'year', 'semester', 'batch', 'cgpa', 'gender',
            'photo', 'residencetype'
        ];

        let requiredFields = [...commonFields];

        if (userData.residencetype === 'hostel') {
            requiredFields.push('hostelname', 'hostelroomno');
        } else if (userData.residencetype === 'day scholar') {
            requiredFields.push('busno', 'boardingpoint');
        }

        const filledFields = requiredFields.filter(field => {
            const value = userData[field as keyof User];
            // Check for non-null, non-undefined, and non-empty string/number
            return value !== null && value !== undefined && value !== '' && value !== 0;
        });

        const percentage = Math.round((filledFields.length / requiredFields.length) * 100);
        return percentage;
    };

    useEffect(() => {
        setCompletionPercentage(calculateCompletion(user));
    }, [user]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.status === 200) {
                    setUser(prev => ({
                        ...prev,
                        ...response.data.user,
                        gender: response.data.user.gender || prev.gender || 'male'
                    }));
                    toast.success("User profile fetched successfully");
                } else {
                    toast.error("Failed to fetch user profile");
                }
            } catch (error) {
                toast.error("Failed to fetch user profile");
            }
        }
        fetchUserProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error("Only JPG, JPEG, and PNG formats are allowed");
            return;
        }

        if (file.size > 200 * 1024) { // 200 KB
            toast.error("Image size must be less than 200 KB");
            return;
        }

        // Preview and State Update
        setSelectedFile(file);
        setUser(prev => ({ ...prev, photo: URL.createObjectURL(file) }));
        setIsEditing(true); // Auto-enable edit mode if not already
        toast.info("Image selected. Click 'Save Changes' to upload.");
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleSave = async () => {
        console.log(user);
        try {
            let response;
            if (selectedFile) {
                const formData = new FormData();
                // Append all user fields to formData
                Object.keys(user).forEach(key => {
                    const value = user[key as keyof User];
                    if (value !== null && value !== undefined) {
                        formData.append(key, value.toString());
                    }
                });
                formData.append('file', selectedFile);

                response = await axios.put(`${import.meta.env.VITE_API_URL}/api/profile/update`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axios.put(`${import.meta.env.VITE_API_URL}/api/profile/update`, user, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }

            if (response.status === 200) {
                toast.success("Profile updated successfully");
                setShowToast(true);
                setSelectedFile(null); // Clear selected file after successful upload
            }
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        }
        localStorage.setItem('userProfile', JSON.stringify(user));
        setIsEditing(false);

    };

    return (
        <div className="page-container profile-page">
            < ToastContainer />
            <header className="dashboard-header-custom">
                <div className="header-container-custom">
                    <div className="header-left-custom">
                        <div className="brand-custom">
                            <span className="brand-icon-custom">🎓</span>
                            <span className="brand-text-custom">JIT Student Portal</span>
                        </div>
                    </div>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>

                    <nav className={`header-nav-custom ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/dashboard')}
                        >
                            Dashboard
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/staffs')}
                        >
                            Staffs
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/student-notice')}
                        >
                            Notices
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/outpass')}
                        >
                            Outpass
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/subjects')}
                        >
                            Subjects
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/profile')}
                        >
                            Profile
                        </button>
                        <button className="logout-btn-custom" onClick={handleLogout}>
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            {showToast && (
                <Toast
                    message="Profile updated successfully!"
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="content-wrapper">
                <button className="back-dashboard-btn" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>

                <div className="completion-card">
                    <div className="completion-header">
                        <h3>Profile Completion</h3>
                        <span className="completion-badge">{completionPercentage}%</span>
                    </div>
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{
                                width: `${completionPercentage}%`,
                                backgroundColor: completionPercentage === 100 ? '#10b981' : '#0047AB'
                            }}
                        ></div>
                    </div>
                    <p className="completion-text">
                        {completionPercentage === 100
                            ? "Great! Your profile is fully complete."
                            : "Complete your profile to enable all features."}
                    </p>
                </div>

                <div className="profile-layout">
                    {/* Left Column: Profile Card */}
                    <div className="profile-sidebar">
                        <div className="card profile-card">
                            <div className="profile-header">
                                <div className="avatar-container">
                                    <img
                                        src={user.photo || jitProfile}
                                        alt="Profile"
                                        className="profile-avatar"
                                    />
                                    {isEditing && (
                                        <label className="avatar-upload">
                                            <span>📷</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden-input"
                                            />
                                        </label>
                                    )}
                                </div>
                                <h2 className="profile-name">{user.name}</h2>
                                <p className="profile-role">Student</p>
                                <div className="profile-badges">
                                    <span className="badge">{user.department}</span>
                                </div>
                            </div>

                            {/* <div className="profile-stats">
                                <div className="p-stat">
                                    <strong>95%</strong>
                                    <span>Attendance</span>
                                </div>
                                <div className="p-stat">
                                    <strong>8.5</strong>
                                    <span>CGPA</span>
                                </div>
                            </div> */}

                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="btn btn-primary w-full">
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="action-buttons">
                                    <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                                    <button onClick={() => setIsEditing(false)} className="btn btn-ghost">Cancel</button>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="card activity-card">
                            <h3>Recent Activity</h3>
                            <div className="activity-list">
                                {RECENT_DOWNLOADS.map(item => (
                                    <div key={item.id} className="activity-item">
                                        <div className="dot"></div>
                                        <div className="activity-content">
                                            <p>Downloaded <strong>{item.title}</strong></p>
                                            <span>{item.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details Form */}
                    <div className="profile-main">
                        <div className="card details-card">
                            <div className="card-header">
                                <h3>Personal Information</h3>
                                <p className="text-muted">Manage your personal details and contact info.</p>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={user.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Register Number</label>
                                    <input
                                        type="text"
                                        name="registerNumber"
                                        value={user.registerNumber}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Department</label>
                                    <select
                                        name="department"
                                        value={user.department}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                                        <option value="Information Technology">Information Technology</option>
                                        <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                                        <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                                        <option value="Master of Business Administration">Master of Business Administration</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Year</label>
                                    <select
                                        name="year"
                                        value={user.year}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Semester</label>
                                    <input
                                        type="number"
                                        name="semester"
                                        value={user.semester}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                        min="1"
                                        max="8"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Batch</label>
                                    <select
                                        name="batch"
                                        value={user.batch}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    >
                                        <option value="">Select Batch</option>
                                        <option value="2022-2026">2022-2026</option>
                                        <option value="2023-2027">2023-2027</option>
                                        <option value="2024-2028">2024-2028</option>
                                        <option value="2025-2029">2025-2029</option>
                                        <option value="2026-2030">2026-2030</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={user.gender}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={user.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={user.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Parent Phone Number</label>
                                    <input
                                        type="tel"
                                        name="parentnumber"
                                        value={user.parentnumber}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Academic Details */}
                        <div className="card details-card">
                            <div className="card-header">
                                <h3>Academic Details</h3>
                                <p className="text-muted">View your academic performance.</p>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>CGPA</label>
                                    <input
                                        type="number"
                                        name="cgpa"
                                        value={user.cgpa || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Arrears</label>
                                    <input
                                        type="number"
                                        name="arrears"
                                        value={user.arrears}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Residence Details */}
                        <div className="card details-card">
                            <div className="card-header">
                                <h3>Residence Details</h3>
                                <p className="text-muted">Manage your residence and transportation information.</p>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Residence Type</label>
                                    <select
                                        name="residencetype"
                                        value={user.residencetype}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"

                                    >
                                        <option value="">Select your type</option>
                                        <option value="day scholar">Day Scholar</option>
                                        <option value="hostel">Hostel</option>
                                    </select>
                                </div>

                                {user.residencetype === 'hostel' && (
                                    <>
                                        <div className="form-group">
                                            <label>Hostel Name</label>
                                            <select

                                                name="hostelname"
                                                value={user.hostelname}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="input"
                                            >
                                                <option value="">Select Hostel</option>
                                                <option value="M.G.R">M.G.R illam</option>
                                                <option value="Janaki ammal">Janaki ammal illam</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Hostel Room Number</label>
                                            <input
                                                type="text"
                                                name="hostelroomno"
                                                value={user.hostelroomno}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="input"
                                            />
                                        </div>
                                    </>
                                )}

                                {user.residencetype === 'day scholar' && (
                                    <>
                                        <div className="form-group">
                                            <label>Bus Number</label>
                                            <input
                                                type="text"
                                                name="busno"
                                                value={user.busno}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Boarding Point</label>
                                            <input
                                                type="text"
                                                name="boardingpoint"
                                                value={user.boardingpoint}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="input"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="card settings-card">
                            <h3>Account Settings</h3>
                            <div className="settings-list">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Email Notifications</h4>
                                        <p>Receive updates about exams and events.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Two-Factor Auth</h4>
                                        <p>Add an extra layer of security.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
            /* Custom Dashboard Header */
                .dashboard-header-custom {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 70px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    z-index: 1000;
                }

                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #1e293b;
                    padding: 8px;
                    z-index: 1001;
                }

                .header-container-custom {
                    max-width: 1400px;
                    margin: 0 auto;
                    height: 100%;
                    padding: 0 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
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

                .completion-card {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }

                .completion-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .completion-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: #1e293b;
                }

                .completion-badge {
                    background: #f1f5f9;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-weight: 700;
                    color: #0047AB;
                    font-size: 0.9rem;
                }

                .progress-container {
                    height: 10px;
                    background: #e2e8f0;
                    border-radius: 5px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }

                .progress-bar {
                    height: 100%;
                    transition: width 0.5s ease;
                    border-radius: 5px;
                }

                .completion-text {
                    margin: 0;
                    font-size: 0.9rem;
                    color: #64748b;
                }

                .header-left-custom {
                    display: flex;
                    align-items: center;
                }

                .brand-custom {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .brand-icon-custom {
                    font-size: 28px;
                }

                .brand-text-custom {
                    font-size: 1.3rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-nav-custom {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-item-custom {
                    padding: 10px 20px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                }

                .nav-item-custom:hover {
                    background: #f1f5f9;
                    color: #0047AB;
                }

                .logout-btn-custom {
                    padding: 10px 24px;
                    border: 2px solid #ef4444;
                    background: white;
                    color: #ef4444;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    margin-left: 12px;
                }

                .logout-btn-custom:hover {
                    background: #ef4444;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .content-wrapper-custom {
                    margin-top: 70px;
                    padding: 0;
                }

                .profile-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 32px;
                }

                .profile-card {
                    text-align: center;
                }

                .avatar-container {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 16px;
                }

                .profile-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .profile-avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid white;
                    box-shadow: 0 0 0 4px var(--primary-light);
                }

                .avatar-upload {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: var(--primary);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 2px solid white;
                    transition: var(--transition);
                }

                .avatar-upload:hover {
                    transform: scale(1.1);
                }

                .hidden-input { display: none; }

                .profile-name { margin-bottom: 4px; }
                .profile-role { color: var(--text-muted); margin-bottom: 16px; }

                .profile-badges {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .profile-stats {
                    display: flex;
                    justify-content: center;
                    gap: 32px;
                    padding: 24px 0;
                    border-top: 1px solid var(--border);
                    border-bottom: 1px solid var(--border);
                    margin-bottom: 24px;
                }

                .p-stat {
                    display: flex;
                    flex-direction: column;
                }

                .p-stat strong { font-size: 20px; color: var(--primary-dark); }
                .p-stat span { font-size: 12px; color: var(--text-muted); }

                .w-full { width: 100%; }

                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .activity-list {
                    margin-top: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .activity-item {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                }

                .dot {
                    width: 8px;
                    height: 8px;
                    background: var(--primary);
                    border-radius: 50%;
                    margin-top: 6px;
                }

                .activity-content p { font-size: 14px; margin-bottom: 2px; }
                .activity-content span { font-size: 12px; color: var(--text-muted); }

                .card-header { margin-bottom: 24px; }
                .card-header h3 { margin-bottom: 4px; }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .form-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: var(--text-main);
                }

                .settings-card { margin-top: 24px; }

                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 0;
                    border-bottom: 1px solid var(--border);
                }

                .setting-item:last-child { border-bottom: none; }

                .setting-info h4 { font-size: 16px; margin-bottom: 4px; }
                .setting-info p { font-size: 14px; color: var(--text-muted); }

                 @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: block;
                    }

                    .header-nav-custom {
                        position: absolute;
                        top: 70px;
                        left: 0;
                        right: 0;
                        background: white;
                        flex-direction: column;
                        padding: 0;
                        border-bottom: 1px solid #e2e8f0;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        max-height: 0;
                        transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
                        gap: 0;
                    }

                    .header-nav-custom.mobile-open {
                        max-height: 500px;
                        padding: 16px 0;
                    }

                    .nav-item-custom, .logout-btn-custom {
                        width: 100%;
                        text-align: left;
                        padding: 12px 24px;
                        border-radius: 0;
                        margin: 0;
                    }

                    .logout-btn-custom {
                        border: none;
                        border-top: 1px solid #fee2e2;
                        color: #ef4444;
                        margin-top: 8px;
                    }

                    .content-wrapper-custom {
                        margin-top: 70px;
                    }
                }

                /* Switch Toggle */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 48px;
                    height: 24px;
                }

                .switch input { opacity: 0; width: 0; height: 0; }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                }

                input:checked + .slider { background-color: var(--primary); }
                input:checked + .slider:before { transform: translateX(24px); }
                .slider.round { border-radius: 34px; }
                .slider.round:before { border-radius: 50%; }

                @media (max-width: 968px) {
                    .profile-layout { grid-template-columns: 1fr; }
                    .form-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Profile;
