import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const WardenNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/wardenlogin');
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { 
            path: '/warden-dashboard', 
            label: 'Dashboard', 
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            )
        },
        { 
            path: '/warden/pending-outpass', 
            label: 'Pending', 
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            )
        },
        { 
            path: '/warden/outpass-list', 
            label: 'Outpass List', 
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            )
        },
        { 
            path: '/warden/scan', 
            label: 'Scan QR', 
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                </svg>
            )
        },
        { 
            path: '/warden-profile', 
            label: 'Profile', 
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            )
        },
        { 
            path: '/warden/apply-emergency', 
            label: 'Emergency', 
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            )
        },
        { 
            path: '/warden/emergency-pending-outpass', 
            label: 'Emergency Pending', 
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            )
        },
    ];

    return (
        <>
            <header className={`wn-header ${scrolled ? 'wn-scrolled' : ''}`}>
                <div className="wn-container">
                    <div className="wn-brand" onClick={() => navigate('/warden-dashboard')}>
                        <span className="wn-brand-icon">🏠</span>
                        <span className="wn-brand-text">JIT Warden</span>
                    </div>

                    <nav className="wn-desktop-nav">
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`wn-nav-link ${isActive(item.path) ? 'wn-active' : ''} ${item.path === '/warden/apply-emergency' ? 'wn-emergency' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="wn-right">
                        <div className="wn-role-badge">Warden</div>
                        <button className="wn-logout" onClick={handleLogout}>Logout</button>
                        <button
                            className={`wn-hamburger ${isMobileMenuOpen ? 'wn-ham-open' : ''}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span></span><span></span><span></span>
                        </button>
                    </div>
                </div>
            </header>

            {isMobileMenuOpen && (
                <div className="wn-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="wn-mobile-menu" onClick={e => e.stopPropagation()}>
                        <div className="wn-mobile-head">
                            <span style={{ fontSize: '2rem' }}>🏠</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)' }}>JIT Warden Portal</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Warden</div>
                            </div>
                        </div>
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`wn-mobile-link ${isActive(item.path) ? 'wn-ml-active' : ''}`}
                                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px' }}>{item.icon}</span>{item.label}
                            </button>
                        ))}
                        <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }}></div>
                        <button className="wn-mobile-logout" onClick={handleLogout}>🚪 Logout</button>
                    </div>
                </div>
            )}

            <nav className="wn-bottom-nav">
                {navItems.slice(0, 5).map(item => (
                    <button
                        key={item.path}
                        className={`wn-bottom-item ${isActive(item.path) ? 'wn-bottom-active' : ''}`}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                    >
                        <span className="wn-bottom-icon">{item.icon}</span>
                        <span className="wn-bottom-lbl">{item.label.replace('Outpass ', '')}</span>
                        {isActive(item.path) && <div className="wn-bottom-active-dot" />}
                    </button>
                ))}
            </nav>

            <style>{`
                .wn-header { position: fixed; top: 0; left: 0; right: 0; height: var(--nav-height); background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); z-index: 1000; transition: var(--transition); }
                .wn-header.wn-scrolled { background: rgba(255,255,255,0.98); box-shadow: var(--shadow-sm); }
                .wn-container { max-width: var(--content-max); margin: 0 auto; padding: 0 var(--space-6); height: 100%; display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
                .wn-brand { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; flex-shrink: 0; }
                .wn-brand-icon { font-size: 1.4rem; }
                .wn-brand-text { font-size: 1.05rem; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .wn-desktop-nav { display: flex; align-items: center; gap: 2px; flex: 1; justify-content: center; flex-wrap: nowrap; overflow: hidden; }
                .wn-nav-link { height: 36px; padding: 0 var(--space-3); border: none; background: transparent; color: var(--text-3); font-size: 0.85rem; font-weight: 600; cursor: pointer; border-radius: var(--radius-md); transition: var(--transition-fast); font-family: inherit; white-space: nowrap; }
                .wn-nav-link:hover { color: var(--primary); background: var(--primary-light); }
                .wn-nav-link.wn-active { color: var(--primary); background: var(--primary-light); }
                .wn-nav-link.wn-emergency { color: var(--danger); }
                .wn-nav-link.wn-emergency:hover { background: var(--danger-light); }
                .wn-right { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }
                .wn-role-badge { height: 30px; padding: 0 var(--space-3); background: #F0FDF4; color: #166534; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; border: 1px solid #BBF7D0; }
                .wn-logout { height: 36px; padding: 0 var(--space-4); background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger-mid); border-radius: var(--radius-md); font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: var(--transition-fast); font-family: inherit; }
                .wn-logout:hover { background: var(--danger); color: white; }
                .wn-hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: var(--space-2); border-radius: var(--radius-sm); }
                .wn-hamburger span { display: block; width: 20px; height: 2px; background: var(--text-2); border-radius: 2px; transition: var(--transition); }
                .wn-ham-open span:nth-child(1) { transform: rotate(45deg) translate(4px,4px); }
                .wn-ham-open span:nth-child(2) { opacity: 0; }
                .wn-ham-open span:nth-child(3) { transform: rotate(-45deg) translate(4px,-4px); }
                .wn-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1100; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
                .wn-mobile-menu { position: absolute; top: 0; right: 0; bottom: 0; width: min(300px, 85vw); background: var(--surface); box-shadow: var(--shadow-xl); display: flex; flex-direction: column; padding: var(--space-6) var(--space-5); gap: var(--space-1); animation: slideInLeft 0.25s ease; overflow-y: auto; }
                .wn-mobile-head { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); background: #F0FDF4; border-radius: var(--radius-md); margin-bottom: var(--space-4); }
                .wn-mobile-link { display: flex; align-items: center; gap: var(--space-3); height: 48px; padding: 0 var(--space-4); background: transparent; border: none; border-radius: var(--radius-md); color: var(--text-2); font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: var(--transition-fast); font-family: inherit; }
                .wn-mobile-link:hover { background: var(--bg-elevated); color: var(--primary); }
                .wn-mobile-link.wn-ml-active { background: var(--primary-light); color: var(--primary); }
                .wn-mobile-logout { display: flex; align-items: center; gap: var(--space-3); height: 48px; padding: 0 var(--space-4); background: var(--danger-light); color: var(--danger); border: none; border-radius: var(--radius-md); font-size: 0.95rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: var(--transition-fast); }
                .wn-mobile-logout:hover { background: var(--danger); color: white; }
                
                .wn-bottom-nav {
                    display: none;
                    position: fixed;
                    bottom: 12px;
                    left: 12px;
                    right: 12px;
                    height: 66px;
                    background: rgba(255, 255, 255, 0.88);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(59, 130, 246, 0.12);
                    border-radius: 20px;
                    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08), 0 2px 8px rgba(15, 23, 42, 0.06);
                    z-index: 9999;
                    justify-content: space-around;
                    align-items: center;
                    padding: 0 8px;
                    animation: wnSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                @keyframes wnSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .wn-bottom-item {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 3px;
                    width: 56px;
                    height: 52px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    color: var(--text-4);
                    font-family: inherit;
                    border-radius: 12px;
                    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                    -webkit-tap-highlight-color: transparent;
                }

                .wn-bottom-item:active {
                    transform: scale(0.92);
                }

                .wn-bottom-item.wn-bottom-active {
                    color: var(--primary);
                    background: var(--primary-light);
                }

                .wn-bottom-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .wn-bottom-item.wn-bottom-active .wn-bottom-icon {
                    transform: scale(1.1) translateY(-1px);
                }

                .wn-bottom-lbl {
                    font-size: 0.62rem;
                    font-weight: 700;
                    line-height: 1;
                    letter-spacing: 0.01em;
                }
                
                .wn-bottom-active-dot {
                    position: absolute;
                    bottom: 4px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: var(--primary);
                    animation: dotPop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes dotPop {
                    from { transform: translateX(-50%) scale(0); opacity: 0; }
                    to   { transform: translateX(-50%) scale(1); opacity: 1; }
                }

                @media (max-width: 1024px) {
                    .wn-desktop-nav { display: none; }
                    .wn-role-badge { display: none; }
                    .wn-logout { display: none; }
                    .wn-hamburger { display: flex; }
                    .wn-bottom-nav { display: flex; }
                }
            `}</style>
        </>
    );
};

export default WardenNav;
