import React, { useState } from 'react';
import { debugAuthService } from '@/services/debug-auth-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DebugAuthPage: React.FC = () => {
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