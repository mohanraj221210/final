import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";

/* ─────────────────────────────────────────────────────────────────────────────
   BACKGROUND CANVAS  — flowing light waves + floating dots (warden teal theme)
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

    // Particles
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

      // Base gradient — soft teal/green tint
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#E6F7F4');
      bg.addColorStop(0.45, '#D1F0E8');
      bg.addColorStop(1, '#C3EBE0');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Soft ambient glows
      const glows = [
        { x: W * 0.15, y: H * 0.3,  r: W * 0.45, c: 'rgba(52,211,153,0.22)' },
        { x: W * 0.75, y: H * 0.2,  r: W * 0.38, c: 'rgba(16,185,129,0.14)' },
        { x: W * 0.55, y: H * 0.75, r: W * 0.40, c: 'rgba(167,243,208,0.28)' },
        { x: W * 0.9,  y: H * 0.6,  r: W * 0.30, c: 'rgba(5,150,105,0.09)' },
      ];
      glows.forEach(g => {
        const rg = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
        rg.addColorStop(0, g.c);
        rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
      });

      // Flowing curved light trails
      const waves = [
        { amp: H * 0.18, freq: 1.2, yBase: H * 0.28, speed: 0.6, alpha: 0.50, width: 3.5 },
        { amp: H * 0.12, freq: 0.8, yBase: H * 0.50, speed: 0.4, alpha: 0.38, width: 2.5 },
        { amp: H * 0.20, freq: 1.5, yBase: H * 0.68, speed: 0.9, alpha: 0.30, width: 2.0 },
        { amp: H * 0.10, freq: 2.0, yBase: H * 0.15, speed: 0.5, alpha: 0.22, width: 1.5 },
        { amp: H * 0.16, freq: 0.9, yBase: H * 0.85, speed: 0.7, alpha: 0.28, width: 2.0 },
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
        grad.addColorStop(0.7, `rgba(52,211,153,${w.alpha * 0.9})`);
        grad.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = w.width;
        ctx.stroke();
      });

      // Glass spheres
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
        rg.addColorStop(0.6, 'rgba(167,243,208,0.20)');
        rg.addColorStop(1, 'rgba(52,211,153,0.08)');
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = rg;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Glowing particles / dots
      pts.forEach(p => {
        const pulse = (Math.sin(t * 2 + p.pulse) + 1) / 2;
        const alpha = p.a * (0.6 + pulse * 0.4);
        const r = p.r * (0.85 + pulse * 0.3);

        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        rg.addColorStop(0, `rgba(52,211,153,${alpha * 0.6})`);
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
   WARDEN LOGIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const Wardenlogin: React.FC = () => {
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

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/warden/login`, { email, password });

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", "warden");

        setShowToast(true);
        setSuccessAnim(true);

        setTimeout(() => {
          navigate("/warden-dashboard");
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
          toast.error("Warden not found", { position: "bottom-right", autoClose: 5000 });
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

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 700);
  };

  const featureCards = [
    { icon: '🏠', label: 'Hostel\nManagement' },
    { icon: '🎫', label: 'Outpass\nApproval' },
    { icon: '👥', label: 'Student\nOversight' },
    { icon: '🛡️', label: 'Campus\nSecurity' },
  ];

  const footerItems = [
    { icon: '🔒', title: 'Secure & Protected', sub: 'Your data is safe with us' },
    { icon: '🛡️', title: 'Warden Access Only', sub: 'Authorized personnel' },
    { icon: '🌍', title: 'Always Accessible', sub: 'Anytime, Anywhere' },
  ];

  return (
    <div className={`wlp-root ${mounted ? 'wlp-mounted' : ''} ${successAnim ? 'wlp-success-zoom' : ''}`}>
      <ToastContainer />
      {showToast && (
        <Toast
          message="Warden login successful! Redirecting..."
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Animated background */}
      <BgCanvas />

      {/* Success sweep */}
      {successAnim && <div className="wlp-sweep" />}

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN LAYOUT
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="wlp-layout">

        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <aside className="wlp-left">

          {/* JIT Logo wordmark */}
          <div className="wlp-brand">
            <div className="wlp-brand-logo">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="9" fill="url(#wlpBrandGrad)" />
                <path d="M9 26L18 10L27 26H9Z" fill="white" fillOpacity="0.96" />
                <rect x="14.5" y="20" width="7" height="6" rx="2" fill="url(#wlpBrandGrad2)" />
                <defs>
                  <linearGradient id="wlpBrandGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#059669" /><stop offset="1" stopColor="#34D399" />
                  </linearGradient>
                  <linearGradient id="wlpBrandGrad2" x1="0" y1="0" x2="7" y2="6" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#047857" /><stop offset="1" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="wlp-brand-text">
                <span className="wlp-brand-jit">JIT</span>
                <span className="wlp-brand-campus">PERMIGO</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="wlp-heading-block">
            <h1 className="wlp-h1">Welcome Back!</h1>
            <p className="wlp-h1-green">Warden Portal</p>
            <p className="wlp-desc">
              Manage hostel residents,<br />
              approve outpass requests, monitor<br />
              student welfare and campus access.
            </p>
          </div>

          {/* Feature cards row */}
          <div className="wlp-features">
            {featureCards.map((fc, i) => (
              <div className="wlp-feat-card" key={i} style={{ animationDelay: `${120 + i * 80}ms` }}>
                <span className="wlp-feat-icon">{fc.icon}</span>
                <span className="wlp-feat-label">{fc.label}</span>
              </div>
            ))}
          </div>

          {/* Quote card */}
          <div className="wlp-quote-card">
            <div className="wlp-quote-mark">"</div>
            <p className="wlp-quote-text">
              The strength of the team is each<br />
              individual member. The strength of<br />
              each member is the team.
            </p>
            <p className="wlp-quote-attr">— Phil Jackson</p>
          </div>

        </aside>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <main className="wlp-right">

          {/* Mobile Brand Header */}
          <div className="wlp-mobile-brand">
            <div className="wlp-brand-logo">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="9" fill="url(#wlpBrandGradM)" />
                <path d="M9 26L18 10L27 26H9Z" fill="white" fillOpacity="0.96" />
                <rect x="14.5" y="20" width="7" height="6" rx="2" fill="url(#wlpBrandGrad2M)" />
                <defs>
                  <linearGradient id="wlpBrandGradM" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#059669" /><stop offset="1" stopColor="#34D399" />
                  </linearGradient>
                  <linearGradient id="wlpBrandGrad2M" x1="0" y1="0" x2="7" y2="6" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#047857" /><stop offset="1" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="wlp-brand-text">
                <span className="wlp-brand-jit">JIT</span>
                <span className="wlp-brand-campus">PERMIGO</span>
              </div>
            </div>
          </div>

          {/* Back button */}
          <button className="wlp-back-btn" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>

          {/* Floating 3D logo above card */}
          <div className="wlp-float-logo">
            <div className="wlp-float-logo-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          </div>

          {/* Glass card */}
          <div className={`wlp-card ${successAnim ? 'wlp-card-success' : ''}`}>
            {/* Inner shine */}
            <div className="wlp-card-shine" aria-hidden="true" />

            {/* Card heading */}
            <div className="wlp-card-head">
              <h2 className="wlp-card-title">Warden Login</h2>
              <p className="wlp-card-sub">Sign in to your warden account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="wlp-form" noValidate>

              {/* Email */}
              <div className="wlp-field-group wlp-fd1">
                <label className="wlp-field-label" htmlFor="warden-email">Email Address</label>
                <div className="wlp-input-box">
                  <span className="wlp-iicon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="warden-email"
                    className="wlp-input"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="wlp-field-group wlp-fd2">
                <label className="wlp-field-label" htmlFor="warden-password">Password</label>
                <div className="wlp-input-box">
                  <span className="wlp-iicon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="warden-password"
                    className="wlp-input"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="wlp-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Options row */}
              <div className="wlp-options wlp-fd3">
                <label className="wlp-remember">
                  <span
                    className={`wlp-checkbox ${rememberMe ? 'checked' : ''}`}
                    onClick={() => setRememberMe(!rememberMe)}
                    role="checkbox"
                    aria-checked={rememberMe}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setRememberMe(!rememberMe)}
                  >
                    {rememberMe && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3"/>
                      </svg>
                    )}
                  </span>
                  <span className="wlp-remember-text">Remember me</span>
                </label>
                <a
                  href="#forgot"
                  className="wlp-forgot"
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
                className={`wlp-btn wlp-fd4 ${successAnim ? 'wlp-btn-success' : ''}`}
                disabled={Loading || successAnim}
                id="warden-submit-btn"
                onClick={addRipple}
              >
                {ripples.map(r => (
                  <span key={r.id} className="wlp-ripple" style={{ left: r.x, top: r.y }} />
                ))}
                {successAnim ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="wlp-check-icon">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Access Granted
                  </>
                ) : Loading ? (
                  <><span className="wlp-spinner" /> Signing in...</>
                ) : (
                  <>Sign In <span className="wlp-btn-arrow">→</span></>
                )}
              </button>

            </form>
          </div>{/* /wlp-card */}

        </main>
      </div>

      {/* ── FOOTER STRIP ──────────────────────────────────────────────────── */}
      <footer className="wlp-footer">
        {footerItems.map((fi, i) => (
          <div className="wlp-footer-item" key={i}>
            <span className="wlp-footer-icon">{fi.icon}</span>
            <div className="wlp-footer-text">
              <span className="wlp-footer-title">{fi.title}</span>
              <span className="wlp-footer-sub">{fi.sub}</span>
            </div>
          </div>
        ))}
      </footer>

      {/* ════════════════════════════════════════════════════════════════════
          STYLES
      ════════════════════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .wlp-root *, .wlp-root *::before, .wlp-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        /* ── Root ── */
        .wlp-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          position: relative;
          overflow: hidden;
        }

        /* Success zoom */
        .wlp-success-zoom { animation: wlpSuccessZoom 1.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes wlpSuccessZoom {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.12); }
          100% { filter: brightness(1.28); }
        }

        /* Light sweep */
        .wlp-sweep {
          position: fixed; inset: 0; z-index: 998; pointer-events: none;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%);
          animation: wlpSweep 0.8s ease forwards;
        }
        @keyframes wlpSweep {
          from { transform: translateX(-120%); }
          to   { transform: translateX(120%); }
        }

        /* ── Layout ── */
        .wlp-layout {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: 45% 55%;
          min-height: calc(100vh - 72px);
          padding: 0 32px;
          gap: 0;
          align-items: center;
        }

        /* ═══════════════════════════════════════════════════════════════════
           LEFT PANEL
        ═══════════════════════════════════════════════════════════════════ */
        .wlp-left {
          padding: 52px 40px 52px 32px;
          display: flex; flex-direction: column; gap: 32px;
          opacity: 0; transform: translateX(-36px);
          animation: wlpSlideL 0.85s cubic-bezier(0.16,1,0.3,1) 0.1s forwards;
        }
        @keyframes wlpSlideL {
          to { opacity: 1; transform: translateX(0); }
        }

        /* Brand */
        .wlp-brand-logo {
          display: inline-flex; align-items: center; gap: 12px;
        }
        .wlp-brand-text {
          display: flex; flex-direction: column; gap: 1px;
        }
        .wlp-brand-jit {
          font-size: 28px; font-weight: 900; color: #065F46;
          letter-spacing: -1px; line-height: 1;
        }
        .wlp-brand-campus {
          font-size: 9px; font-weight: 700; color: #64748B;
          letter-spacing: 2.5px; text-transform: uppercase;
        }

        /* Heading */
        .wlp-heading-block { display: flex; flex-direction: column; gap: 10px; }
        .wlp-h1 {
          font-size: clamp(32px, 3.4vw, 48px);
          font-weight: 900; color: #0F172A;
          letter-spacing: -1.5px; line-height: 1.1;
        }
        .wlp-h1-green {
          font-size: clamp(28px, 3.0vw, 42px);
          font-weight: 900;
          background: linear-gradient(135deg, #059669 0%, #34D399 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1.2px; line-height: 1.1;
        }
        .wlp-desc {
          font-size: 14.5px; color: #475569;
          line-height: 1.75; max-width: 340px;
          margin-top: 4px;
        }

        /* Feature cards */
        .wlp-features {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 10px;
        }
        .wlp-feat-card {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 14px 8px;
          background: rgba(255,255,255,0.60);
          border: 1px solid rgba(255,255,255,0.80);
          border-radius: 16px;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 16px rgba(5,150,105,0.07), 0 1px 3px rgba(0,0,0,0.04);
          cursor: default;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
          opacity: 0; animation: wlpFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
          text-align: center;
        }
        .wlp-feat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(5,150,105,0.14), 0 0 0 1px rgba(5,150,105,0.1);
        }
        @keyframes wlpFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wlp-feat-icon { font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
        .wlp-feat-label {
          font-size: 11px; font-weight: 600; color: #334155;
          white-space: pre-line; line-height: 1.4;
          text-align: center;
        }

        /* Quote card */
        .wlp-quote-card {
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 20px;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          padding: 20px 22px 18px;
          box-shadow: 0 4px 20px rgba(5,150,105,0.08);
          max-width: 340px;
          position: relative; overflow: hidden;
        }
        .wlp-quote-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%);
          border-radius: 20px; pointer-events: none;
        }
        .wlp-quote-mark {
          font-size: 36px; font-weight: 900; color: #10B981;
          line-height: 0.7; margin-bottom: 10px;
          font-family: Georgia, serif;
        }
        .wlp-quote-text {
          font-size: 13px; color: #334155; line-height: 1.65;
          font-style: italic; margin-bottom: 10px;
        }
        .wlp-quote-attr {
          font-size: 12px; font-weight: 600; color: #64748B;
        }

        /* ═══════════════════════════════════════════════════════════════════
           RIGHT PANEL
        ═══════════════════════════════════════════════════════════════════ */
        .wlp-right {
          display: flex; flex-direction: column; align-items: center;
          padding: 40px 32px 40px 20px;
          opacity: 0; transform: translateX(36px);
          animation: wlpSlideR 0.85s cubic-bezier(0.16,1,0.3,1) 0.15s forwards;
        }
        @keyframes wlpSlideR {
          to { opacity: 1; transform: translateX(0); }
        }

        .wlp-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(5, 150, 105, 0.2);
          color: #065F46;
          font-size: 13px;
          font-weight: 600;
          padding: 9px 18px;
          border-radius: 100px;
          cursor: pointer;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          align-self: flex-start;
          margin-bottom: 12px;
          font-family: inherit;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.05);
        }
        .wlp-back-btn:hover {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(5, 150, 105, 0.4);
          transform: translateX(-3px);
          box-shadow: 0 6px 16px rgba(5, 150, 105, 0.1);
        }

        .wlp-mobile-brand {
          display: none;
        }

        /* Floating logo above card */
        .wlp-float-logo {
          position: relative;
          margin-bottom: -28px;
          z-index: 2;
          animation: wlpFloatBob 3.5s ease-in-out infinite;
        }
        @keyframes wlpFloatBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .wlp-float-logo-inner {
          width: 72px; height: 72px; border-radius: 22px;
          background: linear-gradient(135deg, #059669, #34D399);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 12px 32px rgba(5,150,105,0.40),
            0 0 0 8px rgba(5,150,105,0.10),
            inset 0 1px 0 rgba(255,255,255,0.4);
        }

        /* Glass card */
        .wlp-card {
          width: 100%; max-width: 440px;
          background: rgba(255,255,255,0.80);
          border-radius: 32px;
          padding: 44px 36px 32px;
          position: relative; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.6) inset,
            0 8px 40px rgba(5,150,105,0.12),
            0 24px 64px rgba(0,0,0,0.08),
            0 2px 4px rgba(0,0,0,0.04);
          backdrop-filter: blur(25px) saturate(180%);
          -webkit-backdrop-filter: blur(25px) saturate(180%);
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease;
        }
        .wlp-card.wlp-card-success {
          transform: scale(0.98);
          box-shadow: 0 0 0 2px rgba(34,197,94,0.4) inset, 0 12px 40px rgba(34,197,94,0.18);
        }
        .wlp-card-shine {
          position: absolute; top: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.30) 0%, transparent 100%);
          border-radius: 32px 32px 0 0; pointer-events: none;
        }

        /* Card head */
        .wlp-card-head { text-align: center; margin-bottom: 28px; }
        .wlp-card-title {
          font-size: 24px; font-weight: 800; color: #0F172A;
          letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .wlp-card-sub { font-size: 13.5px; color: #64748B; }

        /* Form */
        .wlp-form { display: flex; flex-direction: column; gap: 16px; }

        /* Field group */
        .wlp-field-group { display: flex; flex-direction: column; gap: 6px; }
        .wlp-field-label {
          font-size: 13px; font-weight: 600; color: #334155;
          padding-left: 2px;
        }

        /* Input box */
        .wlp-input-box {
          position: relative; display: flex; align-items: center;
        }
        .wlp-input {
          width: 100%; height: 50px;
          padding: 0 44px 0 44px;
          font-size: 14px; font-family: inherit; font-weight: 500;
          color: #0F172A;
          background: rgba(240,253,244,0.90);
          border: 1.5px solid rgba(167,243,208,0.8);
          border-radius: 12px; outline: none;
          transition: border-color 0.28s ease, box-shadow 0.28s ease, background 0.28s ease;
          -webkit-appearance: none;
        }
        .wlp-input::placeholder { color: #94A3B8; font-weight: 400; }
        .wlp-input:hover {
          border-color: rgba(5,150,105,0.4);
          background: rgba(255,255,255,0.95);
        }
        .wlp-input:focus {
          border-color: #10B981;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(16,185,129,0.12), 0 2px 8px rgba(16,185,129,0.06);
        }

        /* Input icon */
        .wlp-iicon {
          position: absolute; left: 14px;
          color: #94A3B8; display: flex; align-items: center; pointer-events: none;
          transition: color 0.25s;
        }
        .wlp-input-box:focus-within .wlp-iicon { color: #10B981; }

        /* Eye button */
        .wlp-eye {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          color: #94A3B8; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; transition: color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .wlp-eye:hover { color: #10B981; background: rgba(16,185,129,0.07); }

        /* Options row */
        .wlp-options {
          display: flex; align-items: center; justify-content: space-between;
        }
        .wlp-remember { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .wlp-checkbox {
          width: 16px; height: 16px; border-radius: 4px;
          border: 1.5px solid #CBD5E1;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
          flex-shrink: 0; background: white;
        }
        .wlp-checkbox.checked {
          background: #10B981; border-color: #10B981;
        }
        .wlp-remember-text { font-size: 13px; font-weight: 500; color: #475569; }
        .wlp-forgot {
          font-size: 13px; font-weight: 600; color: #059669;
          text-decoration: none; transition: opacity 0.2s;
        }
        .wlp-forgot:hover { opacity: 0.75; }

        /* Submit button */
        .wlp-btn {
          width: 100%; height: 52px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 16px; font-weight: 700; font-family: inherit;
          color: white;
          background: linear-gradient(135deg, #059669 0%, #34D399 100%);
          border: none; border-radius: 14px; cursor: pointer;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 18px rgba(5,150,105,0.42), inset 0 1px 0 rgba(255,255,255,0.18);
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
          letter-spacing: 0.1px;
        }
        .wlp-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-120%);
          transition: transform 0.7s ease;
        }
        .wlp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(5,150,105,0.52), inset 0 1px 0 rgba(255,255,255,0.22);
        }
        .wlp-btn:hover:not(:disabled)::before { transform: translateX(120%); }
        .wlp-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
        .wlp-btn:disabled { opacity: 0.82; cursor: not-allowed; }
        .wlp-btn-arrow { font-size: 18px; }

        .wlp-btn.wlp-btn-success {
          background: linear-gradient(135deg, #22C55E, #16A34A);
          box-shadow: 0 4px 24px rgba(34,197,94,0.42);
        }
        .wlp-check-icon { animation: wlpCheckPop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes wlpCheckPop { from { transform: scale(0) rotate(-15deg); } to { transform: scale(1) rotate(0); } }

        /* Ripple */
        .wlp-ripple {
          position: absolute; width: 4px; height: 4px; border-radius: 50%;
          background: rgba(255,255,255,0.55);
          transform: translate(-50%, -50%) scale(0);
          animation: wlpRipple 0.7s ease-out forwards;
          pointer-events: none;
        }
        @keyframes wlpRipple { to { transform: translate(-50%, -50%) scale(60); opacity: 0; } }

        /* Spinner */
        .wlp-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: wlpSpin 0.65s linear infinite;
        }
        @keyframes wlpSpin { to { transform: rotate(360deg); } }

        /* Staggered field animations */
        .wlp-fd1, .wlp-fd2, .wlp-fd3, .wlp-fd4 {
          opacity: 0; animation: wlpFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .wlp-fd1 { animation-delay: 500ms; }
        .wlp-fd2 { animation-delay: 600ms; }
        .wlp-fd3 { animation-delay: 700ms; }
        .wlp-fd4 { animation-delay: 800ms; }

        /* ═══════════════════════════════════════════════════════════════════
           FOOTER STRIP
        ═══════════════════════════════════════════════════════════════════ */
        .wlp-footer {
          position: relative; z-index: 2;
          height: 72px;
          display: flex; align-items: center; justify-content: center; gap: 56px;
          background: rgba(255,255,255,0.55);
          border-top: 1px solid rgba(255,255,255,0.75);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          padding: 0 32px;
          opacity: 0;
          animation: wlpFadeUp 0.7s ease 1.2s forwards;
        }
        .wlp-footer-item { display: flex; align-items: center; gap: 10px; }
        .wlp-footer-icon { font-size: 20px; }
        .wlp-footer-text { display: flex; flex-direction: column; gap: 1px; }
        .wlp-footer-title { font-size: 13px; font-weight: 700; color: #065F46; }
        .wlp-footer-sub { font-size: 11px; color: #64748B; font-weight: 500; }

        /* ═══════════════════════════════════════════════════════════════════
           RESPONSIVE
        ═══════════════════════════════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .wlp-layout { grid-template-columns: 42% 58%; padding: 0 20px; }
          .wlp-left { padding: 40px 24px 40px 16px; }
          .wlp-right { padding: 32px 16px 32px 8px; }
        }

        @media (max-width: 860px) {
          .wlp-layout {
            grid-template-columns: 1fr;
            padding: 0 16px;
            min-height: 100vh;
            align-items: center;
          }
          .wlp-left {
            display: none !important;
          }
          .wlp-footer {
            display: none !important;
          }
          .wlp-mobile-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            width: 100%;
          }
          .wlp-right {
            padding: 32px 16px 16px;
            order: 1;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .wlp-float-logo { margin-bottom: -24px; }
          .wlp-card { max-width: 100%; }
        }

        @media (max-width: 520px) {
          .wlp-card { padding: 38px 22px 28px; border-radius: 24px; }
          .wlp-input { height: 48px; }
          .wlp-btn { height: 50px; }
          .wlp-footer { gap: 16px; padding: 0 16px; }
          .wlp-footer-item:last-child { display: none; }
        }

        @media (max-width: 380px) {
          .wlp-card { padding: 32px 16px 24px; }
          .wlp-card-title { font-size: 21px; }
        }
      `}</style>

    </div>
  );
};

export default Wardenlogin;
