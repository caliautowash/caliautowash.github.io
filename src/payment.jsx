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
 *   5. Stripe redirects back with ?payment_intent=pi_... — we read that and
 *      render the success state.
 */

function StepPayment({ data, setData, svc, veh, total, refCode, bookingDetails, onSuccess }) {
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

    (async () => {
      try {
        const res = await fetch(`${window.STRIPE_WORKER_URL}/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        setErrorMsg(err.message);
      }
    })();
  }, []);

  // 2. Mount the PaymentElement once Elements is ready.
  useEffect(() => {
    if (elements && mountRef.current && status === 'ready') {
      const paymentEl = elements.create('payment', {
        layout: { type: 'tabs', defaultCollapsed: false },
      });
      paymentEl.mount(mountRef.current);
      return () => paymentEl.unmount();
    }
  }, [elements, status]);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setStatus('processing');
    setErrorMsg('');
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}?booked=${encodeURIComponent(refCode)}`,
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
          <span style={{ fontWeight: 500 }}>${total}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-dim)', fontSize: '0.8rem' }}>
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
        {status === 'processing' ? 'Processing…' : `Pay $${total}`}
      </button>

      <p style={{ fontSize: '0.72rem', color: 'var(--ink-dim)', marginTop: '0.75rem', textAlign: 'center' }}>
        Secured by Stripe · By continuing you agree to our{' '}
        <a href="/terms.html" style={{ textDecoration: 'underline' }}>Terms</a> and{' '}
        <a href="/refunds.html" style={{ textDecoration: 'underline' }}>Refund Policy</a>.
      </p>
    </div>
  );
}

window.StepPayment = StepPayment;
