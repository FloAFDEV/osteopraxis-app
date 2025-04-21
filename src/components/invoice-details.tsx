
import { useState } from "react";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Printer, Download, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ConfirmDeleteInvoiceModal from "./modals/ConfirmDeleteInvoiceModal";
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
    return format(new Date(date), "dd MMMM yyyy", {
      locale: fr
    });
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
  return <>
     <Card
  className={clsx(
    "hover-scale border shadow px-4 pb-4 pt-5 transition-all duration-300 relative overflow-hidden min-h-[165px]",
    // Fond léger bleu‑gris
    "bg-gradient-to-br from-white via-blue-50 to-blue-100",
    // Mode sombre
    "dark:from-gray-800 dark:via-gray-700 dark:to-gray-900",
    // Bordure nette grise
    "border border-gray-200 dark:border-gray-700"
  )}
  style={{
    // Ombre discrète gris‑bleu
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(59, 130, 246, 0.08)"
  }}
>
  {/* Barre d'accent en haut */}
  <div
    className="absolute top-0 left-0 w-full h-1
               bg-gradient-to-r from-blue-400 to-blue-600
               rounded-t"
  />

  <CardHeader className="pb-2">
    <CardTitle className="flex justify-between items-center gap-3 text-lg">
      <div className="flex items-center gap-2">
        <div
          className="rounded-full p-2 bg-blue-100 dark:bg-blue-900
                     border border-blue-200 dark:border-blue-700 shadow-sm"
        >
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-300" />
        </div>
        <span className="font-bold text-xl text-blue-700 dark:text-blue-300">
          #{invoice.id.toString().padStart(4, "0")}
        </span>
        <span
          className={clsx(
            "px-2 py-0.5 text-xs font-semibold rounded-full border",
            invoice.paymentStatus === "PAID"
              ? "bg-green-100 border-green-200 text-green-700"
              : invoice.paymentStatus === "PENDING"
              ? "bg-yellow-100 border-yellow-200 text-yellow-700"
              : "bg-red-100 border-red-200 text-red-700"
          )}
        >
          {getStatusText(invoice.paymentStatus)}
        </span>
      </div>
      <span className="font-extrabold text-2xl bg-clip-text text-transparent
                       bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
        {formatCurrency(invoice.amount)}
      </span>
    </CardTitle>
  </CardHeader>

  <CardContent className="pt-2">
    <div className="text-sm space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-400 font-medium">Date :</span>
        <span className="font-medium dark:text-gray-200">{formatDate(invoice.date)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-400 font-medium">Patient :</span>
        <span className="font-medium text-blue-600 dark:text-blue-300">{patientName}</span>
      </div>
      <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between">
        <div className="flex space-x-2">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 hover:text-blue-800 border-blue-200 dark:border-blue-700
                        dark:text-blue-400 dark:hover:text-blue-300 shadow-sm transition"
              onClick={onEdit}
              aria-label="Modifier la facture"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Modifier</span>
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-800 border-red-200 dark:border-red-700
                         dark:text-red-400 dark:hover:text-red-300 shadow-sm transition"
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label="Supprimer la facture"
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
              className="border border-blue-200 dark:border-blue-700 text-blue-600
                         dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-800 transition"
              onClick={onPrint}
              aria-label="Imprimer"
            >
              <Printer className="h-4 w-4" />
              <span className="sr-only">Imprimer</span>
            </Button>
          )}
          {onDownload && (
            <Button
              size="sm"
              variant="solid"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
              onClick={onDownload}
              aria-label="Télécharger"
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

      <ConfirmDeleteInvoiceModal isOpen={isDeleteModalOpen} invoiceNumber={invoice.id.toString().padStart(4, "0")} onCancel={() => setIsDeleteModalOpen(false)} onDelete={() => {
      if (onDelete) onDelete();
      setIsDeleteModalOpen(false);
    }} />
    </>;
};
