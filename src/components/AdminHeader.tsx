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
                <div className="adm-brand-card">
                    <div className="adm-sidebar-logo">🎓</div>
                    <div className="adm-brand-copy">
                        <div className="adm-sidebar-brand">JIT Admin</div>
                        <div className="adm-sidebar-subbrand">Campus Operations</div>
                    </div>
                    <span className="adm-live-badge">Live</span>
                </div>
            </div>

            <div className="adm-sidebar-hero">
                <p className="adm-hero-label">Control Center</p>
                <h3>Manage campus access with clarity.</h3>
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
                                <span className="adm-nav-label">{item.label}</span>
                            </button>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="adm-sidebar-footer">
                <div className="adm-role-pill">Admin</div>
                <button className="adm-logout" onClick={handleLogout}>
                    <span>🚪</span>
                    Logout
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
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #111827 100%);
                    z-index: 200;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 18px 0 45px rgba(2, 6, 23, 0.28);
                }
                .adm-sidebar-inner {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 100vh;
                    padding: 20px 16px 18px;
                }
                .adm-sidebar-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: 0 0 16px;
                    flex-shrink: 0;
                }
                .adm-brand-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 12px 14px;
                    border-radius: 16px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.09);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
                }
                .adm-sidebar-logo {
                    font-size: 1.6rem;
                    display: grid;
                    place-items: center;
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
                    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
                }
                .adm-brand-copy {
                    flex: 1;
                    min-width: 0;
                }
                .adm-sidebar-brand {
                    font-size: 0.98rem;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.02em;
                    line-height: 1.15;
                }
                .adm-sidebar-subbrand {
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.58);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                    margin-top: 2px;
                }
                .adm-live-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 24px;
                    padding: 0 8px;
                    border-radius: 999px;
                    background: rgba(16, 185, 129, 0.16);
                    color: #86efac;
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    border: 1px solid rgba(16, 185, 129, 0.25);
                }
                .adm-sidebar-hero {
                    padding: 12px 14px 16px;
                    margin-bottom: 8px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(59,130,246,0.08) 100%);
                    border: 1px solid rgba(96,165,250,0.16);
                }
                .adm-hero-label {
                    margin: 0 0 6px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #93c5fd;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                }
                .adm-sidebar-hero h3 {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: white;
                    line-height: 1.4;
                }
                .adm-sidebar-nav {
                    flex: 1;
                    padding: 10px 2px 8px;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                    overflow-y: auto;
                }
                .adm-nav-group { display: flex; flex-direction: column; gap: 2px; }
                .adm-nav-group-title {
                    font-size: 0.64rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.38);
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    padding: 0 10px;
                    margin-bottom: 4px;
                }
                .adm-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-height: 43px;
                    padding: 0 12px;
                    border-radius: 12px;
                    color: rgba(255,255,255,0.72);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition-fast);
                    border: none;
                    background: transparent;
                    text-align: left;
                    width: 100%;
                    font-family: inherit;
                    position: relative;
                }
                .adm-nav-link:hover {
                    color: white;
                    background: rgba(255,255,255,0.08);
                    transform: translateX(2px);
                }
                .adm-nav-link.adm-active {
                    color: white;
                    background: linear-gradient(135deg, rgba(37,99,235,0.22) 0%, rgba(59,130,246,0.14) 100%);
                    font-weight: 700;
                    box-shadow: inset 0 0 0 1px rgba(147, 197, 253, 0.2);
                }
                .adm-nav-link.adm-active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 3px;
                    height: 18px;
                    border-radius: 999px;
                    background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
                }
                .adm-nav-icon {
                    font-size: 1rem;
                    width: 20px;
                    text-align: center;
                    flex-shrink: 0;
                }
                .adm-nav-label {
                    flex: 1;
                }
                .adm-sidebar-footer {
                    padding: 14px 2px 4px;
                    border-top: 1px solid rgba(255,255,255,0.08);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }
                .adm-role-pill {
                    display: inline-flex;
                    align-items: center;
                    height: 28px;
                    padding: 0 10px;
                    background: rgba(37,99,235,0.24);
                    color: #bfdbfe;
                    border-radius: var(--radius-full);
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    border: 1px solid rgba(59,130,246,0.38);
                    width: fit-content;
                }
                .adm-logout {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-2);
                    height: 42px;
                    padding: 0 var(--space-3);
                    background: rgba(239,68,68,0.15);
                    color: #fecaca;
                    border: 1px solid rgba(239,68,68,0.3);
                    border-radius: 12px;
                    font-size: 0.88rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: var(--transition-fast);
                    font-family: inherit;
                }
                .adm-logout:hover {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    border-color: #ef4444;
                }

                /* Mobile Top Bar */
                .adm-mobile-topbar {
                    display: none;
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    height: 64px;
                    background: rgba(15,23,42,0.94);
                    backdrop-filter: blur(16px);
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    z-index: 300;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 var(--space-4);
                    box-shadow: 0 10px 30px rgba(2, 6, 23, 0.16);
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
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: white;
                }
                .adm-mobile-logout-btn {
                    height: 34px;
                    padding: 0 var(--space-3);
                    background: rgba(239,68,68,0.2);
                    color: #fca5a5;
                    border: 1px solid rgba(239,68,68,0.3);
                    border-radius: 999px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    font-family: inherit;
                }

                /* Mobile Sidebar */
                .adm-overlay {
                    position: fixed; inset: 0;
                    background: rgba(2, 6, 23, 0.7);
                    z-index: 1100;
                    backdrop-filter: blur(4px);
                    animation: fadeIn 0.2s ease;
                }
                .adm-mobile-sidebar {
                    position: absolute;
                    top: 0; left: 0; bottom: 0;
                    width: min(290px, 85vw);
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
