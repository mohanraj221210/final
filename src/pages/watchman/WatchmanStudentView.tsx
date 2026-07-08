import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle, FileText } from 'lucide-react';

import axios from "axios";
import WatchmanNav from "../../components/WatchmanNav";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";

const WatchmanStudentView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchStudent();

    return () => {
      isMounted = false;
    };

    async function fetchStudent() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/watchman/outpass/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (isMounted) {
          setStudent(res.data.outpass || res.data.outpassdetail || res.data);
          setImageError(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch student details:", error);
          toast.error("Failed to load student details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!student) {
    return (
      <div className="sd-root error-center">
        <WatchmanNav />
        <div className="sd-error-card">
          <div className="sd-error-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={48} style={{ color: '#EA580C' }} />
          </div>
          <h2>Record Not Found</h2>
          <p>The student outpass log ID does not exist or may have been archived.</p>
          <button className="sd-btn-error" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
        <style>{`
          .error-center {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .sd-error-card {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            max-width: 400px;
            width: 100%;
            border: 1px solid #f1f5f9;
          }
          .sd-error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .sd-error-card h2 {
            color: #0f172a;
            margin-bottom: 8px;
            font-size: 20px;
            font-weight: 800;
          }
          .sd-error-card p {
            color: #64748b;
            margin-bottom: 24px;
            font-size: 14px;
            line-height: 1.5;
            font-weight: 500;
          }
          .sd-btn-error {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 28px;
            border-radius: 50px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .sd-btn-error:hover {
            background: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          }
        `}</style>
      </div>
    );
  }

  const s = student.studentid || {};

  return (
    <div className="sd-root">
      <WatchmanNav />

      <main className="sd-main">
        <div className="sd-container">
          
          {/* Header Row */}
          <div className="sd-header-row">
            <div>
              <button className="sd-back-btn" onClick={() => navigate(-1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Go Back
              </button>
              <h1 className="sd-title">Student Gate Pass Record</h1>
              <p className="sd-subtitle">Security verification details for gate clearance</p>
            </div>
          </div>

          {/* Details Wrapper Layout */}
          <div className="sd-detail-layout">
            
            {/* Left Card: Student Info */}
            <div className="sd-profile-card">
              <div className="sd-avatar-box">
                {s.photo && !imageError ? (
                  <img
                    src={
                      s.photo.startsWith('data:')
                        ? s.photo
                        : `${s.photo}`
                    }
                    alt="Student"
                    className="sd-profile-img"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="sd-profile-initials">
                    {s.name ? s.name.charAt(0).toUpperCase() : "S"}
                  </div>
                )}
              </div>

              <div className="sd-profile-identity">
                <h2 className="sd-profile-name">{s.name || "N/A"}</h2>
                <span className="sd-profile-reg sd-mono">{s.registerNumber || "N/A"}</span>
                <span className="sd-profile-badge">Student</span>
              </div>

              <div className="sd-profile-contact-list">
                <div className="sd-contact-item">
                  <span className="label">Department</span>
                  <span className="value">{s.department || "N/A"}</span>
                </div>
                <div className="sd-contact-item">
                  <span className="label">Academic Year / Sem</span>
                  <span className="value">{s.year || "N/A"} Year (Sem {s.semester || "N/A"})</span>
                </div>
                <div className="sd-contact-item">
                  <span className="label">Mobile Number</span>
                  <span className="value">{s.phone || "N/A"}</span>
                </div>
                <div className="sd-contact-item">
                  <span className="label">Student Email</span>
                  <span className="value" style={{ wordBreak: 'break-all' }}>{s.email || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Right Card: Pass details */}
            <div className="sd-pass-details-card">
              <div className="sd-card-section-header">
                <span className="sd-section-icon-badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} />
                </span>
                <h3>Outpass Approval Record</h3>
              </div>

              <div className="sd-pass-fields">
                <div className="sd-field-row full-width">
                  <span className="label">Reason for Outpass</span>
                  <div className="sd-display-box highlight-box">{student.reason || "N/A"}</div>
                </div>

                <div className="sd-field-group">
                  <span className="label">Outpass Type</span>
                  <div className="sd-display-box" style={{ display: 'inline-flex' }}>
                    <span className={`sd-type-badge-large ${student.outpasstype?.toLowerCase().includes('emergency') ? 'emergency' : ''}`}>
                      {student.outpasstype || "General"}
                    </span>
                  </div>
                </div>

                <div className="sd-field-group">
                  <span className="label">Overall Status</span>
                  <div className="sd-display-box" style={{ textTransform: 'uppercase', fontWeight: 700, color: student.status === 'approved' ? '#10B981' : '#EA580C' }}>
                    {student.status || "Pending"}
                  </div>
                </div>

                <div className="sd-field-group">
                  <span className="label">Authorized Out (Exit Gate)</span>
                  <div className="sd-display-box sd-timestamp-box">
                    {student.out ? new Date(student.out).toLocaleString() : 'Not Checked Out'}
                  </div>
                </div>

                <div className="sd-field-group">
                  <span className="label">Authorized In (Entry Gate)</span>
                  <div className="sd-display-box sd-timestamp-box">
                    {student.in ? new Date(student.in).toLocaleString() : 'Not Checked In'}
                  </div>
                </div>

                <div className="sd-field-group">
                  <span className="label">Valid From Date & Time</span>
                  <div className="sd-display-box">
                    {new Date(student.fromDate).toLocaleString()}
                  </div>
                </div>

                <div className="sd-field-group">
                  <span className="label">Valid To Date & Time</span>
                  <div className="sd-display-box">
                    {new Date(student.toDate).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      <style>{`
        /* ====== LAYOUT & BASE ====== */
        .sd-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 45%, #DBEAFE 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding-top: var(--nav-height, 64px);
          padding-bottom: 80px;
        }

        .sd-main {
          padding: 24px 32px;
          max-width: var(--content-max, 1280px);
          margin: 0 auto;
        }

        .sd-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ====== HEADER ROW ====== */
        .sd-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .sd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #E2E8F0;
          color: #3B82F6;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 100px;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .sd-back-btn:hover {
          background: #EFF6FF;
          transform: translateX(-4px);
          box-shadow: 0 6px 12px rgba(59, 130, 246, 0.08);
        }

        .sd-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0F172A;
          margin: 12px 0 4px;
          letter-spacing: -0.02em;
        }

        .sd-subtitle {
          font-size: 0.9rem;
          color: #64748B;
          margin: 0;
          font-weight: 500;
        }

        /* ====== PROFILE VIEW LAYOUT ====== */
        .sd-detail-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
        }

        /* Left Side Card: Profile */
        .sd-profile-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          padding: 32px 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(226,232,240,0.5);
          text-align: center;
        }

        .sd-avatar-box {
          position: relative;
          width: 110px;
          height: 110px;
          margin: 0 auto 20px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          border: 3px solid white;
        }

        .sd-profile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sd-profile-initials {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
          color: white;
          font-size: 2.5rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sd-profile-identity {
          margin-bottom: 24px;
        }

        .sd-profile-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 4px;
        }

        .sd-profile-reg {
          font-size: 0.85rem;
          color: #64748B;
        }

        .sd-profile-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          background: #EFF6FF;
          color: #3B82F6;
          border: 1px solid rgba(59,130,246,0.1);
        }

        .sd-profile-contact-list {
          border-top: 1px solid #F1F5F9;
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
        }

        .sd-contact-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sd-contact-item .label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sd-contact-item .value {
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
        }

        /* Right Side Card: Pass Details */
        .sd-pass-details-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(226,232,240,0.5);
        }

        .sd-card-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #F1F5F9;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }

        .sd-section-icon-badge {
          font-size: 1.5rem;
          background: #EFF6FF;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(59,130,246,0.08);
        }

        .sd-card-section-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #0F172A;
        }

        .sd-pass-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .sd-field-row.full-width {
          grid-column: span 2;
        }

        .sd-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sd-pass-fields .label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sd-display-box {
          background: #FAFBFD;
          border: 1px solid #EFF2F5;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.88rem;
          color: #334155;
          font-weight: 600;
          min-height: 44px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }

        .sd-display-box.highlight-box {
          background: #F8FAFC;
          font-weight: 500;
          line-height: 1.5;
          color: #475569;
        }

        .sd-timestamp-box {
          color: #3B82F6;
          font-family: 'SF Mono', monospace;
          font-size: 0.82rem;
        }

        .sd-type-badge-large {
          display: inline-flex;
          padding: 2px 10px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          background: #EFF6FF;
          color: #3B82F6;
          text-transform: uppercase;
        }

        .sd-type-badge-large.emergency {
          background: #FEF2F2;
          color: #EF4444;
        }

        .sd-mono {
          font-family: 'SF Mono', 'Fira Code', monospace;
        }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 768px) {
          .sd-detail-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .sd-pass-fields {
            grid-template-columns: 1fr;
          }
          .sd-field-row.full-width {
            grid-column: span 1;
          }
        }

        @media (max-width: 480px) {
          .sd-profile-card {
            padding: 24px 16px;
          }
          .sd-pass-details-card {
            padding: 20px 16px;
          }
          .sd-display-box {
            font-size: 0.82rem;
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default WatchmanStudentView;
