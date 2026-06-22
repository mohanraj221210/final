import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type User } from '../../data/sampleData';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import StudentHeader from '../../components/StudentHeader';
import StudentBottomNav from '../../components/StudentBottomNav';
import LoadingSpinner from '../../components/LoadingSpinner';
import { isProfileComplete } from '../../utils/profileHelper';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("");
    
    useEffect(() => {
        let i = 0;
        setDisplayedText("");
        if (!text) return;
        
        const intervalId = setInterval(() => {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(intervalId);
            }
        }, 80);
        
        return () => clearInterval(intervalId);
    }, [text]);
    
    return (
        <span>
            {displayedText}
            <span className="db-blinking-cursor">|</span>
        </span>
    );
};

const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'approved') return { bg: 'rgba(16,185,129,0.1)', color: '#059669', border: 'rgba(16,185,129,0.2)' };
    if (s === 'rejected') return { bg: 'rgba(239,68,68,0.1)', color: '#DC2626', border: 'rgba(239,68,68,0.2)' };
    if (s === 'checkedout') return { bg: 'rgba(59,130,246,0.1)', color: '#2563EB', border: 'rgba(59,130,246,0.2)' };
    if (s === 'checkedin') return { bg: 'rgba(139,92,246,0.1)', color: '#7C3AED', border: 'rgba(139,92,246,0.2)' };
    return { bg: 'rgba(245,158,11,0.1)', color: '#D97706', border: 'rgba(245,158,11,0.2)' };
};

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
    const [navigatingPath, setNavigatingPath] = useState<string | null>(null);
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
                    const statsArray = statsRes.data.stats[0].stats || [];
                    let pendingCount = 0;
                    let approvedCount = 0;
                    let rejectedCount = 0;
                    let checkedOutCount = 0;
                    let checkedInCount = 0;

                    statsArray.forEach((group: any) => {
                        const statusId = (group._id || '').toLowerCase().replace(/[-_ ]/g, '');
                        const count = typeof group.total === 'number' ? group.total : (group[group._id] || 0);

                        if (statusId === 'pending') pendingCount += count;
                        else if (statusId === 'approved') approvedCount += count;
                        else if (statusId === 'rejected') rejectedCount += count;
                        else if (statusId === 'checkedout') checkedOutCount += count;
                        else if (statusId === 'checkedin') checkedInCount += count;
                    });

                    setOutpassStats({
                        pending: pendingCount,
                        approved: approvedCount,
                        rejected: rejectedCount,
                        checkedOut: checkedOutCount,
                        checkedIn: checkedInCount,
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
        setNavigatingPath(path);
        setTimeout(() => {
            setNavigatingPath(null);
            navigate(path);
        }, 200);
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const completionPercent = React.useMemo(() => {
        let total = 0;
        let filled = 0;
        const basicFields = ['name', 'registerNumber', 'department', 'year', 'phone', 'email', 'parentnumber', 'residencetype', 'photo', 'semester', 'batch', 'gender'];
        total += basicFields.length;
        basicFields.forEach(field => {
            if (user[field as keyof User] && user[field as keyof User] !== 'N/A' && user[field as keyof User] !== '') filled++;
        });

        if (user.residencetype === 'hostel') {
            total += 2;
            if (user.hostelname) filled++;
            if (user.hostelroomno) filled++;
        } else if (user.residencetype === 'day scholar') {
            total += 2;
            if (user.busno) filled++;
            if (user.boardingpoint) filled++;
        }
        
        return Math.round((filled / total) * 100) || 0;
    }, [user]);

    if (Loading) return <LoadingSpinner />;

    const totalOutpasses = outpassStats.pending + outpassStats.approved + outpassStats.rejected + outpassStats.checkedOut + outpassStats.checkedIn;

    const getAvatarSrc = () => {
        if (!user.photo) return null;
        if (user.photo.startsWith("blob:") || user.photo.startsWith("data:") || user.photo.startsWith("http")) return user.photo;
        const normalizedPath = user.photo.startsWith("/") ? user.photo.slice(1) : user.photo;
        const cdnUrl = import.meta.env.VITE_CDN_URL || '';
        const normalizedCdnUrl = cdnUrl.endsWith("/") ? cdnUrl : `${cdnUrl}/`;
        return `${normalizedCdnUrl}${normalizedPath}`;
    };

    const quickActions = [
        {
            path: '/new-outpass', label: 'Apply\nOutpass',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
        },
        {
            path: '/outpass', label: 'Track\nOutpass',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        },
        {
            path: '/staffs', label: 'Faculty\nDirectory',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        },
        {
            path: '/subjects', label: 'My\nSubjects',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        },
        {
            path: '/profile', label: 'My\nProfile',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        },
        {
            path: '/bus-routes', label: 'Bus\nRoutes',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><rect x="8" y="7" width="8" height="6" rx="1"/><path d="M6 21v-2"/><path d="M18 21v-2"/><circle cx="8" cy="17" r="1"/><circle cx="16" cy="17" r="1"/><path d="M4 11h16"/></svg>
        },
    ];

    const statCards = [
        { label: 'Approved', value: outpassStats.approved, colorClass: 'green', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
        { label: 'Pending', value: outpassStats.pending, colorClass: 'amber', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
        { label: 'Rejected', value: outpassStats.rejected, colorClass: 'red', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
        { label: 'Checked Out', value: outpassStats.checkedOut, colorClass: 'blue', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> },
        { label: 'Checked In', value: outpassStats.checkedIn, colorClass: 'sky', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> },
    ];

    return (
        <div className="db-page">
            <ToastContainer position="top-right" />
            
            {/* Desktop Header */}
            <div className="db-desktop-header">
                <StudentHeader />
            </div>

            <main className="db-main">
                <div className="db-container">

                    {/* ── HERO / WELCOME CARD ── */}
                    <div className="db-hero-card pb-stagger-1">
                        {/* Mobile logout button */}
                        <button className="db-mob-logout" onClick={handleLogout}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Logout
                        </button>

                        <div className="db-hero-content">
                            {/* Avatar */}
                            <div className="db-avatar-wrap">
                                {!imageError && getAvatarSrc() ? (
                                    <img src={getAvatarSrc()!} alt="Profile" className="db-avatar-img" onError={() => setImageError(true)} />
                                ) : (
                                    <div className="db-avatar-fallback">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                                    </div>
                                )}
                                <div className="db-avatar-status" />
                            </div>

                            {/* Greeting */}
                            <div className="db-hero-text">
                                <span className="db-greeting-pill">{getGreeting()} 👋</span>
                                <h1 className="db-name"><TypewriterText text={user.name || 'Student'} /></h1>
                                <p className="db-meta">{user.registerNumber || 'N/A'} · {user.department || 'Department'} · Sem {user.semester || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Hero mini stats */}
                        <div className="db-hero-stats">
                            <div className="db-hero-stat">
                                <div className="db-hero-stat-icon blue">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <div>
                                    <div className="db-hero-stat-val">{completionPercent}%</div>
                                    <div className="db-hero-stat-lbl">Profile</div>
                                </div>
                            </div>
                            <div className="db-hero-stat-divider" />
                            <div className="db-hero-stat">
                                <div className="db-hero-stat-icon amber">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                </div>
                                <div>
                                    <div className="db-hero-stat-val">{totalOutpasses}</div>
                                    <div className="db-hero-stat-lbl">Outpasses</div>
                                </div>
                            </div>
                            <div className="db-hero-stat-divider" />
                            <div className="db-hero-stat">
                                <div className="db-hero-stat-icon green">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                </div>
                                <div>
                                    <div className="db-hero-stat-val">{user.cgpa || 'N/A'}</div>
                                    <div className="db-hero-stat-lbl">CGPA</div>
                                </div>
                            </div>
                        </div>

                        {/* Profile completion progress */}
                        {completionPercent < 100 && (
                            <div className="db-progress-wrap">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Profile Completion</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3B82F6' }}>{completionPercent}%</span>
                                </div>
                                <div className="pb-progress">
                                    <div className="pb-progress-fill" style={{ width: `${completionPercent}%` }} />
                                </div>
                                <button className="db-complete-profile-btn" onClick={() => handleNavigation('/profile')}>
                                    Complete Profile →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── QUICK ACTIONS ── */}
                    <section className="pb-stagger-2">
                        <div className="pb-section-header">
                            <h2 className="pb-section-title">
                                <span className="pb-section-title-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                </span>
                                Quick Actions
                            </h2>
                        </div>
                        <div className="pb-action-grid">
                            {quickActions.map((action) => (
                                <button
                                    key={action.path}
                                    className={`pb-action-card ${navigatingPath === action.path ? 'navigating' : ''}`}
                                    onClick={() => handleNavigation(action.path)}
                                >
                                    <div className="pb-action-icon">{action.icon}</div>
                                    <span className="pb-action-label" style={{ whiteSpace: 'pre-line' }}>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* ── OUTPASS OVERVIEW ── */}
                    <section className="pb-stagger-3">
                        <div className="pb-section-header">
                            <h2 className="pb-section-title">
                                <span className="pb-section-title-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                </span>
                                Outpass Overview
                            </h2>
                            <button className="pb-view-all" onClick={() => navigate('/outpass')}>
                                View All
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                        </div>
                        <div className="db-stats-grid">
                            {statCards.map((stat) => (
                                <div key={stat.label} className="pb-stat-card db-stat-hoverable">
                                    <div className={`pb-stat-icon ${stat.colorClass}`}>{stat.icon}</div>
                                    <div>
                                        <div className="pb-stat-value">{stat.value}</div>
                                        <div className="pb-stat-label">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── RECENT ACTIVITY ── */}
                    <section className="pb-stagger-4">
                        <div className="pb-section-header">
                            <h2 className="pb-section-title">
                                <span className="pb-section-title-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                </span>
                                Recent Activity
                            </h2>
                            <button className="pb-view-all" onClick={() => navigate('/outpass')}>
                                View All
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                        </div>
                        <div className="pb-card" style={{ padding: '8px' }}>
                            {recentPasses.length > 0 ? (
                                <div>
                                    {recentPasses.slice(0, 3).map((pass, idx) => {
                                        const sc = getStatusColor(pass.status);
                                        return (
                                            <div key={pass._id || idx} className="db-activity-item">
                                                <div className="db-activity-icon-wrap" style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={sc.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                                </div>
                                                <div className="db-activity-content">
                                                    <div className="db-activity-reason">{pass.reason}</div>
                                                    <div className="db-activity-meta">{(pass.outpasstype || pass.outpassType || 'General')} · {new Date(pass.createdAt).toLocaleDateString()}</div>
                                                </div>
                                                <span className="db-status-pill" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                                                    {pass.status || 'Pending'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="pb-empty-state">
                                    <div className="pb-empty-icon">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
                                    </div>
                                    <div className="pb-empty-title">No Recent Activity</div>
                                    <div className="pb-empty-desc">Apply for your first outpass to get started.</div>
                                    <button className="pb-btn-primary" style={{ marginTop: '8px', height: '38px', fontSize: '0.82rem' }} onClick={() => handleNavigation('/new-outpass')}>
                                        Apply Outpass
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── ACADEMIC OVERVIEW ── */}
                    <section className="pb-stagger-5">
                        <div className="pb-section-header">
                            <h2 className="pb-section-title">
                                <span className="pb-section-title-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                                </span>
                                Academic Overview
                            </h2>
                            <span className="pb-badge pb-badge-blue">{user.department || 'N/A'}</span>
                        </div>
                        <div className="pb-card" style={{ padding: '20px' }}>
                            <div className="db-academic-grid">
                                {[
                                    { icon: '👨‍🏫', label: 'Tutor', value: user.staffid?.name || 'Not Assigned' },
                                    { icon: '🎓', label: 'Semester', value: user.semester ? `Sem ${user.semester}` : 'N/A' },
                                    { icon: '📅', label: 'Batch', value: user.batch || 'N/A' },
                                    { icon: '🏡', label: 'Residence', value: user.residencetype ? user.residencetype.charAt(0).toUpperCase() + user.residencetype.slice(1) : 'N/A' },
                                ].map((item) => (
                                    <div key={item.label} className="db-academic-item">
                                        <div className="db-academic-icon">{item.icon}</div>
                                        <div>
                                            <div className="db-academic-label">{item.label}</div>
                                            <div className="db-academic-value">{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                </div>
            </main>

            <StudentBottomNav activeTab="home" />

            <style>{`
                .db-page {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #F8FBFF 0%, #EEF6FF 50%, #DCEEFF 100%);
                    background-attachment: fixed;
                    overflow-x: hidden;
                    position: relative;
                    padding-bottom: calc(100px + env(safe-area-inset-bottom, 16px));
                }
                
                .db-desktop-header {
                    display: block;
                }

                .db-main {
                    padding-top: 96px;
                }

                .db-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 16px 24px 0;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                /* HERO CARD */
                .db-hero-card {
                    background: linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(239,246,255,0.94) 100%);
                    backdrop-filter: blur(24px) saturate(200%);
                    -webkit-backdrop-filter: blur(24px) saturate(200%);
                    border: 1px solid rgba(59,130,246,0.14);
                    border-radius: 24px;
                    padding: 28px 28px 24px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 8px 32px rgba(59,130,246,0.08), 0 2px 8px rgba(15,23,42,0.04);
                }

                .db-hero-card::before {
                    content: '';
                    position: absolute;
                    top: -80px; right: -80px;
                    width: 240px; height: 240px;
                    background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%);
                    pointer-events: none;
                }

                .db-mob-logout {
                    display: none;
                }

                .db-hero-content {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .db-avatar-wrap {
                    width: 68px; height: 68px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
                    padding: 3px;
                    flex-shrink: 0;
                    position: relative;
                }

                .db-avatar-img, .db-avatar-fallback {
                    width: 100%; height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .db-avatar-fallback {
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #3B82F6;
                }

                .db-avatar-status {
                    position: absolute;
                    bottom: 3px; right: 3px;
                    width: 12px; height: 12px;
                    background: #10B981;
                    border: 2px solid white;
                    border-radius: 50%;
                }

                .db-greeting-pill {
                    display: inline-block;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #3B82F6;
                    background: rgba(59,130,246,0.08);
                    padding: 3px 10px;
                    border-radius: 999px;
                    margin-bottom: 6px;
                    border: 1px solid rgba(59,130,246,0.12);
                }

                .db-name {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #0F172A;
                    letter-spacing: -0.04em;
                    line-height: 1.15;
                    margin-bottom: 4px;
                }

                .db-blinking-cursor {
                    font-weight: 200;
                    color: #3B82F6;
                    animation: dbBlink 1s step-end infinite;
                }
                @keyframes dbBlink {
                    from, to { opacity: 1; }
                    50% { opacity: 0; }
                }

                .db-meta {
                    font-size: 0.82rem;
                    color: #64748B;
                    font-weight: 500;
                }

                /* HERO STATS */
                .db-hero-stats {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    background: rgba(241,245,249,0.7);
                    border: 1px solid rgba(59,130,246,0.08);
                    border-radius: 16px;
                    padding: 12px 16px;
                    margin-bottom: 16px;
                }

                .db-hero-stat {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .db-hero-stat-divider {
                    width: 1px;
                    height: 32px;
                    background: rgba(59,130,246,0.1);
                    margin: 0 12px;
                    flex-shrink: 0;
                }

                .db-hero-stat-icon {
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .db-hero-stat-icon.blue   { background: rgba(59,130,246,0.1); color: #3B82F6; }
                .db-hero-stat-icon.amber  { background: rgba(245,158,11,0.1); color: #D97706; }
                .db-hero-stat-icon.green  { background: rgba(16,185,129,0.1); color: #059669; }

                .db-hero-stat-val {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #0F172A;
                    line-height: 1;
                }

                .db-hero-stat-lbl {
                    font-size: 0.7rem;
                    font-weight: 500;
                    color: #64748B;
                    margin-top: 2px;
                }

                /* PROGRESS */
                .db-progress-wrap {
                    padding-top: 16px;
                    border-top: 1px solid rgba(59,130,246,0.06);
                }

                .db-complete-profile-btn {
                    margin-top: 10px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #3B82F6;
                    background: rgba(59,130,246,0.07);
                    border: 1px solid rgba(59,130,246,0.15);
                    border-radius: 999px;
                    padding: 6px 14px;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }
                .db-complete-profile-btn:hover {
                    background: rgba(59,130,246,0.12);
                    border-color: rgba(59,130,246,0.25);
                }

                /* STATS GRID */
                .db-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 10px;
                }

                .db-stat-hoverable {
                    cursor: pointer;
                }

                /* ACTIVITY */
                .db-activity-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 12px;
                    border-radius: 12px;
                    transition: background 0.2s;
                }
                .db-activity-item:hover {
                    background: rgba(59,130,246,0.04);
                }
                .db-activity-item + .db-activity-item {
                    border-top: 1px solid rgba(59,130,246,0.06);
                }

                .db-activity-icon-wrap {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }

                .db-activity-content { flex: 1; min-width: 0; }
                .db-activity-reason {
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: #0F172A;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .db-activity-meta {
                    font-size: 0.75rem;
                    color: #64748B;
                    margin-top: 2px;
                }

                .db-status-pill {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 3px 10px;
                    border-radius: 999px;
                    white-space: nowrap;
                    text-transform: capitalize;
                }

                /* ACADEMIC GRID */
                .db-academic-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }

                .db-academic-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    background: rgba(248,251,255,0.8);
                    border: 1px solid rgba(59,130,246,0.07);
                    border-radius: 12px;
                    padding: 14px 12px;
                    transition: all 0.2s;
                }
                .db-academic-item:hover {
                    background: rgba(239,246,255,0.9);
                    border-color: rgba(59,130,246,0.14);
                    transform: translateY(-1px);
                }

                .db-academic-icon {
                    font-size: 1.3rem;
                    flex-shrink: 0;
                    line-height: 1;
                }

                .db-academic-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 3px;
                }

                .db-academic-value {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #0F172A;
                }

                /* ── MOBILE ── */
                @media (max-width: 850px) {
                    .db-desktop-header { display: none; }
                    .db-main { padding-top: 0; }
                    .db-container { padding: 16px 14px 0; gap: 16px; }

                    .db-mob-logout {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        position: absolute;
                        top: 14px; right: 14px;
                        background: rgba(59,130,246,0.07);
                        border: 1px solid rgba(59,130,246,0.12);
                        border-radius: 999px;
                        padding: 5px 10px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: #64748B;
                        cursor: pointer;
                        font-family: inherit;
                        transition: all 0.2s;
                    }
                    .db-mob-logout:active { transform: scale(0.95); }

                    .db-hero-card { padding: 20px 18px 18px; }
                    .db-hero-content { gap: 12px; margin-bottom: 16px; }
                    .db-avatar-wrap { width: 56px; height: 56px; }
                    .db-name { font-size: 1.3rem; }
                    .db-meta { font-size: 0.76rem; }

                    .db-hero-stats {
                        padding: 10px 12px;
                        gap: 0;
                    }
                    .db-hero-stat-val { font-size: 1rem; }
                    .db-hero-stat-divider { margin: 0 8px; }

                    .db-stats-grid {
                        grid-template-columns: repeat(5, 1fr);
                        gap: 6px;
                    }
                    .pb-stat-card {
                        flex-direction: column;
                        align-items: center;
                        padding: 10px 6px;
                        gap: 6px;
                        text-align: center;
                    }
                    .pb-stat-icon {
                        width: 34px; height: 34px;
                    }
                    .pb-stat-value { font-size: 1.1rem; }
                    .pb-stat-label { font-size: 0.65rem; }

                    .db-academic-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
                    .db-academic-item { padding: 12px 10px; }
                }

                @media (max-width: 480px) {
                    .db-stats-grid { grid-template-columns: repeat(3, 1fr); }
                    .db-academic-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 380px) {
                    .db-hero-stat-divider { display: none; }
                    .db-hero-stats { gap: 8px; flex-wrap: wrap; }
                    .db-hero-stat { flex: auto; }
                }

                /* Quick action navigating state */
                .pb-action-card.navigating {
                    opacity: 0.7;
                    transform: scale(0.96) !important;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
