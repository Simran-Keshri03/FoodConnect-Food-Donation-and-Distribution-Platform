import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './StatusBadge';
import { HeartHandshake, LogOut, PlusCircle, PackageSearch, Truck, Home } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <HeartHandshake size={28} />
          <span>FoodConnect</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              {/* Donor Navigation */}
              {user?.role === 'ROLE_DONOR' && (
                <>
                  <NavLink to="/donor/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/donor/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Donate Food
                  </NavLink>
                  <NavLink to="/donor/my-donations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    My Donations
                  </NavLink>
                </>
              )}

              {/* NGO Navigation */}
              {user?.role === 'ROLE_NGO' && (
                <>
                  <NavLink to="/ngo/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/ngo/browse" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Browse Food
                  </NavLink>
                  <NavLink to="/ngo/my-requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    My Requests
                  </NavLink>
                </>
              )}

              {/* Volunteer Navigation */}
              {user?.role === 'ROLE_VOLUNTEER' && (
                <>
                  <NavLink to="/volunteer/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/volunteer/available" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Available Deliveries
                  </NavLink>
                  <NavLink to="/volunteer/my-deliveries" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    My Deliveries
                  </NavLink>
                </>
              )}

              <div className="nav-user">
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.fullName}</span>
                  <RoleBadge role={user?.role} />
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                  title="Log out"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
