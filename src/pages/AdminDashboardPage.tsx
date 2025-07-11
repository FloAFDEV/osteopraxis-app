
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

const AdminDashboardPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
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

  return <AdminDashboard />;
};

export default AdminDashboardPage;
