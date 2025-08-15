import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/ui/layout';
import { ArrowLeft, Settings } from 'lucide-react';
import { StorageStatusDisplay } from '@/components/storage/StorageStatusDisplay';

const HybridStorageSettingsPage: React.FC = () => {
  const navigate = useNavigate();

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
              <h1 className="text-2xl font-bold">Stockage Hybride</h1>
            </div>
          </div>

          {/* Affichage du statut en temps réel */}
          <StorageStatusDisplay />

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-medium text-amber-800 mb-2">⚖️ Conformité HDS (Hébergement de Données de Santé)</h3>
            <div className="text-sm text-amber-700 space-y-2">
              <p>
                <strong>Utilisateur connecté:</strong> Les données sensibles (patients, rendez-vous, consultations, factures) 
                sont <strong>obligatoirement</strong> stockées localement pour respecter la réglementation française.
              </p>
              <p>
                <strong>Mode démo:</strong> Les données de test sont stockées temporairement sur Supabase 
                et automatiquement supprimées après 30 minutes.
              </p>
              <p className="font-medium">
                ✅ Cette configuration garantit la conformité légale et la confidentialité de vos données patients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HybridStorageSettingsPage;