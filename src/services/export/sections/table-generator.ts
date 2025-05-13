
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { Invoice, Patient } from '@/types';
import { applyHeaderStyles, applyCellBorders, applyAlternatingRowColor, applyDataRowStyles } from '../styles/excel-styles';
import { translatePaymentStatus } from '../utils/format-utils';

/**
 * Generate data table section for the accounting report
 */
export const generateTableSection = (
  worksheet: ExcelJS.Worksheet,
  invoices: Invoice[],
  patientDataMap: Map<number, Patient>,
  startRow: number
): number => {
  // En-têtes du tableau
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Numéro', key: 'number', width: 12 },
    { header: 'Patient', key: 'patient', width: 25 },
    { header: 'Montant', key: 'amount', width: 12 },
    { header: 'Paiement', key: 'paymentMethod', width: 15 },
    { header: 'Statut', key: 'status', width: 15 },
    { header: 'Notes', key: 'notes', width: 30 }
  ];
  
  // Styles pour les en-têtes
  const tableHeaderRow = worksheet.getRow(startRow);
  applyHeaderStyles(tableHeaderRow);
  
  // Appliquer une bordure au tableau
  tableHeaderRow.eachCell({ includeEmpty: true }, function(cell) {
    applyCellBorders(cell);
  });
  
  // Ligne de séparation visuelle sous l'en-tête
  const separatorRow = worksheet.addRow([]);
  separatorRow.height = 6;
  separatorRow.eachCell({ includeEmpty: true }, function(cell) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }
    };
    applyCellBorders(cell);
  });
  
  let rowCounter = startRow + 1; // +1 pour la ligne de séparation
  
  // Gérer le cas où il n'y a pas de factures
  if (invoices.length === 0) {
    const noInvoiceRow = worksheet.addRow(['Aucune facture sur cette période']);
    worksheet.mergeCells(`A${startRow+2}:G${startRow+2}`);
    noInvoiceRow.font = { 
      name: 'Arial', 
      size: 12, 
      italic: true,
      color: { argb: 'FF888888' }
    };
    noInvoiceRow.alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    noInvoiceRow.height = 30;
    
    // Ajouter des bordures pour la ligne
    noInvoiceRow.eachCell({ includeEmpty: true }, function(cell) {
      applyCellBorders(cell);
    });
    
    rowCounter++;
  } else {
    // Ajout des données
    invoices.forEach(invoice => {
      const patient = patientDataMap.get(invoice.patientId);
      const patientName = patient 
        ? `${patient.lastName} ${patient.firstName}`
        : `Patient #${invoice.patientId}`;
      
      rowCounter++;
      const row = worksheet.addRow({
        date: format(new Date(invoice.date), 'dd/MM/yyyy'),
        number: invoice.id.toString().padStart(4, '0'),
        patient: patientName,
        amount: invoice.amount,
        paymentMethod: invoice.paymentMethod || 'Non spécifié',
        status: translatePaymentStatus(invoice.paymentStatus),
        notes: invoice.notes || ''
      });
      
      // Style pour les lignes de données
      applyDataRowStyles(row);
      
      // Alternance de couleur pour les lignes
      if (rowCounter % 2 === 0) {
        applyAlternatingRowColor(row);
      }
    });
    
    // Formatage des cellules de montant
    worksheet.getColumn('amount').numFmt = '# ##0.00 €';
  }
  
  return rowCounter;
};
