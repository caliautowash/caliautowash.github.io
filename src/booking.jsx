/* Booking — interactive multi-step preview */

// Google Apps Script webhook — every Confirm tap appends a row to the
// shared commission-tracking sheet (timestamp, ref, service, vehicle,
// time, address, total). Fire-and-forget; does not block the SMS.
const BOOKING_LOG_URL = 'https://script.google.com/macros/s/AKfycbwP728WH1IEXWlMIZceCEfjN-69GbBWdgyqNabnhGwL9WZ0z1iP_r4fqQeku-iwC5Udtg/exec';

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

// Cali Auto Wash hours: Wed, Thu, Sat — 9AM–4PM (closed Fri/Sun/Mon/Tue).
// Time slots are start times within that window — last slot is 3PM so a
// typical 1–2hr service still finishes by 5PM (longer services like ceramic
// should call to schedule).
const TIME_SLOTS = ['9:00', '11:00', '13:00', '15:00'];

// Generate the next 7 calendar days from today. Closed days (Sun/Mon/Tue) are
// shown but disabled so the user can see at a glance which days she works.
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const UPCOMING_DAYS = (() => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay(); // 0=Sun ... 6=Sat
    return {
      dow,
      label: DAY_NAMES[dow],
      date: d.getDate(),
      month: MONTH_NAMES[d.getMonth()],
      year: d.getFullYear(),
      // Cali works Wed (3), Thu (4), Sat (6) — closed Fri (5) and Sun/Mon/Tue.
      isOpen: dow === 3 || dow === 4 || dow === 6,
    };
  });
})();
// Default to the first open day in the visible window.
const DEFAULT_DAY_INDEX = Math.max(0, UPCOMING_DAYS.findIndex((d) => d.isOpen));

// Two ways to receive service.
const SERVICE_LOCATIONS = [
  { id: 'mobile',  label: 'We come to you',  desc: 'Mobile detail at your address' },
  { id: 'dropoff', label: 'You come to us',  desc: "Drop off at Cali's shop" },
];

// Used in the drop-off booking flow and in the SMS / commission-log payload.
const CALI_SHOP = {
  street: 'Independence Way',
  city:   'Modesto',
  state:  'CA',
  zip:    '95354',
};

// Service-area ZIPs (Stanislaus County and immediate neighbors all start with 95).
const IN_SERVICE_AREA = (zip) => /^95\d{3}$/.test((zip || '').trim());

// Per-step validation. Returns { ok: bool, msg: string } so we can disable the
// Continue button and show a one-line hint about what's missing.
function validateBookingStep(step, data) {
  if (step === 2) {
    // Drop-off bookings don't need a customer address — the customer comes to us.
    if (data.serviceLocation === 'dropoff') return { ok: true, msg: '' };

    // Mobile bookings: require a real, verified address in our service area.
    if (!data.address?.trim()) return { ok: false, msg: 'Add a street address to continue.' };
    if (!data.city?.trim())    return { ok: false, msg: 'Add a city to continue.' };
    if (!data.zip?.trim())     return { ok: false, msg: 'Add a ZIP code to continue.' };
    if (!/^\d{5}$/.test(data.zip.trim())) return { ok: false, msg: 'ZIP must be 5 digits.' };
    if (!IN_SERVICE_AREA(data.zip)) return { ok: false, msg: 'We only serve Modesto + 25mi (ZIPs starting with 95).' };
    // (Address-from-dropdown verification removed — was blocking users when
    // Google Places didn't render cleanly. Field-fill + ZIP checks above are
    // still enforced, which catches the obvious junk.)
  }
  if (step === 3) {
    const day = UPCOMING_DAYS[data.day];
    if (!day || !day.isOpen) return { ok: false, msg: 'Pick an open day (Wed, Thu, or Sat) to continue.' };
    if (!data.slot) return { ok: false, msg: 'Pick a time slot to continue.' };
  }
  if (step === 4) {
    if (!data.name?.trim()) return { ok: false, msg: 'Add your name to continue.' };
    if (!data.phone?.trim()) return { ok: false, msg: 'Add a phone number to continue.' };
    const digits = data.phone.replace(/\D/g, '');
    if (digits.length < 10) return { ok: false, msg: 'Phone number needs at least 10 digits.' };
  }
  return { ok: true, msg: '' };
}

