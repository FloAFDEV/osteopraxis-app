
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export interface OsteopathProfile {
  id: number;
  name: string;
  professional_title?: string;
  adeli_number?: string;
  siret?: string;
  ape_code?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OsteopathProfileFormProps {
  osteopath?: OsteopathProfile;
  onSave: (updatedOsteopath: OsteopathProfile) => Promise<void>;
}

export function OsteopathProfileForm({ osteopath, onSave }: OsteopathProfileFormProps) {
  const [formData, setFormData] = useState({
    name: osteopath?.name || '',
    professional_title: osteopath?.professional_title || 'Ostéopathe D.O.',
    adeli_number: osteopath?.adeli_number || '',
    siret: osteopath?.siret || '',
    ape_code: osteopath?.ape_code || '8690F',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Le nom est obligatoire");
      return;
    }

    try {
      setIsSaving(true);
      if (osteopath) {
        await onSave({
          ...osteopath,
          ...formData,
        });
        toast.success("Profil mis à jour avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Dr. John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional_title">Titre professionnel</Label>
            <Input
              id="professional_title"
              name="professional_title"
              value={formData.professional_title}
              onChange={handleChange}
              placeholder="Ostéopathe D.O."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adeli_number">Numéro ADELI</Label>
            <Input
              id="adeli_number"
              name="adeli_number"
              value={formData.adeli_number}
              onChange={handleChange}
              placeholder="123456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siret">SIRET</Label>
            <Input
              id="siret"
              name="siret"
              value={formData.siret}
              onChange={handleChange}
              placeholder="12345678901234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ape_code">Code APE</Label>
            <Input
              id="ape_code"
              name="ape_code"
              value={formData.ape_code}
              onChange={handleChange}
              placeholder="8690F"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
