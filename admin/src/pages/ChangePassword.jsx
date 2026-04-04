import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
  const { user, changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(res.msg || 'Password updated successfully.');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-page-block">
      <header className="page-header">
        <p className="page-kicker">Account Security</p>
        <h2>Update Password</h2>
        <p>Signed in as {user?.email || 'admin'}.</p>
      </header>

      <div className="table-card p-4" style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSubmit}>
          {error ? <div className="admin-inline-message admin-inline-message-error">{error}</div> : null}
          {success ? <div className="admin-inline-message admin-inline-message-success">{success}</div> : null}

          <label className="form-label" htmlFor="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            name="currentPassword"
            className="form-control mb-3"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />

          <label className="form-label" htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            className="form-control mb-3"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />

          <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            className="form-control mb-4"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button className="btn btn-info fw-semibold" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ChangePassword;
