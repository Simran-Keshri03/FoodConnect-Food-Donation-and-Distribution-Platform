import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deliveryApi } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import { Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const MyDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await deliveryApi.getMy();
      setDeliveries(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      setActionLoading(true);
      await deliveryApi.updateStatus(id, status);
      await fetchDeliveries();
    } catch (err) {
      alert(err.message || 'Failed to update delivery status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem 0', color: 'var(--text-secondary)' }}>Loading your deliveries...</div>;
  }

  const activeDeliveries = deliveries.filter((d) => d.status === 'ASSIGNED' || d.status === 'PICKED_UP');
  const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED' || d.status === 'CANCELLED');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>My Deliveries</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage ongoing food pickups and review your delivery track record</p>
        </div>
        <Link to="/volunteer/available" className="btn btn-primary" style={{ backgroundColor: 'var(--vol-amber)' }}>
          <Truck size={18} />
          <span>Find Available Deliveries</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Active Tasks Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--vol-amber)" />
          <span>Active Tasks ({activeDeliveries.length})</span>
        </h2>

        {activeDeliveries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>You have no deliveries currently in progress.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {activeDeliveries.map((del) => (
              <div key={del.id} className="card" style={{ borderLeft: '4px solid var(--vol-amber)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    TASK #{del.id}
                  </span>
                  <StatusBadge status={del.status} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {del.donation?.title}
                </h3>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <div><strong>Quantity:</strong> {del.donation?.quantity}</div>
                  <div><strong>Pickup Address:</strong> {del.donation?.pickupAddress}</div>
                  {del.pickupTime && (
                    <div style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>
                      Picked up at: {new Date(del.pickupTime).toLocaleTimeString()}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
                  {del.status === 'ASSIGNED' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: '100%', backgroundColor: 'var(--vol-amber)' }}
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(del.id, 'PICKED_UP')}
                    >
                      <Truck size={16} />
                      <span>Confirm Food Picked Up</span>
                    </button>
                  )}

                  {del.status === 'PICKED_UP' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: '100%', backgroundColor: 'var(--primary)' }}
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(del.id, 'DELIVERED')}
                    >
                      <CheckCircle2 size={16} />
                      <span>Confirm Food Delivered</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed History Table */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} color="var(--primary)" />
          <span>Delivery History ({completedDeliveries.length})</span>
        </h2>

        {completedDeliveries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No completed deliveries yet.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>Pickup Address</th>
                    <th>Picked Up At</th>
                    <th>Delivered At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedDeliveries.map((del) => (
                    <tr key={del.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{del.donation?.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{del.donation?.quantity}</div>
                      </td>
                      <td>{del.donation?.pickupAddress}</td>
                      <td>{del.pickupTime ? new Date(del.pickupTime).toLocaleString() : 'N/A'}</td>
                      <td>{del.deliveredAt ? new Date(del.deliveredAt).toLocaleString() : 'N/A'}</td>
                      <td><StatusBadge status={del.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
