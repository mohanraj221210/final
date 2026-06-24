import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Shield,
    FileText,
    Bus,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    Building2,
    ChevronRight,
    Palette,
    Moon,
    Sun,
    Check
} from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
    title: string;
    activeMenu?: string;
}

const AdminLayout: React.FC<LayoutProps> = ({ children, title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [adminName, setAdminName] = useState("Admin User");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ent-dark-mode') === 'true');
    const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('ent-primary-color') || 'indigo');

    useEffect(() => {
        if (darkMode) document.documentElement.setAttribute('data-theme', 'dark');
        else document.documentElement.removeAttribute('data-theme');
        document.documentElement.setAttribute('data-color', primaryColor);

        localStorage.setItem('ent-dark-mode', String(darkMode));
        localStorage.setItem('ent-primary-color', primaryColor);
    }, [darkMode, primaryColor]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const admin = await adminService.getProfile();
                if (admin && admin.name) {
                    setAdminName(admin.name);
                }
            } catch (error) {
                console.error("Failed to fetch admin profile", error);
            }
        };
        fetchProfile();

        // Handle responsive sidebar collapse automatically
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { label: 'Staff Directory', path: '/admin/manage-staff', icon: <Users size={20} /> },
        { label: 'Year Incharges', path: '/admin/manage-year-incharge', icon: <UserCheck size={20} /> },
        { label: 'Wardens', path: '/admin/manage-warden', icon: <Building2 size={20} /> },
        { label: 'Security Team', path: '/admin/manage-security', icon: <Shield size={20} /> },
        { label: 'Outpass Requests', path: '/admin/outpass', icon: <FileText size={20} /> },
        { label: 'Transport Fleet', path: '/admin/manage-bus', icon: <Bus size={20} /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('isLoggedIn');
        navigate('/admin-login');
    };

    return (
        <div className="ent-layout">
            {/* Mobile Overlay */}
            {isSidebarOpen && <div className="ent-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* Sidebar */}
            <aside className={`ent-sidebar ${isSidebarOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="ent-sidebar-header">
                    <div className="ent-logo">
                        <div className="ent-logo-mark">
                            <span>JIT</span>
                        </div>
                        {!isCollapsed && <span className="ent-logo-text">Admin Portal</span>}
                    </div>
                    {/* Desktop Collapse Toggle */}
                    <button className="ent-collapse-btn hidden-mobile" onClick={() => setIsCollapsed(!isCollapsed)}>
                        <Menu size={18} />
                    </button>
                    {/* Mobile Close Toggle */}
                    <button className="ent-close-btn hidden-desktop" onClick={() => setIsSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="ent-nav-scroll">
                    <div className="ent-nav-group">
                        {!isCollapsed && <span className="ent-nav-label">Main Menu</span>}
                        <nav className="ent-nav">
                            {menuItems.map((item) => {
                                const isActive = location.pathname.includes(item.path);
                                return (
                                    <button
                                        key={item.path}
                                        className={`ent-nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsSidebarOpen(false);
                                        }}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <span className="ent-nav-icon">{item.icon}</span>
                                        {!isCollapsed && <span className="ent-nav-text">{item.label}</span>}
                                        {isActive && !isCollapsed && <span className="ent-nav-indicator"></span>}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="ent-sidebar-footer">
                    {!isCollapsed ? (
                        <div className="ent-user-card">
                            <div className="ent-avatar-sm">{adminName.charAt(0).toUpperCase()}</div>
                            <div className="ent-user-info">
                                <span className="ent-user-name">{adminName}</span>
                                <span className="ent-user-role">Administrator</span>
                            </div>
                            <button className="ent-logout-btn" onClick={handleLogout} title="Sign Out">
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button className="ent-nav-item ent-logout-collapsed" onClick={handleLogout} title="Sign Out">
                            <span className="ent-nav-icon"><LogOut size={20} /></span>
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`ent-main ${isCollapsed ? 'collapsed' : ''}`}>
                <header className="ent-header">
                    <div className="ent-header-left">
                        <button className="ent-mobile-menu hidden-desktop" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>

                        <div className="ent-breadcrumbs">
                            <Link to="/admin/dashboard" className="crumb-link">Admin</Link>
                            <ChevronRight size={14} className="crumb-sep" />
                            <span className="crumb-current">{title}</span>
                        </div>
                    </div>

                    <div className="ent-header-right">
                        <div className="ent-search">
                            <Search size={16} className="search-icon" />
                            <input type="text" placeholder="Search anything..." className="search-input" />
                            <div className="search-cmd">⌘K</div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button className="ent-icon-btn" onClick={() => setThemeMenuOpen(!themeMenuOpen)}>
                                <Palette size={18} />
                            </button>
                            {themeMenuOpen && (
                                <div className="theme-dropdown">
                                    <div className="theme-dropdown-header">Appearance</div>
                                    <div className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
                                        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                                    </div>
                                    <div className="theme-dropdown-header">Accent Color</div>
                                    <div className="color-options">
                                        {[
                                            { id: 'indigo', hex: '#4F46E5' },
                                            { id: 'emerald', hex: '#10B981' },
                                            { id: 'rose', hex: '#E11D48' },
                                            { id: 'amber', hex: '#F59E0B' }
                                        ].map(c => (
                                            <button
                                                key={c.id}
                                                className={`color-btn ${primaryColor === c.id ? 'active' : ''}`}
                                                style={{ backgroundColor: c.hex }}
                                                onClick={() => setPrimaryColor(c.id)}
                                            >
                                                {primaryColor === c.id && <Check size={12} color="white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="ent-icon-btn">
                            <Bell size={18} />
                            <span className="badge-dot"></span>
                        </button>

                        <div className="ent-profile-dropdown" onClick={() => navigate('/admin/profile')}>
                            <div className="ent-avatar">{adminName.charAt(0).toUpperCase()}</div>
                        </div>
                    </div>
                </header>

                <div className="ent-content">
                    {children}
                </div>
            </main>

            <style>{`
                /* Premium Enterprise SaaS CSS Variables */
                :root {
                    --bg-app: #F8FAFC;
                    --bg-surface: #FFFFFF;
                    --text-main: #0F172A;
                    --text-muted: #64748B;
                    --text-light: #94A3B8;
                    --border-light: #E2E8F0;
                    --primary: #4F46E5;
                    --primary-hover: #4338CA;
                    --primary-subtle: #EEF2FF;
                    --danger: #EF4444;
                    --radius-sm: 6px;
                    --radius-md: 8px;
                    --radius-lg: 12px;
                    --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
                    --shadow-sm: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
                    --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
                    --sidebar-width: 260px;
                    --sidebar-collapsed: 80px;
                    --header-height: 64px;
                }

                [data-theme="dark"] {
                    --bg-app: #0F172A;
                    --bg-surface: #1E293B;
                    --text-main: #F8FAFC;
                    --text-muted: #94A3B8;
                    --text-light: #64748B;
                    --border-light: #334155;
                }

                [data-color="emerald"] {
                    --primary: #10B981;
                    --primary-hover: #059669;
                    --primary-subtle: #D1FAE5;
                }
                [data-theme="dark"][data-color="emerald"] {
                    --primary-subtle: rgba(16, 185, 129, 0.15);
                }

                [data-color="rose"] {
                    --primary: #E11D48;
                    --primary-hover: #BE123C;
                    --primary-subtle: #FFE4E6;
                }
                [data-theme="dark"][data-color="rose"] {
                    --primary-subtle: rgba(225, 29, 72, 0.15);
                }

                [data-color="indigo"] {
                    --primary: #4F46E5;
                    --primary-hover: #4338CA;
                    --primary-subtle: #EEF2FF;
                }
                [data-theme="dark"][data-color="indigo"] {
                    --primary-subtle: rgba(79, 70, 229, 0.15);
                }
                
                [data-color="amber"] {
                    --primary: #F59E0B;
                    --primary-hover: #D97706;
                    --primary-subtle: #FEF3C7;
                }
                [data-theme="dark"][data-color="amber"] {
                    --primary-subtle: rgba(245, 158, 11, 0.15);
                }

                /* Component Overrides for Dark Mode */
                [data-theme="dark"] .kpi-card,
                [data-theme="dark"] .saas-card,
                [data-theme="dark"] .saas-table th,
                [data-theme="dark"] .theme-dropdown,
                [data-theme="dark"] .search-cmd {
                    background: var(--bg-surface);
                    border-color: var(--border-light);
                }
                
                [data-theme="dark"] .ent-search:focus-within {
                    background: var(--bg-surface);
                    box-shadow: 0 0 0 1px var(--primary);
                }

                [data-theme="dark"] .kpi-top .kpi-icon-box {
                    opacity: 0.9;
                }

                * { box-sizing: border-box; }

                .ent-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: var(--bg-app);
                    font-family: var(--font-sans);
                    color: var(--text-main);
                }

                /* Sidebar */
                .ent-sidebar {
                    width: var(--sidebar-width);
                    background-color: var(--bg-surface);
                    border-right: 1px solid var(--border-light);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 50;
                    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s;
                }
                .ent-sidebar.collapsed {
                    width: var(--sidebar-collapsed);
                }

                .ent-sidebar-header {
                    height: var(--header-height);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                    border-bottom: 1px solid var(--border-light);
                }
                .ent-sidebar.collapsed .ent-sidebar-header {
                    justify-content: center;
                    padding: 0;
                }

                .ent-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .ent-logo-mark {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, var(--primary), var(--primary-hover));
                    color: white;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 14px;
                    letter-spacing: -0.5px;
                    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
                }
                .ent-logo-text {
                    font-weight: 600;
                    font-size: 15px;
                    letter-spacing: -0.3px;
                }

                .ent-collapse-btn, .ent-close-btn, .ent-mobile-menu {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: var(--radius-sm);
                    transition: background 0.2s;
                }
                .ent-collapse-btn:hover, .ent-mobile-menu:hover { background: var(--bg-app); color: var(--text-main); }
                
                .ent-nav-scroll {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px 16px;
                }
                .ent-sidebar.collapsed .ent-nav-scroll { padding: 24px 12px; }

                .ent-nav-group { margin-bottom: 24px; }
                .ent-nav-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-light);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                    padding-left: 12px;
                }

                .ent-nav { display: flex; flex-direction: column; gap: 4px; }
                
                .ent-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 10px 12px;
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-md);
                    color: var(--text-muted);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }
                .ent-sidebar.collapsed .ent-nav-item { justify-content: center; padding: 12px 0; }

                .ent-nav-item:hover {
                    background-color: var(--bg-app);
                    color: var(--text-main);
                }
                .ent-nav-item.active {
                    background-color: var(--primary-subtle);
                    color: var(--primary);
                    font-weight: 600;
                }
                
                .ent-nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .ent-nav-indicator {
                    position: absolute;
                    right: 12px;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background-color: var(--primary);
                }

                .ent-sidebar-footer {
                    padding: 16px;
                    border-top: 1px solid var(--border-light);
                }
                .ent-sidebar.collapsed .ent-sidebar-footer { padding: 16px 12px; }

                .ent-user-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px;
                    border-radius: var(--radius-md);
                    background: var(--bg-app);
                    border: 1px solid var(--border-light);
                }
                .ent-avatar-sm {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, var(--text-muted), var(--text-main));
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                }
                .ent-user-info { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .ent-user-name { font-size: 13px; font-weight: 600; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
                .ent-user-role { font-size: 11px; color: var(--text-muted); }

                .ent-logout-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: var(--radius-sm);
                    transition: all 0.2s;
                }
                .ent-logout-btn:hover { background: #FEE2E2; color: var(--danger); }
                
                .ent-logout-collapsed { color: var(--danger); }
                .ent-logout-collapsed:hover { background: #FEE2E2; }

                /* Main Content Area */
                .ent-main {
                    flex: 1;
                    margin-left: var(--sidebar-width);
                    min-width: 0; /* Important for flex children truncating */
                    display: flex;
                    flex-direction: column;
                    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .ent-main.collapsed { margin-left: var(--sidebar-collapsed); }

                /* Header */
                .ent-header {
                    height: var(--header-height);
                    background: var(--bg-surface);
                    border-bottom: 1px solid var(--border-light);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    position: sticky;
                    top: 0;
                    z-index: 30;
                }

                .ent-header-left { display: flex; align-items: center; gap: 16px; }
                
                .ent-breadcrumbs {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                }
                .crumb-link { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
                .crumb-link:hover { color: var(--text-main); }
                .crumb-sep { color: var(--text-light); }
                .crumb-current { color: var(--text-main); font-weight: 600; }

                .ent-header-right { display: flex; align-items: center; gap: 20px; }

                .ent-search {
                    display: flex;
                    align-items: center;
                    background: var(--bg-app);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-md);
                    padding: 0 12px;
                    height: 36px;
                    width: 260px;
                    transition: all 0.2s;
                }
                .ent-search:focus-within {
                    background: var(--bg-surface);
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--primary-subtle);
                }
                .search-icon { color: var(--text-muted); margin-right: 8px; }
                .search-input {
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 13px;
                    width: 100%;
                    color: var(--text-main);
                }
                .search-input::placeholder { color: var(--text-light); }
                .search-cmd {
                    font-size: 11px;
                    color: var(--text-muted);
                    background: var(--border-light);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                }

                .ent-icon-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    position: relative;
                    padding: 6px;
                    border-radius: var(--radius-sm);
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ent-icon-btn:hover { background: var(--bg-app); color: var(--text-main); }
                .badge-dot {
                    position: absolute;
                    top: 6px; right: 8px;
                    width: 6px; height: 6px;
                    background: var(--danger);
                    border-radius: 50%;
                    border: 1px solid var(--bg-surface);
                }

                .ent-profile-dropdown {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .ent-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--primary-subtle);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 600;
                    border: 1px solid var(--border-light);
                    transition: all 0.2s;
                }
                .ent-profile-dropdown:hover .ent-avatar {
                    border-color: var(--primary);
                }
                
                .theme-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 10px;
                    width: 220px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-sm);
                    padding: 16px;
                    z-index: 100;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .theme-dropdown-header {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: var(--text-light);
                    font-weight: 600;
                    letter-spacing: 0.05em;
                }
                .theme-toggle {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    color: var(--text-main);
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    background: var(--bg-app);
                    transition: background 0.2s;
                }
                .theme-toggle:hover {
                    background: var(--border-light);
                }
                .color-options {
                    display: flex;
                    gap: 12px;
                    padding: 4px 0;
                }
                .color-btn {
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
                .color-btn:hover {
                    transform: scale(1.1);
                }
                .color-btn.active {
                    border-color: var(--text-main);
                }

                /* Content */
                .ent-content {
                    padding: 32px;
                    max-width: 1400px;
                    margin: 0 auto;
                    width: 100%;
                    flex: 1;
                }

                /* Mobile Overrides */
                .hidden-desktop { display: none; }
                .hidden-mobile { display: flex; }

                @media (max-width: 1024px) {
                    .ent-sidebar { transform: translateX(-100%); }
                    .ent-sidebar.mobile-open { transform: translateX(0); width: var(--sidebar-width); }
                    .ent-main { margin-left: 0; }
                    .ent-main.collapsed { margin-left: 0; }
                    
                    .hidden-desktop { display: flex; }
                    .hidden-mobile { display: none; }
                    
                    .ent-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(15, 23, 42, 0.4);
                        backdrop-filter: blur(2px);
                        z-index: 40;
                    }

                    .ent-header { padding: 0 20px; }
                    .ent-content { padding: 20px; }
                    .ent-search { display: none; }
                    
                    .ent-nav-scroll { padding: 20px 16px; }
                    .ent-nav-item { justify-content: flex-start; padding: 12px; }
                    .ent-nav-text { display: block; }
                    .ent-sidebar-footer { display: block; }
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
