import ExcelJS from "exceljs";
import { format } from "date-fns";
import { Invoice, Patient } from "@/types";
import {
	applyHeaderStyles,
	applyCellBorders,
	applyAlternatingRowColor,
	applyDataRowStyles,
} from "../styles/excel-styles";
import { translatePaymentStatus } from "../utils/format-utils";

export const generateTableSection = (
	worksheet: ExcelJS.Worksheet,
	invoices: Invoice[],
	patientDataMap: Map<number, Patient>,
	startRow: number
): number => {
	// Colonnes sans `header` pour éviter la génération automatique d’en-têtes
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

	// Création manuelle des en-têtes
	const headers = [
		"Date de séance",
		"N° de Note d'Honoraire",
		"Nom",
		"Prénom",
		"Montant",
		"Mode de paiement",
		"Statut",
	];

	const tableHeaderRow = worksheet.getRow(startRow);
	tableHeaderRow.values = headers;
	applyHeaderStyles(tableHeaderRow);
	tableHeaderRow.eachCell({ includeEmpty: false }, (cell) => {
		applyCellBorders(cell);
	});

	let currentRowNumber = startRow + 1;

	if (invoices.length === 0) {
		currentRowNumber++;
		worksheet.mergeCells(`A${currentRowNumber}:G${currentRowNumber}`);
		const noInvoiceCell = worksheet.getCell(`A${currentRowNumber}`);
		noInvoiceCell.value = "Aucune facture sur cette période";
		noInvoiceCell.font = {
			name: "Arial",
			size: 12,
			italic: true,
			color: { argb: "FF888888" },
		};
		noInvoiceCell.alignment = { horizontal: "center", vertical: "middle" };
		worksheet.getRow(currentRowNumber).height = 30;
		applyCellBorders(noInvoiceCell);
	} else {
		invoices.forEach((invoice, dataIndex) => {
			// Ne pas inclure les factures annulées
			if (invoice.paymentStatus === "CANCELED") {
				return;
			}

			const patient = patientDataMap.get(invoice.patientId);
			const lastName = patient ? patient.lastName : "Inconnu";
			const firstName = patient ? patient.firstName : "";

			const row = worksheet.addRow({
				date: format(new Date(invoice.date), "dd/MM/yyyy"),
				number: `#${invoice.id.toString().padStart(4, "0")}`,
				lastName,
				firstName,
				amount: invoice.amount,
				paymentMethod: invoice.paymentMethod || "Non spécifié",
				status: translatePaymentStatus(invoice.paymentStatus),
			});
			currentRowNumber = row.number;
			applyDataRowStyles(row);

			// Appliquer une couleur alternée sur les lignes
			if ((dataIndex + 1) % 2 === 1) {
				row.eachCell((cell) => {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FFF7F9FC" }, // Bleu très pâle
					};
				});
			}

			// Centrer le contenu des cellules de cette ligne
			row.eachCell({ includeEmpty: false }, (cell) => {
				cell.alignment = { horizontal: "center", vertical: "middle" };
			});
		});

		worksheet.getColumn("amount").numFmt = "# ##0.00 €";
	}

	return currentRowNumber;
};
