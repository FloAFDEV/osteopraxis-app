import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/theme-context";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import PatientDetailPage from "./pages/PatientDetailPage";
import NewPatientPage from "./pages/NewPatientPage";
import EditPatientPage from "./pages/EditPatientPage";
import CabinetsManagementPage from "./pages/CabinetsManagementPage";
import NewCabinetPage from "./pages/NewCabinetPage";
import EditCabinetPage from "./pages/EditCabinetPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import SchedulePage from "./pages/SchedulePage";
import InvoicesPage from "./pages/InvoicesPage";
import NewInvoicePage from "./pages/NewInvoicePage";
import EditInvoicePage from "./pages/EditInvoicePage";
import LoginPage from "./pages/LoginPage";
import OsteopathProfilePage from "./pages/OsteopathProfilePage";
import SettingsPage from "./pages/SettingsPage";
import OsteopathSettingsPage from "./pages/OsteopathSettingsPage";
import CollaborationsSettingsPage from "./pages/CollaborationsSettingsPage";
import HelpPage from "./pages/HelpPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaser />
          <Sonner 
            closeButton={true}
            richColors={true}
            position="top-right"
            expand={true}
            visibleToasts={5}
          />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Index />} />
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
                  path="/patients/add"
                  element={
                    <ProtectedRoute>
                      <NewPatientPage />
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
                  path="/patients/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditPatientPage />
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
                  path="/cabinets/add"
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
                  path="/appointments"
                  element={
                    <ProtectedRoute>
                      <AppointmentsPage />
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
                  path="/invoices"
                  element={
                    <ProtectedRoute>
                      <InvoicesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoices/create"
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
                  path="/osteopath-profile"
                  element={
                    <ProtectedRoute>
                      <OsteopathProfilePage />
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
                  path="/settings/profile"
                  element={
                    <ProtectedRoute>
                      <OsteopathSettingsPage />
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
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <HelpPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
