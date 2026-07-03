import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type User } from '../../data/sampleData';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import StudentHeader from '../../components/StudentHeader';
import StudentBottomNav from '../../components/StudentBottomNav';
import { isProfileComplete } from '../../utils/profileHelper';
import '../../student-portal.css';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User>({
        name: "", registerNumber: "", staffid: { id: "", name: "" },
        department: "", year: "", semester: 0, email: "", phone: "",
        photo: "", batch: "", gender: "male", parentnumber: "",
        residencetype: "day scholar", hostelname: "", hostelroomno: "",
        busno: "", boardingpoint: "",
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
                    axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, { headers: { authorization: `Bearer ${token}` } }).catch(e => { console.error('Profile fetch error', e); return null; }),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/outpass/stats`, { headers: { authorization: `Bearer ${token}` } }).catch(e => { console.error('Stats fetch error', e); return null; })
                ]);
                if (profileRes?.status === 200) { setUser(profileRes.data.user); setImageError(false); }
                if (statsRes?.status === 200 && statsRes.data?.stats?.length > 0) {
                    const statsData = statsRes.data.stats[0].stats?.length > 0 ? statsRes.data.stats[0].stats[0] : {};
                    setOutpassStats({ pending: statsData.pending || 0, approved: statsData.approved || 0, rejected: statsData.rejected || 0, checkedOut: 0, checkedIn: 0 });
                    setRecentPasses(statsRes.data.stats[0].recentpasses || []);
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
            toast.warn("Complete your profile to access this feature", { position: "top-center", autoClose: 3000 });
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

    const getAvatarSrc = () => {
        if (!user?.photo) return null;
        if (user.photo.startsWith("blob:") || user.photo.startsWith("data:") || user.photo.startsWith("http")) return user.photo;
        const normalizedPath = user.photo.startsWith("/") ? user.photo.slice(1) : user.photo;
        const cdnUrl = import.meta.env.VITE_CDN_URL || '';
        return `${cdnUrl.endsWith("/") ? cdnUrl : `${cdnUrl}/`}${normalizedPath}`;
    };

    const avatarSrc = getAvatarSrc();
    const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'S';
    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getStatusColor = (status: string) => {
        if (status === 'approved') return '#059669';
        if (status === 'rejected') return '#DC2626';
        return '#D97706';
    };
    const getStatusBg = (status: string) => {
        if (status === 'approved') return '#ECFDF5';
        if (status === 'rejected') return '#FEF2F2';
        return '#FFFBEB';
    };

    if (loading) {
        return (
            <div className="sp-page">
                {/* Desktop skeleton */}
                <div className="sp-desktop">
                    <StudentHeader />
                    <div className="sp-content" style={{ paddingTop: 'calc(70px + 32px)' }}>
                        <div className="sp-skeleton" style={{ height: 160, borderRadius: 24, marginBottom: 24 }}/>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 24 }}>
                            {[1,2,3,4].map(i => <div key={i} className="sp-skeleton" style={{ height: 140, borderRadius: 20 }}/>)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="sp-skeleton" style={{ height: 260, borderRadius: 20 }}/>
                            <div className="sp-skeleton" style={{ height: 260, borderRadius: 20 }}/>
                        </div>
                    </div>
                </div>
                {/* Mobile skeleton */}
                <div className="sp-mobile">
                    <div className="sp-mob-body" style={{ paddingTop: 24 }}>
                        <div className="sp-skeleton" style={{ height: 160, borderRadius: 24 }}/>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[1,2,3,4].map(i => <div key={i} className="sp-skeleton" style={{ height: 110, borderRadius: 18 }}/>)}
                        </div>
                        <div className="sp-skeleton" style={{ height: 130, borderRadius: 18 }}/>
                        <div className="sp-skeleton" style={{ height: 200, borderRadius: 18 }}/>
                    </div>
                    <StudentBottomNav activeTab="home" />
                </div>
            </div>
        );
    }

    const quickActions = [
        {
            label: 'Apply Outpass', desc: 'Submit a new request', path: '/new-outpass',
            color: 'sp-qa-purple',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
            mobColor: '#EEF2FF', mobIconColor: '#4F46E5'
        },
        {
            label: 'Track Outpass', desc: 'View all requests', path: '/outpass',
            color: 'sp-qa-blue',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            mobColor: '#EFF6FF', mobIconColor: '#2563EB'
        },
        {
            label: 'Faculty', desc: 'Browse staff directory', path: '/staffs',
            color: 'sp-qa-green',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
            mobColor: '#ECFDF5', mobIconColor: '#059669'
        },
        {
            label: 'My Profile', desc: 'Manage your details', path: '/profile',
            color: 'sp-qa-orange',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
            mobColor: '#FFF7ED', mobIconColor: '#EA580C'
        },
    ];

    return (
        <div className="sp-page">
            <ToastContainer position="top-center" />

            {/* ═══════════════ DESKTOP ═══════════════ */}
            <div className="sp-desktop">
                <StudentHeader user={user} />

                <div className="sp-content">
                    {/* HERO */}
                    <div className="sp-hero sp-animate-enter">
                        <div className="sp-hero-avatar">
                            <div className="sp-hero-avatar-inner">
                                {avatarSrc && !imageError ? (
                                    <img src={avatarSrc} alt="Profile" onError={() => setImageError(true)} />
                                ) : userInitial}
                            </div>
                            <span className="sp-hero-status"/>
                        </div>

                        <div className="sp-hero-info">
                            <span className="sp-hero-badge">
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}/>
                                Student Portal
                            </span>
                            <h1 className="sp-hero-name">{greeting()}, {user.name?.split(' ')[0] || 'Student'}!</h1>
                            <p className="sp-hero-meta">{user.registerNumber} &nbsp;•&nbsp; {user.department} &nbsp;•&nbsp; {user.year} Year &nbsp;•&nbsp; Sem {user.semester}</p>
                        </div>

                        <div className="sp-hero-actions">
                            <button className="sp-btn sp-btn-surface" onClick={() => handleNavigation('/new-outpass')}
                                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                New Outpass
                            </button>
                            {!isProfileComplete(user) && (
                                <button className="sp-btn" onClick={() => navigate('/profile')}
                                    style={{ background: '#F59E0B', color: 'white', border: 'none' }}>
                                    ⚠️ Complete Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="sp-quick-actions sp-animate-enter sp-stagger-1">
                        {quickActions.map((qa, i) => (
                            <button
                                key={qa.path}
                                className={`sp-qa-card ${qa.color} sp-stagger-${i+1}`}
                                onClick={() => handleNavigation(qa.path)}
                            >
                                <div className="sp-qa-icon">{qa.icon}</div>
                                <div>
                                    <span className="sp-qa-title">{qa.label}</span>
                                    <span className="sp-qa-subtitle">{qa.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* MAIN GRID */}
                    <div className="sp-dashboard-grid">
                        {/* LEFT COLUMN */}
                        <div className="sp-dashboard-col">
                            {/* Outpass Stats */}
                            <div className="sp-widget sp-animate-enter sp-stagger-2">
                                <div className="sp-widget-header">
                                    <span className="sp-widget-title">Outpass Status</span>
                                    <button className="sp-text-link" onClick={() => handleNavigation('/outpass')}>View All →</button>
                                </div>
                                <div className="sp-stats-row">
                                    <div className="sp-stat-item">
                                        <span className="sp-stat-val sp-pending">{outpassStats.pending}</span>
                                        <span className="sp-stat-lbl">Pending</span>
                                    </div>
                                    <div className="sp-stat-item">
                                        <span className="sp-stat-val sp-approved">{outpassStats.approved}</span>
                                        <span className="sp-stat-lbl">Approved</span>
                                    </div>
                                    <div className="sp-stat-item">
                                        <span className="sp-stat-val sp-rejected">{outpassStats.rejected}</span>
                                        <span className="sp-stat-lbl">Rejected</span>
                                    </div>
                                    <div className="sp-stat-item">
                                        <span className="sp-stat-val sp-info">{outpassStats.checkedOut}</span>
                                        <span className="sp-stat-lbl">Checked Out</span>
                                    </div>
                                    <div className="sp-stat-item">
                                        <span className="sp-stat-val sp-default">{outpassStats.checkedIn}</span>
                                        <span className="sp-stat-lbl">Checked In</span>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Info */}
                            <div className="sp-widget sp-animate-enter sp-stagger-3">
                                <div className="sp-widget-header">
                                    <span className="sp-widget-title">Academic Summary</span>
                                </div>
                                <div className="sp-widget-body">
                                    <div className="sp-metrics-grid">
                                        <div className="sp-metric">
                                            <div className="sp-metric-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                            </div>
                                            <div>
                                                <span className="sp-metric-val">{(user as any).cgpa || '—'}</span>
                                                <span className="sp-metric-lbl">CGPA</span>
                                            </div>
                                        </div>
                                        <div className="sp-metric">
                                            <div className="sp-metric-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                            </div>
                                            <div>
                                                <span className="sp-metric-val">85%</span>
                                                <span className="sp-metric-lbl">Attendance</span>
                                            </div>
                                        </div>
                                        <div className="sp-metric">
                                            <div className="sp-metric-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                            </div>
                                            <div>
                                                <span className="sp-metric-val">{(user as any).arrears || '0'}</span>
                                                <span className="sp-metric-lbl">Arrears</span>
                                            </div>
                                        </div>
                                        <div className="sp-metric">
                                            <div className="sp-metric-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                            </div>
                                            <div>
                                                <span className="sp-metric-val">Sem {user.semester || '—'}</span>
                                                <span className="sp-metric-lbl">{user.year || '—'} Year</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="sp-dashboard-col">
                            {/* Recent Passes */}
                            <div className="sp-widget sp-animate-enter sp-stagger-4" style={{ flex: 1 }}>
                                <div className="sp-widget-header">
                                    <span className="sp-widget-title">Recent Outpass Activity</span>
                                    <button className="sp-text-link" onClick={() => handleNavigation('/outpass')}>View All →</button>
                                </div>
                                <div className="sp-widget-body">
                                    {recentPasses.length > 0 ? recentPasses.map((pass: any, i: number) => (
                                        <div key={pass._id || i} className="sp-activity-item">
                                            <div className="sp-activity-dot" style={{ background: getStatusBg(pass.status) }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={getStatusColor(pass.status)} strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                                </svg>
                                            </div>
                                            <div className="sp-activity-text">
                                                <p className="sp-activity-title" style={{ textTransform: 'capitalize' }}>{pass.reason}</p>
                                                <p className="sp-activity-meta">{new Date(pass.fromDate).toLocaleDateString()} — {new Date(pass.toDate).toLocaleDateString()}</p>
                                            </div>
                                            <span className="sp-pill" style={{
                                                background: getStatusBg(pass.status),
                                                color: getStatusColor(pass.status),
                                                textTransform: 'capitalize'
                                            }}>
                                                {pass.status}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="sp-empty">
                                            <span className="sp-empty-icon">📄</span>
                                            <h3>No recent activity</h3>
                                            <p>Your outpass history will appear here</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Student Info Card */}
                            <div className="sp-widget sp-animate-enter sp-stagger-5">
                                <div className="sp-widget-header">
                                    <span className="sp-widget-title">Student Details</span>
                                    <button className="sp-text-link" onClick={() => navigate('/profile')}>Edit →</button>
                                </div>
                                <div className="sp-widget-body">
                                    {[
                                        { label: 'Department', value: user.department || '—' },
                                        { label: 'Batch', value: (user as any).batch || '—' },
                                        { label: 'Residence', value: user.residencetype || '—' },
                                        { label: 'Tutor', value: user.staffid?.name || '—' },
                                    ].map((row) => (
                                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                                            <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>{row.label}</span>
                                            <span style={{ fontSize: '0.875rem', color: '#0F172A', fontWeight: 700, textAlign: 'right', textTransform: 'capitalize' }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ MOBILE ═══════════════ */}
            <div className="sp-mobile">
                <div className="sp-mob-body" style={{ paddingTop: 16 }}>
                    {/* Hero */}
                    <div className="sp-mob-hero sp-animate-enter">
                        <div className="sp-mob-hero-top">
                            <div className="sp-mob-hero-avatar">
                                {avatarSrc && !imageError ? (
                                    <img src={avatarSrc} alt="Profile" onError={() => setImageError(true)} />
                                ) : userInitial}
                            </div>
                            <div>
                                <div className="sp-mob-hero-name">{greeting()}, {user.name?.split(' ')[0] || 'Student'}! 👋</div>
                                <div className="sp-mob-hero-sub">{user.department} • Sem {user.semester}</div>
                            </div>
                            <button className="sp-mob-logout-btn" onClick={handleLogout}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Stats row inside hero */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 20, position: 'relative', zIndex: 1 }}>
                            {[
                                { val: outpassStats.pending, lbl: 'Pending', color: '#FBBF24' },
                                { val: outpassStats.approved, lbl: 'Approved', color: '#10B981' },
                                { val: outpassStats.rejected, lbl: 'Rejected', color: '#EF4444' },
                            ].map(s => (
                                <div key={s.lbl} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '10px 8px', textAlign: 'center', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.lbl}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Profile incomplete warning */}
                    {!isProfileComplete(user) && (
                        <div className="sp-alert sp-alert-warning sp-animate-enter sp-stagger-1" style={{ borderRadius: 14 }}>
                            <span>⚠️</span>
                            <div>
                                <strong>Complete your profile</strong> to unlock all features.{' '}
                                <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: '#D97706', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 0 }}>Go now →</button>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="sp-mob-section-title">Quick Actions</div>
                    <div className="sp-mob-quick-grid sp-animate-enter sp-stagger-2">
                        {quickActions.map((qa) => (
                            <button
                                key={qa.path}
                                className="sp-mob-qa"
                                onClick={() => handleNavigation(qa.path)}
                                style={{ border: '1.5px solid #E2E8F0' }}
                            >
                                <div className="sp-mob-qa-icon" style={{ background: qa.mobColor, color: qa.mobIconColor }}>
                                    {qa.icon}
                                </div>
                                <div>
                                    <div className="sp-mob-qa-title">{qa.label}</div>
                                    <div className="sp-mob-qa-sub">{qa.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="sp-mob-section-title sp-animate-enter sp-stagger-3">Recent Activity</div>
                    <div className="sp-mob-card sp-animate-enter sp-stagger-3">
                        {recentPasses.length > 0 ? recentPasses.slice(0, 4).map((pass: any, i: number) => (
                            <div key={pass._id || i} style={{
                                display: 'flex', gap: 12, alignItems: 'flex-start',
                                padding: '14px 0', borderBottom: i < Math.min(recentPasses.length-1, 3) ? '1px solid #F1F5F9' : 'none'
                            }}>
                                <div style={{
                                    width: 38, height: 38, borderRadius: 10,
                                    background: getStatusBg(pass.status),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={getStatusColor(pass.status)} strokeWidth="2.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>{pass.reason}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>{new Date(pass.fromDate).toLocaleDateString()}</div>
                                </div>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px',
                                    borderRadius: 99, background: getStatusBg(pass.status),
                                    color: getStatusColor(pass.status), textTransform: 'capitalize', flexShrink: 0
                                }}>
                                    {pass.status}
                                </span>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '28px 16px', color: '#94A3B8' }}>
                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📄</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>No recent activity</div>
                            </div>
                        )}
                        {recentPasses.length > 0 && (
                            <button
                                onClick={() => handleNavigation('/outpass')}
                                style={{ width: '100%', marginTop: 14, padding: '13px', background: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                                View All Outpasses →
                            </button>
                        )}
                    </div>

                    {/* Student Details */}
                    <div className="sp-mob-section-title sp-animate-enter sp-stagger-4">Student Details</div>
                    <div className="sp-mob-card sp-animate-enter sp-stagger-4">
                        {[
                            { label: 'Register No.', value: user.registerNumber || '—' },
                            { label: 'Department', value: user.department || '—' },
                            { label: 'Year / Semester', value: `${user.year || '—'} Year, Sem ${user.semester || '—'}` },
                            { label: 'Residence', value: user.residencetype || '—' },
                            { label: 'Class Tutor', value: user.staffid?.name || '—' },
                        ].map((row, i, arr) => (
                            <div key={row.label} className="sp-mob-field-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                <span className="sp-mob-field-lbl">{row.label}</span>
                                <span className="sp-mob-field-val" style={{ textTransform: 'capitalize' }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <StudentBottomNav activeTab="home" />
            </div>
        </div>
    );
};

export default Dashboard;
