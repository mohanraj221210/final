import React, { useState, useEffect } from 'react';
import YearInchargeNav from '../../components/YearInchargeNav';
import Loader from '../../components/Loader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

interface User {
    name: string;
    registerNumber: string;
    department: string;
    year: string;
    email: string;
}

const YearInchargeDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User>({
        name: "Year Incharge",
        registerNumber: "INCHARGE001",
        department: "Administration",
        year: "N/A",
        email: "incharge@jit.edu"
    });
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    const navigate = useNavigate();
    const [zoomingPath, setZoomingPath] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/year-incharge-login');
                return;
            }

            try {
                // Fetch Profile
                const profileResponse = await axios.get(`${import.meta.env.VITE_API_URL}/incharge/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (profileResponse.status === 200) {
                    // Ensure we handle the user data correctly if it comes nested
                    const userData = profileResponse.data.user || profileResponse.data;
                    setUser({
                        name: userData.name || "Year Incharge",
                        registerNumber: userData.registerNumber || "INCHARGE001",
                        department: userData.department || "Administration",
                        year: userData.year || "N/A",
                        email: userData.email || "incharge@jit.edu"
                    });
                }

                // Fetch Outpasses for Stats
                const outpassResponse = await axios.get(`${import.meta.env.VITE_API_URL}/incharge/outpass/list`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (outpassResponse.status === 200) {
                    const outpasses = outpassResponse.data.outpasslist || [];
                    const pending = outpasses.filter((o: any) =>
                        o.staffapprovalstatus === 'approved' &&
                        o.yearinchargeapprovalstatus === 'pending'
                    ).length;

                    // Approved by year incharge
                    const approved = outpasses.filter((o: any) => o.yearinchargeapprovalstatus === 'approved').length;

                    // Rejected by year incharge
                    const rejected = outpasses.filter((o: any) => o.yearinchargeapprovalstatus === 'rejected').length;

                    setStats({
                        total: outpasses.length,
                        pending,
                        approved,
                        rejected
                    });

                    // Check for Emergency Requests
                    const emergencyRequests = outpasses.filter((o: any) =>
                        (o.outpasstype || '').toLowerCase() === 'emergency' &&
                        o.yearinchargeapprovalstatus === 'pending'
                    );

                    if (emergencyRequests.length > 0) {
                        toast.error(`⚠️ ${emergencyRequests.length} Emergency Request(s) Pending!`, {
                            position: "top-center",
                            autoClose: false,
                            hideProgressBar: false,
                            closeOnClick: false,
                            pauseOnHover: true,
                            draggable: true,
                            theme: "colored",
                            style: { fontWeight: 'bold', fontSize: '16px' }
                        });
                    }
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleQuickAction = (path: string) => {
        setZoomingPath(path);
        setTimeout(() => {
            navigate(path);
        }, 700);
    };

    if (loading) {
        return (
            <div className="page-container dashboard-page">
                <YearInchargeNav />
                <div className="content-wrapper">
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container dashboard-page">
            <ToastContainer position="bottom-right" />
            <YearInchargeNav />
            <div className="content-wrapper">

                {/* Hero Section */}
                <div className="dashboard-hero">
                    <div className="hero-welcome">
                        <div>
                            <span className="badge">Welcome Back</span>
                        </div>
                        <div>
                            <h1 style={{ color: 'skyblue', marginTop: '20px' }}>Hello, {user.name}! 👋</h1>
                            <p style={{ color: 'skyblue' }}>
                                Year Incharge • {user.department}
                            </p>
                        </div>
                    </div>
                    <div className="hero-stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon blue">📊</div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.total}</span>
                                <span className="stat-label">Total Requests</span>
                            </div>
                        </div>
                        {/* cmd
                        <div className="stat-card">
                            <div className="stat-icon green">✅</div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.approved}</span>
                                <span className="stat-label">Approved</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon red">❌</div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.rejected}</span>
                                <span className="stat-label">Rejected</span>
                            </div>
                        </div>
                        cmd */}
                    </div>
                </div>

                <div className="dashboard-layout">
                    <div className="main-content">
                        {/* Quick Actions */}
                        <section className="section">
                            <h2 className="section-title">Quick Actions</h2>
                            <div className="quick-links-grid">

                                {/* Pending Outpass */}
                                <div
                                    className={`action-card ${zoomingPath === '/year-incharge/pending-outpass' ? 'zooming' : ''}`}
                                    onClick={() => handleQuickAction('/year-incharge/pending-outpass')}
                                >
                                    <span className="action-icon">⏳</span>
                                    <span className="action-text">Pending Outpass</span>
                                </div>

                                {/* Outpass List */}
                                <div
                                    className={`action-card ${zoomingPath === '/year-incharge/outpass-list' ? 'zooming' : ''}`}
                                    onClick={() => handleQuickAction('/year-incharge/outpass-list')}
                                >
                                    <span className="action-icon">✅</span>
                                    <span className="action-text">Outpass List</span>
                                </div>

                                {/* Profile */}
                                <div
                                    className={`action-card ${zoomingPath === '/year-incharge-profile' ? 'zooming' : ''}`}
                                    onClick={() => handleQuickAction('/year-incharge-profile')}
                                >
                                    <span className="action-icon">👤</span>
                                    <span className="action-text">Profile</span>
                                </div>

                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <style>{`
                .dashboard-hero {
                    background: linear-gradient(-45deg, #0047AB, #00214D, #1e3a8a, #0f172a);
                    background-size: 400% 400%;
                    animation: aurora 15s ease infinite;
                    border-radius: 24px;
                    padding: 40px;
                    margin-bottom: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
                    position: relative;
                    overflow: hidden;
                    color: white;
                }

                .dashboard-hero::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: 
                        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 40%);
                    animation: pulse-glow 8s ease-in-out infinite alternate;
                    z-index: 0;
                }

                .hero-stats-grid {
                    display: flex;
                    gap: 24px;
                    position: relative;
                    z-index: 1;
                    perspective: 1000px;
                    flex-wrap: wrap; /* Allow wrapping on smaller screens */
                    justify-content: flex-end;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(12px);
                    padding: 20px 28px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    min-width: 160px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-style: preserve-3d;
                }

                .stat-card:hover {
                    transform: translateY(-5px) rotateX(5deg) scale(1.05);
                    background: rgba(255, 255, 255, 0.2);
                    box-shadow: 
                        0 20px 40px rgba(0,0,0,0.3),
                        0 0 20px rgba(255,255,255,0.2) inset;
                    border-color: rgba(255,255,255,0.6);
                }
                
                .stat-icon {
                     font-size: 24px;
                 }

                .section {
                    margin-bottom: 32px;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .quick-links-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 20px;
                    perspective: 1000px;
                    padding-bottom: 20px;
                }

                .action-card {
                    background: white;
                    padding: 24px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    text-align: center;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
                    cursor: pointer;
                }

                .action-card.zooming {
                    animation: zoom-in-nav 0.6s cubic-bezier(0.7, 0, 0.3, 1) forwards;
                    z-index: 100;
                    pointer-events: none;
                }

                @keyframes zoom-in-nav {
                    0% { transform: scale(1); opacity: 1; }
                    50% { opacity: 0.8; }
                    100% { transform: scale(20); opacity: 0; }
                }

                .action-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 50px rgba(255, 255, 255, 0.17);
                }
                
                .action-icon {
                    font-size: 36px;
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
                    width: 72px;
                    height: 72px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    color: var(--primary);
                    border: 1px solid rgba(0, 0, 0, 0.03);
                    position: relative;
                    z-index: 2;
                }

                .action-card:hover .action-icon {
                    background: #8eb7f0ff;
                    color: white;
                    transform: scale(1.15) rotate(10deg);
                    box-shadow: 0 15px 30px rgba(0, 70, 168, 0.78);
                }

                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
                
                .hero-welcome .badge {
                    animation: pulse-glow 3s infinite;
                   
                }
                
               @media (max-width: 968px) {
                    .dashboard-hero { flex-direction: column; align-items: flex-start; gap: 24px; }
                    .hero-stats-grid { width: 100%; justify-content: flex-start; }
                    
                }
                
            `}</style>
        </div>
    );
};

export default YearInchargeDashboard;
