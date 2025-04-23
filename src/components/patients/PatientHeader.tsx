
import React from "react";
import { Link } from "react-router-dom";
import { Edit, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatientHeaderProps {
  patientCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onCreateTestPatient: () => void;
}

export function PatientHeader({ 
  patientCount, 
  isRefreshing, 
  onRefresh, 
  onCreateTestPatient 
}: PatientHeaderProps) {
  return (
    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
        <p className="text-muted-foreground">
          {patientCount} patient{patientCount !== 1 ? "s" : ""} enregistré{patientCount !== 1 ? "s" : ""}
        </p>
      </div>
      
      <div className="flex gap-2 items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
          Actualiser
        </Button>
        
        <Button variant="outline" size="sm" onClick={onCreateTestPatient}>
          <Plus className="mr-2 h-4 w-4" />
          Patient test
        </Button>

        <Button asChild>
          <Link to="/patients/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau patient
          </Link>
        </Button>
      </div>
    </div>
  );
}
