import ExcelJS from "exceljs";

/**
 * Applique le style d'en-tête à une ligne
 */
export const applyHeaderStyles = (row: ExcelJS.Row) => {
	row.font = {
		name: "Arial",
		bold: true,
		color: { argb: "FFFFFFFF" },
	};
	row.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FF2E5984" },
	};
	row.alignment = {
		horizontal: "center",
		vertical: "middle",
	};
	row.height = 24;
};

/**
 * Applique une bordure standard à une cellule
 */
export const applyCellBorders = (cell: ExcelJS.Cell) => {
	const borderStyle: Partial<ExcelJS.Borders> = {
		top: { style: "thin", color: { argb: "FFD0D0D0" } },
		left: { style: "thin", color: { argb: "FFD0D0D0" } },
		bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
		right: { style: "thin", color: { argb: "FFD0D0D0" } },
	};
	cell.border = borderStyle;
};

/**
 * Applique le style du titre à une cellule
 */
export const applyTitleStyles = (cell: ExcelJS.Cell) => {
	cell.font = {
		name: "Arial",
		size: 16,
		bold: true,
		color: { argb: "FF2E5984" },
	};
	cell.alignment = {
		horizontal: "center",
		vertical: "middle",
	};
};

/**
 * Applique le style du pied de page à une cellule
 */
export const applyFooterStyles = (cell: ExcelJS.Cell) => {
	cell.font = {
		name: "Arial",
		size: 8,
		italic: true,
		color: { argb: "FF888888" },
	};
	cell.alignment = { horizontal: "center" };
};

/**
 * Applique une couleur d'arrière-plan alternée à une ligne (utile pour les tableaux)
 */
export const applyAlternatingRowColor = (row: ExcelJS.Row) => {
	row.eachCell({ includeEmpty: true }, (cell) => {
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFF5F8FA" },
		};
	});
};

/**
 * Applique les styles standards d'une ligne de données
 */
export const applyDataRowStyles = (row: ExcelJS.Row) => {
	row.eachCell({ includeEmpty: true }, (cell) => {
		applyCellBorders(cell);
		cell.font = { name: "Arial", size: 10 };

		// Récupère l'index de la colonne de manière sûre
		const colNumber = Number(cell.col);

		// Aligne certaines colonnes au centre si index correspondant
		if ([1, 2, 5].includes(colNumber)) {
			cell.alignment = { horizontal: "center" };
		}
	});
};
