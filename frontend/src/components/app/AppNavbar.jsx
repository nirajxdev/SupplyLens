import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Bell, ChevronDown, ChevronRight, LogOut, Settings, LayoutDashboard, Archive, Users, ShoppingCart, TrendingUp, Search } from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import { getAlerts } from '../../Instance/API';

const CRUMBS = {
  '/dashboard': ['Dashboard'],
  '/dashboard/inventory': ['Dashboard', 'Inventory'],
  '/dashboard/inventory/add': ['Dashboard', 'Inventory', 'Add Product'],
  '/dashboard/suppliers': ['Dashboard', 'Suppliers'],
  '/dashboard/orders': ['Dashboard', 'Orders'],
  '/dashboard/orders/create': ['Dashboard', 'Orders', 'New Order'],
  '/dashboard/forecast': ['Dashboard', 'Forecast'],
  '/dashboard/alerts': ['Dashboard', 'Alerts'],
  '/dashboard/settings': ['Dashboard', 'Settings'],
};

const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard', end: true, allowedRoles: ['admin', 'manager', 'staff'] },
  { icon: Archive, label: 'Inventory', path: '/dashboard/inventory', allowedRoles: ['admin', 'manager', 'staff'] },
  { icon: ShoppingCart, label: 'Orders', path: '/dashboard/orders', allowedRoles: ['admin', 'manager', 'staff'] },
  { icon: Users, label: 'Suppliers', path: '/dashboard/suppliers', allowedRoles: ['admin', 'manager'] },
  { icon: TrendingUp, label: 'Forecast', path: '/dashboard/forecast', allowedRoles: ['admin', 'manager'] },
  { icon: Bell, label: 'Alerts', path: '/dashboard/alerts', allowedRoles: ['admin', 'manager', 'staff'] },
];

const AppNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, role } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const dropdownRef = useRef(null);
  const crumbs = CRUMBS[location.pathname] || ['Dashboard'];

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    const interval = setInterval(() => { if (user) fetchAlertCount(); }, 60000);
    const onFocus = () => { if (user) fetchAlertCount(); };
    window.addEventListener('focus', onFocus);
    return () => { cancelled = true; clearInterval(interval); window.removeEventListener('focus', onFocus); };
  }, [user]);

  const handleLogout = async () => {
    setShowDropdown(false);
    try { await dispatch(logoutUser()).unwrap(); navigate('/', { replace: true }); }
    catch { navigate('/', { replace: true }); }
  };

  return (
    <div className="sticky top-0 z-30" style={{ background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' }}>
      <header className="flex items-center gap-3 px-4 md:px-5" style={{ height: 'var(--navbar-height)' }}>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, minWidth: 0 }}>
          {crumbs.map((c, i) => (
            <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <ChevronRight size={13} style={{ color: 'var(--app-text-faint)' }} />}
              <span style={i === crumbs.length - 1
                ? { fontWeight: 650, color: 'var(--app-text)' }
                : { color: 'var(--app-text-muted)' }}>
                {c}
              </span>
            </span>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Search (visual affordance; filters live on list pages) */}
        <div className="hidden sm:block ent-search" style={{ width: 220 }}>
          <Search size={13} />
          <input
            className="ent-input"
            style={{ height: 30, fontSize: 12.5 }}
            placeholder="Search…  ( / )"
            aria-label="Search"
            onFocus={(e) => { e.target.placeholder = 'Use filters on list pages'; }}
            onBlur={(e) => { e.target.placeholder = 'Search…  ( / )'; }}
            readOnly
          />
        </div>

        <button
          onClick={() => navigate('/dashboard/alerts')}
          aria-label={alertCount > 0 ? `View alerts, ${alertCount} unread` : 'View alerts'}
          className="ent-btn ent-btn-secondary ent-btn-sm"
          style={{ padding: '0 8px', position: 'relative' }}
        >
          <Bell size={14} />
          {alertCount > 0 && (
            <span className="ent-count" style={{ background: 'var(--red-bg)', borderColor: 'var(--red-border)', color: 'var(--red)' }}>
              {alertCount > 99 ? '99+' : alertCount}
            </span>
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            aria-haspopup="menu"
            aria-expanded={showDropdown}
            className="ent-btn ent-btn-ghost ent-btn-sm"
            style={{ padding: '0 6px' }}
          >
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-soft)',
              border: '1px solid var(--blue-border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'var(--accent-text)' }}>
              {(user?.name?.charAt(0) || 'U').toUpperCase()}
            </span>
            <span className="hidden md:inline" style={{ fontSize: 12.5, fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </span>
            <ChevronDown size={13} style={{ color: 'var(--app-text-muted)' }} />
          </button>

          {showDropdown && (
            <div role="menu" style={{ position: 'absolute', right: 0, marginTop: 6, width: 200, zIndex: 50,
              background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: 8, boxShadow: 'var(--shadow-pop)', padding: 4 }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--app-border)', marginBottom: 4 }}>
                <p style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--app-text)' }} className="truncate">{user?.name}</p>
                <p style={{ fontSize: 11.5, color: 'var(--app-text-muted)' }} className="truncate">{user?.email} · <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></p>
              </div>
              {role === 'admin' && (
                <button
                  onClick={() => { setShowDropdown(false); navigate('/dashboard/settings'); }}
                  className="ent-nav-item" style={{ width: '100%' }} role="menuitem"
                >
                  <Settings size={14} /><span>Settings</span>
                </button>
              )}
              <button onClick={handleLogout} className="ent-nav-item" style={{ width: '100%', color: 'var(--red)' }} role="menuitem">
                <LogOut size={14} /><span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center gap-1 px-3 overflow-x-auto whitespace-nowrap hide-scrollbar" style={{ paddingBottom: 8 }}>
        {mobileNavItems.filter((item) => !item.allowedRoles || item.allowedRoles.includes(role)).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `ent-nav-item${isActive ? ' active' : ''}`}
            style={{ width: 'auto', padding: '0 10px' }}
          >
            <item.icon size={14} />
            <span style={{ fontSize: 12 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppNavbar;
