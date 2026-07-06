import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { type User } from '../data/sampleData';
import { isProfileComplete } from '../utils/profileHelper';
import '../student-portal.css';

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
        if (initialUser) { setUser(initialUser); setImageError(false); }
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
                if (response.status === 200) { setUser(response.data.user); setImageError(false); }
            } catch (error) { console.error("Failed to fetch user profile in Header"); }
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
                toast.warn("Complete your profile to access this page", { position: "top-center", autoClose: 3000 });
            }
        }
        setIsMobileMenuOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { path: '/staffs', label: 'Staffs', icon: '👥' },
        { path: '/outpass', label: 'Outpass', icon: '📝' },
        { path: '/profile', label: 'Profile', icon: '👤' },
    ];

    const profileComplete = isProfileComplete(user);
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'S';

    const getAvatarSrc = () => {
        if (!user?.photo) return null;
        if (user.photo.startsWith("blob:") || user.photo.startsWith("data:") || user.photo.startsWith("http")) return user.photo;
        const normalizedPath = user.photo.startsWith("/") ? user.photo.slice(1) : user.photo;
        const cdnUrl = import.meta.env.VITE_CDN_URL || '';
        const normalizedCdnUrl = cdnUrl.endsWith("/") ? cdnUrl : `${cdnUrl}/`;
        return `${normalizedCdnUrl}${normalizedPath}`;
    };

    const avatarSrc = getAvatarSrc();

    return (
        <>
            {/* Top Header */}
            <header className={`lux-header ${scrolled ? 'lux-scrolled' : ''}`}>
                <div className="lux-container">

                    {/* LEFT: Brand */}
                    <div className="lux-brand" onClick={() => handleNavigation('/dashboard')}>
                        <div className="lux-logo-icon">
                            <img src="/jit permigo.png" alt="JIT Permigo" style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} />
                        </div>
                        <span className="lux-brand-text">JIT Permigo</span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="sp-nav">
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`sp-nav-btn${isActive(item.path) ? ' sp-active' : ''}`}
                                onClick={() => handleNavigation(item.path)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Right area */}
                    <div className="sp-header-right">
                        {!profileComplete && (
                            <button className="sp-incomplete-badge" onClick={() => handleNavigation('/profile')}>
                                ⚠️ Complete Profile
                            </button>
                        )}



                        {/* User Dropdown */}
                        <div className="sp-dropdown-wrap" ref={dropdownRef}>
                            <button className="sp-user-pill" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <div className="sp-user-avatar">
                                    {avatarSrc && !imageError ? (
                                        <img src={avatarSrc} alt="Profile" onError={() => setImageError(true)} />
                                    ) : (
                                        userInitial
                                    )}
                                </div>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`lux-chevron ${isDropdownOpen ? 'open' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="sp-dropdown">
                                    <div className="sp-dropdown-head">
                                        <div className="sp-dropdown-uname">{user?.name || 'Student'}</div>
                                        <div className="sp-dropdown-email">{user?.email || user?.registerNumber}</div>
                                    </div>
                                    <div className="lux-dropdown-divider"></div>
                                    <button className="lux-dropdown-item" onClick={() => handleNavigation('/profile')}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        My Profile
                                    </button>
                                    <div className="lux-dropdown-divider"></div>
                                    <button className="lux-dropdown-item lux-danger" onClick={handleLogout}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Hamburger */}
                        <button
                            className={`sp-hamburger${isMobileMenuOpen ? ' sp-open' : ''}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span/><span/><span/>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile overlay menu */}
            {isMobileMenuOpen && (
                <div className="sp-mob-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="sp-mob-menu" onClick={e => e.stopPropagation()}>
                        <div className="sp-mob-user-row">
                            <div className="sp-user-avatar" style={{ width: 44, height: 44, fontSize: '1.1rem', borderRadius: 14, border: '2px solid #E0E7FF' }}>
                                {avatarSrc && !imageError ? (
                                    <img src={avatarSrc} alt="" onError={() => setImageError(true)} />
                                ) : (
                                    userInitial
                                )}
                            </div>
                            <div>
                                <div className="sp-mob-uname">{user?.name || 'Student'}</div>
                                <div className="sp-mob-umeta">{user?.department} • {user?.year}</div>
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
                            <span className="lux-mobile-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                            </span>
                            Log Out
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                /* === PREMIUM PALE BLUE HEADER === */
                .lux-header {
                    position: fixed;
                    top: 12px; left: 16px; right: 16px;
                    height: 64px;
                    background: rgba(255, 255, 255, 0.88) !important;
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(59, 130, 246, 0.12) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 4px 24px rgba(59, 130, 246, 0.08), 0 1px 4px rgba(15,23,42,0.04) !important;
                    z-index: 1000;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .lux-header.lux-scrolled {
                    top: 8px;
                    height: 58px;
                    background: rgba(255, 255, 255, 0.94) !important;
                    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.10), 0 1px 4px rgba(15,23,42,0.04) !important;
                }

                .lux-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 20px;
                    height: 100%;
                    display: grid;
                    grid-template-columns: 220px 1fr 220px;
                    align-items: center;
                }

                .lux-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    justify-self: flex-start;
                    transition: opacity 0.2s;
                }
                .lux-brand:hover { opacity: 0.75; }
                
                .lux-logo-icon {
                    width: 34px; height: 34px;
                    background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(96,165,250,0.06)) !important;
                    border: 1px solid rgba(59,130,246,0.15) !important;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                }

                .lux-brand-text {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #0F172A !important;
                    letter-spacing: -0.3px;
                }

                .lux-desktop-nav {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                }

                .lux-nav-link {
                    position: relative;
                    height: 36px;
                    padding: 0 16px;
                    background: transparent;
                    border: none;
                    color: #64748B !important;
                    font-size: 0.88rem;
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: 999px !important;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    font-family: inherit;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .lux-nav-link:hover {
                    color: #3B82F6 !important;
                    background: rgba(59,130,246,0.07) !important;
                }

                .lux-nav-link.lux-active {
                    color: #FFFFFF !important;
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8) !important;
                    font-weight: 600 !important;
                    box-shadow: 0 4px 12px rgba(59,130,246,0.25) !important;
                }

                .lux-nav-indicator { display: none !important; }

                .lux-right {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 10px;
                }

                .lux-icon-btn {
                    position: relative;
                    width: 38px; height: 38px;
                    border-radius: 50%;
                    border: 1px solid rgba(59,130,246,0.1);
                    background: rgba(255,255,255,0.7);
                    color: #64748B !important;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .lux-icon-btn:hover {
                    background: rgba(59,130,246,0.06);
                    border-color: rgba(59,130,246,0.2);
                    color: #3B82F6 !important;
                }

                .lux-notification-dot {
                    position: absolute;
                    top: 7px; right: 7px;
                    width: 7px; height: 7px;
                    background: #10B981;
                    border: 2px solid #FFFFFF;
                    border-radius: 50%;
                }

                .lux-dropdown-wrapper { position: relative; }

                .lux-user-pill {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    height: 40px;
                    padding: 0 10px 0 4px;
                    background: rgba(59,130,246,0.05) !important;
                    border: 1px solid rgba(59,130,246,0.12) !important;
                    border-radius: 999px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #64748B !important;
                }

                .lux-user-pill:hover {
                    background: rgba(59,130,246,0.09) !important;
                    border-color: rgba(59,130,246,0.25) !important;
                }

                .lux-avatar {
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8) !important;
                    display: flex; align-items: center; justify-content: center;
                    color: #FFFFFF; font-weight: 700; font-size: 0.85rem;
                    box-shadow: 0 2px 8px rgba(59,130,246,0.2);
                    overflow: hidden;
                }
                
                .lux-avatar img { width: 100%; height: 100%; object-fit: cover; }

                .lux-chevron { 
                    transition: transform 0.2s ease; 
                    color: var(--sp-text-3, #64748B);
                    display: inline-block;
                    flex-shrink: 0;
                }
                .lux-chevron.open { transform: rotate(180deg); }
                .sp-user-pill:hover .lux-chevron {
                    color: var(--sp-primary, #6366F1);
                }

                .lux-dropdown-menu {
                    position: absolute;
                    top: calc(100% + 10px);
                    right: 0;
                    width: 240px;
                    background: rgba(255,255,255,0.97);
                    border: 1px solid rgba(59,130,246,0.12);
                    border-radius: 16px;
                    box-shadow: 0 12px 40px rgba(59,130,246,0.12), 0 4px 12px rgba(15,23,42,0.06);
                    padding: 8px 0;
                    animation: luxDropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    transform-origin: top right;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    z-index: 9999;
                }

                @keyframes luxDropIn {
                    from { opacity: 0; transform: scale(0.95) translateY(-8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                .lux-dropdown-header { padding: 12px 16px; }
                .lux-dropdown-name { font-size: 0.92rem; font-weight: 700; color: #0F172A; }
                .lux-dropdown-email { font-size: 0.78rem; color: #64748B; margin-top: 2px; }
                .lux-dropdown-divider { height: 1px; background: rgba(59,130,246,0.07); margin: 4px 0; }

                .lux-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 9px 16px;
                    background: transparent;
                    border: none;
                    color: #475569;
                    font-size: 0.88rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                    text-align: left;
                    font-family: inherit;
                }
                .lux-dropdown-item:hover { background: rgba(59,130,246,0.05); color: #0F172A; }
                .lux-dropdown-item.lux-danger { color: #DC2626; }
                .lux-dropdown-item.lux-danger:hover { background: rgba(239, 68, 68, 0); }

                .lux-incomplete-badge {
                    padding: 5px 12px;
                    background: rgba(245,158,11,0.08);
                    color: #D97706;
                    border: 1px solid rgba(245,158,11,0.2);
                    border-radius: 999px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    animation: pulse 2s infinite;
                }

                .lux-hamburger {
                    display: none;
                    flex-direction: column;
                    gap: 5px;
                    background: transparent;
                    border: none;
                    padding: 6px;
                    cursor: pointer;
                }
                .lux-hamburger span {
                    display: block;
                    width: 20px; height: 2px;
                    background: #334155;
                    border-radius: 2px;
                    transition: all 0.25s ease;
                }
                .lux-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
                .lux-hamburger.open span:nth-child(2) { opacity: 0; }
                .lux-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

                .lux-mobile-overlay {
                    position: fixed;
                    inset: 0;
                    top: 76px;
                    background: rgba(15,23,42,0.25);
                    backdrop-filter: blur(4px);
                    z-index: 999;
                }

                .lux-mobile-menu {
                    background: rgba(255,255,255,0.97);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(59,130,246,0.1);
                    border-radius: 0 0 20px 20px;
                    padding: 20px 20px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    box-shadow: 0 20px 40px rgba(59,130,246,0.1);
                    animation: mobileMenuIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes mobileMenuIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .lux-mobile-user {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding-bottom: 14px;
                    border-bottom: 1px solid rgba(59,130,246,0.08);
                }

                .lux-mobile-avatar {
                    width: 42px; height: 42px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
                    display: flex; align-items: center; justify-content: center;
                    color: white; font-weight: 700; font-size: 1rem;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(59,130,246,0.2);
                    flex-shrink: 0;
                }
                .lux-mobile-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .lux-mobile-user-name { color: #0F172A; font-weight: 700; font-size: 0.95rem; }
                .lux-mobile-user-meta { color: #64748B; font-size: 0.8rem; margin-top: 1px; }

                .lux-mobile-nav { display: flex; flex-direction: column; gap: 2px; }

                .lux-mobile-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 10px 12px;
                    background: transparent;
                    border: none;
                    color: #64748B;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: 10px;
                    text-align: left;
                    transition: all 0.2s;
                    font-family: inherit;
                }

                .lux-mobile-link.active, .lux-mobile-link:hover {
                    background: rgba(59,130,246,0.07);
                    color: #3B82F6;
                }

                .lux-mobile-icon {
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                }

                .lux-mobile-link.lux-danger { color: #EF4444; }
                .lux-mobile-link.lux-danger:hover { background: rgba(239,68,68,0.07); }

                @media (max-width: 1100px) {
                    .lux-container { grid-template-columns: auto 1fr auto; gap: 16px; }
                    .lux-nav-link { padding: 0 11px; }
                }

                @media (max-width: 850px) {
                    .lux-desktop-nav { display: none; }
                    .lux-user-pill { display: none; }
                    .lux-incomplete-badge { display: none; }
                    .lux-container { grid-template-columns: 1fr auto; }
                    .lux-hamburger { display: flex; }
                }
                
                @media (max-width: 600px) {
                    .lux-container { padding: 0 16px; }
                    .lux-icon-btn { display: none; }
                }
            `}</style>
        </>
    );
};

export default StudentHeader;
