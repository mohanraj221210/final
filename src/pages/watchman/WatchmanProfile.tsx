import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/WatchmanNav";
import Toast from "../../components/Toast";
import watchmanProfile from "../../assets/jit.webp";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";
import ImageCropper from "../../components/ImageCropper";
import imageCompression from 'browser-image-compression';

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
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);

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
        } finally {
            setLoading(false);
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

        // Validation: Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5 MB");
            e.target.value = ""; // Reset input
            return;
        }

        // Validation: Only JPEG and PNG
        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
            toast.error("Only JPG, JPEG, and PNG formats are allowed");
            e.target.value = ""; // Reset input
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

            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(compressedBlob);

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
                fetchProfile();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="sd-root">
            <Nav />

            {showToast && (
                <Toast
                    message="Profile updated successfully!"
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}
            <ToastContainer />

            <main className="sd-main">
                <div className="sd-container">
                    
                    {/* Header Row */}
                    <div className="sd-header-row">
                        <div>
                            <button className="sd-back-btn" onClick={() => navigate('/watchman-dashboard')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                                </svg>
                                Back to Dashboard
                            </button>
                            <h1 className="sd-title">Profile Settings</h1>
                            <p className="sd-subtitle">Manage security account credentials and details</p>
                        </div>
                    </div>

                    {/* Profile Split Grid */}
                    <div className="sd-profile-layout">
                        
                        {/* Sidebar: Profile Card */}
                        <div className="sd-profile-sidebar-card">
                            <div className="sd-avatar-uploader-container">
                                <div className="sd-profile-avatar-wrapper">
                                    <img
                                        src={previewUrl || `${import.meta.env.VITE_CDN_URL}${watchman.photo}` || watchmanProfile}
                                        alt="Profile"
                                        className="sd-profile-img"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = watchmanProfile;
                                        }}
                                    />
                                    {isEditing && (
                                        <label className="sd-avatar-upload-overlay">
                                            <span className="sd-upload-icon">📷</span>
                                            <input
                                                type="file"
                                                accept="image/jpeg, image/png"
                                                onChange={handleImageUpload}
                                                className="hidden-input"
                                            />
                                        </label>
                                    )}
                                </div>

                                <h2 className="sd-sidebar-name">{watchman.name || "Security Officer"}</h2>
                                
                                <div className="sd-sidebar-badge-row">
                                    <span className="sd-sidebar-badge">👮 Security Gate</span>
                                </div>
                            </div>

                            <div className="sd-sidebar-actions">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="sd-profile-btn sd-btn-primary"
                                    >
                                        Edit Credentials
                                    </button>
                                ) : (
                                    <div className="sd-action-buttons-group">
                                        <button onClick={handleSave} className="sd-profile-btn sd-btn-primary">
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => { setIsEditing(false); setPreviewUrl(null); setSelectedFile(null); }}
                                            className="sd-profile-btn sd-btn-ghost"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Content Area: Forms */}
                        <div className="sd-profile-content-card">
                            <div className="sd-card-section-header">
                                <span className="sd-section-icon-badge">👤</span>
                                <div>
                                    <h3>Personal Credentials</h3>
                                    <p className="sd-card-section-desc">Keep your details up to date for campus notifications.</p>
                                </div>
                            </div>

                            <div className="sd-form-grid">
                                <div className="sd-input-group">
                                    <label className="sd-label">Full Name</label>
                                    <div className="sd-input-wrapper">
                                        <span className="sd-input-icon">👤</span>
                                        <input
                                            type="text"
                                            name="name"
                                            value={watchman.name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="sd-input"
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                </div>

                                <div className="sd-input-group">
                                    <label className="sd-label">Email ID</label>
                                    <div className="sd-input-wrapper">
                                        <span className="sd-input-icon">✉️</span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={watchman.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="sd-input"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                </div>

                                <div className="sd-input-group">
                                    <label className="sd-label">Mobile Number</label>
                                    <div className="sd-input-wrapper">
                                        <span className="sd-input-icon">📞</span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={watchman.phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="sd-input"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {showCropper && tempImage && (
                <ImageCropper
                    imageSrc={tempImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            <style>{`
                /* ====== LAYOUT & BASE ====== */
                .sd-root {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 45%, #DBEAFE 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    padding-top: var(--nav-height, 64px);
                    padding-bottom: 80px;
                }

                .sd-main {
                    padding: 24px 32px;
                    max-width: var(--content-max, 1280px);
                    margin: 0 auto;
                }

                .sd-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                /* ====== HEADER ROW ====== */
                .sd-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap;
                }

                .sd-back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    border: 1px solid #E2E8F0;
                    color: #3B82F6;
                    font-size: 0.85rem;
                    font-weight: 700;
                    padding: 10px 18px;
                    border-radius: 100px;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                    transition: all 0.2s ease;
                    font-family: inherit;
                }

                .sd-back-btn:hover {
                    background: #EFF6FF;
                    transform: translateX(-4px);
                    box-shadow: 0 6px 12px rgba(59, 130, 246, 0.08);
                }

                .sd-title {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 12px 0 4px;
                    letter-spacing: -0.02em;
                }

                .sd-subtitle {
                    font-size: 0.9rem;
                    color: #64748B;
                    margin: 0;
                    font-weight: 500;
                }

                /* ====== PROFILE SPLIT GRID ====== */
                .sd-profile-layout {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 24px;
                    align-items: start;
                }

                /* Sidebar Profile Card */
                .sd-profile-sidebar-card {
                    background: rgba(255, 255, 255, 0.92);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    border-radius: 24px;
                    padding: 32px 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(226,232,240,0.5);
                    text-align: center;
                }

                .sd-avatar-uploader-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 28px;
                }

                .sd-profile-avatar-wrapper {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    overflow: hidden;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
                    border: 4px solid white;
                    margin-bottom: 16px;
                }

                .sd-profile-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .sd-avatar-upload-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .sd-profile-avatar-wrapper:hover .sd-avatar-upload-overlay {
                    opacity: 1;
                }

                .sd-upload-icon {
                    font-size: 1.8rem;
                }

                .hidden-input {
                    display: none;
                }

                .sd-sidebar-name {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0 0 6px;
                }

                .sd-sidebar-badge-row {
                    display: flex;
                    justify-content: center;
                }

                .sd-sidebar-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    background: #EFF6FF;
                    color: #3B82F6;
                    border: 1px solid rgba(59,130,246,0.1);
                }

                .sd-sidebar-actions {
                    width: 100%;
                }

                .sd-action-buttons-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                /* PROFILE BUTTONS */
                .sd-profile-btn {
                    width: 100%;
                    padding: 12px 20px;
                    border-radius: 12px;
                    font-size: 0.88rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    font-family: inherit;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .sd-btn-primary {
                    background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
                    color: white;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                }

                .sd-btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
                }

                .sd-btn-primary:active {
                    transform: translateY(0);
                }

                .sd-btn-ghost {
                    background: transparent;
                    color: #64748B;
                    border: 1px solid #E2E8F0;
                }

                .sd-btn-ghost:hover {
                    background: #F1F5F9;
                    color: #334155;
                }

                /* Main Profile Card Content */
                .sd-profile-content-card {
                    background: rgba(255, 255, 255, 0.92);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    border-radius: 24px;
                    padding: 32px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(226,232,240,0.5);
                }

                .sd-card-section-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    border-bottom: 1px solid #F1F5F9;
                    padding-bottom: 18px;
                    margin-bottom: 24px;
                }

                .sd-section-icon-badge {
                    font-size: 1.3rem;
                    background: #EFF6FF;
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(59,130,246,0.08);
                    flex-shrink: 0;
                }

                .sd-card-section-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #0F172A;
                }

                .sd-card-section-desc {
                    margin: 2px 0 0;
                    font-size: 0.8rem;
                    color: #64748B;
                    font-weight: 500;
                }

                .sd-form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .sd-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .sd-input-group .sd-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #94A3B8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .sd-input-wrapper {
                    position: relative;
                }

                .sd-input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94A3B8;
                    font-size: 0.95rem;
                    pointer-events: none;
                }

                .sd-input {
                    width: 100%;
                    height: 46px;
                    padding: 10px 16px 10px 42px;
                    background: #F8FAFC;
                    border: 1.5px solid #E2E8F0;
                    border-radius: 12px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: #334155;
                    outline: none;
                    transition: all 0.2s ease;
                    font-family: inherit;
                    box-sizing: border-box;
                }

                .sd-input:focus:not(:disabled) {
                    border-color: #3B82F6;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .sd-input:disabled {
                    background: #F1F5F9;
                    color: #94A3B8;
                    cursor: not-allowed;
                    border-color: #E2E8F0;
                }

                .sd-mono {
                    font-family: 'SF Mono', 'Fira Code', monospace;
                }

                /* ====== RESPONSIVE ====== */
                @media (max-width: 968px) {
                    .sd-profile-layout {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    .sd-form-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 480px) {
                    .sd-profile-sidebar-card {
                        padding: 24px 16px;
                    }
                    .sd-profile-content-card {
                        padding: 24px 16px;
                    }
                    .sd-input {
                        height: 42px;
                        font-size: 0.82rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default WatchmanProfile;
