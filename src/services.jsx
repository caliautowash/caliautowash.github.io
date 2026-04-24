/* Services / Pricing */

const SERVICES = [
  {
    cat: 'Exterior',
    items: [
      { name: 'Exterior Wash', price: 40, time: '45 min',
        sub: 'Hand wash, wheels, tires & windows',
        features: ['Two-bucket hand wash','Wheel & tire clean','Streak-free windows','Hand-dry with microfiber'],
      },
      { name: 'Decontamination Exterior', price: 100, time: '2 hr',
        sub: 'Restores paint to factory-smooth',
        features: ['Iron-fallout removal','Clay bar treatment','Tar & bug removal','Spray-sealant finish'],
      },
    ],
  },
  {
    cat: 'Interior',
    items: [
      { name: 'Standard Interior', price: 60, time: '1 hr',
        sub: 'Vacuum, dust, and wipe-down',
        features: ['Vacuum seats & carpet','Wipe all surfaces','Glass & mirrors','Door jambs'],
      },
      { name: 'Deep Clean Interior', price: 175, time: '3 hr',
        sub: 'Steam extraction — like new',
        features: ['Hot-water steam extraction','Shampoo seats & carpet','Leather clean & condition','Pet hair removal'],
      },
    ],
  },
  {
    cat: 'Full Service',
    items: [
      { name: 'Standard Full Detail', price: 75, time: '1.5 hr',
        sub: 'Our most-booked package',
        features: ['Full exterior hand wash','Interior vacuum & wipe','Windows inside & out','Dressing on tires'],
        featured: true,
      },
      { name: 'One-Step Correction + 7-yr Graphene', price: 500, time: '6-8 hr',
        sub: 'Flagship — full one-step paint correction',
        features: ['Full one-step paint correction','7-year graphene coating','Hydrophobic finish','Gloss & depth enhancement'],
      },
    ],
  },
];

