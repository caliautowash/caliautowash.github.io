/* Booking — interactive multi-step preview */

const BOOKING_SERVICES = [
  { id: 'wash', name: 'Exterior Wash', price: 40, time: '45m', desc: 'Hand wash, wheels, windows' },
  { id: 'interior', name: 'Standard Interior', price: 60, time: '1h', desc: 'Vacuum, dust, wipe-down' },
  { id: 'full', name: 'Standard Full Detail', price: 75, time: '1.5h', desc: 'Interior + exterior', popular: true },
  { id: 'decon', name: 'Decontamination Exterior', price: 100, time: '2h', desc: 'Clay bar + iron fallout' },
  { id: 'deep', name: 'Deep Clean Interior', price: 175, time: '3h', desc: 'Steam + extraction' },
  { id: 'ceramic', name: 'Paint Correction + 7-yr Graphene', price: 300, time: '6–8h', desc: 'Full correction + coating' },
];

const VEHICLE_TYPES = [
  { id: 'coupe', label: 'Coupe / Sedan', surcharge: 0 },
  { id: 'suv', label: 'SUV / Crossover', surcharge: 10 },
  { id: 'truck', label: 'Truck / Large SUV', surcharge: 20 },
  { id: 'van', label: 'Van / 3-row', surcharge: 25 },
];

