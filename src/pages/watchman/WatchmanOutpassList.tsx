import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WatchmanNav from "../../components/WatchmanNav";
import LoadingSpinner from "../../components/LoadingSpinner";

const WatchmanOutpassList: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'This Week' | 'This Month'>('All');
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const itemsPerPage = 8;

  // Debounce search input to limit API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchOutpasses(dateFilter, debouncedSearch);
  }, [dateFilter, debouncedSearch]);

  const fetchOutpasses = async (filterVal: string, searchVal: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      let backendAppliedDate = 'total';
      if (filterVal === 'Today') backendAppliedDate = 'today';
      else if (filterVal === 'This Week') backendAppliedDate = 'weekly';
      else if (filterVal === 'This Month') backendAppliedDate = 'monthly';

      params.append('appliedDate', backendAppliedDate);
      if (searchVal.trim()) {
        params.append('search', searchVal.trim());
      }

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/watchman/outpass/list?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const outpassData = res.data.outpass || [];

      const approvedOutpasses = outpassData
        .filter((item: any) => {
          if (!item.studentid) return false; // Filter out populated null students due to backend search match
          const resType = (item.studentid.residencetype || '').toLowerCase().trim().replace(/\s/g, '');
          const isDayScholar = resType === 'dayscholar';
          const isHostelEmergency = item.outpasstype === 'HostelEmergency';

          if (isHostelEmergency) {
            return item.status === 'approved';
          }
          if (isDayScholar) {
            return item.yearincharge?.status === 'approved';
          }
          return item.warden?.status === 'approved';
        })
        .sort((a: any, b: any) => {
          const isAEmergency = a.outpasstype?.toLowerCase().includes('emergency');
          const isBEmergency = b.outpasstype?.toLowerCase().includes('emergency');
          if (isAEmergency && !isBEmergency) return -1;
          if (!isAEmergency && isBEmergency) return 1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

      setOutpasses(approvedOutpasses);
    } catch (err: any) {
      console.error("Failed to fetch outpasses", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch ((status || 'pending').toLowerCase()) {
      case 'approved': return 'sd-status-approved';
      case 'rejected': return 'sd-status-rejected';
      default: return 'sd-status-pending';
    }
  };

  const totalPages = Math.ceil(outpasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = outpasses.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="sd-root">
      <WatchmanNav />

      <main className="sd-main">
        <div className="sd-container">
          
          {/* Header Row */}
          <div className="sd-header-row">
            <div>
              <button className="sd-back-btn" onClick={() => navigate("/watchman-dashboard")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back to Dashboard
              </button>
              <h1 className="sd-title">Approved Outpass List</h1>
              <p className="sd-subtitle">Verify and monitor student gate activity logs</p>
            </div>

            {/* Filter and Search Controls */}
            <div className="sd-controls">
              <div className="sd-search-wrapper">
                <span className="sd-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search name, register no..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="sd-search-input"
                />
              </div>

              {/* Desktop Filters */}
              <div className="sd-filter-tabs desktop-only">
                {['All', 'Today', 'This Week', 'This Month'].map((filter) => (
                  <button
                    key={filter}
                    className={`sd-filter-btn ${dateFilter === filter ? 'sd-filter-active' : ''}`}
                    onClick={() => { setDateFilter(filter as any); setCurrentPage(1); }}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Mobile Filters Dropdown */}
              <div className="mobile-only sd-dropdown-wrapper">
                <span className="sd-dropdown-icon">📅</span>
                <select
                  className="sd-filter-dropdown"
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value as any); setCurrentPage(1); }}
                >
                  {['All', 'Today', 'This Week', 'This Month'].map((filter) => (
                    <option key={filter} value={filter}>{filter}</option>
                  ))}
                </select>
                <span className="sd-dropdown-arrow">▼</span>
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="sd-table-card">
            <div className="sd-table-scroll">
              <table className="sd-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>Name</th>
                    <th>Register No</th>
                    <th>Dept / Year</th>
                    <th>Pass Type</th>
                    <th>Outpass Date</th>
                    <th style={{ width: '280px' }}>Approval Hierarchy</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="sd-empty-cell">
                        <div className="sd-empty-state">
                          <span className="sd-empty-icon">📋</span>
                          <h3 className="sd-empty-title">No Approved Outpasses</h3>
                          <p className="sd-empty-desc">No approved student outpasses match your filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item, index) => (
                      <tr key={item._id || index} onClick={() => navigate(`/watchman/student/${item._id}`)}>
                        <td><span className="sd-mono">{startIndex + index + 1}</span></td>
                        <td>
                          <div className="sd-student-cell">
                            <div className="sd-avatar-placeholder">
                              {item.studentid?.name ? item.studentid.name.charAt(0).toUpperCase() : "?"}
                            </div>
                            <span className="sd-name">{item.studentid?.name || "N/A"}</span>
                          </div>
                        </td>
                        <td><span className="sd-mono">{item.studentid?.registerNumber || "N/A"}</span></td>
                        <td>
                          <div style={{ fontWeight: 500 }}>
                            {item.studentid?.department || "-"}
                            <span className="sd-year-tag">Yr {item.studentid?.year || "-"}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`sd-type-badge ${item.outpasstype?.toLowerCase().includes('emergency') ? 'emergency' : ''}`}>
                            {item.outpasstype || "General"}
                          </span>
                        </td>
                        <td>
                          <span className="sd-date">
                            {new Date(item.createdAt || item.outDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td>
                          <div className="sd-status-stack">
                            <span className={`sd-status-badge ${getStatusBadgeClass(item.staff?.status)}`}>
                              Staff: {item.staff?.status || 'pending'}
                            </span>
                            <span className={`sd-status-badge ${getStatusBadgeClass(item.yearincharge?.status)}`}>
                              Incharge: {item.yearincharge?.status || 'pending'}
                            </span>
                            {(item.studentid?.residencetype || '').toLowerCase().trim().replace(/\s/g, '') !== 'dayscholar' && (
                              <span className={`sd-status-badge ${getStatusBadgeClass(item.warden?.status)}`}>
                                Warden: {item.warden?.status || 'pending'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List View */}
            {!loading && currentData.length > 0 && (
              <div className="mobile-cards-view">
                {currentData.map((item, index) => (
                  <div 
                    className="sd-mobile-card" 
                    key={item._id || index}
                    onClick={() => navigate(`/watchman/student/${item._id}`)}
                  >
                    <div className="sd-mobile-card-header">
                      <div className="sd-mobile-avatar">
                        {item.studentid?.name ? item.studentid.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <h3 className="sd-mobile-name">{item.studentid?.name || "Student"}</h3>
                        <span className="sd-mobile-reg sd-mono">{item.studentid?.registerNumber || "N/A"}</span>
                      </div>
                      <span className={`sd-type-badge ${item.outpasstype?.toLowerCase().includes('emergency') ? 'emergency' : ''}`}>
                        {item.outpasstype || "General"}
                      </span>
                    </div>

                    <div className="sd-mobile-details">
                      <div className="sd-mobile-row">
                        <span className="label">Dept / Year</span>
                        <span className="value">{item.studentid?.department || "-"} (Yr {item.studentid?.year || "-"})</span>
                      </div>
                      <div className="sd-mobile-row">
                        <span className="label">Date Applied</span>
                        <span className="value">{new Date(item.createdAt || item.outDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="sd-mobile-footer">
                      <div className="sd-status-stack-horizontal">
                        <span className={`sd-status-badge ${getStatusBadgeClass(item.staff?.status)}`}>
                          Staff: {item.staff?.status || 'pnd'}
                        </span>
                        <span className={`sd-status-badge ${getStatusBadgeClass(item.yearincharge?.status)}`}>
                          Incharge: {item.yearincharge?.status || 'pnd'}
                        </span>
                        {(item.studentid?.residencetype || '').toLowerCase().trim().replace(/\s/g, '') !== 'dayscholar' && (
                          <span className={`sd-status-badge ${getStatusBadgeClass(item.warden?.status)}`}>
                            Warden: {item.warden?.status || 'pnd'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && outpasses.length > itemsPerPage && (
            <div className="sd-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="sd-page-btn"
              >
                ← Prev
              </button>

              <span className="sd-page-indicator">
                Page <strong>{currentPage}</strong> of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="sd-page-btn"
              >
                Next →
              </button>
            </div>
          )}

        </div>
      </main>

      <style>{`
        /* ====== LAYOUT & BASE ====== */
        .sd-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 45%, #DBEAFE 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding-top: var(--nav-height, 64px);
          padding-bottom: 80px;
        }

        .sd-main {
          padding: 24px 32px;
          max-width: var(--content-max, 1280px);
          margin: 0 auto;
        }

        .sd-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ====== HEADER ROW ====== */
        .sd-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 20px;
        }

        .sd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #E2E8F0;
          color: #3B82F6;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 100px;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .sd-back-btn:hover {
          background: #EFF6FF;
          transform: translateX(-4px);
          box-shadow: 0 6px 12px rgba(59, 130, 246, 0.08);
        }

        .sd-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0F172A;
          margin: 12px 0 4px;
          letter-spacing: -0.02em;
        }

        .sd-subtitle {
          font-size: 0.9rem;
          color: #64748B;
          margin: 0;
          font-weight: 500;
        }

        /* ====== CONTROLS (SEARCH & FILTERS) ====== */
        .sd-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .sd-search-wrapper {
          position: relative;
          min-width: 260px;
        }

        .sd-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          font-size: 0.95rem;
        }

        .sd-search-input {
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

        .sd-search-input:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .sd-filter-tabs {
          display: flex;
          background: #F1F5F9;
          padding: 4px;
          border-radius: 12px;
          gap: 2px;
          border: 1px solid rgba(226,232,240,0.5);
        }

        .sd-filter-btn {
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

        .sd-filter-btn:hover {
          color: #0f172a;
        }

        .sd-filter-btn.sd-filter-active {
          background: white;
          color: #3B82F6;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        /* ====== GLASS TABLE CARD ====== */
        .sd-table-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(226,232,240,0.5);
        }

        .sd-table-scroll {
          overflow-x: auto;
        }

        .sd-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .sd-table th {
          background: #F8FAFC;
          padding: 16px 24px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1px solid #E2E8F0;
        }

        .sd-table td {
          padding: 16px 24px;
          font-size: 0.88rem;
          color: #334155;
          border-bottom: 1px solid #F1F5F9;
          transition: background 0.15s ease;
        }

        .sd-table tbody tr {
          cursor: pointer;
        }

        .sd-table tbody tr:hover td {
          background: #F8FAFC;
        }

        .sd-table tbody tr:last-child td {
          border-bottom: none;
        }

        /* ====== TABLE SUB-COMPONENTS ====== */
        .sd-student-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sd-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
          color: white;
          font-weight: 700;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(59,130,246,0.25);
        }

        .sd-name {
          font-weight: 600;
          color: #0F172A;
        }

        .sd-mono {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-weight: 600;
          color: #64748B;
          font-size: 0.82rem;
        }

        .sd-year-tag {
          display: inline-block;
          margin-left: 6px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.65rem;
          background: #F1F5F9;
          color: #475569;
          font-weight: 700;
        }

        .sd-type-badge {
          display: inline-flex;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          background: #EFF6FF;
          color: #3B82F6;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .sd-type-badge.emergency {
          background: #FEF2F2;
          color: #EF4444;
        }

        .sd-date {
          color: #475569;
          font-weight: 500;
        }

        /* ====== STATUS PILLS ====== */
        .sd-status-stack {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sd-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          width: fit-content;
          border: 1px solid transparent;
        }

        .sd-status-approved { background: #ECFDF5; color: #10B981; border-color: rgba(16, 185, 129, 0.15); }
        .sd-status-pending  { background: #FFFBEB; color: #D97706; border-color: rgba(217, 119, 6, 0.15); }
        .sd-status-rejected { background: #FEF2F2; color: #EF4444; border-color: rgba(239, 68, 68, 0.15); }

        /* Empty State */
        .sd-empty-cell {
          text-align: center;
          padding: 64px 24px !important;
        }

        .sd-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .sd-empty-icon {
          font-size: 3rem;
          color: #CBD5E1;
        }

        .sd-empty-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #334155;
          margin: 0;
        }

        .sd-empty-desc {
          font-size: 0.85rem;
          color: #94A3B8;
          margin: 0;
          max-width: 280px;
        }

        /* ====== PAGINATION ====== */
        .sd-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
        }

        .sd-page-btn {
          padding: 8px 18px;
          border-radius: 10px;
          border: 1px solid rgba(59,130,246,0.15);
          background: #EFF6FF;
          color: #3B82F6;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .sd-page-btn:hover:not(:disabled) {
          background: #3B82F6;
          color: white;
          box-shadow: 0 4px 10px rgba(59,130,246,0.2);
        }

        .sd-page-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          background: #F1F5F9;
          color: #94A3B8;
          border-color: #E2E8F0;
        }

        .sd-page-indicator {
          font-size: 0.88rem;
          color: #64748B;
        }

        /* ====== RESPONSIVE ====== */
        .mobile-only { display: none; }
        .mobile-cards-view { display: none; }

        @media (max-width: 968px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }

          .sd-header-row {
            align-items: stretch;
            flex-direction: column;
          }

          .sd-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .sd-search-wrapper {
            min-width: 100%;
          }

          .sd-dropdown-wrapper {
            position: relative;
          }

          .sd-dropdown-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.95rem;
            pointer-events: none;
          }

          .sd-dropdown-arrow {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.7rem;
            color: #64748B;
            pointer-events: none;
          }

          .sd-filter-dropdown {
            width: 100%;
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
          }

          .sd-table {
            display: none;
          }

          .sd-table-card {
            background: transparent;
            box-shadow: none;
            border: none;
          }

          .mobile-cards-view {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .sd-mobile-card {
            background: white;
            border-radius: 20px;
            padding: 20px;
            border: 1px solid rgba(226, 232, 240, 0.7);
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .sd-mobile-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59,130,246,0.05);
          }

          .sd-mobile-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 14px;
          }

          .sd-mobile-avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
            color: white;
            font-weight: 700;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
          }

          .sd-mobile-name {
            font-size: 0.95rem;
            font-weight: 700;
            color: #0F172A;
            margin: 0 0 2px;
          }

          .sd-mobile-reg {
            display: block;
            font-size: 0.78rem;
          }

          .sd-mobile-details {
            border-top: 1px dashed #F1F5F9;
            border-bottom: 1px dashed #F1F5F9;
            padding: 12px 0;
            margin-bottom: 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .sd-mobile-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.82rem;
          }

          .sd-mobile-row .label {
            color: #64748B;
            font-weight: 500;
          }

          .sd-mobile-row .value {
            color: #334155;
            font-weight: 600;
            text-align: right;
          }

          .sd-status-stack-horizontal {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default WatchmanOutpassList;
