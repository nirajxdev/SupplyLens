import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './redux/store.js';
import AuthBootstrap from './components/AuthBootstrap.jsx';
import router from './routes/routes.jsx';
import './index.css';
import './animations/keyframes.css';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AppProviders = ({ children }) => {
  if (!clientId) {
    console.warn('VITE_GOOGLE_CLIENT_ID missing — Google login disabled, app continues without OAuth provider.');
    return <>{children}</>;
  }
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <Provider store={store}>
        <AuthBootstrap>
          <RouterProvider router={router} />
        </AuthBootstrap>
      </Provider>
    </AppProviders>
  </StrictMode>,
);
