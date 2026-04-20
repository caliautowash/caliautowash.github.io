/* Stripe Elements payment step (Tier 4)
 *
 * Rendered only when window.PAYMENT_FLOW === 'stripe' AND the Worker URL and
 * publishable key are configured. Falls back to the SMS flow otherwise.
 *
 * Flow:
 *   1. On mount, POST booking details to the Worker /create-payment-intent.
 *   2. Worker returns { clientSecret }.
 *   3. Render Stripe PaymentElement (card / Apple Pay / Google Pay).
 *   4. On submit, call stripe.confirmPayment({ elements, return_url }).
 *   5. Stripe redirects back with `?booked=CAW-XXXX&payment_intent=pi_...
 *      &payment_intent_client_secret=...&redirect_status=succeeded` — the
 *      Booking section detects that URL on load and jumps to a success view.
 */

// ---- helpers ---------------------------------------------------------------

// Read Stripe's redirect params from the current URL. After confirmPayment,
// Stripe appends `payment_intent`, `payment_intent_client_secret`, and
// `redirect_status` to the return_url. We tack on `booked=<refCode>` so we
// can also surface the booking ref in the success card.
function readStripeReturn() {
  if (typeof window === 'undefined') return null;
  const sp = new URLSearchParams(window.location.search);
  const piClientSecret = sp.get('payment_intent_client_secret');
  if (!piClientSecret) return null;
  return {
    refCode: sp.get('booked') || '',
    paymentIntentId: sp.get('payment_intent') || '',
    clientSecret: piClientSecret,
    redirectStatus: sp.get('redirect_status') || '',
  };
}

// Strip Stripe's redirect params from the URL bar without reloading — keeps
// the address bar tidy after we've consumed them.
function clearStripeReturnFromUrl() {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;
  const url = new URL(window.location.href);
  ['payment_intent', 'payment_intent_client_secret', 'redirect_status', 'booked'].forEach((k) =>
    url.searchParams.delete(k),
  );
  window.history.replaceState({}, document.title, url.toString());
}

// ---- payment step ----------------------------------------------------------

