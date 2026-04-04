import { useEffect, useState } from 'react';
import API from '../api/axios';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner-border text-info" role="status" />
        <p className="mt-3 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <section className="admin-page-block">
      <div className="page-header">
        <p className="page-kicker">Overview</p>
        <h2>Dashboard</h2>
        <p>Track bookings and platform activity in one place.</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Users" value={stats.totalUsers} tone="teal" />
        <StatCard title="Services" value={stats.totalServices} tone="cyan" />
        <StatCard title="Bookings" value={stats.totalBookings} tone="amber" />
        <StatCard title="Pending" value={stats.pendingBookings} tone="rose" />
        <StatCard title="Confirmed" value={stats.confirmedBookings} tone="emerald" />
        <StatCard title="Completed" value={stats.completedBookings} tone="blue" />
      </div>
    </section>
  );
};

export default Dashboard;
