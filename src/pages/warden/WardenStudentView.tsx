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

  const handleStatusUpdate = async (status: string) => {
    const remarks = prompt("Enter remarks:", "Reviewed by Warden");
    if (remarks === null) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/warden/outpass/update`,
        {
          outpassId: id,
          wardenapprovalstatus: status,
          wardenremarks: remarks,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Outpass ${status} successfully!`);
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
          ← Back to Student List
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
                <div> <img src={s.photo} alt="Student" className="initials-avatar"   /></div>
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
                onClick={() => handleStatusUpdate("approved")}
              >
                Approve Request
              </button>
              <button
                className="btn-reject"
                onClick={() => handleStatusUpdate("rejected")}
              >
                Reject Request
              </button>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .warden-view-page {
          background-color: #f3f4f6;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          padding-bottom: 40px;
        }

        .content-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .back-btn {
          background: white;
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 20px;
          transition: 0.2s;
        }
        .back-btn:hover {
          background: #f9fafb;
        }

        .main-header {
          background: #2563eb;
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
        }

        .section-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }

        .highlight-border {
          border: 2px solid #fbbf24; 
        }

        .section-header {
          background: #2563eb;
          color: white;
          padding: 12px 24px;
        }
        .section-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
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
          background: #0369a1;
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
          background: #10b981;
          color: white;
        }
        .btn-approve:hover { background: #059669; }

        .btn-reject {
          background: #ef4444;
          color: white;
        }
        .btn-reject:hover { background: #dc2626; }

        @media (max-width: 768px) {
          .info-grid-with-avatar,
          .info-fields,
          .info-grid-3,
          .info-grid-4 {
            grid-template-columns: 1fr;
          }
          .avatar-box {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default WardenStudentView;
