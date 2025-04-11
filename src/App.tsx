
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

function App() {
  const { user, isLoading, isAuthenticated } = useAuth();
  console.log("App rendering with user:", user, "isAuthenticated:", isAuthenticated, "isLoading:", isLoading);
  
  // Check if user needs to complete their profile
  const needsProfileCompletion = user && isAuthenticated && !user.osteopathId;

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Index />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        
        {/* Profile completion route - only for authenticated users who need to complete profile */}
        <Route path="/complete-profile" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <OsteopathProfilePage /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } />
        
        {/* Protected routes that require profile completion */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <DashboardPage />}
          </ProtectedRoute>
        } />
        
        {/* Patient routes */}
        <Route path="/patients" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <PatientsPage />}
          </ProtectedRoute>
        } />
        <Route path="/patients/new" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <NewPatientPage />}
          </ProtectedRoute>
        } />
        <Route path="/patients/:id" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <PatientDetailPage />}
          </ProtectedRoute>
        } />
        <Route path="/patients/:id/edit" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <EditPatientPage />}
          </ProtectedRoute>
        } />
        
        {/* Appointment routes */}
        <Route path="/appointments" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <AppointmentsPage />}
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <SchedulePage />}
          </ProtectedRoute>
        } />
        <Route path="/appointments/new" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <NewAppointmentPage />}
          </ProtectedRoute>
        } />
        <Route path="/appointments/:id/edit" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <EditAppointmentPage />}
          </ProtectedRoute>
        } />
        
        {/* Invoice routes */}
        <Route path="/invoices" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <InvoicesPage />}
          </ProtectedRoute>
        } />
        <Route path="/invoices/new" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <NewInvoicePage />}
          </ProtectedRoute>
        } />
        <Route path="/invoices/:id" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <InvoiceDetailPage />}
          </ProtectedRoute>
        } />
        
        {/* Cabinet management routes */}
        <Route path="/settings/cabinet" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <CabinetSettingsPage />}
          </ProtectedRoute>
        } />
        <Route path="/settings/cabinet/new" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <NewCabinetPage />}
          </ProtectedRoute>
        } />
        <Route path="/settings/cabinet/:id/edit" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <EditCabinetPage />}
          </ProtectedRoute>
        } />
        <Route path="/settings/cabinets" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <CabinetsManagementPage />}
          </ProtectedRoute>
        } />
        <Route path="/cabinets" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <CabinetsManagementPage />}
          </ProtectedRoute>
        } />
        <Route path="/cabinet" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <CabinetSettingsPage />}
          </ProtectedRoute>
        } />
        
        {/* Profile and settings routes */}
        <Route path="/settings" element={
          <ProtectedRoute>
            {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <SettingsPage />}
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
              {needsProfileCompletion ? <Navigate to="/complete-profile" replace /> : <AdminPage />}
            </AdminRoute>
          </ProtectedRoute>
        } />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
