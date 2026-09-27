import { useState, useEffect } from 'react';
import AlertRow from '../components/app/AlertRow';
import SkeletonLoader from '../components/shared/SkeletonLoader';
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

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true); setError(null);
      const res = await getAlerts(false);
      const mapped = (res.data || []).map((a) => {
        let dot = 'blue';
        if (a.type === 'SUPPLIER_DELAY') dot = 'amber';
        if (a.type === 'LOW_STOCK') dot = 'red';
        if (a.type === 'REORDER_RECOMMENDED') dot = 'green';
        return {
          id: a._id,
          dot,
          message: a.message,
          subLabel: a.productId ? `${a.productId.name} (${a.productId.sku})` : '',
          priority: a.priority?.toLowerCase() || 'medium',
          date: new Date(a.createdAt).toLocaleDateString(),
        };
      });
      setAlerts(mapped);
    } catch (e) {
      setError(e.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await markAlertRead(id);
      setAlerts((p) => p.filter((x) => x.id !== id));
      toast.success('Alert marked as read');
    } catch (err) {
      toast.error(err.message || 'Failed to dismiss alert');
    }
  };

  const filtered = activeTab === 'all' ? alerts : alerts.filter((a) => a.priority === activeTab);
  const counts = {
    all: alerts.length,
    high: alerts.filter((a) => a.priority === 'high').length,
    medium: alerts.filter((a) => a.priority === 'medium').length,
    low: alerts.filter((a) => a.priority === 'low').length,
  };

  return (
    <div className="ent-page">
      <div className="ent-page-header">
        <div>
          <div className="ent-page-title">Alerts</div>
          <div className="ent-page-sub">Unread notifications · dismiss to mark as read.</div>
        </div>
      </div>

      {error && (
        <div className="ent-card ent-card-pad" style={{ marginBottom: 12, borderColor: 'var(--red-border)', background: 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--red)' }}>{error}</span>
          <button onClick={fetchAlerts} className="ent-btn ent-btn-secondary ent-btn-sm">Retry</button>
        </div>
      )}

      <div className="ent-tabs" role="tablist" aria-label="Alert priority filter">
        {tabs.map((tab) => (
          <button key={tab.key} role="tab" aria-selected={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
            {tab.label} <span className="ent-count">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonLoader rows={6} height={52} />
      ) : (
        <div className="ent-card" style={{ overflow: 'hidden' }}>
          {filtered.length > 0 ? (
            filtered.map((a) => <AlertRow key={a.id} {...a} onDismiss={() => handleDismiss(a.id)} />)
          ) : (
            <div className="ent-empty">
              <p className="ent-empty-title">{alerts.length === 0 ? 'All clear — no unread alerts.' : 'Nothing in this priority.'}</p>
              <p className="ent-empty-sub">{alerts.length === 0 ? 'Low-stock and delay notifications will appear here.' : 'Try another tab.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Alerts;
