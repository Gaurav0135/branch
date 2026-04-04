import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import useAutoRefresh from '../hooks/useAutoRefresh';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatRefreshText = (timestamp) => {
    if (!timestamp) return 'Waiting for next sync...';
    const secondsAgo = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (secondsAgo < 5) return 'Updated just now';
    if (secondsAgo < 60) return `Updated ${secondsAgo}s ago`;
    return `Updated ${Math.floor(secondsAgo / 60)}m ago`;
  };

  const fetchServices = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const response = await API.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchServices(true);
  }, [fetchServices]);

  const { lastRefreshAt, isRefreshing } = useAutoRefresh(() => fetchServices(false), {
    intervalMs: 10000
  });

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid services-page py-5">
      <div className="container">
        <div className="section-intro text-center mb-5">
          <span className="text-uppercase text-info fw-bold">Premium Packages</span>
          <h1 className="text-white mb-3">Our Services</h1>
          <p className="text-muted fs-5">
            Choose from tailored packages and book instantly. Your journey to stunning photography starts here.
          </p>
          <small className="text-secondary d-block mt-2">
            {isRefreshing ? 'Refreshing...' : formatRefreshText(lastRefreshAt)}
          </small>
        </div>

        <div className="row g-4">
          {services.map((service) => (
            <div key={service._id} className="col-md-6 col-lg-4">
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;


