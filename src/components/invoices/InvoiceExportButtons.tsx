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
  const [selectedOsteopathId, setSelectedOsteopathId] = useState<number | "ALL" | null>(null);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const { osteopaths, loading: loadingOsteo } = useOsteopaths();
  // Correction : récupérer la liste des cabinets indépendamment de la sélection
  const { cabinets, loading: loadingCabs } = useCabinetsByOsteopath(undefined);

  // Correction : filtrer VRAIMENT les ostéos rattachés au cabinet sélectionné
  const osteopathsInCabinet = React.useMemo(() => {
    if (!selectedCabinetId) return [];
    return osteopaths.filter((ost) =>
      ost.cabinetIds && Array.isArray(ost.cabinetIds)
        ? ost.cabinetIds.includes(selectedCabinetId)
        : false
    );
  }, [selectedCabinetId, osteopaths]);

  React.useEffect(() => {
    // Log pour debugging
    console.log("[DEBUG OSTEOS IN CABINET]", osteopathsInCabinet);
  }, [osteopathsInCabinet]);

  // Sélection de l’ostéo
  const selectedOsteopath =
    selectedOsteopathId && selectedOsteopathId !== "ALL"
      ? osteopaths.find((o) => o.id === Number(selectedOsteopathId))
      : undefined;
  const selectedCabinet = cabinets.find((c) => c.id === selectedCabinetId);

  const matchingInvoices = invoices.filter((inv) => {
    const cabinetOk =
      selectedCabinetId == null ||
      (inv.cabinetId != null && Number(inv.cabinetId) === Number(selectedCabinetId));
    const osteoOk =
      selectedOsteopathId == null ||
      selectedOsteopathId === "ALL" ||
      (inv.osteopathId != null && Number(inv.osteopathId) === Number(selectedOsteopathId));
    return cabinetOk && osteoOk;
  });

  const canExport =
    !!selectedCabinet &&
    (
      (selectedOsteopathId !== null && selectedOsteopathId !== undefined) ||
      selectedOsteopathId === "ALL"
    ) &&
    !loadingOsteo &&
    !loadingCabs &&
    !isExporting;

  // Gérer l'export XLSX
  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      toast.info("Préparation de l’export...");

      const periodLabel = selectedMonth ? `${selectedMonth}/${selectedYear}` : selectedYear;

      let blob;
      let filename;
      if (selectedOsteopathId === "ALL") {
        // Export pour tous les ostéopathes du cabinet
        blob = await generateAccountingExport(
          matchingInvoices, // factures déjà filtrées par cabinet seulement
          patientDataMap,
          periodLabel,
          null, // pas d’ostéo => sera affiché comme “Tous”
          selectedCabinet
        );
        filename = `Comptabilite_${periodLabel}_Cab${selectedCabinet.id}_TousOsteos.xlsx`;
      } else {
        // Export d’un ostéo précis
        blob = await generateAccountingExport(
          matchingInvoices,
          patientDataMap,
          periodLabel,
          selectedOsteopath,
          selectedCabinet
        );
        filename = `Comptabilite_${periodLabel}_Ost${selectedOsteopath?.id}_Cab${selectedCabinet.id}.xlsx`;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
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
      {/* Sélection Cabinet */}
      <div className="flex gap-2 mb-2">
        <div className="w-1/2">
          <label className="block text-xs mb-1 font-medium text-muted-foreground">
            Cabinet
          </label>
          <select
            className="w-full h-10 px-2 border rounded"
            value={selectedCabinetId ?? ""}
            onChange={(e) => {
              setSelectedCabinetId(e.target.value ? Number(e.target.value) : null);
              setSelectedOsteopathId(null);
            }}
          >
            <option value="">Sélectionner un cabinet</option>
            {cabinets.map((cab) => (
              <option key={cab.id} value={cab.id}>
                {cab.name}
              </option>
            ))}
          </select>
        </div>
        {/* Sélection Ostéo */}
        <div className="w-1/2">
          <label className="block text-xs mb-1 font-medium text-muted-foreground">
            Ostéopathe
          </label>
          <select
            className="w-full h-10 px-2 border rounded"
            value={selectedOsteopathId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedOsteopathId(val === "ALL" ? "ALL" : val ? Number(val) : null);
            }}
            disabled={!selectedCabinetId}
          >
            <option value="">Sélectionner un ostéopathe</option>
            <option value="ALL">Tous les ostéopathes du cabinet</option>
            {/* Bugfix : n’affiche que les ostéos du cabinet sélectionné */}
            {osteopathsInCabinet.map((ost) => (
              <option key={ost.id} value={ost.id}>
                {ost.name}
              </option>
            ))}
          </select>
        </div>
      </div>

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
