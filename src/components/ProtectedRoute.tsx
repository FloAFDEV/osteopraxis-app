
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
  const { storageReady } = useHybridStorage();
  const { isDemoMode } = useDemo();

  if (loading || !storageReady) {
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

  // Si c'est le mode démo, on utilise pas le stockage hybride
  if (isDemoMode) {
    return <>{children}</>;
  }

  // Pour les vrais utilisateurs, on attend que le stockage soit prêt
  if (!storageReady) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <HybridStorageProvider>
      {children}
    </HybridStorageProvider>
  );
};
