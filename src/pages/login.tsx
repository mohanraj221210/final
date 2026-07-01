import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";

interface LoginProps {
  initialType?: 'student' | 'staff';
}

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

      // Base gradient
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#E8F1FD');
      bg.addColorStop(0.45, '#D6E8FB');
      bg.addColorStop(1, '#C8DFFA');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Soft ambient glows
      const glows = [
        { x: W * 0.15, y: H * 0.3, r: W * 0.45, c: 'rgba(147,197,253,0.28)' },
        { x: W * 0.75, y: H * 0.2, r: W * 0.38, c: 'rgba(96,165,250,0.18)' },
        { x: W * 0.55, y: H * 0.75, r: W * 0.40, c: 'rgba(191,219,254,0.30)' },
        { x: W * 0.9,  y: H * 0.6, r: W * 0.30, c: 'rgba(59,130,246,0.10)' },
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
        { amp: H * 0.18, freq: 1.2, yBase: H * 0.28, speed: 0.6, alpha: 0.55, width: 3.5 },
        { amp: H * 0.12, freq: 0.8, yBase: H * 0.50, speed: 0.4, alpha: 0.40, width: 2.5 },
        { amp: H * 0.20, freq: 1.5, yBase: H * 0.68, speed: 0.9, alpha: 0.35, width: 2.0 },
        { amp: H * 0.10, freq: 2.0, yBase: H * 0.15, speed: 0.5, alpha: 0.25, width: 1.5 },
        { amp: H * 0.16, freq: 0.9, yBase: H * 0.85, speed: 0.7, alpha: 0.30, width: 2.0 },
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
        grad.addColorStop(0.7, `rgba(147,197,253,${w.alpha * 0.9})`);
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
        rg.addColorStop(0.6, 'rgba(191,219,254,0.20)');
        rg.addColorStop(1, 'rgba(147,197,253,0.08)');
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

        // glow
        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        rg.addColorStop(0, `rgba(147,197,253,${alpha * 0.6})`);
        rg.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = rg;
        ctx.fill();

        // core
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
   LOGIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const Login: React.FC<LoginProps> = ({ initialType = 'student' }) => {
  // ── State (auth) — UNTOUCHED ──────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loginType] = useState<'student' | 'staff'>(initialType);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // ── State (UI only) ───────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  // ── Auth logic — UNCHANGED ────────────────────────────────────────────────
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
        setSuccessAnim(true);
        setTimeout(() => {
          if (loginType === 'staff') navigate('/staff-dashboard');
          else navigate('/dashboard');
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

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 700);
  };

  const featureCards = [
    { icon: '🏫', label: 'Academic\nDashboard' },
    { icon: '🎫', label: 'Digital\nOutpass' },
    { icon: '👩‍🏫', label: 'Faculty\nDirectory' },
    { icon: '🛡️', label: 'Campus\nServices' },
  ];

  const footerItems = [
    { icon: '🔒', title: 'Secure & Protected', sub: 'Your data is safe with us' },
    { icon: '👨‍🎓', title: 'Trusted by Students', sub: '1000+ active students' },
    { icon: '🌍', title: 'Always Accessible', sub: 'Anytime, Anywhere' },
  ];

  return (
    <div className={`lp-root ${mounted ? 'lp-mounted' : ''} ${successAnim ? 'lp-success-zoom' : ''}`}>
      <ToastContainer />
      {showToast && (
        <Toast message="Login successful! Redirecting..." type="success" onClose={() => setShowToast(false)} />
      )}

      {/* Animated background */}
      <BgCanvas />

      {/* Success sweep */}
      {successAnim && <div className="lp-sweep" />}

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN LAYOUT
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="lp-layout">

        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <aside className="lp-left">

          {/* JIT Logo wordmark */}
          <div className="lp-brand">
            <div className="lp-brand-logo">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="9" fill="url(#lpBrandGrad)" />
                <path d="M9 26L18 10L27 26H9Z" fill="white" fillOpacity="0.96" />
                <rect x="14.5" y="20" width="7" height="6" rx="2" fill="url(#lpBrandGrad2)" />
                <defs>
                  <linearGradient id="lpBrandGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563EB" /><stop offset="1" stopColor="#60A5FA" />
                  </linearGradient>
                  <linearGradient id="lpBrandGrad2" x1="0" y1="0" x2="7" y2="6" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1D4ED8" /><stop offset="1" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="lp-brand-text">
                <span className="lp-brand-jit">JIT</span>
                <span className="lp-brand-campus">PERMIGO</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="lp-heading-block">
            <h1 className="lp-h1">Welcome Back!</h1>
            <p className="lp-h1-blue">{loginType === 'staff' ? 'Faculty Portal' : 'Student Portal'}</p>
            <p className="lp-desc">
              {loginType === 'staff' ? (
                <>
                  Manage classes, students,<br />
                  notices and academic workflows.
                </>
              ) : (
                <>
                  Access your academic journey,<br />
                  outpasses, attendance, faculty support<br />
                  and campus services.
                </>
              )}
            </p>
          </div>

          {/* Feature cards row */}
          <div className="lp-features">
            {featureCards.map((fc, i) => (
              <div className="lp-feat-card" key={i} style={{ animationDelay: `${120 + i * 80}ms` }}>
                <span className="lp-feat-icon">{fc.icon}</span>
                <span className="lp-feat-label">{fc.label}</span>
              </div>
            ))}
          </div>

          {/* Quote card */}
          <div className="lp-quote-card">
            <div className="lp-quote-mark">"</div>
            <p className="lp-quote-text">
              Education is the most powerful weapon<br />
              which you can use to change the world.
            </p>
            <p className="lp-quote-attr">— Nelson Mandela</p>
          </div>

        </aside>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <main className="lp-right">

          {/* Mobile Brand Header */}
          <div className="lp-mobile-brand">
            <div className="lp-brand-logo">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="9" fill="url(#lpBrandGradMobile)" />
                <path d="M9 26L18 10L27 26H9Z" fill="white" fillOpacity="0.96" />
                <rect x="14.5" y="20" width="7" height="6" rx="2" fill="url(#lpBrandGrad2Mobile)" />
                <defs>
                  <linearGradient id="lpBrandGradMobile" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563EB" /><stop offset="1" stopColor="#60A5FA" />
                  </linearGradient>
                  <linearGradient id="lpBrandGrad2Mobile" x1="0" y1="0" x2="7" y2="6" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1D4ED8" /><stop offset="1" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="lp-brand-text">
                <span className="lp-brand-jit">JIT</span>
                <span className="lp-brand-campus">PERMIGO</span>
              </div>
            </div>
          </div>

          {/* Back button */}
          <button className="lp-back-btn" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>

          {/* Floating 3D logo above card */}
          <div className="lp-float-logo">
            <div className="lp-float-logo-inner">
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                <rect width="38" height="38" rx="11" fill="url(#lpFLGrad)" />
                <path d="M10 27L19 11L28 27H10Z" fill="white" fillOpacity="0.95"/>
                <rect x="15.5" y="21" width="7" height="6" rx="2" fill="url(#lpFLGrad2)" />
                <defs>
                  <linearGradient id="lpFLGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6" /><stop offset="1" stopColor="#93C5FD" />
                  </linearGradient>
                  <linearGradient id="lpFLGrad2" x1="0" y1="0" x2="7" y2="6" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1D4ED8" /><stop offset="1" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Glass card */}
          <div className={`lp-card ${successAnim ? 'lp-card-success' : ''}`}>
            {/* Inner shine */}
            <div className="lp-card-shine" aria-hidden="true" />

            {/* Card heading */}
            <div className="lp-card-head">
              <h2 className="lp-card-title">{loginType === 'staff' ? 'Faculty Login' : 'Student Login'}</h2>
              <p className="lp-card-sub">Sign in to your {loginType === 'staff' ? 'Faculty' : 'student'} account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="lp-form" noValidate>

              {/* Email */}
              <div className="lp-field-group lp-fd1">
                <label className="lp-field-label" htmlFor={`${loginType}-email`}>Email Address</label>
                <div className="lp-input-box">
                  <span className="lp-iicon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id={`${loginType}-email`}
                    className="lp-input"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lp-field-group lp-fd2">
                <label className="lp-field-label" htmlFor={`${loginType}-password`}>Password</label>
                <div className="lp-input-box">
                  <span className="lp-iicon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id={`${loginType}-password`}
                    className="lp-input"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="lp-eye"
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
              <div className="lp-options lp-fd3">
                <label className="lp-remember">
                  <span
                    className={`lp-checkbox ${rememberMe ? 'checked' : ''}`}
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
                  <span className="lp-remember-text">Remember me</span>
                </label>
                <a
                  href="#forgot"
                  className="lp-forgot"
                  onClick={e => {
                    e.preventDefault();
                    toast.info("Please contact your system administrator to reset your password.", { position: "top-center" });
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`lp-btn lp-fd4 ${successAnim ? 'lp-btn-success' : ''}`}
                disabled={Loading || successAnim}
                id={`${loginType}-submit-btn`}
                onClick={addRipple}
              >
                {ripples.map(r => (
                  <span key={r.id} className="lp-ripple" style={{ left: r.x, top: r.y }} />
                ))}
                {successAnim ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lp-check-icon">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Access Granted
                  </>
                ) : Loading ? (
                  <><span className="lp-spinner" /> Signing in...</>
                ) : (
                  <>Log In <span className="lp-btn-arrow">→</span></>
                )}
              </button>

            </form>
          </div>{/* /lp-card */}

        </main>
      </div>

      {/* ── FOOTER STRIP ──────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        {footerItems.map((fi, i) => (
          <div className="lp-footer-item" key={i}>
            <span className="lp-footer-icon">{fi.icon}</span>
            <div className="lp-footer-text">
              <span className="lp-footer-title">{fi.title}</span>
              <span className="lp-footer-sub">{fi.sub}</span>
            </div>
          </div>
        ))}
      </footer>

      {/* ════════════════════════════════════════════════════════════════════
          STYLES
      ════════════════════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .lp-root *, .lp-root *::before, .lp-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        /* ── Root ── */
        .lp-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          height: 100vh; height: 100dvh;
          -webkit-font-smoothing: antialiased;
          position: relative;
          overflow: hidden;
        }

        /* Success zoom */
        .lp-success-zoom { animation: lpSuccessZoom 1.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes lpSuccessZoom {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
          100% { filter: brightness(1.3); }
        }

        /* Light sweep */
        .lp-sweep {
          position: fixed; inset: 0; z-index: 998; pointer-events: none;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%);
          animation: lpSweep 0.8s ease forwards;
        }
        @keyframes lpSweep {
          from { transform: translateX(-120%); }
          to   { transform: translateX(120%); }
        }

        /* ── Layout ── */
        .lp-layout {
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
        .lp-left {
          padding: 52px 40px 52px 32px;
          display: flex; flex-direction: column; gap: 32px;
          opacity: 0; transform: translateX(-36px);
          animation: lpSlideL 0.85s cubic-bezier(0.16,1,0.3,1) 0.1s forwards;
        }
        @keyframes lpSlideL {
          to { opacity: 1; transform: translateX(0); }
        }

        /* Brand */
        .lp-brand { }
        .lp-brand-logo {
          display: inline-flex; align-items: center; gap: 12px;
        }
        .lp-brand-text {
          display: flex; flex-direction: column; gap: 1px;
        }
        .lp-brand-jit {
          font-size: 28px; font-weight: 900; color: #1D4ED8;
          letter-spacing: -1px; line-height: 1;
        }
        .lp-brand-campus {
          font-size: 9px; font-weight: 700; color: #64748B;
          letter-spacing: 2.5px; text-transform: uppercase;
        }

        /* Heading */
        .lp-heading-block { display: flex; flex-direction: column; gap: 10px; }
        .lp-h1 {
          font-size: clamp(32px, 3.4vw, 48px);
          font-weight: 900; color: #0F172A;
          letter-spacing: -1.5px; line-height: 1.1;
        }
        .lp-h1-blue {
          font-size: clamp(28px, 3.0vw, 42px);
          font-weight: 900;
          background: linear-gradient(135deg, #2563EB 0%, #60A5FA 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1.2px; line-height: 1.1;
        }
        .lp-desc {
          font-size: 14.5px; color: #475569;
          line-height: 1.75; max-width: 340px;
          margin-top: 4px;
        }

        /* Feature cards */
        .lp-features {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 10px;
        }
        .lp-feat-card {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 14px 8px;
          background: rgba(255,255,255,0.60);
          border: 1px solid rgba(255,255,255,0.80);
          border-radius: 16px;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 16px rgba(59,130,246,0.07), 0 1px 3px rgba(0,0,0,0.04);
          cursor: default;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
          opacity: 0; animation: lpFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
          text-align: center;
        }
        .lp-feat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(59,130,246,0.14), 0 0 0 1px rgba(59,130,246,0.1);
        }
        @keyframes lpFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-feat-icon { font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
        .lp-feat-label {
          font-size: 11px; font-weight: 600; color: #334155;
          white-space: pre-line; line-height: 1.4;
          text-align: center;
        }

        /* Quote card */
        .lp-quote-card {
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 20px;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          padding: 20px 22px 18px;
          box-shadow: 0 4px 20px rgba(59,130,246,0.08);
          max-width: 340px;
          position: relative; overflow: hidden;
        }
        .lp-quote-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%);
          border-radius: 20px; pointer-events: none;
        }
        .lp-quote-mark {
          font-size: 36px; font-weight: 900; color: #3B82F6;
          line-height: 0.7; margin-bottom: 10px;
          font-family: Georgia, serif;
        }
        .lp-quote-text {
          font-size: 13px; color: #334155; line-height: 1.65;
          font-style: italic; margin-bottom: 10px;
        }
        .lp-quote-attr {
          font-size: 12px; font-weight: 600; color: #64748B;
        }

        /* ═══════════════════════════════════════════════════════════════════
           RIGHT PANEL
        ═══════════════════════════════════════════════════════════════════ */
        .lp-right {
          display: flex; flex-direction: column; align-items: center;
          padding: 40px 32px 40px 20px;
          opacity: 0; transform: translateX(36px);
          animation: lpSlideR 0.85s cubic-bezier(0.16,1,0.3,1) 0.15s forwards;
        }
        @keyframes lpSlideR {
          to { opacity: 1; transform: translateX(0); }
        }

        .lp-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #1E3A8A;
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
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.05);
        }
        .lp-back-btn:hover {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(59, 130, 246, 0.4);
          transform: translateX(-3px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.1);
        }

        .lp-mobile-brand {
          display: none;
        }

        /* Floating logo above card */
        .lp-float-logo {
          position: relative;
          margin-bottom: -28px;
          z-index: 2;
          animation: lpFloatBob 3.5s ease-in-out infinite;
        }
        @keyframes lpFloatBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .lp-float-logo-inner {
          width: 72px; height: 72px; border-radius: 22px;
          background: linear-gradient(135deg, #3B82F6, #93C5FD);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 12px 32px rgba(59,130,246,0.40),
            0 0 0 8px rgba(59,130,246,0.10),
            inset 0 1px 0 rgba(255,255,255,0.4);
        }

        /* Glass card */
        .lp-card {
          width: 100%; max-width: 440px;
          background: rgba(255,255,255,0.80);
          border-radius: 32px;
          padding: 44px 36px 32px;
          position: relative; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.6) inset,
            0 8px 40px rgba(59,130,246,0.12),
            0 24px 64px rgba(0,0,0,0.08),
            0 2px 4px rgba(0,0,0,0.04);
          backdrop-filter: blur(25px) saturate(180%);
          -webkit-backdrop-filter: blur(25px) saturate(180%);
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease;
        }
        .lp-card.lp-card-success {
          transform: scale(0.98);
          box-shadow: 0 0 0 2px rgba(34,197,94,0.4) inset, 0 12px 40px rgba(34,197,94,0.18);
        }
        .lp-card-shine {
          position: absolute; top: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.30) 0%, transparent 100%);
          border-radius: 32px 32px 0 0; pointer-events: none;
        }

        /* Card head */
        .lp-card-head { text-align: center; margin-bottom: 28px; }
        .lp-card-title {
          font-size: 24px; font-weight: 800; color: #0F172A;
          letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .lp-card-sub { font-size: 13.5px; color: #64748B; }

        /* Form */
        .lp-form { display: flex; flex-direction: column; gap: 16px; }

        /* Field group */
        .lp-field-group { display: flex; flex-direction: column; gap: 6px; }
        .lp-field-label {
          font-size: 13px; font-weight: 600; color: #334155;
          padding-left: 2px;
        }

        /* Input box */
        .lp-input-box {
          position: relative; display: flex; align-items: center;
        }
        .lp-input {
          width: 100%; height: 50px;
          padding: 0 44px 0 44px;
          font-size: 14px; font-family: inherit; font-weight: 500;
          color: #0F172A;
          background: rgba(248,251,255,0.90);
          border: 1.5px solid rgba(203,213,225,0.7);
          border-radius: 12px; outline: none;
          transition: border-color 0.28s ease, box-shadow 0.28s ease, background 0.28s ease;
          -webkit-appearance: none;
        }
        .lp-input::placeholder { color: #94A3B8; font-weight: 400; }
        .lp-input:hover {
          border-color: rgba(59,130,246,0.35);
          background: rgba(255,255,255,0.95);
        }
        .lp-input:focus {
          border-color: #3B82F6;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12), 0 2px 8px rgba(59,130,246,0.06);
        }

        /* Input icon */
        .lp-iicon {
          position: absolute; left: 14px;
          color: #94A3B8; display: flex; align-items: center; pointer-events: none;
          transition: color 0.25s;
        }
        .lp-input-box:focus-within .lp-iicon { color: #3B82F6; }

        /* Eye button */
        .lp-eye {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          color: #94A3B8; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; transition: color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .lp-eye:hover { color: #3B82F6; background: rgba(59,130,246,0.07); }

        /* Options row */
        .lp-options {
          display: flex; align-items: center; justify-content: space-between;
        }
        .lp-remember { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .lp-checkbox {
          width: 16px; height: 16px; border-radius: 4px;
          border: 1.5px solid #CBD5E1;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
          flex-shrink: 0; background: white;
        }
        .lp-checkbox.checked {
          background: #3B82F6; border-color: #3B82F6;
        }
        .lp-remember-text { font-size: 13px; font-weight: 500; color: #475569; }
        .lp-forgot {
          font-size: 13px; font-weight: 600; color: #3B82F6;
          text-decoration: none; transition: opacity 0.2s;
        }
        .lp-forgot:hover { opacity: 0.75; }

        /* Submit button */
        .lp-btn {
          width: 100%; height: 52px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 16px; font-weight: 700; font-family: inherit;
          color: white;
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
          border: none; border-radius: 14px; cursor: pointer;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 18px rgba(59,130,246,0.42), inset 0 1px 0 rgba(255,255,255,0.18);
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
          letter-spacing: 0.1px;
        }
        .lp-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-120%);
          transition: transform 0.7s ease;
        }
        .lp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(59,130,246,0.52), inset 0 1px 0 rgba(255,255,255,0.22);
        }
        .lp-btn:hover:not(:disabled)::before { transform: translateX(120%); }
        .lp-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
        .lp-btn:disabled { opacity: 0.82; cursor: not-allowed; }
        .lp-btn-arrow { font-size: 18px; }

        .lp-btn.lp-btn-success {
          background: linear-gradient(135deg, #22C55E, #16A34A);
          box-shadow: 0 4px 24px rgba(34,197,94,0.42);
        }
        .lp-check-icon { animation: lpCheckPop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes lpCheckPop { from { transform: scale(0) rotate(-15deg); } to { transform: scale(1) rotate(0); } }

        /* Ripple */
        .lp-ripple {
          position: absolute; width: 4px; height: 4px; border-radius: 50%;
          background: rgba(255,255,255,0.55);
          transform: translate(-50%, -50%) scale(0);
          animation: lpRipple 0.7s ease-out forwards;
          pointer-events: none;
        }
        @keyframes lpRipple { to { transform: translate(-50%, -50%) scale(60); opacity: 0; } }

        /* Spinner */
        .lp-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: lpSpin 0.65s linear infinite;
        }
        @keyframes lpSpin { to { transform: rotate(360deg); } }

        /* Divider */
        .lp-divider {
          display: flex; align-items: center; gap: 12px;
          margin-top: 4px;
        }
        .lp-divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(203,213,225,0.8), transparent);
        }
        .lp-divider-text {
          font-size: 12.5px; color: #94A3B8; font-weight: 500;
          white-space: nowrap;
        }

        /* Social */
        .lp-social { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .lp-social-btn {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          height: 46px; border-radius: 12px;
          background: rgba(255,255,255,0.75);
          border: 1.5px solid rgba(203,213,225,0.75);
          font-size: 14px; font-weight: 600; color: #334155;
          cursor: pointer; font-family: inherit;
          backdrop-filter: blur(10px);
          transition: all 0.22s ease;
        }
        .lp-social-btn:hover {
          background: rgba(255,255,255,0.95);
          border-color: rgba(59,130,246,0.3);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.1);
        }

        /* Create account */
        .lp-create {
          text-align: center; font-size: 13px; color: #64748B;
          margin-top: 4px;
        }
        .lp-create-link {
          font-weight: 700; color: #3B82F6; text-decoration: none;
          transition: opacity 0.2s;
        }
        .lp-create-link:hover { opacity: 0.75; }

        /* Staggered field animations */
        .lp-fd1, .lp-fd2, .lp-fd3, .lp-fd4, .lp-fd5, .lp-fd6, .lp-fd7 {
          opacity: 0; animation: lpFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .lp-fd1 { animation-delay: 500ms; }
        .lp-fd2 { animation-delay: 600ms; }
        .lp-fd3 { animation-delay: 700ms; }
        .lp-fd4 { animation-delay: 800ms; }
        .lp-fd5 { animation-delay: 900ms; }
        .lp-fd6 { animation-delay: 1000ms; }
        .lp-fd7 { animation-delay: 1100ms; }

        /* ═══════════════════════════════════════════════════════════════════
           FOOTER STRIP
        ═══════════════════════════════════════════════════════════════════ */
        .lp-footer {
          position: relative; z-index: 2;
          height: 72px;
          display: flex; align-items: center; justify-content: center; gap: 56px;
          background: rgba(255,255,255,0.55);
          border-top: 1px solid rgba(255,255,255,0.75);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          padding: 0 32px;
          opacity: 0;
          animation: lpFadeUp 0.7s ease 1.2s forwards;
        }
        .lp-footer-item { display: flex; align-items: center; gap: 10px; }
        .lp-footer-icon { font-size: 20px; }
        .lp-footer-text { display: flex; flex-direction: column; gap: 1px; }
        .lp-footer-title { font-size: 13px; font-weight: 700; color: #1E3A5F; }
        .lp-footer-sub { font-size: 11px; color: #64748B; font-weight: 500; }

        /* ═══════════════════════════════════════════════════════════════════
           RESPONSIVE
        ═══════════════════════════════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .lp-layout { grid-template-columns: 42% 58%; padding: 0 20px; }
          .lp-left { padding: 40px 24px 40px 16px; }
          .lp-right { padding: 32px 16px 32px 8px; }
        }

        @media (max-width: 860px) {
          .lp-layout {
            grid-template-columns: 1fr;
            padding: 0 16px;
            height: 100%;
            align-items: center;
          }
          .lp-left {
            display: none !important;
          }
          .lp-footer {
            display: none !important;
          }
          .lp-mobile-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            width: 100%;
          }
          .lp-right {
            padding: 5px 16px 16px;
            order: 1;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .lp-float-logo { margin-bottom: -24px; }
          .lp-card { max-width: 100%; }
          .lp-features { grid-template-columns: repeat(4,1fr); gap: 8px; }
          .lp-feat-card { padding: 12px 6px; }
          .lp-h1 { font-size: 28px; }
          .lp-h1-blue { font-size: 24px; }
          .lp-quote-card { max-width: 100%; }
        }

        @media (max-width: 520px) {
          .lp-card { padding: 38px 22px 28px; border-radius: 24px; }
          .lp-input { height: 48px; }
          .lp-btn { height: 50px; }
          .lp-features { grid-template-columns: repeat(2,1fr); }
          .lp-footer { gap: 16px; padding: 0 16px; }
          .lp-footer-item:last-child { display: none; }
          .lp-left { padding: 20px 12px 12px; }
        }

        @media (max-width: 380px) {
          .lp-card { padding: 32px 16px 24px; }
          .lp-card-title { font-size: 21px; }
          .lp-social { gap: 8px; }
        }
      `}</style>
    </div>
  );
};

export default Login;
