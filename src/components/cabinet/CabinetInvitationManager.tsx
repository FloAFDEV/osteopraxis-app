
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Copy, Trash2, Mail, Clock, Check, X } from "lucide-react";
import { toast } from "sonner";
import { CabinetInvitation, cabinetInvitationService } from "@/services/supabase-api/cabinet-invitation-service";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CabinetInvitationManagerProps {
  cabinetId: number;
  cabinetName: string;
}

export function CabinetInvitationManager({ cabinetId, cabinetName }: CabinetInvitationManagerProps) {
  const [invitations, setInvitations] = useState<CabinetInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: "",
    notes: ""
  });

  useEffect(() => {
    loadInvitations();
  }, [cabinetId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await cabinetInvitationService.getCabinetInvitations(cabinetId);
      setInvitations(data);
    } catch (error) {
      console.error("Erreur lors du chargement des invitations:", error);
      toast.error("Erreur lors du chargement des invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    try {
      const invitation = await cabinetInvitationService.createInvitation({
        cabinet_id: cabinetId,
        email: newInvitation.email || undefined,
        notes: newInvitation.notes || undefined
      });

      setInvitations([invitation, ...invitations]);
      setCreateDialogOpen(false);
      setNewInvitation({ email: "", notes: "" });
      
      toast.success("Invitation créée avec succès", {
        description: `Code: ${invitation.invitation_code}`
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'invitation:", error);
      toast.error("Erreur lors de la création de l'invitation");
    }
  };

  const handleCopyInvitationLink = (code: string) => {
    const invitationUrl = `${window.location.origin}/register?invitation=${code}`;
    navigator.clipboard.writeText(invitationUrl);
    toast.success("Lien d'invitation copié dans le presse-papiers");
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await cabinetInvitationService.revokeInvitation(invitationId);
      await loadInvitations();
      toast.success("Invitation révoquée");
    } catch (error) {
      console.error("Erreur lors de la révocation:", error);
      toast.error("Erreur lors de la révocation de l'invitation");
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();
  const isUsed = (usedAt?: string) => !!usedAt;

  const getStatusBadge = (invitation: CabinetInvitation) => {
    if (isUsed(invitation.used_at)) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Utilisée</Badge>;
    }
    if (isExpired(invitation.expires_at)) {
      return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Expirée</Badge>;
    }
    return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Active</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement des invitations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Invitations Cabinet</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les invitations pour rejoindre {cabinetName}
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer une invitation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une invitation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email (optionnel)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation({...newInvitation, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes pour cette invitation..."
                  value={newInvitation.notes}
                  onChange={(e) => setNewInvitation({...newInvitation, notes: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateInvitation}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {invitations.length === 0 ? (
        <div className="text-center py-8 bg-muted/50 rounded-lg border-2 border-dashed">
          <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground font-medium">
            Aucune invitation créée
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Créez des invitations pour permettre à d'autres ostéopathes de rejoindre ce cabinet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {invitation.invitation_code}
                      </code>
                      {getStatusBadge(invitation)}
                    </div>
                    
                    {invitation.email && (
                      <p className="text-sm text-muted-foreground mb-1">
                        📧 {invitation.email}
                      </p>
                    )}
                    
                    {invitation.notes && (
                      <p className="text-sm text-muted-foreground mb-1">
                        💬 {invitation.notes}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Expire le {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isUsed(invitation.used_at) && !isExpired(invitation.expires_at) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyInvitationLink(invitation.invitation_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Révoquer l'invitation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir révoquer cette invitation ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground"
                                onClick={() => handleRevokeInvitation(invitation.id)}
                              >
                                Révoquer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
