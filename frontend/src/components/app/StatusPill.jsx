const pillClass = {
  'in-stock': 'ent-pill-green',
  'healthy': 'ent-pill-green',
  'delivered': 'ent-pill-green',
  'low': 'ent-pill-green',
  'reorder-soon': 'ent-pill-amber',
  'low-stock': 'ent-pill-amber',
  'medium': 'ent-pill-amber',
  'critical': 'ent-pill-red',
  'out-of-stock': 'ent-pill-red',
  'cancelled': 'ent-pill-red',
  'high': 'ent-pill-red',
  'shipped': 'ent-pill-blue',
  'pending': 'ent-pill-slate',
};

const pillLabel = {
  'in-stock': 'In Stock',
  'healthy': 'Healthy',
  'reorder-soon': 'Reorder Soon',
  'low-stock': 'Low Stock',
  'critical': 'Critical',
  'out-of-stock': 'Out of Stock',
  'pending': 'Pending',
  'shipped': 'Shipped',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled',
  'high': 'High',
  'medium': 'Medium',
  'low': 'Low',
};

const StatusPill = ({ status, label }) => {
  const key = String(status || 'pending').toLowerCase();
  return (
    <span role="status" className={`ent-pill ${pillClass[key] || 'ent-pill-slate'}`}>
      <span className="dot" aria-hidden="true" />
      {label || pillLabel[key] || status}
    </span>
  );
};

export default StatusPill;
