
import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminService } from '../../services/adminService';

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
    }, []);

    const menuItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { label: 'Staff', path: '/admin/manage-staff', icon: '👨‍🏫' },
        { label: 'Year-Incharge', path: '/admin/manage-year-incharge', icon: '⚡' },
        { label: 'Warden', path: '/admin/manage-warden', icon: '🏠' },
        { label: 'Security', path: '/admin/manage-security', icon: '👮' },
        { label: 'Outpass', path: '/admin/outpass', icon: '📝' },
        { label: 'Transport', path: '/admin/manage-bus', icon: '🚌' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('isLoggedIn');
        navigate('/admin-login');
    };

    return (
        <div className="admin-layout">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-icon">🎓</div>
                    <span className="logo-text">JIT Admin</span>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            className={`nav-item ${location.pathname.includes(item.path) ? 'active' : ''}`}
                            onClick={() => {
                                navigate(item.path);
                                setIsSidebarOpen(false);
                            }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item logout" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span>
                        <span className="nav-label">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-wrapper">
                <header className="top-header">
                    <div className="header-left">
                        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
                        <h2 className="header-title">{title}</h2>
                    </div>

                    <div className="header-actions">

                        <div className="admin-profile" onClick={() => navigate('/admin/profile')}>
                            <div className="avatar">{adminName.charAt(0).toUpperCase()}</div>
                            <div className="info">
                                <span className="name">{adminName}</span>
                                <span className="role">Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    {children}
                </div>
            </main>

            <style>{`
        :root {
            --sidebar-width: 260px;
            --primary-color: #4f46e5;
            --primary-light: #eef2ff;
            --bg-color: #f3f4f6;
            --text-color: #111827;
            --border-color: #e5e7eb;
            --header-height: 70px;
        }

        .admin-layout {
            display: flex;
            min-height: 100vh;
            background-color: var(--bg-color);
            font-family: 'Inter', system-ui, sans-serif;
            color: var(--text-color);
        }

        /* Sidebar Overlay (Mobile) */
        .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 40;
            backdrop-filter: blur(2px);
            display: none;
        }

        /* Sidebar Styles */
        .sidebar {
            width: var(--sidebar-width);
            background: white;
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            z-index: 50;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateX(0);
        }

        .sidebar-header {
            height: var(--header-height);
            display: flex;
            align-items: center;
            padding: 0 24px;
            border-bottom: 1px solid var(--border-color);
            gap: 12px;
        }

        .logo-icon {
            font-size: 20px;
            background: linear-gradient(135deg, #4f46e5, #4338ca);
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            color: white;
            box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
        }

        .logo-text {
            font-weight: 700;
            font-size: 1.1rem;
            color: #111827;
        }

        .close-sidebar-btn {
            margin-left: auto;
            background: transparent;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            display: none;
        }

        .sidebar-nav {
            padding: 24px 16px;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            overflow-y: auto;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 10px;
            border: none;
            background: transparent;
            color: #6b7280;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            width: 100%;
            font-size: 0.9rem;
        }

        .nav-item:hover {
            background: #f9fafb;
            color: #111827;
        }

        .nav-item.active {
            background: var(--primary-light);
            color: var(--primary-color);
            font-weight: 600;
        }

        .nav-icon {
            font-size: 1.2rem;
            width: 24px;
            text-align: center;
        }

        .sidebar-footer {
            padding: 20px 16px;
            border-top: 1px solid var(--border-color);
        }

        .nav-item.logout {
            color: #ef4444;
        }
        
        .nav-item.logout:hover {
            background: #fef2f2;
            color: #dc2626;
        }

        /* Main Content Styles */
        .main-wrapper {
            flex: 1;
            margin-left: var(--sidebar-width);
            display: flex;
            flex-direction: column;
            width: calc(100% - var(--sidebar-width));
            transition: margin-left 0.3s ease, width 0.3s ease;
        }

        .top-header {
            height: var(--header-height);
            background: white;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 32px;
            position: sticky;
            top: 0;
            z-index: 30;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .mobile-menu-btn {
            display: none;
            background: transparent;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: #374151;
            padding: 4px;
        }

        .header-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #374151;
            margin: 0;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 24px;
        }

        .search-bar {
            display: flex;
            align-items: center;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 8px 16px;
            margin-top: 50px;
            border-radius: 99px;
            width: 280px;
            gap: 10px;
            transition: all 0.2s ease;
        }

        .search-bar:focus-within {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
            background: white;
        }

        .search-icon {
            color: #9ca3af;
            font-size: 1rem;
        }

        .search-bar input {
            border: none;
            background: transparent;
            outline: none;
            width: 100%;
            font-size: 0.9rem;
            color: #111827;
        }

        .admin-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            padding: 4px;
            border-radius: 99px;
            transition: background 0.2s;
        }

        .admin-profile:hover {
            background: #f9fafb;
        }

        .avatar {
            width: 36px;
            height: 36px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.95rem;
            box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
        }

        .info {
            display: flex;
            flex-direction: column;
        }

        .info .name {
            font-weight: 600;
            font-size: 0.85rem;
            color: #111827;
            line-height: 1.2;
        }

        .info .role {
            font-size: 0.75rem;
            color: #6b7280;
        }

        .content-area {
            padding: 32px;
            overflow-y: auto;
            height: calc(100vh - var(--header-height));
            max-width: 1600px;
            width: 100%;
            margin: 0 auto;
        }

        @media (max-width: 1024px) {
            .sidebar {
                transform: translateX(-100%);
            }
            .sidebar.open {
                transform: translateX(0);
            }
            .main-wrapper {
                margin-left: 0;
                width: 100%;
            }
            .mobile-menu-btn {
                display: block;
            }
            .sidebar-overlay {
                display: block;
            }
            .close-sidebar-btn {
                display: block;
            }
            .search-bar {
                display: none;
            }
            .info {
                display: none;
            }
            .top-header {
                padding: 0 16px;
            }
            .content-area {
                padding: 16px;
            }
        }
      `}</style>
        </div>
    );
};

export default AdminLayout;
