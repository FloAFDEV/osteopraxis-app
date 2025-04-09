
import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import NewPatientPage from './pages/NewPatientPage';
import EditPatientPage from './pages/EditPatientPage';
import PatientDetailPage from './pages/PatientDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import NewAppointmentPage from './pages/NewAppointmentPage';
import EditAppointmentPage from './pages/EditAppointmentPage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import NewInvoicePage from './pages/NewInvoicePage';
import { Toaster } from 'sonner';
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import CabinetsManagementPage from "./pages/CabinetsManagementPage";
import NewCabinetPage from "./pages/NewCabinetPage";

function App() {
  const { isAuthenticated, loadStoredToken } = useAuth();

  useEffect(() => {
    loadStoredToken();
  }, [loadStoredToken]);

  return (
    <>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/patients" element={isAuthenticated ? <PatientsPage /> : <Navigate to="/login" />} />
        <Route path="/patients/new" element={isAuthenticated ? <NewPatientPage /> : <Navigate to="/login" />} />
        <Route path="/patients/:id/edit" element={isAuthenticated ? <EditPatientPage /> : <Navigate to="/login" />} />
        <Route path="/patients/:id" element={isAuthenticated ? <PatientDetailPage /> : <Navigate to="/login" />} />
        <Route path="/appointments" element={isAuthenticated ? <AppointmentsPage /> : <Navigate to="/login" />} />
        <Route path="/appointments/new" element={isAuthenticated ? <NewAppointmentPage /> : <Navigate to="/login" />} />
        <Route path="/appointments/:id/edit" element={isAuthenticated ? <EditAppointmentPage /> : <Navigate to="/login" />} />
        <Route path="/schedule" element={isAuthenticated ? <SchedulePage /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} />
        <Route path="/invoices" element={isAuthenticated ? <InvoicesPage /> : <Navigate to="/login" />} />
        <Route path="/invoices/new" element={isAuthenticated ? <NewInvoicePage /> : <Navigate to="/login" />} />
        <Route path="/invoices/:id" element={isAuthenticated ? <InvoiceDetailPage /> : <Navigate to="/login" />} />
        <Route path="/cabinets" element={isAuthenticated ? <CabinetsManagementPage /> : <Navigate to="/login" />} />
        <Route path="/cabinets/new" element={isAuthenticated ? <NewCabinetPage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
