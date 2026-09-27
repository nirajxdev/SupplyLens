import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTABand = () => (
  <section id="pricing" style={{ paddingBottom: 72 }}>
    <div className="container-max">
      <div style={{ background: '#0b1e4b', borderRadius: 12, padding: '48px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(59,130,246,0.18)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: '8%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <p className="ent-section-label" style={{ color: '#93c5fd', marginBottom: 10 }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 750, letterSpacing: '-0.6px', color: '#fff', maxWidth: 520, margin: '0 auto' }}>
            Start free. Scale when stock does.
          </h2>
          <p style={{ fontSize: 14, color: '#bfdbfe', marginTop: 8 }}>
            Free tier for small catalogs · No credit card · Cancel anytime
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
            <Link to="/signup" className="ent-btn" style={{ height: 40, padding: '0 22px', fontSize: 14, background: '#fff', color: '#0b1e4b', textDecoration: 'none', fontWeight: 650 }}>
              Start for free <ArrowRight size={15} />
            </Link>
            <Link to="/login" className="ent-btn" style={{ height: 40, padding: '0 22px', fontSize: 14, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none' }}>
              Talk to sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTABand;
