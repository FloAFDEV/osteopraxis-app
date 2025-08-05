
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/theme-context";
import { OptimizationProvider } from "@/contexts/OptimizationContext";
import { PrivacyProvider } from "@/contexts/PrivacyContext";
// DemoContext supprimé - utilisation du service HDS demo
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
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
import InvoicesPage from "@/pages/InvoicesPage";
import SchedulePage from "@/pages/SchedulePage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import InteractiveDemoPage from "@/pages/InteractiveDemoPage";
import HDSDemoPage from "@/pages/HDSDemoPage";
import CollaborationsSettingsPage from "@/pages/CollaborationsSettingsPage";
import HelpPage from "@/pages/HelpPage";
import SQLiteDebugPage from "@/pages/SQLiteDebugPage";
import DataManagementPage from "@/pages/DataManagementPage";
import TipsPage from "@/pages/TipsPage";
import DebugPage from "@/pages/DebugPage";
import NotFound from "@/pages/NotFound";

import ProtectedRoute from "@/components/ProtectedRoute";

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <OptimizationProvider>
            <PrivacyProvider>
              <Router>
                <AuthProvider>
                  <div className="min-h-screen bg-background">
                    <Routes>
                      {/* Routes publiques */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/demo" element={<HDSDemoPage />} />
                      <Route path="/demo-legacy" element={<InteractiveDemoPage />} />

                      {/* Route pour l'index - redirige vers dashboard ou landing selon l'auth */}
                      <Route path="/index" element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
                      <Route path="/privacy" element={<PrivacyPolicyPage />} />
                      <Route path="/cgu" element={<TermsOfServicePage />} />
                      <Route path="/terms" element={<TermsOfServicePage />} />
                      
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
                      {/* Suppression de la route /patients/new - redirection gérée dans PatientDetailPage */}
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
                      <Route path="/schedule" element={
                        <ProtectedRoute>
                          <SchedulePage />
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
                          <CollaborationsSettingsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings/data-management" element={
                        <ProtectedRoute>
                          <DataManagementPage />
                        </ProtectedRoute>
                      } />
                        <Route path="/debug" element={<DebugPage />} />
                        <Route path="/settings/debug" element={
                        <ProtectedRoute>
                          <SQLiteDebugPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/help" element={
                        <ProtectedRoute>
                          <HelpPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/conseils" element={
                        <ProtectedRoute>
                          <TipsPage />
                        </ProtectedRoute>
                      } />
                      {/* Routes admin */}
                      <Route path="/admin/dashboard" element={
                        <ProtectedRoute>
                          <AdminDashboardPage />
                        </ProtectedRoute>
                      } />
                      
                      {/* Route 404 - doit être en dernier */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toaster />
                  </div>
                </AuthProvider>
              </Router>
            </PrivacyProvider>
          </OptimizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
