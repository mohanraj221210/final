import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import StudentHeader from '../../components/StudentHeader';
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
                        staffApproval: {
                            status: item.staffapprovalstatus || 'pending',
                            approverName: item.staffid?.name,
                            remarks: item.staffremarks,
                            approvedAt: item.staffapprovedAt,
                            rejectedAt: item.staffapprovalstatus === 'rejected' ? item.updatedAt : undefined
                        },
                        yearInchargeApproval: {
                            status: item.yearinchargeapprovalstatus || 'pending',
                            approverName: item.inchargeid?.name,
                            remarks: item.yearinchargeremarks,
                            approvedAt: item.yearinchargeapprovedAt,
                            rejectedAt: item.yearinchargeapprovalstatus === 'rejected' ? item.updatedAt : undefined
                        },
                        wardenApproval: {
                            status: item.wardenapprovalstatus || 'pending',
                            approverName: item.wardenid?.name,
                            remarks: item.wardenremarks,
                            approvedAt: item.wardenapprovedAt,
                            rejectedAt: item.wardenapprovalstatus === 'rejected' ? item.updatedAt : undefined
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
            return <span className="status-pill status-approved">Approved</span>;
        } else if (normalizedStatus === 'rejected' || normalizedStatus === 'declined') {
            return <span className="status-pill status-rejected">Rejected</span>;
        }
        return <span className="status-pill status-pending">Pending</span>;
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

    const isWithinTimeWindow = (fromDate: string) => {
        const fromTime = new Date(fromDate).getTime();
        const diff = currentTime - fromTime;
        // Valid from the moment of approval until 30 minutes AFTER the fromDate
        return diff <= 30 * 60 * 1000;
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
                icon: '👨‍🏫'
            },
            {
                title: 'Year Incharge',
                status: outpass.yearInchargeApproval.status,
                name: outpass.yearInchargeApproval.approverName,
                time: outpass.yearInchargeApproval.approvedAt || outpass.yearInchargeApproval.rejectedAt,
                remarks: outpass.yearInchargeApproval.remarks,
                icon: '🧑‍💼'
            }
        ];

        if (residenceType === 'hostel') {
            steps.push({
                title: 'Hostel Warden',
                status: outpass.wardenApproval.status,
                name: outpass.wardenApproval.approverName,
                time: outpass.wardenApproval.approvedAt || outpass.wardenApproval.rejectedAt,
                remarks: outpass.wardenApproval.remarks,
                icon: '👔'
            });
        }

        return (
            <div className="timeline-stepper">
                {steps.map((step, idx) => {
                    let statusClass = 'timeline-pending';
                    if (step.status === 'approved') statusClass = 'timeline-approved';
                    if (step.status === 'rejected') statusClass = 'timeline-rejected';

                    return (
                        <div key={idx} className={`timeline-item ${statusClass}`}>
                            <div className="timeline-indicator">
                                <span className="timeline-icon">{step.icon}</span>
                            </div>
                            {idx < steps.length - 1 && <div className="timeline-connector"></div>}
                            
                            <div className="timeline-card card">
                                <div className="timeline-header-row">
                                    <h4 className="timeline-title">{step.title}</h4>
                                    <span className={`badge ${
                                        step.status === 'approved' ? 'badge-green' : 
                                        step.status === 'rejected' ? 'badge-red' : 'badge-amber'
                                    }`}>
                                        {step.status}
                                    </span>
                                </div>
                                
                                <div className="timeline-details-list">
                                    {step.name && (
                                        <div className="detail-item">
                                            <span className="label">Approver:</span>
                                            <span className="val">{step.name}</span>
                                        </div>
                                    )}
                                    {step.time && (
                                        <div className="detail-item">
                                            <span className="label">Date/Time:</span>
                                            <span className="val">{formatDateTime(step.time)}</span>
                                        </div>
                                    )}
                                    {step.remarks && (
                                        <div className="detail-item remarks-item">
                                            <span className="label">Remarks:</span>
                                            <span className="val">"{step.remarks}"</span>
                                        </div>
                                    )}
                                    {!step.name && step.status === 'pending' && (
                                        <span className="timeline-waiting">Waiting for review...</span>
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
        <div className="student-page outpass-tracking-page animate-page-enter">
            <ToastContainer position="bottom-right" />

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
            <StudentHeader />

            <div className="content-wrapper">
                {/* Header Section */}
                <div className="page-header-row">
                    <div>
                        <h1 className="page-title" style={{ marginBottom: '4px' }}>
                            {selectedOutpass ? 'Track Outpass' : 'My Outpasses'}
                        </h1>
                        <p className="page-subtitle">
                            {selectedOutpass ? 'Track the active approval timeline' : 'View and track all campus exit history'}
                        </p>
                    </div>
                    {!selectedOutpass && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/new-outpass')}
                            style={{ minWidth: '160px' }}
                        >
                            + Apply Outpass
                        </button>
                    )}
                </div>

                {!selectedOutpass ? (
                    /* LIST VIEW WITH TABS FILTER */
                    <div className="outpass-list-view">
                        <div className="tab-filters-container">
                            {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    className={`tab-filter-btn capitalize ${activeFilter === filter ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="outpass-grid">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="card lux-skeleton" style={{ height: '220px', borderRadius: '20px' }}></div>
                                ))}
                            </div>
                        ) : filteredOutpasses.length === 0 ? (
                            <div className="empty-state-card card">
                                <span className="empty-state-icon">📝</span>
                                <h3>No outpasses found</h3>
                                <p>There are no outpasses matching the "{activeFilter}" filter state.</p>
                                <button className="btn btn-secondary" onClick={() => navigate('/new-outpass')}>
                                    Apply Now
                                </button>
                            </div>
                        ) : (
                            <div className="outpass-grid">
                                {filteredOutpasses.map((outpass, index) => {
                                    const staggerIndex = (index % 6) + 1;
                                    return (
                                        <div key={outpass.id} className={`outpass-item-card card card-hover animate-stagger-${staggerIndex}`}>
                                        <div className="card-top-row">
                                            <span className={`outpass-type-indicator ${
                                                outpass.outpassType.toLowerCase() === 'emergency' ? 'emergency' : ''
                                            }`}>
                                                {outpass.outpassType}
                                            </span>
                                            {getStatusBadge(outpass.overallStatus)}
                                        </div>

                                        <div className="card-mid-section">
                                            <div className="duration-row">
                                                <span className="icon">📅</span>
                                                <div className="time-details">
                                                    <span className="time-label">FROM</span>
                                                    <span className="time-value">{formatDateTime(outpass.fromDate)}</span>
                                                    <span className="time-label" style={{ marginTop: '4px' }}>TO</span>
                                                    <span className="time-value">{formatDateTime(outpass.toDate)}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="reason-row">
                                                <strong>Reason:</strong> "{outpass.reason}"
                                            </div>
                                        </div>

                                        <div className="card-bottom-row">
                                            <span className="applied-on">
                                                Applied on: {new Date(outpass.createdAt).toLocaleDateString()}
                                            </span>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => setSelectedOutpass(outpass)}
                                            >
                                                Track Progress →
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
                    <div className="outpass-detail-view animate-fade-in">
                        <div className="back-link-wrapper" style={{ marginBottom: '24px' }}>
                            <button className="btn-back" onClick={() => setSelectedOutpass(null)}>
                                <span className="icon">←</span> Back to Outpass History
                            </button>
                        </div>

                        <div className="details-layout-grid">
                            {/* Left Column: Outpass Details */}
                            <div className="details-left-col">
                                <div className="card outpass-meta-card">
                                    <h3 className="section-title">Request Information</h3>
                                    
                                    <div className="meta-info-list">
                                        <div className="meta-info-item">
                                            <span className="label">Outpass Type</span>
                                            <span className="val font-semibold">{selectedOutpass.outpassType}</span>
                                        </div>
                                        <div className="meta-info-item">
                                            <span className="label">Status</span>
                                            <span>{getStatusBadge(selectedOutpass.overallStatus)}</span>
                                        </div>
                                        <div className="meta-info-item">
                                            <span className="label">From</span>
                                            <span className="val">{formatDateTime(selectedOutpass.fromDate)}</span>
                                        </div>
                                        <div className="meta-info-item">
                                            <span className="label">To</span>
                                            <span className="val">{formatDateTime(selectedOutpass.toDate)}</span>
                                        </div>
                                        <div className="meta-info-item">
                                            <span className="label">Reason</span>
                                            <span className="val reason-text">"{selectedOutpass.reason}"</span>
                                        </div>
                                        <div className="meta-info-item">
                                            <span className="label">Applied on</span>
                                            <span className="val">{formatDateTime(selectedOutpass.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Proof document button */}
                                    {selectedOutpass.document && (
                                        <div className="proof-action-box">
                                            <div className="proof-text-details">
                                                <strong>Supporting Document</strong>
                                                <span>OD proof attached</span>
                                            </div>
                                            <button
                                                onClick={() => handleViewDocument(selectedOutpass.document)}
                                                className="btn btn-outline btn-sm"
                                            >
                                                👁️ View Proof
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* QR Code Card */}
                                {selectedOutpass.overallStatus === 'approved' && (
                                    <div className="card outpass-meta-card" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <h3 className="section-title">Exit Pass QR</h3>
                                        {isWithinTimeWindow(selectedOutpass.fromDate) ? (
                                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ padding: '16px', background: '#fff', borderRadius: '12px', display: 'inline-block' }}>
                                                    <QRCodeSVG value={selectedOutpass.id} size={180} level="H" />
                                                </div>
                                                <p style={{ marginTop: '16px', color: 'var(--text-2)', fontSize: '0.9rem', textAlign: 'center' }}>
                                                    Show this QR code at the security gate.<br/>
                                                    <small>Valid up to 30 minutes after departure.</small>
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-elevated)', borderRadius: '8px', width: '100%' }}>
                                                <span style={{ fontSize: '2rem' }}>🚫</span>
                                                <p style={{ marginTop: '12px', color: 'var(--text-2)' }}>
                                                    QR Code has expired.<br/>
                                                    It was valid up to 30 minutes after your departure time:<br/>
                                                    <strong>{formatDateTime(selectedOutpass.fromDate)}</strong>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Vertical Approval Timeline */}
                            <div className="details-right-col">
                                <h3 className="section-title">Approval Flow Timeline</h3>
                                {renderTimeline(selectedOutpass)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view cred-page-bg">
                {/* Mobile Header */}
                <div className="mob-page-header">
                    {selectedOutpass ? (
                        <button className="mob-back-btn" onClick={() => setSelectedOutpass(null)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                    ) : (
                        <button className="mob-back-btn" onClick={() => navigate('/dashboard')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                    )}
                    <div className="mob-header-text">
                        <span className="mob-header-title cred-h2" style={{fontSize: '18px'}}>{selectedOutpass ? 'Track Request' : 'My Outpasses'}</span>
                    </div>
                    {!selectedOutpass && (
                        <button className="mob-apply-fab" onClick={() => navigate('/new-outpass')}>+</button>
                    )}
                    {selectedOutpass && <div style={{width: 36}} />}
                </div>

                <div className="mob-scroll-body">
                    {!selectedOutpass ? (
                        <>
                            {/* Tab filters */}
                            <div className="mob-tab-row animate-cred-enter cred-stagger-1">
                                {(['all','pending','approved','rejected'] as const).map(f => (
                                    <button
                                        key={f}
                                        className={`mob-tab-btn ${activeFilter === f ? 'mob-tab-active' : ''}`}
                                        onClick={() => setActiveFilter(f)}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="cred-card" style={{ height: '140px' }}></div>
                                    ))}
                                </div>
                            ) : filteredOutpasses.length === 0 ? (
                                <div className="cred-card mob-empty-card animate-cred-enter cred-stagger-2">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--cred-text-2)" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    <span className="cred-p">No outpasses found</span>
                                    <button className="mob-cta-btn" onClick={() => navigate('/new-outpass')}>Apply Now</button>
                                </div>
                            ) : (
                                filteredOutpasses.map((op, index) => {
                                    const staggerIndex = (index % 5) + 1;
                                    return (
                                        <div key={op.id} className={`cred-card mob-outpass-card animate-cred-enter cred-stagger-${staggerIndex}`} onClick={() => setSelectedOutpass(op)}>
                                            <div className="mob-op-top">
                                                <span className={`mob-op-type-tag ${op.outpassType.toLowerCase() === 'emergency' ? 'mob-op-emergency' : ''}`}>
                                                    {op.outpassType}
                                                </span>
                                                <span className={`cred-label ${
                                                    op.overallStatus === 'approved' ? 'text-success' :
                                                    op.overallStatus === 'rejected' ? 'text-danger' : 'text-warning'
                                                }`}>{op.overallStatus}</span>
                                            </div>
                                            <div className="mob-op-dates">
                                                <div className="mob-op-date-item">
                                                    <span className="cred-label">FROM</span>
                                                    <span className="cred-h2" style={{fontSize: '14px'}}>{formatDateTime(op.fromDate)}</span>
                                                </div>
                                                <div className="mob-op-date-divider" />
                                                <div className="mob-op-date-item">
                                                    <span className="cred-label">TO</span>
                                                    <span className="cred-h2" style={{fontSize: '14px'}}>{formatDateTime(op.toDate)}</span>
                                                </div>
                                            </div>
                                            <p className="mob-op-reason cred-p" style={{fontSize: '13px', fontStyle: 'italic'}}>“{op.reason}”</p>
                                            <div className="mob-op-footer">
                                                <span className="cred-p" style={{fontSize: '12px'}}>Applied {new Date(op.createdAt).toLocaleDateString()}</span>
                                                <span className="cred-gold-text" style={{fontSize: '13px', fontWeight: 'bold'}}>Track →</span>
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
                            <div className="cred-card mob-form-card animate-cred-enter cred-stagger-1">
                                <div className="mob-detail-top">
                                    <span className={`mob-op-type-tag ${selectedOutpass.outpassType.toLowerCase() === 'emergency' ? 'mob-op-emergency' : ''}`}>
                                        {selectedOutpass.outpassType}
                                    </span>
                                    <span className={`cred-label ${
                                        selectedOutpass.overallStatus === 'approved' ? 'text-success' :
                                        selectedOutpass.overallStatus === 'rejected' ? 'text-danger' : 'text-warning'
                                    }`}>{selectedOutpass.overallStatus}</span>
                                </div>
                                <div className="mob-detail-row"><span className="cred-label">From</span><span className="cred-h2" style={{fontSize: '14px'}}>{formatDateTime(selectedOutpass.fromDate)}</span></div>
                                <div className="mob-detail-row"><span className="cred-label">To</span><span className="cred-h2" style={{fontSize: '14px'}}>{formatDateTime(selectedOutpass.toDate)}</span></div>
                                <div className="mob-detail-row"><span className="cred-label">Reason</span><span className="cred-p" style={{fontSize: '13px', fontStyle:'italic'}}>“{selectedOutpass.reason}”</span></div>
                                <div className="mob-detail-row" style={{borderBottom: 'none'}}><span className="cred-label">Applied</span><span className="cred-h2" style={{fontSize: '14px'}}>{formatDateTime(selectedOutpass.createdAt)}</span></div>
                                {selectedOutpass.document && (
                                    <button onClick={() => handleViewDocument(selectedOutpass.document)} className="mob-btn-secondary" style={{marginTop: 12, width: '100%'}}>View Proof Document</button>
                                )}
                            </div>

                            {/* Mobile QR Code */}
                            {selectedOutpass.overallStatus === 'approved' && (
                                <div className="cred-card mob-form-card animate-cred-enter cred-stagger-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
                                    <h3 className="cred-h2" style={{ fontSize: '16px', margin: '0 0 16px 0', alignSelf: 'flex-start' }}>Exit Pass QR</h3>
                                    {isWithinTimeWindow(selectedOutpass.fromDate) ? (
                                        <div style={{ padding: '16px', background: '#fff', borderRadius: '12px' }}>
                                            <QRCodeSVG value={selectedOutpass.id} size={160} level="H" />
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '16px', background: 'var(--cred-surface-hover)', borderRadius: '8px', width: '100%' }}>
                                            <span style={{ fontSize: '2rem' }}>🚫</span>
                                            <p className="cred-p" style={{ marginTop: '8px', fontSize: '13px' }}>
                                                QR Code has expired.<br/>Valid up to 30 mins after: <br/><strong>{formatDateTime(selectedOutpass.fromDate)}</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Timeline */}
                            <h3 className="cred-h2 animate-cred-enter cred-stagger-2" style={{fontSize: '16px', margin: '16px 0 8px 0'}}>Approval Timeline</h3>
                            <div className="mob-timeline animate-cred-enter cred-stagger-3">
                                {[
                                    { title: 'Staff / Tutor', ...selectedOutpass.staffApproval },
                                    { title: 'Year Incharge', ...selectedOutpass.yearInchargeApproval },
                                    ...(residenceType === 'hostel' ? [{ title: 'Hostel Warden', ...selectedOutpass.wardenApproval }] : [])
                                ].map((step, idx, arr) => (
                                    <div key={idx} className="mob-timeline-step">
                                        <div className="mob-timeline-left">
                                            <div className={`mob-timeline-dot ${
                                                step.status === 'approved' ? 'mob-dot-approved' :
                                                step.status === 'rejected' ? 'mob-dot-rejected' : 'mob-dot-pending'
                                            }`}>
                                                {step.status === 'approved' ? (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cred-surface)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                                ) : step.status === 'rejected' ? (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cred-surface)" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                ) : (
                                                    <div className="mob-dot-inner" />
                                                )}
                                            </div>
                                            {idx < arr.length - 1 && <div className={`mob-timeline-line ${step.status === 'approved' ? 'mob-line-approved' : ''}`} />}
                                        </div>
                                        <div className="cred-card mob-timeline-card">
                                            <div className="mob-tl-top">
                                                <span className="cred-h2" style={{fontSize: '15px'}}>{step.title}</span>
                                                <span className={`cred-label ${
                                                    step.status === 'approved' ? 'text-success' :
                                                    step.status === 'rejected' ? 'text-danger' : 'text-warning'
                                                }`}>{step.status}</span>
                                            </div>
                                            {step.approverName && <p className="cred-p" style={{fontSize: '12px'}}>By: {step.approverName}</p>}
                                            {(step.approvedAt || step.rejectedAt) && (
                                                <p className="cred-p" style={{fontSize: '12px'}}>{formatDateTime(step.approvedAt || step.rejectedAt || '')}</p>
                                            )}
                                            {step.remarks && <p className="cred-p" style={{fontSize: '12px', fontStyle: 'italic', marginTop: '4px'}}>“{step.remarks}”</p>}
                                            {!step.approverName && step.status === 'pending' && (
                                                <p className="cred-p" style={{fontSize: '12px', fontStyle: 'italic'}}>Awaiting review...</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* BOTTOM NAVIGATION */}
                <StudentBottomNav activeTab="outpass" />
            </div>{/* end mobile */}

            {showDocumentModal && documentUrl && (
                <div className="document-viewer-modal">
                    <div className="document-modal-backdrop" onClick={() => setShowDocumentModal(false)} />
                    <div className="document-modal-card card">
                        <div className="document-modal-header">
                            <div>
                                <h3>Proof Document</h3>
                                <p>{documentType === 'pdf' ? 'PDF preview' : 'Image preview'}</p>
                            </div>
                            <button className="btn btn-icon" onClick={() => setShowDocumentModal(false)}>✕</button>
                        </div>
                        <div className="document-modal-body">
                            {documentType === 'pdf' ? (
                                <iframe
                                    src={documentUrl}
                                    title="Proof Document"
                                    className="document-iframe"
                                />
                            ) : (
                                <img src={documentUrl} alt="Proof Document" className="document-image" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                /* ── DESKTOP VIEWS (RETAINED) ── */
                .outpass-details-page { background: var(--bg); }
                .page-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-4); }
                .page-subtitle { font-size: 0.95rem; color: var(--text-3); }
                .back-link-wrapper { margin-bottom: var(--space-4); }
                .btn-back { background: none; border: none; color: var(--primary); font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--radius-sm); transition: var(--transition-fast); }
                .btn-back:hover { background: var(--primary-light); color: var(--primary-dark); }
                .tab-filters-container { display: flex; gap: 8px; background: var(--bg-elevated); padding: 4px; border-radius: var(--radius-md); margin-bottom: 24px; width: fit-content; }
                .tab-filter-btn { border: none; background: transparent; padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; color: var(--text-3); cursor: pointer; transition: var(--transition-fast); }
                .tab-filter-btn:hover { color: var(--text-1); }
                .tab-filter-btn.active { background: var(--surface); color: var(--primary-dark); box-shadow: var(--shadow-sm); }
                .outpass-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; }
                .outpass-item-card { display: flex; flex-direction: column; gap: 16px; min-height: 220px; }
                .card-top-row { display: flex; justify-content: space-between; align-items: center; }
                .outpass-type-indicator { font-size: 0.75rem; padding: 2px 10px; border-radius: var(--radius-full); background: var(--primary-light); color: var(--primary-dark); font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; }
                .outpass-type-indicator.emergency { background: var(--danger-light); color: var(--danger); }
                .card-mid-section { display: flex; flex-direction: column; gap: 12px; flex: 1; }
                .duration-row { display: flex; gap: 10px; align-items: flex-start; }
                .duration-row .icon { font-size: 1.2rem; margin-top: 2px; }
                .time-details { display: flex; flex-direction: column; }
                .time-label { font-size: 0.65rem; font-weight: 800; color: var(--text-4); letter-spacing: 0.05em; }
                .time-value { font-size: 0.85rem; font-weight: 600; color: var(--text-1); }
                .reason-row { font-size: 0.88rem; color: var(--text-2); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }
                .card-bottom-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 12px; }
                .applied-on { font-size: 0.75rem; color: var(--text-4); }
                .empty-state-card { text-align: center; padding: var(--space-12) var(--space-6) !important; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; max-width: 480px; margin: 40px auto; }
                .empty-state-icon { font-size: 3rem; }
                .empty-state-card p { color: var(--text-3); font-size: 0.9rem; margin-bottom: 8px; }
                .details-layout-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 32px; align-items: start; }
                .outpass-meta-card { display: flex; flex-direction: column; gap: 16px; }
                .meta-info-list { display: flex; flex-direction: column; gap: 12px; }
                .meta-info-item { display: flex; justify-content: space-between; align-items: flex-start; font-size: 0.9rem; border-bottom: 1px dashed var(--border); padding-bottom: 8px; gap: 16px; }
                .meta-info-item:last-child { border-bottom: none; }
                .meta-info-item .label { color: var(--text-3); font-weight: 500; flex-shrink: 0; }
                .meta-info-item .val { color: var(--text-1); font-weight: 600; text-align: right; }
                .meta-info-item .val.reason-text { text-align: left; font-style: italic; color: var(--text-2); font-weight: 500; }
                .proof-action-box { display: flex; justify-content: space-between; align-items: center; background: var(--bg-elevated); padding: 12px var(--space-4); border-radius: var(--radius-md); margin-top: var(--space-4); gap: 12px; }
                .proof-text-details { display: flex; flex-direction: column; gap: 2px; }
                .proof-text-details strong { font-size: 0.85rem; color: var(--text-1); }
                .proof-text-details span { font-size: 0.75rem; color: var(--text-4); }
                .timeline-stepper { display: flex; flex-direction: column; position: relative; margin-left: 20px; padding-left: 20px; border-left: 2px solid var(--border); }
                .timeline-item { position: relative; margin-bottom: 24px; }
                .timeline-item:last-child { margin-bottom: 0; }
                .timeline-indicator { position: absolute; left: -36px; top: 12px; width: 30px; height: 30px; border-radius: 50%; background: var(--surface); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; z-index: 2; transition: var(--transition); }
                .timeline-icon { font-size: 0.9rem; }
                .timeline-connector { position: absolute; left: -22px; top: 42px; bottom: -20px; width: 2px; background: var(--border); z-index: 1; }
                .timeline-item:last-child .timeline-connector { display: none; }
                .timeline-card { padding: var(--space-4) var(--space-5) !important; }
                .timeline-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px; gap: 12px; }
                .timeline-title { font-size: 0.95rem; color: var(--text-1); margin: 0; }
                .timeline-details-list { display: flex; flex-direction: column; gap: 6px; }
                .timeline-details-list .detail-item { display: flex; gap: 8px; font-size: 0.8rem; }
                .timeline-details-list .detail-item .label { color: var(--text-3); font-weight: 600; flex-shrink: 0; width: 70px; }
                .timeline-details-list .detail-item .val { color: var(--text-1); font-weight: 500; }
                .timeline-details-list .remarks-item .val { font-style: italic; color: var(--text-2); }
                .timeline-waiting { font-size: 0.78rem; color: var(--text-4); font-style: italic; }
                .timeline-approved .timeline-indicator { border-color: var(--success); background: var(--success-light); box-shadow: 0 0 0 4px var(--success-mid); }
                .timeline-rejected .timeline-indicator { border-color: var(--danger); background: var(--danger-light); box-shadow: 0 0 0 4px var(--danger-mid); }
                .timeline-pending .timeline-indicator { border-color: var(--warning); background: var(--warning-light); box-shadow: 0 0 0 4px var(--warning-mid); }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { display: flex !important; flex-direction: column; min-height: 100vh; background: linear-gradient(135deg, #F7F3E6 0%, #E8EEF5 45%, #C8D9F2 100%); font-family: 'Inter', -apple-system, sans-serif; }
                }

                /* ==========================================
                   CRED PREMIUM MOBILE STYLES (OUTPASS)
                   ========================================== */
                .mob-page-header { display:flex; align-items:center; gap:12px; padding:16px 16px 12px; background:rgba(255,255,255,0.85); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); position:sticky; top:0; z-index:50; border-bottom: 1px solid rgba(226,232,240,0.6); }
                .mob-back-btn { width:36px; height:36px; border-radius:10px; background:#FFFFFF; border:1px solid #E2E8F0; color:#1E293B; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:transform 0.2s; }
                .mob-back-btn:active { transform:scale(0.9); }
                .mob-header-text { flex:1; }
                .mob-apply-fab { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #1E3A8A, #0F172A); border:none; color:#FFFFFF; font-size:22px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow: 0 4px 12px rgba(15,23,42,0.25); }

                .mob-scroll-body { flex:1; overflow-y:auto; padding:24px 16px 100px; display:flex; flex-direction:column; gap:20px; }

                /* Tabs */
                .mob-tab-row { display:flex; gap:12px; overflow-x:auto; padding-bottom:4px; }
                .mob-tab-btn { background:rgba(255,255,255,0.7); border:1px solid rgba(226,232,240,0.8); border-radius:24px; padding:8px 20px; font-size:13px; font-weight:600; color:#64748B; cursor:pointer; white-space:nowrap; transition:all 0.2s; flex-shrink:0; }
                .mob-tab-active { background:#FFFFFF; border-color:var(--cred-gold); color:var(--cred-gold); box-shadow: 0 4px 12px rgba(184,134,11,0.15); }

                .mob-empty-card { padding:40px 20px; display:flex; flex-direction:column; align-items:center; gap:16px; }

                /* List Cards */
                .mob-outpass-card { padding:16px; display:flex; flex-direction:column; gap:16px; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform 0.15s; }
                .mob-outpass-card:active { transform:scale(0.98); }
                .mob-op-top { display:flex; justify-content:space-between; align-items:center; }
                .mob-op-type-tag { background:rgba(37, 99, 235, 0.1); color:#2563EB; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; border: 1px solid rgba(37, 99, 235, 0.2); }
                .mob-history-badge-info    { background:rgba(37,99,235,0.1); color:#2563EB; border:1px solid rgba(37,99,235,0.2); }
                .mob-op-emergency { background:rgba(220, 38, 38, 0.1); color:#DC2626; border-color: rgba(220, 38, 38, 0.2); }
                
                .text-success { color: var(--cred-success); }
                .text-danger { color: var(--cred-danger); }
                .text-warning { color: var(--cred-warning); }
                .cred-gold-text { color: var(--cred-gold); }

                .mob-op-dates { display:flex; align-items:center; gap:16px; background:#F8FAFC; border-radius:12px; padding:12px; border: 1px solid rgba(226,232,240,0.8); }
                .mob-op-date-item { flex:1; display:flex; flex-direction:column; gap:4px; }
                .mob-op-date-divider { width:1px; height: 30px; background:rgba(226,232,240,0.8); }
                .mob-op-footer { display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(226,232,240,0.8); padding-top:12px; }

                /* Detail Card */
                .mob-form-card { padding:20px; }
                .mob-detail-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid var(--cred-border); }
                .mob-detail-row { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; padding:12px 0; border-bottom:1px solid var(--cred-border); }

                /* Timeline */
                .mob-timeline { display:flex; flex-direction:column; gap:0; margin-top: 8px; }
                .mob-timeline-step { display:flex; gap:16px; }
                .mob-timeline-left { display:flex; flex-direction:column; align-items:center; width:28px; flex-shrink:0; }
                .mob-timeline-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; z-index: 2; border: 2px solid var(--cred-bg); }
                .mob-dot-approved { background:var(--cred-success); }
                .mob-dot-rejected { background:var(--cred-danger); }
                .mob-dot-pending  { background:var(--cred-surface-2); border-color: var(--cred-border); }
                .mob-dot-inner { width:8px; height:8px; border-radius:50%; background:var(--cred-border); }
                .mob-timeline-line { flex:1; width:2px; background:var(--cred-border); margin:0; min-height:24px; position:relative; top:-4px; z-index: 1; }
                .mob-line-approved { background:var(--cred-success); }
                .mob-timeline-card { flex:1; padding:16px; margin-bottom:16px; }
                .mob-tl-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }

                .mob-cta-btn { width:100%; background:linear-gradient(135deg, #1E3A8A, #0F172A); color:#FFFFFF; border:none; border-radius:16px; padding:16px; font-size:16px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:transform 0.2s; box-shadow: 0 8px 24px rgba(15,23,42,0.25); }
                .mob-cta-btn:active { transform:scale(0.96); }
                .mob-btn-secondary { background:#FFFFFF; color:#0F172A; border:1px solid rgba(226,232,240,0.8); border-radius:12px; padding:14px 20px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition: background 0.2s; box-shadow: 0 4px 12px rgba(15,23,42,0.08); }
                .mob-btn-secondary:active { background: #F1F5F9; }

                .document-viewer-modal { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; }
                .document-modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(2px); }
                .document-modal-card { position: relative; width: min(920px, calc(100% - 32px)); max-height: min(90vh, 820px); overflow: hidden; padding: 0; border-radius: 24px; background: var(--bg); box-shadow: 0 40px 90px rgba(0,0,0,0.18); z-index: 1; }
                .document-modal-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 24px; border-bottom: 1px solid var(--border); }
                .document-modal-header h3 { margin: 0; font-size: 1rem; }
                .document-modal-header p { margin: 0; color: var(--text-3); font-size: 0.9rem; }
                .btn-icon { border: none; background: transparent; color: var(--text-1); font-size: 1.1rem; cursor: pointer; padding: 6px; border-radius: 10px; transition: background 0.2s; }
                .btn-icon:hover { background: rgba(0,0,0,0.05); }
                .document-modal-body { width: 100%; min-height: 320px; max-height: calc(90vh - 110px); display: flex; align-items: center; justify-content: center; background: var(--surface); }
                .document-iframe { width: 100%; height: 100%; border: none; }
                .document-image { width: 100%; height: 100%; object-fit: contain; }
            `}</style>
        </div>
    );
};

export default OutpassDetails;