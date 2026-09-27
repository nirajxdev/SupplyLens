import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const CHECKS = ['Live stock ledger', 'Supplier scorecards', 'Demand forecasting'];

const Hero = () => {
  return (
    <section style={{ paddingTop: 104, paddingBottom: 48, background: 'var(--bg)' }}>
      <div className="container-max" style={{ textAlign: 'center', maxWidth: 760 }}>
        <span className="ent-pill ent-pill-blue" style={{ marginBottom: 16 }}>
          <span className="dot" /> v2.0 — Ops Console is live
        </span>
        <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 52px)', fontWeight: 750, letterSpacing: '-1.5px', lineHeight: 1.1, color: 'var(--text)' }}>
          Supply chain operations,<br />in one dense workspace.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: 560, margin: '16px auto 0' }}>
          Inventory, suppliers, purchase orders and forecasts — with role-based access,
          audit-safe stock movements and alerts before stockouts.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
          <Link to="/signup" className="ent-btn ent-btn-primary" style={{ height: 40, padding: '0 20px', fontSize: 14, textDecoration: 'none' }}>
            Start for free <ArrowRight size={15} />
          </Link>
          <a href="#features" className="ent-btn ent-btn-secondary" style={{ height: 40, padding: '0 20px', fontSize: 14, textDecoration: 'none' }}>
            See how it works
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 18, flexWrap: 'wrap' }}>
          {CHECKS.map((c) => (
            <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} style={{ color: 'var(--green)' }} /> {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
