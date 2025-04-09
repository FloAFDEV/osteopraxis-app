
import React from "react";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PatientResultsSummaryProps {
  patientCount: number;
  currentPage: number;
  totalPages: number;
}

const PatientResultsSummary: React.FC<PatientResultsSummaryProps> = ({
  patientCount,
  currentPage,
  totalPages
}) => {
  return (
    <Card className="w-full mb-6 overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-700 p-3 rounded-full shadow-sm">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-600 dark:text-blue-300">
                {patientCount} patient{patientCount > 1 ? 's' : ''} trouvé{patientCount > 1 ? 's' : ''}
                {totalPages > 1 && ` (Page ${currentPage}/${totalPages})`}
              </h3>
              <p className="text-blue-400/70 dark:text-blue-300/70">
                Consultez et gérez vos dossiers patients
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientResultsSummary;
