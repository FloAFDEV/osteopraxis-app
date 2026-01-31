import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PatientCombobox } from "../patients/PatientCombobox";
import { PatientFormValues } from "./types";
import { PatientRelationship, RELATIONSHIP_TYPES, CreatePatientRelationshipPayload } from "@/types/patient-relationship";
import { Patient } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Trash2, Plus, Lightbulb } from "lucide-react";

interface PatientRelationshipsTabProps {
  form: UseFormReturn<PatientFormValues>;
  patientId?: number; // Pour les patients existants
  availablePatients: Patient[];
}

export function PatientRelationshipsTab({ form, patientId, availablePatients }: PatientRelationshipsTabProps) {
  const [relationships, setRelationships] = useState<PatientRelationship[]>([]);
  const [newRelationship, setNewRelationship] = useState<{
    related_patient_id: number | null;
    relationship_type: string;
    relationship_notes: string;
  }>({
    related_patient_id: null,
    relationship_type: "",
    relationship_notes: ""
  });
  const [loading, setLoading] = useState(false);

  // Charger les relations existantes pour un patient existant
  useEffect(() => {
    if (patientId) {
      loadPatientRelationships();
    }
  }, [patientId]);

  const loadPatientRelationships = async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      const data = await api.getPatientRelationships(patientId);
      setRelationships(data);
    } catch (error) {
      console.error("Erreur lors du chargement des relations:", error);
      toast.error("Erreur lors du chargement des relations familiales");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelationship = async () => {
    if (!newRelationship.related_patient_id || !newRelationship.relationship_type) {
      toast.error("Veuillez sélectionner un patient et un type de relation");
      return;
    }

    if (!patientId) {
      toast.error("Veuillez d'abord enregistrer le patient avant d'ajouter des relations");
      return;
    }

    try {
      setLoading(true);
      const payload: CreatePatientRelationshipPayload = {
        patient_id: patientId,
        related_patient_id: newRelationship.related_patient_id,
        relationship_type: newRelationship.relationship_type,
        relationship_notes: newRelationship.relationship_notes || null
      };

      const newRel = await api.createPatientRelationship(payload);
      setRelationships(prev => [...prev, newRel]);
      
      // Réinitialiser le formulaire
      setNewRelationship({
        related_patient_id: null,
        relationship_type: "",
        relationship_notes: ""
      });

      toast.success("Relation familiale ajoutée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la relation:", error);
      toast.error("Erreur lors de l'ajout de la relation familiale");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRelationship = async (relationshipId: number) => {
    try {
      setLoading(true);
      await api.deletePatientRelationship(relationshipId);
      setRelationships(prev => prev.filter(rel => rel.id !== relationshipId));
      toast.success("Relation familiale supprimée");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de la relation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Relations existantes */}
      {relationships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Relations familiales existantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relationships.map((relationship) => (
                <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {relationship.related_patient?.firstName} {relationship.related_patient?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {relationship.relationship_type}
                      {relationship.related_patient?.birthDate && (
                        <span className="ml-2">
                          (né(e) le {new Date(relationship.related_patient.birthDate).toLocaleDateString('fr-FR')})
                        </span>
                      )}
                    </div>
                    {relationship.relationship_notes && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {relationship.relationship_notes}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRelationship(relationship.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ajouter une nouvelle relation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter une relation familiale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient lié</Label>
              <PatientCombobox
                patients={availablePatients.filter(p => p.id !== patientId)}
                value={newRelationship.related_patient_id}
                onChange={(id) => setNewRelationship(prev => ({...prev, related_patient_id: id}))}
                placeholder="Sélectionner un patient"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship_type">Type de relation</Label>
              <select
                id="relationship_type"
                value={newRelationship.relationship_type}
                onChange={(e) => setNewRelationship(prev => ({...prev, relationship_type: e.target.value}))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Sélectionnez le lien</option>
                {RELATIONSHIP_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship_notes">Notes (optionnel)</Label>
            <Textarea
              id="relationship_notes"
              value={newRelationship.relationship_notes}
              onChange={(e) => setNewRelationship(prev => ({...prev, relationship_notes: e.target.value}))}
              placeholder="Précisions sur la relation..."
            />
          </div>

          <Button 
            onClick={handleAddRelationship}
            disabled={loading || !newRelationship.related_patient_id || !newRelationship.relationship_type}
            className="w-full"
          >
            {loading ? "Ajout en cours..." : "Ajouter la relation"}
          </Button>
        </CardContent>
      </Card>

      {!patientId && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4 flex-shrink-0" /> Les relations familiales seront disponibles après l'enregistrement du patient.
          </p>
        </div>
      )}
    </div>
  );
}