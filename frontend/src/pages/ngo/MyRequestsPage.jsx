import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestApi } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import { PackageSearch, AlertCircle } from 'lucide-react';

export const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await requestApi.getMy();
        setRequests(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load donation requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem 0', color: 'var(--text-secondary)' }}>Loading your requests...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>My Donation Requests</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track status and pickup approvals for requested food donations</p>
        </div>
        <Link to="/ngo/browse" className="btn btn-primary" style={{ backgroundColor: 'var(--ngo-blue)' }}>
          <PackageSearch size={18} />
          <span>Browse More Food</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1.05rem' }}>
            You haven't requested any food donations yet.
          </p>
          <Link to="/ngo/browse" className="btn btn-primary" style={{ backgroundColor: 'var(--ngo-blue)' }}>
            Browse Available Food
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Donor & Pickup Address</th>
                  <th>Requested On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.donation?.title}</div>
                      {req.message && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          "{req.message}"
                        </div>
                      )}
                    </td>
                    <td>{req.donation?.category}</td>
                    <td>{req.donation?.quantity}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{req.donation?.donor?.fullName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.donation?.pickupAddress}</div>
                      {req.donation?.donor?.phone && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>📞 {req.donation?.donor?.phone}</div>
                      )}
                    </td>
                    <td>{new Date(req.requestedAt).toLocaleString()}</td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
