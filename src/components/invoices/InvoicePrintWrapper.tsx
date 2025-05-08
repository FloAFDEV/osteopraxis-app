
import { useRef, useEffect } from "react";
import { InvoicePrintView } from "@/components/invoice-print-view";
import { Invoice, Patient, Cabinet, Osteopath } from "@/types";
import { useReactToPrint } from "react-to-print";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface InvoicePrintWrapperProps {
  printInvoice: Invoice | null;
  printAllInvoices: Invoice[] | null;
  printPatient: Patient | null;
  printOsteopath: Osteopath | null;
  printCabinet: Cabinet | null;
  patientDataMap: Map<number, Patient>;
  selectedYear: string;
  selectedMonth: string | null;
  onPrintComplete: () => void;
  isPreparingPrint: boolean;
  setReadyToPrint: (ready: boolean) => void;
  readyToPrint: boolean;
}

export const InvoicePrintWrapper = ({
  printInvoice,
  printAllInvoices,
  printPatient,
  printOsteopath,
  printCabinet,
  patientDataMap,
  selectedYear,
  selectedMonth,
  onPrintComplete,
  isPreparingPrint,
  setReadyToPrint,
  readyToPrint,
}: InvoicePrintWrapperProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Configuration de react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printInvoice
      ? `Note d'honoraire_${printInvoice.id.toString().padStart(4, "0")}`
      : printAllInvoices
      ? `Notes d'honoraires_${selectedYear}`
      : "Note d'honoraire",
    onAfterPrint: onPrintComplete,
  });

  useEffect(() => {
    if (printInvoice || printAllInvoices) {
      setReadyToPrint(true);
    }
  }, [printInvoice, printAllInvoices, setReadyToPrint]);

  useEffect(() => {
    if ((printInvoice || printAllInvoices) && readyToPrint) {
      setTimeout(() => {
        handlePrint();
      }, 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyToPrint]);

  if (!printInvoice && !printAllInvoices) {
    return null;
  }

  return (
    <div className="hidden">
      <div ref={printRef}>
        {printInvoice ? (
          <InvoicePrintView
            invoice={printInvoice}
            patient={printPatient}
            osteopath={printOsteopath}
            cabinet={printCabinet}
          />
        ) : printAllInvoices ? (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-center mb-8">
              Notes d'honoraires 
              {selectedMonth 
                ? ` de ${format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy', { locale: fr })}`
                : ` de l'année ${selectedYear}`
              }
            </h1>
            <div className="space-y-8">
              {printAllInvoices.map((invoice) => {
                const patient = patientDataMap.get(invoice.patientId);
                return (
                  <div key={invoice.id} className="page-break-after mb-4">
                    <InvoicePrintView
                      invoice={invoice}
                      patient={patient}
                      osteopath={printOsteopath}
                      cabinet={printCabinet}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
