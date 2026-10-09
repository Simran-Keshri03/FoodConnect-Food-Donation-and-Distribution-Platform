import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { donationApi } from '../../api/client';
import { PlusCircle, ArrowLeft, AlertCircle } from 'lucide-react';

export const CreateDonationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default expiration to 12 hours from now
  const defaultExpiry = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultPrep = new Date().toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cooked Meals',
    quantity: '',
    servings: '',
    pickupAddress: '',
    preparedAt: defaultPrep,
    expiresAt: defaultExpiry,
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        servings: formData.servings ? parseInt(formData.servings, 10) : null,
        preparedAt: formData.preparedAt ? formData.preparedAt + ':00' : null,
        expiresAt: formData.expiresAt + ':00',
      };

      await donationApi.create(payload);
      navigate('/donor/my-donations');
    } catch (err) {
      setError(err.message || 'Failed to publish food donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/donor/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Donate Surplus Food</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Provide accurate details to help NGOs safely claim and distribute your donation.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Food Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 50 Trays of Cooked Vegetable Biryani"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Food Category *</label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Bakery">Bakery & Bread</option>
                <option value="Produce">Raw Fruits & Vegetables</option>
                <option value="Packaged Food">Packaged / Canned Food</option>
                <option value="Dairy">Dairy & Eggs</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity / Weight *</label>
              <input
                type="text"
                name="quantity"
                className="form-control"
                required
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g. 15 kg / 3 boxes / 40 packets"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Estimated Servings (People Fed)</label>
              <input
                type="number"
                name="servings"
                min="1"
                className="form-control"
                value={formData.servings}
                onChange={handleChange}
                placeholder="e.g. 50"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Address *</label>
              <input
                type="text"
                name="pickupAddress"
                className="form-control"
                required
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="e.g. 124 Market Street, Downtown"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Prepared At</label>
              <input
                type="datetime-local"
                name="preparedAt"
                className="form-control"
                value={formData.preparedAt}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Must Be Picked Up Before (Expires) *</label>
              <input
                type="datetime-local"
                name="expiresAt"
                className="form-control"
                required
                value={formData.expiresAt}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Dietary Notes</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Pure vegetarian, cooked in canola oil, contains nuts, packaged in food-grade plastic trays."
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Link to="/donor/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Publishing...' : (
                <>
                  <PlusCircle size={18} />
                  <span>Publish Food Donation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
