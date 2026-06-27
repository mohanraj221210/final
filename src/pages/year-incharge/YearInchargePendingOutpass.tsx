import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import YearInchargeNav from "../../components/YearInchargeNav";
import { YearInchargeService } from "../../services/yearInchargeService";

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
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');
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

    // Re-fetch when page changes
    useEffect(() => {
        fetchPendingOutpasses(currentPage, apiFilter, searchTerm);
    }, [currentPage]);

    // Re-fetch when filters change — reset to page 1
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }

        const handler = setTimeout(() => {
            setCurrentPage(1);
            fetchPendingOutpasses(1, apiFilter, searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [apiFilter, searchTerm]);

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
            const result = await YearInchargeService.getPendingOutpasses(page, 10, appliedDate, search);

            // Sort Emergency first
            const sorted = result.data.sort((a: any, b: any) => {
                const aType = String(a.outpasstype || '').toLowerCase();
                const bType = String(b.outpasstype || '').toLowerCase();
                if (aType === 'emergency' && bType !== 'emergency') return -1;
                if (aType !== 'emergency' && bType === 'emergency') return 1;
                return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
            });

            setPendingOutpasses(sorted);
            setTotalPages(result.totalPages);
            setIsLastPage(result.isLast ?? (sorted.length < 10));
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
        const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
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

        let matchesDate = true;
        if (dateFilter !== 'all') {
            const appliedDate = new Date(item.fromDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dateFilter === 'today') matchesDate = appliedDate >= today;
            else if (dateFilter === 'yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                matchesDate = appliedDate >= yesterday && appliedDate < today;
            }
            else if (dateFilter === 'this_week') {
                const thisWeek = new Date(today);
                thisWeek.setDate(today.getDate() - today.getDay());
                matchesDate = appliedDate >= thisWeek;
            }
            else if (dateFilter === 'this_month') {
                const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                matchesDate = appliedDate >= thisMonth;
            }
        }
        return matchesSearch && matchesDate;
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
                            Back
                        </button>
                        <div className="po-title-group">
                            <h1 className="po-title">Pending Approvals</h1>
                            <p className="po-subtitle">Review and act on student outpass requests</p>
                        </div>
                    </div>
                    <div className="po-hero-badges">
                        {!loading && (
                            <>
                                <div className="po-count-badge po-count-total">
                                    <span className="po-count-num">{filteredPending.length}</span>
                                    <span className="po-count-label">Pending</span>
                                </div>
                                {emergencyCount > 0 && (
                                    <div className="po-count-badge po-count-emergency">
                                        <span className="po-count-num">{emergencyCount}</span>
                                        <span className="po-count-label">Emergency</span>
                                    </div>
                                )}
                            </>
                        )}
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
                                    onClick={() => setApiFilter(opt.value)}
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
                                <button className="po-search-clear" onClick={() => setSearchTerm('')}>✕</button>
                            )}
                        </div>

                        <div className="po-select-wrapper">
                            <svg className="po-select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value as any)}
                                className="po-select"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
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
                        [1, 2, 3, 4].map((idx) => (
                            <div className="po-card po-card-skeleton" key={idx}>
                                <div className="po-skeleton po-skeleton-reg" />
                                <div className="po-skeleton-body">
                                    <div className="po-skeleton po-skeleton-name" />
                                    <div className="po-skeleton po-skeleton-meta" />
                                </div>
                                <div className="po-skeleton po-skeleton-badge" />
                            </div>
                        ))
                    ) : error ? (
                        <div className="po-state-card">
                            <div className="po-state-icon po-state-error">⚠️</div>
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

                            return (
                                <div
                                    key={item._id}
                                    className={`po-card ${isEmergency ? 'po-card-emergency' : ''}`}
                                    style={{ animationDelay: `${index * 60}ms` }}
                                    onClick={() => navigate(`/year-incharge/student/${item._id}`)}
                                >
                                    {isEmergency && <div className="po-emergency-pulse" />}

                                    <div className="po-card-left">
                                        <div className="po-reg-badge">
                                            {typeof studentDetails?.registerNumber === 'string'
                                                ? studentDetails.registerNumber
                                                : 'N/A'}
                                        </div>
                                    </div>

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
                                            <span className="po-meta-chip">
                                                🎓 Year {typeof studentDetails?.year === 'string' ? studentDetails.year : 'N/A'}
                                            </span>
                                            <span className={`po-type-chip ${getTypeColor(outpassType)}`}>
                                                {outpassType}
                                            </span>
                                            <span className="po-meta-chip">
                                                📅 {new Date(item.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

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

                {pendingOutpasses.length > 0 && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px', alignItems: 'center', paddingBottom: '20px', flexWrap: 'wrap' }}>
                        {/* First */}
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f1f5f9' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#475569' }}
                        >
                            « First
                        </button>

                        {/* Previous */}
                        <button
                            className="po-page-btn"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            &lt; Prev
                        </button>

                        {/* Page Numbers */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getPageNumbers().map((pNum, idx) => {
                                if (pNum === '...') {
                                    return <span key={`dots-${idx}`} style={{ color: '#94a3b8', fontWeight: 700, padding: '0 4px' }}>...</span>;
                                }
                                const isActive = String(currentPage) === String(pNum);
                                return (
                                    <button
                                        key={`p-${pNum}`}
                                        onClick={() => setCurrentPage(pNum as number)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            background: isActive ? '#3b82f6' : 'white',
                                            color: isActive ? 'white' : '#64748b',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            boxShadow: isActive ? '0 4px 10px rgba(59, 130, 246, 0.25)' : 'none'
                                        }}
                                    >
                                        {pNum}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || isLastPage}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: (currentPage === totalPages || isLastPage) ? '#f1f5f9' : 'white', cursor: (currentPage === totalPages || isLastPage) ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#475569' }}
                        >
                            Next
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>

                        {/* Last */}
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages || isLastPage}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: (currentPage === totalPages || isLastPage) ? '#f1f5f9' : 'white', cursor: (currentPage === totalPages || isLastPage) ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#475569' }}
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
                /* ═══════════════════════════════════════
                   PENDING OUTPASS — PREMIUM THEME
                ═══════════════════════════════════════ */

                .po-page-container {
                    min-height: 100vh;
                    background: linear-gradient(145deg, #f0f4ff 0%, #e8efff 40%, #f5f0ff 100%);
                    font-family: 'Inter', 'Segoe UI', sans-serif;
                }

                .po-content {
                    padding: 100px 40px 48px;
                    max-width: 1100px;
                    margin: 0 auto;
                    animation: poFadeUp 0.5s ease both;
                }

                @keyframes poFadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Hero Header ── */
                .po-hero {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 28px;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .po-hero-left {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .po-back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255,255,255,0.7);
                    border: 1px solid rgba(0,71,171,0.15);
                    color: #475569;
                    font-size: 13px;
                    font-weight: 600;
                    padding: 7px 14px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    backdrop-filter: blur(8px);
                    width: fit-content;
                }

                .po-back-btn:hover {
                    background: #0047AB;
                    color: white;
                    border-color: #0047AB;
                    transform: translateX(-3px);
                }

                .po-title-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .po-title {
                    font-size: 2rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #0a1628 0%, #0047AB 60%, #3b82f6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 0;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                }

                .po-subtitle {
                    font-size: 14px;
                    color: #64748b;
                    margin: 0;
                    font-weight: 500;
                }

                /* ── Count Badges ── */
                .po-hero-badges {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                    margin-top: 4px;
                }

                .po-count-badge {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 12px 20px;
                    border-radius: 16px;
                    min-width: 72px;
                    backdrop-filter: blur(12px);
                }

                .po-count-total {
                    background: linear-gradient(135deg, rgba(0,71,171,0.12), rgba(59,130,246,0.12));
                    border: 1.5px solid rgba(0,71,171,0.25);
                }

                .po-count-emergency {
                    background: linear-gradient(135deg, rgba(239,68,68,0.12), rgba(248,113,113,0.12));
                    border: 1.5px solid rgba(239,68,68,0.3);
                    animation: poPulse 2s ease infinite;
                }

                @keyframes poPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.2); }
                    50%       { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
                }

                .po-count-num {
                    font-size: 1.8rem;
                    font-weight: 800;
                    line-height: 1;
                    color: #0047AB;
                }

                .po-count-emergency .po-count-num {
                    color: #ef4444;
                }

                .po-count-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-top: 3px;
                }

                /* ── Filter Bar ── */
                .po-filter-bar {
                    background: rgba(255,255,255,0.75);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.9);
                    border-radius: 20px;
                    padding: 18px 24px;
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    box-shadow: 0 4px 24px rgba(0,71,171,0.08), 0 1px 4px rgba(0,0,0,0.04);
                }

                /* Period Pills */
                .po-pill-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .po-pill-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    margin-right: 4px;
                }

                .po-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 7px 16px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    border: 2px solid #e2e8f0;
                    background: white;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .po-pill:hover:not(.po-pill-active) {
                    border-color: #93c5fd;
                    color: #1e40af;
                    background: #eff6ff;
                }

                .po-pill-active {
                    border-color: #0047AB;
                    background: linear-gradient(135deg, #0047AB, #1d4ed8);
                    color: white;
                    box-shadow: 0 4px 14px rgba(0,71,171,0.35);
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
                    border: 2px solid #dbeafe;
                    border-top-color: #0047AB;
                    animation: poSpin 0.7s linear infinite;
                }

                @keyframes poSpin { to { transform: rotate(360deg); } }

                /* Search + Date Filter Row */
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
                    padding: 11px 38px 11px 42px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 14px;
                    color: #1e293b;
                    background: #f8fafc;
                    outline: none;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }

                .po-search-input:focus {
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
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
                    font-size: 13px;
                    padding: 2px 4px;
                    border-radius: 4px;
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
                    left: 12px;
                    color: #94a3b8;
                    pointer-events: none;
                    z-index: 1;
                }

                .po-select {
                    padding: 11px 36px 11px 34px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e293b;
                    background: #f8fafc;
                    outline: none;
                    cursor: pointer;
                    appearance: none;
                    min-width: 155px;
                    transition: all 0.2s ease;
                }

                .po-select:focus {
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
                }

                .po-select-arrow {
                    position: absolute;
                    right: 12px;
                    color: #94a3b8;
                    pointer-events: none;
                }

                /* ── Cards List ── */
                .po-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .po-card {
                    position: relative;
                    background: rgba(255,255,255,0.85);
                    backdrop-filter: blur(12px);
                    border: 1.5px solid rgba(255,255,255,0.9);
                    border-radius: 18px;
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
                    overflow: hidden;
                    animation: poCardIn 0.4s ease both;
                }

                @keyframes poCardIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .po-card:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 8px 32px rgba(0,71,171,0.14), 0 2px 8px rgba(0,0,0,0.06);
                    transform: translateY(-2px) translateX(4px);
                    background: white;
                }

                .po-card-emergency {
                    border-color: rgba(239,68,68,0.35);
                    background: rgba(255,245,245,0.9);
                    box-shadow: 0 4px 20px rgba(239,68,68,0.1);
                }

                .po-card-emergency:hover {
                    border-color: #ef4444;
                    box-shadow: 0 8px 32px rgba(239,68,68,0.18);
                }

                /* Skeleton Cards */
                .po-card-skeleton {
                    cursor: default;
                    animation: poCardIn 0.4s ease both !important;
                }

                .po-card-skeleton:hover {
                    transform: none;
                    border-color: rgba(255,255,255,0.9);
                    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
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

                .po-skeleton-reg   { width: 120px; height: 44px; border-radius: 10px; flex-shrink: 0; }
                .po-skeleton-body  { flex: 1; display: flex; flex-direction: column; gap: 8px; }
                .po-skeleton-name  { width: 60%; height: 20px; }
                .po-skeleton-meta  { width: 80%; height: 14px; }
                .po-skeleton-badge { width: 80px; height: 28px; border-radius: 14px; flex-shrink: 0; }

                /* Emergency Pulse Glow */
                .po-emergency-pulse {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: 18px;
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
                    background: linear-gradient(135deg, #0a1f5c, #0047AB);
                    color: white;
                    padding: 10px 16px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    min-width: 130px;
                    text-align: center;
                    box-shadow: 0 4px 14px rgba(0,71,171,0.28);
                    letter-spacing: 0.3px;
                    white-space: nowrap;
                }

                .po-card-body {
                    flex: 1;
                    min-width: 0;
                }

                .po-card-name-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-bottom: 8px;
                }

                .po-student-name {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #0f172a;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .po-emergency-tag {
                    background: linear-gradient(135deg, #dc2626, #ef4444);
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 3px 8px;
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
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .po-meta-chip {
                    font-size: 0.8rem;
                    color: #475569;
                    background: #f1f5f9;
                    padding: 3px 10px;
                    border-radius: 8px;
                    font-weight: 500;
                }

                .po-type-chip {
                    font-size: 0.78rem;
                    font-weight: 700;
                    padding: 3px 10px;
                    border-radius: 8px;
                    text-transform: capitalize;
                }

                .po-type-emergency { background: #fee2e2; color: #b91c1c; }
                .po-type-home      { background: #d1fae5; color: #065f46; }
                .po-type-outing    { background: #dbeafe; color: #1e40af; }
                .po-type-od        { background: #ede9fe; color: #5b21b6; }
                .po-type-general   { background: #fef3c7; color: #92400e; }

                /* Card Right */
                .po-card-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-shrink: 0;
                    margin-left: auto;
                }

                .po-pending-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    background: #fef3c7;
                    border: 1.5px solid #f59e0b;
                    color: #b45309;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 0.82rem;
                }

                .po-pending-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #f59e0b;
                    animation: poBlip 1.3s ease infinite;
                }

                @keyframes poBlip {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.5; transform: scale(0.7); }
                }

                .po-doc-btn {
                    padding: 7px 13px;
                    background: #eff6ff;
                    border: 1.5px solid #93c5fd;
                    border-radius: 9px;
                    color: #1d4ed8;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .po-doc-btn:hover {
                    background: #1d4ed8;
                    color: white;
                    border-color: #1d4ed8;
                }

                .po-view-arrow {
                    color: #3b82f6;
                    display: flex;
                    align-items: center;
                    transition: transform 0.2s;
                }

                .po-card:hover .po-view-arrow {
                    transform: translateX(4px);
                }

                /* ── State Cards (empty / error) ── */
                .po-state-card {
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(12px);
                    border: 1.5px solid rgba(255,255,255,0.9);
                    border-radius: 20px;
                    padding: 60px 40px;
                    text-align: center;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
                }

                .po-state-icon {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: 14px;
                }

                .po-state-error { }

                .po-state-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 6px;
                }

                .po-state-sub {
                    font-size: 0.9rem;
                    color: #64748b;
                    margin: 0;
                }

                .po-retry-btn {
                    margin-top: 18px;
                    padding: 10px 24px;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 14px rgba(0,71,171,0.3);
                }

                .po-retry-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,71,171,0.4);
                }

                /* ── Pagination ── */
                .po-pagination {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 32px;
                    padding-bottom: 24px;
                }

                .po-page-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 22px;
                    border-radius: 12px;
                    border: 1.5px solid #e2e8f0;
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(8px);
                    color: #475569;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .po-page-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .po-page-btn:not(:disabled):hover {
                    background: #0047AB;
                    color: white;
                    border-color: #0047AB;
                    box-shadow: 0 4px 14px rgba(0,71,171,0.25);
                }

                .po-page-indicator {
                    font-size: 14px;
                    font-weight: 700;
                    color: #475569;
                    background: rgba(255,255,255,0.8);
                    padding: 10px 18px;
                    border-radius: 12px;
                    border: 1.5px solid #e2e8f0;
                }

                /* ── Document Modal ── */
                .po-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(10,20,50,0.7);
                    backdrop-filter: blur(6px);
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
                    border-radius: 20px;
                    width: 100%;
                    max-width: 960px;
                    height: 88vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 32px 80px rgba(0,0,0,0.35);
                    animation: poModalIn 0.25s ease;
                    overflow: hidden;
                }

                @keyframes poModalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                .po-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid #f1f5f9;
                    background: linear-gradient(135deg, #f8faff, #f0f6ff);
                }

                .po-modal-title-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .po-modal-icon { font-size: 1.3rem; }

                .po-modal-title {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .po-modal-close {
                    background: #f1f5f9;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
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
                    padding: 12px;
                }

                .po-modal-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 16px 24px;
                    border-top: 1px solid #f1f5f9;
                    background: #fafafa;
                }

                .po-download-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 10px 22px;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    color: white;
                    border-radius: 10px;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 700;
                    transition: all 0.2s;
                    box-shadow: 0 4px 14px rgba(0,71,171,0.25);
                }

                .po-download-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(0,71,171,0.35);
                }

                .po-modal-dismiss {
                    padding: 10px 22px;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 10px;
                    color: #475569;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .po-modal-dismiss:hover { background: #e2e8f0; }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .po-content {
                        padding: 80px 16px 32px;
                    }

                    .po-title { font-size: 1.5rem; }

                    .po-hero {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .po-hero-badges {
                        align-self: flex-start;
                    }

                    .po-card {
                        flex-wrap: wrap;
                        gap: 14px;
                        padding: 16px;
                    }

                    .po-card-left { order: 0; }
                    .po-card-body { order: 1; flex-basis: calc(100% - 150px); }
                    .po-card-right { order: 2; width: 100%; justify-content: space-between; margin-left: 0; }

                    .po-reg-badge { min-width: 110px; font-size: 0.82rem; }

                    .po-search-group { flex-direction: column; }
                    .po-select { width: 100%; min-width: 0; }

                    .po-filter-bar { padding: 14px 16px; }

                    .po-modal { height: 95vh; border-radius: 12px; }
                }
            `}</style>
        </div>
    );
};

export default YearInchargePendingOutpass;
