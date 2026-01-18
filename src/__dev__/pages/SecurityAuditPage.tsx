/**
 * Page d'audit de sécurité
 * 
 * Affiche le rapport d'audit de sécurité complet
 * Accessible uniquement aux administrateurs
 */

import { Layout } from '@/components/ui/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Download, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string[];
  recommendation: string;
  affectedTables?: string[];
}

const SECURITY_ISSUES: SecurityIssue[] = [
  {
    id: 'total-block',
    severity: 'critical',
    title: 'Blocage total des données patients',
    description: 'Les politiques RLS HDS_TOTAL_BLOCK_* bloquent tout accès aux données médicales, rendant l\'application inutilisable.',
    impact: [
      'Impossibilité d\'accéder aux dossiers patients',
      'Consultations et documents médicaux inaccessibles',
      'Application non fonctionnelle pour les données de santé'
    ],
    recommendation: 'Remplacer immédiatement par des policies basées sur osteopathId',
    affectedTables: ['Patient', 'Consultation', 'MedicalDocument', 'TreatmentHistory']
  },
  {
    id: 'permissive-access',
    severity: 'critical',
    title: 'Accès trop permissifs',
    description: 'Policy "Enable all operations for authenticated users" avec expression TRUE permet à n\'importe quel utilisateur authentifié de tout faire.',
    impact: [
      'Escalade de privilèges possible',
      'Un ostéopathe peut modifier le profil d\'un autre',
      'Violation du principe de moindre privilège'
    ],
    recommendation: 'Restreindre l\'accès par userId/osteopathId',
    affectedTables: ['ProfessionalProfile', 'Invoice', 'Osteopath']
  },
  {
    id: 'unencrypted-medical-data',
    severity: 'critical',
    title: 'Données médicales non chiffrées',
    description: 'Les données de santé sensibles sont stockées en clair dans PostgreSQL.',
    impact: [
      'Non-conformité HDS et RGPD Article 32',
      'En cas de breach, données lisibles',
      'Responsabilité pénale du praticien'
    ],
    recommendation: 'Activer pgcrypto et chiffrer colonnes: notes, diagnosis, medicalHistory',
    affectedTables: ['Patient', 'Consultation']
  },
  {
    id: 'no-input-validation',
    severity: 'high',
    title: 'Validation des entrées insuffisante',
    description: 'Absence de validation au niveau base de données pour emails, SIRET, montants.',
    impact: [
      'Montants négatifs possibles',
      'Formats invalides acceptés',
      'Intégrité des données compromise'
    ],
    recommendation: 'Ajouter des constraints CHECK SQL et validation Zod côté client',
    affectedTables: ['Invoice', 'Osteopath', 'Patient']
  },
  {
    id: 'redundant-policies',
    severity: 'medium',
    title: 'Policies RLS redondantes',
    description: 'Jusqu\'à 15 policies par table, beaucoup redondantes ou contradictoires.',
    impact: [
      'Complexité impossible à maintenir',
      'Performance dégradée',
      'Risque d\'erreurs lors de modifications'
    ],
    recommendation: 'Simplifier et unifier les policies, supprimer les doublons',
    affectedTables: ['Appointment', 'Cabinet', 'Invoice']
  },
  {
    id: 'demo-cleanup',
    severity: 'medium',
    title: 'Nettoyage données démo insuffisant',
    description: 'Les données démo expirées ne sont pas supprimées automatiquement.',
    impact: [
      'Accumulation de données non nécessaires',
      'Consommation d\'espace disque',
      'Données sensibles de test persistantes'
    ],
    recommendation: 'Implémenter un job pg_cron de nettoyage toutes les 15 minutes',
    affectedTables: ['demo_sessions', 'Patient', 'Appointment', 'Invoice']
  },
  {
    id: 'incomplete-audit',
    severity: 'medium',
    title: 'Logs d\'audit incomplets',
    description: 'Pas de trigger automatique pour logger tous les accès aux données sensibles.',
    impact: [
      'Traçabilité insuffisante',
      'Non-conformité HDS',
      'Impossibilité d\'enquêter en cas d\'incident'
    ],
    recommendation: 'Ajouter triggers automatiques sur toutes tables avec données de santé',
    affectedTables: ['audit_logs', 'Patient', 'Consultation']
  }
];

const SECURITY_SCORES = {
  rls: { score: 3, max: 10, label: 'Politiques RLS' },
  encryption: { score: 4, max: 10, label: 'Chiffrement données' },
  validation: { score: 5, max: 10, label: 'Validation input' },
  auth: { score: 7, max: 10, label: 'Authentification' },
  audit: { score: 6, max: 10, label: 'Audit logs' },
  xss: { score: 8, max: 10, label: 'Protection XSS' },
  csrf: { score: 9, max: 10, label: 'Protection CSRF' },
  sqli: { score: 9, max: 10, label: 'Protection SQL Injection' }
};

