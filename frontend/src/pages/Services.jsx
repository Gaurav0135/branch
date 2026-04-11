import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import useAutoRefresh from '../hooks/useAutoRefresh';

const SERVICES_CACHE_KEY = 'frameza_services_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingCachedData, setUsingCachedData] = useState(false);

  const readCachedServices = useCallback(() => {
    try {
      const cachedRaw = sessionStorage.getItem(SERVICES_CACHE_KEY);
      if (!cachedRaw) return false;
      const cached = JSON.parse(cachedRaw);
      const isFresh = Date.now() - Number(cached.timestamp || 0) < CACHE_TTL_MS;
      if (!isFresh || !Array.isArray(cached.data)) return false;
      setServices(cached.data);
      setUsingCachedData(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const writeCachedServices = useCallback((data) => {
    try {
      sessionStorage.setItem(
        SERVICES_CACHE_KEY,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch {
      // Ignore cache write errors.
    }
  }, []);

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
      writeCachedServices(response.data);
      setUsingCachedData(false);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [writeCachedServices]);

  useEffect(() => {
    const hasFreshCache = readCachedServices();
    if (hasFreshCache) {
      setLoading(false);
      fetchServices(false);
      return;
    }
    fetchServices(true);
  }, [fetchServices, readCachedServices]);

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
          <p className="services-subtitle fs-5">
            Choose from tailored packages and book instantly. Your journey to stunning photography starts here.
          </p>
          <small className="services-sync-text d-block mt-2">
            {isRefreshing ? 'Refreshing...' : formatRefreshText(lastRefreshAt)}
          </small>
          {usingCachedData ? (
            <small className="text-warning d-block">Showing cached data while refreshing...</small>
          ) : null}
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


