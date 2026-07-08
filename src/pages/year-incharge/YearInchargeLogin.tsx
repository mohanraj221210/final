import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import SEO from '../../components/SEO';
import { Activity, Ticket, GraduationCap, ClipboardList, Lock, Building2, Globe } from 'lucide-react';


/* ─────────────────────────────────────────────────────────────────────────────
   BACKGROUND CANVAS  — flowing light waves + floating dots
───────────────────────────────────────────────────────────────────────────── */
const BgCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.2 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      t += 0.008;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#FEF3E2');
      bg.addColorStop(0.45, '#FDE8C8');
      bg.addColorStop(1, '#FDD9A8');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const glows = [
        { x: W * 0.15, y: H * 0.3, r: W * 0.45, c: 'rgba(251,191,36,0.18)' },
        { x: W * 0.75, y: H * 0.2, r: W * 0.38, c: 'rgba(245,158,11,0.12)' },
        { x: W * 0.55, y: H * 0.75, r: W * 0.40, c: 'rgba(253,230,138,0.22)' },
        { x: W * 0.9,  y: H * 0.6,  r: W * 0.30, c: 'rgba(217,119,6,0.08)'  },
      ];
      glows.forEach(g => {
        const rg = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
        rg.addColorStop(0, g.c);
        rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
      });

      const waves = [
        { amp: H * 0.18, freq: 1.2, yBase: H * 0.28, speed: 0.6, alpha: 0.40, width: 3.5 },
        { amp: H * 0.12, freq: 0.8, yBase: H * 0.50, speed: 0.4, alpha: 0.30, width: 2.5 },
        { amp: H * 0.20, freq: 1.5, yBase: H * 0.68, speed: 0.9, alpha: 0.25, width: 2.0 },
        { amp: H * 0.10, freq: 2.0, yBase: H * 0.15, speed: 0.5, alpha: 0.18, width: 1.5 },
        { amp: H * 0.16, freq: 0.9, yBase: H * 0.85, speed: 0.7, alpha: 0.22, width: 2.0 },
      ];
      waves.forEach(w => {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
          const y = w.yBase + Math.sin((x / W) * Math.PI * 2 * w.freq + t * w.speed) * w.amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(0.3, `rgba(255,255,255,${w.alpha})`);
        grad.addColorStop(0.7, `rgba(251,191,36,${w.alpha * 0.9})`);
        grad.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = w.width;
        ctx.stroke();
      });

      const spheres = [
        { x: W * 0.08, y: H * 0.12, r: 55 },
        { x: W * 0.92, y: H * 0.08, r: 38 },
        { x: W * 0.04, y: H * 0.72, r: 42 },
        { x: W * 0.88, y: H * 0.80, r: 65 },
        { x: W * 0.50, y: H * 0.92, r: 30 },
      ];
      spheres.forEach(s => {
        const rg = ctx.createRadialGradient(s.x - s.r * 0.3, s.y - s.r * 0.3, s.r * 0.05, s.x, s.y, s.r);
        rg.addColorStop(0, 'rgba(255,255,255,0.55)');
        rg.addColorStop(0.6, 'rgba(253,230,138,0.20)');
        rg.addColorStop(1, 'rgba(251,191,36,0.08)');
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = rg;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      pts.forEach(p => {
        const pulse = (Math.sin(t * 2 + p.pulse) + 1) / 2;
        const alpha = p.a * (0.6 + pulse * 0.4);
        const r = p.r * (0.85 + pulse * 0.3);
        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        rg.addColorStop(0, `rgba(251,191,36,${alpha * 0.6})`);
        rg.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = rg;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0 }} aria-hidden="true" />;
};

/* ─────────────────────────────────────────────────────────────────────────────
   YEAR INCHARGE LOGIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const YearInchargeLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    if (Loading) return;
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/incharge/login`, { email, password });
      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", "year-incharge");
        setShowToast(true);
        setSuccessAnim(true);
        setTimeout(() => { navigate("/year-incharge-dashboard"); }, 1500);
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setLoading(false);
      if (error.response) {
        const status = error.response.status;
        if (status === 400) toast.error("Missing email or password");
        else if (status === 401) toast.error("Invalid email or password");
        else if (status === 404) toast.error("User not found");
        else toast.error("Login failed. Try again.");
      } else {
        toast.error("Server not reachable");
      }
    }
  };

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 700);
  };

  const featureCards = [
    { icon: <Activity size={24} />, label: 'Year\nDashboard' },
    { icon: <Ticket size={24} />, label: 'Outpass\nApprovals' },
    { icon: <GraduationCap size={24} />, label: 'Student\nOversight' },
    { icon: <ClipboardList size={24} />, label: 'Academic\nReports' },
  ];

  const footerItems = [
    { icon: <Lock size={20} />, title: 'Secure & Protected', sub: 'Role-based access control' },
    { icon: <Building2 size={20} />, title: 'Administrative Portal', sub: 'Year-level management' },
    { icon: <Globe size={20} />, title: 'Always Accessible', sub: 'Anytime, Anywhere' },
  ];


  return (
    <div className={`yi-root ${mounted ? 'yi-mounted' : ''} ${successAnim ? 'yi-success-zoom' : ''}`}>
      <SEO
        title="Year Incharge Login"
        description="Year Incharge portal login for JIT Permigo academic management system."
        canonical="/year-incharge-login"
        noIndex
      />
      <ToastContainer />
      {showToast && (
        <Toast message="Login successful! Redirecting..." type="success" onClose={() => setShowToast(false)} />
      )}

      {/* Animated background */}
      <BgCanvas />

      {/* Success sweep */}
      {successAnim && <div className="yi-sweep" />}

      {/* ══ MAIN LAYOUT ══ */}
      <div className="yi-layout">

        {/* ── LEFT PANEL ── */}
        <aside className="yi-left">

          {/* Brand */}
          <div className="yi-brand">
            <div className="yi-brand-logo">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="9" fill="url(#yiBrandGrad)" />
                <path d="M9 26L18 10L27 26H9Z" fill="white" fillOpacity="0.96" />
                <rect x="14.5" y="20" width="7" height="6" rx="2" fill="url(#yiBrandGrad2)" />
                <defs>
                  <linearGradient id="yiBrandGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D97706" /><stop offset="1" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id="yiBrandGrad2" x1="0" y1="0" x2="7" y2="6" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#B45309" /><stop offset="1" stopColor="#D97706" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="yi-brand-text">
                <span className="yi-brand-jit">JIT</span>
                <span className="yi-brand-campus">PERMIGO</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="yi-heading-block">
            <h1 className="yi-h1">Welcome Back!</h1>
            <p className="yi-h1-amber">Year Incharge Portal</p>
            <p className="yi-desc">
              Oversee student activities,<br />
              approve outpasses and manage<br />
              academic year operations.
            </p>
          </div>

          {/* Feature cards */}
          <div className="yi-features">
            {featureCards.map((fc, i) => (
              <div className="yi-feat-card" key={i} style={{ animationDelay: `${120 + i * 80}ms` }}>
                <span className="yi-feat-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{fc.icon}</span>
                <span className="yi-feat-label">{fc.label}</span>
              </div>
            ))}

          </div>

          {/* Quote card */}
          <div className="yi-quote-card">
            <div className="yi-quote-mark">"</div>
            <p className="yi-quote-text">
              Leadership is not about being in charge.<br />
              It is about taking care of those in your charge.
            </p>
            <p className="yi-quote-attr">— Simon Sinek</p>
          </div>

        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className="yi-right">

          {/* Mobile brand */}
          <div className="yi-mobile-brand">
            <div className="yi-brand-logo">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="9" fill="url(#yiBrandGradMob)" />
                <path d="M9 26L18 10L27 26H9Z" fill="white" fillOpacity="0.96" />
                <rect x="14.5" y="20" width="7" height="6" rx="2" fill="url(#yiBrandGrad2Mob)" />
                <defs>
                  <linearGradient id="yiBrandGradMob" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D97706" /><stop offset="1" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id="yiBrandGrad2Mob" x1="0" y1="0" x2="7" y2="6" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#B45309" /><stop offset="1" stopColor="#D97706" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="yi-brand-text">
                <span className="yi-brand-jit">JIT</span>
                <span className="yi-brand-campus">PERMIGO</span>
              </div>
            </div>
          </div>

          {/* Back button */}
          <button className="yi-back-btn" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>

          {/* Floating logo */}
          <div className="yi-float-logo">
            <div className="yi-float-logo-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
          </div>

          {/* Glass card */}
          <div className={`yi-card ${successAnim ? 'yi-card-success' : ''}`}>
            <div className="yi-card-shine" aria-hidden="true" />

            <div className="yi-card-head">
              <h2 className="yi-card-title">Year Incharge Login</h2>
              <p className="yi-card-sub">Sign in to your administrative account</p>
            </div>

            <form onSubmit={handleSubmit} className="yi-form" noValidate>

              {/* Email */}
              <div className="yi-field-group yi-fd1">
                <label className="yi-field-label" htmlFor="yi-email">Email Address</label>
                <div className="yi-input-box">
                  <span className="yi-iicon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="yi-email"
                    className="yi-input"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="yi-field-group yi-fd2">
                <label className="yi-field-label" htmlFor="yi-password">Password</label>
                <div className="yi-input-box">
                  <span className="yi-iicon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="yi-password"
                    className="yi-input"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="yi-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Options row */}
              <div className="yi-options yi-fd3">
                <label className="yi-remember">
                  <span
                    className={`yi-checkbox ${rememberMe ? 'checked' : ''}`}
                    onClick={() => setRememberMe(!rememberMe)}
                    role="checkbox"
                    aria-checked={rememberMe}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setRememberMe(!rememberMe)}
                  >
                    {rememberMe && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                    )}
                  </span>
                  <span className="yi-remember-text">Remember me</span>
                </label>
                <a
                  href="#forgot"
                  className="yi-forgot"
                  onClick={e => {
                    e.preventDefault();
                    toast.info("Please contact the system administrator to reset your password.", { position: "top-center" });
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`yi-btn yi-fd4 ${successAnim ? 'yi-btn-success' : ''}`}
                disabled={Loading || successAnim}
                id="yi-submit-btn"
                onClick={addRipple}
              >
                {ripples.map(r => (
                  <span key={r.id} className="yi-ripple" style={{ left: r.x, top: r.y }} />
                ))}
                {successAnim ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="yi-check-icon">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Access Granted
                  </>
                ) : Loading ? (
                  <><span className="yi-spinner" /> Signing in...</>
                ) : (
                  <>Log In <span className="yi-btn-arrow">→</span></>
                )}
              </button>

            </form>
          </div>

        </main>
      </div>

      {/* ── FOOTER STRIP ── */}
      <footer className="yi-footer">
        {footerItems.map((fi, i) => (
          <div className="yi-footer-item" key={i}>
            <span className="yi-footer-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{fi.icon}</span>
            <div className="yi-footer-text">
              <span className="yi-footer-title">{fi.title}</span>
              <span className="yi-footer-sub">{fi.sub}</span>
            </div>
          </div>
        ))}

      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .yi-root *, .yi-root *::before, .yi-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .yi-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          height: 100vh; height: 100dvh;
          -webkit-font-smoothing: antialiased;
          position: relative;
          overflow: hidden;
        }

        .yi-success-zoom { animation: yiSuccessZoom 1.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes yiSuccessZoom {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
          100% { filter: brightness(1.3); }
        }

        .yi-sweep {
          position: fixed; inset: 0; z-index: 998; pointer-events: none;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%);
          animation: yiSweep 0.8s ease forwards;
        }
        @keyframes yiSweep {
          from { transform: translateX(-120%); }
          to   { transform: translateX(120%); }
        }

        /* ── Layout ── */
        .yi-layout {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: 45% 55%;
          min-height: calc(100vh - 72px);
          padding: 0 32px;
          gap: 0;
          align-items: center;
        }

        /* ── LEFT PANEL ── */
        .yi-left {
          padding: 52px 40px 52px 32px;
          display: flex; flex-direction: column; gap: 32px;
          opacity: 0; transform: translateX(-36px);
          animation: yiSlideL 0.85s cubic-bezier(0.16,1,0.3,1) 0.1s forwards;
        }
        @keyframes yiSlideL { to { opacity: 1; transform: translateX(0); } }

        .yi-brand-logo { display: inline-flex; align-items: center; gap: 12px; }
        .yi-brand-text { display: flex; flex-direction: column; gap: 1px; }
        .yi-brand-jit { font-size: 28px; font-weight: 900; color: #B45309; letter-spacing: -1px; line-height: 1; }
        .yi-brand-campus { font-size: 9px; font-weight: 700; color: #78716C; letter-spacing: 2.5px; text-transform: uppercase; }

        .yi-heading-block { display: flex; flex-direction: column; gap: 10px; }
        .yi-h1 { font-size: clamp(32px, 3.4vw, 48px); font-weight: 900; color: #1C1917; letter-spacing: -1.5px; line-height: 1.1; }
        .yi-h1-amber {
          font-size: clamp(28px, 3.0vw, 42px); font-weight: 900;
          background: linear-gradient(135deg, #D97706 0%, #FBBF24 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; letter-spacing: -1.2px; line-height: 1.1;
        }
        .yi-desc { font-size: 14.5px; color: #57534E; line-height: 1.75; max-width: 340px; margin-top: 4px; }

        .yi-features { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        .yi-feat-card {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 14px 8px;
          background: rgba(255,255,255,0.60);
          border: 1px solid rgba(255,255,255,0.80);
          border-radius: 16px;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 16px rgba(217,119,6,0.08), 0 1px 3px rgba(0,0,0,0.04);
          cursor: default;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
          opacity: 0; animation: yiFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
          text-align: center;
        }
        .yi-feat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(217,119,6,0.16), 0 0 0 1px rgba(217,119,6,0.12);
        }
        @keyframes yiFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .yi-feat-icon { font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
        .yi-feat-label { font-size: 11px; font-weight: 600; color: #44403C; white-space: pre-line; line-height: 1.4; text-align: center; }

        .yi-quote-card {
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 20px;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          padding: 20px 22px 18px;
          box-shadow: 0 4px 20px rgba(217,119,6,0.08);
          max-width: 340px;
          position: relative; overflow: hidden;
        }
        .yi-quote-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%);
          border-radius: 20px; pointer-events: none;
        }
        .yi-quote-mark { font-size: 36px; font-weight: 900; color: #D97706; line-height: 0.7; margin-bottom: 10px; font-family: Georgia, serif; }
        .yi-quote-text { font-size: 13px; color: #44403C; line-height: 1.65; font-style: italic; margin-bottom: 10px; }
        .yi-quote-attr { font-size: 12px; font-weight: 600; color: #78716C; }

        /* ── RIGHT PANEL ── */
        .yi-right {
          display: flex; flex-direction: column; align-items: center;
          padding: 40px 32px 40px 20px;
          opacity: 0; transform: translateX(36px);
          animation: yiSlideR 0.85s cubic-bezier(0.16,1,0.3,1) 0.15s forwards;
        }
        @keyframes yiSlideR { to { opacity: 1; transform: translateX(0); } }

        .yi-back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(217,119,6,0.2);
          color: #92400E;
          font-size: 13px; font-weight: 600;
          padding: 9px 18px; border-radius: 100px; cursor: pointer;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          align-self: flex-start; margin-bottom: 12px; font-family: inherit;
          box-shadow: 0 4px 12px rgba(217,119,6,0.06);
        }
        .yi-back-btn:hover {
          background: rgba(255,255,255,0.88);
          border-color: rgba(217,119,6,0.4);
          transform: translateX(-3px);
          box-shadow: 0 6px 16px rgba(217,119,6,0.12);
        }

        .yi-mobile-brand { display: none; }

        /* Floating logo */
        .yi-float-logo {
          position: relative; margin-bottom: -28px; z-index: 2;
          animation: yiFloatBob 3.5s ease-in-out infinite;
        }
        @keyframes yiFloatBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .yi-float-logo-inner {
          width: 72px; height: 72px; border-radius: 22px;
          background: linear-gradient(135deg, #D97706, #FBBF24);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 12px 32px rgba(217,119,6,0.40),
            0 0 0 8px rgba(217,119,6,0.10),
            inset 0 1px 0 rgba(255,255,255,0.4);
        }

        /* Glass card */
        .yi-card {
          width: 100%; max-width: 440px;
          background: rgba(255,255,255,0.80);
          border-radius: 32px;
          padding: 44px 36px 32px;
          position: relative; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.6) inset,
            0 8px 40px rgba(217,119,6,0.12),
            0 24px 64px rgba(0,0,0,0.08),
            0 2px 4px rgba(0,0,0,0.04);
          backdrop-filter: blur(25px) saturate(180%);
          -webkit-backdrop-filter: blur(25px) saturate(180%);
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease;
        }
        .yi-card.yi-card-success {
          transform: scale(0.98);
          box-shadow: 0 0 0 2px rgba(34,197,94,0.4) inset, 0 12px 40px rgba(34,197,94,0.18);
        }
        .yi-card-shine {
          position: absolute; top: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.30) 0%, transparent 100%);
          border-radius: 32px 32px 0 0; pointer-events: none;
        }

        .yi-card-head { text-align: center; margin-bottom: 28px; }
        .yi-card-title { font-size: 24px; font-weight: 800; color: #1C1917; letter-spacing: -0.5px; margin-bottom: 6px; }
        .yi-card-sub { font-size: 13.5px; color: #78716C; }

        .yi-form { display: flex; flex-direction: column; gap: 16px; }
        .yi-field-group { display: flex; flex-direction: column; gap: 6px; }
        .yi-field-label { font-size: 13px; font-weight: 600; color: #44403C; padding-left: 2px; }

        .yi-input-box { position: relative; display: flex; align-items: center; }
        .yi-input {
          width: 100%; height: 50px;
          padding: 0 44px 0 44px;
          font-size: 14px; font-family: inherit; font-weight: 500; color: #1C1917;
          background: rgba(255,251,245,0.90);
          border: 1.5px solid rgba(214,211,208,0.7);
          border-radius: 12px; outline: none;
          transition: border-color 0.28s ease, box-shadow 0.28s ease, background 0.28s ease;
          -webkit-appearance: none;
        }
        .yi-input:-webkit-autofill,
        .yi-input:-webkit-autofill:hover, 
        .yi-input:-webkit-autofill:focus, 
        .yi-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #fffbf5 inset !important;
          -webkit-text-fill-color: #1C1917 !important;
          caret-color: #1C1917;
          transition: background-color 5000s ease-in-out 0s;
        }
        .yi-input::placeholder { color: #A8A29E; font-weight: 400; }
        .yi-input:hover { border-color: rgba(217,119,6,0.35); background: rgba(255,255,255,0.95); }
        .yi-input:focus {
          border-color: #D97706;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(217,119,6,0.12), 0 2px 8px rgba(217,119,6,0.06);
        }

        .yi-iicon {
          position: absolute; left: 14px;
          color: #A8A29E; display: flex; align-items: center; pointer-events: none;
          transition: color 0.25s;
        }
        .yi-input-box:focus-within .yi-iicon { color: #D97706; }

        .yi-eye {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          color: #A8A29E; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; transition: color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .yi-eye:hover { color: #D97706; background: rgba(217,119,6,0.07); }

        .yi-options { display: flex; align-items: center; justify-content: space-between; }
        .yi-remember { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .yi-checkbox {
          width: 16px; height: 16px; border-radius: 4px;
          border: 1.5px solid #D6D3D1;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; flex-shrink: 0; background: white;
        }
        .yi-checkbox.checked { background: #D97706; border-color: #D97706; }
        .yi-remember-text { font-size: 13px; font-weight: 500; color: #57534E; }
        .yi-forgot { font-size: 13px; font-weight: 600; color: #D97706; text-decoration: none; transition: opacity 0.2s; }
        .yi-forgot:hover { opacity: 0.75; }

        /* Submit button */
        .yi-btn {
          width: 100%; height: 52px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 16px; font-weight: 700; font-family: inherit;
          color: white;
          background: linear-gradient(135deg, #D97706 0%, #FBBF24 100%);
          border: none; border-radius: 14px; cursor: pointer;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 18px rgba(217,119,6,0.42), inset 0 1px 0 rgba(255,255,255,0.18);
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
          letter-spacing: 0.1px;
        }
        .yi-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-120%);
          transition: transform 0.7s ease;
        }
        .yi-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(217,119,6,0.52), inset 0 1px 0 rgba(255,255,255,0.22);
        }
        .yi-btn:hover:not(:disabled)::before { transform: translateX(120%); }
        .yi-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
        .yi-btn:disabled { opacity: 0.82; cursor: not-allowed; }
        .yi-btn-arrow { font-size: 18px; }

        .yi-btn.yi-btn-success {
          background: linear-gradient(135deg, #22C55E, #16A34A);
          box-shadow: 0 4px 24px rgba(34,197,94,0.42);
        }
        .yi-check-icon { animation: yiCheckPop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes yiCheckPop { from { transform: scale(0) rotate(-15deg); } to { transform: scale(1) rotate(0); } }

        .yi-ripple {
          position: absolute; width: 4px; height: 4px; border-radius: 50%;
          background: rgba(255,255,255,0.55);
          transform: translate(-50%, -50%) scale(0);
          animation: yiRipple 0.7s ease-out forwards;
          pointer-events: none;
        }
        @keyframes yiRipple { to { transform: translate(-50%, -50%) scale(60); opacity: 0; } }

        .yi-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: yiSpin 0.65s linear infinite;
        }
        @keyframes yiSpin { to { transform: rotate(360deg); } }

        /* Staggered animations */
        .yi-fd1, .yi-fd2, .yi-fd3, .yi-fd4 {
          opacity: 0; animation: yiFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .yi-fd1 { animation-delay: 500ms; }
        .yi-fd2 { animation-delay: 600ms; }
        .yi-fd3 { animation-delay: 700ms; }
        .yi-fd4 { animation-delay: 800ms; }

        /* ── FOOTER STRIP ── */
        .yi-footer {
          position: relative; z-index: 2;
          height: 72px;
          display: flex; align-items: center; justify-content: center; gap: 56px;
          background: rgba(255,255,255,0.55);
          border-top: 1px solid rgba(255,255,255,0.75);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          padding: 0 32px;
          opacity: 0;
          animation: yiFadeUp 0.7s ease 1.2s forwards;
        }
        .yi-footer-item { display: flex; align-items: center; gap: 10px; }
        .yi-footer-icon { font-size: 20px; }
        .yi-footer-text { display: flex; flex-direction: column; gap: 1px; }
        .yi-footer-title { font-size: 13px; font-weight: 700; color: #78350F; }
        .yi-footer-sub { font-size: 11px; color: #78716C; font-weight: 500; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .yi-layout { grid-template-columns: 42% 58%; padding: 0 20px; }
          .yi-left { padding: 40px 24px 40px 16px; }
          .yi-right { padding: 32px 16px 32px 8px; }
        }

        @media (max-width: 860px) {
          .yi-layout { grid-template-columns: 1fr; padding: 0 16px; height: 100%; align-items: center; }
          .yi-left { display: none !important; }
          .yi-footer { display: none !important; }
          .yi-mobile-brand { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; width: 100%; }
          .yi-right { padding: 5px 16px 16px; order: 1; width: 100%; display: flex; flex-direction: column; align-items: center; }
          .yi-float-logo { margin-bottom: -24px; }
          .yi-card { max-width: 100%; }
        }

        @media (max-width: 520px) {
          .yi-card { padding: 38px 22px 28px; border-radius: 24px; }
          .yi-input { height: 48px; }
          .yi-btn { height: 50px; }
          .yi-footer { gap: 16px; padding: 0 16px; }
          .yi-footer-item:last-child { display: none; }
        }

        @media (max-width: 380px) {
          .yi-card { padding: 32px 16px 24px; }
          .yi-card-title { font-size: 21px; }
        }
      `}</style>
    </div>
  );
};

export default YearInchargeLogin;
