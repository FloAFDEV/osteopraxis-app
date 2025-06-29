
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useState } from "react";

// Interface simplifiée pour les factures
interface SimpleInvoice {
  id: number;
  date: Date | string | null;
  amount: number;
  status?: string; // Rendre optionnel
  patient?: {
    firstName?: string;
    lastName?: string;
  };
}

interface InvoiceExportButtonsProps {
  invoices: SimpleInvoice[];
  selectedPeriod?: { from: Date | null; to: Date | null } | null;
  selectedYear?: string;
  selectedMonth?: string | null;
  patientDataMap?: Map<number, any>;
  selectedCabinetId?: number | "ALL" | null;
  selectedOsteopathId?: number | "ALL" | null;
  cabinets?: any[];
}

export function InvoiceExportButtons({ 
  invoices, 
  selectedPeriod,
  selectedYear,
  selectedMonth,
}: InvoiceExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (date: Date | string | null): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const tableColumn = ["Date", "Patient", "Montant (€)", "Statut"];
      const tableRows: string[][] = [];

      invoices.forEach(invoice => {
        tableRows.push([
          formatDate(invoice.date),
          `${invoice.patient?.firstName || ''} ${invoice.patient?.lastName || ''}`.trim() || 'N/A',
          invoice.amount.toString(),
          invoice.status || 'Non défini'
        ]);
      });

      const periodText = selectedPeriod 
        ? `du ${formatDate(selectedPeriod.from)} au ${formatDate(selectedPeriod.to)}`
        : selectedMonth 
          ? `pour ${selectedMonth}`
          : selectedYear
            ? `pour ${selectedYear}`
            : 'Période non spécifiée';

      doc.text(`Factures ${periodText}`, 14, 15);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      const fileName = selectedPeriod 
        ? `factures_${formatDate(selectedPeriod.from)}_${formatDate(selectedPeriod.to)}.pdf`
        : `factures_${selectedYear || 'export'}.pdf`;
      
      doc.save(fileName);
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
        Patient: `${invoice.patient?.firstName || ''} ${invoice.patient?.lastName || ''}`.trim() || 'N/A',
        Montant: invoice.amount,
        Statut: invoice.status || 'Non défini',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Factures");
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([new Uint8Array(excelBuffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      
      const fileName = selectedPeriod 
        ? `factures_${formatDate(selectedPeriod.from)}_${formatDate(selectedPeriod.to)}.xlsx`
        : `factures_${selectedYear || 'export'}.xlsx`;
      
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Button
        onClick={handleExportPDF}
        disabled={isExporting}
        variant="outline"
        size="sm"
        className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3"
      >
        {isExporting ? (
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
        ) : (
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        )}
        <span className="hidden sm:inline">Télécharger PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>

      <Button
        onClick={handleExportExcel}
        disabled={isExporting}
        variant="default"
        size="sm"
        className="w-full sm:w-auto justify-center text-xs sm:text-sm px-2 sm:px-3"
      >
        {isExporting ? (
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        )}
        <span className="hidden sm:inline">Export comptable</span>
        <span className="sm:hidden">Excel</span>
      </Button>
    </div>
  );
}
