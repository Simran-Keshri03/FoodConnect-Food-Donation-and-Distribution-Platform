import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, Utensils, Users, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ROLE_DONOR') return '/donor/dashboard';
    if (user.role === 'ROLE_NGO') return '/ngo/dashboard';
    if (user.role === 'ROLE_VOLUNTEER') return '/volunteer/dashboard';
    return '/';
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '3.5rem 1rem 3rem', maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', color: '#047857', padding: '0.375rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          <HeartHandshake size={18} />
          Connecting Surplus Food to Communities in Need
        </div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '1.25rem' }}>
          Zero Waste. <span style={{ color: 'var(--primary)' }}>Zero Hunger.</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          FoodConnect connects restaurants, caterers, and supermarkets with local NGOs and volunteers.
          Together we eliminate food waste through real-time donation tracking and coordinated community deliveries.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link to={getDashboardLink()} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1.05rem' }}>
              Go to My Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1.05rem' }}>
                Join as Partner / Volunteer <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1.05rem' }}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Role Architecture Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '10px', color: 'var(--primary)' }}>
              <Utensils size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Food Donors</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Restaurants, Caterers & Bakeries</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.25rem' }}>
            List surplus edible food in minutes with prepared timestamps, portion counts, and expiry windows. Approve trusted NGO collection requests.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--primary)" /> Real-time donation publishing</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--primary)" /> Manage NGO claims & approvals</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--primary)" /> Prevent food waste liability</li>
          </ul>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--ngo-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--ngo-blue-light)', padding: '0.75rem', borderRadius: '10px', color: 'var(--ngo-blue)' }}>
              <Users size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>NGOs & Shelters</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Charities, Orphanages & Community Pantries</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.25rem' }}>
            Browse fresh donations filtered by category. Request needed quantities with beneficiary notes and monitor pickup status.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--ngo-blue)" /> Category & freshness filtering</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--ngo-blue)" /> Instant claim requests</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--ngo-blue)" /> Direct coordination for distribution</li>
          </ul>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--vol-amber)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--vol-amber-light)', padding: '0.75rem', borderRadius: '10px', color: 'var(--vol-amber)' }}>
              <Truck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Volunteers</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Community Couriers & Advocates</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.25rem' }}>
            Claim approved delivery dispatches. Transport food safely from donor locations to beneficiary shelters and log delivery milestones.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--vol-amber)" /> Browse nearby approved tasks</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--vol-amber)" /> One-click task acceptance</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--vol-amber)" /> Verified pickup & delivery timestamps</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
