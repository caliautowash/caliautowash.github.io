/* Tweaks panel */

function TweaksPanel() {
  const [enabled, setEnabled] = useState(false);
  const [tweaks, setTweaks] = useState(() => ({ ...(window.TWEAKS || {}) }));

  // Apply to DOM
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-palette', tweaks.palette || 'golden');
    html.setAttribute('data-type', tweaks.typePair || 'fraunces-geist');
  }, [tweaks.palette, tweaks.typePair]);

  useEffect(() => {
    const handler = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setEnabled(true);
      if (d.type === '__deactivate_edit_mode') setEnabled(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const update = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
    // notify app to re-render if needed
    window.dispatchEvent(new CustomEvent('tweaks-change', { detail: next }));
  };

  if (!enabled) return null;

  return (
    <div style={{
      position: 'fixed', right: 20, bottom: 20, zIndex: 200,
      width: 300,
      background: 'var(--cream)',
      color: 'var(--ink)',
      border: '1px solid var(--ink)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      boxShadow: '0 30px 60px -20px rgba(0,0,0,0.35)',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="display" style={{ fontSize: '1.1rem', fontWeight: 500 }}>Tweaks</div>
        <span className="num-label">LIVE</span>
      </div>

      <TweakRow label="Palette">
        <TweakOptions value={tweaks.palette} onChange={v => update('palette', v)}
          options={[
            { id: 'golden', label: 'Golden' },
            { id: 'coastal', label: 'Coastal' },
            { id: 'desert', label: 'Desert' },
            { id: 'midnight', label: 'Midnight' },
          ]} />
      </TweakRow>

      <TweakRow label="Hero variant">
        <TweakOptions value={tweaks.heroVariant} onChange={v => update('heroVariant', v)}
          options={[
            { id: 'editorial', label: 'Editorial' },
            { id: 'magazine', label: 'Magazine' },
            { id: 'wide', label: 'Wide' },
          ]} />
      </TweakRow>

      <TweakRow label="Typography">
        <TweakOptions value={tweaks.typePair} onChange={v => update('typePair', v)}
          options={[
            { id: 'fraunces-geist', label: 'Serif + Sans' },
            { id: 'serif-mono', label: 'Serif + Mono' },
            { id: 'geist-only', label: 'Sans only' },
          ]} />
      </TweakRow>
    </div>
  );
}

function TweakRow({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div className="num-label" style={{ marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function TweakOptions({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {options.map(o => {
        const active = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)}
            style={{
              padding: '0.4rem 0.7rem',
              fontSize: '0.75rem',
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--cream)' : 'var(--ink)',
              border: '1px solid ' + (active ? 'var(--ink)' : 'var(--rule)'),
              borderRadius: 4,
              cursor: 'pointer',
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { TweaksPanel });
