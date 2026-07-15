import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WardenNav from "../../components/WardenNav";
import { toast, ToastContainer } from "react-toastify";
import { Search, Calendar, ChevronDown, Sparkles, FileText } from 'lucide-react';


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
  const [totalPages, setTotalPages] = useState(1);
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
    setPage(1);
  }, [dateFilter]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const windowSize = 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, page - windowSize);
      let end = Math.min(totalPages - 1, page + windowSize);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

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

      let allData = res.data.outpasses || res.data.filterOutpass || res.data.data || res.data.students || [];

      // Fetch all outpasses to include pending 'Outing' passes which might be hidden by backend due to staff bypass
      try {
        const resAll = await axios.get(
            `${import.meta.env.VITE_API_URL}/warden/outpass/list?search=${debouncedSearchTerm}&page=1&limit=300`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const allOutpasses = resAll.data.outpasses || resAll.data.filterOutpass || resAll.data.data || resAll.data.students || [];
        const pendingOuting = allOutpasses.filter((item: any) => {
            const type = String(item.outpasstype || item.outpassType || '').toLowerCase().replace(/\s+/g, '');
            const ws = item.wardenapprovalstatus?.toLowerCase() || "";
            const gs = item.status?.toLowerCase() || "";
            return type === 'outing' && 
                   ws !== 'approved' && ws !== 'rejected' && ws !== 'declined' &&
                   gs !== 'approved' && gs !== 'rejected' && gs !== 'declined';
        });
        
        const existingIds = new Set(allData.map((d: any) => d._id || d.id));
        pendingOuting.forEach((item: any) => {
            if (!existingIds.has(item._id || item.id)) {
                allData.push(item);
            }
        });
      } catch (err) {
          console.error("Failed to fetch all outpasses for outing filter", err);
      }
      const pendingData = allData.filter((item: any) => {
        const ws = item.wardenapprovalstatus?.toLowerCase() || "";
        const gs = item.status?.toLowerCase() || "";
        return ws !== 'approved' && ws !== 'rejected' && ws !== 'declined' &&
               gs !== 'approved' && gs !== 'rejected' && gs !== 'declined';
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
      if (res.data.pages !== undefined) {
        setTotalPages(res.data.pages);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to fetch pending outpasses");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (url: string | null) => {
    if (!url) return;
    const fullUrl = `${url}`;
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
      const src = studentPhoto.startsWith('data:')
        ? studentPhoto
        : `${studentPhoto}`;
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
              <div className="wd-search-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                <Search size={18} className="wd-search-icon" style={{ position: 'absolute', left: '16px', color: '#94A3B8' }} />

                <input
                  type="text"
                  placeholder="Search name, register no..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="wd-search-input"
                />
              </div>

              <div className="wd-dropdown-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                <Calendar size={18} className="wd-dropdown-icon" style={{ position: 'absolute', left: '14px', color: '#94A3B8' }} />
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
                <ChevronDown size={14} className="wd-dropdown-arrow" style={{ position: 'absolute', right: '14px', color: '#64748B', pointerEvents: 'none' }} />
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
              <span className="wd-empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={40} style={{ color: '#CBD5E1' }} /></span>
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
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={14} style={{ marginRight: '6px' }} /> View Document</span>

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
              {/* First */}
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="wd-page-btn"
              >
                « First
              </button>

              {/* Prev */}
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="wd-page-btn"
              >
                ← Prev
              </button>

              {/* Page Numbers */}
              <div className="wd-page-numbers">
                {getPageNumbers().map((pNum, idx) => {
                  if (pNum === '...') {
                    return <span key={`dots-${idx}`} className="wd-pnum-dots">...</span>;
                  }
                  return (
                    <button
                      key={`p-${pNum}`}
                      className={`wd-pnum-btn ${page === pNum ? 'active' : ''}`}
                      onClick={() => setPage(pNum as number)}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              {/* Next */}
              <button
                disabled={isLast}
                onClick={() => setPage((p) => p + 1)}
                className="wd-page-btn"
              >
                Next →
              </button>

              {/* Last */}
              <button
                disabled={isLast}
                onClick={() => setPage(totalPages)}
                className="wd-page-btn"
              >
                Last »
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
        /* ====== DESIGN TOKENS ====== */
        .wd-root {
          --wdl-primary:       #3B82F6;
          --wdl-primary-light: #60A5FA;
          --wdl-bg:            linear-gradient(180deg, #F8FBFF 0%, #EFF6FF 55%, #F6FAFF 100%);
          --wdl-card:          rgba(255, 255, 255, 0.90);
          --wdl-blur:          18px;
          --wdl-border:        1px solid rgba(255, 255, 255, 0.65);
          --wdl-shadow:        0 18px 50px rgba(59, 130, 246, 0.12);
          --wdl-radius:        28px;
          --wdl-radius-sm:     16px;
          --wdl-transition:    all 0.25s cubic-bezier(0.16,1,0.3,1);

          min-height: 100vh;
          background: var(--wdl-bg);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding-top: var(--nav-height, 64px);
          padding-bottom: calc(100px + env(safe-area-inset-bottom));
        }

        .wd-main {
          padding: 32px 40px;
          max-width: var(--content-max, 1400px);
          margin: 0 auto;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }

        .wd-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
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
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(59,130,246,0.15);
          color: var(--wdl-primary);
          font-size: 0.85rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 100px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59,130,246,0.08);
          transition: var(--wdl-transition);
          font-family: inherit;
          margin-bottom: 12px;
        }

        .wd-back-btn:hover {
          background: white;
          transform: translateX(-4px);
          box-shadow: 0 6px 16px rgba(59,130,246,0.12);
        }

        .wd-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }

        .wd-subtitle {
          font-size: 0.92rem;
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
          min-width: 280px;
        }

        .wd-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          font-size: 1rem;
        }

        .wd-search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          background: var(--wdl-card);
          backdrop-filter: blur(var(--wdl-blur));
          border: var(--wdl-border);
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #0F172A;
          outline: none;
          box-shadow: 0 4px 12px rgba(59,130,246,0.05);
          transition: var(--wdl-transition);
          box-sizing: border-box;
        }

        .wd-search-input:focus {
          border-color: var(--wdl-primary);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
          background: white;
        }

        .wd-dropdown-wrapper {
          position: relative;
        }

        .wd-dropdown-icon {
          position: absolute;
          left: 14px;
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
          padding: 12px 34px 12px 38px;
          background: var(--wdl-card);
          backdrop-filter: blur(var(--wdl-blur));
          border: var(--wdl-border);
          border-radius: 14px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
          outline: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59,130,246,0.05);
          appearance: none;
          min-width: 160px;
          transition: var(--wdl-transition);
        }

        .wd-filter-dropdown:focus, .wd-filter-dropdown:hover {
          border-color: var(--wdl-primary-light);
          background: white;
        }

        /* ====== CARDS GRID ====== */
        .wd-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }

        .wd-card {
          background: var(--wdl-card);
          backdrop-filter: blur(var(--wdl-blur));
          -webkit-backdrop-filter: blur(var(--wdl-blur));
          border: var(--wdl-border);
          border-radius: var(--wdl-radius);
          padding: 24px;
          box-shadow: var(--wdl-shadow);
          cursor: pointer;
          transition: var(--wdl-transition);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .wd-card:hover {
          transform: translateY(-6px);
          border-color: var(--wdl-primary);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.16);
        }

        .wd-card-emergency {
          border-left: 5px solid #EF4444;
        }

        .wd-card-emergency:hover {
          border-color: #EF4444;
          box-shadow: 0 20px 40px rgba(239, 68, 68, 0.14);
        }

        /* Card Header */
        .wd-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .wd-avatar-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(59,130,246,0.2);
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
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          font-weight: 700;
          font-size: 1.3rem;
        }

        .wd-student-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex-grow: 1;
        }

        .wd-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.2;
        }

        .wd-emergency-tag {
          font-size: 0.65rem;
          font-weight: 800;
          background: #FEF2F2;
          color: #EF4444;
          padding: 2px 7px;
          border-radius: 6px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .wd-reg-no {
          font-size: 0.82rem;
          font-weight: 600;
          color: #64748B;
        }

        .wd-dept {
          font-size: 0.8rem;
          font-weight: 500;
          color: #64748B;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .wd-year-tag {
          background: rgba(59,130,246,0.08);
          color: var(--wdl-primary);
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.68rem;
        }

        /* Card Body */
        .wd-card-body {
          background: rgba(248,250,252,0.8);
          border-radius: 14px;
          padding: 14px 16px;
          border: 1px solid rgba(226, 232, 240, 0.6);
          flex-grow: 1;
        }

        .wd-reason-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
        }

        .wd-reason-text {
          font-size: 0.86rem;
          color: #475569;
          font-weight: 500;
          margin: 0;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Card Meta */
        .wd-card-meta {
          border-top: 1px dashed rgba(226,232,240,0.8);
          padding-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .wd-meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.84rem;
        }

        .wd-meta-row .label {
          color: #64748B;
          font-weight: 600;
        }

        .wd-meta-row .value {
          font-weight: 700;
          color: #0F172A;
        }

        .wd-meta-row .type-badge {
          background: #EFF6FF;
          color: var(--wdl-primary);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
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
          gap: 10px;
          margin-top: auto;
        }

        .wd-btn-doc {
          flex: 1;
          padding: 10px 14px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          color: var(--wdl-primary);
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: var(--wdl-transition);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .wd-btn-doc:hover {
          background: rgba(59,130,246,0.15);
          border-color: var(--wdl-primary-light);
        }

        .wd-btn-review {
          flex: 1.4;
          padding: 10px 14px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          border: none;
          color: white;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: var(--wdl-transition);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 10px rgba(59,130,246,0.2);
        }

        .wd-btn-review svg {
          transition: transform 0.2s ease;
        }

        .wd-btn-review:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59,130,246,0.3);
        }

        .wd-btn-review:hover svg {
          transform: translateX(3px);
        }

        /* ====== EMPTY & LOADING STATE ====== */
        .wd-loading-wrap {
          text-align: center;
          padding: 80px 24px;
          background: var(--wdl-card);
          backdrop-filter: blur(var(--wdl-blur));
          border-radius: var(--wdl-radius);
          border: var(--wdl-border);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          box-shadow: var(--wdl-shadow);
        }

        .wd-spinner {
          width: 44px;
          height: 44px;
          border: 4px solid rgba(59,130,246,0.15);
          border-top-color: var(--wdl-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .wd-empty-state {
          text-align: center;
          padding: 90px 24px;
          background: var(--wdl-card);
          backdrop-filter: blur(var(--wdl-blur));
          border-radius: var(--wdl-radius);
          border: var(--wdl-border);
          box-shadow: var(--wdl-shadow);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .wd-empty-icon {
          font-size: 3.5rem;
          display: block;
          opacity: 0.5;
        }

        .wd-empty-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
        }

        .wd-empty-desc {
          font-size: 0.9rem;
          color: #64748B;
          margin: 0;
        }

        /* ====== PAGINATION ====== */
        .wd-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        .wd-page-numbers {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .wd-pnum-btn {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid rgba(59,130,246,0.2);
          background: var(--wdl-card);
          backdrop-filter: blur(var(--wdl-blur));
          color: var(--wdl-primary);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--wdl-transition);
          font-family: inherit;
        }

        .wd-pnum-btn:hover {
          background: rgba(59,130,246,0.1);
          border-color: var(--wdl-primary);
        }

        .wd-pnum-btn.active {
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(59,130,246,0.25);
        }

        .wd-pnum-dots {
          color: #94A3B8;
          font-weight: 700;
          padding: 0 4px;
          font-size: 0.9rem;
        }

        .wd-page-btn {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid rgba(59,130,246,0.2);
          background: var(--wdl-card);
          backdrop-filter: blur(var(--wdl-blur));
          color: var(--wdl-primary);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--wdl-transition);
          font-family: inherit;
        }

        .wd-page-btn:hover:not(:disabled) {
          background: rgba(59,130,246,0.1);
          border-color: var(--wdl-primary);
        }

        .wd-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(241,245,249,0.5);
          color: #94A3B8;
          border-color: rgba(226,232,240,0.5);
        }

        .wd-page-indicator {
          font-size: 0.88rem;
          color: #64748B;
        }

        /* ====== MODAL ====== */
        .wd-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .wd-modal-card {
          background: var(--wdl-card);
          backdrop-filter: blur(var(--wdl-blur));
          border: var(--wdl-border);
          border-radius: var(--wdl-radius);
          width: 100%;
          max-width: 900px;
          height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          overflow: hidden;
          animation: modalSlideUp 0.3s cubic-bezier(0.16,1,0.3,1);
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }

        .wd-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 28px;
          border-bottom: 1px solid rgba(226,232,240,0.6);
        }

        .wd-modal-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0F172A;
        }

        .wd-modal-close {
          background: rgba(241,245,249,0.8);
          border: none;
          color: #64748B;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: bold;
          transition: var(--wdl-transition);
        }

        .wd-modal-close:hover {
          background: #FEF2F2;
          color: #EF4444;
          transform: rotate(90deg);
        }

        .wd-modal-body {
          flex-grow: 1;
          background: rgba(248,250,252,0.5);
          overflow: auto;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wd-modal-iframe, .wd-modal-img {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          border: none;
          border-radius: 16px;
          object-fit: contain;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          background: white;
        }

        .wd-modal-footer {
          padding: 16px 28px;
          border-top: 1px solid rgba(226,232,240,0.6);
          display: flex;
          justify-content: flex-end;
        }

        .wd-btn-download {
          padding: 10px 24px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          border-radius: 12px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 700;
          transition: var(--wdl-transition);
          box-shadow: 0 4px 12px rgba(59,130,246,0.25);
        }

        .wd-btn-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59,130,246,0.3);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .sd-mono {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-weight: 600;
        }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 1024px) {
          .wd-main { padding: 24px; }
        }

        @media (max-width: 768px) {
          .wd-main { padding: 16px 16px 0; }
          .wd-header-row { flex-direction: column; align-items: stretch; gap: 16px; margin-bottom: 8px; }
          .wd-controls { flex-direction: column; align-items: stretch; gap: 12px; }
          .wd-search-wrapper { min-width: 100%; }
          .wd-filter-dropdown { width: 100%; }

          .wd-cards-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }
          
          .wd-card {
            padding: 20px;
          }
          
          .wd-card-actions .wd-btn-doc, .wd-card-actions .wd-btn-review {
            padding: 10px 12px;
            font-size: 0.75rem;
          }
        }
        
        @media (max-width: 480px) {
          .wd-title { font-size: 1.5rem; }
          .wd-card { padding: 16px; gap: 14px; }
          .wd-avatar-wrapper { width: 44px; height: 44px; }
          .wd-avatar-initials { font-size: 1.15rem; }
          .wd-name { font-size: 0.95rem; }
          .wd-reason-text { font-size: 0.82rem; }
          .wd-meta-row { font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
};

export default PendingOutpass;
