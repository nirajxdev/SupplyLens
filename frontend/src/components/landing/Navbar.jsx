import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LINKS = [
  { label: 'Product', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Compare', href: '#compare' },
  { label: 'Pricing', href: '#pricing' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.94)' : '#fff',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="container-max" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>S</span>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px', color: 'var(--text)' }}>SupplyLens</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/login" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
            Log in
          </Link>
          <Link to="/signup" className="ent-btn ent-btn-primary ent-btn-sm" style={{ textDecoration: 'none' }}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
