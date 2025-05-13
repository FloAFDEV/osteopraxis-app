
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Osteopath } from '@/types';
import { applyTitleStyles } from '../styles/excel-styles';

/**
 * Generate header section for the accounting report
 */
export const generateHeaderSection = (
  worksheet: ExcelJS.Worksheet,
  period: string,
  osteopath?: Osteopath
): number => {
  let currentRow = 1;
  
  if (osteopath) {
    // Logo et titre
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = `RÉCAPITULATIF COMPTABLE - ${period.toUpperCase()}`;
    applyTitleStyles(titleCell);
    worksheet.getRow(currentRow).height = 30;
    currentRow++;
    
    // Info ostéopathe
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const osteoCell = worksheet.getCell(`A${currentRow}`);
    osteoCell.value = `${osteopath.name} - ${osteopath.professional_title || 'Ostéopathe D.O.'}`;
    osteoCell.font = { 
      name: 'Arial',
      size: 12, 
      bold: true,
      color: { argb: 'FF505050' }
    };
    osteoCell.alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    currentRow++;
    
    // Numéros ADELI/SIRET
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const numCell = worksheet.getCell(`A${currentRow}`);
    numCell.value = [
      osteopath.adeli_number ? `ADELI: ${osteopath.adeli_number}` : '',
      osteopath.siret ? `SIRET: ${osteopath.siret}` : ''
    ].filter(v => v).join(' - ');
    numCell.font = { 
      name: 'Arial',
      size: 10,
      color: { argb: 'FF505050' }
    };
    numCell.alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    currentRow++;
    
    // Date d'édition
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const dateCell = worksheet.getCell(`A${currentRow}`);
    const today = new Date();
    dateCell.value = `Édité le ${format(today, 'dd MMMM yyyy', { locale: fr })}`;
    dateCell.font = { 
      name: 'Arial',
      size: 9, 
      italic: true,
      color: { argb: 'FF505050' }
    };
    dateCell.alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    currentRow++;
    
    // Espace avant le tableau
    worksheet.addRow([]);
    currentRow++;
  } else {
    // Version simplifiée sans info ostéopathe
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = `Récapitulatif comptable - ${period}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };
    worksheet.getRow(currentRow).height = 30;
    currentRow++;
    
    // Espace avant le tableau
    worksheet.addRow([]);
    currentRow++;
  }
  
  return currentRow;
};
