import ExcelJS from "exceljs";
import { Invoice } from "@/types";

export const generateFooterSection = (
	worksheet: ExcelJS.Worksheet,
	lastRow: number,
	headerRow: number,
	invoices: Invoice[],
	currentYear: string
): void => {
	// Barre bleue (A17:G17)
	const blueLineRow = lastRow + 1;
	worksheet.mergeCells(`A${blueLineRow}:G${blueLineRow}`);
	const blueLineCell = worksheet.getCell(`A${blueLineRow}`);
	blueLineCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FF2E5984" },
	};
	worksheet.getRow(blueLineRow).height = 18;

	// Résumé et total (A19:G19)
	const summaryRow = blueLineRow + 2;
	// Fusionner trois cellules horizontales pour le texte "Nombre de consultations"
	worksheet.mergeCells(`A${summaryRow}:C${summaryRow}`);
	const summaryCell = worksheet.getCell(`A${summaryRow}`);
	summaryCell.value = `${invoices.length} consultations sur l'année ${currentYear}`;
	summaryCell.font = {
		name: "Arial",
		bold: true,
		size: 12,
		color: { argb: "FF2E5984" },
	};
	summaryCell.alignment = {
		horizontal: "center",
		vertical: "middle",
	};
	worksheet.getRow(summaryRow).height = 18;

	// Label du total
	worksheet.getCell(`D${summaryRow}`).value = "TOTAL";
	worksheet.getCell(`D${summaryRow}`).font = {
		name: "Arial",
		bold: true,
		size: 14,
		color: { argb: "FF2E5984" },
	};
	worksheet.getCell(`D${summaryRow}`).alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	// Calcul du total ajusté (total - annulées)
	const canceledTotal = invoices
		.filter((invoice) => invoice.paymentStatus === "CANCELED")
		.reduce((acc, invoice) => acc + (invoice.amount || 0), 0);

	const totalAmount = invoices
		.filter((invoice) => invoice.paymentStatus !== "CANCELED")
		.reduce((acc, invoice) => acc + (invoice.amount || 0), 0);

	// Montant total après soustraction des factures annulées
	worksheet.getCell(`F${summaryRow}`).value = totalAmount - canceledTotal;
	worksheet.getCell(`F${summaryRow}`).font = {
		name: "Arial",
		bold: true,
		size: 14,
		color: { argb: "FF2E5984" },
	};
	worksheet.getCell(`F${summaryRow}`).numFmt = "# ##0.00 €"; // Format monétaire
	worksheet.getCell(`F${summaryRow}`).alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	// Ajouter le nombre de factures annulées et leur montant sous le total
	const canceledCount = invoices.filter(
		(invoice) => invoice.paymentStatus === "CANCELED"
	).length;
	const canceledAmountMessage = `${canceledCount} facture(s) annulée(s), montant : ${canceledTotal.toFixed(
		2
	)} €`;
	worksheet.getCell(`F${summaryRow + 1}`).value = canceledAmountMessage;
	worksheet.getCell(`F${summaryRow + 1}`).font = {
		name: "Arial",
		size: 12,
		color: { argb: "FF888888" },
	};
	worksheet.getCell(`F${summaryRow + 1}`).alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	// Pied de page (A20:G20)
	const footerRow = summaryRow + 2;
	worksheet.mergeCells(`A${footerRow}:G${footerRow}`);
	const footerCell = worksheet.getCell(`A${footerRow}`);
	footerCell.value = "Document généré automatiquement – PatientHub";
	footerCell.font = {
		name: "Arial",
		size: 10,
		italic: true,
		color: { argb: "FF888888" },
	};
	footerCell.alignment = { horizontal: "center" };
};
