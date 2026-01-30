import React, { useState, useEffect } from 'react';
import YearInchargeNav from '../../components/YearInchargeNav';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import jitProfile from '../../assets/jit.webp'; // Fallback image similar to WardenProfile

interface YearIncharge {
    name: string;
    email: string;
    phone: string;
    gender: string;
    photo: string;
    department?: string; // Keep for fetching but don't display/edit
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
        photo: ''
    });

    // For file upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>("");

    useEffect(() => {
        fetchProfile();
    }, []);

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
                const data = response.data.user || response.data;
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    gender: data.gender || 'male',
                    photo: data.photo || ''
                });
                setPreviewImage(data.photo || '');
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
            toast.error("Image size must be 200KB or less");
            return;
        }

        // Validation: Type
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            toast.error("Only JPG, JPEG, and PNG formats are allowed");
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        try {
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('email', profile.email);
            formData.append('phone', profile.phone);
            formData.append('gender', profile.gender);

            if (selectedFile) {
                formData.append('photo', selectedFile);
            }

            // Using FormData for single request update including image
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/incharge/profile/update`,
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
                // Optionally refresh to get the returned URLs/data ensuring consistency
                fetchProfile();
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update profile");
        }
    };

    if (loading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="page-container profile-page">
            <YearInchargeNav />
            <ToastContainer position="bottom-right" />

            <div className="content-wrapper">
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
                                <h2 className="profile-name">{profile.name}</h2>
                                <p className="profile-role">Year Incharge</p>
                            </div>

                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="btn btn-primary w-full">
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="action-buttons">
                                    <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                                    <button onClick={() => {
                                        setIsEditing(false);
                                        setPreviewImage(profile.photo); // Revert preview
                                        setSelectedFile(null);
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

                .back-btn {
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
                .back-btn:hover { color: #0047AB; }

                .profile-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 32px;
                }

                .card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }

                .profile-card {
                    padding: 32px;
                    text-align: center;
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
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
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

                .input {
                    padding: 10px 16px;
                    border: 1px solid #cbd5e1;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    transition: all 0.2s;
                }

                .input:disabled {
                    background: #f8fafc;
                    color: #64748b;
                    cursor: not-allowed;
                }

                .input:focus {
                    outline: none;
                    border-color: #0047AB;
                    box-shadow: 0 0 0 3px rgba(0, 71, 171, 0.1);
                }

                .btn {
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    font-size: 0.95rem;
                }

                .btn-primary {
                    background: #0047AB;
                    color: white;
                }
                .btn-primary:hover {
                    background: #1e40af;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.2);
                }

                .btn-ghost {
                    background: transparent;
                    color: #64748b;
                    border: 1px solid #cbd5e1;
                }
                .btn-ghost:hover {
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

                @media (max-width: 900px) {
                    .profile-layout {
                        grid-template-columns: 1fr;
                    }
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default YearInchargeProfile;
