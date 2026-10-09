import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';

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

  const { register } = useAuth();
  const navigate = useNavigate();

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
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create an Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Join the FoodConnect network in your community</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
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
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} />
                <span>Register as {formData.role.replace('ROLE_', '')}</span>
              </>
            )}
          </button>
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
