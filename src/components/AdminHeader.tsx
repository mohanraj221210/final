import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
    activeMenu: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeMenu }) => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/admin-login');
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsSidebarOpen(false);
    };

    const navGroups = [
        {
            title: 'Overview',
            items: [
                { key: 'dashboard', path: '/admin/dashboard',     label: 'Dashboard',     icon: '📊' },
                { key: 'outpass',   path: '/admin/outpass',       label: 'Outpass',       icon: '📝' },
                { key: 'profile',   path: '/admin/profile',       label: 'Profile',       icon: '👤' },
            ]
        },
        {
            title: 'Manage',
            items: [
                { key: 'staff',     path: '/admin/manage-staff',           label: 'Staff',         icon: '👨‍🏫' },
                { key: 'incharge',  path: '/admin/manage-year-incharge',   label: 'Year Incharge', icon: '⚡' },
                { key: 'warden',    path: '/admin/manage-warden',          label: 'Warden',        icon: '🏠' },
                { key: 'security',  path: '/admin/manage-security',        label: 'Security',      icon: '👮' },
                { key: 'transport', path: '/admin/manage-bus',             label: 'Transport',     icon: '🚌' },
            ]
        }
    ];

    const SidebarContent = () => (
        <div className="adm-sidebar-inner">
            <div className="adm-sidebar-header">
                <span className="adm-sidebar-logo">🎓</span>
                <div>
                    <div className="adm-sidebar-brand">JIT Admin</div>
                    <div className="adm-sidebar-subbrand">Portal</div>
                </div>
            </div>

            <nav className="adm-sidebar-nav">
                {navGroups.map(group => (
                    <div key={group.title} className="adm-nav-group">
                        <div className="adm-nav-group-title">{group.title}</div>
                        {group.items.map(item => (
                            <button
                                key={item.key}
                                className={`adm-nav-link ${activeMenu === item.key ? 'adm-active' : ''}`}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <span className="adm-nav-icon">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="adm-sidebar-footer">
                <div className="adm-role-pill">Admin</div>
                <button className="adm-logout" onClick={handleLogout}>
                    🚪 Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="adm-sidebar">
                <SidebarContent />
            </aside>

            {/* Mobile Top Bar */}
            <header className="adm-mobile-topbar">
                <button
                    className="adm-mobile-toggle"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    <span></span><span></span><span></span>
                </button>
                <div className="adm-mobile-brand">
                    <span>🎓</span>
                    <span>JIT Admin</span>
                </div>
                <button className="adm-mobile-logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="adm-overlay" onClick={() => setIsSidebarOpen(false)}>
                    <div className="adm-mobile-sidebar" onClick={e => e.stopPropagation()}>
                        <SidebarContent />
                    </div>
                </div>
            )}

            <style>{`
                /* Admin Sidebar */
                .adm-sidebar {
                    position: fixed;
                    top: 0; left: 0; bottom: 0;
                    width: var(--sidebar-width);
                    background: linear-gradient(180deg, #111827 0%, #1e293b 100%);
                    z-index: 200;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }
                .adm-sidebar-inner {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 100vh;
                }
                .adm-sidebar-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-5) var(--space-5);
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    flex-shrink: 0;
                }
                .adm-sidebar-logo { font-size: 2rem; }
                .adm-sidebar-brand {
                    font-size: 1rem;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                }
                .adm-sidebar-subbrand {
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.4);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .adm-sidebar-nav {
                    flex: 1;
                    padding: var(--space-4) var(--space-3);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-5);
                    overflow-y: auto;
                }
                .adm-nav-group { display: flex; flex-direction: column; gap: 2px; }
                .adm-nav-group-title {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.3);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    padding: 0 var(--space-3);
                    margin-bottom: var(--space-1);
                }
                .adm-nav-link {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    height: 42px;
                    padding: 0 var(--space-3);
                    border-radius: var(--radius-md);
                    color: rgba(255,255,255,0.6);
                    font-size: 0.88rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: var(--transition-fast);
                    border: none;
                    background: transparent;
                    text-align: left;
                    width: 100%;
                    font-family: inherit;
                }
                .adm-nav-link:hover { color: white; background: rgba(255,255,255,0.08); }
                .adm-nav-link.adm-active { color: white; background: var(--primary); font-weight: 600; }
                .adm-nav-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }
                .adm-sidebar-footer {
                    padding: var(--space-5);
                    border-top: 1px solid rgba(255,255,255,0.08);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }
                .adm-role-pill {
                    display: inline-flex;
                    align-items: center;
                    height: 28px;
                    padding: 0 var(--space-3);
                    background: rgba(37,99,235,0.3);
                    color: #93c5fd;
                    border-radius: var(--radius-full);
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    border: 1px solid rgba(37,99,235,0.5);
                    width: fit-content;
                }
                .adm-logout {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    height: 40px;
                    padding: 0 var(--space-3);
                    background: rgba(239,68,68,0.15);
                    color: #fca5a5;
                    border: 1px solid rgba(239,68,68,0.3);
                    border-radius: var(--radius-md);
                    font-size: 0.88rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition-fast);
                    font-family: inherit;
                }
                .adm-logout:hover { background: var(--danger); color: white; border-color: var(--danger); }

                /* Mobile Top Bar */
                .adm-mobile-topbar {
                    display: none;
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    height: 60px;
                    background: rgba(17,24,39,0.97);
                    backdrop-filter: blur(16px);
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    z-index: 300;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 var(--space-4);
                }
                .adm-mobile-toggle {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: var(--space-2);
                }
                .adm-mobile-toggle span { display: block; width: 20px; height: 2px; background: white; border-radius: 2px; }
                .adm-mobile-brand {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-size: 1rem;
                    font-weight: 700;
                    color: white;
                }
                .adm-mobile-logout-btn {
                    height: 32px;
                    padding: 0 var(--space-3);
                    background: rgba(239,68,68,0.2);
                    color: #fca5a5;
                    border: 1px solid rgba(239,68,68,0.3);
                    border-radius: var(--radius-md);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                }

                /* Mobile Sidebar */
                .adm-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.6);
                    z-index: 1100;
                    backdrop-filter: blur(4px);
                    animation: fadeIn 0.2s ease;
                }
                .adm-mobile-sidebar {
                    position: absolute;
                    top: 0; left: 0; bottom: 0;
                    width: min(280px, 85vw);
                    background: linear-gradient(180deg, #111827 0%, #1e293b 100%);
                    animation: slideInLeft 0.25s ease;
                    overflow-y: auto;
                }

                @media (max-width: 768px) {
                    .adm-sidebar { display: none; }
                    .adm-mobile-topbar { display: flex; }
                }
            `}</style>
        </>
    );
};

export default AdminHeader;
