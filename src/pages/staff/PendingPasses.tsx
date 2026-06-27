import React, { useState, useEffect } from 'react';
import PremiumStaffLoader from '../../components/PremiumStaffLoader';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import StaffHeader from '../../components/StaffHeader';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// ... (interfaces remain same)

interface StudentOutpass {
    id: string;
    studentId: string;
    registerNumber: string;
    studentname: string;
    year: string;
    section: string;
    department: string;
    mobile: string;
    appliedDate: string;
    photo: string;

    // Parents Details
    parentContact: string;

    // Hostel Details
    hostelname: string;
    hostelroomno: string;

    // Bus Details
    boardingPoint?: string;
    busNo?: string;

    // Last Outpass
    lastOutpassFrom?: string;
    lastOutpassTo?: string;
    lastOutpassReason?: string;
    lastOutpassApprovedBy?: string;
    lastOutpassStatus?: ApprovalStatus;

    // Current Request
    reason: string;
    fromDate: string;
    toDate: string;

    // Approval Status
    staffApproval: ApprovalStatus;
    yearInchargeApproval: ApprovalStatus;
    wardenApproval: ApprovalStatus;
    staffApprovedBy?: string;
    outpasstype: string;
    residencetype?: string;
    skillrack?: string;
    attendance?: string;
    document?: string | null;
    remarks?: string;
}

