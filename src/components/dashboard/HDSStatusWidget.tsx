/**
 * 🔐 Widget de statut HDS pour le Dashboard
 * Affiche l'état du stockage sécurisé et les actions rapides
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Settings, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHybridStorage } from '@/hooks/useHybridStorage';
import { useStorageMode } from '@/hooks/useStorageMode';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const HDSStatusWidget: React.FC = () => {
  const navigate = useNavigate();
  const { status, isLoading } = useHybridStorage();
  const { isDemoMode } = useStorageMode();

  // 🎭 En mode démo, ce widget n'est pas nécessaire
  if (isDemoMode) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Stockage HDS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusInfo = () => {
    if (!status?.isConfigured) {
      return {
        icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
        title: 'Non configuré',
        description: 'Configurez le stockage sécurisé pour vos données HDS',
        badgeVariant: 'secondary' as const,
        badgeText: 'Action requise',
        actionText: 'Configurer',
        actionVariant: 'default' as const
      };
    }

    if (!status.isUnlocked) {
      return {
        icon: <Lock className="w-5 h-5 text-amber-500" />,
        title: 'Verrouillé',
        description: 'Déverrouillez pour accéder aux données sensibles',
        badgeVariant: 'secondary' as const,
        badgeText: 'Verrouillé',
        actionText: 'Déverrouiller',
        actionVariant: 'outline' as const
      };
    }

    return {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      title: 'Actif',
      description: 'Vos données HDS sont sécurisées localement',
      badgeVariant: 'default' as const,
      badgeText: 'Opérationnel',
      actionText: 'Gérer',
      actionVariant: 'outline' as const
    };
  };

  const statusInfo = getStatusInfo();

  // Récupérer la date du dernier export depuis localStorage
  const lastExportDate = localStorage.getItem('hds-last-export-date');
  const lastExportFormatted = lastExportDate 
    ? formatDistanceToNow(new Date(lastExportDate), { addSuffix: true, locale: fr })
    : null;

  // Calculer les stats
  const totalRecords = status?.isConfigured 
    ? Object.values(status.entitiesCount || {}).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Stockage HDS Sécurisé
          </div>
          <Badge variant={statusInfo.badgeVariant}>
            {statusInfo.badgeText}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut principal */}
        <div className="flex items-start gap-3">
          {statusInfo.icon}
          <div className="flex-1 min-w-0">
            <p className="font-medium">{statusInfo.title}</p>
            <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
          </div>
        </div>

        {/* Statistiques si configuré et déverrouillé */}
        {status?.isConfigured && status.isUnlocked && (
          <div className="space-y-3 pt-3 border-t">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {status.entitiesCount?.patients || 0}
                </p>
                <p className="text-xs text-muted-foreground">Patients</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {status.entitiesCount?.appointments || 0}
                </p>
                <p className="text-xs text-muted-foreground">RDV</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {status.entitiesCount?.invoices || 0}
                </p>
                <p className="text-xs text-muted-foreground">Factures</p>
              </div>
            </div>

            {/* Dernière sauvegarde */}
            {lastExportFormatted && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                <Calendar className="w-4 h-4" />
                <span>Dernière sauvegarde : {lastExportFormatted}</span>
              </div>
            )}
          </div>
        )}

        {/* Action */}
        <Button 
          onClick={() => navigate('/settings/storage')}
          variant={statusInfo.actionVariant}
          className="w-full"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          {statusInfo.actionText}
        </Button>
      </CardContent>
    </Card>
  );
};
