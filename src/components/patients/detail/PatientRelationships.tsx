import React from "react";
import { PatientRelationship } from "@/types/patient-relationship";
import { InfoBubble } from "./InfoBubble";
import { Users, Calendar } from "lucide-react";
import { differenceInYears } from "date-fns";

interface PatientRelationshipsProps {
  relationships: PatientRelationship[];
  loading?: boolean;
}

export function PatientRelationships({ relationships, loading }: PatientRelationshipsProps) {
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
          
          return (
            <InfoBubble
              key={relationship.id}
              icon={Calendar}
              label={relationship.relationship_type}
              value={fullValue}
              variant="default"
              size="sm"
              showTooltip={true}
            />
          );
        })}
      </div>
    </div>
  );
}