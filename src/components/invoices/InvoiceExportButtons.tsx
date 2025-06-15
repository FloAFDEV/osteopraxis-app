
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateAccountingExport } from "@/services/export/invoice-export-service";
import { Invoice, Osteopath, Patient, Cabinet } from "@/types";
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
  const [selectedOsteopathId, setSelectedOsteopathId] = useState<number | null>(null);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Fetch selected osteo/cabinet objects
  const { osteopaths, loading: loadingOsteo } = require("@/hooks/useOsteopaths").useOsteopaths();
  const { cabinets, loading: loadingCabs } = require("@/hooks/useCabinetsByOsteopath").useCabinetsByOsteopath(selectedOsteopathId ?? undefined);

  // Correction: Retirer '?? undefined' après .find (natif)
  const selectedOsteopath: Osteopath | undefined = osteopaths.find(o => o.id === selectedOsteopathId);
  const selectedCabinet: Cabinet | undefined = cabinets.find(c => c.id === selectedCabinetId);

  // Filtrer selon ostéo et cabinet
  const matchingInvoices = invoices.filter(inv =>
    (!selectedOsteopathId || inv.osteopathId === selectedOsteopathId) &&
    (!selectedCabinetId || inv.cabinetId === selectedCabinetId)
  );

  const canExport =
    !!selectedOsteopath &&
    !!selectedCabinet &&
    !loadingOsteo &&
    !loadingCabs &&
    !isExporting;

  // Gérer l'export XLSX
  const exportToExcel = async () => {
    if (!selectedOsteopath) {
      toast.error("Sélectionnez un praticien");
      return;
    }
    if (!selectedCabinet) {
      toast.error("Sélectionnez un cabinet");
      return;
    }
    if (matchingInvoices.length === 0) {
      toast.error("Aucune note d’honoraire à exporter pour ce filtre");
      return;
    }
    try {
      setIsExporting(true);
      toast.info("Préparation de l’export...");
      const periodLabel = selectedMonth ? `${selectedMonth}/${selectedYear}` : selectedYear;

      const blob = await generateAccountingExport(
        matchingInvoices,
        patientDataMap,
        periodLabel,
        selectedOsteopath,
        selectedCabinet
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Comptabilite_${periodLabel}_Ost${selectedOsteopath.id}_Cab${selectedCabinet.id}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Export généré !");
    } catch (error: any) {
      console.error("Erreur lors de l'export Excel:", error);
      toast.error("Erreur export : " + error?.message ?? error);
    }
    setIsExporting(false);
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
            disabled={!canExport}
          >
            <FileSpreadsheet className="h-4 w-4" />
            {isExporting ? "Préparation..." : "Export comptable"}
            <Download className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={canExport ? exportToExcel : undefined}
            className="gap-2"
            disabled={!canExport}
          >
            <Calendar className="h-4 w-4" />
            Exporter la période sélectionnée
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
