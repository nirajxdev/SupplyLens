import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct } from '../redux/slices/productSlice';
import { fetchSuppliers, addSupplier } from '../redux/slices/supplierSlice';
import { Plus, X } from 'lucide-react';

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: suppliers } = useSelector((state) => state.suppliers);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: '', quantity: '', reorderPoint: '', supplier: '', price: '' });

  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.contactPerson || !newSupplier.email || !newSupplier.phone || !newSupplier.address) {
      return toast.error('Please fill all supplier fields');
    }
    setSupplierLoading(true);
    try {
      const added = await dispatch(addSupplier({
        name: newSupplier.name.trim(),
        contactPerson: newSupplier.contactPerson.trim(),
        email: newSupplier.email.toLowerCase().trim(),
        phone: newSupplier.phone.trim(),
        address: newSupplier.address.trim(),
      })).unwrap();
      const addedId = added?._id || added?.id || added?.data?._id;
      toast.success(`${newSupplier.name} added as supplier`);
      setForm((prev) => ({ ...prev, supplier: addedId || prev.supplier }));
      setShowAddSupplier(false);
      setNewSupplier({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    } catch (err) {
      toast.error(err || 'Failed to add supplier');
    } finally {
      setSupplierLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showAddSupplier) {
      toast.info('Finish or close the supplier form first');
      return;
    }
    if (!form.supplier) {
      toast.error('Please select a supplier');
      return;
    }
    setLoading(true);
    try {
      await dispatch(addProduct({
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category.trim() || 'General',
        stockQuantity: Number(form.quantity),
        currentStock: Number(form.quantity),
        lowStockThreshold: Number(form.reorderPoint) || 5,
        minimumStockLevel: Number(form.reorderPoint) || 5,
        price: Number(form.price),
        unitPrice: Number(form.price),
        supplier: form.supplier,
        supplierId: form.supplier,
      })).unwrap();
      toast.success(`${form.name} added to inventory`);
      navigate('/dashboard/inventory');
    } catch (err) {
      toast.error(err || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, extra = {}) => (
    <div>
      <label className="ent-label" htmlFor={`ap-${name}`}>{label}{extra.required && ' *'}</label>
      <input id={`ap-${name}`} name={name} value={form[name]} onChange={handleChange} className="ent-input" {...extra} />
    </div>
  );

  return (
    <div className="ent-page" style={{ maxWidth: 640 }}>
      <div className="ent-page-header">
        <div>
          <div className="ent-page-title">Add Product</div>
          <div className="ent-page-sub">Creates a new SKU with opening stock.</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ent-card ent-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ gridColumn: '1 / -1' }}>{field('Product name', 'name', { placeholder: 'Rice Flour 5kg', required: true })}</div>
          <div style={{ gridColumn: '1 / -1' }}>{field('SKU', 'sku', { placeholder: 'SKU-0285', required: true })}</div>
          {field('Category', 'category', { placeholder: 'Raw Materials' })}
          {field('Unit price ($)', 'price', { type: 'number', min: 0, step: '0.01', placeholder: '0.00', required: true })}
          {field('Opening quantity', 'quantity', { type: 'number', min: 0, placeholder: '0', required: true })}
          {field('Reorder point', 'reorderPoint', { type: 'number', min: 0, placeholder: '50' })}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <label className="ent-label" htmlFor="ap-supplier" style={{ marginBottom: 0 }}>Supplier *</label>
            {!showAddSupplier && (
              <button type="button" onClick={() => setShowAddSupplier(true)} className="ent-btn ent-btn-ghost ent-btn-sm">
                <Plus size={12} /> New Supplier
              </button>
            )}
          </div>
          {showAddSupplier ? (
            <div style={{ padding: 12, background: 'var(--app-inset)', border: '1px solid var(--app-border)', borderRadius: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 650 }}>Quick-add supplier</span>
                <button type="button" onClick={() => setShowAddSupplier(false)} aria-label="Close supplier form"
                  className="ent-btn ent-btn-ghost ent-btn-sm" style={{ padding: '0 6px' }}>
                  <X size={13} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { k: 'name', label: 'Company', ph: 'Acme Corp' },
                  { k: 'contactPerson', label: 'Contact', ph: 'Jane Doe' },
                  { k: 'email', label: 'Email', ph: 'ops@acme.com', type: 'email' },
                  { k: 'phone', label: 'Phone', ph: '+1 555 0100' },
                ].map((f) => (
                  <div key={f.k}>
                    <label className="ent-label" htmlFor={`ns-${f.k}`}>{f.label}</label>
                    <input id={`ns-${f.k}`} type={f.type || 'text'} value={newSupplier[f.k]}
                      onChange={(e) => setNewSupplier({ ...newSupplier, [f.k]: e.target.value })}
                      placeholder={f.ph} className="ent-input" />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="ent-label" htmlFor="ns-address">Address</label>
                  <input id="ns-address" value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    placeholder="123 Market St" className="ent-input" />
                </div>
              </div>
              <button type="button" onClick={handleAddSupplier} disabled={supplierLoading}
                className="ent-btn ent-btn-primary ent-btn-sm" style={{ width: '100%', marginTop: 10 }}>
                {supplierLoading ? 'Saving…' : 'Save & Select'}
              </button>
            </div>
          ) : (
            <select id="ap-supplier" name="supplier" value={form.supplier} onChange={handleChange} className="ent-select" required>
              <option value="">Select a supplier</option>
              {suppliers?.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4, borderTop: '1px solid var(--app-border)', marginTop: 2 }}>
          <button type="button" onClick={() => navigate('/dashboard/inventory')} className="ent-btn ent-btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="ent-btn ent-btn-primary">{loading ? 'Saving…' : 'Add Product'}</button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
