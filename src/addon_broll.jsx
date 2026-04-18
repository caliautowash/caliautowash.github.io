/* Add-ons — B-roll cinematic scroll sequence
   Desktop: pinned sticky canvas with a Lambo silhouette, scissor door opens,
   camera zooms toward interior as the user scrolls through 6 "beats" —
   one per add-on.
   Mobile: falls back to the editorial list. */

const { useRef, useState, useEffect } = React;

const ADDONS = [
  { name: 'Pet hair removal',      sub: 'Rubber tools and extraction for stubborn fur stuck deep in the fabric.' },
  { name: 'Stain treatment',       sub: 'Coffee, grease, ink, mystery spots — lifted, not covered.' },
  { name: 'Odor treatment',        sub: 'Enzyme plus ozone. Gone for good, not masked with an air freshener.' },
  { name: 'Headlight restoration', sub: 'Sanded, polished, sealed. Night driving returned to factory.' },
  { name: 'Engine bay cleaning',   sub: 'Degrease, dress, and detail everything under the hood.' },
  { name: 'Trim restoration',      sub: 'Faded black plastic around the doors and bumpers — brought back.' },
];

// --- STYLED LAMBO SVG --------------------------------------------------
// Side profile, low wedge, scissor door hinged at the front A-pillar.
// The door is a separate <g> element so we can rotate it with a CSS var.
function LamboScene({ progress }) {
  // progress 0..1 across full pin
  // Map to scene beats:
  //   0.00 – 0.12  settle exterior
  //   0.12 – 0.38  door lifts (0° → 75°)
  //   0.38 – 0.70  camera zooms toward door (scale 1 → 3.2, translate up/left)
  //   0.70 – 1.00  inside, interior panel visible
  const doorAngle = clamp((progress - 0.12) / 0.26, 0, 1) * 75;
  const zoom = 1 + clamp((progress - 0.38) / 0.32, 0, 1) * 2.2;
  const zoomTx = -clamp((progress - 0.38) / 0.32, 0, 1) * 180; // slide scene left as we zoom
  const zoomTy = -clamp((progress - 0.38) / 0.32, 0, 1) * 40;
  const interiorOpacity = clamp((progress - 0.58) / 0.18, 0, 1);
  const exteriorFade = 1 - clamp((progress - 0.82) / 0.18, 0, 1);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflow: 'hidden',
      background: 'radial-gradient(120% 80% at 50% 40%, oklch(0.22 0.02 60) 0%, oklch(0.12 0.015 50) 55%, oklch(0.08 0.01 45) 100%)',
    }}>
      {/* horizon glow */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '55%',
        height: 2, background: 'linear-gradient(90deg, transparent, oklch(0.55 0.18 45 / 0.4) 30%, oklch(0.65 0.18 50 / 0.5) 50%, oklch(0.55 0.18 45 / 0.4) 70%, transparent)',
        filter: 'blur(1px)',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '56%', bottom: '40%',
        background: 'linear-gradient(to bottom, oklch(0.4 0.12 45 / 0.2), transparent)',
      }} />

      {/* dust particles */}
      <Particles progress={progress} />

      {/* SCENE */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          transform: `translate(${zoomTx}px, ${zoomTy}px) scale(${zoom})`,
          transformOrigin: '55% 50%',
          transition: 'transform 0.08s linear',
          opacity: exteriorFade,
        }}
      >
        {/* ground reflection */}
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a1a1f" />
            <stop offset="0.5" stopColor="#0a0a0d" />
            <stop offset="1" stopColor="#050506" />
          </linearGradient>
          <linearGradient id="bodyHighlight" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0" stopColor="oklch(0.55 0.18 45 / 0.0)" />
            <stop offset="0.5" stopColor="oklch(0.65 0.18 50 / 0.35)" />
            <stop offset="1" stopColor="oklch(0.45 0.15 45 / 0.0)" />
          </linearGradient>
          <linearGradient id="windowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(0.3 0.02 240)" />
            <stop offset="1" stopColor="oklch(0.08 0.01 240)" />
          </linearGradient>
          <linearGradient id="doorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e1e22" />
            <stop offset="1" stopColor="#06060a" />
          </linearGradient>
        </defs>

        {/* ground shadow */}
        <ellipse cx="800" cy="640" rx="540" ry="24" fill="#000" opacity="0.7" />
        <ellipse cx="800" cy="642" rx="460" ry="12" fill="#000" opacity="0.5" filter="blur(2px)" />

        {/* car silhouette - rear wheel */}
        <circle cx="1180" cy="590" r="58" fill="#0a0a0c" stroke="#1a1a20" strokeWidth="1" />
        <circle cx="1180" cy="590" r="38" fill="#16161a" />
        <circle cx="1180" cy="590" r="36" fill="none" stroke="oklch(0.55 0.18 45 / 0.3)" strokeWidth="1" />
        {/* brake caliper glow */}
        <path d="M 1155 565 A 36 36 0 0 1 1155 615" stroke="oklch(0.65 0.18 50)" strokeWidth="4" fill="none" opacity="0.7" />

        {/* front wheel */}
        <circle cx="460" cy="590" r="58" fill="#0a0a0c" stroke="#1a1a20" strokeWidth="1" />
        <circle cx="460" cy="590" r="38" fill="#16161a" />
        <circle cx="460" cy="590" r="36" fill="none" stroke="oklch(0.55 0.18 45 / 0.3)" strokeWidth="1" />
        <path d="M 435 565 A 36 36 0 0 1 435 615" stroke="oklch(0.65 0.18 50)" strokeWidth="4" fill="none" opacity="0.7" />

        {/* body - low wedge Aventador-ish silhouette */}
        {/* lower sill */}
        <path d="
          M 300 610
          L 260 580
          L 280 540
          L 380 500
          L 520 500
          L 580 470
          L 820 440
          L 980 440
          L 1050 470
          L 1180 500
          L 1320 510
          L 1360 540
          L 1370 590
          L 1320 610
          L 1240 610
          L 1220 600
          L 1140 600
          L 1120 610
          L 520 610
          L 500 600
          L 420 600
          L 400 610
          Z
        " fill="url(#bodyGrad)" />

        {/* body highlight sweep */}
        <path d="
          M 380 500
          L 520 500
          L 580 470
          L 820 440
          L 980 440
          L 1050 470
          L 1050 475
          L 980 445
          L 820 445
          L 580 475
          L 520 505
          L 380 505
          Z
        " fill="url(#bodyHighlight)" />

        {/* greenhouse / windows (visible when door closed) */}
        <g style={{ opacity: doorAngle > 5 ? 0 : 1, transition: 'opacity 0.2s' }}>
          <path d="
            M 590 470
            L 640 410
            L 880 400
            L 990 405
            L 1020 470
            L 820 458
            L 680 462
            Z
          " fill="url(#windowGrad)" opacity="0.85" />
          {/* window reflection */}
          <path d="M 640 410 L 700 415 L 720 450 L 660 448 Z" fill="oklch(0.85 0.1 60 / 0.25)" />
        </g>

        {/* INTERIOR revealed when door opens */}
        <g style={{ opacity: doorAngle > 5 ? 1 : 0, transition: 'opacity 0.2s' }}>
          {/* cavity */}
          <path d="
            M 620 470
            L 660 430
            L 880 420
            L 980 425
            L 1000 470
            L 980 540
            L 660 540
            Z
          " fill="#020203" />
          {/* seat back */}
          <path d="M 760 450 L 880 445 L 900 520 L 780 525 Z"
            fill="#1a0e08" stroke="oklch(0.35 0.08 40)" strokeWidth="0.5" opacity={interiorOpacity * 0.9 + 0.1} />
          {/* carbon fiber trim */}
          <path d="M 660 525 L 970 520 L 975 535 L 660 540 Z"
            fill="#0a0a0d" stroke="oklch(0.5 0.02 260 / 0.4)" strokeWidth="0.3" opacity={interiorOpacity * 0.9 + 0.1} />
          {/* steering wheel hint */}
          <circle cx="710" cy="485" r="18" fill="none" stroke="#2a2a30" strokeWidth="2.5" opacity={interiorOpacity * 0.9 + 0.1} />
          {/* stitching highlight */}
          <path d="M 790 470 Q 820 465 850 470" fill="none"
            stroke="oklch(0.65 0.18 50)" strokeWidth="0.6" strokeDasharray="2 3" opacity={interiorOpacity} />
        </g>

        {/* SCISSOR DOOR — hinged at front top (A-pillar base ~ 640, 410) */}
        <g style={{
          transform: `rotate(${-doorAngle}deg)`,
          transformOrigin: '640px 410px',
          transition: 'transform 0.08s linear',
        }}>
          <path d="
            M 640 410
            L 880 400
            L 990 405
            L 1020 470
            L 1000 475
            L 980 440
            L 820 445
            L 680 462
            L 620 470
            Z
          " fill="url(#doorGrad)" stroke="#0a0a0e" strokeWidth="1" />
          {/* door window */}
          <path d="M 660 430 L 880 420 L 980 425 L 998 465 L 820 455 L 680 460 Z"
            fill="url(#windowGrad)" opacity="0.9" />
          {/* door edge highlight */}
          <path d="M 640 410 L 880 400 L 990 405" fill="none"
            stroke="oklch(0.55 0.18 45 / 0.5)" strokeWidth="1.5" />
          {/* door handle */}
          <rect x="900" y="445" width="28" height="3.5" rx="1.5" fill="#3a3a40" />
        </g>

        {/* front details */}
        <path d="M 280 540 L 300 510 L 370 495 L 350 540 Z" fill="#0a0a0d" />
        {/* headlight */}
        <path d="M 280 550 L 330 535 L 335 555 L 290 565 Z" fill="oklch(0.85 0.1 85)" opacity="0.95" />
        <path d="M 280 550 L 330 535 L 335 555 L 290 565 Z" fill="oklch(0.95 0.06 85)" opacity="0.3"
          filter="blur(4px)" transform="scale(1.2) translate(-50 -110)" />
        {/* lambo scissor-door line on car silhouette */}
        <line x1="620" y1="470" x2="640" y2="410" stroke="oklch(0.4 0.02 50)" strokeWidth="0.5" />
      </svg>

      {/* INTERIOR FULL-FRAME (replaces exterior at end) */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 1 - exteriorFade,
        pointerEvents: 'none',
      }}>
        <InteriorFrame />
      </div>
    </div>
  );
}

function Particles({ progress }) {
  // motes of dust lit from above
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: 24 }).map((_, i) => {
        const seed = i * 37 % 100;
        const x = (seed * 7.3) % 100;
        const y = (seed * 3.7) % 80 + 10;
        const size = 1 + (seed % 4) * 0.6;
        const delay = (i % 8) * 0.5;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${x}%`, top: `${y}%`,
            width: size, height: size, borderRadius: '50%',
            background: 'oklch(0.85 0.1 60)',
            opacity: 0.3 + (progress * 0.3),
            boxShadow: '0 0 6px oklch(0.75 0.15 55 / 0.6)',
            animation: `particle-drift 8s ${delay}s linear infinite`,
          }} />
        );
      })}
    </div>
  );
}

function InteriorFrame() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="intVignette" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#1a1208" stopOpacity="0" />
          <stop offset="0.7" stopColor="#060403" stopOpacity="0.6" />
          <stop offset="1" stopColor="#000" stopOpacity="0.95" />
        </radialGradient>
        <linearGradient id="leatherGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a1a0e" />
          <stop offset="0.5" stopColor="#1f0c06" />
          <stop offset="1" stopColor="#0a0403" />
        </linearGradient>
        <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0808" />
          <stop offset="1" stopColor="#020202" />
        </linearGradient>
      </defs>
      {/* seat in foreground */}
      <rect x="0" y="540" width="1600" height="360" fill="url(#leatherGrad)" />
      {/* seat bolster */}
      <path d="M 0 540 Q 400 500 800 510 Q 1200 500 1600 540 L 1600 900 L 0 900 Z" fill="url(#leatherGrad)" />
      {/* stitching */}
      <path d="M 100 560 Q 400 540 800 548 Q 1200 540 1500 560" fill="none"
        stroke="oklch(0.65 0.18 50)" strokeWidth="1" strokeDasharray="4 5" />
      <path d="M 100 600 Q 400 580 800 586 Q 1200 580 1500 600" fill="none"
        stroke="oklch(0.55 0.14 50 / 0.7)" strokeWidth="0.8" strokeDasharray="3 4" />

      {/* dashboard */}
      <path d="M 0 0 L 1600 0 L 1600 340 Q 800 300 0 340 Z" fill="url(#dashGrad)" />
      {/* digital cluster */}
      <rect x="560" y="170" width="480" height="110" rx="10" fill="#040608" stroke="oklch(0.5 0.18 45 / 0.4)" strokeWidth="1" />
      <path d="M 610 230 L 670 230 L 680 205 L 720 255 L 750 220 L 810 225"
        fill="none" stroke="oklch(0.65 0.18 50)" strokeWidth="1.5" opacity="0.8" />
      <text x="860" y="230" fill="oklch(0.75 0.1 50 / 0.8)" fontFamily="monospace" fontSize="18" letterSpacing="2">85°</text>

      {/* steering wheel */}
      <circle cx="400" cy="500" r="130" fill="none" stroke="#1a1a1a" strokeWidth="26" />
      <circle cx="400" cy="500" r="130" fill="none" stroke="oklch(0.55 0.18 45 / 0.3)" strokeWidth="1" />
      <rect x="340" y="470" width="120" height="50" rx="8" fill="#0a0a0c" />
      <circle cx="400" cy="495" r="5" fill="oklch(0.65 0.18 50)" opacity="0.7" />

      {/* carbon fiber door trim on right */}
      <rect x="1250" y="300" width="350" height="280" fill="#05060a" />
      {/* carbon weave pattern */}
      {Array.from({ length: 30 }).map((_, i) => (
        <line key={i} x1={1250 + (i % 6) * 60} y1={300 + Math.floor(i / 6) * 56}
          x2={1250 + (i % 6) * 60 + 30} y2={300 + Math.floor(i / 6) * 56 + 28}
          stroke="oklch(0.25 0.01 250)" strokeWidth="1" opacity="0.6" />
      ))}

      {/* vignette */}
      <rect x="0" y="0" width="1600" height="900" fill="url(#intVignette)" />
    </svg>
  );
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// --- PINNED SCROLL SECTION ---------------------------------------------
function AddonsBroll() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)');
    const update = () => setSupported(!mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!supported) return;
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const raw = (-rect.top) / total;
      setProgress(clamp(raw, 0, 1));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [supported]);

  if (!supported) {
    // Mobile fallback: the prior editorial list
    return <AddonsFallback />;
  }

  // Active addon index based on progress
  // After door opens (progress > 0.2), step through 6 addons over remaining 0.8
  const addonProgress = clamp((progress - 0.15) / 0.8, 0, 1);
  const activeIdx = Math.min(ADDONS.length - 1, Math.floor(addonProgress * ADDONS.length));

  return (
    <section ref={sectionRef} style={{
      position: 'relative',
      height: '500vh',  // 5 viewports of scroll for the long cinematic
      background: 'var(--ink)',
      color: 'var(--cream)',
    }}>
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', width: '100%',
        overflow: 'hidden',
      }}>
        <LamboScene progress={progress} />

        {/* Chapter label top-left */}
        <div style={{
          position: 'absolute', top: '2rem', left: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          opacity: clamp(1 - (progress - 0.9) / 0.1, 0, 1),
        }}>
          <span style={{ width: 24, height: 1, background: 'oklch(0.65 0.18 50)' }} />
          <span className="num-label" style={{
            color: 'oklch(0.75 0.15 55)',
            fontSize: '0.65rem',
          }}>EXTRAS · THE B-ROLL</span>
        </div>

        {/* Progress indicator top-right */}
        <div style={{
          position: 'absolute', top: '2rem', right: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          color: 'oklch(0.7 0.04 60 / 0.8)',
          letterSpacing: '0.1em',
        }}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{String(activeIdx + 1).padStart(2, '0')}</span>
          <div style={{
            width: 80, height: 1,
            background: 'oklch(0.4 0.02 60 / 0.4)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%',
              width: `${addonProgress * 100}%`,
              background: 'oklch(0.75 0.15 55)',
            }} />
          </div>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{String(ADDONS.length).padStart(2, '0')}</span>
        </div>

        {/* Opening title */}
        <div style={{
          position: 'absolute', left: '50%', top: '40%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          opacity: clamp(1 - progress / 0.15, 0, 1),
          transition: 'opacity 0.2s',
          pointerEvents: 'none',
        }}>
          <div className="num-label" style={{
            color: 'oklch(0.75 0.15 55)',
            marginBottom: '1rem',
          }}>
            SCROLL TO OPEN
          </div>
          <h3 className="display" style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 400, lineHeight: 1,
            color: 'var(--cream)',
          }}>
            Anything<br/>
            <span style={{ fontStyle: 'italic', color: 'oklch(0.8 0.15 55)' }}>
              else?
            </span>
          </h3>
        </div>

        {/* Subtitle card — the current add-on */}
        <div style={{
          position: 'absolute', left: '5%', bottom: '8%',
          maxWidth: 520,
          opacity: clamp((progress - 0.18) / 0.08, 0, 1),
          pointerEvents: 'none',
        }}>
          {ADDONS.map((a, i) => (
            <div key={a.name} style={{
              position: i === 0 ? 'relative' : 'absolute',
              inset: i === 0 ? 'auto' : 0,
              opacity: i === activeIdx ? 1 : 0,
              transform: i === activeIdx ? 'translateY(0)' : (i < activeIdx ? 'translateY(-12px)' : 'translateY(12px)'),
              transition: 'opacity 0.5s var(--ease), transform 0.5s var(--ease)',
            }}>
              <div className="num-label" style={{
                color: 'oklch(0.75 0.15 55)',
                marginBottom: '0.6rem',
                fontSize: '0.65rem',
              }}>
                {String(i + 1).padStart(2, '0')} · EXTRA
              </div>
              <h4 className="display" style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
                fontWeight: 400,
                color: 'var(--cream)',
                letterSpacing: '-0.02em',
                lineHeight: 1.02,
                marginBottom: '0.85rem',
                textShadow: '0 2px 24px rgba(0,0,0,0.8)',
              }}>
                {a.name}
              </h4>
              <p style={{
                fontSize: '1.05rem',
                color: 'oklch(0.88 0.04 60)',
                lineHeight: 1.5,
                textWrap: 'pretty',
                textShadow: '0 1px 16px rgba(0,0,0,0.8)',
              }}>
                {a.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Final CTA card at end of sequence */}
        <div style={{
          position: 'absolute', right: '5%', top: '50%',
          transform: 'translateY(-50%)',
          maxWidth: 340,
          opacity: clamp((progress - 0.88) / 0.08, 0, 1),
          pointerEvents: progress > 0.9 ? 'auto' : 'none',
        }}>
          <div style={{
            background: 'color-mix(in oklch, var(--cream) 96%, transparent)',
            color: 'var(--ink)',
            padding: '2rem',
            border: '1px solid color-mix(in oklch, var(--ink) 15%, transparent)',
          }}>
            <div className="num-label" style={{
              color: 'var(--terracotta-deep)',
              marginBottom: '0.75rem',
              fontSize: '0.62rem',
            }}>
              OR SOMETHING NOT LISTED?
            </div>
            <h4 className="display" style={{
              fontSize: '1.8rem', fontWeight: 400,
              lineHeight: 1.1, marginBottom: '1rem',
              letterSpacing: '-0.01em',
            }}>
              Text us a <span style={{ fontStyle: 'italic', color: 'var(--terracotta-deep)' }}>photo</span>,
              we'll quote it back.
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href={`tel:${PHONE_TEL}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.7rem 1.15rem',
                border: '1px solid var(--ink)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                <Icon.phone /> {PHONE}
              </a>
              <a href="#book" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.7rem 1.15rem',
                background: 'var(--terracotta)',
                color: 'var(--cream)',
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Book now <Icon.arrow />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes particle-drift {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translate(40px, -60px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

// Mobile fallback — the previous editorial list
function AddonsFallback() {
  return (
    <section style={{
      background: 'var(--sand)',
      padding: '4.5rem 0',
      borderTop: '1px solid var(--rule)',
      borderBottom: '1px solid var(--rule)',
    }}>
      <div className="wrap">
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <span style={{ width: 32, height: 1, background: 'var(--terracotta)' }} />
          <span className="num-label" style={{ color: 'var(--terracotta-deep)' }}>EXTRAS</span>
        </div>
        <h3 className="display" style={{
          fontSize: 'clamp(2rem, 6vw, 2.8rem)',
          fontWeight: 400, lineHeight: 1,
          marginBottom: '1.25rem',
        }}>
          Anything <span style={{ fontStyle: 'italic', color: 'var(--terracotta-deep)' }}>else?</span>
        </h3>
        <p style={{
          fontSize: '1rem', color: 'var(--ink-soft)',
          lineHeight: 1.6, maxWidth: '38ch',
          textWrap: 'pretty', marginBottom: '2rem',
        }}>
          These add-ons pair with any wash or detail — or book them on their own.
          Not listed? Text us. We've probably done it.
        </p>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {ADDONS.map((a, i) => (
            <li key={a.name} style={{
              padding: '1.25rem 0',
              borderTop: i === 0 ? 'none' : '1px solid color-mix(in oklch, var(--ink) 12%, transparent)',
            }}>
              <div className="num-label" style={{
                fontSize: '0.6rem', color: 'var(--terracotta-deep)',
                marginBottom: '0.35rem',
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <h4 className="display" style={{
                fontSize: '1.5rem', fontWeight: 400,
                lineHeight: 1.1, marginBottom: '0.4rem',
              }}>
                {a.name}
              </h4>
              <p style={{
                fontSize: '0.95rem', color: 'var(--ink-soft)',
                lineHeight: 1.5, textWrap: 'pretty',
              }}>
                {a.sub}
              </p>
            </li>
          ))}
        </ol>
        <a href={`tel:${PHONE_TEL}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
          marginTop: '2rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--ink)',
          borderBottom: '1px solid var(--ink)', paddingBottom: 3,
        }}>
          <Icon.phone /> Text {PHONE}
        </a>
      </div>
    </section>
  );
}

Object.assign(window, { AddonsBroll });
