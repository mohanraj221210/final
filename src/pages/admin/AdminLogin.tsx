import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SEO from "../../components/SEO";

/* ─── Particle type ─── */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  radius: number; alpha: number; color: string;
}

const NEON = ["#00E5FF", "#3B82F6", "#00FFAE", "#8B5CF6", "#00E5FF"];

function mkParticles(w: number, h: number, n: number): Particle[] {
  return Array.from({ length: n }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45,
    radius: Math.random() * 2.2 + 0.5,
    alpha: Math.random() * 0.55 + 0.2,
    color: NEON[Math.floor(Math.random() * NEON.length)],
  }));
}

/* ─── Password strength helper ─── */


/* ═══════════════════════════════════════════════════════
   AdminLogin Component
═══════════════════════════════════════════════════════ */
const AdminLogin: React.FC = () => {
  /* ── Auth state (UNCHANGED) ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  /* ── UI state ── */
  const [loginError, setLoginError] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showDenied, setShowDenied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [typeText, setTypeText] = useState("");
  const [clockStr, setClockStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<"" | "email" | "pw">("");
  const [successPhase, setSuccessPhase] = useState(0); // 0=idle 1=scan 2=verify 3=tunnel
  const [deniedPhase, setDeniedPhase] = useState(0);   // 0=idle 1=flash 2=warning 3=fadeout
  const [deniedMsg, setDeniedMsg] = useState("");
  const [wrongAttempt, setWrongAttempt] = useState(false);


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -999, y: -999 });
  const panelRef = useRef<HTMLDivElement>(null);
  const TITLE = "ADMIN CONTROL CENTER";

  /* ── Typewriter ── */
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setTypeText(TITLE.slice(0, i + 1));
      if (++i >= TITLE.length) clearInterval(iv);
    }, 55);
    return () => clearInterval(iv);
  }, []);

  /* ── Live clock ── */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClockStr(now.toLocaleTimeString("en-US", { hour12: false }));
      setDateStr(now.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Mount ── */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  /* ── Canvas ── */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let binaryTimer = 0;
    const cols: { x: number; y: number; spd: number; ch: string }[] =
      Array.from({ length: 25 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * -window.innerHeight,
        spd: Math.random() * 1.4 + 0.4,
        ch: "",
      }));

    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
      particles.current = mkParticles(cv.width, cv.height, cv.width < 768 ? 45 : 90);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (ts: number) => {
      ctx.clearRect(0, 0, cv.width, cv.height);

      /* binary rain */
      if (ts - binaryTimer > 70) {
        binaryTimer = ts;
        cols.forEach(c => {
          c.ch = Math.random() > 0.5 ? "1" : "0";
          c.y += c.spd * 12;
          if (c.y > cv.height) { c.y = -20; c.x = Math.random() * cv.width; }
        });
      }
      ctx.font = "11px monospace";
      cols.forEach(c => {
        ctx.fillStyle = "rgba(0,229,255,0.10)";
        ctx.fillText(c.ch, c.x, c.y);
      });

      /* particles */
      particles.current.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > cv.width) p.vx *= -1;
        if (p.y < 0 || p.y > cv.height) p.vy *= -1;
        const dx = mouse.current.x - p.x, dy = mouse.current.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 130) { p.x += dx * 0.0035; p.y += dy * 0.0035; }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        particles.current.slice(i + 1).forEach(p2 => {
          const d2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d2 < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0,229,255,${0.14 * (1 - d2 / 110)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  /* ── Parallax ── */
  const onMove = useCallback((e: React.MouseEvent) => {
    mouse.current = { x: e.clientX, y: e.clientY };
    if (!panelRef.current) return;
    const r = panelRef.current.getBoundingClientRect();
    const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 3.5;
    const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * -3.5;
    panelRef.current.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  }, []);

  const onLeave = useCallback(() => {
    if (!panelRef.current) return;
    panelRef.current.style.transform = "perspective(1400px) rotateX(0deg) rotateY(0deg)";
  }, []);

  /* ─── Auth handler (UNCHANGED LOGIC) ─── */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setLoginError(false);
    try {
      const res = await axios.post(`${API_URL}/admin/login`, { email, password });
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", "admin");
        doSuccess();
      }
    } catch (err: any) {
      if (email === "admin@jit.edu" && password === "admin") {
        localStorage.setItem("token", "demo-admin-token");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userType", "admin");
        doSuccess(); return;
      }
      doError();
      if (err.response) {
        const map: Record<number, string> = {
          401: "Invalid credentials. Please try again.",
          404: "User not found. Please check your email.",
          429: "Too many requests. Please try again later.",
        };
        setDeniedMsg(map[err.response.status] || err.response.data?.message || "Login failed.");
      } else {
        setDeniedMsg("Network error. Please check your connection.");
      }
    } finally { setLoading(false); }
  };

  const doSuccess = () => {
    setLoginSuccess(true);
    setSuccessPhase(1);
    // phase 1 → scan bar
    let p = 0;
    const iv = setInterval(() => {
      p += 2; setScanProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        setSuccessPhase(2);          // show ACCESS GRANTED text
        setTimeout(() => setSuccessPhase(3), 900);   // zoom tunnel
        setTimeout(() => navigate("/admin/dashboard"), 2200);
      }
    }, 18);
  };

  const doError = () => {
    setLoginError(true);
    setShowDenied(true);
    setDeniedPhase(1);
    setWrongAttempt(true); // show persistent warning note
    setTimeout(() => setDeniedPhase(2), 400);
    setTimeout(() => setDeniedPhase(3), 1800);
    setTimeout(() => { setLoginError(false); setShowDenied(false); setDeniedPhase(0); setDeniedMsg(""); }, 2400);
  };

  /* ═══ RENDER ═══ */
  return (
    <div className="al-root" onMouseMove={onMove} onMouseLeave={onLeave}>
      <SEO
        title="Admin Login"
        description="Secure administrator access portal for JIT Permigo campus management system."
        canonical="/admin-login"
        noIndex
      />

      {/* Canvas */}
      <canvas ref={canvasRef} className="al-canvas" />

      {/* Grid + scanlines */}
      <div className="al-grid" />
      <div className="al-scanlines" />

      {/* Ambient glow orbs */}
      <div className="al-orb al-orb1" />
      <div className="al-orb al-orb2" />
      <div className="al-orb al-orb3" />

      {/* Radar */}
      <div className="al-radar" />

      {/* Server racks */}
      <div className="al-servers al-srv-l">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="al-rack-row" style={{ animationDelay: `${i * 0.18}s` }}>
            <div className="al-led al-led-c" style={{ animationDelay: `${i * 0.3}s` }} />
            <div className="al-rack-bar" />
            <div className="al-led al-led-g" style={{ animationDelay: `${i * 0.22}s` }} />
            <div className="al-rack-bar al-rack-bar2" />
            <div className="al-led al-led-b" style={{ animationDelay: `${i * 0.28}s` }} />
          </div>
        ))}
        <div className="al-rack-label">SRV-01</div>
      </div>
      <div className="al-servers al-srv-r">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="al-rack-row" style={{ animationDelay: `${i * 0.21}s` }}>
            <div className="al-led al-led-b" style={{ animationDelay: `${i * 0.25}s` }} />
            <div className="al-rack-bar al-rack-bar2" />
            <div className="al-led al-led-c" style={{ animationDelay: `${i * 0.32}s` }} />
            <div className="al-rack-bar" />
            <div className="al-led al-led-g" style={{ animationDelay: `${i * 0.18}s` }} />
          </div>
        ))}
        <div className="al-rack-label">SRV-02</div>
      </div>

      {/* Globe */}
      <div className="al-globe-wrap">
        <div className="al-globe">
          {[1, 2, 3, 4].map(n => <div key={n} className={`al-ring al-ring${n}`} />)}
          <span className="al-globe-core">🌐</span>
        </div>
        <div className="al-globe-label">GLOBAL NET</div>
      </div>

      {/* Live clock top-right */}
      <div className="al-clock-panel">
        <div className="al-clock-time">{clockStr}</div>
        <div className="al-clock-date">{dateStr}</div>
        <div className="al-clock-dot" />
      </div>

      {/* Widgets */}
      {[
        { pos: "tl", color: "g", label: "FIREWALL", val: "ACTIVE", pct: 100 },
        { pos: "tr", color: "c", label: "NETWORK", val: "ONLINE", pct: 98 },
        { pos: "bl", color: "p", label: "THREATS", val: "0 FOUND", pct: 0 },
        { pos: "br", color: "c", label: "CPU LOAD", val: "12%", pct: 12 },
      ].map(w => (
        <div key={w.pos} className={`al-widget al-w-${w.pos}`}>
          <div className={`al-wdot al-wdot-${w.color}`} />
          <span className="al-wlabel">{w.label}</span>
          <strong className={`al-wval al-wval-${w.color}`}>{w.val}</strong>
          <div className="al-wbar-bg">
            <div className={`al-wbar al-wbar-${w.color}`} style={{ width: `${w.pct}%` }} />
          </div>
        </div>
      ))}

      {/* Back */}
      <button className="al-back" onClick={() => navigate("/")}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        BACK
      </button>

      {/* ══ Panel ══ */}
      <div className={`al-wrap ${mounted ? "al-in" : ""} ${loginError ? "al-shake" : ""} ${loginSuccess ? "al-win" : ""}`}>
        <div ref={panelRef} className="al-panel" style={{ transition: "transform 0.08s ease" }}>

          {/* Corner accents */}
          <span className="al-c al-c-tl" /><span className="al-c al-c-tr" />
          <span className="al-c al-c-bl" /><span className="al-c al-c-br" />

          {/* ── Header ── */}
          <header className="al-hdr">
            <div className="al-shield-wrap">
              <div className="al-shield">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00E5FF" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z" fill="url(#sg)" />
                  <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="al-pulse1" /><div className="al-pulse2" />
            </div>

            <div className="al-sys-tag">⬡ JIT PERMIGO SYSTEM</div>
            <h1 className="al-title">{typeText}<span className="al-cur">|</span></h1>
            <p className="al-sub">Authorized Personnel Only</p>

            {/* Status bar */}
            <div className="al-stat-bar">
              <span className="al-st al-st-g">● ONLINE</span>
              <span className="al-st-div" />
              <span className="al-st al-st-c">🔒 ENCRYPTED</span>
              <span className="al-st-div" />
              <span className="al-st al-st-p">⚡ SECURE</span>
            </div>
          </header>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} autoComplete="off" className="al-form">

            {/* Email */}
            <div className={`al-field ${focusedField === "email" ? "al-focused" : ""}`}>
              <div className="al-ficon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="al-iwrap">
                <input
                  id="al-email"
                  type="text"
                  className="al-inp"
                  placeholder=" "
                  required
                  value={email}
                  autoComplete="off"
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                />
                <label htmlFor="al-email" className="al-lbl">USERNAME / EMAIL</label>
                <div className="al-scan-bar" />
              </div>
            </div>

            {/* Password */}
            <div className={`al-field ${focusedField === "pw" ? "al-focused" : ""}`}>
              <div className="al-ficon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="al-iwrap">
                <input
                  id="al-pw"
                  type={showPassword ? "text" : "password"}
                  className="al-inp"
                  placeholder=" "
                  required
                  value={password}
                  autoComplete="new-password"
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("pw")}
                  onBlur={() => setFocusedField("")}
                />
                <label htmlFor="al-pw" className="al-lbl">PASSWORD</label>
                <div className="al-scan-bar" />
                <button type="button" className="al-eye" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            
            {/* Remember me + Forgot */}
            <div className="al-remember-row">
              <label className="al-remember">
                <input type="checkbox" className="al-chk" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <span className="al-chk-box">{rememberMe && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#00FFAE" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}</span>
                <span className="al-chk-label">Remember this terminal</span>
              </label>
              <a href="#" className="al-forgot" onClick={e => e.preventDefault()}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                Forgot access key?
              </a>
            </div>

            {/* Error */}
            {loginError && (
              <div className="al-err">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>ACCESS DENIED — INVALID CREDENTIALS</span>
              </div>
            )}

            {/* ⚠ Bypass Warning Note — shown after any failed attempt */}
            {wrongAttempt && (
              <div className="al-bypass-note">
                <div className="al-bypass-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="al-bypass-text">
                  <span className="al-bypass-title">⚠ SECURITY NOTICE</span>
                  <span className="al-bypass-msg">IF YOU TRY TO BYPASS THE LOGIN YOUR DATA WILL BE STORED</span>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="al-submit"
              className={`al-btn ${Loading ? "al-btn-loading" : ""} ${loginSuccess ? "al-btn-ok" : ""}`}
              disabled={Loading || loginSuccess}
            >
              {loginSuccess ? (
                <>
                  <div className="al-progbar" style={{ width: `${scanProgress}%` }} />
                  <span className="al-btxt">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FFAE" strokeWidth="2.5" style={{ marginRight: 8 }}>
                      <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                    </svg>
                    ACCESS VERIFIED
                  </span>
                </>
              ) : Loading ? (
                <span className="al-btxt"><span className="al-spin" />AUTHENTICATING...</span>
              ) : (
                <span className="al-btxt">
                  ACCESS SYSTEM
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 8 }}>
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              )}
              <div className="al-sweep" />
            </button>
          </form>

          {/* Security info strip */}
          <div className="al-sec-strip">
            {[
              { icon: "🔐", text: "AES-256" },
              { icon: "🛡", text: "SSL/TLS" },
              { icon: "👁", text: "RBAC" },
              { icon: "📋", text: "LOGGED" },
            ].map(b => (
              <div key={b.text} className="al-sec-item">
                <span className="al-sec-ico">{b.icon}</span>
                <span className="al-sec-txt">{b.text}</span>
              </div>
            ))}
          </div>

          <p className="al-foot">All access is logged, monitored & audited · JIT PERMIGO v2.0</p>
        </div>
      </div>

      {/* ══ SUCCESS OVERLAY ══ */}
      {loginSuccess && (
        <div className={`al-so al-so-p${successPhase}`}>
          {/* Horizontal scan beam */}
          <div className="al-so-beam" />

          {/* Grid */}
          <div className="al-so-grid" />

          {/* Scan lines */}
          <div className="al-so-scanlines" />

          {/* Concentric rings */}
          <div className="al-so-rings">
            {[1,2,3,4,5].map(n => <div key={n} className={`al-so-ring al-so-ring${n}`} />)}
          </div>

          {/* Central content */}
          {successPhase >= 2 && (
            <div className="al-so-center">
              <div className="al-so-shield">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="sosg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00FFAE" />
                      <stop offset="100%" stopColor="#00E5FF" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z" fill="url(#sosg)" />
                  <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="al-so-tag">AUTHENTICATION COMPLETE</div>
              <div className="al-so-main">ACCESS GRANTED</div>
              <div className="al-so-sub">Identity verified · Initialising secure session...</div>
              <div className="al-so-prog">
                <div className="al-so-prog-bar" style={{ width: `${scanProgress}%` }} />
              </div>
              <div className="al-so-pct">{scanProgress}%</div>
            </div>
          )}

          {/* Tunnel zoom (phase 3) */}
          {successPhase === 3 && (
            <div className="al-so-tunnel">
              {[1,2,3,4,5,6,7,8].map(n => <div key={n} className="al-so-tunnel-ring" style={{ animationDelay: `${n * 0.05}s` }} />)}
            </div>
          )}

          {/* Corner HUD marks */}
          <div className="al-so-hud al-so-hud-tl" />
          <div className="al-so-hud al-so-hud-tr" />
          <div className="al-so-hud al-so-hud-bl" />
          <div className="al-so-hud al-so-hud-br" />
        </div>
      )}

      {/* ══ DENIED OVERLAY ══ */}
      {showDenied && (
        <div className={`al-do al-do-p${deniedPhase}`}>
          {/* Red scanlines */}
          <div className="al-do-scanlines" />

          {/* Glitch bars */}
          <div className="al-do-glitch">
            {[1,2,3,4,5,6].map(n => <div key={n} className={`al-do-bar al-do-bar${n}`} />)}
          </div>

          {/* Warning content */}
          {deniedPhase >= 2 && (
            <div className="al-do-center">
              <div className="al-do-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="rgba(255,30,60,0.3)" stroke="#ff1e3c" strokeWidth="1.5" />
                  <line x1="12" y1="9" x2="12" y2="13" stroke="#ff1e3c" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="#ff1e3c" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="al-do-tag">SECURITY ALERT</div>
              <div className="al-do-main">ACCESS DENIED</div>
              {deniedMsg && (
                <div className="al-do-reason">{deniedMsg}</div>
              )}
              <div className="al-do-sub">Attempt logged · Session terminated · Try again</div>
              <div className="al-do-code">ERR_AUTH · {new Date().toISOString()}</div>
            </div>
          )}

          {/* Corner HUD */}
          <div className="al-do-hud al-do-hud-tl" />
          <div className="al-do-hud al-do-hud-tr" />
          <div className="al-do-hud al-do-hud-bl" />
          <div className="al-do-hud al-do-hud-br" />
          <div className="al-do-footer">
          </div>
        </div>
      )}

      {/* ═══ STYLES ═══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

        /* ─ Root ─ */
        .al-root {
          position: fixed; inset: 0; overflow: hidden;
          background: radial-gradient(ellipse at 30% 50%, #071524 0%, #040B16 60%, #020810 100%);
          font-family: 'Orbitron', 'Share Tech Mono', monospace;
          display: flex; align-items: center; justify-content: center;
        }

        /* ─ Canvas ─ */
        .al-canvas { position: absolute; inset: 0; z-index: 0; pointer-events: none; }

        /* ─ Grid ─ */
        .al-grid {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,229,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.035) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridDrift 24s linear infinite;
        }
        @keyframes gridDrift { to { background-position: 48px 48px; } }

        /* ─ Scanlines ─ */
        .al-scanlines {
          position: absolute; inset: 0; z-index: 2; pointer-events: none;
          background: repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px);
        }

        /* ─ Ambient orbs ─ */
        .al-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .al-orb1 { width: 500px; height: 500px; top: -150px; left: -100px; background: rgba(0,229,255,0.04); animation: orbFloat 14s ease-in-out infinite; }
        .al-orb2 { width: 400px; height: 400px; bottom: -120px; right: -80px; background: rgba(59,130,246,0.05); animation: orbFloat 18s ease-in-out infinite reverse; }
        .al-orb3 { width: 300px; height: 300px; top: 40%; right: 15%; background: rgba(139,92,246,0.04); animation: orbFloat 11s ease-in-out infinite 3s; }
        @keyframes orbFloat { 0%,100%{transform:translate(0,0);} 50%{transform:translate(20px,-30px);} }

        /* ─ Radar ─ */
        .al-radar {
          position: absolute; bottom: -130px; right: -130px; z-index: 1;
          width: 360px; height: 360px; border-radius: 50%;
          border: 1px solid rgba(0,229,255,0.12); pointer-events: none;
        }
        .al-radar::before {
          content:''; position:absolute; inset:0; border-radius:50%;
          background: conic-gradient(rgba(0,229,255,0.18) 0deg, transparent 55deg, transparent 360deg);
          animation: radarSpin 4s linear infinite;
        }
        .al-radar::after {
          content:''; position:absolute; inset:55px;
          border:1px solid rgba(0,229,255,0.07); border-radius:50%;
        }
        @keyframes radarSpin { to { transform: rotate(360deg); } }

        /* ─ Server racks ─ */
        .al-servers {
          position: absolute; top:50%; transform:translateY(-50%);
          display:flex; flex-direction:column; gap:6px;
          z-index:2; pointer-events:none;
        }
        .al-srv-l { left:18px; }
        .al-srv-r { right:18px; }
        .al-rack-row {
          display:flex; align-items:center; gap:5px;
          background:rgba(0,229,255,0.025);
          border:1px solid rgba(0,229,255,0.07);
          border-radius:3px; padding:5px 8px; width:145px;
          animation: rackFade 3s ease-in-out infinite;
        }
        @keyframes rackFade { 0%,100%{opacity:0.8;} 50%{opacity:1;} }
        .al-rack-bar { flex:1; height:3px; border-radius:2px; background:linear-gradient(90deg,rgba(0,229,255,0.25),rgba(0,229,255,0.04)); }
        .al-rack-bar2 { background:linear-gradient(90deg,rgba(59,130,246,0.25),rgba(59,130,246,0.04)); }
        .al-led { width:6px;height:6px;border-radius:50%;flex-shrink:0;animation:blink 1.8s ease-in-out infinite; }
        .al-led-c { background:#00E5FF;box-shadow:0 0 6px #00E5FF; }
        .al-led-g { background:#00FFAE;box-shadow:0 0 6px #00FFAE; }
        .al-led-b { background:#3B82F6;box-shadow:0 0 6px #3B82F6; }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.18;} }
        .al-rack-label { text-align:center;font-size:8px;letter-spacing:2px;color:rgba(0,229,255,0.3);margin-top:4px; }
        @media (max-width:1100px){.al-servers{display:none;}}

        /* ─ Globe ─ */
        .al-globe-wrap {
          position:absolute; top:8%; left:8%; z-index:2; pointer-events:none;
          display:flex; flex-direction:column; align-items:center; gap:6px;
          animation:globeFloat 9s ease-in-out infinite;
        }
        @keyframes globeFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-18px);}}
        .al-globe{width:130px;height:130px;position:relative;display:flex;align-items:center;justify-content:center;}
        .al-ring{position:absolute;border-radius:50%;border:1px solid rgba(0,229,255,0.25);animation:spinRing 7s linear infinite;}
        .al-ring1{width:100%;height:100%;}
        .al-ring2{width:80%;height:80%;border-color:rgba(59,130,246,0.35);animation-duration:5s;animation-direction:reverse;}
        .al-ring3{width:60%;height:60%;border-color:rgba(0,255,174,0.25);animation-duration:3.5s;}
        .al-ring4{width:40%;height:40%;border-color:rgba(139,92,246,0.2);animation-duration:2.5s;animation-direction:reverse;}
        @keyframes spinRing{to{transform:rotate(360deg);}}
        .al-globe-core{font-size:34px;filter:drop-shadow(0 0 14px rgba(0,229,255,0.7));}
        .al-globe-label{font-size:8px;letter-spacing:3px;color:rgba(0,229,255,0.35);}
        @media (max-width:900px){.al-globe-wrap{display:none;}}

        /* ─ Clock ─ */
        .al-clock-panel {
          position:absolute; top:20px; right:20px; z-index:10;
          background:rgba(7,17,31,0.75); border:1px solid rgba(0,229,255,0.2);
          border-radius:8px; padding:8px 14px; text-align:right;
          backdrop-filter:blur(12px);
          display:flex; flex-direction:column; gap:2px;
        }
        .al-clock-time{font-size:20px;font-weight:700;color:#00E5FF;letter-spacing:2px;text-shadow:0 0 12px rgba(0,229,255,0.5);}
        .al-clock-date{font-size:8px;letter-spacing:1.5px;color:rgba(0,229,255,0.4);}
        .al-clock-dot{width:6px;height:6px;background:#00FFAE;border-radius:50%;box-shadow:0 0 6px #00FFAE;align-self:flex-end;animation:blink 1s ease-in-out infinite;}
        @media (max-width:600px){.al-clock-panel{display:none;}}

        /* ─ Widgets ─ */
        .al-widget {
          position:absolute; z-index:3;
          background:rgba(4,11,22,0.8); border-radius:10px;
          border:1px solid rgba(0,229,255,0.18);
          padding:10px 14px; backdrop-filter:blur(12px);
          display:flex; flex-direction:column; gap:3px;
          pointer-events:none; min-width:110px;
          animation:widgetPulse 5s ease-in-out infinite;
        }
        .al-w-tl{top:130px;left:175px;} .al-w-tr{top:130px;right:175px;}
        .al-w-bl{bottom:130px;left:175px;} .al-w-br{bottom:130px;right:175px;}
        @keyframes widgetPulse{0%,100%{border-color:rgba(0,229,255,0.18);}50%{border-color:rgba(0,229,255,0.45);}}
        .al-wdot{width:7px;height:7px;border-radius:50%;margin-bottom:2px;}
        .al-wdot-g{background:#00FFAE;box-shadow:0 0 7px #00FFAE;animation:blink 2s infinite;}
        .al-wdot-c{background:#00E5FF;box-shadow:0 0 7px #00E5FF;animation:blink 1.6s infinite;}
        .al-wdot-p{background:#8B5CF6;box-shadow:0 0 7px #8B5CF6;animation:blink 2.4s infinite;}
        .al-wlabel{font-size:8px;letter-spacing:2px;color:rgba(0,229,255,0.4);}
        .al-wval{font-size:12px;font-weight:700;}
        .al-wval-g{color:#00FFAE;text-shadow:0 0 8px rgba(0,255,174,0.5);}
        .al-wval-c{color:#00E5FF;text-shadow:0 0 8px rgba(0,229,255,0.5);}
        .al-wval-p{color:#8B5CF6;text-shadow:0 0 8px rgba(139,92,246,0.5);}
        .al-wbar-bg{height:2px;background:rgba(255,255,255,0.07);border-radius:2px;margin-top:4px;}
        .al-wbar{height:100%;border-radius:2px;transition:width 1s ease;}
        .al-wbar-g{background:linear-gradient(90deg,#00FFAE,#00c88a);box-shadow:0 0 4px #00FFAE;}
        .al-wbar-c{background:linear-gradient(90deg,#00E5FF,#0099cc);box-shadow:0 0 4px #00E5FF;}
        .al-wbar-p{background:linear-gradient(90deg,#8B5CF6,#6d3ec9);box-shadow:0 0 4px #8B5CF6;}
        @media (max-width:1280px){.al-widget{display:none;}}

        /* ─ Back ─ */
        .al-back {
          position:absolute; top:20px; left:20px; z-index:10;
          background:rgba(0,229,255,0.04); border:1px solid rgba(0,229,255,0.25);
          color:rgba(0,229,255,0.7); padding:7px 13px; border-radius:6px;
          cursor:pointer; font-size:10px; letter-spacing:2px;
          display:flex; align-items:center; gap:5px; transition:all 0.2s;
          font-family:inherit;
        }
        .al-back:hover{background:rgba(0,229,255,0.1);color:#00E5FF;box-shadow:0 0 14px rgba(0,229,255,0.2);transform:translateX(-3px);}

        /* ─ Panel wrap ─ */
        .al-wrap {
          position:relative; z-index:5; width:100%; max-width:468px; padding:0 16px;
          opacity:0; transform:translateY(44px) scale(0.95);
          transition:opacity 0.85s cubic-bezier(0.2,0.85,0.2,1) 0.25s,
                      transform 0.85s cubic-bezier(0.2,0.85,0.2,1) 0.25s;
        }
        .al-in{opacity:1;transform:translateY(0) scale(1);}
        .al-shake{animation:shakeX 0.65s ease;}
        @keyframes shakeX{0%,100%{transform:translateX(0)}15%{transform:translateX(-9px)}30%{transform:translateX(9px)}45%{transform:translateX(-6px)}60%{transform:translateX(6px)}75%{transform:translateX(-3px)}}
        .al-win{filter:drop-shadow(0 0 36px rgba(0,255,174,0.45));}

        /* ─ Panel ─ */
        .al-panel {
          background:linear-gradient(160deg,rgba(6,16,32,0.92) 0%,rgba(4,11,22,0.96) 100%);
          border:1px solid rgba(0,229,255,0.22); border-radius:22px;
          padding:36px 38px 26px; position:relative;
          backdrop-filter:blur(28px) saturate(1.3);
          box-shadow:
            0 0 0 1px rgba(0,229,255,0.06),
            0 4px 60px rgba(0,0,0,0.5),
            0 0 50px rgba(0,229,255,0.07),
            inset 0 1px 0 rgba(255,255,255,0.04),
            inset 0 0 60px rgba(0,229,255,0.015);
          will-change:transform;
        }

        /* Corner accents */
        .al-c{position:absolute;width:18px;height:18px;pointer-events:none;z-index:1;}
        .al-c-tl{top:-1px;left:-1px;border-top:2px solid #00E5FF;border-left:2px solid #00E5FF;border-radius:5px 0 0 0;}
        .al-c-tr{top:-1px;right:-1px;border-top:2px solid #00E5FF;border-right:2px solid #00E5FF;border-radius:0 5px 0 0;}
        .al-c-bl{bottom:-1px;left:-1px;border-bottom:2px solid #00E5FF;border-left:2px solid #00E5FF;border-radius:0 0 0 5px;}
        .al-c-br{bottom:-1px;right:-1px;border-bottom:2px solid #00E5FF;border-right:2px solid #00E5FF;border-radius:0 0 5px 0;}



        /* ─ Header ─ */
        .al-hdr{text-align:center;margin-bottom:26px;}

        .al-shield-wrap{position:relative;width:80px;height:80px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;}
        .al-shield{
          width:72px;height:72px;border-radius:50%;
          background:radial-gradient(circle at 35% 35%,rgba(0,229,255,0.18),rgba(59,130,246,0.1) 70%,rgba(0,0,0,0.2));
          border:1px solid rgba(0,229,255,0.35);
          display:flex;align-items:center;justify-content:center;
          animation:shieldFloat 5s ease-in-out infinite;
          box-shadow:0 0 20px rgba(0,229,255,0.15),inset 0 0 20px rgba(0,229,255,0.05);
        }
        @keyframes shieldFloat{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-7px) scale(1.02);}}
        .al-pulse1,.al-pulse2{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(0,229,255,0.3);pointer-events:none;}
        .al-pulse1{animation:pulse 2.5s ease-out infinite;}
        .al-pulse2{animation:pulse 2.5s ease-out infinite 1.25s;}
        @keyframes pulse{0%{transform:scale(1);opacity:0.8;}100%{transform:scale(1.55);opacity:0;}}

        .al-sys-tag{font-size:8px;letter-spacing:3px;color:rgba(0,229,255,0.3);margin-bottom:6px;}

        .al-title{
          font-size:clamp(12px,1.8vw,16px);font-weight:800;letter-spacing:3px;
          color:#00E5FF;margin:0 0 5px;min-height:26px;
          text-shadow:0 0 24px rgba(0,229,255,0.6),0 0 40px rgba(0,229,255,0.2);
        }
        .al-cur{animation:cursorBlink 1.1s step-end infinite;color:#00FFAE;}
        @keyframes cursorBlink{0%,100%{opacity:1;}50%{opacity:0;}}

        .al-sub{font-size:10px;letter-spacing:2.5px;color:rgba(0,229,255,0.35);margin:0 0 12px;}

        .al-stat-bar{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;}
        .al-st{font-size:8px;letter-spacing:1px;padding:3px 8px;border-radius:4px;border:1px solid;}
        .al-st-g{color:#00FFAE;border-color:rgba(0,255,174,0.3);background:rgba(0,255,174,0.06);}
        .al-st-c{color:#00E5FF;border-color:rgba(0,229,255,0.3);background:rgba(0,229,255,0.06);}
        .al-st-p{color:#8B5CF6;border-color:rgba(139,92,246,0.3);background:rgba(139,92,246,0.06);}
        .al-st-div{width:1px;height:10px;background:rgba(0,229,255,0.2);}

        /* ─ Form ─ */
        .al-form{display:flex;flex-direction:column;gap:14px;}

        .al-field{
          display:flex;align-items:center;gap:12px;
          background:rgba(0,229,255,0.025);
          border:1px solid rgba(0,229,255,0.12);
          border-radius:11px;padding:0 14px;
          transition:border-color 0.3s,box-shadow 0.3s,background 0.3s;
          cursor:text;
        }
        .al-field.al-focused{
          background:rgba(0,229,255,0.04);
          border-color:rgba(0,229,255,0.55);
          box-shadow:0 0 0 3px rgba(0,229,255,0.07),0 0 22px rgba(0,229,255,0.09);
        }
        .al-ficon{color:rgba(0,229,255,0.4);flex-shrink:0;display:flex;transition:color 0.3s;}
        .al-field.al-focused .al-ficon{color:#00E5FF;}

        .al-iwrap{flex:1;position:relative;}
        .al-inp{
          width:100%;height:52px;background:transparent;border:none;outline:none;
          color:#dff9ff;font-size:13px;letter-spacing:1px;
          padding:20px 30px 6px 0;font-family:'Share Tech Mono',monospace;
          caret-color:#00FFAE;
        }
        .al-inp::-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #040B16 inset;-webkit-text-fill-color:#dff9ff;}

        .al-lbl{
          position:absolute;left:0;top:18px;font-size:9px;
          letter-spacing:2px;color:rgba(0,229,255,0.3);
          transition:all 0.22s cubic-bezier(0.4,0,0.2,1);pointer-events:none;
        }
        .al-inp:focus~.al-lbl,.al-inp:not(:placeholder-shown)~.al-lbl{
          top:5px;font-size:7.5px;color:#00E5FF;letter-spacing:2.5px;
        }

        .al-scan-bar{
          position:absolute;bottom:0;left:0;height:1.5px;width:0;
          background:linear-gradient(90deg,transparent,#00E5FF,#00FFAE,transparent);
          transition:width 0.35s cubic-bezier(0.4,0,0.2,1);border-radius:1px;
        }
        .al-field.al-focused .al-scan-bar{width:100%;}

        .al-eye{
          position:absolute;right:0;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;
          color:rgba(0,229,255,0.35);padding:4px;
          transition:color 0.2s;display:flex;
        }
        .al-eye:hover{color:#00E5FF;}

        /* ─ Strength ─ */
        .al-strength{display:flex;align-items:center;gap:8px;}
        .al-str-bars{display:flex;gap:4px;flex:1;}
        .al-str-seg{height:3px;flex:1;border-radius:2px;transition:background 0.3s,box-shadow 0.3s;}
        .al-str-lbl{font-size:8px;letter-spacing:2px;font-weight:700;white-space:nowrap;min-width:55px;text-align:right;}

        /* ─ Remember + Forgot ─ */
        .al-remember-row{display:flex;align-items:center;justify-content:space-between;gap:8px;}
        .al-remember{display:flex;align-items:center;gap:7px;cursor:pointer;}
        .al-chk{display:none;}
        .al-chk-box{
          width:14px;height:14px;border:1px solid rgba(0,229,255,0.3);
          border-radius:3px;background:rgba(0,229,255,0.03);
          display:flex;align-items:center;justify-content:center;
          transition:all 0.2s;flex-shrink:0;
        }
        .al-chk:checked~.al-chk-box{background:rgba(0,255,174,0.1);border-color:#00FFAE;box-shadow:0 0 8px rgba(0,255,174,0.2);}
        .al-chk-label{font-size:9px;letter-spacing:1px;color:rgba(0,229,255,0.4);}
        .al-forgot{
          font-size:9px;letter-spacing:1px;color:rgba(0,229,255,0.35);
          text-decoration:none;display:flex;align-items:center;gap:4px;
          transition:color 0.2s;
        }
        .al-forgot:hover{color:#00E5FF;}

        /* ─ Error ─ */
        .al-err{
          display:flex;align-items:center;gap:8px;
          color:#ff4d6d;font-size:9px;letter-spacing:1.5px;
          padding:9px 12px;background:rgba(255,77,109,0.07);
          border:1px solid rgba(255,77,109,0.22);border-radius:7px;
          animation:errIn 0.3s ease;
        }
        @keyframes errIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}

        /* ─ Bypass Warning Note ─ */
        .al-bypass-note {
          display:flex; align-items:flex-start; gap:10px;
          padding:10px 14px;
          background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.06));
          border:1px solid rgba(245,158,11,0.4);
          border-left:3px solid #f59e0b;
          border-radius:8px;
          animation:bypassNoteIn 0.4s cubic-bezier(0.2,0.85,0.2,1),bypassPulse 2.5s ease-in-out 0.4s infinite;
          box-shadow:0 0 16px rgba(245,158,11,0.1),inset 0 0 16px rgba(245,158,11,0.03);
        }
        @keyframes bypassNoteIn{from{opacity:0;transform:translateY(-6px) scale(0.97)}to{opacity:1;transform:none}}
        @keyframes bypassPulse{0%,100%{border-color:rgba(245,158,11,0.4);box-shadow:0 0 16px rgba(245,158,11,0.1);}50%{border-color:rgba(245,158,11,0.7);box-shadow:0 0 24px rgba(245,158,11,0.22);}}
        .al-bypass-icon {
          flex-shrink:0; display:flex; margin-top:1px;
          animation:iconGlow 1.8s ease-in-out infinite;
          filter:drop-shadow(0 0 5px rgba(245,158,11,0.6));
        }
        @keyframes iconGlow{0%,100%{filter:drop-shadow(0 0 4px rgba(245,158,11,0.5));}50%{filter:drop-shadow(0 0 9px rgba(245,158,11,0.9));}}
        .al-bypass-text {
          display:flex; flex-direction:column; gap:3px;
        }
        .al-bypass-title {
          font-size:8px; letter-spacing:2.5px; font-weight:800;
          color:#f59e0b; text-shadow:0 0 10px rgba(245,158,11,0.5);
        }
        .al-bypass-msg {
          font-size:8.5px; letter-spacing:1px; line-height:1.5;
          color:rgba(255,220,130,0.85); font-family:'Share Tech Mono',monospace;
        }

        /* ─ Submit ─ */
        .al-btn{
          position:relative;overflow:hidden;
          width:100%;height:56px;border-radius:11px;cursor:pointer;
          background:linear-gradient(135deg,rgba(0,229,255,0.12) 0%,rgba(59,130,246,0.18) 100%);
          border:1px solid rgba(0,229,255,0.45);
          color:#00E5FF;font-size:12px;font-weight:800;letter-spacing:3px;
          font-family:'Orbitron',monospace;
          transition:all 0.3s;
          box-shadow:0 0 20px rgba(0,229,255,0.08),inset 0 1px 0 rgba(255,255,255,0.04);
          margin-top:2px;
        }
        .al-btn:hover:not(:disabled){
          background:linear-gradient(135deg,rgba(0,229,255,0.2) 0%,rgba(59,130,246,0.28) 100%);
          box-shadow:0 0 40px rgba(0,229,255,0.25),0 8px 30px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.06);
          transform:translateY(-2px);border-color:rgba(0,229,255,0.7);
        }
        .al-btn:active:not(:disabled){transform:translateY(0);}
        .al-btn:disabled{cursor:not-allowed;opacity:0.75;}
        .al-btn-ok{border-color:rgba(0,255,174,0.6);color:#00FFAE;box-shadow:0 0 35px rgba(0,255,174,0.25);}

        .al-btxt{display:flex;align-items:center;justify-content:center;position:relative;z-index:1;}

        .al-sweep{
          position:absolute;top:0;left:-100%;width:55%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(0,229,255,0.12),transparent);
          animation:sweepMove 3.5s ease-in-out infinite;
        }
        @keyframes sweepMove{0%{left:-100%}60%,100%{left:160%}}

        .al-progbar{position:absolute;top:0;left:0;height:100%;z-index:0;background:linear-gradient(90deg,rgba(0,255,174,0.08),rgba(0,255,174,0.25));transition:width 0.04s linear;}

        .al-spin{
          width:14px;height:14px;border:2px solid rgba(0,229,255,0.25);
          border-top-color:#00E5FF;border-radius:50%;
          display:inline-block;margin-right:8px;
          animation:spinAnim 0.75s linear infinite;
        }
        @keyframes spinAnim{to{transform:rotate(360deg)}}

        /* ─ Security strip ─ */
        .al-sec-strip{
          display:flex;gap:0;margin-top:20px;
          border-top:1px solid rgba(0,229,255,0.08);
          padding-top:16px;
        }
        .al-sec-item{
          flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;
          padding:8px 4px;border-radius:8px;cursor:default;
          transition:background 0.2s;
        }
        .al-sec-item:hover{background:rgba(0,229,255,0.04);}
        .al-sec-ico{font-size:14px;filter:drop-shadow(0 0 4px rgba(0,229,255,0.4));}
        .al-sec-txt{font-size:7px;letter-spacing:1.5px;color:rgba(0,229,255,0.35);font-weight:600;}

        .al-foot{text-align:center;font-size:7.5px;letter-spacing:1px;color:rgba(0,229,255,0.18);margin:10px 0 0;}

        /* ─ Success overlay ─ */
        .al-success-overlay{
          position:fixed;inset:0;z-index:100;pointer-events:none;
          background:repeating-linear-gradient(transparent,transparent 2px,rgba(0,229,255,0.018) 2px,rgba(0,229,255,0.018) 4px);
          animation:successScan 0.06s linear infinite;
        }
        @keyframes successScan{0%{background-position:0 0}100%{background-position:0 4px}}

        /* ═══════════════════════════════════════
           RESPONSIVE
        ═══════════════════════════════════════ */

        /* ── Tablet (≤ 1100px) ── */
        @media (max-width:1100px){
          .al-servers{display:none;}
        }
        @media (max-width:1280px){
          .al-widget{display:none;}
        }

        /* ── Small tablet / large phone (≤ 900px) ── */
        @media (max-width:900px){
          .al-globe-wrap{display:none;}
          .al-clock-panel{display:none;}
          .al-wrap{max-width:100%;padding:0 12px;}
        }

        /* ── Mobile (≤ 640px) ── */
        @media (max-width:640px){
          /* root: allow vertical scroll so panel is never clipped */
          .al-root{
            position:fixed;inset:0;
            overflow-y:auto;overflow-x:hidden;
            align-items:flex-start;
            padding:60px 0 24px;
          }
          .al-canvas{position:fixed;}
          .al-grid,.al-scanlines,.al-orb,.al-radar{position:fixed;}

          /* panel */
          .al-wrap{
            padding:0 12px;
            width:100%;
          }
          .al-panel{
            padding:24px 18px 20px;
            border-radius:16px;
          }

          /* back button */
          .al-back{
            position:fixed;top:12px;left:12px;
            padding:6px 10px;font-size:9px;letter-spacing:1.5px;
          }

          /* header */
          .al-shield-wrap{width:60px;height:60px;}
          .al-shield{width:54px;height:54px;}
          .al-sys-tag{font-size:7px;letter-spacing:2px;}
          .al-title{font-size:12px;letter-spacing:2px;}
          .al-sub{font-size:9px;letter-spacing:1.5px;margin-bottom:8px;}

          /* status badges – wrap tightly */
          .al-stat-bar{gap:4px;}
          .al-st{font-size:7px;padding:2px 6px;letter-spacing:0.5px;}
          .al-st-div{display:none;}

          /* form */
          .al-form{gap:10px;}
          .al-field{padding:0 10px;border-radius:8px;}
          .al-inp{height:48px;font-size:12px;padding:16px 28px 4px 0;}
          .al-lbl{font-size:8px;letter-spacing:1.5px;top:15px;}
          .al-inp:focus~.al-lbl,.al-inp:not(:placeholder-shown)~.al-lbl{top:3px;font-size:7px;}

          /* remember / forgot row: stack */
          .al-remember-row{
            flex-direction:column;align-items:flex-start;gap:8px;
          }
          .al-chk-label{font-size:8px;}
          .al-forgot{font-size:8px;}

          /* submit button */
          .al-btn{height:50px;font-size:11px;letter-spacing:2px;border-radius:9px;}

          /* security strip */
          .al-sec-strip{gap:0;padding-top:12px;margin-top:14px;}
          .al-sec-ico{font-size:12px;}
          .al-sec-txt{font-size:6px;letter-spacing:1px;}

          /* footer */
          .al-foot{font-size:7px;letter-spacing:0.5px;}
        }

        /* ── Extra small (≤ 400px) ── */
        @media (max-width:400px){
          .al-root{padding:52px 0 16px;}
          .al-panel{padding:20px 14px 16px;border-radius:12px;}
          .al-title{font-size:10px;letter-spacing:1.5px;}
          .al-stat-bar{gap:3px;}
          .al-st{font-size:6px;padding:2px 5px;}
          .al-btn{height:46px;font-size:10px;letter-spacing:1.5px;}
          .al-sec-item{padding:6px 2px;}
        }

        /* ── Success overlay responsive ── */
        @media (max-width:640px){
          .al-so-main{font-size:clamp(22px,7vw,34px);letter-spacing:3px;}
          .al-so-prog{width:200px;}
          .al-so-sub{font-size:9px;letter-spacing:1px;text-align:center;padding:0 16px;}
          .al-so-tag{font-size:8px;letter-spacing:2px;}
          .al-so-shield svg{width:48px;height:48px;}
        }

        /* ── Denied overlay responsive ── */
        @media (max-width:640px){
          .al-do-main{font-size:clamp(22px,7vw,34px);letter-spacing:3px;}
          .al-do-reason{font-size:13px;padding:8px 16px;letter-spacing:1px;max-width:90vw;}
          .al-do-sub{font-size:9px;letter-spacing:1px;text-align:center;padding:0 12px;}
          .al-do-tag{font-size:8px;letter-spacing:3px;}
          .al-do-icon svg{width:46px;height:46px;}
        }

        /* ══════════════════════════════════════
           SUCCESS OVERLAY
        ══════════════════════════════════════ */
        .al-so {
          position:fixed;inset:0;z-index:200;
          display:flex;align-items:center;justify-content:center;
          background:rgba(0,8,18,0);
          transition:background 0.4s ease;
          pointer-events:none;
          overflow:hidden;
        }
        .al-so-p1 { background:rgba(0,8,18,0.55); }
        .al-so-p2 { background:rgba(0,8,18,0.88); }
        .al-so-p3 { background:rgba(0,4,10,0.96); }

        /* Scan beam */
        .al-so-beam {
          position:absolute;left:0;right:0;height:3px;
          background:linear-gradient(90deg,transparent,#00FFAE 30%,#00E5FF 50%,#00FFAE 70%,transparent);
          box-shadow:0 0 30px #00FFAE,0 0 60px rgba(0,255,174,0.4);
          animation:soBeamDrop 1s cubic-bezier(0.4,0,0.6,1) forwards;
          top:-4px;
        }
        @keyframes soBeamDrop {
          0%{top:-4px;opacity:0;}
          20%{opacity:1;}
          100%{top:100vh;opacity:0.6;}
        }

        /* Grid overlay */
        .al-so-grid {
          position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(0,255,174,0.06) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,255,174,0.06) 1px,transparent 1px);
          background-size:60px 60px;
          animation:soGridIn 0.5s ease forwards;
          opacity:0;
        }
        @keyframes soGridIn{to{opacity:1;}}

        .al-so-scanlines {
          position:absolute;inset:0;pointer-events:none;
          background:repeating-linear-gradient(
            transparent,transparent 2px,rgba(0,255,174,0.025) 2px,rgba(0,255,174,0.025) 4px
          );
        }

        /* Concentric rings */
        .al-so-rings{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;}
        .al-so-ring{
          position:absolute;border-radius:50%;border:1px solid rgba(0,255,174,0.25);
          animation:soRingExpand 2s ease-out infinite;
        }
        .al-so-ring1{width:80px;height:80px;animation-delay:0s;}
        .al-so-ring2{width:160px;height:160px;animation-delay:0.2s;border-color:rgba(0,229,255,0.2);}
        .al-so-ring3{width:260px;height:260px;animation-delay:0.4s;border-color:rgba(0,255,174,0.15);}
        .al-so-ring4{width:380px;height:380px;animation-delay:0.6s;border-color:rgba(59,130,246,0.12);}
        .al-so-ring5{width:520px;height:520px;animation-delay:0.8s;border-color:rgba(0,255,174,0.08);}
        @keyframes soRingExpand{
          0%{transform:scale(0.8);opacity:0.8;}
          100%{transform:scale(1.5);opacity:0;}
        }

        /* Central content */
        .al-so-center {
          position:relative;z-index:10;
          display:flex;flex-direction:column;align-items:center;gap:12px;
          animation:soCenterIn 0.6s cubic-bezier(0.2,0.85,0.2,1) forwards;
          opacity:0;
        }
        @keyframes soCenterIn{to{opacity:1;transform:translateY(0);}from{opacity:0;transform:translateY(20px);}}

        .al-so-shield {
          filter:drop-shadow(0 0 24px rgba(0,255,174,0.7));
          animation:soShieldPulse 1.2s ease-in-out infinite;
        }
        @keyframes soShieldPulse{
          0%,100%{filter:drop-shadow(0 0 24px rgba(0,255,174,0.7));}
          50%{filter:drop-shadow(0 0 40px rgba(0,255,174,1));}
        }

        .al-so-tag{
          font-size:10px;letter-spacing:4px;
          color:rgba(0,255,174,0.6);margin-bottom:-4px;
          animation:soFadeUp 0.4s ease 0.1s forwards;opacity:0;
        }
        .al-so-main{
          font-size:clamp(28px,5vw,48px);font-weight:900;letter-spacing:6px;
          color:#00FFAE;
          text-shadow:0 0 30px rgba(0,255,174,0.8),0 0 60px rgba(0,255,174,0.4);
          animation:soGlowPulse 1.5s ease-in-out infinite,soFadeUp 0.5s ease 0.15s forwards;opacity:0;
        }
        @keyframes soGlowPulse{
          0%,100%{text-shadow:0 0 30px rgba(0,255,174,0.8),0 0 60px rgba(0,255,174,0.4);}
          50%{text-shadow:0 0 50px rgba(0,255,174,1),0 0 100px rgba(0,255,174,0.6),0 0 140px rgba(0,229,255,0.3);}
        }
        .al-so-sub{
          font-size:11px;letter-spacing:2px;color:rgba(0,229,255,0.5);
          animation:soFadeUp 0.5s ease 0.25s forwards;opacity:0;
        }
        @keyframes soFadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

        .al-so-prog{
          width:260px;height:4px;background:rgba(0,255,174,0.1);
          border-radius:2px;overflow:hidden;border:1px solid rgba(0,255,174,0.2);
          animation:soFadeUp 0.5s ease 0.35s forwards;opacity:0;
        }
        .al-so-prog-bar{
          height:100%;
          background:linear-gradient(90deg,#00FFAE,#00E5FF);
          box-shadow:0 0 10px #00FFAE;
          transition:width 0.04s linear;
          border-radius:2px;
        }
        .al-so-pct{
          font-size:11px;letter-spacing:2px;color:rgba(0,255,174,0.4);
          animation:soFadeUp 0.5s ease 0.4s forwards;opacity:0;
        }

        /* Tunnel zoom */
        .al-so-tunnel{
          position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          perspective:600px;
          pointer-events:none;
        }
        .al-so-tunnel-ring{
          position:absolute;width:60px;height:60px;
          border:1px solid rgba(0,255,174,0.6);
          border-radius:4px;
          animation:tunnelZoom 0.6s cubic-bezier(0.4,0,0.6,1) forwards;
          opacity:0;
        }
        @keyframes tunnelZoom{
          0%{transform:scale(0.2) translateZ(0);opacity:0.9;}
          100%{transform:scale(25) translateZ(500px);opacity:0;}
        }

        /* HUD corners */
        .al-so-hud{
          position:absolute;width:24px;height:24px;
          border-color:#00FFAE;border-style:solid;
          animation:soHudIn 0.4s ease forwards;opacity:0;
        }
        @keyframes soHudIn{to{opacity:1;}}
        .al-so-hud-tl{top:16px;left:16px;border-width:2px 0 0 2px;border-radius:3px 0 0 0;}
        .al-so-hud-tr{top:16px;right:16px;border-width:2px 2px 0 0;border-radius:0 3px 0 0;}
        .al-so-hud-bl{bottom:16px;left:16px;border-width:0 0 2px 2px;border-radius:0 0 0 3px;}
        .al-so-hud-br{bottom:16px;right:16px;border-width:0 2px 2px 0;border-radius:0 0 3px 0;}

        /* ══════════════════════════════════════
           DENIED OVERLAY
        ══════════════════════════════════════ */
        .al-do {
          position:fixed;inset:0;z-index:200;
          display:flex;align-items:center;justify-content:center;
          pointer-events:none;overflow:hidden;
          background:rgba(0,0,0,0);
          transition:background 0.3s ease;
        }
        .al-do-p1{
          background:rgba(120,0,20,0.35);
          animation:doRedFlash 0.4s ease;
        }
        @keyframes doRedFlash{
          0%{background:rgba(200,0,30,0.5);}
          25%{background:rgba(180,0,20,0.6);}
          50%{background:rgba(160,0,20,0.4);}
          75%{background:rgba(140,0,15,0.5);}
          100%{background:rgba(120,0,20,0.35);}
        }
        .al-do-p2{background:rgba(8,0,4,0.82);}
        .al-do-p3{background:rgba(8,0,4,0);transition:background 0.5s ease;}

        /* Glitch bars */
        .al-do-glitch{position:absolute;inset:0;pointer-events:none;}
        .al-do-bar{
          position:absolute;left:0;right:0;
          background:rgba(255,30,60,0.15);
          animation:doGlitch 0.3s ease-in-out;
        }
        .al-do-bar1{height:4px;top:15%;animation-delay:0s;}
        .al-do-bar2{height:2px;top:30%;animation-delay:0.04s;background:rgba(255,30,60,0.1);}
        .al-do-bar3{height:6px;top:55%;animation-delay:0.08s;}
        .al-do-bar4{height:3px;top:70%;animation-delay:0.12s;background:rgba(255,100,0,0.12);}
        .al-do-bar5{height:2px;top:80%;animation-delay:0.06s;}
        .al-do-bar6{height:4px;top:42%;animation-delay:0.1s;background:rgba(255,30,60,0.08);}
        @keyframes doGlitch{
          0%{transform:translateX(0);opacity:1;}
          20%{transform:translateX(-8px);opacity:0.8;}
          40%{transform:translateX(12px);opacity:1;}
          60%{transform:translateX(-5px);opacity:0.7;}
          80%{transform:translateX(6px);opacity:0.9;}
          100%{transform:translateX(0);opacity:0;}
        }

        .al-do-scanlines{
          position:absolute;inset:0;
          background:repeating-linear-gradient(
            transparent,transparent 2px,rgba(255,30,60,0.04) 2px,rgba(255,30,60,0.04) 4px
          );
          animation:doFlicker 0.15s linear infinite;
        }
        @keyframes doFlicker{0%,100%{opacity:1;}50%{opacity:0.85;}}

        /* Warning center */
        .al-do-center{
          position:relative;z-index:10;
          display:flex;flex-direction:column;align-items:center;gap:10px;
          animation:doCenterIn 0.5s cubic-bezier(0.2,0.85,0.2,1) forwards;
          opacity:0;
        }
        @keyframes doCenterIn{from{opacity:0;transform:scale(0.9);}to{opacity:1;transform:scale(1);}}

        .al-do-icon{
          filter:drop-shadow(0 0 20px rgba(255,30,60,0.8));
          animation:doIconShake 0.4s ease;
        }
        @keyframes doIconShake{
          0%,100%{transform:translateX(0);}
          20%{transform:translateX(-6px);}
          40%{transform:translateX(6px);}
          60%{transform:translateX(-4px);}
          80%{transform:translateX(4px);}
        }

        .al-do-tag{
          font-size:10px;letter-spacing:5px;
          color:rgba(255,80,80,0.6);
          animation:soFadeUp 0.4s ease 0.1s forwards;opacity:0;
        }
        .al-do-main{
          font-size:clamp(28px,5vw,46px);font-weight:900;letter-spacing:6px;
          color:#ff1e3c;
          text-shadow:0 0 30px rgba(255,30,60,0.8),0 0 60px rgba(255,30,60,0.4);
          animation:doTextGlitch 0.8s ease,soFadeUp 0.4s ease 0.15s forwards;opacity:0;
        }
        @keyframes doTextGlitch{
          0%,100%{text-shadow:0 0 30px rgba(255,30,60,0.8);}
          25%{text-shadow:4px 0 0 rgba(0,255,200,0.5),-4px 0 0 rgba(255,30,60,0.5),0 0 30px rgba(255,30,60,0.8);}
          50%{text-shadow:-3px 0 0 rgba(0,200,255,0.4),3px 0 0 rgba(255,50,0,0.4),0 0 40px rgba(255,30,60,0.9);}
          75%{text-shadow:2px 0 0 rgba(255,0,100,0.5),-2px 0 0 rgba(0,255,174,0.4),0 0 30px rgba(255,30,60,0.7);}
        }
        .al-do-reason{
          font-size:clamp(14px,2vw,18px);font-weight:700;letter-spacing:2px;
          color:#ff6b6b;
          text-shadow:0 0 16px rgba(255,80,80,0.7),0 0 32px rgba(255,30,60,0.4);
          background:rgba(255,30,60,0.08);
          border:1px solid rgba(255,30,60,0.3);
          border-radius:8px;padding:10px 24px;
          max-width:420px;text-align:center;
          animation:soFadeUp 0.5s ease 0.2s forwards,reasonPulse 2s ease-in-out 0.7s infinite;
          opacity:0;
        }
        @keyframes reasonPulse{
          0%,100%{box-shadow:0 0 10px rgba(255,30,60,0.2);}
          50%{box-shadow:0 0 24px rgba(255,30,60,0.45),0 0 40px rgba(255,30,60,0.15);}
        }
        .al-do-sub{
          font-size:10px;letter-spacing:2px;color:rgba(255,120,120,0.4);
          animation:soFadeUp 0.4s ease 0.35s forwards;opacity:0;
        }
        .al-do-code{
          font-family:'Share Tech Mono',monospace;
          font-size:9px;letter-spacing:1px;color:rgba(255,80,80,0.3);
          animation:soFadeUp 0.4s ease 0.35s forwards;opacity:0;
        }

        /* HUD corners – red */
        .al-do-hud{
          position:absolute;width:22px;height:22px;
          border-color:#ff1e3c;border-style:solid;
          animation:soHudIn 0.3s ease forwards;opacity:0;
          box-shadow:0 0 8px rgba(255,30,60,0.5);
        }
        .al-do-hud-tl{top:16px;left:16px;border-width:2px 0 0 2px;border-radius:3px 0 0 0;}
        .al-do-hud-tr{top:16px;right:16px;border-width:2px 2px 0 0;border-radius:0 3px 0 0;}
        .al-do-hud-bl{bottom:16px;left:16px;border-width:0 0 2px 2px;border-radius:0 0 0 3px;}
        .al-do-hud-br{bottom:16px;right:16px;border-width:0 2px 2px 0;border-radius:0 0 3px 0;}
      `}</style>
    </div>
  );
};

export default AdminLogin;
