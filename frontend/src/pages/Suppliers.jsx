import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliers, addSupplier } from '../redux/slices/supplierSlice';
import RoleGuard from '../components/RoleGuard';
import Modal from '../components/shared/Modal';
import SkeletonLoader from '../components/shared/SkeletonLoader';
import StatusPill from '../components/app/StatusPill';
import { toast } from 'sonner';
import { Plus, Mail, Phone } from 'lucide-react';

const scoreTone = (score) => {
  if (score >= 90) return 'ent-pill-green';
  if (score >= 70) return 'ent-pill-amber';
  return 'ent-pill-red';
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

  return (
    <div className="ent-page">
      <div className="ent-page-header">
        <div>
          <div className="ent-page-title">Suppliers</div>
          <div className="ent-page-sub">{suppliers?.length || 0} vendors · reliability scored from delivery history.</div>
        </div>
        <div className="ent-page-actions">
          <RoleGuard allowedRoles={['admin', 'manager']}>
            <button onClick={() => setModalOpen(true)} className="ent-btn ent-btn-primary ent-btn-sm"><Plus size={13} /> Add Supplier</button>
          </RoleGuard>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader rows={6} />
      ) : suppliers?.length === 0 ? (
        <div className="ent-card"><div className="ent-empty">
          <p className="ent-empty-title">No suppliers yet</p>
          <p className="ent-empty-sub">Add your first vendor to start creating purchase orders.</p>
          <div style={{ marginTop: 12 }}>
            <RoleGuard allowedRoles={['admin', 'manager']}>
              <button onClick={() => setModalOpen(true)} className="ent-btn ent-btn-primary ent-btn-sm"><Plus size={13} /> Add Supplier</button>
            </RoleGuard>
          </div>
        </div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
          {suppliers?.map((s) => {
            const score = s.reliabilityScore ?? 100;
            return (
              <div key={s._id || s.id} className="ent-card ent-card-pad">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 650 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>{s.contactPerson || '—'}</div>
                  </div>
                  <span className={`ent-pill ${scoreTone(score)}`}><span className="dot" />{score}%</span>
                </div>
                <div style={{ marginTop: 8, height: 4, borderRadius: 4, background: 'var(--app-border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${score}%`, background: score >= 90 ? 'var(--green)' : score >= 70 ? 'var(--amber)' : 'var(--red)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 10, fontSize: 12, color: 'var(--app-text-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Mail size={12} /> {s.email}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Phone size={12} /> {s.phone || '—'} · {s.averageDeliveryDays ?? 0}d avg lead</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Supplier"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="ent-btn ent-btn-secondary">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="ent-btn ent-btn-primary">{saving ? 'Saving…' : 'Add Supplier'}</button>
          </>
        }
      >
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { k: 'name', label: 'Company name', ph: 'Acme Foods', req: true },
            { k: 'contactPerson', label: 'Contact person', ph: 'Jane Doe', req: true },
            { k: 'email', label: 'Email', ph: 'ops@acme.com', type: 'email', req: true },
            { k: 'phone', label: 'Phone', ph: '+1 555 0100', req: true },
            { k: 'address', label: 'Address', ph: '123 Market St', req: true },
          ].map((f) => (
            <div key={f.k}>
              <label className="ent-label" htmlFor={`sup-${f.k}`}>{f.label}</label>
              <input id={`sup-${f.k}`} required={f.req} type={f.type || 'text'} value={form[f.k]}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} className="ent-input" />
            </div>
          ))}
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
