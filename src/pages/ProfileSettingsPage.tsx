/**
 * Page unifiée de profil
 * Fusionne les informations ostéopathe + cabinet principal
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Building2, AlertCircle, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDemo } from '@/contexts/DemoContext';
import { isDemoSession } from '@/utils/demo-detection';

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemo();
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  // Données démo (lecture seule)
  const [demoOsteopath, setDemoOsteopath] = useState<any>(null);
  const [demoCabinet, setDemoCabinet] = useState<any>(null);

  useEffect(() => {
    const checkMode = async () => {
      const demo = await isDemoSession();
      setIsDemo(demo);

      if (demo) {
        // Charger les données démo
        const { demoLocalStorage } = await import('@/services/demo-local-storage');
        const demoCabinetId = localStorage.getItem('demo_cabinet_id');

        if (demoCabinetId) {
          const osteopath = demoLocalStorage(demoCabinetId).getOsteopath();
          const cabinets = demoLocalStorage(demoCabinetId).getCabinets();

          setDemoOsteopath(osteopath);
          setDemoCabinet(cabinets[0] || null);
        }
      }

      setLoading(false);
    };

    checkMode();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center p-8">
          <p>Chargement...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <BackButton />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8 text-blue-500" />
              Mon Profil
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos informations professionnelles et votre cabinet principal
            </p>
          </div>
          {isDemo && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Mode Démo
            </Badge>
          )}
        </div>

        {isDemo && (
          <Alert className="border-blue-200 bg-blue-50">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Mode Démo :</strong> Ces informations sont fictives et en lecture seule.
              Inscrivez-vous pour gérer votre vrai cabinet et générer des factures personnalisées.
            </AlertDescription>
          </Alert>
        )}

        {/* Section 1: Informations Professionnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Informations Professionnelles
            </CardTitle>
            <CardDescription>
              Ces informations apparaîtront sur vos factures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={demoOsteopath?.name || ''}
                  disabled={isDemo}
                  placeholder="Dr. Jean Dupont"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titre professionnel</Label>
                <Input
                  id="title"
                  value={demoOsteopath?.professional_title || ''}
                  disabled={isDemo}
                  placeholder="Ostéopathe D.O."
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Informations obligatoires pour facturation
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rpps">
                    N° RPPS <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rpps"
                    value={demoOsteopath?.rpps_number || ''}
                    disabled={isDemo}
                    placeholder="10001234567"
                    maxLength={11}
                  />
                  <p className="text-xs text-muted-foreground">
                    11 chiffres - Numéro d'identification RPPS
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siret">
                    N° SIRET <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="siret"
                    value={demoOsteopath?.siret || demoCabinet?.siret || ''}
                    disabled={isDemo}
                    placeholder="12345678900012"
                    maxLength={14}
                  />
                  <p className="text-xs text-muted-foreground">
                    14 chiffres - Numéro SIRET de votre cabinet
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ape">
                  Code APE <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ape"
                  value={demoOsteopath?.ape_code || '8690F'}
                  disabled={isDemo}
                  placeholder="8690F"
                />
                <p className="text-xs text-muted-foreground">
                  Code APE pour les ostéopathes : 8690F
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Cabinet Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-500" />
              Mon Cabinet Principal
            </CardTitle>
            <CardDescription>
              Les informations de votre cabinet apparaîtront sur vos factures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cabinet-name">Nom du cabinet</Label>
              <Input
                id="cabinet-name"
                value={demoCabinet?.name || ''}
                disabled={isDemo}
                placeholder="Cabinet d'Ostéopathie"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={demoCabinet?.address || ''}
                disabled={isDemo}
                placeholder="12 Rue de la République"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postal">Code postal</Label>
                <Input
                  id="postal"
                  value={demoCabinet?.postalCode || ''}
                  disabled={isDemo}
                  placeholder="31000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={demoCabinet?.city || ''}
                  disabled={isDemo}
                  placeholder="Toulouse"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={demoCabinet?.phone || ''}
                  disabled={isDemo}
                  placeholder="05 61 00 00 00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={demoCabinet?.email || ''}
                  disabled={isDemo}
                  placeholder="contact@cabinet.fr"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {isDemo ? (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/register')}
            >
              S'inscrire pour débloquer
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/settings')}>
              Annuler
            </Button>
            <Button onClick={() => toast.success('Profil enregistré')}>
              Enregistrer les modifications
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
