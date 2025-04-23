
import React from "react";
import { Link } from "react-router-dom";
import { Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types";

interface PatientHeaderProps {
  patient: Patient;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/patients">Retour</Link>
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link to={`/patients/${patient.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
        <Button asChild>
          <Link to={`/appointments/new?patientId=${patient.id}`}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rendez-vous
          </Link>
        </Button>
      </div>
    </div>
  );
}
