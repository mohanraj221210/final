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
        { path: '/warden-dashboard',              label: 'Dashboard',       icon: '🏠' },
        { path: '/warden/pending-outpass',         label: 'Pending',         icon: '⏳' },
        { path: '/warden/outpass-list',            label: 'Outpass List',    icon: '📋' },
        { path: '/warden/scan',                    label: 'Scan QR',         icon: '📷' },
        { path: '/warden-profile',                 label: 'Profile',         icon: '👤' },
        { path: '/warden/apply-emergency',         label: '🚨 Emergency',   icon: '🚨' },
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
                                <span>{item.icon}</span>{item.label}
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
                    >
                        <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                        <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>{item.label.replace('🚨 ', '')}</span>
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
                .wn-bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; height: var(--mobile-nav-height); background: rgba(255,255,255,0.97); backdrop-filter: blur(20px); border-top: 1px solid var(--border); box-shadow: 0 -4px 20px rgba(0,0,0,0.06); z-index: 999; justify-content: space-around; align-items: center; padding: 0 var(--space-2); }
                .wn-bottom-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; flex: 1; height: 100%; background: none; border: none; cursor: pointer; padding: var(--space-2); color: var(--text-4); font-family: inherit; border-radius: var(--radius-sm); transition: var(--transition-fast); }
                .wn-bottom-item.wn-bottom-active { color: var(--primary); }
                @media (max-width: 1024px) { .wn-desktop-nav { display: none; } .wn-role-badge { display: none; } .wn-logout { display: none; } .wn-hamburger { display: flex; } .wn-bottom-nav { display: flex; } }
            `}</style>
        </>
    );
};

export default WardenNav;
