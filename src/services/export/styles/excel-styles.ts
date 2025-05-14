
import ExcelJS from 'exceljs';

/**
 * Apply header styles to a row
 */
export const applyHeaderStyles = (row: ExcelJS.Row) => {
  row.font = { 
    name: 'Arial', 
    bold: true, 
    color: { argb: 'FFFFFFFF' }
  };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E5984' }
  };
  row.alignment = { 
    horizontal: 'center', 
    vertical: 'middle' 
  };
  row.height = 24;
};

/**
 * Apply standard cell borders
 */
export const applyCellBorders = (cell: ExcelJS.Cell) => {
  cell.border = {
    top: {style:'thin', color: {argb:'FFD0D0D0'}},
    left: {style:'thin', color: {argb:'FFD0D0D0'}},
    bottom: {style:'thin', color: {argb:'FFD0D0D0'}},
    right: {style:'thin', color: {argb:'FFD0D0D0'}}
  };
};

/**
 * Apply title styles to a cell
 */
export const applyTitleStyles = (cell: ExcelJS.Cell) => {
  cell.font = { 
    name: 'Arial',
    size: 18, 
    bold: true, 
    color: { argb: 'FF2E5984' }
  };
  cell.alignment = { 
    horizontal: 'center', 
    vertical: 'middle' 
  };
};

/**
 * Apply footer styles to a cell
 */
export const applyFooterStyles = (cell: ExcelJS.Cell) => {
  cell.font = { 
    name: 'Arial',
    size: 8, 
    italic: true,
    color: { argb: 'FF888888' }
  };
  cell.alignment = { horizontal: 'center' };
};

/**
 * Apply alternating row color
 */
export const applyAlternatingRowColor = (row: ExcelJS.Row) => {
  row.eachCell({ includeEmpty: true }, function(cell) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5F8FA' }
    };
  });
};

/**
 * Apply data row styles
 */
export const applyDataRowStyles = (row: ExcelJS.Row) => {
  row.eachCell({ includeEmpty: true }, function(cell) {
    applyCellBorders(cell);
    cell.font = { name: 'Arial', size: 10 };
    
    // Alignment spécifique par colonne
    const columnIndex = cell.col;
    // Convertir columnIndex en nombre pour les comparaisons
    const colNumber = Number(columnIndex);
    
    if (colNumber === 1) { // Date
      cell.alignment = { horizontal: 'center' };
    } else if (colNumber === 2) { // Numéro
      cell.alignment = { horizontal: 'center' };
    } else if (colNumber === 5) { // Montant
      cell.alignment = { horizontal: 'right' };
      cell.numFmt = '# ##0,00 €';
    } else if (colNumber === 6) { // Mode de paiement
      cell.alignment = { horizontal: 'center' };
    } else if (colNumber === 7) { // Statut
      cell.alignment = { horizontal: 'center' };
    }
  });
};
