
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/theme-context";
import { OptimizationProvider } from "@/contexts/OptimizationContext";
import { PrivacyProvider } from "@/contexts/PrivacyContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DemoDataManager } from "@/components/demo/DemoDataManager";
import { DemoSessionTimer } from "@/components/demo/DemoSessionTimer";
import { SkipToContent } from "@/components/accessibility/SkipToContent";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import Home from "@/pages/Home";
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
import CollaborationsSettingsPage from "@/pages/CollaborationsSettingsPage";
import HelpPage from "@/pages/HelpPage";
import TipsPage from "@/pages/TipsPage";
import NotFound from "@/pages/NotFound";
import NewPatientPage from "@/pages/NewPatientPage";
import PricingPage from "@/pages/PricingPage";
import ContactPage from "@/pages/ContactPage";
import PlanSelectionPage from "@/pages/PlanSelectionPage";
import NewInvoicePage from "@/pages/NewInvoicePage";
import InvoiceDetailPage from "@/pages/InvoiceDetailPage";
import NewAppointmentPage from "@/pages/NewAppointmentPage";
import EditPatientPage from "@/pages/EditPatientPage";
import EditAppointmentPage from "@/pages/EditAppointmentPage";
import EditInvoicePage from "@/pages/EditInvoicePage";
import HDSOnboardingWizard from "@/pages/HDSOnboardingWizard";

import CabinetsManagementPage from "@/pages/CabinetsManagementPage";
import NewCabinetPage from "@/pages/NewCabinetPage";
import EditCabinetPage from "@/pages/EditCabinetPage";
import CabinetInvitationsPage from "@/pages/CabinetInvitationsPage";
import AdminTechDebugPage from "@/pages/AdminTechDebugPage";
import ConnectedStorageSettingsPage from "@/pages/ConnectedStorageSettingsPage";
import ConfigurationPage from "@/pages/ConfigurationPage";

import ProtectedRoute from "@/components/ProtectedRoute";
import { PerformanceIndicator } from "@/components/ui/performance-indicator";
import { HybridStorageProvider } from "@/contexts/HybridStorageContext";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * Note: L'initialisation HDS est maintenant gérée par HybridStorageProvider
 * Le système hds-secure-storage s'occupe automatiquement du stockage local sécurisé
 */

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <OptimizationProvider>
              <PrivacyProvider>
                <DemoProvider>
                    <Router>
                      <AuthProvider>
                        <HybridStorageProvider>
                        <SecurityHeaders />
                        <SkipToContent />
                      <div id="main-content" className="min-h-screen bg-background">
                        <DemoDataManager />
                      
                      <Routes>
                        {/* Routes publiques */}
                        <Route path="/" element={<Home />} />
                        <Route path="/demo" element={<InteractiveDemoPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
                        <Route path="/privacy" element={<PrivacyPolicyPage />} />
                        <Route path="/cgu" element={<TermsOfServicePage />} />
                        <Route path="/terms" element={<TermsOfServicePage />} />
                        
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Routes protégées */}
                        <Route path="/configuration" element={
                          <ProtectedRoute>
                            <ConfigurationPage />
                          </ProtectedRoute>
                        } />
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
                        <Route path="/patients/new" element={
                          <ProtectedRoute>
                            <NewPatientPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/patients/:id" element={
                          <ProtectedRoute>
                            <PatientDetailPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/patients/:id/edit" element={
                          <ProtectedRoute>
                            <EditPatientPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/appointments" element={
                          <ProtectedRoute>
                            <AppointmentsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/appointments/new" element={
                          <ProtectedRoute>
                            <NewAppointmentPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/appointments/:id/edit" element={
                          <ProtectedRoute>
                            <EditAppointmentPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/hds-setup" element={
                          <ProtectedRoute>
                            <HDSOnboardingWizard />
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
                        <Route path="/invoices/new" element={
                          <ProtectedRoute>
                            <NewInvoicePage />
                          </ProtectedRoute>
                        } />
                        <Route path="/invoices/:id" element={
                          <ProtectedRoute>
                            <InvoiceDetailPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/invoices/:id/edit" element={
                          <ProtectedRoute>
                            <EditInvoicePage />
                          </ProtectedRoute>
                        } />
                        <Route path="/plan-selection" element={
                          <ProtectedRoute>
                            <PlanSelectionPage />
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
                        <Route path="/settings/storage" element={
                          <ProtectedRoute>
                            <ConnectedStorageSettingsPage />
                          </ProtectedRoute>
                        } />
        {/* Routes admin */}
        <Route path="/admin" element={
          <ProtectedRoute requireRole="ADMIN">
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requireRole="ADMIN">
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
                        {/* Retiré des paramètres pour les praticiens */}
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
                        {/* Routes cabinets */}
                        <Route path="/cabinets" element={
                          <ProtectedRoute>
                            <CabinetsManagementPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/cabinets/new" element={
                          <ProtectedRoute>
                            <NewCabinetPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/cabinets/:id/edit" element={
                          <ProtectedRoute>
                            <EditCabinetPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/cabinets/:id/invitations" element={
                          <ProtectedRoute>
                            <CabinetInvitationsPage />
                          </ProtectedRoute>
                        } />
                        
                        {/* Routes admin */}
                        <Route path="/admin/dashboard" element={
                          <ProtectedRoute>
                            <AdminDashboardPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/tech-debug" element={
                          <ProtectedRoute>
                            <AdminTechDebugPage />
                          </ProtectedRoute>
                        } />
                        
                        {/* Route 404 - doit être en dernier */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <PerformanceIndicator />
                      <DemoSessionTimer />
                      <Toaster />
                     </div>
                       </HybridStorageProvider>
                   </AuthProvider>
                  </Router>
                </DemoProvider>
              </PrivacyProvider>
            </OptimizationProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
