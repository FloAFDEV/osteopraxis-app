import React, { createContext, useContext, useEffect, useState } from 'react';
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

  const createDemoUser = (userId: string): DemoUser => {
    return {
      id: userId,
      email: 'demo@osteopraxis.fr',
      role: 'demo',
      osteopathId: userId,
      firstName: 'Utilisateur',
      lastName: 'Démo',
      user_metadata: {
        full_name: 'Utilisateur Démo'
      }
    };
  };

  useEffect(() => {
    if (isDemoActive && demoUserId) {
      setUser(createDemoUser(demoUserId));
      setLoading(false);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [isDemoActive, demoUserId]);

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
      const remaining = getRemainingAttempts();
      toast.error(
        `Limite de 5 démos par mois atteinte. ${remaining} essai(s) restant(s). Réessayez dans 30 jours.`,
        {
          duration: 5000
        }
      );
      return;
    }

    const success = startDemoSession();

    if (success) {
      navigate('/dashboard', { replace: true });
    } else {
      toast.error('Impossible de démarrer la démo. Veuillez réessayer.');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signOut: handleSignOut,
    isDemoMode: isDemoActive,
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
