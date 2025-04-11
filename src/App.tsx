
import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
import CabinetsManagementPage from "./pages/CabinetsManagementPage";
import NewCabinetPage from "./pages/NewCabinetPage";
import EditCabinetPage from "./pages/EditCabinetPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import OsteopathProfilePage from "./pages/OsteopathProfilePage";
import OsteopathSettingsPage from "./pages/OsteopathSettingsPage";
import CabinetSettingsPage from "./pages/CabinetSettingsPage";

function App() {
  const { isAuthenticated, loadStoredToken, user } = useAuth();

  useEffect(() => {
    loadStoredToken();
  }, [loadStoredToken]);

  // Check if the user needs to complete their profile
  const needsProfileSetup = isAuthenticated && user && !user.osteopathId;

  // If the user needs to complete their profile, redirect them to the profile setup page
  // except if they're already on the profile setup page or certain public pages
  const shouldRedirectToProfileSetup = (path: string) => {
    const publicPaths = ['/settings/profile', '/profile/setup', '/privacy-policy', '/terms-of-service'];
    return needsProfileSetup && !publicPaths.some(p => path.startsWith(p));
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? (shouldRedirectToProfileSetup('/dashboard') ? <Navigate to="/profile/setup" /> : <DashboardPage />) : <Navigate to="/login" />} />
        <Route path="/patients" element={isAuthenticated ? (shouldRedirectToProfileSetup('/patients') ? <Navigate to="/profile/setup" /> : <PatientsPage />) : <Navigate to="/login" />} />
        <Route path="/patients/new" element={isAuthenticated ? (shouldRedirectToProfileSetup('/patients/new') ? <Navigate to="/profile/setup" /> : <NewPatientPage />) : <Navigate to="/login" />} />
        <Route path="/patients/:id/edit" element={isAuthenticated ? (shouldRedirectToProfileSetup('/patients/:id/edit') ? <Navigate to="/profile/setup" /> : <EditPatientPage />) : <Navigate to="/login" />} />
        <Route path="/patients/:id" element={isAuthenticated ? (shouldRedirectToProfileSetup('/patients/:id') ? <Navigate to="/profile/setup" /> : <PatientDetailPage />) : <Navigate to="/login" />} />
        <Route path="/appointments" element={isAuthenticated ? (shouldRedirectToProfileSetup('/appointments') ? <Navigate to="/profile/setup" /> : <AppointmentsPage />) : <Navigate to="/login" />} />
        <Route path="/appointments/new" element={isAuthenticated ? (shouldRedirectToProfileSetup('/appointments/new') ? <Navigate to="/profile/setup" /> : <NewAppointmentPage />) : <Navigate to="/login" />} />
        <Route path="/appointments/:id/edit" element={isAuthenticated ? (shouldRedirectToProfileSetup('/appointments/:id/edit') ? <Navigate to="/profile/setup" /> : <EditAppointmentPage />) : <Navigate to="/login" />} />
        <Route path="/schedule" element={isAuthenticated ? (shouldRedirectToProfileSetup('/schedule') ? <Navigate to="/profile/setup" /> : <SchedulePage />) : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? (shouldRedirectToProfileSetup('/settings') ? <Navigate to="/profile/setup" /> : <SettingsPage />) : <Navigate to="/login" />} />
        <Route path="/settings/profile" element={isAuthenticated ? <OsteopathSettingsPage /> : <Navigate to="/login" />} />
        <Route path="/profile/setup" element={isAuthenticated ? <OsteopathProfilePage /> : <Navigate to="/login" />} />
        <Route path="/settings/cabinet" element={isAuthenticated ? (shouldRedirectToProfileSetup('/settings/cabinet') ? <Navigate to="/profile/setup" /> : <CabinetSettingsPage />) : <Navigate to="/login" />} />
        <Route path="/invoices" element={isAuthenticated ? (shouldRedirectToProfileSetup('/invoices') ? <Navigate to="/profile/setup" /> : <InvoicesPage />) : <Navigate to="/login" />} />
        <Route path="/invoices/new" element={isAuthenticated ? (shouldRedirectToProfileSetup('/invoices/new') ? <Navigate to="/profile/setup" /> : <NewInvoicePage />) : <Navigate to="/login" />} />
        <Route path="/invoices/:id" element={isAuthenticated ? (shouldRedirectToProfileSetup('/invoices/:id') ? <Navigate to="/profile/setup" /> : <InvoiceDetailPage />) : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? (needsProfileSetup ? "/profile/setup" : "/dashboard") : "/login"} />} />
        <Route path="/cabinets" element={isAuthenticated ? (shouldRedirectToProfileSetup('/cabinets') ? <Navigate to="/profile/setup" /> : <CabinetsManagementPage />) : <Navigate to="/login" />} />
        <Route path="/cabinets/new" element={isAuthenticated ? <NewCabinetPage /> : <Navigate to="/login" />} />
        <Route path="/cabinets/:id/edit" element={isAuthenticated ? (shouldRedirectToProfileSetup('/cabinets/:id/edit') ? <Navigate to="/profile/setup" /> : <EditCabinetPage />) : <Navigate to="/login" />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        
        {/* Redirect cabinet to cabinets */}
        <Route path="/cabinet" element={isAuthenticated ? <Navigate to="/cabinets" /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
