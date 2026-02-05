import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Staff } from '../../data/sampleData';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import StaffHeader from '../../components/StaffHeader';

const StaffDashboard: React.FC = () => {
    const [staff, setStaff] = useState<Staff | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStaffData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/staff/profile`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.status === 200) {
                    setStaff(response.data.staff);
                };
            } catch (error: any) {
                toast.error("Failed to fetch staff data");
            }
        }


        fetchStaffData();
    }, []);


    if (!staff) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="staff-dashboard">
            <ToastContainer position="bottom-right" />
            <StaffHeader activeMenu="dashboard" />

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="content-container">
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <div className="welcome-content">
                            <h1>Welcome back, {staff.name}! 👋</h1>
                            <p className="welcome-subtitle">{staff.designation} • {staff.department}</p>
                        </div>
                        <div className="stats-mini">
                            <div className="stat-mini">
                                <span className="stat-mini-icon">📚</span>
                                <div>
                                    <div className="stat-mini-value">{staff.subjects.length}</div>
                                    <div className="stat-mini-label">Subjects</div>
                                </div>
                            </div>
                            <div className="stat-mini">
                                <span className="stat-mini-icon">🎓</span>
                                <div>
                                    <div className="stat-mini-value">120</div>
                                    <div className="stat-mini-label">Students</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <section className="quick-actions-section">
                        <h2 className="section-title">Quick Actions</h2>
                        <div className="quick-actions-grid">
                            <div
                                className="action-card"
                                onClick={() => navigate('/staff-profile')}
                            >
                                <div className="action-icon-wrapper">
                                    <span className="action-icon">👤</span>
                                </div>
                                <h3 className="action-title">My Profile</h3>
                                <p className="action-description">View and edit your profile details</p>
                                <div className="action-arrow">→</div>
                            </div>

                            <div
                                className="action-card"
                                onClick={() => navigate('/passApproval')}
                            >
                                <div className="action-icon-wrapper">
                                    <span className="action-icon">📋</span>
                                </div>
                                <h3 className="action-title">View Outpass Requests</h3>
                                <p className="action-description">Review student outpass applications</p>
                                <div className="action-arrow">→</div>
                            </div>

                            <div
                                className="action-card"
                                onClick={() => navigate('/passApproval')}
                            >
                                <div className="action-icon-wrapper">
                                    <span className="action-icon">⏳</span>
                                </div>
                                <h3 className="action-title">Pending Approvals</h3>
                                <p className="action-description">Approve or reject pending requests</p>
                                <div className="action-arrow">→</div>
                            </div>
                        </div>
                    </section>

                    {/* Department Info */}
                    <section className="info-section">
                        <div className="info-card">
                            <div className="info-card-header">
                                <div className="info-header-left">
                                    <span className="info-icon">🏛️</span>
                                    <div>
                                        <h3>Department of Information Technology</h3>
                                        <p className="info-subtitle">Academic Overview</p>
                                    </div>
                                </div>
                                <span className="dept-badge">IT Dept</span>
                            </div>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-item-icon">👨‍🏫</span>
                                    <div className="info-item-content">
                                        <label>Head of Department</label>
                                        <p>Dr. Selvam</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="info-item-icon">📋</span>
                                    <div className="info-item-content">
                                        <label>Total Staff</label>
                                        <p>{staff ? 1 : 0}</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="info-item-icon">🎓</span>
                                    <div className="info-item-content">
                                        <label>Total Students</label>
                                        <p>120</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="info-item-icon">📅</span>
                                    <div className="info-item-content">
                                        <label>Academic Year</label>
                                        <p>2023-2024</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .staff-dashboard {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
                }

                .loading-screen {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    font-size: 1.5rem;
                    color: #64748b;
                }

                /* Fixed Header */
                /* Removed - using StaffHeader component */

                /* Main Content */
                .dashboard-main {
                    padding: 40px 20px;
                }

                .content-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                /* Welcome Section */
                .welcome-section {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    border-radius: 24px;
                    padding: 40px;
                    margin-bottom: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 10px 30px rgba(0, 71, 171, 0.2);
                    color: white;
                }

                .welcome-content h1 {
                    font-size: 2.2rem;
                    margin-bottom: 8px;
                    font-weight: 700;
                    color: white;
                }

                .welcome-subtitle {
                    font-size: 1.1rem;
                    opacity: 0.9;
                }

                .stats-mini {
                    display: flex;
                    gap: 24px;
                }

                .stat-mini {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    padding: 20px 28px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .stat-mini-icon {
                    font-size: 2rem;
                }

                .stat-mini-value {
                    font-size: 1.8rem;
                    font-weight: 700;
                }

                .stat-mini-label {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }

                /* Quick Actions */
                .quick-actions-section {
                    margin-bottom: 32px;
                }

                .section-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 24px;
                }

                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                }

                .action-card {
                    background: white;
                    border-radius: 20px;
                    padding: 32px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 2px solid transparent;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                    position: relative;
                    overflow: hidden;
                }

                .action-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(90deg, #0047AB, #2563eb);
                    transform: scaleX(0);
                    transition: transform 0.3s;
                }

                .action-card:hover {
                    transform: translateY(-8px);
                    border-color: #0047AB;
                    box-shadow: 0 12px 28px rgba(0, 71, 171, 0.15);
                }

                .action-card:hover::before {
                    transform: scaleX(1);
                }

                .action-icon-wrapper {
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #eff6ff, #dbeafe);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    transition: all 0.3s;
                }

                .action-card:hover .action-icon-wrapper {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    transform: scale(1.1) rotate(5deg);
                }

                .action-icon {
                    font-size: 2rem;
                    transition: all 0.3s;
                }

                .action-card:hover .action-icon {
                    filter: brightness(0) invert(1);
                }

                .action-title {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 8px;
                }

                .action-description {
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 16px;
                }

                .action-arrow {
                    color: #0047AB;
                    font-size: 1.5rem;
                    font-weight: 700;
                    transition: all 0.3s;
                }

                .action-card:hover .action-arrow {
                    transform: translateX(8px);
                }

                /* Info Section */
                .info-section {
                    margin-bottom: 32px;
                }

                .info-card {
                    background: white;
                    border-radius: 20px;
                    padding: 32px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e2e8f0;
                }

                .info-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 28px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #f1f5f9;
                }

                .info-header-left {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                }

                .info-icon {
                    font-size: 2rem;
                    background: #eff6ff;
                    padding: 12px;
                    border-radius: 12px;
                }

                .info-card-header h3 {
                    font-size: 1.3rem;
                    color: #1e293b;
                    margin-bottom: 4px;
                }

                .info-subtitle {
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .dept-badge {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }

                .info-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 16px;
                    transition: all 0.3s;
                }

                .info-item:hover {
                    background: #eff6ff;
                    transform: translateY(-2px);
                }

                .info-item-icon {
                    font-size: 1.8rem;
                    background: white;
                    padding: 10px;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .info-item-content label {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 6px;
                }

                .info-item-content p {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                /* Responsive */
                @media (max-width: 768px) {

                    .dashboard-main {
                        padding: 24px 16px;
                    }

                    .welcome-section {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 24px;
                        padding: 28px 24px;
                    }

                    .welcome-content h1 {
                        font-size: 1.8rem;
                    }

                    .stats-mini {
                        width: 100%;
                        flex-direction: column;
                        gap: 12px;
                    }

                    .stat-mini {
                        width: 100%;
                    }

                    .quick-actions-grid {
                        grid-template-columns: 1fr;
                    }

                    .info-grid {
                        grid-template-columns: 1fr;
                    }

                    .section-title {
                        font-size: 1.3rem;
                    }

                    .info-card-header {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .dept-badge {
                        align-self: flex-start;
                    }
                }

                @media (max-width: 480px) {
                    /* Header styles removed */
                }
            `}</style>
        </div>
    );
};

export default StaffDashboard;
