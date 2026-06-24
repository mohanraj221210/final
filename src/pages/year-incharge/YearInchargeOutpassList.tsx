import React, { useState, useEffect, useRef } from 'react';
import YearInchargeNav from '../../components/YearInchargeNav';
import { YearInchargeService } from '../../services/yearInchargeService';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

type ApiFilter = 'total' | 'today' | 'weekly' | 'monthly';
const FILTER_OPTIONS: { value: ApiFilter; label: string }[] = [
    { value: 'total', label: 'Total' },
    { value: 'today', label: 'Today' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
];

const YearInchargeOutpassList: React.FC = () => {
    const [outpasses, setOutpasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected' | 'pending'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'Home' | 'Outing' | 'Emergency' | 'OD'>('all');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [documentType, setDocumentType] = useState<'image' | 'pdf'>('image');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [apiFilter, setApiFilter] = useState<ApiFilter>('total');

    // Pagination & Error states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const fetchOutpasses = async (page: number = currentPage, filter: ApiFilter = apiFilter) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/year-incharge-login');
            return;
        }

        setLoading(true);
        setError(null);

        console.log('Filter Changed:', filter);

        try {
            const result = await YearInchargeService.getOutpasses(page, filter);
            // Sort Emergency first, then newest first
            const sortedList = result.data.sort((a: any, b: any) => {
                const isAEmergency = a.outpasstype?.toLowerCase() === 'emergency';
                const isBEmergency = b.outpasstype?.toLowerCase() === 'emergency';
                if (isAEmergency && !isBEmergency) return -1;
                if (!isAEmergency && isBEmergency) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setOutpasses(sortedList);
            setTotalPages(result.totalPages);
        } catch (err: any) {
            console.error('Error fetching outpasses:', err);
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                navigate('/year-incharge-login');
                return;
            }
            setError('Failed to fetch outpass list');
            toast.error('Failed to fetch outpass list');
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when page changes
    useEffect(() => {
        fetchOutpasses(currentPage, apiFilter);
    }, [currentPage]);

    // Re-fetch when API filter changes — reset to page 1
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        setCurrentPage(1);
        fetchOutpasses(1, apiFilter);
    }, [apiFilter]);

    const handleViewDocument = (url: string | null) => {
        if (!url) return;
        const fullUrl = `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
        setDocumentUrl(fullUrl);
        if (url.toLowerCase().endsWith('.pdf')) {
            setDocumentType('pdf');
        } else {
            setDocumentType('image');
        }
        setShowDocumentModal(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
        // Helper: get first student from array
        const stu = outpass.student?.[0];
        const yiStatus = outpass.yearincharge?.status || 'pending';

        // Search filter
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch = term === '' ||
            (stu?.name?.toLowerCase().includes(term) || false) ||
            (stu?.registerNumber?.toLowerCase().includes(term) || false) ||
            (stu?.department?.toLowerCase().includes(term) || false) ||
            (outpass.outpasstype?.toLowerCase().includes(term) || false) ||
            (outpass.reason?.toLowerCase().includes(term) || false);

        // Status filter — uses overall outpass status
        const matchesStatus = statusFilter === 'all' ||
            outpass.status === statusFilter ||
            yiStatus === statusFilter;

        // Type filter
        const matchesType = typeFilter === 'all' ||
            outpass.outpasstype === typeFilter;

        // Date filter — uses createdAt (when the outpass was applied)
        let matchesDate = true;
        if (dateFilter !== 'all' && outpass.createdAt) {
            const appliedDate = new Date(outpass.createdAt);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dateFilter === 'today') {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                matchesDate = appliedDate >= today && appliedDate < tomorrow;
            } else if (dateFilter === 'yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                matchesDate = appliedDate >= yesterday && appliedDate < today;
            } else if (dateFilter === 'this_week') {
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                matchesDate = appliedDate >= startOfWeek;
            } else if (dateFilter === 'this_month') {
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                matchesDate = appliedDate >= startOfMonth;
            }
        }

        return matchesSearch && matchesDate && matchesStatus && matchesType;
    });

    const toggleExpand = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };


    return (
        <div className="page-container">
            <ToastContainer position="bottom-right" />
            <YearInchargeNav />
            <div className="content-wrapper">
                <button className="back-btn" onClick={() => navigate('/year-incharge-dashboard')}>
                    ← Back to Dashboard
                </button>
                <div className="page-header">
                    <h1>All Outpass Records</h1>
                    <p className="subtitle">View history of all student outpasses</p>
                </div>

                {/* ── API Filter Pills ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Show:</span>
                    {FILTER_OPTIONS.map(opt => {
                        const active = apiFilter === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => setApiFilter(opt.value)}
                                style={{
                                    padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                                    border: active ? '2px solid #0047AB' : '2px solid #e2e8f0',
                                    background: active ? '#0047AB' : 'white',
                                    color: active ? 'white' : '#475569',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: active ? '0 4px 12px rgba(0,71,171,0.25)' : 'none',
                                }}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                    {loading && (
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', border: '2px solid #0047AB', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                            Loading...
                        </span>
                    )}
                </div>

                {/* Filters */}
                <div className="filters-container">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by Name, Register No, Dept, Type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-group">
                        <div className="filter-select-wrapper">
                            <span className="filter-icon">📅</span>
                            <select
                                className="filter-select"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value as any)}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                            </select>
                            <span className="filter-arrow">▼</span>
                        </div>
                        <div className="filter-select-wrapper">
                            <span className="filter-icon">📋</span>
                            <select
                                className="filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                            >
                                <option value="all">All Status</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="pending">Pending</option>
                            </select>
                            <span className="filter-arrow">▼</span>
                        </div>
                        <div className="filter-select-wrapper">
                            <span className="filter-icon">🏷️</span>
                            <select
                                className="filter-select"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as any)}
                            >
                                <option value="all">All Types</option>
                                <option value="Home">Home</option>
                                <option value="Outing">Outing</option>
                                <option value="Emergency">Emergency</option>
                                <option value="OD">OD</option>
                            </select>
                            <span className="filter-arrow">▼</span>
                        </div>
                    </div>
                </div>

                <p className="results-count">
                    Showing <strong>{filteredOutpasses.length}</strong> of <strong>{outpasses.length}</strong> records
                </p>

                {/* Desktop Table View */}
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Student Details</th>
                                <th>Pass Information</th>
                                <th>Duration</th>
                                <th>Residence</th>
                                <th>Approvals</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map((idx) => (
                                    <tr key={idx}>
                                        <td data-label="Student Details"><div className="lux-skeleton" style={{ width: '130px', height: '40px' }}></div></td>
                                        <td data-label="Pass Information"><div className="lux-skeleton" style={{ width: '110px', height: '40px' }}></div></td>
                                        <td data-label="Duration"><div className="lux-skeleton" style={{ width: '160px', height: '40px' }}></div></td>
                                        <td data-label="Residence"><div className="lux-skeleton" style={{ width: '100px', height: '40px' }}></div></td>
                                        <td data-label="Approvals"><div className="lux-skeleton" style={{ width: '120px', height: '40px' }}></div></td>
                                        <td data-label="Action"><div className="lux-skeleton" style={{ width: '80px', height: '40px' }}></div></td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px 0' }}>
                                            <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ {error}</span>
                                            <button onClick={() => fetchOutpasses(currentPage, apiFilter)} className="back-btn" style={{ margin: 0, padding: '6px 12px', background: '#eff6ff', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                                🔄 Retry
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOutpasses.length > 0 ? (
                                filteredOutpasses.map((outpass) => {
                                    // Resolve student from array
                                    const stu = outpass.student?.[0];
                                    const yiStatus = outpass.yearincharge?.status || 'pending';
                                    const staffStatus: string = outpass.staff ? 'approved' : 'pending';
                                    const isHostel = stu?.residencetype?.toLowerCase() !== 'day scholar';
                                    return (
                                        <React.Fragment key={outpass._id}>
                                            <tr
                                                className={`table-row ${expandedRow === outpass._id ? 'expanded' : ''}`}
                                                onClick={() => toggleExpand(outpass._id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td data-label="Student Details">
                                                    <div className="student-info">
                                                        <span className="font-bold">{stu?.name || 'Unknown'}</span>
                                                        <span className="text-sm text-gray-500">{stu?.registerNumber || 'N/A'}</span>
                                                        <span className="text-xs text-gray-400">
                                                            {stu?.year || ''} — {stu?.department || ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td data-label="Pass Information">
                                                    <div className="pass-info">
                                                        <span className="pass-type">{outpass.outpasstype}</span>
                                                        {outpass.outpasstype?.toLowerCase() === 'emergency' && (
                                                            <span className="emergency-badge">🚨 CRITICAL</span>
                                                        )}
                                                        <span className="text-xs text-gray-400" style={{ marginTop: '4px' }}>
                                                            Applied: {formatDate(outpass.createdAt)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td data-label="Duration">
                                                    <div className="date-info">
                                                        <span className="date-label">From: {new Date(outpass.fromDate).toLocaleString()}</span>
                                                        <span className="date-label">To: {new Date(outpass.toDate).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td data-label="Residence">
                                                    <div className="residence-info">
                                                        <span className="residence-type">{stu?.residencetype || 'N/A'}</span>
                                                        {stu?.residencetype?.toLowerCase() === 'day scholar' ? (
                                                            <>
                                                                <span className="text-xs">Bus: {stu?.busno || 'N/A'}</span>
                                                                <span className="text-xs">Boarding: {stu?.boardingpoint || 'N/A'}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-xs">Hostel: {stu?.hostelname || 'N/A'}</span>
                                                                <span className="text-xs">Room: {stu?.hostelroomno || 'N/A'}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td data-label="Approvals">
                                                    <div className="status-stack">
                                                        <span className={`status-badge ${getStatusColor(staffStatus)}`}>
                                                            Staff: {staffStatus}
                                                        </span>
                                                        <span className={`status-badge ${getStatusColor(yiStatus)}`}>
                                                            Incharge: {yiStatus}
                                                        </span>
                                                        {isHostel && yiStatus !== 'rejected' && (
                                                            <span className={`status-badge ${getStatusColor(outpass.warden ? outpass.status : 'pending')}`}>
                                                                Warden: {outpass.warden ? outpass.status : 'pending'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td data-label="Action">
                                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                        <button
                                                            className="expand-btn"
                                                            onClick={(e) => { e.stopPropagation(); toggleExpand(outpass._id); }}
                                                            title="View approval details"
                                                        >
                                                            {expandedRow === outpass._id ? '▲ Hide' : '▼ Details'}
                                                        </button>
                                                        {(outpass.proof || outpass.document || outpass.file) && (
                                                            <button
                                                                className="view-doc-btn-list"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const url = (outpass.proof || outpass.document || outpass.file)!;
                                                                    handleViewDocument(url);
                                                                }}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    background: '#eff6ff',
                                                                    border: '1px solid #3b82f6',
                                                                    borderRadius: '6px',
                                                                    color: '#3b82f6',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                📄 Doc
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRow === outpass._id && (
                                                <tr className="expanded-details-row">
                                                    <td colSpan={6}>
                                                        <div className="approval-details-panel">
                                                            <div className="detail-section">
                                                                <h4>📝 Reason</h4>
                                                                <p>{outpass.reason || 'N/A'}</p>
                                                                {outpass.skillrack && <p className="text-xs text-gray-400">Skillrack: {outpass.skillrack} | Attendance: {outpass.attendance || 'N/A'}%</p>}
                                                                {outpass.remarks && <p className="approver-remarks" style={{ marginTop: '4px' }}>💬 Remarks: "{outpass.remarks}"</p>}
                                                            </div>
                                                            <div className="approval-cards-grid">
                                                                {/* Staff Approval */}
                                                                <div className={`approval-card ${staffStatus === 'approved' ? 'card-approved' : staffStatus === 'rejected' ? 'card-rejected' : 'card-pending'}`}>
                                                                    <div className="approval-card-header">
                                                                        <span className="approval-role">👨‍🏫 Staff (Advisor)</span>
                                                                        <span className={`mini-badge ${getStatusColor(staffStatus)}`}>
                                                                            {staffStatus}
                                                                        </span>
                                                                    </div>
                                                                    <div className="approval-card-body">
                                                                        <p className="approver-name">{outpass.staff?.name || 'N/A'}</p>
                                                                        <p className="approver-phone">📞 {outpass.staff?.contactNumber || 'N/A'}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Year Incharge Approval */}
                                                                <div className={`approval-card ${yiStatus === 'approved' ? 'card-approved' : yiStatus === 'rejected' ? 'card-rejected' : 'card-pending'}`}>
                                                                    <div className="approval-card-header">
                                                                        <span className="approval-role">🎓 Year Incharge</span>
                                                                        <span className={`mini-badge ${getStatusColor(yiStatus)}`}>
                                                                            {yiStatus}
                                                                        </span>
                                                                    </div>
                                                                    <div className="approval-card-body">
                                                                        <p className="approver-name">{outpass.incharge?.name || 'N/A'}</p>
                                                                        <p className="approver-phone">📞 {outpass.incharge?.phone || 'N/A'}</p>
                                                                        {outpass.yearincharge?.actionAt && (
                                                                            <p className="approver-time">🕐 {formatDate(outpass.yearincharge.actionAt)}</p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Warden Approval (only for hostel students) */}
                                                                {isHostel && yiStatus !== 'rejected' && (
                                                                    <div className={`approval-card ${outpass.warden ? (outpass.status === 'approved' ? 'card-approved' : outpass.status === 'rejected' ? 'card-rejected' : 'card-pending') : 'card-pending'}`}>
                                                                        <div className="approval-card-header">
                                                                            <span className="approval-role">🏠 Warden</span>
                                                                            <span className={`mini-badge ${getStatusColor(outpass.warden ? outpass.status : 'pending')}`}>
                                                                                {outpass.warden ? outpass.status : 'pending'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="approval-card-body">
                                                                            <p className="approver-name">{outpass.warden?.name || 'Pending'}</p>
                                                                            <p className="approver-phone">📞 {outpass.warden?.phone || 'N/A'}</p>
                                                                            {outpass.approvedAt && outpass.warden && <p className="approver-time">🕐 {formatDate(outpass.approvedAt)}</p>}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No outpass records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                {!loading && filteredOutpasses.length > 0 && (
                    <div className="mobile-cards-view">
                        {filteredOutpasses.map((outpass) => {
                            const stu = outpass.student?.[0];
                            const yiStatus = outpass.yearincharge?.status || 'pending';
                            const staffStatus: string = outpass.staff ? 'approved' : 'pending';
                            const isHostel = stu?.residencetype?.toLowerCase() !== 'day scholar';
                            return (
                                <div className="mobile-card" key={outpass._id}>
                                    <div className="card-header-mobile" onClick={() => toggleExpand(outpass._id)} style={{ cursor: 'pointer' }}>
                                        <div>
                                            <h3 className="card-name">{stu?.name || 'Unknown'}</h3>
                                            <p className="card-reg">{stu?.registerNumber || 'N/A'}</p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                            <span className="pass-type-mobile">{outpass.outpasstype}</span>
                                            {outpass.outpasstype?.toLowerCase() === 'emergency' && (
                                                <span className="emergency-badge mobile">🚨 CRITICAL</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-body-mobile">
                                        <div className="info-row">
                                            <span className="label">Dept/Year:</span>
                                            <span className="value">
                                                {stu?.department || ''} — {stu?.year || ''}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">From:</span>
                                            <span className="value">{new Date(outpass.fromDate).toLocaleString()}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">To:</span>
                                            <span className="value">{new Date(outpass.toDate).toLocaleString()}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Applied:</span>
                                            <span className="value">{formatDate(outpass.createdAt)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Reason:</span>
                                            <span className="value" style={{ maxWidth: '60%', wordBreak: 'break-word' }}>{outpass.reason || 'N/A'}</span>
                                        </div>
                                        {outpass.remarks && (
                                            <div className="info-row">
                                                <span className="label">Remarks:</span>
                                                <span className="value" style={{ maxWidth: '60%', wordBreak: 'break-word', color: '#EF4444' }}>{outpass.remarks}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-footer-mobile">
                                        <div className="status-grid">
                                            <span className={`status-badge-mobile ${getStatusColor(staffStatus)}`}>
                                                Staff: {staffStatus}
                                            </span>
                                            <span className={`status-badge-mobile ${getStatusColor(yiStatus)}`}>
                                                Incharge: {yiStatus}
                                            </span>
                                            {isHostel && yiStatus !== 'rejected' && (
                                                <span className={`status-badge-mobile ${getStatusColor(outpass.warden ? outpass.status : 'pending')}`}>
                                                    Warden: {outpass.warden ? outpass.status : 'pending'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Approval Details in Mobile */}
                                        <div className="mobile-approval-toggle" onClick={() => toggleExpand(outpass._id)} style={{ cursor: 'pointer' }}>
                                            <span>{expandedRow === outpass._id ? '▲ Hide Approval Details' : '▼ View Approval Details'}</span>
                                        </div>

                                        {expandedRow === outpass._id && (
                                            <div className="mobile-approval-details">
                                                {/* Staff */}
                                                <div className={`mobile-approval-card ${staffStatus === 'approved' ? 'card-approved' : staffStatus === 'rejected' ? 'card-rejected' : 'card-pending'}`}>
                                                    <p className="mobile-role">👨‍🏫 Staff (Advisor)</p>
                                                    <p className="mobile-approver">{outpass.staff?.name || 'N/A'}</p>
                                                    <p className="mobile-phone">📞 {outpass.staff?.contactNumber || 'N/A'}</p>
                                                </div>

                                                {/* Year Incharge */}
                                                <div className={`mobile-approval-card ${yiStatus === 'approved' ? 'card-approved' : yiStatus === 'rejected' ? 'card-rejected' : 'card-pending'}`}>
                                                    <p className="mobile-role">🎓 Year Incharge</p>
                                                    <p className="mobile-approver">{outpass.incharge?.name || 'N/A'}</p>
                                                    <p className="mobile-phone">📞 {outpass.incharge?.phone || 'N/A'}</p>
                                                    {outpass.yearincharge?.actionAt && (
                                                        <p className="mobile-time">🕐 {formatDate(outpass.yearincharge.actionAt)}</p>
                                                    )}
                                                </div>

                                                {/* Warden */}
                                                {isHostel && yiStatus !== 'rejected' && (
                                                    <div className={`mobile-approval-card ${outpass.warden ? (outpass.status === 'approved' ? 'card-approved' : outpass.status === 'rejected' ? 'card-rejected' : 'card-pending') : 'card-pending'}`}>
                                                        <p className="mobile-role">🏠 Warden</p>
                                                        <p className="mobile-approver">{outpass.warden?.name || 'Pending'}</p>
                                                        <p className="mobile-phone">📞 {outpass.warden?.phone || 'N/A'}</p>
                                                        {outpass.approvedAt && outpass.warden && <p className="mobile-time">🕐 {formatDate(outpass.approvedAt)}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(outpass.proof || outpass.document || outpass.file) && (
                                            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-start' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const url = (outpass.proof || outpass.document || outpass.file)!;
                                                        handleViewDocument(url);
                                                    }}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#eff6ff',
                                                        border: '1px solid #3b82f6',
                                                        borderRadius: '6px',
                                                        color: '#3b82f6',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    📄 View Doc
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

                {loading && (
                    <div className="mobile-cards-view">
                        {[1, 2, 3].map((idx) => (
                            <div className="mobile-card" key={idx}>
                                <div className="card-header-mobile">
                                    <div className="lux-skeleton" style={{ width: '120px', height: '24px', borderRadius: '12px', marginBottom: '8px' }}></div>
                                    <div className="lux-skeleton" style={{ width: '85px', height: '20px', borderRadius: '10px' }}></div>
                                </div>
                                <div className="card-body-mobile">
                                    <div className="lux-skeleton" style={{ width: '100%', height: '80px', borderRadius: '12px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', alignItems: 'center', paddingBottom: '20px' }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f1f5f9' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#475569' }}
                        >
                            &lt; Previous
                        </button>
                        <span style={{ fontWeight: '600', color: '#64748b' }}>Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f1f5f9' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#475569' }}
                        >
                            Next &gt;
                        </button>
                    </div>
                )}
            </div>

            {/* Document Modal */}
            {showDocumentModal && documentUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDocumentModal(false)}>
                    <div className="bg-white rounded-lg p-4 w-full max-w-4xl h-[90vh] flex flex-col" style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Supporting Document</h3>
                            <button
                                onClick={() => setShowDocumentModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {documentType === 'pdf' ? (
                                <iframe
                                    src={documentUrl}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    title="Document Viewer"
                                />
                            ) : (
                                <img
                                    src={documentUrl}
                                    alt="Proof"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            )}
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                            <a
                                href={documentUrl}
                                download={`proof_document.${documentType === 'pdf' ? 'pdf' : 'jpg'}`}
                                style={{
                                    padding: '8px 16px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: 500
                                }}
                            >
                                Download File
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* ===== BASE / GLOBAL ===== */
                .page-container {
                    min-height: 100vh;
                    background: #f1f5f9;
                }
                .content-wrapper {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 24px 40px;
                }
                .back-btn {
                    background: none;
                    border: none;
                    font-size: 16px;
                    color: #64748b;
                    cursor: pointer;
                    margin-top: 80px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    padding: 0;
                    font-weight: 500;
                }
                .back-btn:hover {
                    color: #1e3a8a;
                    transform: translateX(-4px);
                }

                .page-header {
                    margin-bottom: 28px;
                }
                .page-header h1 {
                    font-size: 2rem;
                    color: #1e293b;
                    margin-bottom: 6px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }
                .subtitle {
                    color: #64748b;
                    font-size: 0.95rem;
                }

                /* ===== FILTERS ===== */
                .filters-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 16px;
                    background: white;
                    padding: 16px;
                    border-radius: 14px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    border: 1px solid #e2e8f0;
                }
                .search-wrapper {
                    position: relative;
                    width: 100%;
                }
                .search-input {
                    width: 100%;
                    padding: 12px 16px 12px 48px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    background: #f8fafc;
                }
                .search-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    outline: none;
                    background: white;
                }
                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.2rem;
                    color: #94a3b8;
                    pointer-events: none;
                }
                .filter-group {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .filter-select-wrapper {
                    position: relative;
                    display: inline-block;
                    flex: 1;
                    min-width: 140px;
                }
                .filter-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    font-size: 14px;
                    pointer-events: none;
                    z-index: 1;
                }
                .filter-arrow {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    font-size: 10px;
                    pointer-events: none;
                }
                .filter-select {
                    width: 100%;
                    padding: 10px 32px 10px 36px;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    color: #1e293b;
                    font-size: 14px;
                    font-weight: 600;
                    outline: none;
                    cursor: pointer;
                    appearance: none;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }
                .filter-select:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    background: white;
                }

                .results-count {
                    color: #64748b;
                    font-size: 0.85rem;
                    margin-bottom: 12px;
                    padding-left: 4px;
                }

                /* ===== DESKTOP TABLE ===== */
                .table-container {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    overflow-x: auto;
                    border: 1px solid #e2e8f0;
                    -webkit-overflow-scrolling: touch;
                }
                .custom-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    min-width: 800px;
                }
                .custom-table th {
                    background: #f8fafc;
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 600;
                    color: #475569;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 0.82rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }
                .custom-table td {
                    padding: 14px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: top;
                    font-size: 0.88rem;
                }
                .custom-table tr:last-child td {
                    border-bottom: none;
                }
                .table-row {
                    transition: background 0.15s ease;
                }
                .table-row:hover {
                    background: #f8fafc;
                }
                .table-row.expanded {
                    background: #f0f9ff;
                }

                .student-info, .pass-info, .date-info, .residence-info, .status-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .pass-type {
                    display: inline-block;
                    background: #eff6ff;
                    color: #3b82f6;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    width: fit-content;
                }

                .date-label {
                    font-size: 0.85rem;
                    color: #475569;
                }

                .status-badge {
                    padding: 3px 10px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    text-transform: capitalize;
                    border: 1px solid;
                    width: fit-content;
                    white-space: nowrap;
                }
                
                .bg-green-100 { background-color: #dcfce7; }
                .text-green-800 { color: #166534; }
                .border-green-200 { border-color: #bbf7d0; }
                
                .bg-red-100 { background-color: #fee2e2; }
                .text-red-800 { color: #991b1b; }
                .border-red-200 { border-color: #fecaca; }
                
                .bg-yellow-100 { background-color: #fef9c3; }
                .text-yellow-800 { color: #854d0e; }
                .border-yellow-200 { border-color: #fde047; }
                
                .font-bold { font-weight: 600; }
                .text-sm { font-size: 0.875rem; }
                .text-xs { font-size: 0.75rem; }
                .text-gray-500 { color: #64748b; }
                .text-gray-400 { color: #94a3b8; }
                .residence-type { text-transform: capitalize; font-weight: 500; }

                .emergency-badge {
                    display: inline-block;
                    background-color: #fee2e2;
                    color: #ef4444;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    margin-left: 8px;
                    border: 1px solid #ef4444;
                    vertical-align: middle;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .emergency-badge.mobile {
                    margin-left: 0;
                    font-size: 0.65rem;
                }

                /* ===== EXPAND BUTTON ===== */
                .expand-btn {
                    padding: 6px 12px;
                    background: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    color: #475569;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .expand-btn:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                    border-color: #94a3b8;
                }

                /* ===== EXPANDED APPROVAL DETAILS ===== */
                .expanded-details-row td {
                    padding: 0 16px 16px 16px !important;
                    background: #f8fbff;
                    border-bottom: 2px solid #3b82f6 !important;
                }
                .approval-details-panel {
                    animation: slideDown 0.3s ease;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .detail-section {
                    margin-bottom: 16px;
                    padding: 12px 14px;
                    background: white;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }
                .detail-section h4 {
                    margin: 0 0 8px 0;
                    font-size: 0.9rem;
                    color: #334155;
                }
                .detail-section p {
                    margin: 0;
                    color: #475569;
                    font-size: 0.85rem;
                    line-height: 1.5;
                }
                .approval-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }
                .approval-card {
                    border-radius: 10px;
                    padding: 14px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    transition: all 0.2s ease;
                }
                .approval-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    transform: translateY(-1px);
                }
                .approval-card.card-approved {
                    border-left: 4px solid #22c55e;
                }
                .approval-card.card-rejected {
                    border-left: 4px solid #ef4444;
                }
                .approval-card.card-pending {
                    border-left: 4px solid #eab308;
                }
                .approval-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .approval-role {
                    font-weight: 700;
                    color: #1e293b;
                    font-size: 0.85rem;
                }
                .mini-badge {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: capitalize;
                    border: 1px solid;
                }
                .approval-card-body {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .approver-name {
                    margin: 0;
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 0.9rem;
                }
                .approver-phone {
                    margin: 0;
                    color: #3b82f6;
                    font-size: 0.8rem;
                }
                .approver-remarks {
                    margin: 0;
                    color: #64748b;
                    font-size: 0.8rem;
                    font-style: italic;
                    background: #f8fafc;
                    padding: 6px 10px;
                    border-radius: 6px;
                    margin-top: 4px;
                    border-left: 3px solid #e2e8f0;
                    word-break: break-word;
                }
                .approver-time {
                    margin: 0;
                    color: #94a3b8;
                    font-size: 0.72rem;
                    margin-top: 4px;
                }

                /* ===== MOBILE CARD STYLES ===== */
                .mobile-cards-view {
                    display: none;
                    flex-direction: column;
                    gap: 14px;
                }

                .mobile-card {
                    background: white;
                    border-radius: 14px;
                    padding: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    border: 1px solid #e2e8f0;
                    transition: box-shadow 0.2s ease;
                }
                .mobile-card:active {
                    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
                }

                .card-header-mobile {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #f1f5f9;
                    gap: 12px;
                }

                .card-name {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                    word-break: break-word;
                }

                .card-reg {
                    font-size: 0.78rem;
                    color: #64748b;
                    margin: 2px 0 0 0;
                }

                .pass-type-mobile {
                    background: #eff6ff;
                    color: #3b82f6;
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .card-body-mobile {
                    margin-bottom: 12px;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                    font-size: 0.84rem;
                    gap: 12px;
                }
                
                .info-row:last-child {
                    margin-bottom: 0;
                }

                .info-row .label {
                    color: #64748b;
                    flex-shrink: 0;
                    font-weight: 500;
                }

                .info-row .value {
                    color: #334155;
                    font-weight: 500;
                    text-align: right;
                    word-break: break-word;
                    min-width: 0;
                }

                .card-footer-mobile {
                    background: #f8fafc;
                    margin: 0 -16px -16px -16px;
                    padding: 14px;
                    border-radius: 0 0 14px 14px;
                    border-top: 1px solid #f1f5f9;
                }

                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6px;
                }

                .status-badge-mobile {
                    font-size: 0.65rem;
                    padding: 4px 6px;
                    border-radius: 6px;
                    text-align: center;
                    font-weight: 600;
                    border: 1px solid;
                    text-transform: capitalize;
                    line-height: 1.3;
                }

                /* ===== MOBILE APPROVAL DETAILS ===== */
                .mobile-approval-toggle {
                    text-align: center;
                    margin-top: 12px;
                    padding: 10px;
                    background: linear-gradient(135deg, #e2e8f0, #dbeafe);
                    border-radius: 10px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #475569;
                    transition: all 0.2s ease;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                }
                .mobile-approval-toggle:active {
                    transform: scale(0.98);
                    background: #cbd5e1;
                }
                .mobile-approval-details {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 12px;
                    animation: slideDown 0.3s ease;
                }
                .mobile-approval-card {
                    padding: 12px;
                    border-radius: 10px;
                    background: white;
                    border: 1px solid #e2e8f0;
                }
                .mobile-approval-card.card-approved {
                    border-left: 4px solid #22c55e;
                }
                .mobile-approval-card.card-rejected {
                    border-left: 4px solid #ef4444;
                }
                .mobile-approval-card.card-pending {
                    border-left: 4px solid #eab308;
                }
                .mobile-role {
                    margin: 0 0 6px 0;
                    font-weight: 700;
                    font-size: 0.8rem;
                    color: #1e293b;
                }
                .mobile-approver {
                    margin: 0;
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: #334155;
                }
                .mobile-phone {
                    margin: 4px 0;
                    font-size: 0.78rem;
                    color: #3b82f6;
                }
                .mobile-remarks {
                    margin: 6px 0 4px 0;
                    font-size: 0.75rem;
                    color: #64748b;
                    font-style: italic;
                    background: #f8fafc;
                    padding: 6px 8px;
                    border-radius: 6px;
                    border-left: 3px solid #e2e8f0;
                    word-break: break-word;
                }
                .mobile-time {
                    margin: 4px 0 0 0;
                    font-size: 0.7rem;
                    color: #94a3b8;
                }

                /* ===== TABLET BREAKPOINT (≤1024px) ===== */
                @media (max-width: 1024px) {
                    .content-wrapper {
                        padding: 0 16px 32px;
                    }
                    .page-header h1 {
                        font-size: 1.75rem;
                    }
                    .custom-table th,
                    .custom-table td {
                        padding: 12px 10px;
                        font-size: 0.82rem;
                    }
                    .approval-cards-grid {
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    }
                    .filter-select-wrapper {
                        min-width: 130px;
                    }
                }

                /* ===== MOBILE BREAKPOINT (≤768px) ===== */
                @media (max-width: 768px) {
                    .table-container {
                        display: none;
                    }
                    .mobile-cards-view {
                        display: flex;
                    }
                    .content-wrapper {
                        padding: 0 12px 24px;
                    }
                    .back-btn {
                        margin-top: 70px;
                        margin-bottom: 16px;
                        font-size: 14px;
                    }
                    .page-header {
                        margin-bottom: 20px;
                    }
                    .page-header h1 {
                        font-size: 1.4rem;
                    }
                    .subtitle {
                        font-size: 0.85rem;
                    }
                    .filters-container {
                        padding: 12px;
                        border-radius: 12px;
                    }
                    .search-input {
                        font-size: 16px; /* Prevent iOS zoom */
                        padding: 11px 14px 11px 44px;
                        border-radius: 10px;
                    }
                    .search-icon {
                        left: 14px;
                        font-size: 1rem;
                    }
                    .filter-group {
                        flex-direction: column;
                        gap: 8px;
                    }
                    .filter-select-wrapper {
                        width: 100%;
                        min-width: unset;
                    }
                    .filter-select {
                        width: 100%;
                        padding: 11px 32px 11px 36px;
                        font-size: 14px;
                        border-radius: 10px;
                    }
                    .results-count {
                        font-size: 0.8rem;
                        padding-left: 2px;
                    }
                    .mobile-card {
                        padding: 14px;
                        border-radius: 12px;
                    }
                    .card-footer-mobile {
                        margin: 0 -14px -14px -14px;
                        padding: 12px;
                        border-radius: 0 0 12px 12px;
                    }
                    .status-grid {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 6px;
                    }
                    .status-badge-mobile {
                        font-size: 0.62rem;
                        padding: 4px 4px;
                    }
                }

                /* ===== SMALL MOBILE BREAKPOINT (≤480px) ===== */
                @media (max-width: 480px) {
                    .content-wrapper {
                        padding: 0 8px 20px;
                    }
                    .back-btn {
                        margin-top: 64px;
                        margin-bottom: 12px;
                        font-size: 13px;
                    }
                    .page-header {
                        margin-bottom: 16px;
                    }
                    .page-header h1 {
                        font-size: 1.2rem;
                    }
                    .subtitle {
                        font-size: 0.8rem;
                    }
                    .filters-container {
                        padding: 10px;
                        gap: 10px;
                    }
                    .search-input {
                        padding: 10px 12px 10px 40px;
                        font-size: 15px;
                    }
                    .search-icon {
                        left: 12px;
                    }
                    .filter-select {
                        padding: 10px 28px 10px 34px;
                        font-size: 13px;
                    }
                    .mobile-cards-view {
                        gap: 10px;
                    }
                    .mobile-card {
                        padding: 12px;
                        border-radius: 10px;
                    }
                    .card-header-mobile {
                        margin-bottom: 10px;
                        padding-bottom: 10px;
                        gap: 8px;
                    }
                    .card-name {
                        font-size: 0.88rem;
                    }
                    .card-reg {
                        font-size: 0.72rem;
                    }
                    .pass-type-mobile {
                        font-size: 0.68rem;
                        padding: 3px 8px;
                    }
                    .card-body-mobile {
                        margin-bottom: 10px;
                    }
                    .info-row {
                        font-size: 0.78rem;
                        margin-bottom: 6px;
                        gap: 8px;
                    }
                    .card-footer-mobile {
                        margin: 0 -12px -12px -12px;
                        padding: 10px;
                        border-radius: 0 0 10px 10px;
                    }
                    .status-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 5px;
                    }
                    .status-badge-mobile {
                        font-size: 0.6rem;
                        padding: 3px 4px;
                    }
                    .mobile-approval-toggle {
                        padding: 8px;
                        font-size: 0.74rem;
                    }
                    .mobile-approval-card {
                        padding: 10px;
                    }
                    .mobile-role {
                        font-size: 0.75rem;
                    }
                    .mobile-approver {
                        font-size: 0.8rem;
                    }
                    .mobile-phone {
                        font-size: 0.74rem;
                    }
                    .mobile-remarks {
                        font-size: 0.72rem;
                        padding: 5px 7px;
                    }
                    .mobile-time {
                        font-size: 0.66rem;
                    }
                    .results-count {
                        font-size: 0.75rem;
                    }
                    .emergency-badge.mobile {
                        font-size: 0.6rem;
                        padding: 1px 4px;
                    }
                }

                /* ===== VERY SMALL MOBILE (≤360px) ===== */
                @media (max-width: 360px) {
                    .content-wrapper {
                        padding: 0 6px 16px;
                    }
                    .back-btn {
                        margin-top: 60px;
                        font-size: 12px;
                    }
                    .page-header h1 {
                        font-size: 1.1rem;
                    }
                    .card-name {
                        font-size: 0.82rem;
                    }
                    .info-row {
                        font-size: 0.74rem;
                        flex-direction: column;
                        gap: 2px;
                    }
                    .info-row .value {
                        text-align: left;
                    }
                    .status-grid {
                        grid-template-columns: 1fr;
                        gap: 4px;
                    }
                }
            `}</style>
        </div >
    );
};

export default YearInchargeOutpassList;
