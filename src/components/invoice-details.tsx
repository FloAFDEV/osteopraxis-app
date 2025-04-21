
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
        return "bg-green-200/80 text-green-800 dark:bg-green-900/80 dark:text-green-100 border-green-300 dark:border-green-700";
      case "PENDING":
        return "bg-amber-100/90 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200 border-amber-200 dark:border-amber-700";
      case "CANCELED":
        return "bg-red-100/90 text-red-900 dark:bg-red-900/80 dark:text-red-200 border-red-200 dark:border-red-800";
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
      <Card className={clsx(
        // Design amélioré avec meilleurs contrastes et accessibilité
        "hover-scale border-0 shadow-lg px-2 pb-3 pt-4 transition-all duration-300",
        "relative overflow-hidden min-h-[180px]", 
        // Palette harmonisée avec le reste du site pour les modes clair et sombre
        "bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-950/30",
        "dark:text-amber-50"
      )} style={{
        boxShadow: "0 8px 25px 0 rgba(251, 191, 36, 0.08), 0 4px 12px 0 rgba(251, 191, 36, 0.06)"
      }}>
        {/* Barre d'accent en haut avec un meilleur contraste */}
        <div className="absolute h-1.5 w-full left-0 top-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 dark:from-amber-500 dark:via-amber-400 dark:to-amber-300 rounded-t-lg" />
        
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center gap-x-3 text-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-amber-100 to-amber-300 dark:from-amber-700 dark:to-amber-500 rounded-full p-2.5 shadow-md">
                <FileText className="h-7 w-7 text-amber-700 dark:text-amber-100" aria-hidden="true" />
              </div>
              <span className="font-extrabold text-xl tracking-wider text-amber-700 dark:text-amber-200">
                #{invoice.id.toString().padStart(4, "0")}
              </span>
              <span className={clsx(
                "px-2.5 py-1 text-xs rounded-full font-semibold border shadow-sm",
                getStatusColor(invoice.paymentStatus)
              )}>
                {getStatusText(invoice.paymentStatus)}
              </span>
            </div>
            <span className="font-extrabold text-2xl sm:text-2xl bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-300 dark:to-amber-100 bg-clip-text text-transparent drop-shadow">
              {formatCurrency(invoice.amount)}
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-2">
          <div className="text-sm space-y-2.5">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-amber-300/80 font-medium">Date :</span>
              <span className="font-semibold text-gray-800 dark:text-amber-100">{formatDate(invoice.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-amber-300/80 font-medium">Patient :</span>
              <span className="font-semibold text-amber-700 dark:text-amber-200">{patientName || `Patient #${invoice.patientId}`}</span>
            </div>
            
            <div className="flex justify-between mt-4 pt-3 border-t border-dashed border-amber-200 dark:border-amber-700/40">
              <div className="flex space-x-2">
                {onEdit && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-200 bg-white/80 hover:bg-amber-50 dark:bg-amber-950/60 dark:hover:bg-amber-900/70" 
                    onClick={onEdit}
                    aria-label="Modifier la facture"
                  >
                    <Edit className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Modifier</span>
                  </Button>
                )}
                
                {onDelete && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-300 bg-white/80 hover:bg-red-50 dark:bg-red-950/40 dark:hover:bg-red-900/50"
                    onClick={() => setIsDeleteModalOpen(true)}
                    aria-label="Supprimer la facture"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                {onPrint && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-200 bg-white/80 hover:bg-amber-50 dark:bg-amber-950/60 dark:hover:bg-amber-900/70"
                    onClick={onPrint}
                    aria-label="Imprimer la facture"
                  >
                    <Printer className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Imprimer</span>
                  </Button>
                )}
                
                {onDownload && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:border-amber-600/60 dark:bg-amber-900/40 dark:text-amber-200 dark:hover:bg-amber-800/60 font-medium"
                    onClick={onDownload}
                    aria-label="Exporter la facture en PDF"
                  >
                    <Download className="h-4 w-4 mr-1" aria-hidden="true" />
                    Exporter PDF
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
    </>;
};

