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
import { api } from './services/api';
import NewSessionPage from './pages/NewSessionPage';
import EditSessionPage from './pages/EditSessionPage';

function App() {
  const { isAuthenticated, loadStoredToken, user } = useAuth();
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
  
  // Configuration des chemins publics (accessibles sans connexion)
  const publicPaths = ['/privacy-policy', '/terms-of-service'];
  
  // Ajout d'un intercepteur global pour toutes les requêtes fetch
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const modifiedInit = init || {};
      // Si l'URL contient supabase.co, nous ajoutons les en-têtes CORS
      if (typeof input === 'string' && input.includes('supabase.co')) {
        modifiedInit.headers = {
          ...modifiedInit.headers,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, X-Cancellation-Override, X-HTTP-Method-Override, prefer',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        };
      }
      return originalFetch(input, modifiedInit);
    };

    return () => {
      window.fetch = originalFetch; // Restauration de la fonction d'origine lors du démontage
    };
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const isAdmin = user?.role === "ADMIN";
  
  return (
    <>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        
        {/* Routes protégées qui nécessitent une authentification */}
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
        <Route path="/settings/profile" element={isAuthenticated ? <OsteopathSettingsPage /> : <Navigate to="/login" />} />
        <Route path="/profile/setup" element={isAuthenticated ? <OsteopathProfilePage /> : <Navigate to="/login" />} />
        <Route path="/settings/cabinet" element={isAuthenticated ? <CabinetSettingsPage /> : <Navigate to="/login" />} />
        <Route path="/invoices" element={isAuthenticated ? <InvoicesPage /> : <Navigate to="/login" />} />
        <Route path="/invoices/new" element={isAuthenticated ? <NewInvoicePage /> : <Navigate to="/login" />} />
        <Route path="/invoices/:id" element={isAuthenticated ? <InvoiceDetailPage /> : <Navigate to="/login" />} />
        <Route path="/invoices/:id/edit" element={isAuthenticated ? <EditInvoicePage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path="/cabinets" element={isAuthenticated ? <CabinetsManagementPage /> : <Navigate to="/login" />} />
        <Route path="/cabinets/new" element={isAuthenticated ? <NewCabinetPage /> : <Navigate to="/login" />} />
        <Route path="/cabinets/:id/edit" element={isAuthenticated ? <EditCabinetPage /> : <Navigate to="/login" />} />
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
        
        {/* Routes pour les sessions */}
        <Route path="/sessions/new" element={isAuthenticated ? <NewSessionPage /> : <Navigate to="/login" />} />
        <Route path="/sessions/:id/edit" element={isAuthenticated ? <EditSessionPage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
