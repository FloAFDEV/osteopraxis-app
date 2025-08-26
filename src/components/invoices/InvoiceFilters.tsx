import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Download, Filter, Search, X } from "lucide-react";
import { InvoiceUnifiedExportButton } from "./InvoiceUnifiedExportButton";
import { Invoice, Patient, Osteopath, Cabinet } from "@/types";
import React from "react";

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
  monthOptions: string[];
  invoices: Invoice[];
  patientDataMap: Map<number, Patient>;
  osteopath?: Osteopath;
  // Nouveaux props
  selectedCabinetId: number | "ALL" | null;
  setSelectedCabinetId: (cabId: number | "ALL" | null) => void;
  selectedOsteopathId: number | "ALL" | null;
  setSelectedOsteopathId: (osteoId: number | "ALL" | null) => void;
  cabinets: Cabinet[];
  osteopaths: Osteopath[];
  osteopathDataMap: Map<number, Osteopath>;
}

export const InvoiceFilters = (props: InvoiceFiltersProps) => {
  const { isMobile } = useIsMobile();

  // Ajouter des logs pour diagnostiquer cabinets et praticiens reçus
  React.useEffect(() => {
    // Filtres - données sensibles non exposées
  }, [props.cabinets, props.osteopaths, props.selectedCabinetId, props.selectedOsteopathId]);

  // Helper function to safely format month display
  const formatMonthDisplay = (monthKey: string): string => {
    try {
      // Validate monthKey format (should be YYYY-MM)
      if (!monthKey || !monthKey.includes('-')) {
        console.warn(`Invalid monthKey format: ${monthKey}`);
        return monthKey;
      }
      
      const dateToParse = `${monthKey}-01`;
      const parsedDate = parseISO(dateToParse);
      
      if (!isValid(parsedDate)) {
        console.warn(`Invalid date parsed from: ${dateToParse}`);
        return monthKey;
      }
      
      return format(parsedDate, "MMMM yyyy", { locale: fr });
    } catch (error) {
      console.error(`Error formatting month display for ${monthKey}:`, error);
      return monthKey;
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        {/* Filtres Ostéo/Cabinet - Ordre inversé */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-xs mb-1 font-medium text-muted-foreground">Ostéopathe</label>
            <Select
              value={props.selectedOsteopathId != null ? String(props.selectedOsteopathId) : ""}
              onValueChange={(v) => {
                // ✅ Sélection ostéopathe
                props.setSelectedOsteopathId(v === "ALL" || v === "" ? null : Number(v));
              }}
            >
              <SelectTrigger className="min-w-[140px] dark:bg-background dark:border-muted-foreground">
                <SelectValue placeholder="Tous les praticiens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les praticiens</SelectItem>
                {props.osteopaths.map(ost => (
                  <SelectItem key={ost.id} value={String(ost.id)}>
                    {ost.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs mb-1 font-medium text-muted-foreground">Cabinet</label>
            <Select
              value={props.selectedCabinetId != null ? String(props.selectedCabinetId) : ""}
              onValueChange={(v) => {
                // ✅ Sélection cabinet
                props.setSelectedCabinetId(v === "ALL" || v === "" ? null : Number(v));
              }}
            >
              <SelectTrigger className="min-w-[140px] dark:bg-background dark:border-muted-foreground">
                <SelectValue placeholder="Tous les cabinets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les cabinets</SelectItem>
                {props.cabinets.map((cab) => (
                  <SelectItem key={cab.id} value={String(cab.id)}>
                    {cab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Filtres classiques */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une facture..."
              className="pl-9"
              value={props.searchQuery}
              onChange={(e) => props.setSearchQuery(e.target.value)}
            />
            {props.searchQuery && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                onClick={() => props.setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select
              value={props.statusFilter}
              onValueChange={props.setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  Tous les statuts
                </SelectItem>
                <SelectItem value="PAID">Payée</SelectItem>
                <SelectItem value="PENDING">
                  En attente
                </SelectItem>
                <SelectItem value="CANCELED">
                  Annulée
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Date filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-amber-500" />
            Filtrer par période:
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={props.selectedYear}
              onValueChange={props.setSelectedYear}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                {props.invoiceYears.map((year) => (
                  <SelectItem
                    key={year}
                    value={year}
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={props.selectedMonth || "all_months"}
              onValueChange={(value) =>
                props.setSelectedMonth(
                  value === "all_months" ? null : value
                )
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tous les mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_months">
                  Tous les mois
                </SelectItem>
                {props.monthOptions.map((monthKey) => (
                  <SelectItem key={monthKey} value={monthKey}>
                    {formatMonthDisplay(monthKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <InvoiceUnifiedExportButton
              selectedYear={props.selectedYear}
              selectedMonth={props.selectedMonth}
              invoices={props.invoices}
              patientDataMap={props.patientDataMap}
              osteopathDataMap={props.osteopathDataMap}
              selectedCabinetId={props.selectedCabinetId}
              selectedOsteopathId={props.selectedOsteopathId}
              cabinets={props.cabinets}
              osteopaths={props.osteopaths}
              onDownloadAllPDF={props.onDownloadAll}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
