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
        </div>
      </div>
    </Layout>
  );
};

export default HybridStorageSettingsPage;