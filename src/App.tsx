import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";

// Pages
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import PatientsPage from "@/pages/PatientsPage";
import PatientDetailPage from "@/pages/PatientDetailPage";
import NewPatientPage from "@/pages/NewPatientPage";
import EditPatientPage from "@/pages/EditPatientPage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import NewAppointmentPage from "@/pages/NewAppointmentPage";
import EditAppointmentPage from "@/pages/EditAppointmentPage";
import InvoicesPage from "@/pages/InvoicesPage";
import NewInvoicePage from "@/pages/NewInvoicePage";
import EditInvoicePage from "@/pages/EditInvoicePage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";
import NewSessionPage from "@/pages/NewSessionPage";
import SessionDetailPage from "@/pages/SessionDetailPage";
import EditSessionPage from "@/pages/EditSessionPage";

// Auth components
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/new"
            element={
              <ProtectedRoute>
                <NewPatientPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id/edit"
            element={
              <ProtectedRoute>
                <EditPatientPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/new"
            element={
              <ProtectedRoute>
                <NewAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/:id/edit"
            element={
              <ProtectedRoute>
                <EditAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/new"
            element={
              <ProtectedRoute>
                <NewInvoicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/:id/edit"
            element={
              <ProtectedRoute>
                <EditInvoicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/new"
            element={
              <ProtectedRoute>
                <NewSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:id"
            element={
              <ProtectedRoute>
                <SessionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:id/edit"
            element={
              <ProtectedRoute>
                <EditSessionPage />
              </ProtectedRoute>
            }
          />

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}

export default App;
