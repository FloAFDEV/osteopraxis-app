import { InvoicePrintView } from "@/components/invoice-print-view";
import { Cabinet, Invoice, Osteopath, Patient } from "@/types";
import { useEffect, useRef } from "react";
import { generateInvoicePDF, generateInvoiceFilename } from "@/utils/invoice-pdf-generator";
import { toast } from "sonner";

interface InvoiceDownloadWrapperProps {
  downloadInvoice: Invoice | null;
  downloadPatient: Patient | null;
  downloadOsteopath: Osteopath | null;
  downloadCabinet: Cabinet | null;
  onDownloadComplete: () => void;
}

export const InvoiceDownloadWrapper = ({
  downloadInvoice,
  downloadPatient,
  downloadOsteopath,
  downloadCabinet,
  onDownloadComplete,
}: InvoiceDownloadWrapperProps) => {
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDownload = async () => {
      if (downloadInvoice && downloadRef.current) {
        try {
          const filename = generateInvoiceFilename(downloadInvoice, downloadPatient);
          
          // Wait a bit for the DOM to be ready
          await new Promise(resolve => setTimeout(resolve, 300));
          
          await generateInvoicePDF(downloadRef.current, filename);
          
          toast.success("Note d'honoraire téléchargée avec succès");
          onDownloadComplete();
        } catch (error) {
          console.error("Erreur lors du téléchargement:", error);
          toast.error("Erreur lors du téléchargement du PDF");
          onDownloadComplete();
        }
      }
    };

    handleDownload();
  }, [downloadInvoice, downloadPatient, onDownloadComplete]);

  if (!downloadInvoice) {
    return null;
  }

  return (
    <div className="fixed -left-[9999px] -top-[9999px] w-[210mm]">
      <div ref={downloadRef} className="bg-white">
        <InvoicePrintView
          invoice={downloadInvoice}
          patient={downloadPatient}
          osteopath={downloadOsteopath}
          cabinet={downloadCabinet}
        />
      </div>
    </div>
  );
};
