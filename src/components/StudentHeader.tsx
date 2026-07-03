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

    useEffect(() => { setIsMobileMenuOpen(false); setIsDropdownOpen(false); }, [location.pathname]);

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
        { path: '/dashboard', label: 'Dashboard', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        )},
        { path: '/staffs', label: 'Faculty', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        )},
        { path: '/outpass', label: 'Outpass', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        )},
        { path: '/subjects', label: 'Subjects', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        )},
        { path: '/student-notice', label: 'Notices', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        )},
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
            <header className={`sp-header${scrolled ? ' sp-scrolled' : ''}`}>
                <div className="sp-header-inner">
                    {/* Brand */}
                    <div className="sp-brand" onClick={() => handleNavigation('/dashboard')}>
                        <div className="sp-brand-logo">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                        </div>
                        <span className="sp-brand-text">JIT Campus</span>
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

                        <button className="sp-header-icon-btn" title="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            <span className="sp-notif-dot"/>
                        </button>

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
                                <span className="sp-user-name">{user?.name?.split(' ')[0] || 'Student'}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </button>
                            {isDropdownOpen && (
                                <div className="sp-dropdown">
                                    <div className="sp-dropdown-head">
                                        <div className="sp-dropdown-uname">{user?.name || 'Student'}</div>
                                        <div className="sp-dropdown-email">{user?.email || user?.registerNumber}</div>
                                    </div>
                                    <button className="sp-dropdown-item" onClick={() => handleNavigation('/profile')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        My Profile
                                    </button>
                                    <button className="sp-dropdown-item" onClick={() => handleNavigation('/dashboard')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                        Dashboard
                                    </button>
                                    <div className="sp-dropdown-sep"/>
                                    <button className="sp-dropdown-item sp-danger" onClick={handleLogout}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`sp-mob-nav-link${isActive(item.path) ? ' sp-active' : ''}`}
                                onClick={() => handleNavigation(item.path)}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                        <div className="sp-dropdown-sep"/>
                        <button className="sp-mob-nav-link sp-danger" onClick={handleLogout}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default StudentHeader;
