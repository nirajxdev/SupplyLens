import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliers, addSupplier } from '../redux/slices/supplierSlice';
import RoleGuard from '../components/RoleGuard';
import { toast } from 'sonner';

const getSupplierColor = (score) => {
  if (score >= 90) return 'var(--green)';
  if (score >= 70) return 'var(--amber)';
  return 'var(--red)';
};

const ScoreRing = ({ score, color, delay = 0 }) => {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference * (1 - score / 100);
  const { ref, displayValue } = useAnimatedCounter(score, { duration: 1.2, suffix: '%' });

  return (
    <div className="relative flex items-center justify-center" ref={ref}>
      <svg width="48" height="48" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="none" stroke="var(--app-overlay)" strokeWidth="2.5" />
        <motion.circle
          cx="20" cy="20" r="18"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay }}
        />
      </svg>
      <span className="absolute" style={{ fontSize: '11px', fontWeight: 600, color }}>{displayValue}</span>
    </div>
  );
};

const Suppliers = () => {
  const dispatch = useDispatch();
  const { items: suppliers, loading } = useSelector((state) => state.suppliers);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(addSupplier(form)).unwrap();
      toast.success('Supplier added');
      setModalOpen(false);
      setForm({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    } catch (err) {
      toast.error(err || 'Failed to add supplier');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse" style={{ color: 'var(--app-text-muted)' }}>Loading suppliers...</div>
      </div>
    );
  }

  return (
    <motion.div className="p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 500, letterSpacing: '-1px' }}>Suppliers</h1>
        <RoleGuard allowedRoles={['admin', 'manager']}>
          <button onClick={() => setModalOpen(true)} className="btn-shimmer flex items-center gap-2 px-4 py-2.5 rounded-[10px] cursor-pointer border-0" style={{ background: 'var(--accent)', color: '#000', fontSize: '13px', fontWeight: 500 }}>
            + Add Supplier
          </button>
        </RoleGuard>
      </div>

      {suppliers?.length === 0 ? (
          <div className="py-16 text-center w-full" style={{ border: '1px dashed var(--app-border)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--app-text-muted)', fontSize: '14px' }}>No suppliers found. Create your first supplier.</p>
              <RoleGuard allowedRoles={['admin', 'manager']}>
                <button onClick={() => setModalOpen(true)} className="mt-4 inline-block text-[13px] font-medium border-0 cursor-pointer" style={{ color: 'var(--accent)', background: 'transparent' }}>+ Add Supplier</button>
              </RoleGuard>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers && suppliers.map((s) => {
          const score = s.reliabilityScore ?? 100;
          const color = getSupplierColor(score);
          return (
            <motion.div
              key={s._id || s.id}
              className="p-5 rounded-[16px] flex items-center gap-4 transition-all duration-200 group"
              style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -3, borderColor: 'var(--app-border-hover)' }}
            >
              <motion.div whileHover={{ scale: 1.15 }} transition={{ type: 'spring', stiffness: 300 }}>
                <ScoreRing score={score} color={color} />
              </motion.div>
              <div className="min-w-0 flex-1">
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--app-text)' }}>{s.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>{s.contactPerson || s.contact}</p>
                <p style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>{s.email}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Add supplier" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-[16px] p-6 w-full max-w-[420px]" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
            <h2 className="text-[18px] font-medium mb-4">Add Supplier</h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              {[
                { k: 'name', label: 'Company name', ph: 'Acme Foods' },
                { k: 'contactPerson', label: 'Contact person', ph: 'Jane Doe' },
                { k: 'email', label: 'Email', ph: 'ops@acme.com', type: 'email' },
                { k: 'phone', label: 'Phone', ph: '+1 555 0100' },
                { k: 'address', label: 'Address', ph: '123 Market St' },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-[12px] mb-1 block" style={{ color: 'var(--app-text-muted)' }}>{f.label}</label>
                  <input required type={f.type || 'text'} value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph}
                    className="w-full p-2 rounded-[8px] text-[13px]" style={{ background: 'transparent', border: '1px solid var(--app-border)', color: 'var(--app-text)' }} />
                </div>
              ))}
              <div className="flex gap-3 justify-end mt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-[8px] text-[13px] border cursor-pointer" style={{ borderColor: 'var(--app-border)', background: 'transparent', color: 'var(--app-text)' }}>Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-[8px] text-[13px] font-medium cursor-pointer border-0" style={{ background: 'var(--accent)', color: '#000', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Add Supplier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Suppliers;
