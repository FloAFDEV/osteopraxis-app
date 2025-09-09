
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, useState, useEffect } from 'react';
import { HybridStorageProvider } from '@/contexts/HybridStorageContext';
import { useHybridStorage } from '@/hooks/useHybridStorage';
import { HybridStorageSetup } from '@/components/storage/HybridStorageSetup';
import { isDemoSession } from '@/utils/demo-detection';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'ADMIN' | 'OSTEOPATH';
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const { status, isLoading: storageLoading } = useHybridStorage();
  const location = useLocation();
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null);
  const [demoLoading, setDemoLoading] = useState(true);

  // Vérifier le mode démo au montage
  useEffect(() => {
    const checkDemo = async () => {
      try {
        const demoMode = await isDemoSession();
        setIsDemoMode(demoMode);
      } catch (error) {
        console.error('Erreur vérification mode démo:', error);
        setIsDemoMode(false);
      } finally {
        setDemoLoading(false);
      }
    };
    checkDemo();
  }, []);

  console.log('🔍 ProtectedRoute - User:', user);
  console.log('🔍 ProtectedRoute - Storage status:', status);
  console.log('🔍 ProtectedRoute - Storage loading:', storageLoading);
  console.log('🔍 ProtectedRoute - Demo mode:', isDemoMode);
  console.log('🔍 ProtectedRoute - Demo loading:', demoLoading);

  // Afficher un loader pendant la vérification d'authentification et stockage
  if (loading || storageLoading || demoLoading) {
    console.log('⏳ ProtectedRoute - Loading...');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // En mode démo, pas besoin d'authentification Supabase
  if (isDemoMode) {
    console.log('🎭 ProtectedRoute - Mode démo actif - Bypass authentification');
    return <>{children}</>;
  }

  // Rediriger vers login si pas authentifié (uniquement en mode non-démo)
  if (!isAuthenticated || !user) {
    console.log('🚪 ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier le rôle si requis
  if (requireRole && user.role !== requireRole) {
    console.log('🚫 ProtectedRoute - Wrong role, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Vérifier si c'est un utilisateur démo (logique centralisée)
  const isDemoUser = user.email === 'demo@patienthub.com' || 
                     user.email?.startsWith('demo-') ||
                     user.id === '999' || // ID factice pour démo
                     user.osteopathId === 999; // osteopathId factice pour démo

  console.log('🔍 ProtectedRoute - isDemoUser:', isDemoUser);

  // Pour les utilisateurs réels : utiliser le provider hybride
  if (!isDemoUser) {
    console.log('🔧 Utilisateur réel - Utilisation provider hybride');
    return <HybridStorageProvider>{children}</HybridStorageProvider>;
  }

  // Pour les utilisateurs démo : pas de stockage local requis
  console.log('🎭 Utilisateur démo - Bypass stockage local');
  return <>{children}</>;
};

export default ProtectedRoute;
