import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import StudentHeader from '../../components/StudentHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import StudentBottomNav from '../../components/StudentBottomNav';
import { motion } from 'framer-motion';

const BusRoutes: React.FC = () => {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bus/routes`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.status === 200 && response.data) {
                    const fetchedRoutes = response.data.busRoutes || response.data.routes || response.data || [];
                    setRoutes(Array.isArray(fetchedRoutes) ? fetchedRoutes : []);
                }
            } catch (error) {
                console.error("Failed to fetch bus routes:", error);
                toast.error("Could not load bus routes at this time.");
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, []);

    const filteredRoutes = routes.filter(route => {
        const busNo = route.busnumber || '';
        const boardPoints = Array.isArray(route.boardingpoints) ? route.boardingpoints.join(' ') : '';
        const rName = route.route || '';
        const dName = route.drivername || '';
        const searchLow = search.toLowerCase();
        
        return busNo.toLowerCase().includes(searchLow) ||
               boardPoints.toLowerCase().includes(searchLow) ||
               rName.toLowerCase().includes(searchLow) ||
               dName.toLowerCase().includes(searchLow);
    });

    return (
        <div className="pb-bus-routes-page">
            <ToastContainer position="top-center" />
            <div className="pb-bus-routes-header-wrapper">
                <StudentHeader />
            </div>
            <main className="student-content">
                <div className="content-wrapper">
                    {/* Back link */}
                    <div className="pb-back-link-wrapper lux-desktop-view">
                        <button className="pb-btn-back" onClick={() => navigate('/dashboard')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            Back to Dashboard
                        </button>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="pb-page-header-card"
                    >
                        <div className="pb-header-content">
                            <h1 className="pb-page-title">Bus Tracking & Routes</h1>
                            <p className="pb-page-subtitle">View all available college bus routes and boarding points.</p>
                        </div>
                        <div className="pb-search-box">
                            <span className="pb-search-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </span>
                            <input 
                                type="text" 
                                placeholder="Search by Bus No, Route or Point..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pb-search-input"
                            />
                        </div>
                    </motion.div>

                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="pb-routes-grid"
                        >
                            {filteredRoutes.length > 0 ? (
                                filteredRoutes.map((route, index) => (
                                    <motion.div 
                                        key={route._id || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="pb-route-card"
                                    >
                                        <div className="pb-route-header">
                                            <div className="pb-bus-icon">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="4" y="3" width="16" height="18" rx="2" />
                                                    <rect x="8" y="7" width="8" height="6" rx="1" />
                                                    <path d="M6 21v-2" />
                                                    <path d="M18 21v-2" />
                                                    <circle cx="8" cy="17" r="1" />
                                                    <circle cx="16" cy="17" r="1" />
                                                    <path d="M4 11h16" />
                                                </svg>
                                            </div>
                                            <h2>Bus {route.busnumber || 'N/A'} <span className="pb-route-sub-no">(Route {route.routenumber || 'N/A'})</span></h2>
                                        </div>
                                        <div className="pb-route-details">
                                            <div className="pb-detail-row">
                                                <span className="pb-label">Destination</span>
                                                <span className="pb-val" style={{textTransform: 'capitalize'}}>{route.route || 'N/A'}</span>
                                            </div>
                                            <div className="pb-detail-row">
                                                <span className="pb-label">Driver</span>
                                                <span className="pb-val" style={{textTransform: 'capitalize'}}>{route.drivername || 'Not Assigned'}</span>
                                            </div>
                                            <div className="pb-detail-row">
                                                <span className="pb-label">Contact</span>
                                                <span className="pb-val">{route.driverphone || 'N/A'}</span>
                                            </div>
                                            {route.boardingpoints && route.boardingpoints.length > 0 && (
                                                <div className="pb-boarding-points-section">
                                                    <span className="pb-label">Boarding Points</span>
                                                    <div className="pb-boarding-points-list">
                                                        {route.boardingpoints.map((bp: string, i: number) => (
                                                            <span key={i} className="pb-bp-chip">{bp}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {route.trackerlink && (
                                                <a href={route.trackerlink} target="_blank" rel="noopener noreferrer" className="pb-track-btn">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                                                    Live Track Bus
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="pb-empty-card">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="4" y="3" width="16" height="18" rx="2" />
                                        <circle cx="8" cy="17" r="1" />
                                        <circle cx="16" cy="17" r="1" />
                                    </svg>
                                    <p>No bus routes found matching your search.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>
            <StudentBottomNav activeTab="bus" />

            <style>{`
                .pb-bus-routes-page {
                    min-height: 100vh;
                    background: var(--pb-bg);
                }
                .pb-bus-routes-header-wrapper {
                    display: block;
                }
                .pb-page-header-card {
                    padding: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 32px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    margin-bottom: 24px;
                }
                .pb-header-content {
                    display: flex;
                    flex-direction: column;
                }
                .pb-page-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin: 0;
                    letter-spacing: -0.025em;
                }
                .pb-page-subtitle {
                    font-size: 0.9rem;
                    color: var(--pb-text-3);
                    margin: 4px 0 0 0;
                }
                .pb-search-box {
                    position: relative;
                    width: 350px;
                    display: flex;
                    align-items: center;
                }
                .pb-search-icon {
                    position: absolute;
                    left: 14px;
                    color: var(--pb-text-4);
                    display: flex;
                    align-items: center;
                    pointer-events: none;
                }
                .pb-search-input {
                    width: 100%;
                    height: 44px;
                    padding-left: 40px;
                    padding-right: 14px;
                    border-radius: 12px;
                    border: 1.5px solid rgba(59, 130, 246, 0.12);
                    background: #fff;
                    color: var(--pb-text);
                    font-size: 0.88rem;
                    font-family: inherit;
                    outline: none;
                    transition: var(--pb-transition);
                }
                .pb-search-input:focus {
                    border-color: var(--pb-primary);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
                }
                
                .pb-routes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                }
                .pb-route-card {
                    padding: 24px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    transition: var(--pb-transition);
                    cursor: default;
                }
                .pb-route-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--pb-shadow-md);
                    border-color: rgba(59, 130, 246, 0.3);
                }
                .pb-route-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 20px;
                    padding-bottom: 14px;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.06);
                }
                .pb-bus-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .pb-route-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    letter-spacing: -0.019em;
                }
                .pb-route-sub-no {
                    font-size: 0.85rem;
                    color: var(--pb-text-4);
                    font-weight: 600;
                    display: inline-block;
                    margin-left: 4px;
                }
                .pb-route-details {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .pb-detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .pb-detail-row .pb-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: var(--pb-text-4);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .pb-detail-row .pb-val {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: var(--pb-text);
                }
                .pb-boarding-points-section {
                    margin-top: 6px;
                    padding-top: 14px;
                    border-top: 1px dashed rgba(59, 130, 246, 0.08);
                }
                .pb-boarding-points-section .pb-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: var(--pb-text-4);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 10px;
                    display: block;
                }
                .pb-boarding-points-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .pb-bp-chip {
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    color: var(--pb-text-2);
                    padding: 3px 8px;
                    border-radius: 8px;
                    font-size: 0.74rem;
                    font-weight: 600;
                    text-transform: capitalize;
                }
                .pb-track-btn {
                    margin-top: 12px;
                    width: 100%;
                    height: 40px;
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-dark));
                    color: white;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    text-decoration: none;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
                    transition: var(--pb-transition);
                }
                .pb-track-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
                }
                .pb-empty-card {
                    padding: 48px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    color: var(--pb-text-3);
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                }
                .pb-empty-card p {
                    margin: 0;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                @media (max-width: 768px) {
                    .pb-bus-routes-header-wrapper {
                        display: none;
                    }
                    .pb-bus-routes-page {
                        padding-top: 16px;
                        padding-bottom: 90px;
                    }
                    .pb-page-header-card {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 20px;
                        gap: 16px;
                    }
                    .pb-search-box {
                        width: 100%;
                    }
                    .pb-routes-grid {
                        grid-template-columns: 1fr;
                    }
                    .content-wrapper {
                        padding: 0 16px;
                    }
                }
            `}</style>
        </div>
    );
};

export default BusRoutes;
