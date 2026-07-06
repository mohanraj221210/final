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
                    --sidebar-width: 260px;
                    --sidebar-collapsed: 72px;
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
