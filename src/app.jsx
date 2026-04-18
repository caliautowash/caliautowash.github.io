/* Root App */

function App() {
  const [tweaks, setTweaks] = useState(() => ({ ...(window.TWEAKS || {}) }));

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
