
import { Invoice, Patient } from "@/types";
import { Calendar } from "lucide-react";
import { InvoiceMonthGroup } from "./InvoiceMonthGroup";

interface InvoiceYearGroupProps {
  year: string;
  months: Record<string, Invoice[]>;
  selectedMonth: string | null;
  patientDataMap: Map<number, Patient>;
  onDeleteInvoice: (id: number) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onDownloadInvoice: (invoice: Invoice) => void;
  onDownloadMonthInvoices: (year: string, monthKey: string) => void;
}

export const InvoiceYearGroup = ({
  year,
  months,
  selectedMonth,
  patientDataMap,
  onDeleteInvoice,
  onPrintInvoice,
  onDownloadInvoice,
  onDownloadMonthInvoices,
}: InvoiceYearGroupProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-amber-500" />
        Factures {year}
      </h2>
      {Object.entries(months)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .filter(([monthKey, _]) => {
          if (selectedMonth) {
            return monthKey === selectedMonth;
          }
          return true;
        })
        .map(([monthKey, monthInvoices]) => (
          <InvoiceMonthGroup
            key={monthKey}
            monthKey={monthKey}
            monthInvoices={monthInvoices}
            patientDataMap={patientDataMap}
            onDeleteInvoice={onDeleteInvoice}
            onPrintInvoice={onPrintInvoice}
            onDownloadInvoice={onDownloadInvoice}
            onDownloadMonthInvoices={onDownloadMonthInvoices}
          />
        ))}
    </div>
  );
};
