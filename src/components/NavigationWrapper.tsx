
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export const NavigationWrapper = ({ children }: NavigationWrapperProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Ne pas faire de redirection pendant le chargement
    if (loading) return;

    const currentPath = location.pathname;
    
    // Pages publiques qui ne nécessitent pas d'authentification
    const publicPaths = ['/login', '/register'];
    const isPublicPath = publicPaths.includes(currentPath);

    // Si l'utilisateur est authentifié
    if (isAuthenticated && user) {
      // Rediriger les admins depuis les pages de connexion vers le dashboard admin
      if (user.role === "ADMIN" && isPublicPath) {
        navigate("/admin/dashboard", { replace: true });
      }
      // Rediriger les utilisateurs normaux depuis les pages de connexion vers le dashboard
      else if (user.role !== "ADMIN" && isPublicPath) {
        navigate("/", { replace: true });
      }
    }
    // Si l'utilisateur n'est pas authentifié et n'est pas sur une page publique
    else if (!isAuthenticated && !isPublicPath) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate, location.pathname]);

  // Afficher un loader pendant la vérification d'authentification
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
