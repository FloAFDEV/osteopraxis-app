
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
    <Card className="w-full mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">
                {patientCount} patient{patientCount > 1 ? 's' : ''} trouvé{patientCount > 1 ? 's' : ''}
                {totalPages > 1 && ` (Page ${currentPage}/${totalPages})`}
              </h3>
              <p className="text-blue-600/70 dark:text-blue-400/70">
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
