import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, removeProduct } from '../redux/slices/productSlice';
import StatusPill from '../components/app/StatusPill';
import { stockSell, stockAdjust } from '../Instance/API';
import RoleGuard from '../components/RoleGuard';

const calculateStatus = (stock, min, safety) => {
  if (stock === 0) return 'out-of-stock';
  if (stock <= (safety || 0)) return 'critical';
  if (stock <= min) return 'low-stock';
  return 'healthy';
};

const stockBarColor = (ratio) => ratio > 0.5 ? 'var(--green)' : ratio > 0.25 ? 'var(--amber)' : 'var(--red)';

const Inventory = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector(state => state.products);
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Modals state
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [quantity, setQuantity] = useState('');
  const [customerRef, setCustomerRef] = useState('');
  const [note, setNote] = useState('');
  
  const [adjustType, setAdjustType] = useState('ADD');
  const [adjustReason, setAdjustReason] = useState('Physical Count Correction');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filtered = useMemo(() => (products || []).filter(p => {
    const status = calculateStatus(p.currentStock ?? p.stockQuantity ?? 0, p.minimumStockLevel ?? p.lowStockThreshold ?? 5, p.safetyStock || 0);
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    const matchesFilter = filter === 'all' || status === filter;
    return matchesSearch && matchesFilter;
  }), [products, search, filter]);

  const handleDelete = (product) => {
    setDeleteTarget(product);
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

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      await stockSell({
        productId: selectedProduct._id || selectedProduct.id,
        quantity: Number(quantity),
        customerRef,
        note
      });
      toast.success("Sale recorded. Stock updated.");
      setSaleModalOpen(false);
      dispatch(fetchProducts()); // refresh
    } catch (err) {
      toast.error(err.message || "Failed to record sale");
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      await stockAdjust({
        productId: selectedProduct._id || selectedProduct.id,
        adjustmentType: adjustType,
        quantity: Number(quantity),
        reason: adjustReason,
        notes: note
      });
      toast.success("Stock adjusted.");
      setAdjustModalOpen(false);
      dispatch(fetchProducts()); // refresh
    } catch (err) {
      toast.error(err.message || "Failed to adjust stock");
    }
  };

  const openSaleModal = (product) => {
    setSelectedProduct(product);
    setQuantity('');
    setCustomerRef('');
    setNote('');
    setSaleModalOpen(true);
  };

  const openAdjustModal = (product) => {
    setSelectedProduct(product);
    setQuantity('');
    setAdjustType('ADD');
    setAdjustReason('Physical Count Correction');
    setNote('');
    setAdjustModalOpen(true);
  };

  if (loading && (!products || products.length === 0)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col gap-4 w-full">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-[8px]" style={{ background: 'var(--app-overlay)' }}></div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div className="p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 500, letterSpacing: '-1px' }}>Inventory</h1>
        <RoleGuard allowedRoles={['admin', 'manager']}>
          <Link to="/dashboard/inventory/add">
            <motion.button
              className="btn-shimmer flex items-center gap-2 px-4 py-2.5 rounded-[10px] cursor-pointer border-0"
              style={{ background: 'var(--accent)', color: '#000', fontSize: '13px', fontWeight: 500 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={14} /> Add Product
            </motion.button>
          </Link>
        </RoleGuard>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--app-text-muted)' }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full py-2.5 pl-9 pr-4 rounded-[10px] outline-none transition-all duration-300"
            style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', fontSize: '13px', color: 'var(--app-text)' }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--app-border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['all', 'healthy', 'low-stock', 'critical', 'out-of-stock'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-[100px] cursor-pointer border-0 transition-all duration-200"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                background: filter === f ? 'var(--accent-glow)' : 'transparent',
                color: filter === f ? 'var(--accent)' : 'var(--app-text-muted)',
                border: filter === f ? '1px solid var(--accent)' : '1px solid var(--app-border)',
              }}
            >
              {f === 'all' ? 'All' : f.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[12px] overflow-x-auto" style={{ border: '1px solid var(--app-border)' }}>
        <table className="w-full min-w-[800px]" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--app-border)', background: 'var(--app-surface)' }}>
              {['Product', 'SKU', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className={h === 'Actions' ? "text-right py-3 px-4" : "text-left py-3 px-4"} style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--app-text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.length === 0 ? (
                <tr>
                    <td colSpan="5" className="py-16 text-center">
                        <p style={{ color: 'var(--app-text-muted)', fontSize: '14px' }}>No products found. Add your first product.</p>
                        <Link to="/dashboard/inventory/add" className="mt-4 inline-block text-[13px] font-medium" style={{ color: 'var(--accent)' }}>+ Add Product</Link>
                    </td>
                </tr>
              ) : filtered.map((p) => {
                const stock = p.currentStock ?? p.stockQuantity ?? 0;
                const min = p.minimumStockLevel ?? p.lowStockThreshold ?? 5;
                const max = Math.max(min * 2, 1);
                const ratio = Math.min(stock / max, 1);
                const status = calculateStatus(stock, min, p.safetyStock);
                return (
                  <motion.tr
                    key={p._id || p.id}
                    className="group transition-colors duration-150"
                    style={{ borderBottom: '1px solid var(--app-border)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--app-overlay)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td className="py-3 px-4">
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--app-text)' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>{p.category}</div>
                    </td>
                    <td className="py-3 px-4" style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--app-text-muted)' }}>{p.sku}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--app-text)', fontFamily: 'var(--font-mono)' }}>{stock}</span>
                        <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'var(--app-overlay)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ background: stockBarColor(ratio), width: `${ratio * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                        <StatusPill status={status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openSaleModal(p)} className="px-2 py-1 rounded-[6px] text-[12px] font-medium border cursor-pointer" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'transparent' }}>
                                Record Sale
                            </button>
                            <button onClick={() => openAdjustModal(p)} className="px-2 py-1 rounded-[6px] text-[12px] font-medium border cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: 'var(--app-border)', color: 'var(--app-text-muted)', background: 'transparent' }}>
                                Adjust
                            </button>
                            <RoleGuard allowedRoles={['admin']}>
                              <button
                                  onClick={() => handleDelete(p)}
                                  aria-label={`Delete ${p.name}`}
                                  className="cursor-pointer bg-transparent border-0 p-1 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                                  style={{ color: 'var(--red)' }}
                              >
                                  <Trash2 size={14} />
                              </button>
                            </RoleGuard>
                        </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Sale Modal */}
      {saleModalOpen && selectedProduct && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
              <div className="rounded-[16px] p-6 w-full max-w-[400px]" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
                  <h2 className="text-[18px] font-medium mb-4">Record Sale</h2>
                  <form onSubmit={handleSaleSubmit} className="flex flex-col gap-4">
                      <div>
                          <label className="text-[12px] text-[var(--app-text-muted)] mb-1 block">Product</label>
                          <input type="text" readOnly value={selectedProduct.name} className="w-full p-2 rounded-[8px] text-[13px]" style={{ background: 'var(--app-overlay)', border: '1px solid var(--app-border)', color: 'var(--app-text-muted)' }} />
                      </div>
                      <div>
                          <label className="text-[12px] text-[var(--app-text-muted)] mb-1 block">Quantity Sold (Max: {selectedProduct.currentStock})</label>
                          <input type="number" required min="1" max={selectedProduct.currentStock} value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-full p-2 rounded-[8px] text-[13px]" style={{ background: 'transparent', border: '1px solid var(--app-border)', color: 'var(--app-text)' }} />
                      </div>
                      <div>
                          <label className="text-[12px] text-[var(--app-text-muted)] mb-1 block">Customer Reference (Optional)</label>
                          <input type="text" value={customerRef} onChange={e=>setCustomerRef(e.target.value)} placeholder="e.g. Invoice #1234" className="w-full p-2 rounded-[8px] text-[13px]" style={{ background: 'transparent', border: '1px solid var(--app-border)', color: 'var(--app-text)' }} />
                      </div>
                      <div className="flex gap-3 justify-end mt-4">
                          <button type="button" onClick={() => setSaleModalOpen(false)} className="px-4 py-2 rounded-[8px] text-[13px] border cursor-pointer" style={{ borderColor: 'var(--app-border)', background: 'transparent', color: 'var(--app-text)' }}>Cancel</button>
                          <button type="submit" className="px-4 py-2 rounded-[8px] text-[13px] font-medium cursor-pointer border-0" style={{ background: 'var(--accent)', color: '#000' }}>Confirm Sale</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Adjust Modal */}
      {adjustModalOpen && selectedProduct && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
              <div className="rounded-[16px] p-6 w-full max-w-[400px]" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
                  <h2 className="text-[18px] font-medium mb-4">Adjust Stock</h2>
                  <form onSubmit={handleAdjustSubmit} className="flex flex-col gap-4">
                      <div>
                          <label className="text-[12px] text-[var(--app-text-muted)] mb-1 block">Product</label>
                          <input type="text" readOnly value={selectedProduct.name} className="w-full p-2 rounded-[8px] text-[13px]" style={{ background: 'var(--app-overlay)', border: '1px solid var(--app-border)', color: 'var(--app-text-muted)' }} />
                      </div>
                      <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-[13px] text-[var(--app-text)]">
                              <input type="radio" checked={adjustType==='ADD'} onChange={()=>setAdjustType('ADD')} /> Add
                          </label>
                          <label className="flex items-center gap-2 text-[13px] text-[var(--app-text)]">
                              <input type="radio" checked={adjustType==='REMOVE'} onChange={()=>setAdjustType('REMOVE')} /> Remove
                          </label>
                      </div>
                      <div>
                          <label className="text-[12px] text-[var(--app-text-muted)] mb-1 block">Quantity to {adjustType === 'ADD' ? 'Add' : 'Remove'}</label>
                          <input type="number" required min="1" max={adjustType === 'REMOVE' ? selectedProduct.currentStock : undefined} value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-full p-2 rounded-[8px] text-[13px]" style={{ background: 'transparent', border: '1px solid var(--app-border)', color: 'var(--app-text)' }} />
                      </div>
                      <div>
                          <label className="text-[12px] text-[var(--app-text-muted)] mb-1 block">Reason</label>
                          <select value={adjustReason} onChange={e=>setAdjustReason(e.target.value)} className="w-full p-2 rounded-[8px] text-[13px]" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', color: 'var(--app-text)' }}>
                              <option value="Physical Count Correction">Physical Count Correction</option>
                              <option value="Damage/Waste">Damage/Waste</option>
                              <option value="Customer Return">Customer Return</option>
                              <option value="Other">Other</option>
                          </select>
                      </div>
                      <div className="flex gap-3 justify-end mt-4">
                          <button type="button" onClick={() => setAdjustModalOpen(false)} className="px-4 py-2 rounded-[8px] text-[13px] border cursor-pointer" style={{ borderColor: 'var(--app-border)', background: 'transparent', color: 'var(--app-text)' }}>Cancel</button>
                          <button type="submit" className="px-4 py-2 rounded-[8px] text-[13px] font-medium cursor-pointer border-0" style={{ background: 'var(--accent)', color: '#000' }}>Confirm Adjust</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Delete confirmation — replaces blocking window.confirm */}
      {deleteTarget && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Delete product" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
              <div className="rounded-[16px] p-6 w-full max-w-[400px]" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
                  <h2 className="text-[18px] font-medium mb-2">Delete product?</h2>
                  <p className="text-[13px] mb-6" style={{ color: 'var(--app-text-muted)' }}>
                    “{deleteTarget.name}” will be removed along with its stock history. This cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-end">
                      <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-[8px] text-[13px] border cursor-pointer" style={{ borderColor: 'var(--app-border)', background: 'transparent', color: 'var(--app-text)' }}>Cancel</button>
                      <button onClick={confirmDelete} className="px-4 py-2 rounded-[8px] text-[13px] font-medium cursor-pointer border-0" style={{ background: 'var(--red)', color: '#fff' }}>Delete</button>
                  </div>
              </div>
          </div>
      )}
    </motion.div>
  );
};

export default Inventory;
