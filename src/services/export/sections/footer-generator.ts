import ExcelJS from "exceljs";
import { Invoice, Patient } from "@/types";
import { format } from "date-fns";

// Traduction des statuts de paiement en français
const translatePaymentStatus = (status: string) => {
	switch (status) {
		case "CANCELED":
			return "Annulée";
		case "PAID":
			return "Payée";
		case "PENDING":
			return "A régulariser";
		default:
			return status;
	}
};

// Styles pour la ligne d'en-tête
const applyHeaderStyles = (row: ExcelJS.Row) => {
	row.font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FFFFFFFF" }, // Police blanche
	};
	row.alignment = { horizontal: "center", vertical: "middle" };
	row.height = 30;
	row.eachCell({ includeEmpty: true }, (cell) => {
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF2E5984" }, // Fond bleu
		};
		cell.border = {
			top: { style: "thin", color: { argb: "FFFFFFFF" } },
			left: { style: "thin", color: { argb: "FFFFFFFF" } },
			bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
			right: { style: "thin", color: { argb: "FFFFFFFF" } },
		};
	});
};

// Bordures fines bleues pour une cellule
const applyCellBorders = (cell: ExcelJS.Cell) => {
	cell.border = {
		top: { style: "thin", color: { argb: "FF2E5984" } },
		left: { style: "thin", color: { argb: "FF2E5984" } },
		bottom: { style: "thin", color: { argb: "FF2E5984" } },
		right: { style: "thin", color: { argb: "FF2E5984" } },
	};
};

// Styles appliqués à une ligne de données (facture)
const applyDataRowStyles = (row: ExcelJS.Row) => {
	row.font = { name: "Arial", size: 20, color: { argb: "FF2E5984" } };
	row.alignment = { horizontal: "center", vertical: "middle" };
	row.height = 25;
	row.eachCell({ includeEmpty: true }, (cell) => {
		applyCellBorders(cell);
	});
};

// Génération de la section tableau des factures
export const generateTableSection = (
	worksheet: ExcelJS.Worksheet,
	invoices: Invoice[],
	patientDataMap: Map<number, Patient>,
	startRow: number
): number => {
	const columnDefinitions = [
		{ key: "date", width: 18 },
		{ key: "number", width: 22 },
		{ key: "lastName", width: 18 },
		{ key: "firstName", width: 18 },
		{ key: "amount", width: 15 },
		{ key: "paymentMethod", width: 20 },
		{ key: "status", width: 15 },
	];

	worksheet.columns = columnDefinitions;

	const headers = [
		"Date de séance",
		"N° de Note d'Honoraire",
		"Nom",
		"Prénom",
		"Montant",
		"Mode de paiement",
		"Statut",
	];

	// Ligne en-tête
	const tableHeaderRow = worksheet.getRow(startRow);
	tableHeaderRow.values = headers;
	applyHeaderStyles(tableHeaderRow);

	worksheet.autoFilter = {
		from: { row: startRow, column: 1 },
		to: { row: startRow, column: columnDefinitions.length },
	};

	let currentRowNumber = startRow + 1;

	if (invoices.length === 0) {
		currentRowNumber++;
		worksheet.mergeCells(`A${currentRowNumber}:G${currentRowNumber}`);
		const noInvoiceCell = worksheet.getCell(`A${currentRowNumber}`);
		noInvoiceCell.value = "Aucune facture sur cette période";
		noInvoiceCell.font = {
			name: "Arial",
			size: 20,
			italic: true,
			color: { argb: "FF888888" },
		};
		noInvoiceCell.alignment = { horizontal: "center", vertical: "middle" };
		worksheet.getRow(currentRowNumber).height = 30;
		applyCellBorders(noInvoiceCell);
	} else {
		invoices.forEach((invoice, index) => {
			const patient = patientDataMap.get(invoice.patientId);
			const lastName = patient ? patient.lastName : "Inconnu";
			const firstName = patient ? patient.firstName : "";
			const isCanceled = invoice.paymentStatus === "CANCELED";
			const displayAmount = isCanceled ? 0 : invoice.amount;

			const row = worksheet.addRow({
				date: format(new Date(invoice.date), "dd/MM/yyyy"),
				number: `#${invoice.id.toString().padStart(4, "0")}`,
				lastName,
				firstName,
				amount: displayAmount,
				paymentMethod: invoice.paymentMethod || "Non spécifié",
				status: translatePaymentStatus(invoice.paymentStatus),
			});
			currentRowNumber = row.number;

			if (isCanceled) {
				row.eachCell((cell) => {
					cell.font = {
						name: "Arial",
						size: 20,
						color: { argb: "FF888888" },
						strike: true,
					};
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FFEDEDED" },
					};
					cell.alignment = {
						horizontal: "center",
						vertical: "middle",
					};
					applyCellBorders(cell);
				});
			} else {
				applyDataRowStyles(row);
				if (index % 2 === 1) {
					row.eachCell((cell) => {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: "FFF7F9FC" },
						};
					});
				}
			}
		});
		worksheet.getColumn("amount").numFmt = "# ##0.00 €";
	}

	return currentRowNumber;
};

export const generateFooterSection = (
	worksheet: ExcelJS.Worksheet,
	lastRow: number,
	headerRow: number,
	invoices: Invoice[],
	currentYear: string
): void => {
	// Définir la ligne de résumé juste après la dernière ligne de données
	const summaryRow = lastRow + 2;

	// Résumé consultations
	const summaryCell = worksheet.getCell(`C${summaryRow}`);
	summaryCell.value = `${invoices.length} consultations sur l'année ${currentYear}`;
	summaryCell.font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FF2E5984" },
	};
	summaryCell.alignment = { horizontal: "center", vertical: "middle" };
	worksheet.getRow(summaryRow).height = 25;

	// Total général (hors annulées)
	const totalAmount = invoices
		.filter((invoice) => invoice.paymentStatus !== "CANCELED")
		.reduce((acc, invoice) => acc + (invoice.amount || 0), 0);

	// Ligne unique pour le total à déclarer
	const totalRow = summaryRow + 2;
	worksheet.mergeCells(`A${totalRow}:E${totalRow}`);
	const labelCell = worksheet.getCell(`A${totalRow}`);
	labelCell.value =
		"💰 Total à déclarer au comptable (hors factures annulées)";
	labelCell.font = {
		name: "Arial",
		bold: true,
		size: 24,
		color: { argb: "FF000000" },
	};
	labelCell.alignment = { horizontal: "center", vertical: "middle" };

	const totalToDeclareCell = worksheet.getCell(`F${totalRow}`);
	totalToDeclareCell.value = totalAmount;
	totalToDeclareCell.font = {
		name: "Arial",
		bold: true,
		size: 26,
		color: { argb: "FF000000" },
	};
	totalToDeclareCell.numFmt = "# ##0.00 €";
	totalToDeclareCell.alignment = { horizontal: "center", vertical: "middle" };
};
