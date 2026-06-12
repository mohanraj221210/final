import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const YearInchargeNav: React.FC = () => {
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
        navigate('/year-incharge-login');
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/year-incharge-dashboard',       label: 'Dashboard',     icon: '🏠' },
        { path: '/year-incharge/pending-outpass',  label: 'Pending',       icon: '⏳' },
        { path: '/year-incharge/outpass-list',     label: 'Outpass List',  icon: '📋' },
        { path: '/year-incharge-profile',          label: 'Profile',       icon: '👤' },
    ];

    return (
        <>
            <header className={`yin-header ${scrolled ? 'yin-scrolled' : ''}`}>
                <div className="yin-container">
                    <div className="yin-brand" onClick={() => navigate('/year-incharge-dashboard')}>
                        <span style={{ fontSize: '1.4rem' }}>⚡</span>
                        <span className="yin-brand-text">Year Incharge</span>
                    </div>

                    <nav className="yin-desktop-nav">
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`yin-nav-link ${isActive(item.path) ? 'yin-active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="yin-right">
                        <div className="yin-role-badge">Year Incharge</div>
                        <button className="yin-logout" onClick={handleLogout}>Logout</button>
                        <button
                            className={`yin-hamburger ${isMobileMenuOpen ? 'yin-ham-open' : ''}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span></span><span></span><span></span>
                        </button>
                    </div>
                </div>
            </header>

            {isMobileMenuOpen && (
                <div className="yin-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="yin-mobile-menu" onClick={e => e.stopPropagation()}>
                        <div className="yin-mobile-head">
                            <span style={{ fontSize: '2rem' }}>⚡</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Year Incharge Portal</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Administrative Controls</div>
                            </div>
                        </div>
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`yin-mobile-link ${isActive(item.path) ? 'yin-ml-active' : ''}`}
                                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                            >
                                <span>{item.icon}</span>{item.label}
                            </button>
                        ))}
                        <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }}></div>
                        <button className="yin-mobile-logout" onClick={handleLogout}>🚪 Logout</button>
                    </div>
                </div>
            )}

            <nav className="yin-bottom-nav">
                {navItems.map(item => (
                    <button
                        key={item.path}
                        className={`yin-bottom-item ${isActive(item.path) ? 'yin-bottom-active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                        <span style={{ fontSize: '0.62rem', fontWeight: 600 }}>{item.label}</span>
                    </button>
                ))}
            </nav>

            <style>{`
                .yin-header { position: fixed; top: 0; left: 0; right: 0; height: var(--nav-height); background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); z-index: 1000; transition: var(--transition); }
                .yin-header.yin-scrolled { background: rgba(255,255,255,0.98); box-shadow: var(--shadow-sm); }
                .yin-container { max-width: var(--content-max); margin: 0 auto; padding: 0 var(--space-6); height: 100%; display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
                .yin-brand { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; flex-shrink: 0; }
                .yin-brand-text { font-size: 1.05rem; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .yin-desktop-nav { display: flex; align-items: center; gap: 2px; flex: 1; justify-content: center; }
                .yin-nav-link { height: 36px; padding: 0 var(--space-4); border: none; background: transparent; color: var(--text-3); font-size: 0.875rem; font-weight: 600; cursor: pointer; border-radius: var(--radius-md); transition: var(--transition-fast); font-family: inherit; }
                .yin-nav-link:hover { color: var(--primary); background: var(--primary-light); }
                .yin-nav-link.yin-active { color: var(--primary); background: var(--primary-light); }
                .yin-right { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }
                .yin-role-badge { height: 30px; padding: 0 var(--space-3); background: var(--secondary-light); color: var(--secondary); border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; border: 1px solid rgba(79,70,229,0.2); white-space: nowrap; }
                .yin-logout { height: 36px; padding: 0 var(--space-4); background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger-mid); border-radius: var(--radius-md); font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: var(--transition-fast); font-family: inherit; }
                .yin-logout:hover { background: var(--danger); color: white; }
                .yin-hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: var(--space-2); border-radius: var(--radius-sm); }
                .yin-hamburger span { display: block; width: 20px; height: 2px; background: var(--text-2); border-radius: 2px; transition: var(--transition); }
                .yin-ham-open span:nth-child(1) { transform: rotate(45deg) translate(4px,4px); }
                .yin-ham-open span:nth-child(2) { opacity: 0; }
                .yin-ham-open span:nth-child(3) { transform: rotate(-45deg) translate(4px,-4px); }
                .yin-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1100; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
                .yin-mobile-menu { position: absolute; top: 0; right: 0; bottom: 0; width: min(300px, 85vw); background: var(--surface); box-shadow: var(--shadow-xl); display: flex; flex-direction: column; padding: var(--space-6) var(--space-5); gap: var(--space-1); animation: slideInLeft 0.25s ease; overflow-y: auto; }
                .yin-mobile-head { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); background: var(--secondary-light); border-radius: var(--radius-md); margin-bottom: var(--space-4); }
                .yin-mobile-link { display: flex; align-items: center; gap: var(--space-3); height: 48px; padding: 0 var(--space-4); background: transparent; border: none; border-radius: var(--radius-md); color: var(--text-2); font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: var(--transition-fast); font-family: inherit; }
                .yin-mobile-link:hover { background: var(--bg-elevated); color: var(--primary); }
                .yin-mobile-link.yin-ml-active { background: var(--primary-light); color: var(--primary); }
                .yin-mobile-logout { display: flex; align-items: center; gap: var(--space-3); height: 48px; padding: 0 var(--space-4); background: var(--danger-light); color: var(--danger); border: none; border-radius: var(--radius-md); font-size: 0.95rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: var(--transition-fast); }
                .yin-mobile-logout:hover { background: var(--danger); color: white; }
                .yin-bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; height: var(--mobile-nav-height); background: rgba(255,255,255,0.97); backdrop-filter: blur(20px); border-top: 1px solid var(--border); box-shadow: 0 -4px 20px rgba(0,0,0,0.06); z-index: 999; justify-content: space-around; align-items: center; padding: 0 var(--space-2); }
                .yin-bottom-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; flex: 1; height: 100%; background: none; border: none; cursor: pointer; padding: var(--space-2); color: var(--text-4); font-family: inherit; border-radius: var(--radius-sm); transition: var(--transition-fast); }
                .yin-bottom-item.yin-bottom-active { color: var(--primary); }
                @media (max-width: 768px) { .yin-desktop-nav { display: none; } .yin-role-badge { display: none; } .yin-logout { display: none; } .yin-hamburger { display: flex; } .yin-bottom-nav { display: flex; } }
            `}</style>
        </>
    );
};

export default YearInchargeNav;
