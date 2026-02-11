import React, { useState } from 'react';
import SubjectCard from '../../components/SubjectCard';
import { SUBJECTS_DATA } from '../../data/sampleData';
import { useNavigate } from 'react-router-dom';

const Subjects: React.FC = () => {
    // Group subjects by semester
    const subjectsBySem = SUBJECTS_DATA.reduce((acc, subject) => {
        const sem = subject.semester;
        if (!acc[sem]) acc[sem] = [];
        acc[sem].push(subject);
        return acc;
    }, {} as Record<number, typeof SUBJECTS_DATA>);

    const semesters = Object.keys(subjectsBySem).map(Number).sort((a, b) => a - b);
    const [expandedSem, setExpandedSem] = useState<number | null>(semesters[0]); 
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      localStorage.removeItem('token');
      navigate('/login');
    };

    return (
        <div className="page-container">
           
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
                        {/* <button
                            className="nav-item-custom"
                            onClick={() => navigate('/student-notice')}
                        >
                            Notices
                        </button> */}
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

            <div className="content-wrapper">
                <div className="page-header">
                    <h1 className="page-title">Academic Subjects</h1>
                    <p className="text-muted">Browse course materials by semester.</p>
                </div>

                <div className="semesters-container">
                    {semesters.map(sem => (
                        <div key={sem} className={`semester-group ${expandedSem === sem ? 'expanded' : ''}`}>
                            <button
                                className="semester-header"
                                onClick={() => setExpandedSem(expandedSem === sem ? null : sem)}
                            >
                                <span className="sem-title">Semester {sem}</span>
                                <span className="sem-count">{subjectsBySem[sem].length} Subjects</span>
                                <span className="chevron">▼</span>
                            </button>

                            <div className="semester-content">
                                <div className="subjects-grid">
                                    {subjectsBySem[sem].map(subject => (
                                        <SubjectCard key={subject.id} subject={subject} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
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

                .semesters-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .semester-group {
                    background: white;
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                    overflow: hidden;
                    transition: var(--transition);
                }

                .semester-group.expanded {
                    box-shadow: var(--shadow-md);
                    border-color: var(--primary-light);
                }

                .semester-header {
                    width: 100%;
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: white;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                }

                .semester-header:hover {
                    background: var(--surface-hover);
                }

                .sem-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--primary-dark);
                }

                .sem-count {
                    margin-left: auto;
                    margin-right: 16px;
                    font-size: 14px;
                    color: var(--text-muted);
                    background: var(--bg);
                    padding: 4px 12px;
                    border-radius: 20px;
                }

                .chevron {
                    transition: transform 0.3s ease;
                    color: var(--text-muted);
                }

                .semester-group.expanded .chevron {
                    transform: rotate(180deg);
                }

                .semester-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out;
                    background: var(--bg);
                }

                .semester-group.expanded .semester-content {
                    max-height: 2000px; /* Large enough to fit content */
                    padding: 24px;
                    border-top: 1px solid var(--border);
                }

                .subjects-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 24px;
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
            `}</style>
        </div>
    );
};

export default Subjects;
