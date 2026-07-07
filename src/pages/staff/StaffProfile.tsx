import React, { useEffect, useState } from 'react';
import PremiumStaffLoader from '../../components/PremiumStaffLoader'; // Refresh TS cache
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../../components/StaffHeader';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import ImageCropper from '../../components/ImageCropper';
import imageCompression from 'browser-image-compression';
import { DEPARTMENTS, DESIGNATIONS } from '../../constants/dropdownOptions';

const StaffProfile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [appReady, setAppReady] = useState(false);
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

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5 MB");
            e.target.value = '';
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, JPEG, and PNG formats are allowed");
            e.target.value = '';
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
                maxSizeMB: 0.2,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            const compressedBlob = new File([compressedFile], "profile_compressed.jpg", { type: "image/jpeg" });

            setSelectedFile(compressedBlob);

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev: any) => ({
                    ...prev,
                    photo: reader.result
                }));
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

    const navigate = useNavigate();

    const fetchStaffProfile = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/staff/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                const staffData = response.data.staff;
                const cleanArray = (arr: any) => {
                    if (!arr) return [];
                    if (Array.isArray(arr)) return arr.filter((s: string) => s && s.trim() !== '');
                    if (typeof arr === 'string') return arr.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
                    return [];
                };

                const cleanStaff = {
                    ...staffData,
                    subjects: cleanArray(staffData.subjects),
                    skills: cleanArray(staffData.skills),
                    achievements: cleanArray(staffData.achievements)
                };

                setStaff(cleanStaff);
                setFormData(cleanStaff);
            }
        } catch (error) {
            console.error("Error fetching staff profile:", error);
            toast.error("Failed to fetch profile data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        setIsEditing(false);
        const loadingToast = toast.loading("Updating profile...");

        try {
            let response;

            if (selectedFile) {
                // If photo is changed, we must use FormData
                const submitData = new FormData();

                Object.keys(formData).forEach(key => {
                    if (key === 'subjects' || key === 'skills' || key === 'achievements' || key === 'photo') return;
                    submitData.append(key, formData[key]);
                });

                const appendArray = (key: string, arr: string[]) => {
                    if (!arr || arr.length === 0) return;
                    if (arr.length === 1) {
                        submitData.append(key, arr[0]);
                        submitData.append(key, ''); // Force array parsing on backend
                    } else {
                        arr.forEach((item: string) => submitData.append(key, item));
                    }
                };

                appendArray('subjects', formData.subjects || []);
                appendArray('skills', formData.skills || []);
                appendArray('achievements', formData.achievements || []);

                submitData.append('file', selectedFile);

                response = await axios.put(`${import.meta.env.VITE_API_URL}/staff/profile/update`, submitData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });
            } else {
                // If photo is not changed, send a standard JSON payload
                const payload = {
                    ...formData,
                    subjects: formData.subjects || [],
                    skills: formData.skills || [],
                    achievements: formData.achievements || []
                };

                response = await axios.put(`${import.meta.env.VITE_API_URL}/staff/profile/update`, payload, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            if (response.status === 200) {
                toast.update(loadingToast, { render: "Profile updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
                await fetchStaffProfile();
                setSelectedFile(null);
            } else {
                toast.update(loadingToast, { render: "Update failed.", type: "error", isLoading: false, autoClose: 3000 });
                setIsEditing(true);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.update(loadingToast, { render: "Failed to update profile", type: "error", isLoading: false, autoClose: 3000 });
            setIsEditing(true);
        }
    };

    const getMissingFields = () => {
        if (!staff && !formData.name) return [];

        const data = { ...staff, ...formData };
        const missing: string[] = [];

        if (!data.name?.trim()) missing.push('Name');
        if (!data.email?.trim()) missing.push('Email');
        if (!data.contactNumber?.trim()) missing.push('Phone Number');
        if (!data.department?.trim()) missing.push('Department');
        if (!data.designation?.trim()) missing.push('Designation');
        if (!data.photo?.trim()) missing.push('Profile Photo');

        if (!data.subjects || data.subjects.length === 0) missing.push('Handling Subjects');
        if (!data.skills || data.skills.length === 0) missing.push('Knowledge & Skills');
        if (!data.achievements || data.achievements.length === 0) missing.push('Achievements');

        return missing;
    };

    const completionPercentage = (() => {
        const missingCount = getMissingFields().length;
        return Math.round(((9 - missingCount) / 9) * 100);
    })();

    if (!appReady) {
        return <PremiumStaffLoader isDataReady={!loading} onComplete={() => setAppReady(true)} />;
    }

    if (!staff) {
        return (
            <>
                <StaffHeader activeMenu="profile" />
                <div className="page-container mobile-page-content">
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

    // Default avatars and static counts for UX demonstration
    const totalStudents = 124;
    const researchPapers = 8;
    const projectsGuided = 15;
    
    // Calculate SVG circle dashoffset
    const circleRadius = 30;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const circleOffset = circleCircumference - (completionPercentage / 100) * circleCircumference;

    return (
        <>
            <StaffHeader activeMenu="profile" />
            <div className="page-container premium-profile-page mobile-page-content">
                <ToastContainer position="bottom-right" />
                <div className="content-wrapper">
                    
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

                    {/* NEW FACULTY HERO CARD */}
                    <div className="lux-faculty-hero">
                        <div className="hero-bg-sweep"></div>
                        <div className="particles"></div>
                        
                        <div className="hero-content">
                            <div className="hero-left">
                                <div className="hero-avatar-wrapper">
                                    {((formData.photo && formData.photo.trim() !== '') || (staff.photo && staff.photo.trim() !== '')) ? (
                                        <img
                                            src={formData.photo
                                                ? formData.photo.startsWith("blob:") ||
                                                    formData.photo.startsWith("http")
                                                    ? formData.photo
                                                    : `${formData.photo}`
                                                : `${staff.photo}`}
                                            alt={formData.name}
                                            className="hero-avatar"
                                            onError={(e) => {
                                                e.currentTarget.src = "https://ui-avatars.com/api/?name=" + (formData.name || "Faculty") + "&background=1E3A8A&color=fff";
                                            }}
                                        />
                                    ) : (
                                        <img 
                                            src={"https://ui-avatars.com/api/?name=" + (formData.name || "Faculty") + "&background=1E3A8A&color=fff"} 
                                            alt="Faculty Avatar" 
                                            className="hero-avatar" 
                                        />
                                    )}
                                    {isEditing && (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="photo-upload"
                                                style={{ display: 'none' }}
                                                onChange={handleImageUpload}
                                            />
                                            <label htmlFor="photo-upload" className="photo-edit-btn" title="Change Photo">
                                                📷
                                            </label>
                                        </>
                                    )}
                                </div>
                                <div className="hero-info">
                                    <div className="active-badge"><span className="dot"></span> Active Faculty</div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="edit-input hero-name-input"
                                            placeholder="Full Name"
                                        />
                                    ) : (
                                        <h1 className="faculty-name">{staff.name}</h1>
                                    )}
                                    
                                    <div className="hero-badges">
                                        {isEditing ? (
                                            <>
                                                <select
                                                    name="designation"
                                                    value={formData.designation}
                                                    onChange={handleChange}
                                                    className="edit-input hero-select"
                                                >
                                                    <option value="">Select Designation</option>
                                                    {DESIGNATIONS.map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    className="edit-input hero-select"
                                                >
                                                    <option value="">Select Department</option>
                                                    {DEPARTMENTS.map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </>
                                        ) : (
                                            <>
                                                <p className="faculty-designation">{staff.designation}</p>
                                                <span className="dot-separator">•</span>
                                                <p className="faculty-department">{staff.department}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="hero-right">
                                {/* Circular Progress Ring */}
                                <div className="progress-ring-container">
                                    <svg className="progress-ring" width="80" height="80">
                                        <circle className="progress-ring__circle-bg" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="transparent" r={circleRadius} cx="40" cy="40" />
                                        <circle 
                                            className="progress-ring__circle" 
                                            stroke={completionPercentage === 100 ? "#10B981" : "#38BDF8"} 
                                            strokeWidth="6" 
                                            strokeDasharray={circleCircumference} 
                                            strokeDashoffset={circleOffset} 
                                            strokeLinecap="round" 
                                            fill="transparent" 
                                            r={circleRadius} 
                                            cx="40" 
                                            cy="40" 
                                        />
                                    </svg>
                                    <div className="progress-ring-content">
                                        <div className="progress-ring-text">{completionPercentage}%</div>
                                        <div className="progress-ring-label">Profile</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PROFESSIONAL STATISTICS ROW */}
                    <div className="lux-stats-grid">
                        <div className="lux-stat-card">
                            <span className="stat-value">{totalStudents}</span>
                            <span className="stat-label">Students Managed</span>
                        </div>
                        <div className="lux-stat-card">
                            <span className="stat-value">{researchPapers}</span>
                            <span className="stat-label">Research Papers</span>
                        </div>
                        <div className="lux-stat-card">
                            <span className="stat-value">{projectsGuided}</span>
                            <span className="stat-label">Projects Guided</span>
                        </div>
                        <div className="lux-stat-card">
                            <span className="stat-value">{isEditing ? formData.experience : staff.experience}</span>
                            <span className="stat-label">Years Experience</span>
                        </div>
                    </div>

                    {/* PREMIUM INFORMATION CARDS */}
                    <div className="lux-info-layout">
                        {/* Academic & Dept Info */}
                        <div className="lux-info-col">
                            <div className="lux-info-card">
                                <h3><span className="icon">🎓</span> Academic Information</h3>
                                <div className="info-list">
                                    <div className="info-row">
                                        <span className="info-label">Qualification</span>
                                        {isEditing ? (
                                            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="edit-input" />
                                        ) : (
                                            <span className="info-value">{staff.qualification}</span>
                                        )}
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Designation</span>
                                        <span className="info-value">{isEditing ? formData.designation : staff.designation}</span>
                                    </div>
                                    <div className="info-row align-top">
                                        <span className="info-label">Handling Subjects</span>
                                        <div className="info-value">
                                            <div className="lux-pills">
                                                {(isEditing ? formData.subjects : staff.subjects)?.map((sub: string, idx: number) => (
                                                    <span key={idx} className="lux-pill blue">
                                                        {sub} {isEditing && <button onClick={() => handleArrayRemove('subjects', idx)} className="remove-pill">×</button>}
                                                    </span>
                                                ))}
                                            </div>
                                            {isEditing && (
                                                <div className="add-row">
                                                    <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Add subject..." className="edit-input" />
                                                    <button onClick={() => handleArrayAdd('subjects', newSubject, setNewSubject)} className="btn-add">Add</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lux-info-card">
                                <h3><span className="icon">🏢</span> Department Information</h3>
                                <div className="info-list">
                                    <div className="info-row">
                                        <span className="info-label">Department</span>
                                        <span className="info-value">{isEditing ? formData.department : staff.department}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Role Category</span>
                                        <span className="info-value">Teaching Staff</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Status</span>
                                        <span className="info-value text-success">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional & Contact Info */}
                        <div className="lux-info-col">
                            <div className="lux-info-card">
                                <h3><span className="icon">💼</span> Professional Profile</h3>
                                <div className="info-list">
                                    <div className="info-row">
                                        <span className="info-label">Experience</span>
                                        {isEditing ? (
                                            <div className="input-group">
                                                <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="edit-input short" />
                                                <span className="input-addon">Years</span>
                                            </div>
                                        ) : (
                                            <span className="info-value">{staff.experience} Years</span>
                                        )}
                                    </div>
                                    <div className="info-row align-top">
                                        <span className="info-label">Skills & Knowledge</span>
                                        <div className="info-value">
                                            <div className="lux-pills">
                                                {(isEditing ? formData.skills : staff.skills)?.map((skill: string, idx: number) => (
                                                    <span key={idx} className="lux-pill navy">
                                                        {skill} {isEditing && <button onClick={() => handleArrayRemove('skills', idx)} className="remove-pill">×</button>}
                                                    </span>
                                                ))}
                                            </div>
                                            {isEditing && (
                                                <div className="add-row">
                                                    <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add skill..." className="edit-input" />
                                                    <button onClick={() => handleArrayAdd('skills', newSkill, setNewSkill)} className="btn-add">Add</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="info-row align-top">
                                        <span className="info-label">Achievements</span>
                                        <div className="info-value">
                                            <ul className="lux-list">
                                                {(Array.isArray(isEditing ? formData.achievements : staff.achievements)
                                                    ? (isEditing ? formData.achievements : staff.achievements)
                                                    : typeof (isEditing ? formData.achievements : staff.achievements) === 'string'
                                                        ? (isEditing ? formData.achievements : staff.achievements).split(',').map((s: string) => s.trim()).filter(Boolean)
                                                        : []
                                                ).map((ach: string, idx: number) => (
                                                    <li key={idx}>
                                                        <span className="bullet">🏆</span>
                                                        <span className="text">{ach}</span>
                                                        {isEditing && <button onClick={() => handleArrayRemove('achievements', idx)} className="remove-pill text-red">×</button>}
                                                    </li>
                                                ))}
                                            </ul>
                                            {isEditing && (
                                                <div className="add-row mt-2">
                                                    <input type="text" value={newAchievement} onChange={e => setNewAchievement(e.target.value)} placeholder="Add achievement..." className="edit-input" />
                                                    <button onClick={() => handleArrayAdd('achievements', newAchievement, setNewAchievement)} className="btn-add">Add</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lux-info-card">
                                <h3><span className="icon">📞</span> Contact Details</h3>
                                <div className="info-list">
                                    <div className="info-row">
                                        <span className="info-label">Email Address</span>
                                        {isEditing ? (
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="edit-input" />
                                        ) : (
                                            <a href={`mailto:${staff.email}`} className="info-value link">{staff.email}</a>
                                        )}
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Phone Number</span>
                                        {isEditing ? (
                                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="edit-input" />
                                        ) : (
                                            <a href={`tel:${staff.contactNumber}`} className="info-value link">{staff.contactNumber}</a>
                                        )}
                                    </div>
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
                /* Base & Layout */
                .premium-profile-page {
                    background: var(--bg);
                    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    padding-bottom: 60px;
                }
                
                .content-wrapper {
                    max-width: 1040px;
                    margin: 0 auto;
                    padding: 24px;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Header Actions */
                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .back-btn {
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(0,0,0,0.05);
                    color: var(--primary-dark);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 8px 16px;
                    border-radius: var(--radius-full);
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    box-shadow: var(--shadow-sm);
                }
                .back-btn:hover {
                    box-shadow: var(--shadow-md);
                    background: white;
                    transform: translateY(-1px);
                }

                .action-btn {
                    padding: 8px 20px;
                    border-radius: var(--radius-full);
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: var(--shadow-sm);
                }
                .edit-btn { background: var(--primary); color: white; }
                .edit-btn:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
                .save-btn { background: #10B981; color: white; }
                .save-btn:hover { background: #059669; transform: translateY(-1px); }
                .cancel-btn { background: white; color: #EF4444; border: 1px solid #FECACA; }
                .cancel-btn:hover { background: #FEF2F2; }
                .edit-actions { display: flex; gap: 12px; }

                /* NEW FACULTY HERO CARD */
                .lux-faculty-hero {
                    background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #3B82F6 100%);
                    border-radius: 32px;
                    padding: 24px;
                    color: white;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(30, 58, 138, 0.2);
                    margin-bottom: 24px;
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .hero-bg-sweep {
                    position: absolute;
                    top: 0; left: -100%;
                    width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
                    transform: skewX(-20deg);
                    animation: sweep 6s infinite;
                    pointer-events: none;
                }
                @keyframes sweep {
                    0% { left: -100%; }
                    20%, 100% { left: 200%; }
                }

                .hero-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                }

                .hero-left {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .hero-avatar-wrapper {
                    position: relative;
                    width: 100px;
                    height: 100px;
                    border-radius: 24px;
                    padding: 4px;
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                    flex-shrink: 0;
                    transition: transform 0.3s ease;
                }
                .hero-avatar-wrapper:hover {
                    transform: scale(1.02);
                }

                .hero-avatar {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 20px;
                    border: 2px solid rgba(255,255,255,0.2);
                }

                .photo-edit-btn {
                    position: absolute;
                    bottom: -10px; right: -10px;
                    background: white;
                    color: var(--primary);
                    width: 44px; height: 44px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    font-size: 20px;
                    transition: all 0.2s ease;
                    border: 2px solid var(--primary-light);
                }
                .photo-edit-btn:hover { transform: scale(1.1); color: var(--primary-dark); }

                .hero-info {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .active-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(16, 185, 129, 0.15);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    color: #34D399;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    width: fit-content;
                    margin-bottom: 4px;
                }
                .active-badge .dot {
                    width: 6px; height: 6px;
                    background: #34D399;
                    border-radius: 50%;
                    box-shadow: 0 0 8px #34D399;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
                    70% { opacity: 0.5; box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
                    100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
                }

                .faculty-name {
                    font-size: 24px;
                    font-weight: 800;
                    margin: 0;
                    letter-spacing: -0.5px;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                .hero-badges {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 4px;
                }

                .faculty-designation, .faculty-department {
                    font-size: 16px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.9);
                    margin: 0;
                }
                .dot-separator {
                    color: rgba(255,255,255,0.4);
                    font-size: 12px;
                }

                .hero-name-input {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    max-width: 300px;
                }
                .hero-select {
                    max-width: 200px;
                }

                /* Circular Progress Ring */
                .hero-right {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 16px;
                    border-radius: 24px;
                    backdrop-filter: blur(10px);
                }

                .progress-ring-container {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .progress-ring {
                    transform: rotate(-90deg);
                }
                
                .progress-ring__circle {
                    transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .progress-ring-content {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .progress-ring-text {
                    font-size: 16px;
                    font-weight: 800;
                    color: white;
                    line-height: 1;
                }
                .progress-ring-label {
                    font-size: 9px;
                    color: rgba(255,255,255,0.7);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-top: 2px;
                    font-weight: 600;
                }

                /* PROFESSIONAL STATISTICS ROW */
                .lux-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .lux-stat-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.9);
                    border-radius: 24px;
                    padding: 10px 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    transition: all 0.3s ease;
                }
                .lux-stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.06);
                    background: white;
                }

                .stat-value {
                    font-size: 22px;
                    font-weight: 800;
                    color: var(--primary-dark);
                    line-height: 1;
                }

                .stat-label {
                    font-size: 13px;
                    color: var(--text-3);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* PREMIUM INFORMATION CARDS */
                .lux-info-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .lux-info-col {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .lux-info-card {
                    background: white;
                    border-radius: 24px;
                    padding: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.02);
                    transition: transform 0.3s ease, box-shadow 0.3s;
                }
                .lux-info-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.08);
                }

                .lux-info-card h3 {
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--primary-dark);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #F1F5F9;
                }
                .lux-info-card h3 .icon {
                    background: var(--primary-light);
                    width: 30px; height: 30px;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 10px;
                    font-size: 15px;
                }

                .info-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 6px 0;
                }
                .info-row.align-top {
                    align-items: flex-start;
                }

                .info-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-3);
                    width: 140px;
                    flex-shrink: 0;
                }

                .info-value {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text-1);
                    text-align: right;
                    flex: 1;
                    display: flex;
                    justify-content: flex-end;
                    flex-wrap: wrap;
                }
                .info-row.align-top .info-value {
                    justify-content: flex-end;
                }

                .text-success { color: #10B981; }
                .link { color: var(--primary); text-decoration: none; transition: color 0.2s; }
                .link:hover { color: var(--primary-dark); text-decoration: underline; }

                /* Inputs */
                .edit-input {
                    padding: 8px 14px;
                    border: 1px solid #E2E8F0;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: inherit;
                    width: 100%;
                    max-width: 250px;
                    transition: all 0.2s;
                    background: #F8FAFC;
                    font-weight: 500;
                    color: #0F172A;
                }
                .edit-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
                }
                .edit-input.short { width: 80px; max-width: none; }

                .input-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    justify-content: flex-end;
                }
                .input-addon {
                    font-size: 14px;
                    color: var(--text-3);
                    font-weight: 500;
                }

                /* Pills & Arrays */
                .lux-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: flex-end;
                }
                .lux-pill {
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                .lux-pill.blue { background: #EFF6FF; color: var(--primary); border: 1px solid #BFDBFE; }
                .lux-pill.navy { background: #F1F5F9; color: var(--primary-dark); border: 1px solid #E2E8F0; }
                
                .remove-pill {
                    background: none; border: none; color: inherit; font-size: 16px; font-weight: bold; cursor: pointer; opacity: 0.6; padding: 0 2px;
                }
                .remove-pill:hover { opacity: 1; }
                .text-red { color: #EF4444; }

                .add-row {
                    display: flex; gap: 8px; margin-top: 12px; width: 100%; justify-content: flex-end;
                }
                .mt-2 { margin-top: 12px; }
                .btn-add {
                    padding: 8px 16px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-add:hover { background: var(--primary-dark); }

                /* Lists */
                .lux-list {
                    list-style: none; padding: 0; margin: 0;
                    display: flex; flex-direction: column; gap: 8px; width: 100%;
                }
                .lux-list li {
                    display: flex; align-items: flex-start; gap: 12px;
                    padding: 8px 12px;
                    background: #F8FAFC;
                    border-radius: 12px;
                    text-align: left;
                }
                .lux-list .bullet { font-size: 16px; flex-shrink: 0; }
                .lux-list .text { font-size: 14px; color: var(--text-2); line-height: 1.5; flex: 1; font-weight: 500; }

                /* Responsive Mobile View */
                @media (max-width: 1024px) {
                    .lux-info-layout { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .premium-profile-page { padding-top: 16px; }
                    .content-wrapper { padding: 16px; }
                    
                    .lux-faculty-hero {
                        padding: 32px 24px;
                        border-radius: 24px;
                    }
                    .hero-content {
                        flex-direction: column;
                        text-align: center;
                        gap: 24px;
                    }
                    .hero-left {
                        flex-direction: column;
                        gap: 20px;
                    }
                    .hero-badges {
                        flex-direction: column;
                        gap: 8px;
                    }
                    .dot-separator { display: none; }
                    .active-badge { margin: 0 auto 8px auto; }

                    .lux-stats-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                    }

                    .info-row {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 8px;
                        padding: 12px 0;
                        border-bottom: 1px dashed #E2E8F0;
                    }
                    .info-row:last-child { border-bottom: none; }
                    
                    .info-label { width: 100%; }
                    .info-value { width: 100%; justify-content: flex-start; text-align: left; }
                    .lux-pills { justify-content: flex-start; }
                    .input-group, .add-row { justify-content: flex-start; }
                    .edit-input { max-width: 100%; }
                    
                    .header-actions {
                        flex-direction: column;
                        gap: 12px;
                        align-items: stretch;
                    }
                    .back-btn, .action-btn { justify-content: center; }
                    .edit-actions { flex-direction: column; }
                }
            `}</style>
        </>
    );
};

export default StaffProfile;
