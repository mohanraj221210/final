import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/WardenNav";
import Toast from "../../components/Toast";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
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
                      src={
                        previewUrl ||
                        (warden.photo
                          ? warden.photo.startsWith("data:") ||
                            warden.photo.startsWith("blob:") ||
                            warden.photo.startsWith("http")
                            ? warden.photo
                            : `${import.meta.env.VITE_CDN_URL}${warden.photo}`
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
                    <label className="avatar-upload">
                      <span>📷</span>
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
        .profile-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 0 0 4px var(--primary-light); background: white; }
        
        .profile-initials-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 0 0 4px var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0047AB, #2563eb);
          color: white;
          font-size: 48px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .hidden {
          display: none !important;
        }

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
          .profile-badges { margin-top: -10px; }
          .profile-name { margin-top: -20px; }
          .input { font-size: 14px; padding: 10px; }
          .back-btn { margin-top: 50px; }
        }

        /* Completion Card Styles */
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
      `}</style>
    </div>
  );
};

export default WardenProfile;
