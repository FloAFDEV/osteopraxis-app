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
  Info,
  User
} from "lucide-react";
import { useHybridStorage } from "@/hooks/useHybridStorage";
import { useAuth } from "@/contexts/AuthContext";

export const StorageStatusDisplay: React.FC = () => {
  const { status, isLoading } = useHybridStorage();
  const { user } = useAuth();
  
  // Détecter le mode démo
  const isDemoMode = user?.email?.includes('demo') || user?.id?.toString().includes('demo');

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
      {/* Message d'information pour le mode démo */}
      {isDemoMode && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/20 dark:border-amber-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <User className="h-5 w-5" />
              Mode démonstration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ Vous êtes en mode démonstration. Aucune donnée ne sera enregistrée en stockage local.
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Les données saisies seront automatiquement supprimées dans quelques minutes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message spécifique à l'environnement Lovable */}
      {!isDemoMode && window.self !== window.top && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Info className="h-5 w-5" />
              Environnement de développement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 Dans cet environnement, le stockage OPFS est utilisé automatiquement pour assurer la conformité HDS.
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                En production, le stockage natif File System Access sera disponible pour une sécurité maximale.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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