/**
 * Page de gestion des données HDS - Remplace l'ancienne page de migration
 */

import React from 'react';
import { USBDataManager } from '@/components/data-management/USBDataManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Usb } from 'lucide-react';

export default function DataManagementPage() {
  return (
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Gestion des Données</h1>
              <p className="text-muted-foreground">
                Stockage sécurisé et conforme HDS pour vos données de santé
              </p>
            </div>
          </div>
        </div>

        {/* Explication de l'architecture HDS */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Database className="h-5 w-5" />
              Architecture de Stockage HDS
            </CardTitle>
            <CardDescription className="text-blue-700">
              Comprendre où sont stockées vos données
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Données Sensibles (Local)
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>• Dossiers patients</li>
                  <li>• Rendez-vous médicaux</li>
                  <li>• Facturations</li>
                  <li>• Documents médicaux</li>
                  <li>• Historiques de traitement</li>
                </ul>
                <p className="text-xs mt-2 font-medium">
                  ✓ Stockées uniquement sur votre appareil
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Données Non-Sensibles (Cloud)
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>• Profils d'utilisateurs</li>
                  <li>• Informations de cabinets</li>
                  <li>• Paramètres d'application</li>
                  <li>• Authentification</li>
                </ul>
                <p className="text-xs mt-2 font-medium">
                  ✓ Synchronisées dans le cloud sécurisé
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestionnaire USB */}
        <USBDataManager />

        {/* Information importante sur la confidentialité */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Usb className="h-5 w-5" />
              Partage Sécurisé de Données
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-800">
            <div className="space-y-3 text-sm">
              <p>
                <strong>Conformité RGPD & HDS :</strong> Toutes les données de santé restent sur votre appareil. 
                Le partage se fait uniquement via des fichiers chiffrés que vous contrôlez entièrement.
              </p>
              <p>
                <strong>Chiffrement de bout en bout :</strong> Vos exports sont protégés par un chiffrement AES-256 
                avec votre mot de passe personnel.
              </p>
              <p>
                <strong>Contrôle total :</strong> Vous décidez quand, comment et avec qui partager vos données. 
                Aucune synchronisation automatique vers le cloud pour les données sensibles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}