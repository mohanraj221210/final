import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WardenNav from "../../components/WardenNav";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast, ToastContainer } from "react-toastify";

const OutpassList: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Approved' | 'Rejected'>('All');
  const [dateFilter, setDateFilter] = useState<'total' | 'today' | 'weekly' | 'monthly'>('total');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Home' | 'Outing' | 'OD' | 'Emergency'>('All');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'image' | 'pdf'>('image');
  const [searchTerm, setSearchTerm] = useState("");
  const [isLast, setIsLast] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showLateOnly, setShowLateOnly] = useState(false);

  const itemsPerPage = 8;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, dateFilter, typeFilter, showLateOnly]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const windowSize = 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - windowSize);
      let end = Math.min(totalPages - 1, currentPage + windowSize);

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
    fetchOutpasses();
  }, [debouncedSearchTerm, currentPage, filterStatus, dateFilter, typeFilter, showLateOnly]);

  const fetchOutpasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const statusParam = filterStatus === 'All' ? '' : filterStatus.toLowerCase();
      const filterParam = typeFilter === 'All' ? '' : typeFilter;

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/warden/outpass/list?search=${debouncedSearchTerm}&page=${currentPage}&appliedDate=${dateFilter}&status=${statusParam}&filter=${filterParam}&isLate=${showLateOnly}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const outpassData = res.data.outpasses || res.data.data || res.data || [];
      const list = Array.isArray(outpassData) ? outpassData : [];
      const sortedList = list.sort((a: any, b: any) => {
        // Priority 1: Emergency first
        const isAEmergency = (a.outpasstype || '').toLowerCase() === 'emergency';
        const isBEmergency = (b.outpasstype || '').toLowerCase() === 'emergency';
        if (isAEmergency && !isBEmergency) return -1;
        if (!isAEmergency && isBEmergency) return 1;

        // Priority 2: Date (Newest first)
        return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
      });
      setOutpasses(sortedList);
      setIsLast(res.data.isLast ?? true);
      if (res.data.pages !== undefined) {
        setTotalPages(res.data.pages);
      }
    } catch (err: any) {
      console.error("Failed to fetch outpasses", err);
      toast.error("Failed to fetch outpass records");
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = outpasses;

  const capitalize = (str: any) => {
    if (!str) return "Pending";
    const s = String(str);
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const getStatusBadgeClass = (status: string) => {
    switch ((status || 'pending').toLowerCase()) {
      case 'approved': return 'wd-status-approved';
      case 'rejected': return 'wd-status-rejected';
      default: return 'wd-status-pending';
    }
  };

  return (
    <div className="wd-root">
      <WardenNav />
      <ToastContainer position="bottom-right" />

      <main className="wd-main">
        <div className="wd-container">
          
          {/* Header row */}
          <div className="wd-header-row">
            <div>
              <button className="wd-back-btn" onClick={() => navigate("/warden-dashboard")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back to Dashboard
              </button>
              <h1 className="wd-title">Outpass Archive</h1>
              <p className="wd-subtitle">History of all processed student outpass clearances</p>
            </div>

            {/* Filter controls panel */}
            <div className="wd-controls">
              <div className="wd-search-wrapper">
                <span className="wd-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search name, register no..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="wd-search-input"
                />
              </div>

              <div className="wd-dropdown-wrapper">
                <span className="wd-dropdown-icon">📅</span>
                <select
                  className="wd-filter-dropdown"
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value as any); setCurrentPage(1); }}
                >
                  <option value="total">All Time</option>
                  <option value="today">Today</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                </select>
                <span className="wd-dropdown-arrow">▼</span>
              </div>

              <div className="wd-dropdown-wrapper">
                <span className="wd-dropdown-icon">🏷️</span>
                <select
                  className="wd-filter-dropdown"
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
                >
                  <option value="All">All Types</option>
                  <option value="Home">Home</option>
                  <option value="Outing">Outing</option>
                  <option value="OD">OD</option>
                  <option value="Emergency">Emergency</option>
                </select>
                <span className="wd-dropdown-arrow">▼</span>
              </div>

              {/* Late Returns Toggle Pill */}
              <button
                className={`wd-tab-pill ${showLateOnly ? 'active' : ''}`}
                onClick={() => setShowLateOnly(!showLateOnly)}
                style={showLateOnly ? { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' } : {}}
              >
                ⏰ {showLateOnly ? 'Showing Late Only' : 'Show Late'}
              </button>

              {/* Status Tab Filter Pills */}
              <div className="wd-tab-pills">
                {(['All', 'Approved', 'Rejected'] as const).map((status) => (
                  <button
                    key={status}
                    className={`wd-tab-pill ${filterStatus === status ? 'active' : ''}`}
                    onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="wd-table-card">
            {loading ? (
              <div className="wd-table-loading">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="wd-table-scroll">
                <table className="wd-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Student</th>
                      <th>Register No</th>
                      <th>Applied Date</th>
                      <th>Reason / Type</th>
                      <th>Status</th>
                      <th style={{ width: '200px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="wd-empty-cell">
                          <div className="wd-table-empty">
                            <span className="wd-empty-icon">📋</span>
                            <h3 className="wd-empty-title">No Outpasses Found</h3>
                            <p className="wd-empty-desc">No outpass logs matched your active search criteria.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentData.map((item, index) => {
                        const isEmergency = (item.outpasstype || '').toLowerCase().includes('emergency');
                        return (
                          <tr 
                            key={item._id || index} 
                            onClick={() => navigate(`/warden/student/${item._id}`)}
                            className={item.isLate ? 'wd-row-late' : ''}
                          >
                            <td><span className="sd-mono">{startIndex + index + 1}</span></td>
                            <td>
                              <div className="wd-student-cell">
                                <div className="wd-table-avatar">
                                  {item.student?.name ? item.student.name.charAt(0).toUpperCase() : "?"}
                                </div>
                                <span className="wd-name-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {item.student?.name || item.studentName || 'Unknown'}
                                  {item.isLate && (
                                    <span className="late-pulse-dot" title="Late Check-In logged" />
                                  )}
                                </span>
                              </div>
                            </td>
                            <td><span className="sd-mono">{item.student?.registerNumber || item.registerNumber || 'N/A'}</span></td>
                            <td>
                              <span className="wd-date-cell">
                                {new Date(item.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </td>
                            <td>
                              <div className="wd-reason-cell">
                                <span className={`wd-type-pill ${isEmergency ? 'emergency' : ''}`}>
                                  {item.outpasstype || 'General'}
                                </span>
                                {item.isLate && (
                                  <span className="wd-type-pill" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                                    LATE
                                  </span>
                                )}
                                <span className="wd-reason-text-cell">{item.reason}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`wd-status-badge ${getStatusBadgeClass(item.status)}`}>
                                {capitalize(item.status)}
                              </span>
                            </td>
                            <td>
                              <div className="wd-action-cell" onClick={(e) => e.stopPropagation()}>
                                <button
                                  className="wd-btn-view-rect"
                                  onClick={() => {
                                    navigate(`/warden/student/${item._id}`);
                                  }}
                                >
                                  View
                                </button>
                                {(item.proof || item.document || item.file) && (
                                  <button
                                    className="wd-btn-doc-rect"
                                    onClick={() => {
                                      const url = (item.proof || item.document || item.file)!;
                                      handleViewDocument(url);
                                    }}
                                  >
                                    Doc
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Cards List View */}
            {!loading && currentData.length > 0 && (
              <div className="wd-mobile-cards-view">
                {currentData.map((item, index) => {
                  const isEmergency = (item.outpasstype || '').toLowerCase().includes('emergency');
                  return (
                    <div
                      className={`wd-mobile-card ${item.isLate ? 'wd-card-late' : ''}`}
                      key={item._id || index}
                      onClick={() => navigate(`/warden/student/${item._id}`)}
                    >
                      <div className="wd-mobile-card-header">
                        <div className="wd-mobile-avatar">
                          {item.student?.name ? item.student.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <h3 className="wd-mobile-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {item.student?.name || item.studentName || 'Unknown'}
                            {item.isLate && (
                              <span className="late-pulse-dot" title="Late Check-In logged" />
                            )}
                          </h3>
                          <span className="wd-mobile-reg sd-mono">{item.student?.registerNumber || item.registerNumber || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span className={`wd-type-pill ${isEmergency ? 'emergency' : ''}`}>
                            {item.outpasstype || 'General'}
                          </span>
                          {item.isLate && (
                            <span className="wd-type-pill" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                              LATE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="wd-mobile-details">
                        <div className="wd-mobile-row">
                          <span className="label">Applied Date</span>
                          <span className="value">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="wd-mobile-row">
                          <span className="label">Reason</span>
                          <span className="value reason-truncate">{item.reason}</span>
                        </div>
                      </div>

                      <div className="wd-mobile-footer" onClick={(e) => e.stopPropagation()}>
                        <span className={`wd-status-badge ${getStatusBadgeClass(item.status)}`}>
                          {capitalize(item.status)}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {(item.proof || item.document || item.file) && (
                            <button
                              onClick={() => {
                                const url = (item.proof || item.document || item.file)!;
                                handleViewDocument(url);
                              }}
                              className="wd-btn-doc-rect"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              📄 Doc
                            </button>
                          )}
                          <button
                            className="wd-btn-view-rect"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              navigate(`/warden/student/${item._id}`);
                            }}
                          >
                            View →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && (outpasses.length > 0 || currentPage > 1) && (
            <div className="wd-pagination">
              {/* First */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="wd-page-btn"
              >
                « First
              </button>

              {/* Prev */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
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
                      className={`wd-pnum-btn ${currentPage === pNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pNum as number)}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              {/* Next */}
              <button
                disabled={isLast}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="wd-page-btn"
              >
                Next →
              </button>

              {/* Last */}
              <button
                disabled={isLast}
                onClick={() => setCurrentPage(totalPages)}
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
          padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
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
          min-width: 150px;
          transition: var(--wdl-transition);
        }

        .wd-filter-dropdown:focus, .wd-filter-dropdown:hover {
          border-color: var(--wdl-primary-light);
          background: white;
        }

        /* Status Tab Pills */
        .wd-tab-pills {
          display: flex;
          background: rgba(241,245,249,0.8);
          padding: 4px;
          border-radius: 12px;
          gap: 2px;
          border: 1px solid rgba(226,232,240,0.6);
        }

        .wd-tab-pill {
          padding: 9px 20px;
          border: none;
          background: transparent;
          color: #64748B;
          font-weight: 600;
          font-size: 0.84rem;
          cursor: pointer;
          border-radius: 9px;
          transition: var(--wdl-transition);
          font-family: inherit;
        }

        .wd-tab-pill:hover {
          color: #0F172A;
        }

        .wd-tab-pill.active {
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          box-shadow: 0 4px 12px rgba(59,130,246,0.25);
        }

        /* ====== TABLE CARD ====== */
        .wd-table-card {
          background: var(--wdl-card);
          backdrop-filter: blur(var(--wdl-blur));
          -webkit-backdrop-filter: blur(var(--wdl-blur));
          border: var(--wdl-border);
          border-radius: var(--wdl-radius);
          overflow: hidden;
          box-shadow: var(--wdl-shadow);
        }

        .wd-table-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .wd-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .wd-table th {
          background: rgba(248,250,252,0.8);
          padding: 16px 24px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1px solid rgba(226,232,240,0.6);
          white-space: nowrap;
        }

        .wd-table td {
          padding: 16px 24px;
          font-size: 0.88rem;
          color: #334155;
          border-bottom: 1px solid rgba(241,245,249,0.8);
          transition: background 0.15s ease;
        }

        .wd-table tbody tr {
          cursor: pointer;
        }

        .wd-table tbody tr:hover td {
          background: rgba(239,246,255,0.5);
        }

        .wd-table tbody tr:last-child td {
          border-bottom: none;
        }

        /* Student Cells */
        .wd-student-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wd-table-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(59,130,246,0.25);
          flex-shrink: 0;
        }

        .wd-name-cell {
          font-weight: 700;
          color: #0F172A;
        }

        .wd-date-cell {
          color: #64748B;
          font-weight: 500;
          font-size: 0.84rem;
        }

        /* Reason & Type Badging */
        .wd-reason-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 250px;
        }

        .wd-type-pill {
          display: inline-flex;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          background: #EFF6FF;
          color: var(--wdl-primary);
          width: fit-content;
          letter-spacing: 0.04em;
        }

        .wd-type-pill.emergency {
          background: #FEF2F2;
          color: #EF4444;
        }

        .wd-reason-text-cell {
          font-size: 0.82rem;
          color: #64748B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Status badges */
        .wd-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .wd-status-approved { background: rgba(16,185,129,0.1); color: #10B981; }
        .wd-status-pending  { background: rgba(245,158,11,0.1); color: #D97706; }
        .wd-status-rejected { background: rgba(239,68,68,0.1);  color: #EF4444; }

        /* Actions */
        .wd-action-cell {
          display: flex;
          gap: 8px;
        }

        .wd-btn-view-rect {
          padding: 6px 14px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: var(--wdl-transition);
          box-shadow: 0 2px 8px rgba(59,130,246,0.2);
        }

        .wd-btn-view-rect:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .wd-btn-doc-rect {
          padding: 6px 14px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          color: var(--wdl-primary);
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--wdl-transition);
        }

        .wd-btn-doc-rect:hover {
          background: rgba(59,130,246,0.15);
          border-color: var(--wdl-primary-light);
        }

        /* Empty Cell */
        .wd-empty-cell {
          text-align: center;
          padding: 80px 24px !important;
        }

        .wd-table-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .wd-empty-icon {
          font-size: 3.5rem;
          color: #94A3B8;
          opacity: 0.5;
        }

        .wd-empty-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
        }

        .wd-empty-desc {
          font-size: 0.9rem;
          color: #64748B;
          margin: 0;
        }

        /* ====== TABLE LOADING ====== */
        .wd-table-loading {
          padding: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* ====== PAGINATION ====== */
        .wd-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
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

        .sd-mono {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-weight: 600;
        }

        /* ====== RESPONSIVE ====== */
        .wd-mobile-cards-view { display: none; }

        @media (max-width: 1024px) {
          .wd-main { padding: 24px; }
        }

        @media (max-width: 968px) {
          .wd-main { padding: 16px 16px 0; }
          .wd-header-row { flex-direction: column; align-items: stretch; gap: 16px; margin-bottom: 8px; }
          .wd-controls { flex-direction: column; align-items: stretch; gap: 12px; }
          .wd-search-wrapper { min-width: 100%; }
          .wd-filter-dropdown { width: 100%; }
          
          .wd-tab-pills {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            justify-content: flex-start;
          }
          .wd-tab-pills::-webkit-scrollbar { display: none; }
          .wd-tab-pill { flex-shrink: 0; white-space: nowrap; }

          .wd-table { display: none; }
          .wd-table-card { background: transparent; box-shadow: none; border: none; padding: 0; }
          .wd-table-scroll { display: none; }

          /* Mobile Card */
          .wd-mobile-cards-view {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 24px;
          }

          .wd-mobile-card {
            background: var(--wdl-card);
            backdrop-filter: blur(var(--wdl-blur));
            border-radius: 20px;
            padding: 20px;
            border: var(--wdl-border);
            box-shadow: var(--wdl-shadow);
            cursor: pointer;
            transition: var(--wdl-transition);
          }

          .wd-mobile-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(59,130,246,0.15);
          }

          .wd-mobile-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            position: relative;
          }

          .wd-mobile-avatar {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
            color: white;
            font-weight: 700;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(59,130,246,0.25);
          }

          .wd-mobile-name {
            font-size: 1.05rem;
            font-weight: 800;
            color: #0F172A;
            margin: 0 0 2px;
          }

          .wd-mobile-reg {
            display: block;
            font-size: 0.8rem;
            color: #64748B;
          }

          .wd-mobile-card-header .wd-type-pill {
            position: absolute;
            right: 0;
            top: 0;
          }

          .wd-mobile-details {
            border-top: 1px dashed rgba(226,232,240,0.8);
            border-bottom: 1px dashed rgba(226,232,240,0.8);
            padding: 14px 0;
            margin-bottom: 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .wd-mobile-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
          }

          .wd-mobile-row .label { color: #64748B; font-weight: 600; }
          .wd-mobile-row .value { color: #0F172A; font-weight: 700; text-align: right; }
          .wd-mobile-row .reason-truncate {
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #475569;
          }

          .wd-mobile-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .wd-mobile-footer .wd-btn-view-rect, .wd-mobile-footer .wd-btn-doc-rect {
            padding: 8px 12px;
            font-size: 0.75rem;
          }
        }
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

        .sd-mono {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-weight: 600;
        }

        /* ====== RESPONSIVE ====== */
        .wd-mobile-cards-view { display: none; }

        @media (max-width: 1024px) {
          .wd-main { padding: 24px; }
        }

        @media (max-width: 968px) {
          .wd-main { padding: 16px 16px 0; }
          .wd-header-row { flex-direction: column; align-items: stretch; gap: 16px; margin-bottom: 8px; }
          .wd-controls { flex-direction: column; align-items: stretch; gap: 12px; }
          .wd-search-wrapper { min-width: 100%; }
          .wd-filter-dropdown { width: 100%; }
          
          .wd-tab-pills {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            justify-content: flex-start;
          }
          .wd-tab-pills::-webkit-scrollbar { display: none; }
          .wd-tab-pill { flex-shrink: 0; white-space: nowrap; }

          .wd-table { display: none; }
          .wd-table-card { background: transparent; box-shadow: none; border: none; padding: 0; }
          .wd-table-scroll { display: none; }

          /* Mobile Card */
          .wd-mobile-cards-view {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 24px;
          }

          .wd-mobile-card {
            background: var(--wdl-card);
            backdrop-filter: blur(var(--wdl-blur));
            border-radius: 20px;
            padding: 20px;
            border: var(--wdl-border);
            box-shadow: var(--wdl-shadow);
            cursor: pointer;
            transition: var(--wdl-transition);
          }

          .wd-mobile-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(59,130,246,0.15);
          }

          .wd-mobile-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            position: relative;
          }

          .wd-mobile-avatar {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
            color: white;
            font-weight: 700;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(59,130,246,0.25);
          }

          .wd-mobile-name {
            font-size: 1.05rem;
            font-weight: 800;
            color: #0F172A;
            margin: 0 0 2px;
          }

          .wd-mobile-reg {
            display: block;
            font-size: 0.8rem;
            color: #64748B;
          }

          .wd-mobile-card-header .wd-type-pill {
            position: absolute;
            right: 0;
            top: 0;
          }

          .wd-mobile-details {
            border-top: 1px dashed rgba(226,232,240,0.8);
            border-bottom: 1px dashed rgba(226,232,240,0.8);
            padding: 14px 0;
            margin-bottom: 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .wd-mobile-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
          }

          .wd-mobile-row .label { color: #64748B; font-weight: 600; }
          .wd-mobile-row .value { color: #0F172A; font-weight: 700; text-align: right; }
          .wd-mobile-row .reason-truncate {
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #475569;
          }

          .wd-mobile-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .wd-mobile-footer .wd-btn-view-rect, .wd-mobile-footer .wd-btn-doc-rect {
            padding: 8px 12px;
            font-size: 0.75rem;
          }
        }
        
        @media (max-width: 480px) {
           .wd-mobile-row .reason-truncate { max-width: 140px; }
           .wd-mobile-avatar { width: 38px; height: 38px; font-size: 0.9rem; }
           .wd-mobile-name { font-size: 0.95rem; }
           .wd-title { font-size: 1.5rem; }
        }

        /* ====== LATE ROW & CARD HIGHLIGHTS ====== */
        .wd-row-late {
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.06) 0%, rgba(239, 68, 68, 0.01) 100%) !important;
          border-left: 5px solid #ef4444 !important;
        }
        .wd-row-late td {
          background: transparent !important;
          color: #991b1b !important;
        }
        .wd-row-late .wd-name-cell {
          color: #991b1b !important;
          font-weight: 700 !important;
        }
        .wd-row-late:hover td {
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%) !important;
        }
        
        .wd-mobile-card.wd-card-late {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%) !important;
          border: 2px solid rgba(239, 68, 68, 0.2) !important;
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.06) !important;
        }

        .late-pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #ef4444;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          animation: pulse-red 1.8s infinite;
        }

        @keyframes pulse-red {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }

        .wd-late-timestamp {
          font-size: 0.74rem;
          color: #dc2626;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }

        /* ====== LATE FILTER TOGGLE BTN ====== */
        .wd-late-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
          background: rgba(239, 68, 68, 0.04) !important;
          color: #dc2626 !important;
          font-weight: 700 !important;
        }
        .wd-late-toggle-btn:hover {
          background: rgba(239, 68, 68, 0.08) !important;
          color: #b91c1c !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
        }
        .wd-late-toggle-btn.active {
          background: linear-gradient(135deg, #ef4444, #b91c1c) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2) !important;
          border-color: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default OutpassList;
