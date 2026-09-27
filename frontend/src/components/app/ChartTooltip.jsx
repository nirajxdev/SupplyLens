const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-[8px]" style={{ background: 'var(--app-elevated)', border: '1px solid var(--app-border)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
      <p style={{ color: 'var(--app-text-muted)', marginBottom: '2px' }}>{label}</p>
      {payload.filter(p => p.value != null).map((p, i) => (
        <p key={i} style={{ color: p.color || p.stroke || p.payload?.stroke }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default ChartTooltip;
