import React from "react";
import { useNavigate } from "react-router-dom";
import { PatientRelationship } from "@/types/patient-relationship";
import { InfoBubble } from "./InfoBubble";
import { Users, ExternalLink } from "lucide-react";
import { differenceInYears } from "date-fns";

interface PatientRelationshipsProps {
  relationships: PatientRelationship[];
  loading?: boolean;
  currentPatientId: number;
  currentPatientGender?: string | null;
}

export function PatientRelationships({ relationships, loading, currentPatientId, currentPatientGender }: PatientRelationshipsProps) {
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded mb-2"></div>
        <div className="h-3 bg-muted rounded"></div>
      </div>
    );
  }

  if (relationships.length === 0) {
    return null;
  }

  const getAge = (birthDate?: string | null) => {
    if (!birthDate) return null;
    return differenceInYears(new Date(), new Date(birthDate));
  };

  // Fonction pour obtenir la relation inverse selon le genre
  const getInverseRelationship = (originalRelation: string, targetGender?: string | null) => {
    const gender = targetGender?.toLowerCase();
    const isMale = gender === "homme" || gender === "male";
    const isFemale = gender === "femme" || gender === "female";

    switch (originalRelation.toLowerCase()) {
      case "père":
        return isMale ? "Fils" : isFemale ? "Fille" : "Enfant";
      case "mère":
        return isMale ? "Fils" : isFemale ? "Fille" : "Enfant";
      case "fils":
        return isMale ? "Père" : isFemale ? "Mère" : "Parent";
      case "fille":
        return isMale ? "Père" : isFemale ? "Mère" : "Parent";
      case "frère":
        return isMale ? "Frère" : isFemale ? "Sœur" : "Frère/Sœur";
      case "sœur":
        return isMale ? "Frère" : isFemale ? "Sœur" : "Frère/Sœur";
      case "grand-père":
        return isMale ? "Petit-fils" : isFemale ? "Petite-fille" : "Petit-enfant";
      case "grand-mère":
        return isMale ? "Petit-fils" : isFemale ? "Petite-fille" : "Petit-enfant";
      case "petit-fils":
        return isMale ? "Grand-père" : isFemale ? "Grand-mère" : "Grand-parent";
      case "petite-fille":
        return isMale ? "Grand-père" : isFemale ? "Grand-mère" : "Grand-parent";
      case "oncle":
        return isMale ? "Neveu" : isFemale ? "Nièce" : "Neveu/Nièce";
      case "tante":
        return isMale ? "Neveu" : isFemale ? "Nièce" : "Neveu/Nièce";
      case "neveu":
        return isMale ? "Oncle" : isFemale ? "Tante" : "Oncle/Tante";
      case "nièce":
        return isMale ? "Oncle" : isFemale ? "Tante" : "Oncle/Tante";
      case "cousin":
        return isMale ? "Cousin" : isFemale ? "Cousine" : "Cousin(e)";
      case "cousine":
        return isMale ? "Cousin" : isFemale ? "Cousine" : "Cousin(e)";
      case "conjoint(e)":
      case "conjoint":
      case "conjointe":
        return "Conjoint(e)";
      default:
        return originalRelation;
    }
  };

  const handlePatientClick = (patientId: number) => {
    navigate(`/patients/${patientId}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Users className="h-4 w-4" />
        <span>Famille</span>
      </div>
      
      <div className="space-y-1.5">
        {relationships.map((relationship) => {
          const age = getAge(relationship.related_patient?.birthDate);
          const displayText = `${relationship.related_patient?.firstName} ${relationship.related_patient?.lastName}${age ? ` (${age} ans)` : ""}`;
          const fullValue = relationship.relationship_notes 
            ? `${displayText} - ${relationship.relationship_notes}`
            : displayText;
          
          // Déterminer si c'est une relation directe ou inverse
          const isDirectRelation = relationship.patient_id === currentPatientId;
          
          let displayedRelation: string;
          if (isDirectRelation) {
            // Relation directe : on affiche la relation telle qu'elle est stockée
            displayedRelation = relationship.relationship_type;
          } else {
            // Relation inverse : on affiche la relation inverse selon le genre du patient lié
            displayedRelation = getInverseRelationship(relationship.relationship_type, relationship.related_patient?.gender);
          }
          
          return (
            <InfoBubble
              key={relationship.id}
              icon={ExternalLink}
              label={displayedRelation}
              value={fullValue}
              variant="default"
              size="sm"
              showTooltip={true}
              onClick={() => handlePatientClick(relationship.related_patient_id)}
            />
          );
        })}
      </div>
    </div>
  );
}