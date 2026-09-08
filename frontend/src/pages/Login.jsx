import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Field from '../components/Field';
import FormError from '../components/FormError';

function Login() {
  const [form, setForm] = useState({ aadharCardNumber: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const { data } = await api.post('/user/login', form);
      login(data.token, data.user);
      toast(`Welcome back, ${data.user?.name?.split(' ')[0] || 'voter'}!`, 'success');
      navigate(location.state?.from || '/vote', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not sign you in.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-narrow">
      <div className="auth-card">
        <div className="auth-head">
          <h2>Welcome back</h2>
          <p>Sign in to cast or review your vote.</p>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <FormError>{error}</FormError>

          <Field
            label="Aadhar number"
            name="aadharCardNumber"
            type="text"
            inputMode="numeric"
            autoComplete="username"
            placeholder="1234 5678 9012"
            value={form.aadharCardNumber}
            onChange={handleChange}
            required
          />

          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? <span className="spinner" /> : null}
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-foot">
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
