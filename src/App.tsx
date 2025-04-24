
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PatientsPage from "./pages/PatientsPage";
import NewPatientPage from "./pages/NewPatientPage";
import EditPatientPage from "./pages/EditPatientPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import NewAppointmentPage from "./pages/NewAppointmentPage";
import EditAppointmentPage from "./pages/EditAppointmentPage";
import PatientDetailPage from "./pages/PatientDetailPage";
import InvoicesPage from "./pages/InvoicesPage";
import NewInvoicePage from "./pages/NewInvoicePage";
import SettingsPage from "./pages/SettingsPage";
import { FancyLoader } from "./components/ui/fancy-loader";
import CalendarPage from "./pages/CalendarPage";
import EditInvoicePage from "./pages/EditInvoicePage";

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid h-screen place-items-center">
        <FancyLoader message="Vérification de votre session..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
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
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route path="patients">
          <Route
            index
            element={
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute>
                <NewPatientPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute>
                <EditPatientPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="appointments">
          <Route
            index
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute>
                <NewAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute>
                <EditAppointmentPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="invoices">
          <Route index element={<InvoicesPage />} />
          <Route path="new" element={<NewInvoicePage />} />
          <Route path=":id/edit" element={<EditInvoicePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );

  function ProtectedRoute({ children }: { children: JSX.Element }) {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      if (!auth.isAuthenticated && !auth.isLoading) {
        navigate("/login", { replace: true, state: { from: location } });
      }
    }, [auth.isAuthenticated, auth.isLoading, navigate, location]);

    if (auth.isLoading) {
      return (
        <div className="grid h-screen place-items-center">
          <FancyLoader message="Vérification de votre session..." />
        </div>
      );
    }

    if (!auth.isAuthenticated) {
      return null;
    }

    return children;
  }
}

export default App;
