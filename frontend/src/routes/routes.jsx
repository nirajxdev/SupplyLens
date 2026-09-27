import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Inventory = lazy(() => import('../pages/Inventory'));
const AddProduct = lazy(() => import('../pages/AddProduct'));
const Suppliers = lazy(() => import('../pages/Suppliers'));
const Orders = lazy(() => import('../pages/Orders'));
const CreateOrder = lazy(() => import('../pages/CreateOrder'));
const Forecast = lazy(() => import('../pages/Forecast'));
const Alerts = lazy(() => import('../pages/Alerts'));
const DashboardSettingsLazy = lazy(() => import('../pages/Dashboard/DashboardSettings').then(m => ({ default: m.DashboardSettings })));

const PageFallback = () => (
  <div className="p-8 flex items-center justify-center min-h-[60vh]">
    <div className="animate-pulse flex flex-col gap-4 w-full max-w-2xl">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 rounded-[8px]" style={{ background: 'var(--app-overlay)' }} />
      ))}
    </div>
  </div>
);

const lazyEl = (El) => (
  <Suspense fallback={<PageFallback />}>
    <El />
  </Suspense>
);

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8 text-center">
    <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Page not found</h1>
    <p style={{ color: 'var(--app-text-muted)', fontSize: '14px' }}>The page you’re looking for doesn’t exist.</p>
    <a href="/dashboard" style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 500 }}>Go to Dashboard</a>
  </div>
);

const routes = [
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  // Keep /register as alias for /signup
  {
    path: '/register',
    element: <Signup />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: lazyEl(Dashboard) },
      { path: 'inventory', element: lazyEl(Inventory) },
      { path: 'inventory/add', element: lazyEl(AddProduct) },
      { path: 'suppliers', element: <ProtectedRoute allowedRoles={['admin', 'manager']}>{lazyEl(Suppliers)}</ProtectedRoute> },
      { path: 'orders', element: lazyEl(Orders) },
      { path: 'orders/create', element: lazyEl(CreateOrder) },
      { path: 'forecast', element: <ProtectedRoute allowedRoles={['admin', 'manager']}>{lazyEl(Forecast)}</ProtectedRoute> },
      { path: 'alerts', element: lazyEl(Alerts) },
      { path: 'settings', element: <ProtectedRoute allowedRoles={['admin']}>{lazyEl(DashboardSettingsLazy)}</ProtectedRoute> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

const router = createBrowserRouter(routes);
export default router;
