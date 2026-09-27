import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, removeProduct } from '../redux/slices/productSlice';
import StatusPill from '../components/app/StatusPill';
import DataTable from '../components/app/DataTable';
import Modal from '../components/shared/Modal';
import SkeletonLoader from '../components/shared/SkeletonLoader';
import { stockSell, stockAdjust } from '../Instance/API';
import RoleGuard from '../components/RoleGuard';

const calcStatus = (stock, min, safety) => {
  if (stock === 0) return 'out-of-stock';
  if (stock <= (safety || 0)) return 'critical';
  if (stock <= min) return 'low-stock';
  return 'healthy';
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'healthy', label: 'Healthy' },
  { key: 'low-stock', label: 'Low Stock' },
  { key: 'critical', label: 'Critical' },
  { key: 'out-of-stock', label: 'Out of Stock' },
];

const Inventory = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state) => state.products);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [saleProduct, setSaleProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [qty, setQty] = useState('');
  const [customerRef, setCustomerRef] = useState('');
  const [note, setNote] = useState('');
  const [adjustType, setAdjustType] = useState('ADD');
  const [adjustReason, setAdjustReason] = useState('Physical Count Correction');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filtered = useMemo(() => (products || []).filter((p) => {
    const status = calcStatus(p.currentStock ?? p.stockQuantity ?? 0, p.minimumStockLevel ?? p.lowStockThreshold ?? 5, p.safetyStock || 0);
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    return matchesSearch && (filter === 'all' || status === filter);
  }), [products, search, filter]);

  const resetForms = () => {
    setQty(''); setCustomerRef(''); setNote('');
    setAdjustType('ADD'); setAdjustReason('Physical Count Correction');
  };

  const handleSale = async (e) => {
    e.preventDefault();
    if (!saleProduct) return;
    setSubmitting(true);
    try {
      await stockSell({ productId: saleProduct._id || saleProduct.id, quantity: Number(qty), customerRef, note });
      toast.success('Sale recorded. Stock updated.');
      setSaleProduct(null); resetForms();
      dispatch(fetchProducts());
    } catch (err) {
      toast.error(err.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!adjustProduct) return;
    setSubmitting(true);
    try {
      await stockAdjust({
        productId: adjustProduct._id || adjustProduct.id,
        adjustmentType: adjustType, quantity: Number(qty), reason: adjustReason, notes: note,
      });
      toast.success('Stock adjusted.');
      setAdjustProduct(null); resetForms();
      dispatch(fetchProducts());
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(removeProduct(deleteTarget._id || deleteTarget.id)).unwrap();
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete product');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: 'name', label: 'Product',
      render: (_, p) => (
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--app-text-muted)' }}>{p.category || 'General'}</div>
        </div>
      ),
    },
    { key: 'sku', label: 'SKU', mono: true, render: (_, p) => <span className="ent-mono">{p.sku}</span> },
    {
      key: 'stock', label: 'Stock', numeric: true,
      render: (_, p) => {
        const stock = p.currentStock ?? p.stockQuantity ?? 0;
        const min = p.minimumStockLevel ?? p.lowStockThreshold ?? 5;
        const ratio = Math.min(stock / Math.max(min * 2, 1), 1);
        const color = ratio > 0.5 ? 'var(--green)' : ratio > 0.25 ? 'var(--amber)' : 'var(--red)';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <span style={{ fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}>{stock}</span>
            <span style={{ width: 56, height: 4, borderRadius: 4, background: 'var(--app-border)', overflow: 'hidden', display: 'inline-block' }}>
              <span style={{ display: 'block', height: '100%', width: `${ratio * 100}%`, background: color }} />
            </span>
          </div>
        );
      },
    },
    {
      key: 'status', label: 'Status',
      render: (_, p) => <StatusPill status={calcStatus(p.currentStock ?? p.stockQuantity ?? 0, p.minimumStockLevel ?? p.lowStockThreshold ?? 5, p.safetyStock)} />,
    },
  ];

  const renderActions = (p) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
      <button onClick={() => { setSaleProduct(p); resetForms(); }} className="ent-btn ent-btn-secondary ent-btn-sm">Sell</button>
      <button onClick={() => { setAdjustProduct(p); resetForms(); }} className="ent-btn ent-btn-ghost ent-btn-sm">Adjust</button>
      <RoleGuard allowedRoles={['admin']}>
        <button onClick={() => setDeleteTarget(p)} aria-label={`Delete ${p.name}`} className="ent-btn ent-btn-ghost ent-btn-sm" style={{ padding: '0 6px', color: 'var(--red)' }}>
          <Trash2 size={13} />
        </button>
      </RoleGuard>
    </div>
  );

  return (
    <div className="ent-page">
      <div className="ent-page-header">
        <div>
          <div className="ent-page-title">Inventory</div>
          <div className="ent-page-sub">{filtered.length} of {(products || []).length} products · stock, status and corrections.</div>
        </div>
        <div className="ent-page-actions">
          <RoleGuard allowedRoles={['admin', 'manager']}>
            <Link to="/dashboard/inventory/add" className="ent-btn ent-btn-primary ent-btn-sm"><Plus size={13} /> Add Product</Link>
          </RoleGuard>
        </div>
      </div>

      <div className="ent-toolbar">
        <div className="ent-search" style={{ width: 260 }}>
          <Search size={13} />
          <input className="ent-input" placeholder="Search name or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
        </div>
        <div className="ent-seg" role="group" aria-label="Stock status filter">
          {FILTERS.map((f) => (
            <button key={f.key} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      {loading && (!products || products.length === 0) ? (
        <SkeletonLoader rows={8} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          renderActions={renderActions}
          minWidth={720}
          emptyTitle="No products found"
          emptySub={search ? 'Try a different search term.' : 'Add your first product to get started.'}
          emptyAction={!search && (
            <RoleGuard allowedRoles={['admin', 'manager']}>
              <Link to="/dashboard/inventory/add" className="ent-btn ent-btn-primary ent-btn-sm"><Plus size={13} /> Add Product</Link>
            </RoleGuard>
          )}
        />
      )}

      {/* Sell */}
      <Modal
        isOpen={!!saleProduct}
        onClose={() => setSaleProduct(null)}
        title={`Record Sale — ${saleProduct?.name || ''}`}
        footer={
          <>
            <button onClick={() => setSaleProduct(null)} className="ent-btn ent-btn-secondary">Cancel</button>
            <button onClick={handleSale} disabled={submitting} className="ent-btn ent-btn-primary">{submitting ? 'Saving…' : 'Confirm Sale'}</button>
          </>
        }
      >
        <form onSubmit={handleSale} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label className="ent-label" htmlFor="sale-qty">Quantity (max {saleProduct?.currentStock ?? saleProduct?.stockQuantity ?? 0})</label>
            <input id="sale-qty" type="number" required min={1} max={saleProduct?.currentStock ?? undefined}
              value={qty} onChange={(e) => setQty(e.target.value)} className="ent-input" placeholder="0" />
          </div>
          <div>
            <label className="ent-label" htmlFor="sale-ref">Customer reference <span style={{ fontWeight: 400, color: 'var(--app-text-muted)' }}>(optional)</span></label>
            <input id="sale-ref" value={customerRef} onChange={(e) => setCustomerRef(e.target.value)} className="ent-input" placeholder="Invoice #1234" />
          </div>
          <div>
            <label className="ent-label" htmlFor="sale-note">Note <span style={{ fontWeight: 400, color: 'var(--app-text-muted)' }}>(optional)</span></label>
            <input id="sale-note" value={note} onChange={(e) => setNote(e.target.value)} className="ent-input" placeholder="Counter sale" />
          </div>
        </form>
      </Modal>

      {/* Adjust */}
      <Modal
        isOpen={!!adjustProduct}
        onClose={() => setAdjustProduct(null)}
        title={`Adjust Stock — ${adjustProduct?.name || ''}`}
        footer={
          <>
            <button onClick={() => setAdjustProduct(null)} className="ent-btn ent-btn-secondary">Cancel</button>
            <button onClick={handleAdjust} disabled={submitting} className="ent-btn ent-btn-primary">{submitting ? 'Saving…' : 'Confirm'}</button>
          </>
        }
      >
        <form onSubmit={handleAdjust} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {['ADD', 'REMOVE'].map((t) => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <input type="radio" checked={adjustType === t} onChange={() => setAdjustType(t)} /> {t === 'ADD' ? 'Add' : 'Remove'}
              </label>
            ))}
          </div>
          <div>
            <label className="ent-label" htmlFor="adj-qty">Quantity</label>
            <input id="adj-qty" type="number" required min={1} value={qty} onChange={(e) => setQty(e.target.value)} className="ent-input" placeholder="0" />
          </div>
          <div>
            <label className="ent-label" htmlFor="adj-reason">Reason</label>
            <select id="adj-reason" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className="ent-select">
              <option>Physical Count Correction</option>
              <option>Damage/Waste</option>
              <option>Customer Return</option>
              <option>Other</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete product?"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="ent-btn ent-btn-secondary">Cancel</button>
            <button onClick={confirmDelete} className="ent-btn ent-btn-danger">Delete</button>
          </>
        }
      >
        <p style={{ fontSize: 13, color: 'var(--app-text-muted)', lineHeight: 1.5 }}>
          “<strong style={{ color: 'var(--app-text)' }}>{deleteTarget?.name}</strong>” will be removed along with its stock history. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Inventory;
