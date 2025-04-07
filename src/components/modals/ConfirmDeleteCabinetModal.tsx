
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfirmDeleteCabinetModalProps {
  onDelete: () => void;
  onCancel: () => void;
  cabinetName: string | undefined;
  isOpen: boolean;
}

const ConfirmDeleteCabinetModal: React.FC<ConfirmDeleteCabinetModalProps> = ({
  onCancel,
  onDelete,
  cabinetName,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8">
      <Card className="w-full sm:w-4/5 md:w-2/3 lg:w-1/2 xl:w-2/5 max-w-4xl border-4 border-red-600 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
            Suppression Définitive du Cabinet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-bold text-lg sm:text-xl">
              Attention:
            </span>{" "}
            Cette action est{" "}
            <span className="font-semibold text-red-600 dark:text-red-400 text-lg sm:text-xl">
              irréversible
            </span>{" "}
            et entraînera la{" "}
            <span className="font-semibold text-lg sm:text-xl">
              perte permanente
            </span>{" "}
            de toutes les données associées au cabinet.
          </p>
          <p className="font-extrabold text-xl text-amber-500 dark:text-amber-400 mt-4 text-center">
            {cabinetName || "Cabinet"}
          </p>
          <p className="mt-4 text-center font-medium">
            Êtes-vous sûr de vouloir continuer ?
          </p>
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

export default ConfirmDeleteCabinetModal;
