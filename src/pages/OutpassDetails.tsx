import React from 'react';
import Nav from '../components/Nav';
import { useNavigate, useParams } from 'react-router-dom';

// Outpass status types
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface OutpassData {
    id: string;
    studentId: string;
    studentName: string;
    fromDate: string;
    toDate: string;
    reason: string;
    overallStatus: ApprovalStatus;
    staffApproval: {
        status: ApprovalStatus;
        remarks?: string;
        approvedAt?: string;
        rejectedAt?: string;
    };
    wardenApproval: {
        status: ApprovalStatus;
        remarks?: string;
        approvedAt?: string;
        rejectedAt?: string;
    };
    createdAt: string;
}

const OutpassDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [showModal, setShowModal] = React.useState(false);
    const [selectedFilter, setSelectedFilter] = React.useState<'all' | ApprovalStatus>('all');
    const [selectedOutpassForView, setSelectedOutpassForView] = React.useState<OutpassData | null>(null);

    // Sample data - replace with API call later
    const outpassData: OutpassData = {
        id: id || '1',
        studentId: '2021IT001',
        studentName: 'Mohanraj',
        fromDate: '2026-01-10T14:00',
        toDate: '2026-01-12T18:00',
        reason: 'Family function - Sister\'s wedding ceremony in hometown. Need to attend the event and help with preparations.',
        overallStatus: 'pending',
        staffApproval: {
            status: 'approved',
            remarks: 'Valid reason. Approved for home visit.',
            approvedAt: '2026-01-05T10:30:00',
        },
        wardenApproval: {
            status: 'pending',
            remarks: undefined,
        },
        createdAt: '2026-01-05T09:15:00',
    };

    const getStatusBadge = (status: ApprovalStatus) => {
        const statusConfig = {
            pending: { icon: '🟡', label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
            approved: { icon: '🟢', label: 'Approved', color: '#10b981', bg: '#d1fae5' },
            rejected: { icon: '🔴', label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
        };

        const config = statusConfig[status];
        return (
            <span className="status-badge" style={{
                color: config.color,
                backgroundColor: config.bg
            }}>
                <span className="status-icon">{config.icon}</span>
                {config.label}
            </span>
        );
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

    const getTimelineStatus = (staffStatus: ApprovalStatus, wardenStatus: ApprovalStatus) => {
        return {
            student: 'completed',
            staff: staffStatus === 'approved' ? 'completed' : staffStatus === 'rejected' ? 'rejected' : 'active',
            warden: staffStatus === 'approved' ? (wardenStatus === 'pending' ? 'active' : wardenStatus) : 'inactive',
        };
    };

    const timeline = getTimelineStatus(outpassData.staffApproval.status, outpassData.wardenApproval.status);

    // Sample last month outpasses data
    const lastMonthOutpasses: OutpassData[] = [
        {
            id: '1',
            studentId: '2021IT001',
            studentName: 'Mohanraj',
            fromDate: '2025-12-15T10:00',
            toDate: '2025-12-17T18:00',
            reason: 'Family emergency',
            overallStatus: 'approved',
            staffApproval: { status: 'approved', approvedAt: '2025-12-14T09:00' },
            wardenApproval: { status: 'approved', approvedAt: '2025-12-14T14:00' },
            createdAt: '2025-12-14T08:30',
        },
        {
            id: '2',
            studentId: '2021IT001',
            studentName: 'Mohanraj',
            fromDate: '2025-12-22T14:00',
            toDate: '2025-12-23T20:00',
            reason: 'Medical appointment',
            overallStatus: 'rejected',
            staffApproval: { status: 'rejected', rejectedAt: '2025-12-21T10:00', remarks: 'Insufficient notice' },
            wardenApproval: { status: 'pending' },
            createdAt: '2025-12-21T09:00',
        },
        {
            id: '3',
            studentId: '2021IT001',
            studentName: 'Mohanraj',
            fromDate: '2025-12-28T09:00',
            toDate: '2025-12-30T18:00',
            reason: 'Home visit for festival',
            overallStatus: 'approved',
            staffApproval: { status: 'approved', approvedAt: '2025-12-27T11:00' },
            wardenApproval: { status: 'approved', approvedAt: '2025-12-27T15:00' },
            createdAt: '2025-12-27T10:00',
        },
        {
            id: '4',
            studentId: '2021IT001',
            studentName: 'Mohanraj',
            fromDate: '2025-12-05T10:00',
            toDate: '2025-12-06T18:00',
            reason: 'College event participation',
            overallStatus: 'pending',
            staffApproval: { status: 'approved', approvedAt: '2025-12-04T14:00' },
            wardenApproval: { status: 'pending' },
            createdAt: '2025-12-04T12:00',
        },
    ];

    // Calculate summary statistics
    const summary = {
        total: lastMonthOutpasses.length,
        approved: lastMonthOutpasses.filter(o => o.overallStatus === 'approved').length,
        rejected: lastMonthOutpasses.filter(o => o.overallStatus === 'rejected').length,
        pending: lastMonthOutpasses.filter(o => o.overallStatus === 'pending').length,
    };

    // Filter outpasses based on selected filter
    const filteredOutpasses = selectedFilter === 'all'
        ? lastMonthOutpasses
        : lastMonthOutpasses.filter(o => o.overallStatus === selectedFilter);

    return (
        <div className="page-container outpass-details-page">
            <Nav />
            <div className="content-wrapper">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left">
                        <button onClick={() => navigate(-1)} className="back-btn">
                            ← Back
                        </button>
                        <div>
                            <h1>Outpass Details</h1>
                            <p>View complete outpass information and approval status</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/new-outpass')} className="new-outpass-btn">
                        + New Outpass
                    </button>
                </div>

                {/* Last Month Outpass Summary */}
                <div className="summary-section">
                    <div className="summary-header">
                        <h2>📊 Last Month Outpass Summary</h2>
                        <p>December 2025</p>
                    </div>
                    <div className="summary-metrics">
                        <div className="metric-card total" onClick={() => { setSelectedFilter('all'); setShowModal(true); }}>
                            <div className="metric-icon">📋</div>
                            <div className="metric-info">
                                <div className="metric-value">{summary.total}</div>
                                <div className="metric-label">Total Requests</div>
                            </div>
                        </div>
                        <div className="metric-card approved" onClick={() => { setSelectedFilter('approved'); setShowModal(true); }}>
                            <div className="metric-icon">✅</div>
                            <div className="metric-info">
                                <div className="metric-value">{summary.approved}</div>
                                <div className="metric-label">Approved</div>
                            </div>
                        </div>
                        <div className="metric-card rejected" onClick={() => { setSelectedFilter('rejected'); setShowModal(true); }}>
                            <div className="metric-icon">❌</div>
                            <div className="metric-info">
                                <div className="metric-value">{summary.rejected}</div>
                                <div className="metric-label">Rejected</div>
                            </div>
                        </div>
                        <div className="metric-card pending" onClick={() => { setSelectedFilter('pending'); setShowModal(true); }}>
                            <div className="metric-icon">⏳</div>
                            <div className="metric-info">
                                <div className="metric-value">{summary.pending}</div>
                                <div className="metric-label">Pending</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="timeline-container">
                    <div className={`timeline-step ${timeline.student}`}>
                        <div className="timeline-icon">📝</div>
                        <div className="timeline-label">Student Applied</div>
                    </div>
                    <div className="timeline-connector"></div>
                    <div className={`timeline-step ${timeline.staff}`}>
                        <div className="timeline-icon">👨‍🏫</div>
                        <div className="timeline-label">Staff Review</div>
                    </div>
                    <div className="timeline-connector"></div>
                    <div className={`timeline-step ${timeline.warden}`}>
                        <div className="timeline-icon">👔</div>
                        <div className="timeline-label">Warden Approval</div>
                    </div>
                </div>

                {/* Outpass Information Card */}
                <div className="details-card">
                    <div className="card-header">
                        <h2>📋 Outpass Information</h2>
                    </div>
                    <div className="card-content">
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Student ID</label>
                                <p>{outpassData.studentId}</p>
                            </div>
                            <div className="info-item">
                                <label>Student Name</label>
                                <p>{outpassData.studentName}</p>
                            </div>
                            <div className="info-item">
                                <label>From Date & Time</label>
                                <p>{formatDateTime(outpassData.fromDate)}</p>
                            </div>
                            <div className="info-item">
                                <label>To Date & Time</label>
                                <p>{formatDateTime(outpassData.toDate)}</p>
                            </div>
                            <div className="info-item full-width">
                                <label>Reason for Leave</label>
                                <p>{outpassData.reason}</p>
                            </div>
                            <div className="info-item">
                                <label>Applied On</label>
                                <p>{formatDateTime(outpassData.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Approval Sections */}
                <div className="approval-sections">
                    {/* Staff Approval */}
                    <div className="approval-card">
                        <div className="card-header">
                            <h2>👨‍🏫 Staff Approval</h2>
                        </div>
                        <div className="card-content">
                            <div className="approval-status">
                                <label>Status</label>
                                {getStatusBadge(outpassData.staffApproval.status)}
                            </div>

                            {outpassData.staffApproval.remarks && (
                                <div className="approval-remarks">
                                    <label>Remarks</label>
                                    <p>{outpassData.staffApproval.remarks}</p>
                                </div>
                            )}

                            {outpassData.staffApproval.approvedAt && (
                                <div className="approval-timestamp">
                                    <label>✅ Approved At</label>
                                    <p>{formatDateTime(outpassData.staffApproval.approvedAt)}</p>
                                </div>
                            )}

                            {outpassData.staffApproval.rejectedAt && (
                                <div className="approval-timestamp">
                                    <label>❌ Rejected At</label>
                                    <p>{formatDateTime(outpassData.staffApproval.rejectedAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Warden Approval */}
                    <div className="approval-card">
                        <div className="card-header">
                            <h2>👔 Warden Approval</h2>
                        </div>
                        <div className="card-content">
                            <div className="approval-status">
                                <label>Status</label>
                                {getStatusBadge(outpassData.wardenApproval.status)}
                            </div>

                            {outpassData.wardenApproval.remarks && (
                                <div className="approval-remarks">
                                    <label>Remarks</label>
                                    <p>{outpassData.wardenApproval.remarks}</p>
                                </div>
                            )}

                            {outpassData.wardenApproval.approvedAt && (
                                <div className="approval-timestamp">
                                    <label>✅ Approved At</label>
                                    <p>{formatDateTime(outpassData.wardenApproval.approvedAt)}</p>
                                </div>
                            )}

                            {outpassData.wardenApproval.rejectedAt && (
                                <div className="approval-timestamp">
                                    <label>❌ Rejected At</label>
                                    <p>{formatDateTime(outpassData.wardenApproval.rejectedAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal for Outpass List */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedOutpassForView(null); }}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>
                                    {selectedOutpassForView ? 'Outpass Details' :
                                        selectedFilter === 'all' ? 'All Outpasses' :
                                            selectedFilter === 'approved' ? 'Approved Outpasses' :
                                                selectedFilter === 'rejected' ? 'Rejected Outpasses' :
                                                    'Pending Outpasses'}
                                </h3>
                                <button className="modal-close-btn" onClick={() => { setShowModal(false); setSelectedOutpassForView(null); }}>
                                    ✕
                                </button>
                            </div>
                            <div className="modal-body">
                                {selectedOutpassForView ? (
                                    /* Show detailed view of selected outpass */
                                    <div className="outpass-detail-view">
                                        <button className="back-to-list-btn" onClick={() => setSelectedOutpassForView(null)}>
                                            ← Back to List
                                        </button>

                                        <div className="detail-status-badge">
                                            {getStatusBadge(selectedOutpassForView.overallStatus)}
                                        </div>

                                        <div className="detail-section">
                                            <h4>📋 Outpass Information</h4>
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <label>Student ID</label>
                                                    <p>{selectedOutpassForView.studentId}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Student Name</label>
                                                    <p>{selectedOutpassForView.studentName}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>From Date & Time</label>
                                                    <p>{formatDateTime(selectedOutpassForView.fromDate)}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>To Date & Time</label>
                                                    <p>{formatDateTime(selectedOutpassForView.toDate)}</p>
                                                </div>
                                                <div className="detail-item full-width">
                                                    <label>Reason</label>
                                                    <p>{selectedOutpassForView.reason}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Applied On</label>
                                                    <p>{formatDateTime(selectedOutpassForView.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="detail-approvals">
                                            <div className="detail-approval-card">
                                                <h4>👨‍🏫 Staff Approval</h4>
                                                <div className="approval-info">
                                                    <label>Status</label>
                                                    {getStatusBadge(selectedOutpassForView.staffApproval.status)}
                                                </div>
                                                {selectedOutpassForView.staffApproval.remarks && (
                                                    <div className="approval-info">
                                                        <label>Remarks</label>
                                                        <p>{selectedOutpassForView.staffApproval.remarks}</p>
                                                    </div>
                                                )}
                                                {selectedOutpassForView.staffApproval.approvedAt && (
                                                    <div className="approval-info">
                                                        <label>✅ Approved At</label>
                                                        <p>{formatDateTime(selectedOutpassForView.staffApproval.approvedAt)}</p>
                                                    </div>
                                                )}
                                                {selectedOutpassForView.staffApproval.rejectedAt && (
                                                    <div className="approval-info">
                                                        <label>❌ Rejected At</label>
                                                        <p>{formatDateTime(selectedOutpassForView.staffApproval.rejectedAt)}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="detail-approval-card">
                                                <h4>👔 Warden Approval</h4>
                                                <div className="approval-info">
                                                    <label>Status</label>
                                                    {getStatusBadge(selectedOutpassForView.wardenApproval.status)}
                                                </div>
                                                {selectedOutpassForView.wardenApproval.remarks && (
                                                    <div className="approval-info">
                                                        <label>Remarks</label>
                                                        <p>{selectedOutpassForView.wardenApproval.remarks}</p>
                                                    </div>
                                                )}
                                                {selectedOutpassForView.wardenApproval.approvedAt && (
                                                    <div className="approval-info">
                                                        <label>✅ Approved At</label>
                                                        <p>{formatDateTime(selectedOutpassForView.wardenApproval.approvedAt)}</p>
                                                    </div>
                                                )}
                                                {selectedOutpassForView.wardenApproval.rejectedAt && (
                                                    <div className="approval-info">
                                                        <label>❌ Rejected At</label>
                                                        <p>{formatDateTime(selectedOutpassForView.wardenApproval.rejectedAt)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Show list of outpasses */
                                    filteredOutpasses.length === 0 ? (
                                        <div className="empty-state">
                                            <p>No outpasses found for this filter.</p>
                                        </div>
                                    ) : (
                                        <div className="outpass-list">
                                            {filteredOutpasses.map((outpass) => (
                                                <div
                                                    key={outpass.id}
                                                    className="outpass-item"
                                                    onClick={() => setSelectedOutpassForView(outpass)}
                                                >
                                                    <div className="outpass-item-header">
                                                        <div className="outpass-item-date">
                                                            <span className="date-label">📅</span>
                                                            <span>{formatDateTime(outpass.fromDate)} → {formatDateTime(outpass.toDate)}</span>
                                                        </div>
                                                        {getStatusBadge(outpass.overallStatus)}
                                                    </div>
                                                    <div className="outpass-item-reason">
                                                        <strong>Reason:</strong> {outpass.reason}
                                                    </div>
                                                    <div className="outpass-item-footer">
                                                        <span className="applied-date">Applied: {formatDateTime(outpass.createdAt)}</span>
                                                        <span className="view-details">View Details →</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .page-container {
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .content-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .page-header h1 {
                    font-size: 2rem;
                    color: #1e293b;
                    margin: 0;
                    background: linear-gradient(135deg, #0047AB, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .page-header p {
                    color: #64748b;
                    margin: 4px 0 0 0;
                    font-size: 0.95rem;
                }

                .back-btn {
                    background: white;
                    border: 1px solid #e2e8f0;
                    color: #0047AB;
                    cursor: pointer;
                    font-weight: 500;
                    padding: 10px 20px;
                    border-radius: 12px;
                    transition: all 0.2s;
                    font-size: 0.95rem;
                }

                .back-btn:hover {
                    background: #eff6ff;
                    border-color: #0047AB;
                }

                .new-outpass-btn {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.2);
                }

                .new-outpass-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 71, 171, 0.3);
                }

                .overall-status-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 32px;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    border-radius: 16px;
                    font-weight: 600;
                    font-size: 1.1rem;
                    border: 2px solid currentColor;
                }

                .status-icon {
                    font-size: 1.2rem;
                }

                /* Timeline */
                .timeline-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 40px;
                    padding: 32px;
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
                }

                .timeline-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    position: relative;
                }

                .timeline-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    background: #f1f5f9;
                    border: 3px solid #e2e8f0;
                    transition: all 0.3s;
                }

                .timeline-step.completed .timeline-icon {
                    background: linear-gradient(135deg, #10b981, #059669);
                    border-color: #10b981;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .timeline-step.active .timeline-icon {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    border-color: #f59e0b;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                    animation: pulse 2s infinite;
                }

                .timeline-step.rejected .timeline-icon {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    border-color: #ef4444;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .timeline-step.inactive .timeline-icon {
                    opacity: 0.4;
                }

                .timeline-label {
                    font-weight: 600;
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .timeline-step.completed .timeline-label,
                .timeline-step.active .timeline-label {
                    color: #1e293b;
                }

                .timeline-connector {
                    width: 100px;
                    height: 3px;
                    background: #e2e8f0;
                    margin: 0 16px;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                /* Cards */
                .details-card,
                .approval-card {
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    margin-bottom: 24px;
                    overflow: hidden;
                    animation: fadeInUp 0.5s ease-out;
                }

                .card-header {
                    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                    padding: 24px 32px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .card-header h2 {
                    margin: 0;
                    font-size: 1.3rem;
                    color: #1e293b;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .card-content {
                    padding: 32px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .info-item.full-width {
                    grid-column: 1 / -1;
                }

                .info-item label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-item p {
                    margin: 0;
                    font-size: 1rem;
                    color: #1e293b;
                    font-weight: 500;
                    padding: 12px 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border-left: 4px solid #0047AB;
                }

                /* Approval Sections */
                .approval-sections {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }

                .approval-status {
                    margin-bottom: 20px;
                }

                .approval-status label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 12px;
                }

                .approval-remarks,
                .approval-timestamp {
                    margin-top: 20px;
                }

                .approval-remarks label,
                .approval-timestamp label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                }

                .approval-remarks p,
                .approval-timestamp p {
                    margin: 0;
                    padding: 12px 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                    color: #1e293b;
                    font-weight: 500;
                }

                /* Summary Section */
                .summary-section {
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    padding: 32px;
                    margin-top: 24px;
                    animation: fadeInUp 0.5s ease-out;
                }

                .summary-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .summary-header h2 {
                    font-size: 1.5rem;
                    color: #1e293b;
                    margin: 0 0 8px 0;
                }

                .summary-header p {
                    color: #64748b;
                    margin: 0;
                    font-size: 0.95rem;
                }

                .summary-metrics {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }

                .metric-card {
                    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 2px solid transparent;
                }

                .metric-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
                }

                .metric-card.total {
                    border-color: #3b82f6;
                }

                .metric-card.total:hover {
                    background: linear-gradient(135deg, #eff6ff, #dbeafe);
                    box-shadow: 0 12px 24px rgba(59, 130, 246, 0.2);
                }

                .metric-card.approved {
                    border-color: #10b981;
                }

                .metric-card.approved:hover {
                    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
                    box-shadow: 0 12px 24px rgba(16, 185, 129, 0.2);
                }

                .metric-card.rejected {
                    border-color: #ef4444;
                }

                .metric-card.rejected:hover {
                    background: linear-gradient(135deg, #fee2e2, #fecaca);
                    box-shadow: 0 12px 24px rgba(239, 68, 68, 0.2);
                }

                .metric-card.pending {
                    border-color: #f59e0b;
                }

                .metric-card.pending:hover {
                    background: linear-gradient(135deg, #fef3c7, #fde68a);
                    box-shadow: 0 12px 24px rgba(245, 158, 11, 0.2);
                }

                .metric-icon {
                    font-size: 2.5rem;
                    line-height: 1;
                }

                .metric-info {
                    flex: 1;
                }

                .metric-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1e293b;
                    line-height: 1;
                    margin-bottom: 4px;
                }

                .metric-label {
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content {
                    background: white;
                    border-radius: 24px;
                    width: 90%;
                    max-width: 800px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease-out;
                }

                .modal-header {
                    padding: 24px 32px;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    border-radius: 24px 24px 0 0;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: white;
                }

                .modal-close-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-close-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: rotate(90deg);
                }

                .modal-body {
                    padding: 24px 32px;
                    overflow-y: auto;
                    flex: 1;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: #64748b;
                }

                .outpass-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .outpass-item {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 20px;
                    border: 2px solid #e2e8f0;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .outpass-item:hover {
                    background: white;
                    border-color: #0047AB;
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.1);
                    transform: translateX(4px);
                }

                .outpass-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .outpass-item-date {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 0.9rem;
                }

                .date-label {
                    font-size: 1.2rem;
                }

                .outpass-item-reason {
                    color: #475569;
                    margin-bottom: 12px;
                    font-size: 0.95rem;
                }

                .outpass-item-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.85rem;
                }

                .applied-date {
                    color: #64748b;
                }

                .view-details {
                    color: #0047AB;
                    font-weight: 600;
                }

                /* Outpass Detail View in Modal */
                .outpass-detail-view {
                    padding: 8px 0;
                }

                .back-to-list-btn {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    color: #0047AB;
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 20px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .back-to-list-btn:hover {
                    background: #eff6ff;
                    border-color: #0047AB;
                }

                .detail-status-badge {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .detail-section {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 20px;
                }

                .detail-section h4 {
                    margin: 0 0 16px 0;
                    font-size: 1.1rem;
                    color: #1e293b;
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .detail-item.full-width {
                    grid-column: 1 / -1;
                }

                .detail-item label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .detail-item p {
                    margin: 0;
                    padding: 10px 12px;
                    background: white;
                    border-radius: 8px;
                    color: #1e293b;
                    font-weight: 500;
                    border-left: 3px solid #0047AB;
                }

                .detail-approvals {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                .detail-approval-card {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 20px;
                }

                .detail-approval-card h4 {
                    margin: 0 0 16px 0;
                    font-size: 1rem;
                    color: #1e293b;
                }

                .approval-info {
                    margin-bottom: 16px;
                }

                .approval-info:last-child {
                    margin-bottom: 0;
                }

                .approval-info label {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                }

                .approval-info p {
                    margin: 0;
                    padding: 10px 12px;
                    background: white;
                    border-radius: 8px;
                    color: #1e293b;
                    font-weight: 500;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .header-left {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .new-outpass-btn {
                        width: 100%;
                    }

                    .timeline-container {
                        padding: 20px;
                    }

                    .timeline-connector {
                        width: 40px;
                        margin: 0 8px;
                    }

                    .timeline-icon {
                        width: 50px;
                        height: 50px;
                        font-size: 1.2rem;
                    }

                    .timeline-label {
                        font-size: 0.8rem;
                    }

                    .info-grid,
                    .approval-sections {
                        grid-template-columns: 1fr;
                    }

                    .card-content {
                        padding: 20px;
                    }

                    .summary-metrics {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }

                    .metric-card {
                        padding: 16px;
                        flex-direction: column;
                        text-align: center;
                    }

                    .metric-icon {
                        font-size: 2rem;
                    }

                    .metric-value {
                        font-size: 1.5rem;
                    }

                    .modal-content {
                        width: 95%;
                        max-height: 90vh;
                    }

                    .modal-header,
                    .modal-body {
                        padding: 16px 20px;
                    }

                    .outpass-item {
                        padding: 16px;
                    }

                    .outpass-item-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .detail-grid,
                    .detail-approvals {
                        grid-template-columns: 1fr;
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default OutpassDetails;
