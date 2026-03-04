import React, { useState, useEffect } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import WardenNav from "../../components/WardenNav";
import LoadingSpinner from "../../components/LoadingSpinner";

const OutpassList: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Approved' | 'Rejected'>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'image' | 'pdf'>('image');
  const [searchTerm, setSearchTerm] = useState("");

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
      const list = Array.isArray(outpassData) ? outpassData : [];
      const sortedList = list.sort((a: any, b: any) => {
        // Priority 1: Emergency first
        const isAEmergency = a.outpassType?.toLowerCase() === 'emergency';
        const isBEmergency = b.outpassType?.toLowerCase() === 'emergency';
        if (isAEmergency && !isBEmergency) return -1;
        if (!isAEmergency && isBEmergency) return 1;

        // Priority 2: Date (Newest first)
        return new Date(b.createdAt || b.outDate || Date.now()).getTime() - new Date(a.createdAt || a.outDate || Date.now()).getTime();
      });
      setOutpasses(sortedList);
    } catch (err: any) {
      console.error("Failed to fetch outpasses", err);
      // Error handling...
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (url: string | null) => {
    if (!url) return;
    const fullUrl = `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    setDocumentUrl(fullUrl);
    if (url.toLowerCase().endsWith('.pdf')) {
      setDocumentType('pdf');
    } else {
      setDocumentType('image');
    }
    setShowDocumentModal(true);
  };

  // Filter logic
  const filteredOutpasses = outpasses.filter((item) => {
    const status = item.wardenapprovalstatus?.toLowerCase() || '';
    let matchesStatus = false;
    if (filterStatus === 'All') matchesStatus = status === 'approved' || status === 'rejected' || status === 'declined';
    else if (filterStatus === 'Approved') matchesStatus = status === 'approved';
    else if (filterStatus === 'Rejected') matchesStatus = status === 'rejected' || status === 'declined';
    else matchesStatus = true;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const appliedDate = new Date(item.createdAt || item.outDate || Date.now());
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') matchesDate = appliedDate >= today;
      else if (dateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = appliedDate >= yesterday && appliedDate < today;
      }
      else if (dateFilter === 'this_week') {
        const thisWeek = new Date(today);
        thisWeek.setDate(today.getDate() - today.getDay());
        matchesDate = appliedDate >= thisWeek;
      }
      else if (dateFilter === 'this_month') {
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        matchesDate = appliedDate >= thisMonth;
      }
    }

    const appliedDate = new Date(item.createdAt || item.outDate || Date.now());
    const dateStr = appliedDate.toLocaleDateString();

    // Check if name/register no matches
    // Note: Outpasses might have the student info attached differently depending on API
    const studentName = item.studentid?.name || item.studentName || '';
    const registerNo = item.studentid?.registerNumber || item.register_number || item.registerNumber || '';

    const matchesSearch = searchTerm === "" ||
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dateStr.includes(searchTerm.toLowerCase());

    return matchesStatus && matchesDate && matchesSearch;
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

          <div className="filter-tabs" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
              <span className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔍</span>
              <input
                type="text"
                placeholder="Search by name, reg no, date..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '14px', pointerEvents: 'none' }}>
                📅
              </span>
              <select
                className="date-filter-select"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value as any); setCurrentPage(1); }}
                style={{
                  padding: '10px 32px 10px 36px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#1e293b',
                  fontSize: '14px',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  appearance: 'none',
                  minWidth: '150px'
                }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '10px', pointerEvents: 'none' }}>
                ▼
              </span>
            </div>
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
            <LoadingSpinner />
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
                      <td data-label="Name">{item.studentid?.name || item.studentName || 'Unknown'}</td>
                      <td data-label="Register No">{item.studentid?.registerNumber || item.register_number || 'N/A'}</td>
                      <td data-label="Date">
                        {new Date(item.createdAt || item.outDate).toLocaleDateString()}
                      </td>
                      <td data-label="Reason">
                        {item.reason}
                        {item.outpassType?.toLowerCase() === 'emergency' && (
                          <span className="emergency-badge">🚨 EMERGENCY</span>
                        )}
                      </td>
                      <td data-label="Status">
                        <span className={`status ${item.status?.toLowerCase() === 'rejected' ? 'rejected' : 'approved'}`}>
                          {capitalize(item.status)}
                        </span>
                      </td>
                      <td data-label="Action" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          className="view-btn"
                          onClick={() => {
                            const studentId = item.studentID || item.studentId || item.id || item._id;
                            navigate(`/warden/student/${studentId}`);
                          }}
                        >
                          View
                        </button>
                        {(item.proof || item.document || item.file) && (
                          <button
                            className="view-doc-btn-list"
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = (item.proof || item.document || item.file)!;
                              handleViewDocument(url);
                            }}
                            style={{
                              padding: '6px 14px',
                              background: '#eff6ff',
                              border: '1px solid #3b82f6',
                              borderRadius: '10px',
                              color: '#3b82f6',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: '0.3s'
                            }}
                          >
                            Doc
                          </button>
                        )}
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
                    {item.studentid?.registerNumber || item.register_number || 'N/A'}
                  </div>
                  <h3 className="card-name">{item.studentid?.name || item.studentName || 'Unknown'}</h3>
                  <p className="card-details">
                    {item.studentid?.year ? `Year ${item.studentid.year} • ` : ''}
                    Applied on {new Date(item.createdAt || item.outDate).toLocaleDateString()}
                    {item.outpassType?.toLowerCase() === 'emergency' && (
                      <div className="emergency-badge mobile">🚨 EMERGENCY</div>
                    )}
                  </p>

                  <div className="card-footer" style={{ flexWrap: 'wrap', gap: '8px' }}>
                    <span className={`status-pill ${item.status?.toLowerCase() === 'rejected' ? 'status-rejected' : 'status-approved'}`}>
                      • {capitalize(item.status)}
                    </span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {(item.proof || item.document || item.file) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const url = (item.proof || item.document || item.file)!;
                            handleViewDocument(url);
                          }}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #3b82f6',
                            borderRadius: '6px',
                            color: '#3b82f6',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          📄 Doc
                        </button>
                      )}
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

        {/* Document Modal */}
        {showDocumentModal && documentUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDocumentModal(false)}>
            <div className="bg-white rounded-lg p-4 w-full max-w-4xl h-[90vh] flex flex-col" style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Supporting Document</h3>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
                >
                  ✕
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {documentType === 'pdf' ? (
                  <iframe
                    src={documentUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Document Viewer"
                  />
                ) : (
                  <img
                    src={documentUrl}
                    alt="Proof"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                )}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <a
                  href={documentUrl}
                  download={`proof_document.${documentType === 'pdf' ? 'pdf' : 'jpg'}`}
                  style={{
                    padding: '8px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                >
                  Download File
                </a>
              </div>
            </div>
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

.emergency-badge {
    display: inline-block;
    background-color: #fee2e2;
    color: #ef4444;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 700;
    margin-left: 8px;
    border: 1px solid #ef4444;
    vertical-align: middle;
}

.emergency-badge.mobile {
    margin-left: 0;
    margin-top: 4px;
    display: table;
}
      `}</style>
      </div>
    </div>
  );
};

export default OutpassList;
