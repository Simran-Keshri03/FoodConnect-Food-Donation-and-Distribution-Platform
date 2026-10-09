import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import { DonorDashboard } from './pages/donor/DonorDashboard';
import { CreateDonationPage } from './pages/donor/CreateDonationPage';
import { MyDonationsPage } from './pages/donor/MyDonationsPage';

import { NgoDashboard } from './pages/ngo/NgoDashboard';
import { BrowseDonationsPage } from './pages/ngo/BrowseDonationsPage';
import { MyRequestsPage } from './pages/ngo/MyRequestsPage';

import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard';
import { AvailableDeliveriesPage } from './pages/volunteer/AvailableDeliveriesPage';
import { MyDeliveriesPage } from './pages/volunteer/MyDeliveriesPage';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Donor Routes */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute allowedRole="ROLE_DONOR">
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/create"
            element={
              <ProtectedRoute allowedRole="ROLE_DONOR">
                <CreateDonationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/my-donations"
            element={
              <ProtectedRoute allowedRole="ROLE_DONOR">
                <MyDonationsPage />
              </ProtectedRoute>
            }
          />

          {/* NGO Routes */}
          <Route
            path="/ngo/dashboard"
            element={
              <ProtectedRoute allowedRole="ROLE_NGO">
                <NgoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/browse"
            element={
              <ProtectedRoute allowedRole="ROLE_NGO">
                <BrowseDonationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/my-requests"
            element={
              <ProtectedRoute allowedRole="ROLE_NGO">
                <MyRequestsPage />
              </ProtectedRoute>
            }
          />

          {/* Volunteer Routes */}
          <Route
            path="/volunteer/dashboard"
            element={
              <ProtectedRoute allowedRole="ROLE_VOLUNTEER">
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/available"
            element={
              <ProtectedRoute allowedRole="ROLE_VOLUNTEER">
                <AvailableDeliveriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/my-deliveries"
            element={
              <ProtectedRoute allowedRole="ROLE_VOLUNTEER">
                <MyDeliveriesPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
