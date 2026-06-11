import React, { useEffect, useState } from 'react';
import StaffCard from '../../components/StaffCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentHeader from '../../components/StudentHeader';
import StudentBottomNav from '../../components/StudentBottomNav';

const Staffs: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [staffData, setStaffData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStaffList = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/staff/list`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    setStaffData(response.data.staff || []);
                }
            } catch (error: any) {
                console.error("Error fetching staff data:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStaffList();
    }, []);

    const filteredStaff = staffData.filter(staff => {
        const nameMatches = staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const subjectMatches = staff.subjects?.some((sub: string) => 
            sub.toLowerCase().includes(searchTerm.toLowerCase())
        ) || false;

        const matchesSearch = nameMatches || subjectMatches;
        const matchesFilter = filter === 'All' || (staff.designation && staff.designation.includes(filter));

        return matchesSearch && matchesFilter;
    });

    const designations = ['All', ...new Set(staffData.map(s => s.designation).filter(Boolean))];

    return (
        <div className="student-page staffs-directory-page animate-page-enter">

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
            <StudentHeader />

            <div className="content-wrapper">
                {/* Back Link & Header */}
                <div className="back-link-wrapper" style={{ marginBottom: '24px' }}>
                    <button className="btn-back" onClick={() => navigate('/dashboard')}>
                        <span className="icon">←</span> Back to Dashboard
                    </button>
                </div>

                <div className="directory-header-row">
                    <div className="header-text">
                        <h1>Faculty Directory</h1>
                        <p className="subtitle">Search and connect with the professors and instructors of JIT</p>
                    </div>

                    {/* Filter controls */}
                    <div className="controls-group">
                        <div className="search-bar" style={{ flex: 1, minWidth: '220px' }}>
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by name or subject..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="input designation-select"
                            style={{ maxWidth: '200px' }}
                        >
                            {designations.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="staffs-grid-layout">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card lux-skeleton" style={{ height: '240px', borderRadius: '16px' }}></div>
                        ))}
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="empty-state-card card">
                        <span className="empty-state-icon">👥</span>
                        <h3>No faculty found</h3>
                        <p>No staff matches your search query or designation filter. Try another keyword.</p>
                        <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setFilter('All'); }}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="staffs-grid-layout">
                        {filteredStaff.map((staff, index) => {
                            const staggerIndex = (index % 6) + 1;
                            return (
                                <div key={staff._id} className={`animate-stagger-${staggerIndex}`}>
                                    <StaffCard staff={staff} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view cred-page-bg">
                {/* Mobile Header */}
                <div className="mob-page-header">
                    <button className="mob-back-btn" onClick={() => navigate('/dashboard')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div className="mob-header-text">
                        <span className="cred-h2" style={{fontSize: '18px'}}>Faculty Directory</span>
                        <span className="cred-p" style={{fontSize: '12px'}}>{staffData.length} staff members</span>
                    </div>
                    <div style={{width:36}} />
                </div>

                {/* Search */}
                <div className="mob-search-bar animate-cred-enter cred-stagger-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cred-text-2)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                        type="text"
                        placeholder="Search by name or subject..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="mob-search-input"
                    />
                    {searchTerm && <button onClick={() => setSearchTerm('')} className="mob-search-clear">✕</button>}
                </div>

                <div className="mob-scroll-body">
                    {/* Designation Chips */}
                    <div className="mob-chip-scroll animate-cred-enter cred-stagger-2">
                        {designations.map(d => (
                            <button
                                key={d}
                                className={`mob-chip ${filter === d ? 'mob-chip-active' : ''}`}
                                onClick={() => setFilter(d)}
                            >{d}</button>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="cred-card" style={{ height: '80px', borderRadius: '16px' }}></div>
                            ))}
                        </div>
                    ) : filteredStaff.length === 0 ? (
                        <div className="cred-card mob-empty-card animate-cred-enter cred-stagger-3">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--cred-text-2)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            <span className="cred-p">No faculty found</span>
                            <button className="mob-btn-secondary" onClick={() => {setSearchTerm(''); setFilter('All');}}>Clear Filters</button>
                        </div>
                    ) : (
                        filteredStaff.map((staff, index) => {
                            const staggerIndex = (index % 5) + 1;
                            const photoUrl = staff.photo ? (staff.photo.startsWith('http') ? staff.photo : `${import.meta.env.VITE_CDN_URL || ''}${staff.photo}`) : null;
                            return (
                                <div key={staff._id} className={`cred-card mob-staff-card animate-cred-enter cred-stagger-${staggerIndex}`} onClick={() => navigate(`/staffs/${staff._id}`)  }>
                                    <div className="mob-staff-avatar">
                                        {photoUrl ? (
                                            <img src={photoUrl} alt={staff.name} onError={e => { e.currentTarget.style.display='none'; }} />
                                        ) : (
                                            <span>{staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}</span>
                                        )}
                                    </div>
                                    <div className="mob-staff-info">
                                        <span className="cred-h2" style={{fontSize: '15px'}}>{staff.name}</span>
                                        <span className="cred-gold-text" style={{fontSize: '12px', fontWeight: '600'}}>{staff.designation}</span>
                                        <span className="cred-p" style={{fontSize: '12px'}}>{staff.department}</span>
                                    </div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cred-text-2)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Bottom Nav */}
                <StudentBottomNav activeTab="staff" />
            </div>{/* end mobile */}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                /* ── DESKTOP VIEWS (RETAINED) ── */
                .staffs-directory-page { background: var(--bg); }
                .btn-back { background: none; border: none; color: var(--primary); font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--radius-sm); transition: var(--transition-fast); }
                .btn-back:hover { background: var(--primary-light); color: var(--primary-dark); }
                .directory-header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
                .directory-header-row h1 { font-size: 1.8rem; color: var(--text-1); margin: 0 0 6px 0; }
                .directory-header-row .subtitle { font-size: 0.95rem; color: var(--text-3); margin: 0; }
                .controls-group { display: flex; gap: 12px; flex-wrap: wrap; width: 100%; max-width: 550px; }
                .designation-select { height: 48px; border-radius: var(--radius-full); background-position: right 16px center; }
                .staffs-grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
                .empty-state-card { text-align: center; padding: var(--space-12) var(--space-6) !important; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; max-width: 480px; margin: 40px auto; }
                .empty-state-icon { font-size: 3rem; }
                .empty-state-card p { color: var(--text-3); font-size: 0.9rem; margin-bottom: 8px; }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { display: flex !important; flex-direction: column; min-height: 100vh; background: linear-gradient(135deg, #F7F3E6 0%, #E8EEF5 45%, #C8D9F2 100%); font-family: 'Inter', -apple-system, sans-serif; }
                }

                /* ==========================================
                   CRED PREMIUM MOBILE STYLES (STAFFS)
                   ========================================== */
                .mob-page-header { display:flex; align-items:center; gap:12px; padding:16px 16px 12px; background:rgba(255,255,255,0.85); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); position:sticky; top:0; z-index:50; border-bottom: 1px solid rgba(226,232,240,0.6); }
                .mob-back-btn { width:36px; height:36px; border-radius:10px; background:#FFFFFF; border:1px solid #E2E8F0; color:#1E293B; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:transform 0.2s; }
                .mob-back-btn:active { transform:scale(0.9); }
                .mob-header-text { flex:1; display: flex; flex-direction: column; }

                /* Search */
                .mob-search-bar { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.85); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); margin:16px 16px 0; border-radius:16px; padding:12px 14px; border:1px solid rgba(226,232,240,0.8); position:sticky; top:76px; z-index:40; box-shadow: 0 4px 16px rgba(15,23,42,0.08); }
                .mob-search-input { flex:1; border:none; background:none; font-size:15px; color:#0F172A; outline:none; font-family:inherit; }
                .mob-search-input::placeholder { color:#94A3B8; }
                .mob-search-clear { background:none; border:none; color:#94A3B8; cursor:pointer; font-size:14px; padding:0; }

                .mob-scroll-body { flex:1; overflow-y:auto; padding:16px 16px 100px; display:flex; flex-direction:column; gap:16px; }

                /* Chips */
                .mob-chip-scroll { display:flex; gap:12px; overflow-x:auto; padding-bottom:4px; margin-bottom: 8px; }
                .mob-chip { background:rgba(255,255,255,0.7); border:1px solid rgba(226,232,240,0.8); border-radius:24px; padding:8px 20px; font-size:13px; font-weight:600; color:#64748B; cursor:pointer; white-space:nowrap; flex-shrink:0; transition:all 0.2s; }
                .mob-chip-active { background:#FFFFFF; border-color:var(--cred-gold); color:var(--cred-gold); box-shadow: 0 4px 12px rgba(184,134,11,0.15); }

                /* Empty state */
                .mob-empty-card { padding:40px 20px; display:flex; flex-direction:column; align-items:center; gap:16px; }
                .mob-btn-secondary { background:var(--cred-surface-2); color:var(--cred-text); border:1px solid var(--cred-border); border-radius:12px; padding:12px 16px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:background 0.2s; display:flex; align-items:center; justify-content:center; gap:6px; flex:1; text-decoration:none; }
                
                .mob-staff-card { padding:16px; display:flex; align-items:center; gap:16px; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform 0.15s; }
                .mob-staff-card:active { transform:scale(0.98); }
                .mob-staff-avatar { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg, #1E3A8A, #0F172A); padding:2px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .mob-staff-avatar img { width:100%; height:100%; object-fit:cover; border-radius:50%; border:2px solid #FFFFFF; }
                .mob-staff-avatar span { color:white; font-size:20px; font-weight:800; display:flex; align-items:center; justify-content:center; width:100%; height:100%; border-radius:50%; border:2px solid #FFFFFF; background:#1E3A8A; }
                .mob-staff-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
                .cred-gold-text { color: var(--cred-gold); }

                .mob-bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px) saturate(150%); -webkit-backdrop-filter: blur(20px) saturate(150%); display: flex; justify-content: space-around; padding: 12px 8px calc(12px + env(safe-area-inset-bottom, 16px)); border-top: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.08); z-index: 1000; }
                .mob-nav-item { display:flex; flex-direction:column; align-items:center; gap:4px; color:#94A3B8; background:none; border:none; padding:4px 8px; min-width:56px; cursor:pointer; -webkit-tap-highlight-color:transparent; position:relative; transition:color 0.2s; }
                .mob-nav-active { color:#0F172A !important; }
                .mob-nav-active-bar { position:absolute; top:-10px; left:50%; transform:translateX(-50%); width:28px; height:3px; background:linear-gradient(90deg,#D4A017,#FBBF24); border-radius:0 0 4px 4px; }
                .mob-nav-lbl { font-size:11px; font-weight:600; }
            `}</style>
        </div>
    );
};

export default Staffs;
