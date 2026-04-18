/* How it works / Process */

const STEPS = [
  { num: '01', title: 'Book online', sub: 'Pick a package and a window. Takes less than a minute.', iconKey: 'calendar' },
  { num: '02', title: 'We come to you', sub: 'Home or office, anywhere in Modesto & the Central Valley.', iconKey: 'car' },
  { num: '03', title: 'Hand-finished', sub: 'Two-bucket wash, microfiber dry, never a brush tunnel.', iconKey: 'droplet' },
  { num: '04', title: 'Drive away clean', sub: 'Contactless payment. Most jobs take 1–4 hours.', iconKey: 'key' },
];

function Process() {
  const ref = useReveal();
  return (
    <section id="process" ref={ref} className="reveal" style={{
      padding: '7rem 0',
      background: 'var(--cream)',
      position: 'relative',
    }}>
      <div className="wrap">
        <SectionHeader
          eyebrow="HOW IT WORKS"
          title={<>Four steps,<br/><span style={{fontStyle:'italic'}}>one spotless car.</span></>}
          sub="No appointments at a shop. No waiting rooms. No keys in a lockbox. Just a time that works for you and a crew that shows up."
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          borderTop: '1px solid var(--ink)',
          borderBottom: '1px solid var(--ink)',
        }} className="proc-grid">
          {STEPS.map((s, i) => {
            const IconComp = Icon[s.iconKey];
            return (
              <div key={s.num} style={{
                padding: '2.25rem 1.5rem 2rem',
                borderRight: i < STEPS.length - 1 ? '1px solid var(--rule)' : 'none',
                position: 'relative',
                background: 'transparent',
                transition: 'background 0.4s',
                cursor: 'default'
              }} className="proc-cell">
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '2rem'
                }}>
                  <div className="display" style={{
                    fontSize: '2.6rem', fontWeight: 300,
                    color: 'var(--terracotta)',
                    fontStyle: 'italic',
                  }}>
                    {s.num}
                  </div>
                  <div style={{
                    width: 38, height: 38,
                    borderRadius: '50%',
                    border: '1px solid var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <IconComp />
                  </div>
                </div>
                <h3 className="display" style={{ fontSize: '1.35rem', fontWeight: 400, marginBottom: '0.5rem' }}>
                  {s.title}
                </h3>
                <p style={{
                  fontSize: '0.92rem',
                  color: 'var(--ink-soft)',
                  lineHeight: 1.55,
                }}>
                  {s.sub}
                </p>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: '3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div className="num-label">
            AVG. TURNAROUND · 1–4 HOURS · WED · THU · SAT · 9AM–4PM
          </div>
          <a href="#book" className="btn btn-accent">
            <span className="shine" aria-hidden />
            Start booking <Icon.arrow />
          </a>
        </div>
      </div>

      <style>{`
        .proc-cell:hover { background: var(--cream-2); }
        @media (max-width: 860px) {
          .proc-grid { grid-template-columns: 1fr 1fr !important; }
          .proc-grid > div:nth-child(1), .proc-grid > div:nth-child(2) { border-bottom: 1px solid var(--rule); }
          .proc-grid > div:nth-child(2) { border-right: none !important; }
        }
        @media (max-width: 520px) {
          .proc-grid { grid-template-columns: 1fr !important; }
          .proc-grid > div { border-right: none !important; border-bottom: 1px solid var(--rule); }
          .proc-grid > div:last-child { border-bottom: none; }
        }
      `}</style>
    </section>
  );
}

Object.assign(window, { Process });
