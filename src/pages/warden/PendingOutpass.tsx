import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WardenNav from "../../components/WardenNav";
import LoadingSpinner from "../../components/LoadingSpinner";

interface Student {
  _id?: string;
  id?: string;
  name?: string;
  department?: string;
  year?: string;
  reason?: string;
  createdAt?: string;
  outDate?: string;
  studentName?: string;
  register_number?: string;
  studentid?: {
    name?: string;
    registerNumber?: string;
    year?: string;
  };
  outpasstype?: string;
}

const PendingOutpass: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/warden/outpass/list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const allData = res.data.outpasses || res.data.data || res.data.students || [];
      const pendingData = allData.filter((item: any) => {
        const ws = item.wardenapprovalstatus?.toLowerCase() || "";
        return ws !== 'Approved' && ws !== 'Rejected' && ws !== 'Declined';
      });

      // Sort Emergency first
      pendingData.sort((a: any, b: any) => {
        if (a.outpasstype === 'Emergency' && b.outpasstype !== 'Emergency') return -1;
        if (a.outpasstype !== 'Emergency' && b.outpasstype === 'Emergency') return 1;
        return 0;
      });

      setStudents(pendingData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <WardenNav />
      <div className="list-container">
        <button className="back-btn" onClick={() => navigate("/warden-dashboard")}>
          ← Back
        </button>
        <h1>Pending Outpass Students</h1>

        <div className="student-list">
          {loading ? (
            <LoadingSpinner />
          ) : students.length === 0 ? (
            <div className="no-data-message" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              No pending outpasses
            </div>
          ) : (
            students.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((s) => (
              <div
                key={s._id || s.id}
                className="student-card"
                onClick={() => navigate(`/warden/student/${s._id || s.id}`)}
              >
                <div className="student-card-main">
                  <div className="student-id-highlight">
                    {s.studentid?.registerNumber || s.register_number || 'N/A'}
                  </div>
                  <div className="student-info">
                    <div className="student-name">
                      {s.studentid?.name || s.studentName || s.name}
                      {s.outpasstype === 'Emergency' && <span className="emergency-badge">EMERGENCY</span>}
                    </div>
                    <div className="student-meta">
                      {s.studentid?.year ? `Year ${s.studentid.year} • ` : ''} {s.outpasstype || 'General'} • Applied on {new Date(s.createdAt || s.outDate || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="student-card-action">
                  <span className="status-badge" style={{ color: '#f59e0b', backgroundColor: '#fef3c7', border: '2px solid #f59e0b' }}>
                    <span className="status-dot">●</span>
                    Pending
                  </span>
                  <span className="view-arrow">View →</span>
                </div>
              </div>
            ))
          )}
        </div>

        {students.length > 0 && (
          <div className="mobile-cards-view">
            {students.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((s) => (
              <div className="mobile-card" key={s._id || s.id}>
                <div className="card-badge">
                  {s.studentid?.registerNumber || s.register_number || s.department || "N/A"}
                </div>
                <h3 className="card-name">
                  {s.studentid?.name || s.studentName || s.name}
                  {s.outpasstype === 'Emergency' && <span className="mobile-emergency-label"> (EMERGENCY)</span>}
                </h3>
                <p className="card-details">
                  {s.studentid?.year ? `Year ${s.studentid.year} • ` : ''}
                  {s.outpasstype || 'General'} •
                  Applied on {new Date(s.createdAt || s.outDate || Date.now()).toLocaleDateString()}
                </p>

                <div className="card-footer">
                  <span className="status-pill status-pending">
                    • Pending
                  </span>
                  <button
                    className="card-view-link"
                    onClick={() => navigate(`/warden/student/${s._id || s.id}`)}
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {students.length === 0 && (
          <div className="mobile-empty-state">
            <div className="empty-content">
              <span className="empty-icon">✨</span>
              <p>No pending outpasses</p>
            </div>
          </div>
        )}

        {/* Pagination logic ... */}
        {students.length > 0 && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {page} of {Math.ceil(students.length / itemsPerPage)}
            </span>

            <button
              disabled={page === Math.ceil(students.length / itemsPerPage)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}

        <style>{`
/* Page Container */
.list-container {
  padding: 24px 40px;
  animation: fadeInUp 0.6s ease;
  margin-top: 10px; /* Reduced to move content upward */
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

.list-container h1 {
  font-size: 22px; /* Reduced from 28px */
  margin-bottom: 16px; /* Reduced from 24px */
  color: #1e3a8a;
  font-weight: 700;
}

/* Reuse standard student-card styles */
.student-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.student-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;
    border: 2px solid transparent;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.student-card:hover {
    border-color: #0047AB;
    transform: translateX(8px);
    box-shadow: 0 8px 24px rgba(0, 71, 171, 0.15);
}

.student-card-main {
    display: flex;
    align-items: center;
    gap: 20px;
}

.student-id-highlight {
    background: linear-gradient(135deg, #0047AB, #2563eb);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1.1rem;
    min-width: 140px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.3);
}

.student-info {
    flex: 1;
}

.student-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
}

.student-meta {
    color: #64748b;
    font-size: 0.95rem;
}

.student-card-action {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-left: auto;
}

.view-arrow {
    color: #0047AB;
    font-weight: 700;
    font-size: 1rem;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
}

.status-dot {
    font-size: 0.8rem;
}

.emergency-badge {
    background-color: #ef4444;
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
    font-weight: 700;
    vertical-align: middle;
}

@media (max-width: 768px) {
    .student-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .student-card-main {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
    }

    .student-id-highlight {
        width: 100%;
    }

    .student-card-action {
        width: 100%;
        justify-content: space-between;
        margin-left: 0;
    }
}
      `}</style>
      </div>
    </div>
  );
};

export default PendingOutpass;
