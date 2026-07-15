import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Staff } from '../data/sampleData';

interface StaffCardProps {
    staff: Staff;
}

const StaffCard: React.FC<StaffCardProps> = ({ staff }) => {
    const navigate = useNavigate();

    const handleViewProfile = () => {
        navigate(`/staffs/${staff._id}`);
    };

    const photoUrl = staff.photo
        ? staff.photo
        : `https://ui-avatars.com/api/?name=${staff.name}&background=3B82F6&color=fff&size=200`;

    return (
        <div className="pb-staff-card" onClick={handleViewProfile}>
            <div className="pb-staff-card-glow" />
            <div className="pb-staff-header-band">
                <div className="pb-staff-avatar-ring">
                    <div className="pb-staff-avatar-wrapper">
                        <img
                            src={photoUrl}
                            alt={staff.name}
                            onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${staff.name}&background=3B82F6&color=fff&size=200`;
                            }}
                            className="pb-staff-avatar-img"
                        />
                    </div>
                </div>
                <div className="pb-staff-identity-group">
                    <h3 className="pb-staff-name-title">{staff.name}</h3>
                    <span className="pb-staff-designation-badge">{staff.designation}</span>
                </div>
            </div>

            <div className="pb-staff-body-content">
                <p className="pb-staff-qual-text">{staff.qualification || 'Professor'}</p>
                <div className="pb-staff-subjects-tags">
                    {staff.subjects?.slice(0, 3).map((sub, idx) => (
                        <span key={idx} className="pb-subject-pill-tag">{sub}</span>
                    ))}
                    {staff.subjects && staff.subjects.length > 3 && (
                        <span className="pb-subject-pill-tag pb-more-tag">+{staff.subjects.length - 3} more</span>
                    )}
                </div>
            </div>

            <div className="pb-staff-card-actions" onClick={(e) => e.stopPropagation()}>
                <button className="pb-staff-view-btn" onClick={handleViewProfile}>
                    View Profile
                </button>
                <div className="pb-staff-quick-contacts">
                    {staff.email && (
                        <a href={`mailto:${staff.email}`} className="pb-contact-btn-link" title="Send Email">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                        </a>
                    )}
                    {staff.contactNumber && (
                        <a href={`tel:${staff.contactNumber}`} className="pb-contact-btn-link" title="Call">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </a>
                    )}
                </div>
            </div>

            <style>{`
                .pb-staff-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    justify-content: space-between;
                    min-height: 230px;
                    padding: 20px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    transition: var(--pb-transition);
                    cursor: pointer;
                    overflow: hidden;
                }
                .pb-staff-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--pb-shadow-md);
                    border-color: rgba(59, 130, 246, 0.3);
                }
                .pb-staff-card-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, var(--pb-primary), var(--pb-primary-light));
                    opacity: 0;
                    transition: var(--pb-transition);
                }
                .pb-staff-card:hover .pb-staff-card-glow {
                    opacity: 1;
                }
                .pb-staff-header-band {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .pb-staff-avatar-ring {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-light));
                    padding: 2px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.15);
                }
                .pb-staff-avatar-wrapper {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #fff;
                }
                .pb-staff-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .pb-staff-identity-group {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                .pb-staff-name-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--pb-text);
                    margin: 0;
                    letter-spacing: -0.01em;
                }
                .pb-staff-designation-badge {
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: var(--pb-primary);
                    background: var(--pb-secondary);
                    padding: 2px 8px;
                    border-radius: 99px;
                }
                .pb-staff-body-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .pb-staff-qual-text {
                    font-size: 0.82rem;
                    color: var(--pb-text-3);
                    margin: 0;
                    line-height: 1.4;
                }
                .pb-staff-subjects-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .pb-subject-pill-tag {
                    font-size: 0.72rem;
                    font-weight: 500;
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    color: var(--pb-text-2);
                    padding: 3px 8px;
                    border-radius: 8px;
                }
                .pb-subject-pill-tag.pb-more-tag {
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    font-weight: 600;
                    border-color: transparent;
                }
                .pb-staff-card-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-top: 1px solid rgba(59, 130, 246, 0.08);
                    padding-top: 12px;
                }
                .pb-staff-view-btn {
                    flex: 1;
                    height: 36px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--pb-primary);
                    background: var(--pb-secondary);
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: var(--pb-transition);
                }
                .pb-staff-view-btn:hover {
                    background: var(--pb-primary);
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                }
                .pb-staff-quick-contacts {
                    display: flex;
                    gap: 8px;
                }
                .pb-contact-btn-link {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.08);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--pb-text-3);
                    cursor: pointer;
                    transition: var(--pb-transition);
                }
                .pb-contact-btn-link:hover {
                    background: var(--pb-secondary);
                    color: var(--pb-primary);
                    border-color: transparent;
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

export default StaffCard;
