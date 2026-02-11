import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';


const AdminDashboard: React.FC = () => {
    // Mock Data for the Dashboard
    const [stats] = useState({
        totalOutpasses: 154,
        pendingApprovals: 45,
        studentsOnLeave: 28,
        emergencyRequests: 2
    });

    const [chartData] = useState([
        { label: 'OD', value: 65, color: '#6366f1' },
        { label: 'Home Pass', value: 45, color: '#ec4899' },
        { label: 'Emergency', value: 12, color: '#ef4444' },
        { label: 'Medical', value: 24, color: '#f59e0b' },
    ]);

    useEffect(() => {
        // Fetch real dashboard stats here
        // const fetchStats = async () => { ... }
        // fetchStats();
    }, []);

    return (
        <AdminLayout title="Dashboard Overview">
            <div className="dashboard-container">
                {/* Stats Cards Row */}
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
                        <div className="card-icon green">🏃</div>
                        <div className="card-info">
                            <span className="count">{stats.studentsOnLeave}</span>
                            <span className="label">Students on Leave</span>
                            <span className="change negative">↓ 5% vs last week</span>
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
                </div>

                {/* Charts Area */}
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
                                <span>100</span>
                                <span>80</span>
                                <span>60</span>
                                <span>40</span>
                                <span>20</span>
                                <span>0</span>
                            </div>
                            <div className="bars">
                                {chartData.map((item, index) => (
                                    <div key={index} className="bar-group">
                                        <div
                                            className="bar"
                                            style={{
                                                height: `${item.value}%`,
                                                backgroundColor: item.color
                                            }}
                                        >
                                            <div className="tooltip">{item.value}</div>
                                        </div>
                                        <span className="bar-label">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Donut Chart / Summary Section */}
                    <div className="chart-card small">
                        <div className="chart-header">
                            <h3>Distribution</h3>
                        </div>
                        <div className="donut-chart-container">
                            <div className="donut-chart">
                                <div className="center-text">
                                    <strong>146</strong>
                                    <span>Total</span>
                                </div>
                            </div>
                            <div className="legend">
                                {chartData.map((item, index) => (
                                    <div key={index} className="legend-item">
                                        <span className="dot" style={{ background: item.color }}></span>
                                        <span className="name">{item.label}</span>
                                        <span className="value">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .stat-card {
                    background: white;
                    padding: 24px;
                    border-radius: 20px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    display: flex;
                    align-items: flex-start;
                    gap: 20px;
                    transition: transform 0.2s;
                    border: 1px solid #f3f4f6;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .card-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .card-icon.blue { background: #eff6ff; color: #3b82f6; }
                .card-icon.orange { background: #fff7ed; color: #f97316; }
                .card-icon.green { background: #f0fdf4; color: #22c55e; }
                .card-icon.red { background: #fef2f2; color: #ef4444; }

                .card-info {
                    display: flex;
                    flex-direction: column;
                }

                .count {
                    font-size: 28px;
                    font-weight: 700;
                    color: #111827;
                    line-height: 1;
                    margin-bottom: 4px;
                }

                .label {
                    color: #6b7280;
                    font-size: 14px;
                    margin-bottom: 8px;
                }

                .change {
                    font-size: 12px;
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 6px;
                    width: fit-content;
                }

                .change.positive { background: #ecfdf5; color: #059669; }
                .change.negative { background: #fef2f2; color: #dc2626; }
                .change.neutral { background: #f3f4f6; color: #4b5563; }

                /* Charts Grid */
                .charts-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                }

                .chart-card {
                    background: white;
                    padding: 24px;
                    border-radius: 20px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f3f4f6;
                }

                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }

                .chart-header h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #111827;
                }

                .btn-filter, .btn-export {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    color: #6b7280;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    margin-left: 8px;
                }

                /* Custom CSS Bar Chart */
                .bar-chart-container {
                    height: 300px;
                    display: flex;
                    gap: 16px;
                    padding-left: 40px;
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
                    color: #9ca3af;
                    font-size: 12px;
                }

                .bars {
                    flex: 1;
                    display: flex;
                    justify-content: space-around;
                    align-items: flex-end;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 10px;
                }

                .bar-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    height: 100%;
                    justify-content: flex-end;
                    width: 40px;
                }

                .bar {
                    width: 100%;
                    border-radius: 8px 8px 0 0;
                    position: relative;
                    transition: height 1s ease;
                    min-height: 4px;
                }

                .bar:hover .tooltip {
                    opacity: 1;
                    transform: translateX(-50%) translateY(-10px);
                }

                .tooltip {
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1f2937;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    opacity: 0;
                    transition: all 0.2s;
                    pointer-events: none;
                }
                
                .bar-label {
                    font-size: 12px;
                    color: #6b7280;
                    font-weight: 500;
                }

                /* Donut Chart Simulation with CSS Conic Gradient */
                .donut-chart-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                }

                .donut-chart {
                    width: 200px;
                    height: 200px;
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
                }

                .donut-chart::before {
                    content: '';
                    position: absolute;
                    width: 140px;
                    height: 140px;
                    background: white;
                    border-radius: 50%;
                }

                .center-text {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                }

                .center-text strong {
                    font-size: 32px;
                    font-weight: 700;
                    color: #111827;
                }

                .center-text span {
                    font-size: 14px;
                    color: #6b7280;
                }

                .legend {
                    width: 100%;
                    display: grid;
                    gap: 12px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 14px;
                }

                .legend-item .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    margin-right: 8px;
                }

                .legend-item .name {
                    flex: 1;
                    color: #6b7280;
                }

                .legend-item .value {
                    font-weight: 600;
                    color: #111827;
                }

                @media (max-width: 1024px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </AdminLayout>
    );
};

export default AdminDashboard;
