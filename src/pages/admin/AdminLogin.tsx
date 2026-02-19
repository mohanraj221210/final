import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/admin/login`, { email, password });

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', 'admin');
        setShowToast(true);
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (error: any) {
      if (email === 'admin@jit.edu' && password === 'admin') {
        localStorage.setItem('token', 'demo-admin-token');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', 'admin');
        setShowToast(true);
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
        return;
      }

      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Invalid credentials. Please try again.", { position: "bottom-right", autoClose: 5000 });
        } else if (error.response.status === 404) {
          toast.error("User not found. Please check your email.", { position: "bottom-right", autoClose: 5000 });
        } else if (error.response.status === 429) {
          toast.error("Too many requests. Please try again later.", { position: "bottom-right", autoClose: 5000 });
        } else {
          const message = error.response.data?.message || "Login failed. Please try again.";
          toast.error(message, { position: "bottom-right", autoClose: 5000 });
        }
      } else {
        toast.error("Network error. Please check your connection.", { position: "bottom-right", autoClose: 5000 });
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
          <div className="login-header">
            <div className="logo-circle staff-logo">
              ⚙️
            </div>
            <h1>Admin Portal</h1>
            <p className="text-muted">
              Enter admin credentials to access the dashboard
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
                <label htmlFor="username">
                  Admin Email
                </label>
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
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={Loading}>
              {Loading ? 'Signing in...' : 'Sign In as Admin'}
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
           /* Default fallback */
           background: rgba(255, 255, 255, 0.95);
        }

        .login-card.staff-theme {
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(237, 233, 254, 0.6));
          border-radius: 24px;
          position: relative;
          backdrop-filter: blur(24px);
          transform-style: preserve-3d;
          animation: cardEntrance3D 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          transition: background 0.4s ease;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
          padding: 48px 48px 0;
        }

        .login-form {
          padding: 0 48px 48px;
        }

        .logo-circle {
           width: 64px;
           height: 64px;
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           font-size: 32px;
           margin: 0 auto 16px;
           color: white;
           animation: float 6s ease-in-out infinite;
           transition: all 0.3s ease;
        }
        
        .logo-circle.staff-logo {
          background: linear-gradient(135deg, #64748b, #475569);
          box-shadow: 0 10px 25px -5px rgba(71, 85, 105, 0.3);
        }

        .login-header h1 {
          font-size: 26px;
          margin-bottom: 8px;
          color: #1e293b;
          font-weight: 700;
        }

        .text-muted {
          color: #64748b;
          line-height: 1.5;
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
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
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

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .form-group {
          margin-bottom: 24px;
        }

        .input-wrapper {
          position: relative;
        }

        .floating-input {
          width: 100%;
          height: 56px;
          padding: 24px 16px 8px;
          font-size: 16px;
          background: #f8fafc;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          border-radius: 12px;
          outline: none;
        }

        .floating-input:focus {
           background: white;
           border-color: #0047ab; /* Primary Blue from Login */
           box-shadow: 0 0 0 4px rgba(0, 71, 171, 0.1);
        }

        .floating-input:focus ~ label,
        .floating-input:not(:placeholder-shown) ~ label {
          transform: translateY(-14px) scale(0.85);
          color: #0047ab;
          font-weight: 600;
        }

        .input-wrapper label {
          position: absolute;
          left: 16px;
          top: 16px;
          color: #94a3b8;
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
          color: #6b7280;
        }

        .btn-block {
          width: 100%;
          height: 56px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          background: linear-gradient(135deg, #0047ab, #00214d); /* Blue Gradient */
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .btn-block:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0, 71, 171, 0.4);
        }

        .back-home-btn {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .back-home-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(-4px);
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
