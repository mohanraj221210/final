import React, { useState, useEffect } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import WardenNav from "../../components/WardenNav";

const OutpassList: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Approved' | 'Rejected'>('All');

  const itemsPerPage = 8;

  useEffect(() => {
    fetchOutpasses();
  }, []);

  const fetchOutpasses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/warden/outpass/list/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const outpassData = res.data.outpasses || res.data.data || res.data || [];
      // Initially set all data, filtering happens on render/derived state
      setOutpasses(Array.isArray(outpassData) ? outpassData : []);
    } catch (err: any) {
      console.error("Failed to fetch outpasses", err);
      // Error handling...
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredOutpasses = outpasses.filter((item) => {
    const status = item.wardenapprovalstatus?.toLowerCase() || '';
    if (filterStatus === 'All') return status === 'approved' || status === 'rejected' || status === 'declined';
    if (filterStatus === 'Approved') return status === 'approved';
    if (filterStatus === 'Rejected') return status === 'rejected' || status === 'declined';
    return true;
  });

  const totalPages = Math.ceil(filteredOutpasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredOutpasses.slice(startIndex, startIndex + itemsPerPage);

  const capitalize = (str: any) => {
    if (!str) return "Pending";
    const s = String(str);
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  return (
    <div className="page-container">
      <WardenNav />
      <div className="list-container">
        <div className="header-row">
          <button className="back-btn" onClick={() => navigate("/warden-dashboard")}>
            ← Back
          </button>

          <div className="filter-tabs">
            <button
              className={`filter-btn ${filterStatus === 'All' ? 'active' : ''}`}
              onClick={() => { setFilterStatus('All'); setCurrentPage(1); }}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterStatus === 'Approved' ? 'active' : ''}`}
              onClick={() => { setFilterStatus('Approved'); setCurrentPage(1); }}
            >
              Approved
            </button>
            <button
              className={`filter-btn ${filterStatus === 'Rejected' ? 'active' : ''}`}
              onClick={() => { setFilterStatus('Rejected'); setCurrentPage(1); }}
            >
              Rejected
            </button>
          </div>
        </div>

        <h1>Outpass List</h1>

        <div className="outpass-card">
          {loading ? (
            <div className="loading-container">
              <div className="loading-bar">
                <div className="loading-progress"></div>
              </div>
              <p>Loading outpasses...</p>
            </div>
          ) : (
            <table className="outpass-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Register No</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data-cell" style={{ textAlign: "center", padding: "20px" }}>
                      No outpasses found
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr key={item.id || index}>
                      <td data-label="#">{startIndex + index + 1}</td>
                      <td data-label="Name">{item.studentid.name || item.studentName}</td>
                      <td data-label="Register No">{item.studentid.registerNumber || item.register_number}</td>
                      <td data-label="Date">
                        {new Date(item.createdAt || item.outDate).toLocaleDateString()}
                      </td>
                      <td data-label="Reason">{item.reason}</td>
                      <td data-label="Status">
                        <span className={`status ${item.status?.toLowerCase() === 'rejected' ? 'rejected' : 'approved'}`}>
                          {capitalize(item.status)}
                        </span>
                      </td>
                      <td data-label="Action">
                        <button
                          className="view-btn"
                          onClick={() => {
                            const studentId = item.studentID || item.studentId || item.id || item._id;
                            navigate(`/warden/student/${studentId}`);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {!loading && currentData.length > 0 && (
            <div className="mobile-cards-view">
              {currentData.map((item, index) => (
                <div className="mobile-card" key={item.id || index}>
                  <div className="card-badge">
                    {item.studentid.registerNumber || item.register_number}
                  </div>
                  <h3 className="card-name">{item.studentid.name || item.studentName}</h3>
                  <p className="card-details">
                    {item.studentid.year ? `Year ${item.studentid.year} • ` : ''}
                    Applied on {new Date(item.createdAt || item.outDate).toLocaleDateString()}
                  </p>

                  <div className="card-footer">
                    <span className={`status-pill ${item.status?.toLowerCase() === 'rejected' ? 'status-rejected' : 'status-approved'}`}>
                      • {capitalize(item.status)}
                    </span>
                    <button
                      className="card-view-link"
                      onClick={() => {
                        const studentId = item.studentID || item.studentId || item.id || item._id;
                        navigate(`/warden/student/${studentId}`);
                      }}
                    >
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination logic ... */}
        {!loading && outpasses.length > 0 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
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


.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;
}

.filter-tabs {
    display: flex;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 12px;
    gap: 4px;
}

.filter-btn {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: #64748b;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.filter-btn:hover {
    color: #1e293b;
    background: rgba(255,255,255,0.5);
}

.filter-btn.active {
    background: white;
    color: #1e3a8a;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.back-btn {
  background: white;
  border: 1px solid #cbd5e1;
  font-size: 16px;
  color: #1e3a8a;
  cursor: pointer;
  /* margin-bottom: 20px; Removed margin since it's in header-row now */
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

/* Status */
.status {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
}

.status.approved {
  background: #dcfce7;
  color: #166534;
}

.status.rejected {
  background: #fee2e2;
  color: #991b1b;
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

/* Loading Animation */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
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

/* Page Container */
.list-container {
  padding: 24px 40px; /* Adjusted padding */
}

/* ... existing styles ... */

/* Mobile */
@media (max-width: 768px) {
  .list-container {
    padding: 16px;
    margin-top: 5px; /* Significantly reduced for upward movement */
  }

  .list-container h1 {
    font-size: 18px; /* Further reduced for mobile */
    margin-bottom: 12px;
  }

  .header-row {
      flex-direction: column; /* Back button on top, filters below */
      align-items: flex-start;
      gap: 16px;
  }
  
  .filter-tabs {
      width: 100%;
      justify-content: space-between;
  }
  
  .filter-btn {
      flex: 1;
      text-align: center;
      padding: 10px;
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
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: capitalize;
  }

  .status-pill.status-approved {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
  }

  .status-pill.status-rejected {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #f87171;
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
}

/* Desktop: Hide mobile view */
@media (min-width: 769px) {
  .mobile-cards-view {
    display: none;
  }
}
      `}</style>
      </div>
    </div>
  );
};

export default OutpassList;
