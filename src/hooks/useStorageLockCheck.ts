/**
 * 🔒 Hook de vérification du verrouillage du storage
 * 
 * Détecte si l'utilisateur est authentifié mais que le mot de passe a été perdu
 * (par exemple après un refresh de page).
 * 
 * Comportement:
 * - Si authentifié mais pas de password en RAM → Force un logout complet
 * - Redirige vers /login avec un message explicatif
 */

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { passwordMemory } from '@/services/storage/password-memory-manager';
import { toast } from 'sonner';

export function useStorageLockCheck() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ne rien faire si pas sur une route protégée
    const publicRoutes = ['/login', '/register', '/', '/pricing', '/contact', '/demo', '/privacy', '/terms'];
    if (publicRoutes.includes(location.pathname)) {
      return;
    }

    // Vérifier si l'utilisateur est authentifié mais sans password en mémoire
    if (isAuthenticated && user && !passwordMemory.hasPassword()) {
      // Détection: utilisateur authentifié mais password perdu (après refresh)
      console.log('⚠️ Détection: Session Supabase valide mais password perdu en RAM');
      
      // Afficher message explicatif
      toast.info('Session expirée', {
        description: 'Veuillez vous reconnecter pour accéder à vos données chiffrées.',
        duration: 5000,
      });

      // Forcer logout complet
      logout().then(() => {
        navigate('/login', { replace: true });
      });
    }
  }, [isAuthenticated, user, location.pathname, logout, navigate]);
}
