import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import useAutoRefresh from '../hooks/useAutoRefresh';

const CACHE_TTL_MS = 2 * 60 * 1000;

const UserBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingCachedData, setUsingCachedData] = useState(false);

  const getBookingCacheKey = useCallback(() => {
    if (!user?._id) return "";
    return `frameza_user_bookings_cache_${user._id}`;
  }, [user]);

  const readCachedBookings = useCallback(() => {
    const key = getBookingCacheKey();
    if (!key) return false;

    try {
      const cachedRaw = sessionStorage.getItem(key);
      if (!cachedRaw) return false;
      const cached = JSON.parse(cachedRaw);
      const isFresh = Date.now() - Number(cached.timestamp || 0) < CACHE_TTL_MS;
      if (!isFresh || !Array.isArray(cached.data)) return false;
      setBookings(cached.data);
      setError("");
      setUsingCachedData(true);
      return true;
    } catch {
      return false;
    }
  }, [getBookingCacheKey]);

  const writeCachedBookings = useCallback((data) => {
    const key = getBookingCacheKey();
    if (!key) return;

    try {
      sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
      // Ignore cache write errors.
    }
  }, [getBookingCacheKey]);

  const formatRefreshText = (timestamp) => {
    if (!timestamp) return 'Waiting for next sync...';
    const secondsAgo = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (secondsAgo < 5) return 'Updated just now';
    if (secondsAgo < 60) return `Updated ${secondsAgo}s ago`;
    return `Updated ${Math.floor(secondsAgo / 60)}m ago`;
  };

  const fetchBookings = useCallback(async (showLoader = false) => {
    if (!user) {
      if (showLoader) {
        setLoading(false);
      }
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      }
      const res = await API.get("/bookings/me");
      setBookings(res.data);
      writeCachedBookings(res.data);
      setError("");
      setUsingCachedData(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Failed to load your bookings.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [user, writeCachedBookings]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const hasFreshCache = readCachedBookings();
    if (hasFreshCache) {
      setLoading(false);
      fetchBookings(false);
      return;
    }

    fetchBookings(true);
  }, [fetchBookings, readCachedBookings, user]);

  const { lastRefreshAt, isRefreshing } = useAutoRefresh(() => fetchBookings(false), {
    enabled: !!user,
    intervalMs: 10000
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 'confirmed':
        return <span className="badge bg-info text-dark">Confirmed</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'cancelled':
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getStatusNote = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Ticket generated and waiting for admin approval. You will receive a confirmation email and call shortly after approval.';
      case 'confirmed':
        return 'Your ticket is accepted. A confirmation email has been sent to your registered email.';
      case 'rejected':
        return 'Your ticket was rejected by admin. Please contact support or place a new booking.';
      default:
        return '';
    }
  };

  if (!user) {
    return (
      <div className="container-fluid services-page py-5">
        <div className="container">
          <div className="section-intro text-center mb-5">
            <span className="text-uppercase text-info fw-bold">Access Required</span>
            <h1 className="text-white mb-3">My Bookings</h1>
            <p className="text-muted fs-5">
              Please log in to view your booking history and manage your sessions.
            </p>
            <Link to="/login" className="btn btn-light btn-lg mt-3">Login Now</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid services-page py-5">
        <div className="container">
          <div className="section-intro text-center mb-5">
            <span className="text-uppercase text-info fw-bold">Loading</span>
            <h1 className="text-white mb-3">Your Bookings</h1>
            <p className="text-muted fs-5">Fetching your booking details...</p>
          </div>
          <div className="text-center">
            <div className="spinner-border text-info" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid services-page py-5">
        <div className="container">
          <div className="section-intro text-center mb-5">
            <span className="text-uppercase text-danger fw-bold">Error</span>
            <h1 className="text-white mb-3">Booking Error</h1>
            <p className="text-muted fs-5">{error}</p>
            <button className="btn btn-outline-light mt-3" onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid services-page py-5">
      <div className="container">
        <div className="section-intro text-center mb-5">
          <span className="text-uppercase text-info fw-bold">Your Sessions</span>
          <h1 className="text-white mb-3">My Bookings</h1>
          <p className="text-muted fs-5">
            Track your photography sessions, view details, and manage your bookings.
          </p>
          <small className="text-secondary d-block mt-2">
            {isRefreshing ? 'Refreshing...' : formatRefreshText(lastRefreshAt)}
          </small>
          {usingCachedData ? (
            <small className="text-warning d-block">Showing cached data while refreshing...</small>
          ) : null}
        </div>

        {bookings.length === 0 ? (
          <div className="text-center">
            <div className="card shadow-lg border-0" style={{ background: 'rgba(7, 12, 21, 0.88)', border: '1px solid rgba(47, 212, 163, 0.25)' }}>
              <div className="card-body py-5">
                <h3 className="text-white mb-3">No Bookings Yet</h3>
                <p className="text-muted mb-4">You haven't booked any photography sessions yet. Start your journey today!</p>
                <Link to="/services" className="btn btn-light btn-lg">Explore Services</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {bookings.map((booking) => {
              const service = booking.serviceId || {};
              const durationHours = Number(booking.durationHours || 1);
              const totalAmount = Number(service.price || 0) * durationHours;
              const date = booking.date ? new Date(booking.date) : null;
              const formattedDate = date ? date.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : "Date not set";
              const formattedTime = date ? date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
              }) : "";

              return (
                <div key={booking._id} className="col-lg-6 col-xl-4">
                  <div className="card h-100 shadow-lg border-0 service-card" style={{ background: 'rgba(7, 12, 21, 0.88)', border: '1px solid rgba(47, 212, 163, 0.25)' }}>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title text-white mb-0">{service.title || "Booked Service"}</h5>
                        {getStatusBadge(booking.bookingStatus)}
                      </div>

                      {getStatusNote(booking.bookingStatus) ? (
                        <p className="small text-info mb-3">{getStatusNote(booking.bookingStatus)}</p>
                      ) : null}

                      <div className="booking-details mb-3">
                        <div className="detail-item mb-2">
                          <i className="fas fa-calendar-alt text-info me-2"></i>
                          <span className="text-white">{formattedDate}</span>
                        </div>
                        {formattedTime && (
                          <div className="detail-item mb-2">
                            <i className="fas fa-clock text-info me-2"></i>
                            <span className="text-white">{formattedTime}</span>
                          </div>
                        )}
                        <div className="detail-item mb-2">
                          <i className="fas fa-hourglass-half text-info me-2"></i>
                          <span className="text-white">{durationHours} hour(s)</span>
                        </div>
                        <div className="detail-item mb-2">
                          <i className="fas fa-map-marker-alt text-info me-2"></i>
                          <span className="text-white">{booking.location || "Location not specified"}</span>
                        </div>
                        <div className="detail-item">
                          <i className="fas fa-tag text-info me-2"></i>
                          <span className="text-white">{service.category || "Photography Service"}</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="notes-section mb-3">
                          <small className="text-muted d-block mb-1">Notes:</small>
                          <p className="text-white small mb-0">{booking.notes}</p>
                        </div>
                      )}

                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="price-display">
                            <span className="h5 text-info mb-0">Rs {totalAmount}</span>
                            <small className="text-muted d-block">Total Amount</small>
                          </div>
                          <div className="booking-actions">
                            <small className="text-muted">Booked on {new Date(booking.createdAt).toLocaleDateString()}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookings;
