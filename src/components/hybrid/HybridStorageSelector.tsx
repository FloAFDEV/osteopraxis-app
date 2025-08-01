import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cloud, 
  HardDrive, 
  Shield, 
  Zap, 
  Globe, 
  Lock,
  Info,
  CheckCircle
} from 'lucide-react';

interface StorageMode {
  id: 'cloud' | 'local' | 'hybrid';
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  benefits: string[];
  limitations: string[];
  recommended: boolean;
}

interface StorageConfiguration {
  mode: 'cloud' | 'local' | 'hybrid';
  autoMigration: boolean;
  localEncryption: boolean;
  cloudSync: boolean;
}

export const HybridStorageSelector: React.FC = () => {
  const [currentConfig, setCurrentConfig] = useState<StorageConfiguration>({
    mode: 'hybrid',
    autoMigration: true,
    localEncryption: true,
    cloudSync: true
  });

  const [isConfiguring, setIsConfiguring] = useState(false);

  const storageModes: StorageMode[] = [
    {
      id: 'cloud',
      name: 'Stockage Cloud Intégral',
      description: 'Toutes les données stockées sur Supabase',
      icon: Cloud,
      features: [
        'Accès depuis plusieurs appareils',
        'Sauvegardes automatiques',
        'Synchronisation en temps réel',
        'Pas de limite de stockage local'
      ],
      benefits: [
        'Simple à gérer',
        'Accessible partout',
        'Toujours sauvegardé'
      ],
      limitations: [
        'Dépendant de la connexion internet',
        'Moins conforme RGPD pour données sensibles',
        'Latence réseau'
      ],
      recommended: false
    },
    {
      id: 'local',
      name: 'Stockage Local Intégral',
      description: 'Toutes les données stockées localement',
      icon: HardDrive,
      features: [
        'Performance maximale',
        'Confidentialité totale',
        'Fonctionne hors-ligne',
        'Contrôle complet des données'
      ],
      benefits: [
        'Conformité RGPD optimale',
        'Très rapide',
        'Aucune dépendance réseau'
      ],
      limitations: [
        'Limité à un seul appareil',
        'Sauvegardes manuelles',
        'Pas de synchronisation multi-appareils'
      ],
      recommended: false
    },
    {
      id: 'hybrid',
      name: 'Architecture Hybride (Recommandé)',
      description: 'Données sensibles locales + Configuration cloud',
      icon: Shield,
      features: [
        'Données sensibles stockées localement',
        'Configuration et auth dans le cloud',
        'Performance locale optimisée',
        'Accès multi-appareils pour la configuration'
      ],
      benefits: [
        'Conformité RGPD maximale',
        'Performance optimale',
        'Flexibilité d\'accès',
        'Sécurité renforcée'
      ],
      limitations: [
        'Configuration plus complexe',
        'Migration initiale requise'
      ],
      recommended: true
    }
  ];

  const handleModeChange = async (mode: 'cloud' | 'local' | 'hybrid') => {
    setIsConfiguring(true);
    
    // Simuler la configuration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentConfig(prev => ({ ...prev, mode }));
    setIsConfiguring(false);
  };

  const handleConfigurationChange = (key: keyof StorageConfiguration, value: boolean) => {
    setCurrentConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Sélection du mode de stockage */}
      <div className="grid gap-6">
        {storageModes.map((mode) => {
          const IconComponent = mode.icon;
          const isSelected = currentConfig.mode === mode.id;
          
          return (
            <Card 
              key={mode.id} 
              className={`relative cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleModeChange(mode.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`h-6 w-6 ${
                      mode.id === 'cloud' ? 'text-blue-500' :
                      mode.id === 'local' ? 'text-green-500' :
                      'text-purple-500'
                    }`} />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {mode.name}
                        {mode.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommandé
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{mode.description}</CardDescription>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Fonctionnalités */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Fonctionnalités</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Avantages et limitations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-green-600">Avantages</h4>
                    <ul className="text-sm space-y-1">
                      {mode.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-amber-600">Limitations</h4>
                    <ul className="text-sm space-y-1">
                      {mode.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center gap-2 text-amber-600">
                          <Info className="h-3 w-3" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration avancée pour le mode hybride */}
      {currentConfig.mode === 'hybrid' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configuration Hybride Avancée
            </CardTitle>
            <CardDescription>
              Personnalisez le comportement de l'architecture hybride
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              {/* Migration automatique */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-migration">Migration automatique</Label>
                  <div className="text-sm text-muted-foreground">
                    Migrer automatiquement les nouvelles données vers le stockage local
                  </div>
                </div>
                <Switch
                  id="auto-migration"
                  checked={currentConfig.autoMigration}
                  onCheckedChange={(value) => handleConfigurationChange('autoMigration', value)}
                />
              </div>

              {/* Chiffrement local */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="local-encryption">Chiffrement local</Label>
                  <div className="text-sm text-muted-foreground">
                    Chiffrer les données stockées localement (recommandé)
                  </div>
                </div>
                <Switch
                  id="local-encryption"
                  checked={currentConfig.localEncryption}
                  onCheckedChange={(value) => handleConfigurationChange('localEncryption', value)}
                />
              </div>

              {/* Synchronisation cloud */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cloud-sync">Synchronisation cloud</Label>
                  <div className="text-sm text-muted-foreground">
                    Synchroniser la configuration et les métadonnées avec le cloud
                  </div>
                </div>
                <Switch
                  id="cloud-sync"
                  checked={currentConfig.cloudSync}
                  onCheckedChange={(value) => handleConfigurationChange('cloudSync', value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations sur la classification des données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Classification des Données
          </CardTitle>
          <CardDescription>
            Répartition des données selon leur sensibilité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Données Cloud */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Stockage Cloud</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Authentification utilisateur</li>
                <li>• Profils des ostéopathes</li>
                <li>• Configuration des cabinets</li>
                <li>• Préférences d'application</li>
              </ul>
            </div>

            {/* Données Locales */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-green-500" />
                <h4 className="font-medium">Stockage Local</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Données personnelles des patients</li>
                <li>• Informations médicales</li>
                <li>• Historique des consultations</li>
                <li>• Factures et paiements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerte de configuration */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Configuration actuelle :</strong> Mode {currentConfig.mode} activé. 
          {currentConfig.mode === 'hybrid' && ' Les données sensibles sont stockées localement pour une conformité RGPD optimale.'}
          {currentConfig.mode === 'cloud' && ' Toutes les données sont stockées dans le cloud.'}
          {currentConfig.mode === 'local' && ' Toutes les données sont stockées localement.'}
        </AlertDescription>
      </Alert>
    </div>
  );
};