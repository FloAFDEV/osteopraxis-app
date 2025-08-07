import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StorageManager } from '@/components/storage/StorageManager';
import { useHybridStorageContext } from '@/contexts/HybridStorageContext';
import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HybridStorageSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConfigured, isUnlocked } = useHybridStorageContext();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux paramètres
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Settings className="h-6 w-6" />
              <span>Gestionnaire de stockage hybride</span>
            </h1>
            <p className="text-muted-foreground">
              Configuration et gestion du stockage local sécurisé HDS
            </p>
          </div>
        </div>
      </div>

      {/* Statut rapide */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Stockage hybride obligatoire</h3>
              <p className="text-sm text-muted-foreground">
                Données sensibles : Local sécurisé • Données non-sensibles : Cloud
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                État : {isConfigured ? (isUnlocked ? '🟢 Actif' : '🟡 Verrouillé') : '🔴 Non configuré'}
              </div>
              <div className="text-xs text-muted-foreground">
                Conforme HDS
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestionnaire principal */}
      <StorageManager />

      {/* Informations complémentaires */}
      <Card>
        <CardHeader>
          <CardTitle>À propos du stockage hybride</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <h4 className="font-semibold mb-2">Pourquoi un stockage hybride obligatoire ?</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <strong>Conformité HDS :</strong> Les données de santé doivent être stockées selon les exigences françaises</li>
              <li>• <strong>Sécurité maximale :</strong> Chiffrement local AES-256 avec clé personnelle</li>
              <li>• <strong>Contrôle total :</strong> Vos données sensibles restent sur votre ordinateur</li>
              <li>• <strong>Performance optimale :</strong> Accès rapide aux données fréquemment utilisées</li>
              <li>• <strong>Coût réduit :</strong> Pas de frais d'hébergement cloud pour les données sensibles</li>
            </ul>

            <h4 className="font-semibold mb-2 mt-4">Classification automatique des données :</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Stockage local obligatoire :</strong>
                <ul className="mt-1 text-muted-foreground">
                  <li>• Dossiers patients</li>
                  <li>• Rendez-vous médicaux</li>
                  <li>• Consultations et examens</li>
                  <li>• Factures et devis</li>
                  <li>• Documents médicaux</li>
                </ul>
              </div>
              <div>
                <strong>Stockage cloud :</strong>
                <ul className="mt-1 text-muted-foreground">
                  <li>• Profils utilisateurs</li>
                  <li>• Informations ostéopathes</li>
                  <li>• Configuration cabinets</li>
                  <li>• Authentification</li>
                  <li>• Préférences application</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HybridStorageSettingsPage;