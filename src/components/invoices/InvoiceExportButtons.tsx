
import React, { useState, useMemo } from "react";
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
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface InvoiceExportButtonsProps {
  selectedYear: string;
  selectedMonth: string | null;
  invoices: Invoice[];
  patientDataMap: Map<number, Patient>;
  selectedCabinetId: number | "ALL" | null;
  selectedOsteopathId: number | "ALL" | null;
  cabinets: Cabinet[];
  osteopaths: Osteopath[];
}

export function InvoiceExportButtons({
  selectedYear,
  selectedMonth,
  invoices,
  patientDataMap,
  selectedCabinetId,
  selectedOsteopathId,
  cabinets,
  osteopaths,
}: InvoiceExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // On filtre ICI selon cabinet/osteo
  const matchingInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const cabinetOk = selectedCabinetId == null || selectedCabinetId === "ALL" ||
        (inv.cabinetId != null && Number(inv.cabinetId) === Number(selectedCabinetId));
      const osteoOk = selectedOsteopathId == null || selectedOsteopathId === "ALL" ||
        (inv.osteopathId != null && Number(inv.osteopathId) === Number(selectedOsteopathId));
      return cabinetOk && osteoOk;
    });
  }, [invoices, selectedCabinetId, selectedOsteopathId]);

  const selectedOsteopath =
    selectedOsteopathId && selectedOsteopathId !== "ALL"
      ? osteopaths.find((o) => o.id === Number(selectedOsteopathId))
      : undefined;
  const selectedCabinet =
    selectedCabinetId && selectedCabinetId !== "ALL"
      ? cabinets.find((c) => c.id === Number(selectedCabinetId))
      : undefined;

  const canExport =
    !!selectedCabinet &&
    (
      (selectedOsteopathId !== null && selectedOsteopathId !== undefined) ||
      selectedOsteopathId === "ALL"
    ) &&
    !isExporting;

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      toast.info("Préparation de l’export...");
      const periodLabel = selectedMonth ? `${selectedMonth}/${selectedYear}` : selectedYear;

      let blob;
      let filename;
      if (selectedOsteopathId === "ALL") {
        blob = await generateAccountingExport(
          matchingInvoices,
          patientDataMap,
          periodLabel,
          null,
          selectedCabinet
        );
        filename = `Comptabilite_${periodLabel}_Cab${selectedCabinet?.id}_TousOsteos.xlsx`;
      } else {
        blob = await generateAccountingExport(
          matchingInvoices,
          patientDataMap,
          periodLabel,
          selectedOsteopath,
          selectedCabinet
        );
        filename = `Comptabilite_${periodLabel}_Ost${selectedOsteopath?.id}_Cab${selectedCabinet?.id}.xlsx`;
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {canExport ? (
            <Button
              variant="outline"
              className="gap-2 bg-amber-50 hover:bg-amber-500 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-50 dark:border-amber-700 dark:hover:bg-amber-800"
              disabled={!canExport}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {isExporting ? "Préparation..." : "Export comptable"}
              <Download className="h-3 w-3 ml-1" />
            </Button>
          ) : (
            <CustomTooltip
              content="Veuillez sélectionner un cabinet précis pour activer l'export comptable. L'export multi-cabinets n'est pas autorisé pour des raisons comptables."
              side="top"
              maxWidth="280px"
            >
              <span>
                <Button
                  variant="outline"
                  className="gap-2 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-50 dark:border-amber-700 opacity-70 cursor-not-allowed"
                  disabled
                  tabIndex={-1}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export comptable
                  <Download className="h-3 w-3 ml-1" />
                </Button>
              </span>
            </CustomTooltip>
          )}
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

