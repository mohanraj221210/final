import React, { useState, useEffect } from "react";
import Nav from "../../components/WardenNav";
import Toast from "../../components/Toast";
import wardenProfile from "../../assets/jit.webp";
import axios from "axios";
import { toast } from "react-toastify";

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

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        setWarden(response.data.warden);
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

    setSelectedPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
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

      {showToast && (
        <Toast
          message="Profile updated successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="content-wrapper">
        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="card profile-card">
              <div className="profile-header">
                <div className="avatar-container">
                  <img
                    src={previewUrl || warden.photo || wardenProfile}
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
                  <input
                    type="text"
                    name="hostelname"
                    value={warden.hostelname}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input"
                  />
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
                    value={warden.gender}
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


      <style>{`
        
        .profile-page { margin-top: 80px; }
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
          .profile-badges { margin-top: -45px; }
          .input { font-size: 14px; padding: 10px; }
        }
      `}</style>
    </div>
  );
};

export default WardenProfile;
