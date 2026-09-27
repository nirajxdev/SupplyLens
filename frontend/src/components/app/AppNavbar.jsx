import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Bell, ChevronDown, LogOut, Settings, LayoutDashboard, Archive, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import { getAlerts } from '../../Instance/API';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/inventory': 'Inventory',
  '/dashboard/inventory/add': 'Add Product',
  '/dashboard/suppliers': 'Suppliers',
  '/dashboard/orders': 'Orders',
  '/dashboard/orders/create': 'Create Order',
  '/dashboard/forecast': 'Demand Forecast',
  '/dashboard/alerts': 'Alerts',
  '/dashboard/settings': 'Settings',
};

const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', end: true, allowedRoles: ['admin', 'manager', 'staff'] },
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
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchAlertCount = async () => {
      try {
        const res = await getAlerts(false); // unread only
        if (!cancelled) setAlertCount(res.data?.length || res.pagination?.total || 0);
      } catch {
        // silent — badge is best-effort
      }
    };
    if (user) fetchAlertCount();
    // Refresh alert count every minute (single poller — sidebar does not poll)
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
    <div className="flex flex-col sticky top-0 z-30" style={{ background: 'var(--app-surface)' }}>
      <header className="flex items-center justify-between px-6"
        style={{ height: 'var(--navbar-height)', borderBottom: '1px solid var(--app-border)' }}>
        <h1 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--app-text)' }}>{pageTitle}</h1>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/alerts')}
            aria-label={alertCount > 0 ? `View alerts, ${alertCount} unread` : 'View alerts'}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer bg-transparent transition-colors"
            style={{ border: '1px solid var(--app-border)', color: 'var(--app-text-muted)' }}>
            <Bell size={14} />
            {alertCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-white" 
                style={{ background: 'var(--red, #ef4444)', minWidth: '16px', height: '16px', fontSize: '10px', fontWeight: 600, padding: '0 4px' }}>
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'var(--app-overlay)', fontSize: '12px', fontWeight: 500, color: 'var(--app-text)' }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <ChevronDown size={12} style={{ color: 'var(--app-text-muted)' }} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 py-1 z-50 rounded-lg shadow-sm"
                style={{ background: 'var(--app-elevated)', border: '1px solid var(--app-border)' }}>
                {role === 'admin' && (
                  <>
                    <button onClick={() => { setShowDropdown(false); navigate('/dashboard/settings'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer bg-transparent border-0 text-left transition-colors"
                      style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--app-overlay)'; e.currentTarget.style.color = 'var(--app-text)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--app-text-muted)'; }}>
                      <Settings size={14} /> Settings
                    </button>
                    <div style={{ borderTop: '1px solid var(--app-border)', margin: '4px 0' }} />
                  </>
                )}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer bg-transparent border-0 text-left"
                  style={{ fontSize: '13px', color: 'var(--red)' }}>
                  <LogOut size={14} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile minimal navigation */}
      <nav className="md:hidden flex items-center gap-6 px-6 overflow-x-auto whitespace-nowrap hide-scrollbar"
        style={{ borderBottom: '1px solid var(--app-border)', paddingBottom: '10px', paddingTop: '10px' }}>
        {mobileNavItems.filter(item => !item.allowedRoles || item.allowedRoles.includes(role)).map((item) => (
          <NavLink key={item.path} to={item.path} end={item.end}
            className="flex flex-col items-center gap-1 opacity-70 transition-opacity"
            style={({ isActive }) => ({
              opacity: isActive ? 1 : 0.7,
              color: isActive ? 'var(--app-text)' : 'var(--app-text-muted)'
            })}>
            <item.icon size={18} />
            <span style={{ fontSize: '11px', fontWeight: 500 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppNavbar;
