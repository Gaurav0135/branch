import { useLocation, Link } from 'react-router-dom';

const Success = () => {
  const location = useLocation();
  const { amount, bookingId, paymentMethod, upiRefId, phoneNumber, date, message } = location.state || {};

  const formatDisplayDateTime = (value) => {
    const parsedDate = value ? new Date(value) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return value || 'N/A';
    }

    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    const time = parsedDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    return `${day}/${month}/${year}, ${time}`;
  };

  const displayDate = formatDisplayDateTime(date);

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow section-card text-center">
            <div className="card-body">
              <div className="mb-4">
                <span className="text-success" style={{ fontSize: '4rem' }}>✓</span>
              </div>
              <h2 className="card-title text-success mb-2">Ticket Generated Successfully!</h2>
              {paymentMethod && (
                <p className="small text-white-50 mb-3">Payment Method: {paymentMethod.toUpperCase()}</p>
              )}
              <p className="card-text fs-5 mb-4">{message || 'Thank you for your booking. Your transaction is complete.'}</p>

              <div className="card mb-3 p-3" style={{ border: '1px solid rgba(0, 200, 123, 0.3)', backgroundColor: '#f6fffb' }}>
                <h5 className="mb-3">Ticket Confirmation</h5>
                <div className="row text-start">
                  <div className="col-md-6 mb-2"><strong>Booking ID:</strong> {bookingId || 'N/A'}</div>
                  <div className="col-md-6 mb-2">
                    <strong>Ref ID:</strong> {paymentMethod === 'cod' ? (phoneNumber || 'N/A') : (upiRefId || 'N/A')}
                  </div>
                  <div className="col-md-6 mb-2"><strong>Amount Paid:</strong> Rs {Number(amount || 0).toFixed(2)}</div>
                  <div className="col-md-6 mb-2"><strong>Date/Time:</strong> {displayDate}</div>
                </div>
              </div>

              <p className="mb-4 text-light">
                You will receive a confirmation mail and a confirmation call shortly. Please keep this ticket for reference.
              </p>

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Link to="/" className="btn btn-primary">Back to Home</Link>
                <Link to="/gallery" className="btn btn-outline-primary">Explore Gallery</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
