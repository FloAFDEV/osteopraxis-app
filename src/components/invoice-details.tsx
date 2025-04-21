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

  // Updated function to correctly display patient name
  const getDisplayPatientName = () => {
    // If a patientName prop is provided explicitly, use it first
    if (patientName) return patientName;
    
    // If the invoice has a Patient object attached (from API), use it
    if (invoice.Patient && invoice.Patient.firstName && invoice.Patient.lastName) {
      return `${invoice.Patient.firstName} ${invoice.Patient.lastName}`;
    }
    
    // Fallback to patient ID only if no name is available
    return `Patient #${invoice.patientId}`;
  };

  return (
    <>
      <Card className={clsx(
        "hover-scale border shadow-lg px-4 pb-4 pt-5 transition-all duration-300",
        "relative overflow-hidden min-h-[165px]",
        "bg-gradient-to-br from-white via-blue-50 to-blue-100",
        "dark:from-gray-800 dark:via-gray-700 dark:to-gray-900",
        "border border-gray-200 dark:border-gray-700",
        "rounded-lg"
      )}
      style={{
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(59, 130, 246, 0.1)"
      }}>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center gap-x-3 text-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/80 dark:to-blue-800/90 rounded-full p-2 shadow-md border border-blue-100 dark:border-blue-700/50">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-300 drop-shadow" />
              </div>
              <span className="font-black text-xl tracking-wider text-blue-700 dark:text-blue-200">
                #{invoice.id.toString().padStart(4, "0")}
              </span>
              <span className={clsx("px-2 py-0.5 text-xs rounded-full font-bold border bg-white/70 dark:bg-gray-900/80 transition-colors duration-200", getStatusColor(invoice.paymentStatus))}>
                {getStatusText(invoice.paymentStatus)}
              </span>
            </div>
            <span className="font-extrabold text-2xl sm:text-2xl bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent drop-shadow ml-2">
              {formatCurrency(invoice.amount)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Date :</span>
              <span className="font-semibold dark:text-gray-200">{formatDate(invoice.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Patient :</span>
              <span className="font-semibold text-blue-600 dark:text-blue-300 truncate max-w-[200px]">
                {getDisplayPatientName()}
              </span>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-dashed border-blue-200 dark:border-blue-800/50">
              <div className="space-x-2">
                {onEdit && <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow transition-all dark:bg-blue-950/30 dark:hover:bg-blue-900/40" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Modifier</span>
                </Button>}
                {onDelete && <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800/60 shadow transition-all dark:bg-red-950/30 dark:hover:bg-red-900/40" onClick={() => setIsDeleteModalOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Supprimer</span>
                </Button>}
              </div>
              <div className="space-x-2">
                {onPrint && <Button size="sm" variant="outline" className="border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all dark:bg-blue-950/30" onClick={onPrint}>
                  <Printer className="h-4 w-4" />
                  <span className="sr-only">Imprimer</span>
                </Button>}
                {onDownload && <Button size="sm" variant="default" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white" onClick={onDownload}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Télécharger</span>
                </Button>}
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
