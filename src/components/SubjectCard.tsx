import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Subject } from '../data/sampleData';

interface SubjectCardProps {
    subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
    const navigate = useNavigate();

    return (
        <div className="pb-subject-card" onClick={() => navigate(`/subjects/${subject.id}`)}>
            <div className="pb-subject-card-glow" />
            <div className="pb-subject-top-content">
                <div className="pb-subject-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                </div>
                <div className="pb-subject-meta">
                    <span className="pb-subject-sem-badge">Sem {subject.semester}</span>
                    <h3 className="pb-subject-title">{subject.name}</h3>
                    <p className="pb-subject-code">{subject.code || 'Code: N/A'}</p>
                </div>
            </div>
            <div className="pb-subject-footer-row">
                <span className="pb-view-materials-text">Course Materials</span>
                <span className="pb-arrow-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </span>
            </div>

            <style>{`
                .pb-subject-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    cursor: pointer;
                    min-height: 160px;
                    padding: 18px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    transition: var(--pb-transition);
                    overflow: hidden;
                }
                .pb-subject-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--pb-shadow-md);
                    border-color: rgba(59, 130, 246, 0.3);
                }
                .pb-subject-card-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, var(--pb-primary-light), var(--pb-primary));
                    opacity: 0;
                    transition: var(--pb-transition);
                }
                .pb-subject-card:hover .pb-subject-card-glow {
                    opacity: 1;
                }
                .pb-subject-top-content {
                    display: flex;
                    gap: 14px;
                }
                .pb-subject-icon-box {
                    width: 40px;
                    height: 40px;
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: var(--pb-transition);
                }
                .pb-subject-card:hover .pb-subject-icon-box {
                    background: var(--pb-primary);
                    color: #fff;
                    transform: scale(1.05);
                }
                .pb-subject-meta {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                    flex: 1;
                }
                .pb-subject-sem-badge {
                    font-size: 0.68rem;
                    font-weight: 600;
                    color: var(--pb-primary);
                    background: var(--pb-secondary);
                    padding: 1px 6px;
                    border-radius: 6px;
                }
                .pb-subject-title {
                    font-size: 0.92rem;
                    font-weight: 700;
                    color: var(--pb-text);
                    margin: 0;
                    line-height: 1.35;
                }
                .pb-subject-code {
                    font-size: 0.76rem;
                    color: var(--pb-text-4);
                    margin: 0;
                    font-weight: 500;
                }
                .pb-subject-footer-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid rgba(59, 130, 246, 0.08);
                    padding-top: 10px;
                    margin-top: 10px;
                }
                .pb-view-materials-text {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: var(--pb-primary);
                }
                .pb-arrow-icon {
                    color: var(--pb-primary);
                    display: flex;
                    align-items: center;
                    transition: var(--pb-transition);
                }
                .pb-subject-card:hover .pb-arrow-icon {
                    transform: translateX(4px);
                }
            `}</style>
        </div>
    );
};

export default SubjectCard;
