import React, { useEffect, useState, useRef, useCallback } from 'react';
import Nav from '../../components/WatchmanNav';
import { Camera, ClipboardList, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

interface User {
    name: string;
    email: string;
    phone: string;
    photo: string;
}

interface ChartPoint { label: string; value: number; }

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
const MiniLineChart: React.FC<{ data: ChartPoint[]; color?: string; height?: number }> = ({
    data, color = '#3B82F6', height = 180
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

    const pad = { t: 20, r: 24, b: 30, l: 36 };
    const cw = dims.w - pad.l - pad.r;
    const ch = dims.h - pad.t - pad.b;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const stepX = cw / Math.max(data.length - 1, 1);

    const pts = data.map((d, i) => ({
        x: pad.l + i * stepX,
        y: pad.t + ch - (d.value / maxVal) * ch * animProgress
    }));

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const cpx1 = pts[i - 1].x + stepX * 0.4;
        const cpy1 = pts[i - 1].y;
        const cpx2 = pts[i].x - stepX * 0.4;
        const cpy2 = pts[i].y;
        path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${pts[i].x} ${pts[i].y}`;
    }

    const areaPath = path + ` L ${pts[pts.length - 1].x} ${pad.t + ch} L ${pts[0].x} ${pad.t + ch} Z`;

    return (
        <svg ref={svgRef} width="100%" height={dims.h} viewBox={`0 0 ${dims.w} ${dims.h}`} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id="gateChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                </linearGradient>
            </defs>
            {/* grid */}
            {[0, 1, 2, 3].map((_, i) => {
                const y = pad.t + (ch / 3) * i;
                return (
                    <line key={i} x1={pad.l} y1={y} x2={dims.w - pad.r} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                );
            })}
            <path d={areaPath} fill="url(#gateChartGrad)" />
            <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4.5" fill="white" stroke={color} strokeWidth="2.5" />
                    <text x={p.x} y={dims.h - 8} textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">
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
const DoughnutChart: React.FC<{ data: { label: string; value: number; color: string }[], size?: number, total: number }> = ({ data, size = 160, total }) => {
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let currentOffset = 0;
    const [animProgress, setAnimProgress] = useState(0);

    const dataSum = data.reduce((acc, d) => acc + d.value, 0);
    const renderTotal = Math.max(total, dataSum) || 1;

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

    return (
        <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
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
                            style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
                        />
                    );
                })}
            </svg>
            <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center'
            }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {Math.round(total * animProgress)}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                    Active
                </span>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Skeleton Loaders                                                   */
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
        {[1, 2, 3, 4].map(i => (
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
                <SkeletonPulse w="100%" h="180px" r="12px" />
            </div>
            <div className="sd-analytics-right">
                <SkeletonPulse w="140px" h="140px" r="50%" style={{ margin: '0 auto' }} />
            </div>
        </div>
    </div>
);

const WatchmanDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<Partial<User>>({
        name: "",
        email: "",
        phone: "",
        photo: "",
    });
    const [stats, setStats] = useState({
        total: 0,
        ready: 0,
        away: 0,
        returned: 0
    });
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [rawOutpasses, setRawOutpasses] = useState<any[]>([]);
    const [chartRange, setChartRange] = useState<'today' | 'weekly' | 'monthly'>('weekly');
    const [chartType, setChartType] = useState<'all' | 'exit' | 'entry'>('all');

    const navigate = useNavigate();
    const [zoomingPath, setZoomingPath] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                localStorage.clear();
                navigate('/watchman-login');
                if (isMounted) setLoading(false);
                return;
            }

            try {
                // Fetch profile
                const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/watchman/profile`, {
                    headers: { authorization: `Bearer ${token}` }
                });
                if (profileRes.status === 200 && isMounted) {
                    setUser(profileRes.data.watchman);
                }

                // Fetch stats from backend API
                const statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/watchman/outpass/stats`, {
                    headers: { authorization: `Bearer ${token}` }
                });
                if (statsRes.status === 200 && isMounted) {
                    const statsData = statsRes.data.stats?.[0] || { count: 0, out: 0, in: 0 };
                    const total = statsData.count || 0;
                    const away = (statsData.out || 0) - (statsData.in || 0);
                    const ready = total - (statsData.out || 0);
                    const returned = statsData.in || 0;
                    setStats({ total, ready, away, returned });
                }

                // Fetch approved outpasses to aggregate real-time metrics for chart/table
                const listRes = await axios.get(`${import.meta.env.VITE_API_URL}/watchman/outpass/list`, {
                    headers: { authorization: `Bearer ${token}` }
                });
                if (listRes.status === 200 && isMounted) {
                    const data = listRes.data.outpass || [];
                    setRawOutpasses(data);

                    // Generate gate activity logs from exits and entries
                    const activities: any[] = [];
                    data.forEach((item: any) => {
                        if (item.out) {
                            activities.push({
                                _id: item._id,
                                name: item.studentid?.name || 'Student',
                                registerNumber: item.studentid?.registerNumber || 'N/A',
                                photo: item.studentid?.photo || '',
                                outpasstype: item.outpasstype || 'General',
                                type: 'EXIT',
                                timestamp: item.out
                            });
                        }
                        if (item.in) {
                            activities.push({
                                _id: item._id,
                                name: item.studentid?.name || 'Student',
                                registerNumber: item.studentid?.registerNumber || 'N/A',
                                photo: item.studentid?.photo || '',
                                outpasstype: item.outpasstype || 'General',
                                type: 'ENTRY',
                                timestamp: item.in
                            });
                        }
                    });

                    // Sort descending by activity timestamp
                    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    setRecentLogs(activities.slice(0, 5));
                }
            } catch (error) {
                console.error('Failed to load dashboard data', error);
                if (isMounted) {
                    toast.error('Failed to retrieve complete dashboard stats');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDashboardData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleQuickAction = (path: string) => {
        setZoomingPath(path);
        setTimeout(() => {
            navigate(path);
        }, 600);
    };

    /* Build SVG Bezier splines based on exit/entry logs */
    const buildChartData = useCallback((): ChartPoint[] => {
        const now = new Date();
        const logs: Date[] = [];

        rawOutpasses.forEach(item => {
            if (chartType === 'all' || chartType === 'exit') {
                if (item.out) logs.push(new Date(item.out));
            }
            if (chartType === 'all' || chartType === 'entry') {
                if (item.in) logs.push(new Date(item.in));
            }
        });

        if (chartRange === 'today') {
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const slots = [
                { label: '12AM', start: 0, end: 4 },
                { label: '4AM', start: 4, end: 8 },
                { label: '8AM', start: 8, end: 12 },
                { label: '12PM', start: 12, end: 16 },
                { label: '4PM', start: 16, end: 20 },
                { label: '8PM', start: 20, end: 24 }
            ];
            const counts = slots.map(() => 0);
            logs.forEach(d => {
                if (d >= todayStart) {
                    const h = d.getHours();
                    const idx = slots.findIndex(s => h >= s.start && h < s.end);
                    if (idx !== -1) counts[idx]++;
                }
            });
            return slots.map((s, i) => ({ label: s.label, value: counts[i] }));
        }

        if (chartRange === 'weekly') {
            const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const counts = new Array(7).fill(0);
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 6);
            weekAgo.setHours(0, 0, 0, 0);

            const orderedDays: string[] = [];
            for (let i = 0; i < 7; i++) {
                const dt = new Date(weekAgo);
                dt.setDate(dt.getDate() + i);
                orderedDays.push(dayLabels[dt.getDay()]);
            }

            logs.forEach(d => {
                if (d >= weekAgo) {
                    const diffDays = Math.floor((d.getTime() - weekAgo.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays >= 0 && diffDays < 7) counts[diffDays]++;
                }
            });
            return orderedDays.map((label, i) => ({ label, value: counts[i] }));
        }

        // Monthly
        const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5'];
        const counts = new Array(5).fill(0);
        logs.forEach(d => {
            if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                const weekIdx = Math.min(Math.floor((d.getDate() - 1) / 7), 4);
                counts[weekIdx]++;
            }
        });
        const currentWeek = Math.min(Math.floor((now.getDate() - 1) / 7), 4);
        return weekLabels.slice(0, currentWeek + 1).map((label, i) => ({ label, value: counts[i] }));
    }, [chartRange, chartType, rawOutpasses]);

    const aniTotal = useAnimatedCounter(loading ? 0 : stats.total, 1000, 100);
    const aniReady = useAnimatedCounter(loading ? 0 : stats.ready, 1000, 200);
    const aniAway = useAnimatedCounter(loading ? 0 : stats.away, 1000, 300);
    const aniReturned = useAnimatedCounter(loading ? 0 : stats.returned, 1000, 400);

    return (
        <div className="sd-root">
            <Nav />
            <ToastContainer position="bottom-right" />

            <main className="sd-main">
                <div className="sd-container">

                    {/* Hero Section */}
                    {loading ? <HeroSkeleton /> : (
                        <section className="sd-hero">
                            <div className="sd-hero-sweep" />
                            <div className="sd-hero-content">
                                <div className="sd-hero-badge">
                                    <span className="sd-pulse-dot" />
                                    Active Duty
                                </div>
                                <h1 className="sd-hero-title">Hello, {user.name || 'Officer'}!</h1>
                                <p className="sd-hero-subtitle">JIT Campus Gate Security Control Center</p>
                            </div>
                            <div className="sd-hero-meta">
                                <div className="sd-meta-pill">
                                    <span className="sd-meta-label">Campus Area</span>
                                    <span className="sd-meta-value">Main Gate</span>
                                </div>
                                <div className="sd-meta-pill">
                                    <span className="sd-meta-label">Phone</span>
                                    <span className="sd-meta-value">{user.phone || 'N/A'}</span>
                                </div>
                                <div className="sd-meta-pill">
                                    <span className="sd-meta-label">Total Outpasses</span>
                                    <span className="sd-meta-value">{aniTotal}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* KPI Statistics Grid */}
                    {loading ? <KPISkeleton /> : (
                        <section className="sd-kpi-grid">
                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.1s' }}>
                                <div className="sd-kpi-icon sd-kpi-blue">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniTotal}</span>
                                    <span className="sd-kpi-label">Total Approved</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-blue" />
                            </div>

                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.2s' }}>
                                <div className="sd-kpi-icon sd-kpi-amber">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniReady}</span>
                                    <span className="sd-kpi-label">Ready for Exit</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-amber" />
                            </div>

                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.3s' }}>
                                <div className="sd-kpi-icon sd-kpi-red">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                        <path d="M10 16L14 12L10 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M20 4H17C15.8954 4 15 4.89543 15 6V18C15 19.1046 15.8954 20 17 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniAway}</span>
                                    <span className="sd-kpi-label">Away / Out</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-red" />
                            </div>

                            <div className="sd-kpi-card sd-fade-up" style={{ animationDelay: '0.4s' }}>
                                <div className="sd-kpi-icon sd-kpi-green">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                        <path d="M14 16L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M22 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M4 4H7C8.10457 4 9 4.89543 9 6V18C9 19.1046 8.10457 20 7 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div className="sd-kpi-info">
                                    <span className="sd-kpi-num">{aniReturned}</span>
                                    <span className="sd-kpi-label">Returned / In</span>
                                </div>
                                <div className="sd-kpi-ring sd-kpi-ring-green" />
                            </div>
                        </section>
                    )}

                    {/* Analytics Section */}
                    {loading ? <ChartSkeleton /> : (
                        <section className="sd-analytics-card sd-fade-up" style={{ animationDelay: '0.15s' }}>
                            <div className="sd-card-header">
                                <div>
                                    <h2 className="sd-card-title">Gate Traffic Analytics</h2>
                                    <p className="sd-card-desc">Hourly, weekly, and monthly exit/entry logs</p>
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
                                    <div className="sd-chart-filters">
                                        {(['all', 'exit', 'entry'] as const).map(t => (
                                            <button
                                                key={t}
                                                className={`sd-filter-btn ${chartType === t ? 'sd-filter-active' : ''}`}
                                                onClick={() => setChartType(t)}
                                            >
                                                {t === 'all' ? 'All' : t.toUpperCase()}
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
                                            <span className="sd-chip-label">Exits logged</span>
                                            <span className="sd-chip-val">{rawOutpasses.filter(o => o.out).length}</span>
                                        </div>
                                        <div className="sd-chip">
                                            <span className="sd-chip-dot" style={{ background: '#10B981' }} />
                                            <span className="sd-chip-label">Entries logged</span>
                                            <span className="sd-chip-val">{rawOutpasses.filter(o => o.in).length}</span>
                                        </div>
                                    </div>

                                    <div className="sd-chart-wrap">
                                        <MiniLineChart data={buildChartData()} color="#3B82F6" height={190} />
                                    </div>
                                </div>
                                <div className="sd-analytics-right">
                                    <h3 className="sd-doughnut-title">Pass State Ratio</h3>
                                    <DoughnutChart
                                        data={[
                                            { label: 'Ready', value: stats.ready, color: '#F59E0B' },
                                            { label: 'Out', value: stats.away, color: '#EF4444' },
                                            { label: 'Returned', value: stats.returned, color: '#10B981' }
                                        ]}
                                        total={stats.total}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Quick Actions Panel */}
                    <section className="sd-fade-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="sd-section-title">Gate Control Panel</h2>
                        <div className="sd-actions-grid">

                            {/* Scan QR */}
                            <div
                                className={`sd-action-card ${zoomingPath === '/watchman/scan' ? 'zooming' : ''}`}
                                onClick={() => handleQuickAction('/watchman/scan')}
                                style={{ borderLeft: '5px solid #3B82F6' }}
                            >
                                <div className="sd-action-top">
                                    <span className="sd-action-icon"><Camera size={24} /></span>
                                    <span className="sd-action-arrow">
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </span>
                                </div>
                                <div>
                                    <h3 className="sd-action-title">Scan Student QR</h3>
                                    <p className="sd-action-desc">Scan student outpass QR code for exit/entry verification and instant gate log updates.</p>
                                </div>
                            </div>

                            {/* Outpass List */}
                            <div
                                className={`sd-action-card ${zoomingPath === '/watchman/outpass-list' ? 'zooming' : ''}`}
                                onClick={() => handleQuickAction('/watchman/outpass-list')}
                                style={{ borderLeft: '5px solid #10B981' }}
                            >
                                <div className="sd-action-top">
                                    <span className="sd-action-icon"><ClipboardList size={24} /></span>
                                    <span className="sd-action-arrow">
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </span>
                                </div>
                                <div>
                                    <h3 className="sd-action-title">Approved Outpasses</h3>
                                    <p className="sd-action-desc">View, search, and monitor all student outpass approvals, destination details, and gate logs.</p>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Recent Gate Logs Activity Table */}
                    {!loading && (
                        <section className="sd-table-card sd-fade-up" style={{ animationDelay: '0.25s' }}>
                            <div className="sd-card-header" style={{ padding: '24px 28px 16px' }}>
                                <div>
                                    <h2 className="sd-card-title">Recent Gate Activity Logs</h2>
                                    <p className="sd-card-desc">Most recent campus gate check-ins and check-outs</p>
                                </div>
                                <button className="sd-view-all-btn" onClick={() => navigate('/watchman/outpass-list')}>
                                    View Logs
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                            </div>

                            {recentLogs.length > 0 ? (
                                <div className="sd-table-scroll">
                                    <table className="sd-table">
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Register No.</th>
                                                <th>Outpass Type</th>
                                                <th>Gate Activity</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentLogs.map((log, idx) => (
                                                <tr key={log._id || idx} onClick={() => navigate(`/watchman/student/${log._id}`)}>
                                                    <td>
                                                        <div className="sd-student-cell">
                                                            <div className="sd-avatar-placeholder" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                                {log.name ? log.name.charAt(0).toUpperCase() : "?"}
                                                            </div>
                                                            <span className="sd-name">{log.name || 'Student'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="sd-mono">{log.registerNumber}</td>
                                                    <td>
                                                        <span className={`sd-type-badge ${log.outpasstype?.toLowerCase().includes('emergency') ? 'emergency' : ''}`} style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                                                            {log.outpasstype}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`sd-status-badge ${log.type === 'EXIT' ? 'sd-status-rejected' : 'sd-status-approved'}`} style={{ fontSize: '0.68rem', minWidth: '70px', justifyContent: 'center' }}>
                                                            {log.type === 'EXIT' ? '🔴 EXIT (OUT)' : '🟢 ENTRY (IN)'}
                                                        </span>
                                                    </td>
                                                    <td className="sd-date">
                                                        {new Date(log.timestamp).toLocaleString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="sd-empty">
                                    <span className="sd-empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ticket size={40} style={{ color: '#CBD5E1' }} />
                                    </span>
                                    <h3 className="sd-empty-title">No Activity Logged Yet</h3>
                                    <p className="sd-empty-desc">Once students scan out or in at the gate, their logs will compile here in real-time.</p>
                                </div>
                            )}
                        </section>
                    )}

                </div>
            </main>

            <style>{`
                /* ====== ROOT LAYOUT ====== */
                .sd-root {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 45%, #DBEAFE 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    padding-top: var(--nav-height, 64px);
                    padding-bottom: 80px;
                }

                .sd-main {
                    padding: 24px 32px;
                    max-width: var(--content-max, 1280px);
                    margin: 0 auto;
                }

                .sd-container {
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                /* ====== ANIMATIONS ====== */
                @keyframes sdFadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .sd-fade-up {
                    opacity: 0;
                    animation: sdFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes sdShimmer {
                    0%   { background-position: -300px 0; }
                    100% { background-position: 300px 0; }
                }

                /* ====== SKELETON ====== */
                .sd-skeleton {
                    background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 37%, #E2E8F0 63%);
                    background-size: 300px 100%;
                    animation: sdShimmer 1.4s ease infinite;
                }

                /* ====== 1. HERO BANNER ====== */
                .sd-hero {
                    position: relative;
                    background: linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%);
                    border-radius: 20px;
                    padding: 32px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 10px 25px rgba(30, 58, 138, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    color: white;
                }

                .sd-hero-sweep {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 75% 30%, rgba(59, 130, 246, 0.25) 0%, transparent 60%);
                    pointer-events: none;
                }

                .sd-hero-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .sd-hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    padding: 6px 14px;
                    border-radius: 100px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    width: fit-content;
                }

                .sd-pulse-dot {
                    width: 6px;
                    height: 6px;
                    background: #10B981;
                    border-radius: 50%;
                    animation: pulse-glow-green 2s infinite;
                }

                @keyframes pulse-glow-green {
                    0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                .sd-hero-title {
                    font-size: 2rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    margin: 0;
                    color: white;
                }

                .sd-hero-subtitle {
                    font-size: 1rem;
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 500;
                    margin: 0;
                }

                .sd-hero-meta {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    gap: 16px;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 18px 24px;
                    border-radius: 16px;
                }

                .sd-meta-pill {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 90px;
                }

                .sd-meta-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.6);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .sd-meta-value {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: white;
                }

                /* ====== 2. KPI GRID ====== */
                .sd-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }

                .sd-kpi-card {
                    position: relative;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    border-radius: 16px;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02), 0 0 0 1px rgba(226, 232, 240, 0.5);
                    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }

                .sd-kpi-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(59, 130, 246, 0.15);
                }

                .sd-kpi-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .sd-kpi-blue  { background: #EFF6FF; color: #3B82F6; }
                .sd-kpi-amber { background: #FFFBEB; color: #D97706; }
                .sd-kpi-green { background: #ECFDF5; color: #10B981; }
                .sd-kpi-red   { background: #FEF2F2; color: #EF4444; }

                .sd-kpi-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    flex: 1;
                }

                .sd-kpi-num {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0F172A;
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                }

                .sd-kpi-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }

                .sd-kpi-ring {
                    position: absolute;
                    top: -15px;
                    right: -15px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    opacity: 0.05;
                }

                .sd-kpi-ring-blue  { background: #3B82F6; }
                .sd-kpi-ring-amber { background: #D97706; }
                .sd-kpi-ring-green { background: #10B981; }
                .sd-kpi-ring-red   { background: #EF4444; }

                /* ====== 3. ANALYTICS CARD ====== */
                .sd-analytics-card {
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.7);
                    border-radius: 20px;
                    padding: 28px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(226,232,240,0.5);
                }

                .sd-card-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    gap: 16px; flex-wrap: wrap;
                    padding-bottom: 16px;
                }

                .sd-card-title {
                    font-size: 1.15rem; font-weight: 700; color: #0F172A;
                    margin: 0; letter-spacing: -0.01em;
                }

                .sd-card-desc {
                    font-size: 0.82rem; color: #64748B; margin: 4px 0 0;
                    font-weight: 500;
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
                    border: 1px solid #E2E8F0;
                }

                .sd-filter-btn {
                    padding: 6px 14px;
                    border: none; border-radius: 8px;
                    background: transparent;
                    color: #64748B; font-size: 0.78rem; font-weight: 600;
                    cursor: pointer; transition: all 0.2s ease;
                    font-family: inherit;
                    min-height: 32px;
                }

                .sd-filter-btn:hover { color: #334155; }
                .sd-filter-btn.sd-filter-active {
                    background: white; color: #3B82F6;
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
                    box-sizing: border-box;
                }

                .sd-doughnut-title {
                    font-size: 0.9rem; font-weight: 700; color: #0F172A;
                    margin: 0 0 16px; text-align: center;
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
                    padding: 10px 0;
                }

                /* ====== 4. QUICK ACTIONS GRID ====== */
                .sd-section-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #0F172A;
                    letter-spacing: -0.01em;
                    margin: 0 0 16px;
                }

                .sd-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .sd-action-card {
                    position: relative;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(226, 232, 240, 0.7);
                    border-radius: 20px;
                    padding: 24px;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 160px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
                    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease;
                    text-align: left;
                    font-family: inherit;
                    color: inherit;
                    outline: none;
                }

                .sd-action-card:hover {
                    transform: translateY(-6px);
                    border-color: #3B82F6;
                    box-shadow: 0 12px 28px rgba(59, 130, 246, 0.08), 0 0 0 1px rgba(59, 130, 246, 0.1);
                }

                .sd-action-card:active {
                    transform: translateY(-2px) scale(0.99);
                }

                /* Zoom Transition Action */
                .sd-action-card.zooming {
                    animation: zoom-in-action 0.6s cubic-bezier(0.7, 0, 0.3, 1) forwards;
                    z-index: 100;
                    pointer-events: none;
                }

                @keyframes zoom-in-action {
                    0% { transform: scale(1); opacity: 1; }
                    50% { opacity: 0.8; }
                    100% { transform: scale(20); opacity: 0; }
                }

                .sd-action-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .sd-action-icon {
                    font-size: 1.8rem;
                    background: #FAFBFD;
                    width: 52px;
                    height: 52px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 6px rgba(0,0,0,0.03);
                }

                .sd-action-arrow {
                    color: #CBD5E1;
                    font-weight: 700;
                    font-size: 1.25rem;
                    transition: all 0.25s ease;
                    display: flex;
                    align-items: center;
                }

                .sd-action-card:hover .sd-action-arrow {
                    color: #3B82F6;
                    transform: translate(3px, -3px);
                }

                .sd-action-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0 0 6px;
                }

                .sd-action-desc {
                    font-size: 0.82rem;
                    color: #64748B;
                    line-height: 1.5;
                    margin: 0;
                }

                /* ====== 5. TABLE CARD ====== */
                .sd-table-card {
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.7);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(226,232,240,0.5);
                }

                .sd-view-all-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 8px 18px; border-radius: 10px;
                    background: #EFF6FF; color: #3B82F6;
                    border: 1px solid rgba(59,130,246,0.15);
                    font-size: 0.82rem; font-weight: 700;
                    cursor: pointer; transition: all 0.2s ease;
                    font-family: inherit;
                    min-height: 38px;
                }

                .sd-view-all-btn:hover {
                    background: #3B82F6; color: white;
                    box-shadow: 0 4px 14px rgba(59,130,246,0.2);
                }

                .sd-table-scroll {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .sd-table {
                    width: 100%; border-collapse: collapse; text-align: left;
                }

                .sd-table th {
                    background: #F8FAFC;
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

                .sd-table tbody tr {
                    cursor: pointer;
                }

                .sd-table tbody tr:hover td { background: #F8FAFC; }
                .sd-table tbody tr:last-child td { border-bottom: none; }

                .sd-student-cell {
                    display: flex; align-items: center; gap: 12px;
                }

                .sd-avatar-placeholder {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
                    color: white;
                    font-weight: 700;
                    font-size: 0.82rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(59,130,246,0.25);
                }

                .sd-name { font-weight: 600; color: #0F172A; white-space: nowrap; }
                .sd-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-weight: 600; color: #64748B; font-size: 0.82rem; }
                .sd-type-badge {
                    display: inline-flex;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    background: #EFF6FF;
                    color: #3B82F6;
                    text-transform: uppercase;
                }
                .sd-type-badge.emergency {
                    background: #FEF2F2;
                    color: #EF4444;
                }

                .sd-date { color: #475569; font-weight: 500; white-space: nowrap; }

                /* Status/Gate badges */
                .sd-status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }

                .sd-status-approved { background: #ECFDF5; color: #10B981; }
                .sd-status-rejected { background: #FEF2F2; color: #EF4444; }

                /* Empty state styling */
                .sd-empty {
                    text-align: center;
                    padding: 48px 24px;
                }
                .sd-empty-icon {
                    margin-bottom: 12px;
                    color: #CBD5E1;
                    font-size: 2.2rem;
                }
                .sd-empty-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #334155;
                    margin: 0 0 4px;
                }
                .sd-empty-desc {
                    font-size: 0.82rem;
                    color: #94A3B8;
                    margin: 0;
                }

                /* ====== RESPONSIVE ====== */
                @media (max-width: 1024px) {
                    .sd-kpi-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 14px;
                    }
                    .sd-analytics-content {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                }

                @media (max-width: 768px) {
                    .sd-main {
                        padding: 16px;
                    }
                    .sd-hero {
                        flex-direction: column;
                        align-items: stretch;
                        padding: 24px;
                        gap: 20px;
                    }
                    .sd-hero-title {
                        font-size: 1.6rem;
                    }
                    .sd-hero-meta {
                        flex-direction: row;
                        justify-content: space-between;
                        padding: 12px 16px;
                    }
                    .sd-meta-pill {
                        min-width: 70px;
                    }
                    .sd-meta-value {
                        font-size: 0.95rem;
                    }
                    .sd-actions-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                    .sd-kpi-card {
                        padding: 12px 14px;
                    }
                    .sd-kpi-num {
                        font-size: 1.25rem;
                    }
                }

                @media (max-width: 480px) {
                    .sd-hero {
                        padding: 20px 16px;
                    }
                    .sd-hero-title {
                        font-size: 1.45rem;
                    }
                    .sd-kpi-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                }
            `}</style>
        </div>
    );
};

export default WatchmanDashboard;
