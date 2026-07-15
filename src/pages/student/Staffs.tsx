import React, { useEffect, useState } from 'react';
import StaffCard from '../../components/StaffCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import StudentHeader from '../../components/StudentHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
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
        <div className="pb-staffs-page">

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
                <StudentHeader />
                <main className="student-content">
                    <div className="content-wrapper">
                        {/* Back Link & Header */}
                        <div className="pb-back-link-wrapper">
                            <button className="pb-btn-back" onClick={() => navigate('/dashboard')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back to Dashboard
                            </button>
                        </div>

                        <div className="pb-directory-header-row">
                            <div className="pb-header-text">
                                <h1 className="pb-page-title">Faculty Directory</h1>
                                <p className="pb-page-subtitle">Search and connect with the professors and instructors of JIT</p>
                            </div>

                            {/* Filter controls */}
                            <div className="pb-controls-group">
                                <div className="pb-search-bar">
                                    <span className="pb-search-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search by name or subject..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pb-search-input"
                                    />
                                </div>

                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="pb-select pb-designation-select"
                                >
                                    {designations.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <LoadingSpinner />
                        ) : filteredStaff.length === 0 ? (
                            <div className="pb-empty-state-card">
                                <div className="pb-empty-state-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <h3>No faculty found</h3>
                                <p>No staff matches your search query or designation filter. Try another keyword.</p>
                                <button className="pb-clear-btn" onClick={() => { setSearchTerm(''); setFilter('All'); }}>
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="pb-staffs-grid-layout">
                                {filteredStaff.map((staff, index) => {
                                    const staggerIndex = (index % 6) + 1;
                                    return (
                                        <div key={staff._id} className={`pb-animate-stagger-${staggerIndex}`}>
                                            <StaffCard staff={staff} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view">
                {/* Mobile Header */}
                <div className="pb-mob-page-header">
                    <button className="pb-mob-back-btn" onClick={() => navigate('/dashboard')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div className="pb-mob-header-text">
                        <span className="pb-mob-header-title">Faculty Directory</span>
                        <span className="pb-mob-header-subtitle">{staffData.length} staff members</span>
                    </div>
                    <div style={{width:36}} />
                </div>

                {/* Search */}
                <div className="pb-mob-search-bar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or subject..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pb-mob-search-input"
                    />
                    {searchTerm && <button onClick={() => setSearchTerm('')} className="pb-mob-search-clear">✕</button>}
                </div>

                <div className="pb-mob-scroll-body">
                    {/* Designation Chips */}
                    <div className="pb-mob-chip-scroll">
                        {designations.map(d => (
                            <button
                                key={d}
                                className={`pb-mob-chip ${filter === d ? 'active' : ''}`}
                                onClick={() => setFilter(d)}
                            >{d}</button>
                        ))}
                    </div>

                    {loading ? (
                        <LoadingSpinner />
                    ) : filteredStaff.length === 0 ? (
                        <div className="pb-mob-empty-card">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                            </svg>
                            <span>No faculty found</span>
                            <button className="pb-mob-clear-btn" onClick={() => {setSearchTerm(''); setFilter('All');}}>Clear Filters</button>
                        </div>
                    ) : (
                        filteredStaff.map((staff, index) => {
                            const staggerIndex = (index % 5) + 1;
                            const photoUrl = staff.photo ? staff.photo : null;
                            return (
                                <div key={staff._id} className={`pb-mob-staff-card pb-animate-stagger-${staggerIndex}`} onClick={() => navigate(`/staffs/${staff._id}`)  }>
                                    <div className="pb-mob-staff-avatar-ring">
                                        <div className="pb-mob-staff-avatar-wrapper">
                                            {photoUrl ? (
                                                <img src={photoUrl} alt={staff.name} onError={e => { e.currentTarget.style.display='none'; }} className="pb-mob-staff-avatar-img" />
                                            ) : (
                                                <span className="pb-mob-staff-avatar-initials">{staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pb-mob-staff-info">
                                        <span className="pb-mob-staff-name">{staff.name}</span>
                                        <span className="pb-mob-staff-designation">{staff.designation}</span>
                                        <span className="pb-mob-staff-dept">{staff.department}</span>
                                    </div>
                                    <div className="pb-mob-staff-arrow">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Bottom Nav */}
                <StudentBottomNav activeTab="staff" />
            </div>{/* end mobile */}

            <style>{`
                .pb-staffs-page {
                    min-height: 100vh;
                    background: var(--pb-bg);
                }
                .pb-page-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin: 0;
                    letter-spacing: -0.025em;
                }
                .pb-page-subtitle {
                    font-size: 0.9rem;
                    color: var(--pb-text-3);
                    margin: 4px 0 0 0;
                }

                .pb-directory-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                    gap: 20px;
                }
                .pb-controls-group {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    width: 100%;
                    max-width: 550px;
                }
                .pb-search-bar {
                    position: relative;
                    flex: 1;
                    min-width: 220px;
                    display: flex;
                    align-items: center;
                }
                .pb-search-icon {
                    position: absolute;
                    left: 14px;
                    color: var(--pb-text-4);
                    display: flex;
                    align-items: center;
                    pointer-events: none;
                }
                .pb-search-input {
                    width: 100%;
                    height: 44px;
                    padding-left: 40px;
                    padding-right: 14px;
                    border-radius: 12px;
                    border: 1.5px solid rgba(59, 130, 246, 0.12);
                    background: var(--pb-card);
                    color: var(--pb-text);
                    font-size: 0.88rem;
                    font-family: inherit;
                    outline: none;
                    transition: var(--pb-transition);
                    backdrop-filter: blur(20px);
                }
                .pb-search-input:focus {
                    border-color: var(--pb-primary);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
                    background: #fff;
                }
                .pb-designation-select {
                    max-width: 200px;
                    height: 44px;
                    border-radius: 12px;
                    border: 1.5px solid rgba(59, 130, 246, 0.12);
                    background: var(--pb-card);
                    color: var(--pb-text);
                    font-size: 0.88rem;
                    font-family: inherit;
                    outline: none;
                    transition: var(--pb-transition);
                    backdrop-filter: blur(20px);
                }
                .pb-designation-select:focus {
                    border-color: var(--pb-primary);
                    background: #fff;
                }

                .pb-staffs-grid-layout {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                }

                .pb-empty-state-card {
                    text-align: center;
                    padding: 48px 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    max-width: 480px;
                    margin: 40px auto;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                }
                .pb-empty-state-card h3 {
                    font-size: 1.15rem;
                    color: var(--pb-text);
                    margin: 0;
                }
                .pb-empty-state-card p {
                    color: var(--pb-text-3);
                    font-size: 0.88rem;
                    margin: 0;
                }
                .pb-empty-state-icon {
                    width: 56px;
                    height: 56px;
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    color: var(--pb-primary);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pb-clear-btn {
                    height: 38px;
                    padding: 0 18px;
                    border-radius: 10px;
                    border: none;
                    font-weight: 600;
                    font-size: 0.82rem;
                    color: var(--pb-primary);
                    background: var(--pb-secondary);
                    cursor: pointer;
                    margin-top: 8px;
                    transition: var(--pb-transition);
                }
                .pb-clear-btn:hover {
                    background: var(--pb-primary);
                    color: #fff;
                }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { display: flex !important; flex-direction: column; min-height: 100vh; background: var(--pb-bg); }
                }

                /* ==========================================
                   PREMIUM MOBILE STYLES (STAFFS)
                   ========================================== */
                .pb-mob-page-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.08);
                }
                .pb-mob-back-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #fff;
                    border: 1px solid rgba(59, 130, 246, 0.12);
                    color: var(--pb-text);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: transform 0.2s;
                }
                .pb-mob-back-btn:active { transform: scale(0.9); }
                .pb-mob-header-text {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .pb-mob-header-title {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    letter-spacing: -0.01em;
                }
                .pb-mob-header-subtitle {
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: var(--pb-text-4);
                }

                /* Search Mobile */
                .pb-mob-search-bar {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    margin: 16px 16px 0;
                    border-radius: 14px;
                    padding: 10px 14px;
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    position: sticky;
                    top: 76px;
                    z-index: 40;
                    box-shadow: var(--pb-shadow);
                    color: var(--pb-text-3);
                }
                .pb-mob-search-input {
                    flex: 1;
                    border: none;
                    background: none;
                    font-size: 0.88rem;
                    color: var(--pb-text);
                    outline: none;
                    font-family: inherit;
                }
                .pb-mob-search-input::placeholder { color: var(--pb-text-4); }
                .pb-mob-search-clear {
                    background: none;
                    border: none;
                    color: var(--pb-text-4);
                    cursor: pointer;
                    font-size: 0.8rem;
                    padding: 4px;
                }

                .pb-mob-scroll-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 16px 90px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                /* Mobile Chips */
                .pb-mob-chip-scroll {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                    scrollbar-width: none;
                }
                .pb-mob-chip-scroll::-webkit-scrollbar { display: none; }
                
                .pb-mob-chip {
                    background: rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(59, 130, 246, 0.1);
                    border-radius: 20px;
                    padding: 6px 14px;
                    font-size: 0.76rem;
                    font-weight: 600;
                    color: var(--pb-text-3);
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: all 0.2s;
                }
                .pb-mob-chip.active {
                    background: #fff;
                    border-color: var(--pb-primary);
                    color: var(--pb-primary);
                    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.1);
                }

                /* Empty state mobile */
                .pb-mob-empty-card {
                    padding: 40px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 14px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    color: var(--pb-text-3);
                }
                .pb-mob-empty-card span { font-size: 0.85rem; font-weight: 500; }
                .pb-mob-clear-btn {
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    border: none;
                    border-radius: 10px;
                    padding: 8px 16px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                }

                /* Mobile Staff Card */
                .pb-mob-staff-card {
                    padding: 14px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                    transition: transform 0.15s;
                }
                .pb-mob-staff-card:active { transform: scale(0.98); }
                .pb-mob-staff-avatar-ring {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-light));
                    padding: 2px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .pb-mob-staff-avatar-wrapper {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pb-mob-staff-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .pb-mob-staff-avatar-initials {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--pb-primary);
                    background: var(--pb-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                }
                
                .pb-mob-staff-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .pb-mob-staff-name {
                    font-size: 0.88rem;
                    font-weight: 800;
                    color: var(--pb-text);
                }
                .pb-mob-staff-designation {
                    font-size: 0.74rem;
                    font-weight: 700;
                    color: var(--pb-primary);
                }
                .pb-mob-staff-dept {
                    font-size: 0.72rem;
                    color: var(--pb-text-4);
                    font-weight: 500;
                }
                .pb-mob-staff-arrow {
                    color: var(--pb-text-4);
                    display: flex;
                    align-items: center;
                }

                /* ANIMATIONS */
                @keyframes pbFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .pb-animate-stagger-1 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.05s; }
                .pb-animate-stagger-2 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.1s; }
                .pb-animate-stagger-3 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.15s; }
                .pb-animate-stagger-4 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.2s; }
                .pb-animate-stagger-5 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.25s; }
                .pb-animate-stagger-6 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.3s; }
            `}</style>
        </div>
    );
};

export default Staffs;
