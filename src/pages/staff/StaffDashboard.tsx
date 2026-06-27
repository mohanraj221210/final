import PremiumStaffLoader from '../../components/PremiumStaffLoader';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Staff } from '../../data/sampleData';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import StaffHeader from '../../components/StaffHeader';

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

/* ------------------------------------------------------------------ */
/*  Mini SVG Line Chart                                                */
/* ------------------------------------------------------------------ */
interface ChartPoint { label: string; value: number; }

const MiniLineChart: React.FC<{ data: ChartPoint[]; color?: string; height?: number }> = ({
    data, color = '#3B82F6', height = 200
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [dims, setDims] = useState({ w: 600, h: height });
    const [animProgress, setAnimProgress] = useState(0);

    useEffect(() => {
        const el = svgRef.current?.parentElement;
        if (!el) return;
        const obs = new ResizeObserver(entries => {
            for (const e of entries) setDims({ w: e.contentRect.width, h: height });
        });
        obs.observe(el);
        return () => obs.disconnect();
    }, [height]);

    useEffect(() => {
        let start: number;
        const dur = 1000;
        const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / dur, 1);
            setAnimProgress(1 - Math.pow(1 - p, 3));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [data]);

    if (!data.length) return null;

    const pad = { t: 20, r: 24, b: 40, l: 48 };
    const cw = dims.w - pad.l - pad.r;
    const ch = dims.h - pad.t - pad.b;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const stepX = cw / Math.max(data.length - 1, 1);

    const pts = data.map((d, i) => ({
        x: pad.l + i * stepX,
        y: pad.t + ch - (d.value / maxVal) * ch * animProgress
    }));

    // smooth bezier path
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const cpx1 = pts[i - 1].x + stepX * 0.4;
        const cpy1 = pts[i - 1].y;
        const cpx2 = pts[i].x - stepX * 0.4;
        const cpy2 = pts[i].y;
        path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${pts[i].x} ${pts[i].y}`;
    }

    const areaPath = path + ` L ${pts[pts.length - 1].x} ${pad.t + ch} L ${pts[0].x} ${pad.t + ch} Z`;

    // y-axis grid lines
    const gridLines = 4;
    const gridY = Array.from({ length: gridLines + 1 }, (_, i) => {
        const val = Math.round((maxVal / gridLines) * (gridLines - i));
        const y = pad.t + (ch / gridLines) * i;
        return { val, y };
    });

    return (
        <svg ref={svgRef} width="100%" height={dims.h} viewBox={`0 0 ${dims.w} ${dims.h}`} className="sd-chart-svg">
            <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                </linearGradient>
            </defs>
            {/* grid */}
            {gridY.map((g, i) => (
                <g key={i}>
                    <line x1={pad.l} y1={g.y} x2={dims.w - pad.r} y2={g.y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                    <text x={pad.l - 10} y={g.y + 4} textAnchor="end" fill="#94A3B8" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">{g.val}</text>
                </g>
            ))}
            {/* area fill */}
            <path d={areaPath} fill="url(#chartGrad)" />
            {/* line */}
            <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* dots */}
            {pts.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2.5" />
                    <text x={p.x} y={dims.h - 10} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">
                        {data[i].label}
                    </text>
                </g>
            ))}
        </svg>
    );
};

/* ------------------------------------------------------------------ */
/*  Doughnut Chart                                                     */
/* ------------------------------------------------------------------ */
const DoughnutChart: React.FC<{ data: { label: string; value: number; color: string }[], size?: number, total: number }> = ({ data, size = 180, total }) => {
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let currentOffset = 0;
    const [animProgress, setAnimProgress] = useState(0);

    const dataSum = data.reduce((acc, d) => acc + d.value, 0);
    const renderTotal = Math.max(total, dataSum) || 1; // Prevent division by zero and overlap

    useEffect(() => {
        let start: number;
        const dur = 1200;
        const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / dur, 1);
            setAnimProgress(1 - Math.pow(1 - p, 3));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [data]);

    return (
        <div className="sd-doughnut-container" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                <circle cx={center} cy={center} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
                {total > 0 && data.map((d, i) => {
                    if (d.value === 0) return null;
                    const percentage = (d.value / renderTotal) * animProgress;
                    const dashArray = `${percentage * circumference} ${circumference}`;
                    const dashOffset = -currentOffset;
                    currentOffset += (d.value / renderTotal) * circumference;

                    return (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={d.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                            className="sd-doughnut-slice"
                        />
                    );
                })}
            </svg>
            <div className="sd-doughnut-center">
                <span className="sd-doughnut-total">{Math.round(total * animProgress)}</span>
                <span className="sd-doughnut-label">Total</span>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Skeleton Components                                                */
/* ------------------------------------------------------------------ */
const SkeletonPulse: React.FC<{ w?: string; h?: string; r?: string; style?: React.CSSProperties }> = ({ w = '100%', h = '20px', r = '8px', style }) => (
    <div className="sd-skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const HeroSkeleton = () => (
    <div className="sd-hero sd-hero-skeleton" style={{ minHeight: 160 }}>
        <div className="sd-hero-content">
            <SkeletonPulse w="120px" h="24px" r="20px" />
            <SkeletonPulse w="300px" h="32px" r="8px" style={{ marginTop: 8 }} />
            <SkeletonPulse w="200px" h="18px" r="6px" style={{ marginTop: 4 }} />
        </div>
        <div className="sd-hero-meta" style={{ gap: 16, display: 'flex' }}>
            {[1, 2, 3].map(i => <SkeletonPulse key={i} w="100px" h="56px" r="12px" />)}
        </div>
    </div>
);

const KPISkeleton = () => (
    <div className="sd-kpi-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="sd-kpi-card">
                <SkeletonPulse w="34px" h="34px" r="8px" />
                <div style={{ flex: 1 }}>
                    <SkeletonPulse w="40px" h="20px" r="5px" />
                    <SkeletonPulse w="70px" h="10px" r="3px" style={{ marginTop: 4 }} />
                </div>
            </div>
        ))}
    </div>
);

const ChartSkeleton = () => (
    <div className="sd-analytics-card">
        <div className="sd-card-header">
            <SkeletonPulse w="180px" h="22px" r="6px" />
            <SkeletonPulse w="200px" h="36px" r="8px" />
        </div>
        <div className="sd-analytics-content">
            <div className="sd-analytics-left">
                <SkeletonPulse w="100%" h="220px" r="12px" />
            </div>
            <div className="sd-analytics-right">
                <SkeletonPulse w="180px" h="180px" r="50%" style={{ margin: '0 auto' }} />
            </div>
        </div>
    </div>
);

const TableSkeleton = () => (
    <div className="sd-table-card">
        <div className="sd-card-header">
            <SkeletonPulse w="200px" h="22px" r="6px" />
            <SkeletonPulse w="120px" h="32px" r="6px" />
        </div>
        <div style={{ padding: '0 24px 24px' }}>
            {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <SkeletonPulse w="36px" h="36px" r="50%" />
                    <SkeletonPulse w="120px" h="16px" r="4px" />
                    <SkeletonPulse w="100px" h="16px" r="4px" />
                    <SkeletonPulse w="160px" h="16px" r="4px" />
                    <SkeletonPulse w="64px" h="24px" r="12px" />
                    <SkeletonPulse w="80px" h="16px" r="4px" />
                </div>
            ))}
        </div>
    </div>
);

/* ================================================================== */
/*  STAFF DASHBOARD                                                    */
/* ================================================================== */
const StaffDashboard: React.FC = () => {
    const [staff, setStaff] = useState<Staff | null>(null);
    const [appReady, setAppReady] = useState(false);
    const [outpassStats, setOutpassStats] = useState<any>(null);
    const [studentStats, setStudentStats] = useState<any>(null);
    const [recentPasses, setRecentPasses] = useState<any[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [chartRange, setChartRange] = useState<'today' | 'weekly' | 'monthly'>('weekly');
    const [chartTypeFilter, setChartTypeFilter] = useState<'all' | 'home' | 'od' | 'outing' | 'emergency'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const [profileRes, outpassStatsRes, studentStatsRes, outpassListRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/staff/profile`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
                    axios.get(`${import.meta.env.VITE_API_URL}/staff/outpass/stats`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
                    axios.get(`${import.meta.env.VITE_API_URL}/staff/student/stats`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
                    axios.get(`${import.meta.env.VITE_API_URL}/staff/outpass/list?limit=100`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null)
                ]);

                if (profileRes?.status === 200) {
                    setStaff(profileRes.data.staff);
                }

                if (outpassStatsRes?.status === 200) {
                    // Support both nested structure and flat structure
                    const statsArray = outpassStatsRes.data.stats || [];
                    const parsedStats = statsArray.length > 0 && statsArray[0].stats && statsArray[0].stats.length > 0
                        ? statsArray[0].stats[0]
                        : outpassStatsRes.data;
                    setOutpassStats(parsedStats);

                    const emergencyCount = parsedStats.Emergency || parsedStats.emergency || 0;
                    if (emergencyCount > 0) {
                        toast.error(`⚠️ ${emergencyCount} Emergency Request(s) Pending!`, {
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
                }

                if (outpassListRes?.status === 200) {
                    const rawList = outpassListRes.data.outpasses || outpassListRes.data.filterOutpass || outpassListRes.data.data || [];
                    const mappedList = rawList.map((item: any) => {
                        const studentDetails = item.studentid || {};
                        return {
                            ...item,
                            name: studentDetails.name || item.name || 'Student',
                            registerNumber: studentDetails.registerNumber || item.registerNumber || 'N/A',
                            photo: studentDetails.photo || item.photo || '',
                            status: item.status || 'pending',
                            outpasstype: item.outpasstype || 'General'
                        };
                    });
                    setRecentPasses(mappedList);
                } else if (outpassStatsRes?.status === 200) {
                    // Fallback to stats recentpasses if list endpoint failed
                    const statsArray = outpassStatsRes.data.stats || [];
                    if (statsArray.length > 0 && statsArray[0].recentpasses) {
                        setRecentPasses(statsArray[0].recentpasses);
                    }
                }

                if (studentStatsRes?.status === 200) {
                    if (studentStatsRes.data.stats && studentStatsRes.data.stats.length > 0) {
                        setStudentStats(studentStatsRes.data.stats[0]);
                    } else {
                        setStudentStats(studentStatsRes.data);
                    }
                }

                setDataLoaded(true);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                toast.error("Failed to load dashboard statistics");
                setDataLoaded(true);
            }
        };

        fetchDashboardData();
    }, []);

    /* ---------- derived values ---------- */
    const totalStudents = studentStats?.total || studentStats?.totalStudents || studentStats?.students || 0;

    // Support both lowercase and capitalized keys from API response
    const pendingCount = outpassStats?.pending || outpassStats?.Pending || 0;
    const approvedCount = outpassStats?.approved || outpassStats?.Approved || 0;
    const rejectedCount = outpassStats?.rejected || outpassStats?.Rejected || 0;

    // Total passes is either explicitly provided or the sum of statuses
    const totalPasses = outpassStats?.total || outpassStats?.Total || (pendingCount + approvedCount + rejectedCount);

    const homeCount = outpassStats?.home || outpassStats?.Home || recentPasses.filter(p => {
        const t = (p.outpasstype || p.outpassType || p.type || '').toLowerCase().trim();
        return t === 'home';
    }).length;

    const odCount = outpassStats?.od || outpassStats?.OD || recentPasses.filter(p => {
        const t = (p.outpasstype || p.outpassType || p.type || '').toLowerCase().trim();
        return t === 'od';
    }).length;

    const outingCount = outpassStats?.outing || outpassStats?.Outing || recentPasses.filter(p => {
        const t = (p.outpasstype || p.outpassType || p.type || '').toLowerCase().trim();
        return t === 'outing';
    }).length;

    const emergencyCount = outpassStats?.emergency || outpassStats?.Emergency || recentPasses.filter(p => {
        const t = (p.outpasstype || p.outpassType || p.type || '').toLowerCase().trim();
        return t.includes('emergency');
    }).length;

    /* ---------- dynamic chart stats based on outpass type filter ---------- */
    const chartStats = (() => {
        if (chartTypeFilter === 'all') {
            return {
                total: totalPasses,
                approved: approvedCount,
                pending: pendingCount,
                rejected: rejectedCount
            };
        }

        const filtered = recentPasses.filter(pass => {
            const type = (pass.outpasstype || pass.outpassType || pass.type || '').toLowerCase().trim();
            if (chartTypeFilter === 'emergency') {
                return type.includes('emergency');
            }
            return type === chartTypeFilter;
        });

        let approved = 0;
        let pending = 0;
        let rejected = 0;

        filtered.forEach(pass => {
            const status = (pass.status || 'pending').toLowerCase();
            if (status === 'approved') approved++;
            else if (status === 'pending') pending++;
            else if (status === 'rejected') rejected++;
        });

        return {
            total: filtered.length,
            approved,
            pending,
            rejected
        };
    })();

    /* ---------- animated counters ---------- */
    const aniStudents = useAnimatedCounter(dataLoaded ? totalStudents : 0, 1200, 100);
    const aniPending = useAnimatedCounter(dataLoaded ? pendingCount : 0, 1200, 200);
    const aniApproved = useAnimatedCounter(dataLoaded ? approvedCount : 0, 1200, 300);
    const aniRejected = useAnimatedCounter(dataLoaded ? rejectedCount : 0, 1200, 400);
    const aniHome = useAnimatedCounter(dataLoaded ? homeCount : 0, 1200, 500);
    const aniOD = useAnimatedCounter(dataLoaded ? odCount : 0, 1200, 600);
    const aniOuting = useAnimatedCounter(dataLoaded ? outingCount : 0, 1200, 700);
    const aniEmergency = useAnimatedCounter(dataLoaded ? emergencyCount : 0, 1200, 800);

    /* ---------- chart data builder (uses actual recentPasses) ---------- */
    const buildChartData = useCallback((): ChartPoint[] => {
        const now = new Date();

        const passesToUse = recentPasses.filter(pass => {
            if (chartTypeFilter === 'all') return true;
            const type = (pass.outpasstype || pass.outpassType || pass.type || '').toLowerCase().trim();
            if (chartTypeFilter === 'emergency') {
                return type.includes('emergency');
            }
            return type === chartTypeFilter;
        });

        if (chartRange === 'today') {
            // Bucket passes created today into 4-hour slots
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const slots = [
                { label: '12AM', start: 0, end: 4 },
                { label: '4AM', start: 4, end: 8 },
                { label: '8AM', start: 8, end: 12 },
                { label: '12PM', start: 12, end: 16 },
                { label: '4PM', start: 16, end: 20 },
                { label: '8PM', start: 20, end: 24 },
            ];
            const counts = slots.map(() => 0);
            passesToUse.forEach(pass => {
                const d = new Date(pass.createdAt);
                if (d >= todayStart) {
                    const h = d.getHours();
                    const idx = slots.findIndex(s => h >= s.start && h < s.end);
                    if (idx !== -1) counts[idx]++;
                }
            });
            return slots.map((s, i) => ({ label: s.label, value: counts[i] }));
        }

        if (chartRange === 'weekly') {
            // Bucket passes from the last 7 days by day
            const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const counts = new Array(7).fill(0);
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 6);
            weekAgo.setHours(0, 0, 0, 0);

            // Build ordered labels starting from weekAgo
            const orderedDays: string[] = [];
            for (let i = 0; i < 7; i++) {
                const dt = new Date(weekAgo);
                dt.setDate(dt.getDate() + i);
                orderedDays.push(dayLabels[dt.getDay()]);
            }

            passesToUse.forEach(pass => {
                const d = new Date(pass.createdAt);
                if (d >= weekAgo) {
                    const diffDays = Math.floor((d.getTime() - weekAgo.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays >= 0 && diffDays < 7) counts[diffDays]++;
                }
            });
            return orderedDays.map((label, i) => ({ label, value: counts[i] }));
        }

        // monthly — bucket by week of the current month
        const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
        const counts = new Array(5).fill(0);

        passesToUse.forEach(pass => {
            const d = new Date(pass.createdAt);
            if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                const weekIdx = Math.min(Math.floor((d.getDate() - 1) / 7), 4);
                counts[weekIdx]++;
            }
        });

        // Only return weeks that have passed or are current
        const currentWeek = Math.min(Math.floor((now.getDate() - 1) / 7), 4);
        return weekLabels.slice(0, currentWeek + 1).map((label, i) => ({ label, value: counts[i] }));
    }, [chartRange, chartTypeFilter, recentPasses]);

    if (!appReady) return <PremiumStaffLoader isDataReady={!!staff} onComplete={() => setAppReady(true)} />;
    if (!staff) return null;

    const showSkeletons = !dataLoaded;

    return (
        <div className="sd-root">
            <ToastContainer position="bottom-right" />
            <StaffHeader activeMenu="dashboard" />

            <main className="sd-main">
                <div className="sd-container">

                    {/* ============ 1. WELCOME HERO ============ */}
                    {showSkeletons ? <HeroSkeleton /> : (
                        <section className="sd-hero" style={{ animationDelay: '0s' }}>
                            <div className="sd-hero-sweep" />
                            <div className="sd-hero-content">
                                <div className="sd-hero-badge">
                                    <span className="sd-pulse-dot" />
                                    Active Faculty
                                </div>
                                <h1 className="sd-hero-title">Welcome back, {staff.name}! 👋</h1>
                                <p className="sd-hero-subtitle">{staff.designation} • {staff.department}</p>
                            </div>
                            <div className="sd-hero-meta">
                                <div className="sd-meta-pill">
                                    <span className="sd-meta-label">Academic Year</span>
                                    <span className="sd-meta-value">2024 – 2025</span>
                                </div>
                                <div className="sd-meta-pill">
                                    <span className="sd-meta-label">Subjects</span>
                                    <span className="sd-meta-value">{staff?.subjects?.length || 0}</span>
                                </div>
                                <div className="sd-meta-pill">
                                    <span className="sd-meta-label">Students</span>
                                    <span className="sd-meta-value">{aniStudents}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ============ 2. KPI STATS ============ */}
                    {showSkeletons ? <KPISkeleton /> : (
                        <section className="sd-kpi-grid">
                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.1s' }}>
                                <div className="sd-kpi-icon sd-kpi-blue">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniStudents}</span>
                                    <span className="sd-kpi-label">Total Students</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-blue" />
                            </div>

                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.2s' }}>
                                <div className="sd-kpi-icon sd-kpi-amber">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniPending}</span>
                                    <span className="sd-kpi-label">Pending Reviews</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-amber" />
                            </div>

                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.3s' }}>
                                <div className="sd-kpi-icon sd-kpi-green">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniApproved}</span>
                                    <span className="sd-kpi-label">Approved Passes</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-green" />
                            </div>

                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.4s' }}>
                                <div className="sd-kpi-icon sd-kpi-red">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniRejected}</span>
                                    <span className="sd-kpi-label">Rejected Passes</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-red" />
                            </div>

                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.5s' }}>
                                <div className="sd-kpi-icon sd-kpi-rose">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniHome}</span>
                                    <span className="sd-kpi-label">Home Outpass</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-rose" />
                            </div>

                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.6s' }}>
                                <div className="sd-kpi-icon sd-kpi-indigo">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniOD}</span>
                                    <span className="sd-kpi-label">OD Outpass</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-indigo" />
                            </div>

                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.7s' }}>
                                <div className="sd-kpi-icon sd-kpi-purple">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" /><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniOuting}</span>
                                    <span className="sd-kpi-label">Outing Outpass</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-purple" />
                            </div>

                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.8s' }}>
                                <div className="sd-kpi-icon sd-kpi-orange">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniEmergency}</span>
                                    <span className="sd-kpi-label">Emergency Outpass</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-orange" />
                            </div>
                        </section>
                    )}

                    {/* ============ 3. ANALYTICS CHART ============ */}
                    {showSkeletons ? <ChartSkeleton /> : (
                        <section className="sd-analytics-card sd-fade-up" style={{ animationDelay: '0.15s' }}>
                            <div className="sd-card-header">
                                <div>
                                    <h2 className="sd-card-title">Outpass Analytics</h2>
                                    <p className="sd-card-desc">Request trends & approval overview</p>
                                </div>
                                <div className="sd-filter-group">
                                    <div className="sd-chart-filters">
                                        {(['today', 'weekly', 'monthly'] as const).map(r => (
                                            <button
                                                key={r}
                                                className={`sd-filter-btn ${chartRange === r ? 'sd-filter-active' : ''}`}
                                                onClick={() => setChartRange(r)}
                                            >
                                                {r.charAt(0).toUpperCase() + r.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="sd-chart-filters sd-type-filters">
                                        {(['all', 'home', 'od', 'outing', 'emergency'] as const).map(t => (
                                            <button
                                                key={t}
                                                className={`sd-filter-btn ${chartTypeFilter === t ? 'sd-filter-active' : ''}`}
                                                onClick={() => setChartTypeFilter(t)}
                                            >
                                                {t === 'all' ? 'All' : t === 'od' ? 'OD' : t.charAt(0).toUpperCase() + t.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="sd-analytics-content">
                                <div className="sd-analytics-left">
                                    <div className="sd-chart-chips">
                                        <div className="sd-chip">
                                            <span className="sd-chip-dot" style={{ background: '#3B82F6' }} />
                                            <span className="sd-chip-label">Total</span>
                                            <span className="sd-chip-val">{chartStats.total}</span>
                                        </div>
                                        <div className="sd-chip">
                                            <span className="sd-chip-dot" style={{ background: '#22C55E' }} />
                                            <span className="sd-chip-label">Approved</span>
                                            <span className="sd-chip-val">{chartStats.approved}</span>
                                        </div>
                                        <div className="sd-chip">
                                            <span className="sd-chip-dot" style={{ background: '#F59E0B' }} />
                                            <span className="sd-chip-label">Pending</span>
                                            <span className="sd-chip-val">{chartStats.pending}</span>
                                        </div>
                                        <div className="sd-chip">
                                            <span className="sd-chip-dot" style={{ background: '#EF4444' }} />
                                            <span className="sd-chip-label">Rejected</span>
                                            <span className="sd-chip-val">{chartStats.rejected}</span>
                                        </div>
                                    </div>

                                    <div className="sd-chart-wrap">
                                        <MiniLineChart data={buildChartData()} color="#3B82F6" height={220} />
                                    </div>
                                </div>
                                <div className="sd-analytics-right">
                                    <h3 className="sd-doughnut-title">Distribution</h3>
                                    <DoughnutChart
                                        data={[
                                            { label: 'Approved', value: chartStats.approved, color: '#22C55E' },
                                            { label: 'Pending', value: chartStats.pending, color: '#F59E0B' },
                                            { label: 'Rejected', value: chartStats.rejected, color: '#EF4444' },
                                            ...(chartTypeFilter === 'all' && emergencyCount > 0 ? [{ label: 'Emergency', value: emergencyCount, color: '#8B5CF6' }] : [])
                                        ]}
                                        total={chartStats.total}
                                    />
                                    <div className="sd-doughnut-legend">
                                        <div className="sd-legend-item">
                                            <span className="sd-legend-dot" style={{ background: '#22C55E' }} />
                                            <span>Approved</span>
                                        </div>
                                        <div className="sd-legend-item">
                                            <span className="sd-legend-dot" style={{ background: '#F59E0B' }} />
                                            <span>Pending</span>
                                        </div>
                                        <div className="sd-legend-item">
                                            <span className="sd-legend-dot" style={{ background: '#EF4444' }} />
                                            <span>Rejected</span>
                                        </div>
                                        {chartTypeFilter === 'all' && emergencyCount > 0 && (
                                            <div className="sd-legend-item">
                                                <span className="sd-legend-dot" style={{ background: '#8B5CF6' }} />
                                                <span>Emergency</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ============ 4. QUICK ACTIONS ============ */}
                    <section className="sd-section">
                        <h2 className="sd-section-title sd-fade-up" style={{ animationDelay: '0.2s' }}>Quick Actions</h2>
                        <div className="sd-actions-grid">
                            {[
                                { icon: '📋', title: 'Student Registration', desc: 'Onboard new students individually or via Excel upload', path: '/staff-registration', delay: '0.25s' },
                                { icon: '🎫', title: 'Manage Outpasses', desc: 'Review, filter, and track all submitted student outpasses', path: '/all-passes', delay: '0.3s' },
                                { icon: '⏳', title: 'Pending Approvals', desc: 'Review, approve, or reject requests waiting for your action', path: '/pending-passes', delay: '0.35s' },
                                { icon: '👤', title: 'Faculty Profile', desc: 'Manage your teaching profile, subjects, and achievements', path: '/staff-profile', delay: '0.4s' },
                            ].map((a, i) => (
                                <button
                                    key={i}
                                    className="sd-action-card sd-fade-up"
                                    style={{ animationDelay: a.delay }}
                                    onClick={() => navigate(a.path, (a as any).state ? { state: (a as any).state } : undefined)}
                                    tabIndex={0}
                                    aria-label={a.title}
                                >
                                    <div className="sd-action-top">
                                        <span className="sd-action-icon">{a.icon}</span>
                                        <span className="sd-action-arrow">
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="sd-action-title">{a.title}</h3>
                                        <p className="sd-action-desc">{a.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* ============ 5. RECENT OUTPASS REQUESTS ============ */}
                    {showSkeletons ? <TableSkeleton /> : (
                        <section className="sd-table-card sd-fade-up" style={{ animationDelay: '0.25s' }}>
                            <div className="sd-card-header">
                                <div>
                                    <h2 className="sd-card-title">Recent Outpass Requests</h2>
                                    <p className="sd-card-desc">{Math.min(recentPasses.length, 10)} of {recentPasses.length} requests shown</p>
                                </div>
                                <button className="sd-view-all-btn" onClick={() => navigate('/all-passes')} tabIndex={0}>
                                    View All
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                            </div>

                            {recentPasses.length > 0 ? (
                                <div className="sd-table-scroll">
                                    <table className="sd-table">
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Register No.</th>
                                                <th>Reason</th>
                                                <th>Status</th>
                                                <th>Applied</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentPasses.slice(0, 10).map((pass, idx) => (
                                                <tr key={pass._id || idx} onClick={() => navigate(pass.status?.toLowerCase() === 'pending' ? '/pending-passes' : '/all-passes')} tabIndex={0} role="button" aria-label={`Review outpass for ${pass.name || 'Student'}`}>
                                                    <td>
                                                        <div className="sd-student-cell">
                                                            <img
                                                                src={pass.photo ? (pass.photo.startsWith('http') ? pass.photo : `${import.meta.env.VITE_CDN_URL}${pass.photo}`) : 'https://ui-avatars.com/api/?name=' + (pass.name || 'Student') + '&background=EFF6FF&color=3B82F6&bold=true'}
                                                                alt={pass.name || 'Student'}
                                                                className="sd-avatar"
                                                            />
                                                            <span className="sd-name">{pass.name || 'Student'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="sd-mono">{pass.registerNumber}</td>
                                                    <td className="sd-reason" title={pass.reason}>{pass.reason}</td>
                                                    <td>
                                                        <span className={`sd-status sd-status-${(pass.status || 'pending').toLowerCase()}`}>
                                                            {pass.status || 'pending'}
                                                        </span>
                                                    </td>
                                                    <td className="sd-date">{new Date(pass.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                    <td>
                                                        <button className="sd-review-btn" tabIndex={-1}>Review</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="sd-empty">
                                    <div className="sd-empty-icon">
                                        <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </div>
                                    <p className="sd-empty-title">No recent requests</p>
                                    <p className="sd-empty-desc">New outpass requests from your students will appear here</p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ============ 6. DEPARTMENT INFO ============ */}
                    <section className="sd-dept-card sd-fade-up" style={{ animationDelay: '0.3s' }}>
                        <div className="sd-dept-header">
                            <div className="sd-dept-left">
                                <div className="sd-dept-icon-wrap">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 21h18M3 7v14M21 7v14M6 11h.01M6 15h.01M6 19h.01M10 11h.01M10 15h.01M10 19h.01M14 11h.01M14 15h.01M14 19h.01M18 11h.01M18 15h.01M18 19h.01M12 3l9 4H3l9-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div>
                                    <h3 className="sd-dept-name">Department of {staff.department || 'Information Technology'}</h3>
                                    <p className="sd-dept-sub">Academic Overview</p>
                                </div>
                            </div>
                            <span className="sd-dept-badge">{staff.department ? staff.department.split(' ').map(w => w[0]).join('') : 'IT'} Dept</span>
                        </div>
                        <div className="sd-dept-grid">
                            {[
                                { icon: '👨‍🏫', label: 'Head of Department', value: 'Dr. Selvam' },
                                { icon: '📋', label: 'Total Staff', value: staff ? '1' : '0' },
                                { icon: '🎓', label: 'Total Students', value: String(totalStudents) },
                                { icon: '📅', label: 'Academic Year', value: '2024-2025' },
                            ].map((item, i) => (
                                <div key={i} className="sd-dept-item">
                                    <span className="sd-dept-item-icon">{item.icon}</span>
                                    <div className="sd-dept-item-info">
                                        <span className="sd-dept-item-label">{item.label}</span>
                                        <span className="sd-dept-item-value">{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </main>

            {/* ============================================================ */}
            {/*  STYLES                                                       */}
            {/* ============================================================ */}
            <style>{`
                /* ====== ROOT ====== */
                .sd-root {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 50%, #F0F7FF 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    -webkit-font-smoothing: antialiased;
                }

                .sd-main {
                    padding: 32px 24px;
                    padding-bottom: max(120px, env(safe-area-inset-bottom, 80px));
                }

                .sd-container {
                    max-width: 1280px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                /* ====== ANIMATIONS ====== */
                @keyframes sdFadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .sd-fade-up {
                    opacity: 0;
                    animation: sdFadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes sdSweep {
                    0%          { left: -100%; }
                    20%, 100%   { left: 200%; }
                }

                @keyframes sdPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%      { opacity: 0.5; transform: scale(1.4); }
                }

                @keyframes sdShimmer {
                    0%   { background-position: -400px 0; }
                    100% { background-position: 400px 0; }
                }

                /* ====== SKELETON ====== */
                .sd-skeleton {
                    background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 37%, #E2E8F0 63%);
                    background-size: 400px 100%;
                    animation: sdShimmer 1.4s ease infinite;
                }

                /* ====== 1. HERO ====== */
                .sd-hero {
                    position: relative;
                    background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #3B82F6 100%);
                    border-radius: 20px;
                    padding: 36px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: white;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(30, 58, 138, 0.18), 0 0 0 1px rgba(255,255,255,0.08) inset;
                    animation: sdFadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .sd-hero-skeleton {
                    background: linear-gradient(135deg, #CBD5E1 0%, #E2E8F0 100%);
                }

                .sd-hero-sweep {
                    position: absolute;
                    top: 0; left: -100%;
                    width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
                    transform: skewX(-20deg);
                    animation: sdSweep 6s infinite;
                    pointer-events: none;
                }

                .sd-hero-content {
                    position: relative; z-index: 2;
                    display: flex; flex-direction: column; gap: 8px;
                }

                .sd-hero-badge {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.25);
                    color: #34D399;
                    padding: 5px 14px; border-radius: 20px;
                    font-size: 0.72rem; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 0.06em;
                    width: fit-content;
                }

                .sd-pulse-dot {
                    width: 7px; height: 7px;
                    background: #34D399; border-radius: 50%;
                    box-shadow: 0 0 10px #34D399;
                    display: inline-block;
                    animation: sdPulse 2s ease-in-out infinite;
                }

                .sd-hero-title {
                    font-size: 2rem; font-weight: 800;
                    letter-spacing: -0.03em; margin: 0;
                    color: #ffffff;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.73);
                }

                .sd-hero-subtitle {
                    font-size: 1rem; color: rgba(255,255,255,0.8);
                    font-weight: 500; margin: 0;
                }

                .sd-hero-meta {
                    position: relative; z-index: 2;
                    display: flex; gap: 16px;
                    background: rgba(255,255,255,0.06);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 18px 24px; border-radius: 16px;
                }

                .sd-meta-pill {
                    display: flex; flex-direction: column; gap: 4px;
                    min-width: 90px;
                }
                .sd-meta-label {
                    font-size: 0.68rem; font-weight: 700;
                    color: rgba(255,255,255,0.55);
                    text-transform: uppercase; letter-spacing: 0.06em;
                }
                .sd-meta-value {
                    font-size: 1.2rem; font-weight: 800; color: white;
                }

                /* ====== 2. KPI GRID ====== */
                .sd-kpi-grid {
                    display: flex;
                    gap: 12px;
                    overflow-x: auto;
                    padding: 4px 4px 12px;
                    margin: -4px -4px 0;
                    scrollbar-width: thin;
                    scrollbar-color: #E2E8F0 transparent;
                    -webkit-overflow-scrolling: touch;
                }
                .sd-kpi-grid::-webkit-scrollbar {
                    height: 5px;
                }
                .sd-kpi-grid::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sd-kpi-grid::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }

                .sd-kpi-card {
                    position: relative;
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.7);
                    border-radius: 12px;
                    padding: 10px 12px;
                    display: flex; align-items: center; gap: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(226,232,240,0.5);
                    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1);
                    overflow: hidden;
                    cursor: default;
                    min-height: 64px;
                    flex: 1;
                    min-width: 140px;
                    max-width: 180px;
                    flex-shrink: 0;
                }
                .sd-kpi-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(59,130,246,0.12);
                }
                .sd-kpi-card:active {
                    transform: translateY(-1px) scale(0.99);
                }

                .sd-kpi-icon {
                    width: 34px; height: 34px;
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .sd-kpi-icon svg {
                    width: 18px;
                    height: 18px;
                }
                .sd-kpi-blue  { background: #EFF6FF; color: #3B82F6; }
                .sd-kpi-amber { background: #FFFBEB; color: #D97706; }
                .sd-kpi-green { background: #ECFDF5; color: #10B981; }
                .sd-kpi-red   { background: #FEF2F2; color: #EF4444; }
                .sd-kpi-purple { background: #FAF5FF; color: #9333EA; }
                .sd-kpi-indigo { background: #EEF2FF; color: #4F46E5; }
                .sd-kpi-rose   { background: #FFF1F2; color: #E11D48; }
                .sd-kpi-orange { background: #FFF7ED; color: #EA580C; }

                .sd-kpi-info {
                    display: flex; flex-direction: column; gap: 1px;
                    flex: 1; min-width: 0;
                }
                .sd-kpi-num {
                    font-size: 1.25rem; font-weight: 800; color: #0F172A;
                    line-height: 1.1; letter-spacing: -0.02em;
                }
                .sd-kpi-label {
                    font-size: 0.68rem; font-weight: 600; color: #64748B;
                    text-transform: uppercase; letter-spacing: 0.03em;
                }

                /* decorative ring */
                .sd-kpi-ring {
                    position: absolute; top: -15px; right: -15px;
                    width: 60px; height: 60px;
                    border-radius: 50%; opacity: 0.06;
                }
                .sd-kpi-ring-blue  { background: #3B82F6; }
                .sd-kpi-ring-amber { background: #D97706; }
                .sd-kpi-ring-green { background: #10B981; }
                .sd-kpi-ring-red   { background: #EF4444; }
                .sd-kpi-ring-purple { background: #9333EA; }
                .sd-kpi-ring-indigo { background: #4F46E5; }
                .sd-kpi-ring-rose   { background: #E11D48; }
                .sd-kpi-ring-orange { background: #EA580C; }

                /* ====== 3. ANALYTICS CARD ====== */
                .sd-analytics-card {
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.7);
                    border-radius: 20px;
                    padding: 28px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(226,232,240,0.5);
                }

                .sd-card-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    gap: 16px; flex-wrap: wrap;
                    padding: 0 0 16px; margin-bottom: 0;
                }
                .sd-card-title {
                    font-size: 1.15rem; font-weight: 700; color: #0F172A;
                    margin: 0; letter-spacing: -0.01em;
                }
                .sd-card-desc {
                    font-size: 0.82rem; color: #64748B; margin: 4px 0 0;
                }

                .sd-filter-group {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                .sd-chart-filters {
                    display: flex; gap: 4px;
                    background: #F1F5F9; border-radius: 10px; padding: 3px;
                }
                .sd-filter-btn {
                    padding: 7px 16px;
                    border: none; border-radius: 8px;
                    background: transparent;
                    color: #64748B; font-size: 0.8rem; font-weight: 600;
                    cursor: pointer; transition: all 0.2s ease;
                    font-family: inherit;
                    min-height: 36px;
                }
                .sd-filter-btn:hover { color: #334155; }
                .sd-filter-btn:focus-visible { outline: 2px solid #3B82F6; outline-offset: 2px; }
                .sd-filter-btn.sd-filter-active {
                    background: white; color: #0F172A;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                }

                .sd-analytics-content {
                    display: grid;
                    grid-template-columns: 7fr 3fr;
                    gap: 32px;
                    align-items: center;
                }
                .sd-analytics-left {
                    display: flex;
                    flex-direction: column;
                }
                .sd-analytics-right {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #FAFBFD;
                    border: 1px solid #F1F5F9;
                    border-radius: 16px;
                    padding: 24px;
                    height: 100%;
                }

                .sd-doughnut-title {
                    font-size: 0.95rem; font-weight: 700; color: #0F172A;
                    margin: 0 0 20px; text-align: center;
                }

                .sd-doughnut-container {
                    position: relative;
                    margin: 0 auto;
                }
                .sd-doughnut-slice {
                    transition: stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .sd-doughnut-center {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                }
                .sd-doughnut-total {
                    font-size: 1.6rem; font-weight: 800; color: #0F172A; line-height: 1; margin-bottom: 2px;
                }
                .sd-doughnut-label {
                    font-size: 0.7rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;
                }

                .sd-doughnut-legend {
                    display: flex; flex-wrap: wrap; justify-content: center; gap: 14px;
                    margin-top: 24px;
                }
                .sd-legend-item {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 0.75rem; font-weight: 600; color: #475569;
                }
                .sd-legend-dot {
                    width: 8px; height: 8px; border-radius: 50%;
                }

                .sd-chart-chips {
                    display: flex; gap: 20px; flex-wrap: wrap;
                    margin-bottom: 16px; padding: 0 4px;
                }
                .sd-chip {
                    display: flex; align-items: center; gap: 8px;
                }
                .sd-chip-dot {
                    width: 8px; height: 8px; border-radius: 50%;
                }
                .sd-chip-label {
                    font-size: 0.78rem; color: #64748B; font-weight: 500;
                }
                .sd-chip-val {
                    font-size: 0.85rem; color: #0F172A; font-weight: 700;
                }

                .sd-chart-wrap {
                    width: 100%; overflow: hidden;
                    border-radius: 12px;
                    background: #FAFBFD;
                    border: 1px solid #F1F5F9;
                }
                .sd-chart-svg { display: block; }

                /* ====== SECTION TITLES ====== */
                .sd-section-title {
                    font-size: 1.15rem; font-weight: 700; color: #0F172A;
                    letter-spacing: -0.01em; margin: 0 0 16px;
                }

                /* ====== 4. QUICK ACTIONS ====== */
                .sd-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }

                .sd-action-card {
                    position: relative;
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(226,232,240,0.6);
                    border-radius: 18px;
                    padding: 24px;
                    cursor: pointer;
                    display: flex; flex-direction: column;
                    justify-content: space-between;
                    min-height: 170px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.25s ease;
                    text-align: left;
                    font-family: inherit;
                    color: inherit;
                    outline: none;
                    min-height: 44px; /* accessibility */
                }
                .sd-action-card:hover {
                    transform: translateY(-6px);
                    border-color: #3B82F6;
                    box-shadow: 0 12px 32px rgba(59,130,246,0.12), 0 0 0 1px rgba(59,130,246,0.2);
                }
                .sd-action-card:active {
                    transform: translateY(-3px) scale(0.98);
                }
                .sd-action-card:focus-visible {
                    outline: 2px solid #3B82F6;
                    outline-offset: 2px;
                }

                .sd-action-top {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 20px;
                }
                .sd-action-icon { font-size: 1.8rem; }
                .sd-action-arrow {
                    color: #CBD5E1;
                    transition: all 0.25s ease;
                }
                .sd-action-card:hover .sd-action-arrow {
                    color: #3B82F6;
                    transform: translate(3px, -3px);
                }
                .sd-action-title {
                    font-size: 1rem; font-weight: 700; color: #0F172A;
                    margin: 0 0 6px;
                }
                .sd-action-desc {
                    font-size: 0.8rem; color: #64748B; line-height: 1.45; margin: 0;
                }

                /* ====== 5. TABLE CARD ====== */
                .sd-table-card {
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.7);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(226,232,240,0.5);
                }
                .sd-table-card .sd-card-header {
                    padding: 24px 28px 16px;
                }

                .sd-view-all-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 8px 18px; border-radius: 10px;
                    background: #EFF6FF; color: #3B82F6;
                    border: 1px solid rgba(59,130,246,0.15);
                    font-size: 0.82rem; font-weight: 700;
                    cursor: pointer; transition: all 0.2s ease;
                    font-family: inherit;
                    min-height: 44px;
                }
                .sd-view-all-btn:hover {
                    background: #3B82F6; color: white;
                    box-shadow: 0 4px 14px rgba(59,130,246,0.3);
                }
                .sd-view-all-btn:focus-visible { outline: 2px solid #3B82F6; outline-offset: 2px; }

                .sd-table-scroll {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .sd-table {
                    width: 100%; border-collapse: collapse; text-align: left;
                    min-width: 700px;
                }
                .sd-table th {
                    position: sticky; top: 0;
                    background: #F8FAFC; z-index: 2;
                    padding: 14px 24px;
                    font-size: 0.72rem; font-weight: 700;
                    color: #64748B; text-transform: uppercase;
                    letter-spacing: 0.06em;
                    border-bottom: 1px solid #E2E8F0;
                }
                .sd-table td {
                    padding: 14px 24px;
                    font-size: 0.88rem; color: #334155;
                    border-bottom: 1px solid #F1F5F9;
                    transition: background 0.15s ease;
                }
                .sd-table tr {
                    cursor: pointer;
                    outline: none;
                }
                .sd-table tbody tr:hover td { background: #F8FAFC; }
                .sd-table tbody tr:focus-visible td { background: #EFF6FF; }
                .sd-table tbody tr:last-child td { border-bottom: none; }

                .sd-student-cell {
                    display: flex; align-items: center; gap: 12px;
                }
                .sd-avatar {
                    width: 36px; height: 36px; border-radius: 50%;
                    object-fit: cover; border: 2px solid #E2E8F0;
                    flex-shrink: 0;
                }
                .sd-name { font-weight: 600; color: #0F172A; white-space: nowrap; }
                .sd-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-weight: 600; color: #64748B; font-size: 0.82rem; }
                .sd-reason { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .sd-date { color: #94A3B8; font-size: 0.82rem; white-space: nowrap; }

                /* Status Pills */
                .sd-status {
                    display: inline-flex; align-items: center;
                    padding: 4px 12px; border-radius: 20px;
                    font-size: 0.72rem; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 0.03em;
                }
                .sd-status-approved { background: #ECFDF5; color: #059669; }
                .sd-status-pending  { background: #FFFBEB; color: #D97706; }
                .sd-status-rejected { background: #FEF2F2; color: #DC2626; }

                .sd-review-btn {
                    padding: 7px 16px; border-radius: 8px;
                    background: #EFF6FF; color: #3B82F6;
                    border: none; font-size: 0.78rem; font-weight: 700;
                    cursor: pointer; transition: all 0.2s ease;
                    font-family: inherit; min-height: 36px;
                }
                .sd-review-btn:hover { background: #3B82F6; color: white; }

                /* Empty State */
                .sd-empty {
                    text-align: center; padding: 56px 24px;
                }
                .sd-empty-icon { margin-bottom: 16px; color: #CBD5E1; }
                .sd-empty-title { font-size: 1rem; font-weight: 700; color: #334155; margin: 0 0 6px; }
                .sd-empty-desc  { font-size: 0.85rem; color: #94A3B8; margin: 0; }

                /* ====== 6. DEPARTMENT ====== */
                .sd-dept-card {
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.7);
                    border-radius: 20px;
                    padding: 28px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(226,232,240,0.5);
                }

                .sd-dept-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding-bottom: 20px; margin-bottom: 20px;
                    border-bottom: 1px solid #F1F5F9;
                    gap: 12px; flex-wrap: wrap;
                }
                .sd-dept-left {
                    display: flex; align-items: center; gap: 14px;
                }
                .sd-dept-icon-wrap {
                    width: 44px; height: 44px; border-radius: 12px;
                    background: #EFF6FF; color: #3B82F6;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .sd-dept-name {
                    font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0;
                }
                .sd-dept-sub {
                    font-size: 0.78rem; color: #64748B; margin: 2px 0 0;
                }
                .sd-dept-badge {
                    background: #EFF6FF; color: #3B82F6;
                    padding: 6px 16px; border-radius: 20px;
                    font-weight: 700; font-size: 0.75rem;
                    letter-spacing: 0.03em;
                    border: 1px solid rgba(59,130,246,0.12);
                    white-space: nowrap;
                }

                .sd-dept-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }
                .sd-dept-item {
                    display: flex; align-items: center; gap: 14px;
                    padding: 16px; border-radius: 14px;
                    background: #F8FAFC;
                    border: 1px solid #F1F5F9;
                    transition: all 0.25s ease;
                    min-height: 44px;
                }
                .sd-dept-item:hover {
                    background: #EFF6FF; border-color: #BFDBFE;
                    transform: translateY(-2px);
                }
                .sd-dept-item-icon {
                    font-size: 1.3rem;
                    width: 40px; height: 40px;
                    display: flex; align-items: center; justify-content: center;
                    background: white; border-radius: 10px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                    flex-shrink: 0;
                }
                .sd-dept-item-label {
                    display: block;
                    font-size: 0.68rem; font-weight: 700; color: #64748B;
                    text-transform: uppercase; letter-spacing: 0.05em;
                    margin-bottom: 2px;
                }
                .sd-dept-item-value {
                    display: block;
                    font-size: 0.92rem; font-weight: 700; color: #0F172A;
                }

                /* ====== RESPONSIVE ====== */
                @media (max-width: 1024px) {
                    .sd-actions-grid,
                    .sd-dept-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .sd-analytics-content {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                }

                @media (max-width: 640px) {
                    .sd-main {
                        padding: 16px 14px;
                        padding-bottom: max(120px, env(safe-area-inset-bottom, 100px));
                    }
                    .sd-container { gap: 20px; }

                    .sd-hero {
                        flex-direction: column;
                        align-items: stretch;
                        padding: 24px 20px;
                        gap: 18px;
                        border-radius: 18px;
                    }
                    .sd-hero-title { font-size: 1.45rem; }
                    .sd-hero-subtitle { font-size: 0.88rem; }
                    .sd-hero-meta {
                        flex-wrap: wrap; gap: 12px;
                        padding: 14px 16px;
                        justify-content: space-between;
                    }
                    .sd-meta-pill { min-width: 70px; }
                    .sd-meta-value { font-size: 1rem; }

                    .sd-actions-grid,
                    .sd-dept-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .sd-kpi-card { min-height: 58px; padding: 8px 10px; }
                    .sd-kpi-num  { font-size: 1.15rem; }

                    .sd-action-card { min-height: 130px; padding: 20px; }
                    .sd-action-top  { margin-bottom: 14px; }

                    .sd-analytics-card { padding: 20px 16px; border-radius: 18px; }
                    .sd-analytics-content { grid-template-columns: 1fr; gap: 24px; }
                    .sd-chart-chips { gap: 12px; }
                    .sd-filter-group {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: stretch;
                        gap: 8px;
                    }
                    .sd-filter-group .sd-chart-filters {
                        display: flex;
                        width: 100%;
                    }
                    .sd-filter-group .sd-filter-btn {
                        flex: 1;
                        padding: 6px 4px;
                        font-size: 0.72rem;
                        min-height: 36px;
                        white-space: nowrap;
                    }
                    .sd-chart-filters { gap: 2px; }
                    .sd-filter-btn { padding: 6px 12px; font-size: 0.75rem; min-height: 36px; }

                    .sd-table-card { border-radius: 18px; }
                    .sd-table-card .sd-card-header { padding: 20px 20px 12px; }

                    .sd-dept-card { padding: 20px; border-radius: 18px; }
                    .sd-dept-name { font-size: 0.92rem; }
                    .sd-dept-item { padding: 14px; }

                    .sd-section-title { font-size: 1.05rem; }
                }

                @media (max-width: 375px) {
                    .sd-main { padding: 12px 10px; padding-bottom: max(120px, env(safe-area-inset-bottom, 100px)); }
                    .sd-hero { padding: 20px 16px; }
                    .sd-hero-title { font-size: 1.3rem; }
                    .sd-kpi-card { padding: 16px; }
                    .sd-action-card { padding: 16px; min-height: 120px; }
                    .sd-filter-group .sd-filter-btn {
                        font-size: 0.65rem;
                        padding: 6px 2px;
                    }
                }
            `}</style>
        </div>
    );
};

export default StaffDashboard;
