import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Subject } from '../data/sampleData';

interface SubjectCardProps {
    subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
    const navigate = useNavigate();

    return (
        <div className="card subject-card card-hover" onClick={() => navigate(`/subjects/${subject.id}`)}>
            <div className="subject-top-content">
                <div className="subject-icon-box">
                    📚
                </div>
                <div className="subject-meta">
                    <span className="badge badge-blue">Sem {subject.semester}</span>
                    <h3 className="subject-title">{subject.name}</h3>
                    <p className="subject-code">{subject.code || 'Code: N/A'}</p>
                </div>
            </div>
            <div className="subject-footer-row">
                <span className="view-link-text">Course Materials</span>
                <span className="arrow-icon">→</span>
            </div>

            <style>{`
                .subject-card {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    cursor: pointer;
                    min-height: 180px;
                    padding: var(--space-5) !important;
                }
                .subject-top-content {
                    display: flex;
                    gap: 16px;
                }
                .subject-icon-box {
                    width: 44px;
                    height: 44px;
                    background: var(--primary-light);
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    flex-shrink: 0;
                }
                .subject-meta {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                .subject-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--text-1);
                    margin: 0;
                    line-height: 1.35;
                }
                .subject-code {
                    font-size: 0.8rem;
                    color: var(--text-4);
                    margin: 0;
                }

                .subject-footer-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid var(--border);
                    padding-top: 12px;
                    margin-top: 12px;
                }
                .view-link-text {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: var(--primary);
                }
                .arrow-icon {
                    color: var(--primary);
                    font-weight: 700;
                    transition: var(--transition-fast);
                }
                .subject-card:hover .arrow-icon {
                    transform: translateX(4px);
                }
            `}</style>
        </div>
    );
};

export default SubjectCard;
