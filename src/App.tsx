
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/theme-context";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

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
import SchedulePage from "./pages/SchedulePage";
import SettingsPage from "./pages/SettingsPage";
import OsteopathProfilePage from "./pages/OsteopathProfilePage";
import OsteopathSettingsPage from "./pages/OsteopathSettingsPage";
import CabinetSettingsPage from "./pages/CabinetSettingsPage";
import CollaborationsSettingsPage from "./pages/CollaborationsSettingsPage";
import CabinetsManagementPage from "./pages/CabinetsManagementPage";
import NewCabinetPage from "./pages/NewCabinetPage";
import EditCabinetPage from "./pages/EditCabinetPage";
import AdminPage from "./pages/AdminPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFound from "./pages/NotFound";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              
              <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
              <Route path="/patients/new" element={<ProtectedRoute><NewPatientPage /></ProtectedRoute>} />
              <Route path="/patients/:id/edit" element={<ProtectedRoute><EditPatientPage /></ProtectedRoute>} />
              <Route path="/patients/:id" element={<ProtectedRoute><PatientDetailPage /></ProtectedRoute>} />
              
              <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
              <Route path="/appointments/new" element={<ProtectedRoute><NewAppointmentPage /></ProtectedRoute>} />
              <Route path="/appointments/:id/edit" element={<ProtectedRoute><EditAppointmentPage /></ProtectedRoute>} />
              <Route path="/appointments/immediate" element={<ProtectedRoute><ImmediateAppointmentPage /></ProtectedRoute>} />
              
              <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
              <Route path="/invoices/new" element={<ProtectedRoute><NewInvoicePage /></ProtectedRoute>} />
              <Route path="/invoices/:id/edit" element={<ProtectedRoute><EditInvoicePage /></ProtectedRoute>} />
              <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />
              
              <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
              
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/settings/profile" element={<ProtectedRoute><OsteopathProfilePage /></ProtectedRoute>} />
              <Route path="/settings/osteopath" element={<ProtectedRoute><OsteopathSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/cabinet" element={<ProtectedRoute><CabinetSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/collaborations" element={<ProtectedRoute><CollaborationsSettingsPage /></ProtectedRoute>} />
              
              <Route path="/cabinets" element={<ProtectedRoute><CabinetsManagementPage /></ProtectedRoute>} />
              <Route path="/cabinets/new" element={<ProtectedRoute><NewCabinetPage /></ProtectedRoute>} />
              <Route path="/cabinets/:id/edit" element={<ProtectedRoute><EditCabinetPage /></ProtectedRoute>} />
              
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            <Toaster />
            <SonnerToaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
