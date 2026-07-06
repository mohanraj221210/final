import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminService } from '../services/adminService';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Building2,
    Shield,
    FileText,
    Bus,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    ChevronRight,
    Palette,
    Moon,
    Sun,
    Check,
    User
} from 'lucide-react';

interface AdminHeaderProps {
    activeMenu?: string;
    title?: string;
    isCollapsed?: boolean;
    setIsCollapsed?: (collapsed: boolean) => void;
    isSidebarOpen?: boolean;
    setIsSidebarOpen?: (open: boolean) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
    activeMenu,
    title = "Admin Panel",
    isCollapsed,
    setIsCollapsed,
    isSidebarOpen,
    setIsSidebarOpen
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Fallbacks if parent layout doesn't provide them
    const [localCollapsed, setLocalCollapsed] = useState(false);
    const [localSidebarOpen, setLocalSidebarOpen] = useState(false);

    const isCollapsedVal = isCollapsed !== undefined ? isCollapsed : localCollapsed;
    const setIsCollapsedVal = setIsCollapsed !== undefined ? setIsCollapsed : setLocalCollapsed;
    const isSidebarOpenVal = isSidebarOpen !== undefined ? isSidebarOpen : localSidebarOpen;
    const setIsSidebarOpenVal = setIsSidebarOpen !== undefined ? setIsSidebarOpen : setLocalSidebarOpen;

    // Dropdowns
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const [notifMenuOpen, setNotifMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Profile Details
    const [adminName, setAdminName] = useState("Admin User");
    const [adminEmail, setAdminEmail] = useState("admin@jit.edu");
    const [adminInitial, setAdminInitial] = useState("A");

    // Themes
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ent-dark-mode') === 'true');
    const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('ent-primary-color') || 'indigo');

    const dropdownRef = useRef<HTMLDivElement>(null);
    const paletteRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    // Sync theme settings with document elements
    useEffect(() => {
        if (darkMode) document.documentElement.setAttribute('data-theme', 'dark');
        else document.documentElement.removeAttribute('data-theme');
        document.documentElement.setAttribute('data-color', primaryColor);

        localStorage.setItem('ent-dark-mode', String(darkMode));
        localStorage.setItem('ent-primary-color', primaryColor);
    }, [darkMode, primaryColor]);

