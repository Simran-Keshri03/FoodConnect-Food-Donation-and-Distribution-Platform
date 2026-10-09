import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryApi } from '../../api/client';
import { Truck, MapPin, Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export const AvailableDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);
  const navigate = useNavigate();

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await deliveryApi.getAvailable();
      setDeliveries(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load available deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleAccept = async (donationId) => {
    try {
      setAcceptingId(donationId);
      setError('');
      await deliveryApi.accept(donationId);
      navigate('/volunteer/my-deliveries');
    } catch (err) {
      setError(err.message || 'Failed to accept delivery task');
      setAcceptingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem 0', color: 'var(--text-secondary)' }}>Loading available delivery assignments...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Available Delivery Tasks</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Approved food donations ready for courier pickup and community distribution</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {deliveries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <Truck size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Deliveries Currently Available</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            All approved food donations have been claimed by couriers. Check back shortly as new donor requests are approved!
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {deliveries.map((d) => (
            <div key={d.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="badge badge-APPROVED" style={{ background: '#fef3c7', color: '#92400e' }}>
                  {d.category}
                </span>
                <span className="badge badge-AVAILABLE">Ready for Pickup</span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{d.title}</h3>

              {d.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', flex: 1 }}>
                  {d.description}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '1rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} color="var(--vol-amber)" />
                  <span>Quantity: <strong>{d.quantity}</strong> {d.servings ? `(~${d.servings} people)` : ''}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--text-muted)" />
                  <span>Pickup: <strong>{d.pickupAddress}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--text-muted)" />
                  <span>Must pick up before: {new Date(d.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Donor: {d.donor?.fullName}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--vol-amber)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  disabled={acceptingId === d.id}
                  onClick={() => handleAccept(d.id)}
                >
                  <Truck size={16} />
                  <span>{acceptingId === d.id ? 'Claiming...' : 'Accept Task'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
