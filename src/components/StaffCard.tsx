import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Staff } from '../data/sampleData';
import axios from 'axios';
import { toast } from 'react-toastify';

interface StaffCardProps {
    staff: Staff;
}

const StaffCard: React.FC<StaffCardProps> = ({ staff }) => {
    const [Loading, setLoading] = React.useState(true);
    const [staffData, setStaffData] = React.useState<Staff | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const Staff = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/staff/list`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    const staffs = response.data.staff;
                    const staffinfo = Array.isArray(staffs) ? staffs.find((s: Staff) => s._id === staff._id) : null;
                    setStaffData(staffinfo);
                }
            } catch (error: any) {
                toast.error("An error occurred while fetching staff data");
                console.error("Error fetching staff data:", error.message);
            } finally {
                setLoading(false);
            }
        }
        Staff();
    }, []);

    const handleViewProfile = () => {
        navigate(`/staffs/${staff._id}`);
    };

    if (Loading) {
        return <div className="card staff-card">Loading...</div>;
    }

    return (
        <div className="card staff-card">
            <div className="staff-header">
                <div className="staff-img-wrapper">
                    <img
                        src={
                            (staffData?.photo || staff.photo)
                                ? (staffData?.photo || staff.photo)?.startsWith('http')
                                    ? (staffData?.photo || staff.photo)
                                    : `${import.meta.env.VITE_CDN_URL}${staffData?.photo || staff.photo}`
                                : `https://ui-avatars.com/api/?name=${staffData?.name || staff.name}&background=0047AB&color=fff&size=200`
                        }
                        alt={staffData?.name}
                        onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + staff.name + '&background=random'; }}
                        className="staff-img"
                    />
                </div>
                <div className="staff-identity">
                    <h3>{staffData?.name}</h3>
                    <p className="designation">{staffData?.designation}</p>
                </div>
            </div>

            <div className="staff-body">
                <p className="qualification">{staffData?.qualification}</p>
                <div className="subjects-list">
                    {staffData?.subjects?.map((sub, idx) => (
                        <span key={idx} className="subject-tag">{sub}</span>
                    ))}
                </div>
            </div>

            <div className="staff-overlay">
                <div className="overlay-content">
                    <button className="btn btn-primary btn-sm" onClick={handleViewProfile}>View Profile</button>
                    <div className="contact-icons">
                        <span className="icon-btn" title="Email">📧</span>
                        <span className="icon-btn" title="Call">📞</span>
                    </div>
                </div>
            </div>

            <style>{`
                .staff-card {
                    position: relative;
                    overflow: hidden;
                    padding: 0;
                    border: 1px solid var(--border);
                    transition: all 0.3s ease;
                }

                .staff-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-lg);
                }

                .staff-header {
                    padding: 24px;
                    text-align: center;
                    background: linear-gradient(to bottom, var(--primary-light) 50%, white 50%);
                }

                .staff-img-wrapper {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto 16px;
                    border-radius: 50%;
                    padding: 4px;
                    background: white;
                    box-shadow: var(--shadow-sm);
                }

                .staff-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .staff-identity h3 {
                    font-size: 18px;
                    margin-bottom: 4px;
                }

                .designation {
                    font-size: 13px;
                    color: var(--primary);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .staff-body {
                    padding: 0 24px 24px;
                    text-align: center;
                }

                .qualification {
                    font-size: 14px;
                    color: var(--text-muted);
                    margin-bottom: 16px;
                }

                .subjects-list {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 8px;
                }

                .subject-tag {
                    font-size: 11px;
                    padding: 4px 10px;
                    background: var(--bg);
                    border-radius: 12px;
                    color: var(--text-muted);
                }

                .staff-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(2px);
                }

                .staff-card:hover .staff-overlay {
                    opacity: 1;
                }

                .overlay-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    transform: translateY(20px);
                    transition: all 0.3s ease;
                }

                .staff-card:hover .overlay-content {
                    transform: translateY(0);
                }

                .contact-icons {
                    display: flex;
                    gap: 12px;
                }

                .icon-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--bg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .icon-btn:hover {
                    background: var(--primary-light);
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
};

export default StaffCard;
