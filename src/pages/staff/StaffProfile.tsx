import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../../components/StaffHeader';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const StaffProfile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form state for editing
    const [formData, setFormData] = useState<any>({
        name: '',
        designation: '',
        qualification: '',
        department: '',
        experience: '',
        email: '',
        contactNumber: '',
        subjects: [],
        skills: [],
        achievements: []
    });

    // Temporary states for array inputs
    const [newSubject, setNewSubject] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [newAchievement, setNewAchievement] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStaffProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/staff/profile`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    setStaff(response.data.staff);
                    setFormData(response.data.staff);
                }
            } catch (error) {
                console.error("Error fetching staff profile:", error);
                toast.error("Failed to fetch profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchStaffProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayAdd = (field: string, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
        if (!value.trim()) return;
        setFormData((prev: any) => ({
            ...prev,
            [field]: [...(prev[field] || []), value]
        }));
        setter('');
    };

    const handleArrayRemove = (field: string, index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: prev[field].filter((_: any, i: number) => i !== index)
        }));
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/staff/profile/update`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setStaff(response.data.staff || formData);
                setIsEditing(false);
                toast.success("Profile updated successfully!");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        }
    };

    if (loading) {
        return <div className="card staff-card">Loading...</div>;
    }

    if (!staff) {
        return (
            <>
                <StaffHeader activeMenu="profile" />
                <div className="page-container">
                    <div className="content-wrapper">
                        <div className="error-message">
                            <h2>Profile not found</h2>
                            <button className="btn btn-primary" onClick={() => navigate('/staff-dashboard')}>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <StaffHeader activeMenu="profile" />
            <div className="page-container staff-profile-page">
                <ToastContainer position="bottom-right" />
                <div className="content-wrapper">
                    {/* Header Actions */}
                    {/* Header Actions */}
                    <div className="header-actions">
                        <button className="back-btn" onClick={() => navigate('/staff-dashboard')}>
                            ← Back to Dashboard
                        </button>

                        {!isEditing ? (
                            <button className="action-btn edit-btn" onClick={() => setIsEditing(true)}>
                                ✏️ Edit Profile
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button className="action-btn cancel-btn" onClick={() => {
                                    setIsEditing(false);
                                    setFormData(staff); // Reset changes
                                }}>
                                    Cancel
                                </button>
                                <button className="action-btn save-btn" onClick={handleSave}>
                                    💾 Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="profile-image-wrapper">
                            <img
                                src={formData.photo || staff.photo || `https://ui-avatars.com/api/?name=${formData.name}&background=0047AB&color=fff&size=200`}
                                alt={formData.name}
                                className="profile-image"
                            />
                            {isEditing && (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="photo-upload"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        photo: reader.result
                                                    }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <label htmlFor="photo-upload" className="photo-edit-btn" title="Change Photo">
                                        📷
                                    </label>
                                </>
                            )}
                        </div>
                        <div className="profile-header-info">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="edit-input header-input"
                                    placeholder="Full Name"
                                />
                            ) : (
                                <h1 className="profile-name">{staff.name}</h1>
                            )}

                            <div className="profile-badges">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            className="edit-input badge-input"
                                            placeholder="Designation"
                                        />
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="edit-input badge-input"
                                            placeholder="Department"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <span className="badge badge-secondary">{staff.designation}</span>
                                        <span className="badge badge-secondary">{staff.department}</span>
                                    </>
                                )}
                            </div>

                            {isEditing ? (
                                <input
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    className="edit-input"
                                    placeholder="Qualification (e.g. Ph.D, M.Tech)"
                                    style={{ marginTop: '10px', width: '100%', maxWidth: '300px' }}
                                />
                            ) : (
                                <p className="profile-qualification">{staff.qualification}</p>
                            )}
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="profile-content">
                        {/* Basic Information Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">📋</span>
                                Basic Information
                            </h2>
                            <div className="info-list">
                                <div className="info-item">
                                    <span className="info-label">Experience</span>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                            <input
                                                type="text"
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                className="edit-input"
                                                style={{ width: '80px' }}
                                            />
                                            <span>Years</span>
                                        </div>
                                    ) : (
                                        <span className="info-value">{staff.experience} Years</span>
                                    )}
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Designation</span>
                                    <span className="info-value">{isEditing ? formData.designation : staff.designation}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Qualification</span>
                                    <span className="info-value">{isEditing ? formData.qualification : staff.qualification}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Department</span>
                                    <span className="info-value">{isEditing ? formData.department : staff.department}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">📞</span>
                                Contact Information
                            </h2>
                            <div className="contact-list">
                                <div className="contact-item-new">
                                    <span className="contact-icon-new">📧</span>
                                    <div className="contact-info" style={{ width: '100%' }}>
                                        <span className="contact-label-new">EMAIL</span>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="edit-input"
                                                placeholder="Email Address"
                                            />
                                        ) : (
                                            <a href={`mailto:${staff.email}`} className="contact-value">{staff.email}</a>
                                        )}
                                    </div>
                                </div>
                                <div className="contact-item-new">
                                    <span className="contact-icon-new">📱</span>
                                    <div className="contact-info" style={{ width: '100%' }}>
                                        <span className="contact-label-new">PHONE</span>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="contactNumber"
                                                value={formData.contactNumber}
                                                onChange={handleChange}
                                                className="edit-input"
                                                placeholder="Phone Number"
                                            />
                                        ) : (
                                            <a href={`tel:${staff.contactNumber}`} className="contact-value">{staff.contactNumber}</a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Handling Subjects Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">📚</span>
                                Handling Subjects
                            </h2>
                            <div className="subjects-list-new">
                                {(isEditing ? formData.subjects : staff.subjects)?.map((subject: string, idx: number) => (
                                    <div key={idx} className="subject-item-new">
                                        <span className="subject-bullet">📖</span>
                                        <span className="subject-text">{subject}</span>
                                        {isEditing && (
                                            <button
                                                onClick={() => handleArrayRemove('subjects', idx)}
                                                className="remove-btn"
                                            >✖</button>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <div className="add-item-row">
                                        <input
                                            type="text"
                                            value={newSubject}
                                            onChange={(e) => setNewSubject(e.target.value)}
                                            placeholder="Add new subject"
                                            className="edit-input"
                                        />
                                        <button
                                            onClick={() => handleArrayAdd('subjects', newSubject, setNewSubject)}
                                            className="add-btn"
                                        >Add</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Knowledge & Skills Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">💡</span>
                                Knowledge & Skills
                            </h2>
                            <div className="skills-list">
                                {(isEditing ? formData.skills : staff.skills)?.map((skill: string, idx: number) => (
                                    <span key={idx} className="skill-badge">
                                        {skill}
                                        {isEditing && (
                                            <button
                                                onClick={() => handleArrayRemove('skills', idx)}
                                                className="remove-btn-badge"
                                            >✖</button>
                                        )}
                                    </span>
                                ))}
                                {isEditing && (
                                    <div className="add-item-row" style={{ marginTop: '10px', width: '100%' }}>
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="Add skill"
                                            className="edit-input"
                                            style={{ maxWidth: '200px' }}
                                        />
                                        <button
                                            onClick={() => handleArrayAdd('skills', newSkill, setNewSkill)}
                                            className="add-btn"
                                        >Add</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Achievements Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">🏆</span>
                                Achievements
                            </h2>
                            <ul className="achievements-list-new">
                                {(isEditing ? formData.achievements : staff.achievements)?.map((achievement: string, idx: number) => (
                                    <li key={idx} className="achievement-item-new">
                                        <span className="achievement-check">✓</span>
                                        <span className="achievement-content">{achievement}</span>
                                        {isEditing && (
                                            <button
                                                onClick={() => handleArrayRemove('achievements', idx)}
                                                className="remove-btn"
                                            >✖</button>
                                        )}
                                    </li>
                                ))}
                                {isEditing && (
                                    <li className="achievement-item-new" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                                        <div className="add-item-row" style={{ width: '100%' }}>
                                            <input
                                                type="text"
                                                value={newAchievement}
                                                onChange={(e) => setNewAchievement(e.target.value)}
                                                placeholder="Add achievement"
                                                className="edit-input"
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                onClick={() => handleArrayAdd('achievements', newAchievement, setNewAchievement)}
                                                className="add-btn"
                                            >Add</button>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .staff-profile-page {
                    background: linear-gradient(135deg, var(--bg) 0%, #E0E8F0 100%);
                    animation: fadeIn 0.5s ease-out;
                    padding-bottom: 40px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .content-wrapper {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .back-btn {
                    background: white;
                    border: 1px solid rgba(0,0,0,0.1);
                    color: var(--primary);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 8px 16px;
                    border-radius: var(--radius-sm);
                    transition: var(--transition);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: var(--shadow-sm);
                }
                
                .back-btn:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-1px);
                }

                .action-btn {
                    padding: 8px 16px;
                    border-radius: var(--radius-sm);
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }

                .edit-btn {
                    background: var(--primary);
                    color: white;
                }

                .save-btn {
                    background: #28a745;
                    color: white;
                }

                .cancel-btn {
                    background: #dc3545;
                    color: white;
                }

                /* Inputs */
                .edit-input {
                    padding: 8px 12px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    font-family: inherit;
                    font-size: 14px;
                    transition: border-color 0.2s;
                    background: rgba(255,255,255,0.9);
                    width: 100%;
                }

                .edit-input:focus {
                    border-color: var(--primary);
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(0, 71, 171, 0.2);
                }

                .header-input {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 10px;
                    color: #333;
                }

                .badge-input {
                    font-size: 14px;
                    width: 150px;
                }

                .add-item-row {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }

                .add-btn {
                    padding: 6px 12px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                }

                .remove-btn {
                    background: none;
                    border: none;
                    color: #ff4d4f;
                    cursor: pointer;
                    font-size: 14px;
                    margin-left: 8px;
                    padding: 0 4px;
                }

                .remove-btn-badge {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    margin-left: 6px;
                    cursor: pointer;
                }

                .remove-btn-badge:hover {
                    background: rgba(255,255,255,0.4);
                }

                /* Header */
                .profile-header {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    border-radius: var(--radius-lg);
                    padding: 32px;
                    display: flex;
                    gap: 32px;
                    margin-bottom: 32px;
                    box-shadow: var(--shadow-lg);
                    position: relative;
                    overflow: hidden;
                    color: white;
                }

                .profile-image-wrapper {
                    flex-shrink: 0;
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    padding: 6px;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(8px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    position: relative;
                }

                .photo-edit-btn {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    background: var(--primary);
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    transition: transform 0.2s;
                    font-size: 18px;
                }

                .photo-edit-btn:hover {
                    transform: scale(1.1);
                    background: var(--primary-dark);
                }

                .profile-image {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid white;
                    background: white;
                }

                .profile-header-info {
                    flex: 1;
                    justify-content: center;
                    display: flex;
                    flex-direction: column;
                }

                .profile-name {
                    font-size: 32px;
                    font-weight: 700;
                    margin: 0 0 12px 0;
                    letter-spacing: -0.5px;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                .profile-badges {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }

                .badge {
                    padding: 6px 14px;
                    border-radius: 50px;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .badge-primary {
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .badge-secondary {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                .profile-qualification {
                    opacity: 0.9;
                    font-size: 16px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Profile Content */
                .profile-content {
                    background: white;
                    border-radius: var(--radius-lg);
                    padding: 40px;
                    box-shadow: var(--shadow-md);
                }

                .section {
                    margin-bottom: 40px;
                }

                .section:last-child {
                    margin-bottom: 0;
                }

                .section-heading {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--primary);
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #F0F4F8;
                }

                .heading-icon {
                    width: 36px;
                    height: 36px;
                    background: #F0F7FF;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }

                .info-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .info-label {
                    font-size: 13px;
                    text-transform: uppercase;
                    color: var(--text-light);
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                .info-value {
                    font-size: 16px;
                    color: var(--text-main);
                    font-weight: 500;
                }

                /* Contact List */
                .contact-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                }

                .contact-item-new {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    border-radius: var(--radius-sm);
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    transition: var(--transition);
                }

                .contact-item-new:hover {
                    border-color: var(--primary-light);
                    background: white;
                    box-shadow: var(--shadow-sm);
                }

                .contact-icon-new {
                    width: 44px;
                    height: 44px;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    box-shadow: var(--shadow-sm);
                    color: var(--primary);
                }

                .contact-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .contact-label-new {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-light);
                    letter-spacing: 0.5px;
                }

                .contact-value {
                    font-size: 16px;
                    color: var(--primary);
                    font-weight: 600;
                    text-decoration: none;
                    transition: color 0.2s;
                    word-break: break-all;
                }

                /* Subjects List */
                .subjects-list-new {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 16px;
                }

                .subject-item-new {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #F8FAFC;
                    border-radius: var(--radius-sm);
                    transition: var(--transition);
                    border: 1px solid transparent;
                }

                .subject-item-new:hover {
                    background: white;
                    box-shadow: var(--shadow-sm);
                    border-color: #E2E8F0;
                    transform: translateY(-2px);
                }

                .subject-bullet {
                    font-size: 18px;
                }

                .subject-text {
                    font-weight: 500;
                    color: var(--text-main);
                    font-size: 15px;
                    flex: 1;
                }

                /* Skills List */
                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .skill-badge {
                    padding: 10px 20px;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                    border-radius: var(--radius-full);
                    font-size: 14px;
                    font-weight: 500;
                    transition: var(--transition);
                    cursor: default;
                    box-shadow: 0 2px 8px rgba(0, 71, 171, 0.25);
                    display: flex;
                    align-items: center;
                }

                .skill-badge:hover {
                    transform: translateY(-3px) scale(1.05);
                    box-shadow: 0 6px 16px rgba(0, 71, 171, 0.35);
                }

                /* Achievements List */
                .achievements-list-new {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .achievement-item-new {
                    display: flex;
                    align-items: flex-start;
                    gap: 18px;
                    padding: 18px 20px;
                    background: linear-gradient(135deg, #FFF9E6 0%, #FFFBF0 100%);
                    border-radius: var(--radius-sm);
                    border-left: 4px solid var(--accent);
                    transition: var(--transition);
                }

                .achievement-item-new:hover {
                    transform: translateX(6px);
                    box-shadow: var(--shadow-sm);
                    background: linear-gradient(135deg, #FFF4CC 0%, #FFF9E6 100%);
                }

                .achievement-check {
                    flex-shrink: 0;
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
                    color: var(--primary-dark);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 16px;
                    box-shadow: 0 3px 10px rgba(255, 215, 0, 0.35);
                }

                .achievement-content {
                    flex: 1;
                    color: var(--text-main);
                    font-size: 15px;
                    line-height: 1.7;
                    padding-top: 4px;
                }

                .error-message {
                    text-align: center;
                    padding: 60px 20px;
                }

                .error-message h2 {
                    margin-bottom: 24px;
                    color: var(--text-muted);
                }

                /* Header Actions */
                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .edit-actions {
                    display: flex;
                    gap: 12px;
                }

                @media (max-width: 768px) {
                    .header-actions {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }

                    .back-btn, .action-btn {
                        width: 100%;
                        justify-content: center;
                    }
                    
                    .edit-actions {
                        flex-direction: column;
                        width: 100%;
                    }
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .profile-header {
                        flex-direction: column;
                        text-align: center;
                        padding: 32px 24px;
                    }

                    .profile-image-wrapper {
                        width: 150px;
                        height: 150px;
                        margin: 0 auto;
                    }

                    .profile-name {
                        font-size: 28px;
                    }

                    .profile-badges {
                        justify-content: center;
                    }

                    .profile-content {
                        padding: 24px;
                    }

                    .section {
                        margin-bottom: 36px;
                    }

                    .section-heading {
                        font-size: 18px;
                    }

                    .info-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 6px;
                    }

                    .info-label {
                        min-width: auto;
                    }

                    .info-value {
                        text-align: left;
                    }

                    .back-btn {
                        font-size: 14px;
                    }

                    .contact-value {
                        font-size: 14px;
                    }
                }

                @media (min-width: 769px) and (max-width: 1024px) {
                    .profile-content {
                        padding: 32px;
                    }
                }
            `}</style>
        </>
    );
};

export default StaffProfile;