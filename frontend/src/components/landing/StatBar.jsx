const stats = [
  { value: '500+', label: 'SMEs onboarded' },
  { value: '98%', label: 'Forecast accuracy' },
  { value: '3×', label: 'Faster reorder decisions' },
  { value: '<2 min', label: 'Median setup time' },
];

const StatBar = () => (
  <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
    <div className="container-max grid grid-cols-2 md:grid-cols-4 gap-6" style={{ paddingTop: 32, paddingBottom: 32 }}>
      {stats.map((s) => (
        <div key={s.label}>
          <div style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 750, letterSpacing: '-0.8px', color: 'var(--text)' }}>{s.value}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  </section>
);

export default StatBar;