function Services() {
  const ref = useReveal();
  return (
    <section id="services" ref={ref} className="reveal" style={{
      padding: '8rem 0 6rem',
      background: 'var(--cream-2)',
      borderTop: '1px solid var(--rule)',
    }}>
      <div className="wrap">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: '4rem',
          marginBottom: '4rem'
        }} className="svc-head">
          <div>
            <div className="num-label" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ width: 24, height: 1, background: 'var(--ink-dim)' }} />
              <span>SERVICES &amp; PRICING</span>
            </div>
            <h2 className="display" style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 400,
              lineHeight: 1,
            }}>
              Six ways<br/>
              to a <span style={{ fontStyle: 'italic' }}>clean car.</span>
            </h2>
          </div>
          <div style={{ alignSelf: 'end' }}>
            <p style={{ color: 'var(--ink-soft)', fontSize: '1.02rem', maxWidth: '50ch', marginBottom: '1.25rem' }}>
              A simple menu. Flat pricing. No hidden fees, no upsells in the driveway.
              Pick the package, we bring the water, soap, tools, and the elbow grease.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.9rem 1.35rem 0.9rem 1.1rem',
              background: 'linear-gradient(135deg, var(--terracotta) 0%, var(--terracotta-deep) 100%)',
              border: '1px solid color-mix(in oklch, var(--terracotta-deep) 60%, transparent)',
              borderRadius: 999,
              color: 'var(--cream)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.92rem',
              letterSpacing: '-0.005em',
              fontWeight: 500,
              lineHeight: 1.3,
              boxShadow: '0 12px 28px -14px color-mix(in oklch, var(--terracotta-deep) 80%, transparent), inset 0 1px 0 color-mix(in oklch, white 18%, transparent)',
            }}>
              <span aria-hidden style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'color-mix(in oklch, white 25%, transparent)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                fontStyle: 'italic',
                fontWeight: 500,
              }}>i</span>
              <span>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, marginRight: '0.35rem' }}>Note —</span>
                pricing varies by vehicle size &amp; condition.{' '}
                <span style={{ opacity: 0.82, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginLeft: '0.15rem' }}>Call for fleet</span>
              </span>
            </div>
          </div>
        </div>

        {SERVICES.map((group, gi) => (
          <div key={group.cat} style={{ marginBottom: '3rem' }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <div className="num-label" style={{ fontSize: '0.62rem' }}>CATEGORY 0{gi+1}</div>
              <h3 className="display" style={{ fontSize: '1.4rem', fontWeight: 400, fontStyle: 'italic' }}>
                {group.cat}
              </h3>
              <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.25rem',
            }} className="svc-grid">
              {group.items.map(s => <PriceCard key={s.name} {...s} />)}
            </div>
          </div>
        ))}

        {/* Add-ons — chapter break */}
        <div style={{
          marginTop: '5rem',
          marginLeft: 'calc(-1 * var(--wrap-gutter, 0px))',
          marginRight: 'calc(-1 * var(--wrap-gutter, 0px))',
          background: 'var(--sand)',
          padding: '4.5rem 0',
          borderTop: '1px solid var(--rule)',
          borderBottom: '1px solid var(--rule)',
          position: 'relative',
        }} className="addon-chapter">
          {/* subtle sun motif */}
          <div aria-hidden style={{
            position: 'absolute', top: '2rem', right: '2rem',
            width: 80, height: 80, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, var(--terracotta) 0%, var(--terracotta-deep) 60%, transparent 100%)',
            opacity: 0.12,
            pointerEvents: 'none',
          }} />

          <div className="wrap" style={{ position: 'relative' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '0.9fr 1.1fr',
              gap: '4rem',
              alignItems: 'start',
            }} className="addon-grid">
              {/* LEFT: header */}
              <div style={{ position: 'sticky', top: 100 }} className="addon-left">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}>
                  <span style={{ width: 32, height: 1, background: 'var(--terracotta)' }} />
                  <span className="num-label" style={{ color: 'var(--terracotta-deep)' }}>
                    EXTRAS
                  </span>
                </div>
                <h3 className="display" style={{
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  fontWeight: 400, lineHeight: 1,
                  marginBottom: '1.5rem',
                }}>
                  Anything<br/>
                  <span style={{ fontStyle: 'italic', color: 'var(--terracotta-deep)' }}>
                    else?
                  </span>
                </h3>
                <p style={{
                  fontSize: '1.02rem', color: 'var(--ink-soft)',
                  lineHeight: 1.65, maxWidth: '38ch',
                  textWrap: 'pretty',
                  marginBottom: '2rem',
                }}>
                  These add-ons pair with any wash or detail — or book them on their own.
                  Not listed? Text us. We've probably done it.
                </p>
                <a href={`tel:${PHONE_TEL}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--ink)',
                  borderBottom: '1px solid var(--ink)',
                  paddingBottom: 3,
                }}>
                  <Icon.phone /> Text {PHONE}
                </a>
              </div>

              {/* RIGHT: editorial list */}
              <ol style={{
                listStyle: 'none', padding: 0, margin: 0,
                counterReset: 'addon',
              }}>
                {[
                  { name: 'Pet hair removal',      sub: 'Rubber tools and extraction for stubborn fur stuck deep in the fabric.' },
                  { name: 'Stain treatment',       sub: 'Coffee, grease, ink, mystery spots — lifted, not covered.' },
                  { name: 'Odor treatment',        sub: 'Enzyme plus ozone. Gone for good, not masked with an air freshener.' },
                  { name: 'Headlight restoration', sub: 'Sanded, polished, sealed. Night driving returned to factory.' },
                  { name: 'Engine bay cleaning',   sub: 'Degrease, dress, and detail everything under the hood.' },
                  { name: 'Trim restoration',      sub: 'Faded black plastic around the doors and bumpers — brought back.' },
                ].map((a, i, arr) => (
                  <AddonListItem key={a.name} index={i} total={arr.length} {...a} />
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .svc-head { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .svc-grid { grid-template-columns: 1fr !important; }
          .addon-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .addon-left { position: static !important; }
        }
      `}</style>
    </section>
  );
}

