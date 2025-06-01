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
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Download, Filter, Search, X } from "lucide-react";

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
	invoiceYears: number[];
	monthOptions: string[];
}

export const InvoiceFilters = ({
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
}: InvoiceFiltersProps) => {
	const { isMobile } = useIsMobile();

	return (
		<Card className="mb-8">
			<CardContent className="p-4">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Rechercher une facture..."
							className="pl-9"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && (
							<Button
								size="icon"
								variant="ghost"
								className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
								onClick={() => setSearchQuery("")}
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
					<div className="flex items-center gap-2 min-w-[200px]">
						<Filter className="h-4 w-4 text-gray-400" />
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}
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
							value={selectedYear}
							onValueChange={setSelectedYear}
						>
							<SelectTrigger className="w-28">
								<SelectValue placeholder="Année" />
							</SelectTrigger>
							<SelectContent>
								{invoiceYears.map((year) => (
									<SelectItem
										key={year}
										value={year.toString()}
									>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={selectedMonth || "all_months"}
							onValueChange={(value) =>
								setSelectedMonth(
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
								{monthOptions.map((monthKey) => (
									<SelectItem key={monthKey} value={monthKey}>
										{format(
											parseISO(`${monthKey}-01`),
											"MMMM yyyy",
											{
												locale: fr,
											}
										)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Button
							onClick={onDownloadAll}
							variant="outline"
							size={isMobile ? "sm" : "default"}
							className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50"
						>
							<span className="flex items-center gap-2">
								<Download className="h-4 w-4 text-primary" />
								Télécharger le PDF{" "}
								{selectedMonth ? "mensuel" : "annuel"}
							</span>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
