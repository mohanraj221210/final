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
  outpasstype?: string;
  proof?: string;
  document?: string;
  file?: string;
}

const PendingOutpass: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'image' | 'pdf'>('image');
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

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

      const allData = res.data.outpasses || res.data.filterOutpass || res.data.data || res.data.students || [];
      const pendingData = allData.filter((item: any) => {
        const ws = item.wardenapprovalstatus?.toLowerCase() || "";
        return ws !== 'Approved' && ws !== 'Rejected' && ws !== 'Declined';
      }).sort((a: any, b: any) => {
        // Priority 1: Emergency first
        const isAEmergency = a.outpassType?.toLowerCase() === 'emergency';
        const isBEmergency = b.outpassType?.toLowerCase() === 'emergency';
        if (isAEmergency && !isBEmergency) return -1;
        if (!isAEmergency && isBEmergency) return 1;

        // Priority 2: Date (Newest first)
        return new Date(b.createdAt || b.outDate || Date.now()).getTime() - new Date(a.createdAt || a.outDate || Date.now()).getTime();
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

  const filteredStudents = students.filter(s => {
    let matchesDate = true;
    const appliedDate = new Date(s.createdAt || s.outDate || Date.now());
    if (dateFilter !== 'all') {
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

    const dateStr = appliedDate ? appliedDate.toLocaleDateString() : '';
    const nameMatch = s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentid?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '';
    const regMatch = s.register_number?.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentid?.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || '';

    const matchesSearch = searchTerm === "" || nameMatch || regMatch || dateStr.includes(searchTerm.toLowerCase());

    return matchesDate && matchesSearch;
  });

  return (
    <div className="page-container">
      <WardenNav />
      <div className="list-container">
        <button className="back-btn" onClick={() => navigate("/warden-dashboard")}>
          ← Back
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 style={{ margin: 0 }}>Pending Outpass Students</h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <span className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔍</span>
              <input
                type="text"
                placeholder="Search by name, reg no, date..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
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
                onChange={(e) => { setDateFilter(e.target.value as any); setPage(1); }}
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
          </div>
        </div>

        <div className="student-list">
          {(
            filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((s) => (
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
                  {(s.proof || s.document || s.file || (s as any).outpassdoc) && (
                    <button
                      className="view-doc-btn-list"
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = (s.proof || s.document || s.file || (s as any).outpassdoc)!;
                        handleViewDocument(url);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#eff6ff',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        color: '#3b82f6',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      📄 View Doc
                    </button>
                  )}
                  <span className="view-arrow">View →</span>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredStudents.length > 0 && (
          <div className="mobile-cards-view">
            {filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((s) => (
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
                  {s.outpasstype?.toLowerCase() === 'emergency' && (
                    <div className="emergency-badge mobile">🚨 EMERGENCY</div>
                  )}
                </p>

                <div className="card-footer" style={{ gap: '8px', flexWrap: 'wrap' }}>
                  <span className="status-pill status-pending">
                    • Pending
                  </span>
                  {(s.proof || s.document || s.file || (s as any).outpassdoc) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = (s.proof || s.document || s.file || (s as any).outpassdoc)!;
                        handleViewDocument(url);
                      }}
                      style={{
                        padding: '4px 8px',
                        background: '#eff6ff',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px',
                        color: '#3b82f6',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      📄 Doc
                    </button>
                  )}
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

        {filteredStudents.length === 0 && (
          <div className="mobile-empty-state">
            <div className="empty-content">
              <span className="empty-icon">✨</span>
              <p>No pending outpasses</p>
            </div>
          </div>
        )}

        {/* Pagination logic ... */}
        {filteredStudents.length > 0 && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {page} of {Math.ceil(filteredStudents.length / itemsPerPage)}
            </span>

            <button
              disabled={page === Math.ceil(filteredStudents.length / itemsPerPage)}
              onClick={() => setPage((p) => p + 1)}
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
      /* Mobile Cards View */
.mobile-cards-view {
  display: none;
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
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: capitalize;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Empty State */
.mobile-empty-state, .no-data-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.empty-content {
  text-align: center;
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 500;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

/* Responsive Media Queries */
@media (max-width: 768px) {
  .list-container {
    padding: 16px;
  }
  
  .student-list {
    display: none;
  }

  .mobile-cards-view {
    display: flex;
  }

  .pagination {
    gap: 10px;
  }

  .pagination button {
    padding: 8px 14px;
    font-size: 14px;
  }
}
      `}</style>
      </div>
    </div>
  );
};

export default PendingOutpass;
