import { useEffect, useMemo, useState } from 'react';
import API from '../api/axios';

const statusOptions = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
const approvalStatusOptions = ['completed', 'cancelled'];

const statusLabel = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingId, setSavingId] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/bookings');
      setBookings(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const visibleBookings = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter((booking) => (booking.bookingStatus || 'pending') === filter);
  }, [bookings, filter]);

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleString();
  };

  const updateStatus = async (bookingId, bookingStatus) => {
    try {
      setSavingId(bookingId);
      setError('');
      const res = await API.put(`/admin/bookings/${bookingId}`, { bookingStatus });
      setBookings((current) => current.map((booking) => (booking._id === bookingId ? res.data : booking)));
      setSuccess(`Booking updated to ${statusLabel[bookingStatus] || bookingStatus}.`);
    } catch (err) {
      setSuccess('');
      setError(err.response?.data?.msg || 'Failed to update booking.');
    } finally {
      setSavingId('');
    }
  };

  const deleteBooking = async (bookingId) => {
    const confirmed = window.confirm('Are you sure you want to delete this booking?');
    if (!confirmed) return;

    try {
      setSavingId(bookingId);
      setError('');
      await API.delete(`/admin/bookings/${bookingId}`);
      setBookings((current) => current.filter((booking) => booking._id !== bookingId));
      setSuccess('Booking deleted successfully.');
    } catch (err) {
      setSuccess('');
      setError(err.response?.data?.msg || 'Failed to delete booking.');
    } finally {
      setSavingId('');
    }
  };

  const resendEmail = async (bookingId) => {
    try {
      setSavingId(bookingId);
      setError('');
      const res = await API.post(`/admin/bookings/${bookingId}/resend-email`);
      setBookings((current) => current.map((booking) => (booking._id === bookingId ? res.data : booking)));

      const status = res.data?.ticketEmail?.status;
      if (status === 'sent') {
        setSuccess('Booking email sent successfully.');
      } else if (status === 'failed') {
        setError(res.data?.ticketEmail?.error || 'Email resend failed.');
        setSuccess('');
      } else {
        setSuccess('Email resend requested.');
      }
    } catch (err) {
      setSuccess('');
      setError(err.response?.data?.msg || 'Failed to resend email.');
    } finally {
      setSavingId('');
    }
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner-border text-info" role="status" />
        <p className="mt-3 text-muted">Loading bookings...</p>
      </div>
    );
  }

  return (
    <section className="admin-page-block">
      <div className="page-header page-header-row">
        <div>
          <p className="page-kicker">Operations</p>
          <h2>Bookings</h2>
          <p>Update booking status from the standalone admin panel.</p>
        </div>

        <div className="filter-box">
          <label htmlFor="status-filter">Filter</label>
          <select
            id="status-filter"
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {statusLabel[option]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ position: 'sticky', top: 0, zIndex: 999, maxWidth: '100%' }}>
        {error ? (
          <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert" style={{ marginBottom: '1rem' }}>
            <strong>❌ Error:</strong> {error}
            <button type="button" className="btn-close" onClick={() => setError('')} />
          </div>
        ) : null}
        {success ? (
          <div className="alert alert-success alert-dismissible fade show mb-3" role="alert" style={{ marginBottom: '1rem' }}>
            <strong>✅ Success:</strong> {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')} />
          </div>
        ) : null}
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="table admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Location</th>
                <th>Payment</th>
                <th>Payment Ref</th>
                <th>Status</th>
                <th>Email Log</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center text-muted py-4">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                visibleBookings.map((booking) => {
                  const service = booking.serviceId || {};
                  const user = booking.userId || {};
                  const currentStatus = booking.bookingStatus || 'pending';
                  const ticketEmail = booking.ticketEmail || {};
                  const emailStatus = ticketEmail.status || 'not_sent';
                  const emailType = ticketEmail.type || 'N/A';
                  const canResendEmail = currentStatus === 'confirmed' || currentStatus === 'rejected';

                  return (
                    <tr key={booking._id}>
                      <td>
                        <strong>{user.name || 'Unknown User'}</strong>
                        <div className="text-muted small">{user.email || 'No email'}</div>
                      </td>
                      <td>
                        <div>{service.title || 'Booked Service'}</div>
                        <div className="text-muted small">Rs {service.price || 0}</div>
                      </td>
                      <td>{booking.date ? new Date(booking.date).toLocaleString() : 'Not set'}</td>
                      <td>{booking.durationHours || 1} hour(s)</td>
                      <td>{booking.location || 'Not provided'}</td>
                      <td>
                        <span className={`badge ${booking.paymentStatus === 'paid' ? 'bg-success' : booking.paymentStatus === 'submitted' ? 'bg-info text-dark' : 'bg-warning text-dark'}`}>
                          {booking.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-white">
                          {booking.paymentMethod === 'cod' ? `☎️ ${booking.phoneNumber || 'N/A'}` : booking.upiRefId || 'N/A'}
                        </div>
                        {booking.paymentMethod === 'cod' && (
                          <div className="text-muted small mt-1">CoD Reference</div>
                        )}
                      </td>
                      <td>
                        <span className={`badge status-${currentStatus}`}>
                          {statusLabel[currentStatus] || currentStatus}
                        </span>
                      </td>
                      <td>
                        <div className="small">
                          <span className={`badge ${emailStatus === 'sent' ? 'bg-success' : emailStatus === 'failed' ? 'bg-danger' : 'bg-secondary'}`}>
                            {emailStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-muted small mt-1">Type: {emailType}</div>
                        <div className="text-muted small">Last Try: {formatDateTime(ticketEmail.lastAttemptAt)}</div>
                        <div className="text-muted small">Sent At: {formatDateTime(ticketEmail.sentAt)}</div>
                        {ticketEmail.error ? (
                          <div className="text-danger small mt-1">{ticketEmail.error}</div>
                        ) : null}
                      </td>
                      <td>
                        <div className="table-actions flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            disabled={savingId === booking._id || currentStatus === 'confirmed'}
                            onClick={() => updateStatus(booking._id, 'confirmed')}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            disabled={savingId === booking._id || currentStatus === 'rejected'}
                            onClick={() => updateStatus(booking._id, 'rejected')}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={savingId === booking._id}
                            onClick={() => deleteBooking(booking._id)}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info"
                            disabled={savingId === booking._id || !canResendEmail}
                            onClick={() => resendEmail(booking._id)}
                          >
                            Resend Email
                          </button>
                          <select
                            className="form-select form-select-sm"
                            value=""
                            disabled={savingId === booking._id}
                            onChange={(e) => {
                              const nextStatus = e.target.value;
                              if (nextStatus) {
                                updateStatus(booking._id, nextStatus);
                              }
                              e.target.value = '';
                            }}
                          >
                            <option value="">More status</option>
                            {approvalStatusOptions.map((option) => (
                              <option key={option} value={option}>
                                {statusLabel[option]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Bookings;
