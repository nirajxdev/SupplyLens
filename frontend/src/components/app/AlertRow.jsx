import StatusPill from './StatusPill';
import { X } from 'lucide-react';

const dotClass = { red: 'var(--red)', amber: 'var(--amber)', blue: 'var(--blue)', green: 'var(--green)' };

const AlertRow = ({ dot, message, subLabel, priority, date, onDismiss }) => {
  return (
    <div
      className="group"
      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--app-border)' }}
    >
      <span
        aria-hidden="true"
        style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: dotClass[dot] || dotClass.blue }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: 'var(--app-text)', lineHeight: 1.45 }}>{message}</p>
        {subLabel && <p style={{ fontSize: 12, color: 'var(--app-text-muted)', marginTop: 1 }}>{subLabel}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {priority && <StatusPill status={priority} />}
        {date && <span className="ent-mono" style={{ color: 'var(--app-text-muted)' }}>{date}</span>}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="ent-btn ent-btn-ghost ent-btn-sm"
            style={{ padding: '0 6px' }}
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertRow;
