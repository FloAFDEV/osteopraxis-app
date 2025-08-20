
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-6 md:p-8">
<Card className="w-full sm:w-4/5 md:w-2/3 lg:w-1/2 max-w-2xl h-auto max-h-[90vh] overflow-y-auto border-4 border-red-600 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">
            Suppression des Données Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
            Attention : cette action est{" "}
            <span className="font-semibold text-red-600 dark:text-red-400 text-lg sm:text-xl">
              irréversible
            </span>{" "}
            et entraînera la perte permanente de toutes les données associées à ce patient.
          </p>
          <div className="font-extrabold text-xl sm:text-2xl text-amber-500 dark:text-amber-400 mt-2 mb-2 text-center">
            {patientName}
          </div>
          <p className="font-bold text-center mb-4">
            Êtes-vous sûr de vouloir supprimer ce patient de manière définitive ?
          </p>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Remarque : </span>certaines données peuvent être
            nécessaires pour des raisons légales, médicales ou administratives.
          </div>
          <ul className="list-disc pl-6 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <li>
              Les dossiers médicaux doivent être conservés pendant <strong>20 ans</strong> après le dernier contact avec le patient.
            </li>
            <li>
              Le <strong>Règlement Général sur la Protection des Données (RGPD)</strong> permet
              la conservation des données médicales pour des raisons de santé publique.
            </li>
          </ul>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800 rounded-b-lg flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="w-full sm:w-auto"
          >
            Supprimer définitivement
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmDeletePatientModal;
