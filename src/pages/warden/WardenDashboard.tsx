import React, { useEffect, useState, useRef } from 'react';
import Nav from '../../components/WardenNav';
import { useNavigate } from 'react-router-dom';
import { type User } from '../../data/sampleData';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';

/* ------------------------------------------------------------------ */
/*  Animated Counter Hook                                              */
/* ------------------------------------------------------------------ */
const useAnimatedCounter = (end: number, duration = 1200, delay = 0) => {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        if (end === 0) { setCount(0); return; }
        const timeout = setTimeout(() => {
            let start = 0;
            const startTime = performance.now();
            const step = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);         // easeOutCubic
                start = Math.round(eased * end);
                setCount(start);
                if (progress < 1) frameRef.current = requestAnimationFrame(step);
            };
            frameRef.current = requestAnimationFrame(step);
        }, delay);
        return () => { clearTimeout(timeout); cancelAnimationFrame(frameRef.current); };
    }, [end, duration, delay]);

    return count;
};

const Dashboard: React.FC = () => {
    const [Loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [user, setUser] = useState<User>({
        name: "",
        registerNumber: "",
        staffid: {
            id: '',
            name: '',
        },
        department: "",
        year: "",
        semester: 0,
        email: "",
        phone: "",
        photo: "",
        batch: "",
        gender: "male",
        parentnumber: "",
        residencetype: "",
        boardingpoint: "",
        busno: "",
        cgpa: 0,
        hostelname: "",
        hostelroomno: ""
    });
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        Outing: 0,
        Home: 0,
        OD: 0,
        Emergency: 0,
        out: 0,
        in: 0
    });
    const [recentPasses, setRecentPasses] = useState<any[]>([]);
    const [statsFilter, setStatsFilter] = useState<'total' | 'today' | 'weekly' | 'monthly'>('total');
    const [zoomingPath, setZoomingPath] = useState<string | null>(null);
    const [isProfileComplete, setIsProfileComplete] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [emergencyCount, setEmergencyCount] = useState(0);

    const navigate = useNavigate();

    const checkCompletion = (data: User) => {
        const requiredFields = ['name', 'email', 'phone', 'gender', 'hostelname', 'photo'];
        const isComplete = requiredFields.every(field => {
            const value = data[field as keyof User];
            return value && value !== 'N/A' && value !== '';
        });
        return isComplete;
    };

    const fetchStats = async (filterVal: string) => {
        setStatsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/warden/outpass/stats?filter=${filterVal}`,
                {
                    headers: { authorization: `Bearer ${token}` }
                }
            );
            if (response.status === 200 && response.data.stats) {
                const facetData = response.data.stats?.[0] || { stats: [], recentpasses: [] };
                const statsObject = facetData.stats?.[0] || { total: 0, pending: 0, approved: 0, rejected: 0, Outing: 0, Home: 0, OD: 0, Emergency: 0, out: 0, in: 0 };
                const recentList = facetData.recentpasses || [];
                setStats(statsObject);
                setRecentPasses(recentList);
            }
        } catch (err) {
            console.error("Failed to load statistics:", err);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userType = localStorage.getItem('userType');

            if (token) {
                try {
                    const endpoint = userType === 'warden'
                        ? `${import.meta.env.VITE_API_URL}/warden/profile`
                        : `${import.meta.env.VITE_API_URL}/api/profile`;

                    const response = await axios.get(endpoint, {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.status === 200) {
                        const userData = userType === 'warden' ? response.data.warden : response.data.user;
                        setUser(userData);
                        const complete = checkCompletion(userData);
                        setIsProfileComplete(complete);
                        if (complete) {
                            toast.success("User profile fetched successfully");
                        } else {
                            toast.warn("Please complete your profile to access all features");
                        }
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                    toast.error('Failed to fetch user data');
                }
            }

            if (userType === 'warden') {
                const demoUser: User = {
                    name: "Sanjay.S",
                    registerNumber: "WARDEN001",
                    staffid: {
                        id: 'WARDEN001',
                        name: 'Sanjay.S',
                    },
                    department: "Hostel Management",
                    year: "2025",
                    semester: 0,
                    email: "warden@jit.edu",
                    phone: "+91 9876543210",
                    photo: "https://via.placeholder.com/150",
                    batch: "N/A",
                    gender: "male",
                    parentnumber: "N/A",
                    residencetype: "Warden",
                    boardingpoint: "N/A",
                    busno: "N/A",
                    cgpa: 0,
                    hostelname: "N/A",
                    hostelroomno: "N/A"
                };
                setUser(demoUser);
                setIsProfileComplete(checkCompletion(demoUser));
                setLoading(false);
            } else {
                setLoading(false);
            }
        };

        const checkEmergencyRequests = async () => {
            const userType = localStorage.getItem('userType');
            if (userType !== 'warden') return;

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/warden/outpass/list`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const outpasses = response.data.outpasses || response.data.data || response.data.students || [];

                const emergencyRequests = outpasses.filter((o: any) => {
                    const type = (o.outpasstype || o.outpassType || o.type || '').toLowerCase();
                    const status = (o.wardenapprovalstatus || o.status || '').toLowerCase();
                    return type === 'emergency' && status === 'pending';
                });

                setEmergencyCount(emergencyRequests.length);

                if (emergencyRequests.length > 0) {
                    toast.error(`⚠️ ${emergencyRequests.length} Emergency Request(s) Pending!`, {
                        position: "top-center",
                        autoClose: false,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "colored",
                        style: { fontWeight: 'bold', fontSize: '16px' }
                    });
                }
            } catch (error) {
                console.error("Failed to check emergency requests", error);
            }
        };

        fetchUserData();
        checkEmergencyRequests();
    }, []);

    useEffect(() => {
        if (!Loading && isProfileComplete) {
            fetchStats(statsFilter);
        }
    }, [statsFilter, Loading, isProfileComplete]);

    const handleQuickAction = (path: string) => {
        setZoomingPath(path);
        setTimeout(() => {
            navigate(path);
        }, 700);
    };

    const aniTotal = useAnimatedCounter(statsLoading ? 0 : stats.total, 1000, 100);
    const aniPending = useAnimatedCounter(statsLoading ? 0 : stats.pending, 1000, 200);
    const aniApproved = useAnimatedCounter(statsLoading ? 0 : stats.approved, 1000, 300);
    const aniRejected = useAnimatedCounter(statsLoading ? 0 : stats.rejected, 1000, 400);
    const aniOut = useAnimatedCounter(statsLoading ? 0 : stats.out, 1000, 500);
    const aniIn = useAnimatedCounter(statsLoading ? 0 : stats.in, 1000, 600);

    const capitalize = (str: any) => {
        if (!str) return "Pending";
        const s = String(str);
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    };

    const getStatusBadgeClass = (status: string) => {
        switch ((status || 'pending').toLowerCase()) {
            case 'approved': return 'wd-status-approved';
            case 'rejected': return 'wd-status-rejected';
            default: return 'wd-status-pending';
        }
    };

    const profilePhoto = user.photo;
    const avatarSrc = profilePhoto
        ? (profilePhoto.startsWith('http') || profilePhoto.startsWith('data:')
            ? profilePhoto
            : `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${profilePhoto.replace(/^\//, '')}`)
        : null;

    // Calculate maximum count for type distributions
    const maxTypeCount = Math.max(stats.Home, stats.Outing, stats.OD, stats.Emergency, 1);

    return (
        <div className="wd-root">
            <ToastContainer position="bottom-right" />

            {Loading ? (
                <div className="wd-loading-screen">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    <Nav />

                    <main className="wd-main">
                        <div className="wd-container">

                            {!isProfileComplete && (
                                <div className="profile-incomplete-overlay">
                                    <div className="incomplete-card">
                                        <div className="warning-icon">⚠️</div>
                                        <h2>Profile Incomplete</h2>
                                        <p>You must complete your profile information (including photo, phone number, and hostel name) before you can access the Warden Dashboard.</p>
                                        <button
                                            className="btn-complete-profile"
                                            onClick={() => navigate('/warden-profile')}
                                        >
                                            Complete Profile Now →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Hero Section */}
                            <section className={`wd-hero ${!isProfileComplete ? 'blurred' : ''}`}>
                                <div className="wd-hero-sweep" />
                                <div className="wd-hero-content">
                                    {emergencyCount > 0 ? (
                                        <div className="wd-hero-badge urgent">
                                            <span className="wd-pulse-dot red" />
                                            {emergencyCount} Emergency Pending
                                        </div>
                                    ) : (
                                        <div className="wd-hero-badge">
                                            <span className="wd-pulse-dot" />
                                            Online & Duty Active
                                        </div>
                                    )}
                                    <h1 className="wd-hero-title">Hello, {user.name || 'Warden'}! 👋</h1>
                                    <p className="wd-hero-subtitle">JIT Hostel Outpass Verification & Approval Center</p>
                                </div>
                                <div className="wd-hero-meta">
                                    <div className="wd-meta-pill">
                                        <span className="wd-meta-label">Designation</span>
                                        <span className="wd-meta-value">Hostel Warden</span>
                                    </div>
                                    <div className="wd-meta-pill">
                                        <span className="wd-meta-label">Campus Block</span>
                                        <span className="wd-meta-value">{user.hostelname || 'Main Hostel'}</span>
                                    </div>
                                </div>
                            </section>

                            <div className={`wd-dashboard-layout ${!isProfileComplete ? 'blurred' : ''}`}>

                                {/* Main Content Columns */}
                                <div className="wd-dashboard-main">

                                    {/* Counters Metrics Grid */}
                                    <section className="wd-metrics-section">
                                        <div className="wd-section-header">
                                            <h2 className="wd-section-title">Outpass Traffic Statistics</h2>

                                            {/* Date range filters */}
                                            <div className="wd-range-filters">
                                                {([
                                                    { label: 'All Time', value: 'total' },
                                                    { label: 'Today', value: 'today' },
                                                    { label: 'Weekly', value: 'weekly' },
                                                    { label: 'Monthly', value: 'monthly' }
                                                ] as const).map((item) => (
                                                    <button
                                                        key={item.value}
                                                        className={`wd-range-btn ${statsFilter === item.value ? 'active' : ''}`}
                                                        onClick={() => setStatsFilter(item.value)}
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="wd-metrics-grid">
                                            <div className="wd-metric-card" style={{ borderLeft: '4px solid #3B82F6' }}>
                                                <div className="wd-metric-icon" style={{ color: '#3B82F6', background: '#EFF6FF' }}>📋</div>
                                                <div>
                                                    <span className="wd-metric-num">{aniTotal}</span>
                                                    <span className="wd-metric-label">Total Logs</span>
                                                </div>
                                            </div>

                                            <div className="wd-metric-card" style={{ borderLeft: '4px solid #F59E0B' }}>
                                                <div className="wd-metric-icon" style={{ color: '#F59E0B', background: '#FFFBEB' }}>⏳</div>
                                                <div>
                                                    <span className="wd-metric-num">{aniPending}</span>
                                                    <span className="wd-metric-label">Pending Requests</span>
                                                </div>
                                            </div>

                                            <div className="wd-metric-card" style={{ borderLeft: '4px solid #10B981' }}>
                                                <div className="wd-metric-icon" style={{ color: '#10B981', background: '#ECFDF5' }}>✅</div>
                                                <div>
                                                    <span className="wd-metric-num">{aniApproved}</span>
                                                    <span className="wd-metric-label">Approved Logs</span>
                                                </div>
                                            </div>

                                            <div className="wd-metric-card" style={{ borderLeft: '4px solid #EF4444' }}>
                                                <div className="wd-metric-icon" style={{ color: '#EF4444', background: '#FEF2F2' }}>❌</div>
                                                <div>
                                                    <span className="wd-metric-num">{aniRejected}</span>
                                                    <span className="wd-metric-label">Rejected Logs</span>
                                                </div>
                                            </div>

                                            <div className="wd-metric-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
                                                <div className="wd-metric-icon" style={{ color: '#8B5CF6', background: '#F5F3FF' }}>🚪</div>
                                                <div>
                                                    <span className="wd-metric-num">{aniOut}</span>
                                                    <span className="wd-metric-label">Checked Out</span>
                                                </div>
                                            </div>

                                            <div className="wd-metric-card" style={{ borderLeft: '4px solid #EC4899' }}>
                                                <div className="wd-metric-icon" style={{ color: '#EC4899', background: '#FDF2F8' }}>🏠</div>
                                                <div>
                                                    <span className="wd-metric-num">{aniIn}</span>
                                                    <span className="wd-metric-label">Checked In</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Quick Actions Panel */}
                                    <section className="wd-quick-actions-section">
                                        <h2 className="wd-section-title">Warden Control Panel</h2>
                                        <div className="wd-actions-grid">

                                            {/* Scan QR */}
                                            <div
                                                className={`wd-action-card ${zoomingPath === '/warden/scan' ? 'zooming' : ''}`}
                                                onClick={() => isProfileComplete ? handleQuickAction('/warden/scan') : null}
                                                style={{ borderTop: '4px solid #0047AB' }}
                                            >
                                                <div className="wd-action-top">
                                                    <span className="wd-action-icon" style={{ background: '#EFF6FF' }}>📷</span>
                                                    <span className="wd-action-arrow">→</span>
                                                </div>
                                                <h3 className="wd-action-name">Scan Student QR</h3>
                                                <p className="wd-action-desc">Scan student outpass QR code for exit and entry authorization checks.</p>
                                            </div>

                                            {/* Pending Outpasses */}
                                            <div
                                                className={`wd-action-card ${zoomingPath === '/warden/pending-outpass' ? 'zooming' : ''}`}
                                                onClick={() => isProfileComplete ? handleQuickAction('/warden/pending-outpass') : null}
                                                style={{ borderTop: '4px solid #F59E0B' }}
                                            >
                                                <div className="wd-action-top">
                                                    <span className="wd-action-icon" style={{ background: '#FFFBEB' }}>⏳</span>
                                                    <span className="wd-action-arrow">→</span>
                                                </div>
                                                <h3 className="wd-action-name">Pending Approvals</h3>
                                                <p className="wd-action-desc">Review, download proof documents, and grant outpass clearance for student requests.</p>
                                            </div>

                                            {/* Outpass List */}
                                            <div
                                                className={`wd-action-card ${zoomingPath === '/warden/outpass-list' ? 'zooming' : ''}`}
                                                onClick={() => isProfileComplete ? handleQuickAction('/warden/outpass-list') : null}
                                                style={{ borderTop: '4px solid #10B981' }}
                                            >
                                                <div className="wd-action-top">
                                                    <span className="wd-action-icon" style={{ background: '#ECFDF5' }}>📋</span>
                                                    <span className="wd-action-arrow">→</span>
                                                </div>
                                                <h3 className="wd-action-name">Outpass Archive</h3>
                                                <p className="wd-action-desc">Monitor student logs history, filter by date/status, and search processed requests.</p>
                                            </div>

                                            {/* Warden Emergency Outpass Apply */}
                                            <div
                                                className={`wd-action-card ${zoomingPath === '/warden/apply-emergency' ? 'zooming' : ''}`}
                                                onClick={() => isProfileComplete ? handleQuickAction('/warden/apply-emergency') : null}
                                                style={{ borderTop: '4px solid #EF4444' }}
                                            >
                                                <div className="wd-action-top">
                                                    <span className="wd-action-icon" style={{ background: '#FEF2F2' }}>🚨</span>
                                                    <span className="wd-action-arrow">→</span>
                                                </div>
                                                <h3 className="wd-action-name">Apply Emergency</h3>
                                                <p className="wd-action-desc">Manually apply and instantly approve urgent emergency outpasses for room students.</p>
                                            </div>

                                            {/* Emergency History */}
                                            <div
                                                className={`wd-action-card ${zoomingPath === '/warden/emergency-outpass-list' ? 'zooming' : ''}`}
                                                onClick={() => isProfileComplete ? handleQuickAction('/warden/emergency-outpass-list') : null}
                                                style={{ borderTop: '4px solid #3B82F6' }}
                                            >
                                                <div className="wd-action-top">
                                                    <span className="wd-action-icon" style={{ background: '#EFF6FF' }}>🏥</span>
                                                    <span className="wd-action-arrow">→</span>
                                                </div>
                                                <h3 className="wd-action-name">Emergency Logs</h3>
                                                <p className="wd-action-desc">Review emergency outpass submissions, reasons, and warden check-in logs.</p>
                                            </div>

                                        </div>
                                    </section>

                                    {/* Recent Activity Table */}
                                    <section className="wd-recent-section">
                                        <div className="wd-section-header-compact">
                                            <h2 className="wd-section-title">Recent Gate Activity Logs</h2>
                                            <button className="wd-view-all-btn" onClick={() => navigate('/warden/outpass-list')}>
                                                View Archive
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="wd-table-card">
                                            {statsLoading ? (
                                                <div className="wd-table-spinner">
                                                    <div className="wd-spinner" />
                                                </div>
                                            ) : recentPasses.length > 0 ? (
                                                <div className="wd-table-scroll">
                                                    <table className="wd-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Student</th>
                                                                <th>Register No.</th>
                                                                <th>Type</th>
                                                                <th>Date Applied</th>
                                                                <th>Warden Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {recentPasses.map((item, idx) => (
                                                                <tr key={item._id || idx} onClick={() => navigate(`/warden/student/${item._id}`)}>
                                                                    <td>
                                                                        <div className="wd-student-cell">
                                                                            <div className="wd-table-avatar">
                                                                                {item.name ? item.name.charAt(0).toUpperCase() : "?"}
                                                                            </div>
                                                                            <span className="wd-name-cell">{item.name || 'Unknown'}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td><span className="sd-mono">{item.registerNumber || 'N/A'}</span></td>
                                                                    <td>
                                                                        <span className={`wd-type-pill ${item.outpassType?.toLowerCase().includes('emergency') ? 'emergency' : ''}`}>
                                                                            {item.outpassType || 'General'}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="wd-date-cell">
                                                                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                                                month: 'short',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className={`wd-status-badge ${getStatusBadgeClass(item.warden?.status)}`}>
                                                                            {capitalize(item.warden?.status)}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="wd-empty-activity">
                                                    <span className="wd-empty-activity-icon">🎫</span>
                                                    <h3>No Activity Logs</h3>
                                                    <p>Student gate activity logs under your hostel block will list here in real time.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                </div>

                                {/* Sidebar Columns */}
                                <div className="wd-dashboard-sidebar">

                                    {/* Warden Profile Card */}
                                    <div className="wd-sidebar-card">
                                        <div className="wd-sidebar-card-header">
                                            <div className="wd-sidebar-avatar-wrapper">
                                                {avatarSrc && !imageError ? (
                                                    <img
                                                        src={avatarSrc}
                                                        alt="Warden"
                                                        className="wd-sidebar-avatar"
                                                        onError={() => setImageError(true)}
                                                    />
                                                ) : (
                                                    <div className="wd-sidebar-initials">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : "W"}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="wd-sidebar-profile-info">
                                                <h3 className="wd-sidebar-profile-name">{user.name || 'Warden'}</h3>
                                                <span className="wd-sidebar-role-badge">Hostel Warden</span>
                                            </div>
                                        </div>

                                        <div className="wd-profile-divider" />

                                        <div className="wd-sidebar-details">
                                            <div className="wd-details-row">
                                                <span className="label">Staff ID</span>
                                                <span className="value sd-mono">{user.staffid?.id || 'N/A'}</span>
                                            </div>
                                            <div className="wd-details-row">
                                                <span className="label">Department</span>
                                                <span className="value">{user.department || 'Hostel Block'}</span>
                                            </div>
                                            <div className="wd-details-row">
                                                <span className="label">Email</span>
                                                <span className="value email-wrap">{user.email || 'N/A'}</span>
                                            </div>
                                            <div className="wd-details-row">
                                                <span className="label">Mobile</span>
                                                <span className="value">{user.phone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Outpass Type Distribution Card */}
                                    <div className="wd-sidebar-card">
                                        <h3 className="wd-sidebar-title">Outpass Categories</h3>

                                        <div className="wd-distribution-list">
                                            {/* Home */}
                                            <div className="wd-distribution-item">
                                                <div className="wd-dist-header">
                                                    <span className="wd-dist-label">🏡 Home Outpasses</span>
                                                    <span className="wd-dist-count">{stats.Home}</span>
                                                </div>
                                                <div className="wd-progress-bar-bg">
                                                    <div className="wd-progress-bar-fill fill-blue" style={{ width: `${(stats.Home / maxTypeCount) * 100}%` }} />
                                                </div>
                                            </div>

                                            {/* Outing */}
                                            <div className="wd-distribution-item">
                                                <div className="wd-dist-header">
                                                    <span className="wd-dist-label">🌳 Outing Outpasses</span>
                                                    <span className="wd-dist-count">{stats.Outing}</span>
                                                </div>
                                                <div className="wd-progress-bar-bg">
                                                    <div className="wd-progress-bar-fill fill-amber" style={{ width: `${(stats.Outing / maxTypeCount) * 100}%` }} />
                                                </div>
                                            </div>

                                            {/* OD */}
                                            <div className="wd-distribution-item">
                                                <div className="wd-dist-header">
                                                    <span className="wd-dist-label">🎓 OD Outpasses</span>
                                                    <span className="wd-dist-count">{stats.OD}</span>
                                                </div>
                                                <div className="wd-progress-bar-bg">
                                                    <div className="wd-progress-bar-fill fill-green" style={{ width: `${(stats.OD / maxTypeCount) * 100}%` }} />
                                                </div>
                                            </div>

                                            {/* Emergency */}
                                            <div className="wd-distribution-item">
                                                <div className="wd-dist-header">
                                                    <span className="wd-dist-label">🚨 Emergency Outpasses</span>
                                                    <span className="wd-dist-count">{stats.Emergency}</span>
                                                </div>
                                                <div className="wd-progress-bar-bg">
                                                    <div className="wd-progress-bar-fill fill-red" style={{ width: `${(stats.Emergency / maxTypeCount) * 100}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>
                    </main>
                </>
            )}

            <style>{`
                /* ====== LAYOUT & BASE ====== */
                .wd-root {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 45%, #DBEAFE 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    padding-top: var(--nav-height, 64px);
                    padding-bottom: 80px;
                }

                .wd-main {
                    padding: 24px 32px;
                    max-width: var(--content-max, 1280px);
                    margin: 0 auto;
                }

                .wd-container {
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                .wd-loading-screen {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* ====== 1. HERO BANNER ====== */
                .wd-hero {
                    position: relative;
                    background: linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%);
                    border-radius: 24px;
                    padding: 36px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 10px 25px rgba(30, 58, 138, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    color: white;
                }

                .wd-hero-sweep {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 75% 30%, rgba(59, 130, 246, 0.25) 0%, transparent 60%);
                    pointer-events: none;
                }

                .wd-hero-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .wd-hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(16, 185, 129, 0.18);
                    color: #34D399;
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 6px 12px;
                    border-radius: 100px;
                    width: fit-content;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .wd-hero-badge.urgent {
                    background: rgba(239, 68, 68, 0.18);
                    color: #F87171;
                    animation: alertPulse 2s infinite;
                }

                .wd-pulse-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #10B981;
                }

                .wd-pulse-dot.red {
                    background: #EF4444;
                }

                .wd-hero-title {
                    font-size: 1.85rem;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.02em;
                    margin: 0;
                }

                .wd-hero-subtitle {
                    font-size: 0.95rem;
                    color: #93C5FD;
                    margin: 0;
                    font-weight: 500;
                }

                .wd-hero-meta {
                    display: flex;
                    gap: 16px;
                    z-index: 2;
                }

                .wd-meta-pill {
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 10px 18px;
                    border-radius: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 100px;
                }

                .wd-meta-label {
                    font-size: 0.65rem;
                    color: #93C5FD;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .wd-meta-value {
                    font-size: 0.95rem;
                    font-weight: 700;
                }

                /* ====== 2. DASHBOARD LAYOUT GRID ====== */
                .wd-dashboard-layout {
                    display: grid;
                    grid-template-columns: 2.8fr 1.2fr;
                    gap: 28px;
                }

                .wd-dashboard-main {
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                .wd-dashboard-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                /* ====== 3. METRICS SECTION ====== */
                .wd-metrics-section {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .wd-section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .wd-section-title {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0;
                    letter-spacing: -0.01em;
                }

                .wd-range-filters {
                    display: flex;
                    background: #E2E8F0;
                    padding: 3px;
                    border-radius: 10px;
                    gap: 2px;
                }

                .wd-range-btn {
                    padding: 6px 12px;
                    border: none;
                    background: transparent;
                    color: #64748B;
                    font-weight: 600;
                    font-size: 0.78rem;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    font-family: inherit;
                }

                .wd-range-btn:hover {
                    color: #0F172A;
                }

                .wd-range-btn.active {
                    background: white;
                    color: #0047AB;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }

                .wd-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }

                .wd-metric-card {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.7);
                    border-radius: 16px;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }

                .wd-metric-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }

                .wd-metric-num {
                    display: block;
                    font-size: 1.45rem;
                    font-weight: 800;
                    color: #0F172A;
                    line-height: 1.1;
                }

                .wd-metric-label {
                    font-size: 0.72rem;
                    color: #64748B;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                /* ====== 4. QUICK ACTIONS PANEL ====== */
                .wd-quick-actions-section {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .wd-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .wd-action-card {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 18px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .wd-action-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
                }

                .wd-action-card.zooming {
                    animation: zoomEffect 0.7s forwards cubic-bezier(0.645, 0.045, 0.355, 1);
                    pointer-events: none;
                    z-index: 1000;
                }

                .wd-action-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .wd-action-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }

                .wd-action-arrow {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #94A3B8;
                    transition: transform 0.2s ease;
                }

                .wd-action-card:hover .wd-action-arrow {
                    transform: translateX(4px);
                    color: #0047AB;
                }

                .wd-action-name {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 6px 0 0;
                }

                .wd-action-desc {
                    font-size: 0.82rem;
                    color: #64748B;
                    line-height: 1.4;
                    margin: 0;
                    font-weight: 500;
                }

                /* ====== 5. RECENT ACTIVITY logs ====== */
                .wd-recent-section {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .wd-section-header-compact {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .wd-view-all-btn {
                    background: transparent;
                    border: none;
                    color: #0047AB;
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                }

                .wd-view-all-btn:hover {
                    background: #EFF6FF;
                }

                .wd-view-all-btn svg {
                    transition: transform 0.2s ease;
                }

                .wd-view-all-btn:hover svg {
                    transform: translateX(2px);
                }

                /* Table styles */
                .wd-table-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                }

                .wd-table-scroll {
                    overflow-x: auto;
                }

                .wd-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                .wd-table th {
                    background: #F8FAFC;
                    padding: 14px 20px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid #E2E8F0;
                }

                .wd-table td {
                    padding: 14px 20px;
                    font-size: 0.85rem;
                    color: #334155;
                    border-bottom: 1px solid #F1F5F9;
                    transition: background 0.15s ease;
                }

                .wd-table tbody tr {
                    cursor: pointer;
                }

                .wd-table tbody tr:hover td {
                    background: #F8FAFC;
                }

                .wd-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .wd-student-cell {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .wd-table-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #0047AB 0%, #2563EB 100%);
                    color: white;
                    font-weight: 700;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .wd-name-cell {
                    font-weight: 600;
                    color: #0F172A;
                }

                .wd-type-pill {
                    display: inline-flex;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    background: #EFF6FF;
                    color: #0047AB;
                }

                .wd-type-pill.emergency {
                    background: #FEF2F2;
                    color: #EF4444;
                }

                .wd-date-cell {
                    color: #64748B;
                    font-size: 0.8rem;
                }

                /* Status badges */
                .wd-status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .wd-status-approved { background: #ECFDF5; color: #10B981; }
                .wd-status-pending  { background: #FFFBEB; color: #D97706; }
                .wd-status-rejected { background: #FEF2F2; color: #EF4444; }

                .wd-empty-activity {
                    text-align: center;
                    padding: 40px 20px;
                    color: #64748B;
                }

                .wd-empty-activity-icon {
                    font-size: 2.2rem;
                    display: block;
                    margin-bottom: 8px;
                }

                .wd-empty-activity h3 {
                    margin: 0 0 4px;
                    font-size: 0.95rem;
                    color: #334155;
                    font-weight: 700;
                }

                .wd-empty-activity p {
                    margin: 0;
                    font-size: 0.8rem;
                }

                .wd-table-spinner {
                    padding: 40px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .wd-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #E2E8F0;
                    border-top-color: #0047AB;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                /* ====== 6. SIDEBAR COMPONENTs ====== */
                .wd-sidebar-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }

                .wd-sidebar-card-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .wd-sidebar-avatar-wrapper {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    flex-shrink: 0;
                }

                .wd-sidebar-avatar {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .wd-sidebar-initials {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #0047AB 0%, #2563EB 100%);
                    color: white;
                    font-weight: 700;
                    font-size: 1.35rem;
                }

                .wd-sidebar-profile-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .wd-sidebar-profile-name {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0;
                }

                .wd-sidebar-role-badge {
                    font-size: 0.72rem;
                    background: #EFF6FF;
                    color: #0047AB;
                    padding: 2px 8px;
                    border-radius: 100px;
                    font-weight: 700;
                    width: fit-content;
                }

                .wd-profile-divider {
                    height: 1px;
                    background: #F1F5F9;
                    margin: 20px 0;
                }

                .wd-sidebar-details {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .wd-details-row {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .wd-details-row .label {
                    font-size: 0.68rem;
                    color: #94A3B8;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .wd-details-row .value {
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: #334155;
                }

                .wd-details-row .email-wrap {
                    word-break: break-all;
                }

                /* Outpass Distributions */
                .wd-sidebar-title {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0 0 16px;
                }

                .wd-distribution-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .wd-distribution-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .wd-dist-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                }

                .wd-dist-label {
                    font-weight: 600;
                    color: #475569;
                }

                .wd-dist-count {
                    font-weight: 700;
                    color: #0F172A;
                }

                .wd-progress-bar-bg {
                    height: 6px;
                    background: #F1F5F9;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .wd-progress-bar-fill {
                    height: 100%;
                    border-radius: 10px;
                    transition: width 0.8s ease-out;
                }

                .wd-progress-bar-fill.fill-blue  { background: #3B82F6; }
                .wd-progress-bar-fill.fill-amber { background: #F59E0B; }
                .wd-progress-bar-fill.fill-green { background: #10B981; }
                .wd-progress-bar-fill.fill-red   { background: #EF4444; }

                /* Keyframes */
                @keyframes alertPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.65; }
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @keyframes zoomEffect {
                    0% { transform: scale(1); opacity: 1; }
                    50% { opacity: 0.8; }
                    100% { transform: scale(15); opacity: 0; }
                }

                .sd-mono {
                    font-family: 'SF Mono', 'Fira Code', monospace;
                    font-weight: 600;
                }

                /* ====== RESPONSIVE ====== */
                @media (max-width: 1024px) {
                    .wd-dashboard-layout {
                        grid-template-columns: 1fr;
                    }
                    .wd-metrics-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .wd-main {
                        padding: 16px;
                    }
                    .wd-hero {
                        flex-direction: column;
                        align-items: stretch;
                        padding: 24px;
                        gap: 20px;
                    }
                    .wd-hero-meta {
                        justify-content: space-between;
                    }
                    .wd-actions-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 480px) {
                    .wd-metrics-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

        </div>
    );
};

export default Dashboard;
