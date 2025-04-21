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
 return (
  <>
    <Card
      className={clsx(
        // Responsive width: full on mobile, fixed on larger
        "w-full sm:w-80 lg:w-96",
        // Layout & spacing
        "flex flex-col justify-between p-6 space-y-4",
        // Background & borders
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        // Shadow & hover
        "shadow-md hover:shadow-lg transition-shadow duration-200",
        // Rounded corners
        "rounded-lg relative overflow-hidden"
      )}
    >
      {/* Accent bar */}
      <div
        className={clsx(
          "absolute top-0 left-0 w-full h-1",
          "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600",
          "dark:from-blue-600 dark:via-blue-500 dark:to-blue-700"
        )}
      />

      <CardHeader className="p-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
              #{invoice.id.toString().padStart(4, "0")}
            </span>
          </div>
          <span
            className={clsx(
              "px-2 py-1 text-xs font-semibold rounded-full",
              invoice.paymentStatus === "PAID"
                ? "bg-green-100 text-green-800"
                : invoice.paymentStatus === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            )}
          >
            {getStatusText(invoice.paymentStatus)}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Date :</span>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {formatDate(invoice.date)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Patient :</span>
          <span className="font-medium text-blue-600 dark:text-blue-300">
            {patientName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Montant :</span>
          <span className="font-semibold text-xl text-blue-700 dark:text-blue-400">
            {formatCurrency(invoice.amount)}
          </span>
        </div>
      </CardContent>

      <div className="mt-6 flex justify-between items-center">
        <div className="flex space-x-2">
          {onEdit && (
            <Button size="sm" variant="outline" onClick={onEdit} aria-label="Modifier">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          {onPrint && (
            <Button size="sm" variant="outline" onClick={onPrint} aria-label="Imprimer">
              <Printer className="h-4 w-4" />
            </Button>
          )}
          {onDownload && (
            <Button size="sm" variant="solid" onClick={onDownload} aria-label="Télécharger">
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>

    <ConfirmDeleteInvoiceModal
      isOpen={isDeleteModalOpen}
      invoiceNumber={invoice.id.toString().padStart(4, "0")}
      onCancel={() => setIsDeleteModalOpen(false)}
      onDelete={() => {
        onDelete?.();
        setIsDeleteModalOpen(false);
      }}
    />
  </>
);}
