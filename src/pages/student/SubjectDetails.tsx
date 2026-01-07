import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import { SUBJECTS_DATA, UNITS_DATA, QUESTION_BANKS_DATA } from '../../data/sampleData';

const SubjectDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const subject = SUBJECTS_DATA.find(s => s.id === id);

    const units = id ? UNITS_DATA[id] : [];
    const questionBanks = id ? QUESTION_BANKS_DATA[id] || [] : [];

      const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!subject) {
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
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/student-notice')}
                        >
                            Notices
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

                <div className="content-wrapper error-state">
                    <h2>Subject not found</h2>
                    <button onClick={() => navigate('/subjects')} className="btn btn-primary">
                        Back to Subjects
                    </button>
                </div>
            </div>
        );
    }

    const handleDownload = (title: string) => {
        setToastMessage(`Downloading ${title}...`);
        setShowToast(true);
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
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/student-notice')}
                        >
                            Notices
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

            {showToast && (
                <Toast
                    message={toastMessage}
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="content-wrapper">
                {/* Header Banner */}
                <div className="subject-header">
                    <button onClick={() => navigate('/subjects')} className="back-btn">
                        ← Back
                    </button>
                    <div className="header-content">
                        <span className="badge">Semester {subject.semester}</span>
                        <h1 className="subject-title">{subject.name}</h1>
                        <p className="subject-code">{subject.code || 'Code: N/A'}</p>
                    </div>
                </div>

                <div className="details-layout">
                    {/* Units/Manuals Section */}
                    <div className="units-section">
                        <h2 className="section-title">
                            {subject.type === 'laboratory' ? 'Lab Manuals' : 'Study Units'}
                        </h2>
                        <div className="units-list">
                            {units && units.length > 0 ? (
                                units.map((unit) => (
                                    <div key={unit.unitNumber} className="card unit-card">
                                        <div className="unit-header">
                                            <span className="unit-number">
                                                {subject.type === 'laboratory' ? 'Exp' : 'Unit'} {unit.unitNumber}
                                            </span>
                                            <div className="unit-actions">
                                                <a
                                                    href={unit.downloadUrl}
                                                    download
                                                    className="btn bg-[linear-gradient(135deg,_#00214D_0%,_#0047AB_100%)] btn-sm download-btn"
                                                    onClick={() => handleDownload(unit.title)}
                                                >
                                                    <span className="download-icon">⬇️</span>
                                                    <span>Download PDF</span>
                                                </a>
                                            </div>
                                        </div>
                                        <h3 className="unit-title">{unit.title}</h3>
                                        <p className="unit-desc">{unit.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state card">
                                    <p>No {subject.type === 'laboratory' ? 'manuals' : 'units'} available for this subject yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Question Bank & Resources (Only for Theory) */}
                    {subject.type !== 'laboratory' && (
                        <div className="resources-sidebar">
                            <div className="card qb-card">
                                <h3>Question Bank</h3>
                                <div className="qb-list">
                                    {questionBanks.length > 0 ? (
                                        questionBanks.map((qb) => (
                                            <div key={qb.id} className="qb-item">
                                                <div className="qb-info">
                                                    <span className="qb-year">{qb.year}</span>
                                                    <p>{qb.title}</p>
                                                </div>
                                                <a
                                                    href={qb.downloadUrl}
                                                    download
                                                    className="btn btn-ghost btn-icon"
                                                    title="Download"
                                                    onClick={() => handleDownload(qb.title)}
                                                >
                                                    ⬇️
                                                </a>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted text-small">No question papers available.</p>
                                    )}
                                </div>
                            </div>

                            <div className="card syllabus-card">
                                <h3>Syllabus</h3>
                                <p className="text-muted mb-4">Download the complete syllabus for this subject.</p>
                                <button className="btn btn-secondary w-full">Download Syllabus</button>
                            </div>
                        </div>
                    )}
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

                .subject-header {
                    background: linear-gradient(135deg, #00214D 0%, #0047AB 100%);
                    padding: 40px;
                    border-radius: 20px;
                    color: white;
                    margin-bottom: 32px;
                    position: relative;
                    overflow: hidden;
                }

                .subject-header::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 300px;
                    height: 100%;
                    background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDAgTDIwMCAxMDAgTDEwMCAyMDAgTDAgMTAwIFoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=');
                    background-repeat: repeat;
                    opacity: 0.3;
                }

                .back-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    margin-bottom: 24px;
                    transition: 0.2s;
                }

                .back-btn:hover {
                    background: rgba(255,255,255,0.3);
                }

                .header-content .badge {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    margin-bottom: 12px;
                    display: inline-block;
                }

                .subject-title {
                    font-size: 32px;
                    color: white;
                    margin-bottom: 8px;
                }

                .subject-code {
                    opacity: 0.8;
                    font-size: 16px;
                }

                .details-layout {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 32px;
                }

                .units-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .unit-card {
                    border-left: 4px solid var(--primary);
                }

                .unit-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    gap: 16px;
                }

                .unit-number {
                    font-size: 12px;
                    text-transform: uppercase;
                    color: var(--primary);
                    font-weight: 700;
                    letter-spacing: 1px;
                    flex-shrink: 0;
                    min-width: fit-content;
                }

                .unit-actions {
                    flex-shrink: 0;
                }

                .unit-title {
                    font-size: 18px;
                    margin-bottom: 8px;
                }

                .unit-desc {
                    color: var(--text-muted);
                    font-size: 14px;
                }

                .resources-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .qb-list {
                    margin-top: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .qb-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--bg);
                    border-radius: 8px;
                }

                .qb-year {
                    font-size: 11px;
                    background: var(--primary-dark);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-right: 8px;
                }

                .qb-info p {
                    font-size: 13px;
                    font-weight: 500;
                    display: inline;
                }

                .download-btn {
                    display: inline-flex !important;
                    align-items: center;
                    gap: 6px;
                    white-space: nowrap;
                    padding: 8px 16px !important;
                }

                .download-icon {
                    font-size: 16px;
                    line-height: 1;
                }

                .mb-4 { margin-bottom: 16px; }

                @media (max-width: 968px) {
                    .details-layout {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default SubjectDetails;
