
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { DemoProvider } from "./contexts/DemoContext";
import { ThemeProvider } from "./contexts/theme-context";
import { NavigationWrapper } from "./components/NavigationWrapper";
import { Dashboard } from "./components/dashboard/dashboard";
import { PatientList } from "./components/patient-list";
import { PatientForm } from "./components/patient-form";
import { PatientDetail } from "./components/patient-detail";
import { AppointmentCalendar } from "./components/appointment-calendar";
import { InvoiceList } from "./components/invoice-list";
import { InvoiceForm } from "./components/invoice-form";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import { Login } from "./components/login";
import { Register } from "./components/register";
import { CabinetList } from "./components/cabinet/CabinetList";
import NewCabinetPage from "./pages/NewCabinetPage";
import EditCabinetPage from "./pages/EditCabinetPage";
import { CabinetSettings } from "./components/cabinet/CabinetSettings";
import { AdminDashboard } from "./components/admin/admin-dashboard";
import { DemoBanner } from "./components/DemoBanner";
import { SQLiteDiagnostic } from "./components/debug/SQLiteDiagnostic";
import { EnhancedSQLiteDiagnostic } from "./components/debug/EnhancedSQLiteDiagnostic";
import { HybridStorageDiagnostic } from "./components/debug/HybridStorageDiagnostic";
import "./App.css";

// Create query client instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <DemoProvider>
              <ErrorBoundary>
                <NavigationWrapper>
                  <div className="min-h-screen bg-background">
                    <DemoBanner />
                    <Routes>
                      {/* Public routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Protected routes */}
                      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
                      <Route path="/patients/new" element={<ProtectedRoute><PatientForm /></ProtectedRoute>} />
                      <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
                      <Route path="/patients/:id/edit" element={<ProtectedRoute><PatientForm /></ProtectedRoute>} />
                      <Route path="/appointments" element={<ProtectedRoute><AppointmentCalendar /></ProtectedRoute>} />
                      <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
                      <Route path="/invoices/new" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
                      <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />
                      <Route path="/invoices/:id/edit" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
                      <Route path="/cabinets" element={<ProtectedRoute><CabinetList /></ProtectedRoute>} />
                      <Route path="/cabinets/new" element={<ProtectedRoute><NewCabinetPage /></ProtectedRoute>} />
                      <Route path="/cabinets/:id/edit" element={<ProtectedRoute><EditCabinetPage /></ProtectedRoute>} />
                      <Route path="/cabinets/settings" element={<ProtectedRoute><CabinetSettings /></ProtectedRoute>} />

                      {/* Admin routes */}
                      <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

                      {/* Debug routes */}
                      <Route path="/debug/sqlite" element={<ProtectedRoute><SQLiteDiagnostic /></ProtectedRoute>} />
                      <Route path="/debug/sqlite-enhanced" element={<ProtectedRoute><EnhancedSQLiteDiagnostic /></ProtectedRoute>} />
                      <Route path="/debug/hybrid-storage" element={<ProtectedRoute><HybridStorageDiagnostic /></ProtectedRoute>} />
                    </Routes>
                  </div>
                </NavigationWrapper>
              </ErrorBoundary>
            </DemoProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
