
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

const AdminDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Rediriger vers le tableau de bord régulier si l'utilisateur n'est pas admin
  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" />;
  }

  return <AdminDashboard />;
};

export default AdminDashboardPage;
