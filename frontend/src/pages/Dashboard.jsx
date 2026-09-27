import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Users, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../redux/slices/dashboardSlice';
import StatCard from '../components/app/StatCard';

const supplierData = [
  { month: 'Jul', agritrade: 92, foodsupply: 80, primepack: 88 },
  { month: 'Aug', agritrade: 94, foodsupply: 83, primepack: 91 },
  { month: 'Sep', agritrade: 91, foodsupply: 78, primepack: 89 },
  { month: 'Oct', agritrade: 96, foodsupply: 85, primepack: 93 },
  { month: 'Nov', agritrade: 95, foodsupply: 82, primepack: 90 },
  { month: 'Dec', agritrade: 97, foodsupply: 86, primepack: 94 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-[8px]" style={{ background: 'var(--app-elevated)', border: '1px solid var(--app-border)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
      <p style={{ color: 'var(--app-text-muted)', marginBottom: '2px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats: dashboardData, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const stats = dashboardData?.stats || {};
  // Backend now returns numbers; keep backward-compat with legacy "$1,234.00" / "98.2%" strings.
  const inventoryValue = typeof stats.totalInventoryValue === 'number'
    ? stats.totalInventoryValue
    : (stats.totalInventoryValueFormatted ?? stats.totalInventoryValue ?? 0);
  const successRate = typeof stats.successRate === 'number'
    ? stats.successRate
    : (stats.successRateFormatted ?? stats.successRate ?? 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse" style={{ color: 'var(--app-text-muted)' }}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p style={{ color: 'var(--red)', fontSize: '14px' }}>Failed to load dashboard: {error}</p>
        <button onClick={() => dispatch(fetchDashboardStats())} className="px-4 py-2 rounded-[8px] text-[13px] border cursor-pointer" style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}>Retry</button>
      </div>
    );
  }

  return (
    <motion.div
      className="p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Stat Cards - Overview */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '16px' }}>Business Overview</h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        <StatCard label="Total Products" value={stats.totalProducts || 0} icon={Package} link="/dashboard/inventory" trend={12} />
        <StatCard label="Total Inventory Value" value={inventoryValue} prefix="$" decimals={2} icon={Package} link="/dashboard/inventory" trend={4} />
        <StatCard label="Overall Success Rate" value={successRate} suffix="%" decimals={1} icon={Users} link="/dashboard/suppliers" trend={2} />
      </motion.div>

      {/* Stat Cards - Actionable */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '16px' }}>Action Required</h2>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard label="Products Needing Reorder" value={stats.productsNeedingReorder || 0} accentBorder="var(--amber)" icon={Package} link="/dashboard/inventory" />
        <StatCard label="Low Stock Items" value={stats.lowStockCount || 0} accentBorder="var(--amber)" icon={AlertTriangle} link="/dashboard/inventory" />
        <StatCard label="Orders Awaiting Approval" value={stats.pendingReordersCount || 0} accentBorder="var(--blue)" icon={ShoppingCart} link="/dashboard/orders" />
        <StatCard label="Suppliers With Delays" value={stats.suppliersWithDelays || 0} accentBorder="var(--red)" icon={Users} link="/dashboard/suppliers" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {/* Supplier Performance — sample trend until supplier-history API lands */}
        <motion.div
          className="p-6 rounded-[16px]"
          style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
        >
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--app-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
            Supplier Reliability (On-Time Delivery Rate)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--app-text-muted)', marginBottom: '20px' }}>Sample trend — live per-supplier history coming soon.</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={supplierData}>
              <XAxis dataKey="month" tick={{ fill: 'var(--app-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fill: 'var(--app-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="agritrade" name="AgriTrade" stroke="var(--green)" strokeWidth={2} dot={{ r: 3, fill: 'var(--green)' }} />
              <Line type="monotone" dataKey="foodsupply" name="FoodSupply" stroke="var(--amber)" strokeWidth={2} dot={{ r: 3, fill: 'var(--amber)' }} />
              <Line type="monotone" dataKey="primepack" name="PrimePack" stroke="var(--blue)" strokeWidth={2} dot={{ r: 3, fill: 'var(--blue)' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
