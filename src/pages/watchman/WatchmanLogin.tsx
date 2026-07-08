import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import axios from 'axios';
import { Shield, Ticket, Video, Siren, Lock, Globe } from 'lucide-react';
import { toast, ToastContainer } from "react-toastify";
import SEO from '../../components/SEO';

/* ─────────────────────────────────────────────────────────────────────────────
   BACKGROUND CANVAS  — flowing light waves + floating dots (green/emerald tint)
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
      bg.addColorStop(0, '#ECFDF5');
      bg.addColorStop(0.45, '#D1FAE5');
      bg.addColorStop(1, '#A7F3D0');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const glows = [
        { x: W * 0.15, y: H * 0.3,  r: W * 0.45, c: 'rgba(52,211,153,0.18)' },
        { x: W * 0.75, y: H * 0.2,  r: W * 0.38, c: 'rgba(16,185,129,0.12)' },
        { x: W * 0.55, y: H * 0.75, r: W * 0.40, c: 'rgba(167,243,208,0.22)' },
        { x: W * 0.9,  y: H * 0.6,  r: W * 0.30, c: 'rgba(5,150,105,0.08)'  },
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
        grad.addColorStop(0.7, `rgba(52,211,153,${w.alpha * 0.9})`);
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
   WATCHMAN LOGIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const WatchmanLogin: React.FC = () => {
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
      const response = await axios.post(`${API_URL}/watchman/login`, { email, password });
      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", "watchman");
        setShowToast(true);
        setSuccessAnim(true);
        setTimeout(() => { navigate("/watchman-dashboard"); }, 1500);
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setLoading(false);
      if (error.response) {
        const status = error.response.status;
        if (status === 400) toast.error("Missing email or password", { position: "bottom-right", autoClose: 5000 });
        else if (status === 401) toast.error("Invalid email or password", { position: "bottom-right", autoClose: 5000 });
        else if (status === 404) toast.error("Security officer not found", { position: "bottom-right", autoClose: 5000 });
        else toast.error("Login failed. Try again.", { position: "bottom-right", autoClose: 5000 });
      } else {
        toast.error("Server not reachable", { position: "bottom-right", autoClose: 5000 });
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
    { icon: <Shield size={24} style={{ display: 'inline-flex' }} />, label: 'Gate\nControl' },
    { icon: <Ticket size={24} style={{ display: 'inline-flex' }} />, label: 'Pass\nVerification' },
    { icon: <Video size={24} style={{ display: 'inline-flex' }} />, label: 'Campus\nSecurity' },
    { icon: <Siren size={24} style={{ display: 'inline-flex' }} />, label: 'Incident\nReports' },
  ];

  const footerItems = [
    { icon: <Lock size={20} style={{ display: 'inline-flex' }} />, title: 'Secure & Encrypted', sub: 'Role-based access control' },
    { icon: <Shield size={20} style={{ display: 'inline-flex' }} />, title: 'Campus Security', sub: 'Gate pass verification' },
    { icon: <Globe size={20} style={{ display: 'inline-flex' }} />, title: 'Always On Duty', sub: '24/7 campus protection' },
  ];

  return (
    <div className={`wm-root ${mounted ? 'wm-mounted' : ''} ${successAnim ? 'wm-success-zoom' : ''}`}>
      <SEO
        title="Security Login"
        description="Watchman/Security portal login for JIT Permigo campus gate management."
        canonical="/watchmanlogin"
        noIndex
      />
      <ToastContainer />
      {showToast && (
        <Toast message="Security login successful! Redirecting..." type="success" onClose={() => setShowToast(false)} />
      )}

      {/* Animated background */}
      <BgCanvas />

      {/* Success sweep */}
      {successAnim && <div className="wm-sweep" />}

      {/* ══ MAIN LAYOUT ══ */}
      <div className="wm-layout">

        {/* ── LEFT PANEL ── */}
        <aside className="wm-left">

          {/* Brand */}
          <div className="wm-brand">
            <div className="wm-brand-logo">
              <div className="lux-logo-icon">
                <img src="/green permigo.png" alt="JIT Permigo" style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '4px' }} />
              </div>
              <div className="wm-brand-text">
                <span className="wm-brand-jit">JIT</span>
                <span className="wm-brand-campus">PERMIGO</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="wm-heading-block">
            <h1 className="wm-h1">Welcome Back!</h1>
            <p className="wm-h1-green">Security Portal</p>
            <p className="wm-desc">
              Verify outpasses, manage gate access<br />
              and keep campus secure round<br />
              the clock.
            </p>
          </div>

          {/* Feature cards */}
          <div className="wm-features">
            {featureCards.map((fc, i) => (
              <div className="wm-feat-card" key={i} style={{ animationDelay: `${120 + i * 80}ms` }}>
                <span className="wm-feat-icon">{fc.icon}</span>
                <span className="wm-feat-label">{fc.label}</span>
              </div>
            ))}
          </div>

          {/* Quote card */}
          <div className="wm-quote-card">
            <div className="wm-quote-mark">"</div>
            <p className="wm-quote-text">
              Safety and security don't just happen;<br />
              they are the result of collective consensus<br />
              and public investment.
            </p>
            <p className="wm-quote-attr">— Nelson Mandela</p>
          </div>

        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className="wm-right">

          {/* Mobile brand */}
          

          {/* Back button */}
          <button className="wm-back-btn" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>

          {/* Floating logo */}
          <div className="wm-float-logo">
            <div className="wm-float-logo-inner">
              <div className="lux-logo-icon">
                <img src="/green permigo.png" alt="JIT Permigo" style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '4px' }} />
              </div>
            </div>
          </div>

          {/* Glass card */}
          <div className={`wm-card ${successAnim ? 'wm-card-success' : ''}`}>
            <div className="wm-card-shine" aria-hidden="true" />

            <div className="wm-card-head">
              <h2 className="wm-card-title">Security Login</h2>
              <p className="wm-card-sub">Sign in to your security officer account</p>
            </div>

            <form onSubmit={handleSubmit} className="wm-form" noValidate>

              {/* Email */}
              <div className="wm-field-group wm-fd1">
                <label className="wm-field-label" htmlFor="wm-email">Security Email / ID</label>
                <div className="wm-input-box">
                  <span className="wm-iicon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="wm-email"
                    className="wm-input"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="wm-field-group wm-fd2">
                <label className="wm-field-label" htmlFor="wm-password">Password</label>
                <div className="wm-input-box">
                  <span className="wm-iicon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="wm-password"
                    className="wm-input"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="wm-eye"
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
              <div className="wm-options wm-fd3">
                <label className="wm-remember">
                  <span
                    className={`wm-checkbox ${rememberMe ? 'checked' : ''}`}
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
                  <span className="wm-remember-text">Remember me</span>
                </label>
                <a
                  href="#forgot"
                  className="wm-forgot"
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
                className={`wm-btn wm-fd4 ${successAnim ? 'wm-btn-success' : ''}`}
                disabled={Loading || successAnim}
                id="security-submit-btn"
                onClick={addRipple}
              >
                {ripples.map(r => (
                  <span key={r.id} className="wm-ripple" style={{ left: r.x, top: r.y }} />
                ))}
                {successAnim ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="wm-check-icon">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Access Granted
                  </>
                ) : Loading ? (
                  <><span className="wm-spinner" /> Signing in...</>
                ) : (
                  <>Log In <span className="wm-btn-arrow">→</span></>
                )}
              </button>

            </form>
          </div>

        </main>
      </div>

      {/* ── FOOTER STRIP ── */}
      <footer className="wm-footer">
        {footerItems.map((fi, i) => (
          <div className="wm-footer-item" key={i}>
            <span className="wm-footer-icon">{fi.icon}</span>
            <div className="wm-footer-text">
              <span className="wm-footer-title">{fi.title}</span>
              <span className="wm-footer-sub">{fi.sub}</span>
            </div>
          </div>
        ))}
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .wm-root *, .wm-root *::before, .wm-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .wm-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          height: 100vh; height: 100dvh;
          -webkit-font-smoothing: antialiased;
          position: relative;
          overflow: hidden;
        }

        .wm-success-zoom { animation: wmSuccessZoom 1.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes wmSuccessZoom {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
          100% { filter: brightness(1.3); }
        }

        .wm-sweep {
          position: fixed; inset: 0; z-index: 998; pointer-events: none;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%);
          animation: wmSweep 0.8s ease forwards;
        }
        @keyframes wmSweep {
          from { transform: translateX(-120%); }
          to   { transform: translateX(120%); }
        }

        /* ── Layout ── */
        .wm-layout {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: 45% 55%;
          min-height: calc(100vh - 72px);
          padding: 0 32px;
          gap: 0;
          align-items: center;
        }

        /* ── LEFT PANEL ── */
        .wm-left {
          padding: 52px 40px 52px 32px;
          display: flex; flex-direction: column; gap: 32px;
          opacity: 0; transform: translateX(-36px);
          animation: wmSlideL 0.85s cubic-bezier(0.16,1,0.3,1) 0.1s forwards;
        }
        @keyframes wmSlideL { to { opacity: 1; transform: translateX(0); } }

        .wm-brand-logo { display: inline-flex; align-items: center; gap: 12px; }
        .wm-brand-text { display: flex; flex-direction: column; gap: 1px; }
        .wm-brand-jit { font-size: 28px; font-weight: 900; color: #065F46; letter-spacing: -1px; line-height: 1; }
        .wm-brand-campus { font-size: 9px; font-weight: 700; color: #6B7280; letter-spacing: 2.5px; text-transform: uppercase; }

        .wm-heading-block { display: flex; flex-direction: column; gap: 10px; }
        .wm-h1 { font-size: clamp(32px, 3.4vw, 48px); font-weight: 900; color: #064E3B; letter-spacing: -1.5px; line-height: 1.1; }
        .wm-h1-green {
          font-size: clamp(28px, 3.0vw, 42px); font-weight: 900;
          background: linear-gradient(135deg, #059669 0%, #34D399 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; letter-spacing: -1.2px; line-height: 1.1;
        }
        .wm-desc { font-size: 14.5px; color: #374151; line-height: 1.75; max-width: 340px; margin-top: 4px; }

        .wm-features { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        .wm-feat-card {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 14px 8px;
          background: rgba(255,255,255,0.60);
          border: 1px solid rgba(255,255,255,0.80);
          border-radius: 16px;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 16px rgba(5,150,105,0.08), 0 1px 3px rgba(0,0,0,0.04);
          cursor: default;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
          opacity: 0; animation: wmFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
          text-align: center;
        }
        .wm-feat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(5,150,105,0.16), 0 0 0 1px rgba(5,150,105,0.12);
        }
        @keyframes wmFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .wm-feat-icon { font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
        .wm-feat-label { font-size: 11px; font-weight: 600; color: #1F2937; white-space: pre-line; line-height: 1.4; text-align: center; }

        .wm-quote-card {
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 20px;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          padding: 20px 22px 18px;
          box-shadow: 0 4px 20px rgba(5,150,105,0.08);
          max-width: 340px;
          position: relative; overflow: hidden;
        }
        .wm-quote-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%);
          border-radius: 20px; pointer-events: none;
        }
        .wm-quote-mark { font-size: 36px; font-weight: 900; color: #059669; line-height: 0.7; margin-bottom: 10px; font-family: Georgia, serif; }
        .wm-quote-text { font-size: 13px; color: #1F2937; line-height: 1.65; font-style: italic; margin-bottom: 10px; }
        .wm-quote-attr { font-size: 12px; font-weight: 600; color: #4B5563; }

        /* ── RIGHT PANEL ── */
        .wm-right {
          display: flex; flex-direction: column; align-items: center;
          padding: 40px 32px 40px 20px;
          opacity: 0; transform: translateX(36px);
          animation: wmSlideR 0.85s cubic-bezier(0.16,1,0.3,1) 0.15s forwards;
        }
        @keyframes wmSlideR { to { opacity: 1; transform: translateX(0); } }

        .wm-back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(5,150,105,0.2);
          color: #065F46;
          font-size: 13px; font-weight: 600;
          padding: 9px 18px; border-radius: 100px; cursor: pointer;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          align-self: flex-start; margin-bottom: 12px; font-family: inherit;
          box-shadow: 0 4px 12px rgba(5,150,105,0.06);
        }
        .wm-back-btn:hover {
          background: rgba(255,255,255,0.88);
          border-color: rgba(5,150,105,0.4);
          transform: translateX(-3px);
          box-shadow: 0 6px 16px rgba(5,150,105,0.12);
        }

        .wm-mobile-brand { display: none; }

        /* Floating logo */
        .wm-float-logo {
          position: relative; margin-bottom: -28px; z-index: 2;
          animation: wmFloatBob 3.5s ease-in-out infinite;
        }
        @keyframes wmFloatBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .wm-float-logo-inner {
          width: 72px; height: 72px; border-radius: 22px;
          background: linear-gradient(135deg, #059669, #34D399);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 12px 32px rgba(5,150,105,0.40),
            0 0 0 8px rgba(5,150,105,0.10),
            inset 0 1px 0 rgba(255,255,255,0.4);
        }

        /* Glass card */
        .wm-card {
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
        .wm-card.wm-card-success {
          transform: scale(0.98);
          box-shadow: 0 0 0 2px rgba(34,197,94,0.4) inset, 0 12px 40px rgba(34,197,94,0.18);
        }
        .wm-card-shine {
          position: absolute; top: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.30) 0%, transparent 100%);
          border-radius: 32px 32px 0 0; pointer-events: none;
        }

        .wm-card-head { text-align: center; margin-bottom: 28px; }
        .wm-card-title { font-size: 24px; font-weight: 800; color: #064E3B; letter-spacing: -0.5px; margin-bottom: 6px; }
        .wm-card-sub { font-size: 13.5px; color: #4B5563; }

        .wm-form { display: flex; flex-direction: column; gap: 16px; }
        .wm-field-group { display: flex; flex-direction: column; gap: 6px; }
        .wm-field-label { font-size: 13px; font-weight: 600; color: #1F2937; padding-left: 2px; }

        .wm-input-box { position: relative; display: flex; align-items: center; }
        .wm-input {
          width: 100%; height: 50px;
          padding: 0 44px 0 44px;
          font-size: 14px; font-family: inherit; font-weight: 500; color: #064E3B;
          background: rgba(240,253,244,0.90);
          border: 1.5px solid rgba(167,243,208,0.8);
          border-radius: 12px; outline: none;
          transition: border-color 0.28s ease, box-shadow 0.28s ease, background 0.28s ease;
          -webkit-appearance: none;
        }
        .wm-input:-webkit-autofill,
        .wm-input:-webkit-autofill:hover, 
        .wm-input:-webkit-autofill:focus, 
        .wm-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #f0fdf4 inset !important;
          -webkit-text-fill-color: #064E3B !important;
          caret-color: #064E3B;
          transition: background-color 5000s ease-in-out 0s;
        }
        .wm-input::placeholder { color: #9CA3AF; font-weight: 400; }
        .wm-input:hover { border-color: rgba(5,150,105,0.35); background: rgba(255,255,255,0.95); }
        .wm-input:focus {
          border-color: #059669;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(5,150,105,0.12), 0 2px 8px rgba(5,150,105,0.06);
        }

        .wm-iicon {
          position: absolute; left: 14px;
          color: #9CA3AF; display: flex; align-items: center; pointer-events: none;
          transition: color 0.25s;
        }
        .wm-input-box:focus-within .wm-iicon { color: #059669; }

        .wm-eye {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          color: #9CA3AF; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; transition: color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .wm-eye:hover { color: #059669; background: rgba(5,150,105,0.07); }

        .wm-options { display: flex; align-items: center; justify-content: space-between; }
        .wm-remember { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .wm-checkbox {
          width: 16px; height: 16px; border-radius: 4px;
          border: 1.5px solid #D1FAE5;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; flex-shrink: 0; background: white;
        }
        .wm-checkbox.checked { background: #059669; border-color: #059669; }
        .wm-remember-text { font-size: 13px; font-weight: 500; color: #374151; }
        .wm-forgot { font-size: 13px; font-weight: 600; color: #059669; text-decoration: none; transition: opacity 0.2s; }
        .wm-forgot:hover { opacity: 0.75; }

        /* Submit button */
        .wm-btn {
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
        .wm-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-120%);
          transition: transform 0.7s ease;
        }
        .wm-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(5,150,105,0.52), inset 0 1px 0 rgba(255,255,255,0.22);
        }
        .wm-btn:hover:not(:disabled)::before { transform: translateX(120%); }
        .wm-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
        .wm-btn:disabled { opacity: 0.82; cursor: not-allowed; }
        .wm-btn-arrow { font-size: 18px; }

        .wm-btn.wm-btn-success {
          background: linear-gradient(135deg, #22C55E, #16A34A);
          box-shadow: 0 4px 24px rgba(34,197,94,0.42);
        }
        .wm-check-icon { animation: wmCheckPop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes wmCheckPop { from { transform: scale(0) rotate(-15deg); } to { transform: scale(1) rotate(0); } }

        .wm-ripple {
          position: absolute; width: 4px; height: 4px; border-radius: 50%;
          background: rgba(255,255,255,0.55);
          transform: translate(-50%, -50%) scale(0);
          animation: wmRipple 0.7s ease-out forwards;
          pointer-events: none;
        }
        @keyframes wmRipple { to { transform: translate(-50%, -50%) scale(60); opacity: 0; } }

        .wm-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: wmSpin 0.65s linear infinite;
        }
        @keyframes wmSpin { to { transform: rotate(360deg); } }

        /* Staggered animations */
        .wm-fd1, .wm-fd2, .wm-fd3, .wm-fd4 {
          opacity: 0; animation: wmFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .wm-fd1 { animation-delay: 500ms; }
        .wm-fd2 { animation-delay: 600ms; }
        .wm-fd3 { animation-delay: 700ms; }
        .wm-fd4 { animation-delay: 800ms; }

        /* ── FOOTER STRIP ── */
        .wm-footer {
          position: relative; z-index: 2;
          height: 72px;
          display: flex; align-items: center; justify-content: center; gap: 56px;
          background: rgba(255,255,255,0.55);
          border-top: 1px solid rgba(255,255,255,0.75);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          padding: 0 32px;
          opacity: 0;
          animation: wmFadeUp 0.7s ease 1.2s forwards;
        }
        .wm-footer-item { display: flex; align-items: center; gap: 10px; }
        .wm-footer-icon { font-size: 20px; }
        .wm-footer-text { display: flex; flex-direction: column; gap: 1px; }
        .wm-footer-title { font-size: 13px; font-weight: 700; color: #064E3B; }
        .wm-footer-sub { font-size: 11px; color: #4B5563; font-weight: 500; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .wm-layout { grid-template-columns: 42% 58%; padding: 0 20px; }
          .wm-left { padding: 40px 24px 40px 16px; }
          .wm-right { padding: 32px 16px 32px 8px; }
        }

        @media (max-width: 860px) {
          .wm-layout { grid-template-columns: 1fr; padding: 0 16px; height: 100%; align-items: center; }
          .wm-left { display: none !important; }
          .wm-footer { display: none !important; }
          .wm-mobile-brand { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; width: 100%; }
          .wm-right { padding: 5px 16px 16px; order: 1; width: 100%; display: flex; flex-direction: column; align-items: center; }
          .wm-float-logo { margin-bottom: -24px; }
          .wm-card { max-width: 100%; }
        }

        @media (max-width: 520px) {
          .wm-card { padding: 38px 22px 28px; border-radius: 24px; }
          .wm-input { height: 48px; }
          .wm-btn { height: 50px; }
          .wm-footer { gap: 16px; padding: 0 16px; }
          .wm-footer-item:last-child { display: none; }
        }

        @media (max-width: 380px) {
          .wm-card { padding: 32px 16px 24px; }
          .wm-card-title { font-size: 21px; }
        }
      `}</style>
    </div>
  );
};

export default WatchmanLogin;
