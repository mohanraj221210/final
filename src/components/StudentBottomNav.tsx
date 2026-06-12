import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { type User } from '../data/sampleData';
import { isProfileComplete } from '../utils/profileHelper';

interface StudentBottomNavProps {
    activeTab?: 'home' | 'outpass' | 'subjects' | 'staff' | 'profile';
}

const StudentBottomNav: React.FC<StudentBottomNavProps> = ({ activeTab }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
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
                console.error("Failed to fetch user profile in Bottom Nav");
            }
        };
        fetchUserProfile();
    }, []);

    const handleNavigation = (path: string) => {
        const restrictedPaths = ['/staffs', '/student-notice', '/subjects', '/outpass', '/new-outpass'];
        if (restrictedPaths.includes(path)) {
            if (isProfileComplete(user)) {
                navigate(path);
            } else {
                toast.warn("Complete your profile to access this page", {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        } else {
            navigate(path);
        }
    };

    return (
        <div className="cred-bottom-nav">
            <button 
                className={`cred-nav-item ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => handleNavigation('/dashboard')}
            >
                {activeTab === 'home' && <div className="cred-nav-active-bar" />}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span className="cred-nav-lbl">Home</span>
            </button>
            <button 
                className={`cred-nav-item ${activeTab === 'outpass' ? 'active' : ''}`}
                onClick={() => handleNavigation('/outpass')}
            >
                {activeTab === 'outpass' && <div className="cred-nav-active-bar" />}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="cred-nav-lbl">Outpass</span>
            </button>
            <button 
                className={`cred-nav-item ${activeTab === 'subjects' ? 'active' : ''}`}
                onClick={() => handleNavigation('/subjects')}
            >
                {activeTab === 'subjects' && <div className="cred-nav-active-bar" />}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span className="cred-nav-lbl">Subjects</span>
            </button>
            <button 
                className={`cred-nav-item ${activeTab === 'staff' ? 'active' : ''}`}
                onClick={() => handleNavigation('/staffs')}
            >
                {activeTab === 'staff' && <div className="cred-nav-active-bar" />}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span className="cred-nav-lbl">Staff</span>
            </button>
            <button 
                className={`cred-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => handleNavigation('/profile')}
            >
                {activeTab === 'profile' && <div className="cred-nav-active-bar" />}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="cred-nav-lbl">Profile</span>
            </button>
        </div>
    );
};

export default StudentBottomNav;
