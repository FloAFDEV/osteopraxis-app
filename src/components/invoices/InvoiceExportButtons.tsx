
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { HelpButton } from "@/components/ui/help-button";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface InvoiceExportButtonsProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  isExporting: boolean;
  hasInvoices: boolean;
}

export const InvoiceExportButtons: React.FC<InvoiceExportButtonsProps> = ({
  onExportPDF,
  onExportExcel,
  isExporting,
  hasInvoices
}) => {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex items-center gap-1">
        <CustomTooltip content="Génère un PDF unique contenant toutes les factures sélectionnées avec leurs informations complètes">
          <Button
            onClick={onExportPDF}
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
            onClick={onExportExcel}
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
