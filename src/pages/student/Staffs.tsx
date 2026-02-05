import React, { useEffect, useState } from 'react';
import StaffCard from '../../components/StaffCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Staffs: React.FC = () => {
    const [Loading, setLoading] = useState(true);
    const [staffData, setStaffData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const staff = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/staff/list`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    setStaffData(response.data.staff);
                    console.log("staff data", response.data);
                }
            } catch (error: any) {
                console.error("Error fetching staff data:", error.message);
            } finally {
                setLoading(false)
            }
        }

        staff();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const filteredStaff = staffData.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.subjects.some((sub: String) => sub.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = filter === 'All' || staff.designation.includes(filter);

        return matchesSearch && matchesFilter;
    });

    const designations = ['All', ...new Set(staffData.map(s => s.designation))];

    if (Loading) {
        return <div className="card staff-card">Loading...</div>;
    }

    return (
        <div className="page-container staff-page">

            <header className="dashboard-header-custom">
                <div className="header-container-custom">
                    <div className="header-left-custom">
                        <div className="brand-custom">
                            <span className="brand-icon-custom">🎓</span>
                            <span className="brand-text-custom">JIT Student Portal</span>
                        </div>
                    </div>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>

                    <nav className={`header-nav-custom ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/dashboard')}
                        >
                            Dashboard
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/staffs')}
                        >
                            Staffs
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/student-notice')}
                        >
                            Notices
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/outpass')}
                        >
                            Outpass
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/subjects')}
                        >
                            Subjects
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/profile')}
                        >
                            Profile
                        </button>
                        <button className="logout-btn-custom" onClick={handleLogout}>
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            <div className="content-wrapper">
                <div className="page-header">
                    <div>
                        <div className="back-nav" onClick={() => navigate('/dashboard')}>
                            <span>←</span> Back to Dashboard
                        </div>
                        <h1 className="page-title">Our Faculty</h1>
                        <p className="text-muted">Meet the dedicated professors shaping your future.</p>
                    </div>

                    <div className="controls">
                        <div className="search-box">
                            <span className="search-icon"></span>
                            <input
                                type="text"
                                placeholder="Search staff..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input search-input"
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="input filter-select"
                        >
                            {designations.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="staff-grid">
                    {filteredStaff.map(staff => (
                        <StaffCard key={staff._id} staff={staff} />
                    ))}
                </div>

                {filteredStaff.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon">🔍</span>
                        <h3>No staff found</h3>
                        <p>Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>

            <style>{`
                /* Custom Dashboard Header */
                .dashboard-header-custom {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 70px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    z-index: 1000;
                }

                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #1e293b;
                    padding: 8px;
                    z-index: 1001;
                }

                .header-container-custom {
                    max-width: 1400px;
                    margin: 0 auto;
                    height: 100%;
                    padding: 0 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left-custom {
                    display: flex;
                    align-items: center;
                }

                .brand-custom {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .brand-icon-custom {
                    font-size: 28px;
                }

                .brand-text-custom {
                    font-size: 1.3rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-nav-custom {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-item-custom {
                    padding: 10px 20px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                }

                .nav-item-custom:hover {
                    background: #f1f5f9;
                    color: #0047AB;
                }

                .logout-btn-custom {
                    padding: 10px 24px;
                    border: 2px solid #ef4444;
                    background: white;
                    color: #ef4444;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    margin-left: 12px;
                }

                .logout-btn-custom:hover {
                    background: #ef4444;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .content-wrapper-custom {
                    margin-top: 70px;
                    padding: 0;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .back-nav {
                    font-size: 0.9rem;
                    color: #64748b;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                    font-weight: 600;
                    padding: 8px 16px;
                    background: #f1f5f9;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .back-nav:hover {
                    color: #0047AB;
                    background: #e2e8f0;
                    transform: translateX(-4px);
                }

                .controls {
                    display: flex;
                    gap: 16px;
                }

                .search-box {
                    position: relative;
                    width: 300px;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0.5;
                }

                .search-input {
                    padding-left: 40px;
                }

                .filter-select {
                    width: 150px;
                    cursor: pointer;
                }

                .staff-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px;
                    color: var(--text-muted);
                }

                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    display: block;
                    opacity: 0.5;
                }

                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .controls {
                        width: 100%;
                        flex-direction: column;
                    }

                    .search-box, .filter-select {
                        width: 100%;
                    }
                }

                 @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: block;
                    }

                    .header-nav-custom {
                        position: absolute;
                        top: 70px;
                        left: 0;
                        right: 0;
                        background: white;
                        flex-direction: column;
                        padding: 0;
                        border-bottom: 1px solid #e2e8f0;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        max-height: 0;
                        transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
                        gap: 0;
                    }

                    .header-nav-custom.mobile-open {
                        max-height: 500px;
                        padding: 16px 0;
                    }

                    .nav-item-custom, .logout-btn-custom {
                        width: 100%;
                        text-align: left;
                        padding: 12px 24px;
                        border-radius: 0;
                        margin: 0;
                    }

                    .logout-btn-custom {
                        border: none;
                        border-top: 1px solid #fee2e2;
                        color: #ef4444;
                        margin-top: 8px;
                    }

                    .content-wrapper-custom {
                        margin-top: 70px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Staffs;
