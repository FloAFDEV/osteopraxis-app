/**
 * Composant de diagnostic SQLite
 * Permet de tester et diagnostiquer l'infrastructure SQLite locale
 */

import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
// Hook supprimé - Composant simplifié pour la démonstration

export function SQLiteDiagnostic() {
  // Composant simplifié sans tests SQLite complexes

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Diagnostic Infrastructure SQLite</CardTitle>
          <CardDescription>
            Test de l'infrastructure SQLite + OPFS pour le stockage local des données sensibles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mt-6 p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              Service SQLite temporairement désactivé pendant le refactoring HDS.
              Les données sont maintenant gérées par le service démo HDS.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Classification des Données (Planifiée)</CardTitle>
          <CardDescription>
            Répartition future des données selon l'architecture hybride
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-primary">☁️ Données Cloud (Supabase)</h4>
              <ul className="text-sm space-y-1">
                <li>• Authentification (auth.users)</li>
                <li>• Utilisateurs (User)</li>
                <li>• Ostéopathes (Osteopath)</li>
                <li>• Cabinets (Cabinet)</li>
                <li>• Configuration non-sensible</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-secondary">🔒 Données Locales (SQLite)</h4>
              <ul className="text-sm space-y-1">
                <li>• Patients (données personnelles)</li>
                <li>• Rendez-vous (Appointment)</li>
                <li>• Factures (Invoice)</li>
                <li>• Consultations (Consultation)</li>
                <li>• Documents médicaux</li>
                <li>• Historique des traitements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>⚠️ Informations importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>OPFS</strong> : Stockage persistant dans le navigateur (Chrome/Edge 86+, Firefox 111+)</p>
          <p>• <strong>Fallback</strong> : Si OPFS non disponible, SQLite fonctionnera en mémoire uniquement</p>
          <p>• <strong>Sécurité</strong> : Les données locales seront chiffrées lors de l'export/import</p>
          <p>• <strong>Compatibilité</strong> : Cette version Web sera la base pour Desktop (Tauri) et Mobile (Capacitor)</p>
        </CardContent>
      </Card>
    </div>
  );
}