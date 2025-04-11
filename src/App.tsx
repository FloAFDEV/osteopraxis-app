import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import DashboardPage from "@/pages/DashboardPage";
import PatientsPage from "@/pages/PatientsPage";
import PatientDetailPage from "@/pages/PatientDetailPage";
import NewPatientPage from "@/pages/NewPatientPage";
import EditPatientPage from "@/pages/EditPatientPage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import NewAppointmentPage from "@/pages/NewAppointmentPage";
import EditAppointmentPage from "@/pages/EditAppointmentPage";
import SchedulePage from "@/pages/SchedulePage";
import InvoicesPage from "@/pages/InvoicesPage";
import NewInvoicePage from "@/pages/NewInvoicePage";
import InvoiceDetailPage from "@/pages/InvoiceDetailPage";
import SettingsPage from "@/pages/SettingsPage";
import CabinetSettingsPage from "@/pages/CabinetSettingsPage";
import NewCabinetPage from "@/pages/NewCabinetPage";
import EditCabinetPage from "@/pages/EditCabinetPage";
import CabinetsManagementPage from "@/pages/CabinetsManagementPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import OsteopathProfilePage from "@/pages/OsteopathProfilePage";
import AdminPage from "@/pages/AdminPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing during loading
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAuth();

  // Show nothing during loading
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to dashboard if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if admin
  return <>{children}</>;
};

const ProfileCheckRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  
  useEffect(() => {
    // Once auth loading is done, give it a small delay
    // to check if the user has a complete profile
    if (!isLoading) {
      const timer = setTimeout(() => {
        setCheckingProfile(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Show nothing during loading
  if (isLoading || checkingProfile) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If the user is authenticated but doesn't have an osteopathId yet,
  // redirect to the profile page to complete their profile
  if (user && !user.osteopathId) {
    return <Navigate to="/complete-profile" replace />;
  }
  
  // Render children if profile is complete
  return <>{children}</>;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/complete-profile" element={
          <ProtectedRoute>
            <OsteopathProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Protected routes that require authentication and completed profile */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <DashboardPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        
        {/* Patient routes */}
        <Route path="/patients" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <PatientsPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/patients/new" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <NewPatientPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/patients/:id" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <PatientDetailPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/patients/:id/edit" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <EditPatientPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        
        {/* Appointment routes */}
        <Route path="/appointments" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <AppointmentsPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <SchedulePage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/appointments/new" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <NewAppointmentPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/appointments/:id/edit" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <EditAppointmentPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        
        {/* Invoice routes */}
        <Route path="/invoices" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <InvoicesPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/invoices/new" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <NewInvoicePage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/invoices/:id" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <InvoiceDetailPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        
        {/* Cabinet management routes */}
        <Route path="/settings/cabinet" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <CabinetSettingsPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/settings/cabinet/new" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <NewCabinetPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/settings/cabinet/:id/edit" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <EditCabinetPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/settings/cabinets" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <CabinetsManagementPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        
        {/* Settings routes */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <ProfileCheckRoute>
              <SettingsPage />
            </ProfileCheckRoute>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <OsteopathProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminRoute>
              <ProfileCheckRoute>
                <AdminPage />
              </ProfileCheckRoute>
            </AdminRoute>
          </ProtectedRoute>
        } />
        
        {/* Legal routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
