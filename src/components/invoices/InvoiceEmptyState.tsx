
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InvoiceEmptyStateProps {
  hasFilters: boolean;
}

export const InvoiceEmptyState = ({ hasFilters }: InvoiceEmptyStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-20">
      <FileText className="h-16 w-16 mx-auto text-amber-300 dark:text-amber-600" />
      <h3 className="mt-4 text-xl font-medium">
        Aucune note d'honoraire trouvée
      </h3>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        {hasFilters
          ? "Essayez de modifier vos critères de recherche."
          : "Commencez par créer votre première note d'honoraire."}
      </p>
      <Button
        onClick={() => navigate("/invoices/new")}
        className="mt-6 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600"
      >
        <Plus className="h-4 w-4 mr-2" />
        Créer une note d'honoraire
      </Button>
    </div>
  );
};
