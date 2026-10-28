import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, RefreshCw, CheckCircle2, Server } from 'lucide-react';
import { warmUpServer } from '../api/client';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);

  const { login, backendStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Proactive warm-up when landing on login page
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userInfo = await login(email, password);
      // Redirect based on role
      if (userInfo.role === 'ROLE_DONOR') navigate('/donor/dashboard');
      else if (userInfo.role === 'ROLE_NGO') navigate('/ngo/dashboard');
      else if (userInfo.role === 'ROLE_VOLUNTEER') navigate('/volunteer/dashboard');
      else navigate('/');
    } catch (err) {
      let errMsg = err.message || 'Login failed. Please check your credentials.';
      if (errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('timeout')) {
        errMsg = 'The cloud server took longer to wake up from free-tier sleep. Please click "Sign In" once more!';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto' }}>
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Sign in to manage food donations and distributions</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. donor@foodconnect.org"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={16} className="spin" />
                Signing in...
              </span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
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
                Render sleeps after 15 min inactivity. Once loaded, all actions will be instant!
              </p>
            </div>
          )}
        </form>

        {/* Quick Demo Switcher */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.625rem', textAlign: 'center' }}>
            DEMO QUICK FILL (Password: password123)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '0.4rem', fontSize: '0.775rem' }}
              onClick={() => fillDemoCredentials('donor@foodconnect.org')}
            >
              🌱 Donor
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '0.4rem', fontSize: '0.775rem' }}
              onClick={() => fillDemoCredentials('ngo@foodconnect.org')}
            >
              🤝 NGO
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '0.4rem', fontSize: '0.775rem' }}
              onClick={() => fillDemoCredentials('volunteer@foodconnect.org')}
            >
              🚚 Volunteer
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
};
