import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <nav className="landing-nav container">
                <div className="brand">
                    <span className="icon">🎓</span>
                    <span className="text">JIT Portal</span>
                </div>
                <button className="btn btn-secondary login-nav-btn" onClick={() => navigate('/login')}>
                    Login
                </button>
            </nav>

            <main className="hero-section">
                <div className="container hero-content">
                    <div className="hero-text fade-in-up">
                        <span className="badge badge-glow">JIT Student Portal</span>
                        <h1 className="hero-title">
                            Your Academic Journey,<br />
                            <span className="text-gradient">Elevated.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Seamlessly access your subjects, track your performance, and stay connected with your faculty. The future of academic management is here.
                        </p>
                        <div className="hero-actions">
                            <button className="btn btn-primary btn-lg glow-effect" onClick={() => navigate('/login')}>
                                Get Started <span className="arrow-icon">→</span>
                            </button>
                            {/* <button className="btn btn-ghost btn-lg text-white-hover">
                                Explore Features
                            </button> */}
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item fade-delay-1">
                                <strong>1000+</strong>
                                <span>Students</span>
                            </div>
                            <div className="stat-separator"></div>
                            <div className="stat-item fade-delay-2">
                                <strong>50+</strong>
                                <span>Faculty</span>
                            </div>
                            <div className="stat-separator"></div>
                            <div className="stat-item fade-delay-3">
                                <strong>100%</strong>
                                <span>Digital</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual fade-in">
                        <div className="visual-card main-card floating-card">
                            <img src="/main.jpg" alt="JIT Campus" className="hero-img" />
                            <div className="hero-overlay">
                                <div className="overlay-content">
                                    <span className="campus-badge">Jeppiaar Institute of Technology</span>
                                    <div className="pulse-indicator">
                                        <span className="ping"></span>
                                        <span className="dot"></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="visual-card float-card card-1 float-animation-1">
                            <span className="float-icon">📊</span>
                            <div className="float-content">
                                <strong>Crack sem</strong>
                                <span>Track Subjects</span>
                            </div>
                        </div>

                        <div className="visual-card float-card card-2 float-animation-2">
                            <span className="float-icon">📚</span>
                            <div className="float-content">
                                <strong>Connect with Faculty</strong>
                                <span>Ask doubts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
          color: white;
          overflow-x: hidden;
          position: relative;
        }

        .landing-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(30, 64, 175, 0.2) 0%, transparent 50%);
          pointer-events: none;
        }

        .landing-nav {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 10;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 24px;
          color: white;
          letter-spacing: -0.5px;
        }

        .login-nav-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .login-nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: white;
        }

        .hero-section {
          padding: 40px 0 80px;
          min-height: calc(100vh - 140px);
          display: flex;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hero-text {
          max-width: 600px;
        }

        .badge-glow {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
          display: inline-block;
          margin-bottom: 24px;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        .hero-title {
          background: linear-gradient(135deg, #609eebff 0%, #8a6ee7ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 64px;
          margin-bottom: 24px;
          line-height: 1.1;
          font-weight: 800;
        }

        .text-gradient {
          background: linear-gradient(135deg, #609eebff 0%, #8a6ee7ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 18px;
          color: #94a3b8;
          margin-bottom: 40px;
          line-height: 1.6;
          max-width: 500px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
        }

        .btn-lg {
          padding: 16px 36px;
          font-size: 16px;
          border-radius: 12px;
        }

        .glow-effect {
          box-shadow: 0 0 20px rgba(37, 99, 235, 0.5);
          transition: all 0.3s ease;
        }

        .glow-effect:hover {
          box-shadow: 0 0 30px rgba(37, 99, 235, 0.7);
          transform: translateY(-2px);
        }

        .text-white-hover:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }

        .arrow-icon {
          display: inline-block;
          margin-left: 8px;
          transition: transform 0.3s ease;
        }

        .btn:hover .arrow-icon {
          transform: translateX(4px);
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 24px;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-item strong {
          font-size: 28px;
          color: white;
          font-weight: 700;
        }

        .stat-item span {
          color: #94a3b8;
          font-size: 14px;
        }

        .stat-separator {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.1);
        }

        .hero-visual {
          position: relative;
          perspective: 1000px;
        }

        .main-card {
          width: 100%;
          height: 450px;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255,255,255,0.1);
          transform: rotateY(-5deg) rotateX(2deg);
          transition: transform 0.5s ease;
        }

        .hero-visual:hover .main-card {
          transform: rotateY(0) rotateX(0);
        }

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .campus-badge {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .pulse-indicator {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          position: relative;
          z-index: 2;
        }

        .ping {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #22c55e;
          opacity: 0.75;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .float-card {
          position: absolute;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(12px);
          padding: 16px 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          z-index: 2;
          width: 220px;
        }

        .card-1 {
          top: 40px;
          right: -40px;
        }

        .card-2 {
          bottom: 60px;
          left: -40px;
        }

        .float-icon {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .float-content strong {
          display: block;
          font-size: 14px;
          color: white;
          margin-bottom: 2px;
        }

        .float-content span {
          display: block;
          font-size: 12px;
          color: #94a3b8;
        }

        /* Animations */
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .fade-in {
          animation: fadeIn 1s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .float-animation-1 { animation: float 6s ease-in-out infinite; }
        .float-animation-2 { animation: float 7s ease-in-out infinite reverse; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        .features-scroll {
          position: absolute;
          bottom: 0px;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(5px);
          padding: 20px;
          display: flex;
          justify-content: center;
          gap: 24px;
          color: #94a3b8;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .separator { color: rgba(255,255,255,0.2); }

        /* Responsive */
        @media (max-width: 968px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-text { margin: 0 auto; }
          .hero-title { font-size: 42px; }
          .hero-subtitle { margin: 0 auto 32px; }
          .hero-actions { justify-content: center; }
          .hero-stats { justify-content: center; border-top-color: rgba(255,255,255,0.1); }
          
          .hero-visual {
            display: none; /* Hide complex visual on mobile for simple impactful view */
          }
          
          .card-1, .card-2 { display: none; }
        }
      `}</style>
        </div>
    );
};

export default Welcome;