const PendingPasses: React.FC = () => {
    const [selectedStudent, setSelectedStudent] = useState<StudentOutpass | null>(null);
    const [appReady, setAppReady] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus,] = useState<'all' | ApprovalStatus>('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLastPage, setIsLastPage] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'Home' | 'Outing' | 'Emergency' | 'OD'>('all');
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [actionRemarks, setActionRemarks] = useState('');
    const [students, setStudents] = useState<StudentOutpass[]>([]);
    const [roommates, setRoommates] = useState<any[]>([]);
    const [loadingRoommates, setLoadingRoommates] = useState(false);
    const [, setCurrentStaffName] = useState('');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [documentType, setDocumentType] = useState<'image' | 'pdf'>('image');

    const [outpassStats, setOutpassStats] = useState<any>(null);

    useEffect(() => {
        const fetchStaffProfileAndStats = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/staff/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 200) {
                    setCurrentStaffName(response.data.staff.name);
                }
            } catch (error) {
                console.error("Failed to fetch staff profile", error);
            }

            try {
                const statsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/staff/outpass/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statsResponse.status === 200) {
                    const statsArray = statsResponse.data.stats || [];
                    const parsedStats = statsArray.length > 0 && statsArray[0].stats && statsArray[0].stats.length > 0
                        ? statsArray[0].stats[0]
                        : statsResponse.data;
                    setOutpassStats(parsedStats);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStaffProfileAndStats();
    }, []);

    const fetchOutpassDetails = async (outpassId: string) => {
        try {
            setLoadingRoommates(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/staff/outpass/${outpassId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 200) {
                const data = response.data.outpass || (response.data.filterOutpass && response.data.filterOutpass[0]) || {};
                const roomMatesData = response.data.roomMates || [];
                const studentObj = data.student || data.studentid;
                const studentDetails = Array.isArray(studentObj) ? studentObj[0] : (typeof studentObj === 'object' ? studentObj : {});

                const mappedStudent: StudentOutpass = {
                    id: data._id,
                    studentId: studentDetails.registerNumber || 'N/A',
                    registerNumber: studentDetails.registerNumber || 'N/A',
                    studentname: studentDetails.name || 'Student',
                    year: studentDetails.year || 'N/A',
                    section: 'N/A',
                    department: studentDetails.department || 'N/A',
                    mobile: studentDetails.phone || 'N/A',
                    appliedDate: data.createdAt,
                    photo: studentDetails.photo || 'Student',
                    parentContact: studentDetails.parentnumber || 'N/A',
                    hostelname: studentDetails.hostelname || 'N/A',
                    hostelroomno: studentDetails.hostelroomno || 'N/A',
                    boardingPoint: studentDetails.boardingpoint || 'N/A',
                    busNo: studentDetails.busno || 'N/A',
                    reason: data.reason,
                    fromDate: data.fromDate,
                    toDate: data.toDate,
                    staffApproval: data.staff?.status || data.staffapprovalstatus || 'pending',
                    staffApprovedBy: data.staffApprovedBy,
                    yearInchargeApproval: data.yearincharge?.status || data.yearinchargeapprovalstatus || 'pending',
                    wardenApproval: data.warden?.status || data.wardenapprovalstatus || 'pending',
                    lastOutpassFrom: data.lastOutpassFrom,
                    lastOutpassTo: data.lastOutpassTo,
                    lastOutpassReason: data.lastOutpassReason,
                    lastOutpassApprovedBy: data.lastOutpassApprovedBy,
                    lastOutpassStatus: data.lastOutpassStatus,
                    outpasstype: data.outpasstype,
                    residencetype: studentDetails.residencetype || 'day scholar',
                    skillrack: data.skillrack || 'N/A',
                    attendance: data.attendance || 'N/A',
                    document: data.proof || data.document || data.file || null,
                    remarks: data.remarks || ''
                };

                setSelectedStudent(mappedStudent);
                setRoommates(roomMatesData);
            }
        } catch (error) {
            console.error("Failed to fetch outpass details:", error);
            toast.error("Failed to load details");
        } finally {
            setLoadingRoommates(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            const fetchRequests = async () => {
                try {
                    const baseEndpoint = filterStatus === 'pending'
                        ? `/staff/pending/outpass/list?page=${currentPage}`
                        : `/staff/outpass/list?page=${currentPage}`;

                    let appliedDate = '';
                    if (dateFilter === 'today') appliedDate = 'today';
                    else if (dateFilter === 'this_week') appliedDate = 'weekly';
                    else if (dateFilter === 'this_month') appliedDate = 'monthly';

                    const params = new URLSearchParams();
                    if (appliedDate) params.append('appliedDate', appliedDate);
                    if (searchQuery) params.append('search', searchQuery);
                    if (typeFilter && typeFilter !== 'all') params.append('filter', typeFilter);

                    const qs = params.toString();
                    const endpoint = qs ? `${baseEndpoint}&${qs}` : baseEndpoint;

                    const response = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (response.status === 200) {
                        const data = response.data;
                        const outpassList = data.outpasses || data.filterOutpass || data.data || [];

                        if (data.isLast !== undefined) {
                            setIsLastPage(data.isLast);
                        } else {
                            setIsLastPage(true);
                        }

                        if (data.pages !== undefined) {
                            setTotalPages(data.pages);
                        }

                        const mappedStudents = outpassList
                            .map((item: any) => {
                                const studentObj = item.student || item.studentid;
                                const studentDetails = Array.isArray(studentObj) ? studentObj[0] : (typeof studentObj === 'object' ? studentObj : {});
                                return {
                                    id: item._id,
                                    studentId: studentDetails.registerNumber || 'N/A',
                                    registerNumber: studentDetails.registerNumber || 'N/A',
                                    studentname: studentDetails.name || 'Student',
                                    year: studentDetails.year || 'N/A',
                                    section: 'N/A',
                                    department: studentDetails.department || 'N/A',
                                    mobile: studentDetails.phone || 'N/A',
                                    appliedDate: item.createdAt,
                                    photo: studentDetails.photo || 'Student',
                                    parentContact: studentDetails.parentnumber || 'N/A',
                                    hostelName: 'N/A',
                                    roomNumber: 'N/A',
                                    reason: item.reason,
                                    fromDate: item.fromDate,
                                    toDate: item.toDate,
                                    staffApproval: item.staff?.status || item.staffapprovalstatus || 'pending',
                                    yearInchargeApproval: item.yearincharge?.status || item.yearinchargeapprovalstatus || 'pending',
                                    wardenApproval: item.warden?.status || item.wardenapprovalstatus || 'pending',
                                    outpasstype: item.outpasstype,
                                    residencetype: studentDetails.residencetype || 'dayScholar',
                                    document: item.proof || item.document || item.file || null
                                };
                            });

                        // Sort: Emergency first
                        mappedStudents.sort((a: any, b: any) => {
                            if (a.outpasstype === 'Emergency' && b.outpasstype !== 'Emergency') return -1;
                            if (a.outpasstype !== 'Emergency' && b.outpasstype === 'Emergency') return 1;
                            return 0;
                        });

                        setStudents(mappedStudents);
                    }
                } catch (error) {
                    console.error("Error fetching pass requests:", error);
                    toast.error("Failed to load outpass requests");
                }
            };

            fetchRequests();
        }, 500);

        return () => clearTimeout(handler);
    }, [currentPage, filterStatus, dateFilter, searchQuery, typeFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, dateFilter, searchQuery, typeFilter]);

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

    if (!appReady) return <PremiumStaffLoader isDataReady={true} onComplete={() => setAppReady(true)} />;

    // Filter and search logic
    const filteredStudents = students.filter(student => {
        const dateStr = student.appliedDate ? new Date(student.appliedDate).toLocaleDateString() : '';
        const matchesSearch =
            student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.studentname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dateStr.includes(searchQuery.toLowerCase());

        const overallStatus = student.staffApproval;
        const matchesFilter = filterStatus === 'all' || overallStatus === filterStatus;

        let matchesDate = true;
        if (dateFilter !== 'all') {
            const appliedDate = new Date(student.appliedDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dateFilter === 'today') {
                matchesDate = appliedDate >= today;
            } else if (dateFilter === 'yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                matchesDate = appliedDate >= yesterday && appliedDate < today;
            } else if (dateFilter === 'this_week') {
                const thisWeek = new Date(today);
                thisWeek.setDate(today.getDate() - today.getDay());
                matchesDate = appliedDate >= thisWeek;
            } else if (dateFilter === 'this_month') {
                const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                matchesDate = appliedDate >= thisMonth;
            }
        }

        return matchesSearch && matchesFilter && matchesDate;
    }).sort((a, b) => {
        const isAEmergency = a.outpasstype?.toLowerCase() === 'emergency';
        const isBEmergency = b.outpasstype?.toLowerCase() === 'emergency';

        if (isAEmergency && !isBEmergency) return -1;
        if (!isAEmergency && isBEmergency) return 1;

        if (a.staffApproval === 'pending' && b.staffApproval !== 'pending') return -1;
        if (a.staffApproval !== 'pending' && b.staffApproval === 'pending') return 1;

        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    });

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatShortDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getOutpassTypeConfig = (type: string) => {
        const t = type?.toLowerCase();
        if (t === 'emergency') return { bg: '#FEF2F2', color: '#DC2626', border: '#FCA5A5', dot: '#EF4444' };
        if (t === 'od') return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', dot: '#3B82F6' };
        if (t === 'outing') return { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE', dot: '#8B5CF6' };
        return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', dot: '#10B981' };
    };

    const getStatusBadge = (status: ApprovalStatus) => {
        const config = {
            pending: { label: 'Pending', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', dot: '#F59E0B' },
            approved: { label: 'Approved', bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', dot: '#10B981' },
            rejected: { label: 'Rejected', bg: '#FEF2F2', color: '#991B1B', border: '#FCA5A5', dot: '#EF4444' },
        };
        const c = config[status] || config.pending;

        return (
            <span className={`pa-status-pill pa-status-${status}`}>
                <span className="pa-status-dot" style={{ background: c.dot }}></span>
                {c.label}
            </span>
        );
    };

    const handleApprove = () => {
        setActionType('approve');
        setShowActionModal(true);
    };

    const handleReject = () => {
        setActionType('reject');
        setShowActionModal(true);
    };

    const confirmAction = async () => {
        if (!selectedStudent || (actionType === 'reject' && !actionRemarks.trim())) return;

        try {
            const token = localStorage.getItem('token');
            let response;

            if (actionType === 'approve') {
                response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/staff/outpass/approve/${selectedStudent.id}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
            } else {
                response = await axios.put(
                    `${import.meta.env.VITE_API_URL}/staff/outpass/reject/${selectedStudent.id}`,
                    { remarks: actionRemarks },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
            }

            if (response.status === 200) {
                toast.success(response.data.message || `Outpass ${actionType}d successfully`);

                const newStatus = actionType === 'approve' ? 'approved' : 'rejected';

                setStudents(prev => prev.map(student =>
                    student.id === selectedStudent.id
                        ? { ...student, staffApproval: newStatus }
                        : student
                ));

                setSelectedStudent(null);

                setShowActionModal(false);
                setActionRemarks('');
            }
        } catch (error: any) {
            console.error('Error updating outpass status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleViewDocument = (url: string | null) => {
        if (!url) {
            toast.error("Document not found");
            return;
        }
        const fullUrl = `${import.meta.env.VITE_CDN_URL}${url}`;
        setDocumentUrl(fullUrl);
        if (url.toLowerCase().endsWith('.pdf')) {
            setDocumentType('pdf');
        } else {
            setDocumentType('image');
        }
        setShowDocumentModal(true);
    };

    const canApprove = selectedStudent && selectedStudent.staffApproval === 'pending' && selectedStudent.outpasstype !== 'HostelEmergency';

    const counts = {
        total: outpassStats?.total || outpassStats?.Total || students.length,
        pending: outpassStats?.pending || outpassStats?.Pending || 0,
        approved: outpassStats?.approved || outpassStats?.Approved || 0,
        rejected: outpassStats?.rejected || outpassStats?.Rejected || 0,
    };

    return (
        <div className="pa-page mobile-page-content">
            <StaffHeader activeMenu="pendingpasses" />
            <ToastContainer position="bottom-right" />

            <div className="pa-content">
                {!selectedStudent ? (
                    /* ─── LIST VIEW ─── */
                    <div className="pa-list-view">

                        {/* Page Header */}
                        <div className="pa-page-header">
                            <div className="pa-header-left">
                                <div className="pa-header-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                        <rect x="9" y="3" width="6" height="4" rx="1" />
                                        <line x1="9" y1="12" x2="15" y2="12" />
                                        <line x1="9" y1="16" x2="11" y2="16" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="pa-page-title">Pass Approvals</h1>
                                    <p className="pa-page-subtitle">Review and manage student outpass requests</p>
                                </div>
                            </div>
                            <div className="pa-header-stats">
                                <div className="pa-mini-stat pa-mini-pending">
                                    <span className="pa-mini-num">{counts.pending}</span>
                                    <span className="pa-mini-lbl">Pending</span>
                                </div>
                                <div className="pa-mini-stat pa-mini-approved">
                                    <span className="pa-mini-num">{counts.approved}</span>
                                    <span className="pa-mini-lbl">Approved</span>
                                </div>
                                <div className="pa-mini-stat pa-mini-rejected">
                                    <span className="pa-mini-num">{counts.rejected}</span>
                                    <span className="pa-mini-lbl">Rejected</span>
                                </div>
                            </div>
                        </div>

                        {/* Search + Filter Bar */}
                        <div className="pa-controls">
                            <div className="pa-search-wrap">
                                <svg className="pa-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    className="pa-search-input"
                                    type="text"
                                    placeholder="Search by name, ID, or date..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                />
                            </div>

                            <div className="pa-filter-row">
                                <div className="pa-date-select-wrap">
                                    <svg className="pa-date-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <select
                                        className="pa-date-select"
                                        value={dateFilter}
                                        onChange={(e) => { setDateFilter(e.target.value as any); setCurrentPage(1); }}
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="this_week">This Week</option>
                                        <option value="this_month">This Month</option>
                                    </select>
                                </div>
                                <div className="pa-date-select-wrap" style={{ marginLeft: '10px' }}>
                                    <select
                                        className="pa-date-select"
                                        value={typeFilter}
                                        onChange={(e) => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="Home">Home</option>
                                        <option value="Outing">Outing</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="OD">OD</option>
                                    </select>
                                </div>

                                <button className="pa-filter-btn pa-filter-pending active">
                                    Pending
                                </button>
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="pa-results-bar">
                            <span className="pa-results-count">
                                {filteredStudents.length} request{filteredStudents.length !== 1 ? 's' : ''} found
                            </span>
                        </div>

                        {/* Student List */}
                        <div className="pa-list">
                            {filteredStudents.length === 0 ? (
                                <div className="pa-empty-state">
                                    <div className="pa-empty-icon">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                            <rect x="9" y="3" width="6" height="4" rx="1" />
                                        </svg>
                                    </div>
                                    <h3>No requests found</h3>
                                    <p>Try adjusting your search or filter criteria.</p>
                                </div>
                            ) : (
                                filteredStudents.map((student, idx) => {
                                    const typeConfig = getOutpassTypeConfig(student.outpasstype);
                                    const isEmergency = student.outpasstype?.toLowerCase() === 'emergency';
                                    return (
                                        <div
                                            key={student.id}
                                            className={`pa-card ${isEmergency ? 'pa-card-emergency' : ''}`}
                                            style={{ animationDelay: `${idx * 40}ms` }}
                                            onClick={() => fetchOutpassDetails(student.id)}
                                        >
                                            {isEmergency && <div className="pa-emergency-stripe"></div>}

                                            <div className="pa-card-inner">
                                                {/* Left: Avatar + Info */}
                                                <div className="pa-card-left">
                                                    <div className="pa-avatar">
                                                        {student.photo && student.photo !== 'Student' ? (
                                                            <img
                                                                src={student.photo.startsWith('http') ? student.photo : `${import.meta.env.VITE_CDN_URL}${student.photo}`}
                                                                alt={student.studentname}
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className="pa-avatar-fallback">
                                                            {student.studentname.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="pa-card-info">
                                                        <div className="pa-card-name-row">
                                                            <h3 className="pa-card-name">{student.studentname}</h3>
                                                            {isEmergency && (
                                                                <span className="pa-emergency-badge">
                                                                    🚨 Emergency
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="pa-card-regnum">{student.studentId}</span>
                                                        <div className="pa-card-meta">
                                                            <span className="pa-meta-chip">Year {student.year}</span>
                                                            <span className="pa-meta-chip" style={{ background: typeConfig.bg, color: typeConfig.color, borderColor: typeConfig.border }}>
                                                                {student.outpasstype || 'General'}
                                                            </span>
                                                            <span className="pa-meta-chip pa-meta-date">
                                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                                                </svg>
                                                                {formatShortDate(student.appliedDate)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Status + Actions */}
                                                <div className="pa-card-right">
                                                    <div className="pa-approval-row">
                                                        <div className="pa-approval-item">
                                                            <span className="pa-approval-label">Staff</span>
                                                            <span className={`pa-approval-val pa-val-${student.staffApproval}`}>{student.staffApproval}</span>
                                                        </div>
                                                        <div className="pa-approval-item">
                                                            <span className="pa-approval-label">Warden</span>
                                                            <span className={`pa-approval-val pa-val-${student.wardenApproval}`}>{student.wardenApproval}</span>
                                                        </div>
                                                        <div className="pa-approval-item">
                                                            <span className="pa-approval-label">Incharge</span>
                                                            <span className={`pa-approval-val pa-val-${student.yearInchargeApproval}`}>{student.yearInchargeApproval}</span>
                                                        </div>
                                                    </div>
                                                    <div className="pa-card-actions">
                                                        {student.document && (
                                                            <button
                                                                className="pa-doc-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(`${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${student.document!.replace(/^\//, '')}`, '_blank');
                                                                }}
                                                            >
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                                                </svg>
                                                                Doc
                                                            </button>
                                                        )}
                                                        {getStatusBadge(student.staffApproval as ApprovalStatus)}
                                                        <button className="pa-view-btn">
                                                            View
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="9 18 15 12 9 6" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Pagination */}
                        {students.length > 0 && (
                            <div className="pa-pagination">
                                {/* First */}
                                <button
                                    className="pa-page-btn"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    « First
                                </button>

                                {/* Previous */}
                                <button
                                    className="pa-page-btn"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                    Prev
                                </button>

                                {/* Page Numbers */}
                                <div className="pa-page-numbers">
                                    {getPageNumbers().map((pNum, idx) => {
                                        if (pNum === '...') {
                                            return <span key={`dots-${idx}`} className="pa-pnum-dots">...</span>;
                                        }
                                        return (
                                            <button
                                                key={`p-${pNum}`}
                                                className={`pa-pnum-btn ${currentPage === pNum ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(pNum as number)}
                                            >
                                                {pNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Next */}
                                <button
                                    className="pa-page-btn"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || isLastPage}
                                >
                                    Next
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>

                                {/* Last */}
                                <button
                                    className="pa-page-btn"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || isLastPage}
                                >
                                    Last »
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ─── DETAIL VIEW ─── */
                    <div className="pa-detail-view">
                        {/* Back + Header */}
                        <div className="pa-detail-header">
                            <button className="pa-back-btn" onClick={() => setSelectedStudent(null)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                Back to List
                            </button>
                            <div className="pa-detail-title-wrap">
                                <h1 className="pa-detail-title">Outpass Detail</h1>
                                <div className="pa-detail-badges">
                                    <span className={`pa-type-chip pa-type-${selectedStudent.outpasstype?.toLowerCase()}`}>
                                        {selectedStudent.outpasstype}
                                    </span>
                                    {getStatusBadge(selectedStudent.staffApproval as ApprovalStatus)}
                                </div>
                            </div>
                        </div>

                        {/* Cards Grid */}
                        <div className="pa-detail-grid">

                            {/* Student Profile Card */}
                            <div className="pa-detail-card pa-hero-card">
                                <div className="pa-hero-gradient">
                                    <div className="pa-hero-sweep"></div>
                                </div>
                                <div className="pa-hero-content">
                                    <div className="pa-hero-avatar-wrap">
                                        <img
                                            src={selectedStudent.photo.startsWith('http') ? selectedStudent.photo : `${import.meta.env.VITE_CDN_URL}${selectedStudent.photo}`}
                                            alt={selectedStudent.studentname}
                                            className="pa-hero-avatar"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${selectedStudent.studentname}&background=1E3A8A&color=fff`;
                                            }}
                                        />
                                    </div>
                                    <div className="pa-hero-info">
                                        <div className="pa-hero-name">{selectedStudent.studentname}</div>
                                        <div className="pa-hero-reg">{selectedStudent.registerNumber}</div>
                                        <div className="pa-hero-dept">{selectedStudent.department} · Year {selectedStudent.year}</div>
                                        <div className="pa-hero-contact-row">
                                            <a href={`tel:${selectedStudent.mobile}`} className="pa-hero-contact-btn">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12.4a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.87h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                                </svg>
                                                {selectedStudent.mobile}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Request Details Card */}
                            <div className="pa-detail-card">
                                <div className="pa-dc-header">
                                    <div className="pa-dc-icon pa-dc-icon-blue">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                                        </svg>
                                    </div>
                                    <h2 className="pa-dc-title">Request Details</h2>
                                </div>
                                <div className="pa-dc-body">
                                    <div className="pa-field-group pa-field-full">
                                        <label className="pa-field-label">Reason</label>
                                        <div className="pa-field-value pa-reason-text">{selectedStudent.reason}</div>
                                    </div>
                                    {selectedStudent.staffApproval === 'rejected' && selectedStudent.remarks && (
                                        <div className="pa-field-group pa-field-full">
                                            <label className="pa-field-label" style={{ color: '#ef4444' }}>Rejection Remarks</label>
                                            <div className="pa-field-value pa-reason-text" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px' }}>
                                                {selectedStudent.remarks}
                                            </div>
                                        </div>
                                    )}
                                    <div className="pa-fields-row">
                                        <div className="pa-field-group">
                                            <label className="pa-field-label">From Date</label>
                                            <div className="pa-field-value">{formatDateTime(selectedStudent.fromDate)}</div>
                                        </div>
                                        <div className="pa-field-group">
                                            <label className="pa-field-label">To Date</label>
                                            <div className="pa-field-value">{formatDateTime(selectedStudent.toDate)}</div>
                                        </div>
                                        <div className="pa-field-group">
                                            <label className="pa-field-label">Outpass Type</label>
                                            <div className="pa-field-value">
                                                <span className={`pa-type-chip pa-type-${selectedStudent.outpasstype?.toLowerCase()}`}>
                                                    {selectedStudent.outpasstype}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pa-field-group">
                                            <label className="pa-field-label">Applied On</label>
                                            <div className="pa-field-value">{formatDateTime(selectedStudent.appliedDate)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Details Card */}
                            <div className="pa-detail-card">
                                <div className="pa-dc-header">
                                    <div className="pa-dc-icon pa-dc-icon-violet">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                    <h2 className="pa-dc-title">Student Details</h2>
                                </div>
                                <div className="pa-dc-body">
                                    <div className="pa-fields-row">
                                        <div className="pa-field-group">
                                            <label className="pa-field-label">Student ID</label>
                                            <div className="pa-field-value pa-monospace">{selectedStudent.id}</div>
                                        </div>
                                        <div className="pa-field-group">
                                            <label className="pa-field-label">Register Number</label>
                                            <div className="pa-field-value pa-monospace">{selectedStudent.registerNumber}</div>
                                        </div>
                                        <div className="pa-field-group">
                                            <label className="pa-field-label">Department</label>
                                            <div className="pa-field-value">{selectedStudent.department}</div>
                                        </div>
                                        <div className="pa-field-group">
                                            <label className="pa-field-label">Year & Section</label>
                                            <div className="pa-field-value">Year {selectedStudent.year} · Section {selectedStudent.section}</div>
                                        </div>
                                        <div className="pa-field-group">
                                            <label className="pa-field-label">Mobile</label>
                                            <div className="pa-field-value pa-contact-field">
                                                {selectedStudent.mobile}
                                                {selectedStudent.mobile && (
                                                    <a href={`tel:${selectedStudent.mobile}`} className="pa-call-btn">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12.4a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.87h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pa-field-group">
                                            <label className="pa-field-label">Parent Contact</label>
                                            <div className="pa-field-value pa-contact-field">
                                                {selectedStudent.parentContact}
                                                {selectedStudent.parentContact && (
                                                    <a href={`tel:${selectedStudent.parentContact}`} className="pa-call-btn">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12.4a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.87h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Residence Card */}
                            {selectedStudent.residencetype?.toLowerCase() === 'hostel' ? (
                                <div className="pa-detail-card">
                                    <div className="pa-dc-header">
                                        <div className="pa-dc-icon pa-dc-icon-teal">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                                            </svg>
                                        </div>
                                        <h2 className="pa-dc-title">Hostel Details</h2>
                                    </div>
                                    <div className="pa-dc-body">
                                        <div className="pa-fields-row">
                                            <div className="pa-field-group">
                                                <label className="pa-field-label">Hostel Name</label>
                                                <div className="pa-field-value">{selectedStudent.hostelname}</div>
                                            </div>
                                            <div className="pa-field-group">
                                                <label className="pa-field-label">Room Number</label>
                                                <div className="pa-field-value">{selectedStudent.hostelroomno}</div>
                                            </div>
                                        </div>

                                        {/* Roommates */}
                                        <div className="pa-roommates-section">
                                            <h4 className="pa-roommates-title">Roommates</h4>
                                            {loadingRoommates ? (
                                                <div className="pa-loading-text">Loading roommates...</div>
                                            ) : roommates.length > 0 ? (
                                                <div className="pa-roommates-grid">
                                                    {roommates.map((roommate: any) => (
                                                        <div key={roommate._id} className="pa-roommate-card">
                                                            <div className="pa-roommate-avatar">
                                                                <img
                                                                    src={roommate.photo ? (roommate.photo.startsWith('http') ? roommate.photo : `${import.meta.env.VITE_CDN_URL}${roommate.photo}`) : `https://ui-avatars.com/api/?name=${roommate.name}&background=random`}
                                                                    alt={roommate.name}
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${roommate.name}&background=random`;
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="pa-roommate-info">
                                                                <span className="pa-roommate-name">{roommate.name}</span>
                                                                <span className="pa-roommate-reg">{roommate.registerNumber}</span>
                                                                <span className="pa-roommate-dept">{roommate.department}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="pa-no-data">No roommates found</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="pa-detail-card">
                                    <div className="pa-dc-header">
                                        <div className="pa-dc-icon pa-dc-icon-amber">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                                            </svg>
                                        </div>
                                        <h2 className="pa-dc-title">Bus Details</h2>
                                    </div>
                                    <div className="pa-dc-body">
                                        <div className="pa-fields-row">
                                            <div className="pa-field-group">
                                                <label className="pa-field-label">Boarding Point</label>
                                                <div className="pa-field-value">{selectedStudent.boardingPoint || 'N/A'}</div>
                                            </div>
                                            <div className="pa-field-group">
                                                <label className="pa-field-label">Bus Number</label>
                                                <div className="pa-field-value">{selectedStudent.busNo || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Supporting Document */}
                            {selectedStudent.document && (
                                <div className="pa-detail-card">
                                    <div className="pa-dc-header">
                                        <div className="pa-dc-icon pa-dc-icon-rose">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        </div>
                                        <h2 className="pa-dc-title">Supporting Document</h2>
                                    </div>
                                    <div className="pa-dc-body">
                                        <div className="pa-doc-preview">
                                            <div className="pa-doc-icon">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                                </svg>
                                            </div>
                                            <div className="pa-doc-info">
                                                <p className="pa-doc-name">OD Proof Document</p>
                                                <p className="pa-doc-sub">Uploaded by student</p>
                                            </div>
                                            <button
                                                className="pa-view-proof-btn"
                                                onClick={() => handleViewDocument(selectedStudent.document!)}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                                </svg>
                                                View Proof
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Approval Workflow */}
                            <div className="pa-detail-card pa-workflow-card">
                                <div className="pa-dc-header">
                                    <div className="pa-dc-icon pa-dc-icon-green">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <h2 className="pa-dc-title">Approval Workflow</h2>
                                </div>
                                <div className="pa-dc-body">
                                    <div className="pa-workflow">
                                        {/* Step 1: Submitted */}
                                        <div className="pa-workflow-step pa-step-done">
                                            <div className="pa-step-track">
                                                <div className="pa-step-dot pa-dot-done">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </div>
                                                <div className="pa-step-line pa-line-done"></div>
                                            </div>
                                            <div className="pa-step-content">
                                                <h4>Request Submitted</h4>
                                                <p>{formatDateTime(selectedStudent.appliedDate)}</p>
                                            </div>
                                        </div>

                                        {/* Step 2: Staff Approval */}
                                        <div className={`pa-workflow-step ${selectedStudent.staffApproval === 'approved' ? 'pa-step-done' : selectedStudent.staffApproval === 'rejected' ? 'pa-step-rejected' : 'pa-step-active'}`}>
                                            <div className="pa-step-track">
                                                <div className={`pa-step-dot ${selectedStudent.staffApproval === 'approved' ? 'pa-dot-done' : selectedStudent.staffApproval === 'rejected' ? 'pa-dot-rejected' : 'pa-dot-active'}`}>
                                                    {selectedStudent.staffApproval === 'approved' ? (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                    ) : selectedStudent.staffApproval === 'rejected' ? (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                    ) : <span className="pa-dot-pulse"></span>}
                                                </div>
                                                <div className={`pa-step-line ${selectedStudent.staffApproval === 'approved' ? 'pa-line-done' : ''}`}></div>
                                            </div>
                                            <div className="pa-step-content">
                                                <h4>Staff Approval</h4>
                                                <p>Status: <strong className={`pa-status-text-${selectedStudent.staffApproval}`}>{selectedStudent.staffApproval}</strong>
                                                    {selectedStudent.staffApproval === 'approved' && selectedStudent.staffApprovedBy && (
                                                        <span className="pa-approver"> by {selectedStudent.staffApprovedBy}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Step 3: Year Incharge */}
                                        <div className={`pa-workflow-step ${selectedStudent.yearInchargeApproval === 'approved' ? 'pa-step-done' : selectedStudent.yearInchargeApproval === 'rejected' ? 'pa-step-rejected' : (selectedStudent.staffApproval === 'approved' ? 'pa-step-active' : 'pa-step-pending')}`}>
                                            <div className="pa-step-track">
                                                <div className={`pa-step-dot ${selectedStudent.yearInchargeApproval === 'approved' ? 'pa-dot-done' : selectedStudent.yearInchargeApproval === 'rejected' ? 'pa-dot-rejected' : (selectedStudent.staffApproval === 'approved' ? 'pa-dot-active' : 'pa-dot-pending')}`}>
                                                    {selectedStudent.yearInchargeApproval === 'approved' ? (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                    ) : selectedStudent.yearInchargeApproval === 'rejected' ? (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                    ) : selectedStudent.staffApproval === 'approved' ? <span className="pa-dot-pulse"></span> : null}
                                                </div>
                                                {selectedStudent.residencetype === 'hostel' && <div className={`pa-step-line ${selectedStudent.yearInchargeApproval === 'approved' ? 'pa-line-done' : ''}`}></div>}
                                            </div>
                                            <div className="pa-step-content">
                                                <h4>Year Incharge</h4>
                                                <p>{selectedStudent.yearInchargeApproval === 'pending' ? 'Awaiting decision' : `Status: ${selectedStudent.yearInchargeApproval}`}</p>
                                            </div>
                                        </div>

                                        {/* Step 4: Warden (Hostel only) */}
                                        {selectedStudent.residencetype === 'hostel' && (
                                            <div className={`pa-workflow-step ${selectedStudent.wardenApproval === 'approved' ? 'pa-step-done' : selectedStudent.wardenApproval === 'rejected' ? 'pa-step-rejected' : (selectedStudent.yearInchargeApproval === 'approved' ? 'pa-step-active' : 'pa-step-pending')}`}>
                                                <div className="pa-step-track">
                                                    <div className={`pa-step-dot ${selectedStudent.wardenApproval === 'approved' ? 'pa-dot-done' : selectedStudent.wardenApproval === 'rejected' ? 'pa-dot-rejected' : (selectedStudent.yearInchargeApproval === 'approved' ? 'pa-dot-active' : 'pa-dot-pending')}`}>
                                                        {selectedStudent.wardenApproval === 'approved' ? (
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                        ) : selectedStudent.wardenApproval === 'rejected' ? (
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                        ) : selectedStudent.yearInchargeApproval === 'approved' ? <span className="pa-dot-pulse"></span> : null}
                                                    </div>
                                                </div>
                                                <div className="pa-step-content">
                                                    <h4>Warden Approval</h4>
                                                    <p>{selectedStudent.wardenApproval === 'pending' ? 'Awaiting decision' : `Status: ${selectedStudent.wardenApproval}`}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Action Footer */}
                        {canApprove && (
                            <div className="pa-sticky-actions">
                                <div className="pa-sticky-inner">
                                    <div className="pa-sticky-info">
                                        <span className="pa-sticky-name">{selectedStudent.studentname}</span>
                                        <span className="pa-sticky-sub">Staff approval pending for this request</span>
                                    </div>
                                    <div className="pa-sticky-btns">
                                        <button className="pa-approve-btn" onClick={handleApprove}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Approve
                                        </button>
                                        <button className="pa-reject-btn" onClick={handleReject}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {showActionModal && (
                <div className="pa-modal-overlay" onClick={() => setShowActionModal(false)}>
                    <div className="pa-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="pa-modal-header">
                            <div className="pa-modal-title-wrap">
                                <div className={`pa-modal-icon ${actionType === 'approve' ? 'pa-modal-icon-green' : 'pa-modal-icon-red'}`}>
                                    {actionType === 'approve' ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h3 className="pa-modal-title">
                                        {actionType === 'approve' ? 'Approve Outpass' : 'Reject Outpass'}
                                    </h3>
                                    <p className="pa-modal-sub">
                                        {actionType === 'approve' ? 'Confirm outpass approval' : 'Provide reason for rejection'}
                                    </p>
                                </div>
                            </div>
                            <button className="pa-modal-close" onClick={() => setShowActionModal(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        {actionType === 'reject' && (
                            <div className="pa-modal-body">
                                <label className="pa-modal-label">Remarks <span className="pa-required">*</span></label>
                                <textarea
                                    className="pa-modal-textarea"
                                    value={actionRemarks}
                                    onChange={(e) => setActionRemarks(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                    rows={4}
                                />
                            </div>
                        )}
                        <div className="pa-modal-footer" style={{ marginTop: actionType === 'approve' ? '24px' : '0' }}>
                            <button className="pa-modal-cancel" onClick={() => setShowActionModal(false)}>
                                Cancel
                            </button>
                            <button
                                className={`pa-modal-confirm ${actionType === 'approve' ? 'pa-confirm-approve' : 'pa-confirm-reject'}`}
                                onClick={confirmAction}
                                disabled={actionType === 'reject' && !actionRemarks.trim()}
                            >
                                {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Modal */}
            {showDocumentModal && documentUrl && (
                <div className="pa-modal-overlay" onClick={() => setShowDocumentModal(false)}>
                    <div className="pa-doc-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="pa-doc-modal-header">
                            <h3>Document Preview</h3>
                            <button className="pa-modal-close" onClick={() => setShowDocumentModal(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="pa-doc-viewer">
                            {documentType === 'pdf' ? (
                                <iframe src={documentUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Document" />
                            ) : (
                                <img src={documentUrl} alt="Proof" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            )}
                        </div>
                        <div className="pa-doc-modal-footer">
                            <a
                                href={documentUrl}
                                download={`proof_document.${documentType === 'pdf' ? 'pdf' : 'jpg'}`}
                                className="pa-download-btn"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* ─────────────────────────────────────────
                   PASS APPROVAL — Premium Design System
                ───────────────────────────────────────── */

                .pa-page {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 50%, #F0F7FF 100%);
                }

                .pa-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px 24px 120px 24px;
                }

                /* ── LIST VIEW ── */
                .pa-list-view {
                    animation: pa-fade-up 0.35s cubic-bezier(0.16,1,0.3,1) both;
                }

                @keyframes pa-fade-up {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* Page Header */
                .pa-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 28px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .pa-header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .pa-header-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #3B82F6, #60A5FA);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(59,130,246,0.3);
                }

                .pa-page-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0;
                    letter-spacing: -0.04em;
                }

                .pa-page-subtitle {
                    font-size: 0.875rem;
                    color: #64748B;
                    margin: 4px 0 0;
                    font-weight: 500;
                }

                .pa-header-stats {
                    display: flex;
                    gap: 12px;
                }

                .pa-mini-stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 10px 18px;
                    border-radius: 12px;
                    gap: 2px;
                    backdrop-filter: blur(16px);
                }

                .pa-mini-pending { background: rgba(254,243,199,0.8); border: 1px solid #FDE68A; }
                .pa-mini-approved { background: rgba(209,250,229,0.8); border: 1px solid #A7F3D0; }
                .pa-mini-rejected { background: rgba(254,226,226,0.8); border: 1px solid #FCA5A5; }

                .pa-mini-num {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0F172A;
                    line-height: 1;
                }

                .pa-mini-lbl {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                /* Controls */
                .pa-controls {
                    display: flex;
                    gap: 14px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .pa-search-wrap {
                    flex: 1;
                    min-width: 240px;
                    position: relative;
                }

                .pa-search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94A3B8;
                    pointer-events: none;
                }

                .pa-search-input {
                    width: 100%;
                    height: 48px;
                    padding: 0 16px 0 44px;
                    border-radius: 14px;
                    border: 1.5px solid rgba(255,255,255,0.7);
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(16px);
                    font-size: 0.875rem;
                    color: #0F172A;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: all 0.2s;
                    box-sizing: border-box;
                }

                .pa-search-input:focus {
                    outline: none;
                    border-color: #3B82F6;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.12), 0 2px 8px rgba(0,0,0,0.04);
                }

                .pa-filter-row {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .pa-date-select-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .pa-date-icon {
                    position: absolute;
                    left: 12px;
                    color: #64748B;
                    pointer-events: none;
                }

                .pa-date-select {
                    height: 40px;
                    padding: 0 16px 0 34px;
                    border-radius: 10px;
                    border: 1.5px solid #E2E8F0;
                    background: rgba(255,255,255,0.92);
                    font-size: 0.825rem;
                    font-weight: 600;
                    color: #334155;
                    cursor: pointer;
                    outline: none;
                    appearance: none;
                    min-width: 140px;
                }

                .pa-date-select:focus { border-color: #3B82F6; }

                .pa-filter-btn {
                    height: 40px;
                    padding: 0 16px;
                    border-radius: 10px;
                    border: 1.5px solid #E2E8F0;
                    background: rgba(255,255,255,0.92);
                    font-size: 0.825rem;
                    font-weight: 600;
                    color: #64748B;
                    cursor: pointer;
                    transition: all 0.18s ease;
                    backdrop-filter: blur(8px);
                }

                .pa-filter-btn:hover { background: white; border-color: #CBD5E1; color: #334155; }

                .pa-filter-all.active { background: #3B82F6; color: white; border-color: #3B82F6; }
                .pa-filter-pending.active { background: #F59E0B; color: white; border-color: #F59E0B; }
                .pa-filter-approved.active { background: #10B981; color: white; border-color: #10B981; }
                .pa-filter-rejected.active { background: #EF4444; color: white; border-color: #EF4444; }

                .pa-results-bar {
                    margin-bottom: 16px;
                }

                .pa-results-count {
                    font-size: 0.8rem;
                    color: #94A3B8;
                    font-weight: 600;
                }

                /* ── STUDENT CARDS ── */
                .pa-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .pa-card {
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(16px);
                    border: 1.5px solid rgba(255,255,255,0.7);
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    animation: pa-fade-up 0.35s cubic-bezier(0.16,1,0.3,1) both;
                    position: relative;
                    overflow: hidden;
                }

                .pa-card:hover {
                    border-color: #93C5FD;
                    box-shadow: 0 8px 24px rgba(59,130,246,0.12), 0 0 0 1px rgba(59,130,246,0.12);
                    transform: translateY(-2px);
                }

                .pa-card-emergency {
                    border-color: #FCA5A5;
                }

                .pa-card-emergency:hover {
                    border-color: #EF4444;
                    box-shadow: 0 8px 24px rgba(239,68,68,0.12), 0 0 0 1px rgba(239,68,68,0.12);
                }

                .pa-emergency-stripe {
                    position: absolute;
                    top: 0; left: 0;
                    width: 4px;
                    height: 100%;
                    background: linear-gradient(180deg, #EF4444, #F97316);
                    border-radius: 4px 0 0 4px;
                }

                .pa-card-inner {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 18px 20px;
                }

                .pa-card-left {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    flex: 1;
                    min-width: 0;
                }

                .pa-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    overflow: hidden;
                    flex-shrink: 0;
                    position: relative;
                    background: #EFF6FF;
                    border: 2px solid #BFDBFE;
                }

                .pa-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .pa-avatar-fallback {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #DBEAFE, #EFF6FF);
                    color: #3B82F6;
                    font-weight: 800;
                    font-size: 1.1rem;
                }

                .pa-card-info {
                    flex: 1;
                    min-width: 0;
                }

                .pa-card-name-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-bottom: 4px;
                }

                .pa-card-name {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pa-emergency-badge {
                    background: #FEF2F2;
                    color: #DC2626;
                    border: 1px solid #FCA5A5;
                    font-size: 0.68rem;
                    font-weight: 800;
                    padding: 2px 8px;
                    border-radius: 20px;
                    white-space: nowrap;
                }

                .pa-card-regnum {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #64748B;
                    font-family: monospace;
                    display: block;
                    margin-bottom: 8px;
                }

                .pa-card-meta {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .pa-meta-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 24px;
                    padding: 0 10px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    background: #F1F5F9;
                    color: #475569;
                    border: 1px solid #E2E8F0;
                    white-space: nowrap;
                }

                .pa-meta-date {
                    color: #64748B;
                }

                .pa-card-right {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 12px;
                    flex-shrink: 0;
                }

                .pa-approval-row {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .pa-approval-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                }

                .pa-approval-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #94A3B8;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                .pa-approval-val {
                    font-size: 0.68rem;
                    font-weight: 700;
                    text-transform: capitalize;
                    padding: 2px 7px;
                    border-radius: 4px;
                }

                .pa-val-pending  { background: #FFFBEB; color: #D97706; }
                .pa-val-approved { background: #ECFDF5; color: #059669; }
                .pa-val-rejected { background: #FEF2F2; color: #DC2626; }

                .pa-card-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pa-doc-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 28px;
                    padding: 0 10px;
                    border-radius: 7px;
                    background: #F1F5F9;
                    border: 1px solid #E2E8F0;
                    color: #475569;
                    font-size: 0.72rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .pa-doc-btn:hover { background: #E2E8F0; }

                .pa-status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 28px;
                    padding: 0 12px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    white-space: nowrap;
                }

                .pa-status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .pa-status-pending  { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }
                .pa-status-approved { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
                .pa-status-rejected { background: #FEF2F2; color: #991B1B; border: 1px solid #FCA5A5; }

                .pa-view-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 32px;
                    padding: 0 14px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #3B82F6, #60A5FA);
                    border: none;
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 6px rgba(59,130,246,0.3);
                }

                .pa-view-btn:hover {
                    box-shadow: 0 4px 12px rgba(59,130,246,0.4);
                    transform: translateY(-1px);
                }

                /* Empty State */
                .pa-empty-state {
                    padding: 64px 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    text-align: center;
                    background: rgba(255,255,255,0.6);
                    border-radius: 20px;
                    border: 1.5px dashed #CBD5E1;
                }

                .pa-empty-icon {
                    width: 80px;
                    height: 80px;
                    background: #F1F5F9;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 8px;
                }

                .pa-empty-state h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #334155;
                    margin: 0;
                }

                .pa-empty-state p {
                    font-size: 0.875rem;
                    color: #94A3B8;
                    margin: 0;
                }

                /* Pagination */
                .pa-pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    margin-top: 28px;
                    flex-wrap: wrap;
                }

                .pa-page-numbers {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .pa-pnum-btn {
                    width: 38px;
                    height: 38px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    border: 1.5px solid #E2E8F0;
                    background: rgba(255,255,255,0.92);
                    color: #64748B;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .pa-pnum-btn:hover {
                    border-color: #93C5FD;
                    color: #3B82F6;
                    background: white;
                }

                .pa-pnum-btn.active {
                    background: #3B82F6;
                    color: white;
                    border-color: #3B82F6;
                    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
                }

                .pa-pnum-dots {
                    color: #94A3B8;
                    font-weight: 700;
                    padding: 0 4px;
                    font-size: 0.9rem;
                }

                .pa-page-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 40px;
                    padding: 0 18px;
                    border-radius: 10px;
                    border: 1.5px solid #E2E8F0;
                    background: rgba(255,255,255,0.92);
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #334155;
                    cursor: pointer;
                    transition: all 0.18s;
                }

                .pa-page-btn:hover:not(:disabled) {
                    border-color: #93C5FD;
                    background: white;
                    color: #3B82F6;
                }

                .pa-page-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .pa-page-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.875rem;
                }

                .pa-page-current {
                    font-weight: 800;
                    color: #3B82F6;
                    background: #EFF6FF;
                    padding: 4px 12px;
                    border-radius: 6px;
                }

                .pa-page-sep { color: #94A3B8; }
                .pa-page-total { font-weight: 600; color: #64748B; }

                /* ── DETAIL VIEW ── */
                .pa-detail-view {
                    animation: pa-fade-up 0.3s cubic-bezier(0.16,1,0.3,1) both;
                }

                .pa-detail-header {
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .pa-back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    height: 38px;
                    padding: 0 16px;
                    border-radius: 10px;
                    border: 1.5px solid #E2E8F0;
                    background: rgba(255,255,255,0.92);
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #334155;
                    cursor: pointer;
                    transition: all 0.18s;
                    width: fit-content;
                }

                .pa-back-btn:hover {
                    border-color: #93C5FD;
                    color: #3B82F6;
                    background: white;
                    transform: translateX(-2px);
                }

                .pa-detail-title-wrap {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .pa-detail-title {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0;
                    letter-spacing: -0.03em;
                }

                .pa-detail-badges {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .pa-type-chip {
                    display: inline-flex;
                    align-items: center;
                    height: 28px;
                    padding: 0 12px;
                    border-radius: 7px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    text-transform: capitalize;
                    border: 1px solid transparent;
                }

                .pa-type-emergency { background: #FEF2F2; color: #DC2626; border-color: #FCA5A5; }
                .pa-type-od        { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }
                .pa-type-outing    { background: #F5F3FF; color: #7C3AED; border-color: #DDD6FE; }
                .pa-type-home      { background: #ECFDF5; color: #059669; border-color: #A7F3D0; }

                /* Detail Grid */
                .pa-detail-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* Detail Cards */
                .pa-detail-card {
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(16px);
                    border: 1.5px solid rgba(255,255,255,0.7);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: box-shadow 0.2s;
                }

                .pa-detail-card:hover {
                    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                }

                /* Hero Card */
                .pa-hero-card {
                    position: relative;
                    overflow: hidden;
                }

                .pa-hero-gradient {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #3B82F6 100%);
                }

                .pa-hero-sweep {
                    position: absolute;
                    top: 0; left: -120%;
                    width: 60%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
                    transform: skewX(-20deg);
                    animation: pa-sweep 6s infinite;
                    pointer-events: none;
                }

                @keyframes pa-sweep {
                    0%    { left: -120%; }
                    25%, 100% { left: 220%; }
                }

                .pa-hero-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 24px;
                }

                .pa-hero-avatar-wrap {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    border: 3px solid rgba(255,255,255,0.2);
                    overflow: hidden;
                    flex-shrink: 0;
                    background: rgba(255,255,255,0.1);
                }

                .pa-hero-avatar {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .pa-hero-info {
                    flex: 1;
                    min-width: 0;
                }

                .pa-hero-name {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: white;
                    margin-bottom: 4px;
                    letter-spacing: -0.02em;
                }

                .pa-hero-reg {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.7);
                    font-family: monospace;
                    margin-bottom: 4px;
                }

                .pa-hero-dept {
                    font-size: 0.9rem;
                    color: rgba(255,255,255,0.85);
                    font-weight: 500;
                    margin-bottom: 12px;
                }

                .pa-hero-contact-row { display: flex; gap: 8px; }

                .pa-hero-contact-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 32px;
                    padding: 0 14px;
                    border-radius: 20px;
                    background: rgba(255,255,255,0.12);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.15s;
                    backdrop-filter: blur(8px);
                }

                .pa-hero-contact-btn:hover {
                    background: rgba(255,255,255,0.22);
                }

                /* Card Header */
                .pa-dc-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 18px 20px;
                    border-bottom: 1px solid rgba(0,0,0,0.04);
                    background: rgba(248,250,252,0.8);
                }

                .pa-dc-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .pa-dc-icon-blue   { background: #DBEAFE; color: #2563EB; }
                .pa-dc-icon-violet { background: #EDE9FE; color: #7C3AED; }
                .pa-dc-icon-teal   { background: #CCFBF1; color: #0D9488; }
                .pa-dc-icon-amber  { background: #FEF3C7; color: #D97706; }
                .pa-dc-icon-green  { background: #DCFCE7; color: #16A34A; }
                .pa-dc-icon-rose   { background: #FFE4E6; color: #E11D48; }

                .pa-dc-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0;
                    letter-spacing: -0.01em;
                }

                /* Card Body */
                .pa-dc-body {
                    padding: 20px;
                }

                .pa-fields-row {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .pa-field-full {
                    grid-column: 1 / -1;
                }

                .pa-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding: 12px 14px;
                    background: rgba(248,250,252,0.7);
                    border: 1px solid rgba(226,232,240,0.6);
                    border-radius: 10px;
                }

                .pa-field-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #94A3B8;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .pa-field-value {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #0F172A;
                    line-height: 1.4;
                }

                .pa-reason-text {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #334155;
                    white-space: pre-wrap;
                    line-height: 1.6;
                }

                .pa-monospace {
                    font-family: monospace;
                    font-size: 0.82rem;
                    color: #3B82F6;
                }

                .pa-contact-field {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pa-call-btn {
                    width: 24px;
                    height: 24px;
                    background: #10B981;
                    color: white;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    transition: all 0.15s;
                    flex-shrink: 0;
                }

                .pa-call-btn:hover { background: #059669; transform: scale(1.1); }

                /* Roommates */
                .pa-roommates-section {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px dashed #E2E8F0;
                }

                .pa-roommates-title {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 0 0 12px;
                }

                .pa-roommates-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 10px;
                }

                .pa-roommate-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 10px;
                    transition: all 0.15s;
                }

                .pa-roommate-card:hover { border-color: #93C5FD; background: #EFF6FF; }

                .pa-roommate-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    overflow: hidden;
                    flex-shrink: 0;
                    background: #DBEAFE;
                }

                .pa-roommate-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .pa-roommate-info {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    min-width: 0;
                }

                .pa-roommate-name {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #0F172A;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pa-roommate-reg {
                    font-size: 0.72rem;
                    color: #64748B;
                    font-family: monospace;
                }

                .pa-roommate-dept {
                    font-size: 0.7rem;
                    color: #3B82F6;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Document Preview */
                .pa-doc-preview {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 16px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 10px;
                }

                .pa-doc-icon {
                    width: 44px;
                    height: 44px;
                    background: #EFF6FF;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .pa-doc-info { flex: 1; }

                .pa-doc-name {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #0F172A;
                    margin: 0 0 2px;
                }

                .pa-doc-sub {
                    font-size: 0.78rem;
                    color: #94A3B8;
                    margin: 0;
                }

                .pa-view-proof-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 36px;
                    padding: 0 14px;
                    border-radius: 8px;
                    background: white;
                    border: 1.5px solid #3B82F6;
                    color: #3B82F6;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                    white-space: nowrap;
                }

                .pa-view-proof-btn:hover {
                    background: #EFF6FF;
                    box-shadow: 0 2px 6px rgba(59,130,246,0.2);
                }

                /* Approval Workflow */
                .pa-workflow {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .pa-workflow-step {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                }

                .pa-step-track {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0;
                    flex-shrink: 0;
                }

                .pa-step-dot {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    z-index: 1;
                    flex-shrink: 0;
                    border: 2px solid transparent;
                }

                .pa-dot-done     { background: #10B981; border-color: #10B981; }
                .pa-dot-active   { background: white; border-color: #3B82F6; box-shadow: 0 0 0 4px rgba(59,130,246,0.12); }
                .pa-dot-rejected { background: #EF4444; border-color: #EF4444; }
                .pa-dot-pending  { background: #F1F5F9; border-color: #CBD5E1; }

                .pa-dot-pulse {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #3B82F6;
                    animation: pa-pulse 2s infinite;
                }

                @keyframes pa-pulse {
                    0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.7); }
                    70%  { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
                    100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
                }

                .pa-step-line {
                    width: 2px;
                    height: 32px;
                    background: #E2E8F0;
                    flex-shrink: 0;
                }

                .pa-line-done { background: #10B981; }

                .pa-step-content {
                    padding: 4px 0 20px;
                    flex: 1;
                }

                .pa-workflow-step:last-child .pa-step-content {
                    padding-bottom: 0;
                }

                .pa-step-content h4 {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0 0 4px;
                }

                .pa-step-content p {
                    font-size: 0.8rem;
                    color: #64748B;
                    margin: 0;
                }

                .pa-status-text-pending  { color: #D97706; }
                .pa-status-text-approved { color: #059669; }
                .pa-status-text-rejected { color: #DC2626; }

                .pa-approver {
                    color: #94A3B8;
                    font-style: italic;
                    font-weight: 400;
                }

                /* Misc detail elements */
                .pa-loading-text { color: #94A3B8; font-size: 0.875rem; font-style: italic; }
                .pa-no-data      { color: #94A3B8; font-size: 0.875rem; }

                /* ── STICKY ACTIONS ── */
                .pa-sticky-actions {
                    position: fixed;
                    bottom: 0; left: 0; right: 0;
                    background: rgba(255,255,255,0.9);
                    backdrop-filter: blur(20px);
                    border-top: 1px solid rgba(0,0,0,0.06);
                    padding: 12px 24px;
                    z-index: 200;
                    box-shadow: 0 -4px 24px rgba(0,0,0,0.06);
                }

                .pa-sticky-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                }

                .pa-sticky-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .pa-sticky-name {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0F172A;
                }

                .pa-sticky-sub {
                    font-size: 0.78rem;
                    color: #64748B;
                }

                .pa-sticky-btns {
                    display: flex;
                    gap: 10px;
                }

                .pa-approve-btn, .pa-reject-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    height: 42px;
                    padding: 0 24px;
                    border-radius: 10px;
                    border: none;
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .pa-approve-btn {
                    background: linear-gradient(135deg, #10B981, #059669);
                    color: white;
                    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
                }

                .pa-approve-btn:hover {
                    box-shadow: 0 6px 20px rgba(16,185,129,0.4);
                    transform: translateY(-1px);
                }

                .pa-reject-btn {
                    background: linear-gradient(135deg, #EF4444, #DC2626);
                    color: white;
                    box-shadow: 0 4px 12px rgba(239,68,68,0.3);
                }

                .pa-reject-btn:hover {
                    box-shadow: 0 6px 20px rgba(239,68,68,0.4);
                    transform: translateY(-1px);
                }

                /* ── MODALS ── */
                .pa-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15,23,42,0.5);
                    backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .pa-modal {
                    background: white;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 460px;
                    box-shadow: 0 24px 48px rgba(0,0,0,0.15);
                    overflow: hidden;
                    animation: pa-modal-in 0.25s cubic-bezier(0.16,1,0.3,1) both;
                }

                @keyframes pa-modal-in {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                .pa-modal-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid #F1F5F9;
                }

                .pa-modal-title-wrap {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                }

                .pa-modal-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .pa-modal-icon-green { background: #DCFCE7; color: #16A34A; }
                .pa-modal-icon-red   { background: #FEE2E2; color: #DC2626; }

                .pa-modal-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0 0 4px;
                }

                .pa-modal-sub {
                    font-size: 0.8rem;
                    color: #64748B;
                    margin: 0;
                }

                .pa-modal-close {
                    background: none;
                    border: none;
                    color: #94A3B8;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 6px;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                }

                .pa-modal-close:hover { background: #F1F5F9; color: #334155; }

                .pa-modal-body {
                    padding: 20px 24px;
                }

                .pa-modal-label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 10px;
                }

                .pa-required { color: #EF4444; }

                .pa-modal-textarea {
                    width: 100%;
                    padding: 12px 14px;
                    border: 1.5px solid #E2E8F0;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    resize: vertical;
                    background: #FAFAFA;
                    color: #0F172A;
                    line-height: 1.5;
                    transition: all 0.15s;
                    box-sizing: border-box;
                }

                .pa-modal-textarea:focus {
                    outline: none;
                    border-color: #3B82F6;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
                }

                .pa-modal-footer {
                    padding: 0 24px 20px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }

                .pa-modal-cancel {
                    height: 40px;
                    padding: 0 18px;
                    border-radius: 8px;
                    border: 1.5px solid #E2E8F0;
                    background: white;
                    color: #64748B;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .pa-modal-cancel:hover { background: #F8FAFC; }

                .pa-modal-confirm {
                    height: 40px;
                    padding: 0 20px;
                    border-radius: 8px;
                    border: none;
                    font-size: 0.875rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .pa-confirm-approve {
                    background: #10B981;
                    color: white;
                }

                .pa-confirm-approve:hover:not(:disabled) { background: #059669; }

                .pa-confirm-reject {
                    background: #EF4444;
                    color: white;
                }

                .pa-confirm-reject:hover:not(:disabled) { background: #DC2626; }

                .pa-modal-confirm:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }

                /* Doc Modal */
                .pa-doc-modal {
                    background: white;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 960px;
                    height: 90vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 24px 48px rgba(0,0,0,0.2);
                    animation: pa-modal-in 0.25s cubic-bezier(0.16,1,0.3,1) both;
                }

                .pa-doc-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid #F1F5F9;
                }

                .pa-doc-modal-header h3 {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0;
                }

                .pa-doc-viewer {
                    flex: 1;
                    overflow: hidden;
                    background: #F1F5F9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .pa-doc-modal-footer {
                    padding: 14px 20px;
                    border-top: 1px solid #F1F5F9;
                    display: flex;
                    justify-content: flex-end;
                }

                .pa-download-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    height: 38px;
                    padding: 0 18px;
                    border-radius: 8px;
                    background: #3B82F6;
                    color: white;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 600;
                    transition: all 0.15s;
                }

                .pa-download-btn:hover { background: #2563EB; }

                /* ── RESPONSIVE ── */
                @media (max-width: 768px) {
                    .pa-content {
                        padding: 16px 16px 140px;
                    }

                    .pa-page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 14px;
                    }

                    .pa-header-stats {
                        align-self: stretch;
                        justify-content: space-between;
                    }

                    .pa-mini-stat {
                        flex: 1;
                    }

                    .pa-controls {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 10px;
                    }

                    .pa-search-wrap {
                        min-width: 0;
                        width: 100%;
                    }

                    .pa-filter-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 8px;
                    }

                    .pa-date-select-wrap {
                        grid-column: 1 / -1;
                    }

                    .pa-date-select {
                        width: 100%;
                        height: 44px;
                    }

                    .pa-filter-btn {
                        height: 44px;
                        width: 100%;
                    }

                    .pa-card-inner {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .pa-card-left {
                        width: 100%;
                    }

                    .pa-card-right {
                        width: 100%;
                        align-items: flex-start;
                    }

                    .pa-approval-row {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .pa-card-actions {
                        width: 100%;
                        justify-content: flex-end;
                    }

                    .pa-fields-row {
                        grid-template-columns: 1fr;
                    }

                    .pa-detail-title {
                        font-size: 1.3rem;
                    }

                    .pa-hero-content {
                        flex-direction: column;
                        text-align: center;
                    }

                    .pa-hero-contact-row {
                        justify-content: center;
                    }

                    .pa-sticky-inner {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 10px;
                    }

                    .pa-sticky-btns {
                        flex-direction: column;
                    }

                    .pa-approve-btn,
                    .pa-reject-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .pa-doc-modal {
                        width: 100%;
                        height: 100%;
                        border-radius: 0;
                    }
                }

                @media (max-width: 480px) {
                    .pa-page-title { font-size: 1.4rem; }

                    .pa-card-name-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 4px;
                    }

                    .pa-card-meta { flex-wrap: wrap; }

                    .pa-approval-row { flex-wrap: wrap; gap: 8px; }
                }
            `}</style>
        </div>
    );
};

export default PendingPasses;
