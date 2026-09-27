import { Outlet } from 'react-router-dom';
import AppSidebar from '../components/app/AppSidebar';
import AppNavbar from '../components/app/AppNavbar';
import { Toaster } from 'sonner';

const AppLayout = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <Toaster position="top-right" duration={3000} theme="dark" />
      <AppSidebar />

      <div className="flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-all duration-300">
        <AppNavbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
