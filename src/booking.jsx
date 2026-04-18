/* Booking — Square Appointments embed */

function Booking() {
  const ref = useReveal();

  return (
    <section id="book" ref={ref} className="reveal" style={{
      padding: '8rem 0',
      background: 'var(--ink)',
      color: 'var(--cream)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative sun */}
      <div aria-hidden style={{
        position: 'absolute',
        left: '-15%', bottom: '-25%',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, var(--sun), var(--terracotta-deep) 70%)',
        opacity: 0.18,
        pointerEvents: 'none',
      }} />

      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
          gap: '4rem',
          alignItems: 'start',
        }} className="book-grid">

          <div>
            <div className="num-label" style={{ marginBottom: '1rem', color: 'var(--sun)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ width: 24, height: 1, background: 'var(--sun)' }} />
              <span>BOOK A DETAIL</span>
            </div>
            <h2 className="display" style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 400,
              lineHeight: 1,
              color: 'var(--cream)',
              marginBottom: '1.75rem'
            }}>
              Book in a minute.<br/>
              <span style={{ fontStyle: 'italic', color: 'var(--sun)' }}>We'll take it from there.</span>
            </h2>
            <p style={{ color: 'color-mix(in oklch, var(--cream) 70%, transparent)', maxWidth: '42ch', fontSize: '1rem', lineHeight: 1.7 }}>
              Pick a service, tell us what you drive, and when. We&rsquo;ll confirm by text within the hour
              and show up with everything we need.
            </p>

            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Service area', val: 'Modesto + 25mi' },
                { label: 'Hours', val: 'Wed–Sat · 9AM–4PM' },
                { label: 'Payment', val: 'Card, cash, Venmo' },
                { label: 'Guarantee', val: "Not happy? We'll re-wash." },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '0.92rem',
                }}>
                  <span className="num-label" style={{ color: 'color-mix(in oklch, var(--cream) 50%, transparent)' }}>{r.label}</span>
                  <span style={{ fontWeight: 500 }}>{r.val}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <a href={`tel:${PHONE_TEL}`} className="btn btn-ghost" style={{ borderColor: 'var(--cream)', color: 'var(--cream)' }}>
                <Icon.phone /> Prefer to call? {PHONE}
              </a>
            </div>
          </div>

          {/* Square Appointments embed */}
          <div style={{
            background: 'var(--cream)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 40px 80px -30px rgba(0,0,0,0.5)',
            border: '1px solid color-mix(in oklch, var(--cream) 60%, transparent)',
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--rule)',
              background: 'var(--cream-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '1rem',
            }}>
              <div className="num-label" style={{ color: 'var(--ink-soft)', display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <Icon.calendar />
                <span>RESERVE A SLOT</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--sage)',
                  animation: 'dot-pulse 2s ease-in-out infinite',
                }} />
                <span>SECURE · SQUARE</span>
              </div>
            </div>
            <iframe
              src={BOOK_URL}
              title="Book an appointment with Cali Auto Wash"
              loading="lazy"
              className="book-iframe"
              style={{
                display: 'block',
                width: '100%',
                height: 860,
                border: 0,
                background: 'var(--cream)',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .book-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .book-iframe { height: 720px !important; }
        }
      `}</style>
    </section>
  );
}

window.Booking = Booking;
