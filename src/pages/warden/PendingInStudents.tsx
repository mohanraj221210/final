import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WardenNav from "../../components/WardenNav";
import { toast, ToastContainer } from "react-toastify";

const PendingInStudents: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLast, setIsLast] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  useEffect(() => {
    fetchPendingInStudents();
  }, [currentPage]);

  const fetchPendingInStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/warden/outpass/not/in?page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const outpassData = res.data.pendingIn || [];
      const list = Array.isArray(outpassData) ? outpassData : [];
      
      setOutpasses(list);
      setIsLast(res.data.isLast ?? true);
      if (res.data.pages !== undefined) {
        setTotalPages(res.data.pages);
      }
      if (res.data.count !== undefined) {
        setTotalCount(res.data.count);
      }
    } catch (err: any) {
      console.error("Failed to fetch pending in students", err);
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    return photoUrl.startsWith('http') || photoUrl.startsWith('data:')
      ? photoUrl
      : `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${photoUrl.replace(/^\//, '')}`;
  };

  const currentData = outpasses;

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
              <h1 className="wd-title">Pending In Students</h1>
              <p className="wd-subtitle">Students who have checked out but have not checked back in</p>
            </div>
            
            <div className="wd-controls">
                <div className="wd-count-badge">
                   Total Pending: {totalCount}
                </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="wd-table-card">
            <div className="wd-table-scroll">
              <table className="wd-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>Student</th>
                    <th>Register No</th>
                    <th>Outpass Type</th>
                    <th>Out Date/Time</th>
                    <th>Reason</th>
                    <th style={{ width: '120px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} style={{ cursor: 'default' }}>
                        <td><div className="wd-skeleton-cell cell-mono animate-shimmer" /></td>
                        <td>
                          <div className="wd-student-cell">
                            <div className="wd-skeleton-avatar animate-shimmer" />
                            <div className="wd-skeleton-cell cell-text animate-shimmer" />
                          </div>
                        </td>
                        <td><div className="wd-skeleton-cell cell-reg animate-shimmer" /></td>
                        <td><div className="wd-skeleton-cell cell-pill animate-shimmer" /></td>
                        <td><div className="wd-skeleton-cell cell-date animate-shimmer" /></td>
                        <td><div className="wd-skeleton-cell cell-reason animate-shimmer" /></td>
                        <td><div className="wd-skeleton-cell cell-btn animate-shimmer" /></td>
                      </tr>
                    ))
                  ) : currentData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="wd-empty-cell">
                        <div className="wd-table-empty">
                          <span className="wd-empty-icon">📋</span>
                          <h3 className="wd-empty-title">No Pending Records Found</h3>
                          <p className="wd-empty-desc">All checked-out students have returned to the hostel.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item, index) => {
                      const isEmergency = (item.outpasstype || '').toLowerCase().includes('emergency');
                      const avatar = getAvatarUrl(item.student?.photo);
                      const outDate = item.out ? new Date(item.out) : null;
                      
                      return (
                        <tr 
                          key={item._id || index} 
                          onClick={() => navigate(`/warden/student/${item._id}`)}
                        >
                          <td><span className="sd-mono">{(currentPage - 1) * 20 + index + 1}</span></td>
                          <td>
                            <div className="wd-student-cell">
                              {avatar ? (
                                  <img src={avatar} alt="Avatar" className="wd-table-avatar-img" />
                              ) : (
                                  <div className="wd-table-avatar">
                                    {item.student?.name ? item.student.name.charAt(0).toUpperCase() : "?"}
                                  </div>
                              )}
                              <span className="wd-name-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {item.student?.name || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td><span className="sd-mono">{item.student?.registerNumber || 'N/A'}</span></td>
                          <td>
                             <span className={`wd-type-pill ${isEmergency ? 'emergency' : ''}`}>
                               {item.outpasstype || 'General'}
                             </span>
                          </td>
                          <td>
                            <span className="wd-date-cell">
                              {outDate ? outDate.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              }) : 'N/A'}
                            </span>
                          </td>
                          <td>
                            <div className="wd-reason-cell">
                              <span className="wd-reason-text-cell">{item.reason}</span>
                            </div>
                          </td>
                          <td>
                            <div className="wd-action-cell" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="wd-btn-view-rect"
                                onClick={() => navigate(`/warden/student/${item._id}`)}
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List View */}
            {loading ? (
              <div className="wd-mobile-cards-view">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="wd-mobile-card wd-skeleton-card" style={{ cursor: 'default' }}>
                    <div className="wd-mobile-card-header">
                      <div className="wd-skeleton-avatar animate-shimmer" />
                      <div style={{ flexGrow: 1 }}>
                        <div className="wd-skeleton-cell cell-text animate-shimmer" style={{ marginBottom: '6px' }} />
                        <div className="wd-skeleton-cell cell-mono animate-shimmer" />
                      </div>
                      <div className="wd-skeleton-cell cell-pill animate-shimmer" />
                    </div>

                    <div className="wd-mobile-details">
                      <div className="wd-mobile-row">
                        <div className="wd-skeleton-cell cell-text short animate-shimmer" />
                        <div className="wd-skeleton-cell cell-text short animate-shimmer" />
                      </div>
                      <div className="wd-mobile-row" style={{ marginTop: '10px' }}>
                        <div className="wd-skeleton-cell cell-text short animate-shimmer" />
                        <div className="wd-skeleton-cell cell-text animate-shimmer" />
                      </div>
                    </div>

                    <div className="wd-mobile-footer" style={{ border: 'none', paddingTop: 0 }}>
                      <div style={{ flex: 1 }}></div>
                      <div className="wd-skeleton-cell cell-btn animate-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              currentData.length > 0 && (
                <div className="wd-mobile-cards-view">
                  {currentData.map((item, index) => {
                    const isEmergency = (item.outpasstype || '').toLowerCase().includes('emergency');
                    const avatar = getAvatarUrl(item.student?.photo);
                    const outDate = item.out ? new Date(item.out) : null;
                    
                    return (
                      <div
                        className="wd-mobile-card"
                        key={item._id || index}
                        onClick={() => navigate(`/warden/student/${item._id}`)}
                      >
                        <div className="wd-mobile-card-header">
                          {avatar ? (
                              <img src={avatar} alt="Avatar" className="wd-mobile-avatar-img" />
                          ) : (
                              <div className="wd-mobile-avatar">
                              {item.student?.name ? item.student.name.charAt(0).toUpperCase() : "?"}
                              </div>
                          )}
                          <div>
                            <h3 className="wd-mobile-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {item.student?.name || 'Unknown'}
                            </h3>
                            <span className="wd-mobile-reg sd-mono">{item.student?.registerNumber || 'N/A'}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <span className={`wd-type-pill ${isEmergency ? 'emergency' : ''}`}>
                              {item.outpasstype || 'General'}
                            </span>
                          </div>
                        </div>

                        <div className="wd-mobile-details">
                          <div className="wd-mobile-row">
                            <span className="label">Out Date/Time</span>
                            <span className="value">
                               {outDate ? outDate.toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                }) : 'N/A'}
                            </span>
                          </div>
                          <div className="wd-mobile-row">
                            <span className="label">Reason</span>
                            <span className="value reason-truncate">{item.reason}</span>
                          </div>
                        </div>

                        <div className="wd-mobile-footer" onClick={(e) => e.stopPropagation()}>
                          <div style={{ flex: 1 }}></div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="wd-btn-view-rect"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => navigate(`/warden/student/${item._id}`)}
                            >
                              View →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* Pagination */}
          {!loading && (outpasses.length > 0 || currentPage > 1) && (
            <div className="wd-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="wd-page-btn"
              >
                « First
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="wd-page-btn"
              >
                ← Prev
              </button>

              <div className="wd-page-numbers">
                {getPageNumbers().map((pNum, idx) => {
                  if (pNum === "...") {
                    return <span key={`dots-${idx}`} className="wd-pnum-dots">...</span>;
                  }
                  return (
                    <button
                      key={`p-${pNum}`}
                      className={`wd-pnum-btn ${currentPage === pNum ? "active" : ""}`}
                      onClick={() => setCurrentPage(pNum as number)}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={isLast}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="wd-page-btn"
              >
                Next →
              </button>

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

        .wd-count-badge {
            background: rgba(59, 130, 246, 0.1);
            color: #2563EB;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.9rem;
            border: 1px solid rgba(59, 130, 246, 0.2);
            box-shadow: 0 4px 10px rgba(59, 130, 246, 0.05);
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

        .wd-table-avatar, .wd-mobile-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(59,130,246,0.25);
        }

        .wd-table-avatar-img, .wd-mobile-avatar-img {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .wd-name-cell {
          font-weight: 600;
          color: #0F172A;
          white-space: nowrap;
        }

        .sd-mono {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #475569;
          font-size: 0.85rem;
          background: #F1F5F9;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #E2E8F0;
        }

        .wd-date-cell {
          font-weight: 500;
          color: #334155;
          white-space: nowrap;
        }

        .wd-reason-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .wd-type-pill {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(59,130,246,0.1);
          color: #2563EB;
          border: 1px solid rgba(59,130,246,0.2);
          width: max-content;
        }

        .wd-type-pill.emergency {
          background: #FEF2F2;
          color: #DC2626;
          border-color: #FCA5A5;
        }

        .wd-reason-text-cell {
          color: #64748B;
          font-size: 0.82rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          max-width: 280px;
        }

        .wd-action-cell {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .wd-btn-view-rect {
          background: white;
          border: 1px solid #E2E8F0;
          color: #3B82F6;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--wdl-transition);
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }

        .wd-btn-view-rect:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.08);
        }

        /* Mobile Cards (hidden on desktop) */
        .wd-mobile-cards-view {
          display: none;
          flex-direction: column;
          padding: 16px;
          gap: 16px;
          background: rgba(248,250,252,0.5);
        }

        .wd-mobile-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          cursor: pointer;
          transition: var(--wdl-transition);
        }

        .wd-mobile-card:active {
          transform: scale(0.98);
        }

        .wd-mobile-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .wd-mobile-name {
          margin: 0 0 4px;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0F172A;
        }

        .wd-mobile-reg {
          font-size: 0.75rem;
        }

        .wd-mobile-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #F8FAFC;
          padding: 14px;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .wd-mobile-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 0.85rem;
          gap: 16px;
        }

        .wd-mobile-row .label {
          color: #64748B;
          font-weight: 500;
          white-space: nowrap;
        }

        .wd-mobile-row .value {
          color: #1E293B;
          font-weight: 600;
          text-align: right;
        }

        .reason-truncate {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-weight: 400 !important;
          color: #475569 !important;
          text-align: left !important;
        }

        .wd-mobile-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #E2E8F0;
        }

        /* ====== EMPTY STATE ====== */
        .wd-table-loading {
          padding: 60px 0;
          display: flex;
          justify-content: center;
          background: white;
        }

        .wd-empty-cell {
          padding: 0 !important;
        }

        .wd-table-empty {
          padding: 80px 20px;
          text-align: center;
          background: white;
        }

        .wd-empty-icon {
          font-size: 3rem;
          opacity: 0.5;
          margin-bottom: 16px;
          display: block;
        }

        .wd-empty-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 8px;
        }

        .wd-empty-desc {
          color: #64748B;
          margin: 0;
          font-size: 0.95rem;
        }

        /* ====== PAGINATION ====== */
        .wd-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          padding-bottom: 20px;
        }

        .wd-page-btn {
          background: var(--wdl-card);
          border: var(--wdl-border);
          color: #475569;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--wdl-transition);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .wd-page-btn:not(:disabled):hover {
          background: white;
          color: var(--wdl-primary);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59,130,246,0.1);
        }

        .wd-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wd-page-numbers {
          display: flex;
          gap: 4px;
          background: var(--wdl-card);
          padding: 4px;
          border-radius: 14px;
          border: var(--wdl-border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .wd-pnum-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: var(--wdl-transition);
        }

        .wd-pnum-btn:hover:not(.active) {
          background: rgba(241,245,249,0.8);
          color: #0F172A;
        }

        .wd-pnum-btn.active {
          background: var(--wdl-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .wd-pnum-dots {
          width: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94A3B8;
          font-weight: 600;
        }

        /* ====== SKELETON LOADING ====== */
        .wd-skeleton-cell {
          height: 16px;
          background: #E2E8F0;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }

        .wd-skeleton-cell.cell-mono {
          width: 24px;
          height: 18px;
        }

        .wd-skeleton-cell.cell-text {
          width: 120px;
        }

        .wd-skeleton-cell.cell-text.short {
          width: 60px;
        }

        .wd-skeleton-cell.cell-reg {
          width: 100px;
        }

        .wd-skeleton-cell.cell-pill {
          width: 70px;
          height: 22px;
          border-radius: 100px;
        }

        .wd-skeleton-cell.cell-date {
          width: 130px;
        }

        .wd-skeleton-cell.cell-reason {
          width: 200px;
        }

        .wd-skeleton-cell.cell-btn {
          width: 60px;
          height: 28px;
          border-radius: 8px;
        }

        .wd-skeleton-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #E2E8F0;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        .animate-shimmer::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.6) 20%,
            rgba(255, 255, 255, 0.8) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.6s infinite;
          content: '';
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 1024px) {
          .wd-table-scroll { display: none; }
          .wd-mobile-cards-view { display: flex; }
        }

        @media (max-width: 768px) {
          .wd-main { padding: 20px 16px; }
          .wd-header-row { flex-direction: column; align-items: flex-start; gap: 16px; }
          .wd-title { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default PendingInStudents;
