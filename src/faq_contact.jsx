/* FAQ + Contact + Footer */

const FAQS = [
  { q: 'Do you come to me, or do I come to you?', a: 'We come to you. We bring water, power, soap, tools, everything. All you need is a driveway or parking spot where we can safely work.' },
  { q: "What's the difference between a wash and a detail?", a: 'A wash is exterior-only — body, wheels, windows, tires. A detail includes the interior: vacuum, wipe-down, windows, and dressing. Full detail covers both.' },
  { q: 'How long does a ceramic coating last?', a: 'Our 7-year graphene coating is guaranteed for seven years of hydrophobic protection with normal maintenance — meaning regular washing and avoiding harsh chemicals.' },
  { q: 'What areas do you serve?', a: 'Modesto, Ceres, Turlock, Oakdale, Riverbank, Salida and Ripon. Outside those? Give us a call — we often make exceptions.' },
  { q: 'How do I pay?', a: 'Card, cash, Venmo, or Zelle. Payment is collected after the job — no deposit required for most services.' },
  { q: "What if I'm not happy?", a: "We'll come back and re-do it. Full stop. If we missed a spot or something isn't right, call us within 48 hours and we'll make it right." },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  const ref = useReveal();
  return (
    <section id="faq" ref={ref} className="reveal" style={{
      padding: '7rem 0',
      background: 'var(--cream)',
      borderTop: '1px solid var(--rule)',
    }}>
      <div className="wrap faq-grid" style={{
        display: 'grid',
        gridTemplateColumns: '0.9fr 1.4fr',
        gap: '5rem',
        alignItems: 'start',
      }}>
        <div style={{ position: 'sticky', top: 100 }}>
          <div className="num-label" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ width: 24, height: 1, background: 'var(--ink-dim)' }} />
            <span>FAQ</span>
          </div>
          <h2 className="display" style={{ fontSize: 'clamp(2rem, 4.2vw, 3.2rem)', fontWeight: 400, lineHeight: 1, marginBottom: '1.5rem' }}>
            Questions,<br/><span style={{ fontStyle: 'italic' }}>answered.</span>
          </h2>
          <p style={{ color: 'var(--ink-soft)', maxWidth: '34ch', fontSize: '0.95rem', lineHeight: 1.65 }}>
            Still curious? Call <a href={`tel:${PHONE_TEL}`} style={{ textDecoration: 'underline', fontWeight: 500 }}>{PHONE}</a> and ask for Andrew.
          </p>
        </div>

        <div>
          {FAQS.map((f, i) => (
            <div key={i} style={{
              borderTop: i === 0 ? '1px solid var(--ink)' : 'none',
              borderBottom: '1px solid var(--rule)',
            }}>
              <button onClick={() => setOpen(open === i ? -1 : i)}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1.5rem 0',
                  textAlign: 'left',
                }}>
                <span className="display" style={{ fontSize: '1.15rem', fontWeight: 400, maxWidth: '90%' }}>
                  {f.q}
                </span>
                <span style={{
                  width: 32, height: 32,
                  border: '1px solid var(--ink)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: open === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform 0.3s var(--ease)',
                  flexShrink: 0
                }}>
                  <Icon.plus />
                </span>
              </button>
              <div style={{
                maxHeight: open === i ? 300 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.4s var(--ease)',
              }}>
                <p style={{
                  paddingBottom: '1.5rem',
                  color: 'var(--ink-soft)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  maxWidth: '58ch',
                }}>
                  {f.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .faq-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .faq-grid > div:first-child { position: static !important; }
        }
      `}</style>
    </section>
  );
}

function Contact() {
  const ref = useReveal();
  return (
    <section id="contact" ref={ref} className="reveal" style={{
      padding: '7rem 0 5rem',
      background: 'var(--cream-2)',
      borderTop: '1px solid var(--rule)',
    }}>
      <div className="wrap">
        <div style={{
          background: 'var(--ink)',
          color: 'var(--cream)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(2.5rem, 6vw, 5rem)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div aria-hidden style={{
            position: 'absolute',
            right: '-10%', top: '-30%',
            width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--sun), var(--terracotta-deep) 60%)',
            opacity: 0.25,
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="num-label" style={{ marginBottom: '1.25rem', color: 'var(--sun)' }}>
              CONTACT
            </div>
            <h2 className="display" style={{
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
              fontWeight: 300,
              lineHeight: 0.95,
              color: 'var(--cream)',
              marginBottom: '2.5rem',
              maxWidth: '16ch',
            }}>
              Let&rsquo;s get your<br/>
              <span style={{ fontStyle: 'italic', color: 'var(--sun)', fontWeight: 500 }}>car on the calendar.</span>
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '2rem',
            }} className="ct-grid">
              <ContactCell label="Call" value={PHONE} href={`tel:${PHONE_TEL}`} icon={<Icon.phone />} />
              <ContactCell label="Email" value="andrewcao20@gmail.com" href="mailto:andrewcao20@gmail.com" icon={<Icon.mail />} />
              <ContactCell label="Instagram" value="@caliautowash" href="https://www.instagram.com/caliautowash" icon={<Icon.instagram />} external />
            </div>

            <div style={{
              marginTop: '2rem',
              display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
            }}>
              <a href="#book" className="btn btn-accent"><span className="shine" aria-hidden />Book online <Icon.arrow /></a>
              <a href={`tel:${PHONE_TEL}`} className="btn btn-ghost" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>
                Or call now <Icon.phone />
              </a>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .ct-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function ContactCell({ label, value, href, icon, external }) {
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener' : undefined}
      style={{
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        padding: '1.5rem 0',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        paddingRight: '1.5rem',
        transition: 'transform 0.3s var(--ease)',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      <div className="num-label" style={{ color: 'color-mix(in oklch, var(--cream) 55%, transparent)', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
        {icon} {label}
      </div>
      <div className="display" style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--cream)' }}>
        {value}
      </div>
    </a>
  );
}

function Footer() {
  return (
    <footer style={{
      padding: '3.5rem 0 2rem',
      borderTop: '1px solid var(--rule)',
      background: 'var(--cream)',
    }}>
      <div className="wrap">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: '3rem',
          marginBottom: '3rem',
        }} className="ft-grid">
          <div>
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginBottom: '1rem' }}>
              <Logo size={34} />
              <div className="display" style={{ fontSize: '1.15rem', fontWeight: 500 }}>Cali Auto Wash</div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', maxWidth: '36ch', lineHeight: 1.6 }}>
              Mobile car detailing for Modesto and the Central Valley. Hand-washed, hand-dried,
              delivered to your driveway since 2020.
            </p>
          </div>
          {[
            { h: 'Menu', l: ['Services','Process','Work','Book','FAQ'] },
            { h: 'Contact', l: [PHONE, 'andrewcao20@gmail.com', '@caliautowash'] },
            { h: 'Hours', l: ['Wed, Thu, Sat', '9:00 AM – 4:00 PM', 'Closed Sun/Mon/Tue/Fri'] },
          ].map(col => (
            <div key={col.h}>
              <div className="num-label" style={{ marginBottom: '1rem' }}>{col.h}</div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {col.l.map(item => (
                  <li key={item} style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--rule)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: '1rem', flexWrap: 'wrap',
        }}>
          <div className="num-label">© 2026 CALI AUTO WASH · MADE IN MODESTO</div>
          <div className="num-label">DESIGNED WITH CARE</div>
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .ft-grid { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
          .ft-grid > div:first-child { grid-column: span 2; }
        }
      `}</style>
    </footer>
  );
}

Object.assign(window, { FAQ, Contact, Footer });
