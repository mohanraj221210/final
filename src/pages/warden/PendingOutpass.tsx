import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WardenNav from "../../components/WardenNav";
import { toast, ToastContainer } from "react-toastify";

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
    photo?: string;
  } | string;
  student?: {
    _id?: string;
    name?: string;
    department?: string;
    semester?: number;
    email?: string;
    registerNumber?: string;
    year?: string;
    batch?: string;
    cgpa?: number;
    gender?: string;
    hostelname?: string;
    hostelroomno?: string;
    parentnumber?: string;
    phone?: string;
    photo?: string;
    residencetype?: string;
  };
  outpasstype?: string;
  proof?: string;
  document?: string;
  file?: string;
}

const PendingOutpass: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'image' | 'pdf'>('image');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLast, setIsLast] = useState(true);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchStudents();
  }, [debouncedSearchTerm, page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/warden/pending/outpass/list?search=${debouncedSearchTerm}&page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const allData = res.data.outpasses || res.data.filterOutpass || res.data.data || res.data.students || [];
      const pendingData = allData.filter((item: any) => {
        const ws = item.wardenapprovalstatus?.toLowerCase() || "";
        return ws !== 'approved' && ws !== 'rejected' && ws !== 'declined';
      }).sort((a: any, b: any) => {
        // Priority 1: Emergency first
        const isAEmergency = (a.outpasstype || a.outpassType || '').toLowerCase() === 'emergency';
        const isBEmergency = (b.outpasstype || b.outpassType || '').toLowerCase() === 'emergency';
        if (isAEmergency && !isBEmergency) return -1;
        if (!isAEmergency && isBEmergency) return 1;

        // Priority 2: Date (Newest first)
        return new Date(b.createdAt || b.outDate || Date.now()).getTime() - new Date(a.createdAt || a.outDate || Date.now()).getTime();
      });

      // Sort Emergency first
      pendingData.sort((a: any, b: any) => {
        const typeA = a.outpasstype || a.outpassType || '';
        const typeB = b.outpasstype || b.outpassType || '';
        if (typeA === 'Emergency' && typeB !== 'Emergency') return -1;
        if (typeA !== 'Emergency' && typeB === 'Emergency') return 1;
        return 0;
      });

      setStudents(pendingData);
      setIsLast(res.data.isLast ?? true);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to fetch pending outpasses");
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

    return matchesDate;
  });

  const getStudentAvatar = (s: Student) => {
    const studentPhoto = s.student?.photo || (typeof s.studentid === 'object' ? s.studentid?.photo : undefined);
    if (studentPhoto && !imageErrors[s._id || s.id || '']) {
      const src = studentPhoto.startsWith('http') || studentPhoto.startsWith('data:')
        ? studentPhoto
        : `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${studentPhoto.replace(/^\//, '')}`;
      return (
        <img
          src={src}
          alt="Student"
          className="wd-avatar-img"
          onError={() => {
            setImageErrors(prev => ({ ...prev, [s._id || s.id || '']: true }));
          }}
        />
      );
    }
    const name = s.student?.name || (typeof s.studentid === 'object' ? s.studentid?.name : undefined) || s.studentName || s.name || "?";
    return (
      <div className="wd-avatar-initials">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="wd-root">
      <WardenNav />
      <ToastContainer position="bottom-right" />

      <main className="wd-main">
        <div className="wd-container">
          
          {/* Header Controls */}
          <div className="wd-header-row">
            <div>
              <button className="wd-back-btn" onClick={() => navigate("/warden-dashboard")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back to Dashboard
              </button>
              <h1 className="wd-title">Pending Approvals</h1>
              <p className="wd-subtitle">Review and authorize student outpass requests</p>
            </div>

            <div className="wd-controls">
              <div className="wd-search-wrapper">
                <span className="wd-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search name, register no..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="wd-search-input"
                />
              </div>

              <div className="wd-dropdown-wrapper">
                <span className="wd-dropdown-icon">📅</span>
                <select
                  className="wd-filter-dropdown"
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value as any); setPage(1); }}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                </select>
                <span className="wd-dropdown-arrow">▼</span>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="wd-loading-wrap">
              <div className="wd-spinner" />
              <h3>Fetching pending requests...</h3>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="wd-empty-state">
              <span className="wd-empty-icon">✨</span>
              <h3 className="wd-empty-title">All Caught Up!</h3>
              <p className="wd-empty-desc">There are no pending outpass requests matching your criteria.</p>
            </div>
          ) : (
            <div className="wd-cards-grid">
              {filteredStudents.map((s) => {
                const registerNumber = s.student?.registerNumber || (typeof s.studentid === 'object' ? s.studentid?.registerNumber : undefined) || s.register_number || 'N/A';
                const studentName = s.student?.name || (typeof s.studentid === 'object' ? s.studentid?.name : undefined) || s.studentName || s.name || 'Unknown';
                const studentYear = s.student?.year || (typeof s.studentid === 'object' ? s.studentid?.year : undefined);
                const isEmergency = (s.outpasstype || '').toLowerCase().includes('emergency');

                return (
                  <div
                    key={s._id || s.id}
                    className={`wd-card ${isEmergency ? 'wd-card-emergency' : ''}`}
                    onClick={() => navigate(`/warden/student/${s._id || s.id}`)}
                  >
                    <div className="wd-card-header">
                      <div className="wd-avatar-wrapper">
                        {getStudentAvatar(s)}
                      </div>
                      <div className="wd-student-info">
                        <h3 className="wd-name">
                          {studentName}
                          {isEmergency && <span className="wd-emergency-tag">Emergency</span>}
                        </h3>
                        <span className="wd-reg-no sd-mono">{registerNumber}</span>
                        <span className="wd-dept">
                          {s.student?.department || "Hostel Student"}
                          {studentYear && <span className="wd-year-tag">Yr {studentYear}</span>}
                        </span>
                      </div>
                    </div>

                    <div className="wd-card-body">
                      <div className="wd-reason-label">Reason</div>
                      <p className="wd-reason-text">{s.reason || "No reason specified"}</p>
                    </div>

                    <div className="wd-card-meta">
                      <div className="wd-meta-row">
                        <span className="label">Outpass Type</span>
                        <span className={`value type-badge ${isEmergency ? 'emergency' : ''}`}>
                          {s.outpasstype || 'General'}
                        </span>
                      </div>
                      <div className="wd-meta-row">
                        <span className="label">Applied Date</span>
                        <span className="value date-val">
                          {new Date(s.createdAt || s.outDate || Date.now()).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="wd-card-actions">
                      {(s.proof || s.document || s.file || (s as any).outpassdoc) && (
                        <button
                          className="wd-btn-doc"
                          onClick={(e) => {
                            e.stopPropagation();
                            const url = (s.proof || s.document || s.file || (s as any).outpassdoc)!;
                            handleViewDocument(url);
                          }}
                        >
                          📄 View Document
                        </button>
                      )}
                      <button className="wd-btn-review">
                        Review Outpass
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && (students.length > 0 || page > 1) && (
            <div className="wd-pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="wd-page-btn"
              >
                ← Prev
              </button>

              <span className="wd-page-indicator">
                Page <strong>{page}</strong>
              </span>

              <button
                disabled={isLast}
                onClick={() => setPage((p) => p + 1)}
                className="wd-page-btn"
              >
                Next →
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Document modal */}
      {showDocumentModal && documentUrl && (
        <div className="wd-modal-backdrop" onClick={() => setShowDocumentModal(false)}>
          <div className="wd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="wd-modal-header">
              <h3>Supporting Document</h3>
              <button onClick={() => setShowDocumentModal(false)} className="wd-modal-close">✕</button>
            </div>
            <div className="wd-modal-body">
              {documentType === 'pdf' ? (
                <iframe
                  src={documentUrl}
                  className="wd-modal-iframe"
                  title="Document Viewer"
                />
              ) : (
                <img
                  src={documentUrl}
                  alt="Proof"
                  className="wd-modal-img"
                />
              )}
            </div>
            <div className="wd-modal-footer">
              <a
                href={documentUrl}
                download={`proof_document.${documentType === 'pdf' ? 'pdf' : 'jpg'}`}
                className="wd-btn-download"
              >
                Download File
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ====== LAYOUT & BASE ====== */
        .wd-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 45%, #DBEAFE 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding-top: var(--nav-height, 64px);
          padding-bottom: 80px;
        }

        .wd-main {
          padding: 24px 32px;
          max-width: var(--content-max, 1280px);
          margin: 0 auto;
        }

        .wd-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* ====== HEADER ROW ====== */
        .wd-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 20px;
        }

        .wd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #E2E8F0;
          color: #0047AB;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 100px;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .wd-back-btn:hover {
          background: #EFF6FF;
          transform: translateX(-4px);
          box-shadow: 0 6px 12px rgba(0, 71, 171, 0.08);
        }

        .wd-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0F172A;
          margin: 12px 0 4px;
          letter-spacing: -0.02em;
        }

        .wd-subtitle {
          font-size: 0.9rem;
          color: #64748B;
          margin: 0;
          font-weight: 500;
        }

        /* ====== CONTROLS ====== */
        .wd-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .wd-search-wrapper {
          position: relative;
          min-width: 260px;
        }

        .wd-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          font-size: 0.95rem;
        }

        .wd-search-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background: white;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 14px;
          font-size: 0.88rem;
          font-weight: 500;
          color: #0F172A;
          outline: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .wd-search-input:focus {
          border-color: #0047AB;
          box-shadow: 0 0 0 4px rgba(0, 71, 171, 0.10);
        }

        .wd-dropdown-wrapper {
          position: relative;
        }

        .wd-dropdown-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.95rem;
          pointer-events: none;
        }

        .wd-dropdown-arrow {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.7rem;
          color: #64748B;
          pointer-events: none;
        }

        .wd-filter-dropdown {
          padding: 12px 32px 12px 36px;
          background: white;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 14px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
          outline: none;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          appearance: none;
          min-width: 160px;
        }

        .wd-filter-dropdown:focus {
          border-color: #0047AB;
        }

        /* ====== CARDS GRID ====== */
        .wd-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }

        .wd-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(226, 232, 240, 0.5);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .wd-card:hover {
          transform: translateY(-5px);
          border-color: #0047AB;
          box-shadow: 0 12px 30px rgba(0, 71, 171, 0.08), 0 0 0 1px rgba(0, 71, 171, 0.2);
        }

        .wd-card-emergency {
          border-left: 5px solid #EF4444;
        }

        .wd-card-emergency:hover {
          border-color: #EF4444;
          box-shadow: 0 12px 30px rgba(239, 68, 68, 0.08), 0 0 0 1px rgba(239, 68, 68, 0.2);
        }

        /* Card Header */
        .wd-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .wd-avatar-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .wd-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .wd-avatar-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0047AB 0%, #2563EB 100%);
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .wd-student-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-grow: 1;
        }

        .wd-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.2;
        }

        .wd-emergency-tag {
          font-size: 0.65rem;
          font-weight: 700;
          background: #FEF2F2;
          color: #EF4444;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid rgba(239, 68, 68, 0.15);
          text-transform: uppercase;
        }

        .wd-reg-no {
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748B;
        }

        .wd-dept {
          font-size: 0.78rem;
          font-weight: 500;
          color: #64748B;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .wd-year-tag {
          background: #F1F5F9;
          color: #475569;
          padding: 1px 4px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.65rem;
        }

        /* Card Body */
        .wd-card-body {
          background: #F8FAFC;
          border-radius: 12px;
          padding: 12px 14px;
          border: 1px solid rgba(226, 232, 240, 0.6);
          flex-grow: 1;
        }

        .wd-reason-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          margin-bottom: 4px;
          letter-spacing: 0.02em;
        }

        .wd-reason-text {
          font-size: 0.85rem;
          color: #475569;
          font-weight: 500;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Card Meta */
        .wd-card-meta {
          border-top: 1px dashed #E2E8F0;
          padding-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .wd-meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .wd-meta-row .label {
          color: #64748B;
          font-weight: 500;
        }

        .wd-meta-row .value {
          font-weight: 600;
          color: #334155;
        }

        .wd-meta-row .type-badge {
          background: #EFF6FF;
          color: #0047AB;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 0.72rem;
          text-transform: uppercase;
        }

        .wd-meta-row .type-badge.emergency {
          background: #FEF2F2;
          color: #EF4444;
        }

        .wd-meta-row .date-val {
          color: #0F172A;
        }

        /* Card Actions */
        .wd-card-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }

        .wd-btn-doc {
          flex: 1;
          padding: 8px 12px;
          background: #EFF6FF;
          border: 1px solid rgba(0, 71, 171, 0.15);
          color: #0047AB;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .wd-btn-doc:hover {
          background: #DBEAFE;
          border-color: #0047AB;
        }

        .wd-btn-review {
          flex: 1.5;
          padding: 8px 14px;
          background: #0047AB;
          border: none;
          color: white;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .wd-btn-review svg {
          transition: transform 0.2s ease;
        }

        .wd-btn-review:hover {
          background: #003682;
          box-shadow: 0 4px 12px rgba(0, 71, 171, 0.2);
        }

        .wd-btn-review:hover svg {
          transform: translateX(3px);
        }

        /* ====== EMPTY & LOADING STATE ====== */
        .wd-loading-wrap {
          text-align: center;
          padding: 80px 24px;
          background: rgba(255,255,255,0.6);
          border-radius: 20px;
          border: 1px solid rgba(226,232,240,0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .wd-spinner {
          width: 42px;
          height: 42px;
          border: 4px solid #E2E8F0;
          border-top-color: #0047AB;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .wd-empty-state {
          text-align: center;
          padding: 80px 24px;
          background: rgba(255,255,255,0.6);
          border-radius: 20px;
          border: 1px solid rgba(226,232,240,0.5);
        }

        .wd-empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }

        .wd-empty-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1E293B;
          margin: 0 0 6px;
        }

        .wd-empty-desc {
          font-size: 0.88rem;
          color: #64748B;
          margin: 0;
        }

        /* ====== PAGINATION ====== */
        .wd-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
        }

        .wd-page-btn {
          padding: 8px 18px;
          border-radius: 10px;
          border: 1px solid rgba(0, 71, 171, 0.15);
          background: #EFF6FF;
          color: #0047AB;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .wd-page-btn:hover:not(:disabled) {
          background: #0047AB;
          color: white;
          box-shadow: 0 4px 10px rgba(0, 71, 171, 0.15);
        }

        .wd-page-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          background: #F1F5F9;
          color: #94A3B8;
          border-color: #E2E8F0;
        }

        .wd-page-indicator {
          font-size: 0.88rem;
          color: #64748B;
        }

        /* ====== MODAL BAR ====== */
        .wd-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .wd-modal-card {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 900px;
          height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          overflow: hidden;
        }

        .wd-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid #F1F5F9;
        }

        .wd-modal-header h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0F172A;
        }

        .wd-modal-close {
          background: #F1F5F9;
          border: none;
          color: #64748B;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .wd-modal-close:hover {
          background: #FEF2F2;
          color: #EF4444;
        }

        .wd-modal-body {
          flex-grow: 1;
          background: #F8FAFC;
          overflow: auto;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wd-modal-iframe {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .wd-modal-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .wd-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #F1F5F9;
          display: flex;
          justify-content: flex-end;
        }

        .wd-btn-download {
          padding: 10px 20px;
          background: #0047AB;
          color: white;
          border-radius: 10px;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .wd-btn-download:hover {
          background: #003682;
          box-shadow: 0 4px 12px rgba(0,71,171,0.25);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .sd-mono {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-weight: 600;
        }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 768px) {
          .wd-main {
            padding: 16px;
          }

          .wd-header-row {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .wd-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .wd-search-wrapper {
            min-width: 100%;
          }

          .wd-filter-dropdown {
            width: 100%;
          }

          .wd-cards-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default PendingOutpass;
