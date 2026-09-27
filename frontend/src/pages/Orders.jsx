import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusPill from '../components/app/StatusPill';
import DrawerPanel from '../components/app/DrawerPanel';
import { Link } from 'react-router-dom';
import RoleGuard from '../components/RoleGuard';
import { getOrders, updateOrderStatus } from '../Instance/API.js';
import { toast } from 'sonner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOrder, setDrawerOrder] = useState(null);
  
  const [confirmModal, setConfirmModal] = useState({ open: false, order: null, newStatus: null });

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

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChangeClick = (order, newStatus) => {
    if (newStatus === 'delivered') {
      setConfirmModal({ open: true, order, newStatus });
    } else {
      executeStatusUpdate(order._id, newStatus);
    }
  };

  const executeStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      setConfirmModal({ open: false, order: null, newStatus: null });
      fetchAllOrders(); // refresh
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  if (loading) {
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
      <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 500, letterSpacing: '-1px' }}>Orders</h1>
          <RoleGuard allowedRoles={['admin', 'manager']}>
            <Link to="/dashboard/orders/create">
              <motion.button
                className="btn-shimmer flex items-center gap-2 px-4 py-2.5 rounded-[10px] cursor-pointer border-0"
                style={{ background: 'var(--accent)', color: '#000', fontSize: '13px', fontWeight: 500 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                + Create Order
              </motion.button>
            </Link>
          </RoleGuard>
      </div>

      <div className="rounded-[12px] overflow-x-auto" style={{ border: '1px solid var(--app-border)' }}>
        <table className="w-full min-w-[700px]" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--app-border)', background: 'var(--app-surface)' }}>
              {['Order ID', 'Supplier', 'Items', 'Total', 'Expected Date', 'Status', 'Actions'].map(h => (
                <th key={h} className={h === 'Actions' ? "text-right py-3 px-4" : "text-left py-3 px-4"} style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--app-text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {orders.length === 0 ? (
                <tr>
                    <td colSpan="7" className="py-16 text-center">
                        <p style={{ color: 'var(--app-text-muted)', fontSize: '14px' }}>No orders yet. Create your first order.</p>
                        <RoleGuard allowedRoles={['admin', 'manager']}>
                          <Link to="/dashboard/orders/create" className="mt-4 inline-block text-[13px] font-medium" style={{ color: 'var(--accent)' }}>+ Create Order</Link>
                        </RoleGuard>
                    </td>
                </tr>
              ) : orders.map((o) => {
                const totalQty = o.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                const formattedDate = o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toLocaleDateString() : 'N/A';
                
                return (
                  <motion.tr
                    key={o._id}
                    className="cursor-pointer transition-colors duration-150 group"
                    style={{ borderBottom: '1px solid var(--app-border)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--app-overlay)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td className="py-3 px-4" onClick={() => setDrawerOrder(o)} style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent)' }}>{o._id.substring(o._id.length - 6)}</td>
                    <td className="py-3 px-4" onClick={() => setDrawerOrder(o)} style={{ fontSize: '14px', fontWeight: 500, color: 'var(--app-text)' }}>{o.supplier?.name || 'Unknown'}</td>
                    <td className="py-3 px-4" onClick={() => setDrawerOrder(o)} style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--app-text)' }}>{totalQty} items</td>
                    <td className="py-3 px-4" onClick={() => setDrawerOrder(o)} style={{ fontSize: '14px', fontWeight: 500, color: 'var(--app-text)' }}>${o.totalAmount}</td>
                    <td className="py-3 px-4" onClick={() => setDrawerOrder(o)} style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>{formattedDate}</td>
                    <td className="py-3 px-4" onClick={() => setDrawerOrder(o)}>
                        <StatusPill status={o.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                        {['pending', 'shipped'].includes(o.status) && (
                            <select 
                                value=""
                                aria-label={`Change status for order ${o._id}`}
                                onChange={(e) => handleStatusChangeClick(o, e.target.value)}
                                className="px-2 py-1 rounded-[6px] text-[12px] font-medium border outline-none"
                                style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
                            >
                                <option value="" disabled>Change Status</option>
                                {o.status === 'pending' && <option value="shipped">Mark Shipped</option>}
                                <option value="delivered">Mark Delivered</option>
                                <option value="cancelled">Cancel Order</option>
                            </select>
                        )}
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <DrawerPanel isOpen={!!drawerOrder} onClose={() => setDrawerOrder(null)} title={`Order Details`}>
        {drawerOrder && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Order ID', value: drawerOrder._id },
                { label: 'Supplier', value: drawerOrder.supplier?.name },
                { label: 'Total Amount', value: `$${drawerOrder.totalAmount}` },
                { label: 'Expected Date', value: drawerOrder.expectedDeliveryDate ? new Date(drawerOrder.expectedDeliveryDate).toLocaleDateString() : 'N/A' },
                { label: 'Status', value: <StatusPill status={drawerOrder.status} /> },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--app-text-muted)', marginBottom: '4px' }}>{label}</p>
                  <div style={{ fontSize: '14px', color: 'var(--app-text)' }}>{value}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
                <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--app-text-muted)', marginBottom: '8px' }}>Order Items</p>
                <div className="flex flex-col gap-2">
                    {drawerOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-[8px]" style={{ background: 'var(--app-overlay)' }}>
                            <div className="flex flex-col">
                                <span style={{ fontSize: '13px', color: 'var(--app-text)' }}>{item.product?.name || 'Product'}</span>
                                <span style={{ fontSize: '11px', color: 'var(--app-text-muted)' }}>Qty: {item.quantity}</span>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>${item.unitPrice * item.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}
      </DrawerPanel>

      {/* Confirmation Modal */}
      {confirmModal.open && confirmModal.order && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
              <div className="rounded-[16px] p-6 w-full max-w-[400px]" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
                  <h2 className="text-[18px] font-medium mb-4">Confirm Delivery</h2>
                  <p className="text-[14px] text-[var(--app-text-muted)] mb-6">
                      Marking this order as Delivered will automatically add {confirmModal.order.items?.reduce((s, i) => s + i.quantity, 0)} units to inventory. Confirm?
                  </p>
                  <div className="flex gap-3 justify-end">
                      <button onClick={() => setConfirmModal({ open: false, order: null, newStatus: null })} className="px-4 py-2 rounded-[8px] text-[13px] border cursor-pointer" style={{ borderColor: 'var(--app-border)', background: 'transparent', color: 'var(--app-text)' }}>Go Back</button>
                      <button onClick={() => executeStatusUpdate(confirmModal.order._id, 'delivered')} className="px-4 py-2 rounded-[8px] text-[13px] font-medium cursor-pointer border-0" style={{ background: 'var(--accent)', color: '#000' }}>Confirm Delivered</button>
                  </div>
              </div>
          </div>
      )}
    </motion.div>
  );
};

export default Orders;
