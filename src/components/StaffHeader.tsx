import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface StaffHeaderProps {
    activeMenu: string;
}

const StaffHeader: React.FC<StaffHeaderProps> = ({ activeMenu }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/staff-login');
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const navItems = [
        { key: 'dashboard',    path: '/staff-dashboard',    label: 'Dashboard',     icon: '🏠' },
        { key: 'registration', path: '/staff-registration', label: 'Registration',  icon: '📋' },
        { key: 'passapproval', path: '/passapproval',       label: 'Pass Approval', icon: '✅' },
        { key: 'profile',      path: '/staff-profile',      label: 'Profile',       icon: '👤' },
    ];

    return (
        <>
            {/* Top Header */}
            <header className={`sfh-header ${scrolled ? 'sfh-scrolled' : ''}`}>
                <div className="sfh-container">
                    <div className="sfh-brand" onClick={() => handleNavigation('/staff-dashboard')}>
                        <span className="sfh-brand-icon">🎓</span>
                        <span className="sfh-brand-text">JIT Staff Portal</span>
                    </div>

                    <nav className="sfh-desktop-nav">
                        {navItems.map(item => (
                            <button
                                key={item.key}
                                className={`sfh-nav-link ${activeMenu === item.key ? 'sfh-active' : ''}`}
                                onClick={() => handleNavigation(item.path)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="sfh-right">
                        <div className="sfh-role-badge">Staff</div>
                        <button className="sfh-logout" onClick={handleLogout}>Logout</button>
                        <button
                            className={`sfh-hamburger ${isMobileMenuOpen ? 'sfh-ham-open' : ''}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="sfh-mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="sfh-mobile-menu" onClick={e => e.stopPropagation()}>
                        <div className="sfh-mobile-header">
                            <span className="sfh-mobile-logo">🎓</span>
                            <div>
                                <div className="sfh-mobile-title">JIT Staff Portal</div>
                                <div className="sfh-mobile-subtitle">Staff Member</div>
                            </div>
                        </div>
                        {navItems.map(item => (
                            <button
                                key={item.key}
                                className={`sfh-mobile-link ${activeMenu === item.key ? 'sfh-mobile-active' : ''}`}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                        <div className="sfh-mobile-divider"></div>
                        <button className="sfh-mobile-logout" onClick={handleLogout}>🚪 Logout</button>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Nav */}
            <nav className="sfh-bottom-nav">
                {navItems.map(item => (
                    <button
                        key={item.key}
                        className={`sfh-bottom-item ${activeMenu === item.key ? 'sfh-bottom-active' : ''}`}
                        onClick={() => handleNavigation(item.path)}
                    >
                        <span className="sfh-bottom-icon">{item.icon}</span>
                        <span className="sfh-bottom-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <style>{`
                .sfh-header {
                    position: sticky; top: 0; left: 0; right: 0;
                    height: var(--nav-height);
                    background: rgba(255,255,255,0.9);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid var(--border);
                    z-index: 1000;
                    transition: var(--transition);
                }
                .sfh-header.sfh-scrolled {
                    background: rgba(255,255,255,0.98);
                    box-shadow: var(--shadow-sm);
                }
                .sfh-container {
                    max-width: var(--content-max);
                    margin: 0 auto;
                    padding: 0 var(--space-6);
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--space-4);
                }
                .sfh-brand {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    cursor: pointer;
                    flex-shrink: 0;
                }
                .sfh-brand-icon { font-size: 1.4rem; }
                .sfh-brand-text {
                    font-size: 1.05rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .sfh-desktop-nav {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    flex: 1;
                    justify-content: center;
                }
                .sfh-nav-link {
                    height: 36px;
                    padding: 0 var(--space-4);
                    border: none;
                    background: transparent;
                    color: var(--text-3);
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    border-radius: var(--radius-md);
                    transition: var(--transition-fast);
                    font-family: inherit;
                }
                .sfh-nav-link:hover { color: var(--primary); background: var(--primary-light); }
                .sfh-nav-link.sfh-active { color: var(--primary); background: var(--primary-light); }
                .sfh-right {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    flex-shrink: 0;
                }
                .sfh-role-badge {
                    height: 30px;
                    padding: 0 var(--space-3);
                    background: var(--secondary-light);
                    color: var(--secondary);
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    letter-spacing: 0.04em;
                    border: 1px solid rgba(79,70,229,0.2);
                }
                .sfh-logout {
                    height: 36px;
                    padding: 0 var(--space-4);
                    background: var(--danger-light);
                    color: var(--danger);
                    border: 1px solid var(--danger-mid);
                    border-radius: var(--radius-md);
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: var(--transition-fast);
                    font-family: inherit;
                }
                .sfh-logout:hover { background: var(--danger); color: white; }
                .sfh-hamburger {
                    display: none;
                    flex-direction: column;
                    gap: 5px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: var(--space-2);
                    border-radius: var(--radius-sm);
                }
                .sfh-hamburger span {
                    display: block;
                    width: 20px; height: 2px;
                    background: var(--text-2);
                    border-radius: 2px;
                    transition: var(--transition);
                }
                .sfh-ham-open span:nth-child(1) { transform: rotate(45deg) translate(4px,4px); }
                .sfh-ham-open span:nth-child(2) { opacity: 0; }
                .sfh-ham-open span:nth-child(3) { transform: rotate(-45deg) translate(4px,-4px); }

                .sfh-mobile-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.4);
                    z-index: 1100;
                    backdrop-filter: blur(4px);
                    animation: fadeIn 0.2s ease;
                }
                .sfh-mobile-menu {
                    position: absolute;
                    top: 0; right: 0; bottom: 0;
                    width: min(300px, 85vw);
                    background: var(--surface);
                    box-shadow: var(--shadow-xl);
                    display: flex;
                    flex-direction: column;
                    padding: var(--space-6) var(--space-5);
                    gap: var(--space-1);
                    animation: slideInLeft 0.25s ease;
                    overflow-y: auto;
                }
                .sfh-mobile-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-4);
                    background: var(--secondary-light);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--space-4);
                }
                .sfh-mobile-logo { font-size: 2rem; }
                .sfh-mobile-title { font-size: 0.95rem; font-weight: 700; color: var(--text-1); }
                .sfh-mobile-subtitle { font-size: 0.78rem; color: var(--text-3); }
                .sfh-mobile-link {
                    display: flex; align-items: center; gap: var(--space-3);
                    height: 48px; padding: 0 var(--space-4);
                    background: transparent; border: none;
                    border-radius: var(--radius-md);
                    color: var(--text-2);
                    font-size: 0.95rem; font-weight: 600;
                    cursor: pointer; transition: var(--transition-fast);
                    font-family: inherit;
                }
                .sfh-mobile-link:hover { background: var(--bg-elevated); color: var(--primary); }
                .sfh-mobile-link.sfh-mobile-active { background: var(--primary-light); color: var(--primary); }
                .sfh-mobile-divider { height: 1px; background: var(--border); margin: var(--space-2) 0; }
                .sfh-mobile-logout {
                    display: flex; align-items: center; gap: var(--space-3);
                    height: 48px; padding: 0 var(--space-4);
                    background: var(--danger-light); color: var(--danger);
                    border: none; border-radius: var(--radius-md);
                    font-size: 0.95rem; font-weight: 700;
                    cursor: pointer; font-family: inherit;
                    transition: var(--transition-fast);
                }
                .sfh-mobile-logout:hover { background: var(--danger); color: white; }

                .sfh-bottom-nav {
                    display: none;
                    position: fixed; bottom: 0; left: 0; right: 0;
                    height: var(--mobile-nav-height);
                    background: rgba(255,255,255,0.97);
                    backdrop-filter: blur(20px);
                    border-top: 1px solid var(--border);
                    box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
                    z-index: 999;
                    justify-content: space-around;
                    align-items: center;
                    padding: 0 var(--space-2);
                }
                .sfh-bottom-item {
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    gap: 3px; flex: 1; height: 100%;
                    background: none; border: none;
                    cursor: pointer; padding: var(--space-2);
                    color: var(--text-4);
                    font-family: inherit;
                    border-radius: var(--radius-sm);
                    transition: var(--transition-fast);
                }
                .sfh-bottom-item.sfh-bottom-active { color: var(--primary); }
                .sfh-bottom-icon { font-size: 1.3rem; line-height: 1; }
                .sfh-bottom-label { font-size: 0.62rem; font-weight: 600; letter-spacing: 0.02em; }

                @media (max-width: 768px) {
                    .sfh-desktop-nav { display: none; }
                    .sfh-role-badge { display: none; }
                    .sfh-logout { display: none; }
                    .sfh-hamburger { display: flex; }
                    .sfh-bottom-nav { display: flex; }
                }
            `}</style>
        </>
    );
};

export default StaffHeader;
