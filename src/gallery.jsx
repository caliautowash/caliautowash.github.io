/* Gallery / Work */

const WORKS = [
  { tag: 'Full Detail', title: 'BMW M3 · murdered out · full detail', tone: 'dark', src: 'images/hero-background.jpg', zoom: 1.18, aspect: '4/5', feat: true },
  { tag: 'Ceramic Coat', title: 'BMW M3 · murdered out · 7-yr graphene', tone: 'terra', src: 'images/m3-mean-front.jpg', objectPosition: 'center 55%', zoom: 1.18, aspect: '1/1' },
  { tag: 'Steam', title: 'BRZ · matte purple · interior deep clean', tone: 'sand', src: 'images/brz-matte-purple.jpg', aspect: '1/1' },
  { tag: 'Correction', title: 'Lexus GX · paint correction', tone: 'dark', src: 'images/lexus-gx-sunset.jpg', aspect: '4/5' },
  { tag: 'Decon', title: 'Honda Pilot · iron fallout removal', tone: 'terra', src: 'images/honda-pilot-clean.jpg', aspect: '1/1' },
  { tag: 'Wash', title: 'Dodge Charger 392 · hand wash', tone: 'sand', src: 'images/dodge-charger-392-blue.jpg', aspect: '1/1' },
];

const BA = [
  { caption: 'Ford Taurus · interior steam extraction', before: 'images/ford-taurus-interior-after.jpg', after: 'images/ford-taurus-interior-before.jpg' },
  { caption: 'Infiniti Q50 · exterior wash + decon', before: 'images/infiniti-q50-after.jpg', after: 'images/infiniti-q50-before.jpg' },
  { caption: 'Dodge Durango · cabin deep clean', before: 'images/dodge-durango-interior-after.jpg', after: 'images/dodge-durango-interior-before.jpg' },
  { caption: '4Runner · full interior detail', before: 'images/toyota-4runner-interior-after.jpg', after: 'images/toyota-4runner-interior-before.jpg' },
];

function Gallery() {
  const ref = useReveal();
  return (
    <section id="work" ref={ref} className="reveal" style={{
      padding: '7rem 0 5rem',
      background: 'var(--cream-2)',
      borderTop: '1px solid var(--rule)',
    }}>
      <div className="wrap">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'end',
          marginBottom: '3rem',
        }} className="gal-head">
          <div>
            <div className="num-label" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ width: 24, height: 1, background: 'var(--ink-dim)' }} />
              <span>RECENT WORK</span>
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 400, lineHeight: 1 }}>
              Recent<br/>
              <span style={{ fontStyle: 'italic' }}>driveways.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href="https://www.instagram.com/caliautowash" target="_blank" rel="noopener" className="btn btn-ghost">
              <Icon.instagram /> @caliautowash <Icon.arrowUp />
            </a>
          </div>
        </div>

        {/* Mosaic grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridAutoRows: '120px',
          gap: '0.75rem',
        }} className="gal-grid">
          {WORKS.map((w, i) => {
            const spans = [
              { col: 'span 3', row: 'span 4' },  // big
              { col: 'span 3', row: 'span 2' },
              { col: 'span 3', row: 'span 2' },
              { col: 'span 2', row: 'span 3' },
              { col: 'span 2', row: 'span 3' },
              { col: 'span 2', row: 'span 3' },
            ];
            const s = spans[i] || { col: 'span 2', row: 'span 2' };
            return (
              <figure key={i} style={{
                gridColumn: s.col,
                gridRow: s.row,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                border: '1px solid var(--rule)',
              }} className="gal-item">
                <Placeholder label={w.title} src={w.src} objectPosition={w.objectPosition} zoom={w.zoom} aspect={null} tone={w.tone} style={{ height: '100%', aspectRatio: 'unset' }} />
                <figcaption style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '1rem 1.25rem',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  color: 'var(--cream)',
                  opacity: 0,
                  transform: 'translateY(10px)',
                  transition: 'opacity 0.3s var(--ease), transform 0.3s var(--ease)',
                }} className="gal-cap">
                  <div className="num-label" style={{ color: 'var(--sun)', marginBottom: 4, fontSize: '0.6rem' }}>{w.tag}</div>
                  <div className="display" style={{ fontSize: '1rem', fontWeight: 400 }}>{w.title}</div>
                </figcaption>
              </figure>
            );
          })}
        </div>

        {/* Before / After strip */}
        <div style={{ marginTop: '5rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2rem' }}>
            <h3 className="display" style={{ fontSize: '1.8rem', fontWeight: 400, fontStyle: 'italic' }}>
              Before <span style={{ fontStyle: 'normal', fontWeight: 400 }}>&amp;</span> after.
            </h3>
            <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.25rem',
          }} className="ba-grid">
            {BA.map((b, i) => <BeforeAfter key={i} {...b} />)}
          </div>
        </div>
      </div>

      <style>{`
        .gal-item:hover .gal-cap { opacity: 1; transform: translateY(0); }
        @media (max-width: 860px) {
          .gal-head { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .gal-grid { grid-template-columns: repeat(2, 1fr) !important; grid-auto-rows: 100px !important; }
          .gal-grid > figure { grid-column: span 1 !important; grid-row: span 2 !important; }
          .gal-grid > figure:first-child { grid-column: span 2 !important; grid-row: span 3 !important; }
          .ba-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function BeforeAfter({ caption, before, after, tone1 = 'dark', tone2 = 'dark' }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef(null);

  const onDrag = useCallback((e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPos(pct);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const up = () => setDragging(false);
    const move = (e) => onDrag(e);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, onDrag]);

  return (
    <figure style={{
      border: '1px solid var(--rule)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--cream)',
    }}>
      <div
        ref={wrapRef}
        style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', cursor: 'ew-resize', userSelect: 'none' }}
        onMouseDown={(e) => { setDragging(true); onDrag(e); }}
        onTouchStart={(e) => { setDragging(true); onDrag(e); }}
      >
        {/* BEFORE — full */}
        <Placeholder label="BEFORE" src={before} aspect={null} tone={tone1} style={{ position: 'absolute', inset: 0, height: '100%' }} />
        {/* AFTER — clipped */}
        <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Placeholder label="AFTER" src={after} aspect={null} tone={tone2} style={{ height: '100%' }} />
        </div>
        {/* labels */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(0,0,0,0.5)', color: 'var(--cream)',
          padding: '0.25rem 0.55rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
          letterSpacing: '0.12em',
        }}>BEFORE</div>
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'var(--terracotta)', color: 'var(--cream)',
          padding: '0.25rem 0.55rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
          letterSpacing: '0.12em',
        }}>AFTER</div>
        {/* slider handle */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${pos}%`, width: 2,
          background: 'var(--cream)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.2)',
          transform: 'translateX(-1px)',
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'var(--cream)',
            border: '1px solid var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <polyline points="15 18 9 12 15 6"/><polyline points="9 18 15 12 9 6" transform="translate(6 0)" />
            </svg>
          </div>
        </div>
      </div>
      <figcaption style={{
        padding: '0.85rem 1rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--ink-soft)',
      }}>
        {caption}
      </figcaption>
    </figure>
  );
}

Object.assign(window, { Gallery, BeforeAfter });
