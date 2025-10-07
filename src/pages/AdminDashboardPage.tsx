
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { useDemo } from "@/contexts/DemoContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const AdminDashboardPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { isDemoMode } = useDemo();
  
  // Afficher un loader pendant la vérification d'authentification
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // Rediriger vers le tableau de bord régulier si l'utilisateur n'est pas admin
  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // Bloquer l'accès en mode démo
  if (isDemoMode) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Accès restreint en mode démo</strong>
            <p className="mt-2">Les fonctionnalités d'administration ne sont pas disponibles en mode démonstration pour des raisons de sécurité.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <AdminDashboard />;
};

export default AdminDashboardPage;
