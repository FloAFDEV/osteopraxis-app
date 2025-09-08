import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Play, 
  RotateCcw,
  Clock,
  Shield,
  Zap,
  Settings
} from 'lucide-react';
import { comprehensiveTestService, type ComprehensiveTestReport, type TestResult, type TestSuite } from '@/services/testing/comprehensive-test-service';
import { toast } from 'sonner';

export const ComprehensiveTestPanel: React.FC = () => {
  const [report, setReport] = useState<ComprehensiveTestReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runAllTests = async () => {
    setIsRunning(true);
    setReport(null);
    setCurrentTest('Initialisation...');
    
    try {
      console.log('🧪 Lancement de la suite de tests complète...');
      
      // Simuler le progrès
      setCurrentTest('Détection du mode...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentTest('Tests d\'architecture...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCurrentTest('Tests spécifiques au mode...');
      const testReport = await comprehensiveTestService.runAllTests();
      
      setCurrentTest('Génération du rapport...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setReport(testReport);
      
      // Notification selon les résultats
      if (testReport.overall.failed === 0) {
        toast.success(`✅ Tous les tests réussis! (${testReport.overall.passed}/${testReport.overall.total})`);
      } else {
        toast.error(`❌ ${testReport.overall.failed} test(s) échoué(s) sur ${testReport.overall.total}`);
      }
      
      console.log('✅ Suite de tests terminée:', testReport);
      
    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
      toast.error('Erreur lors de l\'exécution des tests');
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info':
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-success/10 text-success border-success/20">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Attention</Badge>;
      case 'info':
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const getSuiteIcon = (suiteName: string) => {
    switch (suiteName.toLowerCase()) {
      case 'architecture':
        return <Settings className="h-5 w-5" />;
      case 'sécurité':
        return <Shield className="h-5 w-5" />;
      case 'performance':
        return <Zap className="h-5 w-5" />;
      default:
        return <TestTube className="h-5 w-5" />;
    }
  };

  const calculateProgress = () => {
    if (!report) return 0;
    return (report.overall.passed / report.overall.total) * 100;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-6 w-6 text-primary" />
            Suite de Tests Complète
          </CardTitle>
          <CardDescription>
            Tests automatisés pour vérifier le fonctionnement en modes démo et connecté
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Tests en cours...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Lancer tous les tests
                </>
              )}
            </Button>
            
            {report && (
              <Button variant="outline" onClick={() => setReport(null)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Effacer les résultats
              </Button>
            )}
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {currentTest}
              </div>
              <Progress value={33} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rapport de tests */}
      {report && (
        <div className="space-y-6">
          {/* Résumé global */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Résumé Global - Mode {report.mode.toUpperCase()}</span>
                <Badge 
                  variant={report.overall.failed === 0 ? "default" : "destructive"}
                  className="text-base px-3 py-1"
                >
                  {report.overall.passed}/{report.overall.total}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{report.overall.passed}</div>
                  <div className="text-sm text-muted-foreground">Réussis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{report.overall.failed}</div>
                  <div className="text-sm text-muted-foreground">Échoués</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{report.overall.warnings}</div>
                  <div className="text-sm text-muted-foreground">Avertissements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatDuration(report.overall.duration)}</div>
                  <div className="text-sm text-muted-foreground">Durée totale</div>
                </div>
              </div>
              
              <Progress value={calculateProgress()} className="w-full" />
              
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Démarré: {new Date(report.overall.startTime).toLocaleTimeString()}</span>
                <span>Terminé: {new Date(report.overall.endTime).toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tests par suite */}
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {report.suites.map((suite, index) => (
                <TabsTrigger key={index} value={index.toString()} className="flex items-center gap-1">
                  {getSuiteIcon(suite.name)}
                  {suite.name}
                  <Badge 
                    variant={suite.summary.failed === 0 ? "default" : "destructive"} 
                    className="ml-1 h-5 px-1 text-xs"
                  >
                    {suite.summary.passed}/{suite.summary.total}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {report.suites.map((suite, suiteIndex) => (
              <TabsContent key={suiteIndex} value={suiteIndex.toString()}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getSuiteIcon(suite.name)}
                      {suite.name}
                    </CardTitle>
                    <CardDescription>{suite.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-success">{suite.summary.passed}</span> réussis
                      </div>
                      <div>
                        <span className="font-medium text-destructive">{suite.summary.failed}</span> échoués
                      </div>
                      <div>
                        <span className="font-medium text-warning">{suite.summary.warnings}</span> avertissements
                      </div>
                      <div>
                        <span className="font-medium">{formatDuration(suite.summary.duration)}</span> durée
                      </div>
                    </div>

                    <div className="space-y-3">
                      {suite.tests.map((test, testIndex) => (
                        <div key={testIndex} className="flex items-start gap-3 p-3 rounded-lg border">
                          {getStatusIcon(test.status)}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{test.name}</span>
                                {getStatusBadge(test.status)}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(test.duration)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{test.description}</p>
                            <p className="text-sm">{test.message}</p>
                            {test.details && (
                              <p className="text-xs bg-muted/50 p-2 rounded text-muted-foreground">
                                {test.details}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
};