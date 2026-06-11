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
                        gender: response.data.user.gender || prev.gender || 'male'
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
            }
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        }
        localStorage.setItem('userProfile', JSON.stringify(user));
    };

    return (
        <div className="student-page profile-page-view animate-page-enter">
            <ToastContainer position="bottom-right" />

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
            <StudentHeader />

            {showToast && (
                <Toast
                    message="Profile updated successfully!"
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="content-wrapper">
                {/* Back link */}
                <div className="back-link-wrapper" style={{ marginBottom: '24px' }}>
                    <button className="btn-back" onClick={() => navigate('/dashboard')}>
                        <span className="icon">←</span> Back to Dashboard
                    </button>
                </div>

                {/* Profile Completion Panel */}
                <div className="completion-card card animate-stagger-1">
                    <div className="completion-flex">
                        <div className="completion-info">
                            <h3>Profile Verification Status</h3>
                            <p className="completion-desc">
                                {completionPercentage === 100
                                    ? "Your profile is fully complete and verified. You have access to all system features."
                                    : "Please fill out all missing details to complete your registration."}
                            </p>
                        </div>
                        <div className="completion-tracker">
                            <div className="progress-circle-wrap">
                                <svg className="progress-circle" viewBox="0 0 36 36">
                                    <path
                                        className="circle-bg"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="circle"
                                        strokeDasharray={`${completionPercentage}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        style={{ stroke: completionPercentage === 100 ? 'var(--success)' : 'var(--primary)' }}
                                    />
                                    <text x="18" y="20.35" className="percentage-text">{completionPercentage}%</text>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-card-layout">
                    {/* LEFT COLUMN */}
                    <div className="profile-left-col">
                        <div className="card profile-main-card animate-stagger-2">
                            <div className="avatar-uploader-container">
                                <div className="avatar-wrapper">
                                    {!imageError && user.photo ? (
                                        <img
                                            src={user.photo.startsWith("blob:") || user.photo.startsWith("data:") || user.photo.startsWith("http")
                                                ? user.photo
                                                : `${import.meta.env.VITE_CDN_URL || ''}${user.photo.startsWith('/') ? user.photo.slice(1) : user.photo}`
                                            }
                                            alt="Profile Avatar"
                                            className="avatar-img"
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        <div className="profile-initials-avatar" style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                            color: 'white',
                                            fontSize: '3rem',
                                            fontWeight: '800',
                                            textTransform: 'uppercase'
                                        }}>
                                            {user.name ? user.name.charAt(0) : 'S'}
                                        </div>
                                    )}
                                    {isEditing && (
                                        <label className="avatar-edit-trigger" title="Upload new photo">
                                            <span className="icon">📷</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    )}
                                </div>
                                <h2 className="user-title-name">{user.name || 'Student Name'}</h2>
                                <span className="badge badge-purple" style={{ marginTop: '8px' }}>Student</span>
                            </div>

                            <div className="sidebar-actions-box">
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-block">
                                        Edit Details
                                    </button>
                                ) : (
                                    <div className="editing-actions">
                                        <button onClick={handleSave} className="btn btn-success btn-block">
                                            Save Changes
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="btn btn-surface btn-block">
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Downloads & Activity */}
                        <div className="card activity-sidebar-card">
                            <h3 className="section-title">⏱️ History Log</h3>
                            <div className="recent-download-list">
                                {RECENT_DOWNLOADS.slice(0, 3).map(item => (
                                    <div key={item.id} className="download-item">
                                        <span className="dl-icon">📥</span>
                                        <div className="dl-info">
                                            <p className="dl-title">Downloaded <strong>{item.title}</strong></p>
                                            <span className="dl-date">{item.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Main Form details */}
                    <div className="profile-details-col">
                        <div className="card form-details-card">
                            {/* Academic Details (Read Only) */}
                            <fieldset className="form-section-fieldset">
                                <legend className="form-section-legend">🎓 Academic Records</legend>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Register Number</label>
                                        <input
                                            type="text"
                                            value={user.registerNumber}
                                            disabled
                                            className="input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <input
                                            type="text"
                                            value={user.department}
                                            disabled
                                            className="input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CGPA</label>
                                        <input
                                            type="text"
                                            value={user.cgpa || '8.25'}
                                            disabled
                                            className="input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Active Arrears</label>
                                        <input
                                            type="text"
                                            value={user.arrears || '0'}
                                            disabled
                                            className="input"
                                        />
                                    </div>
                                </div>
                            </fieldset>

                            {/* Contact Details (Editable) */}
                            <fieldset className="form-section-fieldset" style={{ marginTop: '32px' }}>
                                <legend className="form-section-legend">👤 Personal & Contact Info</legend>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
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
                                        <label className="form-label">Gender</label>
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
                                        <label className="form-label">Email Address</label>
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
                                        <label className="form-label">Phone Number</label>
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
                                        <label className="form-label">Parent's Phone Number</label>
                                        <input
                                            type="tel"
                                            name="parentnumber"
                                            value={user.parentnumber}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Year of Study</label>
                                        <select
                                            name="year"
                                            value={user.year}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="input"
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Semester</label>
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
                                        <label className="form-label">Batch</label>
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
                                </div>
                            </fieldset>

                            {/* Residence Details (Editable) */}
                            <fieldset className="form-section-fieldset" style={{ marginTop: '32px' }}>
                                <legend className="form-section-legend">🏠 Residence & Commute</legend>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Residence Type</label>
                                        <select
                                            name="residencetype"
                                            value={user.residencetype}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="input"
                                        >
                                            <option value="">Select Residence Type</option>
                                            <option value="day scholar">Day Scholar</option>
                                            <option value="hostel">Hostel</option>
                                        </select>
                                    </div>

                                    {user.residencetype === 'hostel' && (
                                        <>
                                            <div className="form-group">
                                                <label className="form-label">Hostel Name</label>
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
                                                <label className="form-label">Room Number</label>
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
                                                <label className="form-label">Bus Number</label>
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
                                                <label className="form-label">Boarding Point</label>
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
                            </fieldset>
                        </div>
                    </div>
                </div>
            </div>
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view cred-page-bg">
                {/* Hero */}
                <div className="mob-profile-hero animate-cred-enter cred-stagger-1">
                    <div className="mob-hero-avatar-wrap">
                        {!imageError && user?.photo ? (
                            <img
                                src={user.photo.startsWith('blob:') || user.photo.startsWith('data:') || user.photo.startsWith('http')
                                    ? user.photo
                                    : `${import.meta.env.VITE_CDN_URL || ''}${user.photo.startsWith('/') ? user.photo.slice(1) : user.photo}`}
                                alt="Profile"
                                className="mob-hero-img"
                                onError={() => setImageError(true)}
                                style={{border: '3px solid #D4AF37', boxShadow: '0 0 20px rgba(212,175,55,0.3)', padding: '4px'}}
                            />
                        ) : (
                            <div className="mob-hero-initials" style={{background: 'linear-gradient(135deg, #1E3A8A, #0F172A)', color: '#FFFFFF', border: '3px solid rgba(255,255,255,0.15)'}}>{user.name ? user.name.charAt(0).toUpperCase() : 'S'}</div>
                        )}
                        {isEditing && (
                            <label className="mob-avatar-edit" style={{background: '#D4AF37'}}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
                            </label>
                        )}
                    </div>
                    <h1 className="cred-h2" style={{color: 'white', margin: '12px 0 0 0'}}>{user.name || 'Student Name'}</h1>
                    <p className="cred-gold-text" style={{fontSize: '13px', fontWeight: '600', margin: '4px 0'}}>{user.department || 'Department'} &bull; {user.year || 'Year'}</p>

                    {/* Completion bar */}
                    <div className="mob-completion-bar-wrap" style={{marginTop: '12px'}}>
                        <div className="mob-completion-bar-track">
                            <div className="mob-completion-bar-fill" style={{width: `${completionPercentage}%`, background: 'linear-gradient(90deg, #D4AF37, #FBBF24)'}} />
                        </div>
                        <span className="mob-completion-pct" style={{color: '#D4AF37'}}>{completionPercentage}% Complete</span>
                    </div>

                    {/* Edit / Save */}
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="mob-edit-btn" style={{marginTop: '16px'}}>Edit Profile</button>
                    ) : (
                        <div className="mob-edit-actions" style={{marginTop: '16px'}}>
                            <button onClick={handleSave} className="mob-save-btn">Save Changes</button>
                            <button onClick={() => setIsEditing(false)} className="mob-cancel-btn">Cancel</button>
                        </div>
                    )}
                </div>

                <div className="mob-scroll-body">
                    {/* Academic Section */}
                    <div className="cred-card mob-section-card animate-cred-enter cred-stagger-2">
                        <h3 className="mob-section-head">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cred-gold)" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                            Academic Records
                        </h3>
                        <div className="mob-field-row"><span className="mob-field-lbl">Register No</span><span className="mob-field-val cred-text-primary">{user.registerNumber || '—'}</span></div>
                        <div className="mob-field-row"><span className="mob-field-lbl">Department</span><span className="mob-field-val cred-text-primary">{user.department || '—'}</span></div>
                        <div className="mob-field-row"><span className="mob-field-lbl">CGPA</span><span className="mob-field-val cred-text-primary">{user.cgpa || '8.25'}</span></div>
                        <div className="mob-field-row" style={{borderBottom: 'none'}}><span className="mob-field-lbl">Arrears</span><span className="mob-field-val cred-text-primary">{user.arrears || '0'}</span></div>
                    </div>

                    {/* Personal Section */}
                    <div className="cred-card mob-section-card animate-cred-enter cred-stagger-3">
                        <h3 className="mob-section-head">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cred-gold)" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Personal & Contact
                        </h3>
                        <div className="mob-form-group">
                            <label className="mob-label">Full Name</label>
                            <input type="text" name="name" value={user.name} onChange={handleChange} disabled={!isEditing} className="mob-input" />
                        </div>
                        <div className="mob-form-group">
                            <label className="mob-label">Email</label>
                            <input type="email" name="email" value={user.email} onChange={handleChange} disabled={!isEditing} className="mob-input" />
                        </div>
                        <div className="mob-form-group">
                            <label className="mob-label">Phone</label>
                            <input type="tel" name="phone" value={user.phone} onChange={handleChange} disabled={!isEditing} className="mob-input" />
                        </div>
                        <div className="mob-form-group">
                            <label className="mob-label">Parent's Phone</label>
                            <input type="tel" name="parentnumber" value={user.parentnumber} onChange={handleChange} disabled={!isEditing} className="mob-input" />
                        </div>
                        <div className="mob-form-group">
                            <label className="mob-label">Gender</label>
                            <select name="gender" value={user.gender} onChange={handleChange} disabled={!isEditing} className="mob-select">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div className="mob-form-group">
                            <label className="mob-label">Year</label>
                            <select name="year" value={user.year} onChange={handleChange} disabled={!isEditing} className="mob-select">
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        </div>
                        <div className="mob-form-group">
                            <label className="mob-label">Batch</label>
                            <select name="batch" value={user.batch} onChange={handleChange} disabled={!isEditing} className="mob-select">
                                <option value="">Select Batch</option>
                                <option value="2022-2026">2022-2026</option>
                                <option value="2023-2027">2023-2027</option>
                                <option value="2024-2028">2024-2028</option>
                                <option value="2025-2029">2025-2029</option>
                            </select>
                        </div>
                    </div>

                    {/* Residence Section */}
                    <div className="cred-card mob-section-card animate-cred-enter cred-stagger-4">
                        <h3 className="mob-section-head">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cred-gold)" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            Residence & Commute
                        </h3>
                        <div className="mob-form-group">
                            <label className="mob-label">Residence Type</label>
                            <select name="residencetype" value={user.residencetype} onChange={handleChange} disabled={!isEditing} className="mob-select">
                                <option value="">Select Type</option>
                                <option value="day scholar">Day Scholar</option>
                                <option value="hostel">Hostel</option>
                            </select>
                        </div>
                        {user.residencetype === 'hostel' && (
                            <>
                                <div className="mob-form-group">
                                    <label className="mob-label">Hostel Name</label>
                                    <select name="hostelname" value={user.hostelname} onChange={handleChange} disabled={!isEditing} className="mob-select">
                                        <option value="">Select Hostel</option>
                                        <option value="M.G.R">M.G.R illam</option>
                                        <option value="Janaki ammal">Janaki ammal illam</option>
                                    </select>
                                </div>
                                <div className="mob-form-group">
                                    <label className="mob-label">Room Number</label>
                                    <input type="text" name="hostelroomno" value={user.hostelroomno} onChange={handleChange} disabled={!isEditing} className="mob-input" />
                                </div>
                            </>
                        )}
                        {user.residencetype === 'day scholar' && (
                            <>
                                <div className="mob-form-group">
                                    <label className="mob-label">Bus Number</label>
                                    <input type="text" name="busno" value={user.busno} onChange={handleChange} disabled={!isEditing} className="mob-input" />
                                </div>
                                <div className="mob-form-group">
                                    <label className="mob-label">Boarding Point</label>
                                    <input type="text" name="boardingpoint" value={user.boardingpoint} onChange={handleChange} disabled={!isEditing} className="mob-input" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom Nav */}
                <StudentBottomNav activeTab="profile" />
            </div>{/* end mobile */}

            {showCropper && tempImage && (
                <ImageCropper
                    imageSrc={tempImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            <style>{`
                .profile-page-view {
                    background: var(--bg);
                }
                .btn-back {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    transition: var(--transition-fast);
                }
                .btn-back:hover {
                    background: var(--primary-light);
                    color: var(--primary-dark);
                }

                /* Completion Card Circular tracker */
                .completion-card {
                    margin-bottom: 24px;
                }
                .completion-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 24px;
                }
                .completion-info h3 {
                    font-size: 1.15rem;
                    margin-bottom: 6px;
                    color: var(--text-1);
                }
                .completion-desc {
                    font-size: 0.88rem;
                    color: var(--text-3);
                    margin: 0;
                    max-width: 600px;
                }
                .progress-circle-wrap {
                    width: 72px;
                    height: 72px;
                    flex-shrink: 0;
                }
                .progress-circle {
                    width: 100%;
                    height: 100%;
                }
                .circle-bg {
                    fill: none;
                    stroke: var(--bg-elevated);
                    stroke-width: 3.5;
                }
                .circle {
                    fill: none;
                    stroke-width: 3.5;
                    stroke-linecap: round;
                    transition: stroke-dasharray 0.3s ease;
                }
                .percentage-text {
                    font-family: inherit;
                    font-size: 8px;
                    font-weight: 800;
                    text-anchor: middle;
                    fill: var(--text-1);
                }

                /* Layout details */
                .profile-layout-grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 24px;
                    align-items: start;
                }
                .profile-image-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 24px;
                }
                .avatar-uploader-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                }
                .avatar-wrapper {
                    position: relative;
                    width: 130px;
                    height: 130px;
                    border-radius: 50%;
                    border: 4px solid var(--surface);
                    box-shadow: var(--shadow-md);
                    margin-bottom: 12px;
                }
                .avatar-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .avatar-edit-trigger {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: var(--primary);
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 2.5px solid var(--surface);
                    box-shadow: var(--shadow-sm);
                    transition: var(--spring);
                }
                .avatar-edit-trigger:hover {
                    transform: scale(1.1);
                    background: var(--primary-dark);
                }
                .user-title-name {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text-1);
                    margin: 0;
                }
                
                .sidebar-actions-box {
                    width: 100%;
                    border-top: 1px solid var(--border);
                    padding-top: 16px;
                }
                .editing-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .activity-sidebar-card {
                    margin-top: 24px;
                }
                .recent-download-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-top: 12px;
                }
                .download-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .dl-icon {
                    font-size: 1.2rem;
                    line-height: 1;
                    padding: 6px;
                    background: var(--bg-elevated);
                    border-radius: 8px;
                }
                .dl-info {
                    flex: 1;
                }
                .dl-title {
                    font-size: 0.85rem;
                    margin: 0;
                    color: var(--text-2);
                }
                .dl-date {
                    font-size: 0.72rem;
                    color: var(--text-4);
                }

                .form-details-card {
                    padding: var(--space-8) var(--space-6) !important;
                }

                /* Fieldset styles */
                .form-section-fieldset {
                    border: none;
                    margin: 0;
                    padding: 0;
                }
                .form-section-legend {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: var(--text-1);
                    margin-bottom: 20px;
                    border-bottom: 2px solid var(--bg-elevated);
                    padding-bottom: 8px;
                    width: 100%;
                }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { display: flex !important; flex-direction: column; min-height: 100vh; background: linear-gradient(135deg, #F7F3E6 0%, #E8EEF5 45%, #C8D9F2 100%); font-family: 'Inter', -apple-system, sans-serif; }
                }

                /* ==========================================
                   CRED PREMIUM MOBILE STYLES (PROFILE)
                   ========================================== */
                /* Profile hero — dark luxury panel for identity-card look */
                .mob-profile-hero { padding:28px 20px 24px; display:flex; flex-direction:column; align-items:center; gap:10px; text-align:center; position: relative; z-index: 10; background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%); }
                .mob-hero-avatar-wrap { position:relative; width:100px; height:100px; }
                .mob-hero-img { width:100px; height:100px; border-radius:50%; object-fit:cover; }
                .mob-hero-initials { width:100px; height:100px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:36px; font-weight:800; }
                .mob-avatar-edit { position:absolute; bottom:0; right:0; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 2px solid #FFFFFF; }
                .mob-hero-name { font-size:20px; font-weight:800; color:#FFFFFF; margin:0; }
                .mob-hero-sub  { font-size:13px; color:#94A3B8; margin:0; }
                .mob-completion-bar-wrap { width:100%; display:flex; align-items:center; gap:12px; }
                .mob-completion-bar-track { flex:1; height:8px; border-radius:10px; overflow:hidden; background:rgba(255,255,255,0.1) !important; border:none !important; }
                .mob-completion-bar-fill { height:100%; border-radius:10px; transition:width 0.4s; }
                .mob-completion-pct { font-size:12px; font-weight:800; white-space:nowrap; }
                .mob-edit-btn { border:none; border-radius:12px; padding:12px 28px; font-size:15px; font-weight:800; cursor:pointer; font-family:inherit; transition: transform 0.2s; background: linear-gradient(135deg, #D4AF37, #FBBF24); color: #0F172A; }
                .mob-edit-btn:active { transform: scale(0.96); }
                .mob-edit-actions { display:flex; gap:12px; width: 100%; justify-content: center; }
                .mob-save-btn { border:none; border-radius:12px; padding:12px 24px; font-size:15px; font-weight:800; cursor:pointer; font-family:inherit; transition: transform 0.2s; flex: 1; background: linear-gradient(135deg, #D4AF37, #FBBF24); color: #0F172A; }
                .mob-save-btn:active { transform: scale(0.96); }
                .mob-cancel-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px 24px; font-size:15px; font-weight:800; cursor:pointer; font-family:inherit; color:#FFFFFF; transition: transform 0.2s; flex: 1; }
                .mob-cancel-btn:active { transform: scale(0.96); }

                .mob-scroll-body { flex:1; overflow-y:auto; padding:24px 16px 100px; display:flex; flex-direction:column; gap:16px; }

                .mob-section-card { padding:20px; display:flex; flex-direction:column; gap:12px; }
                .mob-section-head { display:flex; align-items:center; gap:8px; font-size:14px; font-weight:800; color:#0F172A; margin:0 0 8px; padding-bottom:12px; border-bottom:1px solid rgba(226,232,240,0.8); }
                .mob-field-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(226,232,240,0.6); }
                .mob-field-lbl { font-size:13px; font-weight:600; color:#64748B; }
                .mob-field-val { font-size:14px; font-weight:700; color:#0F172A; text-align:right; }

                .mob-form-group { display:flex; flex-direction:column; gap:8px; margin-bottom: 4px; }
                .mob-label { font-size:12px; font-weight:700; color:#64748B; text-transform: uppercase; letter-spacing: 0.5px; }
                .mob-input, .mob-select { width:100%; padding:14px 16px; border:1px solid rgba(226,232,240,0.8); border-radius:12px; font-size:15px; font-weight:600; color:#0F172A; background:#FFFFFF; font-family:inherit; outline:none; box-sizing:border-box; transition:all 0.2s; }
                .mob-input:focus, .mob-select:focus { border-color:var(--cred-gold); background:#FFFFFF; box-shadow: 0 0 0 3px rgba(184,134,11,0.12); }
                .mob-input:disabled, .mob-select:disabled { opacity:0.6; cursor:not-allowed; background:#F8FAFC; border-color: rgba(226,232,240,0.5); }
            `}</style>
        </div>
    );
};

export default Profile;