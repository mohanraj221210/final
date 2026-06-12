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
        ? staff.photo.startsWith('http')
            ? staff.photo
            : `${import.meta.env.VITE_CDN_URL}${staff.photo}`
        : `https://ui-avatars.com/api/?name=${staff.name}&background=2563EB&color=fff&size=200`;

    return (
        <div className="card staff-card card-hover">
            <div className="staff-header-band">
                <div className="staff-avatar-wrapper">
                    <img
                        src={photoUrl}
                        alt={staff.name}
                        onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${staff.name}&background=2563EB&color=fff&size=200`;
                        }}
                        className="staff-avatar-img"
                    />
                </div>
                <div className="staff-identity-group">
                    <h3 className="staff-name-title">{staff.name}</h3>
                    <span className="badge badge-blue">{staff.designation}</span>
                </div>
            </div>

            <div className="staff-body-content">
                <p className="staff-qual-text">{staff.qualification || 'Professor'}</p>
                <div className="staff-subjects-tags">
                    {staff.subjects?.slice(0, 3).map((sub, idx) => (
                        <span key={idx} className="subject-pill-tag">{sub}</span>
                    ))}
                    {staff.subjects && staff.subjects.length > 3 && (
                        <span className="subject-pill-tag more-tag">+{staff.subjects.length - 3} more</span>
                    )}
                </div>
            </div>

            <div className="staff-card-actions">
                <button className="btn btn-secondary btn-sm flex-1" onClick={handleViewProfile}>
                    View Profile
                </button>
                <div className="staff-quick-contacts">
                    {staff.email && (
                        <a href={`mailto:${staff.email}`} className="contact-btn-link" title="Send Email">
                            📧
                        </a>
                    )}
                    {staff.contactNumber && (
                        <a href={`tel:${staff.contactNumber}`} className="contact-btn-link" title="Call">
                            📞
                        </a>
                    )}
                </div>
            </div>

            <style>{`
                .staff-card {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    justify-content: space-between;
                    min-height: 280px;
                }
                .staff-header-band {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .staff-avatar-wrapper {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid var(--border);
                    background: var(--bg-elevated);
                    flex-shrink: 0;
                }
                .staff-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .staff-identity-group {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                .staff-name-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-1);
                    margin: 0;
                }
                
                .staff-body-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .staff-qual-text {
                    font-size: 0.82rem;
                    color: var(--text-3);
                    margin: 0;
                }
                .staff-subjects-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .subject-pill-tag {
                    font-size: 0.72rem;
                    font-weight: 600;
                    background: var(--bg-elevated);
                    color: var(--text-2);
                    padding: 2px 8px;
                    border-radius: var(--radius-sm);
                }
                .subject-pill-tag.more-tag {
                    background: var(--primary-light);
                    color: var(--primary);
                }

                .staff-card-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-top: 1px solid var(--border);
                    padding-top: 12px;
                }
                .staff-quick-contacts {
                    display: flex;
                    gap: 8px;
                }
                .contact-btn-link {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--bg-elevated);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: var(--transition-fast);
                }
                .contact-btn-link:hover {
                    background: var(--primary-light);
                    transform: scale(1.08);
                }
            `}</style>
        </div>
    );
};

export default StaffCard;
