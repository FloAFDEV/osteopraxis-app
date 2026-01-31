import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, TestTube, CheckCircle, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import { hdsSecureManager } from "@/services/hds-secure-storage/hds-secure-manager";
import { isDemoSession } from "@/utils/demo-detection";

interface ComplianceStatus {
  isCompliant: boolean;
  mode: 'demo' | 'production';
  issues: string[];
}

export const HDSComplianceIndicator = () => {
  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const isDemoMode = await isDemoSession();
      const hdsStatus = await hdsSecureManager.getStatus();
      
      const issues: string[] = [];
      
      if (!isDemoMode && !hdsStatus.isConfigured) {
        issues.push('Stockage HDS local non configuré');
      }
      
      if (!isDemoMode && hdsStatus.isConfigured && !hdsStatus.isUnlocked) {
        issues.push('Stockage HDS verrouillé');
      }
      
      setStatus({
        isCompliant: isDemoMode || (hdsStatus.isConfigured && hdsStatus.isUnlocked),
        mode: isDemoMode ? 'demo' : 'production',
        issues
      });
    } catch (error) {
      console.error('Erreur vérification HDS:', error);
      setStatus({
        isCompliant: false,
        mode: 'production',
        issues: ['Erreur lors de la vérification']
      });
    } finally {
      setLoading(false);
    }
  };

  const forceInitialization = async () => {
    setLoading(true);
    try {
      console.log('🔄 Rafraîchissement du statut HDS...');
      await checkStatus();
    } catch (error) {
      console.error('Erreur rafraîchissement:', error);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="ml-2">Vérification HDS...</span>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.isCompliant ? (
            <ShieldCheck className="w-5 h-5 text-green-600" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-600" />
          )}
          Stockage local sécurisé
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={status.isCompliant ? "default" : "destructive"}>
            {status.isCompliant ? "Conforme" : "Non conforme"}
          </Badge>
          <Badge variant="outline">
            Mode {status.mode}
          </Badge>
        </div>

        {status.mode === 'demo' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              <strong>Mode démo</strong> : Les données sont éphémères et automatiquement supprimées.
            </p>
          </div>
        )}

        {status.mode === 'production' && status.isCompliant && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <strong>Stockage local configuré</strong> : Vos données sensibles sont chiffrées et stockées localement.
            </p>
          </div>
        )}

        {status.issues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm font-medium text-red-800 mb-2">Problèmes détectés :</p>
            <ul className="text-sm text-red-700 space-y-1">
              {status.issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkStatus}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          
          {!status.isCompliant && status.mode === 'production' && (
            <Button 
              size="sm" 
              onClick={forceInitialization}
              disabled={loading}
            >
              <Shield className="w-4 h-4 mr-2" />
              Initialiser stockage local
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};