export default function SecurityAuditPage() {
  const { user } = useAuth();

  // Vérifier que l'utilisateur est admin (à implémenter correctement)
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const criticalIssues = SECURITY_ISSUES.filter(i => i.severity === 'critical').length;
  const highIssues = SECURITY_ISSUES.filter(i => i.severity === 'high').length;
  const mediumIssues = SECURITY_ISSUES.filter(i => i.severity === 'medium').length;

  const totalScore = Object.values(SECURITY_SCORES).reduce((sum, s) => sum + s.score, 0);
  const maxScore = Object.values(SECURITY_SCORES).reduce((sum, s) => sum + s.max, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === 'critical' || severity === 'high' ? XCircle : AlertTriangle;
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Audit de Sécurité</h1>
                <p className="text-muted-foreground">
                  Analyse des vulnérabilités et conformité RGPD/HDS
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.open('/SECURITY_AUDIT_REPORT.md', '_blank')}>
              <Download className="h-4 w-4 mr-2" />
              Rapport complet
            </Button>
          </div>

          {/* Score global */}
          <Alert className={`border-2 ${percentage < 70 ? 'border-destructive bg-destructive/10' : 'border-warning bg-warning/10'}`}>
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">
              Score de sécurité global: {percentage}%
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                <p className="font-semibold">
                  {criticalIssues} vulnérabilités critiques • {highIssues} élevées • {mediumIssues} moyennes
                </p>
                <p className="text-sm">
                  Score insuffisant pour une application médicale manipulant des données de santé sensibles.
                  Action immédiate requise.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Scores détaillés */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scores par catégorie</CardTitle>
            <CardDescription>
              Évaluation détaillée de chaque aspect de la sécurité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(SECURITY_SCORES).map(([key, { score, max, label }]) => {
                const percent = (score / max) * 100;
                const color = percent < 50 ? 'text-destructive' : percent < 70 ? 'text-warning' : 'text-primary';
                
                return (
                  <div key={key} className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>
                      {score}/{max}
                    </p>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${percent < 50 ? 'bg-destructive' : percent < 70 ? 'bg-warning' : 'bg-primary'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Liste des vulnérabilités */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Vulnérabilités identifiées</h2>
          
          {SECURITY_ISSUES.map(issue => {
            const SeverityIcon = getSeverityIcon(issue.severity);
            
            return (
              <Card key={issue.id} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <SeverityIcon className={`h-5 w-5 mt-0.5 ${
                        issue.severity === 'critical' ? 'text-destructive' : 
                        issue.severity === 'high' ? 'text-warning' : 
                        'text-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{issue.title}</CardTitle>
                          <Badge variant={getSeverityColor(issue.severity) as any}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <CardDescription>{issue.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Impact */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Impact:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {issue.impact.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tables affectées */}
                  {issue.affectedTables && issue.affectedTables.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Tables affectées:</p>
                      <div className="flex flex-wrap gap-2">
                        {issue.affectedTables.map(table => (
                          <Badge key={table} variant="outline" className="font-mono text-xs">
                            {table}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommandation */}
                  <div className="p-3 border rounded-lg bg-primary/5">
                    <p className="text-sm font-semibold mb-1">Recommandation:</p>
                    <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Conformité RGPD/HDS */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Conformité réglementaire</CardTitle>
            <CardDescription>
              Checklist RGPD et HDS pour hébergement de données de santé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* RGPD */}
              <div>
                <h3 className="font-semibold mb-3">RGPD</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Chiffrement au repos', status: false },
                    { label: 'Chiffrement en transit', status: true },
                    { label: 'Logs d\'accès', status: false },
                    { label: 'Droit à l\'oubli', status: false },
                    { label: 'Consentement explicite', status: false },
                    { label: 'DPO désigné', status: false },
                    { label: 'DPIA effectuée', status: false }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {item.status ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className={item.status ? 'text-foreground' : 'text-muted-foreground'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* HDS */}
              <div>
                <h3 className="font-semibold mb-3">HDS (Hébergement Données de Santé)</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Hébergeur certifié HDS', status: false },
                    { label: 'Chiffrement AES-256', status: true },
                    { label: 'Authentification forte', status: false },
                    { label: 'Traçabilité complète', status: false },
                    { label: 'Sauvegarde chiffrée', status: true },
                    { label: 'Plan de reprise (PRA)', status: false },
                    { label: 'Formation sécurité', status: false }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {item.status ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className={item.status ? 'text-foreground' : 'text-muted-foreground'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ressources */}
        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Ressources et documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { label: 'Recommandations CNIL données de santé', url: 'https://www.cnil.fr/fr/la-sante' },
                { label: 'Référentiel HDS', url: 'https://esante.gouv.fr/labels-certifications/hds' },
                { label: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' },
                { label: 'Supabase RLS Best Practices', url: 'https://supabase.com/docs/guides/auth/row-level-security' }
              ].map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-background transition-colors text-sm"
                >
                  <ExternalLink className="h-4 w-4 text-primary" />
                  <span>{resource.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
