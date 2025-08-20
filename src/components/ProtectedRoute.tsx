
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

  // Vérifier si c'est un utilisateur démo (même logique que AuthContext)
  const isDemoUser = user.email === 'demo@patienthub.com' || 
                     user.email?.startsWith('demo-') ||
                     user.id === '999' || // ID factice pour démo
                     user.osteopathId === 999; // osteopathId factice pour démo

  console.log('🔍 ProtectedRoute - User:', { email: user.email, id: user.id, osteopathId: user.osteopathId, isDemoUser });
  console.log('🔍 ProtectedRoute - Storage status:', status);

  // Pour les utilisateurs démo : pas de stockage local requis
  if (isDemoUser) {
    console.log('🎭 Utilisateur démo - Bypass stockage local');
    return <>{children}</>;
  }

  // Pour les utilisateurs connectés réels : vérifier le stockage local
  if (!status || !status.isConfigured) {
    console.log('🔧 Stockage local non configuré - Affichage setup');
    return <HybridStorageSetup />;
  }

  // Pour le stockage configuré : utiliser le provider hybride
  console.log('✅ Stockage configuré - Utilisation provider hybride');
  return <HybridStorageProvider>{children}</HybridStorageProvider>;
};

export default ProtectedRoute;
