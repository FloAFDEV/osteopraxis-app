import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TestTube, Shield, Zap, Settings, Database, Users, ArrowLeft } from 'lucide-react';
import { ComprehensiveTestPanel } from '@/components/testing/ComprehensiveTestPanel';
import { StorageTestPanel } from '@/components/testing/StorageTestPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TestingDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Vérifier les permissions admin
  const isAdmin = user?.role === 'ADMIN' || user?.email?.includes('admin');

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Shield className="h-5 w-5" />
              Accès Restreint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Cette page est réservée aux administrateurs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Bouton retour et en-tête */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour Dashboard
        </Button>
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube className="h-8 w-8 text-primary" />
            Tableau de Bord Tests
          </h1>
          <p className="text-muted-foreground">
            Centre de contrôle pour tester et valider toutes les fonctionnalités de l'application.
          </p>
        </div>
      </div>

      {/* Informations importantes */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            Tests de Conformité HDS
          </CardTitle>
          <CardDescription>
            Ces tests vérifient la conformité aux exigences de sécurité des données de santé.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-success/10 text-success border-success/20">
                Mode Démo
              </Badge>
              <span>Isolation complète, aucune donnée sensible</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                Mode Connecté
              </Badge>
              <span>Stockage local sécurisé, chiffrement AES-256</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Anti-falsification
              </Badge>
              <span>Signatures HMAC, horodatage cryptographique</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grille des panneaux de test */}
      <div className="grid grid-cols-1 gap-6">
        {/* Suite de tests complète */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Suite Complète de Tests
            </CardTitle>
            <CardDescription>
              Tests automatisés pour vérifier toutes les fonctionnalités dans les deux modes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComprehensiveTestPanel />
          </CardContent>
        </Card>

        {/* Tests de stockage */}
        <StorageTestPanel />

        {/* Informations techniques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Architecture de Stockage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Mode Démo</h4>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• SessionStorage exclusivement</li>
                  <li>• Données perdues au rechargement</li>
                  <li>• Aucune interaction avec HDS</li>
                  <li>• Isolation complète</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Mode Connecté</h4>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• File System Access API</li>
                  <li>• Chiffrement AES-256-GCM</li>
                  <li>• Signatures HMAC anti-falsification</li>
                  <li>• Stockage persistant local</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Types de Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Fonctionnels</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• CRUD Patients</li>
                    <li>• CRUD Rendez-vous</li>
                    <li>• CRUD Factures</li>
                    <li>• Export/Import</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sécurité</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Isolation modes</li>
                    <li>• Chiffrement</li>
                    <li>• Anti-falsification</li>
                    <li>• Signatures</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Latence opérations</li>
                    <li>• Usage mémoire</li>
                    <li>• Concurrence</li>
                    <li>• Temps de réponse</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Architecture</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Détection modes</li>
                    <li>• Routage données</li>
                    <li>• Classification HDS</li>
                    <li>• Services disponibles</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}