    // Fetch dynamic profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const admin = await adminService.getProfile();
                if (admin) {
                    if (admin.name) {
                        setAdminName(admin.name);
                        setAdminInitial(admin.name.charAt(0).toUpperCase());
                    }
                    if (admin.email) {
                        setAdminEmail(admin.email);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch admin profile in AdminHeader", error);
            }
        };
        fetchProfile();
    }, []);

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setProfileMenuOpen(false);
            }
            if (paletteRef.current && !paletteRef.current.contains(target)) {
                setThemeMenuOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(target)) {
                setNotifMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle logout action
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/admin-login');
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsSidebarOpenVal(false);
    };

    // Groups of navigation items
    const navGroups = [
        {
            title: 'Overview',
            items: [
                { key: 'dashboard', path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                { key: 'outpass', path: '/admin/outpass', label: 'Outpass Requests', icon: <FileText size={20} /> },
                { key: 'profile', path: '/admin/profile', label: 'My Profile', icon: <User size={20} /> },
            ]
        },
        {
            title: 'Manage Directory',
            items: [
                { key: 'staff', path: '/admin/manage-staff', label: 'Faculty Directory', icon: <Users size={20} /> },
                { key: 'incharge', path: '/admin/manage-year-incharge', label: 'Year Incharges', icon: <UserCheck size={20} /> },
                { key: 'warden', path: '/admin/manage-warden', label: 'Hostel Wardens', icon: <Building2 size={20} /> },
                { key: 'security', path: '/admin/manage-security', label: 'Security Team', icon: <Shield size={20} /> },
                { key: 'transport', path: '/admin/manage-bus', label: 'Transport Fleet', icon: <Bus size={20} /> },
            ]
        }
    ];

    const isActive = (item: { key: string; path: string }) => {
        if (activeMenu) {
            // Map legacy key names to match
            const mappedActive = activeMenu.toLowerCase();
            const mappedItemKey = item.key.toLowerCase();
            if (mappedActive === mappedItemKey) return true;
            if (mappedActive === 'yearincharge' && mappedItemKey === 'incharge') return true;
            if (mappedActive === 'bus' && mappedItemKey === 'transport') return true;
        }
        return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    };

    // Mobile Bottom Floating Nav Items
    const bottomNavItems = [
        { key: 'dashboard', path: '/admin/dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
        { key: 'outpass', path: '/admin/outpass', label: 'Outpass', icon: <FileText size={20} /> },
        { key: 'staff', path: '/admin/manage-staff', label: 'Faculty', icon: <Users size={20} /> },
        { key: 'profile', path: '/admin/profile', label: 'Profile', icon: <User size={20} /> }
    ];

    const notifications = [
        { id: 1, text: "⚠️ 3 new outpass requests pending warden review", time: "5 mins ago", read: false },
        { id: 2, text: "⚡ Year Incharge approved student OD outpass", time: "1 hour ago", read: true },
        { id: 3, text: "👮 Watchman recorded entry for Reg #210423001", time: "3 hours ago", read: true }
    ];

    const SidebarContent = () => (
        <div className="adm-sidebar-inner">
            <div className="adm-sidebar-header">
                <div className="adm-brand-card">
                    <div className="adm-sidebar-logo">🎓</div>
                    {!isCollapsedVal && (
                        <div className="adm-brand-copy">
                            <div className="adm-sidebar-brand">JIT Admin</div>
                            <div className="adm-sidebar-subbrand">Campus Access</div>
                        </div>
                    )}
                    {!isCollapsedVal && <span className="adm-live-badge">Live</span>}
                </div>
            </div>

            {!isCollapsedVal && (
                <div className="adm-sidebar-hero">
                    <p className="adm-hero-label">Access Hub</p>
                    <h3>Manage campus operations with clarity.</h3>
                </div>
            )}

            <nav className="adm-sidebar-nav">
                {navGroups.map(group => (
                    <div key={group.title} className="adm-nav-group">
                        {!isCollapsedVal && <div className="adm-nav-group-title">{group.title}</div>}
                        {group.items.map(item => {
                            const active = isActive(item);
                            return (
                                <button
                                    key={item.key}
                                    className={`adm-nav-link ${active ? 'adm-active' : ''}`}
                                    onClick={() => handleNavigation(item.path)}
                                    title={isCollapsedVal ? item.label : undefined}
                                >
                                    <span className="adm-nav-icon">{item.icon}</span>
                                    {!isCollapsedVal && <span className="adm-nav-label">{item.label}</span>}
                                    {active && !isCollapsedVal && <span className="adm-nav-dot" />}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="adm-sidebar-footer">
                {!isCollapsedVal ? (
                    <div className="adm-user-pill-card">
                        <div className="adm-avatar-circle">{adminInitial}</div>
                        <div className="adm-user-meta-info">
                            <span className="adm-user-name-label">{adminName}</span>
                            <span className="adm-user-role-label">Administrator</span>
                        </div>
                        <button className="adm-sidebar-logout-btn" onClick={handleLogout} title="Sign Out">
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        className="adm-nav-link adm-logout-collapsed"
                        onClick={handleLogout}
                        title="Sign Out"
                    >
                        <span className="adm-nav-icon"><LogOut size={20} /></span>
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`adm-sidebar ${isCollapsedVal ? 'collapsed' : ''}`}>
                <SidebarContent />
            </aside>

            {/* Topbar Header */}
            <header className={`adm-header-bar ${isCollapsedVal ? 'expanded-width' : ''}`}>
                <div className="adm-header-left">
                    <button
                        className="adm-mobile-toggle-btn hidden-desktop"
                        onClick={() => setIsSidebarOpenVal(!isSidebarOpenVal)}
                        aria-label="Toggle Menu"
                    >
                        <Menu size={20} />
                    </button>

                    <button
                        className="adm-collapse-btn hidden-mobile"
                        onClick={() => setIsCollapsedVal(!isCollapsedVal)}
                        title={isCollapsedVal ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <Menu size={18} />
                    </button>

                    <div className="adm-breadcrumbs">
                        <span className="crumb-root">Admin</span>
                        <ChevronRight size={12} className="crumb-sep" />
                        <span className="crumb-active">{title}</span>
                    </div>
                </div>

                <div className="adm-header-right">
                    {/* Search */}
                    <div className="adm-search-container">
                        <Search size={16} className="adm-search-icon" />
                        <input
                            type="text"
                            placeholder="Search Permigo..."
                            className="adm-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Accent / Palette Dropdown */}
                    <div className="adm-nav-action-wrapper" ref={paletteRef}>
                        <button
                            className="adm-icon-action-btn"
                            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                            title="Appearance Settings"
                        >
                            <Palette size={18} />
                        </button>
                        {themeMenuOpen && (
                            <div className="adm-glass-dropdown palette-dropdown">
                                <div className="dropdown-section-title">Theme Mode</div>
                                <div className="theme-toggle-option" onClick={() => setDarkMode(!darkMode)}>
                                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                                    <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                                </div>
                                <div className="dropdown-section-title">Accent Color</div>
                                <div className="color-grid">
                                    {[
                                        { id: 'indigo', hex: '#4F46E5' },
                                        { id: 'emerald', hex: '#10B981' },
                                        { id: 'rose', hex: '#E11D48' },
                                        { id: 'amber', hex: '#F59E0B' }
                                    ].map(c => (
                                        <button
                                            key={c.id}
                                            className={`color-selection-btn ${primaryColor === c.id ? 'active' : ''}`}
                                            style={{ backgroundColor: c.hex }}
                                            onClick={() => setPrimaryColor(c.id)}
                                            title={c.id.charAt(0).toUpperCase() + c.id.slice(1)}
                                        >
                                            {primaryColor === c.id && <Check size={12} color="white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="adm-nav-action-wrapper" ref={notifRef}>
                        <button
                            className="adm-icon-action-btn"
                            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                            title="Notifications"
                        >
                            <Bell size={18} />
                            <span className="notif-badge-indicator" />
                        </button>
                        {notifMenuOpen && (
                            <div className="adm-glass-dropdown notifications-dropdown">
                                <div className="dropdown-header-block">
                                    <h4>System Alerts</h4>
                                    <p>Recent operations & logs</p>
                                </div>
                                <div className="notif-scroll-list">
                                    {notifications.map(n => (
                                        <div key={n.id} className={`notif-alert-item ${n.read ? 'read' : 'unread'}`}>
                                            <div className="alert-content">{n.text}</div>
                                            <div className="alert-time">{n.time}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Dropdown */}
                    <div className="adm-nav-action-wrapper" ref={dropdownRef}>
                        <div
                            className="adm-user-profile-trigger"
                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        >
                            <div className="adm-avatar-small">{adminInitial}</div>
                        </div>
                        {profileMenuOpen && (
                            <div className="adm-glass-dropdown profile-dropdown">
                                <div className="user-dropdown-header">
                                    <h4>{adminName}</h4>
                                    <p>{adminEmail}</p>
                                </div>
                                <div className="dropdown-divider-line" />
                                <button className="dropdown-menu-item" onClick={() => handleNavigation('/admin/profile')}>
                                    <User size={15} />
                                    My Profile
                                </button>
                                <div className="dropdown-divider-line" />
                                <button className="dropdown-menu-item danger" onClick={handleLogout}>
                                    <LogOut size={15} />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpenVal && (
                <div className="adm-overlay" onClick={() => setIsSidebarOpenVal(false)}>
                    <div className="adm-mobile-sidebar" onClick={e => e.stopPropagation()}>
                        <div className="adm-mobile-sidebar-close">
                            <button onClick={() => setIsSidebarOpenVal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Mobile Bottom Glassmorphic Navigation */}
            <nav className="adm-bottom-nav">
                <div className="adm-bottom-nav-inner">
                    {bottomNavItems.map(item => {
                        const active = isActive(item);
                        return (
                            <button
                                key={item.key}
                                className={`adm-bottom-nav-btn ${active ? 'active' : ''}`}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <span className="adm-bottom-nav-icon-wrap">
                                    {item.icon}
                                </span>
                                <span className="adm-bottom-nav-label">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <style>{`
                /* Admin Redesign Core Variables override support */
                :root {
                    --sidebar-width: 260px;
                    --sidebar-collapsed: 72px;
                    --header-height: 64px;
                    --primary-gradient: linear-gradient(135deg, var(--primary, #4F46E5) 0%, var(--primary-hover, #4338CA) 100%);
                }

                /* Layout Core Sidebar Styles */
                .adm-sidebar {
                    position: fixed;
                    top: 0; left: 0; bottom: 0;
                    width: var(--sidebar-width);
                    background: linear-gradient(180deg, #0b0f19 0%, #111827 50%, #030712 100%);
                    z-index: 100;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid rgba(255,255,255,0.06);
                    box-shadow: 10px 0 35px rgba(2, 6, 23, 0.25);
                    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .adm-sidebar.collapsed {
                    width: var(--sidebar-collapsed);
                }
                
                .adm-sidebar-inner {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    padding: 20px 14px;
                    box-sizing: border-box;
                }

                .adm-sidebar-header {
                    padding: 0 4px 16px;
                    flex-shrink: 0;
                }

                .adm-brand-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 10px 12px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
                    box-sizing: border-box;
                    overflow: hidden;
                }
                .adm-sidebar.collapsed .adm-brand-card {
                    padding: 8px;
                    justify-content: center;
                }

                .adm-sidebar-logo {
                    font-size: 1.4rem;
                    display: grid;
                    place-items: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: var(--primary-gradient);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
                    flex-shrink: 0;
                }

                .adm-brand-copy {
                    flex: 1;
                    min-width: 0;
                }
                .adm-sidebar-brand {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: #FFFFFF;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                }
                .adm-sidebar-subbrand {
                    font-size: 0.68rem;
                    color: rgba(255,255,255,0.45);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-top: 1px;
                }

                .adm-live-badge {
                    display: inline-flex;
                    align-items: center;
                    height: 20px;
                    padding: 0 6px;
                    border-radius: 99px;
                    background: rgba(16, 185, 129, 0.12);
                    color: #34d399;
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .adm-sidebar-hero {
                    padding: 12px 14px;
                    margin: 8px 4px 16px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(99, 102, 241, 0.03) 100%);
                    border: 1px solid rgba(99, 102, 241, 0.1);
                }
                .adm-hero-label {
                    margin: 0 0 4px;
                    font-size: 0.62rem;
                    font-weight: 700;
                    color: #818cf8;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .adm-sidebar-hero h3 {
                    margin: 0;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.85);
                    line-height: 1.4;
                }

                .adm-sidebar-nav {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 0 4px;
                }
                /* Hide scrollbar */
                .adm-sidebar-nav::-webkit-scrollbar { display: none; }
                .adm-sidebar-nav { -ms-overflow-style: none; scrollbar-width: none; }

                .adm-nav-group {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .adm-nav-group-title {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.3);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    padding: 0 10px;
                    margin-bottom: 6px;
                }

                .adm-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    height: 42px;
                    padding: 0 12px;
                    border-radius: 10px;
                    color: rgba(255,255,255,0.6);
                    font-size: 0.88rem;
                    font-weight: 550;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                    background: transparent;
                    text-align: left;
                    width: 100%;
                    font-family: inherit;
                    position: relative;
                    box-sizing: border-box;
                }
                .adm-sidebar.collapsed .adm-nav-link {
                    justify-content: center;
                    padding: 0;
                }

                .adm-nav-link:hover {
                    color: #FFFFFF;
                    background: rgba(255,255,255,0.05);
                    transform: translateX(2px);
                }
                .adm-sidebar.collapsed .adm-nav-link:hover {
                    transform: none;
                }

                .adm-nav-link.adm-active {
                    color: #FFFFFF;
                    background: linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%);
                    box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.15);
                    font-weight: 650;
                }

                .adm-nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.2s;
                }
                .adm-nav-link:hover .adm-nav-icon {
                    transform: scale(1.08);
                }

                .adm-nav-label {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .adm-nav-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background-color: var(--primary, #4F46E5);
                    box-shadow: 0 0 8px var(--primary, #4F46E5);
                }

                .adm-sidebar-footer {
                    padding-top: 14px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                    flex-shrink: 0;
                }

                .adm-user-pill-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 10px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    box-sizing: border-box;
                }

                .adm-avatar-circle {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--primary-gradient);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    font-weight: 700;
                    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
                    flex-shrink: 0;
                }

                .adm-user-meta-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                }
                .adm-user-name-label {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: white;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .adm-user-role-label {
                    font-size: 0.68rem;
                    color: rgba(255,255,255,0.45);
                    margin-top: 1px;
                }

                .adm-sidebar-logout-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.4);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 6px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                }
                .adm-sidebar-logout-btn:hover {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                .adm-logout-collapsed {
                    color: #ef4444 !important;
                }
                .adm-logout-collapsed:hover {
                    background: rgba(239, 68, 68, 0.12) !important;
                }

                /* Header Bar (Desktop & Mobile Unified Top Header) */
                .adm-header-bar {
                    position: fixed;
                    top: 0;
                    right: 0;
                    left: var(--sidebar-width);
                    height: var(--header-height);
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid var(--border-light, #E2E8F0);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    z-index: 90;
                    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-sizing: border-box;
                }
                
                [data-theme="dark"] .adm-header-bar {
                    background: rgba(30, 41, 59, 0.8);
                    border-bottom-color: var(--border-light, #334155);
                }

                .adm-header-bar.expanded-width {
                    left: var(--sidebar-collapsed);
                }

                .adm-header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .adm-collapse-btn, .adm-mobile-toggle-btn, .adm-icon-action-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted, #64748B);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .adm-collapse-btn:hover, .adm-mobile-toggle-btn:hover, .adm-icon-action-btn:hover {
                    background: var(--bg-app, #F8FAFC);
                    color: var(--text-main, #0F172A);
                }
                
                [data-theme="dark"] .adm-collapse-btn:hover,
                [data-theme="dark"] .adm-mobile-toggle-btn:hover,
                [data-theme="dark"] .adm-icon-action-btn:hover {
                    background: rgba(255,255,255,0.05);
                    color: #FFFFFF;
                }

                .adm-breadcrumbs {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.88rem;
                    font-weight: 500;
                }
                .crumb-root {
                    color: var(--text-muted, #64748B);
                }
                .crumb-sep {
                    color: var(--text-light, #94A3B8);
                }
                .crumb-active {
                    color: var(--text-main, #0F172A);
                    font-weight: 650;
                }

                .adm-header-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                /* Search container */
                .adm-search-container {
                    display: flex;
                    align-items: center;
                    background: var(--bg-app, #F8FAFC);
                    border: 1px solid var(--border-light, #E2E8F0);
                    border-radius: 10px;
                    padding: 0 12px;
                    height: 38px;
                    width: 240px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-sizing: border-box;
                }
                [data-theme="dark"] .adm-search-container {
                    background: #111827;
                    border-color: #334155;
                }

                .adm-search-container:focus-within {
                    background: var(--bg-surface, #FFFFFF);
                    border-color: var(--primary, #4F46E5);
                    box-shadow: 0 0 0 3px var(--primary-subtle, #EEF2FF);
                    width: 280px;
                }
                [data-theme="dark"] .adm-search-container:focus-within {
                    background: #1E293B;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
                }

                .adm-search-icon {
                    color: var(--text-light, #94A3B8);
                    margin-right: 8px;
                }
                .adm-search-input {
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 0.82rem;
                    width: 100%;
                    color: var(--text-main, #0F172A);
                }
                .adm-search-input::placeholder {
                    color: var(--text-light, #94A3B8);
                }

                /* Action wrapper & dropdowns */
                .adm-nav-action-wrapper {
                    position: relative;
                }

                .adm-glass-dropdown {
                    position: absolute;
                    top: calc(100% + 12px);
                    right: 0;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 14px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                    padding: 14px;
                    z-index: 200;
                    display: flex;
                    flex-direction: column;
                    animation: dropdownShow 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    transform-origin: top right;
                    box-sizing: border-box;
                }
                [data-theme="dark"] .adm-glass-dropdown {
                    background: rgba(30, 41, 59, 0.95);
                    border-color: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                @keyframes dropdownShow {
                    from { opacity: 0; transform: scale(0.95) translateY(-8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .palette-dropdown {
                    width: 200px;
                    gap: 10px;
                }
                .dropdown-section-title {
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    color: var(--text-light, #94A3B8);
                    font-weight: 700;
                    letter-spacing: 0.05em;
                }

                .theme-toggle-option {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    color: var(--text-main, #0F172A);
                    padding: 8px 12px;
                    border-radius: 8px;
                    background: var(--bg-app, #F8FAFC);
                    transition: background 0.2s;
                }
                [data-theme="dark"] .theme-toggle-option {
                    background: #111827;
                    color: #FFFFFF;
                }
                .theme-toggle-option:hover {
                    background: var(--border-light, #E2E8F0);
                }
                [data-theme="dark"] .theme-toggle-option:hover {
                    background: #1E293B;
                }

                .color-grid {
                    display: flex;
                    gap: 10px;
                    padding: 4px 0;
                }
                .color-selection-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: 2px solid transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                }
                .color-selection-btn:hover {
                    transform: scale(1.1);
                }
                .color-selection-btn.active {
                    border-color: var(--text-main, #0F172A);
                }
                [data-theme="dark"] .color-selection-btn.active {
                    border-color: #FFFFFF;
                }

                /* Notification Dropdown */
                .notifications-dropdown {
                    width: 300px;
                    padding: 0;
                    overflow: hidden;
                }
                .dropdown-header-block {
                    padding: 14px 16px;
                    background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%);
                    border-bottom: 1px solid var(--border-light, #E2E8F0);
                }
                [data-theme="dark"] .dropdown-header-block {
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }
                .dropdown-header-block h4 {
                    margin: 0;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--text-main, #0F172A);
                }
                [data-theme="dark"] .dropdown-header-block h4 {
                    color: #FFFFFF;
                }
                .dropdown-header-block p {
                    margin: 2px 0 0;
                    font-size: 0.72rem;
                    color: var(--text-muted, #64748B);
                }
                .notif-scroll-list {
                    max-height: 260px;
                    overflow-y: auto;
                }
                .notif-alert-item {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-light, #E2E8F0);
                    cursor: pointer;
                    transition: background 0.2s;
                    position: relative;
                }
                [data-theme="dark"] .notif-alert-item {
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }
                .notif-alert-item:hover {
                    background: var(--bg-app, #F8FAFC);
                }
                [data-theme="dark"] .notif-alert-item:hover {
                    background: #111827;
                }
                .notif-alert-item.unread::before {
                    content: '';
                    position: absolute;
                    top: 16px;
                    left: 6px;
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: var(--primary, #4F46E5);
                }
                .alert-content {
                    font-size: 0.8rem;
                    color: var(--text-main, #0F172A);
                    line-height: 1.35;
                }
                [data-theme="dark"] .alert-content {
                    color: rgba(255,255,255,0.85);
                }
                .alert-time {
                    font-size: 0.68rem;
                    color: var(--text-light, #94A3B8);
                    margin-top: 4px;
                }

                .notif-badge-indicator {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background-color: var(--danger, #EF4444);
                }

                /* Profile dropdown */
                .adm-user-profile-trigger {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .adm-avatar-small {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: var(--primary-gradient);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    font-weight: 700;
                    border: 1px solid var(--border-light, #E2E8F0);
                    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
                    transition: border-color 0.2s;
                }
                [data-theme="dark"] .adm-avatar-small {
                    border-color: #334155;
                }
                .adm-user-profile-trigger:hover .adm-avatar-small {
                    border-color: var(--primary, #4F46E5);
                }

                .profile-dropdown {
                    width: 220px;
                    padding: 8px 0;
                }
                .user-dropdown-header {
                    padding: 10px 16px;
                }
                .user-dropdown-header h4 {
                    margin: 0;
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: var(--text-main, #0F172A);
                }
                [data-theme="dark"] .user-dropdown-header h4 {
                    color: #FFFFFF;
                }
                .user-dropdown-header p {
                    margin: 2px 0 0;
                    font-size: 0.75rem;
                    color: var(--text-muted, #64748B);
                }
                .dropdown-divider-line {
                    height: 1px;
                    background: var(--border-light, #E2E8F0);
                    margin: 6px 0;
                }
                [data-theme="dark"] .dropdown-divider-line {
                    background: rgba(255, 255, 255, 0.06);
                }
                .dropdown-menu-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 9px 16px;
                    width: 100%;
                    border: none;
                    background: transparent;
                    text-align: left;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-main, #0F172A);
                    cursor: pointer;
                    transition: background 0.2s;
                    font-family: inherit;
                }
                [data-theme="dark"] .dropdown-menu-item {
                    color: rgba(255, 255, 255, 0.8);
                }
                .dropdown-menu-item:hover {
                    background: var(--bg-app, #F8FAFC);
                    color: var(--primary, #4F46E5);
                }
                [data-theme="dark"] .dropdown-menu-item:hover {
                    background: #111827;
                    color: #FFFFFF;
                }
                .dropdown-menu-item.danger {
                    color: var(--danger, #EF4444);
                }
                .dropdown-menu-item.danger:hover {
                    background: #FEF2F2;
                }
                [data-theme="dark"] .dropdown-menu-item.danger:hover {
                    background: rgba(239, 68, 68, 0.1);
                }

                /* Mobile Toggle */
                .hidden-desktop { display: none; }
                .hidden-mobile { display: flex; }

                /* Overlay */
                .adm-overlay {
                    position: fixed; inset: 0;
                    background: rgba(2, 6, 23, 0.5);
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                    animation: fadeIn 0.25s ease;
                }
                .adm-mobile-sidebar {
                    position: absolute;
                    top: 0; left: 0; bottom: 0;
                    width: min(280px, 80vw);
                    background: linear-gradient(180deg, #0b0f19 0%, #111827 100%);
                    animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }

                .adm-mobile-sidebar-close {
                    display: flex;
                    justify-content: flex-end;
                    padding: 16px;
                }
                .adm-mobile-sidebar-close button {
                    background: rgba(255,255,255,0.05);
                    border: none;
                    color: rgba(255,255,255,0.6);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    display: flex;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }

                /* Mobile Floating Bottom Nav */
                .adm-bottom-nav {
                    display: none;
                    position: fixed;
                    bottom: 0; left: 0; right: 0;
                    z-index: 99;
                    padding-bottom: env(safe-area-inset-bottom, 12px);
                    background: transparent;
                    pointer-events: none;
                }
                .adm-bottom-nav-inner {
                    pointer-events: all;
                    margin: 0 16px 12px;
                    height: 60px;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px) saturate(160%);
                    -webkit-backdrop-filter: blur(20px) saturate(160%);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    padding: 0 8px;
                }
                [data-theme="dark"] .adm-bottom-nav-inner {
                    background: rgba(30, 41, 59, 0.8);
                    border-color: rgba(255, 255, 255, 0.05);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
                }

                .adm-bottom-nav-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    flex: 1;
                    height: 100%;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-muted, #64748B);
                    font-family: inherit;
                    -webkit-tap-highlight-color: transparent;
                    outline: none;
                }
                
                .adm-bottom-nav-icon-wrap {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 26px;
                    border-radius: 8px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .adm-bottom-nav-btn.active {
                    color: var(--primary, #4F46E5);
                }
                [data-theme="dark"] .adm-bottom-nav-btn.active {
                    color: #FFFFFF;
                }
                .adm-bottom-nav-btn.active .adm-bottom-nav-icon-wrap {
                    background: var(--primary-subtle, #EEF2FF);
                    box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.1);
                }
                [data-theme="dark"] .adm-bottom-nav-btn.active .adm-bottom-nav-icon-wrap {
                    background: rgba(79, 70, 229, 0.2);
                    box-shadow: 0 0 0 1px rgba(255,255,255,0.05);
                }

                .adm-bottom-nav-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                /* Responsive adjustments */
                @media (max-width: 1024px) {
                    .adm-sidebar { display: none !important; }
                    .adm-header-bar {
                        left: 0 !important;
                        padding: 0 16px;
                    }
                    .hidden-desktop { display: flex; }
                    .hidden-mobile { display: none; }
                    .adm-bottom-nav { display: block; }
                    
                    /* Adjust search layout on small screens */
                    .adm-search-container { width: 140px; }
                    .adm-search-container:focus-within { width: 180px; }
                }

                @media (max-width: 640px) {
                    .adm-breadcrumbs { display: none; }
                    .adm-search-container { display: none; }
                }
            `}</style>
        </>
    );
};

export default AdminHeader;
