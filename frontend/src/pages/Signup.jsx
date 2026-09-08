import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Field from '../components/Field';
import FormError from '../components/FormError';

const EMPTY_FORM = {
  name: '',
  age: '',
  email: '',
  mobile: '',
  address: '',
  aadharCardNumber: '',
  password: ''
};

function Signup() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data } = await api.post('/user/signup', form);
      login(data.token, data.user);
      toast('Account created. You can vote now!', 'success');
      navigate('/vote', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not create your account.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-narrow">
      <div className="auth-card">
        <div className="auth-head">
          <h2>Register to vote</h2>
          <p>It takes about a minute. Your Aadhar number is your voter ID.</p>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <FormError>{error}</FormError>

          <Field
            label="Full name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Asha Rao"
            value={form.name}
            onChange={handleChange}
            required
          />

          <div className="field-row">
            <Field
              label="Age"
              name="age"
              type="number"
              min="18"
              placeholder="24"
              value={form.age}
              onChange={handleChange}
            />
            <Field
              label="Mobile"
              name="mobile"
              type="tel"
              autoComplete="tel"
              placeholder="98765 43210"
              value={form.mobile}
              onChange={handleChange}
            />
          </div>

          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />

          <Field
            label="Address"
            name="address"
            type="text"
            autoComplete="street-address"
            placeholder="City, State"
            value={form.address}
            onChange={handleChange}
          />

          <Field
            label="Aadhar number"
            name="aadharCardNumber"
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012"
            value={form.aadharCardNumber}
            onChange={handleChange}
            required
          />

          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            hint="Use something you don't reuse elsewhere."
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? <span className="spinner" /> : null}
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-foot">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
