import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function useAuthGuard() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Attendre que l'authentification soit vérifiée
    if (!loading) {
      if (!isAuthenticated || !user) {
        console.log('useAuthGuard: User not authenticated, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
      
      setIsReady(true);
    }
  }, [user, isAuthenticated, loading, navigate]);

  return {
    isReady: isReady && !loading && isAuthenticated && user,
    user,
    isAuthenticated,
    loading
  };
}