import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { FailFastStorageGuard } from './storage/FailFastStorageGuard';
import { DEMO_OSTEOPATH_ID } from '@/config/demo-constants';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'ADMIN' | 'OSTEOPATH';
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant la vérification d'authentification
  if (loading) {
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
  const isDemoUser = user.email === 'demo@osteopraxis.com' || 
                     user.email?.startsWith('demo-') ||
                     user.osteopathId === DEMO_OSTEOPATH_ID;

  // Pour les utilisateurs réels : utiliser le garde intelligent (non-bloquant)
  if (!isDemoUser) {
    return <FailFastStorageGuard>{children}</FailFastStorageGuard>;
  }

  // Pour les utilisateurs démo : pas de stockage local requis
  return <>{children}</>;
};

export default ProtectedRoute;
