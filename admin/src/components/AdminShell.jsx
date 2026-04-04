import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const AdminShell = () => {
  const { user, logout } = useAuth();

  return (
    <div className="admin-app-shell">
      <aside className="admin-sidebar">
        <div className="brand-block">
          <img src="/logo-frameza.png" alt="Frameza logo" className="brand-mark" />
          <div>
            <h1>Frameza Admin</h1>
            <p>Site dashboard</p>
            
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/" end className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/bookings" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            Bookings
          </NavLink>
          <NavLink to="/services" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            Services
          </NavLink>
          <NavLink to="/gallery" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            Gallery
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            Users
          </NavLink>
          <NavLink to="/change-password" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            Update Password
          </NavLink>
        </nav>

        <div className="admin-user-card">
          <span>Signed in as</span>
          <strong>{user?.name || 'Admin'}</strong>
          <small>{user?.email}</small>
        </div>

        <div className="admin-actions">
          <button type="button" className="btn btn-outline-light w-100" onClick={logout}>
            Logout
          </button>
          <Link to="/" className="btn btn-light w-100">
            Refresh Panel
          </Link>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminShell;

