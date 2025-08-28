import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Users } from "lucide-react";
import { RELATIONSHIP_TYPES, type RelationshipType } from "@/types/patient-relationship";
import { toast } from "sonner";

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  relationshipType: RelationshipType | "";
  notes?: string;
  existingPatientId?: number;
}

interface FamilyRelationshipsSectionProps {
  availablePatients?: Array<{ id: number; firstName: string; lastName: string; }>;
  onRelationshipsChange?: (relationships: FamilyMember[]) => void;
  initialRelationships?: FamilyMember[];
}

export const FamilyRelationshipsSection = ({ 
  availablePatients = [], 
  onRelationshipsChange,
  initialRelationships = []
}: FamilyRelationshipsSectionProps) => {
  const [relationships, setRelationships] = useState<FamilyMember[]>(initialRelationships);
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    firstName: "",
    lastName: "",
    relationshipType: "",
    notes: ""
  });
  

  const handleAddRelationship = () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.relationshipType) {
      toast.error("Veuillez remplir le prénom, nom et type de relation.");
      return;
    }

    const relationship: FamilyMember = {
      id: crypto.randomUUID(),
      firstName: newMember.firstName!,
      lastName: newMember.lastName!,
      relationshipType: newMember.relationshipType as RelationshipType,
      notes: newMember.notes || "",
      existingPatientId: newMember.existingPatientId
    };

    const updatedRelationships = [...relationships, relationship];
    setRelationships(updatedRelationships);
    onRelationshipsChange?.(updatedRelationships);

    // Reset form
    setNewMember({
      firstName: "",
      lastName: "",
      relationshipType: "",
      notes: ""
    });

    toast.success(`${relationship.firstName} ${relationship.lastName} ajouté(e) comme ${relationship.relationshipType.toLowerCase()}.`);
  };

  const handleRemoveRelationship = (id: string) => {
    const updatedRelationships = relationships.filter(rel => rel.id !== id);
    setRelationships(updatedRelationships);
    onRelationshipsChange?.(updatedRelationships);
  };

  const handleLinkExistingPatient = (patientId: number) => {
    const patient = availablePatients.find(p => p.id === patientId);
    if (patient) {
      setNewMember({
        ...newMember,
        firstName: patient.firstName,
        lastName: patient.lastName,
        existingPatientId: patient.id
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Relations familiales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Liste des relations existantes */}
        {relationships.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Membres de la famille ajoutés</h4>
            {relationships.map((relationship) => (
              <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{relationship.firstName} {relationship.lastName}</span>
                    <Badge variant="secondary">{relationship.relationshipType}</Badge>
                    {relationship.existingPatientId && (
                      <Badge variant="outline">Patient existant</Badge>
                    )}
                  </div>
                  {relationship.notes && (
                    <p className="text-sm text-muted-foreground">{relationship.notes}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveRelationship(relationship.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire d'ajout */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium">Ajouter un membre de la famille</h4>
          
          {/* Lier un patient existant */}
          {availablePatients.length > 0 && (
            <div className="space-y-2">
              <Label>Ou sélectionner un patient existant</Label>
              <Select onValueChange={(value) => handleLinkExistingPatient(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un patient existant..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input
                placeholder="Prénom du membre de la famille"
                value={newMember.firstName || ""}
                onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                placeholder="Nom du membre de la famille"
                value={newMember.lastName || ""}
                onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type de relation</Label>
            <Select 
              value={newMember.relationshipType} 
              onValueChange={(value) => setNewMember({ ...newMember, relationshipType: value as RelationshipType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le lien de parenté..." />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              placeholder="Informations complémentaires sur la relation..."
              value={newMember.notes || ""}
              onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
              rows={2}
            />
          </div>

          <Button onClick={handleAddRelationship} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter cette relation familiale
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};