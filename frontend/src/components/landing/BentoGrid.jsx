import { Package, Users, Zap, TrendingUp } from 'lucide-react';

const CARDS = [
  {
    icon: Package, tag: 'Inventory',
    title: 'Real-time stock ledger',
    desc: 'Every receipt, sale and correction is an atomic movement — no oversells, full history per SKU.',
    points: ['Live quantities + reorder status', 'One-click sell & adjust flows', 'Safety-stock aware thresholds'],
  },
  {
    icon: Users, tag: 'Suppliers',
    title: 'Vendor scorecards',
    desc: 'Reliability scores computed from actual delivery performance, not gut feel.',
    points: ['On-time % per supplier', 'Average lead-time tracking', 'Delay alerts on overdue POs'],
  },
  {
    icon: Zap, tag: 'Automation',
    title: 'Reorder intelligence',
    desc: 'Reorder points derived from trailing demand plus safety buffers.',
    points: ['Auto low-stock notifications', 'Deduplicated unread alerts', 'One-click restock orders'],
  },
  {
    icon: TrendingUp, tag: 'Forecasting',
    title: 'Demand forecasting',
    desc: 'Moving-average and exponential-smoothing models with confidence scoring.',
    points: ['Weekly demand per product', 'Coverage-in-weeks math', 'Low-data warnings'],
  },
];

const BentoGrid = () => {
  return (
    <section id="features" style={{ paddingTop: 72, paddingBottom: 72 }}>
      <div className="container-max">
        <p className="ent-section-label" style={{ marginBottom: 8, color: 'var(--accent-text)' }}>Product</p>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 750, letterSpacing: '-0.8px', lineHeight: 1.15, maxWidth: 560 }}>
          Everything ops needs. Nothing it doesn't.
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 8, maxWidth: 560 }}>
          Four tightly-integrated modules sharing one ledger, one permission model and one alert stream.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: 28 }}>
          {CARDS.map((c) => (
            <div key={c.title} className="ent-card ent-card-pad" style={{ padding: 20 }}>
              <span style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--accent-light)',
                border: '1px solid var(--accent-subtle)', display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--accent)', marginBottom: 12 }}>
                <c.icon size={15} />
              </span>
              <p className="ent-section-label">{c.tag}</p>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.2px', marginTop: 4 }}>{c.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.55 }}>{c.desc}</p>
              <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {c.points.map((p) => (
                  <li key={p} style={{ fontSize: 13, color: 'var(--text)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 800 }}>✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
