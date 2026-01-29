import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import axios from 'axios';
import { toast } from "react-toastify";

const YearInchargeLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/incharge/login`, {
        email,
        password
      });

      if (response.status === 200) {
        const token = response.data.token;

        // ✅ Save login data
        localStorage.setItem("token", token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", "year-incharge");

        setShowToast(true);

        setTimeout(() => {
          navigate("/year-incharge-dashboard");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response) {
        const status = error.response.status;

        if (status === 400) {
          toast.error("Missing email or password");
        } else if (status === 401) {
          toast.error("Invalid email or password");
        } else if (status === 404) {
          toast.error("User not found");
        } else {
          toast.error("Login failed. Try again.");
        }
      } else {
        toast.error("Server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {showToast && (
        <Toast
          message="Login successful! Redirecting..."
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="login-container">
        <button className="back-home-btn" onClick={() => navigate('/')}>
          ← Back to Welcome
        </button>
        <div className="login-card staff-theme">

          {/* <div className="login-tabs">
                        <button type="button" className="tab-btn active">
                            Year Incharge
                        </button>
                    </div> */}

          <div className="login-header">
            <div className="logo-circle staff-logo">🎓</div>
            <h1>Year Incharge Login</h1>
            <p className="text-muted">
              Enter credentials to access dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  className="input floating-input"
                  placeholder=" "
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="username">Email ID</label>
                <span className="input-icon">👤</span>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="input floating-input"
                  placeholder=" "
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={Loading}>
              {Loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

        </div>
      </div>

      <style>{` 
      .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0, 71, 171, 0.9) 0%, rgba(0, 33, 77, 0.95) 100%), url('/src/assets/gate.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          padding: 20px;
          overflow: hidden;
        }

        .login-container {
          width: 100%;
          max-width: 440px;
          perspective: 2000px;
          z-index: 2;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.9);
          padding: 0;
          border-radius: 24px;
          position: relative;
          backdrop-filter: blur(24px);
          transform-style: preserve-3d;
          animation: cardEntrance3D 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          transition: background 0.4s ease;
        }

        .login-card.student-theme {
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(224, 242, 254, 0.6));
        }

        .login-card.staff-theme {
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(237, 233, 254, 0.6));
        }

        .login-tabs {
          display: flex;
          gap: 0;
          padding: 8px;
          background: #f1f5f9;
          border-radius: 24px 24px 0 0;
          position: relative;
          z-index: 10;
        }

        .tab-btn {
          flex: 1;
          padding: 14px 24px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          background: transparent;
          color: #3b6cb2ff;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          letter-spacing: 0.3px;
        }

        .tab-btn:hover {
          color: var(--primary);
        }

        .tab-btn:first-child:hover {
          color: var(--primary);
        }

        .tab-btn:last-child:hover {
          color: #5510cdff;
        }

        .tab-btn.active {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 11, 25, 0.15);
        }

        /* Student Login - Blue Theme */
        .tab-btn:first-child.active {
          color: var(--primary);
          background: linear-gradient(135deg, rgba(0, 71, 171, 0.05), rgba(0, 71, 171, 0.1));
          border: 2px solid rgba(0, 71, 171, 0.3);
        }

        /* Staff Login - Purple Theme */
        .tab-btn:last-child.active {
          color: #7c3aed;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(124, 58, 237, 0.1));
          border: 2px solid rgba(124, 58, 237, 0.3);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
          padding: 32px 48px 0;
        }

        .login-form {
          padding: 0 48px 48px;
        }

        /* Shimmering Border Effect */
        .login-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(
            45deg, 
            transparent, 
            rgba(255, 255, 255, 0.8), 
            transparent, 
            rgba(255, 255, 255, 0.6), 
            transparent
          );
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          background-size: 200% 200%;
          animation: borderShimmer 4s linear infinite;
          pointer-events: none;
        }

        /* Glassy Reflection */
        .login-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 45%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 55%
          );
          transform: rotate(30deg);
          animation: glossSweep 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes cardEntrance3D {
          0% { 
            opacity: 0; 
            transform: translateY(50px) rotateX(10deg) scale(0.9); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) rotateX(0deg) scale(1); 
            box-shadow: 0 30px 60px rgba(0, 71, 171, 0.3);
          }
        }

        @keyframes borderShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        @keyframes glossSweep {
          0%, 30% { transform: translateX(-100%) rotate(30deg); opacity: 0; }
          40% { opacity: 1; }
          50%, 100% { transform: translateX(100%) rotate(30deg); opacity: 0; }
        }

        .logo-circle {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--primary-light), white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 71, 171, 0.3);
          animation: float 6s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        .logo-circle.staff-logo {
          background: linear-gradient(135deg, #64748b, #475569);
          box-shadow: 0 10px 25px -5px rgba(71, 85, 105, 0.3);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .login-header h1 {
          font-size: 26px;
          margin-bottom: 8px;
          color: var(--primary-dark);
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .text-muted {
          color: var(--text-muted);
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 24px;
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .form-group:nth-child(1) { animation-delay: 0.2s; }
        .form-group:nth-child(2) { animation-delay: 0.3s; }

        .input-wrapper {
          position: relative;
          transition: all 0.3s ease;
        }

        .input-wrapper:focus-within {
          transform: translateY(-2px);
        }

        .floating-input {
          height: 56px;
          padding: 24px 16px 8px;
          font-size: 16px;
          background: #f8fafc;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          border-radius: 12px;
        }

        .floating-input:focus {
          background: white;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(0, 71, 171, 0.1);
        }

        .floating-input:focus ~ label,
        .floating-input:not(:placeholder-shown) ~ label {
          transform: translateY(-14px) scale(0.85);
          color: var(--primary);
          font-weight: 600;
        }

        .input-wrapper label {
          position: absolute;
          left: 16px;
          top: 16px;
          color: var(--text-muted);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          transform-origin: left top;
        }

        .input-icon, .input-icon-btn {
          position: absolute;
          right: 16px;
          top: 16px;
          font-size: 20px;
          opacity: 0.4;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s;
        }

        .input-icon-btn:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          font-size: 14px;
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards 0.4s;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .checkbox-label:hover {
          color: var(--primary);
        }

        .btn-block {
          width: 100%;
          height: 56px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          position: relative;
          overflow: hidden;
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards 0.5s;
        }

        .btn-block::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: 0.5s;
        }

        .btn-block:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0, 71, 171, 0.4);
        }

        .btn-block:hover::after {
          left: 100%;
        }

        .btn-block:active {
          transform: translateY(0);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .back-home-btn {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 16px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
        }

        .back-home-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(-4px);
        }

      `}</style>

    </div>
  );
};

export default YearInchargeLogin;
