
import { useState } from "react";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Edit, Trash2 } from "lucide-react";
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
      <Card className={clsx(
        "border shadow px-4 pb-4 pt-0 transition-all duration-300",
        "relative overflow-hidden min-h-[165px]",
        "bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30",
        "dark:from-gray-800 dark:via-gray-700 dark:to-gray-900",
        "border border-gray-200 dark:border-gray-700",
        "rounded-lg"
      )}>
        <CardContent className="p-4 pt-5 flex flex-col h-full">
          {/* Header section */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/80 dark:to-blue-800/90 rounded-full p-1.5 shadow-sm border border-blue-100 dark:border-blue-700/50">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <span className="font-bold text-lg tracking-wide text-blue-700 dark:text-blue-200">
                #{invoice.id.toString().padStart(4, "0")}
              </span>
              <span className={clsx(
                "px-2 py-0.5 text-xs rounded-full font-bold border",
                "bg-white/70 dark:bg-gray-900/80 transition-colors",
                getStatusColor(invoice.paymentStatus)
              )}>
                {getStatusText(invoice.paymentStatus)}
              </span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
              {formatCurrency(invoice.amount)}
            </span>
          </div>
          
          {/* Details section */}
          <div className="mt-4 space-y-2 text-sm">
            {patientName && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Patient :</span>
                <span className="font-medium dark:text-gray-200">{patientName}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Date :</span>
              <span className="font-medium dark:text-gray-200">{formatDate(invoice.date)}</span>
            </div>
          </div>
          
          {/* Actions section */}
          <div className="mt-auto pt-4 border-t border-dashed border-blue-200/50 dark:border-blue-800/30 flex justify-between items-center">
            <div className="space-x-1.5">
              {onEdit && (
                <Button size="sm" variant="outline" 
                  className="h-8 px-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border-blue-200 dark:border-blue-800/60 transition-all dark:bg-blue-950/30 dark:hover:bg-blue-900/40"
                  onClick={onEdit}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Éditer</span>
                </Button>
              )}
              {onDelete && (
                <Button size="sm" variant="outline"
                  className="h-8 px-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border-red-200 dark:border-red-800/60 transition-all dark:bg-red-950/30 dark:hover:bg-red-900/40"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Supprimer</span>
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
