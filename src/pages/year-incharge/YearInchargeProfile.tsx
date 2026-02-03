import React, { useState, useEffect } from 'react';
import YearInchargeNav from '../../components/YearInchargeNav';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import jitProfile from '../../assets/jit.webp'; // Fallback image similar to WardenProfile

interface YearIncharge {
    name: string;
    email: string;
    phone: string;
    gender: string;
    photo: string;
    year: string;
    role: string;
}

const YearInchargeProfile: React.FC = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<YearIncharge>({
        name: '',
        email: '',
        phone: '',
        gender: '',
        photo: '',
        year: '',
        role: ''
    });

    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [imageError, setImageError] = useState<string>("");

    // For file upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const calculateCompletion = (data: YearIncharge) => {
        const fields = ['name', 'email', 'phone', 'gender', 'year', 'photo'];
        let completed = 0;

        fields.forEach(field => {
            const value = data[field as keyof YearIncharge];
            if (value && value.trim() !== '') {
                completed++;
            }
        });

        setCompletionPercentage(Math.round((completed / 6) * 100));
    };

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/year-incharge-login');
            return;
        }

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/incharge/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 200) {
                // Handle the nested yearincharge object structure
                const data = response.data.yearincharge || response.data;
                const profileData = {
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    gender: data.gender || 'male',
                    photo: data.photo || '',
                    year: data.year || '',
                    role: data.role || ''
                };
                setProfile(profileData);
                setPreviewImage(data.photo || '');
                calculateCompletion(profileData);
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: Max 200KB
        if (file.size > 200 * 1024) {
            const errorMsg = "Image size must be 200KB or less";
            setImageError(errorMsg);
            toast.error(errorMsg);
            setSelectedFile(null);
            // Revert to original
            setPreviewImage(profile.photo);
            // Reset input value
            e.target.value = '';
            return;
        }

        // Validation: Type
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            const errorMsg = "Only JPG, JPEG, and PNG formats are allowed";
            setImageError(errorMsg);
            toast.error(errorMsg);
            setSelectedFile(null);
            setPreviewImage(profile.photo);
            e.target.value = '';
            return;
        }

        // All good
        setImageError("");
        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (imageError) {
            toast.error("Please fix the image error before saving.");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('email', profile.email);
            formData.append('phone', profile.phone);
            formData.append('gender', profile.gender);
            // Year and Role are typically immutable by the user, so not appending them

            if (selectedFile) {
                formData.append('photo', selectedFile);
            }

            // Using FormData for single request update including image
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/incharge/profile/update`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 200) {
                toast.success("Profile updated successfully");
                setIsEditing(false);
                setSelectedFile(null);
                setImageError("");
                // Optionally refresh to get the returned URLs/data ensuring consistency
                fetchProfile();
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update profile");
        }
    };

    if (loading) return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader />
        </div>
    );

    return (
        <div className="page-container profile-page">
            <YearInchargeNav />
            <ToastContainer position="bottom-right" />

            <div className="content-wrapper">
                {/* Profile Completion Indicator */}
                <div className="completion-section">
                    <div className="completion-header">
                        <h3>Profile Completion</h3>
                        <span className="completion-text">{completionPercentage}% Completed</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <button className="back-btn" onClick={() => navigate('/year-incharge-dashboard')}>
                    ← Back to Dashboard
                </button>

                <div className="profile-layout">
                    {/* Left Column: Sidebar with Avatar */}
                    <div className="profile-sidebar">
                        <div className="card profile-card">
                            <div className="profile-header">
                                <div className="avatar-container">
                                    <img
                                        src={previewImage || jitProfile}
                                        alt="Profile"
                                        className="profile-avatar"
                                        onError={(e) => { e.currentTarget.src = jitProfile; }}
                                    />
                                    {isEditing && (
                                        <label className="avatar-upload">
                                            <span>📷</span>
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                onChange={handleImageChange}
                                                className="hidden-input"
                                            />
                                        </label>
                                    )}
                                </div>
                                {imageError && <p className="error-text">{imageError}</p>}
                                <h2 className="profile-name">{profile.name}</h2>
                                <p className="profile-role">Year Incharge</p>
                            </div>

                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="btn btn-primary w-full">
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="action-buttons">
                                    <button onClick={handleSave} className="btn btn-primary" disabled={!!imageError}>
                                        Save Changes
                                    </button>
                                    <button onClick={() => {
                                        setIsEditing(false);
                                        setPreviewImage(profile.photo); // Revert preview
                                        setSelectedFile(null);
                                        setImageError("");
                                    }} className="btn btn-ghost">Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details Form */}
                    <div className="profile-main">
                        <div className="card details-card">
                            <div className="card-header">
                                <h3>Personal Information</h3>
                                <p className="text-muted">Manage your personal details.</p>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        disabled={!isEditing} // User requested editable
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={profile.gender}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Year / Block</label>
                                    <input
                                        type="text"
                                        name="year"
                                        value={profile.year}
                                        disabled={true}
                                        className="input"
                                        style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .page-container {
                    min-height: 100vh;
                    background: #f1f5f9;
                }

                .content-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 30px 20px;
                }
                
                .error-text {
                    color: #ef4444;
                    font-size: 0.85rem;
                    margin: -10px 0 16px;
                    font-weight: 500;
                }

                .completion-section {
                    background: white;
                    padding: 20px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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
                    font-weight: 600;
                }

                .completion-text {
                    color: #0047AB;
                    font-weight: 700;
                    font-size: 1rem;
                }

                .progress-bar-bg {
                    width: 100%;
                    height: 10px;
                    background: #e2e8f0;
                    border-radius: 999px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: #0047AB;
                    border-radius: 999px;
                    transition: width 0.5s ease-out;
                }

                .content-wrapper .back-btn {
                    background: none;
                    border: none;
                    font-size: 1rem;
                    color: #64748b;
                    cursor: pointer;
                    margin-bottom: 24px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    transition: color 0.2s;
                }
                .content-wrapper .back-btn:hover { color: #0047AB; }

                .profile-layout {
                    display: grid;
                    /* Layout defined in media queries */
                }

                .content-wrapper .card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }

                .profile-card {
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .profile-header {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .avatar-container {
                    position: relative;
                    width: 140px;
                    height: 140px;
                    margin: 0 auto 20px;
                }

                .profile-avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid white;
                    box-shadow: 0 0 0 4px #e0e7ff;
                }

                .avatar-upload {
                    position: absolute;
                    bottom: 5px;
                    right: 5px;
                    background: #0047AB;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 3px solid white;
                    transition: transform 0.2s;
                    color: white;
                    font-size: 1.2rem;
                }
                .avatar-upload:hover { transform: scale(1.1); }
                
                .hidden-input { display: none; }

                .profile-name {
                    font-size: 1.5rem;
                    color: #1e293b;
                    margin: 0 0 4px;
                    font-weight: 700;
                }

                .profile-role {
                    color: #64748b;
                    font-size: 0.95rem;
                    margin-bottom: 20px;
                }

                .details-card {
                    padding: 32px;
                }

                .card-header {
                    margin-bottom: 24px;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 16px;
                }

                .card-header h3 {
                    font-size: 1.25rem;
                    color: #1e293b;
                    margin: 0 0 4px;
                    font-weight: 600;
                }

                .text-muted {
                    color: #64748b;
                    font-size: 0.9rem;
                    margin: 0;
                }

                .form-grid {
                    display: grid;
                    /* Layout defined in media queries */
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #475569;
                }

                .content-wrapper .input {
                    padding: 10px 16px;
                    border: 1px solid #cbd5e1;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    transition: all 0.2s;
                    width: 100%; /* Ensure inputs take full width of their container */
                    box-sizing: border-box; /* Good practice */
                }

                .content-wrapper .input:disabled {
                    background: #f8fafc;
                    color: #64748b;
                    cursor: not-allowed;
                }

                .content-wrapper .input:focus {
                    outline: none;
                    border-color: #0047AB;
                    box-shadow: 0 0 0 3px rgba(0, 71, 171, 0.1);
                }

                /* Scoped Button Styles */
                .content-wrapper .btn {
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    font-size: 0.95rem;
                }

                .content-wrapper .btn-primary {
                    background: #0047AB;
                    color: white;
                }
                .content-wrapper .btn-primary:hover {
                    background: #1e40af;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.2);
                }

                .content-wrapper .btn-ghost {
                    background: transparent;
                    color: #64748b;
                    border: 1px solid #cbd5e1;
                }
                .content-wrapper .btn-ghost:hover {
                    background: #f1f5f9;
                    color: #475569;
                }

                .w-full { width: 100%; }
                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .loading-screen {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    color: #64748b;
                }

/* Mobile First / Common Styles */
                .profile-layout {
                    display: grid;
                    /* Layout defined in media queries */
                }
                .form-grid {
                    display: grid;
                    /* Layout defined in media queries */
                }

                /* Desktop View (>= 769px) */
                @media (min-width: 769px) {
                    .profile-layout {
                        grid-template-columns: 350px 1fr;
                        gap: 32px;
                    }
                    .form-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 24px;
                    }
                }

                /* Mobile View (<= 768px) */
                @media (max-width: 768px) {
                    .profile-layout {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    .form-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }

                    .content-wrapper {
                        padding: 16px;
                    }

                    .content-wrapper .card {  /* Update usage in media query too if selector changed */
                        padding: 24px 20px;
                        border-radius: 16px;
                    }
                    /* .profile-card and .details-card are specific classes, but .card is the base */
                    /* Wait, .profile-card and .details-card were used in previous CSS */

                    .profile-card,
                    .details-card { /* These are specific enough? They were not prefixed before. */
                        padding: 24px 20px;
                        /* border-radius inherited from .card */
                    }

                    .avatar-container {
                        width: 120px;
                        height: 120px;
                        margin-bottom: 16px;
                    }

                    .profile-name {
                        font-size: 1.35rem;
                    }

                    .profile-role {
                        margin-bottom: 16px;
                        font-size: 0.9rem;
                    }

                    .content-wrapper .btn {
                        width: 100%;
                        padding: 14px 20px;
                        font-size: 1rem;
                        display: flex;
                        justify-content: center;
                    }
                    
                    .action-buttons {
                        width: 100%;
                    }

                    .content-wrapper .input {
                        font-size: 16px;
                        padding: 12px;
                    }
                    
                    .content-wrapper .back-btn {
                        margin-bottom: 16px;
                    }
                }
            `}</style>
        </div>
    );
};

export default YearInchargeProfile;
