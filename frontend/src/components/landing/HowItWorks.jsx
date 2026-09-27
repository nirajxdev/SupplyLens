const steps = [
  { num: '01', title: 'Create workspace', desc: 'Sign up in seconds. Your org is isolated from day one.' },
  { num: '02', title: 'Load catalog', desc: 'Add SKUs, opening stock and suppliers — or quick-add vendors inline.' },
  { num: '03', title: 'Run operations', desc: 'Sell, adjust, order and receive. The ledger stays consistent.' },
  { num: '04', title: 'Forecast & reorder', desc: 'Act on predictions and alerts before stockouts happen.' },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container-max" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <p className="ent-section-label" style={{ marginBottom: 8, color: 'var(--accent-text)' }}>Deployment</p>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 750, letterSpacing: '-0.6px' }}>
          Live in an afternoon, not a quarter.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginTop: 24 }}>
          {steps.map((s) => (
            <div key={s.num} className="ent-card ent-card-pad">
              <div className="ent-mono" style={{ fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }}>{s.num}</div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
