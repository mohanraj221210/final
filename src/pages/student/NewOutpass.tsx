import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const Outpass: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        outpassType: 'Outing',
        fromDate: '',
        toDate: '',
        reason: '',
        contactNo: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const checkProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 200) {
                    const user = response.data.user;
                    const isProfileComplete = () => {
                        if (!user.name || !user.registerNumber || !user.department || !user.year ||
                            !user.phone || !user.email || !user.parentnumber || !user.residencetype || !user.photo) {
                            return false;
                        }

                        if (user.residencetype === 'hostel') {
                            if (!user.hostelname || !user.hostelroomno) return false;
                        } else if (user.residencetype === 'day scholar') {
                            if (!user.busno || !user.boardingpoint) return false;
                        }
                        return true;
                    };

                    if (!isProfileComplete()) {
                        toast.error("Please complete your profile first");
                        navigate('/dashboard');
                    }
                }
            } catch (error) {
                console.error("Error checking profile:", error);
            }
        };
        checkProfile();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/outpass/apply`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                toast.success("Outpass applied successfully");
                navigate('/passapproval');
            }
        } catch (error: any) {
            console.error("Error applying for outpass:", error);
            const errorMessage = error.response?.data?.message || "Failed to submit application";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

      const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="page-container outpass-page">
            <ToastContainer position="bottom-right" />
             <header className="dashboard-header-custom">
                <div className="header-container-custom">
                    <div className="header-left-custom">
                        <div className="brand-custom">
                            <span className="brand-icon-custom">🎓</span>
                            <span className="brand-text-custom">JIT Student Portal</span>
                        </div>
                    </div>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>

                    <nav className={`header-nav-custom ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/dashboard')}
                        >
                            Dashboard
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/staffs')}
                        >
                            Staffs
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/student-notice')}
                        >
                            Notices
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/outpass')}
                        >
                            Outpass
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/subjects')}
                        >
                            Subjects
                        </button>
                        <button
                            className="nav-item-custom"
                            onClick={() => navigate('/profile')}
                        >
                            Profile
                        </button>
                        <button className="logout-btn-custom" onClick={handleLogout}>
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            <div className="content-wrapper">
                <div className="page-header">
                    <button onClick={() => navigate('/dashboard')} className="back-btn">
                        ← Back to Dashboard
                    </button>
                    <h1>Apply for Outpass</h1>
                    <p>Request permission to leave the campus</p>
                </div>

                <div className="outpass-form-container">
                    <form onSubmit={handleSubmit} className="outpass-form">
                        <div className="form-group">
                            <label>Outpass Type</label>
                            <select
                                name="outpassType"
                                value={formData.outpassType}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="Outing">Outing (Town Pass)</option>
                                <option value="Home">Home Pass</option>
                                <option value="OD">On Duty (OD)</option>
                                <option value="Emergency">Emergency</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>From Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="fromDate"
                                    value={formData.fromDate}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>To Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="toDate"
                                    value={formData.toDate}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Reason for Leave</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                maxLength={250}
                                rows={4}
                                placeholder="Please describe why you need to leave..."
                                className="form-input"
                            ></textarea>
                        </div>

                        {/*
                        <div className="form-group">
                            <label>Emergency Contact Number</label>
                            <input
                                type="tel"
                                name="contactNo"
                                value={formData.contactNo}
                                onChange={handleChange}
                                required
                                placeholder="Enter parent/guardian number"
                                className="form-input"
                            />
                        </div> */}

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                            {/* <button
                                type="button"
                                onClick={() => navigate('')}
                                className="btn btn-secondary view-status-btn"
                            >
                                View Approval Status
                            </button>  */}
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
            /* Custom Dashboard Header */
                .dashboard-header-custom {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 70px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    z-index: 1000;
                }

                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #1e293b;
                    padding: 8px;
                    z-index: 1001;
                }

                .header-container-custom {
                    max-width: 1400px;
                    margin: 0 auto;
                    height: 100%;
                    padding: 0 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left-custom {
                    display: flex;
                    align-items: center;
                }

                .brand-custom {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .brand-icon-custom {
                    font-size: 28px;
                }

                .brand-text-custom {
                    font-size: 1.3rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-nav-custom {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-item-custom {
                    padding: 10px 20px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                }

                .nav-item-custom:hover {
                    background: #f1f5f9;
                    color: #0047AB;
                }

                .logout-btn-custom {
                    padding: 10px 24px;
                    border: 2px solid #ef4444;
                    background: white;
                    color: #ef4444;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    margin-left: 12px;
                }

                .logout-btn-custom:hover {
                    background: #ef4444;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .content-wrapper-custom {
                    margin-top: 70px;
                    padding: 0;
                }

                .page-container {
                    min-height: 100vh;
                    background: #f8fafc;
                }
                
                .content-wrapper {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }

                .page-header {
                    margin-bottom: 32px;
                    text-align: center;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    color: #1e293b;
                    margin-bottom: 8px;
                    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .page-header p {
                    color: #64748b;
                    font-size: 1.1rem;
                }

                .back-btn {
                    background: none;
                    border: none;
                    color: #3b82f6;
                    cursor: pointer;
                    font-weight: 500;
                    margin-bottom: 16px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .back-btn:hover {
                    background: #eff6ff;
                }

                .outpass-form-container {
                    background: white;
                    border-radius: 24px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    animation: fadeInUp 0.5s ease-out;
                }

                .form-group {
                    margin-bottom: 24px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #475569;
                    font-weight: 500;
                    font-size: 0.95rem;
                }

                .form-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    color: #1e293b;
                    transition: all 0.2s;
                    background: #f8fafc;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                textarea.form-input {
                    resize: vertical;
                }

                .form-actions {
                    display: flex;
                    gap: 16px;
                    margin-top: 32px;
                }

                .submit-btn {
                    flex: 1;
                    padding: 16px;
                    font-size: 1.1rem;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(37, 99, 235, 0.3);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .view-status-btn {
                    flex: 1;
                    padding: 16px;
                    font-size: 1.1rem;
                    border-radius: 12px;
                    background: white;
                    color: #2563eb;
                    border: 2px solid #2563eb;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .view-status-btn:hover {
                    background: #eff6ff;
                    transform: translateY(-2px);
                }

                @media (max-width: 640px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    .outpass-form-container {
                        padding: 24px;
                    }
                    .form-actions {
                        flex-direction: column;
                    }
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Outpass;
