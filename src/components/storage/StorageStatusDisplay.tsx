import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Shield, 
  HardDrive, 
  Cloud, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Info
} from "lucide-react";
import { useHybridStorage } from "@/hooks/useHybridStorage";

export const StorageStatusDisplay: React.FC = () => {
  const { status, isLoading } = useHybridStorage();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* État général du stockage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            État du stockage hybride
          </CardTitle>
          <CardDescription>
            Statut de votre stockage local sécurisé conforme HDS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Stockage local</span>
                <Badge variant={status?.localAvailable ? "default" : "destructive"}>
                  {status?.localAvailable ? "Actif" : "Inactif"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {status?.localAvailable 
                  ? "✅ Données sensibles stockées localement (conforme HDS)"
                  : "❌ Stockage local indisponible - Conformité HDS compromise"
                }
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Stockage cloud</span>
                <Badge variant={status?.cloudAvailable ? "default" : "secondary"}>
                  {status?.cloudAvailable ? "Disponible" : "Indisponible"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {status?.cloudAvailable 
                  ? "☁️ Données non-sensibles synchronisées"
                  : "⚠️ Mode hors-ligne uniquement"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification des données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Classification des données
          </CardTitle>
          <CardDescription>
            Répartition automatique selon la sensibilité HDS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Stockage Local (HDS)</span>
              </div>
              <div className="space-y-1">
                {status?.dataClassification?.local?.map((entityType) => (
                  <div key={entityType} className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-green-500" />
                    <span className="text-xs">{entityType}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Stockage Cloud</span>
              </div>
              <div className="space-y-1">
                {status?.dataClassification?.cloud?.map((entityType) => (
                  <div key={entityType} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                    <span className="text-xs">{entityType}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations techniques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Informations techniques
          </CardTitle>
          <CardDescription>
            Détails sur votre stockage local
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Format de stockage</span>
                <Badge variant="outline">SQLite + OPFS</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Base de données SQLite stockée dans le système de fichiers privé du navigateur
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Localisation</span>
                <Badge variant="outline">Origin Private File System</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Fichier: <code>patienthub.sqlite</code> (accessible uniquement à cette application)
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Sécurité</span>
                <Badge variant="outline">Chiffrement navigateur</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Protection automatique par le navigateur, isolation par domaine
              </p>
            </div>

            {status?.lastBackup && (
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>Dernière sauvegarde</span>
                  <span className="text-xs">
                    {new Date(status.lastBackup).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alertes de conformité */}
      {!status?.localAvailable && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Alerte de conformité HDS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-destructive">
                ⚠️ Le stockage local est requis pour la conformité à la réglementation française sur les données de santé (HDS).
              </p>
              <p className="text-xs text-muted-foreground">
                Solutions possibles:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• Utilisez un navigateur récent (Chrome 102+, Edge 102+)</li>
                <li>• Vérifiez que votre site est en HTTPS</li>
                <li>• Contactez le support technique si le problème persiste</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};