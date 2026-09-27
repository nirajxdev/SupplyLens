import { Outlet } from 'react-router-dom';
import AppSidebar from '../components/app/AppSidebar';
import AppNavbar from '../components/app/AppNavbar';
import { Toaster } from 'sonner';

const AppLayout = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--app-bg)', color: 'var(--app-text)', fontSize: 13 }}>
      <Toaster position="top-right" duration={3000} theme="light" />
      <AppSidebar />
      <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)]">
        <AppNavbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer style={{ padding: '12px 24px', borderTop: '1px solid var(--app-border)', background: 'var(--app-surface)',
          fontSize: 11.5, color: 'var(--app-text-faint)', display: 'flex', justifyContent: 'space-between' }}>
          <span>SupplyLens Ops Console</span>
          <span className="ent-mono">org: scoped · role: enforced</span>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
