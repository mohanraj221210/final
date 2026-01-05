import React, { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import Toast from '../components/Toast';
import { type User, RECENT_DOWNLOADS } from '../data/sampleData';
import jitProfile from '../assets/jit.webp';
import axios from 'axios';
import { toast } from 'react-toastify';

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
        residencetype: 'day scholar',
        hostelname: '',
        hostelroomno: '',
        busno: '',
        boardingpoint: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.status === 200) {
                    setUser(response.data.user);
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/profile/update`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 200) {
                toast.success("Profile updated successfully");
                setShowToast(true);
            }
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/profile/update`, user, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.status === 200) {
                alert("Profile updated successfully");
                setShowToast(true);
            }
        } catch (error) {
            alert("Failed to update profile");
        }
        localStorage.setItem('userProfile', JSON.stringify(user));
        setIsEditing(false);

    };

    return (
        <div className="page-container profile-page">
            <Nav />
            {showToast && (
                <Toast
                    message="Profile updated successfully!"
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="content-wrapper">
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
                                        <option value="CSE">Computer Science and Engineering</option>
                                        <option value="IT">Information Technology</option>
                                        <option value="ECE">Electronics and Communication Engineering</option>
                                        <option value="EEE">Electrical and Electronics Engineering</option>
                                        <option value="MECH">Mechanical Engineering</option>
                                        <option value="CIVIL">Civil Engineering</option>
                                        <option value="AIDS">Artificial Intelligence and Data Science</option>
                                        <option value="AIML">Artificial Intelligence and Machine Learning</option>
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
                                    <input
                                        type="text"
                                        name="batch"
                                        value={user.batch}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                        placeholder="e.g., 2021-2025"
                                    />
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
                                        value={user.arrears || ''}
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
                                        <option value="day scholar">Day Scholar</option>
                                        <option value="hostel">Hostel</option>
                                    </select>
                                </div>

                                {user.residencetype === 'hostel' && (
                                    <>
                                        <div className="form-group">
                                            <label>Hostel Name</label>
                                            <input
                                                type="text"
                                                name="hostelname"
                                                value={user.hostelname}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="input"
                                            />
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
