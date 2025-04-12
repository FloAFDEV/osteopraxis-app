
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

  // Chargement initial du token stocké au démarrage de l'application
  useEffect(() => {
    const initAuth = async () => {
      console.log("Chargement initial du token stocké...");
      try {
        await loadStoredToken();
      } catch (error) {
        console.error("Erreur lors du chargement initial du token:", error);
      }
    };
    initAuth();
  }, [loadStoredToken]);

  // Ne rediriger vers le setup QUE si l'utilisateur est authentifié mais n'a pas d'osteopathId
  // Si l'utilisateur a un osteopathId, on considère qu'il a déjà créé un profil
  const needsProfileSetup = isAuthenticated && user && !user.osteopathId;
  
  const publicPaths = ['/profile/setup', '/settings/profile', '/privacy-policy', '/terms-of-service'];
  
  // Debug pour comprendre l'état actuel
  console.log("État auth:", { isAuthenticated, needsProfileSetup, userId: user?.id, osteopathId: user?.osteopathId });
  
  // Forcer un petit délai pour s'assurer que le localStorage est bien chargé
  useEffect(() => {
    const checkAgain = async () => {
      if (isAuthenticated && !user?.osteopathId) {
        console.log("Vérification supplémentaire du token avec délai...");
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadStoredToken();
      }
    };
    checkAgain();
  }, [isAuthenticated, user, loadStoredToken]);
  
  return (
    <>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        
        {/* Routes protégées qui nécessitent une authentification */}
        <Route path="/dashboard" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <DashboardPage />) : <Navigate to="/login" />} />
        <Route path="/patients" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <PatientsPage />) : <Navigate to="/login" />} />
        <Route path="/patients/new" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <NewPatientPage />) : <Navigate to="/login" />} />
        <Route path="/patients/:id/edit" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <EditPatientPage />) : <Navigate to="/login" />} />
        <Route path="/patients/:id" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <PatientDetailPage />) : <Navigate to="/login" />} />
        <Route path="/appointments" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <AppointmentsPage />) : <Navigate to="/login" />} />
        <Route path="/appointments/new" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <NewAppointmentPage />) : <Navigate to="/login" />} />
        <Route path="/appointments/:id/edit" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <EditAppointmentPage />) : <Navigate to="/login" />} />
        <Route path="/schedule" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <SchedulePage />) : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <SettingsPage />) : <Navigate to="/login" />} />
        <Route path="/settings/profile" element={isAuthenticated ? <OsteopathSettingsPage /> : <Navigate to="/login" />} />
        <Route path="/profile/setup" element={isAuthenticated ? <OsteopathProfilePage /> : <Navigate to="/login" />} />
        <Route path="/settings/cabinet" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <CabinetSettingsPage />) : <Navigate to="/login" />} />
        <Route path="/invoices" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <InvoicesPage />) : <Navigate to="/login" />} />
        <Route path="/invoices/new" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <NewInvoicePage />) : <Navigate to="/login" />} />
        <Route path="/invoices/:id" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <InvoiceDetailPage />) : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? (needsProfileSetup ? "/profile/setup" : "/dashboard") : "/login"} />} />
        <Route path="/cabinets" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <CabinetsManagementPage />) : <Navigate to="/login" />} />
        <Route path="/cabinets/new" element={isAuthenticated ? <NewCabinetPage /> : <Navigate to="/login" />} />
        <Route path="/cabinets/:id/edit" element={isAuthenticated ? (needsProfileSetup ? <Navigate to="/profile/setup" /> : <EditCabinetPage />) : <Navigate to="/login" />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        
        {/* Redirect cabinet à cabinets */}
        <Route path="/cabinet" element={isAuthenticated ? <Navigate to="/cabinets" /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
