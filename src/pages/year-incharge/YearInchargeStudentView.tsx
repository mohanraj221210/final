import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import YearInchargeNav from '../../components/YearInchargeNav';

const YearInchargeStudentView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [outpass, setOutpass] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchOutpassDetails = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/year-incharge-login');
                return;
            }

            try {
                // Get all list and find by ID since there's no single fetch API mentioned in user prompt for 'incharge'
                // Re-using list API as per prompt instructions "Use ONLY the APIs provided below"
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/incharge/outpass/list`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 200) {
                    const list = response.data.outpasslist || [];
                    const found = list.find((o: any) => o._id === id);
                    if (found) {
                        setOutpass(found);
                    } else {
                        toast.error("Outpass record not found");
                        navigate('/year-incharge/pending-outpass');
                    }
                }
            } catch (error) {
                console.error("Error details:", error);
                toast.error("Failed to fetch details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOutpassDetails();
    }, [id, navigate]);

    const handleAction = async (status: 'approved' | 'rejected') => {
        if (!remarks.trim()) {
            toast.warning("Remarks are required for this action");
            return;
        }

        setActionLoading(true);
        const token = localStorage.getItem('token');

        try {
            const payload = {
                outpassId: id,
                yearinchargeapprovalstatus: status,
                yearinchargeremarks: remarks
            };

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/incharge/outpass/approval`,
                payload,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.status === 200) {
                toast.success("Outpass Updated Successfully");
                setTimeout(() => navigate('/year-incharge/pending-outpass'), 1500);
            }
        } catch (error: any) {
            console.error("Update error:", error);
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error("All fields are required");
                        break;
                    case 401:
                        toast.error("Session expired. Please login again.");
                        navigate('/year-incharge-login');
                        break;
                    case 404:
                        toast.error("Outpass not found");
                        break;
                    default:
                        toast.error(error.response.data?.message || "Failed to update status");
                }
            } else {
                toast.error("Network error. Please try again.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="page-container"><div className="loading">Loading details...</div></div>;
    if (!outpass) return null;

    return (
        <div className="page-container">
            <ToastContainer position="bottom-right" />
            <YearInchargeNav />
            <div className="content-wrapper">
                <button className="back-btn" onClick={() => navigate('/year-incharge/pending-outpass')}>
                    ← Back to List
                </button>

                <div className="details-grid">
                    {/* Student Profile Card */}
                    {/* New Student Profile Card */}
                    <div className="student-card-modern">
                        <div className="card-header-gradient">
                            <div className="avatar-large">
                                {outpass.studentid?.name?.charAt(0) || 'S'}
                            </div>
                            <h3>{outpass.studentid?.name}</h3>
                            <span className="badge-reg">{outpass.studentid?.registerNumber}</span>
                        </div>
                        <div className="card-body-modern">
                            <div className="info-row-modern">
                                <span className="icon">🎓</span>
                                <div>
                                    <label>Department & Year</label>
                                    <p>{outpass.studentid?.department} - Year {outpass.studentid?.year}</p>
                                </div>
                            </div>
                            <div className="info-row-modern">
                                <span className="icon">🏠</span>
                                <div>
                                    <label>Residence Type</label>
                                    <p style={{ textTransform: 'capitalize' }}>{outpass.studentid?.residencetype}</p>
                                </div>
                            </div>
                            {outpass.studentid?.residencetype !== 'dayscholar' && (
                                <div className="info-row-modern">
                                    <span className="icon">🏢</span>
                                    <div>
                                        <label>Accommodation</label>
                                        <p>
                                            {outpass.studentid?.hostelname || 'Hostel'} - {outpass.studentid?.hostelroomno || 'N/A'}
                                            {(outpass.studentid?.busno || outpass.studentid?.boardingpoint) &&
                                                ` (Bus: ${outpass.studentid?.busno || '-'}, Pt: ${outpass.studentid?.boardingpoint || '-'})`}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="info-row-modern">
                                <span className="icon">📞</span>
                                <div>
                                    <label>Contact Number</label>
                                    <p>{outpass.studentid?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Outpass Details Card */}
                    <div className="card details-card">
                        <h2>Outpass Application</h2>

                        <div className="status-timeline">
                            <div className={`status-step completed`}>
                                <div className="step-dot">✓</div>
                                <div className="step-content">
                                    <h4>Request Submitted</h4>
                                    <p>{new Date(outpass.fromDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className={`status-step ${outpass.staffapprovalstatus === 'approved' ? 'completed' : 'pending'}`}>
                                <div className="step-dot">{outpass.staffapprovalstatus === 'approved' ? '✓' : '•'}</div>
                                <div className="step-content">
                                    <h4>Staff Approval</h4>
                                    <p>Status: {outpass.staffapprovalstatus}</p>
                                </div>
                            </div>
                            <div className={`status-step ${outpass.yearinchargeapprovalstatus === 'approved' ? 'completed' : outpass.yearinchargeapprovalstatus === 'rejected' ? 'rejected' : 'active'}`}>
                                <div className="step-dot">
                                    {outpass.yearinchargeapprovalstatus === 'approved' ? '✓' :
                                        outpass.yearinchargeapprovalstatus === 'rejected' ? '✕' : '●'}
                                </div>
                                <div className="step-content">
                                    <h4>Year Incharge</h4>
                                    <p>{outpass.yearinchargeapprovalstatus === 'pending' ? 'Pending Decision' : `Status: ${outpass.yearinchargeapprovalstatus}`}</p>
                                </div>
                            </div>
                            <div className={`status-step ${outpass.wardenapprovalstatus === 'approved' ? 'completed' : 'pending'}`}>
                                <div className="step-dot">{outpass.wardenapprovalstatus === 'approved' ? '✓' : '•'}</div>
                                <div className="step-content">
                                    <h4>Warden Approval</h4>
                                    <p>Status: {outpass.wardenapprovalstatus}</p>
                                </div>
                            </div>
                        </div>

                        <div className="request-details">
                            <div className="detail-group">
                                <label>Outpass Type</label>
                                <p className="highlight">{outpass.outpassType}</p>
                            </div>
                            <div className="detail-row">
                                <div className="detail-group">
                                    <label>From</label>
                                    <p>{new Date(outpass.fromDate).toLocaleString()}</p>
                                </div>
                                <div className="detail-group">
                                    <label>To</label>
                                    <p>{new Date(outpass.toDate).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="detail-group">
                                <label>Reason</label>
                                <p className="reason-text">{outpass.reason}</p>
                            </div>
                        </div>

                        {/* Approval Actions */}
                        <div className="action-section">
                            <h3>Take Action</h3>
                            <textarea
                                className="remarks-input"
                                placeholder="Enter remarks (required)..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={3}
                            />
                            <div className="action-buttons">
                                <button
                                    className="btn-reject"
                                    onClick={() => handleAction('rejected')}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Processing...' : 'Reject Request'}
                                </button>
                                <button
                                    className="btn-approve"
                                    onClick={() => handleAction('approved')}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Processing...' : 'Approve Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .details-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 24px;
                }

                .card {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .student-card-modern {
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    border: 1px solid rgba(0,0,0,0.05);
                    height: fit-content;
                }

                .card-header-gradient {
                    background: linear-gradient(135deg, #1e3a8a, #2563eb);
                    padding: 32px 24px;
                    text-align: center;
                    color: white;
                }

                .avatar-large {
                    width: 90px;
                    height: 90px;
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(10px);
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0 auto 16px;
                    color: white;
                }

                .card-header-gradient h3 {
                    font-size: 1.4rem;
                    margin-bottom: 8px;
                    font-weight: 700;
                    color: white;
                }

                .badge-reg {
                    background: rgba(255,255,255,0.15);
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                }

                .card-body-modern {
                    padding: 24px;
                }

                .info-row-modern {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                    align-items: flex-start;
                }

                .info-row-modern:last-child {
                    margin-bottom: 0;
                }

                .info-row-modern .icon {
                    font-size: 1.2rem;
                    background: #f1f5f9;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                }

                .info-row-modern label {
                    display: block;
                    font-size: 0.8rem;
                    color: #64748b;
                    margin-bottom: 2px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-row-modern p {
                    font-size: 1rem;
                    color: #1e293b;
                    font-weight: 600;
                    margin: 0;
                }

                .status-timeline {
                    margin: 24px 0;
                    padding: 24px;
                    background: #f8fafc;
                    border-radius: 16px;
                    display: flex;
                    justify-content: space-between;
                }

                .status-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    flex: 1;
                }

                .status-step:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    top: 14px;
                    left: 50%;
                    width: 100%;
                    height: 2px;
                    background: #e2e8f0;
                    z-index: 0;
                }

                .status-step.completed:not(:last-child)::after {
                    background: #10b981;
                }

                .step-dot {
                    width: 30px;
                    height: 30px;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    z-index: 1;
                    margin-bottom: 8px;
                    color: #64748b;
                }

                .status-step.completed .step-dot {
                    background: #10b981;
                    border-color: #10b981;
                    color: white;
                }

                .status-step.active .step-dot {
                    border-color: #3b82f6;
                    color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .step-content h4 {
                    font-size: 0.85rem;
                    margin-bottom: 2px;
                }

                .step-content p {
                    font-size: 0.75rem;
                    color: #64748b;
                }

                .request-details {
                    margin-top: 32px;
                }

                .detail-group {
                    margin-bottom: 20px;
                }

                .detail-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .detail-group label {
                    display: block;
                    color: #64748b;
                    font-size: 0.9rem;
                    margin-bottom: 6px;
                }

                .detail-group p {
                    font-size: 1.1rem;
                    color: #0f172a;
                    font-weight: 500;
                }

                .highlight {
                    color: #3b82f6 !important;
                    font-weight: 600 !important;
                }

                .reason-text {
                    background: #f8fafc;
                    padding: 16px;
                    border-radius: 12px;
                    font-size: 1rem !important;
                    line-height: 1.6;
                }

                .action-section {
                    margin-top: 32px;
                    padding-top: 32px;
                    border-top: 1px solid #f1f5f9;
                }

                .remarks-input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    margin: 16px 0;
                    font-family: inherit;
                    resize: vertical;
                }

                .remarks-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .action-buttons {
                    display: flex;
                    gap: 16px;
                }

                .btn-approve, .btn-reject {
                    flex: 1;
                    padding: 14px;
                    border-radius: 12px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-approve {
                    background: #10b981;
                    color: white;
                }

                .btn-approve:hover {
                    background: #059669;
                    transform: translateY(-2px);
                }

                .btn-reject {
                    background: #ef4444;
                    color: white;
                }

                .btn-reject:hover {
                    background: #dc2626;
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .details-grid {
                        grid-template-columns: 1fr;
                    }
                    .status-timeline {
                        flex-direction: column;
                        gap: 16px;
                        align-items: flex-start;
                    }
                    .status-step {
                        flex-direction: row;
                        align-items: center;
                        gap: 16px;
                        width: 100%;
                        text-align: left;
                    }
                    .status-step:not(:last-child)::after {
                        width: 2px;
                        height: 100%;
                        top: 14px;
                        left: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default YearInchargeStudentView;
