import { useEffect, useMemo, useState } from 'react';
import API from '../api/axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (userId, userName) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${userName}?`);
    if (!confirmed) return;

    try {
      setUpdatingId(userId);
      setError('');
      await API.delete(`/admin/users/${userId}`);
      setUsers((current) => current.filter((user) => user._id !== userId));
      setSuccess(`User ${userName} deleted successfully.`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete user.');
      setSuccess('');
    } finally {
      setUpdatingId('');
    }
  };

  const filteredUsers = useMemo(() => {
    const byRole = users.filter((user) => (user.role || 'user') === selectedRole);

    if (!query.trim()) return byRole;
    const keyword = query.trim().toLowerCase();
    return byRole.filter((user) => {
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return name.includes(keyword) || email.includes(keyword);
    });
  }, [query, selectedRole, users]);

  const adminCount = useMemo(() => users.filter((user) => (user.role || 'user') === 'admin').length, [users]);
  const userCount = useMemo(() => users.filter((user) => (user.role || 'user') === 'user').length, [users]);

  const updateRole = async (userId, role) => {
    try {
      setUpdatingId(userId);
      setError('');
      const res = await API.put(`/admin/users/${userId}/role`, { role });
      setUsers((current) => current.map((user) => (user._id === userId ? res.data : user)));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update user role.');
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner-border text-info" role="status" />
        <p className="mt-3 text-muted">Loading users...</p>
      </div>
    );
  }

  return (
    <section className="admin-page-block">
      <div className="page-header page-header-row">
        <div>
          <p className="page-kicker">Accounts</p>
          <h2>Users</h2>
          <p>Switch between admin and user accounts to review each group separately.</p>
        </div>

        <div className="filter-box">
          <label htmlFor="user-search">Search</label>
          <input
            id="user-search"
            type="text"
            className="form-control"
            placeholder="Search name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {success ? <div className="alert alert-success mb-3">{success}</div> : null}
      <div className="table-actions flex-wrap mb-3">
        <button
          type="button"
          className={`btn btn-sm ${selectedRole === 'admin' ? 'btn-info text-dark' : 'btn-outline-light'}`}
          onClick={() => setSelectedRole('admin')}
        >
          Admin Accounts ({adminCount})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${selectedRole === 'user' ? 'btn-secondary' : 'btn-outline-light'}`}
          onClick={() => setSelectedRole('user')}
        >
          User Accounts ({userCount})
        </button>
      </div>

      {error ? <div className="alert alert-danger mb-0">{error}</div> : null}

      <div className="table-card">
        <div className="table-responsive">
          <table className="table admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registered</th>
                <th>Role</th>
                <th>Action</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>6
                  <td colSpan="5" className="text-center text-muted py-4">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name || 'Unnamed user'}</strong>
                    </td>
                    <td>{user.email || 'No email'}</td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                        {(user.role || 'user').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions flex-wrap">
                        <button
                          type="button"
                          className={`btn btn-sm ${user.role === 'user' ? 'btn-secondary' : 'btn-outline-light'}`}
                          disabled={updatingId === user._id || user.role === 'user'}
                          onClick={() => updateRole(user._id, 'user')}
                        >
                          User
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${user.role === 'admin' ? 'btn-info text-dark' : 'btn-outline-light'}`}
                          disabled={updatingId === user._id || user.role === 'admin'}
                          onClick={() => updateRole(user._id, 'admin')}
                        >
                          Admin
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        disabled={updatingId === user._id}
                        onClick={() => deleteUser(user._id, user.name || user.email)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Users;
