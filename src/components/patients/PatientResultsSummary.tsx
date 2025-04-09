
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
    <Card className="w-full mb-6 overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl border-blue-200 dark:border-blue-700/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between p-2 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-800/30 p-3 rounded-xl shadow-sm">
              <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">
                {patientCount} patient{patientCount > 1 ? 's' : ''} trouvé{patientCount > 1 ? 's' : ''}
                {totalPages > 1 && ` (Page ${currentPage}/${totalPages})`}
              </h3>
              <p className="text-blue-500/70 dark:text-blue-400/70">
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
