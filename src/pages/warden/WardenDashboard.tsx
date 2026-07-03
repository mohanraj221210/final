import React, { useEffect, useState, useRef } from 'react';
import Nav from '../../components/WardenNav';
import { useNavigate } from 'react-router-dom';
import { type User } from '../../data/sampleData';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

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
                const eased = 1 - Math.pow(1 - progress, 3);
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

/* ------------------------------------------------------------------ */
/*  Premium Loading Screen                                             */
/* ------------------------------------------------------------------ */
const PremiumWardenLoader: React.FC = () => {
    const [loadingStep, setLoadingStep] = useState(0);
    const steps = [
        'Loading Dashboard...',
        'Fetching Hostel Data...',
        'Preparing Analytics...',
        'Synchronizing Outpass Requests...',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % steps.length);
        }, 900);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pwd-loader-root">
            <div className="pwd-loader-bg" />
            <div className="pwd-loader-card">
                <div className="pwd-loader-logo">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="14" fill="url(#loaderGrad)" />
                        <path d="M24 10L34 16V28L24 34L14 28V16L24 10Z" fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
                        <path d="M20 23L23 26L28 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <defs>
                            <linearGradient id="loaderGrad" x1="0" y1="0" x2="48" y2="48">
                                <stop stopColor="#3B82F6" />
                                <stop offset="1" stopColor="#1D4ED8" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <h2 className="pwd-loader-title">Warden Command Center</h2>
                <p className="pwd-loader-subtitle">{steps[loadingStep]}</p>
                <div className="pwd-loader-bar-bg">
                    <div className="pwd-loader-bar-fill" />
                </div>
                <div className="pwd-skeleton-grid">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="pwd-skeleton-card">
                            <div className="pwd-skeleton-line short" />
                            <div className="pwd-skeleton-line" />
                            <div className="pwd-skeleton-line medium" />
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .pwd-loader-root {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #F8FBFF 0%, #EFF6FF 55%, #F6FAFF 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                }
                .pwd-loader-bg {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.08) 0%, transparent 60%),
                                radial-gradient(ellipse at 80% 80%, rgba(96,165,250,0.06) 0%, transparent 60%);
                    pointer-events: none;
                }
                .pwd-loader-card {
                    position: relative;
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(18px);
                    border: 1px solid rgba(255,255,255,0.65);
                    border-radius: 28px;
                    padding: 40px 36px;
                    box-shadow: 0 18px 50px rgba(59,130,246,0.12);
                    width: 90%;
                    max-width: 420px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    animation: loaderCardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
                }
                @keyframes loaderCardIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to { opacity: 1; transform: none; }
                }
                .pwd-loader-logo {
                    animation: loaderPulse 2s ease-in-out infinite;
                }
                @keyframes loaderPulse {
                    0%,100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .pwd-loader-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0;
                    letter-spacing: -0.02em;
                }
                .pwd-loader-subtitle {
                    font-size: 0.82rem;
                    color: #64748B;
                    font-weight: 500;
                    margin: 0;
                    min-height: 20px;
                    transition: all 0.3s;
                }
                .pwd-loader-bar-bg {
                    width: 100%;
                    height: 4px;
                    background: #EFF6FF;
                    border-radius: 10px;
                    overflow: hidden;
                }
                .pwd-loader-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3B82F6, #60A5FA);
                    border-radius: 10px;
                    animation: loaderBarAnim 2.5s ease-in-out infinite;
                }
                @keyframes loaderBarAnim {
                    0% { width: 0%; margin-left: 0; }
                    50% { width: 70%; margin-left: 0; }
                    100% { width: 0%; margin-left: 100%; }
                }
                .pwd-skeleton-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    width: 100%;
                }
                .pwd-skeleton-card {
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 14px;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .pwd-skeleton-line {
                    height: 8px;
                    background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%);
                    background-size: 200% 100%;
                    border-radius: 4px;
                    animation: shimmer 1.5s infinite;
                    width: 100%;
                }
                .pwd-skeleton-line.short { width: 40%; height: 12px; }
                .pwd-skeleton-line.medium { width: 70%; }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  SVG Icon components                                                */
/* ------------------------------------------------------------------ */
const IconShield = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);
const IconQR = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        <path d="M21 14h-3v3h3v3h-3m-4-6v6m4-3h-1"/>
    </svg>
);
const IconClock = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
);
const IconList = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
);
const IconAlertTriangle = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);
const IconMedical = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
);
const IconChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
    </svg>
);
const IconArrowRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
);
const IconTrendUp = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
);
const IconUsers = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);
const IconHome = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
);
const IconActivity = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
);

/* ------------------------------------------------------------------ */
/*  Mini Sparkline SVG                                                 */
/* ------------------------------------------------------------------ */
const Sparkline: React.FC<{ color: string; data?: number[] }> = ({ color, data = [3,5,4,8,6,9,7,10,8,12] }) => {
    const w = 80, h = 32;
    const max = Math.max(...data, 1);
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(' ');
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
            <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.08" stroke="none" />
        </svg>
    );
};

/* ------------------------------------------------------------------ */
/*  Pie / Donut Chart                                                  */
/* ------------------------------------------------------------------ */
const DonutChart: React.FC<{ segments: { value: number; color: string; label: string }[] }> = ({ segments }) => {
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    const r = 54, cx = 68, cy = 68;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    const arcs = segments.map(seg => {
        const dash = (seg.value / total) * circumference;
        const arc = { ...seg, dash, offset };
        offset += dash;
        return arc;
    });
    return (
        <svg width="136" height="136" viewBox="0 0 136 136">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth="16" />
            {arcs.map((arc, i) => (
                <circle
                    key={i}
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth="16"
                    strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
                    strokeDashoffset={-arc.offset + circumference / 4}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
                />
            ))}
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#0F172A">{total}</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fontWeight="600" fill="#94A3B8">TOTAL</text>
        </svg>
    );
};

/* ------------------------------------------------------------------ */
/*  Line Chart                                                         */
/* ------------------------------------------------------------------ */
const LineChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const w = 100, h = 80;
    const max = Math.max(...data, 1);
    const pts = data.map((v, i) => ({
        x: (i / Math.max(data.length - 1, 1)) * w,
        y: h - (v / max) * (h - 8) - 4
    }));
    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;
    return (
        <svg width="100%" height="90" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={`chartGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#chartGrad-${color.replace('#','')})`} />
            <path d={pathD} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
            ))}
        </svg>
    );
};

