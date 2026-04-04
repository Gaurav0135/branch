import { useEffect, useMemo, useState } from 'react';
import API from '../api/axios';

const initialForm = {
  title: '',
  price: '',
  description: ''
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [query, setQuery] = useState('');

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/admin/services');
      setServices(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const visibleServices = useMemo(() => {
    if (!query.trim()) return services;
    const keyword = query.trim().toLowerCase();
    return services.filter((service) => {
      const title = (service.title || '').toLowerCase();
      const description = (service.description || '').toLowerCase();
      return title.includes(keyword) || description.includes(keyword);
    });
  }, [query, services]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const clearForm = () => {
    setFormData(initialForm);
    setEditingId('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Service title is required.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price || 0)
    };

    try {
      setSaving(true);
      setError('');

      if (editingId) {
        const res = await API.put(`/admin/services/${editingId}`, payload);
        setServices((current) => current.map((service) => (service._id === editingId ? res.data : service)));
      } else {
        const res = await API.post('/admin/services', payload);
        setServices((current) => [res.data, ...current]);
      }

      clearForm();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (service) => {
    setEditingId(service._id);
    setFormData({
      title: service.title || '',
      price: service.price ?? '',
      description: service.description || ''
    });
    setError('');
  };

  const removeService = async (serviceId) => {
    const confirmed = window.confirm('Delete this service? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setError('');
      await API.delete(`/admin/services/${serviceId}`);
      setServices((current) => current.filter((service) => service._id !== serviceId));
      if (editingId === serviceId) {
        clearForm();
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete service.');
    }
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner-border text-info" role="status" />
        <p className="mt-3 text-muted">Loading services...</p>
      </div>
    );
  }

  return (
    <section className="admin-page-block">
      <div className="page-header page-header-row">
        <div>
          <p className="page-kicker">Catalog</p>
          <h2>Services</h2>
          <p>Create, update, and remove service offerings.</p>
        </div>

        <div className="filter-box">
          <label htmlFor="service-search">Search</label>
          <input
            id="service-search"
            type="text"
            className="form-control"
            placeholder="Search title or description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error ? <div className="alert alert-danger mb-0">{error}</div> : null}

      <div className="table-card p-3">
        <h5 className="mb-3">{editingId ? 'Edit Service' : 'Add Service'}</h5>
        <form className="row g-3" onSubmit={onSubmit}>
          <div className="col-md-4">
            <label className="form-label" htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-control"
              value={formData.title}
              onChange={onChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label" htmlFor="price">Price (Rs)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              className="form-control"
              value={formData.price}
              onChange={onChange}
            />
          </div>

          <div className="col-md-5">
            <label className="form-label" htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              type="text"
              className="form-control"
              value={formData.description}
              onChange={onChange}
            />
          </div>

          <div className="col-12 d-flex gap-2">
            <button className="btn btn-info" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
            </button>
            {editingId ? (
              <button className="btn btn-outline-light" type="button" onClick={clearForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="table admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleServices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No services found.
                  </td>
                </tr>
              ) : (
                visibleServices.map((service) => (
                  <tr key={service._id}>
                    <td>
                      <strong>{service.title || 'Untitled service'}</strong>
                    </td>
                    <td>{service.description || 'No description'}</td>
                    <td>Rs {Number(service.price || 0).toLocaleString('en-IN')}</td>
                    <td className="text-end">
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-info"
                          onClick={() => startEdit(service)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeService(service._id)}
                        >
                          Delete
                        </button>
                      </div>
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

export default Services;
