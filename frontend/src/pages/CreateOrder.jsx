import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliers } from '../redux/slices/supplierSlice';
import { fetchProducts } from '../redux/slices/productSlice';
import { createOrder } from '../Instance/API';
import FormInput from '../components/auth/FormInput';
import SubmitButton from '../components/auth/SubmitButton';
import { Plus, Trash2 } from 'lucide-react';

const CreateOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: suppliers } = useSelector(state => state.suppliers);
  const { items: products } = useSelector(state => state.products);
  
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [items, setItems] = useState([{ product: '', quantity: 1, unitPrice: 0 }]);

  useEffect(() => {
    dispatch(fetchSuppliers());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto-fill unit price if product is selected
    if (field === 'product') {
      const selectedProduct = products.find(p => (p._id || p.id) === value);
      if (selectedProduct) {
        newItems[index].unitPrice = selectedProduct.price || 0;
      }
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { product: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplier) return toast.error("Please select a supplier");
    if (!expectedDeliveryDate) return toast.error("Please select an expected delivery date");
    if (items.length === 0) return toast.error("Please add at least one item");
    if (items.some(i => !i.product || i.quantity < 1 || i.unitPrice < 0)) return toast.error("Please complete all item fields correctly");
    const seen = new Set(items.map(i => String(i.product)));
    if (seen.size !== items.length) return toast.error("Duplicate product in order — merge quantities instead");

    setLoading(true);
    try {
      // Server recomputes totalAmount — don't trust client total.
      await createOrder({
        supplier,
        expectedDeliveryDate,
        items: items.map(i => ({ product: i.product, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
      });
      toast.success("Purchase order created successfully");
      navigate('/dashboard/orders');
    } catch (err) {
      toast.error(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="p-8 max-w-3xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.8px', marginBottom: '32px' }}>Create Purchase Order</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--app-text)' }}>Supplier</label>
            <select 
              value={supplier} 
              onChange={e => setSupplier(e.target.value)}
              className="w-full h-11 px-3 rounded-[8px] outline-none transition-colors"
              style={{ background: 'var(--app-bg)', border: '1px solid var(--border)', color: 'var(--app-text)', fontSize: '14px' }}
              required
            >
              <option value="">Select a supplier</option>
              {suppliers && suppliers.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>{s.name || s.companyName}</option>
              ))}
            </select>
          </div>
          
          <FormInput 
            label="Expected Delivery Date" 
            type="date" 
            value={expectedDeliveryDate} 
            onChange={e => setExpectedDeliveryDate(e.target.value)} 
            required 
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)' }}>Order Items</label>
          </div>
          
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
                <div className="flex-1">
                  <label className="block mb-1.5" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--app-text-muted)' }}>Product</label>
                  <select 
                    value={item.product} 
                    onChange={e => handleItemChange(index, 'product', e.target.value)}
                    className="w-full h-10 px-3 rounded-md outline-none transition-colors"
                    style={{ background: 'var(--app-bg)', border: '1px solid var(--border)', color: 'var(--app-text)', fontSize: '13px' }}
                    required
                  >
                    <option value="">Select product</option>
                    {products && products.map(p => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                
                <div className="w-24">
                  <label className="block mb-1.5" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--app-text-muted)' }}>Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    value={item.quantity} 
                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full h-10 px-3 rounded-md outline-none transition-colors"
                    style={{ background: 'var(--app-bg)', border: '1px solid var(--border)', color: 'var(--app-text)', fontSize: '13px' }}
                    required
                  />
                </div>
                
                <div className="w-28">
                  <label className="block mb-1.5" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--app-text-muted)' }}>Unit Price</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={item.unitPrice} 
                    onChange={e => handleItemChange(index, 'unitPrice', e.target.value)}
                    className="w-full h-10 px-3 rounded-md outline-none transition-colors"
                    style={{ background: 'var(--app-bg)', border: '1px solid var(--border)', color: 'var(--app-text)', fontSize: '13px' }}
                    required
                  />
                </div>

                <div className="pt-6">
                  {items.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="h-10 px-3 rounded-md flex items-center justify-center cursor-pointer text-red-500 hover:bg-red-50 transition-colors"
                      style={{ border: '1px solid transparent' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={addItem}
            className="self-start flex items-center gap-2 mt-2 bg-transparent cursor-pointer hover:opacity-80 transition-opacity"
            style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent)', border: 'none' }}
          >
            <Plus size={14} /> Add Another Item
          </button>
        </div>

        <div className="flex justify-between items-center p-4 rounded-lg mt-4" style={{ background: 'var(--app-overlay)' }}>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--app-text-muted)' }}>Total Order Amount</span>
          <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--app-text)', fontFamily: 'var(--font-mono)' }}>
            ${totalAmount.toFixed(2)}
          </span>
        </div>

        <SubmitButton loading={loading}>Create Order</SubmitButton>
      </form>
    </motion.div>
  );
};

export default CreateOrder;
