import React, { useState, useEffect, useRef } from 'react';
import YearInchargeNav from '../../components/YearInchargeNav';
import { YearInchargeService } from '../../services/yearInchargeService';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

type ApiFilter = 'total' | 'today' | 'weekly' | 'monthly';
const FILTER_OPTIONS: { value: ApiFilter; label: string; icon: string }[] = [
    { value: 'total', label: 'Total', icon: '📊' },
    { value: 'today', label: 'Today', icon: '☀️' },
    { value: 'weekly', label: 'Weekly', icon: '📅' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
];

const YearInchargeOutpassList: React.FC = () => {
    const [outpasses, setOutpasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected' | 'pending'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'Home' | 'Outing' | 'Emergency' | 'OD'>('all');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [documentType, setDocumentType] = useState<'image' | 'pdf'>('image');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [apiFilter, setApiFilter] = useState<ApiFilter>('total');
    const [stats, setStats] = useState<{ approved: number; pending: number; rejected: number }>({ approved: 0, pending: 0, rejected: 0 });

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

    const navigate = useNavigate();

    const fetchStats = async (appliedDate: string = apiFilter) => {
        try {
            const statsResult = await YearInchargeService.getStats(appliedDate);
            if (statsResult) {
                setStats({
                    approved: statsResult.approved,
                    pending: statsResult.pending,
                    rejected: statsResult.rejected
                });
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    const fetchOutpasses = async (
        page: number = currentPage,
        appliedDate: string = apiFilter,
        status: string = statusFilter,
        search: string = searchTerm,
        filter: string = typeFilter
    ) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/year-incharge-login');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await YearInchargeService.getOutpasses(page, appliedDate, status, search, filter);
            const sortedList = result.data.sort((a: any, b: any) => {
                const isAEmergency = a.outpasstype?.toLowerCase() === 'emergency';
                const isBEmergency = b.outpasstype?.toLowerCase() === 'emergency';
                if (isAEmergency && !isBEmergency) return -1;
                if (!isAEmergency && isBEmergency) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setOutpasses(sortedList);
            setTotalPages(result.totalPages);
            setIsLastPage(result.isLast ?? (sortedList.length < 10));
        } catch (err: any) {
            console.error('Error fetching outpasses:', err);
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                navigate('/year-incharge-login');
                return;
            }
            if (err?.response?.status === 404) {
                setOutpasses([]);
                setTotalPages(1);
                setIsLastPage(true);
                setError(null);
                return;
            }
            setError('Failed to fetch outpass list');
            toast.error('Failed to fetch outpass list');
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch data on page change
    useEffect(() => {
        fetchOutpasses(currentPage, apiFilter, statusFilter, searchTerm, typeFilter);
    }, [currentPage]);

    // Re-fetch both data and stats when filter/search changes
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const handler = setTimeout(() => {
            setCurrentPage(1);
            fetchOutpasses(1, apiFilter, statusFilter, searchTerm, typeFilter);
            fetchStats(apiFilter);
        }, 500);
        return () => clearTimeout(handler);
    }, [apiFilter, statusFilter, searchTerm, typeFilter]);

    // Initial stats fetch
    useEffect(() => {
        fetchStats(apiFilter);
    }, []);

    const handleViewDocument = (url: string | null) => {
        if (!url) return;
        const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
        setDocumentUrl(fullUrl);
        setDocumentType(url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image');
        setShowDocumentModal(true);
    };

    const getStatusStyle = (status: string): React.CSSProperties => {
        switch (status) {
            case 'approved': return { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
            case 'rejected': return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
            default: return { background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' };
        }
    };

    const getTypeStyle = (type: string): React.CSSProperties => {
        switch ((type || '').toLowerCase()) {
            case 'emergency': return { background: '#fee2e2', color: '#b91c1c' };
            case 'home': return { background: '#d1fae5', color: '#065f46' };
            case 'outing': return { background: '#dbeafe', color: '#1e40af' };
            case 'od': return { background: '#ede9fe', color: '#5b21b6' };
            default: return { background: '#fef3c7', color: '#92400e' };
        }
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const filteredOutpasses = outpasses.filter(outpass => {
        const studentObj = outpass.student || outpass.studentid;
        const stu = Array.isArray(studentObj) ? studentObj[0] : (typeof studentObj === 'object' ? studentObj : undefined);
        const yiStatus = outpass.yearincharge?.status || 'pending';
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch = term === '' ||
            (stu?.name?.toLowerCase().includes(term) || false) ||
            (stu?.registerNumber?.toLowerCase().includes(term) || false) ||
            (stu?.department?.toLowerCase().includes(term) || false) ||
            (outpass.outpasstype?.toLowerCase().includes(term) || false) ||
            (outpass.reason?.toLowerCase().includes(term) || false);
        const matchesStatus = statusFilter === 'all' || outpass.status === statusFilter || yiStatus === statusFilter;
        const matchesType = typeFilter === 'all' || outpass.outpasstype === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const toggleExpand = (id: string) => setExpandedRow(expandedRow === id ? null : id);

    const approvedCount = stats.approved;
    const rejectedCount = stats.rejected;
    const pendingCount = stats.pending;

    return (
        <div className="ol-page-container">
            <ToastContainer position="bottom-right" />
            <YearInchargeNav />

            <div className="ol-content">

                {/* ── Hero Header ── */}
                <div className="ol-hero">
                    <div className="ol-hero-left">
                        <button className="ol-back-btn" onClick={() => navigate('/year-incharge-dashboard')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Back
                        </button>
                        <div>
                            <h1 className="ol-title">All Outpass Records</h1>
                            <p className="ol-subtitle">View and manage the full history of student outpasses</p>
                        </div>
                    </div>
                    {!loading && (
                        <div className="ol-stat-badges">
                            <div className="ol-stat-badge ol-stat-approved">
                                <span className="ol-stat-num">{approvedCount}</span>
                                <span className="ol-stat-label">Approved</span>
                            </div>
                            <div className="ol-stat-badge ol-stat-pending">
                                <span className="ol-stat-num">{pendingCount}</span>
                                <span className="ol-stat-label">Pending</span>
                            </div>
                            <div className="ol-stat-badge ol-stat-rejected">
                                <span className="ol-stat-num">{rejectedCount}</span>
                                <span className="ol-stat-label">Rejected</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Filter Bar ── */}
                <div className="ol-filter-bar">
                    {/* Period Pills */}
                    <div className="ol-pill-row">
                        <span className="ol-pill-label">Period:</span>
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
                                    className={`ol-pill ${active ? 'ol-pill-active' : ''}`}
                                >
                                    <span>{opt.icon}</span>
                                    {opt.label}
                                </button>
                            );
                        })}
                        {loading && (
                            <span className="ol-loading-indicator">
                                <span className="ol-spinner" />
                                Fetching...
                            </span>
                        )}
                    </div>

                    {/* Search + Selects */}
                    <div className="ol-controls-row">
                        <div className="ol-search-wrapper">
                            <svg className="ol-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name, reg no, dept, type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="ol-search-input"
                            />
                            {searchTerm && (
                                <button className="ol-search-clear" onClick={() => setSearchTerm('')}>✕</button>
                            )}
                        </div>

                        <div className="ol-selects-group">
                            <div className="ol-select-wrapper">
                                <svg className="ol-select-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <select 
                                    className="ol-select" 
                                    value={dateFilter} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setDateFilter(val as any);
                                        if (val === 'all') setApiFilter('total');
                                        else if (val === 'today') setApiFilter('today');
                                        else if (val === 'this_week') setApiFilter('weekly');
                                        else if (val === 'this_month') setApiFilter('monthly');
                                    }}
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="this_week">This Week</option>
                                    <option value="this_month">This Month</option>
                                </select>
                                <svg className="ol-select-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>

                            <div className="ol-select-wrapper">
                                <svg className="ol-select-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                                </svg>
                                <select className="ol-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                                    <option value="all">All Status</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <svg className="ol-select-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>

                            <div className="ol-select-wrapper">
                                <svg className="ol-select-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
                                </svg>
                                <select className="ol-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
                                    <option value="all">All Types</option>
                                    <option value="Home">Home</option>
                                    <option value="Outing">Outing</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="OD">OD</option>
                                </select>
                                <svg className="ol-select-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <p className="ol-results-count">
                        Showing <strong>{filteredOutpasses.length}</strong> of <strong>{outpasses.length}</strong> records
                    </p>
                </div>

                {/* ── Desktop Table ── */}
                <div className="ol-table-wrap">
                    {error ? (
                        <div className="ol-state-card">
                            <div className="ol-state-icon">⚠️</div>
                            <p className="ol-state-title">{error}</p>
                            <button className="ol-retry-btn" onClick={() => fetchOutpasses(currentPage, apiFilter)}>🔄 Try Again</button>
                        </div>
                    ) : (
                        <div className="ol-table-container">
                            <table className="ol-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Pass Info</th>
                                        <th>Duration</th>
                                        <th>Residence</th>
                                        <th>Approvals</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        [1, 2, 3, 4, 5].map(idx => (
                                            <tr key={idx}>
                                                {[130, 110, 160, 100, 120, 80].map((w, i) => (
                                                    <td key={i}><div className="ol-skeleton" style={{ width: w, height: 38 }} /></td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : filteredOutpasses.length === 0 ? (
                                        <tr>
                                            <td colSpan={6}>
                                                <div className="ol-empty-table">
                                                    <span style={{ fontSize: '2rem' }}>📭</span>
                                                    <p>No outpass records match your filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredOutpasses.map((outpass) => {
                                        const studentObj = outpass.student || outpass.studentid;
                                        const stu = Array.isArray(studentObj) ? studentObj[0] : (typeof studentObj === 'object' ? studentObj : undefined);
                                        const yiStatus = outpass.yearincharge?.status || 'pending';
                                        const staffStatus = (outpass.staffapprovalstatus || outpass.staff?.status || 'pending').toLowerCase();
                                        const isHostel = stu?.residencetype?.toLowerCase() !== 'day scholar';
                                        const isEmergency = outpass.outpasstype?.toLowerCase() === 'emergency';
                                        const isExpanded = expandedRow === outpass._id;
                                        return (
                                            <React.Fragment key={outpass._id}>
                                                <tr
                                                    className={`ol-table-row ${isExpanded ? 'ol-row-expanded' : ''} ${isEmergency ? 'ol-row-emergency' : ''}`}
                                                    onClick={() => toggleExpand(outpass._id)}
                                                >
                                                    <td>
                                                        <div className="ol-cell-stack">
                                                            <span className="ol-cell-name">{stu?.name || 'Unknown'}</span>
                                                            <span className="ol-cell-reg">{stu?.registerNumber || 'N/A'}</span>
                                                            <span className="ol-cell-meta">{stu?.year || ''} {stu?.year && stu?.department ? '—' : ''} {stu?.department || ''}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ol-cell-stack">
                                                            <span className="ol-type-chip" style={getTypeStyle(outpass.outpasstype || '')}>
                                                                {outpass.outpasstype || 'General'}
                                                            </span>
                                                            {isEmergency && <span className="ol-emergency-tag">🚨 CRITICAL</span>}
                                                            <span className="ol-cell-meta">Applied: {formatDate(outpass.createdAt)}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ol-cell-stack">
                                                            <span className="ol-date-line"><span className="ol-date-lbl">From</span> {new Date(outpass.fromDate).toLocaleString()}</span>
                                                            <span className="ol-date-line"><span className="ol-date-lbl">To</span>&nbsp;&nbsp;&nbsp;&nbsp;{new Date(outpass.toDate).toLocaleString()}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ol-cell-stack">
                                                            <span className="ol-residence-type">{stu?.residencetype || 'N/A'}</span>
                                                            {stu?.residencetype?.toLowerCase() === 'day scholar' ? (
                                                                <>
                                                                    <span className="ol-cell-meta">Bus: {stu?.busno || 'N/A'}</span>
                                                                    <span className="ol-cell-meta">Boarding: {stu?.boardingpoint || 'N/A'}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="ol-cell-meta">Hostel: {stu?.hostelname || 'N/A'}</span>
                                                                    <span className="ol-cell-meta">Room: {stu?.hostelroomno || 'N/A'}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ol-cell-stack" style={{ gap: 5 }}>
                                                            <span className="ol-approval-badge" style={getStatusStyle(staffStatus)}>Staff: {staffStatus}</span>
                                                            <span className="ol-approval-badge" style={getStatusStyle(yiStatus)}>Incharge: {yiStatus}</span>
                                                            {isHostel && yiStatus !== 'rejected' && (
                                                                <span className="ol-approval-badge" style={getStatusStyle(outpass.warden ? outpass.status : 'pending')}>
                                                                    Warden: {outpass.warden ? outpass.status : 'pending'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                            <button
                                                                className={`ol-expand-btn ${isExpanded ? 'ol-expand-btn-active' : ''}`}
                                                                onClick={(e) => { e.stopPropagation(); toggleExpand(outpass._id); }}
                                                            >
                                                                {isExpanded ? '▲ Hide' : '▼ Details'}
                                                            </button>
                                                            {(outpass.proof || outpass.document || outpass.file) && (
                                                                <button
                                                                    className="ol-doc-btn"
                                                                    onClick={(e) => { e.stopPropagation(); handleViewDocument((outpass.proof || outpass.document || outpass.file)!); }}
                                                                >
                                                                    📄 Doc
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr className="ol-expand-row">
                                                        <td colSpan={6}>
                                                            <div className="ol-expand-panel">
                                                                <div className="ol-reason-section">
                                                                    <h4 className="ol-reason-title">📝 Reason</h4>
                                                                    <p className="ol-reason-text">{outpass.reason || 'N/A'}</p>
                                                                    {outpass.skillrack && <p className="ol-reason-meta">Skillrack: {outpass.skillrack} · Attendance: {outpass.attendance || 'N/A'}%</p>}
                                                                    {outpass.remarks && (
                                                                        <div className="ol-remarks-block">
                                                                            💬 Remarks: "{outpass.remarks}"
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="ol-approval-grid">
                                                                    {/* Staff */}
                                                                    <div className={`ol-approval-card ol-acard-${staffStatus}`}>
                                                                        <div className="ol-acard-header">
                                                                            <span className="ol-acard-role">👨‍🏫 Staff (Advisor)</span>
                                                                            <span className="ol-acard-badge" style={getStatusStyle(staffStatus)}>{staffStatus}</span>
                                                                        </div>
                                                                        <p className="ol-acard-name">{outpass.staff?.name || 'N/A'}</p>
                                                                        <p className="ol-acard-phone">📞 {outpass.staff?.contactNumber || 'N/A'}</p>
                                                                    </div>
                                                                    {/* Year Incharge */}
                                                                    <div className={`ol-approval-card ol-acard-${yiStatus}`}>
                                                                        <div className="ol-acard-header">
                                                                            <span className="ol-acard-role">🎓 Year Incharge</span>
                                                                            <span className="ol-acard-badge" style={getStatusStyle(yiStatus)}>{yiStatus}</span>
                                                                        </div>
                                                                        <p className="ol-acard-name">{outpass.incharge?.name || 'N/A'}</p>
                                                                        <p className="ol-acard-phone">📞 {outpass.incharge?.phone || 'N/A'}</p>
                                                                        {outpass.yearincharge?.actionAt && <p className="ol-acard-time">🕐 {formatDate(outpass.yearincharge.actionAt)}</p>}
                                                                    </div>
                                                                    {/* Warden */}
                                                                    {isHostel && yiStatus !== 'rejected' && (
                                                                        <div className={`ol-approval-card ol-acard-${outpass.warden ? outpass.status : 'pending'}`}>
                                                                            <div className="ol-acard-header">
                                                                                <span className="ol-acard-role">🏠 Warden</span>
                                                                                <span className="ol-acard-badge" style={getStatusStyle(outpass.warden ? outpass.status : 'pending')}>{outpass.warden ? outpass.status : 'pending'}</span>
                                                                            </div>
                                                                            <p className="ol-acard-name">{outpass.warden?.name || 'Pending'}</p>
                                                                            <p className="ol-acard-phone">📞 {outpass.warden?.phone || 'N/A'}</p>
                                                                            {outpass.approvedAt && outpass.warden && <p className="ol-acard-time">🕐 {formatDate(outpass.approvedAt)}</p>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── Mobile Card View ── */}
                <div className="ol-mobile-list">
                    {loading ? (
                        [1, 2, 3].map(idx => (
                            <div className="ol-mobile-card" key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                                    <div><div className="ol-skeleton" style={{ width: 120, height: 20, marginBottom: 8 }} /><div className="ol-skeleton" style={{ width: 80, height: 14 }} /></div>
                                    <div className="ol-skeleton" style={{ width: 72, height: 26, borderRadius: 12 }} />
                                </div>
                                <div className="ol-skeleton" style={{ width: '100%', height: 72, borderRadius: 10 }} />
                            </div>
                        ))
                    ) : !loading && filteredOutpasses.length > 0 ? filteredOutpasses.map((outpass) => {
                        const studentObj = outpass.student || outpass.studentid;
                        const stu = Array.isArray(studentObj) ? studentObj[0] : (typeof studentObj === 'object' ? studentObj : undefined);
                        const yiStatus = outpass.yearincharge?.status || 'pending';
                        const staffStatus = (outpass.staffapprovalstatus || outpass.staff?.status || 'pending').toLowerCase();
                        const isHostel = stu?.residencetype?.toLowerCase() !== 'day scholar';
                        const isEmergency = outpass.outpasstype?.toLowerCase() === 'emergency';
                        const isExpanded = expandedRow === outpass._id;
                        return (
                            <div className={`ol-mobile-card ${isEmergency ? 'ol-mobile-emergency' : ''}`} key={outpass._id}>
                                <div className="ol-mc-header" onClick={() => toggleExpand(outpass._id)}>
                                    <div>
                                        <h3 className="ol-mc-name">{stu?.name || 'Unknown'}</h3>
                                        <p className="ol-mc-reg">{stu?.registerNumber || 'N/A'}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                        <span className="ol-type-chip-sm" style={getTypeStyle(outpass.outpasstype || '')}>{outpass.outpasstype || 'General'}</span>
                                        {isEmergency && <span className="ol-emergency-tag-sm">🚨 CRITICAL</span>}
                                    </div>
                                </div>

                                <div className="ol-mc-body">
                                    {[
                                        ['Dept / Year', `${stu?.department || ''} ${stu?.department && stu?.year ? '—' : ''} ${stu?.year || ''}`],
                                        ['From', new Date(outpass.fromDate).toLocaleString()],
                                        ['To', new Date(outpass.toDate).toLocaleString()],
                                        ['Applied', formatDate(outpass.createdAt)],
                                        ['Reason', outpass.reason || 'N/A'],
                                    ].map(([label, value]) => (
                                        <div key={label} className="ol-mc-row">
                                            <span className="ol-mc-label">{label}</span>
                                            <span className="ol-mc-value">{value}</span>
                                        </div>
                                    ))}
                                    {outpass.remarks && (
                                        <div className="ol-mc-row">
                                            <span className="ol-mc-label">Remarks</span>
                                            <span className="ol-mc-value" style={{ color: '#ef4444' }}>{outpass.remarks}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="ol-mc-footer">
                                    <div className="ol-mc-badges">
                                        <span className="ol-mc-badge" style={getStatusStyle(staffStatus)}>Staff: {staffStatus}</span>
                                        <span className="ol-mc-badge" style={getStatusStyle(yiStatus)}>Incharge: {yiStatus}</span>
                                        {isHostel && yiStatus !== 'rejected' && (
                                            <span className="ol-mc-badge" style={getStatusStyle(outpass.warden ? outpass.status : 'pending')}>Warden: {outpass.warden ? outpass.status : 'pending'}</span>
                                        )}
                                    </div>

                                    <button className="ol-mc-toggle" onClick={() => toggleExpand(outpass._id)}>
                                        {isExpanded ? '▲ Hide Approval Details' : '▼ View Approval Details'}
                                    </button>

                                    {isExpanded && (
                                        <div className="ol-mc-approval-details">
                                            {[
                                                { role: '👨‍🏫 Staff (Advisor)', status: staffStatus, name: outpass.staff?.name, phone: outpass.staff?.contactNumber },
                                                { role: '🎓 Year Incharge', status: yiStatus, name: outpass.incharge?.name, phone: outpass.incharge?.phone, time: outpass.yearincharge?.actionAt },
                                                ...(isHostel && yiStatus !== 'rejected' ? [{ role: '🏠 Warden', status: outpass.warden ? outpass.status : 'pending', name: outpass.warden?.name || 'Pending', phone: outpass.warden?.phone, time: outpass.approvedAt && outpass.warden ? outpass.approvedAt : undefined }] : [])
                                            ].map(({ role, status, name, phone, time }: any) => (
                                                <div key={role} className={`ol-mc-acard ol-acard-${status}`}>
                                                    <p className="ol-mc-arole">{role}</p>
                                                    <p className="ol-mc-aname">{name || 'N/A'}</p>
                                                    <p className="ol-mc-aphone">📞 {phone || 'N/A'}</p>
                                                    {time && <p className="ol-mc-atime">🕐 {formatDate(time)}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {(outpass.proof || outpass.document || outpass.file) && (
                                        <button
                                            className="ol-mc-doc-btn"
                                            onClick={(e) => { e.stopPropagation(); handleViewDocument((outpass.proof || outpass.document || outpass.file)!); }}
                                        >
                                            📄 View Document
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    }) : !loading && (
                        <div className="ol-state-card">
                            <div className="ol-state-icon">📭</div>
                            <p className="ol-state-title">No records found</p>
                            <p className="ol-state-sub">Try adjusting your filters or search term</p>
                        </div>
                    )}
                </div>

                {outpasses.length > 0 && (
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
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f1f5f9' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#475569' }}
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
                            onClick={() => setCurrentPage(prev => isLastPage ? prev : prev + 1)}
                            disabled={isLastPage}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: isLastPage ? '#f1f5f9' : 'white', cursor: isLastPage ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#475569' }}
                        >
                            Next &gt;
                        </button>

                        {/* Last */}
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={isLastPage}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: isLastPage ? '#f1f5f9' : 'white', cursor: isLastPage ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#475569' }}
                        >
                            Last »
                        </button>
                    </div>
                )}
            </div>

            {/* ── Document Modal ── */}
            {showDocumentModal && documentUrl && (
                <div className="ol-modal-overlay" onClick={() => setShowDocumentModal(false)}>
                    <div className="ol-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ol-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: '1.3rem' }}>📄</span>
                                <h3 className="ol-modal-title">Supporting Document</h3>
                            </div>
                            <button className="ol-modal-close" onClick={() => setShowDocumentModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="ol-modal-body">
                            {documentType === 'pdf' ? (
                                <iframe src={documentUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }} title="Document Viewer" />
                            ) : (
                                <img src={documentUrl} alt="Proof" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
                            )}
                        </div>
                        <div className="ol-modal-footer">
                            <a href={documentUrl} download={`proof_document.${documentType === 'pdf' ? 'pdf' : 'jpg'}`} className="ol-download-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download
                            </a>
                            <button className="ol-modal-dismiss" onClick={() => setShowDocumentModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* ═══════════════════════════════════════════
                   OUTPASS LIST — PREMIUM THEME
                ═══════════════════════════════════════════ */

                .ol-page-container {
                    min-height: 100vh;
                    background: linear-gradient(145deg, #f0f4ff 0%, #e8efff 40%, #f5f0ff 100%);
                    font-family: 'Inter', 'Segoe UI', sans-serif;
                }

                .ol-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 100px 32px 48px;
                    animation: olFadeUp 0.5s ease both;
                }

                @keyframes olFadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Hero ── */
                .ol-hero {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-bottom: 28px;
                }

                .ol-hero-left {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .ol-back-btn {
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
                .ol-back-btn:hover {
                    background: #0047AB;
                    color: white;
                    border-color: #0047AB;
                    transform: translateX(-3px);
                }

                .ol-title {
                    font-size: 2rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #0a1628 0%, #0047AB 60%, #3b82f6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 0;
                    letter-spacing: -0.5px;
                }

                .ol-subtitle {
                    color: #64748b;
                    font-size: 14px;
                    margin: 4px 0 0;
                    font-weight: 500;
                }

                /* Stat Badges */
                .ol-stat-badges {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    align-items: flex-start;
                    margin-top: 4px;
                }

                .ol-stat-badge {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 10px 18px;
                    border-radius: 14px;
                    min-width: 68px;
                    backdrop-filter: blur(10px);
                }

                .ol-stat-approved { background: rgba(34,197,94,0.1); border: 1.5px solid rgba(34,197,94,0.25); }
                .ol-stat-pending  { background: rgba(245,158,11,0.1); border: 1.5px solid rgba(245,158,11,0.25); }
                .ol-stat-rejected { background: rgba(239,68,68,0.1); border: 1.5px solid rgba(239,68,68,0.25); }

                .ol-stat-num {
                    font-size: 1.6rem;
                    font-weight: 800;
                    line-height: 1;
                }
                .ol-stat-approved .ol-stat-num { color: #15803d; }
                .ol-stat-pending  .ol-stat-num { color: #b45309; }
                .ol-stat-rejected .ol-stat-num { color: #b91c1c; }

                .ol-stat-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #64748b;
                    margin-top: 3px;
                }

                /* ── Filter Bar ── */
                .ol-filter-bar {
                    background: rgba(255,255,255,0.75);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.9);
                    border-radius: 20px;
                    padding: 18px 24px;
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    box-shadow: 0 4px 24px rgba(0,71,171,0.07), 0 1px 4px rgba(0,0,0,0.04);
                }

                .ol-pill-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .ol-pill-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    margin-right: 4px;
                }
                .ol-pill {
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
                .ol-pill:hover:not(.ol-pill-active) { border-color: #93c5fd; color: #1e40af; background: #eff6ff; }
                .ol-pill-active { border-color: #0047AB; background: linear-gradient(135deg, #0047AB, #1d4ed8); color: white; box-shadow: 0 4px 14px rgba(0,71,171,0.35); }

                .ol-loading-indicator {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 12px; color: #94a3b8; font-weight: 500;
                }
                .ol-spinner {
                    display: inline-block; width: 13px; height: 13px; border-radius: 50%;
                    border: 2px solid #dbeafe; border-top-color: #0047AB;
                    animation: olSpin 0.7s linear infinite;
                }
                @keyframes olSpin { to { transform: rotate(360deg); } }

                .ol-controls-row {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .ol-search-wrapper {
                    position: relative;
                    flex: 1;
                    min-width: 220px;
                }
                .ol-search-icon {
                    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
                    color: #94a3b8; pointer-events: none;
                }
                .ol-search-input {
                    width: 100%;
                    padding: 11px 36px 11px 42px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 14px;
                    color: #1e293b;
                    background: #f8fafc;
                    outline: none;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }
                .ol-search-input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
                .ol-search-clear {
                    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 13px; padding: 2px 4px;
                }
                .ol-search-clear:hover { color: #ef4444; }

                .ol-selects-group { display: flex; gap: 8px; flex-wrap: wrap; }
                .ol-select-wrapper { position: relative; display: flex; align-items: center; min-width: 140px; }
                .ol-select-icon { position: absolute; left: 12px; color: #94a3b8; pointer-events: none; z-index: 1; }
                .ol-select {
                    padding: 11px 32px 11px 32px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #1e293b;
                    background: #f8fafc;
                    outline: none;
                    cursor: pointer;
                    appearance: none;
                    width: 100%;
                    transition: all 0.2s;
                }
                .ol-select:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
                .ol-select-arrow { position: absolute; right: 10px; color: #94a3b8; pointer-events: none; }

                .ol-results-count { font-size: 13px; color: #64748b; margin: 0; }
                .ol-results-count strong { color: #1e293b; }

                /* ── Table ── */
                .ol-table-wrap { margin-bottom: 0; }

                .ol-table-container {
                    background: rgba(255,255,255,0.85);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.9);
                    border-radius: 20px;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
                }

                .ol-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    min-width: 860px;
                }

                .ol-table th {
                    padding: 14px 16px;
                    text-align: left;
                    font-size: 11px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                    border-bottom: 1px solid #e8f0fe;
                    background: linear-gradient(135deg, #f8faff, #f0f5ff);
                    white-space: nowrap;
                    position: sticky;
                    top: 0;
                    z-index: 2;
                }
                .ol-table th:first-child { border-radius: 20px 0 0 0; }
                .ol-table th:last-child  { border-radius: 0 20px 0 0; }

                .ol-table td {
                    padding: 14px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: top;
                    font-size: 0.85rem;
                }
                .ol-table tr:last-child td { border-bottom: none; }

                .ol-table-row { transition: background 0.15s ease; cursor: pointer; }
                .ol-table-row:hover { background: rgba(239,246,255,0.7); }
                .ol-row-expanded { background: rgba(219,234,254,0.4) !important; }
                .ol-row-emergency { background: rgba(254,242,242,0.5) !important; }
                .ol-row-emergency:hover { background: rgba(254,226,226,0.6) !important; }

                /* Cell styles */
                .ol-cell-stack { display: flex; flex-direction: column; gap: 3px; }
                .ol-cell-name { font-weight: 700; color: #0f172a; font-size: 0.88rem; }
                .ol-cell-reg  { font-size: 0.78rem; color: #3b82f6; font-weight: 600; }
                .ol-cell-meta { font-size: 0.75rem; color: #94a3b8; }
                .ol-residence-type { font-weight: 600; color: #334155; text-transform: capitalize; font-size: 0.82rem; }
                .ol-date-line { font-size: 0.82rem; color: #475569; }
                .ol-date-lbl  { font-weight: 700; color: #64748b; font-size: 0.75rem; }

                .ol-type-chip {
                    display: inline-block;
                    padding: 3px 10px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: capitalize;
                    width: fit-content;
                }
                .ol-type-chip-sm {
                    padding: 3px 9px;
                    border-radius: 7px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: capitalize;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .ol-emergency-tag {
                    background: linear-gradient(135deg, #dc2626, #ef4444);
                    color: white;
                    font-size: 0.62rem;
                    font-weight: 800;
                    padding: 2px 7px;
                    border-radius: 5px;
                    width: fit-content;
                    animation: olTagPulse 1.5s ease infinite;
                }
                .ol-emergency-tag-sm {
                    background: linear-gradient(135deg, #dc2626, #ef4444);
                    color: white;
                    font-size: 0.6rem;
                    font-weight: 800;
                    padding: 2px 6px;
                    border-radius: 4px;
                    animation: olTagPulse 1.5s ease infinite;
                }
                @keyframes olTagPulse { 0%,100% { opacity:1; } 50% { opacity:0.75; } }

                .ol-approval-badge {
                    display: inline-block;
                    padding: 3px 9px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: capitalize;
                    width: fit-content;
                    white-space: nowrap;
                }

                /* Action buttons */
                .ol-expand-btn {
                    padding: 6px 12px;
                    background: #f1f5f9;
                    border: 1.5px solid #cbd5e1;
                    border-radius: 8px;
                    color: #475569;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .ol-expand-btn:hover { background: #e2e8f0; color: #1e293b; }
                .ol-expand-btn-active { background: #eff6ff; border-color: #93c5fd; color: #1e40af; }

                .ol-doc-btn {
                    padding: 6px 11px;
                    background: #eff6ff;
                    border: 1.5px solid #93c5fd;
                    border-radius: 8px;
                    color: #1d4ed8;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .ol-doc-btn:hover { background: #1d4ed8; color: white; border-color: #1d4ed8; }

                /* Expanded row */
                .ol-expand-row td {
                    padding: 0 16px 16px !important;
                    background: rgba(219,234,254,0.3);
                    border-bottom: 2px solid #3b82f6 !important;
                }
                .ol-expand-panel { animation: olSlideDown 0.25s ease; padding-top: 16px; }
                @keyframes olSlideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

                .ol-reason-section {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 14px 16px;
                    margin-bottom: 14px;
                }
                .ol-reason-title { margin: 0 0 6px; font-size: 0.88rem; color: #1e293b; font-weight: 700; }
                .ol-reason-text  { margin: 0; color: #475569; font-size: 0.85rem; line-height: 1.5; }
                .ol-reason-meta  { margin: 6px 0 0; font-size: 0.75rem; color: #94a3b8; }
                .ol-remarks-block {
                    margin-top: 8px;
                    padding: 8px 12px;
                    background: #f8fafc;
                    border-left: 3px solid #3b82f6;
                    border-radius: 0 8px 8px 0;
                    font-size: 0.82rem;
                    color: #475569;
                    font-style: italic;
                    word-break: break-word;
                }

                .ol-approval-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }

                .ol-approval-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 14px;
                    transition: all 0.2s;
                }
                .ol-approval-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.07); transform: translateY(-1px); }

                .ol-acard-approved { border-left: 4px solid #22c55e !important; }
                .ol-acard-rejected { border-left: 4px solid #ef4444 !important; }
                .ol-acard-pending  { border-left: 4px solid #eab308 !important; }

                .ol-acard-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;
                }
                .ol-acard-role  { font-weight: 700; color: #1e293b; font-size: 0.83rem; }
                .ol-acard-badge {
                    padding: 2px 8px; border-radius: 5px; font-size: 0.68rem;
                    font-weight: 700; text-transform: capitalize;
                }
                .ol-acard-name  { margin: 0 0 3px; font-weight: 600; color: #1e293b; font-size: 0.88rem; }
                .ol-acard-phone { margin: 0 0 3px; color: #3b82f6; font-size: 0.78rem; }
                .ol-acard-time  { margin: 4px 0 0; color: #94a3b8; font-size: 0.7rem; }

                /* ── State Cards ── */
                .ol-state-card {
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(12px);
                    border: 1.5px solid rgba(255,255,255,0.9);
                    border-radius: 20px;
                    padding: 60px 40px;
                    text-align: center;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
                }
                .ol-state-icon  { font-size: 2.8rem; display: block; margin-bottom: 14px; }
                .ol-state-title { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
                .ol-state-sub   { font-size: 0.88rem; color: #64748b; margin: 0; }
                .ol-retry-btn {
                    margin-top: 18px; padding: 10px 24px;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    color: white; border: none; border-radius: 10px;
                    font-size: 14px; font-weight: 700; cursor: pointer;
                    box-shadow: 0 4px 14px rgba(0,71,171,0.3); transition: all 0.2s;
                }
                .ol-retry-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,71,171,0.4); }

                /* Empty table */
                .ol-empty-table { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 20px; }
                .ol-empty-table p { color: #64748b; font-size: 0.9rem; margin: 0; }

                /* ── Skeleton ── */
                .ol-skeleton {
                    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
                    background-size: 200% 100%;
                    animation: olShimmer 1.4s ease infinite;
                    border-radius: 8px;
                }
                @keyframes olShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

                /* ── Pagination ── */
                .ol-pagination {
                    display: flex; align-items: center; justify-content: center;
                    gap: 20px; margin-top: 32px; padding-bottom: 24px;
                }
                .ol-page-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 10px 22px; border-radius: 12px; border: 1.5px solid #e2e8f0;
                    background: rgba(255,255,255,0.8); backdrop-filter: blur(8px);
                    color: #475569; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                }
                .ol-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .ol-page-btn:not(:disabled):hover { background: #0047AB; color: white; border-color: #0047AB; box-shadow: 0 4px 14px rgba(0,71,171,0.25); }
                .ol-page-indicator {
                    font-size: 14px; font-weight: 700; color: #475569;
                    background: rgba(255,255,255,0.8); padding: 10px 18px;
                    border-radius: 12px; border: 1.5px solid #e2e8f0;
                }

                /* ── Mobile List (hidden on desktop) ── */
                .ol-mobile-list { display: none; flex-direction: column; gap: 14px; }

                .ol-mobile-card {
                    background: rgba(255,255,255,0.85);
                    backdrop-filter: blur(12px);
                    border: 1.5px solid rgba(255,255,255,0.9);
                    border-radius: 18px;
                    padding: 16px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
                    transition: box-shadow 0.2s;
                    animation: olFadeUp 0.4s ease both;
                }
                .ol-mobile-emergency {
                    border-color: rgba(239,68,68,0.25);
                    background: rgba(255,245,245,0.9);
                }

                .ol-mc-header {
                    display: flex; justify-content: space-between; align-items: flex-start;
                    margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;
                    gap: 12px; cursor: pointer;
                }
                .ol-mc-name { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; word-break: break-word; }
                .ol-mc-reg  { font-size: 0.78rem; color: #3b82f6; margin: 2px 0 0; font-weight: 600; }

                .ol-mc-body { margin-bottom: 12px; display: flex; flex-direction: column; gap: 7px; }
                .ol-mc-row  { display: flex; justify-content: space-between; font-size: 0.83rem; gap: 10px; }
                .ol-mc-label { color: #64748b; font-weight: 500; flex-shrink: 0; }
                .ol-mc-value { color: #334155; font-weight: 500; text-align: right; word-break: break-word; min-width: 0; }

                .ol-mc-footer {
                    background: #f8fafc;
                    margin: 0 -16px -16px;
                    padding: 14px;
                    border-radius: 0 0 18px 18px;
                    border-top: 1px solid #f1f5f9;
                    display: flex; flex-direction: column; gap: 10px;
                }

                .ol-mc-badges { display: flex; flex-wrap: wrap; gap: 6px; }
                .ol-mc-badge {
                    font-size: 0.68rem; font-weight: 700; padding: 4px 9px;
                    border-radius: 7px; text-transform: capitalize;
                }

                .ol-mc-toggle {
                    width: 100%; padding: 10px;
                    background: linear-gradient(135deg, #e8f0fe, #dbeafe);
                    border: none; border-radius: 10px;
                    font-size: 0.78rem; font-weight: 700; color: #1e40af;
                    cursor: pointer; transition: all 0.2s;
                }
                .ol-mc-toggle:hover { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }

                .ol-mc-approval-details { display: flex; flex-direction: column; gap: 8px; animation: olSlideDown 0.25s ease; }

                .ol-mc-acard {
                    background: white; border: 1px solid #e2e8f0;
                    border-radius: 10px; padding: 12px;
                }
                .ol-mc-acard.ol-acard-approved { border-left: 4px solid #22c55e; }
                .ol-mc-acard.ol-acard-rejected { border-left: 4px solid #ef4444; }
                .ol-mc-acard.ol-acard-pending  { border-left: 4px solid #eab308; }

                .ol-mc-arole  { margin: 0 0 4px; font-weight: 700; font-size: 0.8rem; color: #1e293b; }
                .ol-mc-aname  { margin: 0 0 2px; font-weight: 600; font-size: 0.84rem; color: #334155; }
                .ol-mc-aphone { margin: 2px 0; font-size: 0.78rem; color: #3b82f6; }
                .ol-mc-atime  { margin: 4px 0 0; font-size: 0.7rem; color: #94a3b8; }

                .ol-mc-doc-btn {
                    width: 100%; padding: 10px;
                    background: #eff6ff; border: 1.5px solid #93c5fd;
                    border-radius: 10px; color: #1d4ed8;
                    font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
                }
                .ol-mc-doc-btn:hover { background: #1d4ed8; color: white; border-color: #1d4ed8; }

                /* ── Document Modal ── */
                .ol-modal-overlay {
                    position: fixed; inset: 0;
                    background: rgba(10,20,50,0.72); backdrop-filter: blur(6px);
                    z-index: 9999; display: flex; align-items: center; justify-content: center;
                    padding: 20px; animation: olFadeIn 0.2s ease;
                }
                @keyframes olFadeIn { from { opacity: 0; } to { opacity: 1; } }

                .ol-modal {
                    background: white; border-radius: 20px;
                    width: 100%; max-width: 960px; height: 88vh;
                    display: flex; flex-direction: column;
                    box-shadow: 0 32px 80px rgba(0,0,0,0.35);
                    animation: olModalIn 0.25s ease; overflow: hidden;
                }
                @keyframes olModalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

                .ol-modal-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
                    background: linear-gradient(135deg, #f8faff, #f0f6ff);
                }
                .ol-modal-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
                .ol-modal-close {
                    background: #f1f5f9; border: none; width: 36px; height: 36px;
                    border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;
                    color: #64748b; transition: all 0.2s;
                }
                .ol-modal-close:hover { background: #fee2e2; color: #ef4444; }
                .ol-modal-body {
                    flex: 1; overflow: hidden; background: #f8fafc; padding: 12px;
                    display: flex; align-items: center; justify-content: center;
                }
                .ol-modal-footer {
                    display: flex; justify-content: flex-end; align-items: center;
                    gap: 10px; padding: 16px 24px; border-top: 1px solid #f1f5f9;
                    background: #fafafa;
                }
                .ol-download-btn {
                    display: inline-flex; align-items: center; gap: 7px;
                    padding: 10px 22px; background: linear-gradient(135deg, #0047AB, #2563eb);
                    color: white; border-radius: 10px; text-decoration: none;
                    font-size: 14px; font-weight: 700; transition: all 0.2s;
                    box-shadow: 0 4px 14px rgba(0,71,171,0.25);
                }
                .ol-download-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,71,171,0.35); }
                .ol-modal-dismiss {
                    padding: 10px 22px; background: #f1f5f9; border: none;
                    border-radius: 10px; color: #475569; font-size: 14px; font-weight: 600;
                    cursor: pointer; transition: background 0.2s;
                }
                .ol-modal-dismiss:hover { background: #e2e8f0; }

                /* ── Responsive ── */
                @media (max-width: 1024px) {
                    .ol-content { padding: 90px 20px 40px; }
                    .ol-approval-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
                }

                @media (max-width: 768px) {
                    .ol-table-wrap { display: none; }
                    .ol-mobile-list { display: flex; }
                    .ol-content { padding: 80px 14px 32px; }
                    .ol-title { font-size: 1.5rem; }
                    .ol-hero { flex-direction: column; gap: 12px; }
                    .ol-stat-badges { align-self: flex-start; }
                    .ol-filter-bar { padding: 14px 16px; border-radius: 16px; }
                    .ol-controls-row { flex-direction: column; }
                    .ol-selects-group { flex-direction: column; }
                    .ol-select-wrapper { min-width: unset; width: 100%; }
                    .ol-select { width: 100%; }
                    .ol-modal { height: 95vh; border-radius: 12px; }
                }

                @media (max-width: 480px) {
                    .ol-content { padding: 76px 10px 28px; }
                    .ol-title { font-size: 1.3rem; }
                    .ol-modal { height: 98vh; border-radius: 8px; }
                }
            `}</style>
        </div>
    );
};

export default YearInchargeOutpassList;
