
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { type User } from '../data/sampleData';
import { isProfileComplete } from '../utils/profileHelper';
import './StudentHeader.css';

interface StudentHeaderProps {
    user?: User | null;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ user: initialUser }) => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(initialUser || null);

    useEffect(() => {
        // If initialUser is provided, sync it to state
        if (initialUser) {
            setUser(initialUser);
        }
    }, [initialUser]);

    useEffect(() => {
        // If user is not provided, fetch it
        // We only fetch if initialUser is undefined (or null) and we haven't fetched yet?
        // Actually, if the parent doesn't provide it, we should fetch.
        // If the parent provides it, we rely on it.
        const fetchUserProfile = async () => {
            if (initialUser) return; // Parent provided user

            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
                    headers: { authorization: `Bearer ${token}` }
                });
                if (response.status === 200) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error("Failed to fetch user profile in Header");
            }
        };

        fetchUserProfile();
    }, [initialUser]); // Depend on initialUser so if it changes (becomes available), we stop fetching? or we just use it.

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleNavigation = (path: string) => {
        if (path === '/dashboard' || path === '/profile') {
            navigate(path);
        } else {
            if (isProfileComplete(user)) {
                navigate(path);
            } else {
                toast.warn("Complete your profile to access this page", {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="dashboard-header-custom">
            <div className="header-container-custom">
                <div className="header-left-custom">
                    <div className="brand-custom">
                        <span className="brand-icon-custom">🎓</span>
                        <span className="brand-text-custom">JIT Student Portal</span>
                    </div>
                </div>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>

                <nav className={`header-nav-custom ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <button className="nav-item-custom" onClick={() => handleNavigation('/dashboard')}>
                        Dashboard
                    </button>
                    <button className="nav-item-custom" onClick={() => handleNavigation('/staffs')}>
                        Staffs
                    </button>
                    <button className="nav-item-custom" onClick={() => handleNavigation('/student-notice')}>
                        Notices
                    </button>
                    <button className="nav-item-custom" onClick={() => handleNavigation('/outpass')}>
                        Outpass
                    </button>
                    <button className="nav-item-custom" onClick={() => handleNavigation('/subjects')}>
                        Subjects
                    </button>
                    <button className="nav-item-custom" onClick={() => handleNavigation('/profile')}>
                        Profile
                    </button>
                    <button className="logout-btn-custom" onClick={handleLogout}>
                        Logout
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default StudentHeader;
