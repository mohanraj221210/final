import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';

const AdminDashboard: React.FC = () => {
    // Stats Data
    const [stats, setStats] = useState({
        totalOutpasses: 0,
        pendingApprovals: 0,
        emergencyRequests: 0,
        studentsOnLeave: 0
    });

    const [chartData, setChartData] = useState([
        { label: 'OD', value: 0, color: '#6366f1' },
        { label: 'Home Pass', value: 0, color: '#ec4899' },
        { label: 'Emergency', value: 0, color: '#ef4444' },
        { label: 'Outing Pass', value: 0, color: '#f59e0b' },
    ]);

    // Admin Profile Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const outpassData = await adminService.getOutpassStats();

                if (outpassData) {
                    setStats(prev => ({
                        ...prev,
                        ...outpassData.stats
                    }));
                    setChartData(outpassData.chartData);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };
        fetchData();
    }, []);

    return (
        <AdminLayout title="Dashboard" activeMenu="dashboard">
            <div className="admin-dashboard">
                {/* Welcome Section */}
                {/* <div className="welcome-section">
                    <div className="welcome-content">
                        <h1>Welcome back, {adminName}! 👋</h1>
                        <p className="welcome-subtitle">{role} • JIT Admin Portal</p>
                    </div>
                    <div className="stats-mini">
                        <div className="stat-mini">
                            <span className="stat-mini-icon">👨‍🎓</span>
                            <div>
                                <div className="stat-mini-value">500+</div>
                                <div className="stat-mini-label">Students</div>
                            </div>
                        </div>
                        <div className="stat-mini">
                            <span className="stat-mini-icon">👨‍🏫</span>
                            <div>
                                <div className="stat-mini-value">50+</div>
                                <div className="stat-mini-label">Staff</div>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* Quick Actions */}
                {/* <section className="quick-actions-section">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="quick-actions-grid">
                        <div className="action-card" onClick={() => navigate('/admin/manage-student')}>
                            <div className="action-icon-wrapper">
                                <span className="action-icon">➕</span>
                            </div>
                            <h3 className="action-title">Add Student</h3>
                            <p className="action-description">Register a new student</p>
                            <div className="action-arrow">→</div>
                        </div>

                        <div className="action-card" onClick={() => navigate('/admin/manage-staff')}>
                            <div className="action-icon-wrapper">
                                <span className="action-icon">👥</span>
                            </div>
                            <h3 className="action-title">Manage Staff</h3>
                            <p className="action-description">View staff details</p>
                            <div className="action-arrow">→</div>
                        </div>

                        <div className="action-card" onClick={() => navigate('/admin/manage-warden')}>
                            <div className="action-icon-wrapper">
                                <span className="action-icon">🏠</span>
                            </div>
                            <h3 className="action-title">Manage Warden</h3>
                            <p className="action-description">Hostel management</p>
                            <div className="action-arrow">→</div>
                        </div>
                    </div>
                </section> */}

                {/* Overview Stats (Existing functionality styled nicely) */}
                <h2 className="section-title">Overview</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="card-icon blue">📄</div>
                        <div className="card-info">
                            <span className="count">{stats.totalOutpasses}</span>
                            <span className="label">Total Outpasses</span>
                            <span className="change positive">↑ 12% vs last week</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="card-icon orange">⏳</div>
                        <div className="card-info">
                            <span className="count">{stats.pendingApprovals}</span>
                            <span className="label">Pending Approval</span>
                            <span className="change neutral">-- same as yesterday</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="card-icon red">🚨</div>
                        <div className="card-info">
                            <span className="count">{stats.emergencyRequests}</span>
                            <span className="label">Emergency Requests</span>
                            <span className="change negative">⚠️ Action Required</span>
                        </div>
                    </div>
                    {/* <div className="stat-card">
                        <div className="card-icon green">🏃</div>
                        <div className="card-info">
                            <span className="count">{stats.studentsOnLeave}</span>
                            <span className="label">Students on Leave</span>
                            <span className="change negative">↓ 5% vs last week</span>
                        </div>
                    </div> */}
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                    {/* Bar Chart Section */}
                    <div className="chart-card large">
                        <div className="chart-header">
                            <h3>Outpass Statistics</h3>
                            <div className="chart-actions">
                                <button className="btn-filter">Weekly</button>
                                <button className="btn-export">Export</button>
                            </div>
                        </div>
                        <div className="bar-chart-container">
                            <div className="y-axis">
                                <span>Max</span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span>0</span>
                            </div>
                            <div className="bars">
                                {(() => {
                                    const maxVal = Math.max(...chartData.map(d => d.value), 10);
                                    return chartData.map((item, index) => (
                                        <div key={index} className="bar-group">
                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${(item.value / maxVal) * 80}%`,
                                                    backgroundColor: item.color
                                                }}
                                            >
                                                <div className="tooltip">{item.value}</div>
                                            </div>
                                            <span className="bar-label">{item.label}</span>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Donut Chart / Summary Section */}
                    <div className="chart-card small">
                        <div className="chart-header">
                            <h3>Distribution</h3>
                        </div>
                        <div className="donut-chart-container">
                            {(() => {
                                const total = stats.totalOutpasses || 1;
                                let current = 0;
                                const gradient = chartData.map(item => {
                                    const percent = (item.value / total) * 100;
                                    const start = current;
                                    current += percent;
                                    return `${item.color} ${start}% ${current}%`;
                                }).join(', ');

                                return (
                                    <div className="donut-chart" style={{ background: `conic-gradient(${gradient})` }}>
                                        <div className="center-text">
                                            <strong>{stats.totalOutpasses}</strong>
                                            <span>Total</span>
                                        </div>
                                    </div>
                                );
                            })()}
                            <div className="legend">
                                {chartData.map((item, index) => (
                                    <div key={index} className="legend-item">
                                        <span className="dot" style={{ background: item.color }}></span>
                                        <span className="name">{item.label}</span>
                                        <span className="value">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                /* Global Dashboard Styles */
                .admin-dashboard {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    color: #1e293b;
                    max-width: 1600px;
                    margin: 0 auto;
                }

                /* Welcome Section */
                .welcome-section {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    border-radius: 24px;
                    padding: 40px 48px;
                    margin-bottom: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.3);
                    color: white;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .welcome-section::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background-image: 
                        radial-gradient(circle at 100% 0%, rgba(255,255,255,0.2) 0%, transparent 30%), 
                        radial-gradient(circle at 0% 100%, rgba(255,255,255,0.1) 0%, transparent 30%);
                    pointer-events: none;
                }

                .welcome-content {
                    position: relative;
                    z-index: 2;
                }

                .welcome-content h1 {
                    font-size: 2.25rem;
                    margin-bottom: 8px;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.025em;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .welcome-subtitle {
                    font-size: 1.1rem;
                    opacity: 0.95;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .stats-mini {
                    display: flex;
                    gap: 24px;
                    position: relative;
                    z-index: 2;
                }

                .stat-mini {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    padding: 20px 32px;
                    border-radius: 18px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }
                
                .stat-mini:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px rgba(0,0,0,0.1);
                    border-color: rgba(255, 255, 255, 0.3);
                }

                .stat-mini-icon {
                    font-size: 2rem;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
                }

                .stat-mini-value {
                    font-size: 1.75rem;
                    font-weight: 800;
                    line-height: 1;
                    letter-spacing: -0.02em;
                }

                .stat-mini-label {
                    font-size: 0.9rem;
                    opacity: 0.9;
                    font-weight: 500;
                    margin-top: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                /* Section Titles */
                .section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 48px 0 24px;
                    display: flex;
                    align-items: center;
                    letter-spacing: -0.01em;
                }
                
                .section-title::before {
                    content: "";
                    display: inline-block;
                    width: 6px;
                    height: 24px;
                    background: #2563eb;
                    border-radius: 4px;
                    margin-right: 12px;
                }

                .section-title:first-of-type {
                    margin-top: 0;
                }

                /* Quick Actions */
                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 32px;
                }

                .action-card {
                    background: white;
                    border-radius: 20px;
                    padding: 32px;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .action-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                    border-color: #bfdbfe;
                }

                .action-icon-wrapper {
                    width: 64px;
                    height: 64px;
                    background: #f1f5f9;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    transition: all 0.3s ease;
                    border: 1px solid #e2e8f0;
                }

                .action-card:hover .action-icon-wrapper {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #2563eb;
                    transform: scale(1.05);
                }

                .action-icon {
                    font-size: 2rem;
                    transition: transform 0.3s ease;
                    color: #64748b;
                }

                .action-card:hover .action-icon {
                    transform: rotate(10deg);
                    color: #2563eb;
                }

                .action-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 8px;
                    letter-spacing: -0.01em;
                }

                .action-description {
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 24px;
                    flex-grow: 1;
                }

                .action-arrow {
                    color: #cbd5e1;
                    font-size: 1.5rem;
                    font-weight: 600;
                    align-self: flex-end;
                    transition: all 0.3s ease;
                }

                .action-card:hover .action-arrow {
                    color: #2563eb;
                    transform: translateX(6px);
                }

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 32px;
                    margin-bottom: 40px;
                }

                .stat-card {
                    background: white;
                    padding: 32px;
                    border-radius: 20px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    display: flex;
                    align-items: flex-start;
                    gap: 24px;
                    transition: all 0.3s ease;
                    border: 1px solid #e2e8f0;
                    position: relative;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.08);
                    border-color: #cbd5e1;
                }

                .card-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    flex-shrink: 0;
                    transition: transform 0.3s ease;
                }
                
                .stat-card:hover .card-icon {
                    transform: scale(1.1);
                }

                .card-icon.blue { background: #eff6ff; color: #3b82f6; }
                .card-icon.orange { background: #fff7ed; color: #f97316; }
                .card-icon.green { background: #f0fdf4; color: #22c55e; }
                .card-icon.red { background: #fef2f2; color: #ef4444; }

                .card-info {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }

                .count {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #1e293b;
                    line-height: 1;
                    margin-bottom: 6px;
                    letter-spacing: -0.03em;
                }

                .label {
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                }

                .change {
                    font-size: 0.8rem;
                    font-weight: 600;
                    padding: 6px 12px;
                    border-radius: 99px;
                    width: fit-content;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .change.positive { background: #dcfce7; color: #166534; }
                .change.negative { background: #fee2e2; color: #991b1b; }
                .change.neutral { background: #f1f5f9; color: #475569; }

                /* Charts */
                 .charts-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 32px;
                }

                .chart-card {
                    background: white;
                    padding: 36px;
                    border-radius: 20px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                }

                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }

                .chart-header h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                    letter-spacing: -0.01em;
                }

                .btn-filter, .btn-export {
                    padding: 10px 18px;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-left: 10px;
                    transition: all 0.2s;
                }

                .btn-filter:hover, .btn-export:hover {
                    background: #f8fafc;
                    color: #1e293b;
                    border-color: #cbd5e1;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                /* Custom CSS Bar Chart */
                .bar-chart-container {
                    height: 360px;
                    display: flex;
                    gap: 32px;
                    padding-left: 48px;
                    position: relative;
                }

                .y-axis {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 30px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    color: #94a3b8;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .bars {
                    flex: 1;
                    display: flex;
                    justify-content: space-around;
                    align-items: flex-end;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 12px;
                }

                .bar-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    height: 100%;
                    justify-content: flex-end;
                    width: 56px;
                    position: relative;
                }
                
                .bar-group::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: #f1f5f9;
                    z-index: 0;
                    border-left: 1px dashed #e2e8f0;
                }

                .bar {
                    width: 100%;
                    border-radius: 8px 8px 0 0;
                    position: relative;
                    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                    min-height: 4px;
                    z-index: 1;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                
                .bar:hover {
                    filter: brightness(1.1);
                    transform: scaleY(1.02);
                }

                .bar:hover .tooltip {
                    opacity: 1;
                    transform: translateX(-50%) translateY(-12px);
                }

                .tooltip {
                    position: absolute;
                    top: -44px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1e293b;
                    color: white;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    opacity: 0;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    pointer-events: none;
                    white-space: nowrap;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
                    z-index: 10;
                }
                
                .tooltip::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 5px;
                    border-style: solid;
                    border-color: #1e293b transparent transparent transparent;
                }

                .bar-label {
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 600;
                    z-index: 1;
                    background: white;
                    padding: 0 4px;
                }

                /* Donut Chart */
                .donut-chart-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 32px;
                    justify-content: center;
                    height: 100%;
                }

                .donut-chart {
                    width: 240px;
                    height: 240px;
                    border-radius: 50%;
                    background: conic-gradient(
                        #6366f1 0% 41%, 
                        #ec4899 41% 69%, 
                        #ef4444 69% 77%, 
                        #f59e0b 77% 100%
                    );
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 0 20px rgba(241, 245, 249, 0.5);
                }

                .donut-chart::before {
                    content: '';
                    position: absolute;
                    width: 170px;
                    height: 170px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
                }

                .center-text {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                }

                .center-text strong {
                    font-size: 2.75rem;
                    font-weight: 800;
                    color: #1e293b;
                    line-height: 1;
                    letter-spacing: -0.03em;
                }

                .center-text span {
                    font-size: 0.95rem;
                    color: #64748b;
                    font-weight: 600;
                    margin-top: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .legend {
                    width: 100%;
                    display: grid;
                    gap: 16px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    padding: 12px 16px;
                    border-radius: 12px;
                    background: #f8fafc;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                
                .legend-item:hover {
                    background: #f1f5f9;
                    border-color: #e2e8f0;
                    transform: translateX(4px);
                }

                .legend-item .dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 4px;
                    margin-right: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .legend-item .name {
                    flex: 1;
                    color: #475569;
                    font-weight: 600;
                }

                .legend-item .value {
                    font-weight: 700;
                    color: #1e293b;
                }

                @media (max-width: 1024px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                    .stats-mini {
                        width: 100%;
                        flex-direction: column;
                    }
                    .welcome-section {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 32px;
                    }
                    .stat-mini {
                        width: 100%;
                    }
                }
            `}</style>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
