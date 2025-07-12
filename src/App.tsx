import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/theme-context";
import { OptimizationProvider } from "@/contexts/OptimizationContext";
import { PrivacyProvider } from "@/contexts/PrivacyContext";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import NewPatientPage from "./pages/NewPatientPage";
import EditPatientPage from "./pages/EditPatientPage";
import PatientDetailPage from "./pages/PatientDetailPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import NewAppointmentPage from "./pages/NewAppointmentPage";
import EditAppointmentPage from "./pages/EditAppointmentPage";
import ImmediateAppointmentPage from "./pages/ImmediateAppointmentPage";
import InvoicesPage from "./pages/InvoicesPage";
import NewInvoicePage from "./pages/NewInvoicePage";
import EditInvoicePage from "./pages/EditInvoicePage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import SettingsPage from "./pages/SettingsPage";
import OsteopathSettingsPage from "./pages/OsteopathSettingsPage";
import CabinetSettingsPage from "./pages/CabinetSettingsPage";
import CollaborationsSettingsPage from "./pages/CollaborationsSettingsPage";
import CabinetsManagementPage from "./pages/CabinetsManagementPage";
import NewCabinetPage from "./pages/NewCabinetPage";
import EditCabinetPage from "./pages/EditCabinetPage";
import CabinetInvitationsPage from "./pages/CabinetInvitationsPage";
import OsteopathProfilePage from "./pages/OsteopathProfilePage";
import SchedulePage from "./pages/SchedulePage";
import HelpPage from "./pages/HelpPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import AdminPage from "./pages/AdminPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import LandingPage from "./pages/LandingPage";
import DemoPage from "./pages/DemoPage";

function App() {
  return (
    <ThemeProvider>
      <OptimizationProvider>
        <PrivacyProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/demo" element={<DemoPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  
                  {/* Routes protégées */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/osteopath-profile"
                    element={
                      <ProtectedRoute>
                        <OsteopathProfilePage />
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
                    path="/patients/:id"
                    element={
                      <ProtectedRoute>
                        <PatientDetailPage />
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
                    path="/patients/:patientId/appointment"
                    element={
                      <ProtectedRoute>
                        <ImmediateAppointmentPage />
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
                    path="/invoices/:id"
                    element={
                      <ProtectedRoute>
                        <InvoiceDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/schedule"
                    element={
                      <ProtectedRoute>
                        <SchedulePage />
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
                    path="/settings/osteopath"
                    element={
                      <ProtectedRoute>
                        <OsteopathSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/cabinet"
                    element={
                      <ProtectedRoute>
                        <CabinetSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings/collaborations"
                    element={
                      <ProtectedRoute>
                        <CollaborationsSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cabinets"
                    element={
                      <ProtectedRoute>
                        <CabinetsManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cabinets/new"
                    element={
                      <ProtectedRoute>
                        <NewCabinetPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cabinets/:id/edit"
                    element={
                      <ProtectedRoute>
                        <EditCabinetPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cabinet-invitations"
                    element={
                      <ProtectedRoute>
                        <CabinetInvitationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/help"
                    element={
                      <ProtectedRoute>
                        <HelpPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  
                   {/* Route catch-all pour les 404 */}
                   <Route path="*" element={<NotFound />} />
                 </Routes>
               </AuthProvider>
             </BrowserRouter>
           </TooltipProvider>
         </PrivacyProvider>
       </OptimizationProvider>
     </ThemeProvider>
   );
 }

export default App;