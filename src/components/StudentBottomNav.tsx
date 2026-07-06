import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { type User } from '../data/sampleData';
import { isProfileComplete } from '../utils/profileHelper';
import '../student-portal.css';

interface StudentBottomNavProps {
    activeTab?: 'home' | 'outpass' | 'subjects' | 'staff' | 'profile' | 'bus';
}

const StudentBottomNav: React.FC<StudentBottomNavProps> = ({ activeTab }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 850);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
                    headers: { authorization: `Bearer ${token}` }
                });
                if (response.status === 200) setUser(response.data.user);
            } catch (error) { console.error("Failed to fetch user profile in Bottom Nav"); }
        };
        fetchUserProfile();
    }, []);

    const handleNavigation = (path: string) => {

        const restrictedPaths = ['/staffs', '/student-notice', '/outpass', '/new-outpass'];
        if (restrictedPaths.includes(path)) {
            if (isProfileComplete(user)) {
                navigate(path);
            } else {
                toast.warn("Complete your profile to access this page", { position: "top-center", autoClose: 3000 });
            }
        } else {
            navigate(path);
        }
    };

    // Only render on mobile
    if (!isMobile) return null;

    const navItems = [
        {
            tab: 'home',
            path: '/dashboard',
            label: 'Home',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
        },
        {
            tab: 'outpass',
            path: '/outpass',
            label: 'Outpass',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
        },

        {
            tab: 'staff',
            path: '/staffs',
            label: 'Staff',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            tab: 'bus',
            path: '/bus-routes',
            label: 'Bus',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <rect x="8" y="7" width="8" height="6" rx="1" />
                    <path d="M6 21v-2"/><path d="M18 21v-2"/>
                    <circle cx="8" cy="17" r="1" /><circle cx="16" cy="17" r="1" />
                    <path d="M4 11h16"/>
                </svg>
            ),
        },
        {
            tab: 'profile',
            path: '/profile',
            label: 'Profile',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
        },
    ];

    const navContent = (
        <nav className="pb-bottom-nav">
            {navItems.map((item) => {
                const isTabActive = activeTab === item.tab;
                return (
                    <button
                        key={item.tab}
                        className={`pb-nav-btn ${isTabActive ? 'active' : ''}`}
                        onClick={() => handleNavigation(item.path)}
                        aria-label={item.label}
                    >
                        <div className="pb-nav-icon">{item.icon}</div>
                        <span className="pb-nav-lbl">{item.label}</span>
                        {isTabActive && <div className="pb-nav-active-dot" />}
                    </button>
                );
            })}

            <style>{`
                .pb-bottom-nav {
                    position: fixed;
                    bottom: 12px;
                    left: 12px;
                    right: 12px;
                    height: 68px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(59, 130, 246, 0.12);
                    border-radius: 22px;
                    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.10), 0 2px 8px rgba(15, 23, 42, 0.06);
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    padding: 0 8px;
                    z-index: 9999;
                    animation: navSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes navSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .pb-nav-btn {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 2px;
                    width: 52px;
                    height: 52px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    border-radius: 14px;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    color: #94A3B8;
                    -webkit-tap-highlight-color: transparent;
                    font-family: inherit;
                }

                .pb-nav-btn:active {
                    transform: scale(0.9);
                }

                .pb-nav-btn.active {
                    color: #3B82F6;
                    background: rgba(59, 130, 246, 0.08);
                }

                .pb-nav-btn:not(.active):hover {
                    color: #64748B;
                    background: rgba(100, 116, 139, 0.06);
                }

                .pb-nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .pb-nav-btn.active .pb-nav-icon {
                    transform: scale(1.1) translateY(-1px);
                }

                .pb-nav-lbl {
                    font-size: 0.62rem;
                    font-weight: 600;
                    letter-spacing: 0.01em;
                    line-height: 1;
                }

                .pb-nav-active-dot {
                    position: absolute;
                    bottom: 6px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: #3B82F6;
                    animation: dotPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes dotPop {
                    from { transform: translateX(-50%) scale(0); opacity: 0; }
                    to   { transform: translateX(-50%) scale(1); opacity: 1; }
                }
            `}</style>
        </nav>
    );

    // Use ReactDOM.createPortal to render DIRECTLY to document.body.
    // This bypasses ALL ancestor CSS containment (transform, overflow, position)
    // that would otherwise prevent position:fixed from being relative to the viewport.
    return ReactDOM.createPortal(navContent, document.body);
};

export default StudentBottomNav;
