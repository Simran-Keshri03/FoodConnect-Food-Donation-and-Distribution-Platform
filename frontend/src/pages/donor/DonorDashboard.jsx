import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationApi, requestApi } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import { PlusCircle, PackageCheck, Clock, CheckCircle, ArrowRight, Utensils } from 'lucide-react';

export const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donationsRes, requestsRes] = await Promise.all([
          donationApi.getMy(),
          requestApi.getReceived(),
        ]);
        setDonations(donationsRes.data || []);
        setRequests(requestsRes.data || []);
      } catch (err) {
        console.error('Error loading donor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableCount = donations.filter((d) => d.status === 'AVAILABLE').length;
  const inProgressCount = donations.filter((d) => ['REQUESTED', 'APPROVED', 'ASSIGNED', 'PICKED_UP'].includes(d.status)).length;
  const deliveredCount = donations.filter((d) => d.status === 'DELIVERED').length;
  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;

  if (loading) {
    return <div style={{ padding: '2rem 0', color: 'var(--text-secondary)' }}>Loading dashboard statistics...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Donor Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitor your food contributions and manage NGO distribution claims</p>
        </div>
        <Link to="/donor/create" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>New Food Donation</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Utensils size={24} />
          </div>
          <div>
            <div className="stat-val">{donations.length}</div>
            <div className="stat-label">Total Donations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{availableCount}</div>
            <div className="stat-label">Available / Listed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <PackageCheck size={24} />
          </div>
          <div>
            <div className="stat-val">{pendingRequestsCount}</div>
            <div className="stat-label">Pending NGO Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ccfbf1', color: '#0f766e' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-val">{deliveredCount}</div>
            <div className="stat-label">Successfully Delivered</div>
          </div>
        </div>
      </div>

      {/* Quick Access to Pending Requests Alert */}
      {pendingRequestsCount > 0 && (
        <div className="alert alert-success" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PackageCheck size={20} />
            <span>You have <strong>{pendingRequestsCount} pending NGO request(s)</strong> awaiting your approval.</span>
          </div>
          <Link to="/donor/my-donations" className="btn btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.85rem' }}>
            Review Requests
          </Link>
        </div>
      )}

      {/* Recent Donations Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Food Listings</h2>
          <Link to="/donor/my-donations" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All ({donations.length}) <ArrowRight size={16} />
          </Link>
        </div>

        {donations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You have not listed any food donations yet.</p>
            <Link to="/donor/create" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Create Your First Donation</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Category</th>
                  <th>Quantity / Servings</th>
                  <th>Expires At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.slice(0, 5).map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.pickupAddress}</div>
                    </td>
                    <td>{d.category}</td>
                    <td>{d.quantity} {d.servings ? `(${d.servings} servings)` : ''}</td>
                    <td>{new Date(d.expiresAt).toLocaleString()}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>
                      <Link to="/donor/my-donations" className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                        Manage
                      </Link>
                    </td>
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
