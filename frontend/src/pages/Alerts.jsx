import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AlertRow from '../components/app/AlertRow';
import { getAlerts, markAlertRead } from '../Instance/API';
import { toast } from 'sonner';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAlerts(false); // unread only — read alerts live under “All (unread)” for now
      
      const mappedAlerts = (res.data || []).map(a => {
          let dot = 'blue';
          let priority = a.priority?.toLowerCase() || 'medium';
          if (a.type === 'SUPPLIER_DELAY') dot = 'amber';
          if (a.type === 'LOW_STOCK') dot = 'red';
          if (a.type === 'REORDER_RECOMMENDED') dot = 'green';
          
          return {
              id: a._id,
              dot,
              message: a.message,
              subLabel: a.productId ? `${a.productId.name} (${a.productId.sku})` : '',
              priority,
              date: new Date(a.createdAt).toLocaleDateString()
          };
      });
      setAlerts(mappedAlerts);
    } catch (error) {
      setError(error.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
        await markAlertRead(id);
        setAlerts(p => p.filter(x => x.id !== id));
        toast.success('Alert marked as read');
    } catch (err) {
        toast.error(err.message || 'Failed to dismiss alert');
    }
  };

  const filtered = activeTab === 'all' ? alerts : alerts.filter(a => a.priority === activeTab);
  const counts = { all: alerts.length, high: alerts.filter(a => a.priority === 'high').length, medium: alerts.filter(a => a.priority === 'medium').length, low: alerts.filter(a => a.priority === 'low').length };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col gap-4 w-full max-w-[800px]">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-[8px]" style={{ background: 'var(--app-overlay)' }}></div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div className="p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="mb-2" style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 500, letterSpacing: '-1px' }}>Alerts</h1>
      <p className="mb-8" style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>Showing unread alerts. Dismiss an alert to mark it read.</p>

      {error && (
        <div className="mb-4 p-3 rounded-[8px] flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: '13px' }}>
          <span>{error}</span>
          <button onClick={fetchAlerts} className="px-3 py-1 rounded-[6px] text-[12px] border cursor-pointer" style={{ borderColor: 'var(--red)' }}>Retry</button>
        </div>
      )}

      <div className="flex gap-1 mb-6 relative" style={{ borderBottom: '1px solid var(--app-border)' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="relative px-4 py-2.5 cursor-pointer bg-transparent border-0"
            style={{ fontSize: '13px', fontWeight: 500, color: activeTab === tab.key ? 'var(--text)' : 'var(--app-text-muted)' }}>
            {tab.label}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-[4px]"
              style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', background: activeTab === tab.key ? 'var(--accent-glow)' : 'var(--app-overlay)', color: activeTab === tab.key ? 'var(--accent)' : 'var(--app-text-muted)' }}>
              {counts[tab.key]}
            </span>
            {activeTab === tab.key && (
              <motion.div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'var(--accent)' }}
                layoutId="tab-indicator" transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
            )}
          </button>
        ))}
      </div>

      <div className="rounded-[12px]" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? filtered.map((a, i) => (
            <AlertRow key={a.id} {...a} index={i} onDismiss={() => handleDismiss(a.id)} />
          )) : (
            <motion.div key="empty" className="py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ fontSize: '14px', color: 'var(--app-text-muted)' }}>{alerts.length === 0 ? 'All clear — no unread alerts.' : 'No alerts in this priority.'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Alerts;
