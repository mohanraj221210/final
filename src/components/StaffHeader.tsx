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
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [staffName, setStaffName] = useState('Faculty Member');
    const [staffEmail, setStaffEmail] = useState('faculty@jit.edu');
    const [staffInitial, setStaffInitial] = useState('F');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/staff/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data && data.staff) {
                        setStaffName(data.staff.name);
                        setStaffEmail(data.staff.email);
                        setStaffInitial(data.staff.name.charAt(0).toUpperCase());
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = () => {
            setIsNotificationOpen(false);
            setIsProfileOpen(false);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
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
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
    };

    // const toggleNotification = (e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     setIsNotificationOpen(!isNotificationOpen);
    //     setIsProfileOpen(false);
    // };

    const toggleProfile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsProfileOpen(!isProfileOpen);
        setIsNotificationOpen(false);
    };

    const navItems = [
        { key: 'dashboard',    path: '/staff-dashboard',    label: 'Dashboard',     icon: '🏠' },
        { key: 'registration', path: '/staff-registration', label: 'Registration',  icon: '📋' },
        { key: 'passapproval', path: '/passapproval',       label: 'Pass Approval', icon: '✅' },
        { key: 'profile',      path: '/staff-profile',      label: 'Profile',       icon: '👤' },
    ];

    const notifications = [
        { id: 1, text: "⚠️ New emergency outpass request from Rohith (IT)", time: "5 mins ago", read: false },
        { id: 2, text: "📋 Outpass pending list updated for Semester 6", time: "1 hour ago", read: true },
        { id: 3, text: "📅 Staff coordination meeting at 3:00 PM today", time: "2 hours ago", read: true }
    ];

    return (
        <>
            {/* Top Header */}
            <header className={`sfh-header ${scrolled ? 'sfh-scrolled' : ''}`}>
                <div className="sfh-container">
                    <div className="sfh-brand" onClick={() => handleNavigation('/staff-dashboard')}>
                        <span className="sfh-brand-icon">🎓</span>
                        <span className="sfh-brand-text">JIT Faculty Portal</span>
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
                        {/* Notifications */}
                        {/* <button className="sfh-notif-btn" onClick={toggleNotification} aria-label="Notifications">
                            🔔
                            <span className="sfh-notif-badge">1</span>
                        </button> */}

                        {isNotificationOpen && (
                            <div className="sfh-dropdown sfh-notif-dropdown" onClick={e => e.stopPropagation()}>
                                <div className="sfh-dropdown-header">
                                    <h4>Notifications</h4>
                                    <p>Recent updates and alerts</p>
                                </div>
                                {notifications.map(n => (
                                    <div key={n.id} className={`sfh-notif-item ${n.read ? 'read' : 'unread'}`}>
                                        <div className="sfh-notif-text">{n.text}</div>
                                        <div className="sfh-notif-time">{n.time}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Profile Avatar Trigger */}
                        <div className="sfh-avatar-wrapper" onClick={toggleProfile} aria-label="Profile Menu">
                            <button className="sfh-avatar-btn" style={{ pointerEvents: 'none' }}>
                                {staffInitial}
                            </button>
                            <svg className={`sfh-avatar-chevron ${isProfileOpen ? 'sfh-chevron-rotated' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>

                        {isProfileOpen && (
                            <div className="sfh-dropdown" onClick={e => e.stopPropagation()}>
                                <div className="sfh-dropdown-header">
                                    <h4>{staffName}</h4>
                                    <p>{staffEmail}</p>
                                </div>
                                <button className="sfh-dropdown-item" onClick={() => handleNavigation('/staff-profile')}>
                                    👤 My Profile
                                </button>
                                <button className="sfh-dropdown-item" onClick={() => handleNavigation('/staff-dashboard')}>
                                    ⚙️ Command Center
                                </button>
                                <div className="sfh-dropdown-divider"></div>
                                <button className="sfh-dropdown-item danger" onClick={handleLogout}>
                                    🚪 Logout
                                </button>
                            </div>
                        )}

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
                                <div className="sfh-mobile-title">{staffName}</div>
                                <div className="sfh-mobile-subtitle">{staffEmail}</div>
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
                    height: 76px;
                    background: rgba(255,255,255,0.85);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-bottom: 1px solid rgba(229, 231, 235, 0.6);
                    z-index: 1000;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
                }
                .sfh-header.sfh-scrolled {
                    background: rgba(255,255,255,0.98);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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
                .sfh-brand-icon { font-size: 1.5rem; }
                .sfh-brand-text {
                    font-size: 1.15rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .sfh-desktop-nav {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    flex: 1;
                    justify-content: center;
                }
                .sfh-nav-link {
                    height: 38px;
                    padding: 0 var(--space-4);
                    border: none;
                    background: transparent;
                    color: var(--text-3);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    border-radius: var(--radius-sm);
                    transition: var(--transition-fast);
                    font-family: inherit;
                }
                .sfh-nav-link:hover { color: var(--primary); background: var(--primary-light); }
                .sfh-nav-link.sfh-active { color: var(--primary); background: var(--primary-light); }
                
                .sfh-right {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    flex-shrink: 0;
                }
                .sfh-notif-btn, .sfh-avatar-btn {
                    position: relative;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sfh-notif-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #F1F5F9;
                    color: #475569;
                    font-size: 1.25rem;
                }
                .sfh-notif-btn:hover {
                    background: #E2E8F0;
                    color: #0F172A;
                    transform: translateY(-1px);
                }
                .sfh-notif-badge {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    background: #EF4444;
                    color: white;
                    font-size: 0.68rem;
                    font-weight: 800;
                    min-width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #FFFFFF;
                }
                .sfh-avatar-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    padding: 2px var(--space-2) 2px 2px;
                    border-radius: 99px;
                    transition: all 0.2s ease;
                }
                .sfh-avatar-wrapper:hover {
                    background: rgba(37, 99, 235, 0.05);
                }
                .sfh-avatar-chevron {
                    color: var(--text-3);
                    transition: transform 0.2s ease, color 0.2s ease;
                }
                .sfh-avatar-wrapper:hover .sfh-avatar-chevron {
                    color: var(--primary);
                }
                .sfh-chevron-rotated {
                    transform: rotate(180deg);
                }
                .sfh-avatar-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sfh-avatar-wrapper:hover .sfh-avatar-btn {
                    transform: translateY(-1px) scale(1.03);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                }

                .sfh-dropdown {
                    position: absolute;
                    top: 52px;
                    right: 0;
                    background: #FFFFFF;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: var(--radius-md);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 16px -8px rgba(0, 0, 0, 0.04);
                    width: 280px;
                    padding: 8px;
                    z-index: 1001;
                    display: flex;
                    flex-direction: column;
                    animation: dropdownSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes dropdownSlide {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .sfh-dropdown-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid #F1F5F9;
                    margin-bottom: 6px;
                }
                .sfh-dropdown-header h4 {
                    font-size: 0.95rem;
                    color: #0F172A;
                    font-weight: 700;
                    margin-bottom: 2px;
                }
                .sfh-dropdown-header p {
                    font-size: 0.78rem;
                    color: #64748B;
                }
                .sfh-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 16px;
                    width: 100%;
                    border: none;
                    background: transparent;
                    text-align: left;
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: #334155;
                    cursor: pointer;
                    border-radius: var(--radius-sm);
                    transition: all 0.15s ease;
                }
                .sfh-dropdown-item:hover {
                    background: #F1F5F9;
                    color: var(--primary);
                }
                .sfh-dropdown-divider {
                    height: 1px;
                    background: #F1F5F9;
                    margin: 6px 0;
                }
                .sfh-dropdown-item.danger {
                    color: var(--danger);
                }
                .sfh-dropdown-item.danger:hover {
                    background: var(--danger-light);
                    color: var(--danger);
                }

                .sfh-notif-dropdown {
                    width: 320px;
                }
                .sfh-notif-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 12px 16px;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: all 0.15s ease;
                    position: relative;
                }
                .sfh-notif-item:hover {
                    background: #F8FAFC;
                }
                .sfh-notif-item.unread::after {
                    content: '';
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 8px;
                    height: 8px;
                    background: var(--primary);
                    border-radius: 50%;
                }
                .sfh-notif-text {
                    font-size: 0.82rem;
                    color: #1E293B;
                    font-weight: 500;
                    line-height: 1.4;
                    padding-right: 12px;
                }
                .sfh-notif-time {
                    font-size: 0.72rem;
                    color: #94A3B8;
                }

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
                    background: var(--primary-light);
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
                    position: fixed;
                    bottom: 16px;
                    left: 16px;
                    right: 16px;
                    height: 48px; /* reduced from 64px */
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    box-shadow: 0 6px 24px 0 rgba(31, 38, 135, 0.06);
                    border-radius: 20px; /* slightly more rounded */
                    z-index: 999;
                    justify-content: space-around;
                    align-items: center;
                    padding: 0 6px; /* reduced side padding */
                    margin-bottom: env(safe-area-inset-bottom, 0px);
                }
                .sfh-bottom-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 2px;
                    flex: 1;
                    height: 80%;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #64748B;
                    font-family: inherit;
                    border-radius: 16px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sfh-bottom-item:hover, .sfh-bottom-item.sfh-bottom-active {
                    color: var(--primary);
                }
                .sfh-bottom-item.sfh-bottom-active {
                    background: rgba(37, 99, 235, 0.08);
                }
                .sfh-bottom-icon {
                    font-size: 1.25rem;
                    line-height: 1;
                    transition: transform 0.2s ease;
                }
                .sfh-bottom-item.sfh-bottom-active .sfh-bottom-icon {
                    transform: scale(1.1);
                }
                .sfh-bottom-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                }

                @media (max-width: 768px) {
                    .sfh-desktop-nav { display: none; }
                    .sfh-hamburger { display: flex; }
                    .sfh-bottom-nav { display: flex; }
                    .sfh-header {
                        height: 84px !important;
                    }
                    .sfh-container {
                        padding: 0 var(--space-4) !important;
                    }
                    .sfh-right {
                        gap: var(--space-3) !important;
                    }
                }
            `}</style>
        </>
    );
};

export default StaffHeader;
