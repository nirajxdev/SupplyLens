import { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Users, AlertTriangle, ShoppingCart, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../redux/slices/dashboardSlice';
import StatCard from '../components/app/StatCard';
import ChartTooltip from '../components/app/ChartTooltip';
import SkeletonLoader from '../components/shared/SkeletonLoader';
import { Link } from 'react-router-dom';

const supplierData = [
  { month: 'Jul', agritrade: 92, foodsupply: 80, primepack: 88 },
  { month: 'Aug', agritrade: 94, foodsupply: 83, primepack: 91 },
  { month: 'Sep', agritrade: 91, foodsupply: 78, primepack: 89 },
  { month: 'Oct', agritrade: 96, foodsupply: 85, primepack: 93 },
  { month: 'Nov', agritrade: 95, foodsupply: 82, primepack: 90 },
  { month: 'Dec', agritrade: 97, foodsupply: 86, primepack: 94 },
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats: dashboardData, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const stats = dashboardData?.stats || {};
  const alerts = dashboardData?.alerts || [];
  // Backend returns numbers; keep backward-compat with legacy "$1,234.00" / "98.2%" strings.
  const inventoryValue = typeof stats.totalInventoryValue === 'number'
    ? stats.totalInventoryValue
    : (stats.totalInventoryValueFormatted ?? stats.totalInventoryValue ?? 0);
  const successRate = typeof stats.successRate === 'number'
    ? stats.successRate
    : (stats.successRateFormatted ?? stats.successRate ?? 0);

  if (loading) {
    return (
      <div className="ent-page">
        <div className="ent-page-header">
          <div><div className="ent-page-title">Dashboard</div><div className="ent-page-sub">Loading workspace…</div></div>
        </div>
        <SkeletonLoader rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ent-page">
        <div className="ent-card"><div className="ent-empty">
          <p className="ent-empty-title" style={{ color: 'var(--red)' }}>Failed to load dashboard</p>
          <p className="ent-empty-sub">{error}</p>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => dispatch(fetchDashboardStats())} className="ent-btn ent-btn-secondary ent-btn-sm">Retry</button>
          </div>
        </div></div>
      </div>
    );
  }

  return (
    <div className="ent-page">
      <div className="ent-page-header">
        <div>
          <div className="ent-page-title">Dashboard</div>
          <div className="ent-page-sub">Operational snapshot across inventory, orders and suppliers.</div>
        </div>
        <div className="ent-page-actions">
          <Link to="/dashboard/inventory/add" className="ent-btn ent-btn-secondary ent-btn-sm">Add Product</Link>
          <Link to="/dashboard/orders/create" className="ent-btn ent-btn-primary ent-btn-sm">New Order</Link>
        </div>
      </div>

      <div className="ent-section-label" style={{ marginBottom: 8 }}>Business Overview</div>
      <div className="ent-kpi-grid" style={{ marginBottom: 16 }}>
        <StatCard label="Total Products" value={stats.totalProducts || 0} icon={Package} link="/dashboard/inventory" trend={12} />
        <StatCard label="Inventory Value" value={inventoryValue} prefix="$" decimals={2} icon={Package} link="/dashboard/inventory" trend={4} />
        <StatCard label="Success Rate" value={successRate} suffix="%" decimals={1} icon={Users} link="/dashboard/suppliers" trend={2} />
        <StatCard label="Pending Orders" value={stats.pendingReordersCount || 0} icon={ShoppingCart} link="/dashboard/orders" />
      </div>

      <div className="ent-section-label" style={{ marginBottom: 8 }}>Action Required</div>
      <div className="ent-kpi-grid" style={{ marginBottom: 16 }}>
        <StatCard label="Needs Reorder" value={stats.productsNeedingReorder || 0} icon={Package} link="/dashboard/inventory" />
        <StatCard label="Low Stock" value={stats.lowStockCount || 0} icon={AlertTriangle} link="/dashboard/inventory" />
        <StatCard label="Supplier Delays" value={stats.suppliersWithDelays || 0} icon={Users} link="/dashboard/suppliers" />
        <StatCard label="Open Alerts" value={alerts.length || 0} icon={AlertTriangle} link="/dashboard/alerts" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }} className="dash-split">
        <div className="ent-card ent-card-pad">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
            <span className="ent-card-title">Supplier Reliability</span>
            <span style={{ fontSize: 11.5, color: 'var(--app-text-faint)' }}>on-time % · sample trend</span>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={supplierData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <XAxis dataKey="month" tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="agritrade" name="AgriTrade" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="foodsupply" name="FoodSupply" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="primepack" name="PrimePack" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ent-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--app-border)' }}>
            <span className="ent-card-title">Priority Alerts</span>
            <Link to="/dashboard/alerts" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-text)', display: 'inline-flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {alerts.length === 0 ? (
            <div className="ent-empty">
              <p className="ent-empty-title">All clear</p>
              <p className="ent-empty-sub">No priority alerts right now.</p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {alerts.slice(0, 5).map((a, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '9px 14px', borderBottom: i < Math.min(alerts.length, 5) - 1 ? '1px solid var(--app-border)' : 'none' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                    background: a.dot === 'red' ? 'var(--red)' : 'var(--amber)' }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--app-text)' }}>{a.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--app-text-muted)' }} className="truncate">{a.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <style>{`@media (min-width: 1100px) { .dash-split { grid-template-columns: 1.6fr 1fr !important; } }`}</style>
    </div>
  );
};

export default Dashboard;
