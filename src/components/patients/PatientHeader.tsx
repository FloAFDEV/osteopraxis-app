
import React from "react";
import { Users, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PatientHeaderProps {
  patientCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onCreateTestPatient: () => void;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({
  patientCount,
  isRefreshing,
  onRefresh,
  onCreateTestPatient
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-400" />
          Patients {patientCount > 0 && 
            <span className="text-lg px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
              {patientCount}
            </span>
          }
        </h1>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button 
            onClick={onRefresh}
            variant="outline" 
            className="w-auto rounded-xl border-blue-200 hover:bg-blue-50"
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-400' : 'text-blue-400'}`} />
            Actualiser
          </Button>
          
          <Button 
            onClick={onCreateTestPatient} 
            variant="outline"
            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 w-auto rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Patient test
          </Button>
          
          <Button asChild className="bg-blue-400 hover:bg-blue-500 w-full md:w-auto rounded-xl">
            <Link to="/patients/new">
              <Users className="mr-2 h-4 w-4" /> Nouveau patient
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;
