import { motion, AnimatePresence } from 'framer-motion';

const statusConfig = {
  'in-stock':     { label: 'In Stock',     color: 'var(--green)' },
  'healthy':      { label: 'Healthy',      color: 'var(--green)' },
  'reorder-soon': { label: 'Reorder Soon', color: 'var(--amber)' },
  'low-stock':    { label: 'Low Stock',    color: 'var(--amber)' },
  'critical':     { label: 'Critical',     color: 'var(--red)' },
  'out-of-stock': { label: 'Out of Stock', color: 'var(--red)' },
  'pending':      { label: 'Pending',      color: 'var(--app-text-muted)' },
  'shipped':      { label: 'Shipped',      color: 'var(--blue)' },
  'delivered':    { label: 'Delivered',     color: 'var(--green)' },
  'cancelled':    { label: 'Cancelled',    color: 'var(--red)' },
  'high':         { label: 'HIGH',         color: 'var(--red)' },
  'medium':       { label: 'MEDIUM',       color: 'var(--amber)' },
  'low':          { label: 'LOW',          color: 'var(--blue)' },
};

const StatusPill = ({ status, label }) => {
  const key = String(status || 'pending').toLowerCase();
  const config = statusConfig[key] || statusConfig['pending'];
  const displayLabel = label || config.label;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={key + displayLabel}
        role="status"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[100px] whitespace-nowrap"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          color: config.color,
          background: 'color-mix(in srgb, currentColor 10%, transparent)',
          border: '1px solid color-mix(in srgb, currentColor 30%, transparent)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {displayLabel}
      </motion.span>
    </AnimatePresence>
  );
};

export default StatusPill;
