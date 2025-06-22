
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/theme-context';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import PatientsPage from '@/pages/PatientsPage';
import NewPatientPage from '@/pages/NewPatientPage';
import PatientDetailsPage from '@/pages/PatientDetailPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import SchedulePage from '@/pages/SchedulePage';
import SettingsPage from '@/pages/SettingsPage';
import AdminPage from '@/pages/AdminPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import CabinetsPage from '@/pages/CabinetsManagementPage';
import NewCabinetPage from '@/pages/NewCabinetPage';
import CabinetSettingsPage from '@/pages/CabinetSettingsPage';
import OsteopathSettingsPage from '@/pages/OsteopathSettingsPage';
import InvoicesPage from '@/pages/InvoicesPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import CollaborationsSettingsPage from '@/pages/CollaborationsSettingsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
              <Route path="/patients/new" element={<ProtectedRoute><NewPatientPage /></ProtectedRoute>} />
              <Route path="/patients/:id" element={<ProtectedRoute><PatientDetailsPage /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
              <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/settings/profile" element={<ProtectedRoute><OsteopathSettingsPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/cabinets" element={<ProtectedRoute><CabinetsPage /></ProtectedRoute>} />
              <Route path="/cabinets/new" element={<ProtectedRoute><NewCabinetPage /></ProtectedRoute>} />
              <Route path="/cabinets/:id" element={<ProtectedRoute><CabinetSettingsPage /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              
              {/* Nouvelle route pour les collaborations */}
              <Route 
                path="/settings/collaborations" 
                element={
                  <ProtectedRoute>
                    <CollaborationsSettingsPage />
                  </ProtectedRoute>
                } 
              />
              
            </Routes>
            <Toaster />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
