import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import WardenNav from "../../components/WardenNav";
import { toast, ToastContainer } from "react-toastify";

const WardenStudentView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [outpassHistory, setOutpassHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/warden/outpass/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudent(res.data.outpassdetail || (res.data.filterOutpass && res.data.filterOutpass[0]) || null);
      if (res.data.outpassHistory) {
        setOutpassHistory(res.data.outpassHistory);
      }
      setImageError(false);
    } catch (error) {
      console.error("Failed to fetch student details:", error);
      toast.error("Failed to load student details");
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approved' | 'rejected' | null>(null);
  const [imageError, setImageError] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'image' | 'pdf'>('image');

  const handleViewDocument = (url: string | null) => {
    if (!url) {
      toast.error("Document not found");
      return;
    }
    const fullUrl = `${url}`;
    setDocumentUrl(fullUrl);
    if (url.toLowerCase().endsWith('.pdf')) {
      setDocumentType('pdf');
    } else {
      setDocumentType('image');
    }
    setShowDocumentModal(true);
  };

  const openConfirmation = (type: 'approved' | 'rejected') => {
    setModalType(type);
    setRemarks("");
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!window.confirm("Are you sure you want to approve this outpass request?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.get(
        `${import.meta.env.VITE_API_URL}/warden/outpass/approve/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Outpass approved successfully!");
      fetchStudent();
    } catch (err: any) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status");
    }
  };

  const handleConfirmAction = async () => {
    if (!modalType) return;
    if (modalType === 'rejected' && !remarks.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/warden/outpass/reject/${id}`,
        {
          remarks: remarks,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Outpass ${modalType} successfully!`);
      setShowModal(false);
      fetchStudent();
    } catch (err: any) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status");
    }
  };

  if (!student) {
    return (
      <div className="loading-center">
        <ToastContainer />
        <div className="loading-container">
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
          <p>Loading student details...</p>
        </div>
        <style>{`
          .loading-center {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #f8fafc;
          }
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            color: #64748b;
            font-weight: 500;
          }
          .loading-bar {
            width: 200px;
            height: 6px;
            background: #e2e8f0;
            border-radius: 99px;
            overflow: hidden;
            position: relative;
          }
          .loading-progress {
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, #2563eb, #3b82f6);
            border-radius: 99px;
            position: absolute;
            animation: shimmer 1.5s infinite linear;
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  const s = student.studentid || {};
  const wardenStatus = student.warden?.status || student.wardenapprovalstatus;

  // Resolve Staff Approval Details
  const staffStatus = student.staffapprovalstatus || student.staff?.status || student.status || 'pending';
  const staffName = student.staffid?.name || student.staff?.name || student.staffname || 'N/A';
  const staffTime = student.staffapprovedAt || student.staff?.actionAt || student.staffapprovedtime;

  // Resolve Year Incharge Approval Details
  const yearInchargeStatus = student.yearinchargeapprovalstatus || student.yearincharge?.status || 'pending';
  const yearInchargeName = student.incharge?.name || student.inchargeid?.name || student.yearincharge?.name || student.yearinchargename || 'N/A';
  const yearInchargeTime = student.yearinchargeapprovedAt || student.yearincharge?.actionAt || student.yearinchargeapprovedtime;
  const yearInchargeRemarks = student.yearinchargeremarks || student.yearincharge?.remarks || student.yearinchargeremarksvalue;

  // Resolve Warden Approval Details
  const wardenName = student.wardenid?.name || student.warden?.name || 'N/A';
  const wardenTime = student.wardenapprovedAt || student.warden?.actionAt || student.approvedAt;
  const isEmergency = (student.outpasstype || '').toLowerCase().includes('emergency');
  const isLateReturn = !isEmergency && (student.isLate || (student.in && new Date(student.in) > new Date(student.toDate)));

  return (
    <div className="page-container warden-view-page">
      <WardenNav />
      <ToastContainer />

      <div className="content-wrapper">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className={`main-header ${student.outpasstype?.toLowerCase().includes('emergency') ? 'emergency' : ''}`}>
          <h1>
            Outpass Approval
            {student.outpasstype?.toLowerCase().includes('emergency') && (
              <span className="emergency-header-badge" style={{ WebkitTextFillColor: 'initial' }}>🚨 EMERGENCY</span>
            )}
            {isLateReturn && (
              <span className="emergency-header-badge" style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5', marginLeft: '10px', WebkitTextFillColor: 'initial' }}>
                ⏳ LATE RETURN
              </span>
            )}
          </h1>
        </div>

        {/* Section 1: Student Personal Details */}
        <div className="section-card">
          <div className="section-header">
            <h3>👤 Student Personal Details</h3>
          </div>
          <div className="section-body info-grid-with-avatar">
            <div className="avatar-box">
              {s.photo && !imageError ? (
                <img
                  src={
                    s.photo.startsWith('data:')
                      ? s.photo
                      : `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${s.photo?.replace(/^\//, '')}`
                  }
                  alt="Student"
                  className="initials-avatar"
                  style={{ objectFit: 'cover' }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="initials-avatar">
                  {s.name ? s.name.charAt(0).toUpperCase() : "NA"}
                </div>
              )}
            </div>
            <div className="info-fields">
              <div className="field-group">
                <label>REGISTER NUMBER</label>
                <div className="display-box">{s.registerNumber || "N/A"}</div>
              </div>
              <div className="field-group">
                <label>STUDENT NAME</label>
                <div className="display-box">{s.name || "N/A"}</div>
              </div>
              <div className="field-group">
                <label>DEPARTMENT</label>
                <div className="display-box">{s.department || "N/A"}</div>
              </div>
              <div className="field-group">
                <label>YEAR</label>
                <div className="display-box">{s.year ? `${s.year} Year` : "N/A"}</div>
              </div>
              <div className="field-group">
                <label>MOBILE NUMBER</label>
                <div className="display-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {s.phone || "N/A"}
                  {s.phone && (
                    <a
                      href={`tel:${s.phone}`}
                      className="dial-btn"
                      title="Call Student"
                    >
                      📞
                    </a>
                  )}
                </div>
              </div>
              <div className="field-group">
                <label>PARENT CONTACT</label>
                <div className="display-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {s.parentPhone || s.parentnumber || "N/A"}
                  {(s.parentPhone || s.parentnumber) && (
                    <a
                      href={`tel:${s.parentPhone || s.parentnumber}`}
                      className="dial-btn"
                      title="Call Parent"
                    >
                      📞
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Hostel Details */}
        <div className="section-card">
          <div className="section-header">
            <h3>🏢 Hostel Details</h3>
          </div>
          <div className="section-body info-grid-4">
            <div className="field-group">
              <label>HOSTEL NAME</label>
              <div className="display-box">{s.hostelname || "N/A"}</div>
            </div>
            <div className="field-group">
              <label>ROOM NUMBER</label>
              <div className="display-box">{s.hostelroomno || "N/A"}</div>
            </div>
          </div>
        </div>

        {/* Section 4: Outpass Request Details */}
        <div className="section-card highlight-border">
          <div className="section-header">
            <h3>📄 Outpass Request Details</h3>
          </div>
          <div className="section-body">
            <div className="field-group full-width">
              <label>REASON FOR OUTPASS</label>
              <div className="display-box">{student.reason}</div>
            </div>
            <div className="info-grid-3 mt-4">
              <div className="field-group">
                <label>FROM DATE & TIME</label>
                <div className="display-box">
                  {new Date(student.fromDate).toLocaleString()}
                </div>
              </div>
              <div className="field-group">
                <label>TO DATE & TIME</label>
                <div className="display-box">
                  {new Date(student.toDate).toLocaleString()}
                </div>
              </div>
              <div className="field-group">
                <label>RETURN STATUS</label>
                <div
                  className="display-box"
                  style={isLateReturn ? { borderColor: '#FCA5A5', background: '#FEF2F2', color: '#EF4444', fontWeight: 'bold' } : (student.in ? { color: '#10B981', fontWeight: 'bold' } : {})}
                >
                  {student.in ? (isEmergency ? '✅ Returned' : (isLateReturn ? '⏳ Late Return' : '✅ On Time Return')) : '🚪 Not Returned Yet'}
                </div>
              </div>
            </div>

            {(student.proof || student.document || student.file) && (
              <div className="field-group full-width" style={{ marginTop: '16px' }}>
                <label>SUPPORTING DOCUMENT</label>
                <div>
                  <button
                    className="view-doc-btn"
                    onClick={() => handleViewDocument(student.proof || student.document || student.file)}
                  >
                    <span>👁️</span> View Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Approval Workflow */}
        {student.outpasstype?.toLowerCase() !== 'hostelemergency' && (
          <div className="section-card">
            <div className="section-header">
              <h3>✅ Approval Status &amp; Workflow</h3>
            </div>
            <div className="section-body">
              <div className="workflow-status-grid">
                {/* Staff Approval */}
                <div className="workflow-card">
                  <div className="workflow-card-header">
                    <span className="workflow-role">Staff / Mentor</span>
                    <span className={`status-pill ${staffStatus}`}>
                      {staffStatus}
                    </span>
                  </div>
                  <div className="workflow-card-body">
                    <div className="workflow-field">
                      <label>Approved By</label>
                      <div className="workflow-value">{staffName}</div>
                    </div>
                    {staffTime && (
                      <div className="workflow-field mt-2">
                        <label>Action Date &amp; Time</label>
                        <div className="workflow-value">
                          {new Date(staffTime).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: true
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Year Incharge Approval */}
                <div className="workflow-card">
                  <div className="workflow-card-header">
                    <span className="workflow-role">Year Incharge</span>
                    <span className={`status-pill ${yearInchargeStatus}`}>
                      {yearInchargeStatus}
                    </span>
                  </div>
                  <div className="workflow-card-body">
                    <div className="workflow-field">
                      <label>Approved By</label>
                      <div className="workflow-value">{yearInchargeName}</div>
                    </div>
                    {yearInchargeTime && (
                      <div className="workflow-field mt-2">
                        <label>Action Date &amp; Time</label>
                        <div className="workflow-value">
                          {new Date(yearInchargeTime).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: true
                          })}
                        </div>
                      </div>
                    )}
                    {yearInchargeRemarks && (
                      <div className="workflow-field mt-2">
                        <label>Remarks</label>
                        <div className="workflow-value remarks-value">"{yearInchargeRemarks}"</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Warden Approval */}
                <div className="workflow-card">
                  <div className="workflow-card-header">
                    <span className="workflow-role">Warden Decision</span>
                    <span className={`status-pill ${wardenStatus || 'pending'}`}>
                      {wardenStatus || 'pending'}
                    </span>
                  </div>
                  <div className="workflow-card-body">
                    <div className="workflow-field">
                      <label>Approved By</label>
                      <div className="workflow-value">{wardenName}</div>
                    </div>
                    {wardenTime && (
                      <div className="workflow-field mt-2">
                        <label>Action Date &amp; Time</label>
                        <div className="workflow-value">
                          {new Date(wardenTime).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: true
                          })}
                        </div>
                      </div>
                    )}
                    {student.wardenremarks && (
                      <div className="workflow-field mt-2">
                        <label>Remarks</label>
                        <div className="workflow-value remarks-value">"{student.wardenremarks}"</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Gate Movement Details */}
        <div className="section-card gate-movement-card">
          <div className="section-header">
            <h3>🚪 Gate Movement Timeline</h3>
          </div>
          <div className="section-body">
            <div className="movement-timeline">
              <div className="timeline-item completed">
                <div className="timeline-badge">📝</div>
                <div className="timeline-panel">
                  <h4 className="timeline-title">Outpass Request Applied</h4>
                  <p className="timeline-time">
                    {new Date(student.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className={`timeline-item ${wardenStatus === 'approved' ? 'completed' : 'pending'}`}>
                <div className="timeline-badge">{wardenStatus === 'approved' ? '✅' : '⏳'}</div>
                <div className="timeline-panel">
                  <h4 className="timeline-title">Warden Approval Status</h4>
                  <p className="timeline-time">
                    {student.wardenapprovedAt ? (
                      `Approved on ${new Date(student.wardenapprovedAt).toLocaleString()}`
                    ) : (
                      wardenStatus ? `Status: ${wardenStatus}` : 'Pending warden decision'
                    )}
                  </p>
                </div>
              </div>

              <div className={`timeline-item ${student.out ? 'completed' : 'pending emergency-placeholder'}`}>
                <div className="timeline-badge">{student.out ? '📤' : '🚪'}</div>
                <div className="timeline-panel">
                  <h4 className="timeline-title">Gate Exit Departure</h4>
                  <p className="timeline-time">
                    {student.out ? (
                      `Departed on ${new Date(student.out).toLocaleString()}`
                    ) : (
                      s.gender?.toLowerCase() === 'male' ? "He doesn't go out" : s.gender?.toLowerCase() === 'female' ? "She doesn't go out" : "He/She doesn't go out"
                    )}
                  </p>
                </div>
              </div>

              <div className={`timeline-item ${student.in ? 'completed' : 'pending emergency-placeholder'} ${isLateReturn ? 'timeline-item-late' : ''}`}>
                <div className="timeline-badge">{isLateReturn ? '⏰' : (student.in ? '📥' : '🏠')}</div>
                <div className="timeline-panel" style={isLateReturn ? { borderColor: '#FCA5A5', background: '#FEF2F2' } : {}}>
                  <h4 className="timeline-title" style={isLateReturn ? { color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '6px' } : {}}>
                    Gate Entry Arrival
                    {isLateReturn && <span className="late-timeline-tag">LATE</span>}
                  </h4>
                  {isLateReturn && (
                    <p className="late-timeline-desc" style={{ color: '#B91C1C', fontSize: '0.8rem', margin: '0 0 6px 0', fontWeight: 600 }}>
                      ⚠️ Student returned late. Expected back by: {new Date(student.toDate).toLocaleString()}
                    </p>
                  )}
                  <p className="timeline-time">
                    {student.in ? (
                      `Returned on ${new Date(student.in).toLocaleString()}`
                    ) : (
                      s.gender?.toLowerCase() === 'male' ? "He doesn't get in" : s.gender?.toLowerCase() === 'female' ? "She doesn't get in" : "He/She doesn't get in"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: Outpass History */}
        {outpassHistory && outpassHistory.length > 0 && (
          <div className="section-card gate-movement-card">
            <div className="section-header">
              <h3>📜 Outpass History</h3>
            </div>
            <div className="section-body" style={{ padding: '20px' }}>
              <div className="history-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {outpassHistory.map((historyItem, idx) => {
                  const isLate = historyItem.isLate || historyItem.islate;
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        background: isLate ? '#FEF2F2' : '#F8FAFC', 
                        border: isLate ? '1px solid #FCA5A5' : '1px solid #E2E8F0', 
                        borderRadius: '12px', 
                        padding: '16px' 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3B82F6', background: '#DBEAFE', padding: '4px 8px', borderRadius: '6px' }}>
                          {historyItem.outpasstype || 'General'}
                        </span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {isLate && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '4px 8px', borderRadius: '6px' }}>
                              LATE
                            </span>
                          )}
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: historyItem.status === 'approved' ? '#10B981' : historyItem.status === 'rejected' ? '#EF4444' : '#F59E0B', background: historyItem.status === 'approved' ? '#D1FAE5' : historyItem.status === 'rejected' ? '#FEE2E2' : '#FEF3C7', padding: '4px 8px', borderRadius: '6px', textTransform: 'capitalize' }}>
                            {historyItem.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#475569', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        <strong>Reason:</strong> {historyItem.reason || 'N/A'}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div><strong>From:</strong> {historyItem.fromDate ? new Date(historyItem.fromDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}</div>
                        <div><strong>To:</strong> {historyItem.toDate ? new Date(historyItem.toDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="section-body workflow-container" style={{ padding: 0 }}>
          {/* Action Buttons if Pending */}
          {(!wardenStatus || wardenStatus === 'pending') && student.outpasstype !== 'HostelEmergency' && (
            <div className="workflow-actions">
              <button
                className="btn-approve"
                onClick={handleApprove}
              >
                Approve Request
              </button>
              <button
                className="btn-reject"
                onClick={() => openConfirmation("rejected")}
              >
                Reject Request
              </button>
            </div>
          )}
        </div>

      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalType === 'approved' ? 'Approve Outpass Request' : 'Reject Outpass Request'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label>Remarks (Required)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="remarks-input"
                placeholder={modalType === 'approved' ? 'Please provide approval remarks...' : 'Please provide reason for rejection...'}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className={`btn-confirm ${modalType}`}
                onClick={handleConfirmAction}
                disabled={!remarks.trim()}
              >
                {modalType === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDocumentModal && (
        <div className="modal-overlay" onClick={() => setShowDocumentModal(false)}>
          <div className="modal-card doc-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Document Viewer</h3>
              <button className="close-btn" onClick={() => setShowDocumentModal(false)}>✕</button>
            </div>
            <div className="modal-body doc-body">
              {documentType === 'image' ? (
                <img src={documentUrl!} alt="Proof" className="doc-preview-img" />
              ) : (
                <iframe src={documentUrl!} title="Proof Document" className="doc-preview-frame"></iframe>
              )}
            </div>
            <div className="modal-footer">
              <a href={documentUrl!} download target="_blank" rel="noreferrer" className="btn-confirm approved" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                Download File
              </a>
              <button className="btn-cancel" onClick={() => setShowDocumentModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .warden-view-page {
          background: radial-gradient(circle at 10% 20%, rgba(240, 244, 250, 0.3) 0%, rgba(248, 250, 252, 0.9) 100%);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          padding-top: 85px; 
          padding-bottom: calc(120px + env(safe-area-inset-bottom, 0px));
        }

        .content-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .back-btn {
          background: white;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          color: #1e3a8a;
          cursor: pointer;
          margin-bottom: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          padding: 10px 20px;
          border-radius: 50px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          font-weight: 600;
        }

        .back-btn:hover {
          background: #f1f5f9;
          transform: translateX(-3px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }

        .main-header {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          color: #0f172a;
          padding: 20px 28px;
          border-radius: 20px;
          margin-bottom: 28px;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .main-header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }

        .section-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.03);
          border: 1px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .section-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.06);
          border-color: #cbd5e1;
        }

        .highlight-border {
          border: 2px solid #fbbf24; 
          box-shadow: 0 8px 30px rgba(251, 191, 36, 0.06);
        }
        
        .highlight-border:hover {
          border-color: #d97706;
        }

        .section-header {
          background: #f8fafc;
          color: #1e293b;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .section-header h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1e3a8a;
        }

        .section-body {
          padding: 24px;
        }

        .info-grid-with-avatar {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 32px;
        }

        .avatar-box {
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .initials-avatar {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          color: white;
          font-size: 36px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          box-shadow: 0 6px 18px rgba(30, 58, 138, 0.12);
          border: 3px solid white;
          outline: 1px solid #e2e8f0;
        }

        .info-fields {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .info-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .info-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-group.full-width {
          width: 100%;
        }

        .field-group label {
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .display-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 11px 15px;
          border-radius: 10px;
          font-size: 14px;
          color: #334155;
          font-weight: 600;
          min-height: 44px;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .display-box:hover {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 2px 8px rgba(59,130,246,0.04);
        }

        .mt-4 { margin-top: 16px; }

        /* Workflow Styles */
        .workflow-container {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .workflow-step {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .step-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
        }
        .step-icon.success { background: #10b981; }
        .step-icon.pending { background: #d1d5db; color: #666; }
        .step-icon.error { background: #ef4444; }

        .step-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .step-title {
          font-weight: 600;
          color: #374151;
        }

        .status-pill {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pill.approved { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .status-pill.pending { background: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; }
        .status-pill.rejected { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

        .step-connector {
          width: 2px;
          height: 24px;
          background: #e5e7eb;
          margin-left: 15px; 
          margin-top: 4px;
          margin-bottom: 4px;
        }

        .workflow-actions {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .btn-approve, .btn-reject {
          padding: 12px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-approve {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 14px rgba(16,185,129,0.2);
        }
        .btn-approve:hover { 
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }

        .btn-reject {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 4px 14px rgba(239,68,68,0.2);
        }
        .btn-reject:hover { 
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }

        @media (max-width: 768px) {
          .info-grid-with-avatar,
          .info-fields,
          .info-grid-3,
          .info-grid-4 {
            grid-template-columns: 1fr;
          }
          .avatar-box {
            margin-bottom: 24px;
            justify-content: center; 
          }
          
          .no-data {
             font-style: italic;
             color: #9ca3af;
             text-align: center;
          }

          .dial-btn {
             display: inline-flex !important;
          }

          .workflow-actions {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }

          .btn-approve, .btn-reject {
            width: 100%;
            text-align: center;
          }
        }

        .dial-btn {
           display: none;
           justify-content: center;
           align-items: center;
           width: 30px;
           height: 30px;
           background-color: #10b981;
           color: white;
           border-radius: 50%;
           text-decoration: none;
           font-size: 1rem;
           box-shadow: 0 2px 4px rgba(0,0,0,0.1);
           transition: 0.2s;
        }
        
        .dial-btn:hover {
           background-color: #059669;
           transform: scale(1.05);
        }

        /* Modal Styles */
        .page-container .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .page-container .modal-card {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          animation: modalSlideUp 0.3s ease-out;
        }

        .page-container .modal-header {
          background: linear-gradient(135deg, #1e3a8a, #0f172a);
          padding: 20px 24px;
          border-radius: 20px 20px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-container .modal-header h3 {
          margin: 0;
          color: white;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .page-container .close-btn {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1;
        }

        .page-container .close-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          color: white;
        }

        .page-container .modal-body {
          padding: 24px;
        }

        .page-container .modal-body label {
          display: block;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
          font-size: 0.95rem;
        }

        .page-container .remarks-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: inherit;
          resize: vertical;
          min-height: 100px;
          color: #1f2937;
          outline: none;
          transition: 0.25s;
        }

        .page-container .remarks-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .page-container .modal-footer {
          padding: 0 24px 24px 24px;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          background: transparent;
          border-top: none;
        }

        .page-container .btn-cancel {
          padding: 10px 24px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          background: #f1f5f9;
          color: #475569;
        }

        .page-container .btn-cancel:hover {
          background: #e2e8f0;
        }

        .page-container .btn-confirm {
          padding: 10px 24px;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          color: white;
        }

        .page-container .btn-confirm.approved {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        .page-container .btn-confirm.approved:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .page-container .btn-confirm.rejected {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        .page-container .btn-confirm.rejected:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .page-container .btn-confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .view-doc-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: white;
            border: 1px solid #3b82f6;
            border-radius: 8px;
            color: #3b82f6;
            font-weight: 600;
            cursor: pointer;
            margin-top: 4px;
            transition: all 0.2s;
        }

        .view-doc-btn:hover {
            background: #eff6ff;
            transform: translateY(-1px);
        }

        .doc-modal {
            width: 95%;
            max-width: 800px;
            height: 80vh;
            display: flex;
            flex-direction: column;
        }

        @media (min-width: 1024px) {
            .doc-modal {
                max-width: 1200px; 
                height: 90vh;
            }

            .view-doc-btn {
                padding: 10px 20px;
                font-size: 1rem;
            }
        }

        .doc-body {
            flex: 1;
            padding: 0;
            background: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 0;
        }

        .doc-preview-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .doc-preview-frame {
            width: 100%;
            height: 100%;
            border: none;
        }

        /* Approval Workflow Custom Styles */
        .workflow-status-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .workflow-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.01);
          transition: all 0.25s ease;
        }

        .workflow-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.04);
          border-color: #cbd5e1;
        }

        .workflow-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
        }

        .workflow-role {
          font-weight: 750;
          font-size: 11px;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .workflow-card-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .workflow-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .workflow-field label {
          font-size: 9px;
          font-weight: 750;
          color: #64748b;
          text-transform: uppercase;
        }

        .workflow-value {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }

        .remarks-value {
          font-style: italic;
          color: #475569;
          background: #f1f5f9;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          margin-top: 2px;
          border-left: 3px solid #cbd5e1;
        }

        @media (max-width: 768px) {
          .workflow-status-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        /* ═══════════════════════════════════════════════ */
        /* Enhanced UI & Timing Elements                 */
        /* ═══════════════════════════════════════════════ */
        .main-header.emergency {
          background: linear-gradient(135deg, #dc2626, #7f1d1d);
          box-shadow: 0 10px 25px rgba(220, 38, 38, 0.25);
        }
        
        .emergency-header-badge {
          background: white;
          color: #dc2626;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 800;
          margin-left: 12px;
          display: inline-block;
          vertical-align: middle;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .info-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .null-timing {
          background: #fef2f2 !important;
          border: 1px solid #fee2e2 !important;
        }

        .has-timing {
          background: #f0fdf4 !important;
          border: 1px solid #dcfce7 !important;
        }

        .time-highlight {
          color: #10b981;
          font-weight: 700;
        }

        .timing-placeholder {
          color: #ef4444;
          font-weight: 600;
        }

        /* Timeline Section */
        .timeline-container {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px dashed #e2e8f0;
        }

        .timeline-title {
          font-size: 13px;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .timeline-steps-wrapper {
          overflow-x: auto;
          padding: 10px 0;
        }

        .timeline-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          min-width: 600px;
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex: 1;
          text-align: center;
          z-index: 2;
        }

        .timeline-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2px solid #e2e8f0;
          font-size: 18px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }

        .timeline-step.completed .timeline-icon {
          border-color: #10b981;
          background: #f0fdf4;
          transform: scale(1.05);
        }

        .timeline-step.pending .timeline-icon {
          border-color: #cbd5e1;
          background: #f8fafc;
          opacity: 0.6;
        }

        .timeline-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .step-label {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
        }

        .timeline-step.pending .step-label {
          color: #64748b;
        }

        .step-time {
          font-size: 10px;
          color: #64748b;
          font-weight: 500;
        }

        .timeline-line {
          flex-grow: 1;
          height: 3px;
          background: #e2e8f0;
          margin-bottom: 40px;
          position: relative;
          z-index: 1;
          border-radius: 2px;
        }

        .timeline-line.completed {
          background: #10b981;
        }

        @media (max-width: 768px) {
          .info-grid-2 {
            grid-template-columns: 1fr;
          }

          .timeline-steps {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
            padding-left: 20px;
            position: relative;
            min-width: 100%;
          }

          .timeline-steps::before {
            content: '';
            position: absolute;
            left: 41px;
            top: 20px;
            bottom: 20px;
            width: 3px;
            background: #e2e8f0;
            z-index: 1;
          }

          .timeline-step {
            flex-direction: row;
            text-align: left;
            gap: 16px;
            width: 100%;
          }

          .timeline-icon {
            z-index: 2;
          }
          font-size: 12px;
          margin-top: 2px;
          border-left: 3px solid #cbd5e1;
        }

        @media (max-width: 768px) {
          .workflow-status-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        /* ═══════════════════════════════════════════════ */
        /* Enhanced UI & Timing Elements                 */
        /* ═══════════════════════════════════════════════ */
        .main-header.emergency {
          background: linear-gradient(135deg, #dc2626, #7f1d1d);
          box-shadow: 0 10px 25px rgba(220, 38, 38, 0.25);
        }
        
        .emergency-header-badge {
          background: white;
          color: #dc2626;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 800;
          margin-left: 12px;
          display: inline-block;
          vertical-align: middle;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          -webkit-text-fill-color: initial !important;
        }

        .info-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .null-timing {
          background: #fef2f2 !important;
          border: 1px solid #fee2e2 !important;
        }

        .has-timing {
          background: #f0fdf4 !important;
          border: 1px solid #dcfce7 !important;
        }

        .time-highlight {
          color: #10b981;
          font-weight: 700;
        }

        .timing-placeholder {
          color: #ef4444;
          font-weight: 600;
        }

        /* Timeline Section */
        .timeline-container {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px dashed #e2e8f0;
        }

        .timeline-title {
          font-size: 13px;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .timeline-steps-wrapper {
          overflow-x: auto;
          padding: 10px 0;
        }

        .timeline-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          min-width: 600px;
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex: 1;
          text-align: center;
          z-index: 2;
        }

        .timeline-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2px solid #e2e8f0;
          font-size: 18px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }

        .timeline-step.completed .timeline-icon {
          border-color: #10b981;
          background: #f0fdf4;
          transform: scale(1.05);
        }

        .timeline-step.pending .timeline-icon {
          border-color: #cbd5e1;
          background: #f8fafc;
          opacity: 0.6;
        }

        .timeline-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .step-label {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
        }

        .timeline-step.pending .step-label {
          color: #64748b;
        }

        .step-time {
          font-size: 10px;
          color: #64748b;
          font-weight: 500;
        }

        .timeline-line {
          flex-grow: 1;
          height: 3px;
          background: #e2e8f0;
          margin-bottom: 40px;
          position: relative;
          z-index: 1;
          border-radius: 2px;
        }

        .timeline-line.completed {
          background: #10b981;
        }

        @media (max-width: 768px) {
          .info-grid-2 {
            grid-template-columns: 1fr;
          }

          .timeline-steps {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
            padding-left: 20px;
            position: relative;
            min-width: 100%;
          }

          .timeline-steps::before {
            content: '';
            position: absolute;
            left: 41px;
            top: 20px;
            bottom: 20px;
            width: 3px;
            background: #e2e8f0;
            z-index: 1;
          }

          .timeline-step {
            flex-direction: row;
            text-align: left;
            gap: 16px;
            width: 100%;
          }

          .timeline-icon {
            z-index: 2;
          }

          .timeline-line {
            display: none !important;
          }

          .timeline-info {
            align-items: flex-start;
          }
        }

        /* ═══════════════════════════════════════════════ */
        /* Vertical Movement Timeline                    */
        /* ═══════════════════════════════════════════════ */
        .movement-timeline {
          position: relative;
          padding-left: 45px;
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .movement-timeline::before {
          content: '';
          position: absolute;
          left: 21px;
          top: 8px;
          bottom: 8px;
          width: 3px;
          background: #e2e8f0;
          z-index: 1;
        }

        .timeline-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
        }

        .timeline-badge {
          position: absolute;
          left: -45px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2.5px solid #cbd5e1;
          font-size: 16px;
          z-index: 2;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }

        .timeline-item.completed .timeline-badge {
          border-color: #10b981;
          background: #f0fdf4;
          box-shadow: 0 0 10px rgba(16,185,129,0.25);
        }

        .timeline-item.pending .timeline-badge {
          border-color: #cbd5e1;
          background: #f8fafc;
          opacity: 0.75;
        }

        .timeline-panel {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 14px 20px;
          border-radius: 12px;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }

        .timeline-item.completed .timeline-panel {
          border-color: #dcfce7;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.01);
        }

        .timeline-item.completed .timeline-panel:hover {
          transform: translateX(4px);
          border-color: #86efac;
          box-shadow: 0 4px 15px rgba(16,185,129,0.06);
        }

        .timeline-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #334155;
          margin: 0;
        }

        .timeline-time {
          font-size: 12px;
          color: #10b981;
          font-weight: 650;
          margin: 0;
        }

        .timeline-item.pending .timeline-time {
          color: #64748b;
          font-weight: 500;
        }
        
        .timeline-item.pending.emergency-placeholder .timeline-time {
          color: #ef4444;
          font-weight: 600;
        }

        .late-timeline-tag {
          background: #FEF2F2;
          color: #EF4444;
          border: 1px solid #FCA5A5;
          padding: 2px 8px;
          font-size: 0.7rem;
          border-radius: 6px;
          font-weight: 700;
          margin-left: 8px;
          letter-spacing: 0.04em;
        }
      `}</style>
    </div >
  );
};

export default WardenStudentView;
