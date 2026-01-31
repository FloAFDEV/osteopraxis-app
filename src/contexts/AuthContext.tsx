import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useDemoSession } from '@/hooks/useDemoSession';
import { DemoStorage } from '@/services/demo-storage';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DemoUser {
  id: string;
  email: string;
  role: 'demo';
  osteopathId: string;
  firstName: string;
  lastName: string;
  user_metadata: {
    full_name: string;
  };
}

interface AuthContextType {
  user: DemoUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
  isAuthenticated: boolean; // True si user connecté OU en mode démo
  startDemo: () => void;
  endDemo: () => void;
  remainingDemoTime: number;
  demoCabinetId: string | null;
  demoCabinetName: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const {
    isDemoActive,
    startDemo: startDemoSession,
    endDemo: endDemoSession,
    remainingMs,
    demoUserId,
    demoCabinetId,
    demoCabinetName,
    canStartDemo,
    getRemainingAttempts
  } = useDemoSession();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Mémoiser le user pour éviter les re-renders inutiles
  const demoUser = useMemo(() => {
    if (!isDemoActive || !demoUserId) return null;

    return {
      id: demoUserId,
      email: 'demo@osteopraxis.fr',
      role: 'demo' as const,
      osteopathId: demoUserId,
      firstName: 'Utilisateur',
      lastName: 'Démo',
      user_metadata: {
        full_name: 'Utilisateur Démo'
      }
    };
  }, [isDemoActive, demoUserId]);

  useEffect(() => {
    setUser(demoUser);
    setLoading(false);
  }, [demoUser]);

  const handleSignOut = async () => {
    if (isDemoActive && demoCabinetId) {
      DemoStorage.clearCabinet(demoCabinetId);
      endDemoSession();
      setUser(null);
      navigate('/', { replace: true });
      toast.success('Session démo terminée');
    }
  };

  const handleStartDemo = () => {
    if (!canStartDemo()) {
      toast.error(
        "Vous avez atteint la limite de 5 sessions démo ce mois-ci.",
        {
          description: "Les compteurs se réinitialisent tous les 30 jours. Créez un compte pour un accès illimité.",
          duration: 6000
        }
      );
      return;
    }

    const success = startDemoSession();

    if (success) {
      const remaining = getRemainingAttempts();
      if (remaining <= 2 && remaining > 0) {
        toast.info(`Session démo démarrée`, {
          description: `Il vous reste ${remaining} essai(s) gratuit(s) ce mois-ci.`,
          duration: 4000
        });
      }
      navigate('/dashboard', { replace: true });
    } else {
      toast.error('Impossible de démarrer la démo. Veuillez réessayer.');
    }
  };

  // isAuthenticated est true si l'utilisateur est connecté OU en mode démo actif
  const isAuthenticated = isDemoActive || !!user;

  const value: AuthContextType = {
    user,
    loading,
    signOut: handleSignOut,
    isDemoMode: isDemoActive,
    isAuthenticated,
    startDemo: handleStartDemo,
    endDemo: endDemoSession,
    remainingDemoTime: remainingMs,
    demoCabinetId,
    demoCabinetName
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
