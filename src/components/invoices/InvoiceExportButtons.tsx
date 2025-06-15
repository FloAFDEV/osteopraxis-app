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

import { useOsteopaths } from "@/hooks/useOsteopaths";
import { useCabinetsByOsteopath } from "@/hooks/useCabinetsByOsteopath";

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

  const { osteopaths, loading: loadingOsteo } = useOsteopaths();
  const { cabinets, loading: loadingCabs } = useCabinetsByOsteopath(selectedOsteopathId);

  const selectedOsteopath: Osteopath | undefined = osteopaths.find(o => o.id === selectedOsteopathId);
  const selectedCabinet: Cabinet | undefined = cabinets.find(c => c.id === selectedCabinetId);

  // Ajout d’un log détaillé pour les factures
  React.useEffect(() => {
    console.log("[DEBUG INVOICE] Export - Structure d’une facture (première):", invoices[0]);
  }, [invoices]);

  // Filtrer selon ostéo et cabinet, mais si propr. absente il ne faut pas exclure !
  const matchingInvoices = invoices.filter(inv => {
    // On veut comparer seulement si les champs sont définis partout
    // Surtout, si le champ est undefined dans l’objet, ne pas matcher, mais si le filtre n’est pas appliqué (null), ok
    const osteoOk =
      selectedOsteopathId == null ||
      (inv.osteopathId != null && Number(inv.osteopathId) === Number(selectedOsteopathId));
    const cabinetOk =
      selectedCabinetId == null ||
      (inv.cabinetId != null && Number(inv.cabinetId) === Number(selectedCabinetId));
    return osteoOk && cabinetOk;
  });

  const canExport =
    !!selectedOsteopath &&
    !!selectedCabinet &&
    !loadingOsteo &&
    !loadingCabs &&
    !isExporting;

  // Gérer l'export XLSX
  const exportToExcel = async () => {
    // Ajout de logs pour debug !
    console.log("=== [EXPORT DEBUG] ===");
    console.log("selectedOsteopathId:", selectedOsteopathId, "selectedCabinetId:", selectedCabinetId);
    console.log("invoices (ids):", invoices.map(inv => ({
      id: inv.id,
      osteopathId: inv.osteopathId,
      cabinetId: inv.cabinetId
    })));
    console.log("matchingInvoices (après filtre):", matchingInvoices.map(inv => ({
      id: inv.id,
      osteopathId: inv.osteopathId,
      cabinetId: inv.cabinetId
    })));
    console.log("======================");

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
      toast.error("Erreur export : " + (error?.message || String(error)));
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