/* ------------------------------------------------------------------ */
/*  Main Dashboard Component                                           */
/* ------------------------------------------------------------------ */
const Dashboard: React.FC = () => {
    const [Loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [user, setUser] = useState<User>({
        name: "", registerNumber: "", staffid: { id: '', name: '' },
        department: "", year: "", semester: 0, email: "", phone: "",
        photo: "", batch: "", gender: "male", parentnumber: "",
        residencetype: "", boardingpoint: "", busno: "", cgpa: 0,
        hostelname: "", hostelroomno: ""
    });
    const [stats, setStats] = useState({
        total: 0, pending: 0, approved: 0, rejected: 0,
        Outing: 0, Home: 0, OD: 0, Emergency: 0, out: 0, in: 0
    });
    const [recentPasses, setRecentPasses] = useState<any[]>([]);
    const [statsFilter, setStatsFilter] = useState<'total' | 'today' | 'weekly' | 'monthly'>('total');
    const [zoomingPath, setZoomingPath] = useState<string | null>(null);
    const [isProfileComplete, setIsProfileComplete] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [emergencyCount, setEmergencyCount] = useState(0);
    const [pageVisible, setPageVisible] = useState(false);

    const navigate = useNavigate();

    const checkCompletion = (data: User) => {
        const requiredFields = ['name', 'email', 'phone', 'gender', 'hostelname', 'photo'];
        return requiredFields.every(field => {
            const value = data[field as keyof User];
            return value && value !== 'N/A' && value !== '';
        });
    };

    const fetchStats = async (filterVal: string) => {
        setStatsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/warden/outpass/stats?filter=${filterVal}`,
                { headers: { authorization: `Bearer ${token}` } }
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
                        headers: { authorization: `Bearer ${token}` },
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
                        setTimeout(() => setPageVisible(true), 100);
                        return;
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                    toast.error('Failed to fetch user data');
                }
            }
            if (userType === 'warden') {
                const demoUser: User = {
                    name: "Sanjay.S", registerNumber: "WARDEN001",
                    staffid: { id: 'WARDEN001', name: 'Sanjay.S' },
                    department: "Hostel Management", year: "2025", semester: 0,
                    email: "warden@jit.edu", phone: "+91 9876543210",
                    photo: "https://via.placeholder.com/150", batch: "N/A",
                    gender: "male", parentnumber: "N/A", residencetype: "Warden",
                    boardingpoint: "N/A", busno: "N/A", cgpa: 0,
                    hostelname: "N/A", hostelroomno: "N/A"
                };
                setUser(demoUser);
                setIsProfileComplete(checkCompletion(demoUser));
            }
            setLoading(false);
            setTimeout(() => setPageVisible(true), 100);
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
                        position: "top-center", autoClose: false, hideProgressBar: false,
                        closeOnClick: false, pauseOnHover: true, draggable: true,
                        theme: "colored", style: { fontWeight: 'bold', fontSize: '16px' }
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
        setTimeout(() => navigate(path), 700);
    };

    // Animated counters
    const aniTotal    = useAnimatedCounter(statsLoading ? 0 : stats.total,    1000, 100);
    const aniPending  = useAnimatedCounter(statsLoading ? 0 : stats.pending,  1000, 200);
    const aniApproved = useAnimatedCounter(statsLoading ? 0 : stats.approved, 1000, 300);
    const aniRejected = useAnimatedCounter(statsLoading ? 0 : stats.rejected, 1000, 400);
    const aniOut      = useAnimatedCounter(statsLoading ? 0 : stats.out,      1000, 500);
    const aniIn       = useAnimatedCounter(statsLoading ? 0 : stats.in,       1000, 600);

    const capitalize = (str: any) => {
        if (!str) return "Pending";
        const s = String(str);
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    };

    const getStatusBadgeClass = (status: string) => {
        switch ((status || 'pending').toLowerCase()) {
            case 'approved': return 'wdp-status-approved';
            case 'rejected': return 'wdp-status-rejected';
            default: return 'wdp-status-pending';
        }
    };

    const profilePhoto = user.photo;
    const avatarSrc = profilePhoto
        ? (profilePhoto.startsWith('http') || profilePhoto.startsWith('data:')
            ? profilePhoto
            : `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${profilePhoto.replace(/^\//, '')}`)
        : null;

    const maxTypeCount = Math.max(stats.Home, stats.Outing, stats.OD, stats.Emergency, 1);

    // Chart data
    const chartData = {
        today: [2, 5, 3, 7, 4, 8, 6],
        weekly: [12, 18, 14, 22, 16, 25, 20],
        monthly: [45, 62, 55, 78, 60, 82, 71],
        total: [120, 180, 145, 210, 165, 240, 195],
    };
    const chartLabels = {
        today: ['09','10','11','12','13','14','15'],
        weekly: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        monthly: ['W1','W2','W3','W4','W5','W6','W7'],
        total: ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
    };

    const donutSegments = [
        { value: stats.approved, color: '#10B981', label: 'Approved' },
        { value: stats.pending,  color: '#F59E0B', label: 'Pending' },
        { value: stats.rejected, color: '#EF4444', label: 'Rejected' },
        { value: stats.out,      color: '#8B5CF6', label: 'Checked Out' },
        { value: stats.in,       color: '#3B82F6', label: 'Checked In' },
    ].filter(s => s.value > 0);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const quickActions = [
        { path: '/warden/pending-outpass', icon: <IconClock />, label: 'Pending Approvals', desc: 'Review & approve outpass requests', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
        { path: '/warden/outpass-list',    icon: <IconList />,  label: 'Outpass List',       desc: 'View all processed outpasses',  color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
        { path: '/warden/scan',            icon: <IconQR />,    label: 'Scan QR',             desc: 'Verify outpass QR codes',       color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' },
        { path: '/warden/apply-emergency', icon: <IconAlertTriangle />, label: 'Emergency Alert', desc: 'Issue emergency outpass',   color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)' },
        { path: '/warden/emergency-outpass-list', icon: <IconMedical />, label: 'Emergency Logs', desc: 'View emergency history',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)' },
        { path: '/warden-profile',         icon: <IconUsers />, label: 'Student Search',     desc: 'Search hostel students',        color: '#EC4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.25)' },
    ];

    const kpiCards = [
        { label: 'Total Requests', value: aniTotal,    icon: '📋', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)',  trend: '+12%', up: true,  sparkData: [3,5,4,8,6,9,7,10] },
        { label: 'Pending',        value: aniPending,  icon: '⏳', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  trend: '-8%',  up: false, sparkData: [8,6,9,5,7,4,6,3]  },
        { label: 'Approved',       value: aniApproved, icon: '✅', color: '#10B981', bg: 'rgba(16,185,129,0.08)',  trend: '+20%', up: true,  sparkData: [4,6,5,8,7,10,9,12] },
        { label: 'Rejected',       value: aniRejected, icon: '❌', color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   trend: '0%',   up: true,  sparkData: [2,1,3,0,2,1,0,1]  },
        { label: 'Checked Out',    value: aniOut,      icon: '🚪', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', trend: '+15%', up: true,  sparkData: [2,4,3,6,5,8,6,9]  },
        { label: 'Checked In',     value: aniIn,       icon: '🏠', color: '#EC4899', bg: 'rgba(236,72,153,0.08)', trend: '+5%',  up: true,  sparkData: [1,3,2,5,4,6,5,7]  },
    ];

    return (
        <div className="wdp-root">
            <ToastContainer position="bottom-right" />

            {Loading ? (
                <PremiumWardenLoader />
            ) : (
                <>
                    <Nav />

                    <main className={`wdp-main ${pageVisible ? 'wdp-page-in' : ''}`}>

                        {/* Profile Incomplete Overlay */}
                        {!isProfileComplete && (
                            <div className="wdp-incomplete-overlay">
                                <div className="wdp-incomplete-card">
                                    <div className="wdp-incomplete-icon">⚠️</div>
                                    <h2>Profile Incomplete</h2>
                                    <p>You must complete your profile information (including photo, phone number, and hostel name) before you can access the Warden Dashboard.</p>
                                    <button className="wdp-btn-complete" onClick={() => navigate('/warden-profile')}>
                                        Complete Profile Now
                                        <IconChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={`wdp-container ${!isProfileComplete ? 'wdp-blurred' : ''}`}>

                            {/* ─── HERO SECTION ─── */}
                            <section className="wdp-hero wdp-anim-fade-up" style={{ animationDelay: '0.05s' }}>
                                {/* Animated background layers */}
                                <div className="wdp-hero-bg-grad" />
                                <div className="wdp-hero-sweep" />
                                <div className="wdp-hero-particles">
                                    {[...Array(8)].map((_, i) => (
                                        <span key={i} className={`wdp-particle wdp-particle-${i+1}`} />
                                    ))}
                                </div>

                                {/* Left: greeting */}
                                <div className="wdp-hero-left">
                                    {emergencyCount > 0 ? (
                                        <div className="wdp-hero-badge urgent">
                                            <span className="wdp-pulse-dot red" />
                                            {emergencyCount} Emergency Pending
                                        </div>
                                    ) : (
                                        <div className="wdp-hero-badge">
                                            <span className="wdp-pulse-dot" />
                                            ONLINE &amp; ON DUTY
                                        </div>
                                    )}
                                    <p className="wdp-hero-greeting">{getGreeting()},</p>
                                    <h1 className="wdp-hero-title">Hello, {user.name || 'Warden'} 👋</h1>
                                    <p className="wdp-hero-subtitle">
                                        Manage hostel outpass approvals, student movements,<br />
                                        and campus security efficiently.
                                    </p>
                                    {/* Quick Info Pills */}
                                    <div className="wdp-hero-pills">
                                        <div className="wdp-info-pill">
                                            <IconHome />
                                            <span>Hostel Warden</span>
                                        </div>
                                        <div className="wdp-info-pill">
                                            <span className="wdp-pill-dot" style={{ background: '#10B981' }} />
                                            <span>{user.hostelname || 'Main Hostel'}</span>
                                        </div>
                                        <div className="wdp-info-pill">
                                            <span className="wdp-pill-dot" style={{ background: '#F59E0B' }} />
                                            <span>{stats.pending} Pending Today</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Shield icon + duty card */}
                                <div className="wdp-hero-right">
                                    <div className="wdp-hero-shield">
                                        <div className="wdp-shield-ring" />
                                        <div className="wdp-shield-icon">
                                            <IconShield />
                                        </div>
                                    </div>
                                    <div className="wdp-duty-card">
                                        <div className="wdp-duty-row">
                                            <span className="wdp-duty-label">Duty Status</span>
                                            <span className="wdp-duty-active">
                                                <span className="wdp-pulse-dot" /> Active
                                            </span>
                                        </div>
                                        <div className="wdp-duty-row">
                                            <span className="wdp-duty-label">Today's Date</span>
                                            <span className="wdp-duty-value">
                                                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="wdp-duty-divider" />
                                        <div className="wdp-duty-row">
                                            <span className="wdp-duty-label">Pending</span>
                                            <span className="wdp-duty-count">{stats.pending}</span>
                                        </div>
                                        <div className="wdp-duty-progress-bg">
                                            <div className="wdp-duty-progress-fill"
                                                style={{ width: `${Math.min((stats.approved / Math.max(stats.total, 1)) * 100, 100)}%` }} />
                                        </div>
                                        <span className="wdp-duty-pct">{Math.round((stats.approved / Math.max(stats.total, 1)) * 100)}% Approved</span>
                                    </div>
                                </div>
                            </section>

                            {/* ─── KPI CARDS ─── */}
                            <section className="wdp-kpi-section wdp-anim-fade-up" style={{ animationDelay: '0.15s' }}>
                                <div className="wdp-section-header">
                                    <div>
                                        <h2 className="wdp-section-title">Outpass Traffic Statistics</h2>
                                        <p className="wdp-section-sub">Real-time hostel outpass analytics</p>
                                    </div>
                                    <div className="wdp-filter-tabs">
                                        {([
                                            { label: 'All Time', value: 'total' },
                                            { label: 'Today',    value: 'today' },
                                            { label: 'Weekly',   value: 'weekly' },
                                            { label: 'Monthly',  value: 'monthly' },
                                        ] as const).map(item => (
                                            <button
                                                key={item.value}
                                                className={`wdp-filter-btn ${statsFilter === item.value ? 'active' : ''}`}
                                                onClick={() => setStatsFilter(item.value)}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="wdp-kpi-grid">
                                    {kpiCards.map((card, i) => (
                                        <div key={i} className={`wdp-kpi-card wdp-anim-stagger-${i+1}`}>
                                            <div className="wdp-kpi-top">
                                                <div className="wdp-kpi-icon" style={{ background: card.bg, color: card.color }}>
                                                    {card.icon}
                                                </div>
                                                <span className={`wdp-kpi-trend ${card.up ? 'up' : 'down'}`}>
                                                    <IconTrendUp />
                                                    {card.trend}
                                                </span>
                                            </div>
                                            <div className="wdp-kpi-value" style={{ color: card.color }}>
                                                {statsLoading ? (
                                                    <div className="wdp-kpi-skeleton" />
                                                ) : card.value}
                                            </div>
                                            <div className="wdp-kpi-label">{card.label}</div>
                                            <div className="wdp-kpi-spark">
                                                <Sparkline color={card.color} data={card.sparkData} />
                                            </div>
                                            <div className="wdp-kpi-bar-bg">
                                                <div className="wdp-kpi-bar-fill"
                                                    style={{
                                                        width: `${Math.min((card.value / Math.max(stats.total, 1)) * 100, 100)}%`,
                                                        background: card.color
                                                    }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* ─── ANALYTICS + CHART SECTION ─── */}
                            <section className="wdp-analytics-section wdp-anim-fade-up" style={{ animationDelay: '0.25s' }}>
                                {/* Line Chart */}
                                <div className="wdp-chart-card wdp-line-chart-card">
                                    <div className="wdp-chart-header">
                                        <div>
                                            <h3 className="wdp-chart-title">Outpass Trend Overview</h3>
                                            <p className="wdp-chart-sub">Activity over selected period</p>
                                        </div>
                                        <div className="wdp-chart-legend">
                                            <span className="wdp-legend-dot" style={{ background: '#3B82F6' }} />
                                            <span>Outpasses</span>
                                        </div>
                                    </div>
                                    <div className="wdp-line-chart-wrap">
                                        <LineChart
                                            data={chartData[statsFilter]}
                                            color="#3B82F6"
                                        />
                                        <div className="wdp-chart-labels">
                                            {chartLabels[statsFilter].map((l, i) => (
                                                <span key={i}>{l}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Donut Chart */}
                                <div className="wdp-chart-card wdp-donut-card">
                                    <div className="wdp-chart-header">
                                        <div>
                                            <h3 className="wdp-chart-title">Status Distribution</h3>
                                            <p className="wdp-chart-sub">Outpass status breakdown</p>
                                        </div>
                                    </div>
                                    <div className="wdp-donut-wrap">
                                        <DonutChart segments={
                                            donutSegments.length > 0
                                                ? donutSegments
                                                : [{ value: 1, color: '#E2E8F0', label: 'No Data' }]
                                        } />
                                        <div className="wdp-donut-legend">
                                            {[
                                                { label: 'Approved',    value: stats.approved, color: '#10B981' },
                                                { label: 'Pending',     value: stats.pending,  color: '#F59E0B' },
                                                { label: 'Rejected',    value: stats.rejected, color: '#EF4444' },
                                                { label: 'Checked Out', value: stats.out,      color: '#8B5CF6' },
                                                { label: 'Checked In',  value: stats.in,       color: '#3B82F6' },
                                            ].map((item, i) => (
                                                <div key={i} className="wdp-legend-item">
                                                    <span className="wdp-legend-dot" style={{ background: item.color }} />
                                                    <span className="wdp-legend-label">{item.label}</span>
                                                    <span className="wdp-legend-val">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Outpass Categories */}
                                <div className="wdp-chart-card wdp-categories-card">
                                    <h3 className="wdp-chart-title">Outpass Categories</h3>
                                    <p className="wdp-chart-sub" style={{ marginBottom: '20px' }}>Distribution by type</p>
                                    <div className="wdp-category-list">
                                        {[
                                            { label: 'Home', count: stats.Home,      icon: '🏡', color: '#3B82F6' },
                                            { label: 'Outing', count: stats.Outing,  icon: '🌳', color: '#F59E0B' },
                                            { label: 'OD', count: stats.OD,          icon: '🎓', color: '#10B981' },
                                            { label: 'Emergency', count: stats.Emergency, icon: '🚨', color: '#EF4444' },
                                        ].map((cat, i) => (
                                            <div key={i} className="wdp-category-item">
                                                <div className="wdp-cat-header">
                                                    <div className="wdp-cat-label-row">
                                                        <span>{cat.icon}</span>
                                                        <span className="wdp-cat-label">{cat.label}</span>
                                                    </div>
                                                    <span className="wdp-cat-count" style={{ color: cat.color }}>{cat.count}</span>
                                                </div>
                                                <div className="wdp-cat-bar-bg">
                                                    <div className="wdp-cat-bar-fill"
                                                        style={{
                                                            width: `${(cat.count / maxTypeCount) * 100}%`,
                                                            background: cat.color
                                                        }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* ─── QUICK ACTIONS ─── */}
                            <section className="wdp-actions-section wdp-anim-fade-up" style={{ animationDelay: '0.35s' }}>
                                <div className="wdp-section-header">
                                    <div>
                                        <h2 className="wdp-section-title">Warden Control Panel</h2>
                                        <p className="wdp-section-sub">Quick access to key operations</p>
                                    </div>
                                </div>
                                <div className="wdp-actions-grid">
                                    {quickActions.map((action, i) => (
                                        <div
                                            key={i}
                                            className={`wdp-action-card wdp-anim-stagger-${i+1} ${zoomingPath === action.path ? 'zooming' : ''}`}
                                            onClick={() => isProfileComplete ? handleQuickAction(action.path) : null}
                                            style={{ '--action-color': action.color, '--action-bg': action.bg, '--action-border': action.border } as React.CSSProperties}
                                        >
                                            <div className="wdp-action-icon-wrap">
                                                <div className="wdp-action-icon">{action.icon}</div>
                                                <div className="wdp-action-glow" />
                                            </div>
                                            <div className="wdp-action-body">
                                                <h3 className="wdp-action-name">{action.label}</h3>
                                                <p className="wdp-action-desc">{action.desc}</p>
                                            </div>
                                            <div className="wdp-action-arrow">
                                                <IconChevronRight />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* ─── BOTTOM ROW: Recent Table + Sidebar ─── */}
                            <div className="wdp-bottom-layout wdp-anim-fade-up" style={{ animationDelay: '0.45s' }}>

                                {/* Recent Gate Activity Table */}
                                <section className="wdp-recent-section">
                                    <div className="wdp-section-header">
                                        <div>
                                            <h2 className="wdp-section-title">Recent Gate Activity</h2>
                                            <p className="wdp-section-sub">Latest outpass logs across your hostel</p>
                                        </div>
                                        <button className="wdp-view-all-btn" onClick={() => navigate('/warden/outpass-list')}>
                                            View Archive <IconArrowRight />
                                        </button>
                                    </div>
                                    <div className="wdp-table-card">
                                        {statsLoading ? (
                                            <div className="wdp-table-loader">
                                                {[1,2,3,4].map(i => (
                                                    <div key={i} className="wdp-row-skeleton">
                                                        <div className="wdp-skeleton-circle" />
                                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                            <div className="wdp-skeleton-line" style={{ width: '60%' }} />
                                                            <div className="wdp-skeleton-line" style={{ width: '40%', height: 7 }} />
                                                        </div>
                                                        <div className="wdp-skeleton-pill" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : recentPasses.length > 0 ? (
                                            <div className="wdp-table-scroll">
                                                <table className="wdp-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Student</th>
                                                            <th>Register No.</th>
                                                            <th>Type</th>
                                                            <th>Date Applied</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {recentPasses.map((item, idx) => (
                                                            <tr key={item._id || idx} onClick={() => navigate(`/warden/student/${item._id}`)}>
                                                                <td>
                                                                    <div className="wdp-student-cell">
                                                                        <div className="wdp-table-avatar">
                                                                            {item.name ? item.name.charAt(0).toUpperCase() : "?"}
                                                                        </div>
                                                                        <div className="wdp-student-info-cell">
                                                                            <span className="wdp-name-cell">{item.name || 'Unknown'}</span>
                                                                            <span className="wdp-sub-name-cell wdp-mono">
                                                                                {item.registerNumber || 'N/A'}
                                                                                <span className="wdp-sub-date-bullet"> • </span>
                                                                                {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                                                    month: 'short', day: 'numeric'
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td><span className="wdp-mono">{item.registerNumber || 'N/A'}</span></td>
                                                                <td>
                                                                    <span className={`wdp-type-pill ${item.outpassType?.toLowerCase().includes('emergency') ? 'emergency' : ''}`}>
                                                                        {item.outpassType || 'General'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="wdp-date-cell">
                                                                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                                            month: 'short', day: 'numeric',
                                                                            hour: '2-digit', minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`wdp-status-badge ${getStatusBadgeClass(item.warden?.status)}`}>
                                                                        {capitalize(item.warden?.status)}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="wdp-empty-state">
                                                <div className="wdp-empty-icon">
                                                    <span>🎫</span>
                                                </div>
                                                <h3>No Activity Logs</h3>
                                                <p>Student gate activity logs under your hostel block will appear here in real time.</p>
                                                <button className="wdp-empty-action" onClick={() => navigate('/warden/outpass-list')}>
                                                    Go to Archive
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Sidebar */}
                                <div className="wdp-sidebar">

                                    {/* Profile Card */}
                                    <div className="wdp-sidebar-card wdp-profile-card">
                                        <div className="wdp-profile-card-bg" />
                                        <div className="wdp-profile-avatar-wrap">
                                            {avatarSrc && !imageError ? (
                                                <img src={avatarSrc} alt="Warden" className="wdp-profile-avatar"
                                                    onError={() => setImageError(true)} />
                                            ) : (
                                                <div className="wdp-profile-initials">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : "W"}
                                                </div>
                                            )}
                                            <div className="wdp-profile-status-dot" />
                                        </div>
                                        <div className="wdp-profile-info">
                                            <h3 className="wdp-profile-name">{user.name || 'Warden'}</h3>
                                            <span className="wdp-profile-role">Hostel Warden</span>
                                        </div>
                                        <div className="wdp-profile-divider" />
                                        <div className="wdp-profile-details">
                                            {[
                                                { label: 'Staff ID',   value: user.staffid?.id || 'N/A' },
                                                { label: 'Department', value: user.department || 'Hostel Block' },
                                                { label: 'Email',      value: user.email || 'N/A' },
                                                { label: 'Mobile',     value: user.phone || 'N/A' },
                                            ].map((row, i) => (
                                                <div key={i} className="wdp-detail-row">
                                                    <span className="wdp-detail-label">{row.label}</span>
                                                    <span className="wdp-detail-value">{row.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="wdp-profile-btn" onClick={() => navigate('/warden-profile')}>
                                            View Full Profile <IconChevronRight />
                                        </button>
                                    </div>

                                    {/* Live Status Card */}
                                    <div className="wdp-sidebar-card wdp-live-card">
                                        <div className="wdp-live-header">
                                            <h3 className="wdp-sidebar-title">Live Campus Status</h3>
                                            <span className="wdp-live-badge">
                                                <span className="wdp-pulse-dot" /> LIVE
                                            </span>
                                        </div>
                                        <div className="wdp-live-grid">
                                            {[
                                                { label: 'Hostel Occupancy', value: `${Math.max(stats.total - stats.out, 0)}`, icon: <IconHome />, color: '#3B82F6' },
                                                { label: 'Students Outside', value: `${stats.out}`,  icon: '🚶', color: '#F59E0B' },
                                                { label: 'Gate Activity',    value: `${stats.in}`,   icon: <IconActivity />, color: '#10B981' },
                                                { label: 'Emergency Pass',   value: `${stats.Emergency}`, icon: '🚨', color: '#EF4444' },
                                            ].map((item, i) => (
                                                <div key={i} className="wdp-live-item">
                                                    <div className="wdp-live-icon" style={{ color: item.color }}>
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <div className="wdp-live-value" style={{ color: item.color }}>{item.value}</div>
                                                        <div className="wdp-live-label">{item.label}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hostel Insights */}
                                    <div className="wdp-sidebar-card">
                                        <h3 className="wdp-sidebar-title">Hostel Insights</h3>
                                        <div className="wdp-insights-list">
                                            {[
                                                { label: 'Students Inside Hostel', value: Math.max(stats.total - stats.out, 0), color: '#3B82F6', icon: '🏠' },
                                                { label: 'Students Outside',        value: stats.out,       color: '#F59E0B', icon: '🚶' },
                                                { label: 'Emergency Passes',        value: stats.Emergency, color: '#EF4444', icon: '🚨' },
                                                { label: 'Home Passes',             value: stats.Home,      color: '#10B981', icon: '🏡' },
                                                { label: 'OD Passes',               value: stats.OD,        color: '#8B5CF6', icon: '🎓' },
                                                { label: 'Outing Passes',           value: stats.Outing,    color: '#EC4899', icon: '🌳' },
                                            ].map((item, i) => (
                                                <div key={i} className="wdp-insight-row">
                                                    <span className="wdp-insight-icon">{item.icon}</span>
                                                    <span className="wdp-insight-label">{item.label}</span>
                                                    <span className="wdp-insight-value" style={{ color: item.color }}>{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </main>
                </>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/*  STYLES                                                         */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <style>{`
                /* ── GOOGLE FONTS ── */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                /* ── DESIGN TOKENS ── */
                :root {
                    --wdp-primary:       #3B82F6;
                    --wdp-primary-light: #60A5FA;
                    --wdp-bg:            linear-gradient(180deg, #F8FBFF 0%, #EFF6FF 55%, #F6FAFF 100%);
                    --wdp-card:          rgba(255, 255, 255, 0.96);
                    --wdp-blur:          18px;
                    --wdp-border:        1px solid rgba(59, 130, 246, 0.16);
                    --wdp-shadow:        0 18px 45px rgba(59, 130, 246, 0.16);
                    --wdp-radius:        28px;
                    --wdp-radius-sm:     16px;
                    --wdp-transition:    all 0.25s cubic-bezier(0.16,1,0.3,1);
                }

                /* ── BASE ── */
                .wdp-root {
                    min-height: 100vh;
                    background: var(--wdp-bg);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    padding-top: var(--nav-height, 64px);
                    padding-bottom: calc(var(--mobile-nav-height, 64px) + 32px + env(safe-area-inset-bottom, 16px));
                }

                .wdp-main {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 28px 32px;
                    opacity: 0;
                    transform: translateY(16px);
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }
                .wdp-main.wdp-page-in {
                    opacity: 1;
                    transform: none;
                }

                .wdp-container {
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }
                .wdp-blurred {
                    filter: blur(4px);
                    pointer-events: none;
                    user-select: none;
                }

                /* ── PROFILE INCOMPLETE OVERLAY ── */
                .wdp-incomplete-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15,23,42,0.6);
                    backdrop-filter: blur(8px);
                    z-index: 9000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }
                .wdp-incomplete-card {
                    background: rgba(255,255,255,0.97);
                    border-radius: var(--wdp-radius);
                    padding: 48px 36px;
                    max-width: 460px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 30px 80px rgba(0,0,0,0.15);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .wdp-incomplete-icon { font-size: 3rem; }
                .wdp-incomplete-card h2 { font-size: 1.4rem; font-weight: 800; color: #0F172A; margin: 0; }
                .wdp-incomplete-card p  { font-size: 0.88rem; color: #64748B; margin: 0; line-height: 1.6; }
                .wdp-btn-complete {
                    margin-top: 8px;
                    padding: 12px 28px;
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: var(--wdp-transition);
                    box-shadow: 0 8px 20px rgba(59,130,246,0.3);
                }
                .wdp-btn-complete:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(59,130,246,0.4); }

                /* ── SECTION HEADERS ── */
                .wdp-section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .wdp-section-title {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0 0 2px;
                    letter-spacing: -0.02em;
                }
                .wdp-section-sub {
                    font-size: 0.8rem;
                    color: #94A3B8;
                    font-weight: 500;
                    margin: 0;
                }

                /* ── FILTER TABS ── */
                .wdp-filter-tabs {
                    display: flex;
                    background: rgba(241,245,249,0.8);
                    border: 1px solid rgba(226,232,240,0.6);
                    padding: 4px;
                    border-radius: 12px;
                    gap: 2px;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                }
                .wdp-filter-tabs::-webkit-scrollbar { display: none; }
                .wdp-filter-btn {
                    padding: 8px 16px;
                    border: none;
                    background: transparent;
                    color: #64748B;
                    font-weight: 600;
                    font-size: 0.78rem;
                    cursor: pointer;
                    border-radius: 9px;
                    transition: var(--wdp-transition);
                    font-family: inherit;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .wdp-filter-btn:hover { color: #0F172A; }
                .wdp-filter-btn.active {
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
                    color: white;
                    box-shadow: 0 4px 12px rgba(59,130,246,0.25);
                }

                /* ═══════════════════════════════════════════════ */
                /* 1. HERO SECTION                                */
                /* ═══════════════════════════════════════════════ */
                .wdp-hero {
                    position: relative;
                    border-radius: var(--wdp-radius);
                    overflow: hidden;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 24px;
                    padding: 40px 48px;
                    color: white;
                    min-height: 200px;
                }
                .wdp-hero-bg-grad {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 40%, #0F172A 100%);
                    animation: heroBgShift 8s ease-in-out infinite alternate;
                }
                @keyframes heroBgShift {
                    0%   { background: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 40%, #0F172A 100%); }
                    100% { background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 40%, #1D4ED8 100%); }
                }
                .wdp-hero-sweep {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse at 20% 50%, rgba(96,165,250,0.15) 0%, transparent 60%),
                        radial-gradient(ellipse at 85% 20%, rgba(59,130,246,0.2)  0%, transparent 50%),
                        radial-gradient(ellipse at 60% 90%, rgba(30, 58,138,0.25) 0%, transparent 55%);
                    animation: heroSweep 6s ease-in-out infinite alternate;
                    pointer-events: none;
                }
                @keyframes heroSweep {
                    0%   { opacity: 0.8; transform: scale(1); }
                    100% { opacity: 1;   transform: scale(1.02); }
                }
                .wdp-hero-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
                .wdp-particle {
                    position: absolute;
                    width: 4px; height: 4px;
                    background: rgba(255,255,255,0.25);
                    border-radius: 50%;
                    animation: particleFloat 8s ease-in-out infinite;
                }
                .wdp-particle-1  { top: 15%; left: 10%; animation-delay: 0s;    animation-duration: 7s; }
                .wdp-particle-2  { top: 70%; left: 20%; animation-delay: 1s;    animation-duration: 9s; }
                .wdp-particle-3  { top: 30%; left: 50%; animation-delay: 2s;    animation-duration: 6s; }
                .wdp-particle-4  { top: 80%; left: 65%; animation-delay: 0.5s;  animation-duration: 8s; }
                .wdp-particle-5  { top: 20%; left: 75%; animation-delay: 3s;    animation-duration: 7s; }
                .wdp-particle-6  { top: 50%; left: 85%; animation-delay: 1.5s;  animation-duration: 10s; }
                .wdp-particle-7  { top: 60%; left: 40%; animation-delay: 2.5s;  animation-duration: 8s; width: 6px; height: 6px; }
                .wdp-particle-8  { top: 10%; left: 60%; animation-delay: 4s;    animation-duration: 6s; }
                @keyframes particleFloat {
                    0%,100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; }
                    33%     { transform: translateY(-12px) translateX(6px) scale(1.2); opacity: 0.6; }
                    66%     { transform: translateY(8px) translateX(-4px) scale(0.9); opacity: 0.4; }
                }

                .wdp-hero-left { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 10px; }
                .wdp-hero-right { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: flex-end; gap: 16px; }

                .wdp-hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(16,185,129,0.2);
                    border: 1px solid rgba(52,211,153,0.3);
                    color: #34D399;
                    font-size: 0.68rem;
                    font-weight: 800;
                    padding: 6px 14px;
                    border-radius: 100px;
                    width: fit-content;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .wdp-hero-badge.urgent {
                    background: rgba(239,68,68,0.2);
                    border-color: rgba(248,113,113,0.3);
                    color: #F87171;
                    animation: urgentPulse 2s infinite;
                }
                @keyframes urgentPulse {
                    0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
                    50%     { opacity: 0.8; box-shadow: 0 0 0 8px rgba(239,68,68,0); }
                }
                .wdp-pulse-dot {
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: #10B981;
                    box-shadow: 0 0 0 2px rgba(16,185,129,0.3);
                    animation: dotPulse 2s ease-in-out infinite;
                }
                .wdp-pulse-dot.red { background: #EF4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.3); }
                @keyframes dotPulse {
                    0%,100% { transform: scale(1); }
                    50%     { transform: scale(1.3); }
                }

                .wdp-hero-greeting { font-size: 0.88rem; color: rgba(255,255,255,0.6); margin: 0; font-weight: 500; }
                .wdp-hero-title    { font-size: 2.2rem; font-weight: 900; color: white; margin: 0; letter-spacing: -0.03em; line-height: 1.1; }
                .wdp-hero-subtitle { font-size: 0.9rem; color: rgba(147,197,253,0.85); margin: 0; font-weight: 500; line-height: 1.5; }

                .wdp-hero-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
                .wdp-info-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: rgba(255,255,255,0.9);
                    padding: 6px 14px;
                    border-radius: 100px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    backdrop-filter: blur(8px);
                }
                .wdp-pill-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

                /* Shield widget */
                .wdp-hero-shield {
                    width: 90px; height: 90px;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .wdp-shield-ring {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    border: 2px solid rgba(96,165,250,0.3);
                    animation: ringPulse 3s ease-in-out infinite;
                }
                @keyframes ringPulse {
                    0%,100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.15); opacity: 0.2; }
                }
                .wdp-shield-icon {
                    width: 70px; height: 70px;
                    background: rgba(59,130,246,0.2);
                    border: 1px solid rgba(96,165,250,0.3);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #93C5FD;
                    backdrop-filter: blur(12px);
                }

                /* Duty card */
                .wdp-duty-card {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 18px;
                    padding: 16px 20px;
                    min-width: 200px;
                    backdrop-filter: blur(12px);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .wdp-duty-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; }
                .wdp-duty-label { color: rgba(255,255,255,0.5); font-weight: 500; }
                .wdp-duty-value { color: rgba(255,255,255,0.9); font-weight: 700; font-size: 0.78rem; }
                .wdp-duty-active { display: flex; align-items: center; gap: 6px; color: #34D399; font-weight: 700; font-size: 0.78rem; }
                .wdp-duty-count { color: #F59E0B; font-weight: 800; font-size: 1rem; }
                .wdp-duty-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0; }
                .wdp-duty-progress-bg { height: 4px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; }
                .wdp-duty-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3B82F6, #10B981);
                    border-radius: 10px;
                    transition: width 1s ease-out;
                }
                .wdp-duty-pct { font-size: 0.7rem; color: rgba(255,255,255,0.4); font-weight: 600; }

                /* ═══════════════════════════════════════════════ */
                /* 2. KPI CARDS                                   */
                /* ═══════════════════════════════════════════════ */
                .wdp-kpi-section { display: flex; flex-direction: column; }
                .wdp-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 16px;
                }
                .wdp-kpi-card {
                    background: var(--wdp-card);
                    backdrop-filter: blur(var(--wdp-blur));
                    border: var(--wdp-border);
                    border-radius: 22px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    box-shadow: 0 10px 30px rgba(59,130,246,0.07);
                    cursor: default;
                    transition: var(--wdp-transition);
                    position: relative;
                    overflow: hidden;
                }
                .wdp-kpi-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 2px;
                    background: var(--action-color, var(--wdp-primary));
                    opacity: 0;
                    transition: opacity 0.25s ease;
                }
                .wdp-kpi-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--wdp-shadow);
                }
                .wdp-kpi-card:hover::before { opacity: 1; }

                .wdp-kpi-top { display: flex; justify-content: space-between; align-items: center; }
                .wdp-kpi-icon {
                    width: 40px; height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                }
                .wdp-kpi-trend {
                    font-size: 0.7rem;
                    font-weight: 700;
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    padding: 3px 8px;
                    border-radius: 100px;
                }
                .wdp-kpi-trend.up   { background: rgba(16,185,129,0.1); color: #10B981; }
                .wdp-kpi-trend.down { background: rgba(239,68,68,0.1);  color: #EF4444; transform: scaleY(-1) scaleX(1); }

                .wdp-kpi-value { font-size: 2rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1; }
                .wdp-kpi-label { font-size: 0.72rem; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
                .wdp-kpi-spark { margin: 4px 0; }
                .wdp-kpi-bar-bg { height: 3px; background: #F1F5F9; border-radius: 10px; overflow: hidden; }
                .wdp-kpi-bar-fill { height: 100%; border-radius: 10px; transition: width 1.2s ease-out; }
                .wdp-kpi-skeleton {
                    width: 48px; height: 32px;
                    background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%);
                    background-size: 200% 100%;
                    border-radius: 8px;
                    animation: shimmer 1.5s infinite;
                }

                /* ═══════════════════════════════════════════════ */
                /* 3. ANALYTICS SECTION                          */
                /* ═══════════════════════════════════════════════ */
                .wdp-analytics-section {
                    display: grid;
                    grid-template-columns: 2fr 1.2fr 1.2fr;
                    gap: 20px;
                }
                .wdp-chart-card {
                    background: var(--wdp-card);
                    backdrop-filter: blur(var(--wdp-blur));
                    border: var(--wdp-border);
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 12px 36px rgba(59,130,246,0.08);
                    transition: var(--wdp-transition);
                }
                .wdp-chart-card:hover { box-shadow: var(--wdp-shadow); }
                .wdp-chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }
                .wdp-chart-title { font-size: 0.95rem; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
                .wdp-chart-sub   { font-size: 0.75rem; color: #94A3B8; font-weight: 500; margin: 0; }
                .wdp-chart-legend { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 600; color: #64748B; }
                .wdp-legend-dot  { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }

                .wdp-line-chart-wrap { display: flex; flex-direction: column; gap: 8px; }
                .wdp-chart-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.65rem;
                    color: #94A3B8;
                    font-weight: 600;
                    padding: 0 2px;
                }

                .wdp-donut-wrap { display: flex; gap: 16px; align-items: center; justify-content: center; flex-wrap: wrap; }
                .wdp-donut-legend { display: flex; flex-direction: column; gap: 8px; }
                .wdp-legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; }
                .wdp-legend-label { color: #475569; font-weight: 600; flex: 1; }
                .wdp-legend-val   { font-weight: 800; color: #0F172A; min-width: 24px; text-align: right; }

                .wdp-category-list { display: flex; flex-direction: column; gap: 14px; }
                .wdp-category-item { display: flex; flex-direction: column; gap: 6px; }
                .wdp-cat-header { display: flex; justify-content: space-between; align-items: center; }
                .wdp-cat-label-row { display: flex; align-items: center; gap: 6px; }
                .wdp-cat-label { font-size: 0.8rem; font-weight: 600; color: #475569; }
                .wdp-cat-count { font-size: 0.9rem; font-weight: 800; }
                .wdp-cat-bar-bg { height: 6px; background: #F1F5F9; border-radius: 10px; overflow: hidden; }
                .wdp-cat-bar-fill { height: 100%; border-radius: 10px; transition: width 1s ease-out; }

                /* ═══════════════════════════════════════════════ */
                /* 4. QUICK ACTIONS                              */
                /* ═══════════════════════════════════════════════ */
                .wdp-actions-section { display: flex; flex-direction: column; }
                .wdp-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 16px;
                }
                .wdp-action-card {
                    background: var(--wdp-card);
                    backdrop-filter: blur(var(--wdp-blur));
                    border: 1px solid var(--action-border, rgba(59, 130, 246, 0.16));
                    border-radius: 20px;
                    padding: 20px 16px;
                    cursor: pointer;
                    transition: var(--wdp-transition);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 28px rgba(59,130,246,0.06);
                    text-decoration: none;
                }
                .wdp-action-card:hover {
                    transform: translateY(-6px) scale(1.01);
                    box-shadow: 0 20px 40px rgba(59,130,246,0.14);
                    border-color: var(--action-color, var(--wdp-primary));
                }
                .wdp-action-card.zooming {
                    animation: zoomEffect 0.7s forwards cubic-bezier(0.645,0.045,0.355,1);
                    pointer-events: none;
                    z-index: 1000;
                }
                @keyframes zoomEffect {
                    0%   { transform: scale(1); opacity: 1; }
                    50%  { opacity: 0.8; }
                    100% { transform: scale(15); opacity: 0; }
                }

                .wdp-action-icon-wrap { position: relative; width: fit-content; }
                .wdp-action-icon {
                    width: 46px; height: 46px;
                    border-radius: 14px;
                    background: var(--action-bg, rgba(59,130,246,0.08));
                    color: var(--action-color, var(--wdp-primary));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: var(--wdp-transition);
                }
                .wdp-action-card:hover .wdp-action-icon { transform: scale(1.12) rotate(-4deg); }
                .wdp-action-glow {
                    position: absolute;
                    inset: -4px;
                    background: var(--action-bg, rgba(59,130,246,0.08));
                    border-radius: 18px;
                    opacity: 0;
                    transition: opacity 0.25s;
                    filter: blur(6px);
                }
                .wdp-action-card:hover .wdp-action-glow { opacity: 0.8; }

                .wdp-action-body { flex: 1; }
                .wdp-action-name { font-size: 0.82rem; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
                .wdp-action-desc { font-size: 0.72rem; color: #94A3B8; margin: 0; font-weight: 500; line-height: 1.4; }
                .wdp-action-arrow {
                    color: #CBD5E1;
                    display: flex;
                    align-items: center;
                    align-self: flex-end;
                    transition: transform 0.2s ease, color 0.2s ease;
                }
                .wdp-action-card:hover .wdp-action-arrow {
                    transform: translateX(4px);
                    color: var(--action-color, var(--wdp-primary));
                }

                /* ═══════════════════════════════════════════════ */
                /* 5. BOTTOM LAYOUT (Table + Sidebar)            */
                /* ═══════════════════════════════════════════════ */
                .wdp-bottom-layout {
                    display: grid;
                    grid-template-columns: 2.5fr 1fr;
                    gap: 24px;
                    align-items: start;
                }

                .wdp-recent-section { display: flex; flex-direction: column; gap: 0; }
                .wdp-view-all-btn {
                    background: transparent;
                    border: none;
                    color: var(--wdp-primary);
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 6px 12px;
                    border-radius: 8px;
                    transition: background 0.2s;
                    font-family: inherit;
                }
                .wdp-view-all-btn:hover { background: #EFF6FF; }

                .wdp-table-card {
                    background: var(--wdp-card);
                    backdrop-filter: blur(var(--wdp-blur));
                    border: var(--wdp-border);
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 12px 36px rgba(59,130,246,0.08);
                }
                .wdp-table-scroll { overflow-x: auto; }
                .wdp-table { width: 100%; border-collapse: collapse; }
                .wdp-table th {
                    background: rgba(248,250,252,0.8);
                    padding: 14px 18px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #94A3B8;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    border-bottom: 1px solid rgba(226,232,240,0.6);
                    white-space: nowrap;
                }
                .wdp-table td {
                    padding: 14px 18px;
                    font-size: 0.84rem;
                    color: #334155;
                    border-bottom: 1px solid rgba(241,245,249,0.8);
                    transition: background 0.15s ease;
                }
                .wdp-table tbody tr { cursor: pointer; }
                .wdp-table tbody tr:hover td { background: rgba(239,246,255,0.5); }
                .wdp-table tbody tr:last-child td { border-bottom: none; }

                .wdp-student-cell { display: flex; align-items: center; gap: 10px; }
                .wdp-student-info-cell { display: flex; flex-direction: column; gap: 2px; }
                .wdp-sub-name-cell { font-size: 0.72rem; color: #94A3B8; display: none; }
                .wdp-sub-date-bullet { display: none; }
                .wdp-table-avatar {
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
                    color: white;
                    font-weight: 800;
                    font-size: 0.72rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(59,130,246,0.2);
                }
                .wdp-name-cell  { font-weight: 700; color: #0F172A; }
                .wdp-mono       { font-family: 'SF Mono','Fira Code',monospace; font-size: 0.78rem; color: #64748B; }
                .wdp-date-cell  { font-size: 0.78rem; color: #94A3B8; white-space: nowrap; }

                .wdp-type-pill {
                    display: inline-flex;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    background: #EFF6FF;
                    color: #3B82F6;
                }
                .wdp-type-pill.emergency { background: #FEF2F2; color: #EF4444; }

                .wdp-status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 0.67rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    white-space: nowrap;
                }
                .wdp-status-approved { background: rgba(16,185,129,0.1);  color: #10B981; }
                .wdp-status-pending  { background: rgba(245,158,11,0.1);  color: #D97706; }
                .wdp-status-rejected { background: rgba(239,68,68,0.1);   color: #EF4444; }

                /* Table loading skeleton */
                .wdp-table-loader { padding: 12px 20px; display: flex; flex-direction: column; gap: 16px; }
                .wdp-row-skeleton { display: flex; align-items: center; gap: 14px; padding: 8px 0; }
                .wdp-skeleton-circle { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; flex-shrink: 0; }
                .wdp-skeleton-line { height: 10px; background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; border-radius: 6px; animation: shimmer 1.5s infinite; }
                .wdp-skeleton-pill { width: 60px; height: 22px; background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; border-radius: 8px; animation: shimmer 1.5s infinite; flex-shrink: 0; }
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

                /* Empty state */
                .wdp-empty-state {
                    padding: 56px 24px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                .wdp-empty-icon {
                    width: 64px; height: 64px;
                    background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    box-shadow: 0 8px 20px rgba(59,130,246,0.1);
                }
                .wdp-empty-state h3 { font-size: 1rem; font-weight: 800; color: #0F172A; margin: 0; }
                .wdp-empty-state p  { font-size: 0.82rem; color: #94A3B8; margin: 0; line-height: 1.5; max-width: 320px; }
                .wdp-empty-action {
                    padding: 10px 22px;
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.82rem;
                    cursor: pointer;
                    margin-top: 4px;
                    transition: var(--wdp-transition);
                    box-shadow: 0 4px 14px rgba(59,130,246,0.25);
                }
                .wdp-empty-action:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59,130,246,0.35); }

                /* ═══════════════════════════════════════════════ */
                /* 6. SIDEBAR                                    */
                /* ═══════════════════════════════════════════════ */
                .wdp-sidebar { display: flex; flex-direction: column; gap: 20px; }
                .wdp-sidebar-card {
                    background: var(--wdp-card);
                    backdrop-filter: blur(var(--wdp-blur));
                    border: var(--wdp-border);
                    border-radius: 24px;
                    padding: 22px;
                    box-shadow: 0 12px 36px rgba(59,130,246,0.08);
                    transition: var(--wdp-transition);
                }
                .wdp-sidebar-card:hover { box-shadow: var(--wdp-shadow); }
                .wdp-sidebar-title { font-size: 0.92rem; font-weight: 800; color: #0F172A; margin: 0 0 12px; }

                /* Profile card */
                .wdp-profile-card { position: relative; overflow: hidden; }
                .wdp-profile-card-bg {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 72px;
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
                    border-radius: 24px 24px 0 0;
                }
                .wdp-profile-avatar-wrap {
                    position: relative;
                    width: 64px; height: 64px;
                    margin: 28px auto 0;
                    display: block;
                }
                .wdp-profile-avatar {
                    width: 64px; height: 64px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid white;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.1);
                    display: block;
                }
                .wdp-profile-initials {
                    width: 64px; height: 64px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
                    color: white;
                    font-weight: 900;
                    font-size: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid white;
                    box-shadow: 0 4px 14px rgba(59,130,246,0.25);
                }
                .wdp-profile-status-dot {
                    position: absolute;
                    bottom: 2px; right: 2px;
                    width: 14px; height: 14px;
                    background: #10B981;
                    border: 2px solid white;
                    border-radius: 50%;
                }
                .wdp-profile-info { text-align: center; margin: 12px 0 0; }
                .wdp-profile-name { font-size: 1rem; font-weight: 800; color: #0F172A; margin: 0 0 6px; }
                .wdp-profile-role {
                    font-size: 0.7rem;
                    background: #EFF6FF;
                    color: #3B82F6;
                    padding: 3px 10px;
                    border-radius: 100px;
                    font-weight: 700;
                    display: inline-block;
                }
                .wdp-profile-divider { height: 1px; background: #F1F5F9; margin: 16px 0; }
                .wdp-profile-details { display: flex; flex-direction: column; gap: 10px; }
                .wdp-detail-row { display: flex; flex-direction: column; gap: 1px; }
                .wdp-detail-label { font-size: 0.65rem; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
                .wdp-detail-value { font-size: 0.82rem; font-weight: 700; color: #334155; word-break: break-all; }
                .wdp-profile-btn {
                    width: 100%;
                    padding: 10px;
                    margin-top: 14px;
                    background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
                    border: 1px solid rgba(59,130,246,0.15);
                    border-radius: 12px;
                    color: #3B82F6;
                    font-weight: 700;
                    font-size: 0.8rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: var(--wdp-transition);
                    font-family: inherit;
                }
                .wdp-profile-btn:hover { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; }

                /* Live card */
                .wdp-live-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .wdp-live-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(16,185,129,0.1);
                    color: #10B981;
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 100px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }
                .wdp-live-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .wdp-live-item {
                    background: rgba(248,250,252,0.7);
                    border: 1px solid rgba(226,232,240,0.5);
                    border-radius: 14px;
                    padding: 12px;
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                }
                .wdp-live-icon { font-size: 1.1rem; margin-top: 1px; display: flex; flex-shrink: 0; }
                .wdp-live-value { font-size: 1.1rem; font-weight: 900; line-height: 1; }
                .wdp-live-label { font-size: 0.65rem; color: #94A3B8; font-weight: 600; margin-top: 2px; line-height: 1.3; }

                /* Insights */
                .wdp-insights-list { display: flex; flex-direction: column; gap: 10px; }
                .wdp-insight-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    background: rgba(248,250,252,0.7);
                    border: 1px solid rgba(226,232,240,0.5);
                    border-radius: 12px;
                    transition: background 0.2s;
                }
                .wdp-insight-row:hover { background: rgba(239,246,255,0.7); }
                .wdp-insight-icon { font-size: 1rem; }
                .wdp-insight-label { flex: 1; font-size: 0.76rem; font-weight: 600; color: #475569; }
                .wdp-insight-value { font-size: 0.9rem; font-weight: 800; min-width: 24px; text-align: right; }

                /* ═══════════════════════════════════════════════ */
                /* ANIMATIONS                                     */
                /* ═══════════════════════════════════════════════ */
                @keyframes wdpFadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: none; }
                }
                .wdp-anim-fade-up { animation: wdpFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }

                .wdp-anim-stagger-1 { animation: wdpFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
                .wdp-anim-stagger-2 { animation: wdpFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.10s both; }
                .wdp-anim-stagger-3 { animation: wdpFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
                .wdp-anim-stagger-4 { animation: wdpFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.20s both; }
                .wdp-anim-stagger-5 { animation: wdpFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
                .wdp-anim-stagger-6 { animation: wdpFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.30s both; }

                /* ═══════════════════════════════════════════════ */
                /* RESPONSIVE — 1280px                           */
                /* ═══════════════════════════════════════════════ */
                @media (max-width: 1280px) {
                    .wdp-kpi-grid          { grid-template-columns: repeat(3, 1fr); }
                    .wdp-actions-grid      { grid-template-columns: repeat(3, 1fr); }
                    .wdp-analytics-section { grid-template-columns: 1fr 1fr; }
                    .wdp-categories-card   { grid-column: span 2; }
                }

                /* ═══════════════════════════════════════════════ */
                /* RESPONSIVE — 1024px                           */
                /* ═══════════════════════════════════════════════ */
                @media (max-width: 1024px) {
                    .wdp-hero          { padding: 32px 36px; }
                    .wdp-bottom-layout { grid-template-columns: 1fr; }
                    .wdp-sidebar       { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                }

                /* ═══════════════════════════════════════════════ */
                /* RESPONSIVE — 900px                            */
                /* ═══════════════════════════════════════════════ */
                @media (max-width: 900px) {
                    .wdp-sidebar { grid-template-columns: repeat(2, 1fr); }
                }

                /* ═══════════════════════════════════════════════ */
                /* RESPONSIVE — 768px  (tablets / large phones)  */
                /* ═══════════════════════════════════════════════ */
                @media (max-width: 768px) {
                    /* Page container — safe-area bottom padding */
                    .wdp-main {
                        padding: 14px 14px 0;
                        padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
                        scroll-behavior: smooth;
                        -webkit-overflow-scrolling: touch;
                    }

                    /* Hero — compact, single column */
                    .wdp-hero {
                        flex-direction: column;
                        padding: 22px 20px 20px;
                        gap: 16px;
                        min-height: auto;
                        border-radius: 20px;
                    }
                    .wdp-hero-shield  { display: none; }
                    .wdp-hero-left    { width: 100%; }
                    .wdp-hero-right   { width: 100%; align-items: stretch; flex-direction: row; justify-content: center; }
                    .wdp-hero-greeting { font-size: 0.8rem; margin-bottom: 2px; }
                    .wdp-hero-title   { font-size: 1.45rem; line-height: 1.2; margin: 0 0 8px; }
                    .wdp-hero-subtitle {
                        font-size: 0.8rem;
                        opacity: 0.75;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        margin-bottom: 10px;
                    }
                    .wdp-hero-badge { font-size: 0.7rem; padding: 4px 10px; margin-bottom: 8px; }
                    .wdp-hero-pills   { gap: 6px; flex-wrap: wrap; }
                    .wdp-info-pill    { font-size: 0.72rem; padding: 5px 10px; gap: 5px; }
                    .wdp-duty-card    { width: 100%; min-width: unset; padding: 14px 16px; }

                    /* KPI grid — 2 compact columns */
                    .wdp-kpi-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                    }
                    .wdp-kpi-card {
                        padding: 14px 12px;
                        border-radius: 16px;
                    }
                    .wdp-kpi-value    { font-size: 1.55rem; }
                    .wdp-kpi-label    { font-size: 0.72rem; }
                    .wdp-kpi-spark    { display: none; }

                    /* Section headers */
                    .wdp-section-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                        margin-bottom: 14px;
                    }
                    .wdp-section-title { font-size: 1.05rem; }

                    /* Filter tabs — horizontal scroll chip rail */
                    .wdp-filter-tabs {
                        width: 100%;
                        border-radius: 10px;
                        padding: 3px;
                    }
                    .wdp-filter-btn { padding: 7px 14px; font-size: 0.74rem; }

                    /* Analytics */
                    .wdp-analytics-section { grid-template-columns: 1fr; }
                    .wdp-categories-card   { grid-column: unset; }

                    /* Quick actions — 2-column grid */
                    .wdp-actions-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                    }
                    .wdp-action-card {
                        padding: 14px 12px;
                        border-radius: 16px;
                        min-height: 72px;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                    .wdp-action-icon-wrap { margin-bottom: 2px; }
                    .wdp-action-icon      { width: 36px; height: 36px; font-size: 1rem; }
                    .wdp-action-name      { font-size: 0.8rem; line-height: 1.2; }
                    .wdp-action-desc      { font-size: 0.69rem; }
                    .wdp-action-arrow     { display: none; }

                    /* Bottom layout */
                    .wdp-bottom-layout { grid-template-columns: 1fr; gap: 14px; }
                    .wdp-sidebar       { grid-template-columns: 1fr; }

                    /* Table — tighter */
                    .wdp-table-card { border-radius: 16px; padding: 0; overflow: hidden; }
                    .wdp-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
                    .wdp-table th,
                    .wdp-table td      { padding: 10px 10px; font-size: 0.76rem; }
                    .wdp-table th:nth-child(3),
                    .wdp-table td:nth-child(3) { display: none; }
                }

                /* ═══════════════════════════════════════════════ */
                /* RESPONSIVE — 600px  (small phones)            */
                /* ═══════════════════════════════════════════════ */
                @media (max-width: 600px) {
                    /* Hide date column on tiny screens */
                    .wdp-table th:nth-child(2),
                    .wdp-table td:nth-child(2),
                    .wdp-table th:nth-child(4),
                    .wdp-table td:nth-child(4) { display: none; }
                    .wdp-sub-name-cell      { display: block; }
                    .wdp-sub-date-bullet    { display: inline; }

                    /* Status badges — never wrap */
                    .wdp-status-approved,
                    .wdp-status-pending,
                    .wdp-status-rejected {
                        white-space: nowrap;
                        font-size: 0.67rem;
                        padding: 3px 7px;
                    }
                }

                /* ═══════════════════════════════════════════════ */
                /* RESPONSIVE — 480px  (smallest phones)         */
                /* ═══════════════════════════════════════════════ */
                @media (max-width: 480px) {
                    .wdp-main {
                        padding: 10px 10px 0;
                        padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
                    }

                    /* Hero even more compact */
                    .wdp-hero    { padding: 18px 16px 16px; gap: 12px; border-radius: 18px; }
                    .wdp-hero-title { font-size: 1.3rem; }
                    .wdp-hero-right { flex-direction: column; }
                    .wdp-duty-card  { padding: 12px 14px; }

                    /* KPI cards — tightest */
                    .wdp-kpi-grid  { grid-template-columns: 1fr 1fr; gap: 8px; }
                    .wdp-kpi-card  { padding: 12px 10px; border-radius: 14px; }
                    .wdp-kpi-value { font-size: 1.4rem; }
                    .wdp-kpi-label { font-size: 0.68rem; }
                    .wdp-kpi-bar-bg { display: none; }

                    /* Actions — still 2-col, tighter */
                    .wdp-actions-grid { gap: 8px; }
                    .wdp-action-card  { padding: 12px 10px; min-height: 64px; }
                    .wdp-action-icon  { width: 32px; height: 32px; font-size: 0.9rem; }
                    .wdp-action-name  { font-size: 0.75rem; }
                    .wdp-action-desc  { display: none; }

                    /* Pills compact */
                    .wdp-hero-pills { gap: 5px; }
                    .wdp-info-pill  { font-size: 0.68rem; padding: 4px 8px; }

                    /* Filter btn smaller */
                    .wdp-filter-btn { padding: 6px 12px; font-size: 0.72rem; }

                    /* Section title */
                    .wdp-section-title { font-size: 0.95rem; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
