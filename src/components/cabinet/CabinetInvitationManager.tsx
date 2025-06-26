
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Copy, Trash2, Mail, Clock, Check, X, Info, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { CabinetInvitation, cabinetInvitationService } from "@/services/supabase-api/cabinet-invitation-service";
import { HelpButton } from "@/components/ui/help-button";
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
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

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
        description: `Code: ${invitation.invitation_code} - Valide 7 jours`
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'invitation:", error);
      toast.error("Erreur lors de la création de l'invitation");
    }
  };

  const handleCopyInvitationLink = (code: string) => {
    const invitationUrl = `${window.location.origin}/register?invitation=${code}`;
    navigator.clipboard.writeText(invitationUrl);
    toast.success("Lien d'invitation copié", {
      description: "Partagez ce lien avec l'ostéopathe à inviter"
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code d'invitation copié", {
      description: "L'ostéopathe peut utiliser ce code lors de son inscription"
    });
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await cabinetInvitationService.revokeInvitation(invitationId);
      await loadInvitations();
      toast.success("Invitation révoquée", {
        description: "Le code d'invitation n'est plus valide"
      });
    } catch (error) {
      console.error("Erreur lors de la révocation:", error);
      toast.error("Erreur lors de la révocation de l'invitation");
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();
  const isUsed = (usedAt?: string) => !!usedAt;

  const getStatusBadge = (invitation: CabinetInvitation) => {
    if (isUsed(invitation.used_at)) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"><Check className="w-3 h-3 mr-1" />Utilisée</Badge>;
    }
    if (isExpired(invitation.expires_at)) {
      return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Expirée</Badge>;
    }
    return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"><Clock className="w-3 h-3 mr-1" />Active</Badge>;
  };

  // Statistiques des invitations
  const activeInvitations = invitations.filter(inv => !isUsed(inv.used_at) && !isExpired(inv.expires_at)).length;
  const usedInvitations = invitations.filter(inv => isUsed(inv.used_at)).length;
  const expiredInvitations = invitations.filter(inv => isExpired(inv.expires_at) && !isUsed(inv.used_at)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement des invitations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Invitations Cabinet</h3>
            <HelpButton 
              content="Système d'invitations sécurisé pour votre cabinet SaaS. Générez des codes uniques, temporaires et traçables pour inviter des ostéopathes de confiance à rejoindre votre équipe."
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Gérez les invitations pour rejoindre <strong>{cabinetName}</strong>
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Créer une invitation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Créer une invitation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  <strong>Sécurisé :</strong> Code unique, valide 7 jours, usage unique, traçable
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  Email (optionnel)
                  <HelpButton 
                    content="Ajoutez l'email pour faciliter le suivi. L'ostéopathe devra utiliser le code lors de son inscription."
                    size="sm"
                  />
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation({...newInvitation, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="notes" className="flex items-center gap-2">
                  Notes (optionnel)
                  <HelpButton 
                    content="Notes privées pour votre organisation interne. Non visibles par l'invité."
                    size="sm"
                  />
                </Label>
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

      {/* Statistiques */}
      {invitations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Actives</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeInvitations}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">Utilisées</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{usedInvitations}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">Expirées</span>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{expiredInvitations}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {invitations.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg border-2 border-dashed">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium mb-2">Aucune invitation créée</h4>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Créez des invitations sécurisées pour permettre à d'autres ostéopathes de rejoindre votre cabinet. 
            Parfait pour construire une équipe de confiance.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Créer ma première invitation
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-3 py-1 rounded text-sm font-mono font-bold">
                          {invitation.invitation_code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyCode(invitation.invitation_code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {getStatusBadge(invitation)}
                    </div>
                    
                    {invitation.email && (
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {invitation.email}
                      </p>
                    )}
                    
                    {invitation.notes && (
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Info className="h-3 w-3" /> {invitation.notes}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Expire le {new Date(invitation.expires_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    
                    {invitation.used_at && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Utilisée le {new Date(invitation.used_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isUsed(invitation.used_at) && !isExpired(invitation.expires_at) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyInvitationLink(invitation.invitation_code)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Lien
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Révoquer l'invitation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir révoquer cette invitation ? Le code ne sera plus valide et cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
