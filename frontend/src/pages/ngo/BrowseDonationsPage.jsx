import React, { useState, useEffect } from 'react';
import { donationApi, requestApi } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import { PackageSearch, Clock, MapPin, Users, HeartHandshake, AlertCircle, CheckCircle2, X } from 'lucide-react';

const CATEGORIES = ['All', 'Cooked Meals', 'Bakery', 'Produce', 'Packaged Food', 'Dairy', 'Beverages'];

export const BrowseDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Request modal state
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDonations = async (category) => {
    try {
      setLoading(true);
      const catParam = category === 'All' ? null : category;
      const res = await donationApi.getAvailable(catParam);
      setDonations(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations(selectedCategory);
  }, [selectedCategory]);

  const handleOpenRequest = (donation) => {
    setSelectedDonation(donation);
    setRequestMessage('');
    setError('');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    try {
      setSubmitting(true);
      setError('');
      await requestApi.create({
        donationId: selectedDonation.id,
        message: requestMessage,
      });

      setSuccessMsg(`Request for "${selectedDonation.title}" submitted successfully!`);
      setSelectedDonation(null);
      fetchDonations(selectedCategory);

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to submit donation request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Browse Available Food</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Find surplus food ready for immediate distribution to those in need</p>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.875rem',
              backgroundColor: selectedCategory === cat ? 'var(--ngo-blue)' : undefined,
            }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading available food donations...
        </div>
      ) : donations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <PackageSearch size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Food Available in this Category</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Check back shortly or explore another category. Donors post surplus food throughout the day.
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {donations.map((d) => (
            <div key={d.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="badge badge-AVAILABLE" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                  {d.category}
                </span>
                <StatusBadge status={d.status} />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{d.title}</h3>

              {d.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
                  {d.description}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '1rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} color="var(--ngo-blue)" />
                  <span>Quantity: <strong>{d.quantity}</strong> {d.servings ? `(Feeds ~${d.servings})` : ''}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--text-muted)" />
                  <span>{d.pickupAddress}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--text-muted)" />
                  <span>Expires: {new Date(d.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Donor: <strong>{d.donor?.fullName}</strong>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--ngo-blue)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  onClick={() => handleOpenRequest(d)}
                >
                  <HeartHandshake size={16} />
                  <span>Request Food</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {selectedDonation && (
        <div className="modal-backdrop" onClick={() => setSelectedDonation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Request Food Donation</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedDonation.title}</p>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.25rem 0.5rem', border: 'none' }}
                onClick={() => setSelectedDonation(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendRequest}>
              <div className="modal-body">
                <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <div><strong>Quantity:</strong> {selectedDonation.quantity}</div>
                  <div><strong>Pickup Address:</strong> {selectedDonation.pickupAddress}</div>
                  <div><strong>Expires:</strong> {new Date(selectedDonation.expiresAt).toLocaleString()}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message to Donor (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="e.g. We can pick this up in 45 minutes for our 50 evening shelter residents."
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedDonation(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--ngo-blue)' }}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Claim Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
