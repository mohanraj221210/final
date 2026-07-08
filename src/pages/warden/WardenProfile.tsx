import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/WardenNav";
import Toast from "../../components/Toast";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Camera } from "lucide-react";

import ImageCropper from "../../components/ImageCropper";
import imageCompression from 'browser-image-compression';

interface Warden {
  name: string;
  // staffId: string;
  // department: string;
  hostelname: string;
  email: string;
  phone: string;
  photo: string;
  // designation: string;
  gender: string;
}

const WardenProfile: React.FC = () => {
  const navigate = useNavigate();
  const [warden, setWarden] = useState<Warden>({
    name: "",
    // staffId: "",
    // department: "",
    hostelname: "",
    email: "",
    phone: "",
    photo: "",
    // designation: "Warden",
    gender: "male",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());

  // Calculate completion percentage
  const calculateCompletion = (wardenData: Warden) => {
    const requiredFields = ['name', 'email', 'phone', 'gender', 'hostelname'];

    // Filter out fields that are present and not empty
    const filledFields = requiredFields.filter(field => {
      const value = wardenData[field as keyof Warden];
      return value !== null && value !== undefined && value !== '' && value !== 'N/A';
    });

    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    setCompletionPercentage(calculateCompletion(warden));
  }, [warden]);

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/warden/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const data = response.data.warden;
        if (data.gender === "undefined" || !data.gender) {
          data.gender = "male";
        }
        setWarden(data);
        // toast.success("Warden profile loaded");
      }
    } catch (err) {
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setWarden((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB");
      e.target.value = "";
      return;
    }

    // Validation: Allowed types
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG formats are allowed");
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setTempImage(objectUrl);
    setShowCropper(true);
    e.target.value = "";
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

      setSelectedPhoto(compressedBlob);

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
    if (selectedPhoto) {
      formData.append("photo", selectedPhoto);
    }
    formData.append("name", warden.name);
    formData.append("hostelname", warden.hostelname);
    formData.append("email", warden.email);
    formData.append("phone", warden.phone);
    formData.append("gender", warden.gender);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/warden/profile/update`,
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
        fetchProfile(); // Refresh data from server
        setPreviewUrl(null); // Clear preview 
        setSelectedPhoto(null);
        setImageRefreshKey(Date.now());
      }
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="page-container profile-page">
      <Nav />
      <ToastContainer />

      {showToast && (
        <Toast
          message="Profile updated successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="content-wrapper">
        <button className="back-btn" onClick={() => navigate('/warden-dashboard')}>
          ← Back
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
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="card profile-card">
              <div className="profile-header">
                <div className="avatar-container">
                  {previewUrl || (warden.photo && warden.photo.trim() !== '') ? (
                    <img
                      key={`${previewUrl || warden.photo}-${imageRefreshKey}`}
                      src={
                        previewUrl ||
                        (warden.photo
                          ? warden.photo.startsWith("blob:") ||
                            warden.photo.startsWith("http")
                            ? warden.photo
                            : `${('').replace(/\/$/, '')}/${warden.photo.replace(/^\//, '')}?t=${imageRefreshKey}`
                          : "")
                      }
                      alt="Profile"
                      className="profile-avatar"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="profile-initials-avatar">
                      {(() => {
                        const name = warden.name;
                        if (!name || name.trim() === '') {
                          return (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="60%" height="60%">
                              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                            </svg>
                          );
                        }
                        const initials = name
                          .trim()
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase();
                        return initials;
                      })()}
                    </div>
                  )}

                  {/* Fallback for onError */}
                  <div className="profile-initials-avatar hidden">
                    {(() => {
                      const name = warden.name;
                      if (!name || name.trim() === '') {
                        return (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="60%" height="60%">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                          </svg>
                        );
                      }
                      const initials = name
                        .trim()
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();
                      return initials;
                    })()}
                  </div>

                  {isEditing && (
                    <label className="avatar-upload" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Camera size={20} />

                      <input
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={handleImageUpload}
                        className="hidden-input"
                      />
                    </label>
                  )}
                </div>

                <h2 className="profile-name">{warden.name}</h2>
                {/* <p className="profile-role">{warden.designation}</p> */}

                <div className="profile-badges">
                  <span className="badge">Warden</span>
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
                    onClick={() => {
                      setIsEditing(false);
                      setPreviewUrl(null);
                      setSelectedPhoto(null);
                      fetchProfile(); // Reset form data
                    }}
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
                    value={warden.name}
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
                    value={warden.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Hostel Name</label>
                  <select
                    name="hostelname"
                    value={warden.hostelname}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input"
                  >
                    <option value="" disabled>Select Hostel</option>
                    <option value="Boys Hostel">Boys Hostel</option>
                    <option value="Girls Hostel">Girls Hostel</option>
                  </select>
                </div>

                {/* <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={warden.designation}
                    disabled
                    className="input"
                  />
                </div> */}

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={warden.gender?.toLowerCase() || 'male'}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={warden.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input"
                  />
                </div> */}

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={warden.phone}
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


      {showCropper && tempImage && (
        <ImageCropper
          imageSrc={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <style>{`
        /* ====== DESIGN TOKENS ====== */
        .profile-page {
          --wdl-primary:       #3B82F6;
          --wdl-primary-light: #60A5FA;
          --wdl-bg:            linear-gradient(180deg, #F8FBFF 0%, #EFF6FF 55%, #F6FAFF 100%);
          --wdl-card:          rgba(255, 255, 255, 0.92);
          --wdl-blur:          20px;
          --wdl-border:        1px solid rgba(59, 130, 246, 0.15);
          --wdl-shadow:        0 18px 50px rgba(59, 130, 246, 0.12);
          --wdl-radius:        28px;
          --wdl-radius-sm:     16px;
          --wdl-transition:    all 0.25s cubic-bezier(0.16,1,0.3,1);

          min-height: 100vh;
          background: var(--wdl-bg);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding-top: var(--nav-height, 64px);
          padding-bottom: calc(100px + env(safe-area-inset-bottom));
        }

        .content-wrapper {
          padding: 32px 40px;
          max-width: var(--content-max, 1200px);
          margin: 0 auto;
          animation: wdpFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes wdpFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }

        /* ====== BACK BUTTON ====== */
        button.back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(59, 130, 246, 0.15);
          color: var(--wdl-primary);
          font-size: 0.85rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 100px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.06);
          transition: var(--wdl-transition);
          font-family: inherit;
          margin-bottom: 24px;
        }

        button.back-btn:hover {
          background: white;
          transform: translateX(-4px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.12);
        }

        /* ====== COMPLETION CARD ====== */
        .completion-card {
          background: var(--wdl-card);
          backdrop-filter: blur(var(--wdl-blur));
          -webkit-backdrop-filter: blur(var(--wdl-blur));
          border: var(--wdl-border);
          border-radius: var(--wdl-radius-sm);
          padding: 24px;
          margin-bottom: 28px;
          box-shadow: var(--wdl-shadow);
        }

        .completion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .completion-header h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.01em;
        }

        .completion-badge {
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 800;
          color: var(--wdl-primary);
          font-size: 0.85rem;
        }

        .progress-container {
          height: 8px;
          background: rgba(226, 232, 240, 0.8);
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-bar {
          height: 100%;
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 99px;
        }

        .completion-text {
          margin: 0;
          font-size: 0.85rem;
          color: #64748B;
          font-weight: 500;
        }

        /* ====== LAYOUT & CARDS ====== */
        .profile-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 32px;
        }

        .card {
          background: var(--wdl-card);
          backdrop-filter: blur(var(--wdl-blur));
          -webkit-backdrop-filter: blur(var(--wdl-blur));
          border: var(--wdl-border);
          border-radius: var(--wdl-radius);
          box-shadow: var(--wdl-shadow);
          padding: 32px 24px;
        }

        .profile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .hidden-input {
          display: none;
        }

        .avatar-container {
          position: relative;
          width: 128px;
          height: 128px;
          margin: 0 auto 20px;
        }

        .profile-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid white;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
          background: white;
        }

        .profile-initials-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .hidden {
          display: none !important;
        }

        .avatar-upload {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          transition: var(--wdl-transition);
          color: white;
          font-size: 0.95rem;
        }

        .avatar-upload:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 14px rgba(59, 130, 246, 0.3);
        }

        .profile-name {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }

        .profile-badges {
          margin-bottom: 24px;
        }

        .profile-badges .badge {
          background: rgba(59, 130, 246, 0.08);
          color: var(--wdl-primary);
          padding: 4px 14px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* ====== BUTTONS ====== */
        .btn {
          padding: 12px 24px;
          font-size: 0.88rem;
          font-weight: 700;
          border-radius: 14px;
          cursor: pointer;
          transition: var(--wdl-transition);
          border: none;
          font-family: inherit;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .btn-ghost {
          background: rgba(241, 245, 249, 0.8);
          color: #64748B;
        }

        .btn-ghost:hover {
          background: rgba(226, 232, 240, 0.8);
          color: #334155;
        }

        .w-full {
          width: 100%;
          box-sizing: border-box;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .action-buttons .btn {
          width: 100%;
        }

        /* ====== DETAILS CARD & FORM ====== */
        .details-card {
          padding: 32px 36px;
        }

        .card-header h3 {
          margin: 0 0 6px;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.01em;
        }

        .card-header .text-muted {
          font-size: 0.9rem;
          color: #64748B;
          margin: 0;
          font-weight: 500;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .input {
          padding: 12px 16px;
          background: var(--wdl-card);
          border: var(--wdl-border);
          border-radius: 14px;
          font-size: 0.92rem;
          font-weight: 600;
          color: #334155;
          outline: none;
          transition: var(--wdl-transition);
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.02);
        }

        .input:focus:not(:disabled) {
          border-color: var(--wdl-primary);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
          background: white;
        }

        .input:disabled {
          background: rgba(248, 250, 252, 0.5);
          color: #64748B;
          cursor: not-allowed;
          border-color: rgba(226, 232, 240, 0.8);
        }

        select.input {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          padding-right: 44px;
          cursor: pointer;
        }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 968px) {
          .content-wrapper {
            padding: 24px;
          }
          
          .profile-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .details-card {
            padding: 28px 24px;
          }
        }

        @media (max-width: 480px) {
          .content-wrapper {
            padding: 16px 16px 0;
          }
          
          .card {
            padding: 24px 18px;
            border-radius: 20px;
          }
          
          .avatar-container {
            width: 110px;
            height: 110px;
          }

          .profile-initials-avatar {
            font-size: 2.5rem;
          }

          .profile-name {
            font-size: 1.2rem;
          }

          button.back-btn {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default WardenProfile;
