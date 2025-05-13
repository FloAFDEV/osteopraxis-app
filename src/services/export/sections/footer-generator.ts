
import ExcelJS from 'exceljs';
import { applyFooterStyles } from '../styles/excel-styles';

/**
 * Generate footer section for the accounting report
 */
export const generateFooterSection = (
  worksheet: ExcelJS.Worksheet, 
  lastRow: number,
  headerRow: number
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
  blueLineCell.height = 5;
  
  // Nombre de consultations sur l'année
  const summaryRow = blueLineRow + 2;
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
  
  // Cellule TOTAL
  worksheet.mergeCells(`D${summaryRow}:E${summaryRow}`);
  const totalLabelCell = worksheet.getCell(`D${summaryRow}`);
  totalLabelCell.value = 'TOTAL';
  totalLabelCell.font = { 
    name: 'Arial',
    bold: true, 
    size: 14,
    color: { argb: 'FF334E81' }
  };
  totalLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };
  
  // Valeur du total
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
  totalValueCell.numFmt = '# ##0.00 €';
  totalValueCell.alignment = { horizontal: 'right' };
  
  // Pied de page
  const footerRow = summaryRow + 2;
  worksheet.mergeCells(`A${footerRow}:G${footerRow}`);
  const footerCell = worksheet.getCell(`A${footerRow}`);
  footerCell.value = 'Document généré automatiquement – PatientHub';
  applyFooterStyles(footerCell);
};
