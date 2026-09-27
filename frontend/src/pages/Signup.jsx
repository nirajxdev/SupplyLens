import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, googleLoginUser, clearAuthError } from '../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import AuthLayout from '../layouts/AuthLayout';
import AuthBox from '../components/auth/AuthBox';
import FormInput from '../components/auth/FormInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import SubmitButton from '../components/auth/SubmitButton';
import { ShieldCheck } from 'lucide-react';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', businessName: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(registerUser({ ...form, organization: form.businessName })).unwrap();
      setSuccess(true);
      toast.success('Account created! Please log in.');
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 }, colors: ['#1d4ed8', '#3b82f6', '#93c5fd'] });
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast.error(typeof err === 'string' ? err : err?.message || 'Registration failed');
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

  if (success) {
    return (
      <AuthLayout title="Account created" subtitle="Redirecting…">
        <AuthBox>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', textAlign: 'center' }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue-bg)', color: 'var(--blue)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <ShieldCheck size={20} />
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Account created</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Redirecting to login…</p>
          </div>
        </AuthBox>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start running inventory in minutes.">
      <AuthBox shake={shake}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormInput label="Full name" name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" required />
          <FormInput label="Business name" name="businessName" value={form.businessName} onChange={handleChange} placeholder="Acme Corp" />
          <FormInput label="Work email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required error={error} />
          <div>
            <FormInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 8 characters" required />
            <div style={{ marginTop: 6 }}>
              <PasswordStrength password={form.password} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              New accounts start as <strong>Staff</strong>. An admin can grant Manager or Admin access later.
            </p>
          </div>
          <SubmitButton loading={loading}>Create account</SubmitButton>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0 12px' }}>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }}></div>
          <span className="px-3" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>or continue with</span>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }}></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>

        <p className="text-center" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12 }}>
          By signing up, you agree to our Terms and Privacy Policy.
        </p>
        <p className="text-center" style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log in</Link>
        </p>
      </AuthBox>
    </AuthLayout>
  );
};

export default Signup;
