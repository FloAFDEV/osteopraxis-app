import { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HybridMigrationInterface } from '@/components/hybrid/HybridMigrationInterface';
import { HybridStorageSelector } from '@/components/hybrid/HybridStorageSelector';
import { 
  ArrowLeft, 
  Database, 
  Shield, 
  Settings,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const HybridMigrationPage = () => {
  const navigate = useNavigate();
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Vérifier le support du navigateur pour OPFS
    checkBrowserSupport();
  }, []);

  const checkBrowserSupport = () => {
    const hasOPFS = 'storage' in navigator && 'getDirectory' in navigator.storage;
    const hasWebAssembly = typeof WebAssembly !== 'undefined';
    
    if (!hasOPFS || !hasWebAssembly) {
      setIsSupported(false);
      toast.error('Votre navigateur ne supporte pas toutes les fonctionnalités requises');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux paramètres
            </Button>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold">Migration Hybride</h1>
                <p className="text-muted-foreground">
                  Configuration et migration vers l'architecture hybride
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                Phase 2
              </Badge>
            </div>
          </div>

          {/* Alerte de support navigateur */}
          {!isSupported && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Navigateur non compatible :</strong> Votre navigateur ne supporte pas 
                l'Origin Private File System (OPFS) ou WebAssembly, requis pour le stockage local sécurisé.
                Veuillez utiliser une version récente de Chrome, Firefox, ou Safari.
              </AlertDescription>
            </Alert>
          )}

          {/* Introduction */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Shield className="h-5 w-5" />
                Architecture Hybride : Cloud + Local
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Migrez vers une architecture qui respecte la confidentialité des données tout en maintenant la flexibilité du cloud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Shield className="h-4 w-4" />
                  <span>Conformité RGPD</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Database className="h-4 w-4" />
                  <span>Performance locale</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Settings className="h-4 w-4" />
                  <span>Flexibilité maximale</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onglets de configuration */}
          <Tabs defaultValue="migration" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-2 max-w-md">
              <TabsTrigger value="migration" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Migration
              </TabsTrigger>
              <TabsTrigger value="configuration" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration
              </TabsTrigger>
            </TabsList>

            {/* Onglet Migration */}
            <TabsContent value="migration" className="space-y-6">
              <HybridMigrationInterface />
            </TabsContent>

            {/* Onglet Configuration */}
            <TabsContent value="configuration" className="space-y-6">
              <HybridStorageSelector />
            </TabsContent>
          </Tabs>

          {/* Informations techniques */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informations Techniques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Technologies utilisées</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• SQLite WASM pour le stockage local</li>
                    <li>• Origin Private File System (OPFS)</li>
                    <li>• Chiffrement AES-256</li>
                    <li>• Supabase pour le cloud</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sécurité et conformité</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Données sensibles stockées localement</li>
                    <li>• Conformité RGPD par conception</li>
                    <li>• Chiffrement bout en bout</li>
                    <li>• Contrôle total des données</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer d'information */}
          <Alert className="mt-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Cette migration est réversible. Vous pouvez revenir au mode cloud intégral à tout moment 
              depuis la configuration. Vos données restent toujours accessibles.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </Layout>
  );
};

export default HybridMigrationPage;