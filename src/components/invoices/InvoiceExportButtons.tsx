
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { invoiceExportService } from "@/services/export/invoice-export-service";
import { Invoice, Osteopath, Patient } from "@/types";
import { Calendar, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { CabinetOsteopathSelector } from "./CabinetOsteopathSelector";

interface InvoiceExportButtonsProps {
  selectedYear: string;
  selectedMonth: string | null;
  invoices: Invoice[];
  patientDataMap: Map<number, Patient>;
}

export function InvoiceExportButtons({
  selectedYear,
  selectedMonth,
  invoices,
  patientDataMap,
}: InvoiceExportButtonsProps) {
  // Sélection ostéopathe & cabinet
  const [selectedOsteopathId, setSelectedOsteopathId] = useState<number | null>(null);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);

  // Filtrer ostéopathe/cabinet
  const matchingInvoices = invoices.filter(inv =>
    (!selectedOsteopathId || inv.osteopathId === selectedOsteopathId) &&
    (!selectedCabinetId || inv.cabinetId === selectedCabinetId)
  );

  // Gérer l’export
  const exportToExcel = async () => {
    try {
      if (!selectedOsteopathId) { toast.error("Sélectionnez un praticien"); return; }
      if (!selectedCabinetId) { toast.error("Sélectionnez un cabinet"); return; }
      if (matchingInvoices.length === 0) {
        toast.error("Aucune note d’honoraire à exporter pour ce filtre");
        return;
      }
      toast.info("Préparation de l’export...");
      const periodLabel = selectedMonth ? `${selectedMonth}/${selectedYear}` : selectedYear;

      // Important : dans la vraie vie il faudrait aussi retrouver l'objet ostéopathe à partir de l’ID
      await invoiceExportService.generateAccountingExport(
        matchingInvoices,
        patientDataMap,
        periodLabel
        // On pourrait passer l’osteopath complet si souhaité ici
      ).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Comptabilite_${periodLabel}_Ost${selectedOsteopathId}_Cab${selectedCabinetId}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        toast.success("Export généré !");
      });
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      toast.error("Erreur export : " + (error as Error)?.message);
    }
  };

  return (
    <div>
      <CabinetOsteopathSelector
        selectedOsteopathId={selectedOsteopathId}
        selectedCabinetId={selectedCabinetId}
        onOsteopathChange={setSelectedOsteopathId}
        onCabinetChange={setSelectedCabinetId}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 bg-amber-50 hover:bg-amber-500 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-50 dark:border-amber-700 dark:hover:bg-amber-800"
            disabled={!selectedOsteopathId || !selectedCabinetId}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export comptable
            <Download className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={exportToExcel}
            className="gap-2"
            disabled={!selectedOsteopathId || !selectedCabinetId}
          >
            <Calendar className="h-4 w-4" />
            Exporter la période sélectionnée
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
