
import ExcelJS from "exceljs";

export const generateHeaderSection = (
	worksheet: ExcelJS.Worksheet,
	period: string,
	osteopathName?: string,
	cabinetName?: string
): number => {
	// Génération de l'en-tête avec le titre et la période
	const headerRow = worksheet.getRow(1);
	headerRow.values = ["Récapitulatif Comptable", `Période: ${period}`];

	headerRow.font = {
		name: "Arial",
		bold: true,
		size: 20,
		color: { argb: "FF2E5984" },
	};
	headerRow.alignment = { horizontal: "center", vertical: "middle" };
	headerRow.height = 30;
	worksheet.mergeCells("A1:G1");

	// Deuxième ligne : la période reste
	const periodRow = worksheet.getRow(2);
	periodRow.values = [`Période: ${period}`];
	periodRow.font = {
		name: "Arial",
		italic: true,
		size: 20,
		color: { argb: "FF888888" },
	};
	periodRow.alignment = { horizontal: "center", vertical: "middle" };
	periodRow.height = 20;
	worksheet.mergeCells("A2:G2");

	// Troisième ligne : ostéopathe et cabinet affichés
	let infoCell = "";
	if (osteopathName && cabinetName) {
		infoCell = `Ostéopathe : ${osteopathName}   |   Cabinet : ${cabinetName}`;
	} else if (osteopathName) {
		infoCell = `Ostéopathe : ${osteopathName}`;
	} else if (cabinetName) {
		infoCell = `Cabinet : ${cabinetName}`;
	}

	const infoRow = worksheet.getRow(3);
	infoRow.values = [infoCell];
	infoRow.font = {
		name: "Arial",
		bold: true,
		size: 14,
		color: { argb: "FF845600" }
	};
	infoRow.alignment = { horizontal: "center", vertical: "middle" };
	infoRow.height = 18;
	worksheet.mergeCells("A3:G3");

	// Ligne de séparation (A4:G4)
	const lineRow = worksheet.getRow(4);
	lineRow.height = 5;
	worksheet.mergeCells("A4:G4");

	return 5; // Les données commencent à la ligne 5
};
