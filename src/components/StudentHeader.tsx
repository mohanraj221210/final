import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { type User } from '../data/sampleData';
import { isProfileComplete } from '../utils/profileHelper';

interface StudentHeaderProps {
    user?: User | null;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ user: initialUser }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState<User | null>(initialUser || null);
    const [scrolled, setScrolled] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialUser) {
            setUser(initialUser);
            setImageError(false);
        }
    }, [initialUser]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (initialUser) return;
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
                    headers: { authorization: `Bearer ${token}` }
                });
                if (response.status === 200) {
                    setUser(response.data.user);
                    setImageError(false);
                }
            } catch (error) {
                console.error("Failed to fetch user profile in Header");
            }
        };
        fetchUserProfile();
    }, [initialUser]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus on route change or outside click
    useEffect(() => { 
        setIsMobileMenuOpen(false); 
        setIsDropdownOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleNavigation = (path: string) => {
        if (path === '/dashboard' || path === '/profile') {
            navigate(path);
        } else {
            if (isProfileComplete(user)) {
                navigate(path);
            } else {
                toast.warn("Complete your profile to access this page", {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        }
        setIsMobileMenuOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { path: '/staffs',    label: 'Staffs',    icon: '👥' },
        { path: '/outpass',   label: 'Outpass',   icon: '📝' },
        { path: '/subjects',  label: 'Subjects',  icon: '📚' },
        { path: '/profile',   label: 'Profile',   icon: '👤' },
    ];

    const profileComplete = isProfileComplete(user);
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';

    const getAvatarSrc = () => {
        if (!user?.photo) return null;
        if (user.photo.startsWith("blob:") || user.photo.startsWith("data:") || user.photo.startsWith("http")) {
            return user.photo;
        }
        const normalizedPath = user.photo.startsWith("/") ? user.photo.slice(1) : user.photo;
        const cdnUrl = import.meta.env.VITE_CDN_URL || '';
        const normalizedCdnUrl = cdnUrl.endsWith("/") ? cdnUrl : `${cdnUrl}/`;
        return `${normalizedCdnUrl}${normalizedPath}`;
    };

    return (
        <>
            {/* Top Header */}
            <header className={`lux-header ${scrolled ? 'lux-scrolled' : ''}`}>
                <div className="lux-container">
                    
                    {/* LEFT: Brand */}
                    <div className="lux-brand" onClick={() => handleNavigation('/dashboard')}>
                        <div className="lux-logo-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        </div>
                        <span className="lux-brand-text">JIT Campus One</span>
                    </div>

                    {/* CENTER: Desktop Nav */}
                    <nav className="lux-desktop-nav">
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`lux-nav-link ${isActive(item.path) ? 'lux-active' : ''}`}
                                onClick={() => handleNavigation(item.path)}
                            >
                                {item.label}
                                {isActive(item.path) && <div className="lux-nav-indicator" />}
                            </button>
                        ))}
                    </nav>

                    {/* RIGHT: User & Notifications */}
                    <div className="lux-right">
                        {!profileComplete && (
                            <button className="lux-incomplete-badge" onClick={() => handleNavigation('/profile')} title="Complete your profile">
                                ⚠️ Complete Profile
                            </button>
                        )}

                        {/* Notification Bell */}
                        <button className="lux-icon-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                            <span className="lux-notification-dot"></span>
                        </button>

                        {/* User Profile Dropdown */}
                        <div className="lux-dropdown-wrapper" ref={dropdownRef}>
                            <button className="lux-user-pill" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <div className="lux-avatar">
                                    {getAvatarSrc() && !imageError ? (
                                        <img src={getAvatarSrc()!} alt="Profile" onError={() => setImageError(true)} />
                                    ) : (
                                        <span>{userInitial}</span>
                                    )}
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`lux-chevron ${isDropdownOpen ? 'open' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="lux-dropdown-menu">
                                    <div className="lux-dropdown-header">
                                        <div className="lux-dropdown-name">{user?.name || 'Student'}</div>
                                        <div className="lux-dropdown-email">{user?.email || user?.registerNumber}</div>
                                    </div>
                                    <div className="lux-dropdown-divider"></div>
                                    <button className="lux-dropdown-item" onClick={() => handleNavigation('/profile')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        My Profile
                                    </button>
                                    <button className="lux-dropdown-item" onClick={() => handleNavigation('/dashboard')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                        Settings
                                    </button>
                                    <div className="lux-dropdown-divider"></div>
                                    <button className="lux-dropdown-item lux-danger" onClick={handleLogout}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            className={`lux-hamburger ${isMobileMenuOpen ? 'open' : ''}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span></span><span></span><span></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay Menu */}
            {isMobileMenuOpen && (
                <div className="lux-mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="lux-mobile-menu" onClick={e => e.stopPropagation()}>
                        <div className="lux-mobile-user">
                            <div className="lux-mobile-avatar">
                                {getAvatarSrc() && !imageError ? (
                                    <img src={getAvatarSrc()!} alt="" onError={() => setImageError(true)} />
                                ) : (
                                    <span>{userInitial}</span>
                                )}
                            </div>
                            <div>
                                <div className="lux-mobile-user-name">{user?.name || 'Student'}</div>
                                <div className="lux-mobile-user-meta">{user?.department} • {user?.year}</div>
                            </div>
                        </div>
                        <div className="lux-mobile-nav">
                            {navItems.map(item => (
                                <button
                                    key={item.path}
                                    className={`lux-mobile-link ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => handleNavigation(item.path)}
                                >
                                    <span className="lux-mobile-icon">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <div className="lux-dropdown-divider"></div>
                        <button className="lux-mobile-link lux-danger" onClick={handleLogout}>
                            <span className="lux-mobile-icon">🚪</span>
                            Log Out
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                /* === LUXURY UNIVERSITY HEADER === */
                .lux-header {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    height: 80px; /* Reduced optimal height */
                    background: linear-gradient(
                        90deg,
                        rgba(1, 1, 3, 0.48) 100%
                    );
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(212,160,23,0.18);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
                    z-index: 1000;
                    transition: all 0.3s ease;
                }
                
                .lux-header.lux-scrolled {
                    height: 72px; /* Shrinks slightly on scroll */
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                    background: linear-gradient(
                        90deg,
                        rgba(212,160,23,0.15) 0%,
                        rgba(30,41,59,0.98) 25%,
                        rgba(15,23,42,0.99) 60%,
                        rgba(37,99,235,0.22) 100%
                    );
                }

                .lux-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 32px;
                    height: 100%;
                    display: grid;
                    grid-template-columns: 250px 1fr 250px; /* Balanced 3-section layout */
                    align-items: center;
                }

                /* ── LEFT: BRAND ── */
                .lux-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    justify-self: flex-start;
                }
                
                .lux-logo-icon {
                    width: 36px; height: 36px;
                    background: rgba(212, 175, 55, 0.1);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                }

                .lux-brand-text {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #FFFFFF;
                    letter-spacing: 0.5px;
                }

                /* ── CENTER: NAVIGATION ── */
                .lux-desktop-nav {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 50px;
                }

                .lux-nav-link {
                    position: relative;
                    height: 40px;
                    padding: 0 16px;
                    background: transparent;
                    border: none;
                    color: #94A3B8; /* Muted slate */
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                    font-family: inherit;
                    letter-spacing: 0.2px;
                }

                .lux-nav-link:hover {
                    color: #FFFFFF;
                }

                .lux-nav-link.lux-active {
                    color: #D4AF37; /* Gold accent */
                    font-weight: 600;
                }

                .lux-nav-indicator {
                    position: absolute;
                    bottom: -16px; /* Sits exactly on the bottom border */
                    left: 16px; right: 16px;
                    height: 3px;
                    background: #D4AF37;
                    border-radius: 3px 3px 0 0;
                    box-shadow: 0 -2px 8px rgba(212, 175, 55, 0.4);
                }
                
                .lux-header.lux-scrolled .lux-nav-indicator {
                    bottom: -12px;
                }

                /* ── RIGHT: USER & NOTIFICATIONS ── */
                .lux-right {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 16px;
                }

                .lux-icon-btn {
                    position: relative;
                    width: 40px; height: 40px;
                    border-radius: 50%;
                    border: 1px solid transparent;
                    background: transparent;
                    color: #94A3B8;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .lux-icon-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #FFFFFF;
                }

                .lux-notification-dot {
                    position: absolute;
                    top: 8px; right: 10px;
                    width: 8px; height: 8px;
                    background: #D4AF37;
                    border: 2px solid #0B1220;
                    border-radius: 50%;
                    box-shadow: 0 0 8px rgba(212, 175, 55, 0.6);
                }

                .lux-dropdown-wrapper {
                    position: relative;
                }

                .lux-user-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    height: 44px;
                    padding: 0 12px 0 4px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 22px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #94A3B8;
                }

                .lux-user-pill:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(212, 175, 55, 0.4);
                    color: #FFFFFF;
                }

                .lux-avatar {
                    width: 34px; height: 34px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #D4AF37, #B8860B);
                    display: flex; align-items: center; justify-content: center;
                    color: #0B1220; font-weight: 700; font-size: 0.9rem;
                    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
                    overflow: hidden;
                }
                
                .lux-avatar img { width: 100%; height: 100%; object-fit: cover; }

                .lux-chevron {
                    transition: transform 0.2s ease;
                }
                .lux-chevron.open {
                    transform: rotate(180deg);
                }

                /* DROPDOWN MENU */
                .lux-dropdown-menu {
                    position: absolute;
                    top: calc(100% + 12px);
                    right: 0;
                    width: 240px;
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px -10px rgba(11, 18, 32, 0.2);
                    padding: 8px 0;
                    animation: luxDropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    transform-origin: top right;
                }

                @keyframes luxDropIn {
                    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .lux-dropdown-header {
                    padding: 12px 16px;
                }

                .lux-dropdown-name {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0B1220;
                }

                .lux-dropdown-email {
                    font-size: 0.8rem;
                    color: #64748B;
                    margin-top: 2px;
                }

                .lux-dropdown-divider {
                    height: 1px;
                    background: #F1F5F9;
                    margin: 4px 0;
                }

                .lux-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 10px 16px;
                    background: transparent;
                    border: none;
                    color: #475569;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s;
                    text-align: left;
                }

                .lux-dropdown-item:hover {
                    background: #F8FAFC;
                    color: #0B1220;
                }

                .lux-dropdown-item.lux-danger {
                    color: #DC2626;
                }
                .lux-dropdown-item.lux-danger:hover {
                    background: #FEF2F2;
                }

                .lux-incomplete-badge {
                    padding: 6px 12px;
                    background: rgba(212, 175, 55, 0.1);
                    color: #D4AF37;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    animation: pulse 2s infinite;
                }

                /* ── MOBILE NAVBAR ── */
                .lux-hamburger {
                    display: none;
                    flex-direction: column;
                    gap: 5px;
                    background: transparent;
                    border: none;
                    padding: 8px;
                    cursor: pointer;
                }
                .lux-hamburger span {
                    display: block;
                    width: 22px; height: 2px;
                    background: #FFFFFF;
                    border-radius: 2px;
                    transition: all 0.3s ease;
                }
                .lux-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
                .lux-hamburger.open span:nth-child(2) { opacity: 0; }
                .lux-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

                /* MOBILE MENU */
                .lux-mobile-overlay {
                    position: fixed;
                    inset: 0;
                    top: 80px; /* Right below header */
                    background: rgba(11, 18, 32, 0.6);
                    backdrop-filter: blur(8px);
                    z-index: 999;
                }
                
                .lux-header.lux-scrolled ~ .lux-mobile-overlay {
                    top: 72px;
                }

                .lux-mobile-menu {
                    background: #0B1220;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                }

                .lux-mobile-user {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .lux-mobile-user-name { color: #FFFFFF; font-weight: 700; font-size: 1.1rem; }
                .lux-mobile-user-meta { color: #94A3B8; font-size: 0.85rem; }

                .lux-mobile-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .lux-mobile-link {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    width: 100%;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    color: #94A3B8;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: 8px;
                    text-align: left;
                }

                .lux-mobile-link.active, .lux-mobile-link:hover {
                    background: rgba(212, 175, 55, 0.1);
                    color: #D4AF37;
                }

                .lux-mobile-link.lux-danger {
                    color: #EF4444;
                }
                .lux-mobile-link.lux-danger:hover {
                    background: rgba(239, 68, 68, 0.1);
                }

                /* RESPONSIVENESS */
                @media (max-width: 1100px) {
                    .lux-container {
                        grid-template-columns: auto 1fr auto;
                        gap: 24px;
                    }
                    .lux-nav-link { padding: 0 12px; }
                }

                @media (max-width: 850px) {
                    .lux-desktop-nav { display: none; }
                    .lux-user-pill { display: none; }
                    .lux-incomplete-badge { display: none; }
                    .lux-container { grid-template-columns: 1fr auto; }
                    .lux-hamburger { display: flex; }
                }
                
                @media (max-width: 600px) {
                    .lux-container { padding: 0 20px; }
                    .lux-icon-btn { display: none; } /* Hide bell on tiny screens to save space */
                }
            `}</style>
        </>
    );
};

export default StudentHeader;
