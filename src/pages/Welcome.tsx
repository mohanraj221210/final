import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Scroll reveal hook ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
      }),
      { threshold: 0.10 }
    );
    el.querySelectorAll('.reveal').forEach(n => obs.observe(n));
    return () => obs.disconnect();
  }, []);
  return ref;
}

const roles = [
  {
    id: 'student',
    title: 'Student',
    desc: 'Academics, outpass & attendance',
    route: '/student-login',
    accent: '#2563EB',
    bg: '#EFF6FF',
    gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    id: 'faculty',
    title: 'Faculty',
    desc: 'Classes, grades & communication',
    route: '/staff-login',
    accent: '#4F46E5',
    bg: '#F5F3FF',
    gradient: 'linear-gradient(135deg, #4F46E5, #4338CA)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'warden',
    title: 'Warden',
    desc: 'Hostel management & outpass',
    route: '/warden-login',
    accent: '#059669',
    bg: '#ECFDF5',
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'yearincharge',
    title: 'Year Incharge',
    desc: 'Administrative oversight',
    route: '/year-incharge-login',
    accent: '#D97706',
    bg: '#FFFBEB',
    gradient: 'linear-gradient(135deg, #D97706, #B45309)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    desc: 'Gate control & verification',
    route: '/watchmanlogin',
    accent: '#DC2626',
    bg: '#FFF1F2',
    gradient: 'linear-gradient(135deg, #DC2626, #B91C1C)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

const features = [
  {
    title: 'Digital Outpass Management',
    desc: 'End-to-end digital leave management from request to gate clearance with real-time notifications.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    color: '#2563EB',
  },
  {
    title: 'Faculty Communication',
    desc: 'Direct, secure communication channels connecting students and faculty seamlessly.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: '#4F46E5',
  },
  {
    title: 'Academic Resources',
    desc: 'Centralised attendance, marks, and performance analytics for every stakeholder.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    color: '#059669',
  },
  {
    title: 'Campus Security',
    desc: 'Real-time gate monitoring, visitor management, and intelligent access control.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    color: '#DC2626',
  },
  {
    title: 'Student Services',
    desc: 'Hostel, library, transport — all unified in one premium digital ecosystem.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
      </svg>
    ),
    color: '#D97706',
  },
  {
    title: 'Real-Time Notifications',
    desc: 'Instant push alerts for approvals, announcements, and campus-wide communications.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    color: '#7C3AED',
  },
];

const stats = [
  { value: '1000+', label: 'Students', sub: 'Active learners' },
  { value: '50+',   label: 'Faculty',  sub: 'Expert educators' },
  { value: '8',     label: 'Departments', sub: 'Academic divisions' },
  { value: '100%',  label: 'Digital Services', sub: 'Fully paperless' },
];

/* ─────────────────────────────────────────── */

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const pageRef = useScrollReveal();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="lp-root" ref={pageRef}>

      {/* ══════════════ NAV ══════════════ */}
      <header className={`lp-nav-wrap${scrolled ? ' nav-scrolled' : ''}`}>
        <nav className="lp-nav lp-container">
          <div className="nav-brand">
            <div className="nav-logo">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="10" fill="url(#logoGrad)"/>
                <path d="M9 26L18 10L27 26H9Z" fill="white" fillOpacity="0.95"/>
                <rect x="15" y="20" width="6" height="6" rx="2" fill="url(#logoGrad)"/>
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563EB"/>
                    <stop offset="0.5" stopColor="#4F46E5"/>
                    <stop offset="1" stopColor="#7C3AED"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="nav-brand-text">
              <span className="nav-name">JIT Campus One</span>
              <span className="nav-inst">Jeppiaar Institute of Technology</span>
            </div>
          </div>
          <div className="nav-right">
            <div className="nav-pill">Digital Campus Platform</div>
          </div>
        </nav>
      </header>

      <main>

        {/* ══════════════ HERO ══════════════ */}
        <section className="lp-hero">

          {/* Background image */}
          <div className="hero-image-bg" aria-hidden="true">
            <img src="/gate.jpg" alt="Jeppiaar Institute of Technology Main Gate" className="hero-bg-img" />
            <div className="hero-overlay-gradient" />
            <div className="hero-vignette" />
          </div>

          {/* Hero Content */}
          <div className="hero-content lp-container">
            <div className="hero-text-block">

              <div className="hero-eyebrow reveal fade-up">
                <span className="eyebrow-line" />
                <span>JIT Campus One · Established · Trusted</span>
              </div>

              <h1 className="hero-h1 reveal fade-up delay-1">
                Empowering Academic<br />
                <span className="h1-gold">Excellence</span> Through<br />
                Digital Innovation
              </h1>

              <p className="hero-p reveal fade-up delay-2">
                A unified platform connecting Students, Faculty, Wardens, Year Incharges, and Campus Administration.
              </p>

              <div className="hero-actions reveal fade-up delay-3">
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    document.getElementById('portals-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>Access Portals</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <button 
                  className="btn-secondary-hero"
                  onClick={() => {
                    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>Explore Features</span>
                </button>
              </div>

            </div>

            {/* Trust badge */}
            <div className="hero-badge reveal fade-up delay-4">
              <span className="badge-dot" />
              <span>Campus Systems Online</span>
              <span className="badge-divider">·</span>
              <span>1,024 Active Users</span>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="scroll-cue" aria-hidden="true">
            <div className="scroll-cue-line" />
          </div>
        </section>

        {/* ══════════════ PORTAL ACCESS ══════════════ */}
        <section id="portals-section" className="lp-roles">
          <div className="lp-container">
            <div className="section-head reveal fade-up">
              <div className="section-eyebrow">
                <span className="eyebrow-accent" />
                Portal Access
              </div>
              <h2 className="section-h2">Choose Your Role</h2>
              <p className="section-sub">Select your portal to enter the digital campus ecosystem.</p>
            </div>

            <div className="roles-grid reveal fade-up delay-1">
              {roles.map((r, idx) => (
                <button
                  key={r.id}
                  className="role-card"
                  onClick={() => navigate(r.route)}
                  style={{ 
                    '--role-accent': r.accent, 
                    '--role-bg': r.bg, 
                    '--role-gradient': r.gradient,
                    animationDelay: `${idx * 0.05}s`
                  } as React.CSSProperties}
                >
                  <div className="role-card-shine" />
                  <div className="role-card-glow" />
                  <div className="role-icon-wrap">
                    <div className="role-icon-inner">{r.icon}</div>
                  </div>
                  <div className="role-card-body">
                    <span className="role-card-title">{r.title} Portal</span>
                    <span className="role-card-desc">{r.desc}</span>
                  </div>
                  <div className="role-card-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                  <div className="role-card-bar" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ STATISTICS ══════════════ */}
        <section className="lp-stats">
          <div className="lp-container">
            <div className="stats-grid">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="stat-card reveal fade-up"
                  style={{ transitionDelay: `${0.08 * i}s` } as React.CSSProperties}
                >
                  <div className="stat-glow" />
                  <span className="stat-val">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-sub">{s.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ FEATURES ══════════════ */}
        <section id="features-section" className="lp-features">
          <div className="lp-container">
            <div className="section-head reveal fade-up">
              <div className="section-eyebrow">
                <span className="eyebrow-accent" />
                Platform Capabilities
              </div>
              <h2 className="section-h2">Everything Your Campus Needs</h2>
              <p className="section-sub">Built for modern institutions. Designed for every stakeholder.</p>
            </div>

            <div className="features-grid">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="feature-card reveal fade-up"
                  style={{ transitionDelay: `${0.07 * i}s`, '--feat-color': f.color } as React.CSSProperties}
                >
                  <div className="feat-shine" />
                  <div className="feat-icon-wrap" style={{ background: `${f.color}15` }}>
                    <span style={{ color: f.color }}>{f.icon}</span>
                  </div>
                  <h3 className="feat-title">{f.title}</h3>
                  <p className="feat-desc">{f.desc}</p>
                  <div className="feat-link">
                    <span>Learn more</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                  <div className="feat-bar" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer className="lp-footer">
          <div className="lp-container footer-inner">
            <div className="footer-brand">
              <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="url(#footLogoGrad)"/>
                <path d="M9 26L18 10L27 26H9Z" fill="white" fillOpacity="0.95"/>
                <rect x="15" y="20" width="6" height="6" rx="2" fill="url(#footLogoGrad)"/>
                <defs>
                  <linearGradient id="footLogoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563EB"/>
                    <stop offset="1" stopColor="#7C3AED"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="footer-name">JIT Campus One</span>
            </div>
            <span className="footer-copy">© 2025 Jeppiaar Institute of Technology. All rights reserved.</span>
            <span className="footer-badge">v2.0 · Digital Campus Platform</span>
          </div>
        </footer>
      </main>

      {/* ══════════════ STYLES ══════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Reset & Base ── */
        .lp-root *, .lp-root *::before, .lp-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .lp-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #F8FAFC;
          color: #111827;
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .lp-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* ══════ NAV ══════ */
        .lp-nav-wrap {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          transition: background 0.4s ease, box-shadow 0.4s ease, backdrop-filter 0.4s ease;
        }

        .lp-nav-wrap.nav-scrolled {
          background: rgba(15,23,42,0.92);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.3);
        }

        .lp-nav {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .nav-logo {
          filter: drop-shadow(0 2px 12px rgba(37,99,235,0.4));
          flex-shrink: 0;
        }

        .nav-brand-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-name {
          font-size: 17px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .nav-inst {
          font-size: 11px;
          font-weight: 500;
        }

        /* ══════ HERO ══════ */
        .lp-hero {
          position: relative;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          background: #0f172a;
        }

        .hero-image-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
          filter: contrast(1.08) saturate(1.12) brightness(0.88);
          transform: scale(1.03);
          animation: heroZoom 20s ease-in-out infinite alternate;
        }

        @keyframes heroZoom {
          0%   { transform: scale(1.03) translateX(0); }
          100% { transform: scale(1.08) translateX(-1%); }
        }

        .hero-overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(15, 23, 42, 0.95) 0%,
            rgba(15, 23, 42, 0.60) 50%,
            rgba(15, 23, 42, 0.80) 100%
          );
        }

        .hero-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at 0% 100%,
            rgba(15,23,42,0.6) 0%,
            transparent 60%
          );
        }

        .hero-content {
          position: relative;
          z-index: 2;
          padding-top: 100px;
          padding-bottom: 80px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .hero-text-block {
          max-width: 680px;
        }

        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 28px;
        }

        .eyebrow-line {
          width: 32px;
          height: 2px;
          background: linear-gradient(90deg, #D4A017, transparent);
          border-radius: 2px;
          flex-shrink: 0;
        }

        .hero-h1 {
          font-size: clamp(38px, 5.5vw, 68px);
          font-weight: 900;
          line-height: 1.06;
          letter-spacing: -2px;
          color: #FFFFFF;
          margin-bottom: 26px;
        }

        .h1-gold {
          background: linear-gradient(135deg, #D4A017 0%, #F5C842 50%, #D4A017 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          animation: goldShimmer 4s ease-in-out infinite;
        }

        @keyframes goldShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-p {
          font-size: 18px;
          color: rgba(255,255,255,0.72);
          line-height: 1.75;
          max-width: 560px;
          margin-bottom: 40px;
          font-weight: 400;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 32px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: white;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          letter-spacing: -0.2px;
          box-shadow:
            0 0 0 1px rgba(37,99,235,0.5),
            0 4px 16px rgba(37,99,235,0.4),
            0 12px 40px rgba(37,99,235,0.25);
          transition:
            transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow 0.2s ease,
            background 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          border-radius: inherit;
        }

        .btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow:
            0 0 0 1px rgba(37,99,235,0.6),
            0 8px 24px rgba(37,99,235,0.5),
            0 20px 60px rgba(37,99,235,0.3);
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
        }

        .btn-primary:active {
          transform: translateY(0) scale(0.99);
        }

        .btn-secondary-hero {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 32px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.90);
          font-size: 15px;
          font-weight: 600;
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          cursor: pointer;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          letter-spacing: -0.2px;
          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }

        .btn-secondary-hero:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.4);
          transform: translateY(-2px);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 8px 20px;
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          width: fit-content;
        }

        .badge-dot {
          width: 8px; height: 8px;
          background: #22C55E;
          border-radius: 50%;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.3);
          animation: badgePulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.3); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0.05); }
        }

        .badge-divider {
          opacity: 0.4;
        }

        .scroll-cue {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .scroll-cue-line {
          width: 1.5px;
          height: 48px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.5), transparent);
          animation: scrollCueDrop 2s ease-in-out infinite;
        }

        @keyframes scrollCueDrop {
          0% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          50% { opacity: 1; transform: scaleY(1); transform-origin: top; }
          100% { opacity: 0; transform: scaleY(1); transform-origin: bottom; }
        }

        /* ══════ ROLE SECTION ══════ */
        .lp-roles {
          padding: 100px 0;
          background: #F8FAFC;
          position: relative;
        }

        .lp-roles::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(37,99,235,0.032) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.032) 1px, transparent 1px);
          background-size: 52px 52px;
          pointer-events: none;
        }

        .section-head {
          text-align: center;
          margin-bottom: 60px;
          position: relative;
        }

        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 700;
          color: #2563EB;
          text-transform: uppercase;
          letter-spacing: 1.8px;
          margin-bottom: 16px;
        }

        .eyebrow-accent {
          display: inline-block;
          width: 20px;
          height: 2px;
          background: linear-gradient(90deg, #D4A017, #F5C842);
          border-radius: 2px;
        }

        .section-h2 {
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 900;
          letter-spacing: -1px;
          color: #0F172A;
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .section-sub {
          font-size: 17px;
          color: #64748B;
          line-height: 1.65;
          max-width: 520px;
          margin: 0 auto;
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        .role-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          padding: 20px 16px 18px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          cursor: pointer;
          transition:
            border-color 0.28s ease,
            box-shadow 0.28s ease,
            background-color 0.28s ease,
            transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          overflow: hidden;
          box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
          animation: portalFadeInUp 0.6s cubic-bezier(0.25, 1, 0.5, 1) both;
        }

        @keyframes portalFadeInUp {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .role-card-glow {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, var(--role-accent) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .role-card-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
          transform: translateX(-100%) rotate(25deg);
          transition: transform 0.7s ease;
          pointer-events: none;
        }

        .role-card:hover .role-card-shine {
          transform: translateX(200%) rotate(25deg);
        }

        .role-card:hover {
          border-color: var(--role-accent);
          box-shadow:
            0 12px 32px -8px color-mix(in srgb, var(--role-accent) 18%, transparent),
            0 4px 12px rgba(0, 0, 0, 0.03);
          transform: translateY(-4px);
        }

        .role-card:hover .role-card-glow {
          opacity: 0.15;
        }

        .role-card:active {
          transform: translateY(-1px) scale(0.98);
        }

        .role-icon-wrap {
          width: 44px; height: 44px;
          border-radius: 10px;
          background: var(--role-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), background 0.28s ease, color 0.28s ease;
          position: relative;
          z-index: 1;
        }

        .role-icon-inner {
          color: var(--role-accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .role-icon-inner svg {
          width: 20px;
          height: 20px;
        }

        .role-card:hover .role-icon-wrap {
          background: var(--role-gradient);
          color: #ffffff;
          transform: scale(1.08) rotate(-2deg);
        }
        
        .role-card:hover .role-icon-inner {
          color: #ffffff;
        }

        .role-card-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
          z-index: 1;
        }

        .role-card-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.3px;
          line-height: 1.2;
          transition: color 0.25s ease;
        }

        .role-card:hover .role-card-title {
          color: var(--role-accent);
        }

        .role-card-desc {
          font-size: 11px;
          color: #64748B;
          line-height: 1.4;
        }

        .role-card-arrow {
          color: #CBD5E1;
          transition: color 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
          z-index: 1;
          margin-top: auto;
          padding-top: 4px;
        }

        .role-card:hover .role-card-arrow {
          color: var(--role-accent);
          transform: translateX(3px);
        }

        .role-card-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--role-gradient);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
          border-radius: 0 0 16px 16px;
        }

        .role-card:hover .role-card-bar {
          transform: scaleX(1);
        }

        /* ══════ STATS ══════ */
        .lp-stats {
          padding: 0 0 100px;
          background: #F8FAFC;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-card {
          position: relative;
          background: #FFFFFF;
          border: 1.5px solid #E5E7EB;
          border-radius: 20px;
          padding: 36px 28px;
          text-align: center;
          overflow: hidden;
          transition:
            transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .stat-card:hover {
          transform: translateY(-6px);
          border-color: #BFDBFE;
          box-shadow:
            0 12px 48px -4px rgba(37,99,235,0.15),
            0 4px 16px rgba(0,0,0,0.06);
        }

        .stat-glow {
          position: absolute;
          top: -40px; left: 50%;
          transform: translateX(-50%);
          width: 140px; height: 140px;
          background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .stat-val {
          display: block;
          font-size: 46px;
          font-weight: 900;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #0F172A 0%, #2563EB 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 10px;
        }

        .stat-label {
          display: block;
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.3px;
          margin-bottom: 4px;
        }

        .stat-sub {
          display: block;
          font-size: 12px;
          color: #94A3B8;
          font-weight: 500;
        }

        /* ══════ FEATURES ══════ */
        .lp-features {
          padding: 100px 0;
          background: #FFFFFF;
          position: relative;
          overflow: hidden;
        }

        .lp-features::before {
          content: '';
          position: absolute;
          top: -200px; right: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .feature-card {
          position: relative;
          background: #FFFFFF;
          border: 1.5px solid #E5E7EB;
          border-radius: 16px;
          padding: 32px 28px;
          cursor: default;
          overflow: hidden;
          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }

        .feat-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
          transform: translateX(-100%) rotate(25deg);
          transition: transform 0.6s ease;
          pointer-events: none;
        }

        .feature-card:hover .feat-shine {
          transform: translateX(200%) rotate(25deg);
        }

        .feature-card:hover {
          border-color: color-mix(in srgb, var(--feat-color) 30%, #E5E7EB);
          box-shadow:
            0 0 0 3px color-mix(in srgb, var(--feat-color) 8%, transparent),
            0 12px 40px -4px rgba(0,0,0,0.1);
          transform: translateY(-4px);
        }

        .feat-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }

        .feature-card:hover .feat-icon-wrap {
          transform: scale(1.1) rotate(-4deg);
        }

        .feat-title {
          font-size: 16px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 10px;
          letter-spacing: -0.3px;
          position: relative;
          z-index: 1;
        }

        .feat-desc {
          font-size: 13.5px;
          color: #64748B;
          line-height: 1.65;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .feat-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 700;
          color: color-mix(in srgb, var(--feat-color) 80%, #111827);
          position: relative;
          z-index: 1;
          transition: gap 0.2s ease;
        }

        .feature-card:hover .feat-link {
          gap: 10px;
        }

        .feat-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--feat-color);
          border-radius: 0 0 16px 16px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }

        .feature-card:hover .feat-bar {
          transform: scaleX(1);
        }

        /* ══════ FOOTER ══════ */
        .lp-footer {
          border-top: 1px solid #E5E7EB;
          background: #FFFFFF;
          padding: 24px 0;
        }

        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .footer-name {
          font-size: 14px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
        }

        .footer-copy {
          font-size: 12.5px;
          color: #94A3B8;
          font-weight: 500;
        }

        .footer-badge {
          background: linear-gradient(135deg, #EFF6FF, #F5F3FF);
          border: 1px solid #E0E7FF;
          padding: 4px 14px;
          border-radius: 100px;
          font-size: 11.5px;
          font-weight: 600;
          color: #4F46E5;
          flex-shrink: 0;
        }

        /* ══════ SCROLL REVEAL ══════ */
        .reveal {
          opacity: 0;
          transition:
            opacity 0.7s cubic-bezier(0.16,1,0.3,1),
            transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }

        .fade-up   { transform: translateY(32px); }
        .fade-left { transform: translateX(40px); }

        .reveal.revealed {
          opacity: 1;
          transform: none;
        }

        .delay-1 { transition-delay: 0.08s; }
        .delay-2 { transition-delay: 0.16s; }
        .delay-3 { transition-delay: 0.26s; }
        .delay-4 { transition-delay: 0.36s; }

        /* ══════ RESPONSIVE ══════ */

        @media (max-width: 1024px) {
          .lp-hero {
            min-height: auto;
            padding-top: 100px;
            padding-bottom: 60px;
          }

          .roles-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 14px;
          }

          .role-card {
            width: calc(33.333% - 10px);
            min-width: 180px;
          }

          .role-card:nth-child(4),
          .role-card:nth-child(5) {
            width: calc(50% - 8px);
            max-width: 260px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .lp-container { padding: 0 20px; }

          .nav-inst { display: none; }
          .nav-pill { display: none; }
          .lp-nav { height: 64px; }

          .lp-hero { 
            min-height: auto;
            padding-top: 88px;
            padding-bottom: 48px;
          }

          .hero-overlay-gradient {
            background: linear-gradient(
              to top,
              rgba(15,23,42,0.92) 0%,
              rgba(15,23,42,0.5) 60%,
              rgba(15,23,42,0.7) 100%
            );
          }

          .hero-content {
            padding-top: 20px;
            padding-bottom: 40px;
            gap: 24px;
          }

          .hero-h1 {
            font-size: clamp(30px, 8vw, 44px);
            letter-spacing: -1px;
          }

          .hero-p {
            font-size: 15px;
            max-width: 100%;
            margin-bottom: 24px;
          }

          .hero-actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-primary, .btn-secondary-hero {
            width: 100%;
            justify-content: center;
            padding: 16px 24px;
          }

          .hero-badge {
            font-size: 11px;
            flex-wrap: wrap;
          }

          .lp-roles { padding: 60px 0; }
          .lp-stats { padding: 0 0 60px; }
          .lp-features { padding: 60px 0; }

          .section-head {
            margin-bottom: 40px;
          }

          .section-h2 { font-size: 26px; }
          .section-sub { font-size: 15px; }

          .roles-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .role-card {
            width: auto;
            min-width: unset;
            padding: 18px 12px;
            gap: 8px;
          }

          .role-card:nth-child(4),
          .role-card:nth-child(5) {
            width: auto;
            max-width: unset;
          }

          .role-card:nth-child(5) {
            grid-column: span 2;
          }

          .role-icon-wrap {
            width: 40px;
            height: 40px;
            border-radius: 8px;
          }

          .role-icon-inner svg {
            width: 18px;
            height: 18px;
          }

          .role-card-title { font-size: 13px; }
          .role-card-desc  { font-size: 10.5px; }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .stat-card {
            padding: 28px 20px;
          }

          .stat-val { font-size: 36px; }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .footer-inner {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }

          .footer-brand { justify-content: center; }
        }

        @media (max-width: 480px) {
          .hero-h1 { font-size: 28px; letter-spacing: -0.8px; }
          .roles-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .role-card { padding: 14px 10px; }
          .stat-val { font-size: 32px; }
        }
      `}</style>
    </div>
  );
};

export default Welcome;
