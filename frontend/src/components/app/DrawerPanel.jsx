import { useEffect } from 'react';
import { X } from 'lucide-react';

const DrawerPanel = ({ isOpen, onClose, title, children, width = 400 }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)' }}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Details'}
        style={{
          position: 'relative', width, maxWidth: '100%', height: '100%', overflowY: 'auto',
          background: 'var(--app-surface)', borderLeft: '1px solid var(--app-border)',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--app-border)', position: 'sticky', top: 0, background: 'var(--app-surface)', zIndex: 1 }}>
          {title && <h3 className="ent-modal-title">{title}</h3>}
          <button onClick={onClose} aria-label="Close panel" className="ent-btn ent-btn-ghost ent-btn-sm" style={{ padding: '0 6px' }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </aside>
    </div>
  );
};

export default DrawerPanel;
