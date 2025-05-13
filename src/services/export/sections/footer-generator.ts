
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
  // Total row with formula
  const totalRow = lastRow + 2;
      
  // Ligne de séparation
  worksheet.mergeCells(`A${totalRow-1}:G${totalRow-1}`);
  
  // Total avec fond coloré
  worksheet.mergeCells(`A${totalRow}:C${totalRow}`);
  const totalLabelCell = worksheet.getCell(`A${totalRow}`);
  totalLabelCell.value = 'TOTAL';
  totalLabelCell.font = { 
    name: 'Arial',
    bold: true, 
    size: 12,
    color: { argb: 'FFFFFFFF' } 
  };
  totalLabelCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E5984' }
  };
  totalLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  totalLabelCell.border = {
    top: {style:'thin'},
    left: {style:'thin'},
    bottom: {style:'thin'},
    right: {style:'thin'}
  };
  
  const totalValueCell = worksheet.getCell(`D${totalRow}`);
  totalValueCell.value = {
    formula: `SUM(D${headerRow+2}:D${lastRow})`,
    date1904: false
  };
  totalValueCell.font = { 
    name: 'Arial',
    bold: true, 
    size: 12,
    color: { argb: 'FF2E5984' }
  };
  totalValueCell.numFmt = '# ##0.00 €';
  totalValueCell.alignment = { horizontal: 'right' };
  totalValueCell.border = {
    top: {style:'thin'},
    left: {style:'thin'},
    bottom: {style:'thin'},
    right: {style:'thin'}
  };
  
  // Fusion des cellules restantes
  worksheet.mergeCells(`E${totalRow}:G${totalRow}`);
  const emptyCell = worksheet.getCell(`E${totalRow}`);
  emptyCell.border = {
    top: {style:'thin'},
    left: {style:'thin'},
    bottom: {style:'thin'},
    right: {style:'thin'}
  };
  
  // Pied de page
  const footerRow = totalRow + 3;
  worksheet.mergeCells(`A${footerRow}:G${footerRow}`);
  const footerCell = worksheet.getCell(`A${footerRow}`);
  footerCell.value = 'Document généré automatiquement - OstéoManager';
  applyFooterStyles(footerCell);
};