function StepPayment({ data, setData, svc, veh, subtotal, cardFee, total, refCode, bookingDetails, onSuccess }) {
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [status, setStatus] = useState('loading'); // loading | ready | processing | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const mountRef = useRef(null);

  // 1. Initialize Stripe + fetch PaymentIntent client secret.
  useEffect(() => {
    if (!window.STRIPE_PUBLISHABLE_KEY || !window.STRIPE_WORKER_URL) {
      setStatus('error');
      setErrorMsg('Payments not configured — contact the site owner.');
      return;
    }
    const stripeJs = window.Stripe(window.STRIPE_PUBLISHABLE_KEY);
    setStripe(stripeJs);

    // 8 second timeout — if the Worker doesn't respond by then, surface the
    // error rather than leaving the user staring at an indefinite spinner.
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 8000);

    (async () => {
      try {
        const res = await fetch(`${window.STRIPE_WORKER_URL}/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            amount: total,
            ref: refCode,
            service: bookingDetails.service,
            vehicle: bookingDetails.vehicle,
            when: bookingDetails.when,
            where: bookingDetails.where,
            name: bookingDetails.name,
            phone: data.phone || '',
          }),
        });
        const body = await res.json();
        if (!res.ok || !body.clientSecret) {
          throw new Error(body.error || 'Could not start checkout.');
        }
        setClientSecret(body.clientSecret);
        const els = stripeJs.elements({
          clientSecret: body.clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#a14a2a',
              colorBackground: '#faf5ec',
              colorText: '#2a211a',
              fontFamily: 'Geist, system-ui, sans-serif',
              borderRadius: '4px',
            },
          },
        });
        setElements(els);
        setStatus('ready');
      } catch (err) {
        setStatus('error');
        setErrorMsg(
          err.name === 'AbortError'
            ? 'Checkout took too long to start. Refresh and try again, or call us.'
            : err.message,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    return () => {
      clearTimeout(timeoutId);
      ctrl.abort();
    };
  }, []);

  // 2. Mount the PaymentElement once Elements is ready. Keep it mounted across
  // status transitions — Apple Pay's native sheet is launched via the mounted
  // iframe, so unmounting on `processing` (as a status-in-deps version did)
  // causes confirmPayment to hang indefinitely when the user picks a wallet.
  useEffect(() => {
    if (!elements || !mountRef.current) return;
    const paymentEl = elements.create('payment', {
      layout: { type: 'tabs', defaultCollapsed: false },
    });
    paymentEl.mount(mountRef.current);
    return () => paymentEl.unmount();
  }, [elements]);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setStatus('processing');
    setErrorMsg('');
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}?booked=${encodeURIComponent(refCode)}#book`,
      },
    });
    if (error) {
      setStatus('ready');
      setErrorMsg(error.message || 'Payment failed.');
    }
    // If no error, Stripe redirects the page — no further code runs here.
  };

  if (status === 'error') {
    return (
      <div>
        <h3 className="display" style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '0.5rem' }}>
          <span style={{ fontStyle: 'italic' }}>Hmm —</span> couldn&rsquo;t load checkout.
        </h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.92rem', marginBottom: '1rem' }}>{errorMsg}</p>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
          Call us instead:{' '}
          <a href={`tel:${PHONE_TEL}`} style={{ color: 'var(--terracotta-deep)', fontWeight: 500 }}>
            {PHONE}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="display" style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '1rem' }}>
        <span style={{ fontStyle: 'italic' }}>Last step —</span> secure payment.
      </h3>

      <div style={{
        background: 'var(--cream-2)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--radius)',
        padding: '0.9rem 1rem',
        marginBottom: '1.25rem',
        fontSize: '0.88rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: 'var(--ink-soft)' }}>{bookingDetails.service}</span>
          <span style={{ fontWeight: 500 }}>${(subtotal ?? total).toFixed(2)}</span>
        </div>
        {cardFee > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--ink-soft)' }}>
            <span>Card processing fee (5%)</span>
            <span>${cardFee.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-dim)', fontSize: '0.8rem', paddingTop: cardFee > 0 ? 4 : 0, borderTop: cardFee > 0 ? '1px dashed var(--rule)' : 'none', marginTop: cardFee > 0 ? 4 : 0 }}>
          <span>{bookingDetails.vehicle} · {bookingDetails.when}</span>
          <span>#{refCode}</span>
        </div>
      </div>

      {status === 'loading' && (
        <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--ink-dim)', fontSize: '0.9rem' }}>
          Loading secure checkout…
        </div>
      )}

      <div ref={mountRef} style={{ marginBottom: '1rem' }} />

      {errorMsg && status === 'ready' && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'color-mix(in oklch, var(--terracotta) 10%, var(--cream))',
          color: 'var(--terracotta-deep)',
          borderRadius: 'var(--radius)',
          fontSize: '0.88rem',
          marginBottom: '1rem',
        }}>
          {errorMsg}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={status !== 'ready'}
        className="btn btn-accent"
        style={{
          width: '100%',
          padding: '1rem',
          fontSize: '0.95rem',
          justifyContent: 'center',
          opacity: status === 'ready' ? 1 : 0.6,
          cursor: status === 'ready' ? 'pointer' : 'not-allowed',
        }}
      >
        <span className="shine" aria-hidden />
        {status === 'processing' ? 'Processing…' : `Pay $${total.toFixed(2)}`}
      </button>

      <p style={{ fontSize: '0.72rem', color: 'var(--ink-dim)', marginTop: '0.75rem', textAlign: 'center' }}>
        Secured by Stripe · By continuing you agree to our{' '}
        <a href="/terms.html" style={{ textDecoration: 'underline' }}>Terms</a> and{' '}
        <a href="/refunds.html" style={{ textDecoration: 'underline' }}>Refund Policy</a>.
      </p>
    </div>
  );
}

// ---- post-redirect success/failure card ------------------------------------
//
// Rendered by Booking when it detects a Stripe return URL on mount. We look
// up the PaymentIntent via Stripe.js to confirm status (don't trust the URL
// param alone — it's user-mutable). Three terminal states from
// retrievePaymentIntent: succeeded, processing, requires_payment_method.

