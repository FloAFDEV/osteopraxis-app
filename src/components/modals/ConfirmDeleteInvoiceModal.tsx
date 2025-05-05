
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ConfirmDeleteInvoiceModalProps {
  onDelete: () => void;
  onCancel: () => void;
  invoiceNumber: string;
  isOpen: boolean;
}

const ConfirmDeleteInvoiceModal: React.FC<ConfirmDeleteInvoiceModalProps> = ({
  onCancel,
  onDelete,
  invoiceNumber,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-6 md:p-8">
      <Card className="w-full sm:w-4/5 md:w-2/3 lg:w-1/2 max-w-2xl border-4 border-red-600 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-red-600" />
            Suppression de Facture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
            Attention : cette action est{" "}
            <span className="font-semibold text-red-600 dark:text-red-400 text-lg sm:text-xl">
              irréversible
            </span>{" "}
            et entraînera la suppression définitive de cette facture.
          </p>
          <div className="font-extrabold text-xl sm:text-2xl text-amber-500 dark:text-amber-400 mt-2 mb-2 text-center">
            Facture #{invoiceNumber}
          </div>
          <p className="font-bold text-center mb-4">
            Êtes-vous sûr de vouloir supprimer cette facture de manière définitive ?
          </p>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Remarque importante : </span>
            La suppression de factures peut entraîner des problèmes de comptabilité et n'est généralement pas recommandée.
          </div>
          <ul className="list-disc pl-6 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <li>
              Les factures doivent être conservées pendant <strong>10 ans</strong> pour des raisons fiscales et comptables.
            </li>
            <li>
              Pensez plutôt à marquer la facture comme <strong>annulée</strong> au lieu de la supprimer définitivement.
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

export default ConfirmDeleteInvoiceModal;
