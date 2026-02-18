import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Reminders from './pages/Reminders';
import UploadPrescription from './pages/UploadPrescription';
import Refills from './pages/Refills';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PharmacistDashboard from './pages/PharmacistDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import NotificationManager from './components/NotificationManager';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className={hideNavbar ? '' : 'app-container'}>
      {!hideNavbar && <Navbar />}
      <NotificationManager />
      <main className={hideNavbar ? '' : 'main-content'}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute allowedRoles={['Patient']}><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/reminders"
            element={<ProtectedRoute allowedRoles={['Patient']}><Reminders /></ProtectedRoute>}
          />
          <Route
            path="/upload"
            element={<ProtectedRoute allowedRoles={['Patient']}><UploadPrescription /></ProtectedRoute>}
          />
          <Route
            path="/refills"
            element={<ProtectedRoute allowedRoles={['Patient']}><Refills /></ProtectedRoute>}
          />
          <Route
            path="/payment"
            element={<ProtectedRoute allowedRoles={['Patient']}><PaymentPage /></ProtectedRoute>}
          />
          <Route
            path="/payment-success"
            element={<ProtectedRoute allowedRoles={['Patient']}><PaymentSuccess /></ProtectedRoute>}
          />

          {/* Pharmacist Routes */}
          <Route
            path="/pharmacist/dashboard"
            element={<ProtectedRoute allowedRoles={['Pharmacist']}><PharmacistDashboard /></ProtectedRoute>}
          />

          {/* Delivery Routes */}
          <Route
            path="/delivery/dashboard"
            element={<ProtectedRoute allowedRoles={['Delivery']}><DeliveryDashboard /></ProtectedRoute>}
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
