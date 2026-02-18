import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
}

const OutpassDetails: React.FC = () => {
    const navigate = useNavigate();
    const [selectedOutpass, setSelectedOutpass] = useState<OutpassData | null>(null);

    const [outpasses, setOutpasses] = useState<OutpassData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [residenceType, setResidenceType] = useState<string>('');
    const [user, setUser] = useState<any>(null);

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
                    setUser(userData);
                }

                if (outpassResponse.status === 200) {
                    const mappedOutpasses = (outpassResponse.data.outpasses || []).map((item: any) => ({
                        id: item._id,
                        // Fix: valid renderable string is extracted from studentid object
                        studentId: (typeof item.studentid === 'object' && item.studentid !== null)
                            ? (item.studentid.registerNumber || item.studentid.name || 'Unknown')
                            : String(item.studentid || ''),
                        studentName: (typeof item.studentid === 'object' && item.studentid !== null)
                            ? (item.studentid.name || 'Student')
                            : 'Student',
                        fromDate: item.fromDate,
                        toDate: item.toDate,
                        reason: item.reason,
                        overallStatus: item.status || 'pending',
                        createdAt: item.createdAt,
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
        const statusConfig: Record<string, { dot: string, label: string, color: string, bg: string }> = {
            pending: { dot: '●', label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
            approved: { dot: '●', label: 'Approved', color: '#10b981', bg: '#d1fae5' },
            rejected: { dot: '●', label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
            // Add fallback for potential other statuses
            declined: { dot: '●', label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
        };

        const config = statusConfig[normalizedStatus] || statusConfig['pending'];

        return (
            <span className="status-badge" style={{
                color: config.color,
                backgroundColor: config.bg
            }}>
                <span className="status-dot">{config.dot}</span>
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

    const handleViewDetails = (outpass: OutpassData) => {
        setSelectedOutpass(outpass);
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleBackToList = () => {
        setSelectedOutpass(null);
    };

    return (
        <div className="page-container outpass-details-page">
            <ToastContainer position="bottom-right" />
            <header className="dashboard-header-custom">
                <div className="header-container-custom">
                    <div className="header-left-custom">
                        <div className="brand-custom">
                            <span className="brand-icon-custom">🎓</span>
                            <span className="brand-text-custom">JIT Student Portal</span>
                        </div>
                    </div>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>

                    <nav className={`header-nav-custom ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/dashboard')}
                        >
                            Dashboard
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/staffs')}
                        >
                            Staffs
                        </button>
                        {/* <button
                            className="nav-item-custom"
                            onClick={() => navigate('/student-notice')}
                        >
                            Notices
                        </button> */}
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/outpass')}
                        >
                            Outpass
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/subjects')}
                        >
                            Subjects
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/profile')}
                        >
                            Profile
                        </button>
                        <button className="logout-btn-custom" onClick={handleLogout}>
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            <div className="content-wrapper">
                {/* Header */}
                <div className="page-header">
                    <h1>{selectedOutpass ? 'Outpass Details' : 'All Outpasses'}</h1>
                    <button
                        className="new-outpass-btn"
                        onClick={() => navigate('/new-outpass')}
                    >
                        + New Outpass
                    </button>
                </div>

                {/* Conditional Rendering: List View or Detail View */}
                {!selectedOutpass ? (
                    /* List View */
                    <div className="outpass-list-view">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading outpasses...</div>
                        ) : outpasses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No outpasses found. APPLY ONE NOW!</div>
                        ) : (
                            outpasses.map((outpass) => (
                                <div key={outpass.id} className="outpass-card">
                                    <div className="outpass-card-header">
                                        <div className="outpass-duration">
                                            <span className="calendar-icon">📅</span>
                                            <span className="duration-text">
                                                {formatDateTime(outpass.fromDate)} → {formatDateTime(outpass.toDate)}
                                            </span>
                                        </div>
                                        {getStatusBadge(outpass.overallStatus)}
                                    </div>
                                    <div className="outpass-card-body">
                                        <div className="reason-section">
                                            <strong>Reason:</strong> {outpass.reason}
                                        </div>
                                        <div className="applied-section">
                                            <span className="applied-label">Applied on:</span>
                                            <span className="applied-date">{formatDateTime(outpass.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="outpass-card-footer">
                                        <button
                                            className="view-details-btn"
                                            onClick={() => handleViewDetails(outpass)}
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            )))}
                    </div>
                ) : (
                    /* Detail View */
                    <div className="outpass-detail-view">
                        <button className="back-to-list-btn" onClick={handleBackToList}>
                            ← Back to All Outpasses
                        </button>

                        {/* Student Details Section */}
                        {user && (
                            <div className="detail-section student-info">
                                <div className="info-grid">
                                    <div className="info-field">
                                        <label>NAME</label>
                                        <div className="info-value">{user.name}</div>
                                    </div>
                                    <div className="info-field">
                                        <label>REGISTER NUMBER</label>
                                        <div className="info-value">{user.registerNumber}</div>
                                    </div>
                                    <div className="info-field">
                                        <label>DEPARTMENT</label>
                                        <div className="info-value uppercase">{user.department}</div>
                                    </div>
                                    <div className="info-field">
                                        <label>YEAR</label>
                                        <div className="info-value">{user.year}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Basic Information Section */}
                        <div className="detail-section basic-info">
                            <div className="info-field">
                                <label>STUDENT ID</label>
                                <div className="info-value">
                                    {selectedOutpass.studentId}
                                </div>
                            </div>
                            <div className="info-field">
                                <label>FROM DATE & TIME</label>
                                <div className="info-value">
                                    {formatDateTime(selectedOutpass.fromDate)}
                                </div>
                            </div>
                            <div className="info-field">
                                <label>TO DATE & TIME</label>
                                <div className="info-value">
                                    {formatDateTime(selectedOutpass.toDate)}
                                </div>
                            </div>
                            <div className="info-field">
                                <label>REASON</label>
                                <div className="info-value-box">
                                    {selectedOutpass.reason}
                                </div>
                            </div>
                            <div className="info-field">
                                <label>APPLIED ON</label>
                                <div className="info-value">
                                    {formatDateTime(selectedOutpass.createdAt)}
                                </div>
                            </div>
                        </div>

                        {/* Approval Status Section */}
                        <div className="approval-section">
                            {/* Staff Approval Card */}
                            <div className="approval-card">
                                <div className="approval-card-header">
                                    <span className="approval-icon">👨‍🏫</span>
                                    <h3>Staff Approval</h3>
                                </div>
                                <div className="approval-card-body">
                                    <div className="approval-field">
                                        <label>STATUS</label>
                                        {getStatusBadge(selectedOutpass.staffApproval.status)}
                                    </div>
                                    {selectedOutpass.staffApproval.approverName && (
                                        <div className="approval-field">
                                            <label>APPROVED BY</label>
                                            <div className="approval-value">
                                                {selectedOutpass.staffApproval.approverName}
                                            </div>
                                        </div>
                                    )}
                                    {selectedOutpass.staffApproval.approvedAt && (
                                        <div className="approval-field">
                                            <label>APPROVED AT</label>
                                            <div className="approval-value">
                                                {formatDateTime(selectedOutpass.staffApproval.approvedAt)}
                                            </div>
                                        </div>
                                    )}
                                    {selectedOutpass.staffApproval.rejectedAt && (
                                        <div className="approval-field">
                                            <label>REJECTED AT</label>
                                            <div className="approval-value">
                                                {formatDateTime(selectedOutpass.staffApproval.rejectedAt)}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedOutpass.staffApproval.remarks && (
                                        <div className="approval-field">
                                            <label>STAFF REMARKS</label>
                                            <div className="approval-value">
                                                {selectedOutpass.staffApproval.remarks}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Year Incharge Approval Card */}
                            <div className="approval-card">
                                <div className="approval-card-header">
                                    <span className="approval-icon">🧑‍💼</span>
                                    <h3>Year Incharge Approval</h3>
                                </div>
                                <div className="approval-card-body">
                                    <div className="approval-field">
                                        <label>STATUS</label>
                                        {getStatusBadge(selectedOutpass.yearInchargeApproval.status)}
                                    </div>
                                    {selectedOutpass.yearInchargeApproval.approverName && (
                                        <div className="approval-field">
                                            <label>APPROVED BY</label>
                                            <div className="approval-value">
                                                {selectedOutpass.yearInchargeApproval.approverName}
                                            </div>
                                        </div>
                                    )}
                                    {selectedOutpass.yearInchargeApproval.approvedAt && (
                                        <div className="approval-field">
                                            <label>APPROVED AT</label>
                                            <div className="approval-value">
                                                {formatDateTime(selectedOutpass.yearInchargeApproval.approvedAt)}
                                            </div>
                                        </div>
                                    )}
                                    {selectedOutpass.yearInchargeApproval.rejectedAt && (
                                        <div className="approval-field">
                                            <label>REJECTED AT</label>
                                            <div className="approval-value">
                                                {formatDateTime(selectedOutpass.yearInchargeApproval.rejectedAt)}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedOutpass.yearInchargeApproval.remarks && (
                                        <div className="approval-field">
                                            <label>REMARKS</label>
                                            <div className="approval-value">
                                                {selectedOutpass.yearInchargeApproval.remarks}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Warden Approval Card - Only for Hostel Students */}
                            {residenceType === 'hostel' && (
                                <div className="approval-card">
                                    <div className="approval-card-header">
                                        <span className="approval-icon">👔</span>
                                        <h3>Warden Approval</h3>
                                    </div>
                                    <div className="approval-card-body">
                                        <div className="approval-field">
                                            <label>STATUS</label>
                                            {getStatusBadge(selectedOutpass.wardenApproval.status)}
                                        </div>
                                        {selectedOutpass.wardenApproval.approverName && (
                                            <div className="approval-field">
                                                <label>APPROVED BY</label>
                                                <div className="approval-value">
                                                    {selectedOutpass.wardenApproval.approverName}
                                                </div>
                                            </div>
                                        )}
                                        {selectedOutpass.wardenApproval.approvedAt && (
                                            <div className="approval-field">
                                                <label>APPROVED AT</label>
                                                <div className="approval-value">
                                                    {formatDateTime(selectedOutpass.wardenApproval.approvedAt)}
                                                </div>
                                            </div>
                                        )}
                                        {selectedOutpass.wardenApproval.rejectedAt && (
                                            <div className="approval-field">
                                                <label>REJECTED AT</label>
                                                <div className="approval-value">
                                                    {formatDateTime(selectedOutpass.wardenApproval.rejectedAt)}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {selectedOutpass.wardenApproval.remarks && (
                                            <div className="approval-field">
                                                <label>WARDEN REMARKS</label>
                                                <div className="approval-value">
                                                    {selectedOutpass.wardenApproval.remarks}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                /* Custom Dashboard Header */
                .dashboard-header-custom {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 70px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    z-index: 1000;
                }

                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #1e293b;
                    padding: 8px;
                    z-index: 1001;
                }

                .header-container-custom {
                    max-width: 1400px;
                    margin: 0 auto;
                    height: 100%;
                    padding: 0 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left-custom {
                    display: flex;
                    align-items: center;
                }

                .brand-custom {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .brand-icon-custom {
                    font-size: 28px;
                }

                .brand-text-custom {
                    font-size: 1.3rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-nav-custom {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-item-custom {
                    padding: 10px 20px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                }

                .nav-item-custom:hover {
                    background: #f1f5f9;
                    color: #0047AB;
                }

                .logout-btn-custom {
                    padding: 10px 24px;
                    border: 2px solid #ef4444;
                    background: white;
                    color: #ef4444;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    margin-left: 12px;
                }

                .logout-btn-custom:hover {
                    background: #ef4444;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .content-wrapper-custom {
                    margin-top: 70px;
                    padding: 0;
                }


                .page-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
                }

                .content-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }

                 @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: block;
                    }

                    .header-nav-custom {
                        position: absolute;
                        top: 70px;
                        left: 0;
                        right: 0;
                        background: white;
                        flex-direction: column;
                        padding: 0;
                        border-bottom: 1px solid #e2e8f0;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        max-height: 0;
                        transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
                        gap: 0;
                    }

                    .header-nav-custom.mobile-open {
                        max-height: 500px;
                        padding: 16px 0;
                    }

                    .nav-item-custom, .logout-btn-custom {
                        width: 100%;
                        text-align: left;
                        padding: 12px 24px;
                        border-radius: 0;
                        margin: 0;
                    }

                    .logout-btn-custom {
                        border: none;
                        border-top: 1px solid #fee2e2;
                        color: #ef4444;
                        margin-top: 8px;
                    }

                    .content-wrapper-custom {
                        margin-top: 70px;
                    }
                }

                /* Page Header */
                .page-header {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    padding: 32px 40px;
                    border-radius: 20px;
                    margin-bottom: 32px;
                    box-shadow: 0 10px 30px rgba(0, 71, 171, 0.2);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                }

                .page-header h1 {
                    margin: 0;
                    font-size: 2.2rem;
                    color: white;
                    font-weight: 700;
                }

                .new-outpass-btn {
                    background: white;
                    color: #0047AB;
                    border: none;
                    padding: 12px 28px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    white-space: nowrap;
                }

                .new-outpass-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
                    background: #f0f9ff;
                }


                /* List View */
                .outpass-list-view {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    animation: fadeIn 0.4s ease-out;
                }

                .outpass-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .outpass-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 71, 171, 0.15);
                    border-color: #0047AB;
                }

                .outpass-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .outpass-duration {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 1rem;
                }

                .calendar-icon {
                    font-size: 1.4rem;
                }

                .duration-text {
                    color: #334155;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border: 2px solid currentColor;
                }

                .status-dot {
                    font-size: 0.8rem;
                    line-height: 1;
                }

                .outpass-card-body {
                    margin-bottom: 16px;
                }

                .reason-section {
                    color: #475569;
                    font-size: 1rem;
                    line-height: 1.6;
                    margin-bottom: 12px;
                }

                .reason-section strong {
                    color: #1e293b;
                }

                .applied-section {
                    display: flex;
                    gap: 8px;
                    font-size: 0.9rem;
                    color: #64748b;
                }

                .applied-label {
                    font-weight: 500;
                }

                .applied-date {
                    font-weight: 600;
                    color: #475569;
                }

                .outpass-card-footer {
                    display: flex;
                    justify-content: flex-end;
                }

                .view-details-btn {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.2);
                }

                .view-details-btn:hover {
                    transform: translateX(4px);
                    box-shadow: 0 6px 16px rgba(0, 71, 171, 0.3);
                }

                /* Detail View */
                .outpass-detail-view {
                    animation: slideIn 0.4s ease-out;
                }

                .back-to-list-btn {
                    background: white;
                    border: 2px solid #0047AB;
                    color: #0047AB;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-bottom: 24px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.1);
                }

                .back-to-list-btn:hover {
                    background: #0047AB;
                    color: white;
                    transform: translateX(-4px);
                }

                /* Basic Information Section */
                .detail-section.student-info {
                    background: white;
                    border-radius: 16px;
                    padding: 28px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    border-left: 5px solid #0047AB;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }

                .uppercase {
                    text-transform: uppercase;
                }

                .detail-section.basic-info {
                    background: white;
                    border-radius: 16px;
                    padding: 28px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }

                .info-field {
                    margin-bottom: 20px;
                }

                .info-field:last-child {
                    margin-bottom: 0;
                }

                .info-field label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 10px;
                }

                .info-value-box {
                    padding: 16px 20px;
                    background: #f8fafc;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    color: #1e293b;
                    font-size: 1rem;
                    line-height: 1.6;
                    font-weight: 500;
                }

                .info-value {
                    padding: 12px 16px;
                    background: #f8fafc;
                    border-radius: 10px;
                    color: #1e293b;
                    font-size: 1rem;
                    font-weight: 600;
                    border-left: 4px solid #0047AB;
                }

                /* Approval Section */
                .approval-section {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }

                @media (max-width: 1024px) {
                     .approval-section {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                     .approval-section {
                        grid-template-columns: 1fr;
                    }
                }

                .approval-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }

                .approval-card-header {
                    background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 2px solid #e2e8f0;
                }

                .approval-icon {
                    font-size: 1.8rem;
                }

                .approval-card-header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    color: #1e293b;
                    font-weight: 700;
                }

                .approval-card-body {
                    padding: 24px;
                }

                .approval-field {
                    margin-bottom: 20px;
                }

                .approval-field:last-child {
                    margin-bottom: 0;
                }

                .approval-field label {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 10px;
                }

                .approval-value {
                    padding: 12px 16px;
                    background: #f8fafc;
                    border-radius: 10px;
                    color: #1e293b;
                    font-size: 0.95rem;
                    font-weight: 500;
                    border-left: 4px solid #0047AB;
                }

                /* Animations */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .content-wrapper {
                        padding: 20px 16px;
                    }

                    .page-header {
                        padding: 24px 20px;
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .page-header h1 {
                        font-size: 1.8rem;
                    }

                    .new-outpass-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .outpass-card {
                        padding: 20px;
                    }

                    .outpass-card-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .outpass-duration {
                        font-size: 0.9rem;
                    }

                    .approval-section {
                        grid-template-columns: 1fr;
                    }

                    .view-details-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .back-to-list-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }

                @media (max-width: 480px) {
                    .page-header h1 {
                        font-size: 1.5rem;
                    }

                    .outpass-duration {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 6px;
                    }

                    .duration-text {
                        font-size: 0.85rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default OutpassDetails;