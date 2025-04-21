
import { useState } from "react";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Printer, Download, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ConfirmDeleteInvoiceModal from "./modals/ConfirmDeleteInvoiceModal";

// Ajout pour améliorer les styles
import clsx from "clsx";

interface InvoiceDetailsProps {
  invoice: Invoice;
  patientName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const InvoiceDetails = ({
  invoice,
  patientName,
  onEdit,
  onDelete,
  onDownload,
  onPrint
}: InvoiceDetailsProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMMM yyyy", { locale: fr });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "CANCELED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
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
      <Card
        className={clsx(
          "hover-scale border-0 shadow-xl bg-gradient-to-br from-white via-amber-50 to-gray-100 dark:from-gray-700 dark:via-amber-900/30 dark:to-gray-800 transition-all duration-300 animate-fade-in overflow-hidden",
          "relative"
        )}
        style={{
          background:
            "linear-gradient(120deg, #fbf6ed 0%, #f8ecd8 80%, #fdfcfb 100%)"
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center text-lg">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-200 to-amber-400 rounded-full p-2 shadow-md">
                <FileText className="h-8 w-8 text-amber-600" />
              </div>
              <span className="font-bold text-lg tracking-wider text-amber-800 dark:text-amber-400">
                Facture #{invoice.id.toString().padStart(4, "0")}
              </span>
              <span className={clsx(
                "px-2 py-0.5 text-xs rounded-full font-semibold border border-solid border-white/30 shadow",
                getStatusColor(invoice.paymentStatus)
              )}>
                {getStatusText(invoice.paymentStatus)}
              </span>
            </div>
            <span className="font-bold text-2xl text-amber-600 dark:text-amber-400 drop-shadow ml-2">
              {formatCurrency(invoice.amount)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Date :</span>
              <span className="font-semibold">{formatDate(invoice.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Patient :</span>
              <span className="font-semibold">{patientName || `Patient #${invoice.patientId}`}</span>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-dashed border-amber-200 dark:border-amber-700/40">
              <div className="flex space-x-2">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200"
                    onClick={onEdit}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Modifier</span>
                  </Button>
                )}

                {onDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                )}
              </div>

              <div className="flex space-x-2">
                {onPrint && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border border-amber-200"
                    onClick={onPrint}
                  >
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">Imprimer</span>
                  </Button>
                )}

                {onDownload && (
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600"
                    onClick={onDownload}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Télécharger</span>
                  </Button>
                )}
              </div>
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
