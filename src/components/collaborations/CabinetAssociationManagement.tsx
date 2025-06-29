
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building, Plus, ExternalLink } from "lucide-react";

export function CabinetAssociationManagement() {
  const [invitationCode, setInvitationCode] = useState("");
  const [associations, setAssociations] = useState([]);

  const handleJoinCabinet = async () => {
    if (!invitationCode.trim()) {
      toast.error("Code d'invitation requis");
      return;
    }

    try {
      // Simulated API call
      const association = {
        id: Date.now(),
        cabinetName: "Cabinet d'exemple",
        role: "member",
        joinedAt: new Date().toLocaleDateString()
      };
      
      setAssociations(prev => [...prev, association]);
      setInvitationCode("");
      toast.success("Association réussie au cabinet");
    } catch (error) {
      toast.error("Code d'invitation invalide ou expiré");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Rejoindre un cabinet
          </CardTitle>
          <CardDescription>
            Utilisez le code d'invitation fourni par un cabinet pour vous y associer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="invitationCode">Code d'invitation</Label>
            <Input
              id="invitationCode"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              placeholder="Saisissez le code d'invitation"
            />
          </div>

          <Button onClick={handleJoinCabinet} className="w-full">
            <Building className="h-4 w-4 mr-2" />
            Rejoindre le cabinet
          </Button>
        </CardContent>
      </Card>

      {associations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mes associations</CardTitle>
            <CardDescription>
              Cabinets auxquels vous êtes associé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {associations.map((association) => (
                <div key={association.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{association.cabinetName}</div>
                      <div className="text-sm text-muted-foreground">
                        Rejoint le {association.joinedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{association.role}</Badge>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
