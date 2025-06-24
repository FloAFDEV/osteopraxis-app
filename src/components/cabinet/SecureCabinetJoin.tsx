
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Shield, Info } from "lucide-react";
import { toast } from "sonner";
import { cabinetInvitationService } from "@/services/supabase-api/cabinet-invitation-service";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SecureCabinetJoinProps {
  onSuccess?: () => void;
}

export function SecureCabinetJoin({ onSuccess }: SecureCabinetJoinProps) {
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationInfo, setValidationInfo] = useState<{valid: boolean, cabinet_name?: string} | null>(null);

  const handleValidateCode = async () => {
    if (!invitationCode.trim()) {
      toast.error("Veuillez saisir un code d'invitation");
      return;
    }

    try {
      setLoading(true);
      const result = await cabinetInvitationService.validateInvitationCode(invitationCode.trim().toUpperCase());
      setValidationInfo(result);
      
      if (!result.valid) {
        toast.error("Code d'invitation invalide ou expiré");
      }
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      toast.error("Erreur lors de la validation du code");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCabinet = async () => {
    try {
      setLoading(true);
      const result = await cabinetInvitationService.useInvitation(invitationCode.trim().toUpperCase());
      
      if (result.success) {
        toast.success("Association au cabinet réussie !", {
          description: "Vous êtes maintenant associé au cabinet."
        });
        setInvitationCode("");
        setValidationInfo(null);
        onSuccess?.();
      } else {
        toast.error(result.error || "Erreur lors de l'association");
      }
    } catch (error) {
      console.error("Erreur lors de l'association:", error);
      toast.error("Erreur lors de l'association au cabinet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Rejoindre un cabinet avec invitation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Pour des raisons de sécurité, vous ne pouvez rejoindre un cabinet qu'avec un code d'invitation valide 
            fourni par le propriétaire du cabinet.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="invitation-code">Code d'invitation</Label>
          <div className="flex gap-2">
            <Input
              id="invitation-code"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
              placeholder="Ex: ABC12345"
              className="font-mono"
              maxLength={8}
            />
            <Button 
              variant="outline" 
              onClick={handleValidateCode}
              disabled={loading || !invitationCode.trim()}
            >
              Vérifier
            </Button>
          </div>
        </div>

        {validationInfo && (
          <div className="mt-4">
            {validationInfo.valid ? (
              <Alert className="bg-green-50 border-green-200">
                <Building className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Code valide !</strong><br />
                  Cabinet : {validationInfo.cabinet_name}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  Code d'invitation invalide ou expiré
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {validationInfo?.valid && (
          <Button 
            onClick={handleJoinCabinet}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Association en cours..." : "Rejoindre ce cabinet"}
          </Button>
        )}

        <div className="text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded">
          <strong>Comment obtenir un code d'invitation ?</strong><br />
          Demandez au propriétaire du cabinet de vous envoyer un code d'invitation. 
          Il peut le générer depuis sa page de gestion des collaborations.
        </div>
      </CardContent>
    </Card>
  );
}
