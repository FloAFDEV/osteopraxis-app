import { useState } from "react";
import { Invoice, Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ConfirmDeleteInvoiceModal from "./modals/ConfirmDeleteInvoiceModal";
import clsx from "clsx";

interface InvoiceDetailsProps {
  invoice: Invoice;
  patient?: Patient;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const InvoiceDetails = ({
  invoice,
  patient,
  onEdit,
  onDelete,
  onDownload,
  onPrint
}: InvoiceDetailsProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMMM yyyy", {
      locale: fr,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-200/60 text-green-900 dark:bg-green-900/80 dark:text-green-200 border-green-300 dark:border-green-700";
      case "PENDING":
        return "bg-yellow-100/80 text-yellow-900 dark:bg-yellow-900/70 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
      case "CANCELED":
        return "bg-red-100/90 text-red-900 dark:bg-red-900/70 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100/80 text-gray-700 dark:bg-gray-900/60 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Payée";
      case "PENDING":
        return "En attente";
      case "CANCELED":
        return "Annulée";
      default:
        return "Statut inconnu";
    }
  };

  return (
    <>
      <Card className="border shadow px-4 py-4 transition-all duration-300 bg-white dark:bg-gray-800">
        <CardContent className="p-0">
          {/* Header avec numéro de facture + nom du patient */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-lg">
                #{invoice.id.toString().padStart(4, "0")}
              </span>
              {patient && (
                <span
                  className={`inline-flex items-center gap-1 font-medium text-sm ${
                    patient.gender === "Femme"
                      ? "text-pink-600 dark:text-pink-300"
                      : patient.gender === "Homme"
                      ? "text-blue-600 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <span>
                    {patient.gender === "Femme"
                      ? "♀️"
                      : patient.gender === "Homme"
                      ? "♂️"
                      : "⚧️"}
                  </span>
                  <span>{patient.firstName} {patient.lastName}</span>
                </span>
              )}
            </div>
            <div
              className={clsx(
                "px-2.5 py-1 text-xs font-semibold rounded-full border",
                getStatusColor(invoice.paymentStatus)
              )}
            >
              {getStatusText(invoice.paymentStatus)}
            </div>
          </div>

          {/* Infos montant + date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-gray-100 dark:border-gray-700 py-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Montant</div>
              <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {formatCurrency(invoice.amount)}
              </div>
            </div>
            <div className="sm:text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Date de consultation</div>
              <div className="font-medium text-gray-800 dark:text-white">
                {formatDate(invoice.date)}
              </div>
            </div>
          </div>

          {/* Notes éventuelles */}
          {invoice.notes && (
            <div className="text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-3">
              <span className="font-medium text-gray-800 dark:text-white">Notes : </span>
              {invoice.notes}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="space-x-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onEdit}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/60"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800/60"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteInvoiceModal
        isOpen={isDeleteModalOpen}
        invoiceNumber={invoice.id.toString().padStart(4, "0")}
        onCancel={() => setIsDeleteModalOpen(false)}
        onDelete={() => {
          if (onDelete) onDelete();
          setIsDeleteModalOpen(false);
        }}
      />
    </>
  );
};
