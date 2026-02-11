import React from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: ReactNode;
    title: string;
}

const AdminLayout: React.FC<LayoutProps> = ({ children, title }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { label: 'Staff', path: '/admin/manage-staff', icon: '👨‍🏫' },
        { label: 'Year-Incharge', path: '/admin/manage-year-incharge', icon: '⚡' },
        { label: 'Warden', path: '/admin/manage-warden', icon: '🏠' },
        { label: 'Security', path: '/admin/manage-security', icon: '👮' },
        { label: 'Transport', path: '/admin/manage-bus', icon: '🚌' },
        { label: 'Profile', path: '/admin/profile', icon: '👤' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('isLoggedIn');
        navigate('/admin-login');
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-icon">🎓</div>
                    <span className="logo-text">JIT Admin</span>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
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
                    <h2 className="page-title">{title}</h2>
                    <div className="header-actions">
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input type="text" placeholder="Search..." />
                        </div>
                        <div className="admin-profile" onClick={() => navigate('/admin/profile')} style={{ cursor: 'pointer' }}>
                            <div className="avatar">A</div>
                            <div className="info">
                                <span className="name">Admin User</span>
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
            --primary-color: #6366f1;
            --bg-color: #f3f4f6;
            --text-color: #1f2937;
        }

        .admin-layout {
            display: flex;
            min-height: 100vh;
            background-color: var(--bg-color);
            font-family: 'Inter', sans-serif;
            color: var(--text-color);
        }

        /* Sidebar Styles */
        .sidebar {
            width: var(--sidebar-width);
            background: white;
            border-right: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            z-index: 10;
            transition: all 0.3s ease;
        }

        .sidebar-header {
            height: 70px;
            display: flex;
            align-items: center;
            padding: 0 24px;
            border-bottom: 1px solid #e5e7eb;
            gap: 12px;
        }

        .logo-icon {
            font-size: 24px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .logo-text {
            font-weight: 700;
            font-size: 1.2rem;
            color: #111827;
        }

        .sidebar-nav {
            padding: 24px 16px;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 12px;
            border: none;
            background: transparent;
            color: #6b7280;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            width: 100%;
            font-size: 0.95rem;
        }

        .nav-item:hover {
            background: #f3f4f6;
            color: #111827;
        }

        .nav-item.active {
            background: linear-gradient(90deg, #eff6ff, #f5f3ff);
            color: var(--primary-color);
            border-left: 3px solid var(--primary-color);
        }

        .nav-icon {
            font-size: 1.2rem;
            width: 24px;
            display: flex;
            justify-content: center;
        }

        .sidebar-footer {
            padding: 16px;
            border-top: 1px solid #e5e7eb;
        }

        .nav-item.logout {
            color: #ef4444;
        }
        
        .nav-item.logout:hover {
            background: #fef2f2;
        }

        /* Main Content Styles */
        .main-wrapper {
            flex: 1;
            margin-left: var(--sidebar-width);
            display: flex;
            flex-direction: column;
        }

        .top-header {
            height: 70px;
            background: white;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 32px;
            position: sticky;
            top: 0;
            z-index: 5;
        }

        .page-title {
            font-size: 1.5rem;
            margin-top: 40px;
            font-weight: 700;
            color: #111827;
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
            border-radius: 10px;
            width: 300px;
            gap: 8px;
            transition: all 0.2s;
        }

        .search-bar:focus-within {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .search-bar input {
            border: none;
            background: transparent;
            outline: none;
            width: 100%;
            font-size: 0.9rem;
        }

        .admin-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding-left: 24px;
            border-left: 1px solid #e5e7eb;
        }

        .avatar {
            width: 40px;
            height: 40px;
            background: #e0e7ff;
            color: var(--primary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
        }

        .info {
            display: flex;
            flex-direction: column;
        }

        .info .name {
            font-weight: 600;
            font-size: 0.9rem;
            color: #111827;
        }

        .info .role {
            font-size: 0.8rem;
            color: #6b7280;
        }

        .content-area {
            padding: 32px;
            overflow-y: auto;
            height: calc(100vh - 70px);
        }

        @media (max-width: 1024px) {
            :root {
                --sidebar-width: 80px;
            }
            .logo-text, .nav-label, .sidebar-footer, .info, .search-bar {
                display: none;
            }
            .sidebar-header {
                justify-content: center;
                padding: 0;
            }
            .nav-item {
                justify-content: center;
            }
            .nav-item.active {
                border-left: none;
                background: #eff6ff;
            }
        }
      `}</style>
        </div>
    );
};

export default AdminLayout;
