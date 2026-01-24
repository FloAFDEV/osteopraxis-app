import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, FileSignature, Building2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { Osteopath } from '@/types';

interface ProfessionalIdentityData {
  logo?: string; // Base64 ou URL
  signature?: string; // Base64 ou URL
  headerText?: string; // Texte personnalisé pour l'en-tête
  footerText?: string; // Texte personnalisé pour le pied de page
}

export function ProfessionalIdentitySettings() {
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [logo, setLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');

  useEffect(() => {
    loadOsteopathData();
  }, []);

  const loadOsteopathData = async () => {
    try {
      setLoading(true);
      const data = await api.getCurrentOsteopath();
      setOsteopath(data);

      // Charger les données d'identité professionnelle depuis le champ metadata
      if (data?.metadata) {
        const identity = data.metadata as any;
        setLogo(identity.logo || null);
        setSignature(identity.signature || null);
        setHeaderText(identity.headerText || '');
        setFooterText(identity.footerText || '');
      }
    } catch (error) {
      console.error('Erreur chargement ostéopathe:', error);
      toast.error('Impossible de charger vos informations');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'signature') => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB max
      toast.error('L\'image ne doit pas dépasser 2 Mo');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (type === 'logo') {
          setLogo(base64);
        } else {
          setSignature(base64);
        }
        toast.success(`${type === 'logo' ? 'Logo' : 'Signature'} chargé(e)`);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors du chargement du fichier');
    }
  };

  const handleSave = async () => {
    if (!osteopath) return;

    try {
      setSaving(true);

      const identityData: ProfessionalIdentityData = {
        logo: logo || undefined,
        signature: signature || undefined,
        headerText: headerText || undefined,
        footerText: footerText || undefined,
      };

      // Sauvegarder dans le champ metadata de l'ostéopathe
      await api.updateOsteopath(osteopath.id, {
        metadata: {
          ...(osteopath.metadata || {}),
          ...identityData,
        },
      });

      toast.success('Identité professionnelle sauvegardée');
      loadOsteopathData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Identité Professionnelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Logo Professionnel
          </CardTitle>
          <CardDescription>
            Ajoutez votre logo pour personnaliser vos factures et documents exports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logo ? (
            <div className="relative inline-block">
              <img
                src={logo}
                alt="Logo"
                className="max-h-32 border rounded-lg shadow-sm"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={() => setLogo(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Cliquez pour ajouter votre logo
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'logo');
                }}
                className="max-w-xs mx-auto"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Signature Numérique
          </CardTitle>
          <CardDescription>
            Ajoutez votre signature pour vos factures et documents officiels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {signature ? (
            <div className="relative inline-block">
              <img
                src={signature}
                alt="Signature"
                className="max-h-24 border rounded-lg shadow-sm bg-white"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={() => setSignature(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileSignature className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Cliquez pour ajouter votre signature
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'signature');
                }}
                className="max-w-xs mx-auto"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* En-tête et pied de page personnalisés */}
      <Card>
        <CardHeader>
          <CardTitle>Textes Personnalisés</CardTitle>
          <CardDescription>
            Personnalisez l'en-tête et le pied de page de vos documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="headerText">En-tête (optionnel)</Label>
            <Textarea
              id="headerText"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="Ex: Dr. Jean Dupont - Ostéopathe D.O.
Cabinet d'Ostéopathie - Paris 75001"
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="footerText">Pied de page (optionnel)</Label>
            <Textarea
              id="footerText"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Ex: SIRET: 123 456 789 00012 - N° ADELI: 123456789
Membre du Registre des Ostéopathes de France"
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  );
}
