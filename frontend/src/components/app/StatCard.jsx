import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';

const formatValue = (value, { decimals = 0, prefix = '', suffix = '' } = {}) => {
  let num = value;
  if (typeof num === 'string') {
    const parsed = parseFloat(num.replace(/[^0-9.\-]/g, ''));
    num = Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof num !== 'number' || !Number.isFinite(num)) num = 0;
  const formatted = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toLocaleString();
  return `${prefix}${formatted}${suffix}`;
};

const StatCard = ({ label, value, suffix = '', prefix = '', decimals = 0, icon: Icon, link, trend }) => {
  const display = formatValue(value, { decimals, prefix, suffix });
  const content = (
    <div className="ent-kpi">
      <div className="ent-kpi-label">
        <span>{label}</span>
        {Icon && <Icon size={14} style={{ color: 'var(--app-text-faint)' }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <span className="ent-kpi-value">{display}</span>
        {typeof trend === 'number' && (
          <span className={`ent-kpi-delta ${trend >= 0 ? 'up' : 'down'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginBottom: 3 }}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
  if (link) return <Link to={link} style={{ textDecoration: 'none' }}>{content}</Link>;
  return content;
};

export default StatCard;
