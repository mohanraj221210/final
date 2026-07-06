import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ViewDetailsButton from '../../components/ViewDetailsButton';
import { 
    Users, 
    UserCheck, 
    FileText, 
    Clock, 
    ArrowUpRight, 
    ArrowDownRight,
    Download,
    Filter,
    RefreshCw
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const DEPARTMENTS = [
    'Information Technology',
    'Computer Science and Engineering',
    'Artificial Intelligence and Data Science',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Master of Business Administration',
    'Computer Science and Business System'
];

// Enterprise Colors
const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#94A3B8'];

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    // Student Filters
    const [studentDeptFilter, setStudentDeptFilter] = useState('');

    // Outpass Filters
    const [outpassDateFilter, setOutpassDateFilter] = useState('monthly');
    const [outpassStatusFilter, setOutpassStatusFilter] = useState('');
    const [outpassDeptFilter, setOutpassDeptFilter] = useState('');
    const [outpassTypeFilter, setOutpassTypeFilter] = useState('');

    // Data States
    const [studentStats, setStudentStats] = useState<any>(null);
    const [staffStats, setStaffStats] = useState<any>(null);
    const [outpassStats, setOutpassStats] = useState<any>(null);
    const [recentPasses, setRecentPasses] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    // Export Modal States
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFilterType, setExportFilterType] = useState('All');
    const [exportFilterTime, setExportFilterTime] = useState('All');
    const [exportFilterStatus, setExportFilterStatus] = useState('All');
    const [exportSearchTerm, setExportSearchTerm] = useState('');
    const [exportLoading, setExportLoading] = useState(false);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.clear();
            navigate('/admin-login');
            return;
        }
        setLoading(true);
        try {
            const [students, staff, outpasses] = await Promise.all([
                adminService.getStudentStats({ department: studentDeptFilter }),
                adminService.getStaffStats({}),
                adminService.getOutpassStats({ 
                    appliedDate: outpassDateFilter,
                    status: outpassStatusFilter,
                    department: outpassDeptFilter,
                    outpasstype: outpassTypeFilter
                })
            ]);

            setStudentStats(students?.[0] || { total: 0, IT: 0, CSE: 0, AI: 0, ECE: 0, Mech: 0, MBA: 0, Nun: 0 });

            let staffAggr = { total: 0, IT: 0, CSE: 0, AI: 0, ECE: 0, Mech: 0, MBA: 0 };
            if (Array.isArray(staff)) {
                staff.forEach(d => {
                    staffAggr.total += d.total || 0;
                    staffAggr.IT += d.IT || 0;
                    staffAggr.CSE += d.CSE || 0;
                    staffAggr.AI += d.AI || 0;
                    staffAggr.ECE += d.ECE || 0;
                    staffAggr.Mech += d.Mech || 0;
                    staffAggr.MBA += d.MBA || 0;
                });
            } else if (staff?.[0]) {
                staffAggr = staff[0];
            }
            setStaffStats(staffAggr);

            let opAggr = { count: 0, approved: 0, rejected: 0, pending: 0, OD: 0, Home: 0, Outing: 0, Emergency: 0 };
            const opStatsArray = outpasses?.[0]?.stats || [];
            if (Array.isArray(opStatsArray)) {
                opStatsArray.forEach((d: any) => {
                    opAggr.count += d.count || 0;
                    opAggr.approved += d.approved || 0;
                    opAggr.rejected += d.rejected || 0;
                    opAggr.pending += d.pending || 0;
                    opAggr.OD += d.OD || 0;
                    opAggr.Home += d.Home || 0;
                    opAggr.Outing += d.Outing || 0;
                    opAggr.Emergency += d.Emergency || 0;
                });
            }
            setOutpassStats(opAggr);
            setRecentPasses(outpasses?.[0]?.recentpasses || []);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [studentDeptFilter, outpassDateFilter, outpassStatusFilter, outpassDeptFilter, outpassTypeFilter]);

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return { bg: '#DEF7EC', text: '#03543F' };
            case 'rejected': return { bg: '#FDE8E8', text: '#9B1C1C' };
            case 'pending': return { bg: '#FEF3C7', text: '#92400E' };
            default: return { bg: '#F1F5F9', text: '#475569' };
        }
    };

    // Prepare Recharts Data
    const studentChartData = [
        { name: 'IT', value: studentStats?.IT || 0 },
        { name: 'CSE', value: studentStats?.CSE || 0 },
        { name: 'AI', value: studentStats?.AI || 0 },
        { name: 'ECE', value: studentStats?.ECE || 0 },
        { name: 'Mech', value: studentStats?.Mech || 0 },
        { name: 'MBA', value: studentStats?.MBA || 0 },
        { name: 'Unassigned', value: studentStats?.Nun || 0 },
    ].filter(d => d.value > 0);

    const staffChartData = [
        { name: 'IT', value: staffStats?.IT || 0 },
        { name: 'CSE', value: staffStats?.CSE || 0 },
        { name: 'AI', value: staffStats?.AI || 0 },
        { name: 'ECE', value: staffStats?.ECE || 0 },
        { name: 'Mech', value: staffStats?.Mech || 0 },
        { name: 'MBA', value: staffStats?.MBA || 0 },
    ];

    const outpassStatusData = [
        { name: 'Approved', value: outpassStats?.approved || 0 },
        { name: 'Pending', value: outpassStats?.pending || 0 },
        { name: 'Rejected', value: outpassStats?.rejected || 0 },
    ].filter(d => d.value > 0);

    const outpassTypeData = [
        { name: 'Emergency', value: outpassStats?.Emergency || 0 },
        { name: 'Home', value: outpassStats?.Home || 0 },
        { name: 'Outing', value: outpassStats?.Outing || 0 },
        { name: 'OD', value: outpassStats?.OD || 0 },
    ].filter(d => d.value > 0);

    // Dummy Sparkline SVG
    const Sparkline = ({ color }: { color: string }) => (
        <svg width="64" height="24" viewBox="0 0 64 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 20 L12 14 L22 18 L32 8 L42 12 L52 4 L62 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 20 L12 14 L22 18 L32 8 L42 12 L52 4 L62 8 L62 24 L2 24 Z" fill={`url(#gradient-${color})`} opacity="0.2"/>
            <defs>
                <linearGradient id={`gradient-${color}`} x1="32" y1="4" x2="32" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor={color} stopOpacity="1"/>
                    <stop offset="1" stopColor={color} stopOpacity="0"/>
                </linearGradient>
            </defs>
        </svg>
    );

    const triggerExport = async () => {
        setExportLoading(true);
        try {
            toast.info('Requesting outpass report from server...');
            const response = await adminService.exportOutpassReport({
                outpasstype: exportFilterType,
                status: exportFilterStatus,
                appliedDate: exportFilterTime,
                search: exportSearchTerm
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
            setShowExportModal(false);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export outpass report');
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <AdminLayout title="Overview" activeMenu="dashboard">
            <div className="saas-dashboard">
                
                {/* Header Actions */}
                <div className="saas-header-actions">
                    <div className="header-text">
                        <h1 className="page-title">Analytics Overview</h1>
                        <p className="page-desc">Monitor your institution's core metrics and outpass activity.</p>
                    </div>
                    <div className="header-buttons">
                        <button className="saas-btn-outline" onClick={fetchData}>
                            <RefreshCw size={14} className={loading ? 'spin' : ''} />
                            Refresh
                        </button>
                        <button className="saas-btn-primary" onClick={() => setShowExportModal(true)}>
                            <Download size={14} />
                            Export Report
                        </button>
                    </div>
                </div>

                {loading && !studentStats ? (
                    <div className="saas-skeleton-container">
                        <div className="skeleton card-skel"></div>
                        <div className="skeleton card-skel"></div>
                        <div className="skeleton card-skel"></div>
                        <div className="skeleton card-skel"></div>
                    </div>
                ) : (
                    <>
                        {/* KPI Grid */}
                        <div className="kpi-grid">
                            <div className="kpi-card">
                                <div className="kpi-top">
                                    <div className="kpi-icon-box" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                                        <Users size={18} />
                                    </div>
                                    <div className="kpi-trend positive">
                                        <ArrowUpRight size={14} />
                                        <span>2.4%</span>
                                    </div>
                                </div>
                                <div className="kpi-bottom">
                                    <div>
                                        <p className="kpi-label">Total Students</p>
                                        <h2 className="kpi-value">{studentStats?.total || 0}</h2>
                                    </div>
                                    <div className="kpi-spark">
                                        <Sparkline color="var(--primary)" />
                                    </div>
                                </div>
                            </div>

                            <div className="kpi-card">
                                <div className="kpi-top">
                                    <div className="kpi-icon-box" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                                        <UserCheck size={18} />
                                    </div>
                                    <div className="kpi-trend positive">
                                        <ArrowUpRight size={14} />
                                        <span>1.1%</span>
                                    </div>
                                </div>
                                <div className="kpi-bottom">
                                    <div>
                                        <p className="kpi-label">Active Faculty</p>
                                        <h2 className="kpi-value">{staffStats?.total || 0}</h2>
                                    </div>
                                    <div className="kpi-spark">
                                        <Sparkline color="#16A34A" />
                                    </div>
                                </div>
                            </div>

                            <div className="kpi-card">
                                <div className="kpi-top">
                                    <div className="kpi-icon-box" style={{ background: '#FFF7ED', color: '#EA580C' }}>
                                        <FileText size={18} />
                                    </div>
                                    <div className="kpi-trend negative">
                                        <ArrowDownRight size={14} />
                                        <span>4.3%</span>
                                    </div>
                                </div>
                                <div className="kpi-bottom">
                                    <div>
                                        <p className="kpi-label">Outpass Requests</p>
                                        <h2 className="kpi-value">{outpassStats?.count || 0}</h2>
                                    </div>
                                    <div className="kpi-spark">
                                        <Sparkline color="#EA580C" />
                                    </div>
                                </div>
                            </div>

                            <div className="kpi-card">
                                <div className="kpi-top">
                                    <div className="kpi-icon-box" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                                        <Clock size={18} />
                                    </div>
                                    <div className="kpi-trend neutral">
                                        <span>0.0%</span>
                                    </div>
                                </div>
                                <div className="kpi-bottom">
                                    <div>
                                        <p className="kpi-label">Pending Approvals</p>
                                        <h2 className="kpi-value">{outpassStats?.pending || 0}</h2>
                                    </div>
                                    <div className="kpi-spark">
                                        <Sparkline color="#DC2626" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="saas-grid-2">
                            {/* Student Demographics */}
                            <div className="saas-card">
                                <div className="card-header">
                                    <div className="card-title-group">
                                        <h3>Student Demographics</h3>
                                        <p>Distribution across departments</p>
                                    </div>
                                    <select 
                                        className="saas-select-sm"
                                        value={studentDeptFilter}
                                        onChange={e => setStudentDeptFilter(e.target.value)}
                                    >
                                        <option value="">All Departments</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="card-content chart-container">
                                    {studentChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <PieChart>
                                                <Pie
                                                    data={studentChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={100}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {studentChartData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    formatter={(value) => [`${value} Students`, 'Count']}
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="empty-chart">No student data available</div>
                                    )}
                                    
                                    {/* Custom Legend */}
                                    <div className="custom-legend">
                                        {studentChartData.map((entry, idx) => (
                                            <div className="legend-item" key={entry.name}>
                                                <div className="legend-dot" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                <span className="legend-label">{entry.name}</span>
                                                <span className="legend-val">{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Staff Overview */}
                            <div className="saas-card">
                                <div className="card-header">
                                    <div className="card-title-group">
                                        <h3>Faculty Overview</h3>
                                        <p>Faculty members per department</p>
                                    </div>
                                </div>
                                <div className="card-content chart-container pt-4">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart data={staffChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#64748B', fontSize: 12 }} 
                                                dy={10}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#64748B', fontSize: 12 }} 
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'var(--bg-app)' }}
                                                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', backgroundColor: 'var(--bg-surface)' }}
                                            />
                                            <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Outpass Intelligence */}
                        <div className="saas-card mt-6">
                            <div className="card-header border-bottom">
                                <div className="card-title-group">
                                    <h3>Outpass Intelligence</h3>
                                    <p>Monitor request volumes and approval workflows</p>
                                </div>
                                <div className="filter-group">
                                    <div className="segmented-control">
                                        {['today', 'weekly', 'monthly', ''].map(val => (
                                            <button 
                                                key={val}
                                                className={`segment-btn ${outpassDateFilter === val ? 'active' : ''}`}
                                                onClick={() => setOutpassDateFilter(val)}
                                            >
                                                {val === '' ? 'All Time' : val.charAt(0).toUpperCase() + val.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                    <select className="saas-select-sm" value={outpassStatusFilter} onChange={e => setOutpassStatusFilter(e.target.value)}>
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    <select className="saas-select-sm" value={outpassTypeFilter} onChange={e => setOutpassTypeFilter(e.target.value)}>
                                        <option value="">All Types</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Home">Home</option>
                                        <option value="Outing">Outing</option>
                                        <option value="OD">OD</option>
                                    </select>
                                    <select className="saas-select-sm" value={outpassDeptFilter} onChange={e => setOutpassDeptFilter(e.target.value)}>
                                        <option value="">All Depts</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="card-content outpass-charts-grid">
                                <div className="mini-chart-box">
                                    <h4>Requests by Status</h4>
                                    {outpassStatusData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={180}>
                                            <PieChart>
                                                <Pie
                                                    data={outpassStatusData}
                                                    cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                                                    paddingAngle={2} dataKey="value" stroke="none"
                                                >
                                                    {outpassStatusData.map((entry) => {
                                                        const c = entry.name === 'Approved' ? '#10B981' : entry.name === 'Pending' ? '#F59E0B' : '#EF4444';
                                                        return <Cell key={entry.name} fill={c} />;
                                                    })}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : <div className="empty-chart sm">No data</div>}
                                </div>
                                
                                <div className="mini-chart-box">
                                    <h4>Requests by Type</h4>
                                    {outpassTypeData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={180}>
                                            <PieChart>
                                                <Pie
                                                    data={outpassTypeData}
                                                    cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                                                    paddingAngle={2} dataKey="value" stroke="none"
                                                >
                                                    {outpassTypeData.map((entry, idx) => (
                                                        <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : <div className="empty-chart sm">No data</div>}
                                </div>
                            </div>
                        </div>

                        {/* Premium Data Table */}
                        <div className="saas-card mt-6">
                            <div className="card-header border-bottom">
                                <div className="card-title-group">
                                    <h3>Recent Requests</h3>
                                    <p>Latest outpass activity based on filters</p>
                                </div>
                                <button className="saas-btn-outline"><Filter size={14}/> Filters</button>
                            </div>
                            <div className="table-container">
                                {recentPasses.length > 0 ? (
                                    <table className="saas-table">
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Request Type</th>
                                                <th>Status</th>
                                                <th className="text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentPasses.slice(0, 8).map((pass, idx) => {
                                                const sStyle = getStatusStyle(pass.status);
                                                return (
                                                    <tr key={idx}>
                                                        <td>
                                                            <div className="table-user">
                                                                <div className="table-avatar">{pass.name?.charAt(0).toUpperCase()}</div>
                                                                <div>
                                                                    <div className="table-name">{pass.name}</div>
                                                                    <div className="table-email">{pass.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="type-badge">{pass.outpasstype}</span>
                                                        </td>
                                                        <td>
                                                            <span className="status-badge" style={{ backgroundColor: sStyle.bg, color: sStyle.text }}>
                                                                {pass.status}
                                                            </span>
                                                        </td>
                                                        <td className="text-right">
                                                            <ViewDetailsButton compact label="View" onClick={() => {}} />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="table-empty">
                                        <FileText size={32} />
                                        <h4>No requests found</h4>
                                        <p>Try adjusting your filters or date range.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {showExportModal && (
                    <div className="custom-modal-overlay">
                        <div className="custom-modal-content">
                            <div className="custom-modal-header">
                                <h3>Export Outpass Report</h3>
                                <button className="close-btn" onClick={() => setShowExportModal(false)}>✕</button>
                            </div>
                            <div className="custom-modal-body">
                                <p className="modal-desc">Configure the filters below before generating the report.</p>
                                
                                <div className="modal-field">
                                    <label>Outpass Type</label>
                                    <select 
                                        value={exportFilterType} 
                                        onChange={e => setExportFilterType(e.target.value)}
                                    >
                                        <option value="All">All Types</option>
                                        <option value="OD">OD</option>
                                        <option value="Home">Home Pass</option>
                                        <option value="Outing">Outing</option>
                                        <option value="Emergency">Emergency</option>
                                    </select>
                                </div>

                                <div className="modal-field">
                                    <label>Timeline / Applied Date</label>
                                    <select 
                                        value={exportFilterTime} 
                                        onChange={e => setExportFilterTime(e.target.value)}
                                    >
                                        <option value="All">All Time</option>
                                        <option value="Today">Today</option>
                                        <option value="This Week">This Week</option>
                                        <option value="This Month">This Month</option>
                                    </select>
                                </div>

                                <div className="modal-field">
                                    <label>Status</label>
                                    <select 
                                        value={exportFilterStatus} 
                                        onChange={e => setExportFilterStatus(e.target.value)}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                <div className="modal-field">
                                    <label>Search (Name / Register Number)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Search by student name or register number..." 
                                        value={exportSearchTerm}
                                        onChange={e => setExportSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="custom-modal-footer">
                                <button className="cancel-btn" onClick={() => setShowExportModal(false)} disabled={exportLoading}>Cancel</button>
                                <button className="confirm-btn" onClick={triggerExport} disabled={exportLoading}>
                                    {exportLoading ? 'Generating...' : 'Generate Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                /* Custom Modal Styles */
                .custom-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: modalFadeIn 0.2s ease-out;
                }
                .custom-modal-content {
                    background: white;
                    border-radius: 16px;
                    width: min(90vw, 480px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
                    overflow: hidden;
                    animation: modalScaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                @keyframes modalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalScaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .custom-modal-header {
                    padding: 16px 20px;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .custom-modal-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 650;
                    color: white;
                }
                .custom-modal-header .close-btn {
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 1.1rem;
                    cursor: pointer;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                .custom-modal-header .close-btn:hover {
                    opacity: 1;
                }
                .custom-modal-body {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .modal-desc {
                    margin: 0 0 4px 0;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
                .modal-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .modal-field label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-main);
                    text-align: left;
                }
                .modal-field select, .modal-field input {
                    padding: 10px 12px;
                    border: 1px solid var(--border-light);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    background: var(--bg-app);
                    color: var(--text-main);
                    outline: none;
                    box-sizing: border-box;
                    width: 100%;
                }
                .modal-field select:focus, .modal-field input:focus {
                    border-color: var(--primary);
                    background: white;
                }
                .custom-modal-footer {
                    padding: 16px 20px;
                    border-top: 1px solid var(--border-light);
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    background: var(--bg-app);
                }
                .custom-modal-footer button {
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .custom-modal-footer .cancel-btn {
                    background: white;
                    border: 1px solid var(--border-light);
                    color: var(--text-main);
                }
                .custom-modal-footer .cancel-btn:hover {
                    background: var(--bg-app);
                }
                .custom-modal-footer .confirm-btn {
                    background: var(--primary);
                    border: 1px solid var(--primary-hover);
                    color: white;
                }
                .custom-modal-footer .confirm-btn:hover {
                    background: var(--primary-hover);
                }

                /* Premium Enterprise SaaS Dashboard CSS */
                .saas-dashboard {
                    font-family: 'Inter', system-ui, sans-serif;
                    color: var(--text-main);
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }

                .mt-6 { margin-top: 24px; }
                .text-right { text-align: right; }

                /* Header Actions */
                .saas-header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .page-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin: 0 0 4px 0;
                }
                .page-desc {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    margin: 0;
                }
                .header-buttons {
                    display: flex;
                    gap: 12px;
                }

                /* Buttons */
                .saas-btn-primary {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--primary);
                    color: white;
                    border: 1px solid var(--primary-hover);
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    transition: all 0.2s;
                }
                .saas-btn-primary:hover { background: var(--primary-hover); }
                
                .saas-btn-outline {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bg-surface);
                    color: var(--text-main);
                    border: 1px solid var(--border-light);
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    transition: all 0.2s;
                }
                .saas-btn-outline:hover { background: var(--bg-app); border-color: var(--text-muted); }

                /* KPI Grid */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                    margin-bottom: 24px;
                }
                .kpi-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-light);
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: var(--shadow-sm);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                }
                .kpi-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }
                .kpi-icon-box {
                    width: 40px; height: 40px;
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                }
                .kpi-trend {
                    display: flex; align-items: center; gap: 4px;
                    font-size: 0.8rem; font-weight: 600;
                    padding: 2px 8px; border-radius: 99px;
                }
                .kpi-trend.positive { background: #F0FDF4; color: #16A34A; }
                .kpi-trend.negative { background: #FEF2F2; color: #DC2626; }
                .kpi-trend.neutral { background: var(--bg-app); color: var(--text-muted); }

                .kpi-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .kpi-label { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; margin: 0 0 4px 0; }
                .kpi-value { font-size: 1.8rem; font-weight: 700; color: var(--text-main); margin: 0; line-height: 1; letter-spacing: -0.02em; }
                .kpi-spark { height: 24px; opacity: 0.8; }

                /* SaaS Cards */
                .saas-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 24px;
                }
                @media (max-width: 1024px) {
                    .saas-grid-2 { grid-template-columns: 1fr; }
                }

                .saas-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-light);
                    border-radius: 12px;
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                }
                .card-header {
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .card-header.border-bottom { border-bottom: 1px solid var(--border-light); }
                .card-title-group h3 { font-size: 1.1rem; font-weight: 600; margin: 0 0 4px 0; }
                .card-title-group p { font-size: 0.85rem; color: var(--text-muted); margin: 0; }

                .card-content { padding: 0 24px 24px 24px; }
                .card-content.pt-4 { padding-top: 16px; }

                /* Selects & Filters */
                .saas-select-sm {
                    appearance: none;
                    background: var(--bg-app);
                    border: 1px solid var(--border-light);
                    color: var(--text-main);
                    padding: 6px 28px 6px 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 8px center;
                    background-size: 14px;
                }
                .saas-select-sm:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-subtle); }

                .filter-group { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
                
                .segmented-control {
                    display: flex;
                    background: var(--bg-app);
                    padding: 3px;
                    border-radius: 6px;
                }
                .segment-btn {
                    border: none; background: transparent;
                    padding: 4px 12px; border-radius: 4px;
                    font-size: 0.8rem; font-weight: 500; color: var(--text-muted);
                    cursor: pointer; transition: all 0.2s;
                }
                .segment-btn.active { background: var(--bg-surface); color: var(--text-main); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

                /* Charts */
                .chart-container { position: relative; }
                .empty-chart { display: flex; align-items: center; justify-content: center; height: 260px; color: var(--text-light); font-size: 0.9rem; }
                .empty-chart.sm { height: 180px; }

                .custom-legend {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    justify-content: center;
                    margin-top: 16px;
                }
                .legend-item { display: flex; align-items: center; font-size: 0.8rem; }
                .legend-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
                .legend-label { color: var(--text-muted); margin-right: 6px; }
                .legend-val { color: var(--text-main); font-weight: 600; }

                .outpass-charts-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    padding-top: 24px;
                }
                @media (max-width: 768px) { .outpass-charts-grid { grid-template-columns: 1fr; } }
                .mini-chart-box h4 { font-size: 0.9rem; font-weight: 600; color: var(--text-main); text-align: center; margin: 0 0 16px 0; }

                /* Data Table */
                .table-container { width: 100%; overflow-x: auto; }
                .saas-table { width: 100%; border-collapse: collapse; text-align: left; }
                .saas-table th {
                    padding: 12px 24px;
                    background: var(--bg-app);
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid var(--border-light);
                }
                .saas-table td {
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--border-light);
                    vertical-align: middle;
                }
                .saas-table tr:last-child td { border-bottom: none; }
                .saas-table tr:hover td { background: var(--bg-app); }

                .table-user { display: flex; align-items: center; gap: 12px; }
                .table-avatar {
                    width: 32px; height: 32px; border-radius: 50%;
                    background: var(--bg-app); color: var(--text-main); font-weight: 600; font-size: 0.85rem;
                    display: flex; align-items: center; justify-content: center;
                }
                .table-name { font-size: 0.9rem; font-weight: 500; color: var(--text-main); }
                .table-email { font-size: 0.8rem; color: var(--text-muted); }

                .type-badge { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
                .status-badge {
                    padding: 4px 10px; border-radius: 99px;
                    font-size: 0.75rem; font-weight: 600; text-transform: capitalize;
                }

                .table-empty {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 60px 20px; color: var(--text-light);
                }
                .table-empty h4 { color: var(--text-main); margin: 16px 0 4px 0; font-size: 1rem; }
                .table-empty p { font-size: 0.9rem; margin: 0; }

                /* Skeleton Loaders */
                .saas-skeleton-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 24px; }
                .skeleton { background: var(--border-light); border-radius: 12px; animation: pulse 1.5s infinite; }
                .card-skel { height: 140px; }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }

                @media (max-width: 768px) {
                    .saas-header-actions {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }
                    .header-buttons {
                        width: 100%;
                    }
                    .header-buttons button {
                        flex: 1;
                        justify-content: center;
                    }
                    .saas-skeleton-container {
                        grid-template-columns: 1fr;
                    }
                }
                `}</style>
            </div>
            <ToastContainer position="bottom-right" />
        </AdminLayout>
    );
};

export default AdminDashboard;
