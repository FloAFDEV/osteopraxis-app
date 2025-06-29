import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useState } from "react";
import { Invoice } from "@/services/api";

interface InvoiceExportButtonsProps {
  invoices: Invoice[];
  selectedPeriod: { from: Date | null; to: Date | null } | null;
}

export function InvoiceExportButtons({ invoices, selectedPeriod }: InvoiceExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const tableColumn = ["Date", "Patient", "Montant (€)", "Statut"];
      const tableRows = [];

      invoices.forEach(invoice => {
        tableRows.push([
          formatDate(invoice.date),
          `${invoice.patient?.firstName} ${invoice.patient?.lastName}`,
          invoice.amount.toString(),
          invoice.status
        ]);
      });

      doc.text(`Factures ${selectedPeriod ? `du ${formatDate(selectedPeriod.from)} au ${formatDate(selectedPeriod.to)}` : ' - Période non spécifiée'}`, 14, 15);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save(`factures_${formatDate(selectedPeriod?.from)}_${formatDate(selectedPeriod?.to)}.pdf`);
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const data = invoices.map(invoice => ({
        Date: formatDate(invoice.date),
        Patient: `${invoice.patient?.firstName} ${invoice.patient?.lastName}`,
        Montant: invoice.amount,
        Statut: invoice.status,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Factures");
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([new Uint8Array(excelBuffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      saveAs(blob, `factures_${formatDate(selectedPeriod?.from)}_${formatDate(selectedPeriod?.to)}.xlsx`);
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <Button
        onClick={handleExportPDF}
        disabled={isExporting}
        variant="outline"
        size="sm"
        className="w-full sm:w-auto justify-center"
      >
        {isExporting ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        <span className="hidden sm:inline">Télécharger PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>

      <Button
        onClick={handleExportExcel}
        disabled={isExporting}
        variant="default"
        size="sm"
        className="w-full sm:w-auto justify-center"
      >
        {isExporting ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 mr-2" />
        )}
        <span className="hidden sm:inline">Export comptable</span>
        <span className="sm:hidden">Excel</span>
      </Button>
    </div>
  );
}
