
import ExcelJS from 'exceljs';
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
  
  // Titre principal
  worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const titleCell = worksheet.getCell(`A${currentRow}`);
  titleCell.value = `Extraction comptable sur ${period}`;
  titleCell.font = { 
    name: 'Arial',
    size: 16, 
    bold: true, 
    color: { argb: 'FF2E5984' }
  };
  titleCell.alignment = { 
    horizontal: 'center', 
    vertical: 'middle' 
  };
  worksheet.getRow(currentRow).height = 30;
  currentRow++;
  
  return currentRow;
};
