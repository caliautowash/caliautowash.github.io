/* Root App */

// GA4 custom events — booking-intent funnel
function useBookingAnalytics() {
  useEffect(() => {
    const ga = (...args) => { if (typeof window.gtag === 'function') window.gtag(...args); };

    // 1. Fires once when the booking section is 40%+ visible
    const bookEl = document.getElementById('book');
    let io;
    if (bookEl) {
      io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            ga('event', 'view_booking_section', { section: 'book' });
            io.disconnect();
          }
        });
      }, { threshold: 0.4 });
      io.observe(bookEl);
    }

    // 2. Fires on any click on an element whose text starts with "Book"
    const onClick = (e) => {
      const el = e.target.closest('a,button');
      if (!el) return;
      const txt = (el.textContent || '').trim();
      if (/^book\b/i.test(txt)) {
        ga('event', 'click_book_cta', {
          cta_text: txt.slice(0, 80),
          cta_href: el.getAttribute('href') || '',
        });
      }
    };
    document.addEventListener('click', onClick);

    return () => {
      io?.disconnect();
      document.removeEventListener('click', onClick);
    };
  }, []);
}

function App() {
  const [tweaks, setTweaks] = useState(() => ({ ...(window.TWEAKS || {}) }));
  useBookingAnalytics();

  useEffect(() => {
    const onTweak = (e) => setTweaks({ ...e.detail });
    window.addEventListener('tweaks-change', onTweak);
    return () => window.removeEventListener('tweaks-change', onTweak);
  }, []);

  return (
    <>
      <Header />
      <Hero variant={tweaks.heroVariant || 'editorial'} />
      <Services />
      <Process />
      <Gallery />
      <Booking />
      <FAQ />
      <Contact />
      <Footer />
      <TweaksPanel />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
