
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileStampManagement } from "./ProfileStampManagement";

export function ProfileBillingForm() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stampUrl, setStampUrl] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    professional_title: "Ostéopathe D.O.",
    rpps_number: "",
    siret: "",
    ape_code: "8690F"
  });

  useEffect(() => {
    // Initialize form with user data if available
    if (user) {
      setFormData({
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        professional_title: "Ostéopathe D.O.",
        rpps_number: "",
        siret: "",
        ape_code: "8690F"
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulated save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations professionnelles</CardTitle>
          <CardDescription>
            Ces informations apparaîtront sur vos factures et documents officiels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Prénom Nom"
                  required
                />
              </div>

              <div>
                <Label htmlFor="professional_title">Titre professionnel</Label>
                <Input
                  id="professional_title"
                  value={formData.professional_title}
                  onChange={(e) => handleInputChange("professional_title", e.target.value)}
                  placeholder="Ostéopathe D.O."
                />
              </div>

              <div>
                <Label htmlFor="rpps_number">Numéro RPPS</Label>
                <Input
                  id="rpps_number"
                  value={formData.rpps_number}
                  onChange={(e) => handleInputChange("rpps_number", e.target.value)}
                  placeholder="Votre numéro RPPS"
                />
              </div>

              <div>
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  value={formData.siret}
                  onChange={(e) => handleInputChange("siret", e.target.value)}
                  placeholder="Votre numéro SIRET"
                />
              </div>

              <div>
                <Label htmlFor="ape_code">Code APE</Label>
                <Input
                  id="ape_code"
                  value={formData.ape_code}
                  onChange={(e) => handleInputChange("ape_code", e.target.value)}
                  placeholder="8690F"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <ProfileStampManagement 
        stampUrl={stampUrl}
        onStampUrlChange={setStampUrl}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
