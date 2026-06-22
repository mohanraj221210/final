import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
            e.target.classList.add('wlc-revealed');
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.08 }
    );
    el.querySelectorAll('.wlc-reveal').forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Data ─── */
const roles = [
  {
    id: 'student',
    title: 'Student',
    desc: 'Academics, outpass & attendance',
    route: '/student-login',
    accent: '#1E6FD9',
    bg: 'rgba(234,244,255,0.9)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: 'faculty',
    title: 'Faculty',
    desc: 'Classes, grades & communication',
    route: '/staff-login',
    accent: '#4338CA',
    bg: 'rgba(238,236,255,0.9)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'warden',
    title: 'Warden',
    desc: 'Hostel management & outpass',
    route: '/warden-login',
    accent: '#047857',
    bg: 'rgba(236,253,245,0.9)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'yearincharge',
    title: 'Year Incharge',
    desc: 'Administrative oversight',
    route: '/year-incharge-login',
    accent: '#B45309',
    bg: 'rgba(255,251,235,0.9)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    desc: 'Gate control & verification',
    route: '/watchmanlogin',
    accent: '#B91C1C',
    bg: 'rgba(254,242,242,0.9)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const stats = [
  { value: '1,200+', label: 'Students', sub: 'Active learners enrolled', icon: '🎓' },
  { value: '85+', label: 'Faculty', sub: 'Expert educators & mentors', icon: '👨‍🏫' },
  { value: '8', label: 'Departments', sub: 'Academic divisions', icon: '🏛️' },
  { value: '100%', label: 'Paperless', sub: 'Fully digital operations', icon: '♻️' },
];

const features = [
  {
    title: 'Outpass Management',
    desc: 'End-to-end digital leave management from request to gate clearance with real-time notifications.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    color: '#1E6FD9',
    size: 'large',
  },
  {
    title: 'Attendance Tracking',
    desc: 'Live attendance insights across all subjects with department-level analytics.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: '#4338CA',
    size: 'medium',
  },
  {
    title: 'Academic Records',
    desc: 'Centralised marks, grades and performance analytics for every stakeholder.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    color: '#047857',
    size: 'medium',
  },
  {
    title: 'Circular Management',
    desc: 'Instant institutional circulars distributed campus-wide with read receipts.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    color: '#7C3AED',
    size: 'medium',
  },
  {
    title: 'Campus Notifications',
    desc: 'Smart push alerts for every event, approval, and campus update.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    color: '#D97706',
    size: 'medium',
  },
  {
    title: 'Student Support',
    desc: 'Hostel, library, transport — all unified in one premium digital ecosystem.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: '#DC2626',
    size: 'large',
  },
];

const reasons = [
  { icon: '⚡', title: 'Fast', desc: 'Sub-second response times across all campus services.' },
  { icon: '🔒', title: 'Secure', desc: 'Enterprise-grade data protection and role-based access.' },
  { icon: '🔗', title: 'Unified', desc: 'One platform for every stakeholder on campus.' },
  { icon: '📱', title: 'Mobile First', desc: 'Flawless experience on any device, any screen size.' },
  { icon: '🤖', title: 'AI Ready', desc: 'Built for intelligent automation and smart analytics.' },
];

const journey = [
  { step: '01', title: 'Login', desc: 'Secure, role-based authentication' },
  { step: '02', title: 'Dashboard', desc: 'Personalised campus overview' },
  { step: '03', title: 'Services', desc: 'Access all digital campus tools' },
  { step: '04', title: 'Approvals', desc: 'Instant multi-level sign-offs' },
  { step: '05', title: 'Success', desc: 'Seamless academic journey' },
];

const testimonials = [
  {
    quote: "The outpass system changed everything. No more paper queues — approvals happen in minutes, right from my phone.",
    name: 'Arjun Krishnaswamy',
    role: 'B.Tech CSE, Semester VI',
    initials: 'AK',
    color: '#1E6FD9',
  },
  {
    quote: "Managing attendance and grade uploads used to take hours. Now it's done before class even ends. Exceptional platform.",
    name: 'Dr. Priya Sundaram',
    role: 'Associate Professor, ECE',
    initials: 'PS',
    color: '#4338CA',
  },
  {
    quote: "Hostel monitoring is entirely digital now. I can track outpass status, approve requests and generate reports instantly.",
    name: 'Mr. Rajan Murugesan',
    role: 'Chief Warden, JIT Hostels',
    initials: 'RM',
    color: '#047857',
  },
];

/* ─── Main Welcome Component ─── */
const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const pageRef = useScrollReveal();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Auto-rotate testimonials */
  useEffect(() => {
    const iv = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 4500);
    return () => clearInterval(iv);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="wlc-root" ref={pageRef}>

      {/* ── Page load fade-in wrapper ── */}
      <div className={`wlc-page-wrap${mounted ? ' wlc-page-visible' : ''}`}>

        {/* ════════════════ NAV ════════════════ */}
        <header className={`wlc-nav-wrap${scrolled ? ' wlc-nav-scrolled' : ''}`}>
          <nav className="wlc-nav wlc-container">
            <div className="wlc-nav-brand">
              <div className="wlc-nav-logo">
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="38" height="38" rx="11" fill="url(#navLogoGrad)" />
                  <path d="M10 28L19 11L28 28H10Z" fill="white" fillOpacity="0.96" />
                  <rect x="16" y="21" width="6" height="6" rx="2" fill="url(#navLogoGrad)" />
                  <defs>
                    <linearGradient id="navLogoGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3B82F6" />
                      <stop offset="1" stopColor="#1D4ED8" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="wlc-nav-brand-text">
                <span className="wlc-nav-name">JIT Campus One</span>
                <span className="wlc-nav-inst">Jeppiaar Institute of Technology</span>
              </div>
            </div>
            <div className="wlc-nav-right">
              <span className="wlc-nav-tag">Digital Campus Platform</span>
              <button className="wlc-nav-cta" onClick={() => scrollTo('portals-section')}>
                Get Started
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* ════════════════ HERO ════════════════ */}
          <section className="wlc-hero">
            {/* Floating background blobs */}
            <div className="wlc-blob wlc-blob-1" aria-hidden="true" />
            <div className="wlc-blob wlc-blob-2" aria-hidden="true" />
            <div className="wlc-blob wlc-blob-3" aria-hidden="true" />

            <div className="wlc-container wlc-hero-inner">
              <div className="wlc-hero-left">
                <div className="wlc-hero-eyebrow wlc-reveal wlc-fade-up">
                  <span className="wlc-eyebrow-dot" />
                  JIT Campus One · Trusted · Established
                </div>
                <h1 className="wlc-hero-h1 wlc-reveal wlc-fade-up wlc-delay-1">
                  One Campus.<br />
                  <span className="wlc-h1-accent">One Digital</span><br />
                  Experience.
                </h1>
                <p className="wlc-hero-p wlc-reveal wlc-fade-up wlc-delay-2">
                  A unified smart campus platform empowering students, faculty, wardens, and administration — from outpass to academics, all in one seamless ecosystem.
                </p>
                <div className="wlc-hero-actions wlc-reveal wlc-fade-up wlc-delay-3">
                  <button
                    className="wlc-btn-primary"
                    id="hero-get-started"
                    onClick={() => scrollTo('portals-section')}
                  >
                    Get Started
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    className="wlc-btn-ghost"
                    id="hero-explore"
                    onClick={() => scrollTo('features-section')}
                  >
                    Explore Features
                  </button>
                </div>

                {/* Live badge */}
                <div className="wlc-hero-badge wlc-reveal wlc-fade-up wlc-delay-4">
                  <span className="wlc-badge-pulse" />
                  Campus Systems Live
                  <span className="wlc-badge-sep">·</span>
                  1,024 Active Users
                </div>
              </div>

              {/* Right: Floating glass card cluster */}
              <div className="wlc-hero-right wlc-reveal wlc-fade-up wlc-delay-1">
                <div className="wlc-glass-cluster">
                  {/* Main card */}
                  <div className="wlc-gcard wlc-gcard-main">
                    <div className="wlc-gcard-header">
                      <div className="wlc-gcard-dot wlc-dot-green" />
                      <span>Student Dashboard</span>
                    </div>
                    <div className="wlc-gcard-row">
                      <span className="wlc-gcard-label">Attendance</span>
                      <div className="wlc-gcard-bar-wrap">
                        <div className="wlc-gcard-bar" style={{ width: '82%', background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)' }} />
                      </div>
                      <span className="wlc-gcard-val">82%</span>
                    </div>
                    <div className="wlc-gcard-row">
                      <span className="wlc-gcard-label">CGPA</span>
                      <div className="wlc-gcard-bar-wrap">
                        <div className="wlc-gcard-bar" style={{ width: '88%', background: 'linear-gradient(90deg, #4338CA, #7C3AED)' }} />
                      </div>
                      <span className="wlc-gcard-val">8.8</span>
                    </div>
                    <div className="wlc-gcard-row">
                      <span className="wlc-gcard-label">Outpass</span>
                      <div className="wlc-gcard-bar-wrap">
                        <div className="wlc-gcard-bar" style={{ width: '60%', background: 'linear-gradient(90deg, #059669, #047857)' }} />
                      </div>
                      <span className="wlc-gcard-val">Approved</span>
                    </div>
                  </div>

                  {/* Float card top-right */}
                  <div className="wlc-gcard wlc-gcard-float wlc-gcard-tr">
                    <div className="wlc-mini-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#1E6FD9' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="wlc-mini-title">Live Attendance</div>
                      <div className="wlc-mini-sub">Updated now</div>
                    </div>
                  </div>

                  {/* Float card bottom-left */}
                  <div className="wlc-gcard wlc-gcard-float wlc-gcard-bl">
                    <div className="wlc-mini-icon" style={{ background: 'rgba(5,150,105,0.1)', color: '#047857' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div>
                      <div className="wlc-mini-title">Outpass Approved</div>
                      <div className="wlc-mini-sub">2 mins ago</div>
                    </div>
                  </div>

                  {/* Float card bottom-right */}
                  <div className="wlc-gcard wlc-gcard-float wlc-gcard-br">
                    <div className="wlc-mini-icon" style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </div>
                    <div>
                      <div className="wlc-mini-title">New Circular</div>
                      <div className="wlc-mini-sub">Exam Schedule</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll cue */}
            <div className="wlc-scroll-cue" aria-hidden="true">
              <div className="wlc-scroll-line" />
            </div>
          </section>

          {/* ════════════════ STATS ════════════════ */}
          <section className="wlc-stats-section">
            <div className="wlc-container">
              <div className="wlc-stats-grid">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className="wlc-stat-card wlc-reveal wlc-fade-up"
                    style={{ transitionDelay: `${0.1 * i}s` }}
                  >
                    <div className="wlc-stat-icon">{s.icon}</div>
                    <div className="wlc-stat-val">{s.value}</div>
                    <div className="wlc-stat-label">{s.label}</div>
                    <div className="wlc-stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════ PORTAL ACCESS ════════════════ */}
          <section id="portals-section" className="wlc-portals-section">
            <div className="wlc-container">
              <div className="wlc-section-head wlc-reveal wlc-fade-up">
                <div className="wlc-eyebrow">
                  <span className="wlc-eyebrow-bar" />
                  Portal Access
                </div>
                <h2 className="wlc-section-h2">Choose Your Role</h2>
                <p className="wlc-section-sub">Select your portal to enter the JIT digital campus ecosystem.</p>
              </div>
              <div className="wlc-portals-grid">
                {roles.map((r, idx) => (
                  <button
                    key={r.id}
                    id={`portal-${r.id}`}
                    className="wlc-portal-card wlc-reveal wlc-fade-up"
                    style={{
                      transitionDelay: `${0.08 * idx}s`,
                      '--portal-accent': r.accent,
                      '--portal-bg': r.bg,
                    } as React.CSSProperties}
                    onClick={() => navigate(r.route)}
                  >
                    <div className="wlc-portal-shine" />
                    <div className="wlc-portal-icon-wrap" style={{ background: r.bg }}>
                      <span style={{ color: r.accent }}>{r.icon}</span>
                    </div>
                    <div className="wlc-portal-info">
                      <span className="wlc-portal-title">{r.title} Portal</span>
                      <span className="wlc-portal-desc">{r.desc}</span>
                    </div>
                    <div className="wlc-portal-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="wlc-portal-bar" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════ FEATURES BENTO ════════════════ */}
          <section id="features-section" className="wlc-features-section">
            <div className="wlc-container">
              <div className="wlc-section-head wlc-reveal wlc-fade-up">
                <div className="wlc-eyebrow">
                  <span className="wlc-eyebrow-bar" />
                  Platform Capabilities
                </div>
                <h2 className="wlc-section-h2">Everything Your Campus Needs</h2>
                <p className="wlc-section-sub">Built for modern institutions. Designed for every stakeholder.</p>
              </div>
              <div className="wlc-bento-grid">
                {features.map((f, i) => (
                  <div
                    key={f.title}
                    className={`wlc-bento-card wlc-bento-${f.size} wlc-reveal wlc-fade-up`}
                    style={{
                      transitionDelay: `${0.07 * i}s`,
                      '--feat-color': f.color,
                    } as React.CSSProperties}
                  >
                    <div className="wlc-bento-shine" />
                    <div className="wlc-bento-icon" style={{ background: `${f.color}15`, color: f.color }}>
                      {f.icon}
                    </div>
                    <h3 className="wlc-bento-title">{f.title}</h3>
                    <p className="wlc-bento-desc">{f.desc}</p>
                    <div className="wlc-bento-learn">
                      <span>Learn more</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="wlc-bento-bar" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════ DIGITAL CAMPUS EXPERIENCE ════════════════ */}
          <section className="wlc-experience-section">
            <div className="wlc-container">
              <div className="wlc-experience-split">
                {/* Left */}
                <div className="wlc-exp-left">
                  <div className="wlc-eyebrow wlc-reveal wlc-fade-up">
                    <span className="wlc-eyebrow-bar" />
                    Digital Experience
                  </div>
                  <h2 className="wlc-section-h2 wlc-reveal wlc-fade-up wlc-delay-1">
                    A Campus Platform<br />Built for Everyone
                  </h2>
                  <p className="wlc-section-sub wlc-exp-sub wlc-reveal wlc-fade-up wlc-delay-2">
                    JIT Campus One connects every role — from student to administrator — in one clean, fast digital environment.
                  </p>
                  <div className="wlc-exp-blocks">
                    {[
                      { icon: '🎯', title: 'Precision Workflows', desc: 'Every process is streamlined for minimal clicks and maximum clarity.' },
                      { icon: '🌐', title: 'Always Connected', desc: 'Real-time sync across all portals ensures everyone stays on the same page.' },
                      { icon: '📊', title: 'Rich Analytics', desc: 'Administrators get powerful insights; students get personalised dashboards.' },
                    ].map((b, i) => (
                      <div
                        key={b.title}
                        className="wlc-exp-block wlc-reveal wlc-fade-up"
                        style={{ transitionDelay: `${0.1 * (i + 3)}s` }}
                      >
                        <div className="wlc-exp-block-icon">{b.icon}</div>
                        <div>
                          <div className="wlc-exp-block-title">{b.title}</div>
                          <div className="wlc-exp-block-desc">{b.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Layered glass UI mockup */}
                <div className="wlc-exp-right wlc-reveal wlc-fade-up wlc-delay-1">
                  <div className="wlc-mockup-wrap">
                    <div className="wlc-mockup-card wlc-mockup-back">
                      <div className="wlc-mock-label">Faculty View</div>
                      <div className="wlc-mock-row"><div className="wlc-mock-bar" style={{ width: '75%' }} /><span>CSE-A</span></div>
                      <div className="wlc-mock-row"><div className="wlc-mock-bar" style={{ width: '88%' }} /><span>ECE-B</span></div>
                      <div className="wlc-mock-row"><div className="wlc-mock-bar" style={{ width: '60%' }} /><span>MECH-C</span></div>
                    </div>
                    <div className="wlc-mockup-card wlc-mockup-front">
                      <div className="wlc-mock-label">Student Portal</div>
                      <div className="wlc-mock-chip wlc-chip-green">✓ Outpass Approved</div>
                      <div className="wlc-mock-chip wlc-chip-blue">📅 Timetable Updated</div>
                      <div className="wlc-mock-chip wlc-chip-purple">🔔 New Circular</div>
                      <div className="wlc-mock-stat-row">
                        <div className="wlc-mock-mini-stat">
                          <span className="wlc-mms-val">82%</span>
                          <span className="wlc-mms-lbl">Attendance</span>
                        </div>
                        <div className="wlc-mock-mini-stat">
                          <span className="wlc-mms-val">8.8</span>
                          <span className="wlc-mms-lbl">CGPA</span>
                        </div>
                        <div className="wlc-mock-mini-stat">
                          <span className="wlc-mms-val">3</span>
                          <span className="wlc-mms-lbl">Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════ WHY CHOOSE ════════════════ */}
          <section className="wlc-why-section">
            <div className="wlc-container">
              <div className="wlc-section-head wlc-reveal wlc-fade-up">
                <div className="wlc-eyebrow">
                  <span className="wlc-eyebrow-bar" />
                  Why Choose Us
                </div>
                <h2 className="wlc-section-h2">Built on Principles<br />That Matter</h2>
              </div>
              <div className="wlc-why-grid">
                {reasons.map((r, i) => (
                  <div
                    key={r.title}
                    className="wlc-why-card wlc-reveal wlc-fade-up"
                    style={{ transitionDelay: `${0.1 * i}s` }}
                  >
                    <div className="wlc-why-icon">{r.icon}</div>
                    <div className="wlc-why-title">{r.title}</div>
                    <div className="wlc-why-desc">{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════ JOURNEY TIMELINE ════════════════ */}
          <section className="wlc-timeline-section">
            <div className="wlc-container">
              <div className="wlc-section-head wlc-reveal wlc-fade-up">
                <div className="wlc-eyebrow">
                  <span className="wlc-eyebrow-bar" />
                  Student Journey
                </div>
                <h2 className="wlc-section-h2">From Login to Success</h2>
                <p className="wlc-section-sub">Five seamless steps to your complete digital campus experience.</p>
              </div>
              <div className="wlc-timeline">
                {journey.map((j, i) => (
                  <div
                    key={j.step}
                    className="wlc-timeline-item wlc-reveal wlc-fade-up"
                    style={{ transitionDelay: `${0.12 * i}s` }}
                  >
                    <div className="wlc-tl-node">
                      <div className="wlc-tl-step">{j.step}</div>
                      {i < journey.length - 1 && <div className="wlc-tl-line" />}
                    </div>
                    <div className="wlc-tl-content">
                      <div className="wlc-tl-title">{j.title}</div>
                      <div className="wlc-tl-desc">{j.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════ TESTIMONIALS ════════════════ */}
          <section className="wlc-testimonials-section">
            <div className="wlc-container">
              <div className="wlc-section-head wlc-reveal wlc-fade-up">
                <div className="wlc-eyebrow">
                  <span className="wlc-eyebrow-bar" />
                  Voices from Campus
                </div>
                <h2 className="wlc-section-h2">Trusted by the Community</h2>
              </div>
              <div className="wlc-testimonials-carousel wlc-reveal wlc-fade-up wlc-delay-1">
                {testimonials.map((t, i) => (
                  <div
                    key={i}
                    className={`wlc-tcard${i === testimonialIdx ? ' wlc-tcard-active' : ''}`}
                  >
                    <div className="wlc-tcard-quote">"</div>
                    <p className="wlc-tcard-text">{t.quote}</p>
                    <div className="wlc-tcard-author">
                      <div className="wlc-tcard-avatar" style={{ background: `${t.color}20`, color: t.color }}>
                        {t.initials}
                      </div>
                      <div>
                        <div className="wlc-tcard-name">{t.name}</div>
                        <div className="wlc-tcard-role">{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="wlc-tcard-dots">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      className={`wlc-tcard-dot${i === testimonialIdx ? ' wlc-tcard-dot-active' : ''}`}
                      onClick={() => setTestimonialIdx(i)}
                      aria-label={`Testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════ FINAL CTA ════════════════ */}
          <section className="wlc-cta-section">
            <div className="wlc-cta-bg-blob-1" aria-hidden="true" />
            <div className="wlc-cta-bg-blob-2" aria-hidden="true" />
            <div className="wlc-container wlc-cta-inner">
              <h2 className="wlc-cta-h2 wlc-reveal wlc-fade-up">
                Start Your Digital<br />Campus Journey
              </h2>
              <p className="wlc-cta-sub wlc-reveal wlc-fade-up wlc-delay-1">
                Join 1,200+ students and 85+ faculty members already on JIT Campus One.
              </p>
              <div className="wlc-cta-actions wlc-reveal wlc-fade-up wlc-delay-2">
                <button className="wlc-btn-primary wlc-btn-lg" id="cta-get-started" onClick={() => scrollTo('portals-section')}>
                  Access Your Portal
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* ════════════════ FOOTER ════════════════ */}
        <footer className="wlc-footer">
          <div className="wlc-container wlc-footer-inner">
            <div className="wlc-footer-brand">
              <svg width="24" height="24" viewBox="0 0 38 38" fill="none">
                <rect width="38" height="38" rx="11" fill="url(#ftLogoGrad)" />
                <path d="M10 28L19 11L28 28H10Z" fill="white" fillOpacity="0.96" />
                <rect x="16" y="21" width="6" height="6" rx="2" fill="url(#ftLogoGrad)" />
                <defs>
                  <linearGradient id="ftLogoGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="wlc-footer-name">JIT Campus One</span>
            </div>
            <span className="wlc-footer-copy">© 2025 Jeppiaar Institute of Technology. All rights reserved.</span>
            <span className="wlc-footer-badge">v2.0 · Digital Campus Platform</span>
          </div>
        </footer>

      </div>{/* end page-wrap */}

      {/* ════════════════ STYLES ════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Reset ── */
        .wlc-root *, .wlc-root *::before, .wlc-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        .wlc-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #F5F7FA;
          color: #0F172A;
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ── Page load animation ── */
        .wlc-page-wrap {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .wlc-page-visible {
          opacity: 1;
          transform: none;
        }

        /* ── Container ── */
        .wlc-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
          position: relative;
        }

        /* ══════════════════════════════
           NAV
        ══════════════════════════════ */
        .wlc-nav-wrap {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.4);
          transition: background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
        }
        .wlc-nav-wrap.wlc-nav-scrolled {
          background: rgba(255,255,255,0.88);
          box-shadow: 0 1px 0 rgba(255,255,255,0.9), 0 8px 24px -8px rgba(15,23,42,0.07);
          border-bottom-color: rgba(214,233,255,0.8);
        }
        .wlc-nav {
          height: 74px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .wlc-nav-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .wlc-nav-logo {
          filter: drop-shadow(0 2px 8px rgba(59,130,246,0.18));
          flex-shrink: 0;
        }
        .wlc-nav-brand-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .wlc-nav-name {
          font-size: 17px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }
        .wlc-nav-inst {
          font-size: 11px;
          font-weight: 500;
          color: #64748B;
          letter-spacing: 0.1px;
        }
        .wlc-nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .wlc-nav-tag {
          font-size: 12px;
          font-weight: 600;
          color: #1E6FD9;
          background: rgba(30,111,217,0.07);
          border: 1px solid rgba(30,111,217,0.14);
          border-radius: 100px;
          padding: 6px 16px;
        }
        .wlc-nav-cta {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          border: none;
          border-radius: 10px;
          padding: 9px 22px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(37,99,235,0.2);
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
        }
        .wlc-nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(37,99,235,0.28);
        }

        /* ══════════════════════════════
           HERO
        ══════════════════════════════ */
        .wlc-hero {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(160deg, #EAF4FF 0%, #D6E9FF 30%, #F0F7FF 60%, #FFFFFF 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: 110px;
          padding-bottom: 80px;
          overflow: hidden;
        }
        /* Background blobs */
        .wlc-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
        }
        .wlc-blob-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
          top: -150px; left: -100px;
          animation: wlcBlobFloat1 18s ease-in-out infinite;
        }
        .wlc-blob-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          bottom: -100px; right: -100px;
          animation: wlcBlobFloat2 22s ease-in-out infinite;
        }
        .wlc-blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(214,233,255,0.5) 0%, transparent 70%);
          top: 40%; left: 50%;
          animation: wlcBlobFloat1 14s ease-in-out infinite reverse;
        }
        @keyframes wlcBlobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, -30px) scale(1.05); }
          66%       { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes wlcBlobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-50px, 30px) scale(1.08); }
        }

        .wlc-hero-inner {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .wlc-hero-left {
          position: relative;
          z-index: 2;
        }
        .wlc-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 700;
          color: #1E6FD9;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 28px;
        }
        .wlc-eyebrow-dot {
          width: 8px; height: 8px;
          background: #3B82F6;
          border-radius: 50%;
          flex-shrink: 0;
          animation: wlcDotPulse 2.5s ease-in-out infinite;
        }
        @keyframes wlcDotPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          50%       { box-shadow: 0 0 0 6px rgba(59,130,246,0); }
        }
        .wlc-hero-h1 {
          font-size: clamp(40px, 5vw, 68px);
          font-weight: 900;
          line-height: 1.06;
          letter-spacing: -2.5px;
          color: #0F172A;
          margin-bottom: 26px;
        }
        .wlc-h1-accent {
          background: linear-gradient(135deg, #1E6FD9 0%, #3B82F6 50%, #60A5FA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          animation: wlcAccentShift 5s ease-in-out infinite;
        }
        @keyframes wlcAccentShift {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        .wlc-hero-p {
          font-size: 17px;
          color: #475569;
          line-height: 1.75;
          max-width: 480px;
          margin-bottom: 38px;
        }
        .wlc-hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 36px;
        }
        .wlc-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 34px;
          background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          letter-spacing: -0.2px;
          box-shadow: 0 4px 18px rgba(37,99,235,0.22), 0 14px 34px rgba(37,99,235,0.12);
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
        }
        .wlc-btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(37,99,235,0.3), 0 22px 48px rgba(37,99,235,0.18);
        }
        .wlc-btn-primary:active {
          transform: translateY(0) scale(0.98);
        }
        .wlc-btn-lg {
          font-size: 16px;
          padding: 17px 40px;
        }
        .wlc-btn-ghost {
          display: inline-flex;
          align-items: center;
          padding: 15px 32px;
          background: rgba(255,255,255,0.7);
          color: #0F172A;
          font-size: 15px;
          font-weight: 600;
          border: 1px solid rgba(30,111,217,0.18);
          border-radius: 14px;
          cursor: pointer;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .wlc-btn-ghost:hover {
          background: rgba(255,255,255,0.92);
          border-color: rgba(30,111,217,0.35);
          transform: translateY(-2px);
        }
        .wlc-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(59,130,246,0.12);
          border-radius: 100px;
          padding: 8px 20px;
          font-size: 12.5px;
          font-weight: 600;
          color: #475569;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 16px rgba(59,130,246,0.05);
        }
        .wlc-badge-pulse {
          width: 8px; height: 8px;
          background: #22C55E;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
          animation: wlcBadgePulse 2s ease-in-out infinite;
        }
        @keyframes wlcBadgePulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
          50%       { box-shadow: 0 0 0 7px rgba(34,197,94,0.01); }
        }
        .wlc-badge-sep { opacity: 0.4; }

        /* ── Glass Card Cluster ── */
        .wlc-hero-right {
          position: relative;
          z-index: 2;
        }
        .wlc-glass-cluster {
          position: relative;
          width: 100%;
          min-height: 380px;
        }
        .wlc-gcard {
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 22px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px rgba(15,23,42,0.06), 0 24px 56px rgba(15,23,42,0.04), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: transform 0.4s cubic-bezier(0.25,0.8,0.25,1), box-shadow 0.4s ease;
        }
        .wlc-gcard:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(15,23,42,0.1), 0 32px 72px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .wlc-gcard-main {
          padding: 28px 28px 24px;
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 88%;
          animation: wlcCardFloat 6s ease-in-out infinite;
        }
        @keyframes wlcCardFloat {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50%       { transform: translate(-50%, -50%) translateY(-8px); }
        }
        .wlc-gcard-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .wlc-gcard-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .wlc-dot-green { background: #22C55E; box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
        .wlc-gcard-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .wlc-gcard-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #64748B;
          width: 72px;
          flex-shrink: 0;
        }
        .wlc-gcard-bar-wrap {
          flex: 1;
          height: 7px;
          background: #EFF6FF;
          border-radius: 100px;
          overflow: hidden;
        }
        .wlc-gcard-bar {
          height: 100%;
          border-radius: 100px;
          transition: width 1s ease;
        }
        .wlc-gcard-val {
          font-size: 12px;
          font-weight: 700;
          color: #0F172A;
          width: 58px;
          text-align: right;
          flex-shrink: 0;
        }

        /* Floating mini cards */
        .wlc-gcard-float {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 18px;
          min-width: 170px;
        }
        .wlc-gcard-tr {
          top: -10px; right: -10px;
          animation: wlcFloatTR 7s ease-in-out infinite;
        }
        .wlc-gcard-bl {
          bottom: 20px; left: -20px;
          animation: wlcFloatBL 8s ease-in-out infinite;
        }
        .wlc-gcard-br {
          bottom: -10px; right: 10px;
          animation: wlcFloatBR 6.5s ease-in-out infinite;
        }
        @keyframes wlcFloatTR {
          0%, 100% { transform: translateY(0) rotate(1deg); }
          50%       { transform: translateY(-10px) rotate(-1deg); }
        }
        @keyframes wlcFloatBL {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%       { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes wlcFloatBR {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-7px) rotate(1deg); }
        }
        .wlc-mini-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .wlc-mini-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #0F172A;
          white-space: nowrap;
        }
        .wlc-mini-sub {
          font-size: 11px;
          color: #64748B;
          font-weight: 500;
        }

        /* ── Scroll cue ── */
        .wlc-scroll-cue {
          position: absolute;
          bottom: 32px; left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .wlc-scroll-line {
          width: 1.5px; height: 52px;
          background: linear-gradient(to bottom, rgba(30,111,217,0.5), transparent);
          animation: wlcScrollDrop 2s ease-in-out infinite;
        }
        @keyframes wlcScrollDrop {
          0% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          50% { opacity: 1; transform: scaleY(1); transform-origin: top; }
          100% { opacity: 0; transform: scaleY(1); transform-origin: bottom; }
        }

        /* ══════════════════════════════
           STATS
        ══════════════════════════════ */
        .wlc-stats-section {
          padding: 80px 0;
          background: #FFFFFF;
        }
        .wlc-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .wlc-stat-card {
          background: linear-gradient(145deg, #EAF4FF 0%, #FFFFFF 100%);
          border: 1px solid rgba(214,233,255,0.8);
          border-radius: 24px;
          padding: 40px 28px;
          text-align: center;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
          box-shadow: 0 4px 20px rgba(15,23,42,0.03), 0 1px 4px rgba(30,111,217,0.04);
        }
        .wlc-stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(30,111,217,0.1), 0 4px 16px rgba(15,23,42,0.06);
          border-color: rgba(59,130,246,0.25);
        }
        .wlc-stat-icon {
          font-size: 28px;
          margin-bottom: 16px;
          display: block;
        }
        .wlc-stat-val {
          display: block;
          font-size: 44px;
          font-weight: 900;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #0F172A 0%, #1E6FD9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 10px;
        }
        .wlc-stat-label {
          display: block;
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
          margin-bottom: 6px;
        }
        .wlc-stat-sub {
          display: block;
          font-size: 12.5px;
          color: #64748B;
          font-weight: 500;
          line-height: 1.4;
        }

        /* ══════════════════════════════
           PORTALS
        ══════════════════════════════ */
        .wlc-portals-section {
          padding: 100px 0;
          background: linear-gradient(180deg, #F5F7FA 0%, #EAF4FF 50%, #F5F7FA 100%);
        }
        .wlc-portals-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 18px;
        }
        .wlc-portal-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
          padding: 28px 16px 24px;
          background: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 24px;
          cursor: pointer;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
          box-shadow: 0 4px 24px rgba(15,23,42,0.04), 0 20px 40px rgba(15,23,42,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
        }
        .wlc-portal-shine {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
          transform: translateX(-120%) rotate(25deg);
          transition: transform 0.65s ease;
          pointer-events: none;
        }
        .wlc-portal-card:hover .wlc-portal-shine {
          transform: translateX(200%) rotate(25deg);
        }
        .wlc-portal-card:hover {
          border-color: rgba(var(--portal-accent), 0.3);
          background: rgba(255,255,255,0.85);
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 16px 40px rgba(30,111,217,0.1), 0 32px 64px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.95);
        }
        .wlc-portal-card:active { transform: translateY(-2px) scale(0.99); }
        .wlc-portal-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .wlc-portal-card:hover .wlc-portal-icon-wrap {
          transform: scale(1.1) rotate(-3deg);
        }
        .wlc-portal-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
          position: relative;
          z-index: 1;
        }
        .wlc-portal-title {
          font-size: 13.5px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
        }
        .wlc-portal-desc {
          font-size: 11px;
          color: #64748B;
          line-height: 1.4;
        }
        .wlc-portal-arrow {
          color: #94A3B8;
          transition: color 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          position: relative; z-index: 1;
        }
        .wlc-portal-card:hover .wlc-portal-arrow {
          color: #1E6FD9;
          transform: translateX(3px);
        }
        .wlc-portal-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--portal-accent);
          border-radius: 0 0 24px 24px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .wlc-portal-card:hover .wlc-portal-bar { transform: scaleX(1); }

        /* ══════════════════════════════
           SECTION HEADING
        ══════════════════════════════ */
        .wlc-section-head {
          text-align: center;
          margin-bottom: 64px;
        }
        .wlc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 700;
          color: #1E6FD9;
          text-transform: uppercase;
          letter-spacing: 1.8px;
          margin-bottom: 16px;
        }
        .wlc-eyebrow-bar {
          display: inline-block;
          width: 22px; height: 2px;
          background: linear-gradient(90deg, #3B82F6, #93C5FD);
          border-radius: 2px;
          flex-shrink: 0;
        }
        .wlc-section-h2 {
          font-size: clamp(28px, 3.5vw, 46px);
          font-weight: 900;
          letter-spacing: -1.5px;
          color: #0F172A;
          line-height: 1.1;
          margin-bottom: 16px;
        }
        .wlc-section-sub {
          font-size: 17px;
          color: #64748B;
          line-height: 1.65;
          max-width: 520px;
          margin: 0 auto;
        }

        /* ══════════════════════════════
           FEATURES BENTO
        ══════════════════════════════ */
        .wlc-features-section {
          padding: 100px 0;
          background: #FFFFFF;
        }
        .wlc-bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: auto auto;
          gap: 20px;
        }
        .wlc-bento-card {
          position: relative;
          background: linear-gradient(145deg, #F8FAFF 0%, #FFFFFF 100%);
          border: 1px solid rgba(214,233,255,0.9);
          border-radius: 24px;
          padding: 36px 32px;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 4px 20px rgba(15,23,42,0.03);
        }
        .wlc-bento-large { grid-column: span 1; }
        .wlc-bento-medium { grid-column: span 1; }
        .wlc-bento-grid .wlc-bento-card:nth-child(1) { grid-column: span 2; }
        .wlc-bento-grid .wlc-bento-card:nth-child(6) { grid-column: span 2; }
        .wlc-bento-shine {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
          transform: translateX(-120%) rotate(25deg);
          transition: transform 0.6s ease;
          pointer-events: none;
        }
        .wlc-bento-card:hover .wlc-bento-shine { transform: translateX(200%) rotate(25deg); }
        .wlc-bento-card:hover {
          transform: translateY(-5px);
          border-color: rgba(59,130,246,0.2);
          box-shadow: 0 20px 48px rgba(30,111,217,0.08), 0 8px 24px rgba(15,23,42,0.06);
        }
        .wlc-bento-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .wlc-bento-card:hover .wlc-bento-icon { transform: scale(1.12) rotate(-4deg); }
        .wlc-bento-title {
          font-size: 17px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 10px;
          letter-spacing: -0.4px;
        }
        .wlc-bento-desc {
          font-size: 14px;
          color: #475569;
          line-height: 1.7;
          margin-bottom: 22px;
        }
        .wlc-bento-learn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--feat-color, #1E6FD9);
          transition: gap 0.2s ease;
        }
        .wlc-bento-card:hover .wlc-bento-learn { gap: 10px; }
        .wlc-bento-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--feat-color, #1E6FD9);
          border-radius: 0 0 24px 24px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .wlc-bento-card:hover .wlc-bento-bar { transform: scaleX(1); }

        /* ══════════════════════════════
           EXPERIENCE SPLIT
        ══════════════════════════════ */
        .wlc-experience-section {
          padding: 100px 0;
          background: linear-gradient(180deg, #EAF4FF 0%, #F5F7FA 100%);
        }
        .wlc-experience-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .wlc-exp-sub { text-align: left; margin: 0 0 36px 0; }
        .wlc-exp-blocks { display: flex; flex-direction: column; gap: 24px; }
        .wlc-exp-block {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          padding: 22px 24px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(214,233,255,0.8);
          border-radius: 18px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
          box-shadow: 0 2px 12px rgba(15,23,42,0.03);
        }
        .wlc-exp-block:hover {
          transform: translateX(6px);
          box-shadow: 0 8px 28px rgba(30,111,217,0.08);
          border-color: rgba(59,130,246,0.2);
        }
        .wlc-exp-block-icon {
          font-size: 22px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .wlc-exp-block-title {
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
          margin-bottom: 4px;
        }
        .wlc-exp-block-desc {
          font-size: 13.5px;
          color: #475569;
          line-height: 1.6;
        }

        /* Mockup Right */
        .wlc-exp-right { position: relative; }
        .wlc-mockup-wrap { position: relative; min-height: 380px; }
        .wlc-mockup-card {
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(214,233,255,0.9);
          border-radius: 22px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 8px 36px rgba(15,23,42,0.06), 0 24px 64px rgba(15,23,42,0.04), inset 0 1px 0 rgba(255,255,255,0.9);
          padding: 28px;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .wlc-mockup-back {
          position: absolute;
          top: 0; left: 0;
          width: 88%;
          transform: rotate(-2.5deg);
          opacity: 0.85;
          animation: wlcMockBack 7s ease-in-out infinite;
        }
        @keyframes wlcMockBack {
          0%, 100% { transform: rotate(-2.5deg) translateY(0); }
          50%       { transform: rotate(-2.5deg) translateY(-6px); }
        }
        .wlc-mockup-front {
          position: absolute;
          bottom: 0; right: 0;
          width: 90%;
          animation: wlcMockFront 8s ease-in-out infinite;
        }
        @keyframes wlcMockFront {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        .wlc-mock-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #64748B;
          margin-bottom: 18px;
        }
        .wlc-mock-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .wlc-mock-row span {
          font-size: 11.5px;
          font-weight: 600;
          color: #64748B;
          width: 56px;
          text-align: right;
          flex-shrink: 0;
        }
        .wlc-mock-bar {
          height: 7px;
          background: linear-gradient(90deg, #3B82F6, #60A5FA);
          border-radius: 100px;
          flex: 1;
          transition: width 1s ease;
        }
        .wlc-mock-chip {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 100px;
          margin-bottom: 10px;
          margin-right: 6px;
        }
        .wlc-chip-green { background: rgba(5,150,105,0.08); color: #047857; border: 1px solid rgba(5,150,105,0.15); }
        .wlc-chip-blue  { background: rgba(59,130,246,0.08); color: #1D4ED8; border: 1px solid rgba(59,130,246,0.15); }
        .wlc-chip-purple { background: rgba(124,58,237,0.08); color: #7C3AED; border: 1px solid rgba(124,58,237,0.15); }
        .wlc-mock-stat-row {
          display: flex;
          gap: 16px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(214,233,255,0.7);
        }
        .wlc-mock-mini-stat { flex: 1; text-align: center; }
        .wlc-mms-val { display: block; font-size: 20px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px; }
        .wlc-mms-lbl { display: block; font-size: 10.5px; font-weight: 600; color: #64748B; margin-top: 2px; }

        /* ══════════════════════════════
           WHY CHOOSE
        ══════════════════════════════ */
        .wlc-why-section {
          padding: 100px 0;
          background: #FFFFFF;
        }
        .wlc-why-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }
        .wlc-why-card {
          background: linear-gradient(145deg, #EAF4FF 0%, #FFFFFF 100%);
          border: 1px solid rgba(214,233,255,0.9);
          border-radius: 24px;
          padding: 36px 24px;
          text-align: center;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 2px 12px rgba(15,23,42,0.03);
        }
        .wlc-why-card:hover {
          transform: translateY(-7px);
          border-color: rgba(59,130,246,0.25);
          box-shadow: 0 20px 50px rgba(30,111,217,0.1);
        }
        .wlc-why-icon {
          font-size: 32px;
          margin-bottom: 16px;
          display: block;
        }
        .wlc-why-title {
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
          margin-bottom: 8px;
        }
        .wlc-why-desc {
          font-size: 12.5px;
          color: #64748B;
          line-height: 1.55;
        }

        /* ══════════════════════════════
           TIMELINE
        ══════════════════════════════ */
        .wlc-timeline-section {
          padding: 100px 0;
          background: linear-gradient(180deg, #EAF4FF 0%, #F5F7FA 100%);
        }
        .wlc-timeline {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0;
          position: relative;
        }
        .wlc-timeline::before {
          content: '';
          position: absolute;
          top: 28px;
          left: 4%;
          right: 4%;
          height: 2px;
          background: linear-gradient(90deg, #3B82F6, #93C5FD, #3B82F6);
          background-size: 200% 100%;
          animation: wlcTimelineShift 4s linear infinite;
          z-index: 0;
        }
        @keyframes wlcTimelineShift {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        .wlc-timeline-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .wlc-tl-node { position: relative; }
        .wlc-tl-step {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(37,99,235,0.25);
          margin: 0 auto 20px;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }
        .wlc-timeline-item:hover .wlc-tl-step {
          transform: scale(1.15);
          box-shadow: 0 14px 36px rgba(37,99,235,0.35);
        }
        .wlc-tl-content { padding: 0 12px; }
        .wlc-tl-title {
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
          margin-bottom: 6px;
        }
        .wlc-tl-desc {
          font-size: 12.5px;
          color: #64748B;
          line-height: 1.5;
        }

        /* ══════════════════════════════
           TESTIMONIALS
        ══════════════════════════════ */
        .wlc-testimonials-section {
          padding: 100px 0;
          background: #FFFFFF;
        }
        .wlc-testimonials-carousel {
          position: relative;
          min-height: 260px;
        }
        .wlc-tcard {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%) scale(0.94);
          width: 100%;
          max-width: 700px;
          background: linear-gradient(145deg, #EAF4FF 0%, #FFFFFF 100%);
          border: 1px solid rgba(214,233,255,0.9);
          border-radius: 28px;
          padding: 44px 48px;
          opacity: 0;
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.25,0.8,0.25,1);
          box-shadow: 0 8px 36px rgba(15,23,42,0.05), 0 24px 64px rgba(15,23,42,0.04);
          pointer-events: none;
        }
        .wlc-tcard-active {
          opacity: 1;
          transform: translateX(-50%) scale(1);
          pointer-events: auto;
        }
        .wlc-tcard-quote {
          font-size: 72px;
          line-height: 0.6;
          color: #BFDBFE;
          font-family: Georgia, serif;
          margin-bottom: 18px;
        }
        .wlc-tcard-text {
          font-size: 17px;
          color: #334155;
          line-height: 1.75;
          font-weight: 500;
          margin-bottom: 28px;
        }
        .wlc-tcard-author {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .wlc-tcard-avatar {
          width: 48px; height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .wlc-tcard-name {
          font-size: 14.5px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
        }
        .wlc-tcard-role {
          font-size: 12.5px;
          color: #64748B;
          font-weight: 500;
          margin-top: 2px;
        }
        .wlc-tcard-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 280px;
        }
        .wlc-tcard-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(30,111,217,0.2);
          border: none;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          padding: 0;
        }
        .wlc-tcard-dot-active {
          background: #1E6FD9;
          transform: scale(1.3);
        }

        /* ══════════════════════════════
           FINAL CTA
        ══════════════════════════════ */
        .wlc-cta-section {
          padding: 120px 0;
          background: linear-gradient(160deg, #EAF4FF 0%, #D6E9FF 40%, #EAF4FF 100%);
          position: relative;
          overflow: hidden;
          text-align: center;
        }
        .wlc-cta-bg-blob-1, .wlc-cta-bg-blob-2 {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .wlc-cta-bg-blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
          top: -150px; left: -100px;
        }
        .wlc-cta-bg-blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
          bottom: -100px; right: -100px;
        }
        .wlc-cta-inner { position: relative; z-index: 2; }
        .wlc-cta-h2 {
          font-size: clamp(34px, 4.5vw, 60px);
          font-weight: 900;
          letter-spacing: -2px;
          color: #0F172A;
          line-height: 1.08;
          margin-bottom: 20px;
        }
        .wlc-cta-sub {
          font-size: 18px;
          color: #475569;
          line-height: 1.65;
          max-width: 480px;
          margin: 0 auto 40px;
        }
        .wlc-cta-actions {
          display: flex;
          justify-content: center;
        }

        /* ══════════════════════════════
           FOOTER
        ══════════════════════════════ */
        .wlc-footer {
          border-top: 1px solid rgba(214,233,255,0.8);
          background: #FFFFFF;
          padding: 28px 0;
        }
        .wlc-footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .wlc-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .wlc-footer-name {
          font-size: 14px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
        }
        .wlc-footer-copy {
          font-size: 12.5px;
          color: #64748B;
          font-weight: 500;
        }
        .wlc-footer-badge {
          background: rgba(30,111,217,0.05);
          border: 1px solid rgba(30,111,217,0.12);
          padding: 4px 14px;
          border-radius: 100px;
          font-size: 11.5px;
          font-weight: 600;
          color: #1E6FD9;
          flex-shrink: 0;
        }

        /* ══════════════════════════════
           SCROLL REVEAL
        ══════════════════════════════ */
        .wlc-reveal {
          opacity: 0;
          transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1);
        }
        .wlc-fade-up { transform: translateY(30px); }
        .wlc-reveal.wlc-revealed { opacity: 1; transform: none; }
        .wlc-delay-1 { transition-delay: 0.10s; }
        .wlc-delay-2 { transition-delay: 0.20s; }
        .wlc-delay-3 { transition-delay: 0.30s; }
        .wlc-delay-4 { transition-delay: 0.40s; }

        /* ══════════════════════════════
           RESPONSIVE
        ══════════════════════════════ */
        @media (max-width: 1100px) {
          .wlc-hero-inner {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .wlc-portals-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .wlc-portals-grid .wlc-portal-card:nth-child(4),
          .wlc-portals-grid .wlc-portal-card:nth-child(5) {
            grid-column: span 1;
          }
          .wlc-why-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 900px) {
          .wlc-container { padding: 0 28px; }
          .wlc-hero-inner {
            grid-template-columns: 1fr;
            gap: 48px;
            text-align: center;
          }
          .wlc-hero-left {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .wlc-hero-eyebrow { justify-content: center; }
          .wlc-hero-p { max-width: 100%; }
          .wlc-hero-actions { justify-content: center; }
          .wlc-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .wlc-portals-grid { grid-template-columns: repeat(2, 1fr); }
          .wlc-bento-grid { grid-template-columns: 1fr 1fr; }
          .wlc-bento-grid .wlc-bento-card:nth-child(1) { grid-column: span 2; }
          .wlc-bento-grid .wlc-bento-card:nth-child(6) { grid-column: span 2; }
          .wlc-experience-split { grid-template-columns: 1fr; gap: 48px; }
          .wlc-exp-sub { text-align: left; }
          .wlc-why-grid { grid-template-columns: repeat(3, 1fr); }
          .wlc-timeline { flex-direction: column; gap: 28px; }
          .wlc-timeline::before { display: none; }
          .wlc-timeline-item { flex-direction: row; text-align: left; gap: 20px; }
          .wlc-tl-step { margin: 0; }
          .wlc-tcard-dots { margin-top: 300px; }
        }

        @media (max-width: 640px) {
          .wlc-container { padding: 0 18px; }
          .wlc-nav-inst { display: none; }
          .wlc-nav-tag { display: none; }
          .wlc-nav { height: 58px; }
          .wlc-hero { padding-top: 80px; padding-bottom: 60px; }
          .wlc-hero-h1 { font-size: 36px; letter-spacing: -1.5px; }
          .wlc-hero-p { font-size: 15px; }
          .wlc-hero-actions { flex-direction: column; width: 100%; max-width: 320px; }
          .wlc-btn-primary, .wlc-btn-ghost {
            width: 100%;
            justify-content: center;
            padding: 16px 24px;
          }
          .wlc-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .wlc-stat-card { padding: 28px 16px; }
          .wlc-stat-val { font-size: 34px; }
          .wlc-portals-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .wlc-bento-grid { grid-template-columns: 1fr; }
          .wlc-bento-grid .wlc-bento-card:nth-child(1),
          .wlc-bento-grid .wlc-bento-card:nth-child(6) { grid-column: span 1; }
          .wlc-why-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .wlc-why-card { padding: 24px 16px; }
          .wlc-tcard { padding: 28px 24px; }
          .wlc-tcard-text { font-size: 15px; }
          .wlc-tcard-dots { margin-top: 340px; }
          .wlc-scroll-cue { display: none; }
          .wlc-glass-cluster { min-height: 300px; }
          .wlc-gcard-float { display: none; }
          .wlc-gcard-main {
            width: 95%;
            position: relative;
            top: auto; left: auto;
            transform: none;
            margin: 40px auto 0;
            animation: wlcCardFloatMob 6s ease-in-out infinite;
          }
          @keyframes wlcCardFloatMob {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-6px); }
          }
          .wlc-footer-inner { flex-direction: column; text-align: center; gap: 10px; }
          .wlc-cta-h2 { font-size: 32px; letter-spacing: -1.2px; }
          .wlc-cta-sub { font-size: 15px; }
        }
      `}</style>
    </div>
  );
};

export default Welcome;
