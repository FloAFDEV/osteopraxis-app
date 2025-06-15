
import { Button } from "@/components/ui/button";
import { Download, Printer, Trash2 } from "lucide-react";

interface InvoiceActionsProps {
  onDelete?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  isMobile: boolean;
}

export const InvoiceActions = ({
  onDelete,
  onPrint,
  onDownload,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  isMobile,
}: InvoiceActionsProps) => (
  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
    <div className="flex gap-2 ml-auto">
      {onDelete && (
        <Button
          size="icon"
          variant="outline"
          onClick={() => setIsDeleteModalOpen(true)}
          title="Supprimer"
          aria-label="Supprimer la facture"
          className="h-10 w-10 rounded-md bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:border-red-800/60 dark:text-red-400"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      )}
    </div>
    {isMobile && (
      <div className="flex gap-2">
        {onPrint && (
          <Button
            size="sm"
            variant="outline"
            onClick={onPrint}
            className="h-8 px-2 rounded-md border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 items-center hidden"
          >
            <Printer className="h-4 w-4 mr-1" />
            <span className="sr-only sm:not-sr-only sm:inline">
              Imprimer
            </span>
          </Button>
        )}
        {onDownload && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDownload}
            className="h-8 px-2 rounded-md border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="sr-only sm:not-sr-only sm:inline">
              PDF
            </span>
          </Button>
        )}
      </div>
    )}
  </div>
);
