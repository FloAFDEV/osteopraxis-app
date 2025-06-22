
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
    console.log("CabinetAssociationManagement: Composant monté avec user:", user);
    loadCabinets();
  }, [user]);

  const loadCabinets = async () => {
    if (!user?.osteopathId) {
      console.log("CabinetAssociationManagement: Pas d'osteopathId trouvé");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log("CabinetAssociationManagement: Chargement des cabinets pour ostéopathe", user.osteopathId);
      
      // Charger les cabinets associés à l'ostéopathe
      const associatedCabinetIds = await api.getOsteopathCabinets(user.osteopathId);
      console.log("CabinetAssociationManagement: Cabinets associés IDs:", associatedCabinetIds);
      
      const associatedCabsData = await Promise.all(
        associatedCabinetIds.map(id => api.getCabinetById(id))
      );
      const validAssociatedCabs = associatedCabsData.filter(Boolean) as Cabinet[];
      setAssociatedCabinets(validAssociatedCabs);
      console.log("CabinetAssociationManagement: Cabinets associés:", validAssociatedCabs);
      
      // Charger tous les cabinets disponibles
      const allCabinets = await api.getCabinets();
      console.log("CabinetAssociationManagement: Tous les cabinets:", allCabinets);
      
      const availableCabs = allCabinets.filter(
        cabinet => !associatedCabinetIds.includes(cabinet.id)
      );
      setAvailableCabinets(availableCabs);
      console.log("CabinetAssociationManagement: Cabinets disponibles:", availableCabs);
      
    } catch (error) {
      console.error("CabinetAssociationManagement: Erreur lors du chargement des cabinets:", error);
      toast.error("Erreur lors du chargement des cabinets");
    } finally {
      setLoading(false);
    }
  };

  const handleAssociateCabinet = async () => {
    if (!user?.osteopathId || !selectedCabinetId) return;

    try {
      console.log("CabinetAssociationManagement: Association cabinet", selectedCabinetId, "à ostéopathe", user.osteopathId);
      await api.associateOsteopathToCabinet(user.osteopathId, Number(selectedCabinetId));
      toast.success("Cabinet associé avec succès");
      setIsDialogOpen(false);
      setSelectedCabinetId("");
      await loadCabinets();
    } catch (error) {
      console.error("CabinetAssociationManagement: Erreur lors de l'association:", error);
      toast.error("Erreur lors de l'association du cabinet");
    }
  };

  const handleDissociateCabinet = async (cabinetId: number) => {
    if (!user?.osteopathId) return;

    if (!confirm("Êtes-vous sûr de vouloir dissocier ce cabinet ?")) return;

    try {
      console.log("CabinetAssociationManagement: Dissociation cabinet", cabinetId, "de ostéopathe", user.osteopathId);
      await api.dissociateOsteopathFromCabinet(user.osteopathId, cabinetId);
      toast.success("Cabinet dissocié avec succès");
      await loadCabinets();
    } catch (error) {
      console.error("CabinetAssociationManagement: Erreur lors de la dissociation:", error);
      toast.error("Erreur lors de la dissociation du cabinet");
    }
  };

  console.log("CabinetAssociationManagement: Rendu avec loading:", loading, "associatedCabinets:", associatedCabinets.length, "availableCabinets:", availableCabinets.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement des cabinets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Building className="h-5 w-5" />
            Associations Cabinet
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les cabinets auxquels vous êtes associé
          </p>
        </div>
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
        <div className="text-center py-8 bg-muted/50 rounded-lg border-2 border-dashed">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground font-medium">
            Aucun cabinet associé
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Associez-vous à un cabinet pour partager des patients et gérer des remplacements.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {associatedCabinets.map((cabinet) => (
            <div key={cabinet.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cabinet.name}</span>
                      <Badge variant="outline" className="text-xs">Associé</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cabinet.address}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDissociateCabinet(cabinet.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {availableCabinets.length === 0 && associatedCabinets.length > 0 && (
        <div className="text-center py-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Tous les cabinets disponibles sont déjà associés.
          </p>
        </div>
      )}
    </div>
  );
}
