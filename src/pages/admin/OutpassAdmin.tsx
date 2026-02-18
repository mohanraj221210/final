import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Outpass {
    _id: string;
    // The API seems to return lowercase 'studentid' based on other files
    studentid?: {
        name: string;
        rollNo?: string;
        registerNumber?: string;
        department?: string;
        year?: string;
        studentType?: string;
        residenceType?: string;
    };
    // Fallbacks
    student?: {
        name: string;
        rollNo: string;
        department: string;
        year: string;
    };
    studentName?: string;

    outpassType?: string;
    outpasstype?: string; // Add lowercase fallback to interface
    type?: string;

    reason: string;

    fromDate: string;
    outDate?: string;

    toDate: string;
    inDate?: string;

    outpassStatus?: string;
    status?: string;

    // Approval Statuses (lowercase based on observation)
    staffapprovalstatus?: string;
    wardenapprovalstatus?: string;
    yearinchargeapprovalstatus?: string;

    // Camelcase fallbacks just in case
    staffApprovalStatus?: string;
    wardenApprovalStatus?: string;
    yearInchargeApprovalStatus?: string;

    createdAt: string;
}

const OutpassAdmin: React.FC = () => {
    const [outpasses, setOutpasses] = useState<Outpass[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('All');
    const [filterTime, setFilterTime] = useState<string>('All');

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOutpasses();
    }, []);

    const fetchOutpasses = async () => {
        try {
            const data = await adminService.getAllOutpasses();
            // @ts-ignore
            const list = data.outpasses || data.data || [];
            if (Array.isArray(list)) {
                setOutpasses(list);
            } else {
                setOutpasses([]);
            }
        } catch (error) {
            console.error("Error fetching outpasses:", error);
            toast.error("Failed to load outpass data");
        } finally {
            setLoading(false);
        }
    };

    // Helper to get safe values
    const getStudentName = (op: Outpass) => op.studentid?.name || op.student?.name || op.studentName || '-';
    const getStudentRegNo = (op: Outpass) => op.studentid?.registerNumber || '-';
    const getStudentDept = (op: Outpass) => op.studentid?.department || op.student?.department || '-';
    const getStudentYear = (op: Outpass) => op.studentid?.year || op.student?.year || '-';

    const getStudentType = (op: Outpass) => {
        const type = op.studentid?.studentType || op.studentid?.residenceType || 'Hosteller';
        return type;
    };

    const getType = (op: Outpass): string => {
        // @ts-ignore
        const val = op.outpassType || op.outpasstype || op.type || '-';
        return val;
    };

    // Status is often 'status' or 'outpassStatus'
    // But specific approvals are usually distinct fields
    const getStatus = (op: Outpass) => op.outpassStatus || op.status || '-';

    const getFromDate = (op: Outpass) => op.fromDate || op.outDate || '';
    const getToDate = (op: Outpass) => op.toDate || op.inDate || '';

    // Approval Status Helpers - Try lowercase first as seen in other files
    const getStaffStatus = (op: Outpass) => op.staffapprovalstatus || op.staffApprovalStatus || 'Pending';
    const getWardenStatus = (op: Outpass) => op.wardenapprovalstatus || op.wardenApprovalStatus || 'Pending';
    const getYearInchargeStatus = (op: Outpass) => op.yearinchargeapprovalstatus || op.yearInchargeApprovalStatus || 'Pending';


    // Helper to check date ranges
    const isDateMatch = (dateStr: string, timeFilter: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (timeFilter === 'Today') {
            return dateDay.getTime() === today.getTime();
        }
        if (timeFilter === 'Yesterday') {
            return dateDay.getTime() === yesterday.getTime();
        }
        if (timeFilter === 'This Week') {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            return date >= startOfWeek;
        }
        if (timeFilter === 'This Month') {
            return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        }
        return true;
    };

    // Filter Logic
    const filteredOutpasses = outpasses.filter(op => {
        const type = getType(op).toLowerCase().replace(/\s+/g, '');
        const filter = filterType.toLowerCase().replace(/\s+/g, '');
        const date = getFromDate(op);
        const search = searchTerm.toLowerCase();

        const typeMatch = filterType === 'All' || type === filter || type.includes(filter);
        const timeMatch = filterTime === 'All' || isDateMatch(date, filterTime);

        // Search Match
        const name = getStudentName(op).toLowerCase();
        const regNo = getStudentRegNo(op).toLowerCase();
        const fromDateStr = new Date(getFromDate(op)).toLocaleDateString().toLowerCase();

        // Simple Search Check
        const searchMatch = !searchTerm ||
            name.includes(search) ||
            regNo.includes(search) ||
            fromDateStr.includes(search) ||
            date.includes(search);

        return typeMatch && timeMatch && searchMatch;
    });

    // Stats Calculation - Using total counts from 'outpasses' (not filtered ones)
    const stats = {
        total: outpasses.length,
        od: outpasses.filter(o => getType(o).toLowerCase() === 'od').length,
        home: outpasses.filter(o => getType(o).toLowerCase().replace(/\s+/g, '').includes('home')).length,
        outing: outpasses.filter(o => getType(o).toLowerCase() === 'outing').length,
        emergency: outpasses.filter(o => getType(o).toLowerCase() === 'emergency').length,
    };

    // Date formatter for CSV (short format)
    const csvDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toISOString().split('T')[0]; // YYYY-MM-DD
    };

    // Download CSV
    const handleDownload = () => {
        const headers = [
            "S.No",
            "Student Name",
            "Department",
            "Batch",
            "Dayscholar/Hostel",
            "Status",
            "Staff Approval",
            "Year Incharge Approval",
            "Warden Approval",
            "Reason",
            "Type",
            "From Date",
            "To Date",
            "Applied On"
        ];

        const rows = filteredOutpasses.map((op, index) => {
            return [
                index + 1,
                `"${getStudentName(op)}"`,
                `"${getStudentDept(op)}"`,
                `"${getStudentYear(op)}"`,
                getStudentType(op),
                getStatus(op),
                getStaffStatus(op),
                getYearInchargeStatus(op),
                getWardenStatus(op),
                `"${op.reason?.replace(/"/g, '""')}"`,
                getType(op),
                csvDate(getFromDate(op)),
                csvDate(getToDate(op)),
                csvDate(op.createdAt)
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `outpass_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <AdminLayout title="Outpass Management"><div>Loading...</div></AdminLayout>;

    return (
        <AdminLayout title="Outpass Management">
            <ToastContainer />

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Requests</h3>
                    <p className="stat-value">{stats.total}</p>
                </div>
                <div className="stat-card card-od">
                    <h3>OD</h3>
                    <p className="stat-value">{stats.od}</p>
                </div>
                <div className="stat-card card-home">
                    <h3>Home Pass</h3>
                    <p className="stat-value">{stats.home}</p>
                </div>
                <div className="stat-card card-outing">
                    <h3>Outing</h3>
                    <p className="stat-value">{stats.outing}</p>
                </div>
                <div className="stat-card card-emergency">
                    <h3>Emergency</h3>
                    <p className="stat-value">{stats.emergency}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-bar">
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, reg no, date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                        <option value="All">All Types</option>
                        <option value="OD">OD</option>
                        <option value="Home Pass">Home Pass</option>
                        <option value="Outing">Outing</option>
                        <option value="Emergency">Emergency</option>
                    </select>

                    <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)} className="filter-select">
                        <option value="All">All Time</option>
                        <option value="Today">Today</option>
                        <option value="Yesterday">Yesterday</option>
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                    </select>
                </div>

                <button onClick={handleDownload} className="btn-download">
                    📥 Download Excel
                </button>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Student Name</th>
                            <th>Department</th>
                            <th>Batch (Year)</th>
                            <th>Hosteller/DS</th>
                            <th>Status (Overall)</th>
                            <th>Approvals</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOutpasses.length > 0 ? (
                            filteredOutpasses.map((op, index) => {
                                const status = getStatus(op);
                                return (
                                    <tr key={op._id}>
                                        <td>{index + 1}</td>
                                        <td className="font-medium">{getStudentName(op)}</td>
                                        <td>{getStudentDept(op)}</td>
                                        <td>{getStudentYear(op)}</td>
                                        <td>
                                            <span className="text-gray-600 text-sm">
                                                {getStudentType(op)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${status?.toLowerCase()}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="approval-status-col">
                                                <div className="approval-item">
                                                    <span className="label">Staff:</span>
                                                    <span className={`val ${getStaffStatus(op).toLowerCase()}`}>{getStaffStatus(op)}</span>
                                                </div>
                                                <div className="approval-item">
                                                    <span className="label">Year Incharge:</span>
                                                    <span className={`val ${getYearInchargeStatus(op).toLowerCase()}`}>{getYearInchargeStatus(op)}</span>
                                                </div>
                                                <div className="approval-item">
                                                    <span className="label">Warden:</span>
                                                    <span className={`val ${getWardenStatus(op).toLowerCase()}`}>{getWardenStatus(op)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td title={op.reason} className="reason-cell">{op.reason}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="no-data">No outpasses found matching the filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .stat-card h3 { margin: 0 0 8px; font-size: 0.9rem; color: #6b7280; font-weight: 500; }
                .stat-value { font-size: 1.8rem; font-weight: 700; color: #111827; margin: 0; }
                
                .card-od .stat-value { color: #6366f1; }
                .card-home .stat-value { color: #ec4899; }
                .card-outing .stat-value { color: #f59e0b; }
                .card-emergency .stat-value { color: #ef4444; }

                .controls-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .search-bar {
                    flex: 1;
                    min-width: 200px;
                    max-width: 300px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .search-bar input {
                    width: 100%;
                    padding: 8px 12px 8px 36px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    outline: none;
                }
                .search-bar input:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
                }
                .search-icon {
                    position: absolute;
                    left: 10px;
                    color: #9ca3af;
                }
                .filters { display: flex; gap: 12px; margin-left: 480px; }
                .filter-select {
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: 1px solid #d1d5db;
                    background: white;
                    font-size: 0.95rem;
                    color: #374151;
                    cursor: pointer;
                }
                .btn-download {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.2s;
                }
                .btn-download:hover { background: #059669; }

                .table-container {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .data-table th, .data-table td {
                    padding: 16px 24px;
                    text-align: left;
                    border-bottom: 1px solid #f3f4f6;
                    vertical-align: middle;
                }
                .data-table th {
                    background: #f9fafb;
                    font-weight: 600;
                    color: #4b5563;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .data-table tbody tr:last-child td { border-bottom: none; }
                .data-table tbody tr:hover { background: #f9fafb; }

                .reason-cell { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #4b5563; }

                .status-badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    display: inline-block;
                }
                .status-approved { background: #dcfce7; color: #166534; }
                .status-pending { background: #fff7ed; color: #c2410c; }
                .status-rejected { background: #fee2e2; color: #991b1b; }
                .status-declined { background: #fee2e2; color: #991b1b; }

                .approval-status-col { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; }
                .approval-item { display: flex; gap: 6px; align-items: center; }
                .approval-item .label { color: #6b7280; width: 85px; }
                .approval-item .val { font-weight: 600; }
                .approval-item .val.pending { color: #d97706; }
                .approval-item .val.approved { color: #059669; }
                .approval-item .val.rejected, .approval-item .val.declined { color: #dc2626; }

                .no-data { text-align: center; color: #6b7280; padding: 32px; font-style: italic; }

                @media (max-width: 1024px) {
                    .data-table { display: block; overflow-x: auto; }
                }

                @media (max-width: 640px) {
                    .controls-bar { 
                        flex-direction: column; 
                        align-items: stretch; 
                        gap: 10px;
                    }
                    .search-bar { width: 100%; max-width: none; }
                    .search-bar input { width: 100%; }
                    .filters { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 8px; 
                    }
                    .filter-select { 
                        width: 100%; 
                        padding: 8px 4px; 
                        font-size: 0.85rem; 
                    }
                    .btn-download { 
                        width: 100%; 
                        justify-content: center;
                        padding: 8px;
                        font-size: 0.9rem;
                    }
                }

                .font-medium { font-weight: 500; color: #111827; }
                .text-sm { font-size: 0.875rem; }
                .text-gray-600 { color: #4b5563; }
            `}</style>
        </AdminLayout>
    );
};

export default OutpassAdmin;
