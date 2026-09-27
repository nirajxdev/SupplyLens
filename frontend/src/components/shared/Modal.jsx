import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer = null, wide = false }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('input, select, button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="ent-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        className="ent-modal"
        style={wide ? { maxWidth: 560 } : undefined}
      >
        <div className="ent-modal-head">
          {title && <h3 className="ent-modal-title">{title}</h3>}
          <button onClick={onClose} aria-label="Close dialog" className="ent-btn ent-btn-ghost ent-btn-sm" style={{ padding: '0 6px' }}>
            <X size={14} />
          </button>
        </div>
        <div className="ent-modal-body">{children}</div>
        {footer && <div className="ent-modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
