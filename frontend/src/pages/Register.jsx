import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { errMsg } from '../api/axios.js';
import { AuthShell, Field } from './Login.jsx';

export default function Register() {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(errMsg(err, 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start analyzing documents in seconds">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name">
          <input className="input" name="name" value={form.name} onChange={onChange} required minLength={2} />
        </Field>
        <Field label="Email">
          <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
        </Field>
        <Field label="Password">
          <input
            className="input"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            minLength={8}
            placeholder="Min 8 chars, include a number"
          />
        </Field>
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Spinner /> : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
