import { Invoice, Patient } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusTranslations: Record<string, string> = {
	PAID: "Payée",
	PENDING: "En attente",
	CANCELED: "Annulée",
};

const paymentMethodTranslations: Record<string, string> = {
	CB: "Carte Bancaire",
	ESPECES: "Espèces",
	CHEQUE: "Chèque",
	VIREMENT: "Virement",
};

interface ExportOptions {
	filename?: string;
	includeTotal?: boolean;
}

/**
 * Export invoices to CSV format for accounting
 */
export function exportInvoicesToCSV(
	invoices: Invoice[],
	patientDataMap: Map<number, Patient>,
	options: ExportOptions = {}
): void {
	const { filename = "registre-notes-honoraires", includeTotal = true } = options;

	// Filter out canceled invoices from total calculation
	const activeInvoices = invoices.filter((inv) => inv.paymentStatus !== "CANCELED");
	const total = activeInvoices.reduce((sum, inv) => sum + inv.amount, 0);

	// CSV Header
	const headers = [
		"N° Note",
		"Date",
		"Prénom",
		"Nom",
		"Montant (€)",
		"Statut",
		"Mode de règlement",
	];

	// CSV Rows
	const rows = invoices.map((invoice) => {
		const patient = patientDataMap.get(invoice.patientId);
		const formattedDate = format(new Date(invoice.date), "dd/MM/yyyy", { locale: fr });
		const formattedAmount = invoice.amount.toFixed(2).replace(".", ",");
		const status = statusTranslations[invoice.paymentStatus] || invoice.paymentStatus;
		const paymentMethod = invoice.paymentMethod
			? paymentMethodTranslations[invoice.paymentMethod] || invoice.paymentMethod
			: "";

		return [
			invoice.id.toString().padStart(4, "0"),
			formattedDate,
			patient?.firstName || "",
			patient?.lastName || "",
			formattedAmount,
			status,
			paymentMethod,
		];
	});

	// Add total row if requested
	if (includeTotal) {
		rows.push([]);
		rows.push([
			"",
			"",
			"",
			"TOTAL",
			total.toFixed(2).replace(".", ","),
			`(${activeInvoices.length} notes)`,
			"",
		]);
	}

	// Convert to CSV string
	const csvContent = [
		headers.join(";"),
		...rows.map((row) =>
			row.map((cell) => {
				// Escape quotes and wrap in quotes if contains separator or quotes
				const cellStr = String(cell);
				if (cellStr.includes(";") || cellStr.includes('"') || cellStr.includes("\n")) {
					return `"${cellStr.replace(/"/g, '""')}"`;
				}
				return cellStr;
			}).join(";")
		),
	].join("\n");

	// Add BOM for Excel UTF-8 compatibility
	const BOM = "\uFEFF";
	const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

	// Create download link
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	const dateStr = format(new Date(), "yyyy-MM-dd", { locale: fr });
	link.setAttribute("href", url);
	link.setAttribute("download", `${filename}_${dateStr}.csv`);
	link.style.visibility = "hidden";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * Export invoices for a specific period
 */
export function exportInvoicesPeriod(
	invoices: Invoice[],
	patientDataMap: Map<number, Patient>,
	year: string,
	month?: string
): void {
	const periodLabel = month
		? format(new Date(`${year}-${month}-01`), "MMMM-yyyy", { locale: fr })
		: year;

	exportInvoicesToCSV(invoices, patientDataMap, {
		filename: `notes-honoraires_${periodLabel}`,
		includeTotal: true,
	});
}
