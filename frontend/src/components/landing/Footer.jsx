import { Link } from 'react-router-dom';

const COLS = [
  { title: 'Product', links: ['Inventory', 'Suppliers', 'Orders', 'Forecasting'] },
  { title: 'Company', links: ['About', 'Pricing', 'Careers', 'Contact'] },
  { title: 'Resources', links: ['Documentation', 'API reference', 'Status', 'Changelog'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'DPA'] },
];

const Footer = () => (
  <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
    <div className="container-max" style={{ paddingTop: 40, paddingBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(4, 1fr)', gap: 24 }} className="footer-grid">
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent)', color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>S</span>
            <span style={{ fontSize: 15, fontWeight: 700 }}>SupplyLens</span>
          </span>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', maxWidth: 220, lineHeight: 1.6 }}>
            The ops console for modern supply chains. Built for teams that count every unit.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="ent-section-label" style={{ marginBottom: 10 }}>{c.title}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {c.links.map((l) => (
                <li key={l}>
                  <Link to="/" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32,
        paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap', gap: 8 }}>
        <span>© 2026 SupplyLens, Inc. All rights reserved.</span>
        <span className="ent-mono">SOC2-ready · RBAC · Audit-safe ledger</span>
      </div>
      <style>{`@media (max-width: 860px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  </footer>
);

export default Footer;