function Booking() {
  const ref = useReveal();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    service: 'full',
    vehicle: 'coupe',
    serviceLocation: 'mobile',  // 'mobile' (we go to them) | 'dropoff' (they come to us)
    address: '',
    city: '',
    zip: '',
    addressVerified: false,     // flips true when they pick from Google Places autocomplete
    day: DEFAULT_DAY_INDEX,
    slot: '9:00',
    name: '',
    phone: '',
  });

  // If the user just landed back from a Stripe-hosted redirect (after
  // confirmPayment), short-circuit the whole booking flow and render the
  // payment-return card. We capture the params once on mount, then clear
  // them from the URL so a refresh doesn't re-trigger the success view.
  const [stripeReturn, setStripeReturn] = useState(() =>
    typeof window !== 'undefined' && typeof window.readStripeReturn === 'function'
      ? window.readStripeReturn()
      : null,
  );
  useEffect(() => {
    if (stripeReturn && typeof window.clearStripeReturnFromUrl === 'function') {
      window.clearStripeReturnFromUrl();
      // Scroll the success card into view if the user was deep-linked here.
      const el = document.getElementById('book');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const svc = BOOKING_SERVICES.find(s => s.id === data.service);
  const veh = VEHICLE_TYPES.find(v => v.id === data.vehicle);
  const subtotal = (svc?.price || 0) + (veh?.surcharge || 0);

  // Feature flag — Tier 4 Stripe embedded checkout. Falls back to SMS if the
  // Worker URL isn't configured yet.
  const useStripe = window.PAYMENT_FLOW === 'stripe'
    && !!window.STRIPE_PUBLISHABLE_KEY
    && !!window.STRIPE_WORKER_URL;

  // 5% card processing fee — only applied to online (Stripe) bookings, since
  // SMS bookings settle in cash/Venmo on-site (no card processing cost). The
  // surcharge keeps Cali whole on the ~3.5% Stripe takes from her side.
  // Round to the nearest cent so the displayed total matches what we charge.
  const CARD_FEE_PERCENT = 5;
  const cardFee = useStripe ? Math.round(subtotal * (CARD_FEE_PERCENT / 100) * 100) / 100 : 0;
  const total = subtotal + cardFee;

  // Disable Continue/Confirm buttons until the current step's required fields
  // are filled in. Validation logic lives in validateBookingStep() above.
  const validation = validateBookingStep(step, data);
  const maxStep = useStripe ? 5 : 4;
  const stepCount = useStripe ? 6 : 5;

  const next = () => setStep(s => Math.min(s + 1, maxStep));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  // Short per-session ref code so site-originated bookings are easy to
  // identify in Cali's message history later (supports commission tracking).
  const refCode = useMemo(() => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
    let s = '';
    for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    return `CAW-${s}`;
  }, []);

  // Shared booking details — used for both the SMS body and the sheet log.
  const bookingDetails = (() => {
    const day = UPCOMING_DAYS[data.day] || UPCOMING_DAYS[DEFAULT_DAY_INDEX];
    const h = parseInt(data.slot.split(':')[0], 10);
    const timeLabel = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
    const addr = [data.address, data.city, data.zip].filter(Boolean).join(', ');
    const where = data.serviceLocation === 'dropoff'
      ? `Drop-off at Cali Auto Wash, ${CALI_SHOP.street}, ${CALI_SHOP.city} ${CALI_SHOP.zip}`
      : addr || '(to provide)';
    return {
      ref: refCode,
      name: data.name || '(not provided)',
      service: svc?.name ? `${svc.name} — $${svc.price || 0}` : '',
      vehicle: veh?.label + (veh?.surcharge ? ` (+$${veh.surcharge})` : ''),
      when: `${day.label} ${day.month} ${day.date} · ${timeLabel}`,
      where,
      serviceLocation: data.serviceLocation,
      subtotal,
      cardFee,
      total,
    };
  })();

  const bookingSMS = (() => {
    const body = [
      'Hi! I\'d like to book a detail.',
      '',
      `Name: ${bookingDetails.name}`,
      `Service: ${bookingDetails.service}`,
      `Vehicle: ${bookingDetails.vehicle}`,
      `When: ${bookingDetails.when}`,
      `Where: ${bookingDetails.where}`,
      `Total: $${bookingDetails.total}`,
      '',
      `Booking ID: ${refCode}`,
    ].join('\n');
    return `sms:${PHONE_TEL}?&body=${encodeURIComponent(body)}`;
  })();

  // Fire-and-forget POST to the Google Sheet webhook. Uses `text/plain` to
  // dodge the CORS preflight that Apps Script endpoints don't answer.
  const logBookingToSheet = () => {
    if (!BOOKING_LOG_URL) return;
    try {
      fetch(BOOKING_LOG_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(bookingDetails),
        keepalive: true, // survive navigation away (sms: link)
      }).catch(() => {});
    } catch (_) { /* never block the SMS flow */ }
  };

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
                { label: 'Hours', val: 'Wed, Thu, Sat · 9AM–4PM' },
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
            {/* header with step pagination — hidden in the post-payment return view */}
            {!stripeReturn && (
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--rule)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div className="num-label">Step {String(step+1).padStart(2,'0')} / {String(stepCount).padStart(2,'0')}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: stepCount }, (_, i) => (
                    <div key={i} style={{
                      width: i === step ? 24 : 8, height: 4,
                      background: i <= step ? 'var(--terracotta)' : 'var(--rule)',
                      borderRadius: 2,
                      transition: 'width 0.3s var(--ease), background 0.3s',
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: '2rem 1.75rem', minHeight: 420 }}>
              {stripeReturn && typeof window.PaymentReturn === 'function' ? (
                <window.PaymentReturn
                  refCode={stripeReturn.refCode}
                  clientSecret={stripeReturn.clientSecret}
                  redirectStatus={stripeReturn.redirectStatus}
                  onAcknowledge={() => {
                    setStripeReturn(null);
                    setStep(0);
                  }}
                />
              ) : (
                <>
                  {step === 0 && <StepService data={data} setData={setData} />}
                  {step === 1 && <StepVehicle data={data} setData={setData} />}
                  {step === 2 && <StepAddress data={data} setData={setData} />}
                  {step === 3 && <StepTime data={data} setData={setData} />}
                  {step === 4 && <StepConfirm data={data} setData={setData} svc={svc} veh={veh} subtotal={subtotal} cardFee={cardFee} total={total} useStripe={useStripe} />}
                  {step === 5 && useStripe && typeof window.StepPayment === 'function' && (
                    <window.StepPayment
                      data={data}
                      setData={setData}
                      svc={svc}
                      veh={veh}
                      subtotal={subtotal}
                      cardFee={cardFee}
                      total={total}
                      refCode={refCode}
                      bookingDetails={bookingDetails}
                    />
                  )}
                </>
              )}
            </div>

            {/* Footer with totals + nav — hidden in the post-payment return view */}
            {!stripeReturn && (
            <div style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid var(--rule)',
              background: 'var(--cream-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '1rem',
            }}>
              <div>
                <div className="num-label">
                  ESTIMATED
                  {useStripe && cardFee > 0 ? ` · incl. ${CARD_FEE_PERCENT}% card fee` : ''}
                </div>
                <div className="display" style={{ fontSize: '1.8rem', fontWeight: 400 }}>
                  <sup style={{ fontSize: '0.85rem', opacity: 0.7, marginRight: 2 }}>$</sup>{total.toFixed(2)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                {step > 0 && (
                  <button onClick={prev} className="btn btn-ghost" style={{ padding: '0.75rem 1rem' }}>
                    Back
                  </button>
                )}
                {step < maxStep ? (
                  <button
                    onClick={next}
                    disabled={!validation.ok}
                    title={validation.ok ? '' : validation.msg}
                    className="btn btn-primary"
                    style={{
                      padding: '0.85rem 1.5rem',
                      opacity: validation.ok ? 1 : 0.5,
                      cursor: validation.ok ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {useStripe && step === 4 ? <>Continue to payment <Icon.arrow /></> : <>Continue <Icon.arrow /></>}
                  </button>
                ) : useStripe ? null /* StepPayment renders its own Pay button */ : (
                  <a
                    href={validation.ok ? bookingSMS : '#'}
                    className="btn btn-accent"
                    style={{
                      padding: '0.85rem 1.5rem',
                      opacity: validation.ok ? 1 : 0.5,
                      cursor: validation.ok ? 'pointer' : 'not-allowed',
                      pointerEvents: validation.ok ? 'auto' : 'none',
                    }}
                    aria-disabled={!validation.ok}
                    title={validation.ok ? '' : validation.msg}
                    onClick={(e) => {
                      if (!validation.ok) { e.preventDefault(); return; }
                      logBookingToSheet();
                      if (typeof window.gtag === 'function') {
                        // Use GA4 standard `value` + `currency` so total is
                        // auto-aggregated as revenue in reports / Looker.
                        window.gtag('event', 'booking_submitted', {
                          value: total,
                          currency: 'USD',
                          service: svc?.name,
                          vehicle: veh?.label,
                          ref_code: refCode,
                        });
                      }
                    }}
                  >
                    <span className="shine" aria-hidden />
                    Confirm booking <Icon.check />
                  </a>
                )}
                </div>
                {!validation.ok && (
                  <div style={{
                    fontSize: '0.78rem',
                    color: 'var(--terracotta-deep)',
                    textAlign: 'right',
                    maxWidth: 280,
                    lineHeight: 1.4,
                  }}>
                    {validation.msg}
                  </div>
                )}
              </div>
            </div>
            )}
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
  const isMobile = data.serviceLocation !== 'dropoff';
  return (
    <div>
      <h3 className="display" style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.25rem' }}>
        <span style={{ fontStyle: 'italic' }}>Third —</span> where are we washing it?
      </h3>

      {/* Service location toggle: mobile vs. drop-off */}
      <div className="num-label" style={{ marginBottom: '0.65rem' }}>SERVICE LOCATION</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {SERVICE_LOCATIONS.map((loc) => {
          const active = data.serviceLocation === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => setData({ ...data, serviceLocation: loc.id })}
              style={{
                padding: '1rem',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--cream)' : 'var(--ink)',
                border: '1px solid ' + (active ? 'var(--ink)' : 'var(--rule)'),
                borderRadius: 'var(--radius)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{loc.label}</div>
              <div className="num-label" style={{ color: active ? 'var(--sun)' : 'var(--ink-dim)', marginTop: 4 }}>
                {loc.desc}
              </div>
            </button>
          );
        })}
      </div>

      {isMobile ? (
        <>
          <AddressAutocomplete
            value={data.address}
            verified={!!data.addressVerified}
            onChange={(v) =>
              // Any manual edit invalidates a previous Place selection — user
              // has to re-pick from the dropdown to re-verify.
              setData({ ...data, address: v, addressVerified: false })
            }
            onPlace={(parts) =>
              setData({
                ...data,
                address: parts.address || data.address,
                city: parts.city || data.city,
                zip: parts.zip || data.zip,
                addressVerified: true,
              })
            }
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
            <Field
              label="City"
              placeholder="Modesto"
              value={data.city || ''}
              onChange={(v) => setData({ ...data, city: v, addressVerified: false })}
            />
            <Field
              label="ZIP"
              placeholder="95350"
              value={data.zip || ''}
              onChange={(v) => setData({ ...data, zip: v, addressVerified: false })}
            />
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
        </>
      ) : (
        // Drop-off info card — show Cali's shop address, no input fields needed.
        <div style={{
          padding: '1.25rem',
          background: 'var(--cream-2)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--radius)',
        }}>
          <div className="num-label" style={{ marginBottom: '0.5rem' }}>OUR SHOP</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.25rem' }}>
            Cali Auto Wash
          </div>
          <div style={{ color: 'var(--ink-soft)', fontSize: '0.92rem', marginBottom: '0.75rem' }}>
            {CALI_SHOP.street}<br />
            {CALI_SHOP.city}, {CALI_SHOP.state} {CALI_SHOP.zip}
          </div>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`Cali Auto Wash, ${CALI_SHOP.street}, ${CALI_SHOP.city}, ${CALI_SHOP.state} ${CALI_SHOP.zip}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--terracotta-deep)', fontWeight: 500, fontSize: '0.88rem', textDecoration: 'underline' }}
          >
            Get directions ↗
          </a>
          <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--ink-dim)', lineHeight: 1.55 }}>
            Drop your car off at the start of your booked window. We&rsquo;ll text you when it&rsquo;s ready.
          </p>
        </div>
      )}
    </div>
  );
}

function StepTime({ data, setData }) {
  // Show the month label for the visible window (handles month rollover).
  const firstMonth = UPCOMING_DAYS[0]?.month;
  const lastMonth = UPCOMING_DAYS[UPCOMING_DAYS.length - 1]?.month;
  const monthLabel =
    firstMonth === lastMonth
      ? `${firstMonth} ${UPCOMING_DAYS[0]?.year}`
      : `${firstMonth}–${lastMonth} ${UPCOMING_DAYS[0]?.year}`;
  return (
    <div>
      <h3 className="display" style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.25rem' }}>
        <span style={{ fontStyle: 'italic' }}>Fourth —</span> pick a window.
      </h3>
      <div
        className="num-label"
        style={{ marginBottom: '0.65rem', display: 'flex', justifyContent: 'space-between' }}
      >
        <span>DAY · {monthLabel.toUpperCase()}</span>
        <span style={{ color: 'var(--ink-dim)' }}>WED · THU · SAT · 9AM–4PM</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem', marginBottom: '1.5rem' }}>
        {UPCOMING_DAYS.map((d, i) => {
          const active = data.day === i;
          const closed = !d.isOpen;
          return (
            <button
              key={`${d.label}-${d.date}`}
              onClick={() => !closed && setData({ ...data, day: i })}
              disabled={closed}
              title={closed ? 'Closed' : `${d.label} ${d.month} ${d.date}`}
              style={{
                padding: '0.75rem 0',
                background: active ? 'var(--ink)' : 'transparent',
                color: closed ? 'var(--ink-dim)' : active ? 'var(--cream)' : 'var(--ink)',
                border: '1px solid ' + (active ? 'var(--ink)' : 'var(--rule)'),
                borderRadius: 'var(--radius)',
                textAlign: 'center',
                cursor: closed ? 'not-allowed' : 'pointer',
                opacity: closed ? 0.4 : 1,
                transition: 'all 0.2s',
              }}
            >
              <div
                className="num-label"
                style={{
                  color: active ? 'color-mix(in oklch, var(--cream) 70%, transparent)' : 'var(--ink-dim)',
                  fontSize: '0.6rem',
                }}
              >
                {d.label}
              </div>
              <div className="display" style={{ fontSize: '1.2rem', fontWeight: 400, marginTop: 2 }}>
                {d.date}
              </div>
            </button>
          );
        })}
      </div>

      <div className="num-label" style={{ marginBottom: '0.65rem' }}>TIME</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
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

function StepConfirm({ data, setData, svc, veh, subtotal, cardFee, total, useStripe }) {
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
          ['When', (() => {
            const day = UPCOMING_DAYS[data.day] || UPCOMING_DAYS[DEFAULT_DAY_INDEX];
            return `${day.label} ${day.month} ${day.date} · ${data.slot}`;
          })()],
          [
            data.serviceLocation === 'dropoff' ? 'Drop-off at' : 'Address',
            data.serviceLocation === 'dropoff'
              ? `Cali Auto Wash, ${CALI_SHOP.city}`
              : (data.address || '—'),
          ],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--ink-soft)' }}>{k}</span>
            <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
          </div>
        ))}

        {/* Subtotal + card fee breakdown — only shown for online (Stripe) bookings */}
        {useStripe && cardFee > 0 && (
          <div style={{ marginTop: '0.5rem', paddingTop: '0.65rem', borderTop: '1px solid var(--rule)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
              <span>Card processing fee (5%)</span>
              <span>${cardFee.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '0.65rem 0 0', marginTop: '0.5rem',
          borderTop: '1px solid var(--rule)',
          alignItems: 'baseline',
        }}>
          <span className="num-label">TOTAL</span>
          <span className="display" style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--terracotta-deep)' }}>
            <sup style={{ fontSize: '0.75rem', opacity: 0.7 }}>$</sup>{total.toFixed(2)}
          </span>
        </div>

        {useStripe && cardFee > 0 && (
          <p style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--ink-dim)', lineHeight: 1.5 }}>
            The 5% card processing fee covers what the bank charges to run the card.
            Pay cash or Venmo on-site to skip it — call {PHONE} to book.
          </p>
        )}
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

function AddressAutocomplete({ value = '', onChange, onPlace, verified = false }) {
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
        {verified && <span style={{ fontSize: '0.7rem', color: 'var(--sage)', fontWeight: 600 }}>✓ Verified</span>}
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
