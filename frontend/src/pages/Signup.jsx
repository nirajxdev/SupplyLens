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
import { ShieldCheck, Info } from 'lucide-react';

const ROLES = [
  {
    id: 'staff',
    label: 'Staff',
    badge: 'Day-to-day work',
    desc: 'Update stock, record sales, view orders and alerts.',
  },
  {
    id: 'manager',
    label: 'Manager',
    badge: 'Approvals & vendors',
    desc: 'Create orders, manage suppliers, adjust stock, view forecasts.',
  },
  {
    id: 'admin',
    label: 'Admin',
    badge: 'Full control',
    desc: 'Everything, plus team roles and workspace settings.',
  },
];

const ROLE_HINTS = {
  staff: 'Safe default — managers and admins can raise your access anytime.',
  manager: 'Joins with approval powers. Admins can adjust this later.',
  admin: 'Heads up: you become Admin only if this is a brand-new workspace (its first member). Joining an existing one? You’ll start as Staff until an admin approves.',
};

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(null); // { role } on success
  const [form, setForm] = useState({ name: '', businessName: '', email: '', password: '', role: 'staff' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await dispatch(registerUser({ ...form, organization: form.businessName })).unwrap();
      const assignedRole = data?.user?.role || 'staff';
      setSuccess({ role: assignedRole });
      toast.success(`Account created as ${assignedRole}! Please log in.`);
      if (data?.notice) toast.info(data.notice, { duration: 6000 });
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 }, colors: ['#1d4ed8', '#3b82f6', '#93c5fd'] });
      setTimeout(() => navigate('/login', { replace: true }), 2200);
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast.error(typeof err === 'string' ? err : err?.message || 'Registration failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(googleLoginUser(credentialResponse.credential)).unwrap();
      setSuccess({ role: 'member' });
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
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Account created{success.role !== 'member' && ` as ${success.role}`}</h2>
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

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', padding: 0, marginBottom: 6 }}>
              Choose your role
            </legend>
            <div role="radiogroup" aria-label="Account role" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ROLES.map((r) => {
                const selected = form.role === r.id;
                return (
                  <label
                    key={r.id}
                    style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                      border: selected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      background: selected ? 'var(--accent-light)' : 'var(--bg)',
                      paddingTop: selected ? 8.5 : 9, paddingBottom: selected ? 8.5 : 9,
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      checked={selected}
                      onChange={() => setForm({ ...form, role: r.id })}
                      style={{ marginTop: 2, accentColor: 'var(--accent)' }}
                    />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 13.5 }}>{r.label}</strong>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)',
                          background: 'var(--bg)', border: '1px solid var(--border)',
                          borderRadius: 999, padding: '1px 8px' }}>
                          {r.badge}
                        </span>
                      </span>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>
                        {r.desc}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }} role="note">
            <Info size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {ROLE_HINTS[form.role]}
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
