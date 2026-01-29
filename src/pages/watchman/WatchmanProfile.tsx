import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/WatchmanNav";
import Toast from "../../components/Toast";
import watchmanProfile from "../../assets/jit.webp"; // Using placeholder for now
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

interface Watchman {
    name: string;
    email: string;
    phone: string;
    photo: string;
}

const WatchmanProfile: React.FC = () => {
    const navigate = useNavigate();
    const [watchman, setWatchman] = useState<Watchman>({
        name: "",
        email: "",
        phone: "",
        photo: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/watchman/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.status === 200) {
                setWatchman(response.data.watchman);
            }
        } catch (err) {
            toast.error("Failed to load profile");
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setWatchman((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append("name", watchman.name);
        formData.append("email", watchman.email);
        formData.append("phone", watchman.phone);
        if (selectedFile) {
            formData.append("photo", selectedFile);
        }

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/watchman/profile/update`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Profile updated");
                setShowToast(true);
                setIsEditing(false);
                // Optionally refresh profile to get the new image URL from server
                fetchProfile();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        }
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
            <ToastContainer/>

            <div className="content-wrapper">
                <button className="back-btn" onClick={() => navigate('/watchman-dashboard')}>
                    ← Back
                </button>
                <div className="profile-layout">
                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <div className="card profile-card">
                            <div className="profile-header">
                                <div className="avatar-container">
                                    <img
                                        src={previewUrl || watchman.photo || watchmanProfile}
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

                                <h2 className="profile-name">{watchman.name}</h2>

                                <div className="profile-badges">
                                    <span className="badge">Watchman</span>
                                </div>
                            </div>

                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-primary w-full"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="action-buttons">
                                    <button onClick={handleSave} className="btn btn-primary">
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="btn btn-ghost"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main */}
                    <div className="profile-main">
                        <div className="card details-card">
                            <div className="card-header">
                                <h3>Personal Information</h3>
                                <p className="text-muted" style={{ marginTop: '16px', marginBottom: '16px' }}>
                                    Manage your personal and contact details.
                                </p>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={watchman.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="text"
                                        name="email"
                                        value={watchman.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={watchman.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <style>{`
        
        button.back-btn {
          background: white;
          border: 1px solid #cbd5e1;
          color: #1e293b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }

        button.back-btn:hover {
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          transform: translateY(-1px);
          background: #f8fafc;
        }

        .profile-page { margin-top: 10px; }
        .profile-layout { display: grid; grid-template-columns: 350px 1fr; gap: 32px; }
        .profile-card { text-align: center; }
        .avatar-container { position: relative; width: 120px; height: 120px; margin: 0 auto 16px; }
        .profile-header { display: flex; flex-direction: column; align-items: center; }
        .profile-badges { margin-top: 10px; }
        .profile-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 0 0 4px var(--primary-light); }
        .avatar-upload { position: absolute; bottom: 0; right: 0; background: var(--primary); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid white; transition: var(--transition); }
        .avatar-upload:hover { transform: scale(1.1); }
        .hidden-input { display: none; }
        .w-full { width: 100%; }
        .action-buttons { display: flex; flex-direction: column; gap: 8px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 968px) {
          .profile-layout { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .page-container { padding: 16px; }
          .profile-card, .details-card { padding: 20px; }
          .avatar-container { width: 100px; height: 100px; }
          .profile-header h2 { font-size: 1.25rem; margin-bottom: 2px; }
          .profile-role { margin-bottom: 2px; }
          .profile-badges { margin-top: 8px; }
          .input { font-size: 14px; padding: 10px; }
        }
      `}</style>
        </div>
    );
};

export default WatchmanProfile;
