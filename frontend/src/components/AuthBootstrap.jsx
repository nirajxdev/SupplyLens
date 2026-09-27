import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../redux/slices/authSlice.js";

const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();
  const checkingAuth = useSelector((state) => state.auth.checkingAuth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-6 h-6 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  return children;
};

export default AuthBootstrap;
