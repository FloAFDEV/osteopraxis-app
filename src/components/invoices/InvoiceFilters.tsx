
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Calendar, FileSpreadsheet } from "lucide-react";
import { InvoiceExportButtons } from "./InvoiceExportButtons";
import { Invoice, Patient } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface InvoiceFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedMonth: string | null;
  setSelectedMonth: (month: string | null) => void;
  onDownloadAll: () => void;
  invoiceYears: string[];
  monthOptions: { value: string; label: string }[];
  // Nouvelles props pour l'export
  invoices: Invoice[];
  patientDataMap: Map<number, Patient>;
}

export function InvoiceFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  onDownloadAll,
  invoiceYears,
  monthOptions,
  // Nouvelles props
  invoices,
  patientDataMap
}: InvoiceFiltersProps) {
  const { isMobile } = useIsMobile();

  return (
    <div className="space-y-4 mb-6">
      {/* Première ligne de filtres */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Rechercher un patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-900"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-900">
            <SelectValue placeholder="Statut de paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="PAID">Payé</SelectItem>
            <SelectItem value="CANCELLED">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deuxième ligne de filtres */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 w-full sm:w-auto">
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
          >
            <SelectTrigger className="w-full xs:w-[120px] bg-white dark:bg-gray-900">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              {invoiceYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedMonth || "all"}
            onValueChange={(value) => setSelectedMonth(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full xs:w-[150px] bg-white dark:bg-gray-900">
              <SelectValue placeholder="Mois" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les mois</SelectItem>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Modifié : Disposition des boutons adaptée pour mobile */}
        <div className="flex flex-row gap-2 w-full sm:w-auto">
          {/* Bouton de téléchargement des factures */}
          <Button
            variant="outline"
            onClick={onDownloadAll}
            className="gap-2 flex-1 sm:flex-auto"
          >
            <Calendar className="h-4 w-4" />
            Télécharger les factures
          </Button>
          
          {/* Boutons d'export comptable */}
          <InvoiceExportButtons
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            invoices={invoices}
            patientDataMap={patientDataMap}
          />
        </div>
      </div>
    </div>
  );
}
