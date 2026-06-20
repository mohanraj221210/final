import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type User } from '../../data/sampleData';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import StudentHeader from '../../components/StudentHeader';
import StudentBottomNav from '../../components/StudentBottomNav';
import { isProfileComplete } from '../../utils/profileHelper';

const Dashboard: React.FC = () => {
    const [Loading, setLoading] = useState(true);
    const [user, setUser] = useState<User>({
        name: "",
        registerNumber: "",
        staffid: { id: "", name: "" },
        department: "",
        year: "",
        semester: 0,
        email: "",
        phone: "",
        photo: "",
        batch: "",
        gender: "male",
        parentnumber: "",
        residencetype: "day scholar",
        hostelname: "",
        hostelroomno: "",
        busno: "",
        boardingpoint: "",
    });
    const [imageError, setImageError] = useState(false);
    const [outpassStats, setOutpassStats] = useState({ pending: 0, approved: 0, rejected: 0, checkedOut: 0, checkedIn: 0 });
    const [recentPasses, setRecentPasses] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const [profileRes, statsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
                        headers: { authorization: `Bearer ${token}` },
                    }).catch(e => { console.error('Profile fetch error', e); return null; }),

                    axios.get(`${import.meta.env.VITE_API_URL}/api/outpass/stats`, {
                        headers: { authorization: `Bearer ${token}` },
                    }).catch(e => { console.error('Stats fetch error', e); return null; })
                ]);

                if (profileRes?.status === 200) {
                    setUser(profileRes.data.user);
                    setImageError(false);
                }

                if (statsRes?.status === 200 && statsRes.data && statsRes.data.stats && statsRes.data.stats.length > 0) {
                    const statsData = statsRes.data.stats[0].stats && statsRes.data.stats[0].stats.length > 0
                        ? statsRes.data.stats[0].stats[0]
                        : {};
                    setOutpassStats({
                        pending: statsData.pending || 0,
                        approved: statsData.approved || 0,
                        rejected: statsData.rejected || 0,
                        checkedOut: 0,
                        checkedIn: 0,
                    });

                    const passes = statsRes.data.stats[0].recentpasses || [];
                    setRecentPasses(passes);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleNavigation = (path: string) => {
        const restrictedPaths = ['/staffs', '/student-notice', '/subjects', '/outpass', '/new-outpass'];
        if (restrictedPaths.includes(path) && !isProfileComplete(user)) {
            toast.warn("Complete your profile to enable " + path.replace('/', ''), {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (Loading) {
        return (
            <div className="student-page dashboard-page-view animate-page-enter">
                <div className="lux-desktop-view">
                    <StudentHeader />
                    <div className="content-wrapper">
                        <div className="lux-hero-card">
                            <div className="lux-hero-content" style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '32px' }}>
                                <div className="lux-skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }}></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div className="lux-skeleton" style={{ width: '120px', height: '24px', borderRadius: '12px' }}></div>
                                    <div className="lux-skeleton" style={{ width: '250px', height: '36px', borderRadius: '8px' }}></div>
                                    <div className="lux-skeleton" style={{ width: '180px', height: '20px', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="lux-quick-actions" style={{ marginTop: '32px' }}>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="lux-qa-card lux-skeleton" style={{ height: '110px', borderRadius: '20px' }}></div>
                            ))}
                        </div>
                        <div className="lux-dashboard-grid" style={{ marginTop: '32px' }}>
                            <div className="lux-grid-col">
                                <div className="lux-widget-card lux-skeleton" style={{ height: '200px', borderRadius: '24px' }}></div>
                            </div>
                            <div className="lux-grid-col">
                                <div className="lux-widget-card lux-skeleton" style={{ height: '250px', borderRadius: '24px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lux-mobile-view cred-page-bg" style={{ minHeight: '100vh', padding: '24px 16px' }}>
                    <div className="cred-card lux-skeleton" style={{ height: '140px', borderRadius: '24px' }}></div>
                    <div className="mob-quick-actions" style={{ marginTop: '24px' }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="cred-card lux-skeleton" style={{ height: '100px', borderRadius: '20px' }}></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="student-page dashboard-page-view animate-page-enter">
            <ToastContainer position="top-center" />

            <div className="lux-desktop-view">
                <StudentHeader />

                <div className="content-wrapper">

                    {/* ── HERO SECTION ── */}
                    <div className="lux-hero-card animate-hero">
                        <div className="lux-hero-bg-glow"></div>
                        <div className="lux-hero-content">
                            <div className="lux-avatar-container">
                                {!imageError && user.photo ? (
                                    <img
                                        src={user.photo.startsWith("blob:") || user.photo.startsWith("data:") || user.photo.startsWith("http")
                                            ? user.photo
                                            : `${import.meta.env.VITE_CDN_URL || ''}${user.photo.startsWith('/') ? user.photo.slice(1) : user.photo}`
                                        }
                                        alt="Profile"
                                        className="lux-avatar-img"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="lux-avatar-fallback">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                                    </div>
                                )}
                                <div className="lux-status-dot"></div>
                            </div>
                            <div className="lux-hero-text">
                                <span className="lux-badge-gold">Student Portal</span>
                                <h1 className="lux-hero-name">Welcome back, {user.name || 'Student'}</h1>
                                <p className="lux-hero-meta">
                                    {user.registerNumber || 'Reg No. N/A'} &nbsp;•&nbsp; {user.department || 'Department N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── QUICK ACTIONS (Priority 1) ── */}
                    <div className="lux-quick-actions animate-stagger-1">
                        <button className="lux-qa-card" onClick={() => handleNavigation('/new-outpass')}>
                            <div className="lux-qa-gloss"></div>
                            <div className="lux-qa-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </div>
                            <div className="lux-qa-content">
                                <span className="lux-qa-title">Apply Outpass</span>
                                <span className="lux-qa-subtitle">Submit a new request</span>
                            </div>
                        </button>
                        <button className="lux-qa-card" onClick={() => handleNavigation('/outpass')}>
                            <div className="lux-qa-gloss"></div>
                            <div className="lux-qa-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                            <div className="lux-qa-content">
                                <span className="lux-qa-title">Track Outpass</span>
                                <span className="lux-qa-subtitle">View request status</span>
                            </div>
                        </button>
                        <button className="lux-qa-card" onClick={() => handleNavigation('/staffs')}>
                            <div className="lux-qa-gloss"></div>
                            <div className="lux-qa-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            </div>
                            <div className="lux-qa-content">
                                <span className="lux-qa-title">Staff Directory</span>
                                <span className="lux-qa-subtitle">Browse faculty members</span>
                            </div>
                        </button>
                        <button className="lux-qa-card" onClick={() => handleNavigation('/profile')}>
                            <div className="lux-qa-gloss"></div>
                            <div className="lux-qa-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </div>
                            <div className="lux-qa-content">
                                <span className="lux-qa-title">Profile</span>
                                <span className="lux-qa-subtitle">Manage personal details</span>
                            </div>
                        </button>
                    </div>

                    {/* ── DASHBOARD GRID ── */}
                    <div className="lux-dashboard-grid animate-stagger-2">

                        {/* LEFT COLUMN */}
                        <div className="lux-grid-col">

                            {/* OUTPASS STATUS WIDGET */}
                            <div className="lux-widget-card lux-outpass-widget">
                                <div className="lux-widget-header">
                                    <h2>Current Outpass Status</h2>
                                    <button className="lux-text-btn" onClick={() => handleNavigation('/outpass')}>View All</button>
                                </div>
                                <div className="lux-outpass-badges">
                                    <div className="lux-outpass-stat">
                                        <span className="lux-stat-val text-pending">{outpassStats.pending}</span>
                                        <span className="lux-stat-lbl">Pending</span>
                                    </div>
                                    <div className="lux-outpass-stat">
                                        <span className="lux-stat-val text-approved">{outpassStats.approved}</span>
                                        <span className="lux-stat-lbl">Approved</span>
                                    </div>
                                    <div className="lux-outpass-stat">
                                        <span className="lux-stat-val text-rejected">{outpassStats.rejected}</span>
                                        <span className="lux-stat-lbl">Rejected</span>
                                    </div>
                                    <div className="lux-outpass-stat">
                                        <span className="lux-stat-val text-navy">{outpassStats.checkedOut}</span>
                                        <span className="lux-stat-lbl">Checked Out</span>
                                    </div>
                                    <div className="lux-outpass-stat">
                                        <span className="lux-stat-val text-green">{outpassStats.checkedIn}</span>
                                        <span className="lux-stat-lbl">Checked In</span>
                                    </div>
                                </div>
                            </div>

                            {/* ACADEMIC SUMMARY */}
                            <div className="lux-widget-card">
                                <div className="lux-widget-header">
                                    <h2>Academic Information</h2>
                                </div>
                                <div className="lux-academic-grid">
                                    <div className="lux-metric-card">
                                        <div className="lux-metric-icon bg-gold-light text-gold">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                        </div>
                                        <div className="lux-metric-info">
                                            <span className="lux-metric-val">{user.cgpa || '8.25'}</span>
                                            <span className="lux-metric-lbl">Current CGPA</span>
                                        </div>
                                    </div>
                                    <div className="lux-metric-card">
                                        <div className="lux-metric-icon bg-blue-light text-blue">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                        </div>
                                        <div className="lux-metric-info">
                                            <span className="lux-metric-val">85%</span>
                                            <span className="lux-metric-lbl">Attendance</span>
                                        </div>
                                    </div>
                                    <div className="lux-metric-card">
                                        <div className="lux-metric-icon bg-red-light text-red">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                        </div>
                                        <div className="lux-metric-info">
                                            <span className="lux-metric-val">{user.arrears || '0'}</span>
                                            <span className="lux-metric-lbl">Standing Arrears</span>
                                        </div>
                                    </div>
                                    <div className="lux-metric-card">
                                        <div className="lux-metric-icon bg-navy-light text-navy">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                                        </div>
                                        <div className="lux-metric-info">
                                            <span className="lux-metric-val">Sem {user.semester || 'N/A'}</span>
                                            <span className="lux-metric-lbl">{user.year || 'Year N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="lux-grid-col">

                            {/* RECENT PASSES WIDGET */}
                            <div className="lux-widget-card lux-notices-widget">
                                <div className="lux-widget-header">
                                    <h2>Recent Outpass Activity</h2>
                                    <button className="lux-text-btn" onClick={() => handleNavigation('/outpass')}>View All</button>
                                </div>
                                <div className="lux-notices-list">
                                    {recentPasses.length > 0 ? recentPasses.map((pass: any) => (
                                        <div className="lux-notice-item" key={pass._id}>
                                            <div className={`lux-notice-badge ${pass.status === 'approved' ? 'badge-info' :
                                                pass.status === 'rejected' ? 'badge-urgent' : 'badge-event'
                                                }`}>
                                                {pass.status}
                                            </div>
                                            <div className="lux-notice-content">
                                                <h4 style={{ textTransform: 'capitalize' }}>{pass.reason}</h4>
                                                <p>From: {new Date(pass.fromDate).toLocaleDateString()} To: {new Date(pass.toDate).toLocaleDateString()}</p>
                                                <span className="lux-notice-date">Applied: {new Date(pass.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>No recent activity found.</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view cred-page-bg">
                <div className="mob-container">
                    {/* ── TOP SECTION (CRED ID CARD) ── */}
                    <div className="cred-card cred-hero animate-cred-enter cred-stagger-1">
                        <div className="cred-hero-bg"></div>
                        <div className="cred-hero-content">
                            <div className="cred-avatar-wrap">
                                {!imageError && user.photo ? (
                                    <img
                                        src={user.photo.startsWith("blob:") || user.photo.startsWith("data:") || user.photo.startsWith("http")
                                            ? user.photo
                                            : `${import.meta.env.VITE_CDN_URL || ''}${user.photo.startsWith('/') ? user.photo.slice(1) : user.photo}`
                                        }
                                        alt="Profile"
                                        className="cred-avatar"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="cred-avatar cred-avatar-fallback">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                                    </div>
                                )}
                                <div className="cred-status-dot"></div>
                            </div>
                            <div className="cred-hero-text">
                                <span className="cred-badge-gold">Student Portal</span>
                                <span className="cred-h2" style={{ marginTop: '4px', color: 'var(--cred-gold)' }}>{user.name || 'Student'}</span>
                                <span className="cred-p" style={{ fontSize: '13px' }}>{user.department || 'Dept'} • Sem {user.semester || 'N/A'}</span>
                            </div>
                        </div>
                        <button className="mob-logout-btn" onClick={handleLogout} aria-label="Log Out">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>

                    {/* ── QUICK ACTIONS ── */}
                    <div className="mob-quick-actions animate-cred-enter cred-stagger-2">
                        <button className="cred-card cred-qa-card" onClick={() => handleNavigation('/new-outpass')}>
                            <div className="cred-qa-icon" style={{ background: 'rgba(212, 158, 23, 0.39)', color: '#D4A017' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </div>
                            <span>Apply Outpass</span>
                        </button>
                        <button className="cred-card cred-qa-card" onClick={() => handleNavigation('/outpass')}>
                            <div className="cred-qa-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#3B82F6' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                            <span>Track Outpass</span>
                        </button>
                        <button className="cred-card cred-qa-card" onClick={() => handleNavigation('/staffs')}>
                            <div className="cred-qa-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            </div>
                            <span>Staff Directory</span>
                        </button>
                        <button className="cred-card cred-qa-card" onClick={() => handleNavigation('/profile')}>
                            <div className="cred-qa-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </div>
                            <span>Profile</span>
                        </button>
                    </div>

                    {/* ── OUTPASS STATUS ── */}
                    <div className="mob-section animate-cred-enter cred-stagger-3">
                        <div className="mob-section-header">
                            <span className="cred-h2" style={{ fontSize: '18px' }}>Outpass Status</span>
                        </div>
                        <div className="mob-status-chips">
                            <div className="cred-card cred-status-chip">
                                <span className="val" style={{ color: 'var(--cred-warning)' }}>{outpassStats.pending}</span>
                                <span className="cred-label">Pending</span>
                            </div>
                            <div className="cred-card cred-status-chip">
                                <span className="val" style={{ color: 'var(--cred-success)' }}>{outpassStats.approved}</span>
                                <span className="cred-label">Approved</span>
                            </div>
                            <div className="cred-card cred-status-chip">
                                <span className="val" style={{ color: 'var(--cred-blue)' }}>{outpassStats.checkedOut}</span>
                                <span className="cred-label">Checked Out</span>
                            </div>
                        </div>
                    </div>

                    {/* ── ACADEMIC SUMMARY ── */}
                    <div className="mob-section animate-cred-enter cred-stagger-4">
                        <div className="mob-section-header">
                            <span className="cred-h2" style={{ fontSize: '18px' }}>Academic Summary</span>
                        </div>
                        <div className="mob-academic-grid">
                            <div className="cred-card cred-metric">
                                <span className="val">{user.cgpa || '8.25'}</span>
                                <span className="cred-label">CGPA</span>
                            </div>
                            <div className="cred-card cred-metric">
                                <span className="val">85%</span>
                                <span className="cred-label">Attendance</span>
                            </div>
                            <div className="cred-card cred-metric">
                                <span className="val">{user.arrears || '0'}</span>
                                <span className="cred-label">Arrears</span>
                            </div>
                            <div className="cred-card cred-metric">
                                <span className="val">Sem {user.semester || 'N/A'}</span>
                                <span className="cred-label">Semester</span>
                            </div>
                        </div>
                    </div>

                    {/* ── RECENT PASSES ── */}
                    <div className="mob-section animate-cred-enter cred-stagger-5" style={{ marginBottom: '40px' }}>
                        <div className="mob-section-header">
                            <span className="cred-h2" style={{ fontSize: '18px' }}>Recent Activity</span>
                            <button className="mob-btn-text" onClick={() => handleNavigation('/outpass')}>View All</button>
                        </div>
                        {recentPasses.length > 0 ? recentPasses.map((pass: any) => (
                            <div className="cred-card cred-notice-card" key={pass._id}>
                                <div className="cred-notice-icon" style={{ background: pass.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : pass.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: pass.status === 'approved' ? '#10B981' : pass.status === 'rejected' ? '#EF4444' : '#F59E0B' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                </div>
                                <div className="cred-notice-content">
                                    <span className="cred-h2" style={{ fontSize: '15px', textTransform: 'capitalize' }}>{pass.reason}</span>
                                    <span className="cred-p" style={{ fontSize: '13px' }}>{new Date(pass.fromDate).toLocaleDateString()} &bull; <span style={{ textTransform: 'capitalize' }}>{pass.status}</span></span>
                                </div>
                            </div>
                        )) : (
                            <div className="cred-card cred-notice-card">
                                <div className="cred-notice-content">
                                    <span className="cred-p" style={{ fontSize: '13px' }}>No recent outpass activity.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── BOTTOM NAVIGATION ── */}
                <StudentBottomNav activeTab="home" />
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                .dashboard-page-view {
                    font-family: 'Inter', -apple-system, sans-serif;
                    -webkit-font-smoothing: antialiased;
                }

                .dashboard-page-view .content-wrapper {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                @media (max-width: 1024px) {
                    .dashboard-page-view .content-wrapper {
                        gap: 24px;
                    }
                    .lux-quick-actions {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 24px;
                    }
                }

                /* ── DESKTOP VIEWS (RETAINED) ── */
                .lux-hero-card {
                    background: linear-gradient(135deg, #051d41c0 0%, #0d1b3d96 30%, #1a306bab 65%, #2b5cc7bd 100%);
                    border-radius: 20px;
                    padding: 32px 40px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.4);
                    border: 1px solid rgba(3, 203, 234, 0.99);
                    display: flex;
                    align-items: center;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                
                .lux-hero-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -150%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255,255,255,0.12),
                        transparent
                    );
                    transform: skewX(-20deg);
                    animation: shineSweep 6s infinite ease-in-out;
                    pointer-events: none;
                    z-index: 2;
                }

                .lux-hero-card::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 20px;
                    padding: 1px;
                    background: linear-gradient(to bottom, rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.05));
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                    z-index: 3;
                }

                .lux-hero-bg-glow { 
                    position: absolute; 
                    top: -50%; right: -20%; 
                    width: 70%; height: 200%; 
                    background: radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 60%); 
                    pointer-events: none; 
                    z-index: 1;
                }
                .lux-hero-content { position: relative; z-index: 4; display: flex; align-items: center; gap: 24px; }
                
                .lux-avatar-container {
                    position: relative;
                    width: 84px;
                    height: 84px;
                    border-radius: 50%;
                    padding: 3px;
                    background: linear-gradient(135deg, #D4A017, #FBBF24);
                    animation: avatarPulse 6s infinite ease-in-out;
                }
                
                .lux-avatar-img, .lux-avatar-fallback { width: 100%; height: 100%; border-radius: 50%; border: 3px solid #0B1120; background: #1E293B; object-fit: cover; }
                .lux-avatar-fallback { display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: 700; }
                
                .lux-status-dot {
                    position: absolute;
                    bottom: 4px;
                    right: 4px;
                    width: 14px;
                    height: 14px;
                    background: #10B981;
                    border: 2px solid #0F172A;
                    border-radius: 50%;
                    box-shadow: 0 0 6px #10B981, 0 0 12px rgba(16, 185, 129, 0.4) !important;
                }
                
                .lux-hero-text { display: flex; flex-direction: column; gap: 8px; }
                
                .lux-badge-gold {
                    align-self: flex-start;
                    background: rgba(212,160,23,0.15);
                    color: #ffaf0c;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    border: 1px solid rgba(212,160,23,0.3);
                    box-shadow: 0 0 12px rgba(212, 160, 23, 0.25);
                }
                
                .lux-hero-name { color: white; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
                .lux-hero-meta { color: #edeff1ff; font-size: 14px; font-weight: 500; }
                
                .lux-quick-actions {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                }
                
                .lux-qa-card {
                    position: relative;
                    border-radius: 24px !important;
                    height: 140px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: space-between;
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    outline: none;
                    font-family: inherit;
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }
                
                .lux-qa-gloss {
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 50%;
                    background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%);
                    pointer-events: none;
                    border-radius: 24px 24px 0 0;
                }

                .lux-qa-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    text-align: left;
                }
                
                .lux-qa-title {
                    font-size: 18px !important;
                    font-weight: 700 !important;
                    color: #FFFFFF !important;
                    letter-spacing: 0.2px;
                }

                .lux-qa-subtitle {
                    font-size: 13px !important;
                    font-weight: 500 !important;
                    color: rgba(255,255,255,0.7) !important;
                    transition: color 0.3s ease;
                }
                
                .lux-qa-icon { 
                    width: 44px; height: 44px; 
                    border-radius: 12px; 
                    display: flex; align-items: center; justify-content: center; 
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
                }
                
                .lux-qa-card:hover {
                    transform: translateY(-8px) !important;
                }
                
                .lux-qa-card:hover .lux-qa-icon {
                    transform: scale(1.1) translateY(-2px) !important;
                }

                .lux-qa-card:hover .lux-qa-subtitle {
                    color: #FFFFFF !important;
                }
                
                /* Apply Outpass - Gold */
                .lux-qa-card:nth-child(1) {
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(198, 166, 87, 0.6) 100%) !important;
                    border: 1px solid rgba(212,160,23,0.2) !important;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.3) !important;
                }
                .lux-qa-card:nth-child(1) .lux-qa-icon { background: rgba(212,160,23,0.15) !important; color: #D4A017 !important; }
                .lux-qa-card:nth-child(1):hover { 
                    border-color: rgba(212,160,23,0.5) !important; 
                    box-shadow: 0 20px 40px rgba(212, 160, 23, 0.2), 0 0 24px rgba(212, 160, 23, 0.15) !important;
                }

                /* Track Outpass - Royal Blue */
                .lux-qa-card:nth-child(2) {
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.64) 0%, rgba(37, 100, 235, 0.27) 100%) !important;
                    border: 1px solid rgba(37,99,235,0.2) !important;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.3) !important;
                }
                .lux-qa-card:nth-child(2) .lux-qa-icon { background: rgba(37,99,235,0.15) !important; color: #3B82F6 !important; }
                .lux-qa-card:nth-child(2):hover { 
                    border-color: rgba(37,99,235,0.5) !important; 
                    box-shadow: 0 20px 40px rgba(37,99,235,0.2), 0 0 24px rgba(37,99,235,0.15) !important;
                }

                /* Staff Directory - Emerald */
                .lux-qa-card:nth-child(3) {
                    background: linear-gradient(135deg, rgba(21, 31, 55, 0.49) 0%, rgba(16, 185, 129, 0.26) 100%) !important;
                    border: 1px solid rgba(16,185,129,0.2) !important;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.3) !important;
                }
                .lux-qa-card:nth-child(3) .lux-qa-icon { background: rgba(16,185,129,0.15) !important; color: #10B981 !important; }
                .lux-qa-card:nth-child(3):hover { 
                    border-color: rgba(16,185,129,0.5) !important; 
                    box-shadow: 0 20px 40px rgba(16,185,129,0.2), 0 0 24px rgba(16,185,129,0.15) !important;
                }

                /* Profile - Burgundy */
                .lux-qa-card:nth-child(4) {
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(159, 18, 58, 0.35) 100%) !important;
                    border: 1px solid rgba(159,18,57,0.2) !important;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.3) !important;
                }
                .lux-qa-card:nth-child(4) .lux-qa-icon { background: rgba(159,18,57,0.15) !important; color: #F43F5E !important; }
                .lux-qa-card:nth-child(4):hover { 
                    border-color: rgba(159,18,57,0.5) !important; 
                    box-shadow: 0 20px 40px rgba(159,18,57,0.2), 0 0 24px rgba(159,18,57,0.15) !important;
                }

                .lux-dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .lux-grid-col { display: flex; flex-direction: column; gap: 24px; }
                .lux-widget-card { background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
                .lux-widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .lux-widget-header h2 { font-size: 17px; font-weight: 700; color: #0F172A; }
                .lux-text-btn { background: none; border: none; color: #2563EB; font-size: 13px; font-weight: 600; cursor: pointer; transition: color 0.2s; }
                .lux-text-btn:hover { color: #1D4ED8; text-decoration: underline; }
                .lux-outpass-badges { display: flex; justify-content: space-between; gap: 12px; }
                
                .lux-outpass-stat {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 16px 8px;
                    border-radius: 12px;
                    transition: all 0.3s ease !important;
                }
                
                .lux-outpass-stat:nth-child(1) {
                    background: rgba(255, 255, 255, 0.26) !important;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(245, 158, 11, 0.2) !important;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.08) !important;
                }
                .lux-outpass-stat:nth-child(2) {
                    background: rgba(255, 255, 255, 0.4) !important;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(16, 185, 129, 0.2) !important;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08) !important;
                }
                .lux-outpass-stat:nth-child(3) {
                    background: rgba(255, 255, 255, 0.4) !important;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(239, 68, 68, 0.2) !important;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08) !important;
                }
                .lux-outpass-stat:nth-child(4) {
                    background: rgba(255, 255, 255, 0.4) !important;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(212, 160, 23, 0.2) !important;
                    box-shadow: 0 4px 12px rgba(212, 160, 23, 0.08) !important;
                }
                .lux-outpass-stat:nth-child(5) {
                    background: rgba(255, 255, 255, 0.4) !important;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(37, 99, 235, 0.2) !important;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08) !important;
                }

                .lux-stat-val { font-size: 24px; font-weight: 800; line-height: 1; }
                .lux-stat-lbl { font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.3px; }
                
                .lux-outpass-stat:nth-child(1) .lux-stat-val { color: #f59e0b !important; }
                .lux-outpass-stat:nth-child(2) .lux-stat-val { color: #10B981 !important; }
                .lux-outpass-stat:nth-child(3) .lux-stat-val { color: #ef4444 !important; }
                .lux-outpass-stat:nth-child(4) .lux-stat-val { color: #D4A017 !important; }
                .lux-outpass-stat:nth-child(5) .lux-stat-val { color: #3B82F6 !important; }

                .lux-academic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .lux-metric-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 14px; transition: background 0.2s; }
                .lux-metric-card:hover { background: #F1F5F9; }
                .lux-metric-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .bg-gold-light { background: #FEF3C7; } .text-gold { color: #D97706; } .bg-blue-light { background: #DBEAFE; } .text-blue { color: #2563EB; } .bg-red-light { background: #FEE2E2; } .text-red { color: #DC2626; } .bg-navy-light { background: #E2E8F0; } .text-navy { color: #0F172A; }
                .lux-metric-info { display: flex; flex-direction: column; gap: 2px; }
                .lux-metric-val { font-size: 18px; font-weight: 800; color: #0F172A; }
                .lux-metric-lbl { font-size: 12px; font-weight: 500; color: #64748B; }
                .lux-notices-list { display: flex; flex-direction: column; gap: 16px; }
                .lux-notice-item { display: flex; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid #F1F5F9; }
                .lux-notice-item:last-child { border-bottom: none; padding-bottom: 0; }
                .lux-notice-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; height: fit-content; }
                .badge-urgent { background: #FEE2E2; color: #DC2626; } .badge-info { background: #DBEAFE; color: #2563EB; } .badge-event { background: #FEF3C7; color: #D97706; }
                .lux-notice-content { display: flex; flex-direction: column; gap: 4px; }
                .lux-notice-content h4 { font-size: 14px; font-weight: 700; color: #0F172A; }
                .lux-notice-content p { font-size: 13px; color: #475569; line-height: 1.5; }
                .lux-notice-date { font-size: 11px; font-weight: 500; color: #94A3B8; margin-top: 4px; }
                
                .lux-mobile-view { display: none; }
                .lux-desktop-view { display: block; }

                @media (max-width: 900px) { .lux-dashboard-grid { grid-template-columns: 1fr; } }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view { display: block !important; }
                    .student-page.dashboard-page-view { 
                        padding-bottom: calc(90px + env(safe-area-inset-bottom, 16px)); 
                    }
                }

                /* ==========================================
                   CRED PREMIUM MOBILE STYLES (DASHBOARD)
                   ========================================== */
                .mob-container {
                    padding: 24px 16px 16px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                /* Hero Card */
                .cred-hero {
                    background: linear-gradient(-45deg, #0e0c0cff, #22262aff, #1E3A8A, #0B1120) !important;
                    background-size: 300% 300% !important;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    min-height: 140px;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
                }
                
                .cred-hero::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -150%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255,255,255,0.08),
                        transparent
                    );
                    transform: skewX(-20deg);
                    animation: shineSweep 8s infinite ease-in-out;
                    pointer-events: none;
                    z-index: 2;
                }

                .cred-hero::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 24px;
                    padding: 1px;
                    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                    z-index: 3;
                }

                .cred-hero.animate-cred-enter {
                    animation: heroEntrance 500ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
                    animation-delay: 50ms !important;
                }

                .mob-logout-btn {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #EF4444;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    transition: all 0.2s ease;
                }
                .mob-logout-btn:active {
                    transform: scale(0.9);
                    background: rgba(239, 68, 68, 0.2);
                }
                .cred-hero-bg {
                    position: absolute;
                    top: -50%; right: -20%;
                    width: 150%; height: 200%;
                    background: radial-gradient(circle, rgba(212,160,23,0.08) 0%, transparent 50%);
                    pointer-events: none;
                    z-index: 1;
                }
                .cred-avatar-wrap {
                    position: relative;
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    padding: 3px;
                    background: linear-gradient(135deg, #D4A017, #FBBF24) !important;
                    flex-shrink: 0;
                    z-index: 1;
                    animation: avatarPulse 6s infinite ease-in-out;
                }
                .cred-avatar {
                    width: 100%; height: 100%;
                    border-radius: 50%;
                    border: 3px solid #0B1120;
                    object-fit: cover;
                }
                .cred-avatar-fallback {
                    background: #1d377aff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                    font-weight: 700;
                }
                .cred-status-dot {
                    position: absolute;
                    bottom: 2px; right: 2px;
                    width: 14px; height: 14px;
                    background: #10B981;
                    border: 2px solid #0B1120;
                    border-radius: 50%;
                    box-shadow: 0 0 6px #10B981, 0 0 12px rgba(16, 185, 129, 0.4) !important;
                }
                .cred-hero-text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    z-index: 1;
                }
                
                .cred-badge-gold {
                    background: rgba(212,160,23,0.15) !important;
                    color: #FBBF24 !important;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border: 1px solid rgba(212,160,23,0.2) !important;
                    display: inline-block;
                    box-shadow: 0 0 12px rgba(212, 160, 23, 0.25);
                }

                /* Quick Actions */
                .mob-quick-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                
                .cred-qa-card {
                    color: #FFFFFF !important;
                    font-weight: 600 !important;
                }
                
                .cred-qa-card span {
                    font-size: 14px;
                    font-weight: 700;
                    color: #0F172A !important;
                }
                
                .cred-qa-card {
                    background: rgba(255, 255, 255, 0.85) !important;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.60) !important;
                    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.10) !important;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: transform 100ms ease, box-shadow 0.2s !important;
                }
                
                .cred-qa-card:active {
                    transform: scale(0.97) !important;
                }
                .cred-qa-icon {
                    width: 44px; height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Sections */
                .mob-section {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .mob-section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 4px;
                }
                .mob-btn-text {
                    color: var(--cred-gold);
                    font-size: 13px;
                    font-weight: 700;
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                }

                /* Status Chips */
                .mob-status-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                
                .cred-status-chip {
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                    min-width: 140px;
                    border-radius: 16px;
                    transition: all 0.2s ease !important;
                }
                
                .cred-status-chip:nth-child(1) {
                    background: rgba(245, 158, 11, 0.08) !important;
                    border: 1px solid rgba(245, 158, 11, 0.20) !important;
                    box-shadow: none !important;
                }
                .cred-status-chip:nth-child(1) .val { color: #D97706 !important; }

                .cred-status-chip:nth-child(2) {
                    background: rgba(5, 150, 105, 0.08) !important;
                    border: 1px solid rgba(5, 150, 105, 0.20) !important;
                    box-shadow: none !important;
                }
                .cred-status-chip:nth-child(2) .val { color: #059669 !important; }

                .cred-status-chip:nth-child(3) {
                    background: rgba(184, 134, 11, 0.08) !important;
                    border: 1px solid rgba(184, 134, 11, 0.20) !important;
                    box-shadow: none !important;
                }
                .cred-status-chip:nth-child(3) .val { color: #B8860B !important; }

                .cred-status-chip .val {
                    font-size: 24px;
                    font-weight: 800;
                    line-height: 1;
                }

                /* Academic Grid */
                .mob-academic-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .cred-metric {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    border-radius: 16px;
                }
                .cred-metric .val {
                    font-size: 24px;
                    font-weight: 800;
                    color: #0F172A;
                }

                /* Notice Card */
                .cred-notice-card {
                    padding: 16px;
                    display: flex;
                    gap: 16px;
                    border-radius: 16px;
                }
                .cred-notice-icon {
                    width: 44px; height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .cred-notice-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                /* Keyframes & Extra Utilities */
                @keyframes meshGradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes shineSweep {
                    0% { left: -150%; }
                    30% { left: 150%; }
                    100% { left: 150%; }
                }

                @keyframes avatarPulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(212, 160, 23, 0.4), 0 8px 16px rgba(0,0,0,0.25);
                    }
                    50% {
                        box-shadow: 0 0 0 8px rgba(212, 160, 23, 0), 0 8px 16px rgba(0,0,0,0.25);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(212, 160, 23, 0), 0 8px 16px rgba(0,0,0,0.25);
                    }
                }

                @keyframes heroEntrance {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-hero {
                    animation: heroEntrance 500ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
