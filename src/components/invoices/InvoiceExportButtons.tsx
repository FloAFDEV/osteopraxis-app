
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { invoiceExportService } from "@/services/export";
import { Invoice, Osteopath, Patient } from "@/types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface InvoiceExportButtonsProps {
	selectedYear: string;
	selectedMonth: string | null;
	invoices: Invoice[];
	patientDataMap: Map<number, Patient>;
	osteopath?: Osteopath;
}

export function InvoiceExportButtons({
	selectedYear,
	selectedMonth,
	invoices,
	patientDataMap,
	osteopath,
}: InvoiceExportButtonsProps) {
	// Fonction pour filtrer les factures par période
	const filterInvoicesByPeriod = (
		invoices: Invoice[],
		year: string,
		month: string | null = null
	): Invoice[] => {
		return invoices.filter((invoice) => {
			const invoiceDate = new Date(invoice.date);
			const invoiceYear = invoiceDate.getFullYear().toString();

			// Si l'année ne correspond pas, exclure
			if (invoiceYear !== year) return false;

			// Si un mois est spécifié, vérifier la correspondance
			if (month !== null) {
				const invoiceMonth = (invoiceDate.getMonth() + 1)
					.toString()
					.padStart(2, "0");
				return invoiceMonth === month;
			}

			// Sinon, inclure toutes les factures de l'année
			return true;
		});
	};

	// Fonction pour exporter les factures vers Excel
	const exportToExcel = async (year: string, month: string | null = null) => {
		try {
			// Filtrer les factures par période
			const filteredInvoices = filterInvoicesByPeriod(
				invoices,
				year,
				month
			);

			if (filteredInvoices.length === 0) {
				const periodLabel = month
					? format(parseISO(`${year}-${month}-01`), "MMMM yyyy", {
							locale: fr,
					  })
					: year;
				toast.error(`Aucune facture pour la période : ${periodLabel}`);
				return;
			}

			// Préparer le nom de la période pour l'export
			const periodLabel = month
				? format(parseISO(`${year}-${month}-01`), "MMMM yyyy", {
						locale: fr,
				  })
				: `l'année ${year}`;

			toast.info(`Préparation de l'export comptable pour ${periodLabel}`);

			// Générer le fichier Excel
			const blob = await invoiceExportService.generateAccountingExport(
				filteredInvoices,
				patientDataMap,
				periodLabel,
				osteopath
			);

			// Créer un URL pour le téléchargement
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute(
				"download",
				`Comptabilité_${periodLabel.replace(" ", "_").replace("'", "")}.xlsx`
			);
			document.body.appendChild(link);
			link.click();
			link.parentNode?.removeChild(link);

			toast.success(
				`Export comptable pour ${periodLabel} généré avec succès`
			);
		} catch (error) {
			console.error("Erreur lors de l'export Excel:", error);
			toast.error(
				"Une erreur est survenue lors de la génération de l'export comptable"
			);
		}
	};

	// Exporter le mois courant
	const handleExportCurrentMonth = () => {
		const currentMonthKey =
			selectedMonth ||
			(new Date().getMonth() + 1).toString().padStart(2, "0");

		exportToExcel(selectedYear, currentMonthKey);
	};

	// Exporter l'année complète
	const handleExportFullYear = () => {
		exportToExcel(selectedYear);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="gap-2 bg-amber-50 hover:bg-amber-500 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-50 dark:border-amber-700 dark:hover:bg-amber-800"
				>
					<FileSpreadsheet className="h-4 w-4" />
					Export comptable
					<Download className="h-3 w-3 ml-1" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={handleExportCurrentMonth}
					className="gap-2"
				>
					<Calendar className="h-4 w-4" />
					Exporter le mois sélectionné
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleExportFullYear}
					className="gap-2"
				>
					<FileSpreadsheet className="h-4 w-4" />
					Exporter toute l'année {selectedYear}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
