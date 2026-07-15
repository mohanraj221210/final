import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import AdminHeader from '../../components/AdminHeader';

interface LayoutProps {
    children: ReactNode;
    title: string;
    activeMenu?: string;
}

const AdminLayout: React.FC<LayoutProps> = ({ children, title, activeMenu }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        // Handle responsive sidebar collapse automatically
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="ent-layout">
            <div className="admin-bg-mesh">
                <div className="admin-bg-shape shape-1"></div>
                <div className="admin-bg-shape shape-2"></div>
                <div className="admin-bg-shape shape-3"></div>
            </div>
            <AdminHeader 
                activeMenu={activeMenu}
                title={title}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* Main Content Area */}
            <main className={`ent-main ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="ent-content">
                    {children}
                </div>
            </main>

            <style>{`
                /* Premium Enterprise SaaS CSS Variables & Design System */
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
                    --sidebar-width: 280px;
                    --sidebar-collapsed: 80px;
                    --header-height: 70px;
                    --glass-bg: rgba(255, 255, 255, 0.7);
                    --glass-border: rgba(255, 255, 255, 0.4);
                    --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
                }

                [data-theme="dark"] {
                    --bg-app: #0F172A;
                    --bg-surface: #1E293B;
                    --text-main: #F8FAFC;
                    --text-muted: #94A3B8;
                    --text-light: #64748B;
                    --border-light: #334155;
                    --glass-bg: rgba(30, 41, 59, 0.7);
                    --glass-border: rgba(255, 255, 255, 0.05);
                    --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
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
                    background: var(--glass-bg) !important;
                    border-color: var(--glass-border) !important;
                }
                
                [data-theme="dark"] .ent-search:focus-within {
                    background: var(--glass-bg);
                    box-shadow: 0 0 0 1px var(--primary);
                }

                [data-theme="dark"] .kpi-top .kpi-icon-box {
                    opacity: 0.9;
                }

                /* Global Glassmorphism Overrides for All Modules */
                .kpi-card, .saas-card, .detail-card, .custom-modal-content, .content-card, .glass-panel, .profile-card, .detail-section, .profile-card-main {
                    background: var(--glass-bg) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    border: 1px solid var(--glass-border) !important;
                    box-shadow: var(--glass-shadow) !important;
                }
                
                .saas-btn-outline, .admin-action-btn, .btn-outline, .btn-secondary {
                    background: rgba(255, 255, 255, 0.1) !important;
                    backdrop-filter: blur(10px) !important;
                    border-color: var(--glass-border) !important;
                }
                [data-theme="dark"] .saas-btn-outline, [data-theme="dark"] .btn-outline, [data-theme="dark"] .btn-secondary {
                    background: rgba(0, 0, 0, 0.2) !important;
                }
                
                .saas-table, .custom-table {
                    background: transparent !important;
                }
                
                .saas-table th, .custom-table th {
                    background: rgba(255, 255, 255, 0.3) !important;
                    backdrop-filter: blur(10px);
                }
                [data-theme="dark"] .saas-table th, [data-theme="dark"] .custom-table th {
                    background: rgba(0, 0, 0, 0.3) !important;
                }
                
                .saas-table tbody tr:hover, .custom-table tbody tr:hover {
                    background: rgba(255, 255, 255, 0.4) !important;
                }
                [data-theme="dark"] .saas-table tbody tr:hover, [data-theme="dark"] .custom-table tbody tr:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                }

                * { box-sizing: border-box; }

                .ent-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: var(--bg-app);
                    font-family: var(--font-sans);
                    color: var(--text-main);
                    position: relative;
                    overflow: hidden;
                }
                
                .admin-bg-mesh {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    z-index: 0;
                    overflow: hidden;
                    pointer-events: none;
                }
                
                .admin-bg-shape {
                    position: absolute;
                    filter: blur(80px);
                    opacity: 0.5;
                    border-radius: 50%;
                    animation: floatBg 20s infinite ease-in-out alternate;
                }
                
                .shape-1 {
                    top: -10%; left: -10%;
                    width: 50vw; height: 50vw;
                    background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%);
                }
                
                .shape-2 {
                    bottom: -10%; right: -10%;
                    width: 60vw; height: 60vw;
                    background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0) 70%);
                    animation-delay: -5s;
                }
                
                .shape-3 {
                    top: 40%; left: 50%;
                    width: 40vw; height: 40vw;
                    background: radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0) 70%);
                    animation-delay: -10s;
                }
                
                @keyframes floatBg {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(3%, 5%) scale(1.05); }
                    66% { transform: translate(-2%, 2%) scale(0.95); }
                    100% { transform: translate(0, 0) scale(1); }
                }

                [data-theme="dark"] .shape-1 { background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%); }
                [data-theme="dark"] .shape-2 { background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0) 70%); }
                [data-theme="dark"] .shape-3 { background: radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0) 70%); }

                /* Main Content Area */
                .ent-main {
                    flex: 1;
                    margin-left: var(--sidebar-width);
                    min-width: 0; /* Important for flex children truncating */
                    display: flex;
                    flex-direction: column;
                    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    padding-top: var(--header-height); /* Offset for sticky header */
                    box-sizing: border-box;
                    position: relative;
                    z-index: 1;
                }
                .ent-main.collapsed { margin-left: var(--sidebar-collapsed); }

                /* Content */
                .ent-content {
                    padding: 32px;
                    max-width: 1400px;
                    margin: 0 auto;
                    width: 100%;
                    flex: 1;
                    box-sizing: border-box;
                }

                @media (max-width: 1024px) {
                    .ent-main {
                        margin-left: 0;
                        padding-top: var(--header-height);
                        padding-bottom: 72px; /* Offset for bottom mobile nav */
                    }
                    .ent-main.collapsed { margin-left: 0; }
                    .ent-content { padding: 20px; }
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
