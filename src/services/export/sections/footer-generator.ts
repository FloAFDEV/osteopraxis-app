import ExcelJS from "exceljs";
import { Invoice, Patient } from "@/types";
import { format } from "date-fns";

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

const applyHeaderStyles = (row: ExcelJS.Row) => {
	row.font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FFFFFFFF" }, // police blanche
	};
	row.alignment = { horizontal: "center", vertical: "middle" };
	row.height = 30;
	row.eachCell({ includeEmpty: true }, (cell) => {
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF2E5984" }, // fond bleu
		};
		cell.border = {
			top: { style: "thin", color: { argb: "FFFFFFFF" } },
			left: { style: "thin", color: { argb: "FFFFFFFF" } },
			bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
			right: { style: "thin", color: { argb: "FFFFFFFF" } },
		};
	});
};

const applyCellBorders = (cell: ExcelJS.Cell) => {
	cell.border = {
		top: { style: "thin", color: { argb: "FF2E5984" } },
		left: { style: "thin", color: { argb: "FF2E5984" } },
		bottom: { style: "thin", color: { argb: "FF2E5984" } },
		right: { style: "thin", color: { argb: "FF2E5984" } },
	};
};

const applyDataRowStyles = (row: ExcelJS.Row) => {
	row.font = { name: "Arial", size: 20, color: { argb: "FF2E5984" } };
	row.alignment = { horizontal: "center", vertical: "middle" };
	row.height = 25;
	row.eachCell({ includeEmpty: true }, (cell) => {
		applyCellBorders(cell);
	});
};

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

	const tableHeaderRow = worksheet.getRow(startRow);
	tableHeaderRow.values = headers;
	applyHeaderStyles(tableHeaderRow);

	// Ajout du filtre automatique sur toute la ligne d'en-tête
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
			if (invoice.paymentStatus === "CANCELED") return; // ignore annulées ici

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

			// Alternance couleur fond
			if (index % 2 === 1) {
				row.eachCell((cell) => {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FFF7F9FC" },
					};
				});
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
	// Barre bleue (A{lastRow+1}:G{lastRow+1})
	const blueLineRow = lastRow + 1;
	worksheet.mergeCells(`A${blueLineRow}:G${blueLineRow}`);
	const blueLineCell = worksheet.getCell(`A${blueLineRow}`);
	blueLineCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FF2E5984" },
	};
	worksheet.getRow(blueLineRow).height = 18;

	// Résumé et total (A{blueLineRow+2}:G{blueLineRow+2})
	const summaryRow = blueLineRow + 2;
	worksheet.mergeCells(`A${summaryRow}:C${summaryRow}`);
	const summaryCell = worksheet.getCell(`A${summaryRow}`);
	summaryCell.value = `${invoices.length} consultations sur l'année ${currentYear}`;
	summaryCell.font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FF2E5984" },
	};
	summaryCell.alignment = {
		horizontal: "center",
		vertical: "middle",
	};
	worksheet.getRow(summaryRow).height = 25;

	worksheet.getCell(`D${summaryRow}`).value = "TOTAL";
	worksheet.getCell(`D${summaryRow}`).font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FF2E5984" },
	};
	worksheet.getCell(`D${summaryRow}`).alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	// Calcul du total dynamique en fonction du filtre
	// La colonne "amount" est la 5ème, donc colonne E
	// startRow est headerRow+1, lastRow est lastRow (dernier data row)
	const amountStartRow = headerRow + 1;
	const amountEndRow = lastRow;

	worksheet.getCell(`F${summaryRow}`).value = {
		formula: `SUBTOTAL(109,E${amountStartRow}:E${amountEndRow})`,
		result: invoices
			.filter((invoice) => invoice.paymentStatus !== "CANCELED")
			.reduce((acc, invoice) => acc + (invoice.amount || 0), 0),
	};
	worksheet.getCell(`F${summaryRow}`).font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FF2E5984" },
	};
	worksheet.getCell(`F${summaryRow}`).numFmt = "# ##0.00 €";
	worksheet.getCell(`F${summaryRow}`).alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	// Lignes informations factures annulées
	const canceledTotal = invoices
		.filter((invoice) => invoice.paymentStatus === "CANCELED")
		.reduce((acc, invoice) => acc + (invoice.amount || 0), 0);
	const canceledCount = invoices.filter(
		(invoice) => invoice.paymentStatus === "CANCELED"
	).length;
	const canceledAmountMessage = `${canceledCount} facture(s) annulée(s), montant : ${canceledTotal.toFixed(
		2
	)} €`;
	worksheet.getCell(`F${summaryRow + 1}`).value = canceledAmountMessage;
	worksheet.getCell(`F${summaryRow + 1}`).font = {
		name: "Arial",
		size: 20,
		color: { argb: "FF888888" },
	};
	worksheet.getCell(`F${summaryRow + 1}`).alignment = {
		horizontal: "center",
		vertical: "middle",
	};

	// Ligne de séparation visuelle
	const totalReminderRow = summaryRow + 4;
	const separatorRow = worksheet.getRow(totalReminderRow - 1);
	separatorRow.eachCell({ includeEmpty: true }, (cell) => {
		cell.border = {
			top: { style: "thin", color: { argb: "FF2E5984" } },
		};
	});

	// Rappel du total à déclarer au comptable (encadré et gras)
	worksheet.mergeCells(`A${totalReminderRow}:E${totalReminderRow}`);
	const labelCell = worksheet.getCell(`A${totalReminderRow}`);
	labelCell.value =
		"💰 Total à déclarer au comptable (hors factures annulées)";
	labelCell.font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FF2E5984" },
	};
	labelCell.alignment = { horizontal: "right", vertical: "middle" };

	const totalReminderCell = worksheet.getCell(`F${totalReminderRow}`);
	totalReminderCell.value = {
		formula: `SUBTOTAL(109,E${amountStartRow}:E${amountEndRow})`,
		result: invoices
			.filter((invoice) => invoice.paymentStatus !== "CANCELED")
			.reduce((acc, invoice) => acc + (invoice.amount || 0), 0),
	};
	totalReminderCell.font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FF2E5984" },
	};
	totalReminderCell.numFmt = "# ##0.00 €";
	totalReminderCell.alignment = { horizontal: "center", vertical: "middle" };
	totalReminderCell.border = {
		top: { style: "thin", color: { argb: "FF2E5984" } },
		left: { style: "thin", color: { argb: "FF2E5984" } },
		bottom: { style: "thin", color: { argb: "FF2E5984" } },
		right: { style: "thin", color: { argb: "FF2E5984" } },
	};

	// Nombre total de paiements (encadré aussi)
	const totalCountRow = totalReminderRow + 1;
	worksheet.mergeCells(`A${totalCountRow}:E${totalCountRow}`);
	const totalCountLabelCell = worksheet.getCell(`A${totalCountRow}`);
	totalCountLabelCell.value = "Nombre total de paiements (hors annulées)";
	totalCountLabelCell.font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FF2E5984" },
	};
	totalCountLabelCell.alignment = { horizontal: "right", vertical: "middle" };

	const totalCountCell = worksheet.getCell(`F${totalCountRow}`);
	totalCountCell.value = invoices.filter(
		(invoice) => invoice.paymentStatus !== "CANCELED"
	).length;
	totalCountCell.font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FF2E5984" },
	};
	totalCountCell.alignment = { horizontal: "center", vertical: "middle" };
	totalCountCell.border = {
		top: { style: "thin", color: { argb: "FF2E5984" } },
		left: { style: "thin", color: { argb: "FF2E5984" } },
		bottom: { style: "thin", color: { argb: "FF2E5984" } },
		right: { style: "thin", color: { argb: "FF2E5984" } },
	};
};
