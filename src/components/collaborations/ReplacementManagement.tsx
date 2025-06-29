
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserCheck, Calendar, Trash2, Plus } from "lucide-react";

export function ReplacementManagement() {
  const [replacements, setReplacements] = useState([]);
  const [newReplacement, setNewReplacement] = useState({
    email: "",
    startDate: "",
    endDate: "",
    notes: ""
  });

  const handleAddReplacement = async () => {
    if (!newReplacement.email || !newReplacement.startDate) {
      toast.error("Email et date de début sont requis");
      return;
    }

    try {
      // Simulated API call
      const replacement = {
        id: Date.now(),
        ...newReplacement,
        status: "active"
      };
      
      setReplacements(prev => [...prev, replacement]);
      setNewReplacement({ email: "", startDate: "", endDate: "", notes: "" });
      toast.success("Remplacement ajouté avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'ajout du remplacement");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouveau remplacement
          </CardTitle>
          <CardDescription>
            Ajoutez un ostéopathe remplaçant pour une période donnée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email du remplaçant *</Label>
              <Input
                id="email"
                type="email"
                value={newReplacement.email}
                onChange={(e) => setNewReplacement(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemple.com"
              />
            </div>

            <div>
              <Label htmlFor="startDate">Date de début *</Label>
              <Input
                id="startDate"
                type="date"
                value={newReplacement.startDate}
                onChange={(e) => setNewReplacement(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={newReplacement.endDate}
                onChange={(e) => setNewReplacement(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={newReplacement.notes}
                onChange={(e) => setNewReplacement(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes optionnelles"
              />
            </div>
          </div>

          <Button onClick={handleAddReplacement} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter le remplacement
          </Button>
        </CardContent>
      </Card>

      {replacements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Remplacements actifs</CardTitle>
            <CardDescription>
              Liste de vos remplacements configurés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {replacements.map((replacement) => (
                <div key={replacement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">{replacement.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Du {replacement.startDate} {replacement.endDate && `au ${replacement.endDate}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{replacement.status}</Badge>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
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
