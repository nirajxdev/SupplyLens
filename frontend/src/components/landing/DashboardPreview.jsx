const stats = [
  { label: 'Total Products', value: '284' },
  { label: 'Active Suppliers', value: '18' },
  { label: 'Low Stock', value: '7', tone: 'amber' },
  { label: 'Pending Orders', value: '3' },
];

const rows = [
  { name: 'Basmati Rice 25kg', qty: '142 units', status: 'In Stock', tone: 'ent-pill-green' },
  { name: 'Sunflower Oil 15L', qty: '18 units', status: 'Reorder Soon', tone: 'ent-pill-amber' },
  { name: 'Wheat Flour 50kg', qty: '4 units', status: 'Critical', tone: 'ent-pill-red' },
];

const DashboardPreview = () => {
  return (
    <div className="ent-card" style={{ overflow: 'hidden', maxWidth: 960, margin: '0 auto', boxShadow: '0 12px 40px rgba(15,23,42,0.12)' }}>
      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ display: 'flex', gap: 5 }}>
          <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#f87171', display: 'block' }} />
          <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#fbbf24', display: 'block' }} />
          <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#34d399', display: 'block' }} />
        </span>
        <span className="ent-mono" style={{ color: 'var(--text-tertiary)', background: '#fff', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 12px' }}>
          app.supplylens.io/dashboard
        </span>
        <span className="ent-pill ent-pill-blue" style={{ marginLeft: 'auto' }}><span className="dot" />Live</span>
      </div>

      <div style={{ display: 'flex', minHeight: 300 }}>
        {/* Mini sidebar */}
        <div className="hidden sm:block" style={{ width: 150, flexShrink: 0, borderRight: '1px solid var(--border)', padding: 10, background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px 12px' }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, background: 'var(--accent)', color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>S</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>SupplyLens</span>
          </div>
          {['Dashboard', 'Inventory', 'Orders', 'Alerts', 'Suppliers', 'Forecast'].map((l, i) => (
            <div key={l} style={{ fontSize: 12, fontWeight: i === 0 ? 650 : 500, padding: '6px 8px', borderRadius: 5,
              background: i === 0 ? 'var(--accent-light)' : 'transparent', color: i === 0 ? 'var(--accent-text)' : 'var(--text-secondary)' }}>
              {l}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 16, background: 'var(--bg-secondary)', minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
                  color: s.tone === 'amber' ? 'var(--amber)' : 'var(--text-tertiary)' }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, padding: '7px 12px',
              borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
              textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              <span>Product</span><span>Stock</span><span>Status</span>
            </div>
            {rows.map((r) => (
              <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, padding: '8px 12px',
                borderBottom: '1px solid var(--border-light)', alignItems: 'center', fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                <span className="ent-mono" style={{ color: 'var(--text-secondary)' }}>{r.qty}</span>
                <span className={`ent-pill ${r.tone}`}><span className="dot" />{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
