/**
 * WelcomeLoader.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium full-screen loading screen shown while JITmainblock4.glb loads.
 *
 * Strategy
 * ─────────
 *  • 0 → 90 %  : driven by @react-three/drei useProgress (real GLB load)
 *  • 90 → 100% : 800 ms smooth fill AFTER the model finishes loading
 *  • Exits with a blue-light sweep + 600 ms opacity fade
 *
 * Usage (inside Welcome.tsx)
 * ─────────────────────────────
 *   import WelcomeLoader from '../components/WelcomeLoader';
 *
 *   const [glbReady, setGlbReady] = useState(false);
 *   ...
 *   {!glbReady && <WelcomeLoader onDone={() => setGlbReady(true)} />}
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useProgress } from '@react-three/drei';

// ─── Rotating messages ────────────────────────────────────────────────────────
const MESSAGES = [
  'Loading Campus Environment...',
  'Initializing Student Services...',
  'Connecting Academic Systems...',
  'Preparing 3D Experience...',
];

// ─── Props ───────────────────────────────────────────────────────────────────
interface WelcomeLoaderProps {
  /** Called after the exit animation fully completes */
  onDone: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const WelcomeLoader: React.FC<WelcomeLoaderProps> = ({ onDone }) => {
  // drei's real model loading progress (0 – 100)
  const { progress: rawProgress, loaded, total } = useProgress();

  // Display progress: 0→90 from rawProgress, then eased to 100
  const [displayPct, setDisplayPct] = useState(0);
  const [msgIdx, setMsgIdx]         = useState(0);
  const [sweeping, setSweeping]     = useState(false); // blue sweep triggered
  const [exiting, setExiting]       = useState(false); // fade-out triggered
  const doneRef                     = useRef(false);   // prevent double-fire
  const finishTimer                 = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Canvas ref for 2-D floating particles
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Message rotation ──────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  // ── Map rawProgress → displayPct (0–90) ───────────────────────────────────
  useEffect(() => {
    const target = Math.min(rawProgress * 0.9, 90);      // cap at 90 until done
    setDisplayPct(prev => Math.max(prev, target));        // never go backwards
  }, [rawProgress]);

  // ── When model fully loaded → ease 90→100 then exit ─────────────────────
  const modelDone = loaded > 0 && total > 0 && loaded >= total;

  const triggerExit = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;

    // Fill to 100
    setDisplayPct(100);

    // 400ms: show 100% → trigger light sweep
    finishTimer.current = setTimeout(() => {
      setSweeping(true);

      // 300ms into sweep → start fade
      finishTimer.current = setTimeout(() => {
        setExiting(true);

        // 700ms → call onDone
        finishTimer.current = setTimeout(() => {
          onDone();
        }, 700);
      }, 300);
    }, 400);
  }, [onDone]);

  useEffect(() => {
    if (modelDone) triggerExit();
  }, [modelDone, triggerExit]);

  // Fallback: if progress stalls at 100 but loaded/total haven't fired
  useEffect(() => {
    if (rawProgress >= 100 && !doneRef.current) {
      triggerExit();
    }
  }, [rawProgress, triggerExit]);

  // ── 2-D sparkle particle canvas ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = (canvas.width  = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const particles = Array.from({ length: 90 }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 2.8 + 0.4,
      dx:    (Math.random() - 0.5) * 0.35,
      dy:    -(Math.random() * 0.55 + 0.15),
      alpha: Math.random() * 0.55 + 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.pulse += 0.022;
        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(96,165,250,${a})`);
        g.addColorStop(1, `rgba(37,99,235,0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -8)              { p.y = H + 8; p.x = Math.random() * W; }
        if (p.x < -8 || p.x > W + 8) { p.x = Math.random() * W; p.y = H + 8; }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      if (finishTimer.current) {
        clearTimeout(finishTimer.current);
      }
    };
  }, []);

  const pct = Math.round(displayPct);

  return (
    <div
      aria-label="Loading JIT PERMIGO"
      role="status"
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         10000,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'linear-gradient(135deg,#f8fbff 0%,#edf5ff 40%,#dbeafe 100%)',
        fontFamily:     "'Inter',-apple-system,sans-serif",
        overflow:       'hidden',
        opacity:        exiting ? 0 : 1,
        transition:     exiting
          ? 'opacity 0.7s cubic-bezier(0.4,0,0.2,1)'
          : 'none',
        WebkitFontSmoothing: 'antialiased',
        userSelect:     'none',
      }}
    >

      {/* ── Animated gradient blobs ──────────────────────────────────────── */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{
          position:'absolute', width:750, height:750,
          top:-250, left:-180,
          background:'radial-gradient(circle,rgba(37,99,235,0.11) 0%,transparent 70%)',
          filter:'blur(90px)',
          animation:'wlBlobA 18s ease-in-out infinite alternate',
        }} />
        <div style={{
          position:'absolute', width:600, height:600,
          bottom:-150, right:-120,
          background:'radial-gradient(circle,rgba(96,165,250,0.13) 0%,transparent 70%)',
          filter:'blur(80px)',
          animation:'wlBlobB 22s ease-in-out infinite alternate',
        }} />
        <div style={{
          position:'absolute', width:450, height:450,
          top:'30%', right:'15%',
          background:'radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%)',
          filter:'blur(70px)',
          animation:'wlBlobC 26s ease-in-out infinite alternate',
        }} />
      </div>

      {/* ── Subtle dot-grid ──────────────────────────────────────────────── */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:
          'radial-gradient(circle, rgba(37,99,235,0.08) 1px, transparent 1px)',
        backgroundSize:'36px 36px',
        opacity: 0.6,
      }} />

      {/* ── 2-D Floating sparkle particles ──────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:1 }}
      />

      {/* ── Light sweep overlay (fires at 100%) ──────────────────────────── */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:8,
        background:'linear-gradient(105deg,transparent 30%,rgba(147,197,253,0.55) 50%,transparent 70%)',
        transform: sweeping ? 'translateX(100%)' : 'translateX(-100%)',
        transition: sweeping ? 'transform 0.7s cubic-bezier(0.4,0,0.2,1)' : 'none',
      }} />

      {/* ── Glassmorphism card ───────────────────────────────────────────── */}
      <div
        style={{
          position:'relative', zIndex:5,
          display:'flex', flexDirection:'column', alignItems:'center',
          gap:0,
          background:'rgba(255,255,255,0.65)',
          backdropFilter:'blur(32px) saturate(180%)',
          WebkitBackdropFilter:'blur(32px) saturate(180%)',
          border:'1px solid rgba(255,255,255,0.75)',
          borderRadius:28,
          padding:'48px 52px 44px',
          maxWidth:400,
          width:'calc(100% - 48px)',
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.35) inset,' +
            '0 8px 40px rgba(37,99,235,0.1),' +
            '0 32px 80px rgba(0,0,0,0.08)',
        }}
      >
        {/* Shine strip */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:'50%',
          background:'linear-gradient(180deg,rgba(255,255,255,0.5) 0%,transparent 100%)',
          borderRadius:'28px 28px 0 0', pointerEvents:'none',
        }} />

        {/* Glow ring + logo orb */}
        <div style={{ position:'relative', marginBottom:28 }}>
          {/* Outer animated ring */}
          <div style={{
            position:'absolute',
            top:'50%', left:'50%',
            width:120, height:120,
            transform:'translate(-50%,-50%)',
            borderRadius:'50%',
            border:'2px solid transparent',
            background:
              'linear-gradient(white,white) padding-box,' +
              'conic-gradient(from var(--ring-angle,0deg),#3B82F6,#7C3AED,#38BDF8,#3B82F6) border-box',
            animation:'wlRingRotate 2.4s linear infinite',
          }} />
          {/* Glow halo */}
          <div style={{
            position:'absolute',
            top:'50%', left:'50%',
            width:104, height:104,
            transform:'translate(-50%,-50%)',
            borderRadius:'50%',
            background:'rgba(37,99,235,0.18)',
            filter:'blur(16px)',
            animation:'wlPulseGlow 2.2s ease-in-out infinite',
          }} />
          {/* Logo orb */}
          <div style={{
            width:80, height:80,
            borderRadius:'50%',
            background:'linear-gradient(135deg,#3B82F6,#7C3AED)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 32px rgba(37,99,235,0.45)',
            position:'relative', zIndex:1,
          }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M9 26L18 10L27 26H9Z" fill="white" fillOpacity="0.95" />
              <rect x="15" y="20" width="6" height="6" rx="2" fill="white" fillOpacity="0.7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize:24, fontWeight:900, color:'#0F172A',
          letterSpacing:'-0.7px', lineHeight:1.1,
          marginBottom:6, textAlign:'center',
        }}>
          JIT PERMIGO
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize:13, color:'#64748B', fontWeight:500,
          marginBottom:32, textAlign:'center', lineHeight:1.5,
        }}>
          Preparing Digital Campus Experience
        </p>

        {/* Rotating loading message */}
        <div style={{
          height:20, overflow:'hidden', marginBottom:18,
          width:'100%', textAlign:'center',
        }}>
          <p
            key={msgIdx}
            style={{
              fontSize:12.5, fontWeight:600,
              color:'#2563EB', letterSpacing:'0.2px',
              animation:'wlMsgIn 0.4s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            {MESSAGES[msgIdx]}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width:'100%' }}>
          <div style={{
            display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:8,
          }}>
            <span style={{ fontSize:11.5, color:'#94A3B8', fontWeight:500 }}>
              Loading assets
            </span>
            <span style={{
              fontSize:13, fontWeight:800, color:'#2563EB',
              fontVariantNumeric:'tabular-nums',
              transition:'all 0.25s ease',
            }}>
              {pct}%
            </span>
          </div>

          {/* Track */}
          <div style={{
            width:'100%', height:5,
            background:'rgba(37,99,235,0.1)',
            borderRadius:100, overflow:'hidden',
          }}>
            {/* Fill */}
            <div style={{
              height:'100%',
              width:`${pct}%`,
              background:'linear-gradient(90deg,#2563EB,#60A5FA)',
              borderRadius:100,
              transition:'width 0.18s linear',
              boxShadow:'0 0 14px rgba(37,99,235,0.55)',
              position:'relative', overflow:'hidden',
            }}>
              {/* Shimmer */}
              <div style={{
                position:'absolute', inset:0,
                background:
                  'linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)',
                animation:'wlShimmer 1.4s ease-in-out infinite',
              }} />
            </div>
          </div>
        </div>

        {/* Version chip */}
        <div style={{
          marginTop:22,
          display:'inline-flex', alignItems:'center', gap:7,
          background:'rgba(37,99,235,0.06)',
          border:'1px solid rgba(37,99,235,0.14)',
          borderRadius:100, padding:'5px 14px',
        }}>
          <span style={{
            width:6, height:6, borderRadius:'50%',
            background:'#22C55E',
            boxShadow:'0 0 0 3px rgba(34,197,94,0.2)',
            display:'inline-block', flexShrink:0,
            animation:'wlDotBlink 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize:11, fontWeight:700, color:'#2563EB', letterSpacing:'0.3px' }}>
            Jeppiaar Institute of Technology
          </span>
        </div>
      </div>

      {/* ── Bottom tagline ───────────────────────────────────────────────── */}
      <p style={{
        position:'relative', zIndex:5,
        marginTop:28, fontSize:11.5, color:'rgba(15,23,42,0.35)', fontWeight:500,
      }}>
        © 2025 Jeppiaar Institute of Technology
      </p>

      {/* ── Keyframes ───────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        @property --ring-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }

        @keyframes wlRingRotate {
          to { --ring-angle: 360deg; }
        }

        @keyframes wlPulseGlow {
          0%, 100% { opacity: 0.6; transform: translate(-50%,-50%) scale(1); }
          50%       { opacity: 1;   transform: translate(-50%,-50%) scale(1.18); }
        }

        @keyframes wlBlobA {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(70px,90px) scale(1.14); }
        }
        @keyframes wlBlobB {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(-60px,-70px) scale(1.11); }
        }
        @keyframes wlBlobC {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(45px,-55px) scale(1.09); }
        }

        @keyframes wlShimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes wlMsgIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes wlDotBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default WelcomeLoader;
