
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Building, AlertCircle, Plus, Info } from "lucide-react";
import { api } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Cabinet } from "@/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SecureCabinetJoin } from "@/components/cabinet/SecureCabinetJoin";
import { HelpButton } from "@/components/ui/help-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Link } from "react-router-dom";

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
    // ✅ Composant CabinetAssociation chargé
    loadCabinets();
  }, [user]);

  const loadCabinets = async () => {
    if (!user?.osteopathId) {
      // No osteopath ID found
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // ✅ Chargement cabinets ostéopathe
      
      // Charger les cabinets associés à l'ostéopathe
      const associatedCabinetIds = await api.getOsteopathCabinets(user.osteopathId);
      // Associated cabinet IDs retrieved
      
      const associatedCabsData = await Promise.all(
        associatedCabinetIds.map(id => api.getCabinetById(id))
      );
      const validAssociatedCabs = associatedCabsData.filter(Boolean) as Cabinet[];
      setAssociatedCabinets(validAssociatedCabs);
      // Valid associated cabinets processed
      
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
      // ✅ Dissociation cabinet ostéopathe
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

  // Séparer les cabinets où l'utilisateur est propriétaire de ceux où il est invité
  const ownedCabinets = associatedCabinets.filter(cabinet => cabinet.osteopathId === user?.osteopathId);
  const invitedCabinets = associatedCabinets.filter(cabinet => cabinet.osteopathId !== user?.osteopathId);

  // Component render state tracking

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement des cabinets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building className="h-5 w-5" />
              Associations Cabinet
            </h3>
            <HelpButton 
              content="Gérez vos cabinets : ceux que vous possédez et ceux auxquels vous êtes invité. Le système d'invitations sécurisé permet une collaboration professionnelle contrôlée."
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les cabinets auxquels vous êtes associé (sécurisé par invitations)
          </p>
        </div>
        
        <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
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

      {/* Information SaaS */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-300">
          <strong>Modèle SaaS :</strong> Pour des raisons de sécurité et de conformité, seuls les propriétaires de cabinets peuvent générer des invitations. 
          Contactez le propriétaire du cabinet que vous souhaitez rejoindre pour obtenir un code d'invitation.
        </AlertDescription>
      </Alert>

      {/* Cabinets possédés */}
      {ownedCabinets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-green-700 dark:text-green-400">Mes cabinets (Propriétaire)</h4>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              {ownedCabinets.length}
            </Badge>
          </div>
          {ownedCabinets.map((cabinet) => (
            <div key={`owned-${cabinet.id}`} className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cabinet.name}</span>
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                        Propriétaire
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cabinet.address}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
                >
                  <Link to={`/cabinets/${cabinet.id}/invitations`}>
                    Gérer invitations
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cabinets où l'utilisateur est invité */}
      {invitedCabinets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-blue-700 dark:text-blue-400">Cabinets rejoints (Invité)</h4>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
              {invitedCabinets.length}
            </Badge>
          </div>
          {invitedCabinets.map((cabinet) => (
            <div key={`invited-${cabinet.id}`} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cabinet.name}</span>
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                        Invité
                      </Badge>
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

      {/* Aucun cabinet */}
      {associatedCabinets.length === 0 && (
        <div className="text-center py-12 bg-muted/50 rounded-lg border-2 border-dashed">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium mb-2">Aucun cabinet associé</h4>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Créez votre propre cabinet ou demandez à un propriétaire de cabinet de vous envoyer un code d'invitation 
            pour rejoindre son équipe et collaborer en toute sécurité.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/cabinets/new" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Créer mon cabinet
              </Link>
            </Button>
            <Button onClick={() => setJoinDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Rejoindre un cabinet
            </Button>
          </div>
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
