import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentHeader from '../../components/StudentHeader';
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

    if (loading) {
        return (
            <div className="student-page loading-screen-staff animate-page-enter">
                <div className="lux-desktop-view">
                    <div className="content-wrapper" style={{ paddingTop: '100px' }}>
                        <div className="staff-profile-layout">
                            <div className="staff-summary-col">
                                <div className="card lux-skeleton" style={{ height: '400px' }}></div>
                            </div>
                            <div className="staff-details-col">
                                <div className="card lux-skeleton" style={{ height: '300px', marginBottom: '24px' }}></div>
                                <div className="card lux-skeleton" style={{ height: '200px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lux-mobile-view">
                    <div style={{ padding: '24px', paddingTop: '100px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="lux-skeleton" style={{ height: '250px', borderRadius: '16px' }}></div>
                        <div className="lux-skeleton" style={{ height: '200px', borderRadius: '16px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="student-page staff-not-found-page">
                <StudentHeader />
                <div className="content-wrapper">
                    <div className="empty-state-card card" style={{ marginTop: '40px' }}>
                        <span className="empty-state-icon">🔍</span>
                        <h3>Staff member not found</h3>
                        <p>The requested faculty profile could not be loaded. It may have been removed or updated.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/staffs')}>
                            ← Back to Faculty List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const photoUrl = staff.photo || staff.profilePhoto;
    const finalPhotoUrl = photoUrl
        ? photoUrl.startsWith('http')
            ? photoUrl
            : `${import.meta.env.VITE_CDN_URL}${photoUrl}`
        : `https://ui-avatars.com/api/?name=${staff.name}&background=2563EB&color=fff&size=200`;

    return (
        <div className="student-page staff-profile-view-page animate-page-enter">

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
            <StudentHeader />

            <div className="content-wrapper">
                {/* Back navigation */}
                <div className="back-link-wrapper" style={{ marginBottom: '24px' }}>
                    <button className="btn-back" onClick={() => navigate('/staffs')}>
                        <span className="icon">←</span> Back to Faculty List
                    </button>
                </div>

                <div className="staff-profile-layout">
                    {/* Left Column: Avatar & Summary Card */}
                    <div className="staff-summary-col animate-stagger-1">
                        <div className="card staff-summary-card">
                            <div className="avatar-section">
                                <div className="avatar-frame">
                                    <img
                                        src={finalPhotoUrl}
                                        alt={staff.name}
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${staff.name}&background=2563EB&color=fff&size=200`;
                                        }}
                                        className="avatar-image-actual"
                                    />
                                </div>
                                <h2 className="staff-full-name">{staff.name}</h2>
                                <span className="badge badge-blue">{staff.designation}</span>
                                <span className="badge badge-purple" style={{ marginTop: '4px' }}>{staff.department}</span>
                            </div>

                            {/* Contact Box */}
                            <div className="quick-contact-panel">
                                <h3>Quick Connect</h3>
                                <div className="quick-connect-links">
                                    {staff.email && (
                                        <a href={`mailto:${staff.email}`} className="connect-item-card card card-hover">
                                            <span className="icon">📧</span>
                                            <div className="connect-label-text">
                                                <span className="label">EMAIL</span>
                                                <span className="val">{staff.email}</span>
                                            </div>
                                        </a>
                                    )}
                                    {staff.contactNumber && (
                                        <a href={`tel:${staff.contactNumber}`} className="connect-item-card card card-hover">
                                            <span className="icon">📱</span>
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
                    <div className="staff-details-col animate-stagger-2">
                        <div className="card staff-details-card">
                            
                            {/* Basic stats row */}
                            <div className="stats-row">
                                <div className="stat-box">
                                    <span className="stat-num">{staff.experience || '0'}</span>
                                    <span className="stat-label">Years Experience</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-box">
                                    <span className="stat-num">{staff.qualification || 'Ph.D.'}</span>
                                    <span className="stat-label">Qualification</span>
                                </div>
                            </div>

                            {/* Subjects section */}
                            {staff.subjects && staff.subjects.length > 0 && (
                                <fieldset className="fieldset-section" style={{ marginTop: '24px' }}>
                                    <legend className="fieldset-legend">📖 Handling Subjects</legend>
                                    <div className="subjects-grid">
                                        {staff.subjects.map((subject: string, idx: number) => (
                                            <div key={idx} className="subject-box-item">
                                                <span className="icon">📘</span>
                                                <span className="text">{subject}</span>
                                            </div>
                                        ))}
                                    </div>
                                </fieldset>
                            )}

                            {/* Skills Section */}
                            {staff.skills && staff.skills.length > 0 && (
                                <fieldset className="fieldset-section" style={{ marginTop: '32px' }}>
                                    <legend className="fieldset-legend">💡 Areas of Expertise</legend>
                                    <div className="skills-badge-wrap">
                                        {staff.skills.map((skill: string, idx: number) => (
                                            <span key={idx} className="badge badge-purple skill-badge-item">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </fieldset>
                            )}

                            {/* Achievements Section */}
                            {staff.achievements && staff.achievements.length > 0 && (
                                <fieldset className="fieldset-section" style={{ marginTop: '32px' }}>
                                    <legend className="fieldset-legend">🏆 Key Achievements</legend>
                                    <div className="achievements-wrap">
                                        {staff.achievements.map((achievement: string, idx: number) => (
                                            <div key={idx} className="achievement-bullet-row">
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
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view cred-page-bg">
                {/* Hero Header */}
                <div className="mob-staff-hero animate-cred-enter cred-stagger-1">
                    <button className="mob-back-btn" onClick={() => navigate('/staffs')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div className="mob-hero-avatar">
                        <img
                            src={finalPhotoUrl}
                            alt={staff.name}
                            onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${staff.name}&background=2563EB&color=fff&size=200`; }}
                        />
                    </div>
                    <h1 className="cred-h2" style={{color: 'white', marginTop: '12px'}}>{staff.name}</h1>
                    <p className="cred-gold-text" style={{fontSize: '13px', fontWeight: '600', margin: '4px 0'}}>{staff.designation}</p>
                    <span className="mob-hero-dept-badge">{staff.department}</span>
                </div>

                <div className="mob-scroll-body">
                    {/* Stats row */}
                    <div className="cred-card mob-stats-row animate-cred-enter cred-stagger-2">
                        <div className="mob-stat-box">
                            <span className="cred-h1" style={{fontSize: '20px'}}>{staff.experience || '0'}</span>
                            <span className="cred-p" style={{fontSize: '11px', textAlign: 'center'}}>Yrs Experience</span>
                        </div>
                        <div className="mob-stat-div" />
                        <div className="mob-stat-box">
                            <span className="cred-h1" style={{fontSize: '20px'}}>{staff.qualification || 'Ph.D.'}</span>
                            <span className="cred-p" style={{fontSize: '11px', textAlign: 'center'}}>Qualification</span>
                        </div>
                    </div>

                    {/* Contact CTAs */}
                    <div className="mob-contact-row animate-cred-enter cred-stagger-2">
                        {staff.email && (
                            <a href={`mailto:${staff.email}`} className="mob-contact-btn mob-contact-email">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                Email Faculty
                            </a>
                        )}
                        {staff.contactNumber && (
                            <a href={`tel:${staff.contactNumber}`} className="mob-contact-btn mob-contact-phone">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.37 6.37l1.06-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                Call
                            </a>
                        )}
                    </div>

                    {/* Subjects */}
                    {staff.subjects && staff.subjects.length > 0 && (
                        <div className="cred-card mob-section-card animate-cred-enter cred-stagger-3">
                            <h3 className="mob-section-head">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cred-gold)" strokeWidth="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                                Handling Subjects
                            </h3>
                            {staff.subjects.map((sub: string, i: number) => (
                                <div key={i} className="mob-subject-row">
                                    <div className="mob-subject-dot" />
                                    <span className="cred-h2" style={{fontSize: '14px'}}>{sub}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Skills */}
                    {staff.skills && staff.skills.length > 0 && (
                        <div className="cred-card mob-section-card animate-cred-enter cred-stagger-4">
                            <h3 className="mob-section-head">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cred-gold)" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                                Areas of Expertise
                            </h3>
                            <div className="mob-skills-wrap">
                                {staff.skills.map((skill: string, i: number) => (
                                    <span key={i} className="mob-skill-badge">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Achievements */}
                    {staff.achievements && staff.achievements.length > 0 && (
                        <div className="cred-card mob-section-card animate-cred-enter cred-stagger-5">
                            <h3 className="mob-section-head">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cred-gold)" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                Key Achievements
                            </h3>
                            {staff.achievements.map((ach: string, i: number) => (
                                <div key={i} className="mob-achievement-row">
                                    <span className="mob-achievement-star">★</span>
                                    <span className="cred-p" style={{fontSize: '13px'}}>{ach}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Nav */}
                <StudentBottomNav activeTab="staff" />
            </div>{/* end mobile */}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                /* ── DESKTOP VIEWS (RETAINED) ── */
                .staff-profile-view-page { background: var(--bg); }
                .loading-screen-staff { background: var(--bg); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
                .btn-back { background: none; border: none; color: var(--primary); font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--radius-sm); transition: var(--transition-fast); }
                .btn-back:hover { background: var(--primary-light); color: var(--primary-dark); }
                .staff-profile-layout { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }
                .staff-summary-card { display: flex; flex-direction: column; gap: 24px; align-items: center; text-align: center; }
                .avatar-section { display: flex; flex-direction: column; align-items: center; width: 100%; }
                .avatar-frame { width: 130px; height: 130px; border-radius: 50%; border: 4px solid var(--surface); box-shadow: var(--shadow-md); margin-bottom: 12px; overflow: hidden; background: var(--bg-elevated); }
                .avatar-image-actual { width: 100%; height: 100%; object-fit: cover; }
                .staff-full-name { font-size: 1.25rem; font-weight: 800; color: var(--text-1); margin: 0 0 6px 0; }
                .quick-contact-panel { width: 100%; border-top: 1px solid var(--border); padding-top: 16px; text-align: left; }
                .quick-contact-panel h3 { font-size: 0.9rem; font-weight: 700; color: var(--text-1); margin-bottom: 12px; }
                .quick-connect-links { display: flex; flex-direction: column; gap: 10px; }
                .connect-item-card { display: flex; align-items: center; gap: 12px; padding: 10px var(--space-4) !important; background: var(--bg); border: 1px solid var(--border); }
                .connect-item-card .icon { font-size: 1.3rem; padding: 6px; background: var(--surface); border-radius: var(--radius-sm); box-shadow: var(--shadow-xs); }
                .connect-label-text { display: flex; flex-direction: column; min-width: 0; }
                .connect-label-text .label { font-size: 0.65rem; font-weight: 800; color: var(--text-4); }
                .connect-label-text .val { font-size: 0.82rem; font-weight: 600; color: var(--primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .staff-details-card { padding: var(--space-8) var(--space-6) !important; }
                .stats-row { display: flex; align-items: center; background: var(--bg-elevated); border-radius: var(--radius-md); padding: 16px; }
                .stat-box { flex: 1; display: flex; flex-direction: column; align-items: center; }
                .stat-num { font-size: 1.4rem; font-weight: 800; color: var(--primary-dark); }
                .stat-label { font-size: 0.75rem; color: var(--text-3); font-weight: 600; }
                .stat-divider { width: 1px; height: 32px; background: var(--border-strong); }
                .fieldset-section { border: none; margin: 0; padding: 0; }
                .fieldset-legend { font-size: 1.05rem; font-weight: 800; color: var(--text-1); margin-bottom: 16px; border-bottom: 2px solid var(--bg-elevated); padding-bottom: 8px; width: 100%; }
                .subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
                .subject-box-item { display: flex; align-items: center; gap: 8px; background: var(--bg); padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--primary); }
                .subject-box-item .text { font-size: 0.88rem; font-weight: 600; color: var(--text-2); }
                .skills-badge-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
                .skill-badge-item { font-size: 0.82rem; padding: 6px 14px; border-radius: var(--radius-full); }
                .achievements-wrap { display: flex; flex-direction: column; gap: 12px; }
                .achievement-bullet-row { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: var(--warning-light); border: 1px solid var(--warning-mid); border-radius: var(--radius-md); }
                .achievement-bullet-row .bullet { color: var(--warning); font-size: 1.1rem; line-height: 1; }
                .achievement-bullet-row .content { font-size: 0.88rem; color: var(--text-2); line-height: 1.4; }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { display: flex !important; flex-direction: column; min-height: 100vh; background: linear-gradient(135deg, #F7F3E6 0%, #E8EEF5 45%, #C8D9F2 100%); font-family: 'Inter', -apple-system, sans-serif; }
                }

                /* ==========================================
                   CRED PREMIUM MOBILE STYLES (STAFF PROFILE)
                   ========================================== */
                /* Staff hero — dark luxury card for identity-card contrast */
                .mob-staff-hero { background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%); padding:32px 20px 32px; display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center; position:relative; border-bottom: 1px solid rgba(255,255,255,0.08); }
                .mob-back-btn { position:absolute; top:16px; left:16px; width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.15); color:white; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:transform 0.2s; }
                .mob-back-btn:active { transform: scale(0.9); }
                .mob-hero-avatar { width:100px; height:100px; border-radius:50%; border:3px solid #D4AF37; overflow:hidden; margin-top:8px; box-shadow:0 0 20px rgba(212,175,55,0.3); padding: 4px; }
                .mob-hero-avatar img { width:100%; height:100%; object-fit:cover; border-radius: 50%; }
                
                .mob-hero-dept-badge { background:rgba(255,255,255,0.12); color:rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.15); font-size:12px; font-weight:700; text-transform: uppercase; letter-spacing: 0.5px; padding:4px 12px; border-radius:8px; margin-top: 8px; }

                .mob-scroll-body { flex:1; overflow-y:auto; padding:24px 16px 100px; display:flex; flex-direction:column; gap:16px; }

                .mob-stats-row { padding:16px; display:flex; align-items:center; }
                .mob-stat-box { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; }
                .mob-stat-div { width:1px; height:32px; background:var(--cred-border); }

                .mob-contact-row { display:flex; gap:12px; }
                .mob-contact-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:16px; border-radius:16px; font-size:15px; font-weight:800; text-decoration:none; transition:transform 0.2s; font-family: inherit; }
                .mob-contact-btn:active { transform: scale(0.96); }
                .mob-contact-email { background:linear-gradient(135deg, #1E3A8A, #0F172A); color:#FFFFFF; border: none; box-shadow: 0 8px 24px rgba(15,23,42,0.25); }
                .mob-contact-phone { background:#FFFFFF; color:#0F172A; border: 1px solid rgba(226,232,240,0.8); box-shadow: 0 4px 12px rgba(15,23,42,0.08); }

                .mob-section-card { padding:20px; display:flex; flex-direction:column; gap:12px; }
                .mob-section-head { display:flex; align-items:center; gap:8px; font-size:14px; font-weight:800; color:#0F172A; margin:0 0 8px; padding-bottom:12px; border-bottom:1px solid rgba(226,232,240,0.8); }
                
                .mob-subject-row { display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid rgba(226,232,240,0.6); }
                .mob-subject-row:last-child { border-bottom: none; }
                .mob-subject-dot { width:8px; height:8px; border-radius:50%; background:#B8860B; flex-shrink:0; }
                
                .mob-skills-wrap { display:flex; flex-wrap:wrap; gap:10px; }
                .mob-skill-badge { background:rgba(37,99,235,0.08); color:#1D4ED8; border: 1px solid rgba(37,99,235,0.15); font-size:12px; font-weight:700; padding:6px 14px; border-radius:8px; }
                
                .mob-achievement-row { display:flex; align-items:flex-start; gap:12px; padding:12px; background:rgba(184,134,11,0.06); border-radius:12px; border:1px solid rgba(184,134,11,0.15); }
                .mob-achievement-star { color:#B8860B; font-size:16px; flex-shrink:0; margin-top:2px; }
            `}</style>
        </div>
    );
};

export default StudentViewStaffProfile;
