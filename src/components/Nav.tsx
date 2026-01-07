import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Nav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const dashboardPath = userType === 'staff' ? '/staff-dashboard' : '/dashboard';

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-container">
                <Link to={dashboardPath} className="nav-brand">
                    <span className="brand-icon">🎓</span>
                    <span className="brand-text">JIT Portal</span>
                </Link>

                <button
                    className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle navigation"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    {isLoggedIn ? (
                        <>
                            <Link
                                to={dashboardPath}
                                className={`nav-link ${isActive(dashboardPath) ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/profile"
                                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                Profile
                            </Link>
                            <button onClick={handleLogout} className="btn btn-primary btn-sm logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary" onClick={closeMenu}>
                            Login
                        </Link>
                    )}
                </div>
            </div>

            <style>{`
                .navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    z-index: 1000;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.7); /* More transparent for glass effect */
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
                }

                .navbar.scrolled {
                    background: rgba(255, 255, 255, 0.9);
                    box-shadow: var(--shadow-sm);
                    border-bottom-color: var(--border);
                }

                .nav-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }

                .nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    font-size: 20px;
                    color: var(--primary-dark);
                }

                .brand-icon {
                    font-size: 24px;
                }

                .nav-menu {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-link {
                    padding: 8px 16px;
                    border-radius: var(--radius-full);
                    color: var(--text-muted);
                    font-weight: 500;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }

                .nav-link:hover {
                    color: var(--primary);
                    background: var(--primary-light);
                }

                .nav-link.active {
                    color: white;
                    background: var(--primary-light);
                    font-weight: 600;
                }

                .menu-toggle {
                    display: none;
                    flex-direction: column;
                    gap: 5px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 5px;
                }

                .menu-toggle span {
                    width: 24px;
                    height: 2px;
                    background: var(--text-main);
                    transition: 0.3s;
                }

                .menu-toggle.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
                .menu-toggle.active span:nth-child(2) { opacity: 0; }
                .menu-toggle.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

                @media (max-width: 768px) {
                    .menu-toggle {
                        display: flex;
                    }

                    .nav-menu {
                        position: absolute;
                        top: 70px;
                        left: 0;
                        right: 0;
                        background: white;
                        flex-direction: column;
                        padding: 20px;
                        gap: 15px;
                        border-bottom: 1px solid var(--border);
                        transform: translateY(-150%);
                        transition: 0.3s ease;
                        z-index: -1;
                    }

                    .nav-menu.active {
                        transform: translateY(0);
                        box-shadow: var(--shadow-lg);
                    }

                    .nav-link {
                        width: 100%;
                        text-align: center;
                        padding: 12px;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Nav;
