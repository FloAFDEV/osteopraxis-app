
import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
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
import ImmediateAppointmentPage from './pages/ImmediateAppointmentPage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import NewInvoicePage from './pages/NewInvoicePage';
import EditInvoicePage from './pages/EditInvoicePage';
import { Toaster } from 'sonner';
import CabinetsManagementPage from "./pages/CabinetsManagementPage";
import NewCabinetPage from "./pages/NewCabinetPage";
import EditCabinetPage from "./pages/EditCabinetPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import OsteopathProfilePage from "./pages/OsteopathProfilePage";
import OsteopathSettingsPage from "./pages/OsteopathSettingsPage";
import CabinetSettingsPage from "./pages/CabinetSettingsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function App() {
  const { isAuthenticated, loadStoredToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
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

  // Vérifier si l'utilisateur a un profil complet et rediriger si nécessaire
  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      // Si l'utilisateur est connecté mais n'a pas d'osteopathId, rediriger vers la page de profil
      if (!user.osteopathId) {
        // Éviter une redirection en boucle vers la page de profil ostéopathe
        if (location.pathname !== '/profile/osteopath') {
          console.log("Utilisateur sans profil complet, redirection vers la création de profil");
          window.location.href = '/profile/osteopath';
        }
      }
    }
  }, [isAuthenticated, user, loading, location.pathname]);
  
  // Configuration des chemins publics (accessibles sans connexion)
  const publicPaths = ['/privacy-policy', '/terms-of-service'];
  
  // Fonction pour vérifier si l'utilisateur doit être redirigé vers la page de profil
  const shouldRedirectToProfile = (pathname: string) => {
    return isAuthenticated && user && !user.osteopathId && 
           pathname !== '/login' && 
           pathname !== '/register' && 
           pathname !== '/profile/osteopath' &&
           !publicPaths.includes(pathname);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const isAdmin = user?.role === "ADMIN";
  
  // Rediriger vers la page de profil si nécessaire
  if (shouldRedirectToProfile(location.pathname)) {
    return <Navigate to="/profile/osteopath" />;
  }
  
  return (
    <>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        
        {/* Routes protégées qui nécessitent une authentification */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <DashboardPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/patients" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <PatientsPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/patients/new" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <NewPatientPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/patients/:id/edit" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <EditPatientPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/patients/:id" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <PatientDetailPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/appointments" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <AppointmentsPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/appointments/new" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <NewAppointmentPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/appointments/immediate" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <ImmediateAppointmentPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/appointments/:id/edit" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <EditAppointmentPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/schedule" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <SchedulePage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/settings" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <SettingsPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/settings/profile" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <OsteopathSettingsPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route path="/profile/osteopath" element={isAuthenticated ? <OsteopathProfilePage /> : <Navigate to="/login" />} />
        <Route 
          path="/settings/cabinet" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <CabinetSettingsPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/invoices" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <InvoicesPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/invoices/new" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <NewInvoicePage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/invoices/:id" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <InvoiceDetailPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/invoices/:id/edit" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <EditInvoicePage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route 
          path="/cabinets" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <CabinetsManagementPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/cabinets/new" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <NewCabinetPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/cabinets/:id/edit" 
          element={
            isAuthenticated ? 
              (user?.osteopathId ? <EditCabinetPage /> : <Navigate to="/profile/osteopath" />) : 
              <Navigate to="/login" />
          } 
        />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        
        {/* Nouvelle route pour l'administration */}
        <Route path="/admin" element={
          isAuthenticated ? 
            (isAdmin ? <AdminDashboardPage /> : <Navigate to="/dashboard" />) : 
            <Navigate to="/login" />
        } />
        
        {/* Redirect cabinet à cabinets */}
        <Route path="/cabinet" element={isAuthenticated ? <Navigate to="/cabinets" /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