const TIME_SLOTS = ['7:00', '9:00', '11:00', '13:00', '15:00', '17:00'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATES = [17, 18, 19, 20, 21, 22, 23];

function Booking() {
  const ref = useReveal();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    service: 'full',
    vehicle: 'coupe',
    address: '',
    day: 1,
    slot: '9:00',
    name: '',
    phone: '',
  });

  const svc = BOOKING_SERVICES.find(s => s.id === data.service);
  const veh = VEHICLE_TYPES.find(v => v.id === data.vehicle);
  const total = (svc?.price || 0) + (veh?.surcharge || 0);

  const next = () => setStep(s => Math.min(s + 1, 4));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const bookingSMS = (() => {
    const dayName = DAYS[data.day];
    const h = parseInt(data.slot.split(':')[0], 10);
    const timeLabel = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
    const addr = [data.address, data.city, data.zip].filter(Boolean).join(', ');
    const body = [
      'New booking — Cali Auto Wash',
      '',
      `Name: ${data.name || '(not provided)'}`,
      `Service: ${svc?.name} — $${svc?.price || 0}`,
      `Vehicle: ${veh?.label}${veh?.surcharge ? ` (+$${veh.surcharge})` : ''}`,
      `When: ${dayName} · ${timeLabel}`,
      `Where: ${addr || '(to provide)'}`,
      `Total: $${total}`,
    ].join('\n');
    return `sms:${PHONE_TEL}?&body=${encodeURIComponent(body)}`;
  })();

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

          {/* Booking card */}
          <div style={{
            background: 'var(--cream)',
            color: 'var(--ink)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 40px 80px -30px rgba(0,0,0,0.5)',
          }}>
            {/* header with step pagination */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--rule)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div className="num-label">Step {String(step+1).padStart(2,'0')} / 05</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{
                    width: i === step ? 24 : 8, height: 4,
                    background: i <= step ? 'var(--terracotta)' : 'var(--rule)',
                    borderRadius: 2,
                    transition: 'width 0.3s var(--ease), background 0.3s',
                  }} />
                ))}
              </div>
            </div>

            <div style={{ padding: '2rem 1.75rem', minHeight: 420 }}>
              {step === 0 && <StepService data={data} setData={setData} />}
              {step === 1 && <StepVehicle data={data} setData={setData} />}
              {step === 2 && <StepAddress data={data} setData={setData} />}
              {step === 3 && <StepTime data={data} setData={setData} />}
              {step === 4 && <StepConfirm data={data} setData={setData} svc={svc} veh={veh} total={total} />}
            </div>

            {/* Footer with totals + nav */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid var(--rule)',
              background: 'var(--cream-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '1rem',
            }}>
              <div>
                <div className="num-label">ESTIMATED</div>
                <div className="display" style={{ fontSize: '1.8rem', fontWeight: 400 }}>
                  <sup style={{ fontSize: '0.85rem', opacity: 0.7, marginRight: 2 }}>$</sup>{total}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {step > 0 && (
                  <button onClick={prev} className="btn btn-ghost" style={{ padding: '0.75rem 1rem' }}>
                    Back
                  </button>
                )}
                {step < 4 ? (
                  <button onClick={next} className="btn btn-primary" style={{ padding: '0.85rem 1.5rem' }}>
                    Continue <Icon.arrow />
                  </button>
                ) : (
                  <a href={bookingSMS} className="btn btn-accent" style={{ padding: '0.85rem 1.5rem' }}>
                    <span className="shine" aria-hidden />
                    Confirm booking <Icon.check />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .book-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
      `}</style>
    </section>
  );
}

function StepService({ data, setData }) {
  return (
    <div>
      <h3 className="display" style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.25rem' }}>
        <span style={{ fontStyle: 'italic' }}>First —</span> what does your car need?
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {BOOKING_SERVICES.map(s => {
          const active = data.service === s.id;
          return (
            <button key={s.id} onClick={() => setData({ ...data, service: s.id })}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.9rem 1rem',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--cream)' : 'var(--ink)',
                border: '1px solid ' + (active ? 'var(--ink)' : 'var(--rule)'),
                borderRadius: 'var(--radius)',
                textAlign: 'left',
                transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                cursor: 'pointer',
              }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{s.name}</span>
                  {s.popular && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      background: 'var(--terracotta)', color: 'var(--cream)',
                      padding: '0.1rem 0.4rem', borderRadius: 2
                    }}>Popular</span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 2 }}>{s.desc} · {s.time}</div>
              </div>
              <div className="display" style={{ fontSize: '1.3rem', fontWeight: 400 }}>
                <sup style={{ fontSize: '0.7rem', opacity: 0.7, marginRight: 1 }}>$</sup>{s.price}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepVehicle({ data, setData }) {
  return (
    <div>
      <h3 className="display" style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.25rem' }}>
        <span style={{ fontStyle: 'italic' }}>Second —</span> what do you drive?
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {VEHICLE_TYPES.map(v => {
          const active = data.vehicle === v.id;
          return (
            <button key={v.id} onClick={() => setData({ ...data, vehicle: v.id })}
              style={{
                padding: '1.25rem 1rem',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--cream)' : 'var(--ink)',
                border: '1px solid ' + (active ? 'var(--ink)' : 'var(--rule)'),
                borderRadius: 'var(--radius)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{v.label}</div>
              <div className="num-label" style={{ color: active ? 'var(--sun)' : 'var(--ink-dim)', marginTop: 4 }}>
                {v.surcharge > 0 ? `+ $${v.surcharge}` : 'NO SURCHARGE'}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{
        padding: '1rem',
        background: 'var(--cream-2)',
        borderRadius: 'var(--radius)',
        fontSize: '0.85rem',
        color: 'var(--ink-soft)',
      }}>
        <strong style={{ color: 'var(--ink)' }}>Heads up:</strong> larger or heavily-soiled vehicles may require additional time.
        We&rsquo;ll confirm by text if there&rsquo;s any change.
      </div>
    </div>
  );
}

function StepAddress({ data, setData }) {
  return (
    <div>
      <h3 className="display" style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.25rem' }}>
        <span style={{ fontStyle: 'italic' }}>Third —</span> where are we washing it?
      </h3>
      <AddressAutocomplete
        value={data.address}
        onChange={v => setData({ ...data, address: v })}
        onPlace={parts => setData({
          ...data,
          address: parts.address || data.address,
          city: parts.city || data.city,
          zip: parts.zip || data.zip,
        })}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
        <Field label="City" placeholder="Modesto"
          value={data.city || ''} onChange={v => setData({ ...data, city: v })} />
        <Field label="ZIP" placeholder="95350"
          value={data.zip || ''} onChange={v => setData({ ...data, zip: v })} />
      </div>
      <div style={{
        marginTop: '1.5rem',
        display: 'flex', gap: '0.65rem', alignItems: 'flex-start',
        padding: '1rem',
        background: 'color-mix(in oklch, var(--terracotta) 8%, var(--cream))',
        border: '1px solid color-mix(in oklch, var(--terracotta) 20%, transparent)',
        borderRadius: 'var(--radius)',
      }}>
        <Icon.location style={{ color: 'var(--terracotta)', marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
          We serve Modesto, Ceres, Turlock, Oakdale, Riverbank, Salida &amp; Ripon.
          Outside that? <a href={`tel:${PHONE_TEL}`} style={{ textDecoration: 'underline' }}>Call us</a> — we usually still come.
        </div>
      </div>
    </div>
  );
}

function StepTime({ data, setData }) {
  return (
    <div>
      <h3 className="display" style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.25rem' }}>
        <span style={{ fontStyle: 'italic' }}>Fourth —</span> pick a window.
      </h3>
      <div className="num-label" style={{ marginBottom: '0.65rem' }}>DAY · APRIL 2026</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem', marginBottom: '1.5rem' }}>
        {DAYS.map((d, i) => {
          const active = data.day === i;
          return (
            <button key={d} onClick={() => setData({ ...data, day: i })}
              style={{
                padding: '0.75rem 0',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--cream)' : 'var(--ink)',
                border: '1px solid ' + (active ? 'var(--ink)' : 'var(--rule)'),
                borderRadius: 'var(--radius)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
              <div className="num-label" style={{ color: active ? 'color-mix(in oklch, var(--cream) 70%, transparent)' : 'var(--ink-dim)', fontSize: '0.6rem' }}>{d}</div>
              <div className="display" style={{ fontSize: '1.2rem', fontWeight: 400, marginTop: 2 }}>{DATES[i]}</div>
            </button>
          );
        })}
      </div>

      <div className="num-label" style={{ marginBottom: '0.65rem' }}>TIME</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
        {TIME_SLOTS.map(t => {
          const active = data.slot === t;
          const h = parseInt(t.split(':')[0], 10);
          const label = h < 12 ? `${h}:00 AM` : h === 12 ? `12:00 PM` : `${h-12}:00 PM`;
          return (
            <button key={t} onClick={() => setData({ ...data, slot: t })}
              style={{
                padding: '0.75rem 0.5rem',
                background: active ? 'var(--terracotta)' : 'transparent',
                color: active ? 'var(--cream)' : 'var(--ink)',
                border: '1px solid ' + (active ? 'var(--terracotta)' : 'var(--rule)'),
                borderRadius: 'var(--radius)',
                fontSize: '0.85rem', fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepConfirm({ data, setData, svc, veh, total }) {
  return (
    <div>
      <h3 className="display" style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.25rem' }}>
        <span style={{ fontStyle: 'italic' }}>Last step —</span> your details.
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Field label="Your name" placeholder="Jane Smith" value={data.name} onChange={v => setData({ ...data, name: v })} />
        <Field label="Phone" placeholder="(209) 555-0100" value={data.phone} onChange={v => setData({ ...data, phone: v })} />
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        background: 'var(--cream-2)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--rule)',
      }}>
        <div className="num-label" style={{ marginBottom: '0.75rem' }}>YOUR BOOKING</div>
        {[
          ['Service', svc?.name],
          ['Vehicle', veh?.label],
          ['When', `${DAYS[data.day]} April ${DATES[data.day]} · ${data.slot}`],
          ['Address', data.address || '—'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--ink-soft)' }}>{k}</span>
            <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '0.65rem 0 0', marginTop: '0.5rem',
          borderTop: '1px solid var(--rule)',
          alignItems: 'baseline',
        }}>
          <span className="num-label">TOTAL</span>
          <span className="display" style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--terracotta-deep)' }}>
            <sup style={{ fontSize: '0.75rem', opacity: 0.7 }}>$</sup>{total}
          </span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value = '', onChange }) {
  return (
    <label style={{ display: 'block' }}>
      <div className="num-label" style={{ marginBottom: 6 }}>{label}</div>
      <input
        type="text" placeholder={placeholder}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem 0.85rem',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--radius)',
          background: 'var(--cream)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.92rem',
          color: 'var(--ink)',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--ink)'}
        onBlur={e => e.target.style.borderColor = 'var(--rule)'}
      />
    </label>
  );
}

function AddressAutocomplete({ value = '', onChange, onPlace }) {
  const inputRef = React.useRef(null);
  const acRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    function tryInit() {
      if (cancelled) return;
      if (window.google && window.google.maps && window.google.maps.places && inputRef.current && !acRef.current) {
        const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address'],
          types: ['address'],
        });
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (!place || !place.address_components) return;
          const get = (type) => {
            const c = place.address_components.find(c => c.types.includes(type));
            return c ? c.long_name : '';
          };
          const streetNum = get('street_number');
          const route = get('route');
          const street = [streetNum, route].filter(Boolean).join(' ');
          const city = get('locality') || get('sublocality') || get('administrative_area_level_3');
          const zip = get('postal_code');
          if (onPlace) onPlace({ address: street, city, zip });
        });
        acRef.current = ac;
        setReady(true);
      } else if (window.GOOGLE_MAPS_API_KEY && window.GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY') {
        setTimeout(tryInit, 300);
      }
    }
    tryInit();
    return () => { cancelled = true; };
  }, []);

  return (
    <label style={{ display: 'block', position: 'relative' }}>
      <div className="num-label" style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Street address</span>
        {ready && <span style={{ fontSize: '0.65rem', color: 'var(--sage)', fontWeight: 500 }}>⌕ Autofill enabled</span>}
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="123 Main St"
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '0.75rem 0.85rem',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--radius)',
          background: 'var(--cream)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.92rem',
          color: 'var(--ink)',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--ink)'}
        onBlur={e => e.target.style.borderColor = 'var(--rule)'}
      />
    </label>
  );
}

Object.assign(window, { Booking });
