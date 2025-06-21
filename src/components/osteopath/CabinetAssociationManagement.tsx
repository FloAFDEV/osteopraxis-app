
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Building, AlertCircle } from "lucide-react";
import { api } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Cabinet } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CabinetAssociationManagement() {
  const { user } = useAuth();
  const [associatedCabinets, setAssociatedCabinets] = useState<Cabinet[]>([]);
  const [availableCabinets, setAvailableCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCabinetId, setSelectedCabinetId] = useState<string>("");

  useEffect(() => {
    loadCabinets();
  }, [user]);

  const loadCabinets = async () => {
    if (!user?.osteopathId) return;
    
    try {
      setLoading(true);
      
      // Charger les cabinets associés à l'ostéopathe
      const associatedCabinetIds = await api.getOsteopathCabinets(user.osteopathId);
      const associatedCabsData = await Promise.all(
        associatedCabinetIds.map(id => api.getCabinetById(id))
      );
      setAssociatedCabinets(associatedCabsData.filter(Boolean) as Cabinet[]);
      
      // Charger tous les cabinets disponibles
      const allCabinets = await api.getCabinets();
      const availableCabs = allCabinets.filter(
        cabinet => !associatedCabinetIds.includes(cabinet.id)
      );
      setAvailableCabinets(availableCabs);
      
    } catch (error) {
      console.error("Erreur lors du chargement des cabinets:", error);
      toast.error("Erreur lors du chargement des cabinets");
    } finally {
      setLoading(false);
    }
  };

  const handleAssociateCabinet = async () => {
    if (!user?.osteopathId || !selectedCabinetId) return;

    try {
      await api.associateOsteopathToCabinet(user.osteopathId, Number(selectedCabinetId));
      toast.success("Cabinet associé avec succès");
      setIsDialogOpen(false);
      setSelectedCabinetId("");
      await loadCabinets();
    } catch (error) {
      console.error("Erreur lors de l'association:", error);
      toast.error("Erreur lors de l'association du cabinet");
    }
  };

  const handleDissociateCabinet = async (cabinetId: number) => {
    if (!user?.osteopathId) return;

    if (!confirm("Êtes-vous sûr de vouloir dissocier ce cabinet ?")) return;

    try {
      await api.dissociateOsteopathFromCabinet(user.osteopathId, cabinetId);
      toast.success("Cabinet dissocié avec succès");
      await loadCabinets();
    } catch (error) {
      console.error("Erreur lors de la dissociation:", error);
      toast.error("Erreur lors de la dissociation du cabinet");
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Gestion des Associations Cabinet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Gérez les cabinets auxquels vous êtes associé
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={availableCabinets.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Associer un cabinet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Associer à un nouveau cabinet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sélectionner un cabinet
                    </label>
                    <Select
                      value={selectedCabinetId}
                      onValueChange={setSelectedCabinetId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un cabinet" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCabinets.map((cabinet) => (
                          <SelectItem key={cabinet.id} value={String(cabinet.id)}>
                            {cabinet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAssociateCabinet} disabled={!selectedCabinetId}>
                      Associer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {associatedCabinets.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Aucun cabinet associé
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Associez-vous à un cabinet pour partager des patients et gérer des remplacements.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {associatedCabinets.map((cabinet) => (
                <div key={cabinet.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cabinet.name}</span>
                      <Badge variant="outline">Associé</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cabinet.address}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDissociateCabinet(cabinet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {availableCabinets.length === 0 && associatedCabinets.length > 0 && (
            <div className="text-center py-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700 text-sm">
                Tous les cabinets disponibles sont déjà associés.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
