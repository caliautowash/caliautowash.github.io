/* Header + Hero */

function LiveWeather() {
  const [data, setData] = React.useState(null);
  const [time, setTime] = React.useState('');

  React.useEffect(() => {
    // Open-Meteo is keyless + CORS-friendly. Modesto, CA: 37.6391, -120.9969
    fetch('https://api.open-meteo.com/v1/forecast?latitude=37.6391&longitude=-120.9969&current=temperature_2m&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles')
      .then(r => r.json())
      .then(j => {
        if (j && j.current && typeof j.current.temperature_2m === 'number') {
          setData({ temp: Math.round(j.current.temperature_2m) });
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    const fmt = () => {
      const now = new Date();
      const s = now.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
        timeZone: 'America/Los_Angeles',
      });
      setTime(s);
    };
    fmt();
    const id = setInterval(fmt, 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const temp = data ? `${data.temp}°F` : '—°F';
  const t = time || '—';
  return <>{temp} · Modesto · {t}</>;
}

function OpenStatus() {
  // Open: Wed (3), Thu (4), Sat (6), 9:00 – 16:00 America/Los_Angeles
  const [info, setInfo] = useState(() => computeOpenInfo());
  useEffect(() => {
    const tick = () => setInfo(computeOpenInfo());
    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const { isOpen, label, sub } = info;
  const dotColor = isOpen
    ? 'oklch(0.72 0.18 145)'   // green — open
    : 'oklch(0.68 0.18 35)';   // amber — closed

  return (
    <a href={`tel:${PHONE_TEL}`} className="hide-mobile" style={{
      display: 'inline-flex', gap: '0.7rem', alignItems: 'center',
      padding: '0.55rem 0.95rem',
      color: 'var(--ink)',
      textDecoration: 'none',
      border: '1px solid var(--rule)',
      background: 'var(--cream)',
      lineHeight: 1.1,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: dotColor,
        boxShadow: `0 0 0 4px color-mix(in oklch, ${dotColor} 18%, transparent)`,
        flexShrink: 0,
        animation: isOpen ? 'dot-pulse 2.4s ease-in-out infinite' : 'none',
      }} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.56rem',
          color: 'var(--ink-dim)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>{label}</span>
        <span style={{
          fontSize: '0.92rem',
          fontWeight: 500,
          letterSpacing: '-0.005em',
          fontVariantNumeric: 'tabular-nums',
        }}>{sub}</span>
      </span>
    </a>
  );
}

function computeOpenInfo() {
  // Compute in America/Los_Angeles regardless of viewer timezone
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (t) => parts.find(p => p.type === t)?.value;
  const wd = get('weekday');
  const hour = parseInt(get('hour'), 10);
  const minute = parseInt(get('minute'), 10);
  const minutes = hour * 60 + minute;

  const OPEN_DAYS = { Wed: 1, Thu: 1, Sat: 1 };
  const openStart = 9 * 60;
  const openEnd = 16 * 60;
  const todayIsOpenDay = !!OPEN_DAYS[wd];
  const isOpen = todayIsOpenDay && minutes >= openStart && minutes < openEnd;

  if (isOpen) {
    const closesAt = 16;
    return {
      isOpen: true,
      label: 'OPEN NOW',
      sub: `Until ${closesAt > 12 ? closesAt - 12 : closesAt} PM · ${PHONE}`,
    };
  }
  // Find next open day
  const order = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const todayIdx = order.indexOf(wd);
  let nextLabel = null;
  // If today is an open day but we're before opening or after closing
  if (todayIsOpenDay && minutes < openStart) {
    nextLabel = 'Opens 9 AM today';
  } else {
    for (let i = 1; i <= 7; i++) {
      const d = order[(todayIdx + i) % 7];
      if (OPEN_DAYS[d]) {
        nextLabel = i === 1 ? `Opens ${d} · 9 AM` : `Opens ${d} · 9 AM`;
        break;
      }
    }
  }
  return {
    isOpen: false,
    label: 'CLOSED',
    sub: nextLabel || PHONE,
  };
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'color-mix(in oklch, var(--cream) 94%, transparent)' : 'color-mix(in oklch, var(--cream) 80%, transparent)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid ' + (scrolled ? 'var(--rule)' : 'transparent'),
      transition: 'background 0.3s, border-color 0.3s'
    }}>
      <div className="wrap" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 92,
        gap: '2rem',
      }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img
            src="images/logo-tight.png"
            alt="Cali Auto Wash — car washing & detailing"
            style={{
              height: 50,
              width: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </a>

        <nav style={{
          display: 'flex', gap: '0.15rem', alignItems: 'center',
        }} className="hide-mobile">
          {[
            { label: 'Services', href: '#services' },
            { label: 'Process',  href: '#process'  },
            { label: 'Work',     href: '#work'     },
            { label: 'Book',     href: '#book'     },
            { label: 'FAQ',      href: '#faq'      },
          ].map((item, i, arr) => (
            <React.Fragment key={item.href}>
              <a href={item.href} className="nav-link-edt" style={{
                display: 'inline-flex', alignItems: 'baseline',
                padding: '0.5rem 0.85rem',
                color: 'var(--ink)',
                fontSize: '0.92rem',
                fontWeight: 500,
                position: 'relative',
                letterSpacing: '-0.005em',
              }}>
                {item.label}
              </a>
              {i < arr.length - 1 && (
                <span aria-hidden style={{
                  width: 3, height: 3, borderRadius: '50%',
                  background: 'var(--ink-dim)', opacity: 0.4,
                }} />
              )}
            </React.Fragment>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexShrink: 0 }}>
          <OpenStatus />
          <a href="#book" className="btn btn-accent btn-bounce">
            <span className="shine" aria-hidden />
            Book now <Icon.arrow />
          </a>
          <button className="show-mobile" onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            style={{
              width: 40, height: 40, display: 'none', flexDirection: 'column',
              gap: 5, alignItems: 'center', justifyContent: 'center'
            }}>
            <span style={{ width: 20, height: 1.5, background: 'var(--ink)', transform: mobileOpen ? 'rotate(45deg) translate(4px,4px)' : 'none', transition: 'transform 0.25s' }} />
            <span style={{ width: 20, height: 1.5, background: 'var(--ink)', opacity: mobileOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <span style={{ width: 20, height: 1.5, background: 'var(--ink)', transform: mobileOpen ? 'rotate(-45deg) translate(4px,-4px)' : 'none', transition: 'transform 0.25s' }} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: '78px 0 0 0',
          background: 'var(--cream)',
          padding: '2rem',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
          zIndex: 40
        }}>
          {['Services','Process','Work','Book','FAQ','Contact'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMobileOpen(false)}
              className="display" style={{ fontSize: '2rem', fontWeight: 400 }}>{l}</a>
          ))}
          <a href={`tel:${PHONE_TEL}`} className="btn btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>
            Call {PHONE}
          </a>
        </div>
      )}

      <style>{`
        .nav-link::after {
          content:''; position:absolute; left:0; right:0; bottom:-2px;
          height:1px; background: var(--ink);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s var(--ease);
        }
        .nav-link:hover::after { transform: scaleX(1); }
        @media (max-width: 860px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

// Simple logomark — a sun/wheel motif, nothing recognisable/branded
function Logo({ size = 34 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--cream)',
      position: 'relative'
    }}>
      <svg width={size*0.55} height={size*0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
    </div>
  );
}

function Hero({ variant = 'editorial' }) {
  if (variant === 'magazine') return <HeroMagazine />;
  if (variant === 'wide') return <HeroWide />;
  return <HeroEditorial />;
}

function HeroEditorial() {
  return (
    <section style={{
      minHeight: '100vh',
      paddingTop: 'calc(78px + 4rem)',
      paddingBottom: '4rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Sun disk — pure css shape, nothing pictorial */}
      <div aria-hidden style={{
        position: 'absolute',
        right: '-12%', top: '8%',
        width: 'min(620px, 65vw)', height: 'min(620px, 65vw)',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, var(--sun) 0%, var(--terracotta) 55%, var(--terracotta-deep) 100%)',
        filter: 'blur(0px)',
        opacity: 0.85,
        zIndex: 0,
      }} />
      <div aria-hidden style={{
        position: 'absolute',
        right: '-12%', top: '8%',
        width: 'min(620px, 65vw)', height: 'min(620px, 65vw)',
        borderRadius: '50%',
        boxShadow: 'inset 0 0 120px rgba(0,0,0,0.15)',
        zIndex: 1
      }} />

      <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)',
          gap: '3rem',
          alignItems: 'start'
        }} className="hero-grid">

          <div>
            <div className="num-label" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>MOBILE DETAIL · EST. 2020</span>
              <span style={{ width: 32, height: 1, background: 'var(--ink-dim)' }} />
              <span>MODESTO &amp; CENTRAL VALLEY</span>
            </div>

            <h1 className="display" style={{
              fontSize: 'clamp(3rem, 8vw, 7.2rem)',
              fontWeight: 300,
              lineHeight: 0.92,
              letterSpacing: '-0.035em',
            }}>
              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Detail</span>
              <span style={{ display: 'inline-block', width: '0.3em' }} />
              <span>that comes</span>
              <br />
              <span>to your </span>
              <span style={{
                fontStyle: 'italic',
                fontWeight: 500,
                color: 'var(--terracotta-deep)'
              }}>driveway.</span>
            </h1>

            <p style={{
              marginTop: '2rem',
              maxWidth: '42ch',
              fontSize: '1.08rem',
              color: 'var(--ink-soft)',
              lineHeight: 1.6
            }}>
              Hand-finished mobile detailing in Modesto and the surrounding Central Valley. From a
              forty-dollar exterior wash to seven-year graphene coatings — done at your home,
              your office, wherever the car lives.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              <a href="#book" className="btn btn-primary">
                Book a wash <Icon.arrow />
              </a>
              <a href="#services" className="btn btn-ghost">
                See services
              </a>
            </div>

            <div style={{
              marginTop: '3.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              maxWidth: 500,
              borderTop: '1px solid var(--rule)',
              paddingTop: '1.25rem',
            }}>
              {[
                { k: '7 yr', v: 'Graphene ceramic' },
                { k: '500+', v: 'Cars detailed' },
                { k: '3 days', v: 'Wed · Thu · Sat' },
              ].map(s => (
                <div key={s.v}>
                  <div className="display" style={{ fontSize: '1.55rem', fontWeight: 400, letterSpacing: '-0.02em' }}>{s.k}</div>
                  <div className="num-label" style={{ marginTop: 4 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero image card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              transform: 'rotate(1.5deg)',
            }}>
              <Placeholder
                label="Hero · Silver BMW M3 · golden hour"
                src="images/bmw-m3-silver.jpg"
                objectPosition="center 30%"
                eager
                aspect="3/4"
                tone="dark"
                style={{ borderRadius: 'var(--radius-lg)', boxShadow: '0 40px 60px -30px rgba(0,0,0,0.35)' }}
              />
              {/* caption tag */}
              <div style={{
                position: 'absolute', top: '1rem', left: '1rem',
                background: 'var(--cream)',
                padding: '0.45rem 0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--ink)'
              }}>
                <LiveWeather />
              </div>
              {/* price tag */}
              <div style={{
                position: 'absolute', bottom: '-1.25rem', right: '-1.25rem',
                background: 'var(--ink)',
                color: 'var(--cream)',
                padding: '1.25rem 1.5rem',
                transform: 'rotate(-3deg)',
                boxShadow: '0 20px 40px -20px rgba(0,0,0,0.4)'
              }}>
                <div className="num-label" style={{ color: 'var(--cream)', opacity: 0.6 }}>Starting at</div>
                <div className="display" style={{ fontSize: '2rem', fontWeight: 400 }}>
                  <sup style={{ fontSize: '0.85rem', opacity: 0.7, marginRight: 2 }}>$</sup>40
                </div>
              </div>
            </div>

            {/* Small secondary image */}
            <div style={{
              position: 'absolute',
              bottom: '-3rem', left: '-3rem',
              width: '52%',
              transform: 'rotate(-4deg)',
              display: 'none'
            }} className="hero-thumb">
              <Placeholder label="Interior · Steam extract" src="images/lexus-red-interior.jpg" eager aspect="1/1" tone="terra" />
            </div>
          </div>

        </div>

        {/* Marquee of service tags */}
        <div style={{
          marginTop: '6rem',
          borderTop: '1px solid var(--rule)',
          borderBottom: '1px solid var(--rule)',
          padding: '1rem 0',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            gap: '3rem',
            animation: 'marquee 45s linear infinite',
            whiteSpace: 'nowrap',
            width: 'max-content',
          }}>
            {[...Array(3)].flatMap((_, i) => [
              'Exterior Wash', '★', 'Interior Detail', '★', 'Paint Correction', '★',
              '7-Year Ceramic', '★', 'Steam Extraction', '★', 'Decontamination', '★',
              'Clay Bar', '★', 'Pet Hair Removal', '★',
            ].map((t, j) => (
              <span key={`${i}-${j}`} className="display" style={{
                fontSize: '1.6rem',
                fontWeight: 300,
                fontStyle: t === '★' ? 'normal' : 'italic',
                color: t === '★' ? 'var(--terracotta)' : 'var(--ink)',
              }}>{t}</span>
            )))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function HeroMagazine() {
  return (
    <section style={{
      minHeight: '100vh',
      paddingTop: 'calc(78px + 2rem)',
      paddingBottom: '3rem',
      position: 'relative',
    }}>
      <div className="wrap">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderTop: '1px solid var(--ink)',
          gap: 0
        }} className="mag-grid">

          <div style={{ padding: '3rem 2rem 3rem 0', borderRight: '1px solid var(--rule)' }} className="mag-l">
            <div className="num-label" style={{ marginBottom: '2rem' }}>
              VOLUME XII · SPRING EDITION · MODESTO, CA
            </div>
            <h1 className="display" style={{
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              fontWeight: 300,
              lineHeight: 0.95,
            }}>
              The art of the<br/>
              <span style={{ fontStyle: 'italic', fontWeight: 500 }}>driveway detail.</span>
            </h1>
            <p style={{
              marginTop: '2rem',
              columnCount: 2,
              columnGap: '1.5rem',
              fontSize: '0.92rem',
              color: 'var(--ink-soft)',
              lineHeight: 1.65,
            }}>
              Mobile car detailing for Modesto and the Central Valley. Hand wash, interior steam extraction,
              paint correction, and seven-year graphene coatings — delivered at your home or office. No tunnels,
              no brushes, no rush. Just meticulous work, a polish, and a hand-dry.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
              <a href="#book" className="btn btn-primary">Book a wash <Icon.arrow /></a>
              <a href={`tel:${PHONE_TEL}`} className="btn btn-ghost"><Icon.phone /> {PHONE}</a>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Placeholder label="Cover · Midnight tacoma · clay bar" src="images/lexus-gx-sunset.jpg" eager aspect="3/4" tone="dark" />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '1.25rem',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              color: 'var(--cream)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              <span>FIG. 01 — 2021 TACOMA · FULL DETAIL</span>
              <span>$75</span>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .mag-grid { grid-template-columns: 1fr !important; }
          .mag-l { padding: 2rem 0 !important; border-right: 0 !important; border-bottom: 1px solid var(--rule); }
        }
      `}</style>
    </section>
  );
}

function HeroWide() {
  return (
    <section style={{
      minHeight: '100vh',
      paddingTop: 'calc(78px + 2rem)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div className="wrap" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '4rem 2rem' }}>
        <div style={{ width: '100%', textAlign: 'center' }}>
          <Eyebrow accent style={{ marginBottom: '2rem' }}>Mobile Detail · Modesto · Est. 2020</Eyebrow>
          <h1 className="display" style={{
            fontSize: 'clamp(3rem, 10vw, 9.5rem)',
            fontWeight: 300,
            lineHeight: 0.9,
            maxWidth: '14ch',
            margin: '0 auto'
          }}>
            <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--terracotta-deep)' }}>Hand-washed.</span>
            <br/>
            Hand-dried.
            <br/>
            Delivered.
          </h1>
          <p style={{
            marginTop: '2rem', fontSize: '1.1rem',
            color: 'var(--ink-soft)', maxWidth: '48ch',
            margin: '2rem auto 0'
          }}>
            Professional mobile detailing at your driveway. Wed, Thu & Saturday, 9AM to 4PM.
          </p>
          <div style={{ display: 'inline-flex', gap: '0.75rem', marginTop: '2.5rem' }}>
            <a href="#book" className="btn btn-accent"><span className="shine" aria-hidden />Book now <Icon.arrow /></a>
            <a href="#services" className="btn btn-ghost">See services</a>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 2rem 2rem' }}>
        <div className="wrap">
          <Placeholder label="Wide cover · Camry · Paint correction" src="images/camry-detail.jpg" eager aspect="21/9" tone="dark" />
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Header, Hero, Logo });
