import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

/* ─── Intersection Observer Scroll Reveal ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('jit-revealed');
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.06 }
    );
    el.querySelectorAll('.jit-reveal').forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Animated Counter ─── */
function useCounter(target: number, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const pct = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setVal(Math.floor(ease * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return val;
}

/* ─── Data ─── */
const portals = [
  {
    id: 'student',
    title: 'Student Portal',
    desc: 'Your gateway to academics, resources, and campus life.',
    route: '/student-login',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: 'faculty',
    title: 'Faculty Portal',
    desc: 'Manage classes, students, and academic workflows.',
    route: '/staff-login',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'yearincharge',
    title: 'Year Incharge',
    desc: 'Oversee year activities, approvals, and monitoring.',
    route: '/year-incharge-login',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    id: 'warden',
    title: 'Warden Portal',
    desc: 'Manage systems, users, and institutional settings.',
    route: '/wardenlogin',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
      </svg>
    ),
  },
  {
    id: 'security',
    title: 'Security Portal',
    desc: 'Monitor security, visitors, and campus safety.',
    route: '/watchmanlogin',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const statsData = [
  {
    label: 'Students', value: 1200, suffix: '+', prefix: '', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
    )
  },
  {
    label: 'Faculty Members', value: 85, suffix: '+', prefix: '', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    )
  },
  {
    label: 'Departments', value: 8, suffix: '+', prefix: '', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="11" rx="2" /><path d="M3 9l9-6 9 6" /></svg>
    )
  },
  {
    label: 'Placement Rate', value: 98, suffix: '%', prefix: '', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
    )
  },
  {
    label: 'Years of Excellence', value: 15, suffix: '+', prefix: '', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
    )
  },
];

