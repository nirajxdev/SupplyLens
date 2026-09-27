import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import StatusPill from '../components/app/StatusPill';
import DataTable from '../components/app/DataTable';
import DrawerPanel from '../components/app/DrawerPanel';
import Modal from '../components/shared/Modal';
import SkeletonLoader from '../components/shared/SkeletonLoader';
import RoleGuard from '../components/RoleGuard';
import { getOrders, updateOrderStatus } from '../Instance/API.js';
import { toast } from 'sonner';

const shortId = (id) => (id ? String(id).slice(-6).toUpperCase() : '—');

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOrder, setDrawerOrder] = useState(null);
  const [confirm, setConfirm] = useState({ order: null, status: null });
  const [updating, setUpdating] = useState(false);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      setOrders(res.data || res.purchaseOrders || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllOrders(); }, []);

  const requestStatus = (order, newStatus) => {
    if (newStatus === 'delivered') setConfirm({ order, status: newStatus });
    else executeStatusUpdate(order._id, newStatus);
  };

  const executeStatusUpdate = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      setConfirm({ order: null, status: null });
      fetchAllOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { key: 'id', label: 'Order', mono: true, render: (_, o) => <span className="ent-mono" style={{ color: 'var(--accent-text)', fontWeight: 700 }}>#{shortId(o._id)}</span> },
    { key: 'supplier', label: 'Supplier', render: (_, o) => <span style={{ fontWeight: 600 }}>{o.supplier?.name || 'Unknown'}</span> },
    { key: 'items', label: 'Items', numeric: true, render: (_, o) => `${o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0} lines` },
    { key: 'total', label: 'Total', numeric: true, render: (_, o) => <strong>${Number(o.totalAmount || 0).toFixed(2)}</strong> },
    { key: 'eta', label: 'Expected', render: (_, o) => <span style={{ color: 'var(--app-text-muted)' }}>{o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toLocaleDateString() : '—'}</span> },
    { key: 'status', label: 'Status', render: (_, o) => <StatusPill status={o.status} /> },
  ];

  const renderActions = (o) => (
    ['pending', 'shipped'].includes(o.status) ? (
      <select
        value=""
        aria-label={`Change status for order ${shortId(o._id)}`}
        onChange={(e) => e.target.value && requestStatus(o, e.target.value)}
        className="ent-select"
        style={{ height: 28, fontSize: 12, width: 'auto' }}
      >
        <option value="" disabled>Set status…</option>
        {o.status === 'pending' && <option value="shipped">Mark Shipped</option>}
        <option value="delivered">Mark Delivered</option>
        <option value="cancelled">Cancel Order</option>
      </select>
    ) : <span style={{ fontSize: 12, color: 'var(--app-text-faint)' }}>—</span>
  );

  return (
    <div className="ent-page">
      <div className="ent-page-header">
        <div>
          <div className="ent-page-title">Orders</div>
          <div className="ent-page-sub">{orders.length} purchase orders · click a row for line-item detail.</div>
        </div>
        <div className="ent-page-actions">
          <RoleGuard allowedRoles={['admin', 'manager']}>
            <Link to="/dashboard/orders/create" className="ent-btn ent-btn-primary ent-btn-sm"><Plus size={13} /> New Order</Link>
          </RoleGuard>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader rows={8} />
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          onRowClick={setDrawerOrder}
          renderActions={renderActions}
          minWidth={760}
          emptyTitle="No orders yet"
          emptySub="Create your first purchase order to replenish stock."
          emptyAction={
            <RoleGuard allowedRoles={['admin', 'manager']}>
              <Link to="/dashboard/orders/create" className="ent-btn ent-btn-primary ent-btn-sm"><Plus size={13} /> New Order</Link>
            </RoleGuard>
          }
        />
      )}

      <DrawerPanel isOpen={!!drawerOrder} onClose={() => setDrawerOrder(null)} title={drawerOrder ? `Order #${shortId(drawerOrder._id)}` : ''}>
        {drawerOrder && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Supplier', value: drawerOrder.supplier?.name || 'Unknown' },
                { label: 'Status', value: <StatusPill status={drawerOrder.status} /> },
                { label: 'Total', value: <strong>${Number(drawerOrder.totalAmount || 0).toFixed(2)}</strong> },
                { label: 'Expected', value: drawerOrder.expectedDeliveryDate ? new Date(drawerOrder.expectedDeliveryDate).toLocaleDateString() : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="ent-section-label" style={{ marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13 }}>{value}</div>
                </div>
              ))}
            </div>
            <div className="ent-section-label" style={{ marginBottom: 6 }}>Line Items</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {drawerOrder.items?.map((item, idx) => (
                <div key={idx} className="ent-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.product?.name || 'Product'}</div>
                    <div style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Qty {item.quantity} × ${Number(item.unitPrice || 0).toFixed(2)}</div>
                  </div>
                  <strong className="ent-mono">${(item.unitPrice * item.quantity).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </DrawerPanel>

      <Modal
        isOpen={!!confirm.order}
        onClose={() => setConfirm({ order: null, status: null })}
        title="Confirm delivery?"
        footer={
          <>
            <button onClick={() => setConfirm({ order: null, status: null })} className="ent-btn ent-btn-secondary">Back</button>
            <button
              onClick={() => executeStatusUpdate(confirm.order._id, 'delivered')}
              disabled={updating}
              className="ent-btn ent-btn-primary"
            >
              {updating ? 'Saving…' : 'Confirm Delivered'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: 13, color: 'var(--app-text-muted)', lineHeight: 1.5 }}>
          Receiving this order will add <strong style={{ color: 'var(--app-text)' }}>
            {confirm.order?.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0} units
          </strong> to inventory and update the supplier score.
        </p>
      </Modal>
    </div>
  );
};

export default Orders;
