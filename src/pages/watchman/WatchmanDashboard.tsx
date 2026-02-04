import React from 'react';
import Nav from '../../components/WatchmanNav'; // Import WatchmanNav (Security Nav)
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';


interface User {
    name: string;
    email: string;
    phone: string;
    photo: string;
}

const WatchmanDashboard: React.FC = () => {
    const [Loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState<Partial<User>>({
        name: "",
        email: "",
        phone: "",
        photo: "",
    });
    const navigate = useNavigate();
    const [zoomingPath, setZoomingPath] = React.useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchUserData = async () => {
            // Fallback or actual API call if needed
            const token = localStorage.getItem('token');
            if (!token) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/watchman/profile`, {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                });
                if (response.status == 200 && isMounted) {
                    setUser(response.data.watchman);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Failed to fetch user data');
                    // Optional: Only show toast if it's a critical error or not just a cancellation
                    toast.error('Failed to fetch user data');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchUserData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleQuickAction = (path: string) => {
        setZoomingPath(path);
        setTimeout(() => {
            navigate(path);
        }, 700);
    };

    if (Loading) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <div className="page-container dashboard-page">
            <Nav />
            <ToastContainer />
            <div className="content-wrapper">
                {/* Hero Section */}
                <div className="dashboard-hero">
                    <div className="hero-welcome">
                        <div>
                            <span className="badge">Welcome Back</span>
                        </div>
                        <div>
                            <h1 style={{ color: 'skyblue' }}>Hello, {user.name}! 👋</h1>
                            <p style={{ color: 'skyblue' }}>
                                Security
                            </p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-layout">
                    {/* Main Content */}
                    <div className="main-content">
                        {/* Quick Actions */}
                        <section className="section">
                            <h2 className="section-title">Quick Actions</h2>
                            <div className="quick-links-grid">

                                {/* Outpass List */}
                                <div
                                    className={`action-card ${zoomingPath === '/watchman/outpass-list' ? 'zooming' : ''}`}
                                    onClick={() => handleQuickAction('/watchman/outpass-list')}
                                >
                                    <span className="action-icon">✅</span>
                                    <span className="action-text">Outpass List</span>
                                </div>

                            </div>

                        </section>
                    </div>
                </div>

            </div>


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
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 24px;
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
                    box-shadow: 0 20px 40px rgba(30, 58, 138, 0.15); /* More subtle, colored shadow */
                    border-color: rgba(30, 58, 138, 0.1);
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

                /* Keyframes */
                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
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
                /* Loading Animation */
                .loading-center {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    width: 100%;
                }
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .loading-bar {
                    width: 200px;
                    height: 6px;
                    background: #e2e8f0;
                    border-radius: 99px;
                    overflow: hidden;
                    position: relative;
                }
                .loading-progress {
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(90deg, #2563eb, #3b82f6);
                    border-radius: 99px;
                    position: absolute;
                    animation: shimmer 1.5s infinite linear;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
};

export default WatchmanDashboard;
