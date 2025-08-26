import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { HelpButton } from "@/components/ui/help-button";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { Invoice, Patient, Cabinet, Osteopath } from "@/types";
import { generateAccountingExport } from "@/services/export";
import { useIsMobile } from "@/hooks/use-mobile";

interface InvoiceUnifiedExportButtonProps {
  selectedYear: string;
  selectedMonth: string | null;
  invoices: Invoice[];
  patientDataMap: Map<number, Patient>;
  osteopathDataMap: Map<number, Osteopath>;
  selectedCabinetId: number | "ALL" | null;
  selectedOsteopathId: number | "ALL" | null;
  cabinets: Cabinet[];
  osteopaths: Osteopath[];
  onDownloadAllPDF: () => void;
}

export const InvoiceUnifiedExportButton: React.FC<InvoiceUnifiedExportButtonProps> = ({
  selectedYear,
  selectedMonth,
  invoices,
  patientDataMap,
  osteopathDataMap,
  selectedCabinetId,
  selectedOsteopathId,
  cabinets,
  osteopaths,
  onDownloadAllPDF
}) => {
  const { isMobile } = useIsMobile();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);

      // Déterminer la période
      const period = selectedMonth 
        ? `${selectedMonth}` 
        : selectedYear;

      // Trouver l'ostéopathe sélectionné
      const selectedOsteopath = selectedOsteopathId && selectedOsteopathId !== "ALL"
        ? osteopaths.find(o => o.id === selectedOsteopathId) || null
        : null;

      // Trouver le cabinet sélectionné
      const selectedCabinet = selectedCabinetId && selectedCabinetId !== "ALL"
        ? cabinets.find(c => c.id === selectedCabinetId) || null
        : null;

      // Générer le fichier Excel
      const blob = await generateAccountingExport(
        invoices,
        patientDataMap,
        period,
        selectedOsteopath,
        selectedCabinet
      );

      // Télécharger le fichier
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-comptable-${period}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const hasInvoices = invoices.length > 0;

  return (
    <div className="flex gap-3 items-center">
      {/* Bouton PDF unifié */}
      <div className="flex items-center gap-1">
        <CustomTooltip content="Génère un PDF contenant toutes les factures de la période sélectionnée">
          <Button
            onClick={onDownloadAllPDF}
            disabled={!hasInvoices}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50"
          >
            <FileDown className="h-4 w-4 text-primary" />
            PDF {selectedMonth ? "mensuel" : "annuel"}
          </Button>
        </CustomTooltip>
        <HelpButton 
          content="Télécharge un PDF contenant toutes les factures de la période sélectionnée. Idéal pour l'archivage ou l'envoi groupé."
        />
      </div>

      {/* Bouton Export Comptable */}
      <div className="flex items-center gap-1">
        <CustomTooltip content="Génère un fichier Excel avec le récapitulatif comptable : totaux, statistiques et détails par période">
          <Button
            onClick={handleExportExcel}
            disabled={isExporting || !hasInvoices}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
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