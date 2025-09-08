import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/ui/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings, Download, Upload } from 'lucide-react';
import { StorageStatusDisplay } from '@/components/storage/StorageStatusDisplay';
import { StorageTestPanel } from '@/components/testing/StorageTestPanel';
import { HDSComplianceIndicator } from '@/components/hds/HDSComplianceIndicator';
import { hybridDataManager } from '@/services/hybrid-data-adapter/hybrid-manager';
import { toast } from 'sonner';

const HybridStorageSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const exportData = async () => {
    setLoading(true);
    try {
      const backupData = await hybridDataManager.exportData();
      
      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patienthub-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Données exportées avec succès');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export des données');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Stockage Hybride HDS</h1>
            </div>
          </div>

          {/* Indicateur de conformité HDS */}
          <HDSComplianceIndicator />

          {/* Affichage du statut en temps réel */}
        <StorageStatusDisplay />
        <StorageTestPanel />

          {/* Actions de gestion */}
          <Card>
            <CardHeader>
              <CardTitle>Gestion des données</CardTitle>
              <CardDescription>
                Exportez et importez vos données locales en toute sécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={exportData}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter les données
                </Button>
                
                <Button 
                  variant="outline"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Importer une sauvegarde
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default HybridStorageSettingsPage;