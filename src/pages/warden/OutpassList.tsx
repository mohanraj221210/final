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
  }, [filterStatus, dateFilter, typeFilter]);

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
  }, [debouncedSearchTerm, currentPage, filterStatus, dateFilter, typeFilter]);

  const fetchOutpasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const statusParam = filterStatus === 'All' ? '' : filterStatus.toLowerCase();
      const filterParam = typeFilter === 'All' ? '' : typeFilter;

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/warden/outpass/list?search=${debouncedSearchTerm}&page=${currentPage}&appliedDate=${dateFilter}&status=${statusParam}&filter=${filterParam}`,
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
    const fullUrl = `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
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
                          <tr key={item._id || index} onClick={() => navigate(`/warden/outpass/${item._id}`)}>
                            <td><span className="sd-mono">{startIndex + index + 1}</span></td>
                            <td>
                              <div className="wd-student-cell">
                                <div className="wd-table-avatar">
                                  {item.student?.name ? item.student.name.charAt(0).toUpperCase() : "?"}
                                </div>
                                <span className="wd-name-cell">{item.student?.name || item.studentName || 'Unknown'}</span>
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
                                    navigate(`/warden/outpass/${item._id}`);
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
                      className="wd-mobile-card"
                      key={item._id || index}
                      onClick={() => navigate(`/warden/outpass/${item._id}`)}
                    >
                      <div className="wd-mobile-card-header">
                        <div className="wd-mobile-avatar">
                          {item.student?.name ? item.student.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <h3 className="wd-mobile-name">{item.student?.name || item.studentName || 'Unknown'}</h3>
                          <span className="wd-mobile-reg sd-mono">{item.student?.registerNumber || item.registerNumber || 'N/A'}</span>
                        </div>
                        <span className={`wd-type-pill ${isEmergency ? 'emergency' : ''}`}>
                          {item.outpasstype || 'General'}
                        </span>
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
                              navigate(`/warden/outpass/${item._id}`);
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
          min-width: 140px;
        }

        .wd-filter-dropdown:focus {
          border-color: #0047AB;
        }

        /* Status Tab Pills */
        .wd-tab-pills {
          display: flex;
          background: #E2E8F0;
          padding: 4px;
          border-radius: 12px;
          gap: 2px;
          border: 1px solid rgba(226,232,240,0.5);
        }

        .wd-tab-pill {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #64748B;
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .wd-tab-pill:hover {
          color: #0f172a;
        }

        .wd-tab-pill.active {
          background: white;
          color: #0047AB;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        /* ====== TABLE CARD ====== */
        .wd-table-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(226,232,240,0.5);
        }

        .wd-table-scroll {
          overflow-x: auto;
        }

        .wd-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .wd-table th {
          background: #F8FAFC;
          padding: 16px 24px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1px solid #E2E8F0;
        }

        .wd-table td {
          padding: 16px 24px;
          font-size: 0.88rem;
          color: #334155;
          border-bottom: 1px solid #F1F5F9;
          transition: background 0.15s ease;
        }

        .wd-table tbody tr {
          cursor: pointer;
        }

        .wd-table tbody tr:hover td {
          background: #F8FAFC;
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
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0047AB 0%, #2563EB 100%);
          color: white;
          font-weight: 700;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 71, 171, 0.2);
        }

        .wd-name-cell {
          font-weight: 600;
          color: #0F172A;
        }

        .wd-date-cell {
          color: #475569;
          font-weight: 500;
        }

        /* Reason & Type Badging */
        .wd-reason-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 250px;
        }

        .wd-type-pill {
          display: inline-flex;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          background: #EFF6FF;
          color: #0047AB;
          width: fit-content;
          letter-spacing: 0.02em;
        }

        .wd-type-pill.emergency {
          background: #FEF2F2;
          color: #EF4444;
        }

        .wd-reason-text-cell {
          font-size: 0.8rem;
          color: #64748B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Status badges */
        .wd-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          border: 1px solid transparent;
        }

        .wd-status-approved { background: #ECFDF5; color: #10B981; border-color: rgba(16, 185, 129, 0.15); }
        .wd-status-pending  { background: #FFFBEB; color: #D97706; border-color: rgba(217, 119, 6, 0.15); }
        .wd-status-rejected { background: #FEF2F2; color: #EF4444; border-color: rgba(239, 68, 68, 0.15); }

        /* Actions */
        .wd-action-cell {
          display: flex;
          gap: 8px;
        }

        .wd-btn-view-rect {
          padding: 6px 12px;
          background: #0047AB;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wd-btn-view-rect:hover {
          background: #003682;
        }

        .wd-btn-doc-rect {
          padding: 6px 12px;
          background: #EFF6FF;
          border: 1px solid rgba(0, 71, 171, 0.15);
          color: #0047AB;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wd-btn-doc-rect:hover {
          background: #DBEAFE;
          border-color: #0047AB;
        }

        /* Empty Cell */
        .wd-empty-cell {
          text-align: center;
          padding: 64px 24px !important;
        }

        .wd-table-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .wd-empty-icon {
          font-size: 3rem;
          color: #CBD5E1;
        }

        .wd-empty-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #334155;
          margin: 0;
        }

        .wd-empty-desc {
          font-size: 0.85rem;
          color: #94A3B8;
          margin: 0;
        }

        /* ====== TABLE LOADING ====== */
        .wd-table-loading {
          padding: 64px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* ====== PAGINATION ====== */
        .wd-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
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
          border: 1px solid rgba(0, 71, 171, 0.15);
          background: #EFF6FF;
          color: #0047AB;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .wd-pnum-btn:hover {
          background: #0047AB;
          color: white;
          box-shadow: 0 4px 10px rgba(0, 71, 171, 0.15);
        }

        .wd-pnum-btn.active {
          background: #0047AB;
          color: white;
          border-color: #0047AB;
          box-shadow: 0 4px 10px rgba(0, 71, 171, 0.15);
        }

        .wd-pnum-dots {
          color: #94A3B8;
          font-weight: 700;
          padding: 0 4px;
          font-size: 0.9rem;
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

        .sd-mono {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-weight: 600;
        }

        /* ====== RESPONSIVE ====== */
        .wd-mobile-cards-view { display: none; }

        @media (max-width: 968px) {
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

          .wd-tab-pills {
            justify-content: space-between;
          }

          .wd-tab-pill {
            flex: 1;
            text-align: center;
          }

          .wd-table {
            display: none;
          }

          .wd-table-card {
            background: transparent;
            box-shadow: none;
            border: none;
          }

          /* Mobile Card */
          .wd-mobile-cards-view {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .wd-mobile-card {
            background: white;
            border-radius: 20px;
            padding: 20px;
            border: 1px solid rgba(226, 232, 240, 0.7);
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .wd-mobile-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 71, 171, 0.05);
          }

          .wd-mobile-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 14px;
            position: relative;
          }

          .wd-mobile-avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #0047AB 0%, #2563EB 100%);
            color: white;
            font-weight: 700;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
          }

          .wd-mobile-name {
            font-size: 0.95rem;
            font-weight: 700;
            color: #0F172A;
            margin: 0 0 2px;
          }

          .wd-mobile-reg {
            display: block;
            font-size: 0.78rem;
            color: #64748B;
          }

          .wd-mobile-card-header .wd-type-pill {
            position: absolute;
            right: 0;
            top: 0;
          }

          .wd-mobile-details {
            border-top: 1px dashed #F1F5F9;
            border-bottom: 1px dashed #F1F5F9;
            padding: 12px 0;
            margin-bottom: 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .wd-mobile-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.82rem;
          }

          .wd-mobile-row .label {
            color: #64748B;
            font-weight: 500;
          }

          .wd-mobile-row .value {
            color: #334155;
            font-weight: 600;
            text-align: right;
          }

          .wd-mobile-row .reason-truncate {
            max-width: 180px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .wd-mobile-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default OutpassList;
