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
            <div className="pb-subj-details-page pb-not-found-state">
                <StudentHeader />
                <main className="student-content">
                    <div className="content-wrapper">
                        <div className="pb-empty-state-card pb-animate-enter">
                            <div className="pb-empty-icon-wrap">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>
                            <h3>Subject not found</h3>
                            <p>The academic subject details could not be loaded. Please return to the subjects catalog.</p>
                            <button onClick={() => navigate('/subjects')} className="pb-btn-primary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back to Subjects
                            </button>
                        </div>
                    </div>
                </main>
                <StudentBottomNav activeTab="subjects" />
            </div>
        );
    }

    const handleDownload = (title: string) => {
        setToastMessage(`Downloading ${title}...`);
        setShowToast(true);
    };

    return (
        <div className="pb-subj-details-page pb-animate-enter">

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
                <StudentHeader />
                <main className="student-content">
                    {showToast && (
                        <Toast
                            message={toastMessage}
                            type="success"
                            onClose={() => setShowToast(false)}
                        />
                    )}

                    <div className="content-wrapper">
                        {/* Back link */}
                        <div className="pb-back-link-wrapper pb-animate-stagger-1">
                            <button onClick={() => navigate('/subjects')} className="pb-btn-back">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back to Subjects
                            </button>
                        </div>

                        {/* Hero Header Banner */}
                        <div className="pb-subject-hero-card pb-animate-stagger-1">
                            <div className="pb-hero-left">
                                <div className="pb-hero-badges-row">
                                    <span className="pb-hero-sem-badge">Semester {subject.semester}</span>
                                    <span className={`pb-hero-type-badge ${subject.type === 'laboratory' ? 'type-lab' : 'type-theory'}`}>
                                        {subject.type === 'laboratory' ? 'Laboratory Course' : 'Theory Course'}
                                    </span>
                                </div>
                                <h1 className="pb-subject-full-title">{subject.name}</h1>
                                <p className="pb-subject-code-subtitle">{subject.code || 'Code: N/A'}</p>
                            </div>
                            <div className="pb-hero-right">
                                <div className="pb-hero-icon-circle">
                                    {subject.type === 'laboratory' ? (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="6" y1="3" x2="18" y2="3" />
                                            <line x1="12" y1="3" x2="12" y2="18" />
                                            <line x1="8" y1="12" x2="16" y2="12" />
                                            <path d="M12 18a4 4 0 0 0 4 4H8a4 4 0 0 0 4-4z" />
                                            <path d="M6 18h12c1.1 0 2 .9 2 2H4c0-1.1.9-2 2-2z" />
                                        </svg>
                                    ) : (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details layout grid */}
                        <div className="pb-details-layout-grid">

                            {/* Left Column: Study Units / Lab Manuals */}
                            <div className="pb-units-main-col pb-animate-stagger-2">
                                <h2 className="pb-section-title">
                                    {subject.type === 'laboratory' ? (
                                        <>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pb-section-title-icon" style={{ marginRight: '8px' }}>
                                                <line x1="6" y1="3" x2="18" y2="3" />
                                                <line x1="12" y1="3" x2="12" y2="18" />
                                                <path d="M6 18h12c1.1 0 2 .9 2 2H4c0-1.1.9-2 2-2z" />
                                            </svg>
                                            Lab Experiments
                                        </>
                                    ) : (
                                        <>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pb-section-title-icon" style={{ marginRight: '8px' }}>
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                            </svg>
                                            Study Units
                                        </>
                                    )}
                                </h2>

                                <div className="pb-units-card-list">
                                    {units && units.length > 0 ? (
                                        units.map((unit, index) => {
                                            const cardStagger = (index % 6) + 1;
                                            return (
                                                <div key={unit.unitNumber} className={`pb-unit-item-card pb-animate-stagger-${cardStagger}`}>
                                                    <div className="pb-unit-card-header">
                                                        <div className="pb-unit-badge-col">
                                                            <span className="pb-unit-number-tag">
                                                                {subject.type === 'laboratory' ? 'EXPERIMENT' : 'UNIT'} {unit.unitNumber}
                                                            </span>
                                                            <h3 className="pb-unit-title">{unit.title}</h3>
                                                        </div>

                                                        <a
                                                            href={unit.downloadUrl}
                                                            download
                                                            className="pb-download-action-btn"
                                                            onClick={() => handleDownload(unit.title)}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                <polyline points="7 10 12 15 17 10" />
                                                                <line x1="12" y1="15" x2="12" y2="3" />
                                                            </svg>
                                                            <span>Download PDF</span>
                                                        </a>
                                                    </div>
                                                    <p className="pb-unit-desc">{unit.description}</p>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="pb-empty-units-card">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginBottom: '8px' }}>
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            <p>No study materials or manuals uploaded for this course yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Question Bank & Resources (Only for Theory) */}
                            {subject.type !== 'laboratory' && (
                                <div className="pb-resources-sidebar-col pb-animate-stagger-3">
                                    {/* Question Bank Card */}
                                    <div className="pb-sidebar-card pb-qb-resources-card">
                                        <h3 className="pb-sidebar-section-title">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                                <line x1="16" y1="13" x2="8" y2="13" />
                                                <line x1="16" y1="17" x2="8" y2="17" />
                                            </svg>
                                            Question Bank
                                        </h3>
                                        <div className="pb-qb-links-list">
                                            {questionBanks.length > 0 ? (
                                                questionBanks.map((qb) => (
                                                    <div key={qb.id} className="pb-qb-link-row">
                                                        <div className="pb-qb-info-details">
                                                            <span className="pb-qb-year-badge">{qb.year}</span>
                                                            <p className="pb-qb-title-name" title={qb.title}>{qb.title}</p>
                                                        </div>
                                                        <a
                                                            href={qb.downloadUrl}
                                                            download
                                                            className="pb-qb-download-circle-btn"
                                                            title="Download Question Bank"
                                                            onClick={() => handleDownload(qb.title)}
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                <polyline points="7 10 12 15 17 10" />
                                                                <line x1="12" y1="15" x2="12" y2="3" />
                                                            </svg>
                                                        </a>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="pb-empty-sidebar-text">No question papers uploaded.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Syllabus Card */}
                                    <div className="pb-sidebar-card pb-syllabus-download-card">
                                        <h3 className="pb-sidebar-section-title">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                            </svg>
                                            Syllabus Copy
                                        </h3>
                                        <p className="pb-syllabus-desc-text">Download the official Anna University syllabus copy for this subject.</p>
                                        <button className="pb-btn-syllabus-download" onClick={() => handleDownload(`${subject.name} Syllabus`)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            Download Syllabus
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view pb-mob-subj-details-view">
                {/* Header */}
                <div className="pb-mob-header">
                    <button className="pb-mob-back-btn" onClick={() => navigate('/subjects')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <span className="pb-mob-header-title">Subject Details</span>
                    <div style={{ width: 36 }} />
                </div>

                <div className="pb-mob-scroll-body">
                    {/* Hero Area */}
                    <div className="pb-mob-hero-section pb-animate-stagger-1">
                        <div className="pb-mob-hero-icon-container">
                            {subject.type === 'laboratory' ? (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="6" y1="3" x2="18" y2="3" />
                                    <line x1="12" y1="3" x2="12" y2="18" />
                                    <path d="M6 18h12c1.1 0 2 .9 2 2H4c0-1.1.9-2 2-2z" />
                                </svg>
                            ) : (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                </svg>
                            )}
                        </div>
                        <h1 className="pb-mob-subject-title">{subject.name}</h1>
                        <div className="pb-mob-subject-meta">
                            <span className="pb-mob-badge">Sem {subject.semester}</span>
                            <span className={`pb-mob-badge ${subject.type === 'laboratory' ? 'pb-badge-lab' : 'pb-badge-theory'}`}>
                                {subject.type === 'laboratory' ? 'Lab' : 'Theory'}
                            </span>
                            {subject.code && <span className="pb-mob-code-text">{subject.code}</span>}
                        </div>
                    </div>

                    {/* Study Units Section */}
                    <div className="pb-mob-section-group pb-animate-stagger-2">
                        <div className="pb-mob-section-header">
                            <h2 className="pb-mob-section-title">
                                {subject.type === 'laboratory' ? 'Experiments & Manuals' : 'Course Syllabus Units'}
                            </h2>
                            <p className="pb-mob-section-subtitle">Official university syllabus modules and references</p>
                        </div>

                        <div className="pb-mob-units-list">
                            {units && units.length > 0 ? (
                                units.map((unit, index) => {
                                    const cardStagger = (index % 6) + 1;
                                    return (
                                        <div key={unit.unitNumber} className={`pb-mob-unit-card pb-animate-stagger-${cardStagger}`}>
                                            <div className="pb-mob-unit-header">
                                                <span className="pb-mob-unit-num-badge">
                                                    {subject.type === 'laboratory' ? 'EXP' : 'UNIT'} {unit.unitNumber}
                                                </span>
                                            </div>
                                            <h4 className="pb-mob-unit-card-title">{unit.title}</h4>
                                            <p className="pb-mob-unit-card-desc">{unit.description}</p>
                                            <a
                                                href={unit.downloadUrl}
                                                download
                                                className="pb-mob-pdf-download-btn"
                                                onClick={() => handleDownload(unit.title)}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line x1="12" y1="15" x2="12" y2="3" />
                                                </svg>
                                                Download Material PDF
                                            </a>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="pb-mob-empty-card">
                                    <p>No study materials uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Question Bank (Theory only) */}
                    {subject.type !== 'laboratory' && (
                        <>
                            <div className="pb-mob-section-group pb-animate-stagger-3">
                                <div className="pb-mob-section-header">
                                    <h2 className="pb-mob-section-title">Question Bank</h2>
                                    <p className="pb-mob-section-subtitle">Previous semester university exam papers</p>
                                </div>

                                <div className="pb-mob-qb-list">
                                    {questionBanks.length > 0 ? (
                                        questionBanks.map((qb, index) => {
                                            const cardStagger = (index % 6) + 1;
                                            return (
                                                <div key={qb.id} className={`pb-mob-qb-card pb-animate-stagger-${cardStagger}`}>
                                                    <div className="pb-mob-qb-card-left">
                                                        <span className="pb-mob-qb-year-tag">{qb.year}</span>
                                                        <h4 className="pb-mob-qb-card-title">{qb.title}</h4>
                                                    </div>
                                                    <a
                                                        href={qb.downloadUrl}
                                                        download
                                                        className="pb-mob-qb-download-btn"
                                                        onClick={() => handleDownload(qb.title)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                            <polyline points="7 10 12 15 17 10" />
                                                            <line x1="12" y1="15" x2="12" y2="3" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="pb-mob-empty-card">
                                            <p>No question papers uploaded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Syllabus Download Block */}
                            <div className="pb-mob-section-group pb-animate-stagger-3" style={{ marginBottom: '40px' }}>
                                <div className="pb-mob-section-header">
                                    <h2 className="pb-mob-section-title">Syllabus copy</h2>
                                    <p className="pb-mob-section-subtitle">Anna University curriculum copy</p>
                                </div>

                                <button
                                    className="pb-mob-syllabus-block-btn pb-animate-stagger-1"
                                    onClick={() => handleDownload(`${subject.name} Syllabus`)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Download Syllabus Copy PDF
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <StudentBottomNav activeTab="subjects" />
            </div>

            <style>{`
                .pb-subj-details-page {
                    min-height: 100vh;
                    background: var(--pb-bg);
                    padding-bottom: 60px;
                }
                .pb-not-found-state {
                    display: flex;
                    flex-direction: column;
                }

                /* Animations */
                .pb-animate-enter {
                    animation: pbFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .pb-animate-stagger-1 { animation: pbFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards; opacity: 0; }
                .pb-animate-stagger-2 { animation: pbFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
                .pb-animate-stagger-3 { animation: pbFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards; opacity: 0; }
                .pb-animate-stagger-4 { animation: pbFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
                .pb-animate-stagger-5 { animation: pbFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards; opacity: 0; }
                .pb-animate-stagger-6 { animation: pbFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }

                @keyframes pbFadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Subject Hero Card */
                .pb-subject-hero-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--pb-glass) !important;
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid var(--pb-card-border) !important;
                    border-radius: var(--pb-radius) !important;
                    box-shadow: var(--pb-shadow-md) !important;
                    padding: 32px 40px !important;
                    margin-bottom: 32px;
                    position: relative;
                    overflow: hidden;
                }
                .pb-subject-hero-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -10%;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
                    z-index: 0;
                    pointer-events: none;
                }
                .pb-hero-left {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .pb-hero-badges-row {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .pb-hero-sem-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    padding: 4px 10px;
                    border-radius: 99px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border: 1px solid rgba(59, 130, 246, 0.15);
                }
                .pb-hero-type-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 99px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .pb-hero-type-badge.type-lab {
                    background: #F0FDF4;
                    color: #16A34A;
                    border: 1px solid rgba(22, 163, 74, 0.15);
                }
                .pb-hero-type-badge.type-theory {
                    background: #FAF5FF;
                    color: #9333EA;
                    border: 1px solid rgba(147, 51, 234, 0.15);
                }
                .pb-subject-full-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--pb-text) !important;
                    line-height: 1.2;
                    margin: 0;
                }
                .pb-subject-code-subtitle {
                    font-size: 1rem;
                    color: var(--pb-text-3);
                    font-weight: 500;
                    margin: 0;
                }
                .pb-hero-right {
                    position: relative;
                    z-index: 1;
                }
                .pb-hero-icon-circle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(59, 130, 246, 0.1);
                }

                /* Details Layout Grid */
                .pb-details-layout-grid {
                    display: grid;
                    grid-template-columns: 2.2fr 1.1fr;
                    gap: 32px;
                    align-items: start;
                }

                /* Sections titles */
                .pb-section-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--pb-text);
                    margin-bottom: 20px;
                }
                .pb-section-title-icon {
                    color: var(--pb-primary);
                }

                /* Left Column: Units list */
                .pb-units-card-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .pb-unit-item-card {
                    background: var(--pb-glass) !important;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid var(--pb-card-border) !important;
                    border-radius: var(--pb-radius) !important;
                    box-shadow: var(--pb-shadow) !important;
                    padding: 24px !important;
                    border-left: 5px solid var(--pb-primary) !important;
                    transition: var(--pb-transition);
                }
                .pb-unit-item-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--pb-shadow-md) !important;
                    border-left-color: var(--pb-primary-dark) !important;
                }
                .pb-unit-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 12px;
                }
                .pb-unit-badge-col {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .pb-unit-number-tag {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--pb-primary);
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                .pb-unit-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: var(--pb-text);
                    margin: 0;
                }
                .pb-unit-desc {
                    font-size: 0.9rem;
                    color: var(--pb-text-3);
                    line-height: 1.6;
                    margin: 0;
                }

                /* Download PDF Action button */
                .pb-download-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: var(--pb-primary);
                    color: white !important;
                    border-radius: var(--pb-radius-sm);
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: var(--pb-transition);
                    border: none;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
                    cursor: pointer;
                }
                .pb-download-action-btn:hover {
                    background: var(--pb-primary-dark);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
                    transform: translateY(-1px);
                }
                .pb-download-action-btn svg {
                    transition: transform 0.2s;
                }
                .pb-download-action-btn:hover svg {
                    transform: translateY(1px);
                }

                /* Empty states */
                .pb-empty-units-card, .pb-empty-state-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 48px 24px;
                    background: var(--pb-glass) !important;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid var(--pb-card-border) !important;
                    border-radius: var(--pb-radius) !important;
                    box-shadow: var(--pb-shadow) !important;
                    color: var(--pb-text-3);
                }
                .pb-empty-state-card {
                    max-width: 500px;
                    margin: 60px auto;
                }
                .pb-empty-icon-wrap {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    margin-bottom: 20px;
                }
                .pb-empty-state-card h3 {
                    font-size: 1.35rem;
                    color: var(--pb-text);
                    margin-bottom: 8px;
                }
                .pb-empty-state-card p {
                    font-size: 0.95rem;
                    margin-bottom: 24px;
                    max-width: 80%;
                }
                .pb-btn-primary {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 24px;
                    background: var(--pb-primary);
                    color: white;
                    font-weight: 600;
                    border: none;
                    border-radius: var(--pb-radius-sm);
                    cursor: pointer;
                    transition: var(--pb-transition);
                }
                .pb-btn-primary:hover {
                    background: var(--pb-primary-dark);
                    transform: translateY(-1px);
                }

                /* Sidebar Resources styles */
                .pb-resources-sidebar-col {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .pb-sidebar-card {
                    background: var(--pb-glass) !important;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid var(--pb-card-border) !important;
                    border-radius: var(--pb-radius) !important;
                    box-shadow: var(--pb-shadow) !important;
                    padding: 24px !important;
                    transition: var(--pb-transition);
                }
                .pb-sidebar-card:hover {
                    box-shadow: var(--pb-shadow-md) !important;
                }
                .pb-sidebar-section-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: var(--pb-text);
                    margin: 0 0 16px 0;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
                }
                .pb-sidebar-section-title svg {
                    color: var(--pb-primary);
                }

                /* Question Bank Row */
                .pb-qb-links-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .pb-qb-link-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.5);
                    padding: 12px 14px !important;
                    border-radius: var(--pb-radius-sm) !important;
                    border: 1px solid rgba(59, 130, 246, 0.08) !important;
                    transition: var(--pb-transition);
                }
                .pb-qb-link-row:hover {
                    background: var(--pb-secondary);
                    border-color: rgba(59, 130, 246, 0.15) !important;
                }
                .pb-qb-info-details {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 0;
                }
                .pb-qb-year-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    padding: 2px 8px;
                    border-radius: 6px;
                    flex-shrink: 0;
                    border: 1px solid rgba(59, 130, 246, 0.1);
                }
                .pb-qb-title-name {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--pb-text-2);
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .pb-qb-download-circle-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: white;
                    border: 1px solid rgba(59, 130, 246, 0.1);
                    color: var(--pb-primary);
                    transition: var(--pb-transition);
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
                }
                .pb-qb-download-circle-btn:hover {
                    background: var(--pb-primary);
                    color: white !important;
                    transform: scale(1.05);
                    border-color: var(--pb-primary);
                }

                .pb-empty-sidebar-text {
                    font-size: 0.85rem;
                    color: var(--pb-text-3);
                    font-style: italic;
                    margin: 0;
                    text-align: center;
                    padding: 12px 0;
                }

                /* Syllabus Download block styling */
                .pb-syllabus-desc-text {
                    font-size: 0.85rem;
                    color: var(--pb-text-3);
                    line-height: 1.5;
                    margin-bottom: 16px;
                }
                .pb-btn-syllabus-download {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 12px;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    font-weight: 600;
                    font-size: 0.9rem;
                    border-radius: var(--pb-radius-sm);
                    cursor: pointer;
                    transition: var(--pb-transition);
                }
                .pb-btn-syllabus-download:hover {
                    background: var(--pb-primary);
                    color: white !important;
                    border-color: var(--pb-primary);
                    transform: translateY(-1px);
                }

                /* ============================================================
                   MOBILE SPECIFIC PORTAL STYLING
                   ============================================================ */
                .pb-mob-subj-details-view {
                    display: flex !important;
                    flex-direction: column;
                    min-height: 100vh;
                    background: var(--pb-bg) !important;
                    padding-bottom: 100px;
                }

                .pb-mob-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: var(--mobile-nav-height);
                    background: rgba(255, 255, 255, 0.8) !important;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid var(--pb-card-border);
                    padding: 0 16px;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .pb-mob-back-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    border: none;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .pb-mob-back-btn:active {
                    transform: scale(0.9);
                }
                .pb-mob-header-title {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: var(--pb-text);
                }

                .pb-mob-scroll-body {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                /* Mobile Hero Card */
                .pb-mob-hero-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    background: var(--pb-glass);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    padding: 24px 20px;
                    box-shadow: var(--pb-shadow);
                }
                .pb-mob-hero-icon-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    margin-bottom: 12px;
                }
                .pb-mob-subject-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin-bottom: 8px;
                    line-height: 1.3;
                }
                .pb-mob-subject-meta {
                    display: flex;
                    gap: 6px;
                    align-items: center;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .pb-mob-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    padding: 2px 8px;
                    border-radius: 6px;
                }
                .pb-mob-badge.pb-badge-lab {
                    background: #F0FDF4;
                    color: #16A34A;
                }
                .pb-mob-badge.pb-badge-theory {
                    background: #FAF5FF;
                    color: #9333EA;
                }
                .pb-mob-code-text {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--pb-text-3);
                    margin-left: 2px;
                }

                /* Mobile sections layout */
                .pb-mob-section-group {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .pb-mob-section-header {
                    text-align: left;
                    padding-left: 4px;
                }
                .pb-mob-section-title {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: var(--pb-text);
                    margin-bottom: 2px;
                }
                .pb-mob-section-subtitle {
                    font-size: 0.78rem;
                    color: var(--pb-text-3);
                }

                .pb-mob-units-list, .pb-mob-qb-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                /* Mobile Unit Cards */
                .pb-mob-unit-card {
                    background: var(--pb-glass);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    padding: 20px;
                    box-shadow: var(--pb-shadow);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .pb-mob-unit-header {
                    display: flex;
                }
                .pb-mob-unit-num-badge {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: var(--pb-primary);
                    background: var(--pb-secondary);
                    padding: 2px 6px;
                    border-radius: 4px;
                    letter-spacing: 0.5px;
                }
                .pb-mob-unit-card-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--pb-text);
                    margin: 0;
                    line-height: 1.3;
                }
                .pb-mob-unit-card-desc {
                    font-size: 0.82rem;
                    color: var(--pb-text-3);
                    line-height: 1.5;
                    margin: 0;
                }
                .pb-mob-pdf-download-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 12px;
                    background: var(--pb-primary);
                    color: white !important;
                    border-radius: var(--pb-radius-sm);
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: var(--pb-transition);
                    text-decoration: none;
                }
                .pb-mob-pdf-download-btn:active {
                    transform: scale(0.98);
                    background: var(--pb-primary-dark);
                }

                /* Mobile Question Bank row card */
                .pb-mob-qb-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--pb-glass);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius-sm);
                    padding: 14px 16px;
                    box-shadow: var(--pb-shadow);
                }
                .pb-mob-qb-card-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 0;
                }
                .pb-mob-qb-year-tag {
                    font-size: 0.7rem;
                    font-weight: 700;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    padding: 2px 6px;
                    border-radius: 4px;
                    flex-shrink: 0;
                }
                .pb-mob-qb-card-title {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--pb-text-2);
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .pb-mob-qb-download-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    transition: var(--pb-transition);
                }
                .pb-mob-qb-download-btn:active {
                    transform: scale(0.9);
                    background: var(--pb-primary);
                    color: white;
                }

                .pb-mob-syllabus-block-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, var(--pb-primary-light), var(--pb-primary));
                    color: white;
                    border: none;
                    border-radius: var(--pb-radius);
                    font-size: 0.9rem;
                    font-weight: 700;
                    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.2);
                    transition: var(--pb-transition);
                    cursor: pointer;
                }
                .pb-mob-syllabus-block-btn:active {
                    transform: scale(0.96);
                    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
                }

                .pb-mob-empty-card {
                    background: var(--pb-glass);
                    border: 1px dashed rgba(59, 130, 246, 0.2);
                    border-radius: var(--pb-radius);
                    padding: 24px;
                    text-align: center;
                    color: var(--pb-text-3);
                    font-size: 0.85rem;
                }

                /* Responsive Split */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { display: flex !important; }
                }
            `}</style>
        </div>
    );
};

export default SubjectDetails;
