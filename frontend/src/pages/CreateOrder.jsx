import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliers } from '../redux/slices/supplierSlice';
import { fetchProducts } from '../redux/slices/productSlice';
import { createOrder } from '../Instance/API';
import { Plus, Trash2 } from 'lucide-react';

const CreateOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: suppliers } = useSelector((state) => state.suppliers);
  const { items: products } = useSelector((state) => state.products);

  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [items, setItems] = useState([{ product: '', quantity: 1, unitPrice: 0 }]);

  useEffect(() => {
    dispatch(fetchSuppliers());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleItemChange = (index, field, value) => {
    const next = [...items];
    next[index][field] = value;
    if (field === 'product') {
      const sel = products.find((p) => (p._id || p.id) === value);
      if (sel) next[index].unitPrice = sel.price ?? sel.unitPrice ?? 0;
    }
    setItems(next);
  };

  const addItem = () => setItems([...items, { product: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  const totalAmount = items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplier) return toast.error('Please select a supplier');
    if (!expectedDeliveryDate) return toast.error('Please select an expected delivery date');
    if (items.length === 0) return toast.error('Please add at least one item');
    if (items.some((i) => !i.product || i.quantity < 1 || i.unitPrice < 0)) return toast.error('Please complete all item fields correctly');
    if (new Set(items.map((i) => String(i.product))).size !== items.length) return toast.error('Duplicate product in order — merge quantities instead');

    setLoading(true);
    try {
      // Server recomputes totalAmount — don't trust client total.
      await createOrder({
        supplier,
        expectedDeliveryDate,
        items: items.map((i) => ({ product: i.product, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
      });
      toast.success('Purchase order created');
      navigate('/dashboard/orders');
    } catch (err) {
      toast.error(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ent-page" style={{ maxWidth: 860 }}>
      <div className="ent-page-header">
        <div>
          <div className="ent-page-title">New Purchase Order</div>
          <div className="ent-page-sub">Stock is reconciled automatically when the order is marked delivered.</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="ent-card ent-card-pad" style={{ marginBottom: 12 }}>
          <div className="ent-section-label" style={{ marginBottom: 10 }}>Order Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="ent-label" htmlFor="co-supplier">Supplier *</label>
              <select id="co-supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="ent-select" required>
                <option value="">Select a supplier</option>
                {suppliers?.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="ent-label" htmlFor="co-eta">Expected delivery *</label>
              <input id="co-eta" type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} className="ent-input" required />
            </div>
          </div>
        </div>

        <div className="ent-card ent-card-pad" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="ent-section-label">Line Items ({items.length})</span>
            <button type="button" onClick={addItem} className="ent-btn ent-btn-secondary ent-btn-sm"><Plus size={13} /> Add Item</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 32px', gap: 8, alignItems: 'end',
                padding: 10, background: 'var(--app-inset)', border: '1px solid var(--app-border)', borderRadius: 6 }}>
                <div>
                  <label className="ent-label" htmlFor={`co-prod-${index}`}>Product *</label>
                  <select id={`co-prod-${index}`} value={item.product} onChange={(e) => handleItemChange(index, 'product', e.target.value)} className="ent-select" required>
                    <option value="">Select product</option>
                    {products?.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ent-label" htmlFor={`co-qty-${index}`}>Qty *</label>
                  <input id={`co-qty-${index}`} type="number" min={1} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="ent-input" required />
                </div>
                <div>
                  <label className="ent-label" htmlFor={`co-price-${index}`}>Unit price *</label>
                  <input id={`co-price-${index}`} type="number" min={0} step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="ent-input" required />
                </div>
                <div>
                  {items.length > 1 ? (
                    <button type="button" onClick={() => removeItem(index)} aria-label={`Remove item ${index + 1}`}
                      className="ent-btn ent-btn-ghost ent-btn-sm" style={{ padding: '0 6px', color: 'var(--red)' }}>
                      <Trash2 size={14} />
                    </button>
                  ) : <span style={{ display: 'block', height: 28 }} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ent-card ent-card-pad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--app-text-muted)' }}>
            ${(totalAmount).toFixed(2)} estimated · final total computed server-side
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => navigate('/dashboard/orders')} className="ent-btn ent-btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="ent-btn ent-btn-primary">{loading ? 'Creating…' : 'Create Order'}</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
