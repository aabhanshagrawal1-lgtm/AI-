import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import CodingAI from './coding-ai';

// ─── Inject global styles ──────────────────────────────────────────────────
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --bg:        #04040a;
        --surface:   #0b0b14;
        --border:    #1c1c2e;
        --accent:    #7c6aff;
        --accent2:   #38bdf8;
        --accent3:   #f472b6;
        --text:      #e2e8f0;
        --muted:     #475569;
        --glow:      rgba(124,106,255,0.35);
      }

      html, body, #root {
        height: 100%;
        width: 100%;
        background: var(--bg);
        color: var(--text);
        font-family: 'Syne', sans-serif;
        overflow: hidden;
      }

      /* custom scrollbar */
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 4px; }

      /* ── Splash animations ── */
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.6); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes spinSlow {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes spinSlowRev {
        from { transform: rotate(0deg); }
        to   { transform: rotate(-360deg); }
      }
      @keyframes pulse {
        0%,100% { opacity: .4; transform: scale(.85); }
        50%      { opacity: 1;  transform: scale(1.15); }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
      @keyframes orbit {
        from { transform: rotate(0deg) translateX(54px) rotate(0deg); }
        to   { transform: rotate(360deg) translateX(54px) rotate(-360deg); }
      }
      @keyframes orbit2 {
        from { transform: rotate(120deg) translateX(54px) rotate(-120deg); }
        to   { transform: rotate(480deg) translateX(54px) rotate(-480deg); }
      }
      @keyframes orbit3 {
        from { transform: rotate(240deg) translateX(54px) rotate(-240deg); }
        to   { transform: rotate(600deg) translateX(54px) rotate(-600deg); }
      }
      @keyframes gridPan {
        from { transform: translateY(0); }
        to   { transform: translateY(48px); }
      }
      @keyframes blink {
        0%,100% { opacity: 1; }
        50%      { opacity: 0; }
      }
      @keyframes slideOut {
        to { opacity: 0; transform: scale(1.06); }
      }
      @keyframes appIn {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .splash-exit  { animation: slideOut 0.55s cubic-bezier(.4,0,.2,1) forwards; }
      .app-enter    { animation: appIn   0.6s  cubic-bezier(.4,0,.2,1) forwards; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

// ─── Animated grid background ─────────────────────────────────────────────
const GridBG = () => (
  <div style={{
    position: 'absolute', inset: 0, overflow: 'hidden',
    backgroundImage: `
      linear-gradient(rgba(124,106,255,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,106,255,.04) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    animation: 'gridPan 4s linear infinite',
    maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 40%, transparent 100%)',
  }} />
);

// ─── Floating orbs ────────────────────────────────────────────────────────
const Orbs = () => (
  <>
    {[
      { size: 340, x: '15%',  y: '20%', color: 'rgba(124,106,255,0.13)', blur: 90,  delay: '0s'   },
      { size: 260, x: '70%',  y: '60%', color: 'rgba(56,189,248,0.10)',  blur: 70,  delay: '1.5s' },
      { size: 200, x: '50%',  y: '10%', color: 'rgba(244,114,182,0.08)', blur: 60,  delay: '3s'   },
    ].map((o, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: o.size, height: o.size,
        left: o.x, top: o.y,
        transform: 'translate(-50%,-50%)',
        borderRadius: '50%',
        background: o.color,
        filter: `blur(${o.blur}px)`,
        animation: `pulse 6s ease-in-out ${o.delay} infinite`,
        pointerEvents: 'none',
      }} />
    ))}
  </>
);

// ─── Central logo mark ────────────────────────────────────────────────────
const LogoMark = () => (
  <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 32px' }}>
    {/* outer ring */}
    <div style={{
      position: 'absolute', inset: 0,
      border: '1px solid rgba(124,106,255,.25)',
      borderRadius: '50%',
      animation: 'spinSlow 12s linear infinite',
    }}>
      <div style={{
        position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)',
      }} />
    </div>

    {/* inner ring */}
    <div style={{
      position: 'absolute', inset: 14,
      border: '1px solid rgba(56,189,248,.2)',
      borderRadius: '50%',
      animation: 'spinSlowRev 8s linear infinite',
    }}>
      <div style={{
        position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--accent2)', boxShadow: '0 0 8px var(--accent2)',
      }} />
    </div>

    {/* orbiting dots */}
    {['orbit','orbit2','orbit3'].map((a, i) => (
      <div key={i} style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 7, height: 7, marginTop: -3.5, marginLeft: -3.5,
        borderRadius: '50%',
        background: ['var(--accent)','var(--accent2)','var(--accent3)'][i],
        boxShadow: `0 0 8px ${['var(--accent)','var(--accent2)','var(--accent3)'][i]}`,
        animation: `${a} ${[3.8,4.4,3.2][i]}s linear infinite`,
      }} />
    ))}

    {/* core */}
    <div style={{
      position: 'absolute', inset: 28,
      background: 'linear-gradient(135deg, #7c6aff, #38bdf8)',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 26, fontWeight: 800, color: '#fff',
      boxShadow: '0 0 32px rgba(124,106,255,.6), 0 0 60px rgba(124,106,255,.25)',
    }}>∆</div>
  </div>
);

// ─── Typewriter ───────────────────────────────────────────────────────────
const WORDS = ['Code.', 'Debug.', 'Build.', 'Ship.', 'Learn.'];
const Typewriter = () => {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) { const t = setTimeout(() => setPaused(false), 1200); return () => clearTimeout(t); }
    const word = WORDS[wordIdx];
    if (!deleting) {
      if (displayed.length < word.length) {
        const t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
        return () => clearTimeout(t);
      } else { setPaused(true); setDeleting(true); }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
        return () => clearTimeout(t);
      } else { setDeleting(false); setWordIdx((wordIdx + 1) % WORDS.length); }
    }
  }, [displayed, deleting, paused, wordIdx]);

  return (
    <span style={{
      background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    }}>
      {displayed}
      <span style={{ animation: 'blink .7s step-end infinite', WebkitTextFillColor: 'var(--accent)' }}>|</span>
    </span>
  );
};

// ─── Progress bar ─────────────────────────────────────────────────────────
const ProgressBar = ({ progress }) => (
  <div style={{ width: 220, margin: '0 auto' }}>
    <div style={{
      height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden',
    }}>
      <div style={{
        height: '100%', width: `${progress}%`,
        background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
        borderRadius: 2,
        transition: 'width 0.3s ease',
        boxShadow: '0 0 8px var(--accent)',
      }} />
    </div>
    <div style={{
      textAlign: 'center', marginTop: 10,
      fontSize: 11, letterSpacing: '2px', color: 'var(--muted)',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {progress < 100 ? 'INITIALIZING...' : 'READY'}
    </div>
  </div>
);

// ─── Shimmer tag pills ─────────────────────────────────────────────────────
const Tags = () => (
  <div style={{
    display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap',
    marginTop: 28,
    animation: 'fadeUp .6s ease 1.2s both',
  }}>
    {['JavaScript','Python','TypeScript','Rust','Go','React'].map((t, i) => (
      <span key={t} style={{
        padding: '4px 12px',
        border: '1px solid var(--border)',
        borderRadius: 20,
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        color: 'var(--muted)',
        background: 'var(--surface)',
        animation: `fadeIn .4s ease ${0.9 + i * 0.08}s both`,
        transition: 'color .2s, border-color .2s',
        cursor: 'default',
      }}
        onMouseOver={e => { e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.borderColor='var(--accent)'; }}
        onMouseOut={e => { e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.borderColor='var(--border)'; }}
      >{t}</span>
    ))}
  </div>
);

// ─── Splash Screen ─────────────────────────────────────────────────────────
const Splash = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const steps = [
      [300,  18], [600,  35], [900,  52],
      [1200, 68], [1500, 82], [1800, 94], [2100, 100],
    ];
    const timers = steps.map(([delay, val]) =>
      setTimeout(() => setProgress(val), delay)
    );
    const done = setTimeout(() => {
      setExiting(true);
      setTimeout(onDone, 560);
    }, 2600);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [onDone]);

  return (
    <div ref={ref} className={exiting ? 'splash-exit' : ''}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
      <GridBG />
      <Orbs />

      {/* logo */}
      <div style={{ animation: 'scaleIn .6s cubic-bezier(.34,1.56,.64,1) .1s both', position: 'relative', zIndex: 1 }}>
        <LogoMark />
      </div>

      {/* name */}
      <div style={{
        animation: 'fadeUp .6s ease .4s both',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <h1 style={{
          fontSize: 48, fontWeight: 800, letterSpacing: '-2px',
          background: 'linear-gradient(135deg, #fff 30%, var(--accent) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1.1, marginBottom: 10,
        }}>CodeMind</h1>
        <p style={{
          fontSize: 15, color: 'var(--muted)',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '1px',
          marginBottom: 32,
        }}>
          AI that can&nbsp; <Typewriter />
        </p>
        <ProgressBar progress={progress} />
        <Tags />
      </div>
    </div>
  );
};

// ─── Root App ──────────────────────────────────────────────────────────────
const App = () => {
  const [ready, setReady] = useState(false);

  return (
    <>
      <GlobalStyles />
      {!ready && <Splash onDone={() => setReady(true)} />}
      {ready && (
        <div className="app-enter" style={{ height: '100%' }}>
          <CodingAI />
        </div>
      )}
    </>
  );
};

// ─── Mount ─────────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
