import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import axios from 'axios';

const StaffProfile: React.FC = () => {
    const [Loading, setLoading] = React.useState(true);
    const [staff, setStaff] = React.useState<any>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStaffById = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/staff/${id}`,{
                    headers:{
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type':'application/json'
                    }
                });
                if (response.status === 200) {
                    setStaff(response.data.staff);
                    console.log("Fetched staff data:", response.data.staff);
                }
            } catch (error) {
                console.error("Error fetching staff data by ID:", error);
            }finally{
                setLoading(false);
            }
        };

        fetchStaffById();
    }, [id]);

    if (Loading) {
        return <div className="card staff-card">Loading...</div>;
    }

    if (!staff) {
        return (
            <>
                <Nav />
                <div className="page-container">
                    <div className="content-wrapper">
                        <div className="error-message">
                            <h2>Staff member not found</h2>
                            <button className="btn btn-primary" onClick={() => navigate('/staffs')}>
                                Back to Staffs
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Nav />
            <div className="page-container staff-profile-page">
                <div className="content-wrapper">
                    {/* Back Button */}
                    <button className="back-btn" onClick={() => navigate('/staffs')}>
                        ← Back to Staffs
                    </button>

                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="profile-image-wrapper">
                            <img
                                src={staff.photo}
                                alt={staff.name}
                                onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${staff.name}&background=0047AB&color=fff&size=200`;
                                }}
                                className="profile-image"
                            />
                        </div>
                        <div className="profile-header-info">
                            <h1 className="profile-name">{staff.name}</h1>
                            <div className="profile-badges">
                                <span className="badge badge-primary">{staff.designation}</span>
                                <span className="badge badge-secondary">{staff.department}</span>
                            </div>
                            <p className="profile-qualification">{staff.qualification}</p>
                        </div>
                    </div>

                    {/* Profile Content - Single Continuous Layout */}
                    <div className="profile-content">
                        {/* Basic Information Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">📋</span>
                                Basic Information
                            </h2>
                            <div className="info-list">
                                <div className="info-item">
                                    <span className="info-label">Experience</span>
                                    <span className="info-value">{staff.experience} Years</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Designation</span>
                                    <span className="info-value">{staff.designation}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Qualification</span>
                                    <span className="info-value">{staff.qualification}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Department</span>
                                    <span className="info-value">{staff.department}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">📞</span>
                                Contact Information
                            </h2>
                            <div className="contact-list">
                                <div className="contact-item-new">
                                    <span className="contact-icon-new">📧</span>
                                    <div className="contact-info">
                                        <span className="contact-label-new">EMAIL</span>
                                        <a href={`mailto:${staff.email}`} className="contact-value">
                                            {staff.email}
                                        </a>
                                    </div>
                                </div>
                                <div className="contact-item-new">
                                    <span className="contact-icon-new">📱</span>
                                    <div className="contact-info">
                                        <span className="contact-label-new">PHONE</span>
                                        <a href={`tel:${staff.contactNumber}`} className="contact-value">
                                            {staff.contactNumber}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Handling Subjects Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">📚</span>
                                Handling Subjects
                            </h2>
                            <div className="subjects-list-new">
                                {staff.subjects.map((subject: string, idx: number) => (
                                    <div key={idx} className="subject-item-new">
                                        <span className="subject-bullet">📖</span>
                                        <span className="subject-text">{subject}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Knowledge & Skills Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">💡</span>
                                Knowledge & Skills
                            </h2>
                            <div className="skills-list">
                                {staff.skills.map((skill: string, idx: number) => (
                                    <span key={idx} className="skill-badge">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Achievements Section */}
                        <div className="section">
                            <h2 className="section-heading">
                                <span className="heading-icon">🏆</span>
                                Achievements
                            </h2>
                            <ul className="achievements-list-new">
                                {staff.achievements.map((achievement: string, idx: number) => (
                                    <li key={idx} className="achievement-item-new">
                                        <span className="achievement-check">✓</span>
                                        <span className="achievement-content">{achievement}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .staff-profile-page {
                    background: linear-gradient(135deg, var(--bg) 0%, #E0E8F0 100%);
                    animation: fadeIn 0.5s ease-out;
                }

                .back-btn {
                    background: transparent;
                    border: none;
                    color: var(--primary);
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 8px 16px;
                    margin-bottom: 24px;
                    border-radius: var(--radius-sm);
                    transition: var(--transition);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .back-btn:hover {
                    background: var(--primary-light);
                    transform: translateX(-4px);
                }

                .profile-header {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    border-radius: var(--radius-lg);
                    padding: 48px;
                    display: flex;
                    align-items: center;
                    gap: 32px;
                    margin-bottom: 32px;
                    box-shadow: var(--shadow-lg);
                    animation: slideDown 0.6s ease-out;
                    position: relative;
                    overflow: hidden;
                }

                .profile-header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -10%;
                    width: 300px;
                    height: 300px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    animation: float 6s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .profile-image-wrapper {
                    flex-shrink: 0;
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    padding: 6px;
                    background: linear-gradient(135deg, var(--accent), #FFF);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                    animation: scaleIn 0.6s ease-out 0.2s both;
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .profile-image {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid white;
                }

                .profile-header-info {
                    flex: 1;
                    color: white;
                    z-index: 1;
                }

                .profile-name {
                    font-size: 36px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .profile-badges {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                }

                .badge-primary {
                    background: rgba(255, 255, 255, 0.25);
                    color: white;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 6px 16px;
                    font-size: 14px;
                }

                .badge-secondary {
                    background: var(--accent);
                    color: var(--primary-dark);
                    padding: 6px 16px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .profile-qualification {
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 400;
                }

                .profile-content {
                    background: white;
                    border-radius: var(--radius-lg);
                    padding: 40px;
                    box-shadow: var(--shadow-card);
                    animation: fadeInUp 0.6s ease-out 0.3s both;
                }

                .section {
                    margin-bottom: 48px;
                }

                .section:last-child {
                    margin-bottom: 0;
                }

                .section-heading {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--primary-dark);
                    margin-bottom: 24px;
                    padding-bottom: 12px;
                    border-bottom: 3px solid var(--primary);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .heading-icon {
                    font-size: 24px;
                }

                /* Basic Information List */
                .info-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 0;
                    border-bottom: 1px solid var(--border);
                }

                .info-item:last-child {
                    border-bottom: none;
                }

                .info-label {
                    font-weight: 600;
                    color: var(--text-muted);
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    flex-shrink: 0;
                    min-width: 140px;
                }

                .info-value {
                    font-weight: 500;
                    color: var(--text-main);
                    font-size: 15px;
                    text-align: right;
                    flex: 1;
                }

                /* Contact Information List */
                .contact-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .contact-item-new {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    padding: 18px;
                    background: linear-gradient(135deg, var(--bg) 0%, #F8FAFC 100%);
                    border-radius: var(--radius-sm);
                    border-left: 4px solid var(--primary);
                    transition: var(--transition);
                }

                .contact-item-new:hover {
                    background: var(--primary-light);
                    transform: translateX(6px);
                    box-shadow: var(--shadow-sm);
                }

                .contact-icon-new {
                    font-size: 28px;
                    width: 56px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 50%;
                    box-shadow: var(--shadow-sm);
                    flex-shrink: 0;
                }

                .contact-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .contact-label-new {
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                .contact-value {
                    color: var(--primary);
                    font-weight: 500;
                    font-size: 15px;
                    text-decoration: none;
                    transition: var(--transition);
                }

                .contact-value:hover {
                    color: var(--primary-dark);
                    text-decoration: underline;
                }

                /* Subjects List */
                .subjects-list-new {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .subject-item-new {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 20px;
                    background: linear-gradient(135deg, var(--primary-light) 0%, white 100%);
                    border-radius: var(--radius-sm);
                    border-left: 4px solid var(--primary);
                    transition: var(--transition);
                }

                .subject-item-new:hover {
                    transform: translateX(6px);
                    box-shadow: var(--shadow-sm);
                    background: linear-gradient(135deg, #D6E9FF 0%, #F0F7FF 100%);
                }

                .subject-bullet {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .subject-text {
                    font-weight: 500;
                    color: var(--text-main);
                    font-size: 15px;
                    flex: 1;
                }

                /* Skills List */
                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .skill-badge {
                    padding: 10px 20px;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                    border-radius: var(--radius-full);
                    font-size: 14px;
                    font-weight: 500;
                    transition: var(--transition);
                    cursor: default;
                    box-shadow: 0 2px 8px rgba(0, 71, 171, 0.25);
                }

                .skill-badge:hover {
                    transform: translateY(-3px) scale(1.05);
                    box-shadow: 0 6px 16px rgba(0, 71, 171, 0.35);
                }

                /* Achievements List */
                .achievements-list-new {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .achievement-item-new {
                    display: flex;
                    align-items: flex-start;
                    gap: 18px;
                    padding: 18px 20px;
                    background: linear-gradient(135deg, #FFF9E6 0%, #FFFBF0 100%);
                    border-radius: var(--radius-sm);
                    border-left: 4px solid var(--accent);
                    transition: var(--transition);
                }

                .achievement-item-new:hover {
                    transform: translateX(6px);
                    box-shadow: var(--shadow-sm);
                    background: linear-gradient(135deg, #FFF4CC 0%, #FFF9E6 100%);
                }

                .achievement-check {
                    flex-shrink: 0;
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
                    color: var(--primary-dark);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 16px;
                    box-shadow: 0 3px 10px rgba(255, 215, 0, 0.35);
                }

                .achievement-content {
                    flex: 1;
                    color: var(--text-main);
                    font-size: 15px;
                    line-height: 1.7;
                    padding-top: 4px;
                }

                .error-message {
                    text-align: center;
                    padding: 60px 20px;
                }

                .error-message h2 {
                    margin-bottom: 24px;
                    color: var(--text-muted);
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .profile-header {
                        flex-direction: column;
                        text-align: center;
                        padding: 32px 24px;
                    }

                    .profile-image-wrapper {
                        width: 150px;
                        height: 150px;
                    }

                    .profile-name {
                        font-size: 28px;
                    }

                    .profile-badges {
                        justify-content: center;
                    }

                    .profile-content {
                        padding: 24px;
                    }

                    .section {
                        margin-bottom: 36px;
                    }

                    .section-heading {
                        font-size: 18px;
                    }

                    .info-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 6px;
                    }

                    .info-label {
                        min-width: auto;
                    }

                    .info-value {
                        text-align: left;
                    }

                    .back-btn {
                        font-size: 14px;
                    }

                    .contact-value {
                        font-size: 14px;
                    }
                }

                @media (min-width: 769px) and (max-width: 1024px) {
                    .profile-content {
                        padding: 32px;
                    }
                }
            `}</style>
        </>
    );
};

export default StaffProfile;
