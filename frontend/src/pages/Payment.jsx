import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [copied, setCopied] = useState(false);
  const [upiRefId, setUpiRefId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const bookingId = location.state?.bookingId;
  const amount = location.state?.amount || 150;
  const upiId = import.meta.env.VITE_UPI_ID || 'frameza@upi';
  const merchantName = import.meta.env.VITE_UPI_NAME || 'Frameza Services';
  const customQrUrl = import.meta.env.VITE_UPI_QR_URL;

  const upiPaymentUrl = useMemo(() => {
    const query = new URLSearchParams({
      pa: upiId,
      pn: merchantName,
      am: amount.toFixed(2),
      cu: 'INR',
      tn: bookingId ? `Booking-${bookingId}` : 'Frameza Booking Payment'
    });

    return `upi://pay?${query.toString()}`;
  }, [upiId, merchantName, amount, bookingId]);

  const qrCodeUrl = useMemo(() => {
    if (customQrUrl) return customQrUrl;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPaymentUrl)}`;
  }, [upiPaymentUrl, customQrUrl]);

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Unable to copy UPI ID. Please copy it manually.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bookingId) {
      setError('No booking selected for payment.');
      return;
    }

    if (paymentMethod === 'upi' && !upiRefId.trim()) {
      setError('Please enter the UPI reference ID before confirming payment.');
      return;
    }

    if (paymentMethod === 'cod' && !phoneNumber.trim()) {
      setError('Please enter your phone number for Cash on Delivery.');
      return;
    }

    if (paymentMethod === 'cod' && !/^[0-9]{10}$/.test(phoneNumber.trim())) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // optional: attempt to save real payment record, but we still proceed to success
      await API.post('/payment', { bookingId, amount, method: paymentMethod, upiRefId: upiRefId.trim(), phoneNumber: phoneNumber.trim() });

      const successState = {
        amount,
        bookingId,
        paymentId: 'N/A',
        paymentMethod,
        upiRefId: upiRefId.trim(),
        phoneNumber: phoneNumber.trim(),
        date: new Date().toISOString(),
        message:
          paymentMethod === 'cod'
            ? `Order placed with Cash on Delivery. Reference ID: ${phoneNumber.trim()}. Your ticket has been generated and booking is pending confirmation.`
            : 'UPI payment reference received. Your ticket has been generated and booking is pending admin approval.'
      };

      navigate('/success', { state: successState });
    } catch (err) {
      setError(err.response?.data?.msg || 'Payment could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow section-card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Payment Details</h2>
              <div className="alert alert-info mb-4" style={{ backgroundColor: 'rgba(12, 198, 132, 0.15)', borderColor: 'rgba(12, 198, 132, 0.4)', color: '#b9f2e3' }}>
                <strong>Total Amount: Rs {amount.toFixed(2)}</strong>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <label className="form-label mb-0 text-white fw-semibold">Payment Method</label>
                  <div className="btn-group" role="group" aria-label="Payment method">
                    <input
                      type="radio"
                      className="btn-check"
                      name="paymentMethod"
                      id="payment-upi"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label
                      className={`btn btn-sm ${paymentMethod === 'upi' ? 'btn-light text-dark' : 'btn-outline-light text-white'}`}
                      htmlFor="payment-upi"
                    >
                      UPI Payment
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="paymentMethod"
                      id="payment-cod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label
                      className={`btn btn-sm ${paymentMethod === 'cod' ? 'btn-light text-dark' : 'btn-outline-light text-white'}`}
                      htmlFor="payment-cod"
                    >
                      Cash on Delivery
                    </label>
                  </div>
                </div>

                {paymentMethod === 'upi' ? (
                  <div className="mb-3">
                    <div className="alert alert-secondary mb-3">
                      Scan the QR code using any UPI app or pay directly to this UPI ID.
                    </div>
                    <div className="border rounded p-3 mb-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <label className="form-label text-white fw-semibold mb-2">UPI ID</label>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="badge text-bg-light fs-6">{upiId}</span>
                        <button type="button" className="btn btn-outline-light btn-sm" onClick={copyUpiId}>
                          Copy UPI ID
                        </button>
                        {copied && <span className="text-success small">Copied</span>}
                      </div>
                    </div>
                    <div className="text-center mb-3">
                      <img
                        src={qrCodeUrl}
                        alt="UPI QR Code"
                        width="220"
                        height="220"
                        className="img-fluid border rounded bg-white p-2"
                        loading="lazy"
                      />
                    </div>
                    <div className="small text-white-50">
                      After completing payment in your UPI app, enter the reference ID and click <strong>Confirm UPI Payment</strong>.
                    </div>
                    <div className="mt-3">
                      <label htmlFor="upiRefId" className="form-label text-white fw-semibold">UPI Reference ID</label>
                      <input
                        type="text"
                        className="form-control"
                        id="upiRefId"
                        value={upiRefId}
                        onChange={(e) => setUpiRefId(e.target.value)}
                        placeholder="Enter UPI transaction reference ID"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="alert alert-secondary mb-4">
                      You will pay Rs {amount.toFixed(2)} in cash when the service is delivered.
                    </div>
                    <div className="mb-3">
                      <label htmlFor="phoneNumber" className="form-label text-white fw-semibold">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Enter 10-digit phone number"
                        maxLength="10"
                        required
                      />
                      <small className="text-white-50 d-block mt-1">This will be your reference ID for Cash on Delivery</small>
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing Payment...
                    </>
                  ) : (
                    paymentMethod === 'cod' ? 'Place COD Order' : 'Confirm UPI Payment'
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

export default Payment;
