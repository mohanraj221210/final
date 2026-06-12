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
        <div className="student-page academic-subjects-page animate-page-enter">

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
            <StudentHeader />

            <div className="content-wrapper">
                {/* Back link */}
                <div className="back-link-wrapper" style={{ marginBottom: '24px' }}>
                    <button className="btn-back" onClick={() => navigate('/dashboard')}>
                        <span className="icon">←</span> Back to Dashboard
                    </button>
                </div>

                {/* Page Title Header */}
                <div className="page-header-simple" style={{ marginBottom: '32px' }}>
                    <h1>Curriculum & Subjects</h1>
                    <p className="subtitle">Explore courses, syllabi, and reference materials grouped by semester</p>
                </div>

                {/* Semester Accordion Panels */}
                <div className="semesters-accordion-wrap">
                    {semesters.map((sem, index) => {
                        const isExpanded = expandedSem === sem;
                        const staggerIndex = (index % 6) + 1;
                        return (
                            <div key={sem} className={`sem-accordion-group card ${isExpanded ? 'expanded' : ''} animate-stagger-${staggerIndex}`}>
                                <button
                                    className="sem-accordion-trigger"
                                    onClick={() => setExpandedSem(isExpanded ? null : sem)}
                                    aria-expanded={isExpanded}
                                >
                                    <div className="sem-trigger-left">
                                        <span className="sem-title-label">Semester {sem}</span>
                                        <span className="badge badge-gray">{subjectsBySem[sem].length} Courses</span>
                                    </div>
                                    <span className="chevron-arrow">{isExpanded ? '▲' : '▼'}</span>
                                </button>

                                {isExpanded && (
                                    <div className="sem-accordion-content">
                                        <div className="subjects-grid">
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
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view cred-page-bg">
                {/* Header */}
                <div className="mob-page-header animate-cred-enter cred-stagger-1">
                    <button className="mob-back-btn" onClick={() => navigate('/dashboard')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div className="mob-header-text">
                        <h1 className="cred-h2" style={{ margin: 0, fontSize: '18px' }}>Curriculum</h1>
                        <p className="cred-p" style={{ margin: '2px 0 0', fontSize: '12px' }}>Subjects & Study Materials</p>
                    </div>
                    <div style={{ width: 36 }} />
                </div>

                <div className="mob-scroll-body">
                    {semesters.map((sem, index) => {
                        const isExp = expandedSem === sem;
                        const staggerIndex = (index % 6) + 1;
                        return (
                            <div key={sem} className={`cred-card mob-sem-card ${isExp ? 'mob-sem-expanded' : ''} animate-cred-enter cred-stagger-${staggerIndex}`}>
                                <button
                                    className="mob-sem-trigger"
                                    onClick={() => setExpandedSem(isExp ? null : sem)}
                                >
                                    <div className="mob-sem-left">
                                        <div className="mob-sem-num">{sem}</div>
                                        <div className="mob-sem-info">
                                            <span className="mob-sem-title">Semester {sem}</span>
                                            <span className="mob-sem-count">{subjectsBySem[sem].length} Courses</span>
                                        </div>
                                    </div>
                                    <svg
                                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                        style={{transform: isExp ? 'rotate(180deg)' : 'none', transition:'transform 0.3s ease', color: isExp ? 'var(--cred-gold)' : '#94A3B8'}}
                                    >
                                        <polyline points="6 9 12 15 18 9"/>
                                    </svg>
                                </button>
                                {isExp && (
                                    <div className="mob-sem-subjects animate-cred-enter cred-stagger-1">
                                        {subjectsBySem[sem].map(subject => (
                                            <div
                                                key={subject.id}
                                                className="mob-subject-row"
                                                onClick={() => navigate(`/subjects/${subject.id}`)}
                                            >
                                                <div className="mob-subject-icon">
                                                    {subject.type === 'laboratory' ? '🔬' : '📘'}
                                                </div>
                                                <div className="mob-subject-info">
                                                    <span className="mob-subject-name">{subject.name}</span>
                                                    <div className="mob-subject-metadata">
                                                        <span className="mob-subject-code">{subject.code || 'Code N/A'}</span>
                                                        <span className={`mob-badge-type ${subject.type === 'laboratory' ? 'type-lab' : 'type-theory'}`}>
                                                            {subject.type === 'laboratory' ? 'Lab' : 'Theory'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mob-subject-arrow">
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
                .academic-subjects-page {
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
                
                .page-header-simple h1 {
                    font-size: 1.8rem;
                    color: var(--text-1);
                    margin: 0 0 6px 0;
                }
                .page-header-simple .subtitle {
                    font-size: 0.95rem;
                    color: var(--text-3);
                    margin: 0;
                }

                /* Accordion styling */
                .semesters-accordion-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .sem-accordion-group {
                    padding: 0 !important;
                    overflow: hidden;
                    transition: var(--transition);
                }
                .sem-accordion-group.expanded {
                    border-color: var(--primary-mid);
                    box-shadow: var(--shadow-md);
                }

                .sem-accordion-trigger {
                    width: 100%;
                    padding: 20px var(--space-6);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                }
                .sem-accordion-trigger:hover {
                    background: var(--surface-hover);
                }
                
                .sem-trigger-left {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                }
                
                .sem-title-label {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--text-1);
                }

                .chevron-arrow {
                    font-size: 0.8rem;
                    color: var(--text-4);
                    transition: var(--transition);
                }

                .sem-accordion-content {
                    padding: 0 var(--space-6) var(--space-6) var(--space-6);
                    animation: slideDown 0.25s ease-out;
                    border-top: 1px solid var(--border);
                    background: var(--bg);
                }

                .subjects-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    padding-top: var(--space-5);
                }

                @keyframes slideDown {
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
                        font-family: 'Inter', -apple-system, sans-serif; 
                        color: #1E293B !important; 
                    }
                }
                
                /* ==========================================
                   CRED PREMIUM MOBILE STYLES (SUBJECTS)
                   ========================================== */
                .mob-page-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 16px 12px;
                    background: rgba(255, 255, 255, 0.75) !important;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    border-bottom: 1px solid rgba(226, 232, 240, 0.5) !important;
                }

                .mob-back-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #FFFFFF !important;
                    border: 1px solid #E2E8F0 !important;
                    color: #1E293B !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: transform 0.2s;
                }
                .mob-back-btn:active {
                    transform: scale(0.9);
                }

                .mob-header-text {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                }

                .mob-scroll-body { 
                    flex: 1; 
                    overflow-y: auto; 
                    padding: 24px 16px calc(110px + env(safe-area-inset-bottom, 16px)); 
                    display: flex; 
                    flex-direction: column; 
                    gap: 12px; 
                }

                .mob-sem-card { 
                    padding: 0 !important; 
                    overflow: hidden; 
                    background: #FFFFFF !important;
                    border: 1px solid rgba(226, 232, 240, 0.8) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 4px 12px rgba(31, 38, 135, 0.03) !important;
                    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s; 
                }
                .mob-sem-card:active {
                    transform: scale(0.99);
                }
                .mob-sem-expanded { 
                    border-color: var(--cred-gold) !important; 
                    box-shadow: 0 8px 24px rgba(212, 160, 23, 0.12) !important; 
                }
                
                .mob-sem-trigger { 
                    width: 100%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between; 
                    padding: 12px 16px; 
                    background: none; 
                    border: none; 
                    cursor: pointer; 
                    -webkit-tap-highlight-color: transparent; 
                    transition: background-color 0.2s;
                }
                .mob-sem-trigger:active {
                    background: rgba(241, 245, 249, 0.5);
                }
                
                .mob-sem-left { display: flex; align-items: center; gap: 12px; }
                
                .mob-sem-num { 
                    width: 36px; 
                    height: 36px; 
                    border-radius: 10px; 
                    background: linear-gradient(135deg, #1E3A8A, #0F172A) !important; 
                    color: #FFFFFF !important; 
                    border: 1.5px solid var(--cred-gold) !important;
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 15px; 
                    font-weight: 800; 
                    flex-shrink: 0; 
                    box-shadow: 0 4px 10px rgba(30, 58, 138, 0.2); 
                }
                
                .mob-sem-info { display: flex; flex-direction: column; gap: 2px; text-align: left; }
                .mob-sem-title { font-size: 15px; font-weight: 700; color: #0F172A !important; }
                .mob-sem-count { font-size: 12px; color: var(--cred-gold) !important; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

                .mob-sem-subjects { 
                    padding: 8px 12px 14px; 
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    background: #F8FAFC;
                    border-top: 1px solid #F1F5F9;
                }
                
                .mob-subject-row { 
                    display: flex; 
                    align-items: center; 
                    gap: 12px; 
                    padding: 16px; 
                    background: #FFFFFF !important;
                    border: 1px solid #E2E8F0 !important;
                    border-radius: 14px !important;
                    cursor: pointer; 
                    -webkit-tap-highlight-color: transparent; 
                    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s, border-color 0.2s; 
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
                }
                .mob-subject-row:active { 
                    transform: scale(0.98);
                    background: #F1F5F9 !important; 
                    border-color: #CBD5E1 !important;
                }
                
                .mob-subject-icon { 
                    font-size: 20px; 
                    flex-shrink: 0; 
                    background: #EFF6FF !important; 
                    border: 1px solid #DBEAFE !important;
                    width: 40px; 
                    height: 40px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    border-radius: 10px; 
                }
                
                .mob-subject-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
                
                .mob-subject-name { 
                    font-size: 14px; 
                    font-weight: 600; 
                    color: #1E293B !important; 
                    white-space: normal; 
                    word-break: break-word;
                    line-height: 1.4;
                }
                
                .mob-subject-metadata {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 4px;
                }
                
                .mob-subject-code { 
                    font-size: 11px; 
                    color: #475569 !important; 
                    font-weight: 700; 
                    font-family: monospace, ui-monospace;
                    background: #E2E8F0;
                    padding: 2px 6px;
                    border-radius: 4px;
                    letter-spacing: 0.5px;
                }

                .mob-badge-type {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .mob-badge-type.type-theory {
                    background: rgba(37, 99, 235, 0.1);
                    color: #1D4ED8;
                    border: 1px solid rgba(37, 99, 235, 0.15);
                }
                .mob-badge-type.type-lab {
                    background: rgba(16, 185, 129, 0.1);
                    color: #047857;
                    border: 1px solid rgba(16, 185, 129, 0.15);
                }

                .mob-subject-arrow {
                    display: flex;
                    align-items: center;
                    color: #94A3B8;
                    transition: transform 0.2s, color 0.2s;
                }
                .mob-subject-row:active .mob-subject-arrow {
                    transform: translateX(2px);
                    color: var(--cred-gold);
                }
            `}</style>
        </div>
    );
};

export default Subjects;
