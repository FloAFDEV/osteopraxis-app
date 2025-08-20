
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfirmDeletePatientModalProps {
  onDelete: () => void;
  onCancel: () => void;
  patientName: string;
  isOpen: boolean;
}

const ConfirmDeletePatientModal: React.FC<ConfirmDeletePatientModalProps> = ({
  onCancel,
  onDelete,
  patientName,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-2 border-red-600 dark:border-red-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
            Supprimer le patient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="font-semibold text-lg text-amber-600 dark:text-amber-400 mb-2">
              {patientName}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Cette action est <span className="font-semibold text-red-600 dark:text-red-400">irréversible</span> et supprimera définitivement toutes les données du patient.
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <p className="font-medium mb-1">⚠️ Rappel légal :</p>
            <p>Les dossiers médicaux doivent être conservés 20 ans (RGPD).</p>
          </div>
        </CardContent>
        <CardFooter className="pt-3 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            size="sm"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            size="sm"
          >
            Supprimer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmDeletePatientModal;
