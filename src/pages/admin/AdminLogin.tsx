import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
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
            const response = await axios.post(`${API_URL}/admin/login`, {
                email,
                password
            });

            if (response.status === 200) {
                const token = response.data.token;

                // ✅ Save login data
                localStorage.setItem("token", token);
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userType", "admin");

                setShowToast(true);

                // Redirect to home/welcome since no Admin Dashboard exists
                setTimeout(() => {
                    navigate("/");
                }, 1500);
            }
        } catch (error: any) {
            console.error("Login error:", error);

            if (error.response) {
                const status = error.response.status;

                if (status === 400) {
                    toast.error("Missing email or password", { position: "bottom-right", autoClose: 5000 });
                } else if (status === 401) {
                    toast.error("Invalid email or password", { position: "bottom-right", autoClose: 5000 });
                } else if (status === 404) {
                    toast.error("Admin not found", { position: "bottom-right", autoClose: 5000 });
                } else {
                    toast.error("Login failed. Try again.", { position: "bottom-right", autoClose: 5000 });
                }
            } else {
                toast.error("Server not reachable", { position: "bottom-right", autoClose: 5000 });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <ToastContainer />
            {showToast && (
                <Toast
                    message="Admin login successful!"
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="login-container">
                <button className="back-home-btn" onClick={() => navigate('/')}>
                    ← Back to Welcome
                </button>
                <div className="login-card admin-theme">

                    <div className="login-header">
                        <div className="logo-circle admin-logo">🛡️</div>
                        <h1>Admin Login</h1>
                        <p className="auth-subtitle">
                            Enter your credentials specifically for admin access
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="email"
                                    className="input floating-input"
                                    placeholder=" "
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="email">Admin Email</label>
                                <span className="input-icon">✉️</span>
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

                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
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

        .login-card.admin-theme {
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(203, 213, 225, 0.6));
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

        .logo-circle.admin-logo {
          background: linear-gradient(135deg, #475569, #1e293b);
          box-shadow: 0 10px 25px -5px rgba(30, 41, 59, 0.3);
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
          border-color: #475569;
          box-shadow: 0 0 0 4px rgba(71, 85, 105, 0.1);
        }

        .floating-input:focus ~ label,
        .floating-input:not(:placeholder-shown) ~ label {
          transform: translateY(-14px) scale(0.85);
          color: #475569;
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
          color: #475569;
        }

        .btn-block {
          width: 100%;
          height: 56px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #475569, #1e293b);
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
          box-shadow: 0 10px 20px -5px rgba(30, 41, 59, 0.4);
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

        @media (max-width: 480px) {
          .login-header {
            padding: 24px 20px 0;
          }
          .login-form {
            padding: 0 20px 32px;
          }
          .login-card {
            border-radius: 16px;
          }
          .login-header h1 {
            font-size: 22px;
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

export default AdminLogin;
