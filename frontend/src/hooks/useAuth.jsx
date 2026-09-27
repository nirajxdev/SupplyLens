import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, isAuthenticated, checkingAuth } = useSelector((state) => state.auth);
  
  return {
    user,
    role: user?.role,
    isAuthenticated,
    checkingAuth,
    // Dual auth: Bearer token in localStorage (for API header) + HttpOnly cookie (credentials:include).
    // Token presence is checked lazily to avoid SSR/localStorage crashes.
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  };
};

export default useAuth;
