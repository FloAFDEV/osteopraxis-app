
import ExcelJS from 'exceljs';
import { Invoice } from '@/types';
import { applyFooterStyles } from '../styles/excel-styles';

/**
 * Generate footer section for the accounting report
 */
export const generateFooterSection = (
  worksheet: ExcelJS.Worksheet, 
  lastRow: number,
  headerRow: number,
  invoices: Invoice[],
  currentYear: string
): void => {
  // Ligne bleue de séparation
  const blueLineRow = lastRow + 1;
  worksheet.mergeCells(`A${blueLineRow}:G${blueLineRow}`);
  const blueLineCell = worksheet.getCell(`A${blueLineRow}`);
  blueLineCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E5984' }
  };
  
  // Définir la hauteur de ligne plutôt que de la cellule
  worksheet.getRow(blueLineRow).height = 5;
  
  // Ligne vide après la ligne bleue
  const emptyRow = blueLineRow + 1;
  
  // Nombre de consultations sur l'année - 3 premières colonnes fusionnées
  const summaryRow = emptyRow + 1;
  worksheet.mergeCells(`A${summaryRow}:C${summaryRow}`);
  const summaryCell = worksheet.getCell(`A${summaryRow}`);
  summaryCell.value = `${invoices.length} consultations sur l'année ${currentYear}`;
  summaryCell.font = { 
    name: 'Arial',
    bold: true, 
    size: 12,
    color: { argb: 'FF334E81' }
  };
  summaryCell.alignment = { horizontal: 'left', vertical: 'middle' };
  
  // Cellule TOTAL - Colonnes D-E fusionnées
  worksheet.mergeCells(`D${summaryRow}:E${summaryRow}`);
  const totalLabelCell = worksheet.getCell(`D${summaryRow}`);
  totalLabelCell.value = 'TOTAL';
  totalLabelCell.font = { 
    name: 'Arial',
    bold: true, 
    size: 14,
    color: { argb: 'FF334E81' }
  };
  totalLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Valeur du total - Colonnes F-G fusionnées
  worksheet.mergeCells(`F${summaryRow}:G${summaryRow}`);
  const totalValueCell = worksheet.getCell(`F${summaryRow}`);
  totalValueCell.value = {
    formula: `SUM(E${headerRow+1}:E${lastRow})`,
    date1904: false
  };
  totalValueCell.font = { 
    name: 'Arial',
    bold: true, 
    size: 14,
    color: { argb: 'FF334E81' }
  };
  totalValueCell.numFmt = '# ##0,00 €';
  totalValueCell.alignment = { horizontal: 'center' };
  
  // Appliquer des bordures au bas du tableau de total
  [totalLabelCell, totalValueCell, summaryCell].forEach(cell => {
    cell.border = {
      top: {style:'thin', color: {argb:'FF000000'}},
      left: {style:'thin', color: {argb:'FF000000'}},
      bottom: {style:'thin', color: {argb:'FF000000'}},
      right: {style:'thin', color: {argb:'FF000000'}}
    };
  });
  
  // Pied de page
  const footerRow = summaryRow + 2;
  worksheet.mergeCells(`A${footerRow}:G${footerRow}`);
  const footerCell = worksheet.getCell(`A${footerRow}`);
  footerCell.value = 'Document généré automatiquement – PatientHub';
  applyFooterStyles(footerCell);
};
