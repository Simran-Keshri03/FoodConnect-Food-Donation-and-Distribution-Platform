import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, RefreshCw } from 'lucide-react';
import { warmUpServer } from '../api/client';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'ROLE_DONOR',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);

  const { register, backendStatus } = useAuth();
  const navigate = useNavigate();

  // Proactive warm-up when landing on registration page
  useEffect(() => {
    warmUpServer();
  }, []);

  // Timer to provide informative updates if server is cold starting (>3s)
  useEffect(() => {
    let interval = null;
    if (loading) {
      interval = setInterval(() => {
        setLoadingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userInfo = await register(formData);
      if (userInfo.role === 'ROLE_DONOR') navigate('/donor/dashboard');
      else if (userInfo.role === 'ROLE_NGO') navigate('/ngo/dashboard');
      else if (userInfo.role === 'ROLE_VOLUNTEER') navigate('/volunteer/dashboard');
      else navigate('/');
    } catch (err) {
      let errMsg = err.message || 'Registration failed. Please check your details.';
      if (errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('timeout')) {
        errMsg = 'The cloud server took longer to wake up from free-tier sleep. Please click "Register" once more!';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <div className="card">
        {/* Server Status Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          {backendStatus === 'online' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
              Cloud Backend Online
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', background: '#fffbeb', color: '#b45309', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontWeight: 500 }}>
              <RefreshCw size={12} className="spin" />
              Warming up cloud backend...
            </span>
          )}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create an Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Join the FoodConnect network in your community</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">I want to register as a:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn ${formData.role === 'ROLE_DONOR' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                onClick={() => setFormData({ ...formData, role: 'ROLE_DONOR' })}
              >
                Food Donor
              </button>
              <button
                type="button"
                className={`btn ${formData.role === 'ROLE_NGO' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                onClick={() => setFormData({ ...formData, role: 'ROLE_NGO' })}
              >
                NGO / Shelter
              </button>
              <button
                type="button"
                className={`btn ${formData.role === 'ROLE_VOLUNTEER' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                onClick={() => setFormData({ ...formData, role: 'ROLE_VOLUNTEER' })}
              >
                Volunteer
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name or Organization</label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Apex Restaurant or Hope Shelter"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. contact@organization.org"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min. 6 characters)</label>
            <input
              type="password"
              name="password"
              className="form-control"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 555-0199"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address / Location</label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 100 Main St, Suite 400"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={16} className="spin" />
                Creating Account...
              </span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register as {formData.role.replace('ROLE_', '')}</span>
              </>
            )}
          </button>

          {/* Cold start reassurance message */}
          {loading && loadingTime > 2 && (
            <div style={{ marginTop: '0.75rem', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.775rem', color: '#475569', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 500 }}>
                ⚡ Waking up free cloud backend (~{loadingTime}s)...
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.725rem', color: '#64748b' }}>
                Render sleeps after 15 min inactivity. Once registered, subsequent requests will be instant!
              </p>
            </div>
          )}
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
