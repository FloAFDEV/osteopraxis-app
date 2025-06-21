
import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";
import { usePatientOwnership } from "@/hooks/usePatientOwnership";

interface PatientOwnershipBadgeProps {
  patientId: number;
  variant?: "default" | "outline";
  size?: "sm" | "default";
}

export const PatientOwnershipBadge: React.FC<PatientOwnershipBadgeProps> = ({ 
  patientId, 
  variant = "outline",
  size = "sm"
}) => {
  const { isOwnPatient, isCabinetPatient, loading } = usePatientOwnership(patientId);

  if (loading) {
    return null;
  }

  if (isOwnPatient) {
    return (
      <Badge 
        variant={variant}
        className="text-xs bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
      >
        <User className="w-3 h-3 mr-1" />
        Mon patient
      </Badge>
    );
  }

  if (isCabinetPatient) {
    return (
      <Badge 
        variant={variant}
        className="text-xs bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
      >
        <Users className="w-3 h-3 mr-1" />
        Patient du cabinet
      </Badge>
    );
  }

  return null;
};
