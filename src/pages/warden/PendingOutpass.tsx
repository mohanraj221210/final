import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WardenNav from "../../components/WardenNav";

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
}

const PendingOutpass: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
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
    setStudents(pendingData);
  };

  return (
    <div className="page-container">
      <WardenNav />
      <div className="list-container">
        <button className="back-btn" onClick={() => navigate("/warden-dashboard")}>
          ← Back
        </button>
        <h1>Pending Outpass Students</h1>

        <div className="outpass-card">
          <table className="outpass-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Register No</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                    No pending outpasses
                  </td>
                </tr>
              ) : (
                students.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((s) => (
                  <tr key={s._id || s.id}>
                    <td data-label="Name">{s.studentid?.name || s.studentName || s.name}</td>
                    <td data-label="Register No">{s.studentid?.registerNumber || s.register_number || 'N/A'}</td>
                    <td data-label="Date">
                      {new Date(s.createdAt || s.outDate || Date.now()).toLocaleDateString()}
                    </td>
                    <td data-label="Reason">{s.reason}</td>
                    <td data-label="Status">
                      <span className="status-pill status-pending">
                        Pending
                      </span>
                    </td>
                    <td data-label="Action">
                      <button className="view-btn" onClick={() => navigate(`/warden/student/${s._id || s.id}`)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {students.length > 0 && (
          <div className="mobile-cards-view">
            {students.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((s) => (
              <div className="mobile-card" key={s._id || s.id}>
                <div className="card-badge">
                  {s.studentid?.registerNumber || s.register_number || s.department || "N/A"}
                </div>
                <h3 className="card-name">{s.studentid?.name || s.studentName || s.name}</h3>
                <p className="card-details">
                  {s.studentid?.year ? `Year ${s.studentid.year} • ` : ''}
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

/* Table Card */
.outpass-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
}

/* Table */
.outpass-table {
  width: 100%;
  border-collapse: collapse;
}

.outpass-table thead {
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  color: white;
}

.outpass-table th {
  padding: 14px;
  text-align: left;
  font-weight: 600;
}

.outpass-table td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.outpass-table tbody tr {
  transition: all 0.3s ease;
}

.outpass-table tbody tr:hover {
  background: #eff6ff;
  transform: translateX(4px);
}

/* View Button */
.view-btn {
  padding: 6px 14px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1e3a8a);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s;
}

.view-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37,99,235,0.4);
}

/* Pagination */
.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.pagination button {
  padding: 8px 18px;
  border-radius: 10px;
  border: none;
  background: #1e3a8a;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}

.pagination button:hover {
  background: #2563eb;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mobile adjustment */
@media (max-width: 768px) {
  .list-container {
    padding: 16px;
    margin-top: 5px; /* Significantly reduced for upward movement */
  }

  .list-container h1 {
    font-size: 18px; /* Further reduced for mobile */
    margin-bottom: 12px;
  }

  .outpass-card {
    padding: 0;
    background: transparent;
    box-shadow: none;
    border: none;
  }

  /* Mobile specific card view */
  .mobile-cards-view {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .mobile-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    position: relative;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    border: 1px solid rgba(0,0,0,0.02);
    margin-bottom: 16px;
  }

  .card-badge {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    color: white;
    display: inline-block;
    padding: 8px 0;
    width: 100%;
    text-align: center;
    border-radius: 8px;
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 16px;
    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
  }

  .card-name {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }

  .card-details {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 20px;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f1f5f9;
    padding-top: 16px;
  }

  .status-pill {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    text-transform: capitalize;
  }

  .status-pill.status-approved {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
  }

  .status-pill.status-pending {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fcd34d;
  }

  .card-view-link {
    background: none;
    border: none;
    color: #1e3a8a;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .outpass-table {
    display: none; /* Hide standard table on mobile */
  }

  .mobile-cards-view {
    display: block;
  }

  .mobile-empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    padding: 40px;
    border-radius: 16px;
    color: #64748b;
    text-align: center;
    border: 1px solid rgba(0,0,0,0.05);
    margin-top: 10px;
  }
  
  .empty-icon {
    font-size: 32px;
    display: block;
    margin-bottom: 8px;
  }
  
  .empty-content p {
    font-weight: 600;
  }
}

/* Desktop: Hide mobile view */
@media (min-width: 769px) {
  .mobile-cards-view {
    display: none;
  }
  .mobile-empty-state {
    display: none;
  }
}
      `}</style>
      </div>
    </div>
  );
};

export default PendingOutpass;
