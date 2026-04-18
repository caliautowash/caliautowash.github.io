/* Shared primitives */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Subtle striped photo placeholder with mono label
function Placeholder({ label = "PHOTO", aspect = "4/3", tone = "sand", src = null, objectPosition = 'center', zoom = 1, eager = false, style = {}, className = "" }) {
  const bg = tone === 'dark'
    ? 'linear-gradient(135deg, oklch(0.30 0.02 60) 0%, oklch(0.24 0.02 60) 100%)'
    : tone === 'terra'
    ? 'linear-gradient(135deg, oklch(0.70 0.09 45) 0%, oklch(0.58 0.13 40) 100%)'
    : 'linear-gradient(135deg, var(--sand) 0%, var(--cream-3) 100%)';
  const fg = tone === 'dark' || tone === 'terra' ? 'var(--cream)' : 'var(--ink-soft)';
  return (
    <div
      className={"ph " + className}
      style={{
        position: 'relative',
        aspectRatio: aspect,
        width: '100%',
        background: bg,
        overflow: 'hidden',
        color: fg,
        ...style
      }}
    >
      {src ? (
        <img
          src={src}
          alt={label}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition,
            transform: zoom !== 1 ? `scale(${zoom})` : undefined,
            transformOrigin: 'center',
          }}
        />
      ) : (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 22px, rgba(0,0,0,0.035) 22px 23px)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            opacity: 0.85,
            textAlign: 'center',
            padding: '1rem'
          }}>
            <span style={{ borderTop: `1px solid ${fg}`, borderBottom: `1px solid ${fg}`, padding: '0.4rem 0.8rem' }}>
              {label}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function Eyebrow({ children, accent = false, style = {} }) {
  return (
    <span className="eyebrow" style={{
      color: accent ? 'var(--terracotta)' : 'var(--ink-soft)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.6rem',
      ...style
    }}>
      {accent && <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--terracotta)',
        display: 'inline-block'
      }} />}
      {children}
    </span>
  );
}

function SectionHeader({ num, eyebrow, title, sub, align = 'left', accent = false, style = {} }) {
  return (
    <header style={{
      marginBottom: '3.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align,
      ...style
    }}>
      {num && (
        <div className="num-label" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span>{num}</span>
          <span style={{ width: 32, height: 1, background: 'var(--ink-dim)' }} />
          <span>{eyebrow}</span>
        </div>
      )}
      {!num && eyebrow && <Eyebrow accent={accent} style={{ marginBottom: '1.25rem' }}>{eyebrow}</Eyebrow>}
      <h2 className="display" style={{
        fontSize: 'clamp(2.2rem, 5.5vw, 4.4rem)',
        fontWeight: 400,
        maxWidth: '18ch',
      }}>
        {title}
      </h2>
      {sub && (
        <p style={{
          marginTop: '1.25rem',
          maxWidth: '48ch',
          color: 'var(--ink-soft)',
          fontSize: '1.02rem',
          lineHeight: 1.65
        }}>
          {sub}
        </p>
      )}
    </header>
  );
}

// Intersection-observer reveal hook
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Arm the fade only if the element is currently off-screen; otherwise show immediately.
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.top > vh * 0.9) {
      el.setAttribute('data-reveal-armed', '1');
    } else {
      el.classList.add('in');
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 10% 0px' });
    io.observe(el);
    // Safety net: if the observer hasn't fired within 3s of the element being near viewport, reveal anyway.
    const t = setTimeout(() => { el.classList.add('in'); io.disconnect(); }, 4000);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  return ref;
}

// Format phone: +12099882892 -> (209) 988-2892
const PHONE = '(209) 988-2892';
const PHONE_TEL = '+12099882892';
const BOOK_URL = 'https://book.squareup.com/appointments/swme78f94upqkd/location/LHVCHPW4RR8RJ/services';

// Tiny icon set
const Icon = {
  arrow: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  arrowUp: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
  plus: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  phone: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  sun: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  location: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>,
  instagram: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  mail: (props) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  car: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 17h14l-1.5-6h-11z"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/></svg>,
  spark: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>,
  calendar: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>,
  droplet: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  key: (props) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="8" cy="15" r="4"/><path d="M10.85 12.15 19 4M18 5l3 3M15 8l3 3"/></svg>,
};

// expose
Object.assign(window, {
  Placeholder, Eyebrow, SectionHeader, useReveal,
  PHONE, PHONE_TEL, BOOK_URL, Icon,
});
