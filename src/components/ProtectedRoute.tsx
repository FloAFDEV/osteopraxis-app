
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import { HybridStorageProvider } from '@/contexts/HybridStorageContext';
import { useHybridStorage } from '@/hooks/useHybridStorage';
import { HybridStorageSetup } from '@/components/storage/HybridStorageSetup';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'ADMIN' | 'OSTEOPATH';
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const { status, isLoading: storageLoading } = useHybridStorage();
  const location = useLocation();

  // Afficher un loader pendant la vérification d'authentification et stockage
  if (loading || storageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Rediriger vers login si pas authentifié
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier le rôle si requis
  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Vérifier si c'est un utilisateur démo
  const isDemoUser = user.email === 'demo@patienthub.fr';

  // Pour les utilisateurs connectés réels : vérifier le stockage local
  if (!isDemoUser && status && !status.isConfigured) {
    return <HybridStorageSetup />;
  }

  // Pour les utilisateurs démo ou stockage configuré : afficher le contenu
  return <HybridStorageProvider>{children}</HybridStorageProvider>;
};

export default ProtectedRoute;
