import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/ui/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings, Download, Upload, Shield, Lock, AlertTriangle } from 'lucide-react';
import { StorageStatusDisplay } from '@/components/storage/StorageStatusDisplay';
import { HDSComplianceIndicator } from '@/components/hds/HDSComplianceIndicator';
import { SecureStorageSetup } from '@/components/storage/SecureStorageSetup';
import { SecurityConfirmationDialog } from '@/components/security/SecurityConfirmationDialog';
import { useHybridStorage } from '@/hooks/useHybridStorage';
import { hybridDataManager } from '@/services/hybrid-data-adapter/hybrid-manager';
import { toast } from 'sonner';
import { useDemo } from '@/contexts/DemoContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const HybridStorageSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDemo();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const { status, isLoading, initialize } = useHybridStorage();


  const handleExportRequest = () => {
    setShowExportConfirm(true);
  };

  const confirmExport = async () => {
    setLoading(true);
    try {
      // Utiliser l'export consolidé sécurisé via hdsSecureManager
      const { hdsSecureManager } = await import('@/services/hds-secure-storage/hds-secure-manager');
      
      toast.info('Export en cours, veuillez patienter...');
      
      await hdsSecureManager.exportAllSecure();
      
      toast.success('Données exportées avec succès !', {
        description: 'Sauvegarde complète chiffrée créée. Conservez ce fichier et votre mot de passe en lieu sûr.'
      });
    } catch (error) {
      console.error('Erreur export:', error);
      
      if (error instanceof Error && error.message.includes('verrouillé')) {
        toast.error('Stockage verrouillé - déverrouillez-le d\'abord');
      } else {
        toast.error('Erreur lors de l\'export des données');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImportRequest = () => {
    // Créer un input file pour sélectionner le fichier
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.phds';
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Vérifier le format du fichier
        if (!data.format || !data.format.includes('PatientHub')) {
          toast.error('Format de fichier invalide - doit être une sauvegarde PatientHub');
          return;
        }
        
        // Stocker le fichier et afficher la confirmation
        setPendingImportFile(file);
        setShowImportConfirm(true);
        
      } catch (error) {
        console.error('Erreur lecture fichier:', error);
        toast.error('Fichier corrompu ou format invalide');
      }
    };
    
    input.click();
  };

  const confirmImport = async () => {
    if (!pendingImportFile) return;
    
    setImporting(true);
    try {
      // Demander le mot de passe via un prompt
      const password = window.prompt('Entrez le mot de passe de déchiffrement de la sauvegarde:');
      
      if (!password) {
        toast.info('Import annulé');
        setImporting(false);
        setPendingImportFile(null);
        return;
      }
      
      // Import sécurisé via hdsSecureManager
      const { hdsSecureManager } = await import('@/services/hds-secure-storage/hds-secure-manager');
      
      toast.info('Import en cours, veuillez patienter...');
      
      const result = await hdsSecureManager.importAllSecure(pendingImportFile, password, 'merge');
      
      // Afficher le résultat
      const totalImported = Object.values(result.imported).reduce((sum, count) => sum + count, 0);
      
      if (result.errors.length > 0) {
        console.error("Erreurs d'import:", result.errors);
        toast.error(`Import partiel: ${totalImported} enregistrements importés avec ${result.errors.length} erreurs. Consultez la console pour les détails.`);
      } else if (totalImported > 0) {
        toast.success(`Import réussi: ${totalImported} enregistrements importés !`);
        
        // Afficher les détails par entité
        const details = Object.entries(result.imported)
          .map(([entity, count]) => `${entity}: ${count}`)
          .join(', ');
        
        if (details) {
          toast.info(`Détails: ${details}`);
        }
      } else {
        toast.warning('Aucun enregistrement importé');
      }
      
      if (result.warnings.length > 0) {
        console.warn("Avertissements d'import:", result.warnings);
      }
      
      // Rafraîchir le statut
      await initialize();
      
    } catch (error) {
      console.error('Erreur import:', error);
      if (error instanceof Error && (error.message.includes('password') || error.message.includes('decrypt'))) {
        toast.error('Mot de passe incorrect pour déchiffrer les données');
      } else if (error instanceof Error && error.message.includes('JSON')) {
        toast.error('Fichier corrompu ou format invalide');
      } else {
        toast.error("Erreur lors de l'import des données");
      }
    } finally {
      setImporting(false);
      setPendingImportFile(null);
    }
  };

  // Bloquer l'accès en mode démo
  if (isDemoMode) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl py-8">
          <Button
            variant="outline"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Accès restreint en mode démo</strong>
              <p className="mt-2">Les paramètres de stockage HDS ne sont pas disponibles en mode démonstration pour des raisons de sécurité.</p>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="container mx-auto max-w-4xl py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Stockage Local Sécurisé
              </h1>
              <p className="text-sm text-muted-foreground">
                Gérez vos données sensibles stockées localement sur votre appareil
              </p>
            </div>
          </div>

          {/* Message d'information si pas configuré */}
          {!isLoading && status && !status.isConfigured && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription>
                <strong>Stockage local non configuré</strong>
                <p className="mt-2">Pour utiliser cette fonctionnalité, configurez d'abord votre stockage local sécurisé.</p>
                <Button 
                  size="sm"
                  onClick={() => navigate('/configuration')}
                  className="mt-3"
                >
                  Aller à la configuration
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Indicateur de conformité HDS */}
          <HDSComplianceIndicator />

          {/* Affichage du statut en temps réel */}
          <StorageStatusDisplay />

          {/* Actions de gestion */}
          <Card>
            <CardHeader>
              <CardTitle>Sauvegarde et restauration</CardTitle>
              <CardDescription>
                Exportez vos données dans un fichier chiffré (.phds) pour les transférer sur un autre appareil ou créer une sauvegarde de sécurité. 
                Vous pourrez les réimporter en utilisant le même mot de passe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={handleExportRequest}
                  disabled={loading || !status?.isConfigured}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter les données
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleImportRequest}
                  disabled={loading || importing || !status?.isConfigured}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {importing ? "Import en cours..." : "Importer une sauvegarde"}
                </Button>
              </div>
              
              {!status?.isConfigured && (
                <p className="text-sm text-muted-foreground">
                  Configurez d'abord le stockage HDS pour accéder aux fonctionnalités de sauvegarde.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogues de confirmation sécurisée */}
      <SecurityConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        onConfirm={confirmExport}
        title="Confirmer l'export des données"
        description="Vous êtes sur le point d'exporter toutes vos données HDS sensibles dans un fichier chiffré. Cette opération créera une sauvegarde complète contenant tous les patients, rendez-vous et factures."
        confirmButtonText="Exporter les données"
        variant="default"
      />

      <SecurityConfirmationDialog
        open={showImportConfirm}
        onOpenChange={(open) => {
          setShowImportConfirm(open);
          if (!open) setPendingImportFile(null);
        }}
        onConfirm={confirmImport}
        title="Confirmer l'import des données"
        description="Vous êtes sur le point d'importer des données depuis une sauvegarde externe. Cette opération va fusionner les données importées avec vos données existantes. Assurez-vous que le fichier provient d'une source fiable."
        confirmButtonText="Importer les données"
        variant="destructive"
      />
    </Layout>
  );
};

export default HybridStorageSettingsPage;