import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentViewStaffProfile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<any>(null);
    const { id } = useParams<{ id: string }>();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        const fetchStaffById = async () => {
            try {
                // Try fetching specific ID first
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/staff/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    setStaff(response.data.staff);
                }
            } catch (error) {
                console.error("Error valid fetching staff data by ID, falling back to list:", error);

                // Fallback to searching the list if direct endpoint fails (robustness)
                try {
                    const listResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/staff/list`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (listResponse.status === 200) {
                        const found = listResponse.data.staff.find((s: any) => s._id === id);
                        if (found) setStaff(found);
                    }
                } catch (listError) {
                    console.error("Fallback fetch failed", listError);
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchStaffById();
    }, [id]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ color: '#333' }}>Loading profile...</p>
            </div>
        );
    }

    if (!staff) {
        return (
            <>

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
                            <button
                                className="nav-item-custom"
                                onClick={() => navigate('/dashboard')}
                            >
                                Dashboard
                            </button>
                            <button
                                className="nav-item-custom"
                                onClick={() => navigate('/staffs')}
                            >
                                Staffs
                            </button>

                            <button
                                className="nav-item-custom"
                                onClick={() => navigate('/outpass')}
                            >
                                Outpass
                            </button>
                            <button
                                className="nav-item-custom"
                                onClick={() => navigate('/subjects')}
                            >
                                Subjects
                            </button>
                            <button
                                className="nav-item-custom"
                                onClick={() => navigate('/profile')}
                            >
                                Profile
                            </button>
                            <button className="logout-btn-custom" onClick={handleLogout}>
                                Logout
                            </button>
                        </nav>
                    </div>
                </header>

                <div className="page-container" style={{ background: 'white', minHeight: '100vh', padding: '20px' }}>
                    <div className="error-message">
                        <h2 style={{ color: '#333' }}>Staff member not found</h2>
                        <button className="back-btn" onClick={() => navigate('/staffs')}>
                            ← Back to Faculty List
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // Determine photo URL (handling user inconsistency)
    const photoUrl = staff.photo || staff.profilePhoto;

    return (
        <>
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
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/dashboard')}
                        >
                            Dashboard
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/staffs')}
                        >
                            Staffs
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/outpass')}
                        >
                            Outpass
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/subjects')}
                        >
                            Subjects
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/profile')}
                        >
                            Profile
                        </button>
                        <button className="logout-btn-custom" onClick={handleLogout}>
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            <div className="page-container staff-profile-page">
                <div className="content-wrapper">
                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="header-top">
                            <button className="back-btn" onClick={() => navigate('/staffs')}>
                                ← Back to Faculty List
                            </button>
                        </div>

                        <div className="header-content-inner">
                            <div className="profile-image-wrapper">
                                <img
                                    src={photoUrl
                                        ? photoUrl.startsWith('http')
                                            ? photoUrl
                                            : `${import.meta.env.VITE_CDN_URL}${photoUrl}`
                                        : `https://ui-avatars.com/api/?name=${staff.name}&background=0047AB&color=fff&size=200`}
                                    alt={staff.name}
                                    onError={(e) => {
                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${staff.name}&background=0047AB&color=fff&size=200`;
                                    }}
                                    className="profile-image"
                                />
                            </div>
                            <div className="profile-header-info">
                                <h1 className="profile-name">{staff.name}</h1>
                                <div className="profile-badges">
                                    <span className="badge badge-primary">{staff.designation}</span>
                                    <span className="badge badge-secondary">{staff.department}</span>
                                </div>
                                <p className="profile-qualification">{staff.qualification}</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content - Single Continuous Layout */}
                    <div className="profile-content">
                        {/* Basic Information Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">📋</span>
                                Basic Information
                            </h2>
                            <div className="info-list">
                                <div className="info-item">
                                    <span className="info-label">Experience</span>
                                    <span className="info-value">{staff.experience} Years</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Designation</span>
                                    <span className="info-value">{staff.designation}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Qualification</span>
                                    <span className="info-value">{staff.qualification}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Department</span>
                                    <span className="info-value">{staff.department}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">📞</span>
                                Contact Information
                            </h2>
                            <div className="contact-list">
                                <div className="contact-item-new">
                                    <span className="contact-icon-new">📧</span>
                                    <div className="contact-info">
                                        <span className="contact-label-new">EMAIL</span>
                                        <a href={`mailto:${staff.email}`} className="contact-value">
                                            {staff.email}
                                        </a>
                                    </div>
                                </div>
                                <div className="contact-item-new">
                                    <span className="contact-icon-new">📱</span>
                                    <div className="contact-info">
                                        <span className="contact-label-new">PHONE</span>
                                        <a href={`tel:${staff.contactNumber}`} className="contact-value">
                                            {staff.contactNumber}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Handling Subjects Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">📚</span>
                                Handling Subjects
                            </h2>
                            <div className="subjects-list-new">
                                {staff.subjects?.map((subject: string, idx: number) => (
                                    <div key={idx} className="subject-item-new">
                                        <span className="subject-bullet">📖</span>
                                        <span className="subject-text">{subject}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Knowledge & Skills Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">💡</span>
                                Knowledge & Skills
                            </h2>
                            <div className="skills-list">
                                {staff.skills?.map((skill: string, idx: number) => (
                                    <span key={idx} className="skill-badge">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Achievements Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">🏆</span>
                                Achievements
                            </h2>
                            <ul className="achievements-list-new">
                                {staff.achievements?.map((achievement: string, idx: number) => (
                                    <li key={idx} className="achievement-item-new">
                                        <span className="achievement-check">✓</span>
                                        <span className="achievement-content">{achievement}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
            /* Custom Dashboard Header */
                .dashboard-header-custom {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 70px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    z-index: 1000;
                }

                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #1e293b;
                    padding: 8px;
                    z-index: 1001;
                }

                .header-container-custom {
                    max-width: 1400px;
                    margin: 0 auto;
                    height: 100%;
                    padding: 0 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left-custom {
                    display: flex;
                    align-items: center;
                }

                .brand-custom {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .brand-icon-custom {
                    font-size: 28px;
                }

                .brand-text-custom {
                    font-size: 1.3rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-nav-custom {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-item-custom {
                    padding: 10px 20px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                }

                .nav-item-custom:hover {
                    background: #f1f5f9;
                    color: #0047AB;
                }

                .logout-btn-custom {
                    padding: 10px 24px;
                    border: 2px solid #ef4444;
                    background: white;
                    color: #ef4444;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    margin-left: 12px;
                }

                .logout-btn-custom:hover {
                    background: #ef4444;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .content-wrapper-custom {
                    margin-top: 70px;
                    padding: 0;
                }

                :root {
                    --bg-white: #ffffff;
                    --text-main: #1e293b;
                    --text-muted: #64748b;
                    --primary: #0047AB;
                    --primary-dark: #1e3a8a;
                    --primary-light: #f0f9ff;
                    --accent: #FFD700;
                    --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
                    --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    --radius-sm: 0.5rem;
                    --radius-lg: 1rem;
                    --radius-full: 9999px;
                    --transition: all 0.2s ease-in-out;
                }

                 @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: block;
                    }

                    .header-nav-custom {
                        position: absolute;
                        top: 70px;
                        left: 0;
                        right: 0;
                        background: white;
                        flex-direction: column;
                        padding: 0;
                        border-bottom: 1px solid #e2e8f0;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        max-height: 0;
                        transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
                        gap: 0;
                    }

                    .header-nav-custom.mobile-open {
                        max-height: 500px;
                        padding: 16px 0;
                    }

                    .nav-item-custom, .logout-btn-custom {
                        width: 100%;
                        text-align: left;
                        padding: 12px 24px;
                        border-radius: 0;
                        margin: 0;
                    }

                    .logout-btn-custom {
                        border: none;
                        border-top: 1px solid #fee2e2;
                        color: #ef4444;
                        margin-top: 8px;
                    }

                    .content-wrapper-custom {
                        margin-top: 70px;
                    }
                }

                /* Layout */
                .staff-profile-page {
                    min-height: 100vh;
                    background: #ffffff; /* FORCE WHITE BACKGROUND */
                    padding: 20px 0;
                    color: var(--text-main);
                }

                .content-wrapper {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .page-container {
                    padding-top: 80px;
                }
                
                /* Loading */
                 .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: white;
                }
                .spinner {
                    width: 40px; 
                    height: 40px; 
                    border: 4px solid #f3f3f3; 
                    border-top: 4px solid var(--primary); 
                    border-radius: 50%; 
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }


                /* Back Button */
                .back-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 8px 16px;
                    border-radius: var(--radius-sm);
                    transition: var(--transition);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    backdrop-filter: blur(4px);
                    margin-top: 15px; /* Added spacing from top */
                    margin-bottom: 24px;
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateX(-4px);
                }

                /* Profile Header (Blue Card) */
                .profile-header {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    border-radius: var(--radius-lg);
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    margin-bottom: 32px;
                    box-shadow: var(--shadow-lg);
                    position: relative;
                    overflow: hidden;
                    color: white;
                }
                
                .header-top {
                    width: 100%;
                    display: flex;
                    justify-content: flex-start;
                    z-index: 2;
                }

                .header-content-inner {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                    z-index: 2;
                }
                
                /* Abstract bg decoration */
                .profile-header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -10%;
                    width: 300px;
                    height: 300px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    z-index: 1;
                }

                .profile-image-wrapper {
                    flex-shrink: 0;
                    width: 160px;
                    height: 160px;
                    border-radius: 50%;
                    padding: 4px;
                    background: rgba(255,255,255,0.2);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                }

                .profile-image {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid white;
                    background: white;
                }

                .profile-header-info {
                    flex: 1;
                    z-index: 1;
                }

                .profile-name {
                    font-size: 32px;
                    font-weight: 800;
                    margin-bottom: 12px;
                    color: white;
                }

                .profile-badges {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                }

                .badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                .badge-primary {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                }

                .badge-secondary {
                    background: var(--accent);
                    color: #000;
                }

                .profile-qualification {
                    font-size: 16px;
                    opacity: 0.9;
                }

                /* Content Card */
                .profile-content {
                    background: white;
                    border-radius: var(--radius-lg);
                    padding: 32px;
                    border: 1px solid #e2e8f0;
                    box-shadow: var(--shadow-sm);
                }

                .section {
                    margin-bottom: 40px;
                }
                .section:last-child { margin-bottom: 0; }

                .section-heading {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--primary-dark);
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                /* Info List */
                .info-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px dashed #e2e8f0;
                }
                .info-label {
                    font-weight: 600;
                    color: var(--text-muted);
                    font-size: 14px;
                }
                .info-value {
                    font-weight: 500;
                    color: var(--text-main);
                    text-align: right;
                }

                /* Contact List */
                .contact-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                }
                .contact-item-new {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: var(--radius-sm);
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s;
                }
                .contact-item-new:hover {
                    border-color: var(--primary);
                    background: #f0f9ff;
                }
                .contact-icon-new {
                    font-size: 24px;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 50%;
                    box-shadow: var(--shadow-sm);
                }
                .contact-info {
                    display: flex;
                    flex-direction: column;
                }
                .contact-label-new {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }
                .contact-value {
                    color: var(--primary);
                    font-weight: 600;
                    font-size: 15px;
                    text-decoration: none;
                }

                /* Subjects */
                .subjects-list-new {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                }
                .subject-item-new {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    background: #f1f5f9;
                    border-radius: 8px;
                    border-left: 3px solid var(--primary);
                }
                .subject-text {
                    font-weight: 500;
                    font-size: 14px;
                    color: var(--text-main);
                }

                /* Skills */
                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .skill-badge {
                    padding: 8px 16px;
                    background: white;
                    color: var(--primary);
                    border: 1px solid var(--primary);
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 600;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                /* Achievements */
                .achievements-list-new {
                    list-style: none;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .achievement-item-new {
                    display: flex;
                    gap: 14px;
                    padding: 16px;
                    background: #fffbeb; /* Light yellow */
                    border-radius: 8px;
                    border: 1px solid #fef3c7;
                }
                .achievement-check {
                    color: #d97706; /* Dark yellow/orange */
                    font-weight: bold;
                    font-size: 18px;
                }
                .achievement-content {
                    font-size: 15px;
                    color: #4b5563;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .profile-header {
                        padding: 24px;
                    }
                    .header-content-inner {
                        flex-direction: column;
                        text-align: center;
                        width: 100%;
                    }
                    .profile-image-wrapper { width: 140px; height: 140px; }
                    .profile-badges { justify-content: center; }
                    .contact-list { grid-template-columns: 1fr; }
                    .info-item { flex-direction: column; align-items: flex-start; gap: 4px; }
                    .info-value { text-align: left; }
                }

            `}</style>
        </>
    );
};

export default StudentViewStaffProfile;
