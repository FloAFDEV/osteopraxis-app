/**
 * Écran d'erreur pour les échecs du stockage HDS sécurisé
 * Implémente la stratégie "Fail Fast" pour forcer la sécurité
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, FileX, Users, RefreshCw } from 'lucide-react';

interface HDSStorageFailureScreenProps {
  error: string;
  onRetry?: () => void;
  onUseDemo?: () => void;
}

export const HDSStorageFailureScreen: React.FC<HDSStorageFailureScreenProps> = ({ 
  error, 
  onRetry, 
  onUseDemo 
}) => {
  const navigate = useNavigate();

  const handleUseDemo = () => {
    if (onUseDemo) {
      onUseDemo();
    } else {
      // Redirection vers démo avec paramètre
      navigate('/?demo=forced');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Stockage HDS Sécurisé Requis</CardTitle>
          <CardDescription>
            Le stockage local sécurisé est obligatoire pour les données de santé (HDS)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Détails de l'erreur */}
          <Alert className="border-destructive bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <strong>Erreur technique:</strong> {error}
            </AlertDescription>
          </Alert>

          {/* Explication */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileX className="h-5 w-5" />
              Pourquoi ce blocage ?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground ml-6">
              <li>• <strong>Conformité HDS:</strong> Les données de santé doivent être stockées localement et chiffrées</li>
              <li>• <strong>Sécurité maximale:</strong> Aucune donnée sensible ne peut transiter par des serveurs tiers</li>
              <li>• <strong>Réglementation:</strong> Respect du RGPD et des exigences de l'hébergement de données de santé</li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Solutions disponibles:</h3>
            
            <div className="grid gap-3">
              {/* Retry */}
              {onRetry && (
                <Button onClick={onRetry} variant="default" className="w-full flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Réessayer le stockage sécurisé
                </Button>
              )}
              
              {/* Mode démo */}
              <Button onClick={handleUseDemo} variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Utiliser le mode démo (sans données réelles)
              </Button>
            </div>
          </div>

          {/* Avertissement mode démo */}
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>Mode démo:</strong> Aucune donnée réelle ne sera sauvegardée. 
              Idéal pour tester l'application sans traiter de vraies données de patients.
            </AlertDescription>
          </Alert>

          {/* Informations techniques */}
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer font-medium mb-2">
              Informations techniques
            </summary>
            <div className="space-y-1 ml-4">
              <p>• Stockage requis: File System Access API + OPFS</p>
              <p>• Chiffrement: AES-256-GCM obligatoire</p>
              <p>• Support: Navigateurs modernes uniquement (Chrome, Edge, Firefox récents)</p>
              <p>• Contexte: HTTPS ou localhost requis</p>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};