import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WardenNav from "../../components/WardenNav";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast, ToastContainer } from "react-toastify";

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

                    <div className="search-bar-container">
                        <span className="search-icon">🔍</span>
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
                    <h1>🚨 Emergency Pending Outpasses</h1>
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
                                                <span style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>✅</span>
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
                                                            src={item.studentid.photo.startsWith('http') ? item.studentid.photo : `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${item.studentid.photo.replace(/^\//, '')}`}
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
                                                <span className="emergency-status-badge">🚨 OUT ON EMERGENCY</span>
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
                                        <span className="emergency-status-badge">🚨 OUT</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        {item.studentid?.photo ? (
                                            <img
                                                src={item.studentid.photo.startsWith('http') ? item.studentid.photo : `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${item.studentid.photo.replace(/^\//, '')}`}
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
                /* Styling setup */
                .list-container {
                    padding: 24px 40px;
                    animation: fadeInUp 0.6s ease;
                    margin-top: 10px;
                    min-height: 80vh;
                }

                .header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .back-btn {
                    background: white;
                    border: 1px solid #cbd5e1;
                    font-size: 14px;
                    color: #1e3a8a;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    padding: 10px 20px;
                    border-radius: 50px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                    font-weight: 600;
                }

                .back-btn:hover {
                    background: #f1f5f9;
                    transform: translateX(-3px);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }

                .search-bar-container {
                    position: relative;
                    width: 300px;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                }

                .search-input {
                    width: 100%;
                    padding: 10px 12px 10px 38px;
                    border-radius: 12px;
                    border: 1px solid #cbd5e1;
                    font-size: 14px;
                    outline: none;
                    transition: 0.3s;
                }

                .search-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
                }

                .title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .title-row h1 {
                    font-size: 24px;
                    color: #0f172a;
                    font-weight: 800;
                    margin: 0;
                }

                .pending-badge-count {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 700;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }

                /* Table Card */
                .outpass-card {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.05);
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
                    padding: 16px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 14px;
                }

                .outpass-table th:first-child {
                    border-top-left-radius: 12px;
                    border-bottom-left-radius: 12px;
                }

                .outpass-table th:last-child {
                    border-top-right-radius: 12px;
                    border-bottom-right-radius: 12px;
                }

                .outpass-table td {
                    padding: 16px;
                    border-bottom: 1px solid #f1f5f9;
                    color: #334155;
                    font-size: 14px;
                }

                .outpass-table tbody tr {
                    transition: all 0.2s ease;
                }

                .outpass-table tbody tr:hover {
                    background: #f8fafc;
                }

                .emergency-status-badge {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    border: 1px solid rgba(239, 68, 68, 0.15);
                    display: inline-block;
                }

                /* Action buttons */
                .checkin-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background: #10b981;
                    color: white;
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .checkin-btn:hover {
                    background: #059669;
                    box-shadow: 0 4px 12px rgba(16,185,129,0.25);
                }

                .checkin-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .view-btn-sec {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid #cbd5e1;
                    background: white;
                    color: #475569;
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .view-btn-sec:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                }

                /* Pagination */
                .pagination {
                    margin-top: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                }

                .pagination button {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background: #1e3a8a;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .pagination button:hover {
                    background: #2563eb;
                }

                .pagination button:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
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
                        background: white;
                        border-radius: 16px;
                        padding: 16px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.04);
                        border: 1px solid rgba(0,0,0,0.04);
                    }

                    .card-header-reg {
                        display: flex;
                        justify-content: space-between;
                        font-size: 13px;
                        font-weight: 700;
                        color: #64748b;
                        border-bottom: 1px solid #f1f5f9;
                        padding-bottom: 8px;
                        margin-bottom: 12px;
                    }

                    .card-info-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 13px;
                        margin-bottom: 6px;
                    }

                    .card-footer-actions {
                        display: flex;
                        gap: 8px;
                        margin-top: 16px;
                        border-top: 1px solid #f1f5f9;
                        padding-top: 12px;
                    }

                    .mobile-action-btn {
                        flex: 1;
                        text-align: center;
                        padding: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default WardenEmergencyPendingOutpass;