const features = [
  {
    title: 'Academic Management',
    desc: 'Centralized marks, grades, timetables and performance analytics for every stakeholder.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    title: 'Digital Outpass',
    desc: 'End-to-end digital leave management from request to gate clearance with real-time notifications.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Faculty Collaboration',
    desc: 'Seamless communication between faculty, year incharges and administration in real time.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Campus Administration',
    desc: 'Instant institutional circulars, approvals and operations managed campus-wide with receipts.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    title: 'Security Monitoring',
    desc: 'Gate control, visitor tracking and outpass verification with real-time status updates.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Transport Tracking',
    desc: 'Live campus transport schedules, route management and student tracking in one dashboard.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

/* ─── StatCard with counter ─── */
function StatCard({ stat, index }: { stat: typeof statsData[0]; index: number }) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const count = useCounter(stat.value, 1600, started);
  return (
    <div className="jit-stat-item" ref={ref} style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="jit-stat-icon">{stat.icon}</div>
      <div className="jit-stat-number">
        {stat.prefix}{count}{stat.suffix}
      </div>
      <div className="jit-stat-label">{stat.label}</div>
    </div>
  );
}

/* ─── Main Welcome Component ─── */
const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const pageRef = useScrollReveal();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroMouse, setHeroMouse] = useState({ x: 0, y: 0 });
  const [highlightEmail, setHighlightEmail] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    if (id === 'contact-section') {
      setHighlightEmail(true);
      setTimeout(() => setHighlightEmail(false), 3000);
    }
    if (id === 'jit-root') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  }, []);

  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setHeroMouse({ x, y });
  }, []);

  const handleHeroMouseLeave = useCallback(() => {
    setHeroMouse({ x: 0, y: 0 });
  }, []);

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  const handleCardMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--mouse-x', `-999px`);
    e.currentTarget.style.setProperty('--mouse-y', `-999px`);
  }, []);

  const navLinks = ['Home', 'Services', 'Campus', 'About', 'Contact'];
  const navTargets = ['jit-root', 'portals-section', 'features-section', 'about-section', 'contact-section'];

  return (
    <div className="jit-root" ref={pageRef}>
      <SEO
        title="JIT Permigo — Smart Campus Management Portal"
        description="JIT Permigo is the official digital campus management system of Jeppiaar Institute of Technology, Chennai. Manage outpass requests, track subjects, coordinate staff, and access all campus services in one place."
        keywords="JIT Permigo, Jeppiaar Institute of Technology, JIT college portal, student outpass management, campus management system, JIT student portal, JIT staff portal, digital outpass, JIT Chennai, JIT campus"
        canonical="/"
      />
      <div className={`jit-page${mounted ? ' jit-page-in' : ''}`}>

        {/* ══════════ NAV ══════════ */}
        <header className={`jit-nav-wrap${scrolled ? ' jit-nav-scrolled' : ''}`}>
          <div className="jit-scroll-progress" style={{ width: `${scrollProgress}%` }} />
          <div className="jit-nav-inner">
            {/* Logo */}
            <div className="jit-logo">
              <div className="jit-logo-box">
                <img src="/jit permigo.png" alt="Logo" />
              </div>
              <div className="jit-logo-text">
                <span className="jit-logo-title">JIT PERMIGO</span>
                <span className="jit-logo-sub">Gate Pass & Outpass Portal</span>
              </div>
            </div>

            {/* Center nav */}
            <nav className="jit-nav-center">
              {navLinks.map((link, i) => (
                <button
                  key={link}
                  className={`jit-nav-link${i === 0 ? ' jit-nav-link-active' : ''}`}
                  onClick={() => scrollTo(navTargets[i])}
                >
                  {link}
                  {i === 0 && <span className="jit-nav-underline" />}
                </button>
              ))}
            </nav>

            {/* Right CTA */}
            <div className="jit-nav-right">
              <button className="jit-nav-btn" onClick={() => scrollTo('portals-section')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Login
              </button>
            </div>
          </div>

          {/* Mobile drawer */}
          <div className={`jit-mobile-menu${mobileMenuOpen ? ' jit-mobile-open' : ''}`}>
            {navLinks.map((link, i) => (
              <button key={link} className="jit-mobile-link" onClick={() => scrollTo(navTargets[i])}>{link}</button>
            ))}
            <button className="jit-nav-btn jit-mobile-cta" onClick={() => scrollTo('portals-section')}>Login / Signup</button>
          </div>
        </header>

        <main>
          {/* ══════════ HERO ══════════ */}
          <section className="jit-hero" onMouseMove={handleHeroMouseMove} onMouseLeave={handleHeroMouseLeave}>
            <div className="jit-hero-bg">
              <div className="jit-hero-blob jit-blob-1" />
              <div className="jit-hero-blob jit-blob-2" />
              <div className="jit-hero-blob jit-blob-3" />
              <div className="jit-hero-grid" />
            </div>

            <div className="jit-container jit-hero-inner">
              {/* Left */}
              <div className="jit-hero-left">
                <div className="jit-hero-badge jit-reveal jit-fade-up">
                  <span className="jit-badge-dot" />
                  Empowering Education. Elevating Excellence.
                </div>

                <h1 className="jit-hero-h1 jit-reveal jit-fade-up jit-d1">
                  Welcome to<br />
                  <span className="jit-h1-blue">JIT PERMIGO</span>
                </h1>

                <p className="jit-hero-sub jit-reveal jit-fade-up jit-d2">
                  Digital Campus Platform for Students, Faculty,<br />
                  Administration &amp; Campus Services
                </p>

                <p className="jit-hero-desc jit-reveal jit-fade-up jit-d3">
                  Streamlined solutions for forward-thinking institutions. Experience a dynamic ecosystem built for efficiency, transparency, and collaboration.
                </p>

                <div className="jit-hero-actions jit-reveal jit-fade-up jit-d4">
                  <button className="jit-btn-primary" id="hero-access-portals" onClick={() => scrollTo('portals-section')}>
                    Access Portals
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="jit-btn-outline" id="hero-explore" onClick={() => scrollTo('features-section')}>
                    <span className="jit-play-circle">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </span>
                    Explore Features
                  </button>
                </div>
              </div>

              {/* Right — 3D Orb Visual */}
              <div
                className="jit-hero-right jit-reveal jit-fade-up jit-d1"
                style={{
                  '--hero-mouse-x': heroMouse.x,
                  '--hero-mouse-y': heroMouse.y,
                } as React.CSSProperties}
              >
                <div className="jit-orb-scene">
                  {/* Interactive SVG Orbit rings */}
                  <svg className="jit-orbit-svg jit-orbit-outer" viewBox="0 0 400 400">
                    <defs>
                      <linearGradient id="orbitG-out" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <circle cx="200" cy="200" r="180" className="jit-orbit-track" />
                    <circle cx="200" cy="200" r="180" className="jit-orbit-flow-1" />
                    <circle cx="200" cy="200" r="180" className="jit-orbit-flow-2" />
                  </svg>
                  <svg className="jit-orbit-svg jit-orbit-mid" viewBox="0 0 300 300">
                    <defs>
                      <linearGradient id="orbitG-mid" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    <circle cx="150" cy="150" r="130" className="jit-orbit-track" />
                    <circle cx="150" cy="150" r="130" className="jit-orbit-flow-mid" />
                  </svg>

                  {/* Core sphere */}
                  <div className="jit-orb-float-wrapper">
                    <div className="jit-orb-core">
                      <span className="jit-orb-label">JIT</span>
                    </div>
                  </div>

                  {/* Floating feature chips */}
                  <div className="jit-chip jit-chip-tl">
                    <div className="jit-chip-inner">
                      <div className="jit-chip-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="11" rx="2" /><path d="M3 9l9-6 9 6" /></svg>
                      </div>
                      <div>
                        <div className="jit-chip-title">outpass Management</div>
                      </div>
                    </div>
                  </div>
                  <div className="jit-chip jit-chip-tr">
                    <div className="jit-chip-inner">
                      <div className="jit-chip-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                      </div>
                      <div>
                        <div className="jit-chip-title">Documentation</div>
                      </div>
                    </div>
                  </div>
                  <div className="jit-chip jit-chip-br">
                    <div className="jit-chip-inner">
                      <div className="jit-chip-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                      </div>
                      <div>
                        <div className="jit-chip-title">Easy Access</div>
                      </div>
                    </div>
                  </div>

                  {/* Floating spheres */}
                  <div className="jit-sphere jit-sphere-1">
                    <div className="jit-sphere-inner" />
                  </div>
                  <div className="jit-sphere jit-sphere-2">
                    <div className="jit-sphere-inner" />
                  </div>
                  <div className="jit-sphere jit-sphere-3">
                    <div className="jit-sphere-inner" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STATS BAR ══════════ */}
          <section id="about-section" className="jit-stats-section">
            <div className="jit-container">
              <div className="jit-stats-bar">
                {statsData.map((stat, i) => (
                  <React.Fragment key={stat.label}>
                    <StatCard stat={stat} index={i} />
                    {i < statsData.length - 1 && <div className="jit-stats-divider" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════ PORTAL ACCESS ══════════ */}
          <section id="portals-section" className="jit-portals-section">
            <div className="jit-container">
              <div className="jit-section-intro jit-reveal jit-fade-up">
                <span className="jit-eyebrow-tag">ONE PLATFORM. ENDLESS POSSIBILITIES.</span>
                <div className="jit-section-head-row">
                  <div>
                    <h2 className="jit-section-h2">Portal Access</h2>
                    <div className="jit-h2-bar" />
                  </div>
                  <p className="jit-section-desc">Access your portal with ease and manage everything in one place.</p>
                </div>
              </div>

              <div className="jit-portals-grid">
                {portals.map((p, i) => (
                  <button
                    key={p.id}
                    id={`portal-${p.id}`}
                    className="jit-portal-card jit-reveal jit-fade-up"
                    style={{ transitionDelay: `${0.07 * i}s` }}
                    onClick={() => navigate(p.route)}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                  >
                    <div className="jit-portal-shine" />
                    <div className="jit-portal-icon">
                      {p.icon}
                    </div>
                    <div className="jit-portal-title">{p.title}</div>
                    <div className="jit-portal-desc">{p.desc}</div>
                    <div className="jit-portal-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="jit-portal-bottom-line" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════ FEATURE SHOWCASE ══════════ */}
          <section id="features-section" className="jit-features-section">
            <div className="jit-container">
              <div className="jit-section-center jit-reveal jit-fade-up">
                <span className="jit-eyebrow-tag">PLATFORM CAPABILITIES</span>
                <h2 className="jit-section-h2">Everything Your Campus Needs</h2>
                <div className="jit-h2-bar jit-bar-center" />
                <p className="jit-feat-intro">Built for modern institutions. Designed for every stakeholder on campus.</p>
              </div>

              <div className="jit-features-grid">
                {features.map((f, i) => (
                  <div
                    key={f.title}
                    className="jit-feat-card jit-reveal jit-fade-up"
                    style={{ transitionDelay: `${0.08 * i}s` }}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                  >
                    <div className="jit-feat-shine" />
                    <div className="jit-feat-icon">{f.icon}</div>
                    <h3 className="jit-feat-title">{f.title}</h3>
                    <p className="jit-feat-desc">{f.desc}</p>
                    <div className="jit-feat-link">
                      Learn more
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════ CTA BANNER ══════════ */}
          <section className="jit-cta-section">
            <div className="jit-cta-blob-1" />
            <div className="jit-cta-blob-2" />
            <div className="jit-container jit-cta-inner">
              <div className="jit-cta-content jit-reveal jit-fade-up">
                <h2 className="jit-cta-h2">Start Your Digital Campus Journey</h2>
                <p className="jit-cta-sub">Join 1,200+ students and 85+ faculty members already on JIT Campus One.</p>
                <button className="jit-btn-primary jit-btn-lg" id="cta-access" onClick={() => scrollTo('portals-section')}>
                  Access Your Portal
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* ══════════ FOOTER ══════════ */}
        <footer className="jit-footer" id="contact-section">
          <div className="jit-container jit-footer-inner">
            <div className="jit-footer-brand">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="9" fill="url(#ftG)" />
                <path d="M8 24L16 9L24 24H8Z" fill="white" fillOpacity="0.95" />
                <rect x="13" y="18" width="6" height="5" rx="1.5" fill="url(#ftG)" />
                <defs>
                  <linearGradient id="ftG" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6" /><stop offset="1" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="jit-footer-name">JIT Permigo</span>
            </div>
            <span className="jit-footer-copy">
              © 2025 Jeppiaar Institute of Technology. All rights reserved.
              <span style={{ margin: '0 10px', color: '#CBD5E1' }}>|</span>
              Support: <a href="mailto:jeppiaaroutpass@gmail.com" className={`jit-support-email${highlightEmail ? ' email-highlight-pulse' : ''}`} style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 600, display: 'inline-block', transition: 'all 0.3s ease' }}>jeppiaaroutpass@gmail.com</a>
            </span>
            <span className="jit-footer-tag">v2.0 · Digital Campus Platform</span>
          </div>
        </footer>
      </div>

      {/* ══════════ STYLES ══════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Reset ── */
        .jit-root *, .jit-root *::before, .jit-root *::after {
          box-sizing: border-box; margin: 0; padding: 0; border: 0;
        }
        .jit-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #F8FBFF;
          color: #0F172A;
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Page enter ── */
        .jit-page { opacity: 0; transform: translateY(10px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .jit-page-in { opacity: 1; transform: none; }

        /* ── Container ── */
        .jit-container { max-width: 1200px; margin: 0 auto; padding: 0 40px; position: relative; }

        /* ══════════════════════════════
           NAV
        ══════════════════════════════ */
        .jit-nav-wrap {
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          width: calc(100% - 80px); max-width: 1160px;
          z-index: 300;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(15,23,42,0.06), 0 1px 0 rgba(255,255,255,0.9) inset;
          transition: background 0.3s ease, box-shadow 0.3s ease, top 0.3s ease;
        }
        .jit-scroll-progress {
          position: absolute; top: 0; left: 0;
          height: 3px; background: linear-gradient(90deg, #3B82F6, #60A5FA, #3B82F6);
          border-radius: 18px 18px 0 0;
          transition: width 0.1s ease-out;
          z-index: 10;
        }
        .jit-nav-wrap.jit-nav-scrolled {
          top: 10px;
          background: rgba(255,255,255,0.92);
          box-shadow: 0 8px 32px rgba(15,23,42,0.1), 0 1px 0 rgba(255,255,255,0.9) inset;
        }
        .jit-nav-inner {
          display: flex; align-items: center;
          height: 68px; padding: 0 24px; gap: 16px;
          justify-content: space-between;
        }
        /* Logo */
        .jit-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .jit-logo-box {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 2px 8px rgba(59,130,246,0.2));
        }
        .jit-logo-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .jit-logo-text { display: flex; flex-direction: column; line-height: 1.1; }
        .jit-logo-title { font-size: 18px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px; }
        .jit-logo-sub { font-size: 9px; font-weight: 600; color: #64748B; letter-spacing: 0.2px; text-transform: uppercase; }
        /* Center nav */
        .jit-nav-center { display: flex; align-items: center; gap: 4px; }
        .jit-nav-link {
          position: relative;
          font-size: 14px; font-weight: 600; color: #475569;
          background: none; cursor: pointer;
          padding: 8px 16px; border-radius: 10px;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .jit-nav-link:hover { color: #0F172A; background: rgba(59,130,246,0.05); }
        .jit-nav-link-active { color: #0F172A; font-weight: 700; }
        .jit-nav-underline {
          position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
          width: 22px; height: 2.5px;
          background: #3B82F6; border-radius: 2px;
        }
        /* Right */
        .jit-nav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .jit-nav-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: #fff; font-size: 13.5px; font-weight: 700;
          padding: 10px 22px; border-radius: 12px; cursor: pointer;
          box-shadow: 0 4px 14px rgba(37,99,235,0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }
        .jit-nav-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.32); }
        .jit-nav-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -150%;
          width: 50%; height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.35) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          animation: jitBtnShimmer 6s infinite ease-in-out;
          animation-delay: 2s;
        }
        .jit-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; cursor: pointer; padding: 4px;
        }
        .jit-hamburger span {
          display: block; width: 22px; height: 2px;
          background: #0F172A; border-radius: 2px; transition: 0.3s;
        }
        .jit-mobile-menu {
          display: none; flex-direction: column; gap: 4px;
          padding: 0 16px 16px; overflow: hidden; max-height: 0;
          transition: max-height 0.35s ease, padding 0.35s ease;
        }
        .jit-mobile-menu.jit-mobile-open { max-height: 360px; display: flex; padding: 8px 16px 18px; }
        .jit-mobile-link {
          font-size: 15px; font-weight: 600; color: #475569;
          padding: 12px 14px; border-radius: 10px; cursor: pointer;
          text-align: left; background: none;
          transition: background 0.2s, color 0.2s;
        }
        .jit-mobile-link:hover { background: rgba(59,130,246,0.06); color: #0F172A; }
        .jit-mobile-cta { margin-top: 8px; justify-content: center; }

        /* ══════════════════════════════
           HERO
         ══════════════════════════════ */
        .jit-hero {
          position: relative; min-height: 100vh;
          display: flex; align-items: center;
          padding: 120px 0 80px; overflow: hidden;
          background: linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 50%, #F8FBFF 100%);
        }
        .jit-hero-bg { position: absolute; inset: 0; pointer-events: none; }
        .jit-hero-blob {
          position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.7;
        }
        .jit-blob-1 {
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%);
          top: -200px; left: -150px;
          animation: jitBlob1 20s ease-in-out infinite;
        }
        .jit-blob-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 65%);
          bottom: -100px; right: -100px;
          animation: jitBlob2 24s ease-in-out infinite;
        }
        .jit-blob-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(219,234,254,0.6) 0%, transparent 65%);
          top: 40%; left: 45%;
          animation: jitBlob1 16s ease-in-out infinite reverse;
        }
        @keyframes jitBlob1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.04); }
          66% { transform: translate(-15px,15px) scale(0.97); }
        }
        @keyframes jitBlob2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-40px,25px) scale(1.06); }
        }
        .jit-hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .jit-hero-inner {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 60px; align-items: center;
        }
        .jit-hero-left { position: relative; z-index: 2; }

        .jit-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 100px; padding: 7px 18px;
          font-size: 12px; font-weight: 600; color: #3B82F6;
          backdrop-filter: blur(12px);
          margin-bottom: 28px;
          box-shadow: 0 2px 12px rgba(59,130,246,0.08);
        }
        .jit-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #3B82F6; flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
          animation: jitDotPulse 2.5s ease-in-out infinite;
        }
        @keyframes jitDotPulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
          50% { box-shadow: 0 0 0 7px rgba(59,130,246,0); }
        }

        .jit-hero-h1 {
          font-size: clamp(38px, 4.8vw, 64px);
          font-weight: 900; line-height: 1.07;
          letter-spacing: -2px; color: #0F172A;
          margin-bottom: 14px;
        }
        .jit-h1-blue {
          background: linear-gradient(135deg, #1D4ED8 0%, #3B82F6 50%, #60A5FA 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          animation: jitBlueShift 5s ease-in-out infinite;
        }
        @keyframes jitBlueShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .jit-hero-sub {
          font-size: 17px; font-weight: 500; color: #334155;
          line-height: 1.6; margin-bottom: 16px;
        }
        .jit-hero-desc {
          font-size: 15px; color: #64748B; line-height: 1.75;
          max-width: 480px; margin-bottom: 36px;
        }
        .jit-hero-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

        .jit-btn-primary {
          display: inline-flex; align-items: center; gap: 9px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: #fff; font-size: 15px; font-weight: 700;
          padding: 14px 32px; border-radius: 13px; cursor: pointer;
          box-shadow: 0 4px 18px rgba(37,99,235,0.25), 0 12px 32px rgba(37,99,235,0.12);
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
          letter-spacing: -0.2px;
          position: relative;
          overflow: hidden;
        }
        .jit-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(37,99,235,0.32), 0 22px 48px rgba(37,99,235,0.18); }
        .jit-btn-primary:active { transform: translateY(0) scale(0.98); }
        .jit-btn-primary::after {
          content: '';
          position: absolute;
          top: 0; left: -150%;
          width: 50%; height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          animation: jitBtnShimmer 6s infinite ease-in-out;
        }
        @keyframes jitBtnShimmer {
          0% { left: -150%; }
          15% { left: 150%; }
          100% { left: 150%; }
        }
        .jit-btn-lg { font-size: 16px; padding: 16px 38px; }

        .jit-btn-outline {
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.72);
          color: #0F172A; font-size: 15px; font-weight: 600;
          padding: 14px 28px; border-radius: 13px; cursor: pointer;
          border: 1px solid rgba(59,130,246,0.2);
          backdrop-filter: blur(12px);
          transition: background 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }
        .jit-btn-outline:hover { background: rgba(255,255,255,0.9); transform: translateY(-2px); border-color: rgba(59,130,246,0.35); }
        .jit-play-circle {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(59,130,246,0.1); color: #3B82F6;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* ── ORB VISUAL ── */
        .jit-hero-right {
          position: relative; z-index: 2; display: flex; justify-content: center;
          transform-style: preserve-3d;
        }
        .jit-orb-scene {
          position: relative; width: 420px; height: 420px;
          display: flex; align-items: center; justify-content: center;
          perspective: 1000px;
          transform-style: preserve-3d;
          transform: rotateX(calc(var(--hero-mouse-y, 0) * -12deg)) rotateY(calc(var(--hero-mouse-x, 0) * 12deg));
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* Interactive Orbit SVGs */
        .jit-orbit-svg {
          position: absolute;
          pointer-events: none;
          transform-style: preserve-3d;
        }
        .jit-orbit-outer {
          width: 380px; height: 380px;
          transform: rotateX(60deg) rotateY(0deg);
          animation: jitRingRotateOut 28s linear infinite;
        }
        .jit-orbit-mid {
          width: 280px; height: 280px;
          transform: rotateX(60deg) rotateY(0deg);
          animation: jitRingRotateMid 20s linear infinite reverse;
        }
        .jit-orbit-track {
          fill: none;
          stroke: rgba(59, 130, 246, 0.12);
          stroke-width: 1.5;
        }
        .jit-orbit-flow-1 {
          fill: none;
          stroke: url(#orbitG-out);
          stroke-width: 2.5;
          stroke-dasharray: 60 300;
          stroke-linecap: round;
          animation: jitFlow1 8s linear infinite;
        }
        .jit-orbit-flow-2 {
          fill: none;
          stroke: url(#orbitG-out);
          stroke-width: 2;
          stroke-dasharray: 40 400;
          stroke-linecap: round;
          animation: jitFlow2 12s linear infinite;
        }
        .jit-orbit-flow-mid {
          fill: none;
          stroke: url(#orbitG-mid);
          stroke-width: 2.5;
          stroke-dasharray: 50 200;
          stroke-linecap: round;
          animation: jitFlow1 6s linear infinite reverse;
        }
        @keyframes jitRingRotateOut {
          from { transform: rotate(0deg) rotateX(60deg); }
          to { transform: rotate(360deg) rotateX(60deg); }
        }
        @keyframes jitRingRotateMid {
          from { transform: rotate(0deg) rotateX(60deg); }
          to { transform: rotate(360deg) rotateX(60deg); }
        }
        @keyframes jitFlow1 {
          from { stroke-dashoffset: 360; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes jitFlow2 {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 440; }
        }

        .jit-orb-float-wrapper {
          position: absolute;
          z-index: 10;
          animation: jitOrbFloat 5s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        @keyframes jitOrbFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .jit-orb-core {
          width: 140px; height: 140px; border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95), rgba(219,234,254,0.8) 50%, rgba(147,197,253,0.6));
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow:
            0 20px 60px rgba(59,130,246,0.25),
            0 8px 24px rgba(59,130,246,0.15),
            inset 0 2px 8px rgba(255,255,255,0.8),
            inset 0 -4px 12px rgba(59,130,246,0.1);
          display: flex; align-items: center; justify-content: center;
          transform: translateZ(30px) translateY(calc(var(--hero-mouse-y, 0) * -12px)) translateX(calc(var(--hero-mouse-x, 0) * -12px));
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .jit-orb-label {
          font-size: 28px; font-weight: 900; letter-spacing: -1px;
          background: linear-gradient(135deg, #1D4ED8, #3B82F6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Chips */
        .jit-chip {
          position: absolute; z-index: 20;
          white-space: nowrap;
        }
        .jit-chip-inner {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 14px; padding: 10px 14px;
          box-shadow: 0 8px 28px rgba(15,23,42,0.08), 0 2px 8px rgba(59,130,246,0.06);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          white-space: nowrap;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), background 0.3s, border-color 0.3s;
        }
        .jit-chip-inner:hover {
          background: rgba(255,255,255,0.98);
          border-color: rgba(59,130,246,0.25);
        }
        .jit-chip-icon {
          width: 30px; height: 30px; border-radius: 9px;
          background: rgba(59,130,246,0.1); color: #3B82F6;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .jit-chip-title { font-size: 12px; font-weight: 700; color: #0F172A; }
        .jit-chip-tl { top: 30px; right: 30px; animation: jitChipFloat1 7s ease-in-out infinite; }
        .jit-chip-tr { left: 0px; top: 90px; animation: jitChipFloat2 8s ease-in-out infinite; }
        .jit-chip-br { bottom: 50px; right: 20px; animation: jitChipFloat3 6.5s ease-in-out infinite; }

        .jit-chip-tl .jit-chip-inner {
          transform: translateZ(50px) translateY(calc(var(--hero-mouse-y, 0) * -22px)) translateX(calc(var(--hero-mouse-x, 0) * -22px));
        }
        .jit-chip-tr .jit-chip-inner {
          transform: translateZ(40px) translateY(calc(var(--hero-mouse-y, 0) * -18px)) translateX(calc(var(--hero-mouse-x, 0) * -18px));
        }
        .jit-chip-br .jit-chip-inner {
          transform: translateZ(60px) translateY(calc(var(--hero-mouse-y, 0) * -26px)) translateX(calc(var(--hero-mouse-x, 0) * -26px));
        }

        @keyframes jitChipFloat1 { 0%,100%{transform:translateY(0) rotate(1deg)} 50%{transform:translateY(-12px) rotate(-1deg)} }
        @keyframes jitChipFloat2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes jitChipFloat3 { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-8px) rotate(1deg)} }

        /* Spheres */
        .jit-sphere {
          position: absolute; border-radius: 50%;
        }
        .jit-sphere-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(147,197,253,0.6));
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: 0 8px 24px rgba(59,130,246,0.15), inset 0 2px 4px rgba(255,255,255,0.7);
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .jit-sphere-1 { width: 40px; height: 40px; top: 10px; left: 20px; animation: jitSphere1 9s ease-in-out infinite; }
        .jit-sphere-2 { width: 24px; height: 24px; bottom: 80px; left: 30px; animation: jitSphere2 11s ease-in-out infinite; }
        .jit-sphere-3 { width: 32px; height: 32px; top: 50%; right: -10px; animation: jitSphere3 8s ease-in-out infinite; }

        .jit-sphere-1 .jit-sphere-inner {
          transform: translateZ(25px) translateY(calc(var(--hero-mouse-y, 0) * -12px)) translateX(calc(var(--hero-mouse-x, 0) * -12px));
        }
        .jit-sphere-2 .jit-sphere-inner {
          transform: translateZ(15px) translateY(calc(var(--hero-mouse-y, 0) * -8px)) translateX(calc(var(--hero-mouse-x, 0) * -8px));
        }
        .jit-sphere-3 .jit-sphere-inner {
          transform: translateZ(35px) translateY(calc(var(--hero-mouse-y, 0) * -16px)) translateX(calc(var(--hero-mouse-x, 0) * -16px));
        }

        @keyframes jitSphere1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(8px,-12px)} }
        @keyframes jitSphere2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-6px,-10px)} }
        @keyframes jitSphere3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(5px,-8px)} }


        /* ══════════════════════════════
           STATS BAR
        ══════════════════════════════ */
        .jit-stats-section { padding: 0; background: #fff; }
        .jit-stats-bar {
          display: flex; align-items: center; justify-content: space-between;
          background: #fff;
          border: 1px solid rgba(219,234,254,0.9);
          border-radius: 20px;
          padding: 32px 40px;
          box-shadow: 0 4px 28px rgba(15,23,42,0.04), 0 1px 4px rgba(59,130,246,0.05);
          margin: -1px 0;
          position: relative; z-index: 1;
        }
        .jit-stat-item {
          display: flex; flex-direction: column; align-items: center;
          gap: 6px; flex: 1; text-align: center;
          padding: 0 12px;
          animation: jitFadeInUp 0.6s ease both;
        }
        @keyframes jitFadeInUp { from {opacity:0;transform:translateY(12px)} to {opacity:1;transform:none} }
        .jit-stat-icon { color: #3B82F6; margin-bottom: 2px; }
        .jit-stat-number {
          font-size: 30px; font-weight: 900; letter-spacing: -1.5px; line-height: 1;
          background: linear-gradient(135deg, #0F172A 0%, #1D4ED8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .jit-stat-label { font-size: 13px; font-weight: 600; color: #64748B; }
        .jit-stats-divider {
          width: 1px; height: 48px; flex-shrink: 0;
          background: linear-gradient(to bottom, transparent, rgba(219,234,254,1), transparent);
        }

        /* ══════════════════════════════
           PORTALS
        ══════════════════════════════ */
        .jit-portals-section {
          padding: 80px 0 100px;
          background: linear-gradient(180deg, #F8FBFF 0%, #EFF6FF 50%, #F8FBFF 100%);
        }
        .jit-section-intro { margin-bottom: 40px; }
        .jit-eyebrow-tag {
          display: block;
          font-size: 11px; font-weight: 700; letter-spacing: 2px;
          color: #3B82F6; text-transform: uppercase; margin-bottom: 14px;
        }
        .jit-section-head-row {
          display: flex; align-items: flex-end; justify-content: space-between; gap: 20px;
        }
        .jit-section-h2 {
          font-size: clamp(26px, 3.5vw, 42px); font-weight: 900;
          letter-spacing: -1.5px; color: #0F172A; line-height: 1.1;
          margin-bottom: 8px;
        }
        .jit-h2-bar {
          width: 36px; height: 3px;
          background: linear-gradient(90deg, #3B82F6, #93C5FD);
          border-radius: 2px;
        }
        .jit-bar-center { margin: 12px auto 0; }
        .jit-section-desc {
          font-size: 15px; color: #64748B; line-height: 1.65;
          max-width: 380px; text-align: right;
          flex-shrink: 0;
        }

        .jit-portals-grid {
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px;
        }
        .jit-portal-card {
          position: relative;
          display: flex; flex-direction: column; align-items: flex-start;
          gap: 12px; padding: 28px 22px 24px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(255,255,255,0.85);
          border-radius: 20px; cursor: pointer;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          overflow: hidden; text-align: left;
          box-shadow: 0 2px 16px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.03), inset 0 1px 0 rgba(255,255,255,0.8);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
        }
        .jit-portal-card::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle 180px at var(--mouse-x, -999px) var(--mouse-y, -999px), rgba(59, 130, 246, 0.11), transparent 80%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
        }
        .jit-portal-card:hover::before {
          opacity: 1;
        }
        .jit-portal-shine {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(130deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%);
          transform: translateX(-120%) rotate(25deg);
          transition: transform 0.6s ease;
          z-index: 1;
        }
        .jit-portal-card:hover .jit-portal-shine { transform: translateX(200%) rotate(25deg); }
        .jit-portal-card:hover {
          background: rgba(255,255,255,0.92);
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 16px 40px rgba(59,130,246,0.12), 0 32px 60px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.98);
          border-color: rgba(59,130,246,0.2);
        }
        .jit-portal-card:active { transform: translateY(-2px) scale(0.99); }
        .jit-portal-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(59,130,246,0.08); color: #3B82F6;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease;
          position: relative; z-index: 2;
        }
        .jit-portal-card:hover .jit-portal-icon {
          transform: scale(1.1) rotate(-4deg);
          background: rgba(59,130,246,0.14);
        }
        .jit-portal-title { font-size: 14px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px; position: relative; z-index: 2; }
        .jit-portal-desc { font-size: 12px; color: #64748B; line-height: 1.5; position: relative; z-index: 2; }
        .jit-portal-arrow {
          color: #CBD5E1; margin-top: 4px;
          transition: color 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          position: relative; z-index: 2;
        }
        .jit-portal-card:hover .jit-portal-arrow { color: #3B82F6; transform: translateX(4px); }
        .jit-portal-bottom-line {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px; background: linear-gradient(90deg, #3B82F6, #60A5FA);
          border-radius: 0 0 20px 20px;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s ease;
          z-index: 2;
        }
        .jit-portal-card:hover .jit-portal-bottom-line { transform: scaleX(1); }

        /* ══════════════════════════════
           FEATURES
        ══════════════════════════════ */
        .jit-features-section { padding: 80px 0 100px; background: #fff; }
        .jit-section-center { text-align: center; margin-bottom: 52px; }
        .jit-feat-intro { font-size: 16px; color: #64748B; max-width: 480px; margin: 16px auto 0; line-height: 1.7; }

        .jit-features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
        }
        .jit-feat-card {
          position: relative;
          background: linear-gradient(145deg, #F0F7FF 0%, #fff 100%);
          border: 1px solid rgba(219,234,254,0.9);
          border-radius: 20px; padding: 36px 28px;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 2px 16px rgba(15,23,42,0.03);
        }
        .jit-feat-card::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle 180px at var(--mouse-x, -999px) var(--mouse-y, -999px), rgba(59, 130, 246, 0.11), transparent 80%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
        }
        .jit-feat-card:hover::before {
          opacity: 1;
        }
        .jit-feat-card:hover {
          transform: translateY(-6px);
          border-color: rgba(59,130,246,0.22);
          box-shadow: 0 20px 48px rgba(59,130,246,0.09), 0 8px 24px rgba(15,23,42,0.05);
        }
        .jit-feat-shine {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
          transform: translateX(-120%) rotate(25deg);
          transition: transform 0.6s ease;
          z-index: 1;
        }
        .jit-feat-card:hover .jit-feat-shine { transform: translateX(200%) rotate(25deg); }
        .jit-feat-icon {
          width: 54px; height: 54px; border-radius: 15px;
          background: rgba(59,130,246,0.08); color: #3B82F6;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s;
          position: relative; z-index: 2;
        }
        .jit-feat-card:hover .jit-feat-icon { transform: scale(1.1) rotate(-4deg); background: rgba(59,130,246,0.13); }
        .jit-feat-title { font-size: 16px; font-weight: 800; color: #0F172A; letter-spacing: -0.4px; margin-bottom: 10px; position: relative; z-index: 2; }
        .jit-feat-desc { font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 20px; position: relative; z-index: 2; }
        .jit-feat-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 700; color: #3B82F6;
          transition: gap 0.2s ease;
          position: relative; z-index: 2;
        }
        .jit-feat-card:hover .jit-feat-link { gap: 10px; }

        /* ══════════════════════════════
           CTA
        ══════════════════════════════ */
        .jit-cta-section {
          padding: 100px 0; text-align: center;
          background: linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 50%, #F8FBFF 100%);
          position: relative; overflow: hidden;
        }
        .jit-cta-blob-1, .jit-cta-blob-2 {
          position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none;
        }
        .jit-cta-blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%);
          top: -150px; left: -100px;
        }
        .jit-cta-blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 65%);
          bottom: -100px; right: -80px;
        }
        .jit-cta-inner { position: relative; z-index: 2; }
        .jit-cta-content { max-width: 600px; margin: 0 auto; }
        .jit-cta-h2 {
          font-size: clamp(30px, 4vw, 52px); font-weight: 900;
          letter-spacing: -2px; color: #0F172A; line-height: 1.1; margin-bottom: 18px;
        }
        .jit-cta-sub { font-size: 17px; color: #475569; line-height: 1.65; margin-bottom: 36px; }

        /* ══════════════════════════════
           FOOTER
        ══════════════════════════════ */
        .jit-footer { background: #fff; border-top: 1px solid rgba(219,234,254,0.8); padding: 26px 0; }
        .jit-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .jit-footer-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .jit-footer-name { font-size: 14px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px; }
        .jit-footer-copy { font-size: 12.5px; color: #64748B; font-weight: 500; }
        .jit-footer-tag {
          background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.12);
          padding: 4px 14px; border-radius: 100px;
          font-size: 11.5px; font-weight: 600; color: #3B82F6; flex-shrink: 0;
        }

        /* ══════════════════════════════
           SCROLL REVEAL
        ══════════════════════════════ */
        .jit-reveal {
          opacity: 0;
          transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .jit-fade-up { transform: translateY(32px) scale(0.985); }
        .jit-reveal.jit-revealed { opacity: 1; transform: none; }
        .jit-d1 { transition-delay: 0.10s; }
        .jit-d2 { transition-delay: 0.20s; }
        .jit-d3 { transition-delay: 0.30s; }
        .jit-d4 { transition-delay: 0.40s; }

        /* ══════════════════════════════
           RESPONSIVE
        ══════════════════════════════ */
        @media (max-width: 1100px) {
          .jit-nav-wrap { width: calc(100% - 48px); }
          .jit-hero-inner { gap: 40px; }
          .jit-orb-scene { width: 340px; height: 340px; }
          .jit-orbit-outer { width: 310px; height: 310px; }
          .jit-orbit-mid { width: 230px; height: 230px; }
          .jit-portals-grid { grid-template-columns: repeat(3, 1fr); }
          .jit-features-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 900px) {
          .jit-nav-center { display: none; }
          .jit-hamburger { display: flex; }
          .jit-nav-wrap { top: 12px; width: calc(100% - 32px); border-radius: 14px; }
          .jit-container { padding: 0 24px; }
          .jit-hero { padding: 110px 0 70px; }
          .jit-hero-inner { grid-template-columns: 1fr; gap: 48px; text-align: center; }
          .jit-hero-left { display: flex; flex-direction: column; align-items: center; }
          .jit-hero-desc { max-width: 100%; }
          .jit-hero-right { justify-content: center; }
          .jit-orb-scene { width: 320px; height: 320px; }
          .jit-orbit-outer { width: 290px; height: 290px; }
          .jit-orbit-mid { width: 210px; height: 210px; }
          .jit-stats-bar { flex-wrap: wrap; gap: 20px; padding: 28px 24px; }
          .jit-stats-divider { display: none; }
          .jit-stat-item { min-width: calc(33% - 20px); }
          .jit-portals-grid { grid-template-columns: repeat(3, 1fr); }
          .jit-section-head-row { flex-direction: column; align-items: flex-start; gap: 12px; }
          .jit-section-desc { text-align: left; max-width: 100%; }
          .jit-features-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .jit-nav-wrap { top: 8px; width: calc(100% - 24px); border-radius: 12px; }
          .jit-nav-inner { padding: 0 16px; height: 58px; }
          .jit-logo-sub { display: none; }
          .jit-container { padding: 0 16px; }
          .jit-hero { padding: 90px 0 60px; }
          .jit-hero-h1 { font-size: 34px; letter-spacing: -1.5px; }
          .jit-hero-sub { font-size: 15px; }
          .jit-hero-desc { font-size: 14px; }
          .jit-hero-actions { flex-direction: column; width: 100%; max-width: 300px; }
          .jit-btn-primary, .jit-btn-outline { width: 100%; justify-content: center; }
          .jit-orb-scene { width: 280px; height: 280px; }
          .jit-orbit-outer { width: 250px; height: 250px; }
          .jit-orbit-mid { width: 180px; height: 180px; }
          .jit-orb-core { width: 110px; height: 110px; }
          .jit-chip-tl, .jit-chip-tr { display: none; }
          .jit-chip-br { bottom: 20px; right: 10px; }
          .jit-stats-bar { padding: 22px 18px; border-radius: 16px; }
          .jit-stat-number { font-size: 24px; }
          .jit-stat-item { min-width: calc(50% - 12px); }
          .jit-portals-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .jit-portal-card { padding: 22px 16px 18px; }
          .jit-features-grid { grid-template-columns: 1fr; }
          .jit-footer-inner { flex-direction: column; text-align: center; gap: 10px; }
          .jit-cta-h2 { font-size: 28px; letter-spacing: -1px; }
          .jit-cta-sub { font-size: 15px; }
        }

        @keyframes emailGlow {
          0% { transform: scale(1); background: transparent; }
          25% { transform: scale(1.15); background: rgba(59, 130, 246, 0.15); box-shadow: 0 0 12px rgba(59, 130, 246, 0.4); border-radius: 6px; padding: 2px 8px; }
          50% { transform: scale(1.15); background: rgba(59, 130, 246, 0.25); box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); border-radius: 6px; padding: 2px 8px; }
          75% { transform: scale(1.15); background: rgba(59, 130, 246, 0.15); box-shadow: 0 0 12px rgba(59, 130, 246, 0.4); border-radius: 6px; padding: 2px 8px; }
          100% { transform: scale(1); background: transparent; }
        }
        .email-highlight-pulse {
          animation: emailGlow 2.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Welcome;
