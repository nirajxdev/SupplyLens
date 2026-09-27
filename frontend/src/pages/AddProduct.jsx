import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct } from '../redux/slices/productSlice';
import { fetchSuppliers, addSupplier } from '../redux/slices/supplierSlice';
import { Plus, X } from 'lucide-react';
import FormInput from '../components/auth/FormInput';
import SubmitButton from '../components/auth/SubmitButton';

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: suppliers } = useSelector(state => state.suppliers);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: '', quantity: '', reorderPoint: '', supplier: '', price: '' });
  
  // Inline Supplier Creation State
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
      return toast.error("Please fill all supplier fields");
    }
    
    setSupplierLoading(true);
    try {
      const added = await dispatch(addSupplier({ 
        name: newSupplier.name.trim(), 
        contactPerson: newSupplier.contactPerson.trim(),
        email: newSupplier.email.toLowerCase().trim(), 
        phone: newSupplier.phone.trim(),
        address: newSupplier.address.trim()
      })).unwrap();
      const addedId = added?._id || added?.id || added?.data?._id;
      toast.success(`${newSupplier.name} added as supplier`);
      setForm((prev) => ({ ...prev, supplier: addedId || prev.supplier }));
      setShowAddSupplier(false);
      setNewSupplier({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    } catch (err) {
      toast.error(err || "Failed to add supplier");
    } finally {
      setSupplierLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showAddSupplier) {
      toast.info("Finish or close the supplier form first");
      return;
    }

    setLoading(true);
    
    if (!form.supplier) {
      toast.error("Please select a supplier");
      setLoading(false);
      return;
    }

    try {
      const productData = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category.trim() || 'General',
        // Canonical backend fields (aliases currentStock/lowStockThreshold also accepted)
        stockQuantity: Number(form.quantity),
        currentStock: Number(form.quantity),
        lowStockThreshold: Number(form.reorderPoint) || 5,
        minimumStockLevel: Number(form.reorderPoint) || 5,
        price: Number(form.price),
        unitPrice: Number(form.price),
        supplier: form.supplier,
        supplierId: form.supplier,
      };
      
      await dispatch(addProduct(productData)).unwrap();
      toast.success(`${form.name} added to inventory`);
      navigate('/dashboard/inventory');
    } catch (err) {
      toast.error(err || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="p-8 max-w-lg" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.8px', marginBottom: '32px' }}>Add Product</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormInput label="Product Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rice Flour 5kg" required />
        <FormInput label="SKU" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. SKU-0285" required />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Raw Materials" />
          <FormInput label="Price (Unit)" type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Quantity" type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="0" required />
          <FormInput label="Reorder Point" type="number" name="reorderPoint" value={form.reorderPoint} onChange={handleChange} placeholder="50" />
        </div>
        
        <div className="flex flex-col gap-2 relative">
          <div className="flex items-center justify-between">
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--app-text)' }}>Supplier</label>
            {!showAddSupplier && (
              <button 
                type="button" 
                onClick={() => setShowAddSupplier(true)}
                className="flex items-center gap-1 bg-transparent border-0 cursor-pointer transition-opacity hover:opacity-70"
                style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent)' }}
              >
                <Plus size={12} /> New Supplier
              </button>
            )}
          </div>
          
          {showAddSupplier ? (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="p-4 rounded-lg flex flex-col gap-3"
              style={{ background: 'var(--app-overlay)', border: '1px solid var(--app-border)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--app-text)' }}>Quick Add Supplier</span>
                <button 
                  type="button" 
                  onClick={() => setShowAddSupplier(false)}
                  className="bg-transparent border-0 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormInput 
                  label="Supplier Name" 
                  name="supplierName"
                  value={newSupplier.name} 
                  onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} 
                  placeholder="e.g. Acme Corp" 
                />
                <FormInput 
                  label="Contact Person" 
                  name="contactPerson"
                  value={newSupplier.contactPerson} 
                  onChange={e => setNewSupplier({...newSupplier, contactPerson: e.target.value})} 
                  placeholder="e.g. Jane Doe" 
                />
                <FormInput 
                  label="Email" 
                  name="supplierEmail"
                  type="email"
                  value={newSupplier.email} 
                  onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} 
                  placeholder="contact@acme.com" 
                />
                <FormInput 
                  label="Phone" 
                  name="supplierPhone"
                  value={newSupplier.phone} 
                  onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} 
                  placeholder="+1 234 567" 
                />
              </div>
              <FormInput 
                label="Address" 
                name="supplierAddress"
                value={newSupplier.address} 
                onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} 
                placeholder="123 Main St, City" 
              />
              
              <button 
                type="button"
                onClick={handleAddSupplier}
                disabled={supplierLoading}
                className="w-full h-9 rounded-md mt-1 font-medium cursor-pointer flex items-center justify-center transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff', fontSize: '13px' }}
              >
                {supplierLoading ? 'Saving...' : 'Save & Select'}
              </button>
            </motion.div>
          ) : (
            <select 
              name="supplier" 
              value={form.supplier} 
              onChange={handleChange}
              className="w-full h-11 px-3 rounded-[8px] outline-none transition-colors"
              style={{ background: 'var(--app-bg)', border: '1px solid var(--border)', color: 'var(--app-text)', fontSize: '14px' }}
              required
            >
              <option value="">Select a supplier</option>
              {suppliers && suppliers.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>{s.name || s.companyName}</option>
              ))}
            </select>
          )}
        </div>
        <SubmitButton loading={loading}>Add Product</SubmitButton>
      </form>
    </motion.div>
  );
};

export default AddProduct;