function PriceCard({ name, price, time, sub, features, featured }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: featured ? 'var(--ink)' : 'var(--cream)',
        color: featured ? 'var(--cream)' : 'var(--ink)',
        padding: '2rem',
        border: '1px solid ' + (featured ? 'var(--ink)' : 'var(--rule)'),
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        transition: 'transform 0.4s var(--ease), box-shadow 0.4s var(--ease)',
        transform: hover ? 'translateY(-4px)' : 'none',
        boxShadow: hover ? '0 30px 50px -30px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      {featured && (
        <div style={{
          position: 'absolute', top: -1, right: 24,
          background: 'var(--terracotta)',
          color: 'var(--cream)',
          padding: '0.3rem 0.75rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          Most booked
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
        <h4 className="display" style={{ fontSize: '1.3rem', fontWeight: 400, lineHeight: 1.2, maxWidth: '16ch' }}>
          {name}
        </h4>
        <div className="display" style={{
          fontSize: '2.2rem', fontWeight: 400,
          letterSpacing: '-0.03em',
          color: featured ? 'var(--sun)' : 'var(--terracotta-deep)',
        }}>
          <sup style={{ fontSize: '1rem', opacity: 0.7, marginRight: 2 }}>$</sup>{price}
        </div>
      </div>
      <div className="num-label" style={{
        color: featured ? 'color-mix(in oklch, var(--cream) 70%, transparent)' : 'var(--ink-dim)',
        marginBottom: '1.25rem',
        display: 'flex', gap: '0.65rem', alignItems: 'center',
      }}>
        <Icon.clock style={{ opacity: 0.6 }} /> {time}
      </div>
      <p style={{
        fontSize: '0.95rem',
        color: featured ? 'color-mix(in oklch, var(--cream) 85%, transparent)' : 'var(--ink-soft)',
        marginBottom: '1.5rem',
        fontStyle: 'italic',
      }}>
        {sub}
      </p>

      <ul style={{ marginBottom: '1.75rem', borderTop: '1px solid ' + (featured ? 'rgba(255,255,255,0.1)' : 'var(--rule)'), paddingTop: '1rem' }}>
        {features.map(f => (
          <li key={f} style={{
            display: 'flex', gap: '0.65rem', alignItems: 'center',
            padding: '0.35rem 0',
            fontSize: '0.88rem',
            color: featured ? 'color-mix(in oklch, var(--cream) 85%, transparent)' : 'var(--ink-soft)'
          }}>
            <Icon.check style={{
              color: featured ? 'var(--sun)' : 'var(--terracotta)',
              flexShrink: 0,
              width: 12, height: 12
            }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <a href="#book" className="btn" style={{
        width: '100%',
        justifyContent: 'center',
        background: featured ? 'var(--cream)' : 'var(--ink)',
        color: featured ? 'var(--ink)' : 'var(--cream)',
      }}>
        Book {name.split(' ')[0]} <Icon.arrow />
      </a>
    </div>
  );
}

function AddonListItem({ index, total, name, sub }) {
  const [hover, setHover] = React.useState(false);
  return (
    <li
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        columnGap: '1.5rem',
        rowGap: '0.4rem',
        padding: '1.5rem 0',
        borderTop: index === 0 ? 'none' : '1px solid color-mix(in oklch, var(--ink) 15%, transparent)',
        position: 'relative',
        transition: 'transform 0.4s var(--ease)',
        transform: hover ? 'translateX(8px)' : 'translateX(0)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: '0.5rem',
        paddingTop: '0.4rem',
      }}>
        <span className="num-label" style={{
          fontSize: '0.6rem',
          color: 'var(--terracotta-deep)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div>
        <h4 className="display" style={{
          fontSize: 'clamp(1.35rem, 2.4vw, 1.9rem)',
          fontWeight: 400,
          letterSpacing: '-0.015em',
          color: 'var(--ink)',
          fontStyle: hover ? 'italic' : 'normal',
          transition: 'font-style 0.2s var(--ease)',
          lineHeight: 1.1,
          marginBottom: '0.5rem',
        }}>
          {name}
        </h4>
        <p style={{
          fontSize: '0.98rem',
          color: 'var(--ink-soft)',
          lineHeight: 1.55,
          textWrap: 'pretty',
          maxWidth: '52ch',
        }}>
          {sub}
        </p>
      </div>
    </li>
  );
}

Object.assign(window, { Services, PriceCard, SERVICES, AddonListItem });
