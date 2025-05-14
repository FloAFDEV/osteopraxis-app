
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
  // En-têtes du tableau avec les titres exacts selon l'image de référence
  const columns = [
    { header: 'Date de séance', key: 'date', width: 15 },
    { header: 'N° de Note d\'Honoraire', key: 'number', width: 22 },
    { header: 'Nom', key: 'lastName', width: 18 },
    { header: 'Prénom', key: 'firstName', width: 18 },
    { header: 'Montant', key: 'amount', width: 15 },
    { header: 'Mode de paiement', key: 'paymentMethod', width: 20 },
    { header: 'Statut', key: 'status', width: 15 }
  ];
  
  // Définir manuellement les colonnes pour un meilleur contrôle
  worksheet.columns = columns.map(col => ({ ...col, width: col.width }));
  
  // Styles pour les en-têtes
  const tableHeaderRow = worksheet.getRow(startRow);
  tableHeaderRow.values = columns.map(col => col.header);
  applyHeaderStyles(tableHeaderRow);
  
  // Appliquer une bordure au tableau
  tableHeaderRow.eachCell({ includeEmpty: true }, function(cell) {
    applyCellBorders(cell);
  });
  
  let rowCounter = startRow;
  
  // Gérer le cas où il n'y a pas de factures
  if (invoices.length === 0) {
    rowCounter++;
    const noInvoiceRow = worksheet.getRow(rowCounter);
    noInvoiceRow.values = ['Aucune facture sur cette période', '', '', '', '', '', ''];
    worksheet.mergeCells(`A${rowCounter}:G${rowCounter}`);
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
    
  } else {
    // Ajout des données
    invoices.forEach((invoice, index) => {
      const patient = patientDataMap.get(invoice.patientId);
      const lastName = patient ? patient.lastName : 'Inconnu';
      const firstName = patient ? patient.firstName : '';
      
      rowCounter++;
      const row = worksheet.getRow(rowCounter);
      row.values = [
        format(new Date(invoice.date), 'dd/MM/yyyy'),
        `#${invoice.id.toString().padStart(4, '0')}`,
        lastName,
        firstName,
        invoice.amount,
        invoice.paymentMethod || 'Non spécifié',
        translatePaymentStatus(invoice.paymentStatus),
      ];
      
      // Style pour les lignes de données
      applyDataRowStyles(row);
      
      // Alternance de couleur pour les lignes
      if (index % 2 === 1) {
        applyAlternatingRowColor(row);
      }
    });
    
    // Formatage des cellules de montant (colonne E)
    worksheet.getColumn(5).numFmt = '# ##0,00 €';
  }
  
  return rowCounter;
};
