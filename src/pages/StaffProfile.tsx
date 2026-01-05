import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

interface StaffProfile {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    designation: string;
    department: string;
    qualification: string;
    subjects: string[];
    skills: string[];
    contactNumber: string;
    experience: string;
    achievements: string[];
    createdAt: string;
    updatedAt: string;
}

const StaffProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState<StaffProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editedStaff, setEditedStaff] = useState<StaffProfile | null>(null);

    // New input states for chips
    const [newSubject, setNewSubject] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [newAchievement, setNewAchievement] = useState('');

    useEffect(() => {
        fetchStaffProfile();
    }, []);

    const fetchStaffProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://jitqr-backend-1.onrender.com/staff/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 200) {
                setStaff(response.data.staff);
                setEditedStaff(response.data.staff);
            }
        } catch (error: any) {
            toast.error('Failed to fetch staff profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedStaff({ ...staff! });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedStaff({ ...staff! });
        setNewSubject('');
        setNewSkill('');
        setNewAchievement('');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(
                'https://jitqr-backend-1.onrender.com/staff/profile/update',
                editedStaff,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.status === 200) {
                setStaff(editedStaff);
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            }
        } catch (error: any) {
            toast.error('Failed to update profile');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: keyof StaffProfile, value: any) => {
        setEditedStaff(prev => prev ? { ...prev, [field]: value } : null);
    };

    const addChip = (field: 'subjects' | 'skills' | 'achievements', value: string) => {
        if (!value.trim()) return;

        setEditedStaff(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [field]: [...prev[field], value.trim()]
            };
        });

        // Clear input
        if (field === 'subjects') setNewSubject('');
        if (field === 'skills') setNewSkill('');
        if (field === 'achievements') setNewAchievement('');
    };

    const removeChip = (field: 'subjects' | 'skills' | 'achievements', index: number) => {
        setEditedStaff(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [field]: prev[field].filter((_, i) => i !== index)
            };
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Here you would typically upload to a server
        // For now, we'll create a local URL
        const reader = new FileReader();
        reader.onloadend = () => {
            handleInputChange('profilePhoto', reader.result as string);
        };
        reader.readAsDataURL(file);
        toast.info('Image selected. Click Save to update.');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!staff || !editedStaff) {
        return (
            <div className="error-container">
                <p>Failed to load staff profile</p>
                <button onClick={() => navigate('/staff-dashboard')}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="staff-profile-page">
            {/* Header */}
            <header className="profile-header">
                <div className="header-content">
                    <button className="back-btn" onClick={() => navigate('/staff-dashboard')}>
                        ← Back to Dashboard
                    </button>
                    <div className="header-actions">
                        {!isEditing ? (
                            <button className="edit-btn" onClick={handleEdit}>
                                ✏️ Edit Profile
                            </button>
                        ) : (
                            <>
                                <button className="cancel-btn" onClick={handleCancel} disabled={saving}>
                                    Cancel
                                </button>
                                <button className="save-btn" onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : '✓ Save Changes'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Profile Content */}
            <main className="profile-main">
                <div className="profile-container">
                    {/* Profile Hero Section */}
                    <div className="profile-hero">
                        <div className="profile-image-section">
                            <div className="profile-image-wrapper">
                                <img
                                    src={editedStaff.profilePhoto || 'https://via.placeholder.com/200'}
                                    alt={editedStaff.name}
                                    className="profile-image"
                                />
                                {isEditing && (
                                    <label className="change-image-btn">
                                        📷 Change Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                        <div className="profile-info-header">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedStaff.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="name-input"
                                />
                            ) : (
                                <h1 className="staff-name">{staff.name}</h1>
                            )}
                            <p className="staff-designation">{staff.designation}</p>
                            <p className="staff-department">{staff.department}</p>
                        </div>
                    </div>

                    {/* Profile Details Grid */}
                    <div className="profile-details">
                        {/* Contact Information */}
                        <div className="detail-card">
                            <h2 className="card-title">Contact Information</h2>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editedStaff.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="detail-input"
                                        />
                                    ) : (
                                        <p className="detail-value email-value">{staff.email}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>Contact Number</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editedStaff.contactNumber}
                                            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                            className="detail-input"
                                        />
                                    ) : (
                                        <p className="detail-value">{staff.contactNumber}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="detail-card">
                            <h2 className="card-title">Professional Information</h2>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Designation</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedStaff.designation}
                                            onChange={(e) => handleInputChange('designation', e.target.value)}
                                            className="detail-input"
                                        />
                                    ) : (
                                        <p className="detail-value">{staff.designation}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>Department</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedStaff.department}
                                            onChange={(e) => handleInputChange('department', e.target.value)}
                                            className="detail-input"
                                        />
                                    ) : (
                                        <p className="detail-value">{staff.department}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>Qualification</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedStaff.qualification}
                                            onChange={(e) => handleInputChange('qualification', e.target.value)}
                                            className="detail-input"
                                        />
                                    ) : (
                                        <p className="detail-value">{staff.qualification}</p>
                                    )}
                                </div>
                                <div className="detail-item">
                                    <label>Experience</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedStaff.experience}
                                            onChange={(e) => handleInputChange('experience', e.target.value)}
                                            className="detail-input"
                                        />
                                    ) : (
                                        <p className="detail-value">{staff.experience}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Subjects Handled */}
                        <div className="detail-card">
                            <h2 className="card-title">Subjects Handled</h2>
                            <div className="chips-container">
                                {editedStaff.subjects.map((subject, index) => (
                                    <div key={index} className="chip">
                                        <span>{subject}</span>
                                        {isEditing && (
                                            <button
                                                className="chip-remove"
                                                onClick={() => removeChip('subjects', index)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <div className="chip-input-wrapper">
                                        <input
                                            type="text"
                                            value={newSubject}
                                            onChange={(e) => setNewSubject(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addChip('subjects', newSubject)}
                                            placeholder="Add subject..."
                                            className="chip-input"
                                        />
                                        <button
                                            className="chip-add-btn"
                                            onClick={() => addChip('subjects', newSubject)}
                                        >
                                            + Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="detail-card">
                            <h2 className="card-title">Skills</h2>
                            <div className="chips-container">
                                {editedStaff.skills.map((skill, index) => (
                                    <div key={index} className="chip">
                                        <span>{skill}</span>
                                        {isEditing && (
                                            <button
                                                className="chip-remove"
                                                onClick={() => removeChip('skills', index)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <div className="chip-input-wrapper">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addChip('skills', newSkill)}
                                            placeholder="Add skill..."
                                            className="chip-input"
                                        />
                                        <button
                                            className="chip-add-btn"
                                            onClick={() => addChip('skills', newSkill)}
                                        >
                                            + Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="detail-card">
                            <h2 className="card-title">Achievements</h2>
                            <div className="chips-container">
                                {editedStaff.achievements.map((achievement, index) => (
                                    <div key={index} className="chip">
                                        <span>{achievement}</span>
                                        {isEditing && (
                                            <button
                                                className="chip-remove"
                                                onClick={() => removeChip('achievements', index)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <div className="chip-input-wrapper">
                                        <input
                                            type="text"
                                            value={newAchievement}
                                            onChange={(e) => setNewAchievement(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addChip('achievements', newAchievement)}
                                            placeholder="Add achievement..."
                                            className="chip-input"
                                        />
                                        <button
                                            className="chip-add-btn"
                                            onClick={() => addChip('achievements', newAchievement)}
                                        >
                                            + Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Metadata */}
                        <div className="detail-card metadata-card">
                            <h2 className="card-title">Profile Information</h2>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Profile Created</label>
                                    <p className="detail-value">{formatDate(staff.createdAt)}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Last Updated</label>
                                    <p className="detail-value">{formatDate(staff.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .staff-profile-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                }

                .loading-container,
                .error-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    color: white;
                    gap: 20px;
                }

                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    border-top-color: #0047AB;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Header */
                .profile-header {
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 20px 0;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .back-btn {
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateX(-4px);
                }

                .header-actions {
                    display: flex;
                    gap: 12px;
                }

                .edit-btn,
                .save-btn,
                .cancel-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 0.95rem;
                }

                .edit-btn {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    color: white;
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.3);
                }

                .edit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 71, 171, 0.4);
                }

                .save-btn {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .save-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
                }

                .save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .cancel-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                }

                .cancel-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.2);
                }

                /* Main Content */
                .profile-main {
                    padding: 40px 20px;
                }

                .profile-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Profile Hero */
                .profile-hero {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    border-radius: 24px;
                    padding: 48px;
                    margin-bottom: 32px;
                    display: flex;
                    gap: 40px;
                    align-items: center;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }

                .profile-image-section {
                    flex-shrink: 0;
                }

                .profile-image-wrapper {
                    position: relative;
                }

                .profile-image {
                    width: 180px;
                    height: 180px;
                    border-radius: 20px;
                    object-fit: cover;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .change-image-btn {
                    position: absolute;
                    bottom: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    color: #0047AB;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s;
                    white-space: nowrap;
                }

                .change-image-btn:hover {
                    transform: translateX(-50%) translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
                }

                .profile-info-header {
                    flex: 1;
                }

                .staff-name {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 12px;
                }

                .name-input {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 12px;
                    padding: 12px 16px;
                    width: 100%;
                    margin-bottom: 12px;
                }

                .name-input:focus {
                    outline: none;
                    border-color: rgba(255, 255, 255, 0.6);
                    background: rgba(255, 255, 255, 0.15);
                }

                .staff-designation {
                    font-size: 1.3rem;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 6px;
                }

                .staff-department {
                    font-size: 1.1rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                /* Detail Cards */
                .profile-details {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .detail-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 32px;
                }

                .card-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .detail-item label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .detail-value {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: white;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .email-value {
                    word-break: break-all;
                    overflow-wrap: break-word;
                }

                .detail-input {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    padding: 12px 16px;
                }

                .detail-input:focus {
                    outline: none;
                    border-color: #0047AB;
                    background: rgba(255, 255, 255, 0.15);
                }

                /* Chips */
                .chips-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(0, 71, 171, 0.3);
                    border: 1px solid rgba(0, 71, 171, 0.5);
                    padding: 10px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                    color: white;
                    font-size: 0.95rem;
                }

                .chip-remove {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .chip-remove:hover {
                    background: rgba(239, 68, 68, 0.8);
                }

                .chip-input-wrapper {
                    display: flex;
                    gap: 8px;
                    flex: 1;
                    min-width: 250px;
                }

                .chip-input {
                    flex: 1;
                    padding: 10px 16px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    color: white;
                    font-size: 0.95rem;
                }

                .chip-input:focus {
                    outline: none;
                    border-color: #0047AB;
                    background: rgba(255, 255, 255, 0.15);
                }

                .chip-input::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                .chip-add-btn {
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    border: none;
                    color: white;
                    border-radius: 20px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .chip-add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.4);
                }

                /* Metadata Card */
                .metadata-card {
                    background: rgba(0, 71, 171, 0.1);
                    border-color: rgba(0, 71, 171, 0.3);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .profile-hero {
                        flex-direction: column;
                        padding: 32px 24px;
                        text-align: center;
                    }

                    .profile-image {
                        width: 150px;
                        height: 150px;
                    }

                    .staff-name {
                        font-size: 2rem;
                    }

                    .name-input {
                        font-size: 2rem;
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .header-actions {
                        width: 100%;
                        justify-content: center;
                    }

                    .detail-grid {
                        grid-template-columns: 1fr;
                    }

                    .detail-card {
                        padding: 24px 20px;
                    }

                    .chip-input-wrapper {
                        width: 100%;
                    }
                }

                @media (max-width: 480px) {
                    .profile-main {
                        padding: 24px 12px;
                    }

                    .staff-name {
                        font-size: 1.8rem;
                    }

                    .name-input {
                        font-size: 1.8rem;
                    }

                    .card-title {
                        font-size: 1.3rem;
                    }

                    .edit-btn,
                    .save-btn,
                    .cancel-btn {
                        padding: 10px 16px;
                        font-size: 0.85rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default StaffProfilePage;
