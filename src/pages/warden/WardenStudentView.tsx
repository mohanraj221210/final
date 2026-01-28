import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import WardenNav from "../../components/WardenNav";
import { toast } from "react-toastify";

const WardenStudentView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);

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
      setStudent(res.data.outpassdetail || null);
    } catch (error) {
      console.error("Failed to fetch student details:", error);
      toast.error("Failed to load student details");
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approved' | 'rejected' | null>(null);
  const [remarks, setRemarks] = useState("");

  const openConfirmation = (type: 'approved' | 'rejected') => {
    setModalType(type);
    setRemarks(type === 'approved' ? "Approved by Warden" : "Rejected by Warden");
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!modalType) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/warden/outpass/update`,
        {
          outpassId: id,
          wardenapprovalstatus: modalType,
          wardenremarks: remarks,
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

  if (!student) return <div className="loading-state">Loading...</div>;

  const s = student.studentid || {};

  return (
    <div className="page-container warden-view-page">
      <WardenNav />

      <div className="content-wrapper">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="main-header">
          <h1>Outpass Approval</h1>
        </div>

        {/* Section 1: Student Personal Details */}
        <div className="section-card">
          <div className="section-header">
            <h3>👤 Student Personal Details</h3>
          </div>
          <div className="section-body info-grid-with-avatar">
            <div className="avatar-box">
              {s.name ? (
                <div> <img src={s.photo} alt="Student" className="initials-avatar" /></div>
              ) : (
                <div className="initials-avatar">NA</div>
              )}
            </div>
            <div className="info-fields">
              <div className="field-group">
                <label>STUDENT ID</label>
                <div className="display-box">{s._id || "N/A"}</div>
              </div>
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
                <div className="display-box">{s.phone || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Parents Details */}
        {/* <div className="section-card">
          <div className="section-header">
            <h3>👨‍👩‍👦 Parents Details</h3>
          </div>
          <div className="section-body info-grid-3">
            <div className="field-group">
              <label>FATHER NAME</label>
              <div className="display-box">{s.fatherName || "N/A"}</div>
            </div>
            <div className="field-group">
              <label>MOTHER NAME</label>
              <div className="display-box">{s.motherName || "N/A"}</div>
            </div>
            <div className="field-group">
              <label>PARENT CONTACT</label>
              <div className="display-box">{s.parentPhone || "N/A"}</div>
            </div>
          </div>
        </div> */}

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
            {/* <div className="field-group">
              <label>BLOCK</label>
              <div className="display-box">{s.block || "N/A"}</div>
            </div> */}
            <div className="field-group">
              <label>ROOM NUMBER</label>
              <div className="display-box">{s.hostelroomno || "N/A"}</div>
            </div>
            {/* <div className="field-group">
              <label>WARDEN NAME</label>
              <div className="display-box">N/A</div>
            </div> */}
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
              {/* <div className="field-group">
                <label>PLACE OF VISIT</label>
                <div className="display-box">{student.placeOfVisit || "N/A"}</div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Section 5: Approval Workflow */}

        {/* <div className="section-header">
            <h3>✅ Approval Workflow</h3>
          </div> */}
        <div className="section-body workflow-container">
          {/* <div className="workflow-step">
              <div className={`step-icon ${student.status === 'approved' ? 'success' : 'pending'}`}>
                {student.status === 'approved' ? '✓' : '•'}
              </div>
              <div className="step-content">
                <span className="step-title">Staff/Mentor Approval</span>
                {student.status && <span className={`status-pill ${student.status}`}>{student.status}</span>}
              </div>
            </div> */}

          {/* <div className="step-connector"></div>

            <div className="workflow-step">
              <div className={`step-icon ${student.wardenapprovalstatus === 'approved' ? 'success' : (student.wardenapprovalstatus === 'rejected' ? 'error' : 'pending')}`}>
                {student.wardenapprovalstatus === 'approved' ? '✓' : (student.wardenapprovalstatus === 'rejected' ? '✕' : '•')}
              </div>
              <div className="step-content">
                <span className="step-title">Warden Approval</span>
                <span className={`status-pill ${student.wardenapprovalstatus || 'pending'}`}>
                  {student.wardenapprovalstatus || 'pending'}
                </span>
              </div>
            </div> */}

          {/* Action Buttons if Pending */}
          {(!student.wardenapprovalstatus || student.wardenapprovalstatus === 'pending') && (
            <div className="workflow-actions">
              <button
                className="btn-approve"
                onClick={() => openConfirmation("approved")}
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
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalType === 'approved' ? 'Approve Request' : 'Reject Request'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <label>Warden Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="remarks-input"
                placeholder="Enter remarks here..."
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className={`btn-confirm ${modalType}`}
                onClick={handleConfirmAction}
              >
                Submit Remark
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .warden-view-page {
          background-color: #f8fafc; /* Lighter background matching list page */
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          padding-top: 85px; /* Added for fixed navbar */
          padding-bottom: 40px;
        }

        .content-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .back-btn {
          background: white;
          border: 1px solid #cbd5e1;
          font-size: 16px;
          color: #1e3a8a;
          cursor: pointer;
          margin-bottom: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          padding: 10px 24px;
          border-radius: 50px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          font-weight: 600;
        }

        .back-btn:hover {
          background: #f1f5f9;
          transform: translateX(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .main-header {
          background: linear-gradient(135deg, #1e3a8a, #0f172a);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .main-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: white;
        }

        .section-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .highlight-border {
          border: 2px solid #fbbf24; 
        }

        .section-header {
          background: linear-gradient(135deg, #1e3a8a, #0f172a);
          color: white;
          padding: 14px 24px;
        }
        .section-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
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
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          color: white;
          font-size: 36px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
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
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #6b7280;
          letter-spacing: 0.05em;
        }

        .display-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          font-weight: 500;
          min-height: 42px;
          display: flex;
          align-items: center;
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
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pill.approved { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .status-pill.pending { background: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; }
        .status-pill.rejected { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

        .step-connector {
          width: 2px;
          height: 24px;
          background: #e5e7eb;
          margin-left: 15px; /* Half of icon width roughly */
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
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .btn-approve {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .btn-approve:hover { 
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .btn-reject {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }
        .btn-reject:hover { 
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
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
            justify-content: center; /* Center avatar on mobile */
          }
        }

        @media (max-width: 480px) {
          .content-wrapper { padding: 16px; }
          .main-header { padding: 16px; }
          .main-header h1 { font-size: 20px; }
          .section-body { padding: 16px; }
          
          .workflow-actions {
            flex-direction: column;
            gap: 12px;
          }
          .btn-approve, .btn-reject {
            width: 100%;
            padding: 12px;
          }
          
          .display-box {
            font-size: 13px;
            padding: 8px 12px;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.3s;
        }

        .modal-card {
          background: white;
          width: 90%;
          max-width: 500px;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          background: #f8fafc;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          color: #1e293b;
          font-size: 18px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #64748b;
          cursor: pointer;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-body label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
        }

        .remarks-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }
        .remarks-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .modal-footer {
          padding: 16px 24px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-cancel {
          padding: 10px 20px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: white;
          color: #475569;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-cancel:hover { background: #f1f5f9; }

        .btn-confirm {
          padding: 10px 20px;
          border-radius: 6px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          color: white;
        }
        .btn-confirm.approved { background: #10b981; }
        .btn-confirm.approved:hover { background: #059669; }
        .btn-confirm.rejected { background: #ef4444; }
        .btn-confirm.rejected:hover { background: #dc2626; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WardenStudentView;
