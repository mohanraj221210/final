import React, { useState, useEffect } from 'react';
import YearInchargeNav from '../../components/YearInchargeNav';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const YearInchargeProfile: React.FC = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        gender: '',
        photo: ''
    });

    // To handle image preview
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
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    department: data.department || '',
                    gender: data.gender || '',
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreviewImage(base64String);
                setFormData(prev => ({ ...prev, photo: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/incharge/profile/update`,
                formData,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.status === 200) {
                toast.success("Profile updated successfully");
                setIsEditing(false);
                fetchProfile(); // Refresh data
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update profile");
        }
    };

    return (
        <div className="page-container">
            <ToastContainer position="bottom-right" />
            <YearInchargeNav />
            <div className="content-wrapper">
                <button className="back-btn" onClick={() => navigate('/year-incharge-dashboard')}>
                    ← Back to Dashboard
                </button>
                <div className="profile-container">
                    <div className="hero-banner">
                        <div className="profile-image-wrapper">
                            {previewImage ? (
                                <img src={previewImage} alt="Profile" className="profile-img-lg" />
                            ) : (
                                <div className="placeholder-avatar">
                                    {formData.name.charAt(0)}
                                </div>
                            )}
                            {isEditing && (
                                <label className="edit-photo-btn">
                                    📷
                                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="profile-form-card">
                        <div className="form-header">
                            <div>
                                <h2>{formData.name}</h2>
                                <p className="text-muted">Year Incharge • {formData.department}</p>
                            </div>
                            <button
                                className={`btn ${isEditing ? 'btn-save' : 'btn-edit'}`}
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            >
                                {isEditing ? 'Save Changes' : 'Edit Profile'}
                            </button>
                        </div>

                        {loading ? <p>Loading...</p> : (
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email ID</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled={true} // Usually email is not editable
                                        className="disabled-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        value={formData.gender}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {isEditing && (
                            <button
                                className="btn-cancel"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .profile-container {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .back-btn {
                    background: none;
                    border: none;
                    font-size: 16px;
                    color: #64748b;
                    cursor: pointer;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: color 0.3s;
                    padding: 0;
                    font-weight: 500;
                }
                .back-btn:hover {
                    color: #1e3a8a;
                    transform: translateX(-4px);
                }

                .hero-banner {
                    height: 160px;
                    background: linear-gradient(135deg, #1e3a8a, #3b82f6);
                    border-radius: 24px 24px 0 0;
                    position: relative;
                    margin-bottom: 60px;
                }

                .profile-image-wrapper {
                    position: absolute;
                    bottom: -50px;
                    left: 40px;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    border: 4px solid white;
                    background: white;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .profile-img-lg {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .placeholder-avatar {
                    width: 100%;
                    height: 100%;
                    background: #e2e8f0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    color: #94a3b8;
                    font-weight: 700;
                }

                .edit-photo-btn {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: #3b82f6;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .edit-photo-btn:hover {
                    transform: scale(1.1);
                }

                .profile-form-card {
                    background: white;
                    border-radius: 0 0 24px 24px;
                    padding: 24px 40px 40px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .form-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 32px;
                    padding-left: 140px; /* Space for avatar */
                }

                .form-header h2 {
                    font-size: 1.8rem;
                    color: #1e293b;
                    margin-bottom: 4px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .form-group input, .form-group select {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .form-group input:disabled, .form-group select:disabled {
                    background: #f8fafc;
                    color: #64748b;
                    cursor: not-allowed;
                }

                .form-group input:not(:disabled):focus, .form-group select:not(:disabled):focus {
                    border-color: #3b82f6;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .btn {
                    padding: 10px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }

                .btn-edit {
                    background: #eff6ff;
                    color: #3b82f6;
                }

                .btn-edit:hover {
                    background: #dbeafe;
                }

                .btn-save {
                    background: #3b82f6;
                    color: white;
                }

                .btn-save:hover {
                    background: #2563eb;
                }
                
                .btn-cancel {
                    margin-top: 20px;
                    background: transparent;
                    border: 1px solid #ef4444;
                    color: #ef4444;
                    padding: 10px 24px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    width: 100%;
                }
                
                .btn-cancel:hover {
                    background: #fef2f2;
                }

                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .form-header {
                        flex-direction: column;
                        padding-left: 0;
                        margin-top: 60px;
                        gap: 16px;
                        text-align: center;
                        align-items: center;
                    }
                    .profile-image-wrapper {
                        left: 50%;
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </div>
    );
};

export default YearInchargeProfile;
