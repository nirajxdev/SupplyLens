import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Database, Users, Download, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { getUsers, updateUserRole } from '../../Instance/API';
import RoleGuard from '../../components/RoleGuard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const ToggleSwitch = ({ enabled, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    aria-label={label}
    onClick={() => onChange(!enabled)}
    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${enabled ? 'bg-[var(--accent)]' : 'bg-gray-200 dark:bg-gray-700'}`}
    style={{ border: enabled ? 'none' : '1px solid var(--app-border)' }}
  >
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="w-4 h-4 bg-white rounded-full shadow-md block"
      style={{ marginLeft: enabled ? '20px' : '0px' }}
    />
  </button>
);

const RoleBadge = ({ role }) => {
  const styles = {
    admin: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
    manager: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' },
    staff: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' }
  };
  const s = styles[role?.toLowerCase()] || styles.staff;
  
  return (
    <span className="px-2.5 py-1 text-xs font-semibold rounded-full capitalize flex items-center justify-center w-max" style={s}>
      {role}
    </span>
  );
};

export const DashboardSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const [threshold, setThreshold] = useState(() => Number(localStorage.getItem('sl_threshold') || 25));
  const [usersList, setUsersList] = useState([]);
  
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sl_notifications')) || {
        lowStock: true,
        supplierDelay: true,
        reorder: false,
        weekly: false
      };
    } catch {
      return { lowStock: true, supplierDelay: true, reorder: false, weekly: false };
    }
  });

  const handleSave = (e) => { 
    e.preventDefault(); 
    localStorage.setItem('sl_threshold', String(threshold));
    localStorage.setItem('sl_notifications', JSON.stringify(notifications));
    toast.success('Settings saved locally', {
      description: 'Thresholds and alert preferences are stored on this device.'
    }); 
  };

  const handleExport = () => {
    toast.info('CSV export is not available yet — use Inventory → product list for now.');
  };

  const fetchAllUsers = async () => {
    try {
      const res = await getUsers();
      const list = Array.isArray(res) ? res : (res?.data || res?.users || []);
      setUsersList(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      fetchAllUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllUsers();
    }
  }, [user]);

  return (
    <motion.div 
      className="p-8 pb-20 max-w-[1200px] mx-auto" 
      initial="hidden" 
      animate="show" 
      variants={containerVariants}
    >
      <div className="flex flex-col mb-10">
        <motion.h1 variants={itemVariants} className="text-3xl lg:text-4xl font-bold tracking-tight text-[var(--app-text)]">
          Settings
        </motion.h1>
        <motion.p variants={itemVariants} className="text-sm text-[var(--app-text-muted)] mt-2">
          Manage your account preferences and application parameters.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Account & Data) */}
        <div className="flex flex-col gap-6 xl:col-span-1">
          
          {/* Account Settings */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl flex flex-col gap-6" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-inner">
                <Shield size={18} className="text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--app-text)]">My Account</h3>
                <p className="text-xs text-[var(--app-text-muted)]">Personal details</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              {[{ label: 'Name', value: user?.name || 'User' }, { label: 'Email', value: user?.email || 'user@co.com' }].map(f => (
                <div key={f.label}>
                  <p className="text-xs font-semibold tracking-wider uppercase text-[var(--app-text-muted)] mb-1.5">{f.label}</p>
                  <div className="px-4 py-2.5 rounded-xl text-sm text-[var(--app-text)] bg-[var(--app-elevated)] border border-[var(--app-border)] shadow-sm">
                    {f.value}
                  </div>
                </div>
              ))}
              <div>
                <p className="text-xs font-semibold tracking-wider uppercase text-[var(--app-text-muted)] mb-1.5">Role</p>
                <RoleBadge role={user?.role || 'admin'} />
              </div>
            </div>
          </motion.div>

          {/* Data & Integrations */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl flex flex-col gap-6" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-inner">
                <Database size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--app-text)]">Data Center</h3>
                <p className="text-xs text-[var(--app-text-muted)]">Export & API Access</p>
              </div>
            </div>
            
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-[var(--app-text-muted)] mb-1.5">API Key</p>
              <div className="flex gap-2">
                <input type="password" value="API keys are not enabled in this build" readOnly className="flex-1 py-2.5 px-4 rounded-xl outline-none text-sm font-mono text-[var(--app-text-muted)] bg-[var(--app-elevated)] border border-[var(--app-border)] shadow-sm" />
              </div>
            </div>
            <button type="button" onClick={handleExport} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-[var(--app-overlay)] text-[var(--app-text)] border border-[var(--app-border)] shadow-sm">
              <Download size={16} /> Export All CSV
            </button>
          </motion.div>
        </div>

        {/* Right Column (Inventory, Notifications, Users) */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inventory Params */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl flex flex-col gap-6" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 shadow-inner">
                  <Settings size={18} className="text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--app-text)]">Inventory Params</h3>
                  <p className="text-xs text-[var(--app-text-muted)]">Global Thresholds</p>
                </div>
              </div>
              
              <form onSubmit={handleSave} className="flex flex-col gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold tracking-wider uppercase text-[var(--app-text-muted)]">Safety Threshold</label>
                    <span className="text-sm font-mono font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md">{threshold}%</span>
                  </div>
                  <input type="range" min="10" max="50" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-[var(--accent)]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-[var(--app-text-muted)] mb-2">Lead Days Buffer</label>
                  <input type="number" defaultValue={3} className="w-full py-2.5 px-4 rounded-xl outline-none text-sm text-[var(--app-text)] bg-[var(--app-elevated)] border border-[var(--app-border)] shadow-sm focus:border-[var(--accent)] transition-colors" />
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 shadow-lg shadow-[var(--accent)]/20" style={{ background: 'var(--accent)' }}>
                  <Save size={16} /> Save Changes
                </button>
              </form>
            </motion.div>

            {/* Notifications */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl flex flex-col gap-6" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 shadow-inner">
                  <Bell size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--app-text)]">Alert Preferences</h3>
                  <p className="text-xs text-[var(--app-text-muted)]">System triggers</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--app-text)]">Low stock alerts</span>
                  <ToggleSwitch label="Low stock alerts" enabled={notifications.lowStock} onChange={(v) => setNotifications(prev => ({...prev, lowStock: v}))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--app-text)]">Supplier delays</span>
                  <ToggleSwitch label="Supplier delays" enabled={notifications.supplierDelay} onChange={(v) => setNotifications(prev => ({...prev, supplierDelay: v}))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--app-text)]">Reorder suggestions</span>
                  <ToggleSwitch label="Reorder suggestions" enabled={notifications.reorder} onChange={(v) => setNotifications(prev => ({...prev, reorder: v}))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--app-text)]">Weekly digest</span>
                  <ToggleSwitch label="Weekly digest" enabled={notifications.weekly} onChange={(v) => setNotifications(prev => ({...prev, weekly: v}))} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* User Management */}
          <RoleGuard allowedRoles={['admin']}>
            <motion.div variants={itemVariants} className="p-6 rounded-2xl flex flex-col gap-6 w-full overflow-hidden" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 shadow-inner">
                  <Users size={18} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--app-text)]">Team Management</h3>
                  <p className="text-xs text-[var(--app-text-muted)]">Assign roles and access levels</p>
                </div>
              </div>
              
              <div className="rounded-xl overflow-x-auto border border-[var(--app-border)] shadow-sm">
                <table className="w-full text-left min-w-[600px] border-collapse bg-[var(--app-elevated)]">
                  <thead>
                    <tr className="bg-[var(--app-overlay)] border-b border-[var(--app-border)]">
                      <th className="py-3 px-5 text-xs font-semibold tracking-wider uppercase text-[var(--app-text-muted)]">User</th>
                      <th className="py-3 px-5 text-xs font-semibold tracking-wider uppercase text-[var(--app-text-muted)]">Role Access</th>
                      <th className="py-3 px-5 text-xs font-semibold tracking-wider uppercase text-[var(--app-text-muted)] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length === 0 ? (
                      <tr><td colSpan="3" className="py-8 px-5 text-center text-sm text-[var(--app-text-muted)]">No users found.</td></tr>
                    ) : (
                      usersList.map((u, i) => (
                        <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={u._id} 
                          className="border-b border-[var(--app-border)] last:border-0 hover:bg-[var(--app-overlay)] transition-colors"
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shadow-inner">
                                {(u.name?.charAt(0) || 'U').toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-[var(--app-text)]">{u.name} {u._id === user?._id && <span className="text-xs font-normal text-[var(--app-text-muted)] ml-1">(You)</span>}</span>
                                <span className="text-xs text-[var(--app-text-muted)]">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <RoleBadge role={u.role} />
                          </td>
                          <td className="py-4 px-5 text-right">
                            <select 
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              disabled={u._id === user?._id}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium outline-none cursor-pointer transition-shadow focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ 
                                background: 'var(--app-surface)', 
                                border: '1px solid var(--app-border)', 
                                color: 'var(--app-text)' 
                              }}
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="staff">Staff</option>
                            </select>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </RoleGuard>

        </div>
      </div>
    </motion.div>
  );
};
