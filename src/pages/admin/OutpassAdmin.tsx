import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Outpass {
    _id: string;
    studentid?: { name: string; rollNo?: string; registerNumber?: string; department?: string; year?: string; };
    student?: { name: string; rollNo: string; department: string; year: string; };
    studentName?: string;
    name?: string;
    email?: string;
    department?: string;
    semester?: number;
    outpassType?: string;
    outpasstype?: string;
    type?: string;
    reason: string;
    fromDate: string;
    outDate?: string;
    toDate: string;
    outpassStatus?: string;
    status?: string;
    createdAt: string;
}

interface StatEntry {
    _id: string;
    count: number;
    approved: number;
    rejected: number;
    pending: number;
    OD: number;
    Home: number;
    Outing: number;
    Emergency: number;
}

const OutpassAdmin: React.FC = () => {
    const [outpasses, setOutpasses] = useState<Outpass[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('All');
    const [filterTime, setFilterTime] = useState<string>('All');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterDept, setFilterDept] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLastPage, setIsLastPage] = useState(true);
    const [statsData, setStatsData] = useState<StatEntry[]>([]);

    // Fetch stats on mount
    useEffect(() => {
        fetchStats();
    }, []);

    // Fetch outpasses with debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchOutpasses();
        }, 300);
        return () => clearTimeout(handler);
    }, [currentPage, filterType, filterTime, filterStatus, filterDept, searchTerm]);

    const fetchStats = async () => {
        try {
            const data = await adminService.getOutpassStats();
            const statsArray = Array.isArray(data) && data[0]?.stats ? data[0].stats : (Array.isArray(data) ? data : []);
            setStatsData(statsArray);
        } catch {
            // Silent fail for stats
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchOutpasses = async () => {
        try {
            const filters: Record<string, any> = { page: currentPage };
            if (filterType !== 'All') filters.outpasstype = filterType;
            if (filterStatus !== 'All') filters.status = filterStatus;
            if (filterDept.trim()) filters.department = filterDept.trim();
            if (filterTime === 'Today') filters.appliedDate = 'today';
            else if (filterTime === 'This Week') filters.appliedDate = 'weekly';
            else if (filterTime === 'This Month') filters.appliedDate = 'monthly';
            if (searchTerm) filters.search = searchTerm;

            const data = await adminService.getAllOutpasses(filters);
            // @ts-ignore
            const list = data.outpasses || data.filterOutpass || data.data || [];
            setOutpasses(Array.isArray(list) ? list : []);
            setIsLastPage(data.isLast ?? true);
        } catch (error) {
            console.error('Error fetching outpasses:', error);
            toast.error('Failed to load outpass data');
        } finally {
            setLoading(false);
        }
    };

    const getStudentName = (op: Outpass) => op.name || op.studentid?.name || op.student?.name || op.studentName || '-';
    const getStudentEmail = (op: Outpass) => op.email || '-';
    const getStudentDept = (op: Outpass) => op.department || op.studentid?.department || op.student?.department || '-';
    const getStudentYear = (op: Outpass) => op.semester ? `Sem ${op.semester}` : (op.studentid?.year || op.student?.year || '-');
    const getType = (op: Outpass): string => op.outpassType || op.outpasstype || op.type || '-';
    const getStatus = (op: Outpass) => op.status || op.outpassStatus || '-';

    // Aggregate stats from API
    const totalPending = statsData.find(s => s._id === 'pending')?.count || 0;
    const totalRejected = statsData.find(s => s._id === 'rejected')?.count || 0;
    const totalApproved = statsData.find(s => s._id === 'approved')?.count || 0;
    const totalHome = statsData.reduce((sum, s) => sum + (s.Home || 0), 0);
    const totalOuting = statsData.reduce((sum, s) => sum + (s.Outing || 0), 0);
    const totalOD = statsData.reduce((sum, s) => sum + (s.OD || 0), 0);
    const totalEmergency = statsData.reduce((sum, s) => sum + (s.Emergency || 0), 0);
    const grandTotal = totalPending + totalRejected + totalApproved;

    // Download CSV / Excel from API
    const handleDownload = async () => {
        try {
            toast.info('Requesting outpass report from server...');
            const response = await adminService.exportOutpassReport({
                outpasstype: filterType,
                status: filterStatus,
                appliedDate: filterTime,
                search: searchTerm
            });

            const contentType = response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const blob = new Blob([response.data], { type: contentType });
            const disposition = response.headers['content-disposition'];
            
            let filename = `outpass_report_${new Date().toISOString().split('T')[0]}`;
            if (disposition && disposition.includes('filename=')) {
                const parts = disposition.split('filename=');
                if (parts[1]) filename = parts[1].replace(/['"]/g, '');
            } else {
                if (contentType.includes('csv')) {
                    filename += '.csv';
                } else if (contentType.includes('pdf')) {
                    filename += '.pdf';
                } else {
                    filename += '.xlsx';
                }
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Report exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export outpass report');
        }
    };


    const getTypeBadgeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'home': return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
            case 'outing': return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
            case 'od': return { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' };
            case 'emergency': return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
            default: return { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' };
        }
    };

    const getStatusColors = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' };
            case 'rejected': return { bg: '#fff1f2', color: '#be123c', dot: '#f43f5e' };
            case 'pending': return { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' };
            default: return { bg: '#f9fafb', color: '#6b7280', dot: '#9ca3af' };
        }
    };

    return (
        <AdminLayout title="Outpass Management">
            <ToastContainer position="bottom-right" />

            <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

                {/* Page Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                        Outpass Management
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.95rem' }}>
                        Monitor and manage all student outpass requests
                    </p>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                    {/* Total */}
                    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderRadius: '16px', padding: '20px', color: 'white', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, marginBottom: '8px' }}>Total</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{statsLoading ? '...' : grandTotal}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>All requests</div>
                    </div>
                    {/* Pending */}
                    <div style={{ background: 'white', border: '1px solid #fde68a', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400e', marginBottom: '8px' }}>⏳ Pending</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b45309', lineHeight: 1 }}>{statsLoading ? '...' : totalPending}</div>
                        <div style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '4px' }}>Awaiting approval</div>
                    </div>
                    {/* Approved */}
                    <div style={{ background: 'white', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#166534', marginBottom: '8px' }}>✅ Approved</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', lineHeight: 1 }}>{statsLoading ? '...' : totalApproved}</div>
                        <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '4px' }}>Cleared</div>
                    </div>
                    {/* Rejected */}
                    <div style={{ background: 'white', border: '1px solid #fecdd3', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9f1239', marginBottom: '8px' }}>❌ Rejected</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#be123c', lineHeight: 1 }}>{statsLoading ? '...' : totalRejected}</div>
                        <div style={{ fontSize: '0.8rem', color: '#f43f5e', marginTop: '4px' }}>Declined</div>
                    </div>
                    {/* Home */}
                    <div style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e40af', marginBottom: '8px' }}>🏠 Home</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1d4ed8', lineHeight: 1 }}>{statsLoading ? '...' : totalHome}</div>
                        <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '4px' }}>Home passes</div>
                    </div>
                    {/* Outing */}
                    <div style={{ background: 'white', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#14532d', marginBottom: '8px' }}>🚶 Outing</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', lineHeight: 1 }}>{statsLoading ? '...' : totalOuting}</div>
                        <div style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '4px' }}>Outings</div>
                    </div>
                    {/* OD */}
                    <div style={{ background: 'white', border: '1px solid #e9d5ff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#581c87', marginBottom: '8px' }}>📋 OD</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7e22ce', lineHeight: 1 }}>{statsLoading ? '...' : totalOD}</div>
                        <div style={{ fontSize: '0.8rem', color: '#a855f7', marginTop: '4px' }}>On duty</div>
                    </div>
                    {/* Emergency */}
                    <div style={{ background: 'white', border: '1px solid #fed7aa', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7c2d12', marginBottom: '8px' }}>🚨 Emergency</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c2410c', lineHeight: 1 }}>{statsLoading ? '...' : totalEmergency}</div>
                        <div style={{ fontSize: '0.8rem', color: '#f97316', marginTop: '4px' }}>Emergency</div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    {/* Search */}
                    <div style={{ flex: '1 1 200px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px', pointerEvents: 'none' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name or register no..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', color: '#0f172a', boxSizing: 'border-box' }}
                        />
                    </div>
                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', background: '#f8fafc', color: '#374151', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
                    >
                        <option value="All">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    {/* Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                        style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', background: '#f8fafc', color: '#374151', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
                    >
                        <option value="All">All Types</option>
                        <option value="OD">OD</option>
                        <option value="Home">Home Pass</option>
                        <option value="Outing">Outing</option>
                        <option value="Emergency">Emergency</option>
                    </select>
                    {/* Time Filter */}
                    <select
                        value={filterTime}
                        onChange={(e) => { setFilterTime(e.target.value); setCurrentPage(1); }}
                        style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', background: '#f8fafc', color: '#374151', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
                    >
                        <option value="All">All Time</option>
                        <option value="Today">Today</option>
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                    </select>
                    {/* Department Filter */}
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Filter by department..."
                            value={filterDept}
                            onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', color: '#374151', minWidth: '180px' }}
                        />
                    </div>
                    {/* Reset */}
                    {(filterStatus !== 'All' || filterType !== 'All' || filterTime !== 'All' || filterDept || searchTerm) && (
                        <button
                            onClick={() => { setFilterStatus('All'); setFilterType('All'); setFilterTime('All'); setFilterDept(''); setSearchTerm(''); setCurrentPage(1); }}
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#be123c', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            ✕ Clear
                        </button>
                    )}
                    {/* Download */}
                    <button
                        onClick={handleDownload}
                        style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
                    >
                        📥 Export CSV
                    </button>
                </div>

                {/* Table */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
                            <div style={{ fontWeight: 500 }}>Loading outpasses...</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        {['#', 'Student', 'Department', 'Semester', 'Type', 'Status', 'Applied On'].map(h => (
                                            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {outpasses.length > 0 ? outpasses.map((op, index) => {
                                        const status = getStatus(op);
                                        const type = getType(op);
                                        const typeColors = getTypeBadgeColor(type);
                                        const statusColors = getStatusColors(status);
                                        return (
                                            <tr key={op._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>
                                                    {(currentPage - 1) * 20 + index + 1}
                                                </td>
                                                <td style={{ padding: '14px 20px' }}>
                                                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{getStudentName(op)}</div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '2px' }}>{getStudentEmail(op)}</div>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#475569', fontSize: '0.88rem' }}>{getStudentDept(op)}</td>
                                                <td style={{ padding: '14px 20px', color: '#475569', fontSize: '0.88rem' }}>{getStudentYear(op)}</td>
                                                <td style={{ padding: '14px 20px' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, background: typeColors.bg, color: typeColors.color, border: `1px solid ${typeColors.border}`, whiteSpace: 'nowrap' }}>
                                                        {type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 20px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: statusColors.bg, color: statusColors.color, whiteSpace: 'nowrap' }}>
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColors.dot, display: 'inline-block', flexShrink: 0 }} />
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                    {op.createdAt ? new Date(op.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
                                                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>No outpasses found</div>
                                                <div style={{ fontSize: '0.85rem' }}>Try adjusting your filters or search term</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '14px 20px', background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === 1 ? '#cbd5e1' : '#374151', fontSize: '0.9rem', transition: 'all 0.2s' }}
                    >
                        ← Previous
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                            {currentPage}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Current page</span>
                    </div>
                    <button
                        disabled={isLastPage}
                        onClick={() => setCurrentPage(p => p + 1)}
                        style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: isLastPage ? '#f8fafc' : 'white', cursor: isLastPage ? 'not-allowed' : 'pointer', fontWeight: 600, color: isLastPage ? '#cbd5e1' : '#374151', fontSize: '0.9rem', transition: 'all 0.2s' }}
                    >
                        Next →
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default OutpassAdmin;
