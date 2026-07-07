import React, { useState, useEffect } from 'react';
import Toast from '../../components/Toast';
import { type User, RECENT_DOWNLOADS } from '../../data/sampleData';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ImageCropper from '../../components/ImageCropper';
import imageCompression from 'browser-image-compression';

import StudentHeader from '../../components/StudentHeader';
import StudentBottomNav from '../../components/StudentBottomNav';

const Profile: React.FC = () => {
    const [user, setUser] = useState<User>({
        name: '',
        staffid: {
            id: '',
            name: '',
        },
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
        gender: '',
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
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    const calculateCompletion = (userData: User) => {
        const commonFields = [
            'name', 'email', 'phone', 'parentnumber', 'registerNumber',
            'department', 'year', 'semester', 'batch', 'gender',
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
                        gender: response.data.user.gender || prev.gender || ''
                    }));
                    setImageError(false);
                    toast.success("User profile fetched successfully");
                } else {
                    toast.error("Failed to fetch user profile");
                }
            } catch (error) {
                toast.error("Failed to fetch user profile");
            }
        };
        fetchUserProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: name === 'semester' ? (value ? parseInt(value, 10) : 0) : value
        }));
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

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size must be less than 5 MB");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setTempImage(objectUrl);
        setShowCropper(true);

        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        try {
            const file = new File([croppedBlob], "profile_cropped.jpg", { type: "image/jpeg" });

            const options = {
                maxSizeMB: 0.2, // 200KB
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            const compressedBlob = new File([compressedFile], "profile_compressed.jpg", { type: "image/jpeg" });

            setSelectedFile(compressedBlob);
            setUser(prev => ({ ...prev, photo: URL.createObjectURL(compressedBlob) }));
            setImageError(false);
            setIsEditing(true);
            setShowCropper(false);
            setTempImage(null);
            toast.info("Image cropped and compressed. Click 'Save Changes' to upload.");
        } catch (error) {
            console.error("Compression error:", error);
            toast.error("Image compression failed");
        }
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setTempImage(null);
    };

    const handleSave = async () => {
        const missingFields: string[] = [];

        if (!user.name) missingFields.push("Full Name");
        if (!user.email) missingFields.push("Email Address");
        if (!user.phone) missingFields.push("Phone Number");
        if (!user.parentnumber) missingFields.push("Parent's Phone Number");
        if (!user.registerNumber) missingFields.push("Register Number");
        if (!user.department) missingFields.push("Department");
        if (!user.year) missingFields.push("Year of Study");
        if (!user.semester) missingFields.push("Semester");
        if (!user.batch) missingFields.push("Batch");
        if (!user.gender) missingFields.push("Gender");
        if (!user.photo) missingFields.push("Profile Photo");
        
        if (!user.residencetype) {
            missingFields.push("Residence Type");
        } else if (user.residencetype === 'hostel') {
            if (!user.hostelname) missingFields.push("Hostel Name");
            if (!user.hostelroomno) missingFields.push("Room Number");
        } else if (user.residencetype === 'day scholar') {
            if (!user.busno) missingFields.push("Bus Number");
            if (!user.boardingpoint) missingFields.push("Boarding Point");
        }

        if (missingFields.length > 0) {
            toast.error(`Please fill in the missing fields: ${missingFields.join(', ')}`);
            return;
        }

        try {
            let response;
            if (selectedFile) {
                const formData = new FormData();
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
                setSelectedFile(null);
                setIsEditing(false);
                localStorage.setItem('userProfile', JSON.stringify(user));
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            }
        } catch (error: any) {
            const serverMsg = error.response?.data?.message || error.response?.data?.error;
            toast.error(serverMsg || "Failed to update profile");
            console.error(error);
        }
        localStorage.setItem('userProfile', JSON.stringify(user));
    };

    return (
        <div className="pb-profile-page">
            <ToastContainer position="bottom-right" />

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
                <StudentHeader />
                <main className="student-content">
                    {showToast && (
                        <Toast
                            message="Profile updated successfully!"
                            type="success"
                            onClose={() => setShowToast(false)}
                        />
                    )}

                    <div className="content-wrapper">
                        {/* Back link */}
                        <div className="pb-back-link-wrapper">
                            <button className="pb-btn-back" onClick={() => navigate('/dashboard')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back to Dashboard
                            </button>
                        </div>

                        {/* Profile Completion Panel */}
                        <div className="pb-completion-card pb-animate-stagger-1">
                            <div className="pb-completion-flex">
                                <div className="pb-completion-info">
                                    <h3>Profile Verification Status</h3>
                                    <p className="pb-completion-desc">
                                        {completionPercentage === 100
                                            ? "Your profile is fully complete and verified. You have access to all system features."
                                            : "Please fill out all missing details to complete your registration."}
                                    </p>
                                </div>
                                <div className="pb-completion-tracker">
                                    <div className="pb-progress-circle-wrap">
                                        <svg className="pb-progress-circle" viewBox="0 0 36 36">
                                            <path
                                                className="pb-circle-bg"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                className="pb-circle"
                                                strokeDasharray={`${completionPercentage}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                style={{ stroke: completionPercentage === 100 ? '#10B981' : 'var(--pb-primary)' }}
                                            />
                                            <text x="18" y="20.35" className="pb-percentage-text">{completionPercentage}%</text>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pb-profile-layout-grid">
                            {/* LEFT COLUMN */}
                            <div className="pb-profile-left-col">
                                <div className="pb-profile-main-card pb-animate-stagger-2">
                                    <div className="pb-avatar-uploader-container">
                                        <div className="pb-avatar-ring-outer">
                                            <div className="pb-avatar-wrapper">
                                                {!imageError && user.photo ? (
                                                    <img
                                                        src={user.photo.startsWith("data:") || user.photo.startsWith("http")
                                                            ? user.photo
                                                            : `${user.photo.startsWith('/') ? user.photo.slice(1) : user.photo}`
                                                        }
                                                        alt="Profile Avatar"
                                                        className="pb-avatar-img"
                                                        onError={() => setImageError(true)}
                                                    />
                                                ) : (
                                                    <div className="pb-initials-avatar">
                                                        {user.name ? user.name.charAt(0) : 'S'}
                                                    </div>
                                                )}
                                                {isEditing && (
                                                    <label className="pb-avatar-edit-trigger" title="Upload new photo">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                            <circle cx="12" cy="13" r="4" />
                                                        </svg>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                        <h2 className="pb-user-title-name">{user.name || 'Student Name'}</h2>
                                        <span className="pb-role-badge">Student</span>
                                    </div>

                                    <div className="pb-sidebar-actions-box">
                                        {!isEditing ? (
                                            <button onClick={() => setIsEditing(true)} className="pb-primary-action-btn">
                                                Edit Details
                                            </button>
                                        ) : (
                                            <div className="pb-editing-actions">
                                                <button onClick={handleSave} className="pb-save-action-btn">
                                                    Save Changes
                                                </button>
                                                <button onClick={() => setIsEditing(false)} className="pb-cancel-action-btn">
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Downloads & Activity */}
                                <div className="pb-profile-main-card pb-activity-sidebar-card pb-animate-stagger-3">
                                    <h3 className="pb-section-title">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        History Log
                                    </h3>
                                    <div className="pb-recent-download-list">
                                        {RECENT_DOWNLOADS.slice(0, 3).map(item => (
                                            <div key={item.id} className="pb-download-item">
                                                <div className="pb-dl-icon">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="7 10 12 15 17 10" />
                                                        <line x1="12" y1="15" x2="12" y2="3" />
                                                    </svg>
                                                </div>
                                                <div className="pb-dl-info">
                                                    <p className="pb-dl-title">Downloaded <strong>{item.title}</strong></p>
                                                    <span className="pb-dl-date">{item.date}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Main Form details */}
                            <div className="pb-profile-details-col">
                                <div className="pb-form-details-card">
                                    {/* Academic Details (Read Only) */}
                                    <fieldset className="pb-form-section-fieldset">
                                        <legend className="pb-form-section-legend">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                            </svg>
                                            Academic Records
                                        </legend>
                                        <div className="pb-grid-2">
                                            <div className="pb-form-group">
                                                <label className="pb-label">Register Number</label>
                                                <input
                                                    type="text"
                                                    name="registerNumber"
                                                    value={user.registerNumber}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="pb-input"
                                                />
                                            </div>
                                            <div className="pb-form-group">
                                                <label className="pb-label">Department</label>
                                                <input
                                                    type="text"
                                                    value={user.department}
                                                    disabled
                                                    className="pb-input"
                                                />
                                            </div>
                                            <div className="pb-form-group">
                                                <label className="pb-label">CGPA</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="10"
                                                    name="cgpa"
                                                    value={user.cgpa || '8.25'}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="pb-input"
                                                />
                                            </div>
                                            <div className="pb-form-group">
                                                <label className="pb-label">Active Arrears</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    name="arrears"
                                                    value={user.arrears || '0'}
                                                     disabled
                                                    className="pb-input"
                                                />
                                            </div>
                                        </div>
                                    </fieldset>

                                    {/* Contact Details (Editable) */}
                                    <fieldset className="pb-form-section-fieldset" style={{ marginTop: '24px' }}>
                                        <legend className="pb-form-section-legend">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            Personal & Contact Info
                                        </legend>
                                        <div className="pb-grid-2">
                                            <div className="pb-form-group">
                                                <label className="pb-label">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={user.name}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="pb-input"
                                                />
                                            </div>
                                            <div className="pb-form-group">
                                                <label className="pb-label">Gender</label>
                                                <select
                                                    name="gender"
                                                    value={user.gender}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="pb-select"
                                                >
                                                    <option value="">Gender not selected</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                            </div>
                                            <div className="pb-form-group">
                                                <label className="pb-label">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={user.email}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="pb-input"
                                                />
                                            </div>
                                            <div className="pb-form-group">
                                                <label className="pb-label">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={user.phone}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="pb-input"
                                                />
                                            </div>
                                            <div className="pb-form-group">
                                                <label className="pb-label">Parent's Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="parentnumber"
                                                    value={user.parentnumber}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="pb-input"
                                                />
                                            </div>
                                            <div className="pb-form-group">
                                                <label className="pb-label">Year of Study</label>
                                                <select
                                                    name="year"
                                                    value={user.year}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="pb-select"
                                                >
                                                    <option value="">Select Year</option>
                                                    <option value="1st Year">1st Year</option>
                                                    <option value="2nd Year">2nd Year</option>
                                                    <option value="3rd Year">3rd Year</option>
                                                    <option value="4th Year">4th Year</option>
                                                </select>
                                            </div>
                                            <div className="pb-form-group">
                                                <label className="pb-label">Semester</label>
                                                <select
                                                    name="semester"
                                                    value={user.semester || ''}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="pb-select"
                                                >
                                                    <option value="">Select Semester</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">5</option>
                                                    <option value="6">6</option>
                                                    <option value="7">7</option>
                                                    <option value="8">8</option>
                                                </select>
                                            </div>
                                            <div className="pb-form-group">
                                                <label className="pb-label">Batch</label>
                                                <select
                                                    name="batch"
                                                    value={user.batch}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="pb-select"
                                                >
                                                    <option value="">Select Batch</option>
                                                    <option value="2022-2026">2022-2026</option>
                                                    <option value="2023-2027">2023-2027</option>
                                                    <option value="2024-2028">2024-2028</option>
                                                    <option value="2025-2029">2025-2029</option>
                                                    <option value="2026-2030">2026-2030</option>
                                                </select>
                                            </div>
                                        </div>
                                    </fieldset>

                                    {/* Residence Details (Editable) */}
                                    <fieldset className="pb-form-section-fieldset" style={{ marginTop: '24px' }}>
                                        <legend className="pb-form-section-legend">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                <polyline points="9 22 9 12 15 12 15 22" />
                                            </svg>
                                            Residence & Commute
                                        </legend>
                                        <div className="pb-grid-2">
                                            <div className="pb-form-group">
                                                <label className="pb-label">Residence Type</label>
                                                <select
                                                    name="residencetype"
                                                    value={user.residencetype}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="pb-select"
                                                >
                                                    <option value="">Select Residence Type</option>
                                                    <option value="day scholar">Day Scholar</option>
                                                    <option value="hostel">Hostel</option>
                                                </select>
                                            </div>

                                            {user.residencetype === 'hostel' && (
                                                <>
                                                    <div className="pb-form-group">
                                                        <label className="pb-label">Hostel Name</label>
                                                        <select
                                                            name="hostelname"
                                                            value={user.hostelname}
                                                            onChange={handleChange}
                                                            disabled={!isEditing}
                                                            className="pb-select"
                                                        >
                                                            <option value="">Select Hostel</option>
                                                            <option value="M.G.R">M.G.R illam</option>
                                                            <option value="Janaki ammal">Janaki ammal illam</option>
                                                        </select>
                                                    </div>
                                                    <div className="pb-form-group">
                                                        <label className="pb-label">Room Number</label>
                                                        <input
                                                            type="text"
                                                            name="hostelroomno"
                                                            value={user.hostelroomno}
                                                            onChange={handleChange}
                                                            disabled={!isEditing}
                                                            className="pb-input"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {user.residencetype === 'day scholar' && (
                                                <>
                                                    <div className="pb-form-group">
                                                        <label className="pb-label">Bus Number</label>
                                                        <input
                                                            type="text"
                                                            name="busno"
                                                            value={user.busno}
                                                            onChange={handleChange}
                                                            disabled={!isEditing}
                                                            className="pb-input"
                                                        />
                                                    </div>
                                                    <div className="pb-form-group">
                                                        <label className="pb-label">Boarding Point</label>
                                                        <input
                                                            type="text"
                                                            name="boardingpoint"
                                                            value={user.boardingpoint}
                                                            onChange={handleChange}
                                                            disabled={!isEditing}
                                                            className="pb-input"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>{/* end desktop */}

            {/* Bottom Nav */}
            <StudentBottomNav activeTab="profile" />

            {showCropper && tempImage && (
                <ImageCropper
                    imageSrc={tempImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            <style>{`
                .pb-profile-page {
                    min-height: 100vh;
                    background: var(--pb-bg);
                }
                /* Completion Card */
                .pb-completion-card {
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    padding: 24px;
                    margin-bottom: 24px;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .pb-completion-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 24px;
                }
                .pb-completion-info h3 {
                    font-size: 1.15rem;
                    font-weight: 800;
                    margin: 0 0 6px 0;
                    color: var(--pb-text);
                    letter-spacing: -0.01em;
                }
                .pb-completion-desc {
                    font-size: 0.88rem;
                    color: var(--pb-text-3);
                    margin: 0;
                    max-width: 600px;
                }
                .pb-progress-circle-wrap {
                    width: 72px;
                    height: 72px;
                    flex-shrink: 0;
                }
                .pb-progress-circle {
                    width: 100%;
                    height: 100%;
                }
                .pb-circle-bg {
                    fill: none;
                    stroke: rgba(59, 130, 246, 0.05);
                    stroke-width: 3.5;
                }
                .pb-circle {
                    fill: none;
                    stroke-width: 3.5;
                    stroke-linecap: round;
                    transition: stroke-dasharray 0.3s ease;
                }
                .pb-percentage-text {
                    font-family: inherit;
                    font-size: 8px;
                    font-weight: 800;
                    text-anchor: middle;
                    fill: var(--pb-text);
                }

                /* Layout Grid */
                .pb-profile-layout-grid {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 24px;
                    align-items: start;
                }
                @media (max-width: 992px) {
                    .pb-profile-layout-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                }
                .pb-profile-left-col {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .pb-profile-main-card {
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .pb-avatar-uploader-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                }
                .pb-avatar-ring-outer {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-light));
                    padding: 3px;
                    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
                    margin-bottom: 16px;
                }
                .pb-avatar-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: #fff;
                    overflow: visible;
                }
                .pb-avatar-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .pb-initials-avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    font-size: 3rem;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .pb-avatar-edit-trigger {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: var(--pb-primary);
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 2px solid #fff;
                    box-shadow: var(--pb-shadow);
                    transition: var(--pb-spring);
                }
                .pb-avatar-edit-trigger:hover {
                    transform: scale(1.1);
                    background: var(--pb-primary-dark);
                }
                .pb-user-title-name {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin: 0;
                    letter-spacing: -0.01e;
                    text-align: center;
                }
                .pb-role-badge {
                    margin-top: 8px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: var(--pb-primary);
                    background: var(--pb-secondary);
                    padding: 2px 10px;
                    border-radius: 99px;
                }

                .pb-sidebar-actions-box {
                    width: 100%;
                    border-top: 1px solid rgba(59, 130, 246, 0.08);
                    padding-top: 16px;
                    margin-top: 16px;
                }
                .pb-primary-action-btn {
                    width: 100%;
                    height: 40px;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-dark));
                    color: #fff;
                    font-weight: 600;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: var(--pb-transition);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
                }
                .pb-primary-action-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
                }
                .pb-editing-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    width: 100%;
                }
                .pb-save-action-btn {
                    width: 100%;
                    height: 40px;
                    background: #10B981;
                    color: #fff;
                    font-weight: 600;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: var(--pb-transition);
                }
                .pb-save-action-btn:hover { background: #059669; }
                .pb-cancel-action-btn {
                    width: 100%;
                    height: 40px;
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.1);
                    color: var(--pb-text-2);
                    font-weight: 600;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: var(--pb-transition);
                }
                .pb-cancel-action-btn:hover { background: rgba(59, 130, 246, 0.1); }

                /* Downloads Panel */
                .pb-activity-sidebar-card {
                    align-items: flex-start;
                }
                .pb-recent-download-list {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    margin-top: 14px;
                    width: 100%;
                }
                .pb-download-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .pb-dl-icon {
                    width: 30px;
                    height: 30px;
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    color: var(--pb-primary);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .pb-dl-info {
                    flex: 1;
                }
                .pb-dl-title {
                    font-size: 0.8rem;
                    margin: 0;
                    color: var(--pb-text-2);
                    line-height: 1.35;
                }
                .pb-dl-date {
                    font-size: 0.72rem;
                    color: var(--pb-text-4);
                }

                /* Form Details Card */
                .pb-form-details-card {
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    padding: 28px;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .pb-form-section-fieldset {
                    border: none;
                    margin: 0;
                    padding: 0;
                }
                .pb-form-section-legend {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin-bottom: 20px;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.08);
                    padding-bottom: 8px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    letter-spacing: -0.01em;
                }

                .pb-grid-2 {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }
                @media (max-width: 576px) {
                    .pb-grid-2 {
                        grid-template-columns: 1fr;
                        gap: 14px;
                    }
                }
                .pb-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .pb-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: var(--pb-text-3);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 0;
                }
                .pb-input, .pb-select {
                    width: 100%;
                    height: 40px;
                    padding: 0 12px;
                    border-radius: 10px;
                    border: 1.5px solid rgba(59, 130, 246, 0.12);
                    background: #fff;
                    font-size: 0.88rem;
                    font-family: inherit;
                    color: var(--pb-text);
                    transition: var(--pb-transition);
                    box-sizing: border-box;
                    outline: none;
                }
                .pb-input:focus, .pb-select:focus {
                    border-color: var(--pb-primary);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
                }
                .pb-input:disabled, .pb-select:disabled {
                    background: rgba(241, 245, 249, 0.7);
                    color: var(--pb-text-4);
                    cursor: not-allowed;
                    border-color: rgba(59, 130, 246, 0.06);
                }
                .pb-select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    background-size: 14px;
                    padding-right: 32px;
                }

                @media (max-width: 850px) {
                    .pb-profile-page .student-content {
                        padding-top: 88px !important;
                    }
                    .pb-profile-page {
                        padding-bottom: 100px;
                    }
                }
                @media (max-width: 576px) {
                    .pb-form-details-card {
                        padding: 16px;
                    }
                    .pb-profile-main-card {
                        padding: 16px;
                    }
                    .pb-completion-card {
                        padding: 16px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;