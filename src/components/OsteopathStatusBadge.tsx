/**
 * Badge de statut ostéopathe (demo/active/blocked)
 * Visible dans le header pour rappeler le mode actuel
 */

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { osteopathStatusService } from '@/services/admin/osteopath-status-service';
import { OsteopathStatus } from '@/types';
import { cn } from '@/lib/utils';

interface OsteopathStatusBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function OsteopathStatusBadge({ className, showLabel = true }: OsteopathStatusBadgeProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<OsteopathStatus>('demo');
  const [daysInDemo, setDaysInDemo] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?.osteopathId) {
        setLoading(false);
        return;
      }

      try {
        const osteopath = await osteopathStatusService.getOsteopathById(user.osteopathId);
        if (osteopath) {
          setStatus(osteopath.status);
          setDaysInDemo(osteopath.daysInDemo || 0);
        }
      } catch (error) {
        console.error('Erreur chargement statut:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  if (loading || !user?.osteopathId) {
    return null;
  }

  // Configuration par statut
  const statusConfig = {
    demo: {
      icon: Clock,
      label: 'Mode Démo',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      textColor: 'text-yellow-800 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      description: `${daysInDemo} jour${daysInDemo > 1 ? 's' : ''}`,
    },
    active: {
      icon: CheckCircle2,
      label: 'Actif',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      textColor: 'text-green-800 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      description: 'Compte validé',
    },
    blocked: {
      icon: XCircle,
      label: 'Bloqué',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      textColor: 'text-red-800 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      description: 'Compte suspendu',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', config.iconColor)} />
      {showLabel && (
        <>
          <span className="font-medium">{config.label}</span>
          {status === 'demo' && (
            <span className="text-xs opacity-75">({config.description})</span>
          )}
        </>
      )}
    </Badge>
  );
}

/**
 * Alert pour le mode démo (affichage conditionnel)
 * Plus visible que le badge, pour information importante
 */
export function DemoModeAlert() {
  const { user } = useAuth();
  const [status, setStatus] = useState<OsteopathStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?.osteopathId) {
        setLoading(false);
        return;
      }

      try {
        const osteopath = await osteopathStatusService.getOsteopathById(user.osteopathId);
        if (osteopath) {
          setStatus(osteopath.status);
        }
      } catch (error) {
        console.error('Erreur chargement statut:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  if (loading || !user?.osteopathId || status !== 'demo') {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
            Mode Démonstration
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-400/90">
            Vous utilisez l'application en <strong>mode démo</strong>. Les factures PDF générées ne
            sont <strong>pas valables</strong> pour usage réel et portent un filigrane "DEMO".
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
            Pour passer en mode actif et générer des factures officielles, contactez
            l'administrateur.
          </p>
        </div>
      </div>
    </div>
  );
}
