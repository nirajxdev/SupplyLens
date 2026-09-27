import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { getAlerts } from '../../Instance/API';
import { logoutUser } from '../../redux/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Archive, Users, ShoppingCart,
  TrendingUp, Bell, Settings, LogOut,
} from 'lucide-react';

const SECTIONS = [
  {
    label: 'Operate',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', end: true, allowedRoles: ['admin', 'manager', 'staff'] },
      { icon: Archive, label: 'Inventory', path: '/dashboard/inventory', allowedRoles: ['admin', 'manager', 'staff'] },
      { icon: ShoppingCart, label: 'Orders', path: '/dashboard/orders', allowedRoles: ['admin', 'manager', 'staff'] },
      { icon: Bell, label: 'Alerts', path: '/dashboard/alerts', allowedRoles: ['admin', 'manager', 'staff'] },
    ],
  },
  {
    label: 'Manage',
    items: [
      { icon: Users, label: 'Suppliers', path: '/dashboard/suppliers', allowedRoles: ['admin', 'manager'] },
      { icon: TrendingUp, label: 'Forecast', path: '/dashboard/forecast', allowedRoles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Settings, label: 'Settings', path: '/dashboard/settings', allowedRoles: ['admin'] },
    ],
  },
];

const AppSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, role } = useAuth();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchAlertCount = async () => {
      try {
        const res = await getAlerts(false);
        if (!cancelled) setAlertCount(res.data?.length || res.pagination?.total || 0);
      } catch {
        // silent — badge is best-effort
      }
    };
    if (user) fetchAlertCount();
    // NOTE: polling lives in AppNavbar (single source). Sidebar fetches once.
    return () => { cancelled = true; };
  }, [user]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out');
      navigate('/', { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  };

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-screen flex-col z-40"
      style={{ width: 'var(--sidebar-width)', background: 'var(--app-surface)', borderRight: '1px solid var(--app-border)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderBottom: '1px solid var(--app-border)' }}>
        <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent)', color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 750 }}>
          S
        </span>
        <NavLink to="/dashboard" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', color: 'var(--app-text)', textDecoration: 'none' }}>
          SupplyLens
        </NavLink>
        <span className="ent-count" style={{ marginLeft: 'auto' }}>v2</span>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 12px' }}>
        {SECTIONS.map((section) => {
          const visible = section.items.filter((item) => !item.allowedRoles || item.allowedRoles.includes(role));
          if (visible.length === 0) return null;
          return (
            <div key={section.label}>
              <div className="ent-nav-group">{section.label}</div>
              {visible.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => `ent-nav-item${isActive ? ' active' : ''}`}
                >
                  <item.icon size={15} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.label === 'Alerts' && alertCount > 0 && (
                    <span className="ent-count" style={alertCount > 0 ? { background: 'var(--red-bg)', borderColor: 'var(--red-border)', color: 'var(--red)' } : undefined}>
                      {alertCount > 99 ? '99+' : alertCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: 10, borderTop: '1px solid var(--app-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px 8px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--app-overlay)',
            border: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'var(--app-text)', flexShrink: 0 }}>
            {(user?.name?.charAt(0) || 'U').toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="truncate" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--app-text)', lineHeight: 1.3 }}>{user?.name || 'User'}</p>
            <p className="truncate" style={{ fontSize: 11.5, color: 'var(--app-text-muted)', textTransform: 'capitalize' }}>{user?.role || 'Member'} · {user?.organization || ''}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="ent-nav-item" style={{ width: '100%' }}>
          <LogOut size={15} style={{ flexShrink: 0 }} /><span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
