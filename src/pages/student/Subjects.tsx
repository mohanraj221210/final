import React, { useState } from 'react';
import SubjectCard from '../../components/SubjectCard';
import { SUBJECTS_DATA } from '../../data/sampleData';
import { useNavigate } from 'react-router-dom';

import StudentHeader from '../../components/StudentHeader';
import StudentBottomNav from '../../components/StudentBottomNav';

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

    return (
        <div className="pb-subjects-page">

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
                <StudentHeader />
                <main className="student-content">
                    <div className="content-wrapper">
                        {/* Back link */}
                        <div className="pb-back-link-wrapper">
                            <button className="pb-btn-back" onClick={() => navigate('/dashboard')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back to Dashboard
                            </button>
                        </div>

                        {/* Page Title Header */}
                        <div className="pb-page-header-simple">
                            <h1 className="pb-page-title">Curriculum & Subjects</h1>
                            <p className="pb-page-subtitle">Explore courses, syllabi, and reference materials grouped by semester</p>
                        </div>

                        {/* Semester Accordion Panels */}
                        <div className="pb-semesters-accordion-wrap">
                            {semesters.map((sem, index) => {
                                const isExpanded = expandedSem === sem;
                                const staggerIndex = (index % 6) + 1;
                                return (
                                    <div key={sem} className={`pb-sem-accordion-group ${isExpanded ? 'expanded' : ''} pb-animate-stagger-${staggerIndex}`}>
                                        <button
                                            className="pb-sem-accordion-trigger"
                                            onClick={() => setExpandedSem(isExpanded ? null : sem)}
                                            aria-expanded={isExpanded}
                                        >
                                            <div className="pb-sem-trigger-left">
                                                <span className="pb-sem-title-label">Semester {sem}</span>
                                                <span className="pb-sem-badge">{subjectsBySem[sem].length} Courses</span>
                                            </div>
                                            <span className="pb-chevron-arrow">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </span>
                                        </button>

                                        {isExpanded && (
                                            <div className="pb-sem-accordion-content">
                                                <div className="pb-subjects-grid">
                                                    {subjectsBySem[sem].map(subject => (
                                                        <SubjectCard key={subject.id} subject={subject} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view">
                {/* Header */}
                <div className="pb-mob-page-header">
                    <button className="pb-mob-back-btn" onClick={() => navigate('/dashboard')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div className="pb-mob-header-text">
                        <span className="pb-mob-header-title">Curriculum</span>
                        <span className="pb-mob-header-subtitle">Subjects & Study Materials</span>
                    </div>
                    <div style={{ width: 36 }} />
                </div>

                <div className="pb-mob-scroll-body">
                    {semesters.map((sem, index) => {
                        const isExp = expandedSem === sem;
                        const staggerIndex = (index % 6) + 1;
                        return (
                            <div key={sem} className={`pb-mob-sem-card ${isExp ? 'expanded' : ''} pb-animate-stagger-${staggerIndex}`}>
                                <button
                                    className="pb-mob-sem-trigger"
                                    onClick={() => setExpandedSem(isExp ? null : sem)}
                                >
                                    <div className="pb-mob-sem-left">
                                        <div className="pb-mob-sem-num">{sem}</div>
                                        <div className="pb-mob-sem-info">
                                            <span className="pb-mob-sem-title">Semester {sem}</span>
                                            <span className="pb-mob-sem-count">{subjectsBySem[sem].length} Courses</span>
                                        </div>
                                    </div>
                                    <svg
                                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                        style={{transform: isExp ? 'rotate(180deg)' : 'none', transition:'transform 0.3s ease', color: isExp ? 'var(--pb-primary)' : 'var(--pb-text-4)'}}
                                    >
                                        <polyline points="6 9 12 15 18 9"/>
                                    </svg>
                                </button>
                                {isExp && (
                                    <div className="pb-mob-sem-subjects">
                                        {subjectsBySem[sem].map(subject => (
                                            <div
                                                key={subject.id}
                                                className="pb-mob-subject-row"
                                                onClick={() => navigate(`/subjects/${subject.id}`)}
                                            >
                                                <div className="pb-mob-subject-icon">
                                                    {subject.type === 'laboratory' ? (
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M6 3h12" />
                                                            <path d="M12 3v18" />
                                                            <path d="M6 18h12" />
                                                            <path d="M3 12h18" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="pb-mob-subject-info">
                                                    <span className="pb-mob-subject-name">{subject.name}</span>
                                                    <div className="pb-mob-subject-metadata">
                                                        <span className="pb-mob-subject-code">{subject.code || 'Code N/A'}</span>
                                                        <span className={`pb-mob-badge-type ${subject.type === 'laboratory' ? 'type-lab' : 'type-theory'}`}>
                                                            {subject.type === 'laboratory' ? 'Lab' : 'Theory'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pb-mob-subject-arrow">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {/* Safe spacer for bottom nav */}
                    <div style={{ height: '32px' }} />
                </div>

                {/* Bottom Nav */}
                <StudentBottomNav activeTab="subjects" />
            </div>{/* end mobile */}

            <style>{`
                .pb-subjects-page {
                    min-height: 100vh;
                    background: var(--pb-bg);
                }
                
                .pb-page-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin: 0;
                    letter-spacing: -0.025em;
                }
                .pb-page-subtitle {
                    font-size: 0.9rem;
                    color: var(--pb-text-3);
                    margin: 4px 0 0 0;
                }
                .pb-page-header-simple {
                    margin-bottom: 32px;
                }

                /* Accordion styling */
                .pb-semesters-accordion-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .pb-sem-accordion-group {
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    overflow: hidden;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    transition: var(--pb-transition);
                }
                .pb-sem-accordion-group.expanded {
                    border-color: rgba(59, 130, 246, 0.25);
                    box-shadow: var(--pb-shadow-md);
                }

                .pb-sem-accordion-trigger {
                    width: 100%;
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                    font-family: inherit;
                }
                .pb-sem-accordion-trigger:hover {
                    background: rgba(59, 130, 246, 0.02);
                }
                
                .pb-sem-trigger-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .pb-sem-title-label {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    letter-spacing: -0.01em;
                }

                .pb-sem-badge {
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: var(--pb-text-3);
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    padding: 2px 10px;
                    border-radius: 99px;
                }

                .pb-chevron-arrow {
                    color: var(--pb-text-4);
                    display: flex;
                    align-items: center;
                }

                .pb-sem-accordion-content {
                    padding: 0 24px 24px 24px;
                    animation: pbSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
                    border-top: 1px solid rgba(59, 130, 246, 0.06);
                    background: rgba(59, 130, 246, 0.01);
                }

                .pb-subjects-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 16px;
                    padding-top: 20px;
                }

                @keyframes pbSlideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { 
                        display: flex !important; 
                        flex-direction: column; 
                        min-height: 100vh; 
                        background: var(--pb-bg);
                    }
                }
                
                /* ==========================================
                   PREMIUM MOBILE STYLES (SUBJECTS)
                   ========================================== */
                .pb-mob-page-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.08);
                }

                .pb-mob-back-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #fff;
                    border: 1px solid rgba(59, 130, 246, 0.12);
                    color: var(--pb-text);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: transform 0.2s;
                }
                .pb-mob-back-btn:active { transform: scale(0.9); }

                .pb-mob-header-text {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .pb-mob-header-title {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    letter-spacing: -0.01em;
                }
                .pb-mob-header-subtitle {
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: var(--pb-text-4);
                }

                .pb-mob-scroll-body { 
                    flex: 1; 
                    overflow-y: auto; 
                    padding: 16px 16px 90px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 12px; 
                }

                .pb-mob-sem-card { 
                    overflow: hidden; 
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s, border-color 0.2s; 
                }
                .pb-mob-sem-card:active {
                    transform: scale(0.99);
                }
                .pb-mob-sem-card.expanded { 
                    border-color: rgba(59, 130, 246, 0.25); 
                    box-shadow: var(--pb-shadow-md); 
                }
                
                .pb-mob-sem-trigger { 
                    width: 100%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between; 
                    padding: 14px 16px; 
                    background: none; 
                    border: none; 
                    cursor: pointer; 
                    -webkit-tap-highlight-color: transparent; 
                    font-family: inherit;
                }
                .pb-mob-sem-trigger:active {
                    background: rgba(59, 130, 246, 0.02);
                }
                
                .pb-mob-sem-left { display: flex; align-items: center; gap: 12px; }
                
                .pb-mob-sem-num { 
                    width: 32px; 
                    height: 32px; 
                    border-radius: 10px; 
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-light)); 
                    color: #fff; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 14px; 
                    font-weight: 800; 
                    flex-shrink: 0; 
                    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.15); 
                }
                
                .pb-mob-sem-info { display: flex; flex-direction: column; gap: 2px; text-align: left; }
                .pb-mob-sem-title { font-size: 0.88rem; font-weight: 800; color: var(--pb-text); }
                .pb-mob-sem-count { font-size: 0.68rem; color: var(--pb-primary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

                .pb-mob-sem-subjects { 
                    padding: 10px; 
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    background: rgba(59, 130, 246, 0.02);
                    border-top: 1px solid rgba(59, 130, 246, 0.06);
                }
                
                .pb-mob-subject-row { 
                    display: flex; 
                    align-items: center; 
                    gap: 12px; 
                    padding: 12px; 
                    background: #fff;
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    border-radius: 12px;
                    cursor: pointer; 
                    -webkit-tap-highlight-color: transparent; 
                    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s, border-color 0.2s; 
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.01);
                }
                .pb-mob-subject-row:active { 
                    transform: scale(0.98);
                    background: rgba(59, 130, 246, 0.02); 
                    border-color: rgba(59, 130, 246, 0.15);
                }
                
                .pb-mob-subject-icon { 
                    color: var(--pb-primary);
                    background: var(--pb-secondary); 
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    width: 36px; 
                    height: 36px; 
                    display: flex;
                    align-items: center; 
                    justify-content: center; 
                    border-radius: 8px; 
                    flex-shrink: 0;
                }
                
                .pb-mob-subject-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
                
                .pb-mob-subject-name { 
                    font-size: 0.85rem; 
                    font-weight: 700; 
                    color: var(--pb-text); 
                    white-space: normal; 
                    word-break: break-word;
                    line-height: 1.4;
                }
                
                .pb-mob-subject-metadata {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 4px;
                }
                
                .pb-mob-subject-code { 
                    font-size: 0.68rem; 
                    color: var(--pb-text-3); 
                    font-weight: 700; 
                    font-family: monospace, ui-monospace;
                    background: rgba(59, 130, 246, 0.05);
                    padding: 2px 6px;
                    border-radius: 4px;
                    letter-spacing: 0.5px;
                }

                .pb-mob-badge-type {
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .pb-mob-badge-type.type-theory {
                    background: rgba(59, 130, 246, 0.08);
                    color: var(--pb-primary);
                    border: 1px solid rgba(59, 130, 246, 0.12);
                }
                .pb-mob-badge-type.type-lab {
                    background: rgba(16, 185, 129, 0.08);
                    color: #10B981;
                    border: 1px solid rgba(16, 185, 129, 0.12);
                }

                .pb-mob-subject-arrow {
                    display: flex;
                    align-items: center;
                    color: var(--pb-text-4);
                    transition: transform 0.2s, color 0.2s;
                }
                .pb-mob-subject-row:active .pb-mob-subject-arrow {
                    transform: translateX(2px);
                    color: var(--pb-primary);
                }

                /* ANIMATIONS */
                @keyframes pbFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .pb-animate-stagger-1 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.05s; }
                .pb-animate-stagger-2 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.1s; }
                .pb-animate-stagger-3 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.15s; }
                .pb-animate-stagger-4 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.2s; }
                .pb-animate-stagger-5 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.25s; }
                .pb-animate-stagger-6 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.3s; }
            `}</style>
        </div>
    );
};

export default Subjects;
