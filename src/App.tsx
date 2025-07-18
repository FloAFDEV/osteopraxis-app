
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import PatientsPage from "@/pages/PatientsPage";
import PatientDetailPage from "@/pages/PatientDetailPage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import SettingsPage from "@/pages/SettingsPage";
import DataImportPage from "@/pages/DataImportPage";
import OsteopathSettingsPage from "@/pages/OsteopathSettingsPage";
import CabinetSettingsPage from "@/pages/CabinetSettingsPage";
import CollaborationsPage from "@/pages/CollaborationsPage";
import InvoicesPage from "@/pages/InvoicesPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Routes protégées */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/patients" element={
                <ProtectedRoute>
                  <PatientsPage />
                </ProtectedRoute>
              } />
              <Route path="/patients/:id" element={
                <ProtectedRoute>
                  <PatientDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <AppointmentsPage />
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <InvoicesPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings/import" element={
                <ProtectedRoute>
                  <DataImportPage />
                </ProtectedRoute>
              } />
              <Route path="/settings/osteopath" element={
                <ProtectedRoute>
                  <OsteopathSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings/cabinet" element={
                <ProtectedRoute>
                  <CabinetSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings/collaborations" element={
                <ProtectedRoute>
                  <CollaborationsPage />
                </ProtectedRoute>
              } />

              {/* Routes admin */}
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              } />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
