import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WatchmanNav from "../../components/WatchmanNav";

const WatchmanOutpassList: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Yesterday' | 'This Week' | 'This Month'>('All');

  const itemsPerPage = 8;

  useEffect(() => {
    fetchOutpasses();
  }, []);

  const fetchOutpasses = async () => {
    try {
      const token = localStorage.getItem("token");

      // Using the same endpoint as warden for now, assuming watchman has access or it's public enough
      // In a real scenario, this might need a specific /watchman endpoint
      // Watchman API Endpoint
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/watchman/outpass/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      // Data extraction based on confirmed API response structure (outpass)
      const outpassData = res.data.outpass || [];

      // Filter for approved outpasses based on residence type
      const approvedOutpasses = outpassData.filter((item: any) => {
        const resType = (item.studentid?.residencetype || '').toLowerCase().trim().replace(/\s/g, '');
        const isDayScholar = resType === 'dayscholar';
        if (isDayScholar) {
          return item.yearinchargeapprovalstatus === 'approved';
        }
        return item.wardenapprovalstatus === 'approved';
      });

      setOutpasses(approvedOutpasses);
    } catch (err: any) {
      console.error("Failed to fetch outpasses", err);
      // Handle errors gracefully
      if (err.response?.status === 401) {
        // Token might be invalid or maybe watchman type isn't allowed on this specific endpoint
        // For now we just alert
        console.error("Authentication error");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Filter logic
  const filteredOutpasses = outpasses.filter((item) => {
    if (dateFilter === 'All') return true;

    const itemDate = new Date(item.createdAt || item.outDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'Today') {
      return itemDate >= today;
    } else if (dateFilter === 'Yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const endYesterday = new Date(yesterday);
      endYesterday.setHours(23, 59, 59, 999);
      return itemDate >= yesterday && itemDate <= endYesterday;
    } else if (dateFilter === 'This Week') {
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay() || 7;
      if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
      else startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setHours(0, 0, 0, 0);
      return itemDate >= startOfWeek;
    } else if (dateFilter === 'This Month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return itemDate >= startOfMonth;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredOutpasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredOutpasses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="page-container">
      <WatchmanNav />

      <div className="list-container">
        <div className="header-row">
          <div>
            <button className="back-btn" onClick={() => navigate("/watchman-dashboard")}>
              ← Back
            </button>
            <h1 style={{ marginTop: "10px", marginBottom: "10px" }}>Watchman Approved Outpass List</h1>
          </div>

          <div className="filter-controls">
            <div className="filter-tabs desktop-only">
              {['All', 'Today', 'Yesterday', 'This Week', 'This Month'].map((filter) => (
                <button
                  key={filter}
                  className={`filter-btn ${dateFilter === filter ? 'active' : ''}`}
                  onClick={() => setDateFilter(filter as any)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <select
              className="filter-dropdown mobile-only"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
            >
              {['All', 'Today', 'Yesterday', 'This Week', 'This Month'].map((filter) => (
                <option key={filter} value={filter}>{filter}</option>
              ))}
            </select>
          </div>
        </div>

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
                  <th>Reg No</th>
                  <th>Dept / Year</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data-cell" style={{ textAlign: "center", padding: "20px" }}>
                      No approved outpasses found
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr key={item.id || index}>
                      <td data-label="#">{startIndex + index + 1}</td>
                      <td data-label="Name">
                        {item.studentid?.name || "N/A"}
                      </td>
                      <td data-label="Register No">
                        {item.studentid?.registerNumber || "N/A"}
                      </td>
                      <td data-label="Dept / Year">
                        {item.studentid?.department || "-"} / {item.studentid?.year || "-"}
                      </td>
                      <td data-label="Date">
                        {new Date(item.createdAt || item.outDate).toLocaleDateString()}
                      </td>
                      <td data-label="Reason">{item.reason}</td>
                      <td data-label="Status">
                        <div className="status-stack">
                          <span className={`status-badge ${getStatusColor(item.staffapprovalstatus)}`}>
                            Staff: {item.staffapprovalstatus}
                          </span>
                          <span className={`status-badge ${getStatusColor(item.yearinchargeapprovalstatus)}`}>
                            Incharge: {item.yearinchargeapprovalstatus}
                          </span>
                          {(item.studentid?.residencetype || '').toLowerCase().trim().replace(/\s/g, '') !== 'dayscholar' && (
                            <span className={`status-badge ${getStatusColor(item.wardenapprovalstatus)}`}>
                              Warden: {item.wardenapprovalstatus}
                            </span>
                          )}
                        </div>
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
                    {item.studentid?.registerNumber || item.register_number}
                  </div>
                  <h3 className="card-name">{item.studentid?.name || item.studentName}</h3>
                  <div className="card-details-grid">
                    <div className="detail-row">
                      <span className="label">Pass Type:</span>
                      <span className="value">{item.outpasstype}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Dept/Year:</span>
                      <span className="value">{item.studentid?.department} - {item.studentid?.year}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">From:</span>
                      <span className="value">{new Date(item.fromDate).toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">To:</span>
                      <span className="value">{new Date(item.toDate).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="card-footer-grid">
                    <span className={`status-badge-mobile ${getStatusColor(item.staffapprovalstatus)}`}>
                      Staff: {item.staffapprovalstatus}
                    </span>
                    <span className={`status-badge-mobile ${getStatusColor(item.yearinchargeapprovalstatus)}`}>
                      Incharge: {item.yearinchargeapprovalstatus}
                    </span>
                    {(item.studentid?.residencetype || '').toLowerCase().trim().replace(/\s/g, '') !== 'dayscholar' && (
                      <span className={`status-badge-mobile ${getStatusColor(item.wardenapprovalstatus)}`}>
                        Warden: {item.wardenapprovalstatus}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination logic */}
        {!loading && filteredOutpasses.length > itemsPerPage && (
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
  margin-top: 10px; 
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
    overflow-x: auto; /* Handle overflow on smaller screens */
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
    white-space: nowrap;
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
  font-size: 22px; 
  margin-bottom: 16px; 
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
.loading-center {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
  width: 100%;
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

/* Mobile */
@media (max-width: 768px) {
  .list-container {
    padding: 16px;
    margin-top: 5px; 
  }

  .list-container h1 {
    font-size: 18px; 
    margin-bottom: 12px;
  }

  .header-row {
      flex-direction: row; /* Keep row to have back on left, filter on right */
      justify-content: space-between;
      align-items: center;
      gap: 10px;
  }
  
  .desktop-only {
      display: none !important;
  }

  .mobile-only {
      display: block !important;
  }
  
  .filter-dropdown {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: white;
      color: #1e3a8a;
      font-weight: 600;
      font-size: 14px;
      outline: none;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
  
  .filter-tabs {
      width: 100%;
      justify-content: space-between;
      overflow-x: auto;
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
    display: none; 
  }

  .mobile-cards-view {
    display: block;
  }

  .back-btn {
      margin-bottom: 0;
  }
}

@media (min-width: 769px) {
  .mobile-cards-view {
    display: none;
  }
}

.mobile-only {
    display: none;
}

/* Status Styles */
.status-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.status-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
    border: 1px solid;
    width: fit-content;
}

.bg-green-100 { background-color: #dcfce7; }
.text-green-800 { color: #166534; }
.border-green-200 { border-color: #bbf7d0; }

.bg-red-100 { background-color: #fee2e2; }
.text-red-800 { color: #991b1b; }
.border-red-200 { border-color: #fecaca; }

.bg-yellow-100 { background-color: #fef9c3; }
.text-yellow-800 { color: #854d0e; }
.border-yellow-200 { border-color: #fde047; }

/* Mobile Card Updates */
.card-details-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 0.9rem;
}

.detail-row {
    display: flex;
    justify-content: space-between;
}

.detail-row .label {
    color: #64748b;
}

.detail-row .value {
    color: #334155;
    font-weight: 500;
    text-align: right;
}

.card-footer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    border-top: 1px solid #f1f5f9;
    padding-top: 16px;
}

.status-badge-mobile {
    font-size: 0.7rem;
    padding: 4px 8px;
    border-radius: 6px;
    text-align: center;
    font-weight: 600;
    border: 1px solid;
    text-transform: capitalize;
}
      `}</style>
      </div>
    </div>
  );
};

export default WatchmanOutpassList;
