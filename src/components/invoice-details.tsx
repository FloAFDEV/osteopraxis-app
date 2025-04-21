
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
        return "bg-green-200/60 text-green-900 dark:bg-green-900/70 dark:text-green-300 border-green-300 dark:border-green-500";
      case "PENDING":
        return "bg-yellow-100/80 text-yellow-900 dark:bg-yellow-900/50 dark:text-yellow-400 border-yellow-200 dark:border-yellow-400";
      case "CANCELED":
        return "bg-red-100/90 text-red-900 dark:bg-red-900/60 dark:text-red-400 border-red-200 dark:border-red-400";
      default:
        return "bg-gray-100/80 text-gray-700 dark:bg-gray-900/50 dark:text-gray-400 border-gray-200 dark:border-gray-500";
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
          "hover-scale border-0 shadow-xl px-1.5 pb-2.5 pt-4 bg-gradient-to-br from-white/70 via-amber-50/50 to-gray-100/80 dark:from-black/60 dark:via-amber-800/30 dark:to-[#1a1f2c]/80 transition-all duration-300",
          "relative overflow-hidden min-h-[165px] glass-morphism", // accentue l'effet dark & glass
        )}
        style={{
          boxShadow:
            "0 8px 32px 0 rgba(31, 38, 135, 0.10), 0 2px 8px 0 rgba(252, 211, 77, 0.08)",
          border: "1.5px solid rgba(251,191,36,0.07)",
          background:
            "linear-gradient(135deg, #fdfcfb 0%, #f8ecd8 60%, #fbc966 99%)"
        }}
      >
        {/* Accent bar en haut */}
        <div className="absolute h-1 w-full left-0 top-0 bg-gradient-to-r from-amber-400 via-amber-300 to-pink-400 dark:from-amber-600 dark:via-amber-500 dark:to-pink-600 rounded-t-lg blur-[2px] opacity-70" />
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center gap-x-3 text-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-amber-200 to-amber-400 dark:from-black/30 dark:to-amber-800/60 rounded-full p-2 shadow-md border border-amber-100 dark:border-amber-900/40">
                <FileText className="h-8 w-8 text-amber-600 dark:text-amber-300 drop-shadow" />
              </div>
              <span className="font-black text-xl tracking-wider text-amber-700 dark:text-amber-300">
                #{invoice.id.toString().padStart(4, "0")}
              </span>
              <span className={clsx(
                "px-2 py-0.5 text-xs rounded-full font-bold border bg-white/70 dark:bg-neutral-900/60 transition-colors duration-200",
                getStatusColor(invoice.paymentStatus)
              )}>
                {getStatusText(invoice.paymentStatus)}
              </span>
            </div>
            <span className="font-extrabold text-2xl sm:text-2xl bg-gradient-to-r from-amber-400 to-pink-400 dark:from-amber-300 dark:to-pink-500 bg-clip-text text-transparent drop-shadow ml-2">
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
              <span className="font-semibold text-amber-600 dark:text-amber-300">{patientName || `Patient #${invoice.patientId}`}</span>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-dashed border-amber-200 dark:border-amber-700/40">
              <div className="flex space-x-2">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-700 shadow transition-all"
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
                    className="text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100 border border-red-200 dark:border-red-600 shadow transition-all"
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
                    className="border border-amber-200 dark:border-amber-600 text-amber-800 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
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
                    className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white"
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