function PaymentReturn({ refCode, clientSecret, redirectStatus, onAcknowledge }) {
  const [status, setStatus] = useState('checking'); // checking | succeeded | failed
  const [paymentIntent, setPaymentIntent] = useState(null);

  useEffect(() => {
    if (!window.STRIPE_PUBLISHABLE_KEY) {
      setStatus('failed');
      return;
    }
    const stripeJs = window.Stripe(window.STRIPE_PUBLISHABLE_KEY);
    stripeJs.retrievePaymentIntent(clientSecret).then(({ paymentIntent: pi, error }) => {
      if (error || !pi) {
        setStatus('failed');
        return;
      }
      setPaymentIntent(pi);
      if (pi.status === 'succeeded') {
        setStatus('succeeded');
        // GA parity: SMS flow fires `booking_submitted`, so do the same here
        // with `payment_method: 'stripe'` so we can split the funnel later.
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'booking_submitted', {
            value: (pi.amount_received || pi.amount) / 100,
            currency: pi.currency?.toUpperCase() || 'USD',
            ref_code: refCode,
            payment_method: 'stripe',
            stripe_payment_intent: pi.id,
          });
        }
      } else if (pi.status === 'processing') {
        // Some payment methods (rare for cards but possible for delayed flows)
        // sit in `processing` for a moment. Treat as success — the webhook
        // will eventually fire and we don't want to scare the user.
        setStatus('succeeded');
      } else {
        setStatus('failed');
      }
    });
  }, [clientSecret]);

  if (status === 'checking') {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--ink-dim)' }}>
        Confirming payment…
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
        <h3 className="display" style={{ fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.5rem' }}>
          <span style={{ fontStyle: 'italic' }}>Hmm —</span> payment didn&rsquo;t go through.
        </h3>
        <p style={{ color: 'var(--ink-soft)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
          No charge was made. Try again or give us a call.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button onClick={onAcknowledge} className="btn btn-primary" style={{ padding: '0.85rem 1.5rem' }}>
            Try again
          </button>
          <a href={`tel:${PHONE_TEL}`} className="btn btn-ghost" style={{ padding: '0.85rem 1.5rem' }}>
            <Icon.phone /> {PHONE}
          </a>
        </div>
      </div>
    );
  }

  // succeeded
  const total = paymentIntent ? (paymentIntent.amount_received || paymentIntent.amount) / 100 : 0;
  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <div
        aria-hidden
        style={{
          width: 56,
          height: 56,
          margin: '0 auto 1.25rem',
          borderRadius: '50%',
          background: 'color-mix(in oklch, var(--sage) 30%, var(--cream))',
          color: 'var(--sage)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}
      >
        ✓
      </div>
      <h3 className="display" style={{ fontSize: '1.6rem', fontWeight: 400, marginBottom: '0.5rem' }}>
        <span style={{ fontStyle: 'italic' }}>You&rsquo;re booked.</span>
      </h3>
      <p style={{ color: 'var(--ink-soft)', marginBottom: '1.5rem', fontSize: '0.95rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>
        Payment received{total ? ` ($${total.toFixed(2)})` : ''}. We&rsquo;ll text you a confirmation
        within the hour at the number you provided.
      </p>
      {refCode && (
        <div
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: 'var(--cream-2)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--radius)',
            marginBottom: '1.5rem',
          }}
        >
          <span className="num-label" style={{ marginRight: '0.5rem' }}>BOOKING ID</span>
          <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{refCode}</span>
        </div>
      )}
      <div>
        <button onClick={onAcknowledge} className="btn btn-ghost" style={{ padding: '0.75rem 1.5rem' }}>
          Done
        </button>
      </div>
    </div>
  );
}

window.StepPayment = StepPayment;
window.PaymentReturn = PaymentReturn;
window.readStripeReturn = readStripeReturn;
window.clearStripeReturnFromUrl = clearStripeReturnFromUrl;
