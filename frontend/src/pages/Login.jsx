import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, googleLoginUser, clearAuthError } from '../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import AuthLayout from '../layouts/AuthLayout';
import AuthBox from '../components/auth/AuthBox';
import FormInput from '../components/auth/FormInput';
import SubmitButton from '../components/auth/SubmitButton';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(form)).unwrap();
      setSuccess(true);
      toast.success('Welcome back!');
      setTimeout(() => navigate('/dashboard', { replace: true }), 800);
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast.error(typeof err === 'string' ? err : err?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(googleLoginUser(credentialResponse.credential)).unwrap();
      setSuccess(true);
      toast.success('Google login successful!');
      setTimeout(() => navigate('/dashboard', { replace: true }), 800);
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast.error(typeof err === 'string' ? err : err?.message || 'Google Login failed');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Login failed');
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your SupplyLens workspace.">
      <AuthBox shake={shake}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required />
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <label htmlFor="password" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Password</label>
              <button type="button" onClick={() => toast.info('Password reset is not enabled yet — contact your admin.')} style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', cursor: 'pointer', background: 'transparent', border: 0 }} className="hover:opacity-70 transition-opacity">
                Forgot?
              </button>
            </div>
            <FormInput type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required error={error} />
          </div>
          <SubmitButton loading={loading} success={success}>Log in</SubmitButton>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0 12px' }}>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }}></div>
          <span className="px-3" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>or continue with</span>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }}></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
        </div>

        <p className="text-center" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 14 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }} className="hover:opacity-80 transition-opacity">
            Sign up
          </Link>
        </p>
      </AuthBox>
    </AuthLayout>
  );
};

export default Login;
