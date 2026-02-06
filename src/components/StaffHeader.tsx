import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface StaffHeaderProps {
    activeMenu: string;
}

const StaffHeader: React.FC<StaffHeaderProps> = ({ activeMenu }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/staff-login');
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <header className="staff-header">
            <div className="header-container">
                <div className="header-left">
                    <div className="brand" onClick={() => handleNavigation('/staff-dashboard')}>
                        <span className="brand-icon">🎓</span>
                        <span className="brand-text">JIT Staff Portal</span>
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className={`mobile-toggle ${isMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <nav className={`header-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
                    <button
                        className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleNavigation('/staff-dashboard')}
                    >
                        Dashboard
                    </button>
                    {/* <button
                        className={`nav-item ${activeMenu === 'notice' ? 'active' : ''}`}
                        onClick={() => handleNavigation('/staff-notice')}
                    >
                        Notice
                    </button> */}
                    <button
                        className={`nav-item ${activeMenu === 'registration' ? 'active' : ''}`}
                        onClick={() => handleNavigation('/staff-registration')}
                    >
                        Registration
                    </button>
                    <button
                        className={`nav-item ${activeMenu === 'profile' ? 'active' : ''}`}
                        onClick={() => handleNavigation('/staff-profile')}
                    >
                        Profile
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </nav>
            </div>

            <style>{`
                .staff-header {
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .header-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 24px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 40px;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                }

                .brand-icon {
                    font-size: 28px;
                }

                .brand-text {
                    font-size: 1.3rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-nav {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-item {
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

                .nav-item:hover {
                    background: #f1f5f9;
                    color: #0047AB;
                }

                .nav-item.active {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    color: white;
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.2);
                }

                .logout-btn {
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

                .logout-btn:hover {
                    background: #ef4444;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                /* Mobile Toggle */
                .mobile-toggle {
                    display: none;
                    flex-direction: column;
                    gap: 6px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    z-index: 102; /* Ensure above nav overlay */
                }

                .mobile-toggle span {
                    display: block;
                    width: 24px;
                    height: 2px;
                    background: #1e293b;
                    transition: all 0.3s;
                }

                .mobile-toggle.open span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 6px);
                }

                .mobile-toggle.open span:nth-child(2) {
                    opacity: 0;
                }

                .mobile-toggle.open span:nth-child(3) {
                    transform: rotate(-45deg) translate(5px, -6px);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .header-container {
                        padding: 0 16px;
                    }

                    .mobile-toggle {
                        display: flex;
                    }

                    .header-nav {
                        position: fixed;
                        top: 0;
                        right: -100%;
                        width: 70%;
                        max-width: 300px;
                        height: 100vh;
                        background: white;
                        flex-direction: column;
                        padding: 80px 24px 24px;
                        box-shadow: -4px 0 20px rgba(0,0,0,0.1);
                        transition: right 0.3s ease-in-out;
                        z-index: 101;
                        gap: 16px;
                        align-items: flex-start;
                    }

                    .header-nav.mobile-open {
                        right: 0;
                    }

                    .nav-item {
                        width: 100%;
                        text-align: left;
                        padding: 12px 16px;
                    }

                    .logout-btn {
                        width: 100%;
                        text-align: center;
                        margin-left: 0;
                        margin-top: 20px;
                        display: block; 
                    }

                    .brand-text {
                        font-size: 1.1rem;
                    }
                }

                /* Overlay for mobile menu */
                @media (max-width: 768px) {
                     .staff-header::after {
                        content: '';
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.5);
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.3s;
                        z-index: 100;
                    }

                    .staff-header:has(.mobile-open)::after {
                        opacity: 1;
                        pointer-events: auto;
                    }
                }
            `}</style>
        </header>
    );
};

export default StaffHeader;
