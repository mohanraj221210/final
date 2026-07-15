import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import YearInchargeNav from "../../components/YearInchargeNav";
import { YearInchargeService, type MappedOutpass, calculateProfileCompletion } from "../../services/yearInchargeService";
import { toast } from 'react-toastify';

type ApiFilter = 'total' | 'today' | 'weekly' | 'monthly';
const FILTER_OPTIONS: { value: ApiFilter; label: string; icon: string }[] = [
    { value: 'total', label: 'Total', icon: '📊' },
    { value: 'today', label: 'Today', icon: '☀️' },
    { value: 'weekly', label: 'Weekly', icon: '📅' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
];

const YearInchargePendingOutpass: React.FC = () => {
    const [pendingOutpasses, setPendingOutpasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [documentType, setDocumentType] = useState<'image' | 'pdf'>('image');
    const [searchTerm, setSearchTerm] = useState("");
    const [apiFilter, setApiFilter] = useState<ApiFilter>('total');
    const navigate = useNavigate();

    // Pagination & Error states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLastPage, setIsLastPage] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPending, setTotalPending] = useState(0);

    // Stats Integration States
    const [stats, setStats] = useState<{ total: number; pending: number; approved: number; rejected: number; recentpasses?: MappedOutpass[] } | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const windowSize = 1;

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            let start = Math.max(2, currentPage - windowSize);
            let end = Math.min(totalPages - 1, currentPage + windowSize);

            if (start > 2) {
                pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push('...');
            }

            pages.push(totalPages);
        }
        return pages;
    };

    const fetchStats = useCallback(async (appliedDate: ApiFilter = apiFilter) => {
        setStatsLoading(true);
        try {
            const statsResult = await YearInchargeService.getStats(appliedDate);
            if (statsResult) {
                setStats({
                    total: statsResult.total,
                    pending: statsResult.pending,
                    approved: statsResult.approved,
                    rejected: statsResult.rejected,
                    recentpasses: (statsResult.recentpasses || []).filter(pass => String(pass.outpasstype || '').toLowerCase().replace(/\s+/g, '') !== 'outing')
                });
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setStatsLoading(false);
        }
    }, [apiFilter]);

    const getTypeCount = (type: string) => {
        if (!stats?.recentpasses) return 0;
        return stats.recentpasses.filter(pass => {
            const t = pass.outpasstype || 'General';
            return t.toLowerCase() === type.toLowerCase();
        }).length;
    };

    // Fetch stats when period changes
    useEffect(() => {
        fetchStats(apiFilter);
    }, [apiFilter, fetchStats]);

    // Reset page to 1 when filters or search change
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setCurrentPage(1);
    }, [apiFilter, searchTerm]);

    // Unified fetch effect for outpasses
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchPendingOutpasses(currentPage, apiFilter, searchTerm);
        }, currentPage === 1 ? 500 : 0);

        return () => clearTimeout(handler);
    }, [currentPage, apiFilter, searchTerm]);


    const fetchPendingOutpasses = async (
        page: number = currentPage,
        appliedDate: ApiFilter = apiFilter,
        search: string = searchTerm
    ) => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/year-incharge-login');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Check profile completion first
            const profileData = await YearInchargeService.getProfile();
            const completion = calculateProfileCompletion(profileData);
            if (completion < 100) {
                toast.error("Please complete your profile 100% to handle outpasses");
                navigate('/year-incharge-profile');
                return;
            }

            const result = await YearInchargeService.getPendingOutpasses(page, 10, appliedDate, search);

            // Filter out 'Outing' and Sort Emergency first
            const filteredData = result.data.filter((item: any) => String(item.outpasstype || '').toLowerCase().replace(/\s+/g, '') !== 'outing');
            const sorted = filteredData.sort((a: any, b: any) => {
                const aType = String(a.outpasstype || '').toLowerCase();
                const bType = String(b.outpasstype || '').toLowerCase();
                if (aType === 'emergency' && bType !== 'emergency') return -1;
                if (aType !== 'emergency' && bType === 'emergency') return 1;
                return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
            });

            setPendingOutpasses(sorted);
            setTotalPages(result.totalPages);
            setIsLastPage(result.isLast ?? (sorted.length < 10));
            setTotalPending(result.totalResults);
        } catch (err: any) {
            console.error("Error fetching pending outpasses:", err);
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                navigate('/year-incharge-login');
                return;
            }
            if (err?.response?.status === 404) {
                setPendingOutpasses([]);
                setTotalPages(1);
                setIsLastPage(true);
                setTotalPending(0);
                setError(null);
                return;
            }
            setError("Failed to fetch pending outpasses");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = (url: string | null) => {
        if (!url) return;
        const fullUrl = url;
        setDocumentUrl(fullUrl);
        if (url.toLowerCase().endsWith('.pdf')) {
            setDocumentType('pdf');
        } else {
            setDocumentType('image');
        }
        setShowDocumentModal(true);
    };

    const filteredPending = pendingOutpasses.filter(item => {
        const fromDateObj = item.fromDate ? new Date(item.fromDate) : null;
        const dateStr1 = fromDateObj ? fromDateObj.toLocaleDateString() : '';
        const dateStr2 = fromDateObj ? fromDateObj.toLocaleString() : '';
        const dateStr3 = fromDateObj ? fromDateObj.toDateString() : '';
        const dateStr4 = item.fromDate ? item.fromDate.split('T')[0] : '';

        const studentObj = item.student || item.studentid;
        const studentDetails = Array.isArray(studentObj) ? studentObj[0] : (typeof studentObj === 'object' ? studentObj : {});
        const term = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            (studentDetails?.name?.toLowerCase().includes(term) || false) ||
            (studentDetails?.registerNumber?.toLowerCase().includes(term) || false) ||
            dateStr1.toLowerCase().includes(term) ||
            dateStr2.toLowerCase().includes(term) ||
            dateStr3.toLowerCase().includes(term) ||
            dateStr4.toLowerCase().includes(term);

        return matchesSearch;
    });

    const emergencyCount = filteredPending.filter(i => String(i.outpasstype || '').toLowerCase() === 'emergency').length;

    return (
        <div className="po-page-container">
            <YearInchargeNav />
            <div className="po-content">

                {/* ── Hero Header ── */}
                <div className="po-hero">
                    <div className="po-hero-left">
                        <button className="po-back-btn" onClick={() => navigate('/year-incharge-dashboard')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Back to Dashboard
                        </button>
                        <div className="po-title-group">
                            <div className="po-title-badge">📋 Pending Review</div>
                            <h1 className="po-title">Pending Approvals</h1>
                            <p className="po-subtitle">Review and act on student outpass requests awaiting your decision</p>
                        </div>
                    </div>
                    <div className="po-hero-right">
                        {!loading && (
                            <>
                                <div className="po-hero-stat po-hero-stat-pending">
                                    <span className="po-hero-stat-num">{totalPending}</span>
                                    <span className="po-hero-stat-label">Awaiting</span>
                                </div>
                                {emergencyCount > 0 && (
                                    <div className="po-hero-stat po-hero-stat-emergency">
                                        <span className="po-hero-stat-num">{emergencyCount}</span>
                                        <span className="po-hero-stat-label">🚨 Critical</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── Stats Dashboard ── */}
                <div className="po-stats-dashboard">
                    {/* Approval Overview */}
                    <div className="po-stats-card">
                        <div className="po-stats-card-header">
                            <div className="po-stats-card-icon-wrap po-icon-wrap-blue">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                            </div>
                            <div>
                                <h3 className="po-stats-card-title">Approval Overview</h3>
                                <p className="po-stats-card-sub">Status breakdown for selected period</p>
                            </div>
                        </div>
                        <div className="po-stats-grid">
                            <div className="po-stat-item po-stat-pending">
                                <span className="po-stat-val">{statsLoading ? <span className="po-stat-skeleton" /> : (stats?.pending ?? 0)}</span>
                                <span className="po-stat-label">⏳ Pending</span>
                            </div>
                            <div className="po-stat-item po-stat-approved">
                                <span className="po-stat-val">{statsLoading ? <span className="po-stat-skeleton" /> : (stats?.approved ?? 0)}</span>
                                <span className="po-stat-label">✅ Approved</span>
                            </div>
                            <div className="po-stat-item po-stat-rejected">
                                <span className="po-stat-val">{statsLoading ? <span className="po-stat-skeleton" /> : (stats?.rejected ?? 0)}</span>
                                <span className="po-stat-label">❌ Rejected</span>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="po-stats-card">
                        <div className="po-stats-card-header">
                            <div className="po-stats-card-icon-wrap po-icon-wrap-purple">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                            </div>
                            <div>
                                <h3 className="po-stats-card-title">Outpass Categories</h3>
                                <p className="po-stats-card-sub">Distribution by outpass type</p>
                            </div>
                        </div>
                        <div className="po-stats-grid po-stats-grid-3">
                            <div className="po-stat-item po-stat-home">
                                <span className="po-stat-val">{statsLoading ? <span className="po-stat-skeleton" /> : getTypeCount('Home')}</span>
                                <span className="po-stat-label">🏠 Home</span>
                            </div>
                            <div className="po-stat-item po-stat-emerg">
                                <span className="po-stat-val">{statsLoading ? <span className="po-stat-skeleton" /> : getTypeCount('Emergency')}</span>
                                <span className="po-stat-label">🚨 Emergency</span>
                            </div>
                            <div className="po-stat-item po-stat-od">
                                <span className="po-stat-val">{statsLoading ? <span className="po-stat-skeleton" /> : getTypeCount('OD')}</span>
                                <span className="po-stat-label">📋 OD</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Filter & Search Bar ── */}
                <div className="po-filter-bar">
                    {/* API Filter Pills */}
                    <div className="po-pill-group">
                        <span className="po-pill-label">Period:</span>
                        {FILTER_OPTIONS.map(opt => {
                            const active = apiFilter === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        setApiFilter(opt.value);
                                        if (opt.value === 'total') setDateFilter('all');
                                        else if (opt.value === 'today') setDateFilter('today');
                                        else if (opt.value === 'weekly') setDateFilter('this_week');
                                        else if (opt.value === 'monthly') setDateFilter('this_month');
                                    }}
                                    className={`po-pill ${active ? 'po-pill-active' : ''}`}
                                >
                                    <span>{opt.icon}</span>
                                    {opt.label}
                                </button>
                            );
                        })}
                        {loading && (
                            <span className="po-loading-indicator">
                                <span className="po-spinner" />
                                Fetching...
                            </span>
                        )}
                    </div>

                    {/* Search + Date Filter */}
                    <div className="po-search-group">
                        <div className="po-search-wrapper">
                            <svg className="po-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name, reg no, date..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="po-search-input"
                            />
                            {searchTerm && (
                                <button className="po-search-clear" onClick={() => setSearchTerm('')}>✖</button>
                            )}
                        </div>

                        <div className="po-select-wrapper">
                            <svg className="po-select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <select
                                value={dateFilter}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setDateFilter(val as any);
                                    if (val === 'all') setApiFilter('total');
                                    else if (val === 'today') setApiFilter('today');
                                    else if (val === 'this_week') setApiFilter('weekly');
                                    else if (val === 'this_month') setApiFilter('monthly');
                                }}
                                className="po-select"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                            </select>
                            <svg className="po-select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* ── Card List ── */}
                <div className="po-list">
                    {loading ? (
                        [1, 2, 3, 4, 5].map((idx) => (
                            <div className="po-card po-card-skeleton" key={idx}>
                                <div className="po-skeleton" style={{ width: 140, height: 52, borderRadius: 12 }} />
                                <div className="po-skeleton-body">
                                    <div className="po-skeleton" style={{ width: '55%', height: 22 }} />
                                    <div className="po-skeleton" style={{ width: '80%', height: 15, marginTop: 6 }} />
                                </div>
                                <div className="po-card-right"></div>
                            </div>
                        ))
                    ) : error ? (
                        <div className="po-state-card">
                            <div className="po-state-icon">⚠️</div>
                            <p className="po-state-title">{error}</p>
                            <button
                                onClick={() => fetchPendingOutpasses(currentPage, apiFilter)}
                                className="po-retry-btn"
                            >
                                🔄 Try Again
                            </button>
                        </div>
                    ) : filteredPending.length === 0 ? (
                        <div className="po-state-card">
                            <div className="po-state-icon">✅</div>
                            <p className="po-state-title">All Clear!</p>
                            <p className="po-state-sub">No pending approvals for the selected filters.</p>
                        </div>
                    ) : (
                        filteredPending.map((item, index) => {
                            const studentObj = item.student || item.studentid;
                            const studentDetails = Array.isArray(studentObj) ? studentObj[0] : (typeof studentObj === 'object' ? studentObj : {});
                            const isEmergency = typeof item.outpasstype === 'string' && item.outpasstype?.toLowerCase() === 'emergency';
                            const outpassType = typeof item.outpasstype === 'string' ? item.outpasstype : 'General';

                            const getTypeColor = (type: string) => {
                                switch (type.toLowerCase()) {
                                    case 'emergency': return 'po-type-emergency';
                                    case 'home': return 'po-type-home';
                                    case 'outing': return 'po-type-outing';
                                    case 'od': return 'po-type-od';
                                    default: return 'po-type-general';
                                }
                            };

                            const dept = studentDetails?.department || '';
                            const year = studentDetails?.year || '';
                            const reason = item.reason || '';

                            return (
                                <div
                                    key={item._id}
                                    className={`po-card ${isEmergency ? 'po-card-emergency' : ''}`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    onClick={() => navigate(`/year-incharge/student/${item._id}`)}
                                >
                                    {isEmergency && <div className="po-emergency-pulse" />}

                                    {/* Left ── Registration Badge */}
                                    <div className="po-card-left">
                                        <div className="po-reg-badge">
                                            <span className="po-reg-label">Reg No.</span>
                                            <span className="po-reg-number">
                                                {typeof studentDetails?.registerNumber === 'string'
                                                    ? studentDetails.registerNumber
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Middle ── Student Info */}
                                    <div className="po-card-body">
                                        <div className="po-card-name-row">
                                            <span className="po-student-name">
                                                {typeof studentDetails?.name === 'string' ? studentDetails.name : 'Unknown'}
                                            </span>
                                            {isEmergency && (
                                                <span className="po-emergency-tag">🚨 EMERGENCY</span>
                                            )}
                                        </div>
                                        <div className="po-card-meta">
                                            {dept && <span className="po-meta-chip">🏫 {dept}</span>}
                                            {year && <span className="po-meta-chip">🎓 Year {year}</span>}
                                            <span className={`po-type-chip ${getTypeColor(outpassType)}`}>
                                                {outpassType}
                                            </span>
                                            <span className="po-meta-chip">
                                                📅 {new Date(item.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {reason && (
                                            <p className="po-card-reason">{reason.length > 90 ? reason.slice(0, 90) + '…' : reason}</p>
                                        )}
                                    </div>

                                    {/* Right ── Actions */}
                                    <div className="po-card-right">
                                        <span className="po-pending-badge">
                                            <span className="po-pending-dot" />
                                            Pending
                                        </span>
                                        {(item.proof || item.document || item.file) && (
                                            <button
                                                className="po-doc-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDocument((item.proof || item.document || item.file)!);
                                                }}
                                            >
                                                📄 Doc
                                            </button>
                                        )}
                                        <span className="po-view-arrow">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ── Pagination ── */}
                {pendingOutpasses.length > 0 && (
                    <div className="po-pagination">
                        <button
                            className="po-page-btn"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            « First
                        </button>
                        <button
                            className="po-page-btn"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            ‹ Prev
                        </button>

                        <div className="po-page-numbers">
                            {getPageNumbers().map((pNum, idx) => {
                                if (pNum === '...') {
                                    return <span key={`dots-${idx}`} className="po-page-dots">...</span>;
                                }
                                const isActive = String(currentPage) === String(pNum);
                                return (
                                    <button
                                        key={`p-${pNum}`}
                                        onClick={() => setCurrentPage(pNum as number)}
                                        className={`po-page-num ${isActive ? 'po-page-num-active' : ''}`}
                                    >
                                        {pNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            className="po-page-btn"
                            onClick={() => setCurrentPage(prev => isLastPage ? prev : prev + 1)}
                            disabled={isLastPage}
                        >
                            Next ›
                        </button>
                        <button
                            className="po-page-btn"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={isLastPage}
                        >
                            Last »
                        </button>
                    </div>
                )}

                {/* ── Document Modal ── */}
                {showDocumentModal && documentUrl && (
                    <div className="po-modal-overlay" onClick={() => setShowDocumentModal(false)}>
                        <div className="po-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="po-modal-header">
                                <div className="po-modal-title-group">
                                    <span className="po-modal-icon">📄</span>
                                    <h3 className="po-modal-title">Supporting Document</h3>
                                </div>
                                <button
                                    className="po-modal-close"
                                    onClick={() => setShowDocumentModal(false)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <div className="po-modal-body">
                                {documentType === 'pdf' ? (
                                    <iframe
                                        src={documentUrl}
                                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                                        title="Document Viewer"
                                    />
                                ) : (
                                    <img
                                        src={documentUrl}
                                        alt="Proof"
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }}
                                    />
                                )}
                            </div>
                            <div className="po-modal-footer">
                                <a
                                    href={documentUrl}
                                    download={`proof_document.${documentType === 'pdf' ? 'pdf' : 'jpg'}`}
                                    className="po-download-btn"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Download
                                </a>
                                <button className="po-modal-dismiss" onClick={() => setShowDocumentModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <style>{`
                /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                   PENDING OUTPASS â€” PROFESSIONAL THEME
                â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                .po-page-container {
                    min-height: 100vh;
                    background: linear-gradient(145deg, #eef2ff 0%, #e8f0fe 35%, #f3e8ff 70%, #fdf2f8 100%);
                    font-family: 'Inter', 'Segoe UI', sans-serif;
                }

                .po-content {
                    padding: 96px 32px 64px;
                    max-width: 1280px;
                    margin: 0 auto;
                    animation: poFadeUp 0.5s ease both;
                }

                @keyframes poFadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* â•â• Hero â•â• */
                .po-hero {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    margin-bottom: 32px;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .po-hero-left {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .po-back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    background: rgba(255,255,255,0.8);
                    border: 1.5px solid rgba(99,102,241,0.2);
                    color: #4f46e5;
                    font-size: 13px;
                    font-weight: 600;
                    padding: 8px 16px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    backdrop-filter: blur(8px);
                    width: fit-content;
                    letter-spacing: 0.1px;
                }

                .po-back-btn:hover {
                    background: #4f46e5;
                    color: white;
                    border-color: #4f46e5;
                    transform: translateX(-2px);
                    box-shadow: 0 4px 16px rgba(79,70,229,0.3);
                }

                .po-title-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(79,70,229,0.08);
                    border: 1px solid rgba(79,70,229,0.18);
                    color: #4f46e5;
                    font-size: 12px;
                    font-weight: 700;
                    padding: 5px 12px;
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    width: fit-content;
                }

                .po-title-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .po-title {
                    font-size: 2.4rem;
                    font-weight: 900;
                    background: linear-gradient(135deg, #0f172a 0%, #312e81 50%, #4f46e5 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 0;
                    letter-spacing: -1px;
                    line-height: 1.15;
                }

                .po-subtitle {
                    font-size: 14.5px;
                    color: #64748b;
                    margin: 0;
                    font-weight: 500;
                    max-width: 480px;
                }

                .po-hero-right {
                    display: flex;
                    gap: 14px;
                    align-items: flex-end;
                    flex-shrink: 0;
                }

                .po-hero-stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 16px 24px;
                    border-radius: 18px;
                    min-width: 80px;
                    backdrop-filter: blur(12px);
                }

                .po-hero-stat-pending {
                    background: linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.08));
                    border: 1.5px solid rgba(79,70,229,0.25);
                }

                .po-hero-stat-emergency {
                    background: linear-gradient(135deg, rgba(239,68,68,0.13), rgba(248,113,113,0.08));
                    border: 1.5px solid rgba(239,68,68,0.3);
                    animation: poPulse 2s ease infinite;
                }

                @keyframes poPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.2); }
                    50%       { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
                }

                .po-hero-stat-num {
                    font-size: 2rem;
                    font-weight: 900;
                    line-height: 1;
                    color: #4f46e5;
                    letter-spacing: -1px;
                }

                .po-hero-stat-emergency .po-hero-stat-num { color: #ef4444; }

                .po-hero-stat-label {
                    font-size: 11px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                    margin-top: 4px;
                    white-space: nowrap;
                }

                /* â•â• Stats Dashboard â•â• */
                .po-stats-dashboard {
                    display: grid;
                    grid-template-columns: 1fr 1.3fr;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .po-stats-card {
                    background: rgba(255,255,255,0.82);
                    backdrop-filter: blur(20px);
                    border: 1.5px solid rgba(255,255,255,0.95);
                    border-radius: 22px;
                    padding: 24px;
                    box-shadow: 0 6px 30px rgba(79,70,229,0.07), 0 1px 4px rgba(0,0,0,0.03);
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .po-stats-card-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .po-stats-card-icon-wrap {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .po-icon-wrap-blue {
                    background: linear-gradient(135deg, #4f46e5, #818cf8);
                    color: white;
                    box-shadow: 0 4px 14px rgba(79,70,229,0.35);
                }

                .po-icon-wrap-purple {
                    background: linear-gradient(135deg, #7c3aed, #a78bfa);
                    color: white;
                    box-shadow: 0 4px 14px rgba(124,58,237,0.35);
                }

                .po-stats-card-title {
                    font-size: 1rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.3px;
                }

                .po-stats-card-sub {
                    font-size: 0.78rem;
                    color: #94a3b8;
                    margin: 3px 0 0;
                    font-weight: 500;
                }

                .po-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }

                .po-stats-grid-4 {
                    grid-template-columns: repeat(4, 1fr);
                }

                .po-stat-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 16px 14px;
                    border-radius: 16px;
                    border: 1.5px solid;
                    cursor: default;
                    transition: all 0.22s ease;
                }

                .po-stat-item:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
                }

                .po-stat-val {
                    font-size: 1.65rem;
                    font-weight: 900;
                    line-height: 1;
                    letter-spacing: -1px;
                    display: block;
                }

                .po-stat-label {
                    font-size: 0.73rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: block;
                }

                .po-stat-skeleton {
                    display: inline-block;
                    width: 40px;
                    height: 28px;
                    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
                    background-size: 200% 100%;
                    animation: poShimmer 1.4s ease infinite;
                    border-radius: 6px;
                    vertical-align: middle;
                }

                /* Status stat colors */
                .po-stat-pending  { background: #fffbeb; border-color: #fde68a; }
                .po-stat-pending .po-stat-val   { color: #d97706; }
                .po-stat-pending .po-stat-label { color: #b45309; }

                .po-stat-approved { background: #f0fdf4; border-color: #bbf7d0; }
                .po-stat-approved .po-stat-val  { color: #16a34a; }
                .po-stat-approved .po-stat-label { color: #15803d; }

                .po-stat-rejected { background: #fff1f2; border-color: #fecdd3; }
                .po-stat-rejected .po-stat-val  { color: #dc2626; }
                .po-stat-rejected .po-stat-label { color: #b91c1c; }

                /* Type stat colors */
                .po-stat-home   { background: #eff6ff; border-color: #bfdbfe; }
                .po-stat-home .po-stat-val   { color: #1d4ed8; }
                .po-stat-home .po-stat-label { color: #1e40af; }


                .po-stat-emerg  { background: #fff1f2; border-color: #fecdd3; }
                .po-stat-emerg .po-stat-val  { color: #dc2626; }
                .po-stat-emerg .po-stat-label { color: #b91c1c; }

                .po-stat-od     { background: #faf5ff; border-color: #e9d5ff; }
                .po-stat-od .po-stat-val     { color: #6d28d9; }
                .po-stat-od .po-stat-label   { color: #5b21b6; }

                /* â•â• Filter Bar â•â• */
                .po-filter-bar {
                    background: rgba(255,255,255,0.82);
                    backdrop-filter: blur(20px);
                    border: 1.5px solid rgba(255,255,255,0.95);
                    border-radius: 22px;
                    padding: 20px 26px;
                    margin-bottom: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    box-shadow: 0 6px 30px rgba(79,70,229,0.07), 0 1px 4px rgba(0,0,0,0.03);
                }

                .po-pill-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .po-pill-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-right: 4px;
                }

                .po-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 8px 18px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    border: 1.5px solid #e2e8f0;
                    background: white;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .po-pill:hover:not(.po-pill-active) {
                    border-color: #a5b4fc;
                    color: #4f46e5;
                    background: #eef2ff;
                }

                .po-pill-active {
                    border-color: #4f46e5;
                    background: linear-gradient(135deg, #4f46e5, #6366f1);
                    color: white;
                    box-shadow: 0 4px 14px rgba(79,70,229,0.38);
                }

                .po-loading-indicator {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: 500;
                    margin-left: 4px;
                }

                .po-spinner {
                    display: inline-block;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 2px solid #e0e7ff;
                    border-top-color: #4f46e5;
                    animation: poSpin 0.7s linear infinite;
                }

                @keyframes poSpin { to { transform: rotate(360deg); } }

                .po-search-group {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .po-search-wrapper {
                    position: relative;
                    flex: 1;
                    min-width: 220px;
                }

                .po-search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    pointer-events: none;
                }

                .po-search-input {
                    width: 100%;
                    padding: 12px 40px 12px 44px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 14px;
                    font-size: 14px;
                    color: #1e293b;
                    background: #f8fafc;
                    outline: none;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    font-family: inherit;
                }

                .po-search-input:focus {
                    border-color: #6366f1;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
                }

                .po-search-clear {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 14px;
                    padding: 3px 5px;
                    border-radius: 5px;
                    transition: color 0.2s;
                }

                .po-search-clear:hover { color: #ef4444; }

                .po-select-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .po-select-icon {
                    position: absolute;
                    left: 13px;
                    color: #94a3b8;
                    pointer-events: none;
                    z-index: 1;
                }

                .po-select {
                    padding: 12px 36px 12px 36px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 14px;
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #1e293b;
                    background: #f8fafc;
                    outline: none;
                    cursor: pointer;
                    appearance: none;
                    min-width: 160px;
                    transition: all 0.2s ease;
                    font-family: inherit;
                }

                .po-select:focus {
                    border-color: #6366f1;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
                }

                .po-select-arrow {
                    position: absolute;
                    right: 12px;
                    color: #94a3b8;
                    pointer-events: none;
                }

                /* â•â• Card List â•â• */
                .po-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .po-card {
                    position: relative;
                    background: rgba(255,255,255,0.88);
                    backdrop-filter: blur(14px);
                    border: 1.5px solid rgba(255,255,255,0.95);
                    border-radius: 20px;
                    padding: 18px 22px;
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow: 0 2px 14px rgba(0,0,0,0.04);
                    overflow: hidden;
                    animation: poCardIn 0.45s ease both;
                }

                @keyframes poCardIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .po-card:hover {
                    border-color: #a5b4fc;
                    box-shadow: 0 10px 36px rgba(79,70,229,0.14), 0 2px 8px rgba(0,0,0,0.05);
                    transform: translateY(-2px);
                    background: white;
                }

                .po-card-emergency {
                    border-color: rgba(239,68,68,0.3);
                    background: rgba(255,247,247,0.92);
                    box-shadow: 0 4px 20px rgba(239,68,68,0.09);
                }

                .po-card-emergency:hover {
                    border-color: #f87171;
                    box-shadow: 0 10px 36px rgba(239,68,68,0.18);
                }

                .po-card-skeleton {
                    cursor: default;
                }

                .po-card-skeleton:hover {
                    transform: none;
                    border-color: rgba(255,255,255,0.95);
                    box-shadow: 0 2px 14px rgba(0,0,0,0.04);
                    background: rgba(255,255,255,0.88);
                }

                .po-skeleton {
                    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
                    background-size: 200% 100%;
                    animation: poShimmer 1.4s ease infinite;
                    border-radius: 8px;
                }

                @keyframes poShimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .po-skeleton-body { flex: 1; }

                /* Emergency Pulse */
                .po-emergency-pulse {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: 20px;
                    background: linear-gradient(90deg, rgba(239,68,68,0.06), transparent);
                    pointer-events: none;
                    animation: poGlow 2s ease infinite;
                }

                @keyframes poGlow {
                    0%, 100% { opacity: 0.5; }
                    50%       { opacity: 1; }
                }

                /* Card Sections */
                .po-card-left { flex-shrink: 0; }

                .po-reg-badge {
                    background: linear-gradient(135deg, #1e1b4b, #4f46e5);
                    color: white;
                    padding: 10px 18px;
                    border-radius: 14px;
                    min-width: 140px;
                    text-align: center;
                    box-shadow: 0 4px 16px rgba(79,70,229,0.3);
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .po-reg-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    opacity: 0.65;
                    text-transform: uppercase;
                    letter-spacing: 0.7px;
                }

                .po-reg-number {
                    font-weight: 800;
                    font-size: 0.9rem;
                    letter-spacing: 0.3px;
                    white-space: nowrap;
                }

                .po-card-body {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .po-card-name-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .po-student-name {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.2px;
                }

                .po-emergency-tag {
                    background: linear-gradient(135deg, #dc2626, #ef4444);
                    color: white;
                    font-size: 0.63rem;
                    font-weight: 800;
                    padding: 3px 9px;
                    border-radius: 6px;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    animation: poTagPulse 1.5s ease infinite;
                    flex-shrink: 0;
                }

                @keyframes poTagPulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.75; }
                }

                .po-card-meta {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    flex-wrap: wrap;
                }

                .po-meta-chip {
                    font-size: 0.78rem;
                    color: #475569;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 3px 10px;
                    border-radius: 8px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .po-type-chip {
                    font-size: 0.76rem;
                    font-weight: 700;
                    padding: 3px 10px;
                    border-radius: 8px;
                    text-transform: capitalize;
                    white-space: nowrap;
                }

                .po-type-emergency { background: #fee2e2; color: #b91c1c; }
                .po-type-home      { background: #dcfce7; color: #15803d; }
                .po-type-outing    { background: #dbeafe; color: #1e40af; }
                .po-type-od        { background: #ede9fe; color: #5b21b6; }
                .po-type-general   { background: #fef3c7; color: #92400e; }

                .po-card-reason {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin: 0;
                    font-style: italic;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Card Right */
                .po-card-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-shrink: 0;
                    margin-left: auto;
                }

                .po-pending-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 7px 14px;
                    background: #fffbeb;
                    border: 1.5px solid #f59e0b;
                    color: #b45309;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 0.82rem;
                    white-space: nowrap;
                }

                .po-pending-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #f59e0b;
                    animation: poBlip 1.3s ease infinite;
                    flex-shrink: 0;
                }

                @keyframes poBlip {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.4; transform: scale(0.6); }
                }

                .po-doc-btn {
                    padding: 8px 14px;
                    background: #eef2ff;
                    border: 1.5px solid #a5b4fc;
                    border-radius: 10px;
                    color: #4f46e5;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                    font-family: inherit;
                }

                .po-doc-btn:hover {
                    background: #4f46e5;
                    color: white;
                    border-color: #4f46e5;
                    box-shadow: 0 4px 12px rgba(79,70,229,0.3);
                }

                .po-view-arrow {
                    color: #a5b4fc;
                    display: flex;
                    align-items: center;
                    transition: transform 0.2s;
                    flex-shrink: 0;
                }

                .po-card:hover .po-view-arrow { transform: translateX(4px); color: #4f46e5; }

                /* â•â• State Cards â•â• */
                .po-state-card {
                    background: rgba(255,255,255,0.82);
                    backdrop-filter: blur(14px);
                    border: 1.5px solid rgba(255,255,255,0.95);
                    border-radius: 22px;
                    padding: 72px 48px;
                    text-align: center;
                    box-shadow: 0 6px 30px rgba(0,0,0,0.05);
                }

                .po-state-icon {
                    font-size: 3.5rem;
                    display: block;
                    margin-bottom: 16px;
                }

                .po-state-title {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0 0 8px;
                    letter-spacing: -0.3px;
                }

                .po-state-sub {
                    font-size: 0.9rem;
                    color: #64748b;
                    margin: 0;
                    font-weight: 500;
                }

                .po-retry-btn {
                    margin-top: 20px;
                    padding: 11px 28px;
                    background: linear-gradient(135deg, #4f46e5, #6366f1);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 16px rgba(79,70,229,0.35);
                    font-family: inherit;
                }

                .po-retry-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(79,70,229,0.45);
                }

                /* â•â• Pagination â•â• */
                .po-pagination {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 32px;
                    padding-bottom: 32px;
                    flex-wrap: wrap;
                }

                .po-page-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 9px 20px;
                    border-radius: 12px;
                    border: 1.5px solid #e2e8f0;
                    background: rgba(255,255,255,0.85);
                    backdrop-filter: blur(8px);
                    color: #475569;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                }

                .po-page-btn:disabled {
                    opacity: 0.38;
                    cursor: not-allowed;
                }

                .po-page-btn:not(:disabled):hover {
                    background: #4f46e5;
                    color: white;
                    border-color: #4f46e5;
                    box-shadow: 0 4px 14px rgba(79,70,229,0.3);
                }

                .po-page-numbers {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .po-page-dots {
                    color: #94a3b8;
                    font-weight: 700;
                    padding: 0 4px;
                    letter-spacing: 2px;
                }

                .po-page-num {
                    width: 38px;
                    height: 38px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    border: 1.5px solid #e2e8f0;
                    background: rgba(255,255,255,0.85);
                    color: #64748b;
                    font-weight: 700;
                    font-size: 0.86rem;
                    cursor: pointer;
                    transition: all 0.18s ease;
                    font-family: inherit;
                }

                .po-page-num:hover:not(.po-page-num-active) {
                    border-color: #a5b4fc;
                    color: #4f46e5;
                    background: #eef2ff;
                }

                .po-page-num-active {
                    background: linear-gradient(135deg, #4f46e5, #6366f1);
                    color: white;
                    border-color: transparent;
                    box-shadow: 0 4px 14px rgba(79,70,229,0.38);
                }

                /* â•â• Document Modal â•â• */
                .po-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15,23,42,0.72);
                    backdrop-filter: blur(8px);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: poFadeIn 0.2s ease;
                }

                @keyframes poFadeIn { from { opacity: 0; } to { opacity: 1; } }

                .po-modal {
                    background: white;
                    border-radius: 22px;
                    width: 100%;
                    max-width: 960px;
                    height: 88vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 32px 80px rgba(0,0,0,0.38);
                    animation: poModalIn 0.25s ease;
                    overflow: hidden;
                }

                @keyframes poModalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(12px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                .po-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 26px;
                    border-bottom: 1px solid #f1f5f9;
                    background: linear-gradient(135deg, #f8faff, #eef2ff);
                }

                .po-modal-title-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .po-modal-icon { font-size: 1.3rem; }

                .po-modal-title {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.3px;
                }

                .po-modal-close {
                    background: #f1f5f9;
                    border: none;
                    width: 38px;
                    height: 38px;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    transition: all 0.2s;
                }

                .po-modal-close:hover {
                    background: #fee2e2;
                    color: #ef4444;
                }

                .po-modal-body {
                    flex: 1;
                    overflow: hidden;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 14px;
                }

                .po-modal-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 16px 26px;
                    border-top: 1px solid #f1f5f9;
                    background: #fafafa;
                }

                .po-download-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 24px;
                    background: linear-gradient(135deg, #4f46e5, #6366f1);
                    color: white;
                    border-radius: 12px;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 700;
                    transition: all 0.2s;
                    box-shadow: 0 4px 16px rgba(79,70,229,0.3);
                    font-family: inherit;
                }

                .po-download-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 22px rgba(79,70,229,0.42);
                }

                .po-modal-dismiss {
                    padding: 10px 24px;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 12px;
                    color: #475569;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    font-family: inherit;
                }

                .po-modal-dismiss:hover { background: #e2e8f0; }

                /* â•â• Responsive â•â• */
                @media (max-width: 1024px) {
                    .po-content {
                        padding: 96px 24px 48px;
                    }
                    .po-stats-grid-4 {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .po-content {
                        padding: 80px 16px 40px;
                    }

                    .po-title { font-size: 1.8rem; }

                    .po-hero {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 14px;
                    }

                    .po-hero-right {
                        align-self: flex-start;
                    }

                    .po-stats-dashboard {
                        grid-template-columns: 1fr;
                    }

                    .po-stats-grid { grid-template-columns: repeat(3, 1fr); }
                    .po-stats-grid-4 { grid-template-columns: repeat(2, 1fr); }

                    .po-card {
                        flex-wrap: wrap;
                        gap: 12px;
                        padding: 16px;
                    }

                    .po-card-left { order: 0; }
                    .po-card-body { order: 1; flex-basis: calc(100% - 160px); }
                    .po-card-right { order: 2; width: 100%; justify-content: flex-start; margin-left: 0; }

                    .po-reg-badge { min-width: 120px; }

                    .po-search-group { flex-direction: column; }
                    .po-select { width: 100%; min-width: 0; }

                    .po-filter-bar { padding: 16px; }

                    .po-modal { height: 95vh; border-radius: 16px; }

                    .po-pagination { gap: 6px; }
                    .po-page-btn { padding: 8px 14px; font-size: 12px; }
                }

                @media (max-width: 480px) {
                    .po-stats-grid { grid-template-columns: repeat(3, 1fr); }
                    .po-stat-val { font-size: 1.3rem; }
                }
            `}</style>
        </div>
    );
};

export default YearInchargePendingOutpass;

