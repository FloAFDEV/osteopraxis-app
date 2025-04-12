
import React, { useEffect, useState } from 'react';
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
import { api } from './services/api';

function App() {
  const { isAuthenticated, loadStoredToken, user } = useAuth();
  const [hasCabinet, setHasCabinet] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Chargement initial du token stocké au démarrage de l'application
  useEffect(() => {
    const initAuth = async () => {
      console.log("Chargement initial du token stocké...");
      try {
        await loadStoredToken();
      } catch (error) {
        console.error("Erreur lors du chargement initial du token:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [loadStoredToken]);

  // Vérifier l'existence d'un cabinet lorsque l'utilisateur est authentifié
  useEffect(() => {
    const checkCabinet = async () => {
      if (isAuthenticated && user) {
        try {
          console.log("Vérification de l'existence d'un cabinet...");
          const cabinets = await api.getCabinetsByUserId(user.id);
          const hasExistingCabinet = cabinets && cabinets.length > 0;
          console.log("Cabinet existant:", hasExistingCabinet);
          setHasCabinet(hasExistingCabinet);
        } catch (error) {
          console.error("Erreur lors de la vérification du cabinet:", error);
          setHasCabinet(false);
        }
      }
    };

    checkCabinet();
  }, [isAuthenticated, user]);

  // Ne rediriger vers le setup QUE si l'utilisateur est authentifié mais n'a pas de cabinet
  const needsProfileSetup = isAuthenticated && user && hasCabinet === false;
  
  const publicPaths = ['/profile/setup', '/settings/profile', '/privacy-policy', '/terms-of-service'];
  
  // Debug pour comprendre l'état actuel
  console.log("État auth:", { isAuthenticated, needsProfileSetup, userId: user?.id, hasCabinet });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
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
