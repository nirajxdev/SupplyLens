const Footer = () => (
  <footer style={{ borderTop: '1px solid #f0f0f0', background: '#f5f5f5' }}>
    <div className="mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4"
      style={{ maxWidth: '1200px' }}>
      <span style={{ fontSize: '15px', fontWeight: 600, color: '#111', letterSpacing: '-0.3px' }}>SupplyLens</span>
      <div className="flex flex-wrap gap-6">
        {['Features', 'Docs', 'GitHub', 'Privacy', 'Terms', 'Status'].map(l => (
          <a key={l} href="#" style={{ fontSize: '13px', color: '#888' }}
            className="hover:text-[#111] transition-colors">{l}</a>
        ))}
      </div>
      <span style={{ fontSize: '12px', color: '#bbb' }}>© 2026 SupplyLens</span>
    </div>
  </footer>
);

export default Footer;
