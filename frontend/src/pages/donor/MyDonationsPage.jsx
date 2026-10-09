import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationApi, requestApi } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import { PlusCircle, AlertCircle, CheckCircle2, XCircle, Users, Trash2, X } from 'lucide-react';

export const MyDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsRes, requestsRes] = await Promise.all([
        donationApi.getMy(),
        requestApi.getReceived(),
      ]);
      setDonations(donationsRes.data || []);
      setRequests(requestsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelDonation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) return;
    try {
      await donationApi.updateStatus(id, 'CANCELLED');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to cancel donation');
    }
  };

  const handleRequestStatus = async (requestId, status) => {
    try {
      setActionLoading(true);
      await requestApi.updateStatus(requestId, status);
      await fetchData();
      // Keep modal open or updated
      setSelectedDonation((prev) => (prev ? { ...prev } : null));
    } catch (err) {
      alert(err.message || 'Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  const getRequestsForDonation = (donationId) => {
    return requests.filter((r) => r.donation?.id === donationId);
  };

  if (loading) {
    return <div style={{ padding: '2rem 0', color: 'var(--text-secondary)' }}>Loading your donations...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>My Food Donations</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track donation lifecycle and review NGO distribution claims</p>
        </div>
        <Link to="/donor/create" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>New Food Donation</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {donations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
            You haven't published any food donations yet.
          </p>
          <Link to="/donor/create" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Publish Your First Donation</span>
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title & Address</th>
                  <th>Category</th>
                  <th>Portions</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>NGO Claims</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => {
                  const itemRequests = getRequestsForDonation(d.id);
                  const pendingCount = itemRequests.filter((r) => r.status === 'PENDING').length;

                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.pickupAddress}</div>
                      </td>
                      <td>{d.category}</td>
                      <td>
                        <strong>{d.quantity}</strong>
                        {d.servings ? <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>~{d.servings} people</div> : null}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{new Date(d.expiresAt).toLocaleString()}</span>
                        {d.expired && <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>EXPIRED</div>}
                      </td>
                      <td><StatusBadge status={d.status} /></td>
                      <td>
                        {itemRequests.length > 0 ? (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.8rem',
                              borderColor: pendingCount > 0 ? 'var(--primary)' : 'var(--border)',
                              background: pendingCount > 0 ? 'var(--primary-light)' : 'transparent',
                              color: pendingCount > 0 ? 'var(--primary-text)' : 'var(--text-secondary)',
                            }}
                            onClick={() => setSelectedDonation(d)}
                          >
                            <Users size={14} />
                            <span>{itemRequests.length} request(s) {pendingCount > 0 ? `(${pendingCount} pending)` : ''}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None yet</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {(d.status === 'AVAILABLE' || d.status === 'REQUESTED') && (
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#ef4444' }}
                              onClick={() => handleCancelDonation(d.id)}
                              title="Cancel donation"
                            >
                              <Trash2 size={14} />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requests Modal */}
      {selectedDonation && (
        <div className="modal-backdrop" onClick={() => setSelectedDonation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>NGO Requests for Food Item</h3>
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

            <div className="modal-body">
              {getRequestsForDonation(selectedDonation.id).length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No requests received for this donation.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {getRequestsForDonation(selectedDonation.id).map((req) => (
                    <div
                      key={req.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: req.status === 'PENDING' ? '#f8fafc' : '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{req.ngo?.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {req.ngo?.email} | {req.ngo?.phone || 'No phone'}
                          </div>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>

                      {req.message && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0', fontStyle: 'italic' }}>
                          "{req.message}"
                        </p>
                      )}

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Requested: {new Date(req.requestedAt).toLocaleString()}
                      </div>

                      {req.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
                            disabled={actionLoading}
                            onClick={() => handleRequestStatus(req.id, 'APPROVED')}
                          >
                            <CheckCircle2 size={16} />
                            <span>Approve Request</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
                            disabled={actionLoading}
                            onClick={() => handleRequestStatus(req.id, 'REJECTED')}
                          >
                            <XCircle size={16} />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedDonation(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
