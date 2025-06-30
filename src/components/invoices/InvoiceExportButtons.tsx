
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { HelpButton } from "@/components/ui/help-button";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { Invoice, Patient, Cabinet } from "@/types";

interface InvoiceExportButtonsProps {
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  isExporting?: boolean;
  hasInvoices?: boolean;
  // Nouvelles props nécessaires
  selectedYear: string;
  selectedMonth: string | null;
  invoices: Invoice[];
  patientDataMap: Map<number, Patient>;
  selectedCabinetId: number | "ALL" | null;
  selectedOsteopathId: number | "ALL" | null;
  cabinets: Cabinet[];
}

export const InvoiceExportButtons: React.FC<InvoiceExportButtonsProps> = ({
  onExportPDF,
  onExportExcel,
  isExporting = false,
  hasInvoices = true,
  selectedYear,
  selectedMonth,
  invoices,
  patientDataMap,
  selectedCabinetId,
  selectedOsteopathId,
  cabinets
}) => {
  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    }
  };

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel();
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex items-center gap-1">
        <CustomTooltip content="Génère un PDF unique contenant toutes les factures sélectionnées avec leurs informations complètes">
          <Button
            onClick={handleExportPDF}
            disabled={isExporting || !hasInvoices}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
        </CustomTooltip>
        <HelpButton 
          content="Exporte toutes les factures affichées dans un seul fichier PDF. Idéal pour imprimer plusieurs factures ou les envoyer par email en une fois."
        />
      </div>
      
      <div className="flex items-center gap-1">
        <CustomTooltip content="Génère un fichier Excel avec le récapitulatif comptable des factures : totaux, statistiques et détails par période">
          <Button
            onClick={handleExportExcel}
            disabled={isExporting || !hasInvoices}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Comptable
          </Button>
        </CustomTooltip>
        <HelpButton 
          content="Génère un fichier Excel avec le récapitulatif comptable : totaux par mois, statistiques de paiement, et détails de chaque facture. Parfait pour votre comptabilité."
        />
      </div>
    </div>
  );
};
