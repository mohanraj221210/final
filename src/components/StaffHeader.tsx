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
        {
            key: 'dashboard',
            path: '/staff-dashboard',
            label: 'Dashboard',
            icon: '🏠',
            svg: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
                    <polyline points="9 21 9 12 15 12 15 21"/>
                </svg>
            ),
            svgActive: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 3L3 9.5V20a1 1 0 0 0 1 1h6v-9h4v9h6a1 1 0 0 0 1-1V9.5L12 3z"/>
                </svg>
            )
        },
        {
            key: 'registration',
            path: '/staff-registration',
            label: 'Register',
            icon: '📋',
            svg: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
            ),
            svgActive: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8L14 2zm-1 11h-2v-2H9v-2h2V7h2v2h2v2h-2v2z"/>
                </svg>
            )
        },
        {
            key: 'pendingpasses',
            path: '/pending-passes',
            label: 'Pending',
            icon: '⏳',
            svg: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
            ),
            svgActive: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14" fill="none"/>
                </svg>
            )
        },
        {
            key: 'allpasses',
            path: '/all-passes',
            label: 'Passes',
            icon: '🎫',
            svg: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
            ),
            svgActive: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M22 5H2C.9 5 0 5.9 0 7v10c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H2v-7h20v7zm0-9H2V7h20v1z"/>
                </svg>
            )
        },
        {
            key: 'profile',
            path: '/staff-profile',
            label: 'Profile',
            icon: '👤',
            svg: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            ),
            svgActive: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            )
        },
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
                        <div className="lux-logo-icon">
                            <img src="/jit permigo.png" alt="JIT Permigo" style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} />
                        </div>
                        <span className="sfh-brand-text">JIT Permigo</span>
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
            <nav className="sfh-bottom-nav" role="navigation" aria-label="Main navigation">
                <div className="sfh-bottom-inner">
                    {navItems.map((item) => {
                        const isActive = activeMenu === item.key;
                        return (
                            <button
                                key={item.key}
                                className={`sfh-bottom-item ${isActive ? 'sfh-bottom-active' : ''}`}
                                onClick={() => handleNavigation(item.path)}
                                aria-label={item.label}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <span className="sfh-bottom-icon-wrap">
                                    <span className="sfh-bottom-icon">
                                        {isActive ? item.svgActive : item.svg}
                                    </span>
                                </span>
                                <span className="sfh-bottom-label">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
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

                /* ====== PREMIUM BOTTOM NAV ====== */
                @keyframes sfhBounceIn {
                    0%   { transform: scale(0.6) translateY(4px); opacity: 0; }
                    60%  { transform: scale(1.15) translateY(-2px); opacity: 1; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                @keyframes sfhLabelIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes sfhNavSlideUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .sfh-bottom-nav {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 999;
                    /* safe-area padding for notched phones */
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                    background: transparent;
                    pointer-events: none;
                }
                .sfh-bottom-inner {
                    pointer-events: all;
                    margin: 0 14px 14px;
                    height: 64px;
                    background: rgba(255, 255, 255, 0.82);
                    backdrop-filter: blur(28px) saturate(180%);
                    -webkit-backdrop-filter: blur(28px) saturate(180%);
                    border: 1.5px solid rgba(255, 255, 255, 0.55);
                    border-bottom-color: rgba(200, 215, 240, 0.4);
                    box-shadow:
                        0 8px 32px rgba(30, 64, 175, 0.10),
                        0 2px 8px rgba(0, 0, 0, 0.06),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8);
                    border-radius: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    padding: 0 8px;
                    animation: sfhNavSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                /* Each nav button */
                .sfh-bottom-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 3px;
                    flex: 1;
                    height: 52px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #94A3B8;
                    font-family: inherit;
                    border-radius: 16px;
                    padding: 0 4px;
                    position: relative;
                    transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    -webkit-tap-highlight-color: transparent;
                    outline: none;
                }
                .sfh-bottom-item:hover {
                    color: #3B82F6;
                }

                /* Active item */
                .sfh-bottom-item.sfh-bottom-active {
                    color: #1D4ED8;
                }

                /* Icon wrapper — holds the pill glow on active */
                .sfh-bottom-icon-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 38px;
                    height: 28px;
                    border-radius: 10px;
                    transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sfh-bottom-item.sfh-bottom-active .sfh-bottom-icon-wrap {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.12) 100%);
                    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.18);
                }

                /* The SVG icon itself */
                .sfh-bottom-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    line-height: 1;
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .sfh-bottom-item.sfh-bottom-active .sfh-bottom-icon {
                    animation: sfhBounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .sfh-bottom-item:not(.sfh-bottom-active):active .sfh-bottom-icon {
                    transform: scale(0.88);
                }

                /* Label */
                .sfh-bottom-label {
                    font-size: 0.62rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                    line-height: 1;
                    transition: color 0.2s ease;
                    white-space: nowrap;
                }
                .sfh-bottom-item.sfh-bottom-active .sfh-bottom-label {
                    animation: sfhLabelIn 0.3s ease forwards;
                    background: linear-gradient(135deg, #1D4ED8, #6366F1);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* Top accent line on active item */
                .sfh-bottom-item.sfh-bottom-active::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 28px;
                    height: 2.5px;
                    border-radius: 0 0 3px 3px;
                    background: linear-gradient(90deg, #3B82F6, #6366F1);
                    box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
                }

                @media (max-width: 768px) {
                    .sfh-desktop-nav { display: none; }
                    .sfh-hamburger { display: flex; }
                    .sfh-bottom-nav { display: block; }
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
