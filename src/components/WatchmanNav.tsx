import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, User, LogOut, Camera } from 'lucide-react';

const WatchmanNav: React.FC = () => {
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
        navigate('/watchmanlogin');
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/watchman-dashboard',   label: 'Dashboard',    icon: <Home size={20} /> },
        { path: '/watchman/outpass-list', label: 'Outpass List', icon: <ClipboardList size={20} /> },
        { path: '/watchman/scan',         label: 'Scan QR',      icon: <Camera size={20} /> },
        { path: '/watchman-profile',      label: 'Profile',      icon: <User size={20} /> },
    ];

    return (
        <>
            <header className={`wmn-header ${scrolled ? 'wmn-scrolled' : ''}`}>
                <div className="wmn-container">
                    <div className="wmn-brand" onClick={() => navigate('/watchman-dashboard')}>
                        <div className="lux-logo-icon">
                            <img src="/jit permigo.png" alt="JIT Permigo" style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} />
                        </div>
                        <span className="wmn-brand-text">JIT Security</span>
                    </div>

                    <nav className="wmn-desktop-nav">
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`wmn-nav-link ${isActive(item.path) ? 'wmn-active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="wmn-right">
                        <div className="wmn-role-badge">Security</div>
                        <button className="wmn-logout" onClick={handleLogout}>Logout</button>
                        <button
                            className={`wmn-hamburger ${isMobileMenuOpen ? 'wmn-ham-open' : ''}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span></span><span></span><span></span>
                        </button>
                    </div>
                </div>
            </header>

            {isMobileMenuOpen && (
                <div className="wmn-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="wmn-mobile-menu" onClick={e => e.stopPropagation()}>
                        <div className="wmn-mobile-head">
                            <div className="lux-logo-icon">
                                <img src="/jit permigo.png" alt="JIT Permigo" style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>JIT Security</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Watchman / Security</div>
                            </div>
                        </div>
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`wmn-mobile-link ${isActive(item.path) ? 'wmn-ml-active' : ''}`}
                                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>{item.label}
                            </button>
                        ))}
                        <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }}></div>
                        <button className="wmn-mobile-logout" onClick={handleLogout}>
                            <LogOut size={18} style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center' }} /> Logout
                        </button>
                    </div>
                </div>
            )}

            <nav className="wmn-bottom-nav">
                {navItems.map(item => (
                    <button
                        key={item.path}
                        className={`wmn-bottom-item ${isActive(item.path) ? 'wmn-bottom-active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                        <span style={{ fontSize: '0.62rem', fontWeight: 600 }}>{item.label}</span>
                    </button>
                ))}
            </nav>

            <style>{`
                .wmn-header { position: fixed; top: 0; left: 0; right: 0; height: var(--nav-height); background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); z-index: 1000; transition: var(--transition); }
                .wmn-header.wmn-scrolled { background: rgba(255,255,255,0.98); box-shadow: var(--shadow-sm); }
                .wmn-container { max-width: var(--content-max); margin: 0 auto; padding: 0 var(--space-6); height: 100%; display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
                .wmn-brand { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; flex-shrink: 0; }
                .wmn-brand-text { font-size: 1.05rem; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .wmn-desktop-nav { display: flex; align-items: center; gap: 2px; flex: 1; justify-content: center; }
                .wmn-nav-link { height: 36px; padding: 0 var(--space-4); border: none; background: transparent; color: var(--text-3); font-size: 0.875rem; font-weight: 600; cursor: pointer; border-radius: var(--radius-md); transition: var(--transition-fast); font-family: inherit; }
                .wmn-nav-link:hover { color: var(--primary); background: var(--primary-light); }
                .wmn-nav-link.wmn-active { color: var(--primary); background: var(--primary-light); }
                .wmn-right { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }
                .wmn-role-badge { height: 30px; padding: 0 var(--space-3); background: var(--warning-light); color: #92400E; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; border: 1px solid var(--warning-mid); }
                .wmn-logout { height: 36px; padding: 0 var(--space-4); background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger-mid); border-radius: var(--radius-md); font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: var(--transition-fast); font-family: inherit; }
                .wmn-logout:hover { background: var(--danger); color: white; }
                .wmn-hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: var(--space-2); border-radius: var(--radius-sm); }
                .wmn-hamburger span { display: block; width: 20px; height: 2px; background: var(--text-2); border-radius: 2px; transition: var(--transition); }
                .wmn-ham-open span:nth-child(1) { transform: rotate(45deg) translate(4px,4px); }
                .wmn-ham-open span:nth-child(2) { opacity: 0; }
                .wmn-ham-open span:nth-child(3) { transform: rotate(-45deg) translate(4px,-4px); }
                .wmn-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1100; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
                .wmn-mobile-menu { position: absolute; top: 0; right: 0; bottom: 0; width: min(300px, 85vw); background: var(--surface); box-shadow: var(--shadow-xl); display: flex; flex-direction: column; padding: var(--space-6) var(--space-5); gap: var(--space-1); animation: slideInLeft 0.25s ease; overflow-y: auto; }
                .wmn-mobile-head { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); background: var(--warning-light); border-radius: var(--radius-md); margin-bottom: var(--space-4); }
                .wmn-mobile-link { display: flex; align-items: center; gap: var(--space-3); height: 48px; padding: 0 var(--space-4); background: transparent; border: none; border-radius: var(--radius-md); color: var(--text-2); font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: var(--transition-fast); font-family: inherit; }
                .wmn-mobile-link:hover { background: var(--bg-elevated); color: var(--primary); }
                .wmn-mobile-link.wmn-ml-active { background: var(--primary-light); color: var(--primary); }
                .wmn-mobile-logout { display: flex; align-items: center; gap: var(--space-3); height: 48px; padding: 0 var(--space-4); background: var(--danger-light); color: var(--danger); border: none; border-radius: var(--radius-md); font-size: 0.95rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: var(--transition-fast); }
                .wmn-mobile-logout:hover { background: var(--danger); color: white; }
                .wmn-bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; height: var(--mobile-nav-height); background: rgba(255,255,255,0.97); backdrop-filter: blur(20px); border-top: 1px solid var(--border); box-shadow: 0 -4px 20px rgba(0,0,0,0.06); z-index: 999; justify-content: space-around; align-items: center; padding: 0 var(--space-2); }
                .wmn-bottom-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; flex: 1; height: 100%; background: none; border: none; cursor: pointer; padding: var(--space-2); color: var(--text-4); font-family: inherit; border-radius: var(--radius-sm); transition: var(--transition-fast); }
                .wmn-bottom-item.wmn-bottom-active { color: var(--primary); }
                @media (max-width: 768px) { .wmn-desktop-nav { display: none; } .wmn-role-badge { display: none; } .wmn-logout { display: none; } .wmn-hamburger { display: flex; } .wmn-bottom-nav { display: flex; } }
            `}</style>
        </>
    );
};

export default WatchmanNav;
