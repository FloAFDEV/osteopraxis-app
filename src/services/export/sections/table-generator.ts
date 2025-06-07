import ExcelJS from "exceljs";
import { format } from "date-fns";
import { Invoice, Patient } from "@/types";
import { applyCellBorders } from "../styles/excel-styles";
import { translatePaymentStatus } from "../utils/format-utils";

export const generateTableSection = (
	worksheet: ExcelJS.Worksheet,
	invoices: Invoice[],
	patientDataMap: Map<number, Patient>,
	startRow: number
): number => {
	// Colonnes avec largeur
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

	// Ligne d'en-tête
	const tableHeaderRow = worksheet.getRow(startRow);
	tableHeaderRow.values = headers;
	tableHeaderRow.eachCell({ includeEmpty: false }, (cell) => {
		cell.font = {
			name: "Arial",
			size: 20,
			color: { argb: "FFFFFFFF" },
			bold: true,
		};
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF2F75B5" },
		};
		cell.alignment = { horizontal: "center", vertical: "middle" };
		applyCellBorders(cell);
	});
	tableHeaderRow.height = 32;

	worksheet.autoFilter = {
		from: { row: startRow, column: 1 },
		to: { row: startRow, column: headers.length },
	};

	let currentRowNumber = startRow + 1;

	// Si aucune facture
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
		return currentRowNumber;
	}

	// On ne garde que les factures non annulées pour les totaux
	const validInvoices = invoices.filter(
		(inv) => inv.paymentStatus !== "CANCELED"
	);

	// Total général sur factures valides
	let totalAmount = validInvoices.reduce(
		(sum, inv) => sum + (inv.amount || 0),
		0
	);

	// Ajout des factures (hors annulées)
	invoices.forEach((invoice, dataIndex) => {
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

		// Alternance couleurs
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

		// Styles cellules
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

	// Format monétaire colonne montant
	worksheet.getColumn("amount").numFmt = "#,##0.00 €";

	// Ligne total général (seul total dans le tableau principal)
	const totalRow = worksheet.addRow({
		date: "",
		number: "",
		lastName: "",
		firstName: "Total Général",
		amount: totalAmount,
		paymentMethod: "",
		status: "",
	});
	currentRowNumber = totalRow.number;

	// Style ligne total général
	totalRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
		cell.font = {
			name: "Arial",
			size: 22,
			bold: true,
			color: { argb: "FF000000" },
		};
		cell.alignment = {
			horizontal: colNumber === 5 ? "center" : "right",
			vertical: "middle",
		};

		// Cellule montant en jaune clair
		if (colNumber === 5) {
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFFFF2CC" },
			};
		}
		applyCellBorders(cell);
	});
	totalRow.height = 32;

	// ----------- SECTION RÉSUMÉ DES PAIEMENTS --------------

	// Ligne vide + 1 ligne pour titre résumé
	const summaryStartRow = currentRowNumber + 2;

	// Titre résumé
	const summaryTitleRow = worksheet.getRow(summaryStartRow);
	summaryTitleRow.getCell(1).value = "Résumé des paiements";
	summaryTitleRow.getCell(1).font = {
		name: "Arial",
		size: 22,
		bold: true,
	};
	worksheet.mergeCells(`A${summaryStartRow}:C${summaryStartRow}`);

	// Début données résumé
	const summaryDataStart = summaryStartRow + 1;

	// Totaux par mode de paiement (dans l'encart uniquement)
	const distinctPaymentMethods = Array.from(
		new Set(validInvoices.map((inv) => inv.paymentMethod || "Non spécifié"))
	);

	distinctPaymentMethods.forEach((mode, i) => {
		const row = worksheet.getRow(summaryDataStart + i);
		const totalModeAmount = validInvoices
			.filter((inv) => (inv.paymentMethod || "Non spécifié") === mode)
			.reduce((sum, inv) => sum + (inv.amount || 0), 0);

		row.getCell(1).value = mode;
		row.getCell(2).value = totalModeAmount;
		row.getCell(2).numFmt = "#,##0.00 €";

		// Style rapide
		row.getCell(1).font = { name: "Arial", size: 18 };
		row.getCell(2).font = { name: "Arial", size: 18 };
		row.getCell(2).alignment = { horizontal: "right" };
	});

	// Total général résumé
	const totalSummaryRow = worksheet.getRow(
		summaryDataStart + distinctPaymentMethods.length + 1
	);
	totalSummaryRow.getCell(1).value = "Total Général";
	totalSummaryRow.getCell(1).font = {
		name: "Arial",
		size: 20,
		bold: true,
	};
	totalSummaryRow.getCell(2).value = totalAmount;
	totalSummaryRow.getCell(2).numFmt = "#,##0.00 €";
	totalSummaryRow.getCell(2).font = {
		name: "Arial",
		size: 20,
		bold: true,
	};
	totalSummaryRow.getCell(2).alignment = { horizontal: "right" };

	currentRowNumber = totalSummaryRow.number;

	return currentRowNumber;
};
