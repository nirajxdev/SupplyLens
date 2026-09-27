import { Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Package, Users, TrendingUp, Bell } from 'lucide-react';

const POINTS = [
  { icon: Package, title: 'Live inventory control', desc: 'SKUs, stock levels and corrections in one ledger.' },
  { icon: Users, title: 'Supplier scorecards', desc: 'On-time delivery and reliability per vendor.' },
  { icon: TrendingUp, title: 'Demand forecasting', desc: 'Weekly predictions with confidence scoring.' },
  { icon: Bell, title: 'Proactive alerts', desc: 'Low-stock and delay warnings before stockouts.' },
];

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-secondary)', display: 'flex' }}>
      <Toaster position="top-right" duration={3000} />

      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between" style={{ width: 400, flexShrink: 0, background: '#0b1e4b', color: '#fff', padding: '32px 30px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#fff' }}>
          <span style={{ width: 26, height: 26, borderRadius: 6, background: '#fff', color: '#0b1e4b',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>S</span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>SupplyLens</span>
        </Link>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.3, marginBottom: 8 }}>
            The ops console for modern supply chains.
          </h2>
          <p style={{ fontSize: 13, color: '#bfdbfe', marginBottom: 20 }}>Inventory, suppliers, orders and forecasts — one dense, fast workspace.</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {POINTS.map((p) => (
              <li key={p.title} style={{ display: 'flex', gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.10)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <p.icon size={14} />
                </span>
                <span>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 650 }}>{p.title}</span>
                  <span style={{ display: 'block', fontSize: 12, color: '#bfdbfe' }}>{p.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p style={{ fontSize: 11.5, color: '#93c5fd' }}>RBAC-enforced · org-scoped data · audit-safe stock ledger</p>
      </aside>

      {/* Form column */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="lg:hidden" style={{ marginBottom: 20 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text)' }}>
              <span style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--accent)', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>S</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>SupplyLens</span>
            </Link>
          </div>
          {(title || subtitle) && (
            <div style={{ marginBottom: 16 }}>
              {title && <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>{title}</h1>}
              {subtitle && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
