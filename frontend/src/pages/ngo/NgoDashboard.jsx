import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestApi, donationApi } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import { PackageSearch, Clock, CheckCircle2, ArrowRight, Utensils } from 'lucide-react';

export const NgoDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [availableDonationsCount, setAvailableDonationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, donRes] = await Promise.all([
          requestApi.getMy(),
          donationApi.getAvailable(),
        ]);
        setRequests(reqRes.data || []);
        setAvailableDonationsCount((donRes.data || []).length);
      } catch (err) {
        console.error('Error fetching NGO dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;

  if (loading) {
    return <div style={{ padding: '2rem 0', color: 'var(--text-secondary)' }}>Loading NGO dashboard...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>NGO / Shelter Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Browse community food donations and coordinate beneficiary food relief</p>
        </div>
        <Link to="/ngo/browse" className="btn btn-primary" style={{ backgroundColor: 'var(--ngo-blue)' }}>
          <PackageSearch size={18} />
          <span>Browse Available Food</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Utensils size={24} />
          </div>
          <div>
            <div className="stat-val">{availableDonationsCount}</div>
            <div className="stat-label">Available Surplus Items</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{pendingCount}</div>
            <div className="stat-label">Pending Claim Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-val">{approvedCount}</div>
            <div className="stat-label">Approved Distributions</div>
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Claim Requests</h2>
          <Link to="/ngo/my-requests" style={{ fontSize: '0.875rem', color: 'var(--ngo-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All ({requests.length}) <ArrowRight size={16} />
          </Link>
        </div>

        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You have not placed any donation requests yet.</p>
            <Link to="/ngo/browse" className="btn btn-primary" style={{ backgroundColor: 'var(--ngo-blue)' }}>
              <PackageSearch size={18} />
              <span>Browse and Request Food</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Category</th>
                  <th>Donor</th>
                  <th>Pickup Location</th>
                  <th>Date Requested</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 5).map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.donation?.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.donation?.quantity}</div>
                    </td>
                    <td>{req.donation?.category}</td>
                    <td>{req.donation?.donor?.fullName}</td>
                    <td>{req.donation?.pickupAddress}</td>
                    <td>{new Date(req.requestedAt).toLocaleDateString()}</td>
                    <td><StatusBadge status={req.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
