import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useAutoRefresh from '../hooks/useAutoRefresh';

// Circular Time Picker Component - Compact
const CircularTimePicker = ({ value, onChange, isOpen, onClose }) => {
  const [isAM, setIsAM] = useState(true);

  useEffect(() => {
    if (value) {
      const [hours] = value.split(':');
      const hour = parseInt(hours);
      setIsAM(hour < 12);
    }
  }, [value]);

  const handleHourClick = (displayHour) => {
    let hour = displayHour;
    if (!isAM && displayHour !== 12) {
      hour = displayHour + 12;
    } else if (isAM && displayHour === 12) {
      hour = 0;
    }
    const timeString = String(hour).padStart(2, '0') + ':00';
    onChange(timeString);
    // Auto-close after selecting time
    setTimeout(() => onClose(), 300);
  };

  const toggleAMPM = (amPmValue) => {
    if (!value) return;
    const [hours] = value.split(':');
    let hour = parseInt(hours);

    if (amPmValue === 'AM' && !isAM) {
      if (hour >= 12) hour -= 12;
      setIsAM(true);
    } else if (amPmValue === 'PM' && isAM) {
      if (hour < 12 && hour !== 0) hour += 12;
      setIsAM(false);
    }

    const timeString = String(hour).padStart(2, '0') + ':00';
    onChange(timeString);
  };

  const hours = value ? parseInt(value.split(':')[0]) : 0;
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  const getDisplayTime = () => {
    if (!value) return 'Select';
    return new Date(`2000-01-01T${value}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="time-picker-inline">
      <style>{`
        .time-picker-inline {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: linear-gradient(135deg, #1a3a3a 0%, #0f2f2f 100%);
          border: 2px solid #0cc684;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(12, 198, 132, 0.15);
          animation: slideDown 0.3s ease-out;
          width: 100%;
          margin-top: 20px;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .time-display {
          font-size: 2.2rem;
          font-weight: 700;
          color: #00ff9f;
          text-align: center;
          text-shadow: 0 0 10px rgba(0, 255, 159, 0.3);
          font-variant-numeric: tabular-nums;
          letter-spacing: 2px;
        }

        .clock-face {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 40%, rgba(0, 255, 159, 0.08), rgba(12, 198, 132, 0.02));
          border: 3px solid #0cc684;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(12, 198, 132, 0.15);
        }

        .clock-center {
          width: 10px;
          height: 10px;
          background: radial-gradient(circle, #00ff9f, #0cc684);
          border-radius: 50%;
          position: absolute;
          z-index: 30;
          box-shadow: 0 0 12px rgba(0, 255, 159, 0.8);
        }

        .hour-button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          background: rgba(12, 198, 132, 0.1);
          color: #0cc684;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
        }

        .hour-button:hover {
          background: rgba(12, 198, 132, 0.25);
          transform: scale(1.15);
          box-shadow: 0 0 10px rgba(12, 198, 132, 0.4);
        }

        .hour-button.selected {
          background: #0cc684;
          color: #0f2f2f;
          box-shadow: 0 0 15px rgba(12, 198, 132, 0.9);
          border-color: #00ff9f;
          transform: scale(1.2);
          font-weight: 800;
        }

        .hand {
          position: absolute;
          bottom: 50%;
          left: 50%;
          transform-origin: bottom center;
          background: linear-gradient(to top, #00ff9f, #0cc684);
          border-radius: 2px;
          width: 3px;
          z-index: 20;
          box-shadow: 0 0 8px rgba(0, 255, 159, 0.6);
        }

        .am-pm-toggle {
          display: flex;
          gap: 6px;
          background: rgba(0, 0, 0, 0.2);
          padding: 5px;
          border-radius: 10px;
          border: 1px solid rgba(12, 198, 132, 0.2);
        }

        .am-pm-toggle button {
          flex: 1;
          padding: 8px 16px;
          border: 2px solid transparent;
          background: rgba(12, 198, 132, 0.1);
          color: #0cc684;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          font-size: 0.85rem;
          border-radius: 8px;
          min-width: 50px;
        }

        .am-pm-toggle button:hover {
          background: rgba(12, 198, 132, 0.2);
          border-color: #0cc684;
        }

        .am-pm-toggle button.active {
          background: #0cc684;
          color: #0f2f2f;
          box-shadow: 0 4px 12px rgba(12, 198, 132, 0.4);
          border-color: #00ff9f;
          text-shadow: 0 0 4px rgba(0, 255, 159, 0.3);
        }

        .picker-actions {
          display: flex;
          gap: 12px;
          margin-top: 0px;
          width: 100%;
        }

        .picker-actions button {
          flex: 1;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .picker-actions .btn-confirm {
          background: linear-gradient(135deg, #0cc684 0%, #00ff9f 100%);
          color: #0f2f2f;
          box-shadow: 0 4px 15px rgba(12, 198, 132, 0.3);
        }

        .picker-actions .btn-confirm:hover {
          box-shadow: 0 6px 20px rgba(12, 198, 132, 0.5);
          transform: translateY(-2px);
        }

        .picker-actions .btn-confirm:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="time-display">
        {getDisplayTime()}
      </div>

      <div className="clock-face">
        <div 
          className="hand" 
          style={{ 
            height: '50px', 
            transform: `translateX(-50%) rotate(${(displayHour % 12) * 30}deg)` 
          }}
        />
        <div className="clock-center" />

        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => {
          const angle = (hour === 12 ? 0 : hour * 30) * (Math.PI / 180);
          const radius = 55;
          const x = Math.sin(angle) * radius;
          const y = -Math.cos(angle) * radius;
          const isSelected = displayHour === hour;

          return (
            <button
              key={hour}
              className={`hour-button ${isSelected ? 'selected' : ''}`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%)`
              }}
              onClick={() => handleHourClick(hour)}
              type="button"
            >
              {hour}
            </button>
          );
        })}
      </div>

      <div className="am-pm-toggle">
        <button
          type="button"
          className={`${isAM ? 'active' : ''}`}
          onClick={() => toggleAMPM('AM')}
        >
          AM
        </button>
        <button
          type="button"
          className={`${!isAM ? 'active' : ''}`}
          onClick={() => toggleAMPM('PM')}
        >
          PM
        </button>
      </div>
    </div>
  );
};

const BookingForm = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    durationHours: '1',
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const formatRefreshText = (timestamp) => {
    if (!timestamp) return 'Waiting for next sync...';
    const secondsAgo = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (secondsAgo < 5) return 'Updated just now';
    if (secondsAgo < 60) return `Updated ${secondsAgo}s ago`;
    return `Updated ${Math.floor(secondsAgo / 60)}m ago`;
  };

  const loadServices = useCallback(async () => {
    try {
      const res = await API.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const { lastRefreshAt, isRefreshing } = useAutoRefresh(loadServices, {
    intervalMs: 10000
  });

  const selectedService = services.find((service) => service._id === formData.serviceId);
  const durationHours = Number(formData.durationHours || 1);
  const totalAmount = (selectedService?.price || 0) * durationHours;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in before booking.');
      return;
    }

    if (!formData.serviceId) {
      setError('Please select a service.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const bookingRes = await API.post('/bookings', {
        serviceId: formData.serviceId,
        date: `${formData.date}T${formData.time}`,
        durationHours,
        location: formData.location,
        notes: formData.notes
      });
      setSuccess('Booking created successfully. Redirecting to payment...');
      setTimeout(() => {
        navigate('/payment', { state: { bookingId: bookingRes.data._id, amount: totalAmount || 150 } });
      }, 700);
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to create booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Book Your Session</h2>
              <p className="text-muted text-center small mb-3">
                {isRefreshing ? 'Refreshing services...' : formatRefreshText(lastRefreshAt)}
              </p>
              <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <div className="mb-3">
                  <label htmlFor="service" className="form-label">Service Type</label>
                  <select
                    className="form-select"
                    id="service"
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.title} {service.price ? `- Rs ${service.price}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="date" className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      onKeyDown={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                      onFocus={(e) => e.target.showPicker?.()}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Time</label>
                    <button
                      type="button"
                      className="btn btn-outline-light w-100"
                      onClick={() => setIsTimePickerOpen(true)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        borderColor: '#0cc684',
                        color: formData.time ? '#0cc684' : '#999',
                        background: formData.time ? 'rgba(12, 198, 132, 0.1)' : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {formData.time
                        ? new Date(`2000-01-01T${formData.time}`).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })
                        : '🕐 Select Time'}
                    </button>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="durationHours" className="form-label">Duration</label>
                    <select
                      className="form-select"
                      id="durationHours"
                      name="durationHours"
                      value={formData.durationHours}
                      onChange={handleChange}
                      required
                    >
                      <option value="1">1 Hour</option>
                      <option value="2">2 Hours</option>
                      <option value="3">3 Hours</option>
                      <option value="4">4 Hours</option>
                      <option value="5">5 Hours</option>
                      <option value="6">6 Hours</option>
                      <option value="8">8 Hours</option>
                      <option value="10">10 Hours</option>
                      <option value="12">12 Hours</option>
                    </select>
                  </div>
                </div>
                
                <CircularTimePicker 
                  value={formData.time} 
                  onChange={(time) => setFormData({ ...formData, time })}
                  isOpen={isTimePickerOpen}
                  onClose={() => setIsTimePickerOpen(false)}
                />
                {selectedService ? (
                  <div className="alert alert-info py-2" role="status">
                    Estimated total: Rs {totalAmount}
                  </div>
                ) : null}
                <div className="mb-3">
                  <label htmlFor="location" className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Additional Notes</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special requests or notes"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
