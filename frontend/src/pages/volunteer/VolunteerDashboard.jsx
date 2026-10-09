import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deliveryApi } from '../../api/client';
import { StatusBadge } from '../../components/StatusBadge';
import { Truck, CheckCircle2, Clock, ArrowRight, Package } from 'lucide-react';

export const VolunteerDashboard = () => {
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [availRes, myRes] = await Promise.all([
          deliveryApi.getAvailable(),
          deliveryApi.getMy(),
        ]);
        setAvailableDeliveries(availRes.data || []);
        setMyDeliveries(myRes.data || []);
      } catch (err) {
        console.error('Error fetching volunteer dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeDeliveries = myDeliveries.filter((d) => d.status === 'ASSIGNED' || d.status === 'PICKED_UP');
  const completedDeliveries = myDeliveries.filter((d) => d.status === 'DELIVERED');

  if (loading) {
    return <div style={{ padding: '2rem 0', color: 'var(--text-secondary)' }}>Loading volunteer dashboard...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Volunteer Dispatch Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Help transport approved surplus food from donors to community shelters</p>
        </div>
        <Link to="/volunteer/available" className="btn btn-primary" style={{ backgroundColor: 'var(--vol-amber)' }}>
          <Truck size={18} />
          <span>Available Tasks ({availableDeliveries.length})</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Package size={24} />
          </div>
          <div>
            <div className="stat-val">{availableDeliveries.length}</div>
            <div className="stat-label">Tasks Waiting for Pickup</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{activeDeliveries.length}</div>
            <div className="stat-label">My Active Deliveries</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-val">{completedDeliveries.length}</div>
            <div className="stat-label">Completed Deliveries</div>
          </div>
        </div>
      </div>

      {/* Alert if active deliveries in progress */}
      {activeDeliveries.length > 0 && (
        <div className="alert alert-success" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={20} />
            <span>You currently have <strong>{activeDeliveries.length} active delivery task(s)</strong> assigned to you.</span>
          </div>
          <Link to="/volunteer/my-deliveries" className="btn btn-primary" style={{ backgroundColor: 'var(--vol-amber)', padding: '0.4rem 0.875rem', fontSize: '0.85rem' }}>
            Update Delivery Status
          </Link>
        </div>
      )}

      {/* Available Deliveries Preview */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Available for Courier Dispatch</h2>
          <Link to="/volunteer/available" style={{ fontSize: '0.875rem', color: 'var(--vol-amber)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All ({availableDeliveries.length}) <ArrowRight size={16} />
          </Link>
        </div>

        {availableDeliveries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No food donations are currently awaiting volunteer dispatch. All approved tasks are assigned!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Pickup Address</th>
                  <th>Expires</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {availableDeliveries.slice(0, 5).map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Donor: {d.donor?.fullName}</div>
                    </td>
                    <td>{d.category}</td>
                    <td>{d.quantity}</td>
                    <td>{d.pickupAddress}</td>
                    <td>{new Date(d.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <Link to="/volunteer/available" className="btn btn-primary" style={{ backgroundColor: 'var(--vol-amber)', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        Accept Task
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
