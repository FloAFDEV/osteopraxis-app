import ExcelJS from "exceljs";

export const generateHeaderSection = (
	worksheet: ExcelJS.Worksheet,
	period: string
): number => {
	// Génération de l'en-tête avec le titre et la période
	const headerRow = worksheet.getRow(1);
	headerRow.values = ["Récapitulatif Comptable", `Période: ${period}`];

	// Personnalisation de la première ligne (Titre)
	headerRow.font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FF2E5984" },
	};
	headerRow.alignment = { horizontal: "center", vertical: "middle" };
	headerRow.height = 30;
	worksheet.mergeCells("A1:G1"); // Fusion des cellules pour centrer le titre

	// Personnalisation de la deuxième ligne pour la période
	const periodRow = worksheet.getRow(2);
	periodRow.values = [`Période: ${period}`]; // Affichage dynamique de la période
	periodRow.font = {
		name: "Arial",
		italic: true,
		size: 20,
		color: { argb: "FF888888" },
	};
	periodRow.alignment = { horizontal: "center", vertical: "middle" };
	periodRow.height = 20;
	worksheet.mergeCells("A2:G2"); // Fusion des cellules pour centrer la période

	// Ligne de séparation (A3:G3)
	const lineRow = worksheet.getRow(3);
	lineRow.height = 5; // Petite hauteur pour la séparation
	worksheet.mergeCells("A3:G3");

	return 4; // La prochaine ligne où les données commenceront
};
