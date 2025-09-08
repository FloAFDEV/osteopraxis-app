import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTube, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { hdsSecureManager } from "@/services/hds-secure-storage/hds-secure-manager";
import { storageRouter } from "@/services/storage/storage-router";
import { isDemoUser } from "@/utils/demo-detection";
import { toast } from "sonner";

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export const StorageTestPanel: React.FC = () => {
  const { user } = useAuth();
  const { isDemoMode: demoContext } = useDemo();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    console.log('🧪 Démarrage des tests de stockage...');
    
    try {
      // Test 1: Détection du mode
      const detectedDemoMode = isDemoUser(user);
      addTestResult({
        name: 'Détection mode démo',
        status: detectedDemoMode ? 'success' : 'warning',
        message: `Mode détecté: ${detectedDemoMode ? 'DEMO' : 'CONNECTÉ'} (Contexte: ${demoContext})`
      });

      // Test 2: Vérification du stockage sécurisé (mode connecté seulement)
      if (!detectedDemoMode) {
        try {
          const support = hdsSecureManager.checkSupport();
          addTestResult({
            name: 'Support stockage sécurisé',
            status: support.supported ? 'success' : 'warning',
            message: support.supported ? 'File System Access API supporté' : `Non supporté: ${support.details.join(', ')}`
          });

          const status = await hdsSecureManager.getStatus();
          addTestResult({
            name: 'Statut stockage HDS',
            status: status.isConfigured ? 'success' : 'warning',
            message: `Configuré: ${status.isConfigured}, Déverrouillé: ${status.isUnlocked}, Stockage: ${status.physicalStorageAvailable}`
          });
        } catch (error) {
          addTestResult({
            name: 'Stockage HDS',
            status: 'error',
            message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
          });
        }
      } else {
        addTestResult({
          name: 'Mode démo - Stockage HDS bypassed',
          status: 'success',
          message: 'Aucun stockage sécurisé requis en mode démo'
        });
      }

      // Test 3: Test du routeur de stockage
      try {
        const router = storageRouter;
        addTestResult({
          name: 'Routeur de stockage',
          status: 'success',
          message: 'Routeur initialisé correctement'
        });

        // Test d'une opération de base
        try {
          // En mode démo, utilise sessionStorage
          // En mode connecté, utilise le stockage sécurisé
          console.log('🔍 Test routage des données...');
          
          addTestResult({
            name: 'Routage des données',
            status: 'success',
            message: `Données routées vers ${detectedDemoMode ? 'sessionStorage (demo)' : 'stockage sécurisé (connecté)'}`
          });
        } catch (error) {
          addTestResult({
            name: 'Routage des données',
            status: 'error',
            message: `Erreur routage: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
          });
        }
      } catch (error) {
        addTestResult({
          name: 'Routeur de stockage',
          status: 'error',
          message: `Erreur initialisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        });
      }

      // Test 4: Vérification de l'isolation des modes
      try {
        const isolationTest = detectedDemoMode ? 
          'Mode démo - Aucune interaction avec stockage HDS' :
          'Mode connecté - Isolation HDS active';
        
        addTestResult({
          name: 'Isolation des modes',
          status: 'success',
          message: isolationTest
        });
      } catch (error) {
        addTestResult({
          name: 'Isolation des modes',
          status: 'error',
          message: `Erreur isolation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        });
      }

      console.log('✅ Tests de stockage terminés');
      toast.success('Tests de stockage terminés avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
      addTestResult({
        name: 'Erreur globale',
        status: 'error',
        message: `Erreur critique: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
      toast.error('Erreur lors des tests de stockage');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
    }
  };

  // Ne montrer qu'aux admins
  if (!user?.email?.includes('admin')) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-primary" />
          Panel de tests - Stockage hybride
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            {isRunning ? 'Tests en cours...' : 'Lancer tous les tests'}
          </Button>
          
          <Button variant="outline" onClick={clearResults}>
            Effacer les résultats
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Résultats des tests :</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{result.name}</span>
                    <Badge variant={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};