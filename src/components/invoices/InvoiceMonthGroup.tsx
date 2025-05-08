
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Invoice, Patient } from "@/types";
import { Download } from "lucide-react";
import { InvoiceDetails } from "@/components/invoice-details";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface InvoiceMonthGroupProps {
  monthKey: string;
  monthInvoices: Invoice[];
  patientDataMap: Map<number, Patient>;
  onEditInvoice: (id: number) => void;
  onDeleteInvoice: (id: number) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onDownloadInvoice: (invoice: Invoice) => void;
  onDownloadMonthInvoices: (year: string, monthKey: string) => void;
}

export const InvoiceMonthGroup = ({
  monthKey,
  monthInvoices,
  patientDataMap,
  onEditInvoice,
  onDeleteInvoice,
  onPrintInvoice,
  onDownloadInvoice,
  onDownloadMonthInvoices,
}: InvoiceMonthGroupProps) => {
  const year = monthKey.split('-')[0];
  const monthLabel = format(parseISO(`${monthKey}-01`), 'MMMM yyyy', { locale: fr });

  return (
    <AccordionItem key={monthKey} value={monthKey} className="border rounded-lg overflow-hidden">
      <AccordionTrigger className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <div className="flex justify-between items-center w-full pr-4">
          <span className="font-medium capitalize">{monthLabel}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {monthInvoices.length} {monthInvoices.length > 1 ? 'factures' : 'facture'}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 text-amber-600 hover:text-amber-700"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadMonthInvoices(year, monthKey);
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="text-xs">PDF</span>
            </Button>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {monthInvoices.map((invoice) => (
            <div key={invoice.id} className="h-full">
              <div className="h-full flex flex-col">
                <InvoiceDetails
                  invoice={invoice}
                  patient={patientDataMap.get(invoice.patientId)}
                  onEdit={() => onEditInvoice(invoice.id)}
                  onDelete={() => onDeleteInvoice(invoice.id)}
                  onPrint={() => onPrintInvoice(invoice)}
                  onDownload={() => onDownloadInvoice(invoice)}
                />
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
