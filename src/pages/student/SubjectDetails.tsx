import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import { SUBJECTS_DATA, UNITS_DATA, QUESTION_BANKS_DATA } from '../../data/sampleData';
import StudentHeader from '../../components/StudentHeader';
import StudentBottomNav from '../../components/StudentBottomNav';

const SubjectDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const subject = SUBJECTS_DATA.find(s => s.id === id);

    const units = id ? UNITS_DATA[id] : [];
    const questionBanks = id ? QUESTION_BANKS_DATA[id] || [] : [];

    if (!subject) {
        return (
            <div className="student-page subject-not-found-page">
                <StudentHeader />
                <div className="content-wrapper">
                    <div className="empty-state-card card" style={{ marginTop: '40px' }}>
                        <span className="empty-state-icon">🔍</span>
                        <h3>Subject not found</h3>
                        <p>The academic subject details could not be loaded. Please return to the directory.</p>
                        <button onClick={() => navigate('/subjects')} className="btn btn-primary">
                            ← Back to Subjects
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleDownload = (title: string) => {
        setToastMessage(`Downloading ${title}...`);
        setShowToast(true);
    };

    return (
        <div className="student-page academic-subject-details animate-page-enter">

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
            <StudentHeader />

            {showToast && (
                <Toast
                    message={toastMessage}
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="content-wrapper">
                {/* Back button */}
                <div className="back-link-wrapper" style={{ marginBottom: '24px' }}>
                    <button onClick={() => navigate('/subjects')} className="btn-back">
                        <span className="icon">←</span> Back to Subjects
                    </button>
                </div>

                {/* Hero Header Banner */}
                <div className="subject-hero-card card animate-stagger-1">
                    <div className="hero-text-content">
                        <span className="badge badge-purple">Semester {subject.semester}</span>
                        <h1 className="subject-full-title">{subject.name}</h1>
                        <p className="subject-code-subtitle">{subject.code || 'Code: N/A'} • {subject.type === 'laboratory' ? 'Laboratory Course' : 'Theory Course'}</p>
                    </div>
                </div>

                {/* Details layout grid */}
                <div className="details-layout-grid">
                    
                    {/* Left Column: Study Units / Lab Manuals */}
                    <div className="units-main-col animate-stagger-2">
                        <h2 className="section-title">
                            {subject.type === 'laboratory' ? '🔬 Lab Experiments' : '📖 Study Units'}
                        </h2>
                        
                        <div className="units-card-list">
                            {units && units.length > 0 ? (
                                units.map((unit) => (
                                    <div key={unit.unitNumber} className="unit-item-card card">
                                        <div className="unit-card-header">
                                            <div className="unit-badge-col">
                                                <span className="unit-number-tag">
                                                    {subject.type === 'laboratory' ? 'EXPERIMENT' : 'UNIT'} {unit.unitNumber}
                                                </span>
                                                <h3 className="unit-title">{unit.title}</h3>
                                            </div>
                                            
                                            <a
                                                href={unit.downloadUrl}
                                                download
                                                className="btn btn-primary btn-sm download-action-btn"
                                                onClick={() => handleDownload(unit.title)}
                                            >
                                                <span className="icon">📥</span>
                                                <span>Download PDF</span>
                                            </a>
                                        </div>
                                        <p className="unit-desc">{unit.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state-card card">
                                    <p>No study materials or manuals uploaded for this course yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Question Bank & Resources (Only for Theory) */}
                    {subject.type !== 'laboratory' && (
                        <div className="resources-sidebar-col animate-stagger-3">
                            {/* Question Bank Card */}
                            <div className="card qb-resources-card">
                                <h3 className="sidebar-section-title">📋 Question Bank</h3>
                                <div className="qb-links-list">
                                    {questionBanks.length > 0 ? (
                                        questionBanks.map((qb) => (
                                            <div key={qb.id} className="qb-link-row">
                                                <div className="qb-info-details">
                                                    <span className="badge badge-gray">{qb.year}</span>
                                                    <p className="qb-title-name">{qb.title}</p>
                                                </div>
                                                <a
                                                    href={qb.downloadUrl}
                                                    download
                                                    className="btn btn-ghost btn-icon-sm"
                                                    title="Download Question Bank"
                                                    onClick={() => handleDownload(qb.title)}
                                                    style={{ background: 'var(--bg-elevated)' }}
                                                >
                                                    📥
                                                </a>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="empty-sidebar-text">No question papers uploaded.</p>
                                    )}
                                </div>
                            </div>

                            {/* Syllabus Card */}
                            <div className="card syllabus-download-card">
                                <h3 className="sidebar-section-title">📄 Syllabus</h3>
                                <p className="desc-text">Download the official Anna University syllabus copy for this subject.</p>
                                <button className="btn btn-secondary btn-block" onClick={() => handleDownload(`${subject.name} Syllabus`)}>
                                    Download Syllabus
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
                {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view cred-page-bg">
                {/* Hero Header */}
                <div className="mob-subject-hero animate-cred-enter cred-stagger-1">
                    <button className="cred-back-btn" onClick={() => navigate('/subjects')} style={{position: 'absolute', top: '16px', left: '16px'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div className="mob-hero-icon">{subject.type === 'laboratory' ? '🔬' : '📘'}</div>
                    <h1 className="mob-hero-title">{subject.name}</h1>
                    <div className="mob-hero-meta">
                        <span className="mob-hero-badge">Semester {subject.semester}</span>
                        <span className="mob-hero-badge mob-badge-alt">{subject.type === 'laboratory' ? 'Lab' : 'Theory'}</span>
                        {subject.code && <span className="mob-hero-code">{subject.code}</span>}
                    </div>
                </div>

                <div className="mob-scroll-body">
                    {/* Study Units */}
                    <div className="mob-section-header">
                        <h2 className="cred-h2" style={{margin: 0}}>{subject.type === 'laboratory' ? 'Lab Experiments' : 'Study Units'}</h2>
                        <p className="mob-section-subtitle">Course materials and resources</p>
                    </div>

                    {units && units.length > 0 ? (
                        units.map((unit, index) => {
                            const staggerIndex = (index % 6) + 1;
                            return (
                                <div key={unit.unitNumber} className={`cred-card mob-unit-card animate-cred-enter cred-stagger-${staggerIndex}`}>
                                    <div className="mob-unit-badge-row">
                                        <span className="mob-unit-num-tag">
                                            {subject.type === 'laboratory' ? 'EXP' : 'UNIT'} {unit.unitNumber}
                                        </span>
                                    </div>
                                    <h4 className="mob-unit-title">{unit.title}</h4>
                                    <p className="mob-unit-desc">{unit.description}</p>
                                    <div className="mob-unit-action-row">
                                        <a
                                            href={unit.downloadUrl}
                                            download
                                            className="mob-pdf-chip"
                                            onClick={() => handleDownload(unit.title)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            Download Course Materials
                                        </a>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="cred-card mob-empty-card" style={{padding: '32px 20px', textAlign: 'center', color: 'var(--cred-text-secondary)', fontWeight: '600'}}>
                            <span>No study materials uploaded yet</span>
                        </div>
                    )}

                    {/* Question Bank (Theory only) */}
                    {subject.type !== 'laboratory' && (
                        <>
                            <div className="mob-section-header">
                                <h2 className="cred-h2" style={{margin: 0}}>Question Bank</h2>
                                <p className="mob-section-subtitle">Previous years question papers</p>
                            </div>

                            {questionBanks.length > 0 ? (
                                questionBanks.map((qb, index) => {
                                    const staggerIndex = (index % 6) + 1;
                                    return (
                                        <div key={qb.id} className={`cred-card mob-qb-row animate-cred-enter cred-stagger-${staggerIndex}`}>
                                            <div className="mob-qb-info" style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                                <span className="mob-qb-year">{qb.year}</span>
                                                <span className="mob-qb-title" style={{fontSize: '15px', fontWeight: '700', color: 'var(--cred-text)'}}>{qb.title}</span>
                                            </div>
                                            <a href={qb.downloadUrl} download className="mob-qb-download" onClick={() => handleDownload(qb.title)}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            </a>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="cred-card mob-empty-card" style={{padding: '32px 20px', textAlign: 'center', color: 'var(--cred-text-secondary)', fontWeight: '600'}}>
                                    <span>No question papers uploaded</span>
                                </div>
                            )}

                            <div className="mob-section-header">
                                <h2 className="cred-h2" style={{margin: 0}}>Syllabus</h2>
                                <p className="mob-section-subtitle">Official course curriculum copy</p>
                            </div>

                            <button className="mob-syllabus-btn animate-cred-enter cred-stagger-1" onClick={() => handleDownload(`${subject.name} Syllabus`)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Download Official Syllabus
                            </button>
                        </>
                    )}
                </div>

                {/* Bottom Nav */}
                <StudentBottomNav activeTab="subjects" />
            </div>{/* end mobile */}

            <style>{`
                .subject-details-page-view {
                    background: var(--bg);
                }
                .btn-back {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    transition: var(--transition-fast);
                }
                .btn-back:hover {
                    background: var(--primary-light);
                    color: var(--primary-dark);
                }

                /* Subject Hero card banner */
                .subject-hero-card {
                    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%) !important;
                    color: white !important;
                    margin-bottom: 32px;
                    padding: var(--space-8) var(--space-6) !important;
                }
                .hero-text-content {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }
                .subject-full-title {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: white !important;
                    margin: 0;
                    line-height: 1.25;
                }
                .subject-code-subtitle {
                    font-size: 0.95rem;
                    color: var(--text-4);
                    margin: 0;
                }

                /* Layout Grids */
                .details-layout-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 32px;
                    align-items: start;
                }
                
                .units-card-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-top: 12px;
                }
                .unit-item-card {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    border-left: 4px solid var(--primary);
                }
                .unit-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .unit-badge-col {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .unit-number-tag {
                    font-size: 0.72rem;
                    font-weight: 800;
                    color: var(--primary);
                    letter-spacing: 0.05em;
                }
                .unit-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-1);
                    margin: 0;
                }
                .unit-desc {
                    font-size: 0.85rem;
                    color: var(--text-3);
                    margin: 0;
                    line-height: 1.5;
                }
                .download-action-btn {
                    padding: 0 var(--space-4) !important;
                }

                /* Sidebar resources styling */
                .resources-sidebar-col {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .sidebar-section-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--text-1);
                    margin: 0 0 12px 0;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 8px;
                }
                .qb-links-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .qb-link-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--bg);
                    padding: 10px;
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--border);
                }
                .qb-info-details {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    min-width: 0;
                }
                .qb-title-name {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--text-2);
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .empty-sidebar-text {
                    font-size: 0.8rem;
                    color: var(--text-4);
                    font-style: italic;
                    margin: 0;
                }

                .syllabus-download-card .desc-text {
                    font-size: 0.82rem;
                    color: var(--text-3);
                    margin: 0 0 16px 0;
                    line-height: 1.4;
                }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { display: flex !important; flex-direction: column; min-height: 100vh; background: linear-gradient(135deg, #F7F3E6 0%, #E8EEF5 45%, #C8D9F2 100%); font-family: 'Inter', -apple-system, sans-serif; }
                }

                /* ==========================================
                   CRED PREMIUM MOBILE STYLES (SUBJECT DETAILS)
                   ========================================== */
                .cred-back-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    color: #1E293B;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: transform 0.2s;
                }
                .cred-back-btn:active {
                    transform: scale(0.9);
                    background: #F1F5F9;
                }
                .mob-subject-hero {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
                    padding: 20px 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                }
                .mob-hero-icon {
                    font-size: 36px;
                    line-height: 1;
                    margin-top: 12px;
                    margin-bottom: 8px;
                }
                .mob-hero-title {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 4px 0 8px 0;
                    line-height: 1.3;
                    max-width: 90%;
                }
                .mob-hero-meta {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    justify-content: center;
                    margin-top: 4px;
                }
                .mob-hero-badge {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    background: rgba(37, 99, 235, 0.08);
                    color: #2563EB;
                    border: 1px solid rgba(37, 99, 235, 0.15);
                }
                .mob-hero-badge.mob-badge-alt {
                    background: rgba(184, 134, 11, 0.10);
                    color: #B8860B;
                    border: 1px solid rgba(184, 134, 11, 0.15);
                }
                .mob-hero-code {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--cred-text-2);
                    opacity: 0.8;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .mob-scroll-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px 16px 140px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .mob-section-header {
                    margin: 24px 0 12px 0;
                    text-align: left;
                }
                .mob-section-subtitle {
                    font-size: 12px;
                    color: var(--cred-text-2);
                    margin-top: 4px;
                    font-weight: 500;
                    letter-spacing: 0.2px;
                }

                .mob-unit-card {
                    padding: 24px;
                    background: rgba(255, 255, 255, 0.88);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.55);
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 16px;
                    text-align: left;
                    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
                }
                .mob-unit-badge-row {
                    display: flex;
                    align-items: center;
                    width: 100%;
                }
                .mob-unit-num-tag {
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    color: var(--cred-gold);
                    text-transform: uppercase;
                    background: var(--cred-gold-light);
                    padding: 4px 10px;
                    border-radius: 8px;
                    border: 1px solid rgba(212, 160, 23, 0.2);
                    display: inline-block;
                }
                .mob-unit-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--cred-text);
                    margin: 0;
                    line-height: 1.4;
                }
                .mob-unit-desc {
                    font-size: 13px;
                    font-weight: 400;
                    color: var(--cred-text-2);
                    margin: 0;
                    line-height: 1.6;
                }
                .mob-unit-action-row {
                    width: 100%;
                    margin-top: 4px;
                }
                .mob-pdf-chip {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px 16px;
                    background: #F8FAFC;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 14px;
                    color: #0F172A;
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: var(--transition-fast);
                }
                .mob-pdf-chip:active {
                    background: #F1F5F9;
                    transform: scale(0.98);
                    border-color: #CBD5E1;
                }
                .mob-pdf-chip svg {
                    color: var(--cred-gold);
                    flex-shrink: 0;
                }

                .mob-qb-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: rgba(255, 255, 255, 0.88);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.55);
                    border-radius: 20px;
                    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
                }
                .mob-qb-year {
                    font-size: 11px;
                    font-weight: 800;
                    color: #B8860B;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
                .mob-qb-title {
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    color: #0F172A !important;
                    margin: 0;
                }
                .mob-qb-download {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: #F1F5F9;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    color: #0F172A;
                    transition: var(--transition-fast);
                }
                .mob-qb-download:active {
                    background: #E2E8F0;
                    transform: scale(0.9);
                }
                .mob-qb-download svg {
                    color: var(--cred-gold);
                }

                .mob-syllabus-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #1E3A8A, #0F172A);
                    border: none;
                    border-radius: 16px;
                    color: #FFFFFF;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.25);
                    transition: var(--spring);
                }
                .mob-syllabus-btn:active {
                    transform: scale(0.96);
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
                }
                .mob-syllabus-btn svg {
                    stroke: #FFFFFF;
                }
            `}</style>
        </div>
    );
};

export default SubjectDetails;
