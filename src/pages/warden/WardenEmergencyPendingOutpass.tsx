import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WardenNav from "../../components/WardenNav";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast, ToastContainer } from "react-toastify";
import { Search, AlertTriangle, CheckCircle } from 'lucide-react';


interface Student {
    _id?: string;
    name?: string;
    registerNumber?: string;
    year?: string;
    photo?: string;
    hostelroomno?: string;
    phone?: string;
}

interface Outpass {
    _id: string;
    studentid: Student | null;
    fromDate: string;
    createdAt: string;
    reason: string;
    status: string;
    out?: string;
}

const WardenEmergencyPendingOutpass: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [outpasses, setOutpasses] = useState<Outpass[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const itemsPerPage = 8;

    useEffect(() => {
        fetchPendingEmergencyOutpasses();
    }, []);

    const fetchPendingEmergencyOutpasses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/warden/hostel/emergency/pending/outpass/list`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Filter out items where studentid is null (e.g. gender mismatch in backend population)
            const outpassData = (response.data.outpasses || []).filter((item: any) => item.studentid !== null);
            const sortedList = outpassData.sort((a: any, b: any) => {
                return new Date(b.createdAt || b.fromDate || Date.now()).getTime() - new Date(a.createdAt || a.fromDate || Date.now()).getTime();
            });

            setOutpasses(sortedList);
        } catch (error: any) {
            console.error('Failed to fetch pending emergency outpasses', error);
            toast.error('Failed to fetch pending emergency outpasses');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (id: string) => {
        try {
            setActionLoadingId(id);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/warden/hostel/emergency/outpass/${id}/in`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                toast.success('Student checked in successfully!');
                // Refresh list
                await fetchPendingEmergencyOutpasses();
            } else {
                toast.error(response.data.message || 'Failed to check in student');
            }
        } catch (error: any) {
            console.error('Failed to check in student', error);
            toast.error(error.response?.data?.message || 'Error occurred while checking in');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Filter list by search term
    const filteredOutpasses = outpasses.filter(item => {
        if (!searchTerm) return true;
        const studentName = item.studentid?.name?.toLowerCase() || '';
        const regNo = item.studentid?.registerNumber?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return studentName.includes(term) || regNo.includes(term);
    });

    const totalPages = Math.ceil(filteredOutpasses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredOutpasses.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="page-container">
            <WardenNav />
            <ToastContainer position="bottom-right" />
            <div className="list-container">
                <div className="header-row">
                    <button className="back-btn" onClick={() => navigate("/warden-dashboard")}>
                        ← Back to Dashboard
                    </button>

                    <div className="search-bar-container" style={{ display: 'flex', alignItems: 'center' }}>
                        <Search size={18} className="search-icon" style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />

                        <input
                            type="text"
                            placeholder="Search by name or reg no..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="title-row">
                    <h1 style={{ display: 'flex', alignItems: 'center' }}><AlertTriangle size={28} style={{ color: '#EF4444', marginRight: '8px' }} /> Emergency Pending Outpasses</h1>

                    <span className="pending-badge-count">
                        {filteredOutpasses.length} Currently Out
                    </span>
                </div>

                <div className="outpass-card">
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <table className="outpass-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student Details</th>
                                    <th>Register No</th>
                                    <th>Departure Time</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="no-data-cell" style={{ textAlign: "center", padding: "40px" }}>
                                            <div className="empty-state-content">
                                                <span style={{ display: "block", marginBottom: "16px" }}><CheckCircle size={48} style={{ color: '#10B981', margin: '0 auto' }} /></span>
                                                <h3 style={{ color: "#1e3a8a", margin: "0 0 8px 0" }}>All Clear!</h3>

                                                <p style={{ color: "#64748b", margin: 0 }}>No students are currently out on emergency leave.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentData.map((item, index) => (
                                        <tr key={item._id}>
                                            <td data-label="#">{startIndex + index + 1}</td>
                                            <td data-label="Student Details">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {item.studentid?.photo ? (
                                                        <img
                                                            src={item.studentid.photo}
                                                            alt=""
                                                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>
                                                            {item.studentid?.name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.studentid?.name || 'Unknown'}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                            Room {item.studentid?.hostelroomno || 'N/A'} • Year {item.studentid?.year || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Register No">{item.studentid?.registerNumber || 'N/A'}</td>
                                            <td data-label="Departure Time">
                                                <div style={{ fontWeight: '500' }}>
                                                    {new Date(item.out || item.createdAt || item.fromDate).toLocaleDateString()}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {new Date(item.out || item.createdAt || item.fromDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td data-label="Emergency Reason">
                                                <div style={{ maxWidth: '220px', wordBreak: 'break-word' }}>
                                                    {item.reason}
                                                </div>
                                            </td>
                                            <td data-label="Status">
                                                <span className="emergency-status-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> OUT ON EMERGENCY</span>

                                            </td>
                                            <td data-label="Action">
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="checkin-btn"
                                                        onClick={() => handleCheckIn(item._id)}
                                                        disabled={actionLoadingId !== null}
                                                    >
                                                        {actionLoadingId === item._id ? 'Checking In...' : 'Check In'}
                                                    </button>
                                                    <button
                                                        className="view-btn-sec"
                                                        onClick={() => navigate(`/warden/student/${item._id}`)}
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {!loading && currentData.length > 0 && (
                        <div className="mobile-cards-view">
                            {currentData.map((item) => (
                                <div className="mobile-card" key={item._id}>
                                    <div className="card-header-reg">
                                        <span>Reg: {item.studentid?.registerNumber || 'N/A'}</span>
                                        <span className="emergency-status-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> OUT</span>

                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        {item.studentid?.photo ? (
                                            <img
                                                src={item.studentid.photo}
                                                alt=""
                                                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>
                                                {item.studentid?.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="card-name" style={{ margin: 0 }}>{item.studentid?.name || 'Unknown'}</h3>
                                            <span style={{ fontSize: '13px', color: '#64748b' }}>
                                                Room {item.studentid?.hostelroomno || 'N/A'} • Year {item.studentid?.year || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-info-row">
                                        <strong>Departure:</strong>
                                        <span>
                                            {new Date(item.out || item.createdAt || item.fromDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    <div className="card-info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', margin: '8px 0' }}>
                                        <strong>Reason:</strong>
                                        <span style={{ color: '#475569' }}>{item.reason}</span>
                                    </div>

                                    <div className="card-footer-actions">
                                        <button
                                            className="checkin-btn mobile-action-btn"
                                            onClick={() => handleCheckIn(item._id)}
                                            disabled={actionLoadingId !== null}
                                        >
                                            {actionLoadingId === item._id ? 'Checking In...' : 'Confirm Check In'}
                                        </button>
                                        <button
                                            className="view-btn-sec mobile-action-btn"
                                            onClick={() => navigate(`/warden/student/${item._id}`)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!loading && filteredOutpasses.length > 0 && totalPages > 1 && (
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
                /* Page Layout */
                .page-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f0f4f8 0%, #e0e8f0 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    padding-top: var(--nav-height, 80px);
                    padding-bottom: calc(100px + env(safe-area-inset-bottom));
                }

                .list-container {
                    padding: 24px 32px;
                    max-width: 1200px;
                    margin: 0 auto;
                    animation: fadeInUp 0.5s ease-out;
                }

                /* Header & Controls */
                .header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    color: #1e293b;
                    font-size: 0.9rem;
                    font-weight: 600;
                    padding: 10px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                    transition: all 0.3s ease;
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.9);
                    transform: translateX(-4px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.05);
                }

                .search-bar-container {
                    position: relative;
                    width: 320px;
                }

                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    font-size: 1.1rem;
                }

                .search-input {
                    width: 100%;
                    padding: 12px 16px 12px 42px;
                    border-radius: 14px;
                    border: 1px solid rgba(255,255,255,0.6);
                    background: rgba(255,255,255,0.65);
                    backdrop-filter: blur(8px);
                    font-size: 0.95rem;
                    color: #1e293b;
                    outline: none;
                    transition: all 0.3s;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                }

                .search-input:focus {
                    background: white;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
                }

                .title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .title-row h1 {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.02em;
                }

                .pending-badge-count {
                    background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
                    color: white;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
                }

                /* Table Card */
                .outpass-card {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(16px);
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.6) inset;
                    border: 1px solid rgba(255,255,255,0.9);
                    overflow: hidden;
                }

                /* Table */
                .outpass-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }

                .outpass-table thead {
                    background: #f8fafc;
                }

                .outpass-table th {
                    padding: 16px;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 2px solid #e2e8f0;
                }

                .outpass-table th:first-child {
                    border-top-left-radius: 12px;
                }

                .outpass-table th:last-child {
                    border-top-right-radius: 12px;
                }

                .outpass-table td {
                    padding: 16px;
                    border-bottom: 1px solid #f1f5f9;
                    color: #334155;
                    font-size: 0.95rem;
                    vertical-align: middle;
                }

                .outpass-table tbody tr {
                    transition: all 0.2s ease;
                    background: transparent;
                }

                .outpass-table tbody tr:hover {
                    background: rgba(248, 250, 252, 0.8);
                }
                
                .outpass-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .emergency-status-badge {
                    background: #fef2f2;
                    color: #dc2626;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    display: inline-flex;
                    align-items: center;
                    border: 1px solid #fca5a5;
                    white-space: nowrap;
                }

                /* Action buttons */
                .checkin-btn {
                    padding: 8px 16px;
                    border-radius: 10px;
                    border: none;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 10px rgba(16,185,129,0.2);
                }

                .checkin-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(16,185,129,0.3);
                }

                .checkin-btn:disabled {
                    background: #94a3b8;
                    box-shadow: none;
                    cursor: not-allowed;
                }

                .view-btn-sec {
                    padding: 8px 16px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    background: white;
                    color: #475569;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .view-btn-sec:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                    color: #0f172a;
                }

                /* Pagination */
                .pagination {
                    margin-top: 32px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                }

                .pagination button {
                    padding: 8px 20px;
                    border-radius: 10px;
                    border: none;
                    background: white;
                    color: #334155;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                }

                .pagination button:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    transform: translateY(-1px);
                }

                .pagination button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .pagination span {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #64748b;
                }

                .mobile-cards-view {
                    display: none;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Responsive design */
                @media (max-width: 1024px) {
                    .list-container {
                        padding: 16px;
                    }

                    .header-row {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .search-bar-container {
                        width: 100%;
                    }

                    .outpass-table {
                        display: none;
                    }

                    .outpass-card {
                        padding: 0;
                        background: transparent;
                        box-shadow: none;
                        border: none;
                    }

                    .mobile-cards-view {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }

                    .mobile-card {
                        background: rgba(255, 255, 255, 0.85);
                        backdrop-filter: blur(16px);
                        border-radius: 20px;
                        padding: 20px;
                        box-shadow: 0 8px 20px rgba(0,0,0,0.04);
                        border: 1px solid rgba(255,255,255,0.8);
                        animation: fadeInUp 0.4s ease;
                    }

                    .card-header-reg {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 0.85rem;
                        font-weight: 700;
                        color: #64748b;
                        border-bottom: 1px solid #f1f5f9;
                        padding-bottom: 12px;
                        margin-bottom: 16px;
                    }

                    .card-info-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 0.9rem;
                        margin-bottom: 8px;
                        color: #334155;
                    }

                    .card-footer-actions {
                        display: flex;
                        gap: 12px;
                        margin-top: 20px;
                        border-top: 1px solid #f1f5f9;
                        padding-top: 16px;
                    }

                    .mobile-action-btn {
                        flex: 1;
                        text-align: center;
                        padding: 12px;
                        border-radius: 12px;
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default WardenEmergencyPendingOutpass;
