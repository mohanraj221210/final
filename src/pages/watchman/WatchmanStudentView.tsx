import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import WatchmanNav from "../../components/WatchmanNav";
import { toast } from "react-toastify";

const WatchmanStudentView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchStudent();

    return () => {
      isMounted = false;
    };

    // Helper function inside effect to access isMounted closure
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
          console.log("Student Details Response:", res.data);
          setStudent(res.data.outpass || res.data.outpassdetail || res.data);
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
    return (
      <div className="page-container warden-view-page loading-center">
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

  if (!student) {
    return (
      <div className="page-container warden-view-page error-center">
        <WatchmanNav />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Student details not found</h2>
          <p>Please check the ID and try again, or contact the administrator.</p>
          <button className="back-btn-error" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
        <style>{`
          .error-center {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8fafc;
            padding-top: 70px; /* Account for navbar */
          }
          .error-container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            max-width: 400px;
            width: 100%;
            border: 1px solid #f1f5f9;
          }
          .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .error-container h2 {
            color: #1e293b;
            margin-bottom: 8px;
            font-size: 20px;
          }
          .error-container p {
            color: #64748b;
            margin-bottom: 24px;
            font-size: 14px;
            line-height: 1.5;
          }
          .back-btn-error {
            background: #1e3a8a;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }
          .back-btn-error:hover {
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
    <div className="page-container warden-view-page">
      <WatchmanNav />

      <div className="content-wrapper">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="main-header">
          <h1>Student Details (Security View)</h1>
        </div>

        {/* Section 1: Student Personal Details - FILTERED */}
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

              {/* Only showing requested fields: Name, Phone, Email (email wasn't explicitly asked but grouped with contact usually, will stick strictly to Name & Mobile as primary request + Email as user mentioned 'only name , mobile number, email' in prev prompt) */}

              <div className="field-group">
                <label>STUDENT NAME</label>
                <div className="display-box">{s.name || "N/A"}</div>
              </div>
              <div className="field-group">
                <label>MOBILE NUMBER</label>
                <div className="display-box">{s.phone || "N/A"}</div>
              </div>
              <div className="field-group">
                <label>EMAIL</label>
                <div className="display-box">{s.email || "N/A"}</div>
              </div>

            </div>
          </div>
        </div>

        {/* Section 4: Outpass Request Details - Essential for Watchman to verify */}
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
            </div>
          </div>
        </div>

      </div>

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

        @media (max-width: 768px) {
          .info-grid-with-avatar,
          .info-fields,
          .info-grid-3 {
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
          
          .display-box {
            font-size: 13px;
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default WatchmanStudentView;
