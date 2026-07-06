import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

import StudentHeader from '../../components/StudentHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import StudentBottomNav from '../../components/StudentBottomNav';

// Outpass status types
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface OutpassData {
    id: string;
    studentId: string;
    studentName: string;
    fromDate: string;
    toDate: string;
    reason: string;
    outpassType: string;
    overallStatus: ApprovalStatus;
    staffApproval: {
        status: ApprovalStatus;
        approverName?: string;
        remarks?: string;
        approvedAt?: string;
        rejectedAt?: string;
    };
    yearInchargeApproval: {
        status: ApprovalStatus;
        approverName?: string;
        remarks?: string;
        approvedAt?: string;
        rejectedAt?: string;
    };
    wardenApproval: {
        status: ApprovalStatus;
        approverName?: string;
        remarks?: string;
        approvedAt?: string;
        rejectedAt?: string;
    };
    createdAt: string;
    document?: string;
    remarks?: string;
    out?: string;
    in?: string;
    isLate?: boolean;
}

const OutpassDetails: React.FC = () => {
    const navigate = useNavigate();
    const [selectedOutpass, setSelectedOutpass] = useState<OutpassData | null>(null);

    const [outpasses, setOutpasses] = useState<OutpassData[]>([]);
    const [loading, setLoading] = useState(true);
    const [residenceType, setResidenceType] = useState<string>('');
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [documentType, setDocumentType] = useState<'pdf' | 'image' | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    
    // For real-time QR code display logic
    const [currentTime, setCurrentTime] = useState(Date.now());
    
    // Filtering state
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    useEffect(() => {
        // Update current time every minute to refresh QR visibility
        const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch Profile for Residence Type
                const profilePromise = axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Fetch Outpasses
                const outpassesPromise = axios.get(`${import.meta.env.VITE_API_URL}/api/outpass`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const [profileResponse, outpassResponse] = await Promise.all([profilePromise, outpassesPromise]);

                if (profileResponse.status === 200) {
                    const userData = profileResponse.data.user;
                    setResidenceType(userData.residencetype?.toLowerCase() || '');
                }

                if (outpassResponse.status === 200) {
                    const outpassList = outpassResponse.data.outpasses || outpassResponse.data.filterOutpass || [];
                    const mappedOutpasses = outpassList.map((item: any) => ({
                        id: item._id,
                        studentId: (typeof item.studentid === 'object' && item.studentid !== null)
                            ? (item.studentid.registerNumber || item.studentid.name || 'Unknown')
                            : String(item.studentid || ''),
                        studentName: (typeof item.studentid === 'object' && item.studentid !== null)
                            ? (item.studentid.name || 'Student')
                            : 'Student',
                        fromDate: item.fromDate,
                        toDate: item.toDate,
                        reason: item.reason,
                        outpassType: item.outpasstype || 'General',
                        overallStatus: item.status || 'pending',
                        createdAt: item.createdAt,
                        document: item.proof || item.document || item.file || null,
                        remarks: item.remarks || '',
                        out: item.out,
                        in: item.in,
                        isLate: !!item.isLate || (item.in && new Date(item.in) > new Date(item.toDate)),
                        staffApproval: {
                            status: item.staff?.status || item.staffapprovalstatus || 'pending',
                            approverName: item.staffid?.name,
                            remarks: (item.staff?.status === 'rejected' ? item.remarks : '') || item.staffremarks || '',
                            approvedAt: item.staff?.actionAt || item.staffapprovedAt,
                            rejectedAt: (item.staff?.status === 'rejected' ? item.staff?.actionAt : undefined) || (item.staffapprovalstatus === 'rejected' ? item.updatedAt : undefined)
                        },
                        yearInchargeApproval: {
                            status: item.yearincharge?.status || item.yearinchargeapprovalstatus || 'pending',
                            approverName: item.inchargeid?.name,
                            remarks: (item.yearincharge?.status === 'rejected' ? item.remarks : '') || item.yearinchargeremarks || '',
                            approvedAt: item.yearincharge?.actionAt || item.yearinchargeapprovedAt,
                            rejectedAt: (item.yearincharge?.status === 'rejected' ? item.yearincharge?.actionAt : undefined) || (item.yearinchargeapprovalstatus === 'rejected' ? item.updatedAt : undefined)
                        },
                        wardenApproval: {
                            status: item.warden?.status || item.wardenapprovalstatus || 'pending',
                            approverName: item.wardenid?.name,
                            remarks: (item.warden?.status === 'rejected' ? item.remarks : '') || item.wardenremarks || '',
                            approvedAt: item.warden?.actionAt || item.wardenapprovedAt,
                            rejectedAt: (item.warden?.status === 'rejected' ? item.warden?.actionAt : undefined) || (item.wardenapprovalstatus === 'rejected' ? item.updatedAt : undefined)
                        }
                    }));
                    // Sort outpasses by creation date descending
                    mappedOutpasses.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setOutpasses(mappedOutpasses);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusBadge = (status: string) => {
        const normalizedStatus = (status || 'pending').toLowerCase();
        if (normalizedStatus === 'approved') {
            return <span className="pb-status-badge pb-status-approved">Approved</span>;
        } else if (normalizedStatus === 'rejected' || normalizedStatus === 'declined') {
            return <span className="pb-status-badge pb-status-rejected">Rejected</span>;
        }
        return <span className="pb-status-badge pb-status-pending">Pending</span>;
    };

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

    const handleViewDocument = (url: string | undefined) => {
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

    const isWithinTimeWindow = (fromDate: string, toDate: string) => {
        const now = currentTime;
        const fromTime = new Date(fromDate).getTime();
        const toTime = new Date(toDate).getTime();
        return now >= fromTime && now <= toTime;
    };

    const filteredOutpasses = outpasses.filter(op => {
        if (activeFilter === 'all') return true;
        return op.overallStatus === activeFilter;
    });

    const renderTimeline = (outpass: OutpassData) => {
        const steps = [
            {
                title: 'Staff / Tutor Advisor',
                status: outpass.staffApproval.status,
                name: outpass.staffApproval.approverName,
                time: outpass.staffApproval.approvedAt || outpass.staffApproval.rejectedAt,
                remarks: outpass.staffApproval.remarks,
                icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                )
            },
            {
                title: 'Year Incharge',
                status: outpass.yearInchargeApproval.status,
                name: outpass.yearInchargeApproval.approverName,
                time: outpass.yearInchargeApproval.approvedAt || outpass.yearInchargeApproval.rejectedAt,
                remarks: outpass.yearInchargeApproval.remarks,
                icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                )
            }
        ];

        if (residenceType === 'hostel') {
            steps.push({
                title: 'Hostel Warden',
                status: outpass.wardenApproval.status,
                name: outpass.wardenApproval.approverName,
                time: outpass.wardenApproval.approvedAt || outpass.wardenApproval.rejectedAt,
                remarks: outpass.wardenApproval.remarks,
                icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                )
            });
        }

        return (
            <div className="pb-timeline-stepper">
                {steps.map((step, idx) => {
                    let statusClass = 'pb-timeline-pending';
                    if (step.status === 'approved') statusClass = 'pb-timeline-approved';
                    if (step.status === 'rejected') statusClass = 'pb-timeline-rejected';

                    return (
                        <div key={idx} className={`pb-timeline-step-item ${statusClass}`}>
                            <div className="pb-timeline-indicator">
                                <span className="pb-timeline-icon-wrapper">{step.icon}</span>
                            </div>
                            {idx < steps.length - 1 && <div className="pb-timeline-connector"></div>}
                            
                            <div className="pb-timeline-card">
                                <div className="pb-timeline-header-row">
                                    <h4 className="pb-timeline-title">{step.title}</h4>
                                    <span className={`pb-step-badge ${
                                        step.status === 'approved' ? 'pb-badge-green' : 
                                        step.status === 'rejected' ? 'pb-badge-red' : 'pb-badge-amber'
                                    }`}>
                                        {step.status}
                                    </span>
                                </div>
                                
                                <div className="pb-timeline-details-list">
                                    {step.name && (
                                        <div className="pb-detail-item">
                                            <span className="pb-label">Approver</span>
                                            <span className="pb-val">{step.name}</span>
                                        </div>
                                    )}
                                    {step.time && (
                                        <div className="pb-detail-item">
                                            <span className="pb-label">Date/Time</span>
                                            <span className="pb-val">{formatDateTime(step.time)}</span>
                                        </div>
                                    )}
                                    {step.remarks && (
                                        <div className="pb-detail-item pb-remarks-item">
                                            <span className="pb-label">Remarks</span>
                                            <span className="pb-val">"{step.remarks}"</span>
                                        </div>
                                    )}
                                    {!step.name && step.status === 'pending' && (
                                        <span className="pb-timeline-waiting">Waiting for review...</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="pb-outpass-page">
            <ToastContainer position="bottom-right" />

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
                <StudentHeader />
                <main className="student-content">
                    <div className="content-wrapper">
                        {/* Back button */}
                        {!selectedOutpass && (
                            <div className="pb-back-link-wrapper">
                                <button className="pb-btn-back" onClick={() => navigate('/dashboard')}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="19" y1="12" x2="5" y2="12" />
                                        <polyline points="12 19 5 12 12 5" />
                                    </svg>
                                    Back to Dashboard
                                </button>
                            </div>
                        )}

                        {/* Header Section */}
                        <div className="pb-page-header-row">
                            <div>
                                <h1 className="pb-page-title">
                                    {selectedOutpass ? 'Track Outpass' : 'My Outpasses'}
                                </h1>
                                <p className="pb-page-subtitle">
                                    {selectedOutpass ? 'Track the active approval timeline' : 'View and track all campus exit history'}
                                </p>
                            </div>
                            {!selectedOutpass && (
                                <button
                                    className="pb-apply-btn"
                                    onClick={() => navigate('/new-outpass')}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Apply Outpass
                                </button>
                            )}
                        </div>

                        {!selectedOutpass ? (
                            /* LIST VIEW WITH TABS FILTER */
                            <div className="pb-list-view-container">
                                <div className="pb-tab-filters-container">
                                    {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                                        <button
                                            key={filter}
                                            className={`pb-tab-filter-btn capitalize ${activeFilter === filter ? 'active' : ''}`}
                                            onClick={() => setActiveFilter(filter)}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>

                                {loading ? (
                                    <LoadingSpinner />
                                ) : filteredOutpasses.length === 0 ? (
                                    <div className="pb-empty-state-card">
                                        <div className="pb-empty-state-icon">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                                <path d="M7 8h10" />
                                                <path d="M7 12h10" />
                                                <path d="M7 16h10" />
                                            </svg>
                                        </div>
                                        <h3>No outpasses found</h3>
                                        <p>There are no outpasses matching the "{activeFilter}" filter state.</p>
                                        <button className="pb-apply-btn" style={{ margin: '16px auto 0' }} onClick={() => navigate('/new-outpass')}>
                                            Apply Now
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pb-outpass-grid">
                                        {filteredOutpasses.map((outpass, index) => {
                                            const staggerIndex = (index % 6) + 1;
                                            return (
                                                <div key={outpass.id} className={`pb-outpass-item-card ${outpass.isLate ? 'late-card-red' : ''} pb-animate-stagger-${staggerIndex}`}>
                                                    <div className="pb-card-top-row">
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            <span className={`pb-outpass-type-indicator ${
                                                                outpass.outpassType.toLowerCase() === 'emergency' ? 'emergency' : ''
                                                            }`}>
                                                                {outpass.outpassType}
                                                            </span>
                                                            {outpass.isLate && (
                                                                <span className="pb-outpass-type-indicator emergency" style={{ textTransform: 'uppercase' }}>
                                                                    ⏳ Late
                                                                </span>
                                                            )}
                                                        </div>
                                                        {getStatusBadge(outpass.overallStatus)}
                                                    </div>

                                                    <div className="pb-card-mid-section">
                                                        <div className="pb-duration-row">
                                                            <div className="pb-duration-icon">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                                </svg>
                                                            </div>
                                                            <div className="pb-time-details">
                                                                <span className="pb-time-label">FROM</span>
                                                                <span className="pb-time-value">{formatDateTime(outpass.fromDate)}</span>
                                                                <span className="pb-time-label" style={{ marginTop: '6px' }}>TO</span>
                                                                <span className="pb-time-value">{formatDateTime(outpass.toDate)}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="pb-reason-row">
                                                            <strong>Reason:</strong> "{outpass.reason}"
                                                        </div>
                                                        {outpass.overallStatus === 'rejected' && outpass.remarks && (
                                                            <div className="pb-card-remarks-box">
                                                                <strong>Remarks:</strong> "{outpass.remarks}"
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="pb-card-bottom-row">
                                                        <span className="pb-applied-on">
                                                            Applied: {new Date(outpass.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <button
                                                            className="pb-track-btn"
                                                            onClick={() => setSelectedOutpass(outpass)}
                                                        >
                                                            Track Progress
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}>
                                                                <polyline points="9 18 15 12 9 6" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* TRACKING / DETAIL VIEW */
                            <div className="pb-outpass-detail-view">
                                <div className="pb-back-link-wrapper">
                                    <button className="pb-btn-back" onClick={() => setSelectedOutpass(null)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="19" y1="12" x2="5" y2="12" />
                                            <polyline points="12 19 5 12 12 5" />
                                        </svg>
                                        Back to Outpass History
                                    </button>
                                </div>

                                <div className="pb-details-layout-grid">
                                    {/* Left Column: Outpass Details */}
                                    <div className="pb-details-left-col">
                                        <div className="pb-detail-info-card">
                                            <h3 className="pb-section-title">Request Information</h3>
                                            
                                            <div className="pb-meta-info-list">
                                                <div className="pb-meta-info-item">
                                                    <span className="label">Outpass Type</span>
                                                    <span className="val font-semibold">{selectedOutpass.outpassType}</span>
                                                </div>
                                                <div className="pb-meta-info-item">
                                                    <span className="label">Status</span>
                                                    <span>{getStatusBadge(selectedOutpass.overallStatus)}</span>
                                                </div>
                                                <div className="pb-meta-info-item">
                                                    <span className="label">From</span>
                                                    <span className="val">{formatDateTime(selectedOutpass.fromDate)}</span>
                                                </div>
                                                <div className="pb-meta-info-item">
                                                    <span className="label">To</span>
                                                    <span className="val">{formatDateTime(selectedOutpass.toDate)}</span>
                                                </div>
                                                <div className="pb-meta-info-item">
                                                    <span className="label">Reason</span>
                                                    <span className="val reason-text">"{selectedOutpass.reason}"</span>
                                                </div>
                                                {selectedOutpass.overallStatus === 'rejected' && selectedOutpass.remarks && (
                                                    <div className="pb-meta-info-item">
                                                        <span className="label" style={{ color: '#EF4444' }}>Remarks</span>
                                                        <span className="val reason-text" style={{ color: '#EF4444', fontWeight: 600 }}>"{selectedOutpass.remarks}"</span>
                                                    </div>
                                                )}
                                                {selectedOutpass.out && (
                                                    <div className="pb-meta-info-item">
                                                        <span className="label" style={{ color: '#3B82F6' }}>Marked Out Time</span>
                                                        <span className="val font-semibold" style={{ color: '#2563EB' }}>{formatDateTime(selectedOutpass.out)}</span>
                                                    </div>
                                                )}
                                                {selectedOutpass.in && (
                                                    <div className="pb-meta-info-item">
                                                        <span className="label" style={{ color: '#10B981' }}>Marked In Time</span>
                                                        <span className="val font-semibold" style={{ color: '#059669' }}>{formatDateTime(selectedOutpass.in)}</span>
                                                    </div>
                                                )}
                                                <div className="pb-meta-info-item">
                                                    <span className="label">Applied on</span>
                                                    <span className="val">{formatDateTime(selectedOutpass.createdAt)}</span>
                                                </div>
                                            </div>

                                            {/* Proof document button */}
                                            {selectedOutpass.document && (
                                                <div className="pb-proof-action-box">
                                                    <div className="pb-proof-text-details">
                                                        <strong>Supporting Document</strong>
                                                        <span>OD proof attached</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleViewDocument(selectedOutpass.document)}
                                                        className="pb-view-proof-btn"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                                                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                            <circle cx="12" cy="12" r="3" />
                                                        </svg>
                                                        View Proof
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* QR Code Card */}
                                        {selectedOutpass.overallStatus === 'approved' && (
                                            <div className="pb-detail-info-card pb-qr-card-container">
                                                <h3 className="pb-section-title">Exit Pass QR</h3>
                                                {isWithinTimeWindow(selectedOutpass.fromDate, selectedOutpass.toDate) ? (
                                                    <div className="pb-qr-wrapper">
                                                        <div className="pb-qr-box">
                                                            <QRCodeSVG value={selectedOutpass.id} size={180} level="H" />
                                                        </div>
                                                        <p className="pb-qr-tip">
                                                            Show this QR code at the security gate.<br/>
                                                            <small>Valid from {formatDateTime(selectedOutpass.fromDate)} to {formatDateTime(selectedOutpass.toDate)}</small>
                                                        </p>
                                                    </div>
                                                ) : new Date(currentTime).getTime() < new Date(selectedOutpass.fromDate).getTime() ? (
                                                    <div className="pb-qr-expired">
                                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#F59E0B' }}>
                                                            <circle cx="12" cy="12" r="10" />
                                                            <polyline points="12 6 12 12 16 14" />
                                                        </svg>
                                                        <p>
                                                            QR Code is not yet active.<br/>
                                                            It will be valid starting from your departure time:<br/>
                                                            <strong>{formatDateTime(selectedOutpass.fromDate)}</strong>
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="pb-qr-expired">
                                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <line x1="15" y1="9" x2="9" y2="15" />
                                                            <line x1="9" y1="9" x2="15" y2="15" />
                                                        </svg>
                                                        <p>
                                                            QR Code has expired.<br/>
                                                            It was valid up to your arrival time:<br/>
                                                            <strong>{formatDateTime(selectedOutpass.toDate)}</strong>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: Vertical Approval Timeline */}
                                    {selectedOutpass.outpassType?.toLowerCase() !== 'hostel emergency' && (
                                        <div className="pb-details-right-col">
                                            <h3 className="pb-section-title">Approval Flow Timeline</h3>
                                            {renderTimeline(selectedOutpass)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view">
                {/* Mobile Header */}
                <div className="pb-mob-page-header">
                    {selectedOutpass ? (
                        <button className="pb-mob-back-btn" onClick={() => setSelectedOutpass(null)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                    ) : (
                        <button className="pb-mob-back-btn" onClick={() => navigate('/dashboard')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                    )}
                    <div className="pb-mob-header-text">
                        <span className="pb-mob-header-title">{selectedOutpass ? 'Track Request' : 'My Outpasses'}</span>
                    </div>
                    {!selectedOutpass && (
                        <button className="pb-mob-apply-fab" onClick={() => navigate('/new-outpass')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    )}
                    {selectedOutpass && <div style={{width: 36}} />}
                </div>

                <div className="pb-mob-scroll-body">
                    {!selectedOutpass ? (
                        <>
                            {/* Tab filters */}
                            <div className="pb-mob-tab-row">
                                {(['all','pending','approved','rejected'] as const).map(f => (
                                    <button
                                        key={f}
                                        className={`pb-mob-tab-btn ${activeFilter === f ? 'active' : ''}`}
                                        onClick={() => setActiveFilter(f)}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <LoadingSpinner />
                            ) : filteredOutpasses.length === 0 ? (
                                <div className="pb-mob-empty-card">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect width="18" height="18" x="3" y="3" rx="2" />
                                        <path d="M9 17h6" />
                                        <path d="M9 12h6" />
                                        <path d="M9 7h6" />
                                    </svg>
                                    <span>No outpasses found</span>
                                    <button className="pb-mob-cta-btn" onClick={() => navigate('/new-outpass')}>Apply Now</button>
                                </div>
                            ) : (
                                filteredOutpasses.map((op, index) => {
                                    const staggerIndex = (index % 5) + 1;
                                    return (
                                        <div key={op.id} className={`pb-mob-outpass-card ${op.isLate ? 'late-card-red' : ''} pb-animate-stagger-${staggerIndex}`} onClick={() => setSelectedOutpass(op)}>
                                            <div className="pb-mob-op-top">
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span className={`pb-outpass-type-indicator ${op.outpassType.toLowerCase() === 'emergency' ? 'emergency' : ''}`}>
                                                        {op.outpassType}
                                                    </span>
                                                    {op.isLate && (
                                                        <span className="pb-outpass-type-indicator emergency" style={{ textTransform: 'uppercase' }}>
                                                            ⏳ Late
                                                        </span>
                                                    )}
                                                </div>
                                                {getStatusBadge(op.overallStatus)}
                                            </div>
                                            <div className="pb-mob-op-dates">
                                                <div className="pb-mob-op-date-item">
                                                    <span className="pb-label">FROM</span>
                                                    <span className="pb-val">{formatDateTime(op.fromDate)}</span>
                                                </div>
                                                <div className="pb-mob-op-date-divider" />
                                                <div className="pb-mob-op-date-item">
                                                    <span className="pb-label">TO</span>
                                                    <span className="pb-val">{formatDateTime(op.toDate)}</span>
                                                </div>
                                            </div>
                                            <p className="pb-mob-op-reason">“{op.reason}”</p>
                                            {op.overallStatus === 'rejected' && op.remarks && (
                                                <div className="pb-mob-card-remarks-box">
                                                    <strong>Remarks:</strong> "{op.remarks}"
                                                </div>
                                            )}
                                            <div className="pb-mob-op-footer">
                                                <span className="pb-date">Applied {new Date(op.createdAt).toLocaleDateString()}</span>
                                                <span className="pb-track-link">Track Progress →</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </>
                    ) : (
                        /* ── DETAIL / TIMELINE VIEW ── */
                        <>
                            {/* Request Summary Card */}
                            <div className="pb-mob-detail-card">
                                <div className="pb-mob-detail-top">
                                    <span className={`pb-outpass-type-indicator ${selectedOutpass.outpassType.toLowerCase() === 'emergency' ? 'emergency' : ''}`}>
                                        {selectedOutpass.outpassType}
                                    </span>
                                    {getStatusBadge(selectedOutpass.overallStatus)}
                                </div>
                                <div className="pb-mob-detail-row"><span className="pb-label">From</span><span className="pb-val">{formatDateTime(selectedOutpass.fromDate)}</span></div>
                                <div className="pb-mob-detail-row"><span className="pb-label">To</span><span className="pb-val">{formatDateTime(selectedOutpass.toDate)}</span></div>
                                <div className="pb-mob-detail-row"><span className="pb-label">Reason</span><span className="pb-val italic">“{selectedOutpass.reason}”</span></div>
                                {selectedOutpass.overallStatus === 'rejected' && selectedOutpass.remarks && (
                                    <div className="pb-mob-detail-row" style={{ color: '#EF4444' }}>
                                        <span className="pb-label" style={{ color: '#EF4444' }}>Remarks</span>
                                        <span className="pb-val font-semibold">“{selectedOutpass.remarks}”</span>
                                    </div>
                                )}
                                {selectedOutpass.out && (
                                    <div className="pb-mob-detail-row" style={{ color: '#3B82F6' }}>
                                        <span className="pb-label" style={{ color: '#3B82F6' }}>Marked Out Time</span>
                                        <span className="pb-val font-semibold">{formatDateTime(selectedOutpass.out)}</span>
                                    </div>
                                )}
                                {selectedOutpass.in && (
                                    <div className="pb-mob-detail-row" style={{ color: '#10B981' }}>
                                        <span className="pb-label" style={{ color: '#10B981' }}>Marked In Time</span>
                                        <span className="pb-val font-semibold">{formatDateTime(selectedOutpass.in)}</span>
                                    </div>
                                )}
                                <div className="pb-mob-detail-row" style={{borderBottom: 'none'}}><span className="pb-label">Applied</span><span className="pb-val">{formatDateTime(selectedOutpass.createdAt)}</span></div>
                                {selectedOutpass.document && (
                                    <button onClick={() => handleViewDocument(selectedOutpass.document)} className="pb-mob-view-proof-btn">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        View Proof Document
                                    </button>
                                )}
                            </div>

                            {/* Mobile QR Code */}
                            {selectedOutpass.overallStatus === 'approved' && (
                                <div className="pb-mob-detail-card pb-mob-qr-container">
                                    <h3 className="pb-mob-section-title">Exit Pass QR</h3>
                                    {isWithinTimeWindow(selectedOutpass.fromDate, selectedOutpass.toDate) ? (
                                        <div className="pb-mob-qr-box">
                                            <QRCodeSVG value={selectedOutpass.id} size={160} level="H" />
                                            <p className="pb-qr-tip" style={{ marginTop: '8px', fontSize: '0.75rem', textAlign: 'center', color: '#64748B' }}>
                                                Valid till: {formatDateTime(selectedOutpass.toDate)}
                                            </p>
                                        </div>
                                    ) : new Date(currentTime).getTime() < new Date(selectedOutpass.fromDate).getTime() ? (
                                        <div className="pb-mob-qr-expired">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#F59E0B' }}>
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            <p>
                                                QR Code is not yet active.<br/>Valid starting at: <br/><strong>{formatDateTime(selectedOutpass.fromDate)}</strong>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="pb-mob-qr-expired">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="15" y1="9" x2="9" y2="15" />
                                                <line x1="9" y1="9" x2="15" y2="15" />
                                            </svg>
                                            <p>
                                                QR Code has expired.<br/>Expired at: <br/><strong>{formatDateTime(selectedOutpass.toDate)}</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Timeline */}
                            {selectedOutpass.outpassType?.toLowerCase() !== 'hostel emergency' && (
                                <>
                                    <h3 className="pb-mob-section-header">Approval Timeline</h3>
                                    <div className="pb-mob-timeline">
                                {[
                                    { title: 'Staff / Tutor Advisor', ...selectedOutpass.staffApproval },
                                    { title: 'Year Incharge', ...selectedOutpass.yearInchargeApproval },
                                    ...(residenceType === 'hostel' ? [{ title: 'Hostel Warden', ...selectedOutpass.wardenApproval }] : [])
                                ].map((step, idx, arr) => (
                                    <div key={idx} className="pb-mob-timeline-step">
                                        <div className="pb-mob-timeline-left">
                                            <div className={`pb-mob-timeline-dot ${
                                                step.status === 'approved' ? 'pb-dot-approved' :
                                                step.status === 'rejected' ? 'pb-dot-rejected' : 'pb-dot-pending'
                                            }`}>
                                                {step.status === 'approved' ? (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                                ) : step.status === 'rejected' ? (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                ) : (
                                                    <div className="pb-dot-inner" />
                                                )}
                                            </div>
                                            {idx < arr.length - 1 && <div className={`pb-mob-timeline-line ${step.status === 'approved' ? 'pb-line-approved' : ''}`} />}
                                        </div>
                                        <div className="pb-mob-timeline-card">
                                            <div className="pb-mob-tl-top">
                                                <span className="pb-tl-title">{step.title}</span>
                                                <span className={`pb-step-badge ${
                                                    step.status === 'approved' ? 'pb-badge-green' : 
                                                    step.status === 'rejected' ? 'pb-badge-red' : 'pb-badge-amber'
                                                }`}>
                                                    {step.status}
                                                </span>
                                            </div>
                                            {step.approverName && <p className="pb-tl-text">By: {step.approverName}</p>}
                                            {(step.approvedAt || step.rejectedAt) && (
                                                <p className="pb-tl-text">{formatDateTime(step.approvedAt || step.rejectedAt || '')}</p>
                                            )}
                                            {step.remarks && <p className="pb-tl-remarks">“{step.remarks}”</p>}
                                            {!step.approverName && step.status === 'pending' && (
                                                <p className="pb-tl-text italic">Awaiting review...</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* BOTTOM NAVIGATION */}
                <StudentBottomNav activeTab="outpass" />
            </div>{/* end mobile */}

            {showDocumentModal && documentUrl && (
                <div className="pb-document-viewer-modal">
                    <div className="pb-document-modal-backdrop" onClick={() => setShowDocumentModal(false)} />
                    <div className="pb-document-modal-card">
                        <div className="pb-document-modal-header">
                            <div>
                                <h3>Proof Document</h3>
                                <p>{documentType === 'pdf' ? 'PDF Preview' : 'Image Preview'}</p>
                            </div>
                            <button className="pb-close-modal-btn" onClick={() => setShowDocumentModal(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="pb-document-modal-body">
                            {documentType === 'pdf' ? (
                                <iframe
                                    src={documentUrl}
                                    title="Proof Document"
                                    className="pb-document-iframe"
                                />
                            ) : (
                                <img src={documentUrl} alt="Proof Document" className="pb-document-image" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* ── DESKTOP VIEWS ── */
                .pb-outpass-page {
                    min-height: 100vh;
                    background: var(--pb-bg);
                }
                .pb-page-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .pb-page-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin: 0;
                    letter-spacing: -0.025em;
                }
                .pb-page-subtitle {
                    font-size: 0.9rem;
                    color: var(--pb-text-3);
                    margin: 4px 0 0 0;
                }
                .pb-apply-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 42px;
                    padding: 0 20px;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-dark));
                    color: #fff;
                    font-weight: 600;
                    font-size: 0.88rem;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
                    transition: var(--pb-transition);
                }
                .pb-apply-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
                }
                .pb-list-view-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .pb-tab-filters-container {
                    display: flex;
                    gap: 6px;
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    padding: 4px;
                    border-radius: 14px;
                    width: fit-content;
                }
                .pb-tab-filter-btn {
                    border: none;
                    background: transparent;
                    padding: 6px 16px;
                    border-radius: 10px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--pb-text-3);
                    cursor: pointer;
                    transition: var(--pb-transition);
                }
                .pb-tab-filter-btn:hover {
                    color: var(--pb-text);
                }
                .pb-tab-filter-btn.active {
                    background: #fff;
                    color: var(--pb-primary);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
                }
                .pb-outpass-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                    gap: 20px;
                }
                .pb-outpass-item-card {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    min-height: 190px;
                    padding: 20px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    transition: var(--pb-transition);
                }
                .pb-outpass-item-card.late-card-red,
                .pb-mob-outpass-card.late-card-red {
                    background: rgba(239, 68, 68, 0.05) !important;
                    border-color: rgba(239, 68, 68, 0.25) !important;
                    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.08) !important;
                }
                [data-theme="dark"] .pb-outpass-item-card.late-card-red,
                [data-theme="dark"] .pb-mob-outpass-card.late-card-red {
                    background: rgba(239, 68, 68, 0.1) !important;
                    border-color: rgba(239, 68, 68, 0.3) !important;
                    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15) !important;
                }
                .pb-outpass-item-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--pb-shadow-md);
                    border-color: rgba(59, 130, 246, 0.3);
                }
                .pb-card-top-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .pb-outpass-type-indicator {
                    font-size: 0.72rem;
                    padding: 3px 10px;
                    border-radius: 99px;
                    background: rgba(59, 130, 246, 0.08);
                    color: var(--pb-primary);
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    border: 1px solid rgba(59, 130, 246, 0.12);
                }
                .pb-outpass-type-indicator.emergency {
                    background: rgba(239, 68, 68, 0.08);
                    color: #EF4444;
                    border-color: rgba(239, 68, 68, 0.12);
                }
                .pb-status-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 3px 10px;
                    border-radius: 99px;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }
                .pb-status-approved { background: rgba(16, 185, 129, 0.08); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.15); }
                .pb-status-rejected { background: rgba(239, 68, 68, 0.08); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.15); }
                .pb-status-pending { background: rgba(245, 158, 11, 0.08); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.15); }

                .pb-card-mid-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    flex: 1;
                }
                .pb-duration-row {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                }
                .pb-duration-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    color: var(--pb-primary);
                    border-radius: 8px;
                    flex-shrink: 0;
                }
                .pb-time-details {
                    display: flex;
                    flex-direction: column;
                }
                .pb-time-label {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: var(--pb-text-4);
                    letter-spacing: 0.06em;
                }
                .pb-time-value {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--pb-text);
                }
                .pb-reason-row {
                    font-size: 0.84rem;
                    color: var(--pb-text-2);
                    line-height: 1.45;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .pb-card-bottom-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid rgba(59, 130, 246, 0.08);
                    padding-top: 12px;
                }
                .pb-applied-on {
                    font-size: 0.72rem;
                    color: var(--pb-text-4);
                    font-weight: 500;
                }
                .pb-track-btn {
                    display: inline-flex;
                    align-items: center;
                    background: transparent;
                    border: none;
                    color: var(--pb-primary);
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: var(--pb-transition);
                }
                .pb-track-btn:hover {
                    color: var(--pb-primary-dark);
                    transform: translateX(2px);
                }
                
                .pb-empty-state-card {
                    text-align: center;
                    padding: 48px 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    max-width: 480px;
                    margin: 40px auto;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                }
                .pb-empty-state-icon {
                    width: 56px;
                    height: 56px;
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    color: var(--pb-primary);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 8px;
                }
                .pb-empty-state-card h3 {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: var(--pb-text);
                    margin: 0;
                }
                .pb-empty-state-card p {
                    color: var(--pb-text-3);
                    font-size: 0.88rem;
                    margin: 0;
                }

                /* DETAIL VIEW */
                .pb-outpass-detail-view {
                    animation: pbFadeIn 0.35s ease-out;
                }
                .pb-details-layout-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    gap: 32px;
                    align-items: start;
                }
                @media (max-width: 992px) {
                    .pb-details-layout-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                }
                .pb-detail-info-card {
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .pb-section-title {
                    font-size: 1.05rem;
                    font-weight: 750;
                    color: var(--pb-text);
                    margin: 0;
                    letter-spacing: -0.01em;
                }
                .pb-meta-info-list {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .pb-meta-info-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    font-size: 0.88rem;
                    border-bottom: 1px dashed rgba(59, 130, 246, 0.08);
                    padding-bottom: 10px;
                    gap: 16px;
                }
                .pb-meta-info-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .pb-meta-info-item .label {
                    color: var(--pb-text-3);
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.72rem;
                    letter-spacing: 0.05em;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .pb-meta-info-item .val {
                    color: var(--pb-text);
                    font-weight: 600;
                    text-align: right;
                }
                .pb-meta-info-item .val.reason-text {
                    text-align: left;
                    font-style: italic;
                    color: var(--pb-text-2);
                    font-weight: 500;
                }
                .pb-proof-action-box {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(59, 130, 246, 0.04);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    padding: 14px 18px;
                    border-radius: 14px;
                    margin-top: 8px;
                    gap: 12px;
                }
                .pb-proof-text-details {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .pb-proof-text-details strong {
                    font-size: 0.85rem;
                    color: var(--pb-text);
                }
                .pb-proof-text-details span {
                    font-size: 0.72rem;
                    color: var(--pb-text-4);
                    font-weight: 500;
                }
                .pb-view-proof-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 36px;
                    padding: 0 14px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: var(--pb-transition);
                }
                .pb-view-proof-btn:hover {
                    background: var(--pb-primary);
                    color: #fff;
                }

                /* QR CARD */
                .pb-qr-card-container {
                    margin-top: 24px;
                    align-items: center;
                }
                .pb-qr-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 0;
                }
                .pb-qr-box {
                    padding: 16px;
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.08);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    display: inline-block;
                }
                .pb-qr-tip {
                    color: var(--pb-text-2);
                    font-size: 0.85rem;
                    text-align: center;
                    line-height: 1.45;
                    margin: 0;
                }
                .pb-qr-tip small {
                    color: var(--pb-text-4);
                    font-weight: 500;
                }
                .pb-qr-expired {
                    text-align: center;
                    padding: 24px;
                    background: rgba(239, 68, 68, 0.04);
                    border: 1px solid rgba(239, 68, 68, 0.08);
                    color: #EF4444;
                    border-radius: 14px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                .pb-qr-expired p {
                    color: var(--pb-text-2);
                    font-size: 0.85rem;
                    line-height: 1.45;
                    margin: 0;
                }

                /* TIMELINE DESKTOP */
                .pb-timeline-stepper {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    margin-left: 20px;
                    padding-left: 24px;
                    border-left: 2px dashed rgba(59, 130, 246, 0.15);
                }
                .pb-timeline-step-item {
                    position: relative;
                    margin-bottom: 24px;
                }
                .pb-timeline-step-item:last-child {
                    margin-bottom: 0;
                }
                .pb-timeline-indicator {
                    position: absolute;
                    left: -41px;
                    top: 14px;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #fff;
                    border: 2px solid rgba(203, 213, 225, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    transition: var(--pb-transition);
                    color: var(--pb-text-3);
                    box-shadow: var(--pb-shadow);
                }
                .pb-timeline-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pb-timeline-connector {
                    position: absolute;
                    left: -26px;
                    top: 46px;
                    bottom: -20px;
                    width: 2px;
                    background: rgba(203, 213, 225, 0.8);
                    z-index: 1;
                }
                .pb-timeline-step-item:last-child .pb-timeline-connector {
                    display: none;
                }
                .pb-timeline-card {
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: 16px;
                    padding: 16px 20px;
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .pb-timeline-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.06);
                    padding-bottom: 8px;
                    gap: 12px;
                }
                .pb-timeline-title {
                    font-size: 0.92rem;
                    font-weight: 750;
                    color: var(--pb-text);
                    margin: 0;
                }
                .pb-step-badge {
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 99px;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }
                .pb-badge-green { background: rgba(16, 185, 129, 0.08); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.15); }
                .pb-badge-red { background: rgba(239, 68, 68, 0.08); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.15); }
                .pb-badge-amber { background: rgba(245, 158, 11, 0.08); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.15); }

                .pb-timeline-details-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .pb-timeline-details-list .pb-detail-item {
                    display: flex;
                    gap: 8px;
                    font-size: 0.8rem;
                    align-items: baseline;
                }
                .pb-timeline-details-list .pb-detail-item .pb-label {
                    color: var(--pb-text-4);
                    font-weight: 700;
                    flex-shrink: 0;
                    width: 76px;
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0;
                }
                .pb-timeline-details-list .pb-detail-item .pb-val {
                    color: var(--pb-text);
                    font-weight: 600;
                }
                .pb-timeline-details-list .pb-remarks-item .pb-val {
                    font-style: italic;
                    color: var(--pb-text-2);
                    font-weight: 500;
                }
                .pb-timeline-waiting {
                    font-size: 0.78rem;
                    color: var(--pb-text-4);
                    font-style: italic;
                    font-weight: 500;
                }
                .pb-timeline-approved .pb-timeline-indicator {
                    border-color: #10B981;
                    background: rgba(16, 185, 129, 0.05);
                    color: #10B981;
                }
                .pb-timeline-approved .pb-timeline-connector {
                    background: #10B981;
                }
                .pb-timeline-rejected .pb-timeline-indicator {
                    border-color: #EF4444;
                    background: rgba(239, 68, 68, 0.05);
                    color: #EF4444;
                }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { display: flex !important; flex-direction: column; min-height: 100vh; background: var(--pb-bg); }
                }

                /* ==========================================
                   PREMIUM MOBILE STYLES (OUTPASS)
                   ========================================== */
                .pb-mob-page-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.08);
                }
                .pb-mob-back-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #fff;
                    border: 1px solid rgba(59, 130, 246, 0.12);
                    color: var(--pb-text);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: transform 0.2s;
                }
                .pb-mob-back-btn:active { transform: scale(0.9); }
                .pb-mob-header-text { flex: 1; }
                .pb-mob-header-title {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    letter-spacing: -0.01em;
                }
                .pb-mob-apply-fab {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-dark));
                    border: none;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
                    cursor: pointer;
                }
                .pb-mob-apply-fab:active { transform: scale(0.9); }

                .pb-mob-scroll-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 16px 90px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .pb-mob-tab-row {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                    scrollbar-width: none;
                }
                .pb-mob-tab-row::-webkit-scrollbar { display: none; }
                
                .pb-mob-tab-btn {
                    background: rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(59, 130, 246, 0.1);
                    border-radius: 20px;
                    padding: 6px 16px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--pb-text-3);
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .pb-mob-tab-btn.active {
                    background: #fff;
                    border-color: var(--pb-primary);
                    color: var(--pb-primary);
                    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.1);
                }

                .pb-mob-empty-card {
                    padding: 40px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    color: var(--pb-text-3);
                }
                .pb-mob-empty-card span {
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .pb-mob-cta-btn {
                    width: 100%;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-dark));
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    padding: 12px;
                    font-size: 0.88rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
                }
                .pb-mob-cta-btn:active { transform: scale(0.97); }

                /* List Cards Mobile */
                .pb-mob-outpass-card {
                    padding: 16px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                    transition: transform 0.15s;
                }
                .pb-mob-outpass-card:active { transform: scale(0.98); }
                .pb-mob-op-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .pb-mob-op-dates {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(59, 130, 246, 0.03);
                    border-radius: 12px;
                    padding: 8px 12px;
                    border: 1px solid rgba(59, 130, 246, 0.06);
                }
                .pb-mob-op-date-item {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .pb-mob-op-date-divider {
                    width: 1px;
                    height: 24px;
                    background: rgba(59, 130, 246, 0.1);
                }
                .pb-mob-op-reason {
                    font-size: 0.8rem;
                    font-style: italic;
                    color: var(--pb-text-2);
                    margin: 0;
                }
                .pb-mob-op-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid rgba(59, 130, 246, 0.06);
                    padding-top: 10px;
                }
                .pb-mob-op-footer .pb-date {
                    font-size: 0.72rem;
                    color: var(--pb-text-4);
                    font-weight: 500;
                }
                .pb-mob-op-footer .pb-track-link {
                    font-size: 0.78rem;
                    font-weight: 750;
                    color: var(--pb-primary);
                }

                /* Mobile Detail Card */
                .pb-mob-detail-card {
                    padding: 18px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .pb-mob-detail-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.06);
                }
                .pb-mob-detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.06);
                }
                .pb-mob-view-proof-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    border: none;
                    border-radius: 10px;
                    padding: 10px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    margin-top: 10px;
                    width: 100%;
                }
                
                .pb-mob-qr-container {
                    align-items: center;
                    padding: 20px;
                    margin-top: 16px;
                }
                .pb-mob-section-title {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin: 0 0 14px 0;
                    align-self: flex-start;
                }
                .pb-mob-qr-box {
                    padding: 12px;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
                }
                .pb-mob-qr-expired {
                    text-align: center;
                    padding: 16px;
                    background: rgba(239, 68, 68, 0.04);
                    border: 1px solid rgba(239, 68, 68, 0.08);
                    color: #EF4444;
                    border-radius: 12px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                }
                .pb-mob-qr-expired p {
                    margin: 0;
                    font-size: 0.78rem;
                    color: var(--pb-text-2);
                    line-height: 1.4;
                }

                .pb-mob-section-header {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin: 16px 0 8px 0;
                }

                /* Mobile Timeline */
                .pb-mob-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    margin-top: 4px;
                }
                .pb-mob-timeline-step {
                    display: flex;
                    gap: 12px;
                }
                .pb-mob-timeline-left {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 24px;
                    flex-shrink: 0;
                }
                .pb-mob-timeline-dot {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    z-index: 2;
                    border: 2px solid #fff;
                    box-shadow: var(--pb-shadow);
                }
                .pb-dot-approved { background: #10B981; }
                .pb-dot-rejected { background: #EF4444; }
                .pb-dot-pending  { background: #E2E8F0; border-color: #CBD5E1; }
                .pb-dot-inner { width: 6px; height: 6px; border-radius: 50%; background: #94A3B8; }
                
                .pb-mob-timeline-line {
                    flex: 1;
                    width: 2px;
                    background: #E2E8F0;
                    margin: 0;
                    min-height: 24px;
                    position: relative;
                    top: -4px;
                    z-index: 1;
                }
                .pb-line-approved { background: #10B981; }
                
                .pb-mob-timeline-card {
                    flex: 1;
                    padding: 12px 14px;
                    margin-bottom: 14px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius-sm);
                    box-shadow: var(--pb-shadow);
                }
                .pb-mob-tl-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                }
                .pb-tl-title {
                    font-size: 0.85rem;
                    font-weight: 750;
                    color: var(--pb-text);
                }
                .pb-tl-text {
                    font-size: 0.76rem;
                    color: var(--pb-text-3);
                    margin: 2px 0 0 0;
                    font-weight: 500;
                }
                .pb-tl-remarks {
                    font-size: 0.76rem;
                    font-style: italic;
                    color: var(--pb-text-2);
                    margin: 4px 0 0 0;
                    font-weight: 500;
                }

                /* MODAL VIEW DOCUMENT */
                .pb-document-viewer-modal {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pb-document-modal-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.45);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                }
                .pb-document-modal-card {
                    position: relative;
                    width: min(920px, calc(100% - 32px));
                    max-height: min(90vh, 820px);
                    overflow: hidden;
                    padding: 0;
                    border-radius: var(--pb-radius);
                    background: #fff;
                    box-shadow: var(--pb-shadow-lg);
                    z-index: 1;
                    border: 1px solid rgba(255, 255, 255, 0.8);
                }
                .pb-document-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 24px;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.08);
                }
                .pb-document-modal-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 750;
                    color: var(--pb-text);
                }
                .pb-document-modal-header p {
                    margin: 2px 0 0 0;
                    color: var(--pb-text-3);
                    font-size: 0.78rem;
                }
                .pb-close-modal-btn {
                    border: none;
                    background: transparent;
                    color: var(--pb-text-3);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 8px;
                    transition: var(--pb-transition);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pb-close-modal-btn:hover {
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                }
                .pb-document-modal-body {
                    width: 100%;
                    min-height: 320px;
                    height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #F8FAFC;
                }
                .pb-document-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                .pb-document-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    padding: 16px;
                }

                /* ANIMATIONS */
                @keyframes pbFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .pb-animate-stagger-1 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.05s; }
                .pb-animate-stagger-2 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.1s; }
                .pb-animate-stagger-3 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.15s; }
                .pb-animate-stagger-4 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.2s; }
                .pb-animate-stagger-5 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.25s; }
                .pb-animate-stagger-6 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.3s; }
                .pb-card-remarks-box {
                    margin-top: 8px;
                    padding: 8px 12px;
                    background: rgba(239, 68, 68, 0.05);
                    border-left: 3px solid #EF4444;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    color: #DC2626;
                    text-align: left;
                }
                .pb-mob-card-remarks-box {
                    margin-top: 6px;
                    padding: 6px 10px;
                    background: rgba(239, 68, 68, 0.05);
                    border-left: 3px solid #EF4444;
                    border-radius: 6px;
                    font-size: 0.76rem;
                    color: #DC2626;
                    text-align: left;
                }
            `}</style>
        </div>
    );
};

export default OutpassDetails;