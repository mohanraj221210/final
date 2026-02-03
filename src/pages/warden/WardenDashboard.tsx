import React from 'react';
import Nav from '../../components/WardenNav';
import { useNavigate } from 'react-router-dom';
import { type User } from '../../data/sampleData';
import axios from 'axios';
import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';

const Dashboard: React.FC = () => {
    const [Loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState<User>({
        name: "",
        registerNumber: "",
        department: "",
        year: "",
        semester: 0,
        email: "",
        phone: "",
        photo: "",
        batch: "",
        gender: "male",
        parentnumber: "",
        residencetype: "",
        boardingpoint: "",
        busno: "",
        cgpa: 0,
        hostelname: "",
        hostelroomno: ""
    });
    const navigate = useNavigate();
    const [zoomingPath, setZoomingPath] = React.useState<string | null>(null);
    const [isProfileComplete, setIsProfileComplete] = React.useState(true); // Default true to avoid flash, validated in fetch

    const checkCompletion = (data: User) => {
        const requiredFields = ['name', 'email', 'phone', 'gender', 'hostelname', 'photo'];
        // Check if any required field is missing or empty or 'N/A' (for demo data)
        const isComplete = requiredFields.every(field => {
            const value = data[field as keyof User];
            return value && value !== 'N/A' && value !== '';
        });
        return isComplete;
    };

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userType = localStorage.getItem('userType');

            // Try fetching real data if token exists
            if (token) {
                try {
                    const endpoint = userType === 'warden'
                        ? `${import.meta.env.VITE_API_URL}/warden/profile`
                        : `${import.meta.env.VITE_API_URL}/api/profile`;

                    const response = await axios.get(endpoint, {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.status === 200) {
                        const userData = userType === 'warden' ? response.data.warden : response.data.user;
                        setUser(userData);
                        const complete = checkCompletion(userData);
                        setIsProfileComplete(complete);
                        if (complete) {
                            toast.success("User profile fetched successfully");
                        } else {
                            toast.warn("Please complete your profile to access all features");
                        }
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                    toast.error('Failed to fetch user data');
                }
            }

            // Fallback/Demo data for 'warden' if API failed or no token
            if (userType === 'warden') {
                const demoUser: User = {
                    name: "Sanjay.S",
                    registerNumber: "WARDEN001",
                    department: "Hostel Management",
                    year: "2025",
                    semester: 0,
                    email: "warden@jit.edu",
                    phone: "+91 9876543210",
                    photo: "https://via.placeholder.com/150",
                    batch: "N/A",
                    gender: "male",
                    parentnumber: "N/A",
                    residencetype: "Warden",
                    boardingpoint: "N/A",
                    busno: "N/A",
                    cgpa: 0,
                    hostelname: "N/A",
                    hostelroomno: "N/A"
                };
                setUser(demoUser);
                setIsProfileComplete(checkCompletion(demoUser));
                setLoading(false);
            } else {
                setLoading(false);
            }
        };

        const checkEmergencyRequests = async () => {
            const userType = localStorage.getItem('userType');
            if (userType !== 'warden') return;

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/warden/outpass/list`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                // Warden API returns outpasses/data/students
                const outpasses = response.data.outpasses || response.data.data || response.data.students || [];

                const emergencyRequests = outpasses.filter((o: any) => {
                    const type = (o.outpasstype || o.type || '').toLowerCase();
                    const status = (o.wardenapprovalstatus || '').toLowerCase();
                    return type === 'emergency' && status === 'pending';
                });

                if (emergencyRequests.length > 0) {
                    toast.error(`⚠️ ${emergencyRequests.length} Emergency Request(s) Pending!`, {
                        position: "top-center",
                        autoClose: false,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "colored",
                        style: { fontWeight: 'bold', fontSize: '16px' }
                    });
                }
            } catch (error) {
                console.error("Failed to check emergency requests", error);
            }
        };

        fetchUserData();
        checkEmergencyRequests();
    }, []);

    const handleQuickAction = (path: string) => {
        setZoomingPath(path);
        setTimeout(() => {
            navigate(path);
        }, 700);
    };

    return (
        <div className="page-container dashboard-page">
            <ToastContainer position="bottom-right" />
            {Loading ? (
                <div className="card staff-card" style={{ margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : (
                <>
                    <Nav />
                    <div className="content-wrapper">

                        {!isProfileComplete && (
                            <div className="profile-incomplete-overlay">
                                <div className="incomplete-card">
                                    <div className="warning-icon">⚠️</div>
                                    <h2>Profile Incomplete</h2>
                                    <p>You must complete your profile information (including photo, phone number, and hostel name) before you can access the Warden Dashboard.</p>
                                    <button
                                        className="btn-complete-profile"
                                        onClick={() => navigate('/warden-profile')}
                                    >
                                        Complete Profile Now →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Hero Section */}
                        <div className={`dashboard-hero ${!isProfileComplete ? 'blurred' : ''}`}>
                            <div className="hero-welcome">
                                <div>
                                    <span className="badge">Welcome Back</span>
                                </div>
                                <div>
                                    <h1 style={{ color: 'skyblue' }}>Hello, {user.name}! 👋</h1>
                                    <p style={{ color: 'skyblue' }}>
                                        {user.year} • {user.department}
                                    </p>
                                </div>
                            </div>
                            <div className="hero-stats-grid">
                            </div>
                        </div>

                        <div className={`dashboard-layout ${!isProfileComplete ? 'blurred' : ''}`}>
                            {/* Main Content */}
                            <div className="main-content">
                                {/* Quick Actions */}
                                <section className="section">
                                    <h2 className="section-title">Quick Actions</h2>
                                    <div className="quick-links-grid">

                                        {/* Pending Outpass */}
                                        <div
                                            className={`action-card ${zoomingPath === '/warden/pending-outpass' ? 'zooming' : ''}`}
                                            onClick={() => isProfileComplete ? handleQuickAction('/warden/pending-outpass') : null}
                                            style={{ cursor: isProfileComplete ? 'pointer' : 'not-allowed' }}
                                        >
                                            <span className="action-icon">⏳</span>
                                            <span className="action-text">Pending Outpass</span>
                                        </div>

                                        {/* Outpass List */}
                                        <div
                                            className={`action-card ${zoomingPath === '/warden/outpass-list' ? 'zooming' : ''}`}
                                            onClick={() => isProfileComplete ? handleQuickAction('/warden/outpass-list') : null}
                                            style={{ cursor: isProfileComplete ? 'pointer' : 'not-allowed' }}
                                        >
                                            <span className="action-icon">✅</span>
                                            <span className="action-text">Outpass List</span>
                                        </div>

                                    </div>

                                </section>
                            </div>

                            {/* Sidebar */}
                            <aside className="sidebar">
                            </aside>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .dashboard-hero {
                    background: linear-gradient(-45deg, #0047AB, #00214D, #1e3a8a, #0f172a);
                    background-size: 400% 400%;
                    animation: aurora 15s ease infinite;
                    border-radius: 24px;
                    padding: 40px;
                    margin-bottom: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
                    position: relative;
                    overflow: hidden;
                    color: white;
                }

                .dashboard-hero::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: 
                        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 40%);
                    animation: pulse-glow 8s ease-in-out infinite alternate;
                    z-index: 0;
                }

                /* 3D Stat Card Effect */
                .hero-stats-grid {
                    display: flex;
                    gap: 24px;
                    position: relative;
                    z-index: 1;
                    perspective: 1000px;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(12px);
                    padding: 20px 28px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    min-width: 180px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-style: preserve-3d;
                }

                .stat-card:hover {
                    transform: translateY(-5px) rotateX(5deg) scale(1.05);
                    background: rgba(255, 255, 255, 0.2);
                    box-shadow: 
                        0 20px 40px rgba(0,0,0,0.3),
                        0 0 20px rgba(255,255,255,0.2) inset;
                    border-color: rgba(255,255,255,0.6);
                }

                /* Section Spacing */
                .section {
                    margin-bottom: 32px;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                /* Quick Actions Grid with 3D Perspective */
                .quick-links-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 20px;
                    perspective: 1000px;
                    padding-bottom: 20px;
                }

                .action-card {
                    background: white;
                    padding: 24px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    text-align: center;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
                    cursor: pointer;
                }

                /* Zoom Effect */
                .action-card.zooming {
                    animation: zoom-in-nav 0.6s cubic-bezier(0.7, 0, 0.3, 1) forwards;
                    z-index: 100;
                    pointer-events: none;
                }

                @keyframes zoom-in-nav {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(20);
                        opacity: 0;
                    }
                }

                .action-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 50px rgba(255, 255, 255, 0.17);
                }
                
                .action-icon {
                    font-size: 36px;
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
                    width: 72px;
                    height: 72px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    color: var(--primary);
                    border: 1px solid rgba(0, 0, 0, 0.03);
                    position: relative;
                    z-index: 2;
                }

                .action-card:hover .action-icon {
                    background: #8eb7f0ff;
                    color: white;
                    transform: scale(1.15) rotate(10deg);
                    box-shadow: 0 15px 30px rgba(0, 70, 168, 0.78);
                }

                /* Enhanced Info Card */
                .info-card {
                    background: white;
                    border-radius: 24px;
                    padding: 32px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
                    position: relative;
                    overflow: hidden;
                }
                
                .info-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 6px;
                    background: linear-gradient(90deg, #0047AB, #60a5fa);
                }
                
                .card-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 32px;
                    border-bottom: 1px solid #f1e4e4ff;
                    padding-bottom: 24px;
                }

                .header-icon {
                    font-size: 28px;
                    background: #eff6ff;
                    padding: 12px;
                    border-radius: 12px;
                }

                .card-subtitle {
                    color: #64748b;
                    font-size: 0.9rem;
                    margin-top: 4px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 24px;
                }

                .info-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }

                .info-item:hover {
                    background: #eff6ff;
                    transform: translateY(-2px);
                }

                .info-icon {
                    font-size: 24px;
                    background: white;
                    padding: 10px;
                    border-radius: 12px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
                }

                .info-content label {
                    display: block;
                    color: #64748b;
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }

                .info-content p {
                    color: #0f172a;
                    font-weight: 600;
                    font-size: 1rem;
                    margin: 0;
                }

                /* Vision Card Enhancements */
                .vision-card {
                    background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
                    color: white;
                    border-radius: 24px;
                    padding: 32px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }

                /* Shimmer Glow Border */
                .vision-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 24px; 
                    padding: 2px; 
                    background: linear-gradient(45deg, transparent, rgba(96, 165, 250, 0.8), rgba(251, 191, 36, 0.8), transparent); 
                    background-size: 200% 200%; 
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    animation: shimmer-border 3s linear infinite;
                    pointer-events: none;
                }

                /* Background Blur/Glow behind */
                .vision-card::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.1), transparent 60%);
                    animation: rotate-glow 10s linear infinite;
                    pointer-events: none;
                    z-index: 0;
                }

                .vision-card .card-header {
                    border-bottom-color: rgba(255,255,255,0.1);
                    align-items: center;
                    position: relative;
                    z-index: 1;
                }
                
                .vision-card .header-icon {
                    background: rgba(255, 255, 255, 0.1);
                }

                .vision-card h3 {
                    color: white;
                }

                .vision-content {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 32px;
                    align-items: start;
                    position: relative;
                    z-index: 1;
                }

                .vision-divider {
                    width: 1px;
                    height: 100%;
                    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
                }

                .vision-block h4 {
                    color: #60a5fa; /* Light Blue */
                    font-size: 1.1rem;
                    margin-bottom: 16px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .vision-block p, .vision-block li {
                    color: #cbd5e1; /* Slate 300 - readable on dark */
                    line-height: 1.6;
                    font-size: 0.95rem;
                }

                .vision-block ul {
                    padding-left: 20px;
                }

                .vision-block li {
                    margin-bottom: 8px;
                }

                @media (max-width: 768px) {
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                    .vision-content {
                        grid-template-columns: 1fr;
                    }
                    .vision-divider {
                        display: none;
                    }
                }
                
                @keyframes shimmer-border {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }

                @keyframes rotate-glow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }


                /* Keyframes */
                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }

                @keyframes typing {
                    from { width: 0 }
                    to { width: 100% }
                }
                
                @keyframes blink-caret {
                    from, to { border-color: transparent }
                    50% { border-color: white; }
                }

                .hero-welcome .badge {
                    animation: pulse-glow 3s infinite;
                    display: inline-block;
                    margin-bottom: 12px;
                }
                
                /* Typing effect for H1 */
                .hero-welcome h1 {
                    display: inline-block;
                    overflow: hidden;
                    white-space: nowrap;
                    border-right: 3px solid white;
                    animation: 
                        fadeInUp 0.8s ease-out 0.2s backwards,
                        typing 2s steps(30, end) 0.5s both,
                        blink-caret 0.75s step-end infinite;
                    max-width: fit-content;
                }

                /* Staggered Action Cards */
                .action-card {
                    animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
                }
                .action-card:nth-child(1) { animation-delay: 0.3s; }
                .action-card:nth-child(2) { animation-delay: 0.4s; }
                .action-card:nth-child(3) { animation-delay: 0.5s; }
                .action-card:nth-child(4) { animation-delay: 0.6s; }

                @media (max-width: 968px) {
                    .dashboard-layout { 
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                    .dashboard-hero { 
                        flex-direction: column; 
                        align-items: flex-start; 
                        padding: 24px;
                    }
                    .hero-welcome h1 {
                        font-size: 20px; /* Reduced from default/24px */
                    }
                    .hero-welcome p {
                        font-size: 14px;
                    }
                    .hero-stats-grid { 
                        width: 100%; 
                        flex-wrap: wrap; 
                        overflow-visible: visible; 
                    }
                    .stat-card {
                        flex: 1 1 150px; 
                        min-width: 140px;
                    }
                    .sidebar { animation: fadeInUp 0.8s ease-out 0.4s backwards; }
                    
                    /* Adjust quick links grid for smaller screens */
                    .quick-links-grid {
                        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                        gap: 16px;
                    }
                }

                @media (max-width: 480px) {
                    .dashboard-hero {
                        padding: 16px; /* Further reduced padding */
                        border-radius: 16px;
                        gap: 16px;
                    }
                    .hero-welcome .badge {
                        font-size: 10px;
                        padding: 4px 8px;
                    }
                    .hero-welcome h1 {
                        font-size: 18px; /* Further reduced */
                    }
                    .section-title {
                        font-size: 1.1rem;
                    }
                    .action-card {
                        padding: 16px;
                    }
                    .action-icon {
                        width: 48px;
                        height: 48px;
                        font-size: 24px;
                    }
                }

                /* Recent Downloads Premium Styles */
                .sidebar-card {
                    background: white;
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    margin-bottom: 24px;
                }

                .sidebar-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                }

                .sidebar-card h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                /* Block Wrapper */
                .blurred {
                    filter: blur(5px);
                    pointer-events: none;
                    user-select: none;
                    opacity: 0.5;
                    transition: all 0.3s ease;
                }

                .profile-incomplete-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 50;
                    height: 80vh; /* Approximate height of view */
                }

                .incomplete-card {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
                    max-width: 500px;
                    animation: fadeInUp 0.5s ease-out;
                    border: 1px solid #e2e8f0;
                }

                .warning-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }

                .incomplete-card h2 {
                    color: #1e293b;
                    margin-bottom: 16px;
                    font-size: 1.8rem;
                }

                .incomplete-card p {
                    color: #64748b;
                    margin-bottom: 32px;
                    line-height: 1.6;
                    font-size: 1.1rem;
                }

                .btn-complete-profile {
                    background: #0047AB;
                    color: white;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.3);
                }

                .btn-complete-profile:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 71, 171, 0.4);
                    background: #1e40af;
                }

                .downloads-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .download-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px;
                    border-radius: 16px;
                    background: #f8fafc;
                    border: 1px solid transparent;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    animation: slideInRight 0.5s ease backwards;
                }

                .download-item:nth-child(1) { animation-delay: 0.1s; }
                .download-item:nth-child(2) { animation-delay: 0.2s; }
                .download-item:nth-child(3) { animation-delay: 0.3s; }
                .download-item:nth-child(4) { animation-delay: 0.4s; }
                .download-item:nth-child(5) { animation-delay: 0.5s; }

                .download-item:hover {
                    background: #eff6ff;
                    border-color: rgba(59, 130, 246, 0.3);
                    transform: translateX(5px) scale(1.02);
                    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.1);
                }

                .download-icon {
                    width: 42px;
                    height: 42px;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, color 0.3s ease;
                    color: #64748b;
                }

                .download-item:hover .download-icon {
                    transform: scale(1.15) rotate(-8deg);
                    background: #3b82f6;
                    color: white;
                }

                .download-info {
                    flex: 1;
                    min-width: 0;
                }

                .download-title {
                    font-weight: 600;
                    color: #334155;
                    font-size: 0.9rem;
                    margin-bottom: 2px;
                    transition: color 0.2s ease;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .download-item:hover .download-title {
                    color: #1d4ed8;
                }

                .download-meta {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    display: block;
                }
            `}</style>

        </div>
    );
};

export default Dashboard;
