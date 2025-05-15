import ExcelJS from "exceljs";
import { Invoice, Patient, Osteopath } from "@/types";
import { generateHeaderSection } from "./sections/header-generator";
import { generateTableSection } from "./sections/table-generator";
import { generateFooterSection } from "./sections/footer-generator";
import { translatePaymentStatus } from "./utils/format-utils";

export const invoiceExportService = {
	async generateAccountingExport(
		invoices: Invoice[],
		patientDataMap: Map<number, Patient>,
		period: string,
		osteopath?: Osteopath
	): Promise<Blob> {
		// Création du workbook et de la feuille
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Récapitulatif comptable");

		// Configuration de la mise en page
		worksheet.properties.defaultRowHeight = 20;
		worksheet.pageSetup.paperSize = 9; // A4
		worksheet.pageSetup.orientation = "landscape";
		worksheet.pageSetup.fitToPage = true;

		// Configuration des en-têtes/pieds de page pour l'impression
		worksheet.headerFooter.oddFooter = "&CPage &P sur &N";
		worksheet.headerFooter.evenFooter = "&CPage &P sur &N";

		// Tri des factures par date
		const sortedInvoices = [...invoices].sort((a, b) => {
			return new Date(a.date).getTime() - new Date(b.date).getTime();
		});

		// Extraction de l'année pour le récapitulatif
		const currentYear = period.includes(" ")
			? period.split(" ")[1]
			: period;

		// Calcul du total ajusté (en excluant les factures annulées)
		let totalAmount = 0;
		sortedInvoices.forEach((invoice) => {
			if (invoice.paymentStatus !== "CANCELED") {
				totalAmount += invoice.amount;
			}
		});

		// Génération de l'en-tête
		const headerRowIndex = generateHeaderSection(worksheet, period);

		// Génération du tableau de données
		const lastRowIndex = generateTableSection(
			worksheet,
			sortedInvoices,
			patientDataMap,
			headerRowIndex
		);

		// Génération du pied de page et totaux
		if (sortedInvoices.length > 0) {
			generateFooterSection(
				worksheet,
				lastRowIndex,
				headerRowIndex,
				sortedInvoices,
				currentYear
			);
		}

		// Génération du fichier XLSX
		const buffer = await workbook.xlsx.writeBuffer();
		return new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
	},

	// Export de la fonction de traduction des statuts pour compatibilité
	translatePaymentStatus,
};
