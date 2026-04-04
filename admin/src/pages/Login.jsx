import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);
      if (result.user?.role !== 'admin') {
        setError('Admin access required.');
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="login-kicker">Frameza Admin</p>
        <h1>Sign in to dashboard</h1>
        <p className="login-text">Use an admin account to manage bookings and monitor activity.</p>

        <form onSubmit={handleSubmit}>
          {error ? <div className="alert alert-danger">{error}</div> : null}

          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            className="form-control mb-3"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            className="form-control mb-4"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button className="btn btn-info w-100 fw-semibold" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
