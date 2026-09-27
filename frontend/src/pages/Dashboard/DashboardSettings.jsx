import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { getUsers, updateUserRole } from '../../Instance/API';
import RoleGuard from '../../components/RoleGuard';
import StatusPill from '../../components/app/StatusPill';
import SkeletonLoader from '../../components/shared/SkeletonLoader';
import { Download, Save } from 'lucide-react';

const ToggleSwitch = ({ enabled, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    aria-label={label}
    onClick={() => onChange(!enabled)}
    style={{
      width: 34, height: 19, borderRadius: 999, padding: 2, cursor: 'pointer', flexShrink: 0,
      background: enabled ? 'var(--accent)' : '#cbd5e1', border: 'none', display: 'flex',
      justifyContent: enabled ? 'flex-end' : 'flex-start', transition: 'background 120ms',
    }}
  >
    <span style={{ width: 15, height: 15, borderRadius: '50%', background: '#fff', display: 'block' }} />
  </button>
);

const roleTone = { admin: 'high', manager: 'medium', staff: 'low' };

export const DashboardSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const [threshold, setThreshold] = useState(() => Number(localStorage.getItem('sl_threshold') || 25));
  const [leadBuffer, setLeadBuffer] = useState(() => Number(localStorage.getItem('sl_lead_buffer') || 3));
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sl_notifications')) || { lowStock: true, supplierDelay: true, reorder: false, weekly: false };
    } catch {
      return { lowStock: true, supplierDelay: true, reorder: false, weekly: false };
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('sl_threshold', String(threshold));
    localStorage.setItem('sl_lead_buffer', String(leadBuffer));
    localStorage.setItem('sl_notifications', JSON.stringify(notifications));
    toast.success('Settings saved on this device');
  };

  const fetchAllUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await getUsers();
      setUsersList(Array.isArray(res) ? res : res?.data || res?.users || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('Role updated');
      fetchAllUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return (
    <div className="ent-page" style={{ maxWidth: 1100 }}>
      <div className="ent-page-header">
        <div>
          <div className="ent-page-title">Settings</div>
          <div className="ent-page-sub">Account, thresholds, notifications and team access.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr' }} className="settings-split">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Account */}
          <section className="ent-card ent-card-pad">
            <div className="ent-section-label" style={{ marginBottom: 10 }}>My Account</div>
            <dl style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 8, fontSize: 13, margin: 0 }}>
              <dt style={{ color: 'var(--app-text-muted)' }}>Name</dt><dd style={{ margin: 0, fontWeight: 600 }}>{user?.name || '—'}</dd>
              <dt style={{ color: 'var(--app-text-muted)' }}>Email</dt><dd style={{ margin: 0 }} className="ent-mono">{user?.email || '—'}</dd>
              <dt style={{ color: 'var(--app-text-muted)' }}>Role</dt><dd style={{ margin: 0 }}><StatusPill status={roleTone[user?.role] || 'low'} label={user?.role || 'staff'} /></dd>
              <dt style={{ color: 'var(--app-text-muted)' }}>Organization</dt><dd style={{ margin: 0 }}>{user?.organization || '—'}</dd>
            </dl>
          </section>

          {/* Thresholds */}
          <section className="ent-card ent-card-pad">
            <div className="ent-section-label" style={{ marginBottom: 10 }}>Inventory Thresholds</div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label className="ent-label" htmlFor="set-threshold" style={{ marginBottom: 0 }}>Safety threshold</label>
                  <span className="ent-mono" style={{ fontWeight: 700, color: 'var(--accent-text)' }}>{threshold}%</span>
                </div>
                <input id="set-threshold" type="range" min={10} max={50} value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
              </div>
              <div>
                <label className="ent-label" htmlFor="set-lead">Lead-days buffer</label>
                <input id="set-lead" type="number" min={0} value={leadBuffer}
                  onChange={(e) => setLeadBuffer(Number(e.target.value))} className="ent-input" />
              </div>
              <div>
                <div className="ent-section-label" style={{ marginBottom: 6 }}>Alert Preferences</div>
                {[
                  { k: 'lowStock', label: 'Low stock alerts' },
                  { k: 'supplierDelay', label: 'Supplier delays' },
                  { k: 'reorder', label: 'Reorder suggestions' },
                  { k: 'weekly', label: 'Weekly digest' },
                ].map((n) => (
                  <div key={n.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--app-border)' }}>
                    <span style={{ fontSize: 13 }}>{n.label}</span>
                    <ToggleSwitch label={n.label} enabled={notifications[n.k]} onChange={(v) => setNotifications((p) => ({ ...p, [n.k]: v }))} />
                  </div>
                ))}
              </div>
              <button type="submit" className="ent-btn ent-btn-primary ent-btn-sm" style={{ alignSelf: 'flex-start' }}>
                <Save size={13} /> Save Changes
              </button>
              <p style={{ fontSize: 11.5, color: 'var(--app-text-faint)' }}>Stored locally on this device. Server-side thresholds ship with org policies.</p>
            </form>
          </section>

          {/* Data */}
          <section className="ent-card ent-card-pad">
            <div className="ent-section-label" style={{ marginBottom: 10 }}>Data Export</div>
            <p style={{ fontSize: 12.5, color: 'var(--app-text-muted)', marginBottom: 10 }}>CSV export and API keys are not enabled in this build.</p>
            <button onClick={() => toast.info('CSV export is not available yet.')} className="ent-btn ent-btn-secondary ent-btn-sm">
              <Download size={13} /> Export All CSV
            </button>
          </section>
        </div>

        {/* Team */}
        <RoleGuard allowedRoles={['admin']}>
          <section className="ent-card" style={{ alignSelf: 'start' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--app-border)' }}>
              <div className="ent-section-label">Team Management</div>
              <div style={{ fontSize: 12, color: 'var(--app-text-muted)', marginTop: 2 }}>{usersList.length} members · roles enforced server-side</div>
            </div>
            {usersLoading ? (
              <div style={{ padding: 14 }}><SkeletonLoader rows={4} height={40} /></div>
            ) : (
              <table className="ent-table">
                <thead><tr><th scope="col">Member</th><th scope="col">Role</th><th scope="col" style={{ textAlign: 'right' }}>Access</th></tr></thead>
                <tbody>
                  {usersList.length === 0 ? (
                    <tr><td colSpan={3}><div className="ent-empty"><p className="ent-empty-sub">No team members found.</p></div></td></tr>
                  ) : usersList.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--app-overlay)',
                            border: '1px solid var(--app-border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {(u.name?.charAt(0) || 'U').toUpperCase()}
                          </span>
                          <span>
                            <span style={{ display: 'block', fontWeight: 600, fontSize: 13 }}>
                              {u.name} {u._id === user?._id && <span style={{ fontWeight: 400, color: 'var(--app-text-muted)', fontSize: 11.5 }}>(you)</span>}
                            </span>
                            <span className="ent-mono" style={{ color: 'var(--app-text-muted)' }}>{u.email}</span>
                          </span>
                        </div>
                      </td>
                      <td><StatusPill status={roleTone[u.role] || 'low'} label={u.role} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={u._id === user?._id} aria-label={`Role for ${u.name}`}
                          className="ent-select" style={{ height: 28, fontSize: 12, width: 'auto' }}>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="staff">Staff</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </RoleGuard>
      </div>

      <style>{`@media (min-width: 1024px) { .settings-split { grid-template-columns: 380px 1fr !important; align-items: start; } }`}</style>
    </div>
  );
};
