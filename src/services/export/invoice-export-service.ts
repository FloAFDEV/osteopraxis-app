import ExcelJS from "exceljs";
import { Invoice, Patient, Osteopath, Cabinet } from "@/types";
import { generateHeaderSection } from "./sections/header-generator";
import { generateTableSection } from "./sections/table-generator";
import { generateFooterSection } from "./sections/footer-generator";
import { translatePaymentStatus } from "./utils/format-utils";
import { exportSecurity } from "@/utils/export-utils";

/**
 * Génère l’export comptable pour une combinaison ostéopathe + cabinet + période.
 * @param invoices Factures filtrées pour ce praticien & cabinet
 * @param patientDataMap Map patient
 * @param period Label (ex : “02/2024” ou “2024”)
 * @param osteopath Ostéopathe concerné
 * @param cabinet Cabinet concerné
 */
export async function generateAccountingExport(
  invoices: Invoice[],
  patientDataMap: Map<number, Patient>,
  period: string,
  osteopath: Osteopath | null, // null si export tous osteos
  cabinet: Cabinet
): Promise<Blob> {
  // Création du workbook et de la feuille
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Récapitulatif comptable");

  worksheet.properties.defaultRowHeight = 20;
  worksheet.pageSetup.paperSize = 9; // A4
  worksheet.pageSetup.orientation = "landscape";
  worksheet.pageSetup.fitToPage = true;

  worksheet.headerFooter.oddFooter = "&CPage &P sur &N";
  worksheet.headerFooter.evenFooter = "&CPage &P sur &N";

  // Exclusion factures annulées pour totaux
  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const currentYear = period.includes(" ") ? period.split(" ")[1] : period;
  let totalAmount = 0;
  sortedInvoices.forEach((invoice) => {
    if (invoice.paymentStatus !== "CANCELED") {
      totalAmount += invoice.amount;
    }
  });

  // Info ostéo
  let osteoName: string | undefined = null;
  if (osteopath && osteopath.name) {
    osteoName = osteopath.name;
  } else if (!osteopath) {
    osteoName = "Tous les ostéopathes";
  }

  const headerRowIndex = generateHeaderSection(
    worksheet,
    period,
    osteoName,
    cabinet?.name
  );

  const lastRowIndex = generateTableSection(
    worksheet,
    sortedInvoices,
    patientDataMap,
    headerRowIndex
  );

  if (sortedInvoices.length > 0) {
    generateFooterSection(
      worksheet,
      lastRowIndex,
      headerRowIndex,
      sortedInvoices,
      currentYear
    );
  }

  // Sécuriser le workbook (ajouter des avertissements en mode démo + hash SHA-256)
  const { workbook: securedWorkbook, fileHash } = await exportSecurity.secureExcel(workbook, osteoName);
  
  // TODO: Logger l'export dans document_exports avec fileHash
  console.log('[AUDIT TRAIL] Excel export:', { period, osteoName, fileHash: fileHash.substring(0, 16) + '...' });
  
  const buffer = await securedWorkbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
