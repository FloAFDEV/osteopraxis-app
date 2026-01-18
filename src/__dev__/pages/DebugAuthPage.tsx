import React, { useState } from 'react';
import { debugAuthService } from '@/services/debug-auth-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemo } from '@/contexts/DemoContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const DebugAuthPage: React.FC = () => {
  const { isDemoMode } = useDemo();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    setLoading(true);
    try {
      const debugResult = await debugAuthService.checkAuthenticationStatus();
      setResult(debugResult);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Bloquer l'accès en mode démo
  if (isDemoMode) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Accès restreint en mode démo</strong>
            <p className="mt-2">Les outils de débogage d'authentification ne sont pas disponibles en mode démonstration pour des raisons de sécurité.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Authentification</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runDebug} disabled={loading}>
            {loading ? 'Test en cours...' : 'Tester l\'authentification'}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugAuthPage;