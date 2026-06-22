import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import StudentHeader from '../../components/StudentHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import StudentBottomNav from '../../components/StudentBottomNav';

const StudentViewStaffProfile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<any>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStaffById = async () => {
            try {
                // Try fetching specific ID first
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/staff/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    setStaff(response.data.staff);
                }
            } catch (error) {
                console.error("Error fetching staff data by ID, falling back to list:", error);

                // Fallback to searching the list if direct endpoint fails (robustness)
                try {
                    const listResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/staff/list`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (listResponse.status === 200) {
                        const found = listResponse.data.staff.find((s: any) => s._id === id);
                        if (found) setStaff(found);
                    }
                } catch (listError) {
                    console.error("Fallback fetch failed", listError);
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchStaffById();
    }, [id]);

    if (loading) return <LoadingSpinner />;

    if (!staff) {
        return (
            <div className="pb-staff-profile-page">
                <StudentHeader />
                <main className="student-content">
                    <div className="content-wrapper">
                        <div className="pb-empty-state-card" style={{ marginTop: '40px' }}>
                            <div className="pb-empty-state-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>
                            <h3>Staff member not found</h3>
                            <p>The requested faculty profile could not be loaded. It may have been removed or updated.</p>
                            <button className="pb-clear-btn" onClick={() => navigate('/staffs')}>
                                ← Back to Faculty List
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const photoUrl = staff.photo || staff.profilePhoto;
    const finalPhotoUrl = photoUrl
        ? photoUrl.startsWith('http')
            ? photoUrl
            : `${import.meta.env.VITE_CDN_URL}${photoUrl}`
        : `https://ui-avatars.com/api/?name=${staff.name}&background=3B82F6&color=fff&size=200`;

    return (
        <div className="pb-staff-profile-page pb-animate-stagger-1">

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
                <StudentHeader />
                <main className="student-content">
                    <div className="content-wrapper">
                        {/* Back navigation */}
                        <div className="pb-back-link-wrapper">
                            <button className="pb-btn-back" onClick={() => navigate('/staffs')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back to Faculty List
                            </button>
                        </div>

                        <div className="pb-staff-profile-layout">
                            {/* Left Column: Avatar & Summary Card */}
                            <div className="pb-staff-summary-col">
                                <div className="pb-staff-summary-card">
                                    <div className="pb-avatar-section">
                                        <div className="pb-avatar-ring">
                                            <div className="pb-avatar-frame">
                                                <img
                                                    src={finalPhotoUrl}
                                                    alt={staff.name}
                                                    onError={(e) => {
                                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${staff.name}&background=3B82F6&color=fff&size=200`;
                                                    }}
                                                    className="pb-avatar-image-actual"
                                                />
                                            </div>
                                        </div>
                                        <h2 className="pb-staff-full-name">{staff.name}</h2>
                                        <span className="pb-badge pb-badge-blue">{staff.designation}</span>
                                        <span className="pb-badge pb-badge-purple" style={{ marginTop: '6px' }}>{staff.department}</span>
                                    </div>

                                    {/* Contact Box */}
                                    <div className="pb-quick-contact-panel">
                                        <h3>Quick Connect</h3>
                                        <div className="pb-quick-connect-links">
                                            {staff.email && (
                                                <a href={`mailto:${staff.email}`} className="pb-connect-item-card">
                                                    <span className="icon">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                            <rect width="20" height="16" x="2" y="4" rx="2" />
                                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                                        </svg>
                                                    </span>
                                                    <div className="connect-label-text">
                                                        <span className="label">EMAIL</span>
                                                        <span className="val">{staff.email}</span>
                                                    </div>
                                                </a>
                                            )}
                                            {staff.contactNumber && (
                                                <a href={`tel:${staff.contactNumber}`} className="pb-connect-item-card">
                                                    <span className="icon">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                                        </svg>
                                                    </span>
                                                    <div className="connect-label-text">
                                                        <span className="label">PHONE</span>
                                                        <span className="val">{staff.contactNumber}</span>
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Detailed Info Sections */}
                            <div className="pb-staff-details-col pb-animate-stagger-2">
                                <div className="pb-staff-details-card">

                                    {/* Basic stats row */}
                                    <div className="pb-stats-row">
                                        <div className="pb-stat-box">
                                            <span className="pb-stat-num">{staff.experience || '0'}</span>
                                            <span className="pb-stat-label">Years Experience</span>
                                        </div>
                                        <div className="pb-stat-divider"></div>
                                        <div className="pb-stat-box">
                                            <span className="pb-stat-num">{staff.qualification || 'Ph.D.'}</span>
                                            <span className="pb-stat-label">Qualification</span>
                                        </div>
                                    </div>

                                    {/* Subjects section */}
                                    {staff.subjects && staff.subjects.length > 0 && (
                                        <fieldset className="pb-fieldset-section" style={{ marginTop: '24px' }}>
                                            <legend className="pb-fieldset-legend">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                                </svg>
                                                Handling Subjects
                                            </legend>
                                            <div className="pb-subjects-grid">
                                                {staff.subjects.map((subject: string, idx: number) => (
                                                    <div key={idx} className="pb-subject-box-item">
                                                        <span className="icon">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                                            </svg>
                                                        </span>
                                                        <span className="text">{subject}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </fieldset>
                                    )}

                                    {/* Skills Section */}
                                    {staff.skills && staff.skills.length > 0 && (
                                        <fieldset className="pb-fieldset-section" style={{ marginTop: '32px' }}>
                                            <legend className="pb-fieldset-legend">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="2" y1="12" x2="22" y2="12" />
                                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                                </svg>
                                                Areas of Expertise
                                            </legend>
                                            <div className="pb-skills-badge-wrap">
                                                {staff.skills.map((skill: string, idx: number) => (
                                                    <span key={idx} className="pb-skill-badge-item">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </fieldset>
                                    )}

                                    {/* Achievements Section */}
                                    {staff.achievements && staff.achievements.length > 0 && (
                                        <fieldset className="pb-fieldset-section" style={{ marginTop: '32px' }}>
                                            <legend className="pb-fieldset-legend">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                </svg>
                                                Key Achievements
                                            </legend>
                                            <div className="pb-achievements-wrap">
                                                {staff.achievements.map((achievement: string, idx: number) => (
                                                    <div key={idx} className="pb-achievement-bullet-row">
                                                        <span className="bullet">★</span>
                                                        <span className="content">{achievement}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </fieldset>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view">
                {/* Hero Header */}
                <div className="pb-mob-staff-hero">
                    <button className="pb-mob-back-btn" onClick={() => navigate('/staffs')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <div className="pb-mob-hero-avatar-ring">
                        <div className="pb-mob-hero-avatar">
                            <img
                                src={finalPhotoUrl}
                                alt={staff.name}
                                onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${staff.name}&background=3B82F6&color=fff&size=200`; }}
                            />
                        </div>
                    </div>
                    <h1 className="pb-mob-hero-name">{staff.name}</h1>
                    <p className="pb-mob-hero-sub">{staff.designation}</p>
                    <span className="pb-mob-hero-dept-badge">{staff.department}</span>
                </div>

                <div className="pb-mob-scroll-body">
                    {/* Stats row */}
                    <div className="pb-mob-stats-card">
                        <div className="pb-mob-stat-box">
                            <span className="pb-mob-stat-num">{staff.experience || '0'}</span>
                            <span className="pb-mob-stat-label">Yrs Experience</span>
                        </div>
                        <div className="pb-mob-stat-div" />
                        <div className="pb-mob-stat-box">
                            <span className="pb-mob-stat-num">{staff.qualification || 'Ph.D.'}</span>
                            <span className="pb-mob-stat-label">Qualification</span>
                        </div>
                    </div>

                    {/* Contact CTAs */}
                    <div className="pb-mob-contact-row">
                        {staff.email && (
                            <a href={`mailto:${staff.email}`} className="pb-mob-contact-btn pb-email">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                Email Faculty
                            </a>
                        )}
                        {staff.contactNumber && (
                            <a href={`tel:${staff.contactNumber}`} className="pb-mob-contact-btn pb-phone">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.37 6.37l1.06-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                            </a>
                        )}
                    </div>

                    {/* Subjects */}
                    {staff.subjects && staff.subjects.length > 0 && (
                        <div className="pb-mob-section-card animate-cred-enter cred-stagger-3">
                            <h3 className="pb-mob-section-head">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                Handling Subjects
                            </h3>
                            {staff.subjects.map((sub: string, i: number) => (
                                <div key={i} className="pb-mob-subject-row">
                                    <div className="pb-mob-subject-dot" />
                                    <span className="pb-mob-subject-name">{sub}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Skills */}
                    {staff.skills && staff.skills.length > 0 && (
                        <div className="pb-mob-section-card animate-cred-enter cred-stagger-4">
                            <h3 className="pb-mob-section-head">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                                Areas of Expertise
                            </h3>
                            <div className="pb-mob-skills-wrap">
                                {staff.skills.map((skill: string, i: number) => (
                                    <span key={i} className="pb-mob-skill-badge">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Achievements */}
                    {staff.achievements && staff.achievements.length > 0 && (
                        <div className="pb-mob-section-card animate-cred-enter cred-stagger-5">
                            <h3 className="pb-mob-section-head">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                Key Achievements
                            </h3>
                            {staff.achievements.map((ach: string, i: number) => (
                                <div key={i} className="pb-mob-achievement-row">
                                    <span className="pb-mob-achievement-star">★</span>
                                    <span className="pb-mob-achievement-text">{ach}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Nav */}
                <StudentBottomNav activeTab="staff" />
            </div>{/* end mobile */}

            <style>{`
                .pb-staff-profile-page {
                    min-height: 100vh;
                    background: var(--pb-bg);
                }
                .pb-staff-profile-layout {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 24px;
                    align-items: start;
                }
                @media (max-width: 992px) {
                    .pb-staff-profile-layout {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                }
                
                .pb-staff-summary-card { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 24px; 
                    align-items: center; 
                    text-align: center; 
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    padding: 28px;
                }
                .pb-avatar-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                }
                .pb-avatar-ring {
                    width: 138px;
                    height: 138px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-light));
                    padding: 3px;
                    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
                    margin-bottom: 16px;
                }
                .pb-avatar-frame {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #fff;
                }
                .pb-avatar-image-actual {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .pb-staff-full-name {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin: 0;
                    letter-spacing: -0.015em;
                }
                .pb-badge {
                    margin-top: 8px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 2px 10px;
                    border-radius: 99px;
                }
                .pb-badge-blue {
                    color: var(--pb-primary);
                    background: var(--pb-secondary);
                }
                .pb-badge-purple {
                    color: #7C3AED;
                    background: rgba(124, 58, 237, 0.08);
                    border: 1px solid rgba(124, 58, 237, 0.12);
                }
                
                .pb-quick-contact-panel {
                    width: 100%;
                    border-top: 1px solid rgba(59, 130, 246, 0.08);
                    padding-top: 20px;
                    text-align: left;
                }
                .pb-quick-contact-panel h3 {
                    font-size: 0.82rem;
                    font-weight: 750;
                    color: var(--pb-text-3);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 14px;
                }
                .pb-quick-connect-links {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .pb-connect-item-card { 
                    display: flex; 
                    align-items: center; 
                    gap: 12px; 
                    padding: 12px 16px; 
                    background: rgba(59, 130, 246, 0.03); 
                    border: 1px solid rgba(59, 130, 246, 0.06);
                    border-radius: 14px;
                    transition: var(--pb-transition);
                    cursor: pointer;
                    text-decoration: none;
                }
                .pb-connect-item-card:hover {
                    background: var(--pb-secondary);
                    border-color: rgba(59, 130, 246, 0.2);
                    transform: translateY(-2px);
                }
                .pb-connect-item-card .icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--pb-primary);
                    box-shadow: var(--pb-shadow);
                    flex-shrink: 0;
                }
                .connect-label-text {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }
                .connect-label-text .label {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: var(--pb-text-4);
                    letter-spacing: 0.05em;
                }
                .connect-label-text .val {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: var(--pb-text-2);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .pb-staff-details-card { 
                    padding: 32px; 
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .pb-stats-row {
                    display: flex;
                    align-items: center;
                    background: rgba(59, 130, 246, 0.03);
                    border-radius: 16px;
                    padding: 18px;
                    border: 1px solid rgba(59, 130, 246, 0.06);
                }
                .pb-stat-box {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .pb-stat-num {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: var(--pb-primary);
                    letter-spacing: -0.015em;
                }
                .pb-stat-label {
                    font-size: 0.76rem;
                    color: var(--pb-text-4);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-top: 2px;
                }
                .pb-stat-divider {
                    width: 1px;
                    height: 36px;
                    background: rgba(59, 130, 246, 0.1);
                }
                .pb-fieldset-section {
                    border: none;
                    margin: 0;
                    padding: 0;
                }
                .pb-fieldset-legend {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin-bottom: 18px;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.08);
                    padding-bottom: 8px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    letter-spacing: -0.012em;
                }
                .pb-subjects-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 12px;
                }
                
                .pb-subject-box-item { 
                    display: flex; 
                    align-items: center; 
                    gap: 10px; 
                    background: #fff; 
                    padding: 12px 14px; 
                    border-radius: 10px; 
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    border-left: 3px solid var(--pb-primary);
                    box-shadow: var(--pb-shadow);
                }
                .pb-subject-box-item .icon {
                    color: var(--pb-primary);
                    display: flex;
                    align-items: center;
                }
                .pb-subject-box-item .text {
                    font-size: 0.84rem;
                    font-weight: 700;
                    color: var(--pb-text);
                }
                .pb-skills-badge-wrap {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .pb-skill-badge-item {
                    font-size: 0.78rem;
                    font-weight: 600;
                    padding: 6px 14px;
                    border-radius: 20px;
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    color: var(--pb-primary);
                }
                .pb-achievements-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .pb-achievement-bullet-row { 
                    display: flex; 
                    align-items: flex-start; 
                    gap: 12px; 
                    padding: 14px; 
                    background: rgba(245, 158, 11, 0.03); 
                    border: 1px solid rgba(245, 158, 11, 0.1); 
                    border-radius: 12px; 
                }
                .pb-achievement-bullet-row .bullet {
                    color: #F59E0B;
                    font-size: 1.1rem;
                    line-height: 1;
                }
                .pb-achievement-bullet-row .content {
                    font-size: 0.85rem;
                    color: var(--pb-text-2);
                    line-height: 1.45;
                    font-weight: 500;
                }

                .pb-empty-state-card {
                    text-align: center;
                    padding: 48px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    max-width: 480px;
                    margin: 40px auto;
                }
                .pb-empty-state-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    color: var(--pb-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 12px;
                }
                .pb-empty-state-card h3 {
                    font-size: 1.1rem;
                    color: var(--pb-text);
                    margin: 0 0 6px 0;
                }
                .pb-empty-state-card p {
                    font-size: 0.88rem;
                    color: var(--pb-text-3);
                    margin: 0 0 16px 0;
                }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { 
                        display: flex !important; 
                        flex-direction: column; 
                        min-height: 100vh; 
                        background: var(--pb-bg);
                    }
                }

                /* ==========================================
                   PREMIUM MOBILE STYLES (STAFF PROFILE)
                   ========================================== */
                .pb-mob-staff-hero { 
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-dark)) !important; 
                    padding: 32px 20px; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    gap: 8px; 
                    text-align: center; 
                    position: relative; 
                    border-bottom: 1px solid rgba(255,255,255,0.1); 
                }
                .pb-mob-back-btn { 
                    position: absolute; 
                    top: 16px; 
                    left: 16px; 
                    width: 36px; 
                    height: 36px; 
                    border-radius: 10px; 
                    background: rgba(255,255,255,0.15); 
                    border: 1px solid rgba(255,255,255,0.25); 
                    color: white; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    cursor: pointer; 
                    transition: transform 0.2s; 
                }
                .pb-mob-back-btn:active { transform: scale(0.9); }
                .pb-mob-hero-avatar-ring {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.25);
                    padding: 3px;
                    box-shadow: 0 10px 24px rgba(0,0,0,0.15);
                    margin-top: 8px;
                }
                .pb-mob-hero-avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #fff;
                }
                .pb-mob-hero-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .pb-mob-hero-name {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #fff;
                    margin: 8px 0 0 0;
                    letter-spacing: -0.012em;
                }
                .pb-mob-hero-sub {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.85);
                    margin: 0;
                }
                .pb-mob-hero-dept-badge { 
                    background: rgba(255,255,255,0.2); 
                    color: white; 
                    border: 1px solid rgba(255,255,255,0.3); 
                    font-size: 0.68rem; 
                    font-weight: 700; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em; 
                    padding: 3px 12px; 
                    border-radius: 8px; 
                    margin-top: 6px; 
                }

                .pb-mob-scroll-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 16px 90px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .pb-mob-stats-card { 
                    padding: 16px; 
                    display: flex; 
                    align-items: center; 
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                }
                .pb-mob-stat-box {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                }
                .pb-mob-stat-num {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: var(--pb-primary);
                }
                .pb-mob-stat-label {
                    font-size: 0.68rem;
                    color: var(--pb-text-4);
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }
                .pb-mob-stat-div { width: 1px; height: 32px; background: rgba(59, 130, 246, 0.08); }

                .pb-mob-contact-row { display: flex; gap: 12px; }
                .pb-mob-contact-btn { 
                    height: 44px;
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    border-radius: 12px; 
                    font-size: 0.85rem; 
                    font-weight: 700; 
                    text-decoration: none; 
                    transition: transform 0.2s; 
                    font-family: inherit; 
                }
                .pb-mob-contact-btn:active { transform: scale(0.96); }
                .pb-mob-contact-btn.pb-email {
                    flex: 1;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-dark));
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                }
                .pb-mob-contact-btn.pb-phone {
                    width: 44px;
                    background: var(--pb-card);
                    color: var(--pb-text-2);
                    border: 1px solid var(--pb-card-border);
                    box-shadow: var(--pb-shadow);
                }

                .pb-mob-section-card { 
                    padding: 16px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 12px; 
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                }
                .pb-mob-section-head {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin: 0;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.06);
                }
                
                .pb-mob-subject-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 0;
                    border-bottom: 1px dashed rgba(59, 130, 246, 0.06);
                }
                .pb-mob-subject-row:last-child { border-bottom: none; }
                .pb-mob-subject-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--pb-primary); flex-shrink: 0; }
                .pb-mob-subject-name {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: var(--pb-text-2);
                }
                
                .pb-mob-skills-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
                .pb-mob-skill-badge {
                    background: rgba(59, 130, 246, 0.05);
                    color: var(--pb-primary);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    font-size: 0.74rem;
                    font-weight: 650;
                    padding: 4px 10px;
                    border-radius: 8px;
                }
                
                .pb-mob-achievement-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 10px 12px;
                    background: rgba(245, 158, 11, 0.03);
                    border-radius: 10px;
                    border: 1px solid rgba(245, 158, 11, 0.1);
                }
                .pb-mob-achievement-star { color: #F59E0B; font-size: 14px; flex-shrink: 0; margin-top: 1px; }
                .pb-mob-achievement-text {
                    font-size: 0.78rem;
                    color: var(--pb-text-2);
                    line-height: 1.4;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default StudentViewStaffProfile;
