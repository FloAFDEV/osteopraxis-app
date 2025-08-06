
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Cabinet } from "@/types";
import { api } from "@/services";
import { useAuth } from "@/contexts/AuthContext";

export function CabinetSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCabinets();
  }, []);

  const loadCabinets = async () => {
    try {
      setLoading(true);
      const cabinetData = await api.getCabinets();
      setCabinets(cabinetData);
      if (cabinetData.length > 0) {
        setSelectedCabinet(cabinetData[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cabinets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les cabinets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: Partial<Cabinet>) => {
    if (!selectedCabinet) return;

    try {
      setSaving(true);
      const updatedCabinet = await api.updateCabinet(selectedCabinet.id, formData);
      setSelectedCabinet(updatedCabinet);
      setCabinets(cabinets.map(c => c.id === updatedCabinet.id ? updatedCabinet : c));
      
      toast({
        title: "Succès",
        description: "Cabinet mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le cabinet",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedCabinet) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Aucun cabinet trouvé</p>
        <Button 
          onClick={() => window.location.href = '/cabinets/new'} 
          className="mt-4"
        >
          Créer un cabinet
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres du cabinet</h1>
        <p className="text-muted-foreground">
          Gérez les informations de votre cabinet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <CabinetForm
            cabinet={selectedCabinet}
            onSave={handleSave}
            saving={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}

interface CabinetFormProps {
  cabinet: Cabinet;
  onSave: (data: Partial<Cabinet>) => void;
  saving: boolean;
}

function CabinetForm({ cabinet, onSave, saving }: CabinetFormProps) {
  const [formData, setFormData] = useState({
    name: cabinet.name || '',
    address: cabinet.address || '',
    email: cabinet.email || '',
    phone: cabinet.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du cabinet</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nom du cabinet"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Adresse complète du cabinet"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contact@cabinet.fr"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="01 23 45 67 89"
          />
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Sauvegarde..." : "Sauvegarder"}
      </Button>
    </form>
  );
}
