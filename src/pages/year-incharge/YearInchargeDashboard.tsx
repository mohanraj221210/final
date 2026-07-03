import React, { useState, useEffect, useRef, useCallback } from 'react';
import YearInchargeNav from '../../components/YearInchargeNav';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { YearInchargeService } from '../../services/yearInchargeService';
import type { MappedStats } from '../../services/yearInchargeService';

/* ─────────────────────────────────────────────
   Animated Counter Hook
───────────────────────────────────────────── */
const useAnimatedCounter = (end: number, duration = 900) => {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number>(0);
    useEffect(() => {
        if (end === 0) { setCount(0); return; }
        const startTime = performance.now();
        const step = (now: number) => {
            const p = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(eased * end));
            if (p < 1) frameRef.current = requestAnimationFrame(step);
        };
        frameRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameRef.current);
    }, [end, duration]);
    return count;
};

/* ─────────────────────────────────────────────
   Mini SVG Line Chart
───────────────────────────────────────────── */
interface ChartPoint { label: string; value: number; }

const MiniLineChart: React.FC<{ data: ChartPoint[]; color?: string; height?: number }> = ({
    data, color = '#3B82F6', height = 200
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [dims, setDims] = useState({ w: 600, h: height });
    const [animP, setAnimP] = useState(0);

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
        setAnimP(0);
        let start: number;
        const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / 900, 1);
            setAnimP(1 - Math.pow(1 - p, 3));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [data]);

    if (!data.length) return (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
            No data for this period
        </div>
    );

    const pad = { t: 20, r: 24, b: 40, l: 44 };
    const cw = dims.w - pad.l - pad.r;
    const ch = dims.h - pad.t - pad.b;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const stepX = cw / Math.max(data.length - 1, 1);

    const pts = data.map((d, i) => ({
        x: pad.l + i * stepX,
        y: pad.t + ch - (d.value / maxVal) * ch * animP
    }));

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const cpx1 = pts[i - 1].x + stepX * 0.4, cpy1 = pts[i - 1].y;
        const cpx2 = pts[i].x - stepX * 0.4, cpy2 = pts[i].y;
        path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${pts[i].x} ${pts[i].y}`;
    }
    const areaPath = path + ` L ${pts[pts.length - 1].x} ${pad.t + ch} L ${pts[0].x} ${pad.t + ch} Z`;
    const gridLines = 4;
    const gridY = Array.from({ length: gridLines + 1 }, (_, i) => ({
        val: Math.round((maxVal / gridLines) * (gridLines - i)),
        y: pad.t + (ch / gridLines) * i
    }));

    return (
        <svg ref={svgRef} width="100%" height={dims.h} viewBox={`0 0 ${dims.w} ${dims.h}`}>
            <defs>
                <linearGradient id="yiChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                </linearGradient>
            </defs>
            {gridY.map((g, i) => (
                <g key={i}>
                    <line x1={pad.l} y1={g.y} x2={dims.w - pad.r} y2={g.y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                    <text x={pad.l - 8} y={g.y + 4} textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="Inter,sans-serif">{g.val}</text>
                </g>
            ))}
            <path d={areaPath} fill="url(#yiChartGrad)" />
            <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2.5" />
                    <text x={p.x} y={dims.h - 8} textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="Inter,sans-serif">{data[i].label}</text>
                </g>
            ))}
        </svg>
    );
};

/* ─────────────────────────────────────────────
   Doughnut Chart
───────────────────────────────────────────── */
const DoughnutChart: React.FC<{ data: { label: string; value: number; color: string }[]; total: number; size?: number }> = ({
    data, total, size = 180
}) => {
    const sw = 22, r = (size - sw) / 2, center = size / 2;
    const circumference = 2 * Math.PI * r;
    const [animP, setAnimP] = useState(0);

    useEffect(() => {
        setAnimP(0);
        let start: number;
        const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / 1000, 1);
            setAnimP(1 - Math.pow(1 - p, 3));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [data]);

    const dataSum = data.reduce((a, d) => a + d.value, 0);
    const renderTotal = Math.max(total, dataSum) || 1;
    let currentOffset = 0;

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                <circle cx={center} cy={center} r={r} fill="none" stroke="#F1F5F9" strokeWidth={sw} />
                {total > 0 && data.map((d, i) => {
                    if (d.value === 0) return null;
                    const pct = (d.value / renderTotal) * animP;
                    const da = `${pct * circumference} ${circumference}`;
                    const offset = -currentOffset;
                    currentOffset += (d.value / renderTotal) * circumference;
                    return (
                        <circle key={i} cx={center} cy={center} r={r} fill="none"
                            stroke={d.color} strokeWidth={sw}
                            strokeDasharray={da} strokeDashoffset={offset} />
                    );
                })}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{Math.round(total * animP)}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>Total</span>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Skeleton Components
───────────────────────────────────────────── */
const Skel: React.FC<{ w?: string; h?: string; r?: string; style?: React.CSSProperties }> = ({ w = '100%', h = '20px', r = '8px', style }) => (
    <div className="lux-skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const StatsSkeleton = () => (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map(i => <div key={i} className="stat-card"><Skel w="130px" h="50px" r="12px" /></div>)}
    </div>
);

const ChartSkeleton = () => (
    <div className="yi-analytics-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Skel w="200px" h="22px" r="6px" />
            <Skel w="220px" h="36px" r="8px" />
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}><Skel w="100%" h="220px" r="12px" /></div>
            <div><Skel w="180px" h="180px" r="50%" /></div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   Filter Pills
───────────────────────────────────────────── */
type FilterType = 'total' | 'today' | 'weekly' | 'monthly';
const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
    { value: 'total', label: 'Total' },
    { value: 'today', label: 'Today' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
];

interface FilterPillsProps { value: FilterType; onChange: (v: FilterType) => void; light?: boolean; }
const FilterPills: React.FC<FilterPillsProps> = ({ value, onChange, light }) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FILTER_OPTIONS.map(opt => {
            const active = opt.value === value;
            return (
                <button key={opt.value} onClick={() => onChange(opt.value)}
                    style={{
                        padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                        border: active ? '2px solid transparent' : `2px solid ${light ? 'rgba(255,255,255,0.3)' : '#e2e8f0'}`,
                        background: active ? (light ? 'rgba(255,255,255,0.25)' : '#0047AB') : 'transparent',
                        color: active ? (light ? 'white' : 'white') : (light ? 'rgba(255,255,255,0.75)' : '#475569'),
                        cursor: 'pointer', transition: 'all 0.2s',
                        backdropFilter: light ? 'blur(8px)' : undefined,
                    }}>
                    {opt.label}
                </button>
            );
        })}
    </div>
);

/* ─────────────────────────────────────────────
   Build chart time-series data from outpass list
───────────────────────────────────────────── */
function buildChartData(stats: MappedStats, filter: FilterType): ChartPoint[] {
    const passes = stats.recentpasses || [];
    const now = new Date();

    if (passes.length > 0) {
        if (filter === 'today') {
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const slots = [
                { label: '12AM', start: 0, end: 4 },
                { label: '4AM',  start: 4, end: 8 },
                { label: '8AM',  start: 8, end: 12 },
                { label: '12PM', start: 12, end: 16 },
                { label: '4PM',  start: 16, end: 20 },
                { label: '8PM',  start: 20, end: 24 },
            ];
            const counts = slots.map(() => 0);
            passes.forEach(pass => {
                if (!pass.createdAt) return;
                const d = new Date(pass.createdAt);
                if (d >= todayStart) {
                    const h = d.getHours();
                    const idx = slots.findIndex(s => h >= s.start && h < s.end);
                    if (idx !== -1) counts[idx]++;
                }
            });
            return slots.map((s, i) => ({ label: s.label, value: counts[i] }));
        }

        if (filter === 'weekly') {
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

            passes.forEach(pass => {
                if (!pass.createdAt) return;
                const d = new Date(pass.createdAt);
                if (d >= weekAgo) {
                    const diffDays = Math.floor((d.getTime() - weekAgo.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays >= 0 && diffDays < 7) counts[diffDays]++;
                }
            });
            return orderedDays.map((label, i) => ({ label, value: counts[i] }));
        }

        if (filter === 'monthly') {
            const weekLabels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'];
            const counts = new Array(5).fill(0);
            passes.forEach(pass => {
                if (!pass.createdAt) return;
                const d = new Date(pass.createdAt);
                if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                    const weekIdx = Math.min(Math.floor((d.getDate() - 1) / 7), 4);
                    counts[weekIdx]++;
                }
            });
            return weekLabels.map((label, i) => ({ label, value: counts[i] }));
        }

        // total
        const months: string[] = [];
        const counts = new Array(6).fill(0);
        for (let i = 5; i >= 0; i--) {
            const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(dt.toLocaleString('default', { month: 'short' }));
        }

        passes.forEach(pass => {
            if (!pass.createdAt) return;
            const d = new Date(pass.createdAt);
            const passYear = d.getFullYear();
            const passMonth = d.getMonth();
            for (let i = 5; i >= 0; i--) {
                const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
                if (dt.getFullYear() === passYear && dt.getMonth() === passMonth) {
                    counts[5 - i]++;
                    break;
                }
            }
        });
        return months.map((label, i) => ({ label, value: counts[i] }));
    }

    const total = stats.approved + stats.pending + stats.rejected;
    if (filter === 'today') {
        const slots = ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM'];
        const values = [
            Math.round(total * 0.05),
            Math.round(total * 0.1),
            Math.round(total * 0.3),
            Math.round(total * 0.25),
            Math.round(total * 0.2),
            Math.round(total * 0.1)
        ];
        return slots.map((label, i) => ({ label, value: values[i] || 0 }));
    }
    if (filter === 'weekly') {
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 6);
        const orderedDays: string[] = [];
        for (let i = 0; i < 7; i++) {
            const dt = new Date(weekAgo); dt.setDate(dt.getDate() + i);
            orderedDays.push(dayLabels[dt.getDay()]);
        }
        const values = [
            Math.round(total * 0.05),
            Math.round(total * 0.2),
            Math.round(total * 0.25),
            Math.round(total * 0.15),
            Math.round(total * 0.2),
            Math.round(total * 0.1),
            Math.round(total * 0.05)
        ];
        return orderedDays.map((label, i) => ({ label, value: values[i] || 0 }));
    }
    if (filter === 'monthly') {
        const weekLabels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'];
        const values = [
            Math.round(total * 0.15),
            Math.round(total * 0.25),
            Math.round(total * 0.3),
            Math.round(total * 0.25),
            Math.round(total * 0.05)
        ];
        return weekLabels.map((label, i) => ({ label, value: values[i] || 0 }));
    }
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
        const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(dt.toLocaleString('default', { month: 'short' }));
    }
    const values = [
        Math.round(total * 0.1),
        Math.round(total * 0.15),
        Math.round(total * 0.2),
        Math.round(total * 0.25),
        Math.round(total * 0.18),
        Math.round(total * 0.12)
    ];
    return months.map((label, i) => ({ label, value: values[i] || 0 }));
}

/* ─────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────── */
interface User { name: string; registerNumber: string; department: string; year: string; email: string; }

const YearInchargeDashboard: React.FC = () => {
    const [initialLoading, setInitialLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [chartLoading, setChartLoading] = useState(false);
    const [user, setUser] = useState<User>({ name: 'Year Incharge', registerNumber: 'INCHARGE001', department: 'Administration', year: 'N/A', email: 'incharge@jit.edu' });
    const [stats, setStats] = useState<MappedStats>({ total: 0, pending: 0, approved: 0, rejected: 0, recentpasses: [] });
    const [filter, setFilter] = useState<FilterType>('total');
    const [error, setError] = useState<string | null>(null);
    const [zoomingPath, setZoomingPath] = useState<string | null>(null);
    const navigate = useNavigate();

    // Animated counters — update when stats change
    const aniTotal = useAnimatedCounter(stats.total);
    const aniPending = useAnimatedCounter(stats.pending);
    const aniApproved = useAnimatedCounter(stats.approved);
    const aniRejected = useAnimatedCounter(stats.rejected);

    const handleAuthError = useCallback((err: any) => {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
            navigate('/year-incharge-login');
        }
    }, [navigate]);

    // Initial full load (profile + stats + pending check + chart data)
    const fetchAll = useCallback(async (selectedFilter: FilterType) => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/year-incharge-login'); return; }

        setInitialLoading(true);
        setError(null);

        let profileData: any = null;
        let statsData: any = null;

        await Promise.all([
            YearInchargeService.getProfile()
                .then(r => { profileData = r; })
                .catch(e => { handleAuthError(e); console.error('Profile fetch error:', e); }),
            YearInchargeService.getStats(selectedFilter)
                .then(r => { statsData = r; })
                .catch(e => { handleAuthError(e); console.error('Stats fetch error:', e); }),
        ]);

        if (profileData) {
            setUser({
                name: profileData.name || 'Year Incharge',
                registerNumber: profileData.registerNumber || 'INCHARGE001',
                department: profileData.department || 'Administration',
                year: profileData.year || 'N/A',
                email: profileData.email || 'incharge@jit.edu'
            });
        }
        if (statsData) setStats(statsData);

        setInitialLoading(false);
    }, [navigate, handleAuthError]);

    // Filter-driven re-fetch (stats + chart data only — no profile re-fetch)
    const fetchFiltered = useCallback(async (selectedFilter: FilterType) => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/year-incharge-login'); return; }

        setStatsLoading(true);
        setChartLoading(true);

        let statsData: any = null;

        await Promise.all([
            YearInchargeService.getStats(selectedFilter)
                .then(r => { statsData = r; })
                .catch(e => { handleAuthError(e); console.error('Stats fetch error:', e); }),
        ]);

        if (statsData) setStats(statsData);

        setStatsLoading(false);
        setChartLoading(false);
    }, [navigate, handleAuthError]);

    // On mount
    useEffect(() => { fetchAll(filter); }, []);

    // On filter change (skip first render)
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        fetchFiltered(filter);
    }, [filter]);

    const handleQuickAction = (path: string) => {
        setZoomingPath(path);
        setTimeout(() => navigate(path), 700);
    };

    const chartData = buildChartData(stats, filter);
    const doughnutData = [
        { label: 'Approved', value: stats.approved, color: '#22C55E' },
        { label: 'Pending', value: stats.pending, color: '#F59E0B' },
        { label: 'Rejected', value: stats.rejected, color: '#EF4444' },
    ];

    if (initialLoading) {
        return (
            <div className="page-container dashboard-page">
                <ToastContainer position="bottom-right" />
                <YearInchargeNav />
                <div className="content-wrapper" style={{ marginTop: 80 }}>
                    <div className="dashboard-hero">
                        <div className="hero-welcome" style={{ width: '50%' }}>
                            <div className="lux-skeleton" style={{ width: 120, height: 24, borderRadius: 12, marginBottom: 16 }} />
                            <div className="lux-skeleton" style={{ width: 280, height: 40, borderRadius: 12, marginBottom: 12 }} />
                            <div className="lux-skeleton" style={{ width: 180, height: 20, borderRadius: 12 }} />
                        </div>
                        <StatsSkeleton />
                    </div>
                    <ChartSkeleton />
                    <div className="dashboard-layout">
                        <div className="main-content">
                            <section className="section">
                                <div className="lux-skeleton" style={{ width: 150, height: 24, borderRadius: 12, marginBottom: 20 }} />
                                <div className="quick-links-grid">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="action-card" style={{ minHeight: 140, justifyContent: 'center' }}>
                                            <div className="lux-skeleton" style={{ width: 50, height: 50, borderRadius: '50%', marginBottom: 12 }} />
                                            <div className="lux-skeleton" style={{ width: 100, height: 16, borderRadius: 8 }} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container dashboard-page">
                <ToastContainer position="bottom-right" />
                <YearInchargeNav />
                <div className="content-wrapper" style={{ paddingTop: 100, textAlign: 'center' }}>
                    <div style={{ padding: 40, maxWidth: 500, margin: '0 auto', background: 'white', borderRadius: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>⚠️</span>
                        <h2 style={{ color: '#ef4444', marginBottom: 12, fontWeight: 700 }}>Unable to Load Dashboard</h2>
                        <p style={{ color: '#64748b', marginBottom: 24, fontSize: '0.95rem' }}>{error}</p>
                        <button onClick={() => fetchAll(filter)} style={{ padding: '12px 24px', background: '#0047AB', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
                            🔄 Retry Loading
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container dashboard-page">
            <ToastContainer position="bottom-right" />
            <YearInchargeNav />
            <div className="content-wrapper">

                {/* ── Hero / Stats ── */}
                <div className="dashboard-hero">
                    <div className="hero-welcome">
                        <div><span className="badge">Welcome Back</span></div>
                        <div>
                            <h1 style={{ color: 'skyblue', marginTop: 20 }}>Hello, {user.name}! 👋</h1>
                            <p style={{ color: 'skyblue', marginBottom: 16 }}>Year Incharge • {user.department}</p>
                            <FilterPills value={filter} onChange={setFilter} light />
                        </div>
                    </div>
                    <div className="hero-stats-grid">
                        {statsLoading ? <StatsSkeleton /> : (
                            <>
                                <div className="stat-card">
                                    <div className="stat-icon blue">📊</div>
                                    <div className="stat-info"><span className="stat-value">{aniTotal}</span><span className="stat-label">Total Requests</span></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon yellow">⏳</div>
                                    <div className="stat-info"><span className="stat-value">{aniPending}</span><span className="stat-label">Pending</span></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon green">✅</div>
                                    <div className="stat-info"><span className="stat-value">{aniApproved}</span><span className="stat-label">Approved</span></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon red">❌</div>
                                    <div className="stat-info"><span className="stat-value">{aniRejected}</span><span className="stat-label">Rejected</span></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Analytics Chart ── */}
                {chartLoading ? <ChartSkeleton /> : (
                    <section className="yi-analytics-card">
                        <div className="yi-analytics-header">
                            <div>
                                <h2 className="yi-analytics-title">Outpass Analytics</h2>
                                <p className="yi-analytics-desc">Request trends &amp; approval distribution</p>
                            </div>
                            <FilterPills value={filter} onChange={setFilter} />
                        </div>

                        <div className="yi-analytics-body">
                            {/* Line chart */}
                            <div className="yi-chart-left">
                                <div className="yi-chip-row">
                                    {[
                                        { label: 'Total', val: stats.total, color: '#3B82F6' },
                                        { label: 'Approved', val: stats.approved, color: '#22C55E' },
                                        { label: 'Pending', val: stats.pending, color: '#F59E0B' },
                                        { label: 'Rejected', val: stats.rejected, color: '#EF4444' },
                                    ].map(c => (
                                        <div key={c.label} className="yi-chip">
                                            <span className="yi-chip-dot" style={{ background: c.color }} />
                                            <span className="yi-chip-label">{c.label}</span>
                                            <span className="yi-chip-val">{c.val}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 12 }}>
                                    <MiniLineChart data={chartData} color="#3B82F6" height={220} />
                                </div>
                            </div>

                            {/* Doughnut */}
                            <div className="yi-chart-right">
                                <h3 className="yi-doughnut-title">Distribution</h3>
                                <DoughnutChart data={doughnutData} total={stats.total} size={180} />
                                <div className="yi-legend">
                                    {doughnutData.map(d => (
                                        <div key={d.label} className="yi-legend-item">
                                            <span className="yi-legend-dot" style={{ background: d.color }} />
                                            <span>{d.label}</span>
                                            <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#1e293b' }}>
                                                {stats.total > 0 ? Math.round((d.value / stats.total) * 100) : 0}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Quick Actions ── */}
                <div className="dashboard-layout">
                    <div className="main-content">
                        <section className="section">
                            <h2 className="section-title">Quick Actions</h2>
                            <div className="quick-links-grid">
                                <div className={`action-card ${zoomingPath === '/year-incharge/pending-outpass' ? 'zooming' : ''}`}
                                    onClick={() => handleQuickAction('/year-incharge/pending-outpass')}>
                                    <span className="action-icon">⏳</span>
                                    <span className="action-text">Pending Outpass</span>
                                </div>
                                <div className={`action-card ${zoomingPath === '/year-incharge/outpass-list' ? 'zooming' : ''}`}
                                    onClick={() => handleQuickAction('/year-incharge/outpass-list')}>
                                    <span className="action-icon">✅</span>
                                    <span className="action-text">Outpass List</span>
                                </div>
                                <div className={`action-card ${zoomingPath === '/year-incharge-profile' ? 'zooming' : ''}`}
                                    onClick={() => handleQuickAction('/year-incharge-profile')}>
                                    <span className="action-icon">👤</span>
                                    <span className="action-text">Profile</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <style>{`
                .dashboard-hero {
                    background: linear-gradient(-45deg, #0047AB, #00214D, #1e3a8a, #0f172a);
                    background-size: 400% 400%;
                    animation: aurora 15s ease infinite;
                    border-radius: 24px;
                    padding: 40px;
                    margin-bottom: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.4);
                    position: relative;
                    overflow: hidden;
                    color: white;
                }
                .dashboard-hero::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 40%);
                    animation: pulse-glow 8s ease-in-out infinite alternate;
                    z-index: 0;
                }
                .hero-welcome { position: relative; z-index: 1; }
                .hero-stats-grid {
                    display: flex; gap: 16px; position: relative; z-index: 1;
                    flex-wrap: wrap; justify-content: flex-end;
                }
                .stat-card {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(12px);
                    padding: 18px 22px;
                    border-radius: 20px;
                    display: flex; align-items: center; gap: 16px;
                    min-width: 150px;
                    border: 1px solid rgba(255,255,255,0.2);
                    transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
                }
                .stat-card:hover {
                    transform: translateY(-5px) rotateX(5deg) scale(1.05);
                    background: rgba(255,255,255,0.2);
                    border-color: rgba(255,255,255,0.6);
                }
                .stat-icon { font-size: 22px; }
                .stat-value { font-size: 1.6rem; font-weight: 800; color: white; line-height: 1; display: block; }
                .stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.7); font-weight: 600; display: block; margin-top: 3px; }

                /* Analytics Card */
                .yi-analytics-card {
                    background: white;
                    border-radius: 24px;
                    padding: 28px;
                    margin-bottom: 32px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
                    border: 1px solid rgba(0,0,0,0.04);
                }
                .yi-analytics-header {
                    display: flex; justify-content: space-between;
                    align-items: flex-start; margin-bottom: 24px;
                    flex-wrap: wrap; gap: 12px;
                }
                .yi-analytics-title { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 0 0 4px 0; }
                .yi-analytics-desc { font-size: 0.85rem; color: #64748b; margin: 0; }
                .yi-analytics-body { display: flex; gap: 32px; }
                .yi-chart-left { flex: 1; min-width: 0; }
                .yi-chart-right {
                    display: flex; flex-direction: column; align-items: center;
                    gap: 20px; min-width: 200px;
                }
                .yi-chip-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
                .yi-chip {
                    display: flex; align-items: center; gap: 6px;
                    background: #f8fafc; border: 1px solid #e2e8f0;
                    border-radius: 20px; padding: 5px 12px; font-size: 12px;
                }
                .yi-chip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .yi-chip-label { color: #64748b; font-weight: 500; }
                .yi-chip-val { font-weight: 800; color: #1e293b; }
                .yi-doughnut-title { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }
                .yi-legend { width: 100%; display: flex; flex-direction: column; gap: 8px; }
                .yi-legend-item {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 13px; color: #475569; font-weight: 500;
                }
                .yi-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

                /* Quick Actions */
                .section { margin-bottom: 32px; }
                .section-title { font-size: 1.25rem; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
                .quick-links-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 20px; perspective: 1000px; padding-bottom: 20px;
                }
                .action-card {
                    background: white; padding: 24px; border-radius: 20px;
                    display: flex; flex-direction: column; align-items: center; gap: 16px;
                    text-align: center;
                    transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
                    border: 1px solid rgba(0,0,0,0.05);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                    cursor: pointer; position: relative; overflow: hidden; z-index: 1;
                }
                .action-card.zooming {
                    animation: zoom-in-nav 0.6s cubic-bezier(0.7,0,0.3,1) forwards;
                    z-index: 100; pointer-events: none;
                }
                .action-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 50px rgba(255,255,255,0.17); }
                .action-icon {
                    font-size: 36px;
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
                    width: 72px; height: 72px; border-radius: 20px;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.5s cubic-bezier(0.34,1.56,0.64,1);
                    border: 1px solid rgba(0,0,0,0.03); position: relative; z-index: 2;
                }
                .action-card:hover .action-icon {
                    background: #8eb7f0ff; color: white;
                    transform: scale(1.15) rotate(10deg);
                    box-shadow: 0 15px 30px rgba(0,70,168,0.78);
                }

                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
                @keyframes zoom-in-nav {
                    0% { transform: scale(1); opacity: 1; }
                    50% { opacity: 0.8; }
                    100% { transform: scale(20); opacity: 0; }
                }
                .hero-welcome .badge { animation: pulse-glow 3s infinite; }

                @media (max-width: 968px) {
                    .dashboard-hero { flex-direction: column; align-items: flex-start; gap: 24px; }
                    .hero-stats-grid { width: 100%; justify-content: flex-start; }
                    .yi-analytics-body { flex-direction: column; }
                    .yi-chart-right { flex-direction: row; flex-wrap: wrap; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default YearInchargeDashboard;
