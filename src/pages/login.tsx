import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";

interface LoginProps {
  initialType?: 'student' | 'staff';
}

const Login: React.FC<LoginProps> = ({ initialType = 'student' }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loginType] = useState<'student' | 'staff'>(initialType);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = loginType === 'student' ? '/api/login' : '/staff/login';
      const response = await axios.post(`${API_URL}${endpoint}`, { email, password });

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', loginType);
        setShowToast(true);
        // toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          if (loginType === 'staff') {
            navigate('/staff-dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 1500);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Invalid credentials. Please try again.", { position: "bottom-right", autoClose: 5000 });
      } else if (error.response?.status === 404) {
        toast.error("User not found. Please check your email.", { position: "bottom-right", autoClose: 5000 });
      } else {
        toast.error("Something went wrong. Please try again later.", { position: "bottom-right", autoClose: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const isStudent = loginType === 'student';
  const roleLabel = isStudent ? 'Student' : 'Staff';
  const roleDesc = isStudent ? 'Sign in to access your student profile & dashboard' : 'Enter your faculty credentials to access the portal';
  const emailLabel = isStudent ? 'Email / Student ID' : 'Staff Email / ID';
  const submitLabel = isStudent ? 'Sign In' : 'Sign In as Staff';

  const RoleIcon = () => isStudent ? (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ) : (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  return (
    <div className="llp-root">
      <ToastContainer />
      {showToast && (
        <Toast
          message="Login successful! Redirecting..."
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* ── Background image ── */}
      <div className="llp-bg" aria-hidden="true">
        <img src="/gate.jpg" alt="" className="llp-bg-img" />
        <div className="llp-bg-overlay" />
      </div>

      {/* ── Split layout ── */}
      <div className="llp-split">

        {/* LEFT PANEL */}
        <div className="llp-left">
          <div className="llp-left-content">

            {/* Logo */}
            <div className="llp-logo-row">
              <div className="llp-logo-icon">
                <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                  <rect width="36" height="36" rx="10" fill="url(#llpLogoGrad)" />
                  <path d="M9 26L18 10L27 26H9Z" fill="white" fillOpacity="0.95" />
                  <rect x="15" y="20" width="6" height="6" rx="2" fill="url(#llpLogoGrad)" />
                  <defs>
                    <linearGradient id="llpLogoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2563EB" />
                      <stop offset="1" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="llp-logo-text">
                <span className="llp-logo-name">JIT Campus One</span>
                <span className="llp-logo-inst">Jeppiaar Institute of Technology</span>
              </div>
            </div>

            {/* Headline */}
            <div className="llp-left-headline">
              <div className="llp-eyebrow">
                <span className="llp-eyebrow-bar" />
                Secure Digital Campus Access
              </div>
              <h1 className="llp-h1">
                Welcome to<br />
                <span className="llp-h1-gold">Campus One</span>
              </h1>
              <p className="llp-left-desc">
                A unified digital ecosystem connecting every member of the Jeppiaar Institute community.
              </p>
            </div>

            {/* Trust badges */}
            <div className="llp-trust-list">
              {[
                { icon: '✓', text: 'Secure Authentication' },
                { icon: '✓', text: 'Campus Authorized Access' },
                { icon: '✓', text: 'Protected Student Data' },
              ].map((item) => (
                <div className="llp-trust-item" key={item.text}>
                  <div className="llp-trust-check">{item.icon}</div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Stats strip */}
            <div className="llp-stats-strip">
              {[
                { v: '1000+', l: 'Students' },
                { v: '50+', l: 'Faculty' },
                { v: '8', l: 'Departments' },
              ].map((s) => (
                <div className="llp-stat" key={s.l}>
                  <span className="llp-stat-val">{s.v}</span>
                  <span className="llp-stat-lbl">{s.l}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT PANEL — Login card */}
        <div className="llp-right">

          {/* Back button */}
          <button className="llp-back-btn" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Welcome
          </button>

          {/* Card */}
          <div className="llp-card">
            <div className="llp-card-shine" aria-hidden="true" />

            {/* Card Header */}
            <div className="llp-card-header">
              <div className="llp-role-badge">
                <div className="llp-role-icon">
                  <RoleIcon />
                </div>
              </div>
              <h2 className="llp-card-title">{roleLabel} Login</h2>
              <p className="llp-card-sub">{roleDesc}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="llp-form">

              {/* Email field */}
              <div className="llp-field">
                <div className="llp-input-wrap">
                  <span className="llp-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id={`${loginType}-email`}
                    className="llp-input"
                    placeholder=" "
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <label className="llp-label" htmlFor={`${loginType}-email`}>{emailLabel}</label>
                </div>
              </div>

              {/* Password field */}
              <div className="llp-field">
                <div className="llp-input-wrap">
                  <span className="llp-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id={`${loginType}-password`}
                    className="llp-input"
                    placeholder=" "
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <label className="llp-label" htmlFor={`${loginType}-password`}>Password</label>
                  <button
                    type="button"
                    className="llp-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="llp-field-footer">
                  <a
                    href="#forgot"
                    className="llp-forgot"
                    onClick={(e) => { e.preventDefault(); toast.info("Please contact your system administrator to reset your password.", { position: "top-center" }); }}
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="llp-submit-btn"
                disabled={Loading}
                id={`${loginType}-submit-btn`}
              >
                {Loading ? (
                  <>
                    <span className="llp-spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>{submitLabel}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

            </form>

            {/* Security indicators */}
            <div className="llp-security-row">
              <div className="llp-security-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>SSL Encrypted</span>
              </div>
              <div className="llp-security-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Verified Platform</span>
              </div>
              <div className="llp-security-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Data Protected</span>
              </div>
            </div>

          </div>

          <p className="llp-footer-note">© 2025 Jeppiaar Institute of Technology</p>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .llp-root *, .llp-root *::before, .llp-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .llp-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Background ── */
        .llp-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
        }

        .llp-bg-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          filter: contrast(1.06) saturate(1.1) brightness(0.7);
        }

        .llp-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(15,23,42,0.92) 0%,
            rgba(15,23,42,0.80) 50%,
            rgba(15,23,42,0.70) 100%
          );
        }

        /* ── Split layout ── */
        .llp-split {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }

        /* ── LEFT ── */
        .llp-left {
          display: flex;
          align-items: center;
          padding: 60px 48px 60px 56px;
        }

        .llp-left-content {
          max-width: 480px;
          animation: llpFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        @keyframes llpFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Logo */
        .llp-logo-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 56px;
        }

        .llp-logo-icon {
          width: 52px; height: 52px;
          filter: drop-shadow(0 4px 16px rgba(37,99,235,0.5));
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .llp-logo-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .llp-logo-name {
          font-size: 20px;
          font-weight: 900;
          color: #FFFFFF;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .llp-logo-inst {
          font-size: 11.5px;
          color: rgba(255,255,255,0.5);
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        /* Eyebrow */
        .llp-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 700;
          color: #D4A017;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .llp-eyebrow-bar {
          width: 28px;
          height: 2px;
          background: linear-gradient(90deg, #D4A017, transparent);
          border-radius: 2px;
          flex-shrink: 0;
        }

        .llp-h1 {
          font-size: clamp(34px, 3.5vw, 52px);
          font-weight: 900;
          color: #FFFFFF;
          line-height: 1.07;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }

        .llp-h1-gold {
          background: linear-gradient(135deg, #D4A017 0%, #F5C842 50%, #D4A017 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          animation: llpGoldShimmer 4s ease-in-out infinite;
        }

        @keyframes llpGoldShimmer {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }

        .llp-left-desc {
          font-size: 16px;
          color: rgba(255,255,255,0.60);
          line-height: 1.7;
          margin-bottom: 40px;
          max-width: 400px;
        }

        /* Trust list */
        .llp-trust-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 48px;
        }

        .llp-trust-item {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 14px;
          color: rgba(255,255,255,0.80);
          font-weight: 500;
        }

        .llp-trust-check {
          width: 26px; height: 26px;
          background: linear-gradient(135deg, #059669, #047857);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          font-weight: 800;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(5,150,105,0.4);
        }

        /* Stats strip */
        .llp-stats-strip {
          display: flex;
          gap: 0;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .llp-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-right: 24px;
        }

        .llp-stat + .llp-stat {
          padding-left: 24px;
          padding-right: 24px;
          border-left: 1px solid rgba(255,255,255,0.1);
        }

        .llp-stat:last-child {
          border-left: 1px solid rgba(255,255,255,0.1);
          padding-left: 24px;
          padding-right: 0;
        }

        .llp-stat-val {
          font-size: 26px;
          font-weight: 900;
          color: #FFFFFF;
          letter-spacing: -0.8px;
          line-height: 1;
        }

        .llp-stat-lbl {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          font-weight: 500;
        }

        /* ── RIGHT PANEL ── */
        .llp-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 48px 40px 48px;
          gap: 20px;
          animation: llpSlideIn 0.85s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        @keyframes llpSlideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Back button */
        .llp-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.80);
          font-size: 13px;
          font-weight: 600;
          padding: 9px 18px;
          border-radius: 100px;
          cursor: pointer;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
          align-self: flex-start;
          font-family: inherit;
        }

        .llp-back-btn:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.3);
          transform: translateX(-3px);
        }

        /* ── CARD ── */
        .llp-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.78);
          border-radius: 24px;
          padding: 40px 40px 32px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.55);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.2) inset,
            0 8px 32px rgba(0,0,0,0.22),
            0 32px 80px rgba(0,0,0,0.18),
            0 2px 4px rgba(0,0,0,0.08);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
        }

        /* Glass inner shine overlay */
        .llp-card-shine {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 50%;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.28) 0%,
            rgba(255,255,255,0.06) 60%,
            transparent 100%
          );
          border-radius: 24px 24px 0 0;
          pointer-events: none;
        }

        /* Card header */
        .llp-card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .llp-role-badge {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .llp-role-icon {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 8px 24px rgba(37,99,235,0.35),
            0 0 0 6px rgba(37,99,235,0.1);
        }

        .llp-card-title {
          font-size: 26px;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -0.6px;
          margin-bottom: 8px;
          line-height: 1.15;
        }

        .llp-card-sub {
          font-size: 14px;
          color: #64748B;
          line-height: 1.55;
        }

        /* Form */
        .llp-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 20px;
        }

        .llp-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Input wrap — floating label */
        .llp-input-wrap {
          position: relative;
        }

        .llp-input {
          width: 100%;
          height: 56px;
          padding: 22px 48px 8px 52px;
          font-size: 15px;
          font-family: inherit;
          font-weight: 500;
          color: #111827;
          background: rgba(255,255,255,0.60);
          border: 1.5px solid rgba(255,255,255,0.70);
          border-radius: 14px;
          outline: none;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition:
            border-color 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
          -webkit-appearance: none;
        }

        .llp-input:hover {
          border-color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.72);
        }

        .llp-input:focus {
          border-color: #2563EB;
          background: rgba(255,255,255,0.90);
          box-shadow:
            0 0 0 4px rgba(37,99,235,0.12),
            0 2px 8px rgba(37,99,235,0.08);
        }

        /* Floating label */
        .llp-label {
          position: absolute;
          left: 52px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 15px;
          font-weight: 500;
          color: #94A3B8;
          pointer-events: none;
          transform-origin: left top;
          transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
        }

        .llp-input:focus ~ .llp-label,
        .llp-input:not(:placeholder-shown) ~ .llp-label {
          top: 12px;
          transform: translateY(0) scale(0.80);
          color: #2563EB;
          font-weight: 700;
          font-size: 15px;
        }

        /* Left icon */
        .llp-input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.22s ease;
        }

        .llp-input-wrap:focus-within .llp-input-icon {
          color: #2563EB;
        }

        /* Eye button */
        .llp-eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94A3B8;
          width: 36px; height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: color 0.2s, background 0.2s;
          font-family: inherit;
        }

        .llp-eye-btn:hover {
          color: #2563EB;
          background: rgba(37,99,235,0.08);
        }

        .llp-eye-btn:active {
          transform: translateY(-50%) scale(0.9);
        }

        /* Field footer (forgot) */
        .llp-field-footer {
          display: flex;
          justify-content: flex-end;
          padding-right: 2px;
        }

        .llp-forgot {
          font-size: 12.5px;
          font-weight: 600;
          color: #2563EB;
          text-decoration: none;
          transition: color 0.2s;
        }

        .llp-forgot:hover {
          color: #1D4ED8;
          text-decoration: underline;
        }

        /* Submit button — Gold luxury */
        .llp-submit-btn {
          width: 100%;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          letter-spacing: 0.2px;
          color: #0F172A;
          background: linear-gradient(135deg, #D4A017 0%, #FBBF24 50%, #D4A017 100%);
          background-size: 200% 200%;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 4px 16px rgba(212,160,23,0.4),
            0 2px 4px rgba(212,160,23,0.2),
            inset 0 1px 0 rgba(255,255,255,0.3);
          transition:
            transform 0.22s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow 0.22s ease,
            background-position 0.5s ease;
        }

        .llp-submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .llp-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 8px 28px rgba(212,160,23,0.5),
            0 4px 12px rgba(212,160,23,0.3),
            inset 0 1px 0 rgba(255,255,255,0.35);
          background-position: 100% 0;
        }

        .llp-submit-btn:hover::before {
          transform: translateX(100%);
        }

        .llp-submit-btn:active {
          transform: translateY(0) scale(0.99);
        }

        .llp-submit-btn:disabled {
          opacity: 0.85;
          cursor: not-allowed;
          transform: none;
        }

        /* Spinner */
        .llp-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(15,23,42,0.25);
          border-top-color: #0F172A;
          border-radius: 50%;
          animation: llpSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes llpSpin {
          to { transform: rotate(360deg); }
        }

        /* Security indicators */
        .llp-security-row {
          display: flex;
          justify-content: center;
          gap: 20px;
          padding-top: 20px;
          border-top: 1px solid #F1F5F9;
          flex-wrap: wrap;
        }

        .llp-security-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #64748B;
          font-weight: 500;
        }

        /* Footer note */
        .llp-footer-note {
          font-size: 11.5px;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
          text-align: center;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .llp-split {
            grid-template-columns: 1fr;
          }

          .llp-left {
            display: none;
          }

          .llp-right {
            padding: 32px 24px;
            min-height: 100vh;
            justify-content: flex-start;
            padding-top: 48px;
          }

          .llp-back-btn {
            align-self: flex-start;
          }

          .llp-card {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .llp-right {
            padding: 24px 16px;
          }

          .llp-card {
            padding: 32px 24px 28px;
            border-radius: 20px;
          }

          .llp-card-title { font-size: 22px; }
          .llp-input { height: 52px; }
          .llp-submit-btn { height: 52px; }

          .llp-security-row {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
