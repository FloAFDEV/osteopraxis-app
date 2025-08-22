
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHybridStorage } from "@/hooks/useHybridStorage";
import { HybridStorageProvider } from "@/contexts/HybridStorageContext";
import { useDemo } from "@/contexts/DemoContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'ADMIN' | 'OSTEOPATH';
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemo();
  const { status, isLoading } = useHybridStorage();

  // En mode démo : pas de stockage hybride, chargement simple
  if (isDemoMode) {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!user && !isDemoMode) {
      return <Navigate to="/login" replace />;
    }

    if (requireRole && user?.role !== requireRole && !isDemoMode) {
      return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
  }

  // Pour les vrais utilisateurs : attendre le stockage hybride
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Pour les vrais utilisateurs, utiliser le stockage hybride Supabase + local sécurisé
  return (
    <HybridStorageProvider>
      {children}
    </HybridStorageProvider>
  );
};
