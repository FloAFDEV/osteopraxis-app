
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Building, AlertCircle, Plus } from "lucide-react";
import { api } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Cabinet } from "@/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SecureCabinetJoin } from "@/components/cabinet/SecureCabinetJoin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CabinetAssociationManagement() {
  const { user } = useAuth();
  const [associatedCabinets, setAssociatedCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    cabinetId: number | null;
    cabinetName: string;
  }>({
    isOpen: false,
    cabinetId: null,
    cabinetName: ""
  });

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
      
    } catch (error) {
      console.error("CabinetAssociationManagement: Erreur lors du chargement des cabinets:", error);
      toast.error("Erreur lors du chargement des cabinets");
    } finally {
      setLoading(false);
    }
  };

  const handleDissociateCabinet = async (cabinetId: number) => {
    if (!user?.osteopathId) return;

    try {
      console.log("CabinetAssociationManagement: Dissociation cabinet", cabinetId, "de ostéopathe", user.osteopathId);
      await api.dissociateOsteopathFromCabinet(user.osteopathId, cabinetId);
      toast.success("Cabinet dissocié avec succès", {
        description: "Vous n'avez plus accès aux patients de ce cabinet."
      });
      await loadCabinets();
    } catch (error) {
      console.error("CabinetAssociationManagement: Erreur lors de la dissociation:", error);
      toast.error("Erreur lors de la dissociation", {
        description: "Impossible de dissocier le cabinet. Veuillez réessayer."
      });
    }
  };

  const openConfirmDialog = (cabinet: Cabinet) => {
    setConfirmDialog({
      isOpen: true,
      cabinetId: cabinet.id,
      cabinetName: cabinet.name
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      cabinetId: null,
      cabinetName: ""
    });
  };

  const confirmDissociation = () => {
    if (confirmDialog.cabinetId) {
      handleDissociateCabinet(confirmDialog.cabinetId);
    }
    closeConfirmDialog();
  };

  const handleJoinSuccess = () => {
    setJoinDialogOpen(false);
    loadCabinets();
  };

  console.log("CabinetAssociationManagement: Rendu avec loading:", loading, "associatedCabinets:", associatedCabinets.length);

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
            Gérez les cabinets auxquels vous êtes associé (sécurisé par invitations)
          </p>
        </div>
        <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Rejoindre un cabinet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rejoindre un cabinet</DialogTitle>
            </DialogHeader>
            <SecureCabinetJoin onSuccess={handleJoinSuccess} />
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
            Pour des raisons de sécurité, vous devez recevoir une invitation du propriétaire d'un cabinet pour vous y associer.
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
                onClick={() => openConfirmDialog(cabinet)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmDissociation}
        title="Confirmer la dissociation"
        description={`Êtes-vous sûr de vouloir vous dissocier du cabinet "${confirmDialog.cabinetName}" ? Vous n'aurez plus accès aux patients de ce cabinet.`}
        confirmText="Dissocier"
        cancelText="Annuler"
        variant="destructive"
      />
    </div>
  );
}
