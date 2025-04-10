import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import PatientsPage from '@/pages/PatientsPage';
import PatientDetailPage from '@/pages/PatientDetailPage';
import NewPatientPage from '@/pages/NewPatientPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import AppointmentDetailPage from '@/pages/AppointmentDetailPage';
import EditAppointmentPage from '@/pages/EditAppointmentPage';
import NewAppointmentPage from '@/pages/NewAppointmentPage';
import SettingsPage from '@/pages/SettingsPage';
import CabinetSettingsPage from '@/pages/CabinetSettingsPage';
import CabinetsPage from '@/pages/CabinetsPage';
import CabinetDetailPage from '@/pages/CabinetDetailPage';
import EditCabinetPage from '@/pages/EditCabinetPage';
import NewCabinetPage from '@/pages/NewCabinetPage';
import InvoicesPage from '@/pages/InvoicesPage';
import InvoiceDetailPage from '@/pages/InvoiceDetailPage';
import NewInvoicePage from '@/pages/NewInvoicePage';
import SchedulePage from '@/pages/SchedulePage';
import NotFoundPage from '@/pages/NotFoundPage';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      
      {/* Patient routes */}
      <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
      <Route path="/patients/new" element={<ProtectedRoute><NewPatientPage /></ProtectedRoute>} />
      <Route path="/patients/:id" element={<ProtectedRoute><PatientDetailPage /></ProtectedRoute>} />
      
      {/* Appointment routes */}
      <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
      <Route path="/appointments/new" element={<ProtectedRoute><NewAppointmentPage /></ProtectedRoute>} />
      <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetailPage /></ProtectedRoute>} />
      <Route path="/appointments/:id/edit" element={<ProtectedRoute><EditAppointmentPage /></ProtectedRoute>} />
      
      {/* Cabinet routes */}
      <Route path="/cabinets" element={<ProtectedRoute><CabinetsPage /></ProtectedRoute>} />
      <Route path="/cabinets/new" element={<ProtectedRoute><NewCabinetPage /></ProtectedRoute>} />
      <Route path="/cabinets/:id" element={<ProtectedRoute><CabinetDetailPage /></ProtectedRoute>} />
      <Route path="/cabinets/:id/edit" element={<ProtectedRoute><EditCabinetPage /></ProtectedRoute>} />
      
      {/* Invoice routes */}
      <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
      <Route path="/invoices/new" element={<ProtectedRoute><NewInvoicePage /></ProtectedRoute>} />
      <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />
      
      {/* Other routes */}
      <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/settings/cabinet" element={<ProtectedRoute><CabinetSettingsPage /></ProtectedRoute>} />
      
      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
