import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, ShieldCheck, RefreshCw } from "lucide-react";
import { HDSInitialization, useHDSStatus } from "@/services/hybrid-data-adapter/hds-initialization";

interface ComplianceStatus {
  isCompliant: boolean;
  mode: 'demo' | 'production';
  issues: string[];
}

export const HDSComplianceIndicator = () => {
  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { checkCompliance } = useHDSStatus();

  const checkStatus = async () => {
    setLoading(true);
    try {
      const complianceStatus = await checkCompliance();
      setStatus(complianceStatus);
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
      await HDSInitialization.forceLocalInitialization();
      await checkStatus();
    } catch (error) {
      console.error('Erreur initialisation forcée:', error);
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
          Conformité HDS
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
            <p className="text-sm text-blue-800">
              🎭 <strong>Mode démo</strong> : Les données sont éphémères et automatiquement supprimées.
            </p>
          </div>
        )}

        {status.mode === 'production' && status.isCompliant && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800">
              ✅ <strong>Stockage local configuré</strong> : Les données sensibles sont stockées localement selon les exigences HDS.
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