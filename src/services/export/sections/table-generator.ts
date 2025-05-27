import ExcelJS from "exceljs";
import { format } from "date-fns";
import { Invoice, Patient } from "@/types";
import {
	applyHeaderStyles,
	applyCellBorders,
	applyDataRowStyles,
} from "../styles/excel-styles";
import { translatePaymentStatus } from "../utils/format-utils";

export const generateTableSection = (
	worksheet: ExcelJS.Worksheet,
	invoices: Invoice[],
	patientDataMap: Map<number, Patient>,
	startRow: number
): number => {
	// Définition des colonnes avec tailles spécifiques
	worksheet.columns = [
		{ key: "date", width: 25 },
		{ key: "number", width: 40 },
		{ key: "lastName", width: 30 },
		{ key: "firstName", width: 30 },
		{ key: "amount", width: 20 },
		{ key: "paymentMethod", width: 75 },
		{ key: "status", width: 20 },
	];

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

	// Appliquer styles aux entêtes (police blanche, fond bleu)
	tableHeaderRow.eachCell({ includeEmpty: false }, (cell) => {
		cell.font = {
			name: "Arial",
			size: 20,
			color: { argb: "FFFFFFFF" }, // Blanc
			bold: true,
		};
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF2F75B5" }, // Bleu foncé
		};
		cell.alignment = { horizontal: "center", vertical: "middle" };
		applyCellBorders(cell);
	});
	tableHeaderRow.height = 32;

	// Filtres de colonnes A à G
	worksheet.autoFilter = {
		from: { row: startRow, column: 1 },
		to: { row: startRow, column: headers.length },
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
		worksheet.getRow(currentRowNumber).height = 32;
		applyCellBorders(noInvoiceCell);
	} else {
		invoices.forEach((invoice, dataIndex) => {
			if (invoice.paymentStatus === "CANCELED") return;

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

			// Alternance de couleurs
			if ((dataIndex + 1) % 2 === 1) {
				row.eachCell((cell, colNumber) => {
					if (colNumber <= 7) {
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: "FFF7F9FC" },
						};
					}
				});
			}

			// Alignement, bordures, police 20
			row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
				if (colNumber <= 7) {
					cell.font = { name: "Arial", size: 20 };
					cell.alignment = {
						horizontal: "center",
						vertical: "middle",
					};
					applyCellBorders(cell);
				}
			});

			row.height = 32;
		});

		worksheet.getColumn("amount").numFmt = "# ##0.00 €";
	}

	return currentRowNumber;
};
