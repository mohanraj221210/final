import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WardenNav from "../../components/WardenNav";
import LoadingSpinner from "../../components/LoadingSpinner";

const WardenEmergencyOutpassList: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [outpasses, setOutpasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');

    const itemsPerPage = 8;

    useEffect(() => {
        fetchEmergencyOutpasses();
    }, []);

    const fetchEmergencyOutpasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/warden/hostel/emergency/outpass/list`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const outpassData = response.data.outpasses || [];
            const sortedList = outpassData.sort((a: any, b: any) => {
                return new Date(b.createdAt || b.fromDate || Date.now()).getTime() - new Date(a.createdAt || a.fromDate || Date.now()).getTime();
            });

            setOutpasses(sortedList);
        } catch (error: any) {
            console.error('Failed to fetch emergency outpasses', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOutpasses = outpasses.filter(item => {
        let matchesDate = true;
        if (dateFilter !== 'all') {
            const appliedDate = new Date(item.createdAt || item.fromDate || Date.now());
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

                    <div className="filter-tabs">
                        <div style={{ position: 'relative', display: 'inline-block', marginRight: '10px' }}>
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
                            className="apply-emergency-btn"
                            onClick={() => navigate('/warden/apply-emergency')}
                        >
                            + Apply Emergency
                        </button>
                    </div>
                </div>

                <h1>Hostel Emergency Outpasses</h1>

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
                                    <th>Emergency Reason</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="no-data-cell" style={{ textAlign: "center", padding: "20px" }}>
                                            No emergency outpasses found
                                        </td>
                                    </tr>
                                ) : (
                                    currentData.map((item, index) => (
                                        <tr key={item._id || index}>
                                            <td data-label="#">{startIndex + index + 1}</td>
                                            <td data-label="Name">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {item.studentid?.photo ? (
                                                        <img
                                                            src={`${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${item.studentid.photo.replace(/^\//, '')}`}
                                                            alt=""
                                                            style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>
                                                            {item.studentid?.name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    {item.studentid?.name || 'Unknown'}
                                                </div>
                                            </td>
                                            <td data-label="Register No">{item.studentid?.registerNumber || 'N/A'}</td>
                                            <td data-label="Date">
                                                {new Date(item.createdAt || item.fromDate).toLocaleDateString()}
                                            </td>
                                            <td data-label="Emergency Reason">
                                                {item.reason}
                                                <span className="emergency-badge">🚨 EMERGENCY</span>
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
                                                        const outpassId = item._id || item.id;
                                                        navigate(`/warden/student/${outpassId}`);
                                                    }}
                                                >
                                                    View
                                                </button>
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
                                <div className="mobile-card" key={item._id || index}>
                                    <div className="card-badge">
                                        {item.studentid?.registerNumber || 'N/A'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        {item.studentid?.photo ? (
                                            <img
                                                src={`${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${item.studentid.photo.replace(/^\//, '')}`}
                                                alt=""
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>
                                                {item.studentid?.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <h3 className="card-name" style={{ margin: 0 }}>{item.studentid?.name || 'Unknown'}</h3>
                                    </div>
                                    <p className="card-details">
                                        {item.studentid?.year ? `Year ${item.studentid.year} • ` : ''}
                                        Applied on {new Date(item.createdAt || item.fromDate).toLocaleDateString()}
                                        <div className="emergency-badge mobile">🚨 EMERGENCY</div>
                                    </p>

                                    <div className="card-footer" style={{ flexWrap: 'wrap', gap: '8px' }}>
                                        <span className={`status-pill ${item.status?.toLowerCase() === 'rejected' ? 'status-rejected' : 'status-approved'}`}>
                                            • {capitalize(item.status)}
                                        </span>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <button
                                                className="card-view-link"
                                                onClick={() => {
                                                    const outpassId = item._id || item.id;
                                                    navigate(`/warden/student/${outpassId}`);
                                                }}
                                            >
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!loading && filteredOutpasses.length > 0 && (
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
            </div>

            <style>{`
                /* Page Container */
                .list-container {
                    padding: 24px 40px;
                    animation: fadeInUp 0.6s ease;
                    margin-top: 10px;
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
                    gap: 12px;
                }

                .apply-emergency-btn {
                    padding: 10px 20px;
                    border: none;
                    background: #ef4444; /* Red color for emergency action */
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
                }

                .apply-emergency-btn:hover {
                    background: #dc2626;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px -2px rgba(239, 68, 68, 0.3);
                }

                .back-btn {
                    background: white;
                    border: 1px solid #cbd5e1;
                    font-size: 16px;
                    color: #1e3a8a;
                    cursor: pointer;
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
                    font-size: 22px;
                    margin-bottom: 16px;
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

                /* Emergency Badge */
                .emergency-badge {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: bold;
                    margin-left: 8px;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    display: inline-block;
                    margin-top: 4px;
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

                .mobile-cards-view {
                    display: none;
                }

                /* Mobile */
                @media (max-width: 768px) {
                    .list-container {
                        padding: 16px;
                        margin-top: 5px;
                    }

                    .list-container h1 {
                        font-size: 18px;
                        margin-bottom: 12px;
                    }

                    .header-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }
                    
                    .filter-tabs {
                        width: 100%;
                    }
                    
                    .apply-emergency-btn {
                        width: 100%;
                        justify-content: center;
                        padding: 12px;
                    }

                    .outpass-table {
                        display: none; /* Hide table on mobile */
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

                    .emergency-badge.mobile {
                        display: block;
                        margin: 10px 0;
                        width: max-content;
                    }

                    .card-footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-top: 1px solid #f1f5f9;
                        padding-top: 16px;
                    }

                    .status-pill {
                        font-size: 13px;
                        font-weight: 700;
                        padding: 6px 16px;
                        border-radius: 20px;
                    }

                    .status-approved {
                        background: #f0fdf4;
                        color: #166534;
                        border: 1px solid #dcfce7;
                    }

                    .status-rejected {
                        background: #fef2f2;
                        color: #991b1b;
                        border: 1px solid #fee2e2;
                    }

                    .card-view-link {
                        color: #2563eb;
                        font-weight: 600;
                        font-size: 14px;
                        text-decoration: none;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        padding: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default WardenEmergencyOutpassList;
